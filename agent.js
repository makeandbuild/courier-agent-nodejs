'use strict';

var config = require('./config.js');

var bleacon = require('bleacon');
var rest = require('rest');
var when = require('when');
var mime = require('rest/interceptor/mime');
var later = require('later');
var io = require('socket.io-client');
var network = require('network');

var detectionService = require('./detection.service');

var token;
var tokenExpires;
/**
 * this should be the mac address
 */
var agentId;
var agentSettings;

// get responses as json objects instead strings
var restClient = rest.wrap(mime);

var socket = io(config.baseUrl + '/agent');

socket.on('connect', function(){
    console.log('Agent socket connect');

    // give the server details about ourselves
    agentDataPromise()
        .then(function(agent){
            socket.emit('register', agent);

        }, function(err){
            console.log('error registering: %s', err);
        });
});
socket.on('disconnect', function(){
    console.log('Agent socket disconnect');
});


// get token
restClient({
    path: config.baseUrl + '/api/tokens',
    headers: {"username": "test@test.com", "password": "test"}
})
    // then register
    .then(function (response) {
        token = response.entity.token;
        console.log(token);
        tokenExpires = response.entity.expires;

        return agentDataPromise();
    })
    .then(function (agentData) {
        console.log('POSTing ' + JSON.stringify(agentData));

        return restClient({ method: 'POST', path: config.baseUrl + '/api/agents', entity : agentData,
            headers: { "x-access-token": token , "Content-Type" : 'application/json'}});
    })
    .then(function (response) {

        console.log('Agent response: ' + JSON.stringify(response.entity));

        var statusCode = response.status.code;
        if(statusCode >= 200 && statusCode < 300) {
//            console.log('Registered agent: ' + JSON.stringify(response.entity));
        } else {
            console.log('Failed to register agent.  Status code: '  + response.status.code);
        }

        // store info about ourself
        agentSettings = response.entity;

        startScanning();

    }, function (err) {
        console.log('Error: ' + JSON.stringify(err));
    }).otherwise(function (err) {
        console.log('Unexpected Error: ' + JSON.stringify(err));
    });


function agentDataPromise() {
    var defer = when.defer();

    var agent =  {
        name: config.agent.name,
        location: config.agent.location,
        capabilities: config.agent.capabilities,
        range: config.agent.range
    }

    network.get_active_interface(function(err, obj) {

        if (err) {
            defer.reject(err);
        } else {

            // store for later use
            agentId = obj.mac_address;

            /* obj should be:

             { name: 'eth0',
             ip_address: '10.0.1.3',
             mac_address: '56:e5:f9:e4:38:1d',
             type: 'Wired',
             netmask: '255.255.255.0',
             gateway_ip: '10.0.1.1' }
             */

            agent.ipAddress = obj.ip_address;
            agent.customId = obj.mac_address;

            defer.resolve(agent);
        }
    });

    return defer.promise;
}

// listen for detections
function startScanning() {

	console.log("iBeacon scanning started");

    // schedule the batched detections to be sent to the server
    var sched = later.parse.recur().every(config.batchSendFrequency).second();
    later.setInterval(sendDetections, sched);

    bleacon.on('discover', function (bleacon) {

        // Format = {"uuid":"b9407f30f5f8466eaff925556b57fe6d","major":19602,"minor":10956,"measuredPower":-74,"rssi":-63,"accuracy":0.5746081071882325,"proximity":"near"}

		console.log(JSON.stringify(bleacon));

        detectionService.processDetection({
            agentId : agentId,
            time : Date.now(),
            uuid : bleacon.uuid,
            major : bleacon.major,
            minor : bleacon.minor,
            tx : bleacon.measuredPower,
            rssi : bleacon.rssi,
            proximity : bleacon.accuracy
        });
    });
}


function sendDetections() {

	console.log("sendDetections()");
    // expire old detections
    detectionService.removedExpired();

    var detections = detectionService.getDetections();
//    console.log("Sending Detections: " + JSON.stringify(detections));
    if (detections.length == 0) {
        // we need to identify which agent doesn't see any detections
        detections.push({agentId: agentSettings.customId});
    }

    if (config.detectionProtocol === 'HTTP') {
        restClient({ method: 'POST', path: config.baseUrl + '/api/beacondetections', entity: detections,
            headers: { "x-access-token": token, "Content-Type": 'application/json'}});
    }
    else if (config.detectionProtocol === 'socket') {
        try {
            // console.log('Sending: ' + JSON.stringify(detections));
            socket.emit('beacondetections', detections);
        } catch (e) {
            console.log('Error emitting detection');
        }
    } else {
        console.log('WARNING - DETECTION TRANSFER PROTOCOL NOT SET.  NO DETECTIONS WILL BE SENT TO THE SERVER!!!!!!');
    }
}


//TODO: Need to pick a M&B UUID to narrow false detections
//var uuid = 'e2c56db5dffb48d2b060d0f5a71096e0';
//var major = 0; // 0 - 65535
//var minor = 0; // 0 - 65535
bleacon.startScanning(/*uuid,major,minor*/);
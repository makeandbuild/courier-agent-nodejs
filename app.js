'use strict';

var config = require('./config.js');

var bleacon = require('bleacon');
var rest = require('rest');
var when = require('when');
var getmac = require('getmac');
var nodefn = require('when/node');
var mime = require('rest/interceptor/mime');
var later = require('later');
var io = require('socket.io-client');

var detectionService = require('./detection.service');

var token;
var tokenExpires;
/**
 * this should be the mac address
 */
var agentId;

// get responses as json objects instead strings
var restClient = rest.wrap(mime);

//[Lindsay Thurmond:2/5/15] TODO: only connect if socket in config
var socket = io('http://courier.makeandbuildatl.com:9000');

socket.on('connect', function(){
    console.log('socket connect');
});
socket.on('disconnect', function(){
    console.log('socket disconnect');
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

        if(response.status.code == 200) {
//            console.log('Registered agent: ' + JSON.stringify(response.entity));
        } else {
            console.log('Failed to register agent.  Status code: '  + response.status.code);
        }

        startScanning();

    }, function (err) {
        console.log('Error: ' + JSON.stringify(err));
    }).otherwise(function (err) {
        console.log('Unexpected Error: ' + JSON.stringify(err));
    });


function agentDataPromise() {
    var defer = when.defer();

    nodefn.lift(getmac.getMac)()
        .then(function (macAddress) {

            // save for later use
            agentId = macAddress;

            var agent =  {
                customId: macAddress,
                name: config.agent.name,
                location: config.agent.location,
                capabilities: config.agent.capabilities
            }
            defer.resolve(agent);

        }, function(err){
            defer.reject(err);
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
    var detections = detectionService.getDetections();
    console.log("Sending Detections: " + JSON.stringify(detections));
    if (detections && detections.length > 0) {

        if (config.detectionProtocol === 'HTTP') {
            restClient({ method: 'POST', path: config.baseUrl + '/api/beacondetections', entity: detections,
                headers: { "x-access-token": token, "Content-Type": 'application/json'}});
        }
        else if (config.detectionProtocol === 'socket') {
            try {
                socket.emit('beacondetections', detections);
            } catch (e) {
                console.log('Error emitting detection');
            }
        } else {
            console.log('WARNING - DETECTION TRANSFER PROTOCOL NOT SET.  NO DETECTIONS WILL BE SENT TO THE SERVER!!!!!!');
        }
    }
}


//TODO: Need to pick a M&B UUID to narrow false detections
//var uuid = 'e2c56db5dffb48d2b060d0f5a71096e0';
//var major = 0; // 0 - 65535
//var minor = 0; // 0 - 65535
bleacon.startScanning(/*uuid,major,minor*/);

//exports = module.exports;

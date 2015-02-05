'use strict';

var config = require('./config.js');

var bleacon = require('bleacon');
var rest = require('rest');
var when = require('when');
var getmac = require('getmac');
var nodefn = require('when/node');
var mime = require('rest/interceptor/mime');
var later = require('later');

var token;
var tokenExpires;
/**
 * this should be the mac address
 */
var agentId;

// get responses as json objects instead strings
var restClient = rest.wrap(mime);


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
        console.log(agentData);

        return restClient({ method: 'POST', path: config.baseUrl + '/api/agents', entity : agentData,
            headers: { "x-access-token": token , "Content-Type" : 'application/json'}});
    })
    .then(function (response) {

        console.log(response.entity);

        if(response.status.code == 200) {
            console.log('Registered agent: ' + response.entity);
        } else {
            console.log('Failed to register agent.  Status code: '  + response.status.code);
        }

        startScanning();

    }, function (err) {
        console.log('Error: ' + JSON.stringify(err));
    }).otherwise(function (err) {
        console.log('Unexpected Error: ' + err);
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
    bleacon.on('discover', function (bleacon) {

        // Format = {"uuid":"b9407f30f5f8466eaff925556b57fe6d","major":19602,"minor":10956,"measuredPower":-74,"rssi":-63,"accuracy":0.5746081071882325,"proximity":"near"}

        console.log(JSON.stringify(bleacon));
        processDetection(bleacon);

        // schedule the batched detections to be sent to the server
        var sched = later.parse.recur().every(config.batchSendFrequency).second();
        later.setInterval(sendDetections, sched);
    });
}

/**
 * We get Detections in the format :
 * {"uuid":"b9407f30f5f8466eaff925556b57fe6d","major":19602,"minor":10956,"measuredPower":-74,"rssi":-63,"accuracy":0.5746081071882325,"proximity":"near"}
 *
 * We need to convert them to:
 * {}
 *
 * And
 *
 *
 * @param detection
 */
function processDetection(detection) {
    var convertedDetection = {
        agentId : agentId,
        time : Date.now(),
        uuid : detection.uuid,
        major : detection.major,
        minor : detection.minor,
        tx : detection.measuredPower,
        rssi : detection.rssi,
        proximity : detection.accuracy
    }

    detections.push(convertedDetection);
}

var detections = [];

function sendDetections() {

    if (detections && detections.length > 0) {
        var detectionsCopy = detections.slice(0);
        detections = [];

        restClient({ method: 'POST', path: config.baseUrl + '/api/beacondetections', entity: detectionsCopy,
            headers: { "x-access-token": token, "Content-Type": 'application/json'}});
    }

}


//TODO: Need to pick a M&B UUID to narrow false detections
//var uuid = 'e2c56db5dffb48d2b060d0f5a71096e0';
//var major = 0; // 0 - 65535
//var minor = 0; // 0 - 65535
bleacon.startScanning(/*uuid,major,minor*/);

//exports = module.exports;

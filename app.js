'use strict';

var config = require('./config.js');

var bleacon = require('bleacon');
var rest = require('rest');
var when = require('when');
var getmac = require('getmac');
var nodefn = require('when/node');
var mime = require('rest/interceptor/mime');

var token;
var tokenExpires;

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
        console.log('Error: ' + err);
    }).otherwise(function (err) {
        console.log('Unexpected Error: ' + err);
    });


function agentDataPromise() {
    var defer = when.defer();

    nodefn.lift(getmac.getMac)()
        .then(function (macAddress) {
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
        console.log('bleacon found: ' + JSON.stringify(bleacon));
    });
}

//TODO: Need to pick a M&B UUID to narrow false detections
//var uuid = 'e2c56db5dffb48d2b060d0f5a71096e0';
//var major = 0; // 0 - 65535
//var minor = 0; // 0 - 65535
bleacon.startScanning(/*uuid,major,minor*/);

//exports = module.exports;

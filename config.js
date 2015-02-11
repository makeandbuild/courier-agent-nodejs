'use strict';

// choices for data transfer protocol
var HTTP_PROTOCOL = 'HTTP';
var SOCKET_PROTOCOL = 'socket';

module.exports = {

//    baseUrl: 'http://localhost:9000',
    baseUrl: 'http://courier.makeandbuildatl.com:9000',

    agent: {
        name : 'Great Room',
        location: 'Great Room',
        range: 1.5 // range considered for an enter event
    },
    batchSendFrequency : 2, // number of seconds
    detectionProtocol: SOCKET_PROTOCOL,
    beaconExpireFrequency : 10, // number of seconds
    numPastDetectionsToAvg: 6 // number of previous detections to smooth
}
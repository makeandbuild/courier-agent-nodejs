'use strict';

// choices for data transfer protocol
var HTTP_PROTOCOL = 'HTTP';
var SOCKET_PROTOCOL = 'socket';

module.exports = {

    baseUrl: 'http://localhost:9000',

    agent: {
        name : 'Agent 1',
        location: 'Lobby',
        range: 1.5 // range (in meters) considered for an enter event
    },
    batchSendFrequency : 2, // number of seconds
    detectionProtocol: SOCKET_PROTOCOL,
    beaconExpireFrequency : 10, // number of seconds
    numPastDetectionsToAvg: 6 // number of previous detections to smooth
}
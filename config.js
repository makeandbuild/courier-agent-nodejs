'use strict';

// choices for data transfer protocol
var HTTP_PROTOCOL = 'HTTP';
var SOCKET_PROTOCOL = 'socket';

module.exports = {

    baseUrl: 'http://localhost:9000',

    agent: {
        name : 'Great Room',
        location: 'Great Room',
        capabilities : ['audio', 'video']
    },
    batchSendFrequency : 2, // number of seconds
    detectionProtocol: SOCKET_PROTOCOL

}
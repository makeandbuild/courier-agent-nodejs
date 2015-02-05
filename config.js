'use strict';

module.exports = {

    baseUrl: 'http://localhost:9000',

    agent: {
        name : 'Great Room',
        location: 'Great Room',
        capabilities : ['audio', 'video']
    },
    batchSendFrequency : 2 // number of seconds

}
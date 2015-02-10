'use strict';

var Beacon = require('./Beacon');
var _ = require('lodash');


var beaconDictionary = {};

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
module.exports.processDetection = function processDetection(detection) {
    storeDetection(detection);
}

function storeDetection(detection) {
    var beacon = new Beacon(detection);

    // capture most recent detection
    var existingBeacon = beaconDictionary[beacon.key()];
    if (existingBeacon) {
        // update
        existingBeacon.update(detection);

    } else {
        beaconDictionary[beacon.key()] = beacon;
    }
}

/**
 * Remove beacons we no longer see
 */
module.exports.removedExpired = function removeExpired() {
    var keys = _.keys(beaconDictionary);

    _.forEach(keys, function(key) {

        var beacon = beaconDictionary[key];
        if (beacon.isExpired()) {
            delete beaconDictionary[key];
//            console.log('delete expired beacon: ' + key);
        }
    });
}

module.exports.getDetections = function() {

    var beacons = _.values(beaconDictionary);

    var detections = _.invoke(beacons, Beacon.prototype.payload);
    return detections;
}
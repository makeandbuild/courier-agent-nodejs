'use strict';

var _ = require('lodash');
var config = require('./config.js');

module.exports = Beacon;

function Beacon(detection) {
    this.proximities = [detection.proximity];
    this.proximity = detection.proximity;
    this.time = detection.time;
    this.uuid =  detection.uuid;
    this.major = detection.major;
    this.minor = detection.minor;
    this.rssi = detection.rssi;
    this.tx = detection.tx;
    this.agentId = detection.agentId;
}

Beacon.prototype.update = function(detection) {
    this.proximities.push(detection.proximity);
    this.averageProximities();

//    var oldTime = this.time;
    this.time = detection.time;
//    console.log('old time: [%s], new time: [%s], difference: [%s]', oldTime, this.time, (oldTime - this.time)/1000.0);
}

/**
 * Smooths out the proximity value
 */
Beacon.prototype.averageProximities = function() {

    // only keep 'n' most recent detections
    this.proximities = _.takeRight(this.proximities, config.numPastDetectionsToAvg);

    // sometimes stationary beacons randomly blip to a different proximity - we'll drop
    // the highest and lowest value before averaging to try to keep our average stable

    if (this.proximities.length === config.numPastDetectionsToAvg) {
        var proxToAvg = _.sortBy(this.proximities, function(num){ return num;});
        proxToAvg = _.drop(proxToAvg); // drop the first element
        proxToAvg = _.dropRight(proxToAvg); // drop the last element
        this.proximity = average(proxToAvg);
    } else {
        this.proximity = average(this.proximities);
    }
}

function average(array) {
    var sum = _.reduce(array, function(sum, n) { return sum + n; });
    return (sum / array.length).toFixed(2);
}

/**
 *
 * @returns {string} unique key for the beacon in the format 'uuid:major:minor'
 */
Beacon.prototype.key = function() {
    return this.uuid + ':' + this.major + ':' + this.minor;
}

/**
 *
 * @returns {{proximity: *, time: *, uuid: *, major: *, minor: *, rssi: *, tx: *, agentId: *}}
 */
Beacon.prototype.payload = function() {
    return {
        proximity : this.proximity,
        time : this.time,
        uuid : this.uuid,
        major : this.major,
        minor : this.minor,
        rssi : this.rssi,
        tx : this.tx,
        agentId : this.agentId
    }
}

/**
 *
 * @returns {boolean}
 */
Beacon.prototype.isExpired = function() {

    var secondsAgo = config.beaconExpireFrequency;
    var now = Date.now();
    var cutoffTime = now - (secondsAgo * 1000);

    var isExpired = this.time < cutoffTime;
    if (isExpired) {
//        console.log('EXPIRED! now: [%s], cutoff: [%s], last seen: [%s]', now, tenSecondsAgo, this.time);
        console.log('EXPIRED %s! now: %s, cutoff: %s, last seen: %s', this.key(), now, (now - cutoffTime)/1000.0, (now - this.time)/1000.0);
    }
    return isExpired;
}
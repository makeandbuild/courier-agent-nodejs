'use strict';

var _ = require('lodash');

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

    this.time = detection.time;
}

/**
 * Smooths out the proximity value
 */
Beacon.prototype.averageProximities = function() {

    // only keep 10 most recent detections
    this.proximities = _.takeRight(this.proximities, 10);

    var sum = _.reduce(this.proximities, function(sum, n) { return sum + n; });
    this.proximity = (sum / this.proximities.length).toFixed(2);
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

    // 1 second ago
    var seconds = 10;
    var cutoff = Date.now() - (seconds * 1000);

    return this.time < cutoff;
}
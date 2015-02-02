// sadly yosemitie doesn't support this (Error: OS X 10.10 does not support advertising iBeacon)
// but this is how you would do it

var Bleacon = require('bleacon');

// create an iBeacon
var uuid = 'e2c56db5dffb48d2b060d0f5a71096e0';
var major = 0; // 0 - 65535
var minor = 2; // 0 - 65535
var measuredPower = -59; // -128 - 127 (measured RSSI at 1 meter)

Bleacon.startAdvertising(uuid, major, minor, measuredPower);

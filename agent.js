var Bleacon = require('bleacon');

// scan for any beacons
Bleacon.startScanning(); // scan for any bleacons

Bleacon.on('discover', function(bleacon) {
    console.log(bleacon);
});

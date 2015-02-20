# Courier Agent (nodejs)
The Courier project is broken down into four pieces - Agent, Engine, Server & Admin Console - and is divided up between three different repos.

1. Agent - https://github.com/makeandbuild/courier-agent-nodejs
2. Server & Admin Console - https://github.com/makeandbuild/Courier
3. Engine - https://github.com/makeandbuild/courier-agent-engine

For a high level overview including architecture diagrams refer to our blog post [Courier iBeacon Implementation](http://makeandbuild.com/blog/post/courier-ibeacon-implementation)

## Summary

Nodejs implementation for detecting iBeacon BLE signals and sending detections to a central server for processing.

We are run this code on a Raspberry Pi but you could run it on any device that supports BLE detections (ie your Mac development environment).

Utilizes [node-bleacon](https://github.com/sandeepmistry/node-bleacon) project for BLE discovery of iBeacons.  

Instructions for installing and running on a Raspberry Pi can be found within raspberry-pi-instruction.md

We chose to write the agent code in Node.js because we could run it on our Macs without needing to install BlueZ and it also runs on a Raspberry Pi.  Since we aren’t using an iOS device with built in detection processing we needed to write our own or find a Node library that could do it for us.  We opted for the later and used the open source node-bleacon NPM module to convert the raw BLE signals to usable JSON data for us.  Using node-bleacon we can start listening for detections with the following. 

```javascript
var bleacon = require('bleacon');
bleacon.on('discover', function (bleacon) {
    console.log(JSON.stringify(bleacon));
    // your custom code here
});
bleacon.startScanning(/*uuid,major,minor*/);
```

For a single beacon, the detection output looks like the following: 

```javascript
{
  "uuid": "b9407f30f5f8466eaff925556b57fe6d",
  "major": 50,
  "minor": 54,
  "measuredPower": -59,
  "rssi": -50,
  "accuracy": 0.5663288654664925,
  "proximity": "near"
}
```

Beacons emit a lot of detections but we don’t need to update the server every single time we get one.  We want to know when a beacon comes in range, but for practical purposes it’s fine to have a slight delay before the server is informed of the detection.  A configurable property determines how often to package up and send the detections to the server – with a default of every two seconds.  If there are multiple detections for a single beacon in the configured time period the distances are averaged before being sent to the server.  Detections are sent to the server using WebSockets with socket.io in the following JSON format.

```javascript
[
  {
    "proximity" : 0.83, // approx. distance in meters
    "time" : 1424104114560, // time beacon was seen
    "uuid" : "b9407f30f5f8466eaff925556b57fe6d",
    "major" : 50,
    "minor" : 54,
    "rssi" : -52,
    "tx" : -59,
    "agentId" : "0c:4d:e9:b5:4f:f3" // agent that detected the beacon (defaults to its mac address)
  }
]
```

This payload indicates that the agent only has one beacon currently in range.  If there were multiple beacons in range the array would contain multiple detection objects.

## Setup

```
npm install
```

## Run
```
node agent.js
```

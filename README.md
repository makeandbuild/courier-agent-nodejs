# courier-agent-nodejs
Nodejs implementation for detecting iBeacon ble signals and sending detections to a central server for processing.  More information on central server can be found within the Courier project (https://github.com/makeandbuild/Courier).

The agent code has 3 responsibilities:
* Login to server
* Register itself as an agent
* Send iBeacon detections

This project utilizes the node-bleacon (https://github.com/sandeepmistry/node-bleacon) project for BLE discovery of iBeacons.  

To date, this code has been tested on OSX and Raspberry Pi.  Instructions for installing and running on raspberry pi can be found within raspberry-pi-instruction.md

## Setup

```
npm install
```

## Run
```
node agent.js
```

## Configuration
Configuration for agent identification, server URL to send detections to and other items can be found within the config.js file.

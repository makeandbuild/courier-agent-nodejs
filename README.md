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

Instructions for installing and running on raspberry pi can be found within raspberry-pi-instruction.md

## Setup

```
npm install
```

## Run
```
node agent.js
```

var config = require('./config')
var app, express, http, io, server, socket, currData, db, stompClient;
var bodyParser = require('body-parser');
var path = require("path");

http = require('http');
io = require('socket.io');
express = require('express');
db = require('./SuperBowlData.js');

var Stomp = require('stompjs');
var destination = config.activemq.sbqueue;
currData = new db.Data();

var stompFailureCallback = function (error) {
    console.log('STOMP: ' + error + ". Reconnecting in 10 seconds");
    setTimeout(stompConnect, 10000);
    subscription.unsubscribe();
    stompClient.disconnect(function(){
    	console.log("Error STOMP client has been disconnected");
    });
};

var stompSuccessCallback = function (msg) {
	console.log("Successfully connected to ActiveMQ via Stomp: " + msg);

	subscription = stompClient.subscribe(destination, function(message) {
		//console.log("\n\nActiveMQ Message: " + message.body + "\n\n");
		currData.add(JSON.parse(message.body),
  			function(json) {
  			socket.emit('jsonData', json);
  		});
	});
}

function stompConnect() {
    console.log('STOMP: Attempting connection');
    var activeMQUri = config.activemq.protocol + config.activemq.host + ':' + config.activemq.port;
    console.log("ActiveMQ URI: " + activeMQUri);
    stompClient = Stomp.overWS(activeMQUri);

    //There is a bug in ActiveMQ versions < 5.10.0 that improperly 
    //evaluates heartbeats causing the client to lose connection. Once updated delete the following two lines
    stompClient.heartbeat.outgoing = 0;
    stompClient.heartbeat.incoming = 0;

    stompClient.connect(config.activemq.user, config.activemq.pass, stompSuccessCallback, stompFailureCallback);
}

//Establishes the initial Stomp/ActiveMQ connection
stompConnect();

app = express();

// Configure NodeJS Express server
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')));

server = http.createServer(app);


// This is the Express server and Port
// Where the webapp will receive requests
server.listen(config.express.port);

app.get('/', function(req, res) {
	return res.sendFile(__dirname + '/D3Testing.html');
});

app.get('/admin', function(req, res) {
	return res.sendFile(__dirname + '/Admin.html');
});

//Gets the current stats and returns that information to the calling page.
app.get('/metadata', function(req, res) {
	var metadata = generateMetadata();
	res.send(metadata);
});

app.post('/metadata', function(req, res) {
	console.log("Vehicles: " + JSON.stringify(req.body, null, 2));
});

// Set the socket to listen in on the Express port.
socket = io.listen(server);
socket.set('log level', 1);

// We need to gracefully exit, disconnect, and unsubscribe
// from the ActiveMQ messaging queue if we close this process down
process.on('SIGINT', function() {
	console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );

	//If we fail to disconnect from the STOMP client after X seconds forcefully disconnect.
	setTimeout(function() {
		terminateApp(true);
	}, 10000);

	stompClient.unsubscribe();
	stompClient.disconnect(function() {
		console.log('STOMP client disconnected');
		terminateApp(false);
	});
})

//Function to terminate the application.
var terminateApp = function(forced) {
	if (forced) {
		console.warn("Application was forcefully terminated! Certain connections may have not gracefully closed.")
	}
	process.exit();
};

// Connect to the socket connection to wait for requests from the client 
socket.sockets.on('connection', function(client) {
    currData.historywithbuffer(function(json) {
    	socket.emit('history', json);
    });
    return null;
});

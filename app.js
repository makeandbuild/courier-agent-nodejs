var Client = require('node-rest-client').Client;
var Bleacon = require('bleacon');


restClient = new Client();

loginArgs ={
    headers:{"username":"test@test.com","password":"test"} // request headers
};


restClient.get("http://localhost:9000/api/tokens", loginArgs,
    function(data, response){
        // parsed response body as js object
        console.log("data: ");
        console.log(data);
        // raw response
        console.log("response: ");
        console.log(response);

        if(response.statusCode == 200) {
            console.log("200 response code");
            // get token
            var token = data.token;
            console.log("token: " + token);
        }
        else {
            console.log("Error logging in.  Response code: " + response.statusCode);
        }
    }).on('error', function(err) {
        console.log('login error: failed to get token', err.request.options);
        //[Lindsay Thurmond:2/4/15] TODO: schedule for retry in 2 mins
    });

// register agent
//[Lindsay Thurmond:2/4/15] TODO:

// listen for detections
Bleacon.on('discover', function(bleacon) {
    console.log('bleacon found: ' + JSON.stringify(bleacon));
});

//TODO: Need to pick a M&B UUID to narrow false detections
//var uuid = 'e2c56db5dffb48d2b060d0f5a71096e0';
//var major = 0; // 0 - 65535
//var minor = 0; // 0 - 65535
Bleacon.startScanning(/*uuid,major,minor*/);

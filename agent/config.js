var config = {}

config.activemq = {};
config.express = {};
config.express.sb = {};
config.redis = {};
config.twitter = {};
config.rt = {};

//General configurations for the SuperBowl realtime application
config.rt.vehicles = ["TOYOTA|HIGHLANDER", "JEEP|CHER", "AUDI|A3", "HYUND|ELANTR"];
config.rt.visibleXTicks = 900;			//15 minute visible X window frame.
config.rt.xAxisUpdateInterval = 1000;	//= how fast the X axis updates in milliseconds
config.rt.bucketInterval = 10;			// = 10 seconds;
config.rt.delayBufferSeconds = 30;		//30 second buffer behind actual real time values.
config.rt.aggseconds = 60;				//Number of seconds that are aggregated from the previous data for each plotting point.


//ActiveMQ is the source and first place that the real time application receives its data from Spark/Kafka stream
config.activemq.protocol = 'ws://';
config.activemq.host = '54.149.205.117';
config.activemq.port = 61614;
config.activemq.user = 'admin';
config.activemq.pass = 'admin';
config.activemq.sbqueue = '/topic/supAgg.counts.qmirror';

//Express web server configuration
config.express.port = process.env.WEB_PORT || 8081;

//Redis configuration. NodeJS maintains a datastructure to aggregate 
//the data flowing into the system based on their timestamps since the flow of timestamps is not in order
//config.redis.host = 'at-superbowl.dssp1h.ng.0001.usw2.cache.amazonaws.com';
config.redis.host = 'localhost';
config.redis.port = 6379;
config.redis.connection_timeout = 10000;	//Seconds before the attempt to establish and connection with Redis fails and the application exists

//If true the DB is flushed before beginning execution
config.redis.flushdb = true;
config.redis.buffersize = config.rt.visibleXTicks + config.rt.delayBufferSeconds + config.rt.bucketInterval;
config.redis.safetyexpirebuffer = 500;	//Extra number of seconds to save keys before expiring to make sure keys are not deleted before removed from sorted set
config.redis.keyexpiresecs = config.redis.buffersize + config.redis.safetyexpirebuffer;	//Expunge the redis keys from the server after a X second safety buffer is reached
config.redis.superbowldb = "SuperBowlCounts";

//Since Redis DBs are postive index based we give each piece of logic its own database here.
config.redis.dqd_db = 0;
config.redis.superbowl_db = 1;


//Twitter configuration
config.twitter.consumerkey = 'i6uivQTxDcSkwdepRE9TeNm8y';
config.twitter.consumersecret = '94F6BUpeNGXhg3jbzSkd1GmlbEoANRUJivaCY3rwSOGx5gZoox';
config.twitter.accesstoken = '2967929847-gmzrYi0alLEzSlWuk5vekEUUG2lMTT890yB0uTf';
config.twitter.accesssecret = 'TqZMGcrif31RSxZ7pCzbFzQOQpD5pLvHVpBk1rogMGH8F';
config.twitter.countthreshold = 60;	//Number of counts that each vehicle must reach in the 60 second window to trigger tweet

module.exports = config;
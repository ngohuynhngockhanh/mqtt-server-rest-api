require('log-timestamp');
const _ = require('lodash');
const express = require('express')
const cors = require('cors')
const app = express()
const rand = require('locutus/php/math/rand')
const time = require('locutus/php/datetime/time')
const bodyParser = require('body-parser');
const request = require('request')
const $q = require("q");
const Dequeue = require('dequeue')
const mosca = require('mosca')
const explode = require('locutus/php/strings/explode')
const version = process.env.version || '1.0'
const endpoint = process.env.endpoint || '/api/' + version 
const port = process.env.port || 8099
const endpoint_port = process.env.endpoint_port || port + 1
const server_username = process.env.username || "inut"
const server_password = process.env.password || "inut12345"


const timeout_per_request = 5000 //10s

console.log("port", port, "username", server_username, "password", server_password)
console.log("version", version, "endpoint", endpoint)

var moscaSettings = {
  port: port,			//mosca (mqtt) port

};

app.use(cors())
app.use(bodyParser.json({ limit: '1024mb' }))


// Accepts the connection if the username and password are valid
var authenticate = function(client, username, password, callback) {
	
	var authorized = (username === server_username && password.toString() === server_password);
	if (authorized) client.user = username;
	callback(null, authorized);
	
	
}

var authorizePublish = function(client, topic, payload, callback) {
	console.log("authorizePublish")
	callback(null, true);
}
var authorizeSubscribe = function(client, topic, callback) {
	/*if (topic == 'register')
		return callback(null, false)
	console.log("sub topic", topic, client.id)
	if (topic == 'wait_for_accept')
		return callback(null, true)
	var node_id = substr(topic, 5, 1000);
	console.log("sub", node_id, client.node_id)
	var exists = client.node_id.indexOf(node_id) > -1
	callback(null, exists);
	if (exists)
		client.disconnect()*/
	//request/gcTGhTyNhWUPzx9mlkYBCK3sMcE3/SJh9qNuBf/4da3fbc2056084fef6051f9498a48acc506755384897
	var args = explode("/", topic)
	callback(null, true)
	
}

var server = new mosca.Server(moscaSettings);	//here we start mosca
server.on('ready', setup);	//on init it fires up setup()


// fired when the mqtt server is ready
function setup() {
	console.log('Mosca server is up and running')
	server.authenticate = authenticate;
	server.authorizePublish = authorizePublish;
	server.authorizeSubscribe = authorizeSubscribe;
}

// fired when a message is published
server.on('published', function(packet, client) {
	console.log('Published', packet);
	console.log('Client', client);
});
var client_mqtt_count = 0
// fired when a client connects
server.on('clientConnected', function(client) {
	console.log('Client Connected:', client.id);
});

// fired when a client disconnects
server.on('clientDisconnected', function(client) {
	console.log('Client Disconnected:', client.id);
});


app.get('/', function(req, res) {
	res.json({hello: "world"})
})


//api cho việc lấy data từ cassandra driver
app.post(endpoint + '/data/:node_id/:topic', function (req, res, next) {
	var params = req.params
	console.log(req.params)
	
  
  
	server.publish({
		topic: '/'+node_id+'/'+req.params.topic,
		payload: JSON.stringify(req.body),
		qos: 2
	})
  
})


app.listen(endpoint_port, function () {
  console.log('CORS-enabled web server listening on port ', endpoint_port)
})


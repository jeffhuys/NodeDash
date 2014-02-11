/*
Dashboard masterserver
For use with node.js

This file should be run on one host, which will redirect all servers'
data to the user using socket.io
*/

//									 MAST on phone keyboard ;)
var io = require('socket.io').listen(6278);

var clients = [];
var servers = [];

io.sockets.on('connection', function (socket) {
  // Who are you?
  socket.emit('identify', {});


  // socket.on('serverdata', function (data) {

  // });

  socket.on('identify', function (data) {
  	if(data.what == "server") {
  		console.log("A server registered with name: " + data.hostname);
  		servers.push(data.hostname);
  	}
  	if(data.what == "client") {
  		console.log("A client registered with id: " + socket.id);
  		// So now we know who to send all the data to.
  		clients.push(socket.id);
  	}
  });

	socket.on('stats', function(data) {
		// Received server data. Pipe through to client(s)
		console.log("Got stats: " + data);
		for (var i = 0; i < clients.length; i++) {
			io.sockets.socket(clients[i]).emit('stats', { stats: data });
		};
	});
});
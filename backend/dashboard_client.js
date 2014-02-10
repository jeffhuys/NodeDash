/*
Dashboard client
For use with node.js

This file should be run on multiple hosts, which will redirect this servers'
data to the master server using socket.io
*/

var io = require('socket.io-client');
var socket = io.connect('cube.writebrite.nl', {
    port: 6278
});

var os = require('os');
var osutils = require('os-utils');
var hostname = os.hostname();

console.log("[DASHCLIENT] Starting dashboard client...");
console.log("[DASHCLIENT] Hostname: " + hostname);

var loop = function() {
	osutils.cpuUsage(function(cpu) {
		cpu = Math.round(cpu * 100);
		socket.emit('stats', { 
			hostname: hostname, 
			cpu: cpu, 
			freemem: osutils.freemem(), 
			totalmem: osutils.totalmem(), 
			active_processes: "5"
		});
		console.log("[DASHCLIENT] Sending stats... " + cpu + " " + osutils.freemem());
		setTimeout(loop, 4000);
	});
		
};

socket.on('connect', function () { 
	console.log("[DASHCLIENT] Socket connected"); 
	socket.on('identify', function() {
		socket.emit('identify', { what: "server", hostname: hostname });
	});

	loop();
});




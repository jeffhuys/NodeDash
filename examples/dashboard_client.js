/*
Dashboard client
For use with node.js

This file should be run on multiple hosts, which will redirect this servers'
data to the master server using socket.io
*/

var nodedash = require('../lib/node-dash');

nodedash.setDebug(true);

nodedash.connect("wheatley.writebrite.nl", 6278, "", function() {
	nodedash.sendStatsAutomatically(10000, {
		events_per_second: 5
	});
});

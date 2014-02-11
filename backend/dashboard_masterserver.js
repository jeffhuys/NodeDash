/*
Dashboard masterserver
For use with node.js

This file should be run on one host, which will redirect all servers'
data to the user using socket.io
*/
var nodedash = require("node-dash");

nodedash.server(6278);
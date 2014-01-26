"use strict";

var events = require("events");
var http = require("http");
var util = require("util");

var EventEmitter = events.EventEmitter;

var Server = function (options) {
	EventEmitter.call(this);
	this._server = http.createServer();
	this._server.on("request", this._handleRequest);
};
util.inherits(Server, EventEmitter);
module.exports = Server;

Server.prototype._handleRequest = function _handleRequest(request, response) {
	console.log(request);
	console.log(response);
	response.writeHead(200, {"Content-Type": "text/plain"});
	response.end("Works.\n");
};

Server.prototype.listen = function listen() {
	var args = Array.prototype.slice.call(arguments);
	return this._server.listen.apply(this._server, args);
};

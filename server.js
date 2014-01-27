"use strict";

var http = require("http");

var Router = require("./router");

var Server = function Server(options) {
	var self = this;
	this._router = new Router(options.routes || []);
	this._server = http.createServer();
	this._server.on("request", function (request, response) {
		self._handleRequest(request, response);
	});
};
module.exports = Server;

Server.prototype._handleRequest = function _handleRequest(request, response) {
	this._router.dispatch(request, response)
	.done(function () {
		response.end();
	}, function (error) {
		response.statusCode = 404;
		response.end(error + "\n");
	});
};

Server.prototype.listen = function listen() {
	var args = Array.prototype.slice.call(arguments);
	return this._server.listen.apply(this._server, args);
};

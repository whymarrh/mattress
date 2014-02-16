"use strict";

var http = require("http");
var q = require("q");

var Router = require("./router");
var statuses = require("./statuses");

var Server = function Server(options) {
	var self = this;
	this._router = new Router(options.routes || []);
	this._server = http.createServer();
	this._server.on("request", function (request, response) {
		self._handleRequest(request, response);
	});
};
module.exports = Server;

Server.prototype.listen = function listen() {
	var args = Array.prototype.slice.call(arguments);
	return this._server.listen.apply(this._server, args);
};

Server.prototype._handleRequest = function _handleRequest(request, response) {
	// Augment request
	request.authentication = this._basicAuthentication(request);
	// Handle
	var server = this;
	server._router.dispatch(request, response)
	.then(function () {
		// Request has been handled
		response.end();
		return true;
	})
	.fail(function (error, message) {
		// An error has occurred whilst handling the request
		response.statusCode = error.statusCode;
		response.end((message || error.message) + "\n");
	});
};

Server.prototype._basicAuthentication = function _basicAuthentication(request) {
	return function () {
		var authorization = request.headers.authorization;
		var fields;
		var pieces;
		var index;
		var decoded;
		if (!authorization) {
			return q.reject(statuses.errors.UNAUTHORIZED);
		}
		try {
			fields = authorization.split(" ", 2);
			// fields[0] should be "Basic"
			// fields[1] should be base64(sprintf("%s:%s", username, password))
			if (
				   !fields
				|| fields.length != 2
				|| fields[0].toLowerCase() != "basic"
			) {
				// Invalid header
				// OR unknown scheme
				throw new Error();
			}
			decoded = (new Buffer(fields[1], "base64")).toString("utf-8");
			if (!decoded) {
				throw new Error();
			}
			index = decoded.indexOf(":");
			pieces = [decoded.slice(0, index), decoded.slice(index + 1)]; // [username, password]
			if (!pieces[0] || !pieces[1]) {
				throw new Error();
			}
		}
		catch (e) {
			return q.reject(statuses.errors.BAD_REQUEST);
		}
		return q(pieces);
	};
};

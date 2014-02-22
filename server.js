"use strict";

var http = require("http");
var https = require("https");
var q = require("q");

var Router = require("./router");
var statuses = require("./statuses");

var Server = function Server(options) {
	var self = this;
	this._headers = options.headers || [];
	this._router = new Router(options.routes || []);
	if (options.secure === true) {
		// HTTP over TLS
		this._server = https.createServer({
			"cert": options.certificate || options.cert || options.crt,
			"key": options.key
		});
	} else {
		// Plain ol' HTTP
		this._server = http.createServer();
	}
	this._server.on("request", function (request, response) {
		self._handleRequest(request, response);
	});
	process.on("SIGINT", function () {
		console.log(); // \n
		self._server.close();
	});
};

Server.prototype.listen = function listen() {
	var args = Array.prototype.slice.call(arguments);
	return this._server.listen.apply(this._server, args);
};

Server.prototype._handleRequest = function _handleRequest(request, response) {
	// Augment request
	request.authentication = this._basicAuthentication(request);
	// Set headers
	this._headers.forEach(function (e, i, a) {
		if (e.k && e.v) {
			response.setHeader(e.k, e.v);
		}
	});
	// Handle request
	this._router.dispatch(request, response)
	.then(function (value) {
		// The request has been handled
		response.end();
	})
	.fail(function (error) {
		// An error has occurred whilst handling the request
		response.statusCode = error.statusCode;
		response.setHeader("Content-Type", "application/json; charset = utf-8");
		response.end(JSON.stringify(error) + "\n");
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
			return q.reject(statuses.errors.BAD_REQUEST);
		}
		decoded = (new Buffer(fields[1], "base64")).toString("utf-8");
		if (!decoded) {
			return q.reject(statuses.errors.BAD_REQUEST);
		}
		index = decoded.indexOf(":");
		pieces = [decoded.slice(0, index), decoded.slice(index + 1)]; // [username, password]
		if (!pieces[0] || !pieces[1]) {
			return q.reject(statuses.errors.BAD_REQUEST);
		}
		return q(pieces);
	};
};

module.exports = Server;

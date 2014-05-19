"use strict";

var http = require("http");
var https = require("https");

var Router = require("./router");
var Status = require("./status");

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
	this._server.on("request", this._handleRequest.bind(this));
	process.on("SIGINT", function () {
		console.log();
		self._server.close();
	});
};

Server.prototype.listen = function listen() {
	var args = Array.prototype.slice.call(arguments);
	return this._server.listen.apply(this._server, args);
};

Server.prototype._handleRequest = function _handleRequest(request, response) {
	// Augment request
	request.authentication = this._basicAuthentication.bind(this, request.headers.authorization);
	// Set headers
	this._headers.forEach(function (e, i, a) {
		if (e.k && e.v) {
			response.setHeader(e.k, e.v);
		}
	});
	// Handle request
	try {
		this._router.dispatch(request, response);
	} catch (e) {
		response.statusCode = e.statusCode;
		response.setHeader("Content-Type", "application/json; charset = utf-8");
		response.end(JSON.stringify(e) + "\n");
	}
};

Server.prototype._basicAuthentication = function _basicAuthentication(authorization) {
	if (!authorization) {
		throw Status.client.UNAUTHORIZED;
	}
	var fields;
	var pieces;
	var index;
	var decoded;
	fields = authorization.split(" ", 2);
	// fields[0] should be "Basic"
	// fields[1] should be base64(sprintf("%s:%s", username, password))
	if (
		   !fields
		|| fields.length != 2
		|| fields[0].toLowerCase() != "basic"
	) {
		// Invalid header or unknown scheme
		throw Status.client.BAD_REQUEST;
	}
	decoded = (new Buffer(fields[1], "base64")).toString("utf-8");
	if (!decoded) {
		throw Status.client.BAD_REQUEST;
	}
	index = decoded.indexOf(":");
	if (index < 0) {
		throw Status.client.BAD_REQUEST;
	}
	pieces = [decoded.slice(0, index), decoded.slice(index + 1)]; // [username, password]
	if (!pieces[0] || !pieces[1]) {
		throw Status.client.BAD_REQUEST;
	}
	return pieces;
};

module.exports = Server;

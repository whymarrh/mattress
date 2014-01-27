"use strict";

var http = require("http");
var q = require("q");

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

Server.prototype._parseBasicAuthentication = function _parseBasicAuthentication(request, response) {
	var parseCredentials = function (credentials) {
		var decoded = (new Buffer(credentials, "base64")).toString("utf-8");
		if (!decoded) {
			throw new Error();
		}
		var pieces = decoded.split(":");
		if (pieces.length != 2) {
			throw new Error();
		}
		return {
			"username": pieces[0],
			"password": pieces[1]
		};
	};
	return q.promise(function (resolve, reject) {
		var authorization = request.headers.authorization;
		if (!authorization) {
			// Throw a 401
			reject("Authorization required");
		}
		try {
			var fields = authorization.split(" ");
			if (!fields || fields.length != 2) {
				throw new Error();
			}
			if (fields[0].toLowerCase() != "basic") {
				// Unknown scheme
				throw new Error();
			}
			request.basicAuthentication = parseCredentials(fields[1]);
		}
		catch (e) {
			// Throw a 400
			reject("Invalid header");
		}
		resolve(true);
	});
};

Server.prototype._handleRequest = function _handleRequest(request, response) {
	var server = this;
	server._parseBasicAuthentication(request, response)
	.then(function () {
		return server._router.dispatch(request, response);
	})
	.then(function () {
		response.end();
		return true;
	})
	.fail(function (error) {
		response.statusCode = 404;
		response.end(error + "\n");
	});
};

Server.prototype.listen = function listen() {
	var args = Array.prototype.slice.call(arguments);
	return this._server.listen.apply(this._server, args);
};

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
	return q.promise(function (resolve, reject) {
		var authorization = request.headers.authorization;
		var fields;
		var pieces;
		var index;
		var decoded;
		if (!authorization) {
			// TODO: Throw a 401
			reject("Authorization required");
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
			request.authentication = {
				"username": pieces[0],
				"password": pieces[1]
			};
		}
		catch (e) {
			// TODO: Throw a 400
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

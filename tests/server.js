"use strict";

var Server = require("../server");

exports.testMissingAuthorizationHeader = function (test) {
	var parser = Server.prototype._basicAuthentication({
		"headers": {}
	});
	parser().fail(function (err) {
		test.equal(401, err.statusCode);
		test.done();
	});
};

exports.testValidAuthorizationHeader = function (test) {
	var parser = Server.prototype._basicAuthentication({
		"headers": { "authorization": "Basic Zm9vOmJhcg==" }
	});
	parser().then(function (result) {
		test.deepEqual(["foo", "bar"], result);
		test.done();
	});
};

exports.testBlatantlyWrongAuthorizationHeader = function (test) {
	var parser = Server.prototype._basicAuthentication({
		"headers": { "authorization": "What the heck is this" }
	});
	parser().fail(function (err) {
		test.equal(400, err.statusCode);
		test.done();
	});
};

exports.testInvalidAuthorizationHeader = function (test) {
	var parser = Server.prototype._basicAuthentication({
		"headers": { "authorization": "Derp Zm9vOmJhcg==" }
	});
	parser().fail(function (err) {
		test.equal(400, err.statusCode);
		test.done();
	});
};

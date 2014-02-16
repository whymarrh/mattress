"use strict";

var Server = require("../server");

exports.testMissingBasicHeader = function (test) {
	var parser = Server.prototype._basicAuthentication({
		"headers": {}
	});
	parser().fail(function (err) {
		test.equal(401, err.statusCode);
		test.done();
	});
};

exports.testValidBasicHeader = function (test) {
	var parser = Server.prototype._basicAuthentication({
		"headers": { "authorization": "Basic Zm9vOmJhcg==" }
	});
	parser().then(function (result) {
		test.deepEqual(["foo", "bar"], result);
		test.done();
	});
};

exports.testInvalidBasicHeader = function (test) {
	var parser = Server.prototype._basicAuthentication({
		"headers": { "authorization": "What the heck is this" }
	});
	parser().fail(function (err) {
		test.equal(400, err.statusCode);
		test.done();
	});
};

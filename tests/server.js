"use strict";

var Server = require("../server");
var Status = require("../status");

exports._basicAuthentication = {
	"setUp": function setUp(callback) {
		callback();
	},
	"testUndefined": function testUndefined(test) {
		try {
			Server.prototype._basicAuthentication();
		} catch (e) {
			test.deepEqual(e, Status.client.UNAUTHORIZED);
			test.done();
		}
	},
	"testValidHeader": function testValidHeader(test) {
		var parts = Server.prototype._basicAuthentication("Basic Zm9vOmJhcg==");
		test.deepEqual(parts, ["foo", "bar"]);
		test.done();
	},
	"testBlatantlyIncorrectHeader": function testBlatantlyIncorrectHeader(test) {
		try {
			Server.prototype._basicAuthentication("What the heck is this?");
		} catch (e) {
			test.deepEqual(e, Status.client.BAD_REQUEST);
			test.done();
		}
	},
	"testInvalidScheme": function testInvalidScheme(test) {
		try {
			Server.prototype._basicAuthentication("Derp Zm9vOmJhcg==");
		} catch (e) {
			test.deepEqual(e, Status.client.BAD_REQUEST);
			test.done();
		}
	},
	"testMalformedCredentials": function testMalformedCredentials(test) {
		try {
			Server.prototype._basicAuthentication("Basic d2F0Cg==");
		} catch (e) {
			test.deepEqual(e, Status.client.BAD_REQUEST);
			test.done();
		}
	}
};

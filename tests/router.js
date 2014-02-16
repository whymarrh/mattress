"use strict";

var Router = require("../router");

exports.testValidAcceptHeader = function (test) {
	var results = Router.prototype._parseAcceptHeader("application/json");
	test.deepEqual([{
		"type": "application",
		"subtype": "json",
		"params": {}
	}], results);
	test.done();
};

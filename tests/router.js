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

exports.testValidAcceptHeaderWithParams = function (test) {
	var results = Router.prototype._parseAcceptHeader("application/json;q=3;v=1");
	test.deepEqual([{
		"type": "application",
		"subtype": "json",
		"params": {
			"q": "3",
			"v": "1"
		}
	}], results);
	test.done();
};

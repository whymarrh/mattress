"use strict";

var Router = require("../router");
var Status = require("../status");

exports._compile = {
	testCompileRegex: function (test) {
		var compile = Router.prototype._compile;
		test.equal(compile("/foo").toString(), "/^\/+foo$/");
		test.equal(compile("/foo/bar").toString(), "/^\/+foo\/+bar$/");
		test.done();
	}
};

exports._parseAcceptHeader = {
	testValidAcceptHeader: function (test) {
		var results = Router.prototype._parseAcceptHeader("application/json");
		test.deepEqual([{
			"type": "application",
			"subtype": "json",
			"params": { "q": 1 }
		}], results);
		test.done();
	},
	testValidAcceptHeaderWithParams: function (test) {
		var results = Router.prototype._parseAcceptHeader("application/json;q=0.5;v=1");
		test.deepEqual([{
			"type": "application",
			"subtype": "json",
			"params": { "q": 0.5, "v": 1 }
		}], results);
		test.done();
	},
	testValidAcceptHeaderWithInvalidQvalue: function (test) {
		try {
			Router.prototype._parseAcceptHeader("application/json;q=9;v=1");
		} catch (e) {
			test.ok(true);
		}
		test.expect(1);
		test.done();
	}
};

exports.dispatch = {
	setUp: function (callback) {
		this.mockResponse = {
			setHeader: function () {
				// Do nothing
			}
		};
		callback();
	},
	testDispatchValidRequest: function (test) {
		var router = new Router([{
			"path": "/t",
			"media": {
				"text/html": {
					1: {
						"GET":
							function GET() {
								test.done();
							}
					}
				}
			}
		}]);
		router.dispatch({
			"method": "GET",
			"url": "/t",
			"headers": { "accept": "text/html;v=1" }
		}, this.mockResponse);
	},
	testDispatchRequestWithNoMatchingMedia: function (test) {
		var router = new Router([{ "path": "/t" }]);
		try {
			router.dispatch({
				"method": "GET",
				"url": "/t",
				"headers": { "accept": "text/html;v=1" }
			}, this.mockResponse);
		} catch (e) {
			test.deepEqual(e, Status.client.NOT_ACCEPTABLE);
			test.done();
		}
	},
	testDispatchRequestWithoutAcceptHeader: function (test) {
		var router = new Router([{
			"path": "/t",
			"media": {
				"text/html": {
					1: {
						"GET":
							function GET() {
								// Do nothing
							}
					}
				}
			}
		}]);
		try {
			router.dispatch({
				"method": "GET",
				"url": "/t",
				"headers": {}
			}, this.mockResponse);
		} catch (e) {
			test.deepEqual(e, Status.client.NOT_ACCEPTABLE);
			test.done();
		}
	}
};

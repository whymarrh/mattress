"use strict";

var Rested = require("..");
var q = require("q");

var v1 = {
	"get": function (request, response) {
		response.write("Hello world.\n");
		return q(true);
	}
};

var media = {
	"text/plain": { 1: v1 }
};

Rested
.createServer({
	"routes": [{
		"path": "/hello",
		"media": media
	}],
	"headers": [{
		"k": "X-Foo",
		"v": "Bar"
	}, {
		"k": "X-Baz",
		"v": "Qux"
	}]
})
.listen(8888, function () {
	console.log("Server listening on port 8888");
});

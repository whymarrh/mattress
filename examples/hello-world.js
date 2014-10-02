"use strict";

var Mattress = require("..");

var v1 = {
	"GET":
		function GET(request, response) {
			response.write("Hello world.\n");
			response.end();
		}
};

var media = {
	"text/plain": { "1": v1 }
};

Mattress
.createServer({
	"routes": [{
		"path": "/hello",
		"media": media
	}]
})
.listen(8888, function () {
	console.log("Server listening on port 8888");
});

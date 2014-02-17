"use strict";

var Server = require("./server");

module.exports = {
	"createServer": function createServer(options) {
		return new Server(options);
	}
};

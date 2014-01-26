"use strict";

var Server = require("./server");

module.exports = {
	"createServer": function (options) {
		return new Server(options);
	}
};

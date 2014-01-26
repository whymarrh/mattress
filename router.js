"use strict";

var url = require("url");

var Router = function Router(routes) {
	var self = this;
	this._routes = routes.map(function (e, i, a) {
		return {
			"handlers": e.handlers,
			"path": e.path,
			"regexp": self._compile(e.path)
		};
	});
};
module.exports = Router;

Router.prototype._compile = function _compile(path) {
	var params = [];
	var pattern = url.parse(path).pathname.split("/").reduce(function (p, c, i, a) {
		if (c.length === 0) {
			return p;
		}
		p += "\\/+";
		if (c.charAt(0) == ":") {
			params.push(c.substring(1));
			return p + "([a-zA-Z0-9-_~\\.%@]+)";
		}
		return p + c;
	}, "^");
	var regexp = new RegExp(pattern == "^" ? pattern + "\\/$" : pattern + "$");
	regexp.params = params;
	return regexp;
};

Router.prototype._matches = function _matches(regexp, path) {
	var matches = regexp.exec(path);
	var params = {};
	if (matches === null) {
		return false;
	}
	if (regexp.params && regexp.params.length > 0) {
		regexp.params.forEach(function (e, i, a) {
			params[e] = decodeURIComponent(matches[i + 1]);
		});
	}
	return params;
};

Router.prototype.dispatch = function dispatch(request, response) {
	var i = 0;
	var method = request.method.toLowerCase();
	var matches;
	var handler;
	for (i = 0; i < this._routes.length; i += 1) {
		matches = this._matches(this._routes[i].regexp, request.url);
		if (matches) {
			request.params = matches;
			handler = this._routes[i].handlers[method];
			if (handler) {
				handler(request, response);
			}
			return true;
		}
	}
	return false;
};

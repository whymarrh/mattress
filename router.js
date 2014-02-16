"use strict";

var q = require("q");
var url = require("url");

var statuses = require("./statuses");

var Router = function Router(routes) {
	var self = this;
	this._routes = routes.map(function (e, i, a) {
		return {
			"media": e.media || {},
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

Router.prototype._parseAcceptHeader = function _parseAcceptHeader(accept) {
	// From RFC 2616, section 14.1 <https://tools.ietf.org/html/rfc2616#section-14.1>:
	//
	//     Accept         = "Accept" ":"
	//                      #( media-range [ accept-params ] )
	//     media-range    = ( "*/*"
	//                      | ( type "/" "*" )
	//                      | ( type "/" subtype )
	//                      ) *( ";" parameter )
	//     accept-params  = ";" "q" "=" qvalue *( accept-extension )
	//     accept-extension = ";" token [ "=" ( token | quoted-string ) ]
	//
	return accept.split(",").map(function (e, i, a) {
		var parts = e.split(";");
		var mediaType = parts[0].split("/");
		var type = mediaType[0];
		var subtype = mediaType[1];
		var params = {};
		parts.slice(1).forEach(function (e, i, a) {
			// Intentionally shadowing vars
			var subparts = e.split("=");
			params[subparts[0].trim()] = subparts[1] ? subparts[1].trim() : true;
		});
		return {
			"type": type.trim(),
			"subtype": subtype.trim(),
			"params": params
		};
	});
};

Router.prototype._matchMedia = function _matchMedia(accepts, mediaTypes) {
	// TODO: Determine best content type for response
	return {
		"media": "application/json",
		"version": 1
	};
};

Router.prototype.dispatch = function dispatch(request, response) {
	var accepts;
	try {
		accepts = this._parseAcceptHeader(request.headers.accept);
	} catch (e) {
		// The Accept header was invalid
		return q.reject(statuses.errors.BAD_REQUEST);
	}
	var method = request.method.toLowerCase();
	var route;
	var mm; // Matching media
	var matches;
	var handler;
	var i, l;
	for (i = 0, l = this._routes.length; i < l; i += 1) {
		matches = this._matches(this._routes[i].regexp, request.url);
		if (matches) {
			// We have a route that matches
			// Is it the right media type?
			route = this._routes[i];
			mm = this._matchMedia(accepts, route.media);
			if (!mm) {
				// No matching media
				return q.reject(statuses.errors.UNSUPPORTED_MEDIA_TYPE);
			}
			request.params = matches;
			handler = route.media[mm.media][mm.version][method];
			if (handler) {
				return handler(request, response);
			}
			return q.reject(statuses.errors.METHOD_NOT_ALLOWED);
		}
	}
	return q.reject(statuses.errors.NOT_FOUND); // No matching route
};

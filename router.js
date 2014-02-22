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

Router.prototype._compile = function _compile(path) {
	var params = [];
	var pattern = url.parse(path).pathname.split("/").reduce(function (p, c, i, a) {
		if (c.length === 0) {
			return p;
		}
		p += "\/+";
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
		var params = { "q": 1 }; // Default qvalue is 1
		parts.slice(1).forEach(function (e, i, a) {
			// Intentionally shadowing vars
			var subparts = e.split("=");
			var k, v;
			var asNumber;
			if (subparts[1]) {
				// A value was given
				v = subparts[1].trim();
				asNumber = parseFloat(v);
				if (isFinite(asNumber)) {
					// The value is a number
					v = asNumber;
				}
			} else {
				// No value was given
				v = true;
			}
			k = subparts[0].trim();
			if (k == "q" && (!isFinite(v) || v < 0 || v > 1)) {
				// The qvalue must be between 0 and 1
				throw statuses.errors.BAD_REQUEST;
			}
			params[k] = v;
		});
		return {
			"type": type.trim(),
			"subtype": subtype.trim(),
			"params": params
		};
	});
};

Router.prototype._matchMedia = function _matchMedia(accepts, media) {
	// TODO: Determine best content type for response
	var mm = false;
	var isWildcard = RegExp.prototype.test.bind(/^[*]$/);
	// Check each media type the client is willing to accept against
	// what we are willing to provide and send back the first match (if
	// one exists).
	accepts
	.sort(function compare(a, b) {
		return b.params.q - a.params.q;
	})
	.some(function (accept, i, _accepts) {
		var version = accept.params.version || accept.params.v; // Check for both params
		return Object.keys(media).some(function (e, j, keys) {
			// Does it match?
			var parts = e.split("/");
			if (parts.length != 2) {
				throw statuses.errors.INTERNAL_SERVER_ERROR;
			}
			if (
				   (isWildcard(accept.type) || parts[0] == accept.type)
				&& (isWildcard(accept.subtype) || parts[1] == accept.subtype)
				&& (version && media[e][version])
				// Is `*/json` a valid media type?
			) {
				mm = { "media": e, "version": version };
				return true;
			}
		});
	});
	return mm;
};

Router.prototype.dispatch = function dispatch(request, response) {
	var accepts = this._parseAcceptHeader(request.headers.accept);
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
				response.setHeader("Content-Type", mm.media + "; version = " + mm.version + "; charset = utf-8");
				return handler(request, response);
			}
			return q.reject(statuses.errors.METHOD_NOT_ALLOWED);
		}
	}
	return q.reject(statuses.errors.NOT_FOUND); // No matching route
};

module.exports = Router;

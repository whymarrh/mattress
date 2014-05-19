"use strict";

module.exports = {
	success: {
		OK: {
			statusCode: 200
		}
	},
	client: {
		BAD_REQUEST: {
			message: "The request was malformed",
			statusCode: 400
		},
		UNAUTHORIZED: {
			message: "Authentication is required for that request",
			statusCode: 401
		},
		FORBIDDEN: {
			message: "This is not the request you are looking for",
			statusCode: 403
		},
		NOT_FOUND: {
			message: "I do not know what you are looking for",
			statusCode: 404
		},
		METHOD_NOT_ALLOWED: {
			message: "The specified message is not allowed for the requested resource",
			statusCode: 405
		},
		NOT_ACCEPTABLE: {
			message: "The specified Accept header is not appropriate or is invalid",
			statusCode: 406
		}
	},
	server: {
		INTERNAL_SERVER_ERROR: {
			message: "The server is broken",
			statusCode: 500
		}
	}
};

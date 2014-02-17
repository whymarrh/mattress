"use strict";

module.exports = {
	"errors": {
		"BAD_REQUEST": {
			"message": "Bad request",
			"statusCode": 400
		},
		"UNAUTHORIZED": {
			"message": "Unauthorized",
			"statusCode": 401,
		},
		"NOT_FOUND": {
			"message": "I do not know what you are looking for",
			"statusCode": 404
		},
		"METHOD_NOT_ALLOWED": {
			"message": "Method not allowed",
			"statusCode": 405
		},
		"NOT_ACCEPTABLE": {
			"message": "The specifed Accept header is not appropriate or is invalid",
			"statusCode": 406
		},
		"UNSUPPORTED_MEDIA_TYPE": {
			"message": "The requested media types are not supported",
			"statusCode": 415
		},
		"INTERNAL_SERVER_ERROR": {
			"message": "The server broke",
			"statusCode": 500
		}
	}
};

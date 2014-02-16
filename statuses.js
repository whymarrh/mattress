"use strict";

module.exports = {
	"errors": {
		"BAD_REQUEST": {
			"statusCode": 400,
			"message": "Bad request"
		},
		"UNAUTHORIZED": {
			"statusCode": 401,
			"message": "Unauthorized"
		},
		"NOT_FOUND": {
			"statusCode": 404,
			"message": "I do not know what you are looking for"
		},
		"METHOD_NOT_ALLOWED": {
			"statusCode": 405,
			"message": "Method not allowed"
		},
		"NOT_ACCEPTABLE": {
			"statusCode": 406,
			"message": "The specifed Accept header is not appropriate or is invalid"
		},
		"UNSUPPORTED_MEDIA_TYPE": {
			"statusCode": 415,
			"message": "The requested media types are not supported"
		}
	}
};

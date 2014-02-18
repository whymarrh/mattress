"use strict";
module.exports = function (grunt) {
	// Start w/ a clean slate
	grunt.initConfig({});

	// JSHint
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.config("jshint", {
		"options": { "jshintrc": true },
		"all": ["*.js", "tests/*.js", "examples/*.js"]
	});

	// Nodeunit
	grunt.loadNpmTasks("grunt-contrib-nodeunit");
	grunt.config("nodeunit", {
		all: ["tests/*.js"],
		options: {
			reporter: "minimal",
			reporterOptions: undefined // Use nodeunit default values
		}
	});

	// Default task
	grunt.registerTask("default", "Does nothing", function () { /* Does nothing */ });
	// Aliases
	grunt.registerTask("hint", ["jshint"]);
	grunt.registerTask("lint", ["jshint"]);
	grunt.registerTask("test", ["jshint", "nodeunit"]);
};

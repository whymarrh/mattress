"use strict";
module.exports = function (grunt) {
	// Start w/ a clean slate
	grunt.initConfig({});

	// JSHint
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.config("jshint", {
		"all": ["*.js", "tests/*.js", "examples/*.js"],
		"options": { "jshintrc": true }
	});

	// Nodeunit
	grunt.loadNpmTasks("grunt-contrib-nodeunit");
	grunt.config("nodeunit", {
		"all": ["tests/*.js"],
		"options": { reporter: "minimal" }
	});

	// Default task
	grunt.registerTask("default", "Does nothing", function () { /* Does nothing */ });
	// Aliases
	grunt.registerTask("hint", ["jshint"]);
	grunt.registerTask("lint", ["jshint"]);
	grunt.registerTask("test", ["jshint", "nodeunit"]);
};

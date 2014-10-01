module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'), 

        clean: {
            build: {
                src: ['dist/']
            },
        },

	concat: {
	    main: {
                // The .js file is really not intended for direct
                // use (rather, the source files are to be used
                // individually), so we'll just concat everything.
		src: ['src/**/*.js'],
		dest: 'dist/gateway.client.javascript.util.js'
	    },
	},

    });
    
    grunt.loadNpmTasks('grunt-contrib-concat');
	
    grunt.loadNpmTasks('grunt-contrib-clean');
	
    grunt.registerTask('default', [ 'clean', 'concat']);
};

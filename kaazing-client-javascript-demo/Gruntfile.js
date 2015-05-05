module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'), 

        clean: {
            dist: {
                src: ['dist/']
            },
        },

	copy: {
            // copy the source files that can just go directly to dist unchanged.
	    src: {
	  	cwd: 'src/',
		src: '**',
		dest: 'dist/javascript',
		expand: true,
                mode: 0644
	    },
            client_js: {
                cwd: 'bower_components/kaazing-client-javascript/js',
                src: '**',
                dest: 'dist/javascript',
                expand: true,
                mode: 0644
            },
	},
    });

    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['clean', 'copy']);
};

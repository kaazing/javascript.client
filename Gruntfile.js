module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'), 

        clean: {
            build: {
                src: ['dist/']
            },
        },

	copy: {
	    main: {
                files: [
                    {expand:true, cwd: 'src/kaazing/', src:['**'], dest: 'dist/'}
                ]
	    },
	},

    });
    
    grunt.loadNpmTasks('grunt-contrib-copy');
	
    grunt.loadNpmTasks('grunt-contrib-clean');
	
    grunt.registerTask('default', [ 'clean', 'copy']);
};

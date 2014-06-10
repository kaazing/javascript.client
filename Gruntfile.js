module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'), 

		concat: {
			kaazUtils: {
				src: [        
				   'src/Namespace.js',
                   'src/Logger.js',
                   'src/Utils.js',
                   'src/Browser.js',
                   'src/ByteOrder.js',
                   'src/ByteBuffer.js',
                   'src/Charset.js',        
                   'src/URI.js',
                 /*'src/BlobUtils.js',
                   'src/Events.js',*/
				],
				dest: 'dist/kaaz-utils.js'
			},
		},

	    clean: {
	        build: {
	          src: ['dist/']
	        },
	    },
      
});

	grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
	
	grunt.registerTask('default', [ 'clean', 'concat']);
};
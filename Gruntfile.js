module.exports = function(grunt) {

    /**
     * Build up several Javascript artifacts by combining source JS files from the
     * repo with files from kaazing-client-javascript-util loaded through bower.json.
     * The process is:
     *   Copy files from src/kaazing and the bower download into dist/tmp
     *   Remove existing banner comments using grunt-stripbanner from all
     *     files in dist/tmp
     *   Use concat to combine files into the final artifacts and add a banner comment
     *     to each constructed file.
     */

    // The banner comment to be added to the concatenated JS files.
    var banner = '/**\n' + 
                 ' * Copyright (c) 2007-2014 Kaazing Corporation. All rights reserved.\n' + 
                 ' * \n' + 
                 ' * Licensed to the Apache Software Foundation (ASF) under one\n' + 
                 ' * or more contributor license agreements.  See the NOTICE file\n' + 
                 ' * distributed with this work for additional information\n' + 
                 ' * regarding copyright ownership.  The ASF licenses this file\n' + 
                 ' * to you under the Apache License, Version 2.0 (the\n' + 
                 ' * "License"); you may not use this file except in compliance\n' + 
                 ' * with the License.  You may obtain a copy of the License at\n' + 
                 ' * \n' + 
                 ' *   http://www.apache.org/licenses/LICENSE-2.0\n' + 
                 ' * \n' + 
                 ' * Unless required by applicable law or agreed to in writing,\n' + 
                 ' * software distributed under the License is distributed on an\n' + 
                 ' * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY\n' + 
                 ' * KIND, either express or implied.  See the License for the\n' + 
                 ' * specific language governing permissions and limitations\n' + 
                 ' * under the License.\n' + 
                 ' */\n';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'), 

        clean: {
            dist: {
                src: ['dist/']
            },
            tmp: {
                src: ['dist/tmp']
            },
        },

        copy: {
            src: {
                cwd: 'src/kaazing/gateway',
                src: '**',
                dest: 'dist/tmp/',
                expand: true,
            },
            utils: {
                cwd: 'bower_components/kaazing-client-javascript-util',
                src: '**',
                dest: 'dist/tmp/utils',
                expand: true,
            }
        },

        stripbanner: {
            tmpFiles: {
                options: {
                    cwd: './dist/tmp'
                }
            }
        },

        // Concatenate local source and util files into final artifacts.
        // The *-debug.js files are just the concatenated source files, with no 
        // mangling of variable names or compression of the output or removal of 
        // debug (;;;) lines. The non-debug files have been mangled and compressed.
        concat: {
            options: {
                banner: banner
            },
            XMLHttpBridge: {
                src: [ 
                    'dist/tmp/utils/Browser.js',
                    'dist/tmp/utils/Events.js',
                    'dist/tmp/utils/URI.js',
                    'dist/tmp/utils/PostMessage.js',
                    'dist/tmp/XMLHttpBridge.js'
                ],
                dest: 'dist/js/XMLHttpBridge-debug.js'
            },
            EventSourceBridge: {
                src: [ 
                    'dist/tmp/utils/Browser.js',
                    'dist/tmp/utils/Events.js',
                    'dist/tmp/utils/URI.js',
                    'dist/tmp/utils/PostMessage.js'
                ],
                dest: 'dist/js/EventSourceBridge-debug.js'
            },
            PostMessageParentBridge: {
                src: [ 
                    'dist/tmp/utils/Browser.js',
                    'dist/tmp/utils/URI.js',
                    'dist/tmp/PostMessageParentBridge.js'
                ],
                dest: 'dist/js/PostMessageParentBridge-debug.js'
            },
            PostMessageChildBridge: {
                src: [ 
                    'dist/tmp/utils/Browser.js',
                    'dist/tmp/utils/URI.js',
                    'dist/tmp/PostMessageChildBridge.js'
                ],
                dest: 'dist/js/PostMessageChildBridge-debug.js'
            },
        },

        // Remove the ;;; debug log lines from the concatenated files
        lineremover: {
            all: {
                options: {
                    exclusionPattern: /^.*\;\;\;.*$/g
                },
                files: [
                    {src: 'dist/js/XMLHttpBridge-debug.js',
                     dest: 'dist/js/XMLHttpBridge.js'},
                    {src: 'dist/js/EventSourceBridge-debug.js',
                     dest: 'dist/js/EventSourceBridge.js'},
                    {src: 'dist/js/PostMessageParentBridge-debug.js',
                     dest: 'dist/js/PostMessageParentBridge.js'},
                    {src: 'dist/js/PostMessageChildBridge-debug.js',
                     dest: 'dist/js/PostMessageChildBridge.js'}
                ]
            }
        },

        jsdoc: {
            dist: {
                options: {
                    configure: 'src/kaazing/jsdoc/configure.json'
                    //   template: 'src/kaazing/jsdoc',
                },
                src: ['dist/js'],
                //                src: ['dist/tmp'],
                dest: 'dist/jsdoc'
            }
        },

        karma: {
            test: {
                configFile: 'test/karma.config.js'
            },
        },
    });

    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.loadNpmTasks('grunt-karma');

    //    grunt.loadNpmTasks('grunt-jsdoc-to-markdown');

    grunt.loadNpmTasks('grunt-jsdoc');

    grunt.loadNpmTasks('grunt-line-remover');

    grunt.loadNpmTasks('grunt-stripbanner');

    grunt.registerTask('default', ['clean', 'copy', 'stripbanner', 'concat', 'lineremover', 'jsdoc', 'clean:tmp']);
    
    grunt.registerTask('test', ['karma']);

};

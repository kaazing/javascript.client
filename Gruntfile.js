module.exports = function(grunt) {

    var pkg = require('./package.json');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            dist: {
                src: ['dist/']
            },
            tmp: {
                src: ['dist/tmp']
            }
        },

        // copy all the source files we're going to combine to a temporary directory
        copy: {
            src: {
                cwd: 'kaazing-client-javascript/src/kaazing/gateway',
                src: '**',
                dest: 'dist/tmp/',
                expand: true
            },
            utils: {
                cwd: 'kaazing-client-javascript-util',
                src: '**',
                dest: 'dist/tmp/utils',
                expand: true
            }
        },

        stripbanner: {
            tmpFiles: {
                options: {
                    cwd: './dist/tmp'
                }
            }
        },

        // The *-debug.js files are just the concatenated source files, with no
        // mangling of variable names or compression of the output or removal of
        // debug (;;;) lines.
        concat: {
            options: {
                banner:
                    '/**\n' +
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
                    ' */\n'
            },
            PostMessage: {
                src: [
                    'dist/tmp/utils/Browser.js',
                    'dist/tmp/utils/Events.js',
                    'dist/tmp/utils/URI.js',
                    'dist/tmp/utils/PostMessage.js'
                ],
                dest: 'dist/js/PostMessage-debug.js'
            },
            XmlHttpRequest: {
                src: [
                    'dist/tmp/utils/Browser.js',
                    'dist/tmp/utils/Events.js',
                    'dist/tmp/utils/URI.js',
                    'dist/tmp/utils/PostMessage.js',

                    'dist/tmp/internal/xhr/XDRHttpDirect.js',
                    'dist/tmp/internal/xhr/XMLHttpBridge.js',
                    'dist/tmp/internal/xhr/XMLHttpRequest.js'
                ],
                dest: 'dist/js/XMLHttpRequest-debug.js'
            },
            ServerSentEvents: {
                src: [
                    'dist/tmp/utils/Browser.js',
                    'dist/tmp/utils/Events.js',
                    'dist/tmp/utils/URI.js',
                    'dist/tmp/utils/PostMessage.js',

                    'dist/tmp/internal/xhr/XDRHttpDirect.js',
                    'dist/tmp/internal/xhr/XMLHttpBridge.js',
                    'dist/tmp/internal/xhr/XMLHttpRequest.js',

                    'dist/tmp/ServerSentEvents.js'
                ],
                dest: 'dist/js/ServerSentEvents-debug.js'
            },
            WebSocket: {
                src: [
                    'dist/tmp/utils/KaazingNamespace.js',
                    'dist/tmp/utils/Browser.js',
                    'dist/tmp/utils/Events.js',
                    'dist/tmp/utils/URI.js',

                    'dist/tmp/internal/Base64.js',

                    'dist/tmp/utils/ByteOrder.js',
                    'dist/tmp/utils/ByteBuffer.js',
                    'dist/tmp/utils/Charset.js',
                    'dist/tmp/utils/BlobUtils.js',
                    'dist/tmp/utils/PostMessage.js',
                    'dist/tmp/utils/Logger.js',
                    'dist/tmp/utils/Utils.js',

                    'dist/tmp/internal/xhr/XDRHttpDirect.js',
                    'dist/tmp/internal/xhr/XMLHttpBridge.js',
                    'dist/tmp/internal/xhr/XMLHttpRequest.js',

                    'dist/tmp/internal/GatewayNamespace.js',
                    'dist/tmp/internal/loader/StartClosure.js',

                    'dist/tmp/internal/wsn/WebSocketNativeProxy.js',

                    'dist/tmp/internal/security/UriElementKind.js',
                    'dist/tmp/internal/security/RealmUtils.js',
                    'dist/tmp/internal/security/Dictionary.js',
                    'dist/tmp/internal/security/OrderedDictionary.js',
                    'dist/tmp/internal/security/Node.js',
                    'dist/tmp/internal/security/Token.js',
                    'dist/tmp/Oid.js',
                    'dist/tmp/internal/security/BasicChallengeResponseFactory.js',
                    'dist/tmp/internal/security/InternalDefaultChallengeHandler.js',
                    'dist/tmp/PasswordAuthentication.js',
                    'dist/tmp/ChallengeRequest.js',
                    'dist/tmp/ChallengeResponse.js',
                    'dist/tmp/BasicChallengeHandler.js',
                    'dist/tmp/DispatchChallengeHandler.js',
                    'dist/tmp/NegotiateChallengeHandler.js',
                    'dist/tmp/NegotiableChallengeHandler.js',
                    'dist/tmp/internal/ws/WebSocketHandshakeObject.js',
                    'dist/tmp/internal/ws/WebSocketExtension.js',
                    'dist/tmp/internal/ws/WebSocketRevalidateExtension.js',

                    'dist/tmp/internal/Windows1252.js',

                    'dist/tmp/CloseEvent.js',
                    'dist/tmp/MessageEvent.js',
                    'dist/tmp/Blob.js',

                    // new handler files
                    'dist/tmp/internal/util/AsyncActionQueue.js',
                    'dist/tmp/internal/util/URLRequestHeader.js',
                    'dist/tmp/internal/util/HttpURI.js',
                    'dist/tmp/internal/util/WSURI.js',
                    'dist/tmp/internal/util/WSCompositeURI.js',
                    'dist/tmp/internal/util/ResumableTimer.js',
                    'dist/tmp/internal/Channel.js',
                    'dist/tmp/internal/WebSocketChannel.js',
                    'dist/tmp/internal/WebSocketHandlerAdapter.js',
                    'dist/tmp/internal/WebSocketHandlerListener.js',
                    'dist/tmp/internal/ws/WebSocketSelectedChannel.js',
                    'dist/tmp/internal/ws/WebSocketEmulatedChannelFactory.js',
                    'dist/tmp/internal/ws/WebSocketNativeChannelFactory.js',
                    'dist/tmp/internal/ws/WebSocketCompositeChannel.js',
                    'dist/tmp/internal/ws/WebSocketControlFrameHandler.js',
                    'dist/tmp/internal/ws/WebSocketRevalidateHandler.js',

                    'dist/tmp/internal/wsn/WebSocketNativeDelegateHandler.js',
                    'dist/tmp/internal/wsn/WebSocketNativeBalancingHandler.js',
                    'dist/tmp/internal/wsn/WebSocketNativeHandshakeHandler.js',
                    'dist/tmp/internal/wsn/WebSocketNativeAuthenticationHandler.js',
                    'dist/tmp/internal/wsn/WebSocketHixie76FrameCodecHandler.js',
                    'dist/tmp/internal/wsn/WebSocketNativeHandler.js',

                    'dist/tmp/internal/wse/WebSocketEmulatedProxyDownstream.js',
                    'dist/tmp/internal/wse/WebSocketEmulatedProxy.js',
                    'dist/tmp/internal/wse/WebSocketEmulatedDelegateHandler.js',
                    'dist/tmp/internal/wse/WebSocketEmulatedAuthenticationHandler.js',
                    'dist/tmp/internal/wse/WebSocketEmulatedHandler.js',

                    'dist/tmp/internal/ws/WebSocketSelectedHandler.js',
                    'dist/tmp/internal/strategy/WebSocketStrategy.js',
                    'dist/tmp/internal/strategy/WebSocketNativeStrategy.js',
                    'dist/tmp/internal/strategy/WebSocketEmulatedStrategy.js',
                    'dist/tmp/internal/ws/WebSocketCompositeHandler.js',

                    'dist/tmp/HttpRedirectPolicy.js',
                    'dist/tmp/WebSocket.js',
                    'dist/tmp/WebSocketFactory.js',

                    'dist/tmp/internal/WebSocketRequireJSModule.js',
                    'dist/tmp/internal/loader/EndClosure.js'
                ],
                dest: 'dist/js/WebSocket-debug.js'
            },
            PostMessageBridge: {
                src: [
                    'dist/tmp/html/PostMessageBridge.html'
                ],
                dest: 'dist/js/PostMessageBridge.html'
            }
        },

        // Remove the ;;; debug log lines from the concatenated files
        lineremover: {
            all: {
                options: {
                    exclusionPattern: /^.*\;\;\;.*$/g
                },
                files: [
                    {src: 'dist/js/PostMessage-debug.js',
                     dest: 'dist/js/PostMessage.js'},
                    {src: 'dist/js/XMLHttpRequest-debug.js',
                     dest: 'dist/js/XMLHttpRequest.js'},
                    {src: 'dist/js/ServerSentEvents-debug.js',
                     dest: 'dist/js/ServerSentEvents.js'},
                    {src: 'dist/js/WebSocket-debug.js',
                     dest: 'dist/js/WebSocket.js'}
                ]
            }
        },


        uglify: {
            options: {
                compress: {
                    unused: false
                },
                mangle: true,
                unused: false,
                banner:
                    '/**\n' +
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
                    ' */\n'
            },
            PostMessage: {
                src: 'dist/js/PostMessage.js',
                dest: 'dist/js/PostMessage.js'
            },
            XmlHttpRequest: {
                src: 'dist/js/XMLHttpRequest.js',
                dest: 'dist/js/XMLHttpRequest.js'
            },
            ServerSentEvents: {
                src: 'dist/js/ServerSentEvents.js',
                dest: 'dist/js/ServerSentEvents.js'
            },
            WebSocket: {
                src: 'dist/js/WebSocket.js',
                dest: 'dist/js/WebSocket.js'
            }
        },

        jsdoc: {
            dist: {
                options: {
                    configure: 'kaazing-client-javascript/src/kaazing/jsdoc/configure.json',
                    private: false
                },
                src: ['dist/js'],
                dest: 'dist/jsdoc'
            }
        },

        karma: {
            test: {
                configFile: 'test/karma.config.js'
            }
        },

        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['package.json'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: false,
                pushTo: 'develop',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
                globalReplace: false,
                prereleaseName: false,
                regExp: false
            }
        },

        buildcontrol: {
            options: {
                dir: 'dist',
                commit: true,
                push: true,
                message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
            },
            publish: {
                options: {
                    remote: 'git@github.com:pkhanal/javascript-release-test.git',
                    branch: 'master',
                    tag: pkg.version
                }
            }
        }


    });

    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.loadNpmTasks('grunt-karma');

    grunt.loadNpmTasks('grunt-jsdoc');

    grunt.loadNpmTasks('grunt-line-remover');

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-stripbanner');

    grunt.loadNpmTasks('grunt-bump');

    grunt.loadNpmTasks('grunt-build-control');

    grunt.registerTask('default', ['clean', 'copy', 'stripbanner', 'concat', 'lineremover', 'uglify', 'jsdoc', 'clean:tmp']);

    grunt.registerTask('test', ['karma']);

};

module.exports = function(grunt) {

    var pkg = require('./package.json');

    require('load-grunt-tasks')(grunt, {
        pattern: 'grunt-*',
        config: 'package.json',
        scope: 'devDependencies'
    });

    grunt.initConfig({

        clean: {
            dist : {
                src : [ 'dist' ]
            },
            tmp: {
                src: ['dist/tmp']
            }
        },

        // copy all the source files we're going to combine to a temporary directory
        copy: {
            utils: {
                cwd: 'util/src/kaazing',
                src: '**',
                dest: 'dist/tmp/util',
                expand: true,
                flatten: true
            },

            gateway_src: {
                cwd: 'gateway/src/kaazing/gateway',
                src:'**',
                dest: 'dist/tmp/gateway/src',
                expand: true,
                flatten: true
            },

            bridge: {
                cwd: 'bridge/src/kaazing/gateway',
                src: '**',
                dest: 'dist/tmp/bridge/src',
                expand: true,
                flatten: true

            },

            amqp_0_9_1_src: {
                cwd: 'amqp-0-9-1/src',
                src: '**',
                dest: 'dist/tmp/amqp-0-9-1',
                expand: true
            }
        },

        stripbanner: {
            tmpFiles: {
                options: {
                    cwd: 'dist/tmp'
                }
            }
        },

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
                    'dist/tmp/util/Browser.js',
                    'dist/tmp/util/Events.js',
                    'dist/tmp/util/URI.js',
                    'dist/tmp/util/PostMessage.js'
                ],
                dest: 'dist/gateway/js/PostMessage-debug.js'
            },

            XmlHttpRequest: {
                src: [
                    'dist/tmp/util/Browser.js',
                    'dist/tmp/util/Events.js',
                    'dist/tmp/util/URI.js',
                    'dist/tmp/util/PostMessage.js',

                    'dist/tmp/gateway/src/XDRHttpDirect.js',
                    'dist/tmp/gateway/src/XMLHttpBridge.js',
                    'dist/tmp/gateway/src/XMLHttpRequest.js'
                ],
                dest: 'dist/gateway/js/XMLHttpRequest-debug.js'
            },

            ServerSentEvents: {
                src: [
                    'dist/tmp/util/Browser.js',
                    'dist/tmp/util/Events.js',
                    'dist/tmp/util/URI.js',
                    'dist/tmp/util/PostMessage.js',

                    'dist/tmp/gateway/src/XDRHttpDirect.js',
                    'dist/tmp/gateway/src/XMLHttpBridge.js',
                    'dist/tmp/gateway/src/XMLHttpRequest.js',

                    'dist/tmp/gateway/src/ServerSentEvents.js'
                ],
                dest: 'dist/gateway/js/ServerSentEvents-debug.js'
            },

            WebSocket: {
                src: [
                    'dist/tmp/util/KaazingNamespace.js',
                    'dist/tmp/util/Browser.js',
                    'dist/tmp/util/Events.js',
                    'dist/tmp/util/URI.js',

                    'dist/tmp/gateway/src/Base64.js',

                    'dist/tmp/util/ByteOrder.js',
                    'dist/tmp/util/ByteBuffer.js',
                    'dist/tmp/util/Charset.js',
                    'dist/tmp/util/BlobUtils.js',
                    'dist/tmp/util/PostMessage.js',
                    'dist/tmp/util/Logger.js',
                    'dist/tmp/util/Utils.js',

                    'dist/tmp/gateway/src/XDRHttpDirect.js',
                    'dist/tmp/gateway/src/XMLHttpBridge.js',
                    'dist/tmp/gateway/src/XMLHttpRequest.js',

                    'dist/tmp/gateway/src/GatewayNamespace.js',
                    'dist/tmp/gateway/src/StartClosure.js',

                    'dist/tmp/gateway/src/WebSocketNativeProxy.js',

                    'dist/tmp/gateway/src/UriElementKind.js',
                    'dist/tmp/gateway/src/RealmUtils.js',
                    'dist/tmp/gateway/src/Dictionary.js',
                    'dist/tmp/gateway/src/OrderedDictionary.js',
                    'dist/tmp/gateway/src/Node.js',
                    'dist/tmp/gateway/src/Token.js',
                    'dist/tmp/gateway/src/Oid.js',
                    'dist/tmp/gateway/src/BasicChallengeResponseFactory.js',
                    'dist/tmp/gateway/src/InternalDefaultChallengeHandler.js',
                    'dist/tmp/gateway/src/PasswordAuthentication.js',
                    'dist/tmp/gateway/src/ChallengeRequest.js',
                    'dist/tmp/gateway/src/ChallengeResponse.js',
                    'dist/tmp/gateway/src/BasicChallengeHandler.js',
                    'dist/tmp/gateway/src/DispatchChallengeHandler.js',
                    'dist/tmp/gateway/src/NegotiateChallengeHandler.js',
                    'dist/tmp/gateway/src/NegotiableChallengeHandler.js',
                    'dist/tmp/gateway/src/WebSocketHandshakeObject.js',

                    'dist/tmp/gateway/src/Windows1252.js',

                    'dist/tmp/gateway/src/CloseEvent.js',
                    'dist/tmp/gateway/src/MessageEvent.js',
                    'dist/tmp/gateway/src/Blob.js',

                    // new handler files
                    'dist/tmp/gateway/src/AsyncActionQueue.js',
                    'dist/tmp/gateway/src/URLRequestHeader.js',
                    'dist/tmp/gateway/src/WSURI.js',
                    'dist/tmp/gateway/src/WSCompositeURI.js',
                    'dist/tmp/gateway/src/ResumableTimer.js',
                    'dist/tmp/gateway/src/Channel.js',
                    'dist/tmp/gateway/src/WebSocketChannel.js',
                    'dist/tmp/gateway/src/WebSocketHandlerAdapter.js',
                    'dist/tmp/gateway/src/Internal.js',
                    'dist/tmp/gateway/src/WebSocketHandlerListener.js',
                    'dist/tmp/gateway/src/WebSocketExtensionHandler.js',
                    'dist/tmp/gateway/src/WebSocketSelectedChannel.js',
                    'dist/tmp/gateway/src/WebSocketEmulatedChannelFactory.js',
                    'dist/tmp/gateway/src/WebSocketNativeChannelFactory.js',
                    'dist/tmp/gateway/src/WebSocketCompositeChannel.js',
                    'dist/tmp/gateway/src/WebSocketControlFrameHandler.js',
                    'dist/tmp/gateway/src/WebSocketRevalidateHandler.js',

                    'dist/tmp/gateway/src/WebSocketNativeDelegateHandler.js',
                    'dist/tmp/gateway/src/WebSocketNativeBalancingHandler.js',
                    'dist/tmp/gateway/src/WebSocketNativeHandshakeHandler.js',
                    'dist/tmp/gateway/src/WebSocketNativeAuthenticationHandler.js',
                    'dist/tmp/gateway/src/WebSocketHixie76FrameCodecHandler.js',
                    'dist/tmp/gateway/src/WebSocketNativeHandler.js',

                    'dist/tmp/gateway/src/WebSocketEmulatedProxyDownstream.js',
                    'dist/tmp/gateway/src/WebSocketEmulatedProxy.js',
                    'dist/tmp/gateway/src/WebSocketEmulatedDelegateHandler.js',
                    'dist/tmp/gateway/src/WebSocketEmulatedAuthenticationHandler.js',
                    'dist/tmp/gateway/src/WebSocketEmulatedHandler.js',

                    'dist/tmp/gateway/src/WebSocketSelectedHandler.js',
                    'dist/tmp/gateway/src/WebSocketStrategy.js',
                    'dist/tmp/gateway/src/WebSocketNativeStrategy.js',
                    'dist/tmp/gateway/src/WebSocketEmulatedStrategy.js',
                    'dist/tmp/gateway/src/WebSocketCompositeHandler.js',

                    'dist/tmp/gateway/src/HttpRedirectPolicy.js',
                    'dist/tmp/gateway/src/WebSocket.js',
                    'dist/tmp/gateway/src/WebSocketFactory.js',

                    'dist/tmp/gateway/src/WebSocketRequireJSModule.js',
                    'dist/tmp/gateway/src/EndClosure.js'
                ],
                dest: 'dist/gateway/js/WebSocket-debug.js'
            },

            PostMessageBridge: {
                src: [
                    'dist/tmp/gateway/src/PostMessageBridge.html'
                ],
                dest: 'dist/gateway/js/PostMessageBridge.html'
            },

            XMLHttpBridge: {
                src: [
                    'dist/tmp/util/Browser.js',
                    'dist/tmp/util/Events.js',
                    'dist/tmp/util/URI.js',
                    'dist/tmp/util/PostMessage.js',
                    'dist/tmp/bridge/src/XMLHttpBridge.js'
                ],
                dest: 'dist/bridge/js/XMLHttpBridge.js'
            },
            EventSourceBridge: {
                src: [
                    'dist/tmp/util/Browser.js',
                    'dist/tmp/util/Events.js',
                    'dist/tmp/util/URI.js',
                    'dist/tmp/util/PostMessage.js'
                ],
                dest: 'dist/bridge/js/EventSourceBridge.js'
            },
            PostMessageParentBridge: {
                src: [
                    'dist/tmp/util/Browser.js',
                    'dist/tmp/util/URI.js',
                    'dist/tmp/bridge/src/PostMessageParentBridge.js'
                ],
                dest: 'dist/bridge/js/PostMessageParentBridge.js'
            },
            PostMessageChildBridge: {
                src: [
                    'dist/tmp/util/Browser.js',
                    'dist/tmp/util/URI.js',
                    'dist/tmp/bridge/src/PostMessageChildBridge.js'
                ],
                dest: 'dist/bridge/js/PostMessageChildBridge.js'
            },

            amqp_0_9_1 : {
                src : [
                    // kaazing-client-javascript-util files
                    'dist/tmp/util/KaazingNamespace.js',
                    'dist/tmp/util/Logger.js',
                    'dist/tmp/util/Utils.js',
                    'dist/tmp/util/Browser.js',
                    'dist/tmp/util/ByteOrder.js',
                    'dist/tmp/util/ByteBuffer.js',
                    'dist/tmp/util/Charset.js',
                    'dist/tmp/util/URI.js',

                    // Amqp-0-9-1 files
                    'dist/tmp/amqp-0-9-1/src/amqp/internal/AmqpClientVariables.js',
                    'dist/tmp/amqp-0-9-1/src/amqp/internal/AmqpNamespace.js',
                    'dist/tmp/amqp-0-9-1/src/amqp/internal/AmqpRequireJSModule.js',
                    'dist/tmp/amqp-0-9-1/src/amqp/EventDispatcher.js',
                    'dist/tmp/amqp-0-9-1/src/amqp/internal/AmqpClientStartClosure.js',
                    'dist/tmp/amqp-0-9-1/src/amqp/internal/StateMachine.js',
                    'dist/tmp/amqp-0-9-1/src/amqp/internal/AsyncClient.js',
                    'dist/tmp/amqp-0-9-1/src/amqp/internal/AmqpConstants.js',
                    'dist/tmp/amqp-0-9-1/src/amqp/internal/AmqpDomains.js',
                    'dist/tmp/amqp-0-9-1/src/amqp/internal/AmqpMethods.js',
                    'dist/tmp/amqp-0-9-1/src/amqp/internal/AmqpInternalFields.js',
                    'dist/tmp/amqp-0-9-1/src/amqp/internal/AmqpBuffer.js',
                    'dist/tmp/amqp-0-9-1/src/amqp/AmqpClient.js',
                    'dist/tmp/amqp-0-9-1/src/amqp/AmqpChannel.js',
                    'dist/tmp/amqp-0-9-1/src/amqp/internal/ActionList.js',
                    'dist/tmp/amqp-0-9-1/src/amqp/internal/AmqpClientEndClosure.js',
                    'dist/tmp/amqp-0-9-1/src/amqp/AmqpArguments.js',
                    'dist/tmp/amqp-0-9-1/src/amqp/AmqpProperties.js',
                    'dist/tmp/amqp-0-9-1/src/amqp/AmqpEvent.js',
                    'dist/tmp/amqp-0-9-1/src/amqp/AmqpClientFactory.js', ],
                dest : 'dist/amqp-0-9-1/js/Amqp-0-9-1-debug.js'
            }

        },

        // Remove the ;;; debug log lines from the concatenated files
        lineremover: {
            all: {
                options: {
                    exclusionPattern: /^.*\;\;\;.*$/g
                },
                files: [
                    {src: 'dist/gateway/js/PostMessage-debug.js',
                        dest: 'dist/gateway/js/PostMessage.js'},
                    {src: 'dist/gateway/js/XMLHttpRequest-debug.js',
                        dest: 'dist/gateway/js/XMLHttpRequest.js'},
                    {src: 'dist/gateway/js/ServerSentEvents-debug.js',
                        dest: 'dist/gateway/js/ServerSentEvents.js'},
                    {src: 'dist/gateway/js/WebSocket-debug.js',
                        dest: 'dist/gateway/js/WebSocket.js'}
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
                src: 'dist/gateway/js/PostMessage.js',
                dest: 'dist/gateway/js/PostMessage.js'
            },
            XmlHttpRequest: {
                src: 'dist/gateway/js/XMLHttpRequest.js',
                dest: 'dist/gateway/js/XMLHttpRequest.js'
            },
            ServerSentEvents: {
                src: 'dist/gateway/js/ServerSentEvents.js',
                dest: 'dist/gateway/js/ServerSentEvents.js'
            },
            WebSocket: {
                src: 'dist/gateway/js/WebSocket.js',
                dest: 'dist/gateway/js/WebSocket.js'
            },
            EventSourceBridge: {
                src: 'dist/bridge/js/EventSourceBridge.js',
                dest: 'dist/bridge/js/EventSourceBridge.js'
            },
            PostMessageChildBridge: {
                src: 'dist/bridge/js/PostMessageChildBridge.js',
                dest: 'dist/bridge/js/PostMessageChildBridge.js'
            },
            PostMessageParentBridge: {
                src: 'dist/bridge/js/PostMessageParentBridge.js',
                dest: 'dist/bridge/js/PostMessageParentBridge.js'
            },
            XMLHttpBridge: {
                src: 'dist/bridge/js/XMLHttpBridge.js',
                dest: 'dist/bridge/js/XMLHttpBridge.js'
            },
            amqp_0_9_1: {
                src: 'dist/amqp-0-9-1/js/Amqp-0-9-1-debug.js',
                dest: 'dist/amqp-0-9-1/js/Amqp-0-9-1.js'
            }
        },

        jsdoc: {
            gateway: {
                options: {
                    configure: 'gateway/src/kaazing/jsdoc/configure.json',
                    private: false
                },
                src: ['dist/gateway/js/*-debug.js'],
                dest: 'dist/gateway/jsdoc'
            },
            amqp_0_9_1: {
                src: ['dist/amqp-0-9-1/js/*-debug.js'],
                dest: 'dist/amqp-0-9-1/jsdoc',
                options: {
                    private: false
                }
            }
        },

        bump: {
         options: {
             files: ['package.json'],
             updateConfigs: [],
             commit: true,
             createTag: false,
             push: false
         }
        },

        json_generator: {
            bower: {
                dest: "dist/bower.json",
                options: {
                    name: "kaazing-javascript-client",
                    version: pkg.version,
                    ignore: [],
                    dependencies: {}
                }
            },
            package: {
                dest: "dist/package.json",
                options: {
                    name: "kaazing-javascript-client",
                    version: pkg.version,
                    description: "Files necessary to develop a Javascript-based client for a Kaazing Gateway.",
                    repository: {
                        "type": "git",
                        "url": "https://github.com/kaazing/javascript.client.git"
                    },
                    keywords: [
                        "kaazing",
                        "gateway",
                        "browser",
                        "client-side"
                    ],
                    author: "Kaazing",
                    licenses: [
                        {
                            "type": "Apache 2",
                            "url": "http://www.apache.org/licenses/LICENSE-2.0.html"
                        }
                    ]
                }
            }
        },

        buildcontrol: {
            options: {
                dir: 'dist',
                commit: true,
                push: true,
                message: 'v' + pkg.version
            },
            publish: {
                options: {
                    remote: 'git@github.com:kaazing/bower-javascript.client.git',
                    branch: 'master',
                    tag: pkg.version
                }
            }
        }
    });

    grunt.registerTask('package', ['clean', 'copy', 'stripbanner', 'concat', 'lineremover', 'uglify', 'jsdoc', 'json_generator', 'clean:tmp']);

    grunt.registerTask('default', ['package'])

    grunt.registerTask('deploy', 'deploy artifacts', function() {
        grunt.task.run(['package', 'buildcontrol']);
    });
};
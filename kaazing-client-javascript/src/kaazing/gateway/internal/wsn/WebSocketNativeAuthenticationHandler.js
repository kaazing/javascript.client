/**
 * Copyright (c) 2007-2014 Kaazing Corporation. All rights reserved.
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


/**
 * @private
 */
var WebSocketNativeAuthenticationHandler = (function($module) /*extends WebSocketHandlerAdapter*/ {
		;;;var CLASS_NAME = "WebSocketNativeAuthenticationHandler";
		;;;var LOG = Logger.getLogger(CLASS_NAME);

		var WebSocketNativeAuthenticationHandler = function() {
			;;;LOG.finest(CLASS_NAME, "<init>");
		};

	   var $prototype = WebSocketNativeAuthenticationHandler.prototype = new WebSocketHandlerAdapter();

        //internal functions
		$prototype.handleClearAuthenticationData = function(channel) {
			if (channel._challengeResponse != null) {
				channel._challengeResponse.clearCredentials();
			}
		}

		$prototype.handleRemoveAuthenticationData = function(channel) {
			this.handleClearAuthenticationData(channel);
			channel._challengeResponse = new $module.ChallengeResponse(null, null);
		}

		$prototype.doError = function(channel) {
            this._nextHandler.processClose(channel);
			this.handleClearAuthenticationData(channel); //clear authentication data
			this._listener.connectionFailed(channel);
		}

        $prototype.handle401 = function(channel, location, challenge) {
            var $this = this;
            var serverURI = channel._location;
            var connectTimer = null;

            if (typeof(channel.parent.connectTimer) != "undefined") {
                connectTimer = channel.parent.connectTimer;

                if (connectTimer != null) {
                    // Pause the connect timer while the user is providing the
                    // credentials.
                    connectTimer.pause();
                }
            }

            if (channel.redirectUri != null) {
                //this connection has been redirected
                serverURI = channel._redirectUri;
            }

            var challengeRequest = new $module.ChallengeRequest(serverURI.toString(),  challenge);

			var challengeHandler;
			if (channel._challengeResponse.nextChallengeHandler != null ) {
				challengeHandler = channel._challengeResponse.nextChallengeHandler;
			} else {
				challengeHandler = channel.parent.challengeHandler;
			}

			if ( challengeHandler != null && challengeHandler.canHandle(challengeRequest)) {
				challengeHandler.handle(challengeRequest,function(challengeResponse) {
                        //fulfilled callback function
                        try {
                            if ( challengeResponse == null || challengeResponse.credentials == null) {
                                // No response available
                                $this.doError(channel);
                            } else {
                                if (connectTimer != null) {
                                    // Resume the connect timer.
                                    connectTimer.resume();
                                }

                                // Retry request with the auth response.
                                channel._challengeResponse = challengeResponse;
                                $this._nextHandler.processAuthorize(channel, challengeResponse.credentials);
                            }
                        } catch(e) {
                            $this.doError(channel);
                        }
					});
			} else {
				this.doError(channel);
			}
		}

	   /**
	    * @private
 	   */

        $prototype.handleAuthenticate = function(channel, location, challenge) {
            channel.authenticationReceived = true;
			this.handle401(channel,location, challenge);
		}
		$prototype.setNextHandler = function(nextHandler) {
			this._nextHandler = nextHandler;
            var $this = this;
            var listener = new WebSocketHandlerListener(this);

            listener.authenticationRequested = function(channel, location, challenge) {
               //alert(CLASS_NAME + "authenticationRequested");
               $this.handleAuthenticate(channel,location, challenge);
            }

			nextHandler.setListener(listener);

		}

		$prototype.setListener = function(listener) {
			this._listener = listener;
		}

	return WebSocketNativeAuthenticationHandler;
})(Kaazing.Gateway)

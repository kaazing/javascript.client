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
var WebSocketEmulatedAuthenticationHandler = (function() /*extends WebSocketHandlerAdapter*/ {
		;;;var CLASS_NAME = "WebSocketEmulatedAuthenticationHandler";
		;;;var LOG = Logger.getLogger(CLASS_NAME);

		var WebSocketEmulatedAuthenticationHandler = function() {
			;;;LOG.finest(CLASS_NAME, "<init>");
		};
		
	   var $prototype = WebSocketEmulatedAuthenticationHandler.prototype = new WebSocketHandlerAdapter();

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
        
        $prototype.handle401 = function(channel, location, challenge) {
            var $this = this;
            var connectTimer = null;

            if (typeof(channel.parent.connectTimer) != "undefined") {
                connectTimer = channel.parent.connectTimer;
                
                if (connectTimer != null) {
                    // Pause the connect timer while the user is providing the 
                    // credentials.
                    connectTimer.pause();
                }
            }
            
            var challengeLocation = location;
    		if (challengeLocation.indexOf("/;e/") > 0) {
               	challengeLocation = challengeLocation.substring(0, challengeLocation.indexOf("/;e/")); //"/;e/" was added by WebSocketImpl.as
            }
            var challengeUri = new WSURI(challengeLocation.replace("http", "ws"));
            var challengeRequest = new $module.ChallengeRequest(challengeLocation,  challenge);
			
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
                                $this.handleClearAuthenticationData(channel); //clear authentication data
                                $this._listener.connectionFailed(channel);
                            } else {
                                if (connectTimer != null) {
                                    // Resume the connect timer.
                                    connectTimer.resume();
                                }

                                // Retry request with the auth response.
                                channel._challengeResponse = challengeResponse;
                                $this.processConnect(channel, challengeUri, channel._protocol);
                            }
                        } catch(e) {
                            $this.handleClearAuthenticationData(channel);
                            $this._listener.connectionFailed(channel);
                        }
					});
			} else {
				this.handleClearAuthenticationData(channel); //clear authentication data
				this._listener.connectionFailed(channel);
			}
		}
        
	   /**
	    * Implement WebSocketListener methods
            *
	    * @private
            */
		
        $prototype.processConnect = function(channel, location, protocol) {
			if(channel._challengeResponse != null && channel._challengeResponse.credentials != null) {
				// Retry request with the auth response.
				var authResponse = channel._challengeResponse.credentials.toString();
				//LOG.debug("HttpRequest(Proxy).handleAuthChallenge: Setting Authorization header to {0}", authResponse);
				//remove previouse Authorization header if exists
				for (var i = channel.requestHeaders.length-1; i >= 0; i-- ) {
				    if (channel.requestHeaders[i].label === "Authorization") {
				    	channel.requestHeaders.splice(i, 1);
				    }
				}
				var authHeader = new URLRequestHeader("Authorization", authResponse);
				//remove previouse Authorization header if exists
				for (var i = channel.requestHeaders.length-1; i >= 0; i-- ) {
				    if (channel.requestHeaders[i].label === "Authorization") {
				    	channel.requestHeaders.splice(i, 1);
				    }
				}
				channel.requestHeaders.push(authHeader);
				this.handleClearAuthenticationData(channel); //clear authentication data
			}
			this._nextHandler.processConnect(channel, location, protocol);
		}
        
        $prototype.handleAuthenticate = function(channel, location, challenge) {
            channel.authenticationReceived = true;
			this.handle401(channel,location, challenge);
		}
		$prototype.setNextHandler = function(nextHandler) {
			this._nextHandler = nextHandler;
			var listener = new WebSocketHandlerListener(this);
            var outer = this;
            
            listener.authenticationRequested = function(channel, location, challenge) {
               //alert(CLASS_NAME + "authenticationRequested");
               outer.handleAuthenticate(channel,location, challenge);
            }
            nextHandler.setListener(listener);
            
		}
		
		$prototype.setListener = function(listener) {
			this._listener = listener;
		} 
		
	return WebSocketEmulatedAuthenticationHandler;
})()

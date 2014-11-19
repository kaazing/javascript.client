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
var WebSocketNativeBalancingHandler = (function($module) /*extends WebSocketHandlerAdapter*/ {
		;;;var CLASS_NAME = "WebSocketNativeBalancingHandler";
		;;;var LOG = Logger.getLogger(CLASS_NAME);

		var WebSocketNativeBalancingHandler = function() {
			;;;LOG.finest(CLASS_NAME, "<init>");
		};

        var handleRedirect = function($this, channel, redirectUri) {
            channel._redirecting = true;
            channel._redirectUri = redirectUri;
            $this._nextHandler.processClose(channel);
        }

		/**
		 * @private
		 */
		var $prototype = WebSocketNativeBalancingHandler.prototype = new WebSocketHandlerAdapter();

        $prototype.processConnect = function(channel, uri, protocol) {
            channel._balanced = 0;
            this._nextHandler.processConnect(channel, uri, protocol);
        }

        $prototype.handleConnectionClosed = function(channel, wasClean, code, reason) {
            if (channel._redirecting == true) {
                channel._redirecting = false;

                var redirectLoc = channel._redirectUri;
                var originalLoc = channel._location;

                var compChannel = channel.parent;
                var redirectPolicy = compChannel.getRedirectPolicy();
                if (redirectPolicy instanceof $module.HttpRedirectPolicy) {
                    if (!redirectPolicy.isRedirectionAllowed(originalLoc.toString(), redirectLoc.toString())) {
                        channel.preventFallback = true;
                        var s = redirectPolicy.toString() + ": Cannot redirect from " + originalLoc.toString() + " to " + redirectLoc.toString();
                        this._listener.connectionClosed(channel, false, 1006, s);
                        return;
                    }
                }

                //balancer redirect, open a new connection to redirectUri
            	channel._redirected =  true;
                channel.handshakePayload = "";
                //add x-kaazing-extension protocol
                var protocols = [WebSocketHandshakeObject.KAAZING_EXTENDED_HANDSHAKE];
                for (var i = 0; i < channel._protocol.length; i++) {
                	protocols.push(channel._protocol[i]);
                }
                this.processConnect(channel, channel._redirectUri, protocols);
            }
            else {
                this._listener.connectionClosed(channel, wasClean, code, reason);
            }
        }

		$prototype.handleMessageReceived = function(channel, obj) {
			;;;LOG.finest(CLASS_NAME, "handleMessageReceived", obj);

			//check for blancing message
			if(channel._balanced > 1 /* || message.remaining() < 4 */) {
			    this._listener.binaryMessageReceived(channel, obj);
                return;
			}
            var message = decodeArrayBuffer(obj);
            if (message.charCodeAt(0) == 0xf0ff) {  // equals to "\uf0ff"
                //balance message received
                if (message.match("N$")) {
                    channel._balanced++;
                    if (channel._balanced == 1) {
                        //first balancer message received, raise connectionOpened with kaazing handshake protocol
                        this._listener.connectionOpened(channel, WebSocketHandshakeObject.KAAZING_EXTENDED_HANDSHAKE);
                    }
                    else {
                        //second balancer message received, raise connectionOpend with ""
                        this._listener.connectionOpened(channel, channel._acceptedProtocol || "");
                    }
                }
                else if (message.indexOf("R") == 1){
                    var redirectUri = new WSURI(message.substring(2));
                    handleRedirect(this, channel, redirectUri);
                }
                else {
                    //invalidate balancing message
                    ;;;LOG.warning(CLASS_NAME, "Invalidate balancing message: " + target);
                }
                return;
            }
            else {
                this._listener.binaryMessageReceived(channel, obj);
            }
		}

		$prototype.setNextHandler = function(nextHandler) {
			this._nextHandler = nextHandler;
			var listener = new WebSocketHandlerListener(this);
            var outer = this;
            listener.connectionOpened = function(channel, protocol) {
                //kaazing gateway, we will fire open event when first balancer message received
                if (WebSocketHandshakeObject.KAAZING_EXTENDED_HANDSHAKE != protocol) {
                    channel._balanced = 2;
                    outer._listener.connectionOpened(channel, protocol);
                }
            }
            listener.textMessageReceived = function(channel, message) {
			;;;LOG.finest(CLASS_NAME, "textMessageReceived", message);

			//check for blancing message
			if(channel._balanced > 1 /* || message.remaining() < 4 */) {
			    outer._listener.textMessageReceived(channel, message);
                return;
			}
            if (message.charCodeAt(0) == 0xf0ff) {  // equals to "\uf0ff"
                //balance message received
                if (message.match("N$")) {
                    channel._balanced++;
                    if (channel._balanced == 1) {
                        //first balancer message received, raise connectionOpened with kaazing handshake protocol
                        outer._listener.connectionOpened(channel, WebSocketHandshakeObject.KAAZING_EXTENDED_HANDSHAKE);
                    }
                    else {
                        //second balancer message received, raise connectionOpend with ""
                        outer._listener.connectionOpened(channel, "");
                    }
                }
                else if (message.indexOf("R") == 1){
                    var redirectUri = new WSURI(message.substring(2));
                    handleRedirect(outer, channel, redirectUri);
                }
                else {
                    //invalidate balancing message
                    ;;;LOG.warning(CLASS_NAME, "Invalidate balancing message: " + target);
                }
                return;
            }
            else {
                outer._listener.textMessageReceived(channel, message);
            }
            }
            listener.binaryMessageReceived = function(channel, obj) {
                outer.handleMessageReceived(channel, obj);
            }
            listener.connectionClosed = function(channel, wasClean, code, reason) {
               outer.handleConnectionClosed(channel, wasClean, code, reason);
            }
			nextHandler.setListener(listener);

		}

		$prototype.setListener = function(listener) {
			this._listener = listener;
		}

	return WebSocketNativeBalancingHandler;
})(Kaazing.Gateway)

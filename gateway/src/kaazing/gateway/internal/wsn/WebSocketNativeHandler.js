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
var WebSocketNativeHandler = (function() {
        ;;;var CLASS_NAME = "WebSocketNativeHandler";
        ;;;var LOG = Logger.getLogger(CLASS_NAME);
        
        var createAuthenticationHandler = function() {
            var handler = new WebSocketNativeAuthenticationHandler();
            return handler;
        }

		var createHandshakeHandler = function() {
			var handler = new WebSocketNativeHandshakeHandler();
			return handler;
		}

        var createControlFrameHandler = function() {
			var handler = new WebSocketControlFrameHandler();
			return handler;
		}
        
        var createNativeBalancingHandler = function() {
			var handler = new WebSocketNativeBalancingHandler();
			return handler;
		}

        var createDelegateHandler = function() {
            var handler = new WebSocketNativeDelegateHandler();
            return handler;
        }

        var createHixie76Handler = function() {
            var handler = new WebSocketHixie76FrameCodecHandler();
            return handler;
        }
        
        // True if the WebSocket native implementation matches the old API & Hixie draft 76
        var draft76compat = ((browser == "safari") && 
        		             ((typeof(window.Webscoket) !== "undefined") && 
        		              (typeof(window.WebSocket.CLOSING) === "undefined")));
		
        var _authHandler = createAuthenticationHandler();
        var _handshakeHandler = createHandshakeHandler();
		var _controlFrameHandler = createControlFrameHandler();
        var _balanceHandler = createNativeBalancingHandler();
        var _delegateHandler = createDelegateHandler();
        var _hixie76Handler = createHixie76Handler();
        var _extensionHandler = new WebSocketExtensionHandler();
        
        var WebSocketNativeHandler = function() {
            ;;;LOG.finest(CLASS_NAME, "<init>");
            if (draft76compat) {
            	this.setNextHandler(_hixie76Handler);
            	_hixie76Handler.setNextHandler(_authHandler);
            }
            else {
            	this.setNextHandler(_authHandler);
            }
            _authHandler.setNextHandler(_extensionHandler);

            // Parent handler is needed to setup handler pipeline of negotiated extensions
            // between _authHandler and _extensionHandler
            _extensionHandler.setParentHandler(_authHandler);
            _extensionHandler.setNextHandler(_handshakeHandler);
            _handshakeHandler.setNextHandler(_controlFrameHandler);
			_controlFrameHandler.setNextHandler(_balanceHandler);
            _balanceHandler.setNextHandler(_delegateHandler);
        };
		
        var handleConnectionOpened = function(channel, protocol) {
            ;;;LOG.finest(CLASS_NAME, "<init>");
        }
        
        var $prototype = WebSocketNativeHandler.prototype = new WebSocketHandlerAdapter();
        
		$prototype.setNextHandler = function(nextHandler) {
			this._nextHandler = nextHandler;
            var listener = new WebSocketHandlerListener(this);
			nextHandler.setListener(listener);
		}
		
		$prototype.setListener = function(listener) {
			this._listener = listener;
		}   
	return WebSocketNativeHandler;
})();

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
var WebSocketFlashEmulatedHandler = (function() {
        ;;;var CLASS_NAME = "WebSocketFlashEmulatedHandler";
        ;;;var LOG = Logger.getLogger(CLASS_NAME);
        
        var createAuthenticationHandler = function() {
            var handler = new WebSocketEmulatedAuthenticationHandler();
            return handler;
        }

		var createControlFrameHandler = function() {
			var handler = new WebSocketControlFrameHandler();
			return handler;
		}

        var createDelegateHandler = function() {
            var handler = new WebSocketFlashEmulatedDelegateHandler();
            return handler;
        }

        var _authHandler = createAuthenticationHandler();
		var _controlFrameHandler = createControlFrameHandler();

        var _delegateHandler = createDelegateHandler();
        
        var WebSocketFlashEmulatedHandler = function() {
            ;;;LOG.finest(CLASS_NAME, "<init>");
			this.setNextHandler(_authHandler);
            _authHandler.setNextHandler(_controlFrameHandler);
			_controlFrameHandler.setNextHandler(_delegateHandler);
        };
		
        var $prototype = WebSocketFlashEmulatedHandler.prototype = new WebSocketHandlerAdapter();
        
        $prototype.processConnect = function(channel, location, protocol) {
            //add x-kaazing-extension protocol
            var protocols = [WebSocketHandshakeObject.KAAZING_EXTENDED_HANDSHAKE];
            for (var i = 0; i < protocol.length; i++) {
            	protocols.push(protocol[i]);
            }
                        //add extensions header if there is enabled extensions
            var extensions = channel._extensions;
            if (extensions.length > 0) {
            	channel.requestHeaders.push(new URLRequestHeader(WebSocketHandshakeObject.HEADER_SEC_EXTENSIONS, extensions.join(";")));
            }
            this._nextHandler.processConnect(channel, location, protocols);
        }
        
        $prototype.setNextHandler = function(nextHandler) {
            this._nextHandler = nextHandler;
            var listener = new WebSocketHandlerListener(this);
            nextHandler.setListener(listener);
	}
		
	$prototype.setListener = function(listener) {
            this._listener = listener;
	}   
	return WebSocketFlashEmulatedHandler;
})();

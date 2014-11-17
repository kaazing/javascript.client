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
var WebSocketFlashRtmpDelegateHandler = (function() {
			;;;var CLASS_NAME = "WebSocketFlashRtmpDelegateHandler";
            ;;;var LOG = Logger.getLogger(CLASS_NAME);
            var $this;
        var WebSocketFlashRtmpDelegateHandler = function() {

            ;;;LOG.finest(CLASS_NAME, "<init>");
            $this = this;
		};
		
        var $prototype = WebSocketFlashRtmpDelegateHandler.prototype = new WebSocketHandlerAdapter();
        
		$prototype.processConnect = function(channel, uri, protocol) {
			;;;LOG.finest(CLASS_NAME, "connect", channel);
			if (channel.readyState == 2/*ReadyState.CLOSED*/) {
				throw new Error("WebSocket is already closed");
			}
			var delegate = new WebSocketRtmpFlashProxy();
			delegate.parent = channel;
			channel._delegate = delegate;
			setDelegate(delegate, this);
			delegate.connect(uri.toString(), protocol);
		}
		
		$prototype.processTextMessage = function(channel, text) {
			;;;LOG.finest(CLASS_NAME, "connect", channel);
			if (channel.readyState == 1/*ReadyState.OPEN*/) {
				channel._delegate.send(text);
			}
			else {
				throw new Error("WebSocket is already closed");
			}
		}
		$prototype.processBinaryMessage = function(channel, buffer) {
			;;;LOG.finest(CLASS_NAME, "connect", channel);
			if (channel.readyState == 1/*ReadyState.OPEN*/) {
				channel._delegate.send(buffer);
			}
			else {
				throw new Error("WebSocket is already closed");
			}
		}	 
		$prototype.processClose = function(channel, code, reason) {
			;;;LOG.finest(CLASS_NAME, "close", channel);
			channel._delegate.close(code, reason);
		}	 

		var setDelegate = function(nextHandler, $this) {
			var listener = new WebSocketHandlerListener($this);
            
            listener.redirected = function(channel, location) {
               //alert(CLASS_NAME + "redirected");
               //redirect is handled by WebSocketRtmp.as, here only save the redirec location in channel
               channel._redirectUri = location;
            }
            nextHandler.setListener(listener);
		}

	return WebSocketFlashRtmpDelegateHandler;
})();


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
var WebSocketChannel = (function() /* extends Channel*/ {

    var WebSocketChannel = function(location, protocol, isBinary) {
	        Channel.apply(this, arguments);
			this._location = location;
			this._protocol = protocol;
			this._extensions = [];   //client requested extensions
			this._controlFrames = {}; // control frame dictionary for text messages
			this._controlFramesBinary = {}; // control frame dictionary for binary messages
			this._escapeSequences = {};// leading bytes for inject message, we only inject text messages
			this._handshakePayload = ""; // = new ByteBuffer();
			this._isEscape = false;
            this._bufferedAmount = 0;
		};

		var $prototype = WebSocketChannel.prototype = new Channel(); //extends Channel

        $prototype.getBufferedAmount = function() {
            return this._bufferedAmount;
        }

		$prototype.toString = function() {
			return "[WebSocketChannel " + _location + " " + _protocol != null ? _protocol : "-" + "]";
		}

    return WebSocketChannel;
})();

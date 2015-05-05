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
var WSURI = (function() {
		
		var WSURI = function(location) {
            var uri = new URI(location);
			if(isValidScheme(uri.scheme)) {
                this._uri = uri;
				if (uri.port == undefined) {
					this._uri = new URI(WSURI.addDefaultPort(location));
				}
			}
			else {
				throw new Error("WSURI - invalid scheme: " + location);
			}
		};
		
		function isValidScheme(scheme) {
			return "ws" ==scheme || "wss" ==scheme;
		}
		
        function duplicate(uri) {
			try {
				return new WSURI(uri);
			} catch (e) {
				throw e;
			}
			return null;
		}
        
        var $prototype = WSURI.prototype;
		
		$prototype.getAuthority = function() {
			return this._uri.authority;
		}
		
		$prototype.isSecure = function() {
			return  "wss" == this._uri.scheme;
		}
		
		$prototype.getHttpEquivalentScheme = function() {
			return this.isSecure() ? "https" : "http";
		}
		
		$prototype.toString = function() {
			return this._uri.toString();
		}

		var DEFAULT_WS_PORT = 80;
		var DEFAULT_WSS_PORT = 443;
		
        WSURI.setDefaultPort = function(uri) {
            if (uri.port == 0) {
				if (uri.scheme == "ws") {
					uri.port = DEFAULT_WS_PORT;
				}
				else if (uri.scheme == "wss") {
					uri.port = DEFAULT_WSS_PORT;
				}
				else if (uri.scheme == "http") {
					uri.port = 80;
				}
				else if (uri.schemel == "https") {
					uri.port = 443;
				}
				else {
					throw new Error("Unknown protocol: "+ uri.scheme);
				}
                uri.authority = uri.host + ":" + uri.port;
			}
		}
        
		WSURI.addDefaultPort = function(location) {
            var uri = new URI(location);
			if(uri.port == undefined) {
				WSURI.setDefaultPort(uri);
            }
			return uri.toString();
		}
        
        WSURI.replaceScheme = function(location, scheme) {
			var uri = URI.replaceProtocol(location, scheme)
			return new WSURI(uri);
		}
		
        return WSURI;
	})();


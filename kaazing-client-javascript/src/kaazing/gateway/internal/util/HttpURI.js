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
var HttpURI = (function() {
        
		var HttpURI = function(location) /*throws URISyntaxException*/ {
            var uri = new URI(location);
			if(isValidScheme(uri.scheme)) {
				this._uri = uri;
			}
			else {
				throw new Error("HttpURI - invalid scheme: " + location);
			}
		};
		
        function isValidScheme(scheme) {
			return "http" == scheme || "https" == scheme;
		}
		
        var $prototype = HttpURI.prototype;
        
		$prototype.getURI = function() {
			return this._uri;
		}
		
		$prototype.duplicate = function(uri) {
			try {
				return new HttpURI(uri);
			}
			catch (e) {
				throw e;
			}
			return null;
		}
		
		$prototype.isSecure = function() {
			return ("https" == this._uri.scheme);
		}
		
        $prototype.toString = function() {
			return this._uri.toString();
		}
		
        HttpURI.replaceScheme = function(location, scheme) {
			var uri = URI.replaceProtocol(location, scheme)
			return new HttpURI(uri);
		}
	return HttpURI;
})();

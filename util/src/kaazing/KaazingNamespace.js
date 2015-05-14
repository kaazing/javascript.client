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
// Root Namespace Object
var Kaazing = Kaazing || {};

if (typeof Kaazing.namespace !== "function") {
    // The implementation is nondestructive i.e. if a namespace exists, it won't be created.
	Kaazing.namespace = function(namespace_string) {
	    var parts = namespace_string.split('.');
	    var parent = Kaazing;
	    
	    // strip redundant leading global
	    if (parts[0] === "Kaazing") {
	        parts = parts.slice(1);
	    }
	    
	    for (var i = 0; i < parts.length; i++) {
	        // create a property if it does not exist
	        if (typeof parent[parts[i]] === "undefined") {
	            parent[parts[i]] = {};
	        }
	        parent = parent[parts[i]];
	    }
	    
	    return parent;
	}
}

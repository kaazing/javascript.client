/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
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

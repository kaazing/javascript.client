/**
 * Copyright (c) 2007-2013, Kaazing Corporation. All rights reserved.
 */

/**
 * @private
 */
// Root Namespace Object
var Org = Org || {};

if (Org.namespace !== "function") {
    // The implementation is nondestructive i.e. if a namespace exists, it won't be created.
	Org.namespace = function(namespace_string) {
	    var parts = namespace_string.split('.'), 
	    parent = Org, 
	    i;
	    
	    // strip redundant leading global
	    if (parts[0] === Org) {
	        parts = parts.slice(1);
	    }
	    
	    for (i = 0; i < parts.length; i++) {
	        // create a property if it does not exist
	        if (typeof parent[parts[i]] === "undefined") {
	            parent[parts[i]] = {};
	        }
	        parent = parent[parts[i]];
	    }
	    
	    return parent;
	}
}

Org.Kaazing = Org.namespace("Kaazing");
 

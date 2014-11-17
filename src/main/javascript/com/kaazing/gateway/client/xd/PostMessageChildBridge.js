/**
 * Copyright (c) 2007-2013, Kaazing Corporation. All rights reserved.
 */

(function() {
    var parentBridge;

    function pollHash() {
    	// IE6 cannot access window.location after document.domain is assigned, use document.URL instead
        var locationURI = new URI((browser == "ie") ? document.URL : location.href);
        var defaultPorts = { "http":80, "https":443 };
        if (locationURI.port == null) {
        	locationURI.port = defaultPorts[locationURI.scheme];
        	locationURI.authority = locationURI.host + ":" + locationURI.port;
        }

        if ((locationURI.fragment || "").length == 0) {
        	setTimeout(pollHash, 20);
        	return;
        }

        var locationHash = unescape(locationURI.fragment);
        var locationHashParts = locationHash.split(",");
        var sourceOrigin = locationHashParts.shift();
        var sourceToken = locationHashParts.shift();
        var sourceBridgeURL = unescape(locationHashParts.shift());
        var targetOrigin = locationURI.scheme + "://" + locationURI.authority;

        sourceBridge = parent;

        // avoid IE clicking
        if (typeof(ActiveXObject) != "undefined") {
            // sourceBridge is an "htmlfile" ActiveXObject, 
        	// use opener property to reach containing sourceBridge iframe
        	// Note: this alleviates the need for window.open(), avoiding popup blocker issues
            sourceBridge = sourceBridge.opener;
        }

        var target = sourceBridge.parent;

        try {
    		// Note: must test target.location.hash to handle same, explicit document.domain case
            target.location.hash;
        } catch (domainError) {
            // TODO walk
            document.domain = document.domain;
            try {
            	// some versions of IE6 spuriously causes document domains to mismatch when 
            	// they should not therefore, perform a reload to try again
            	target.location.hash;
            }
            catch (accessDenied) {
            	location.reload();
            	return;
            }
        }

        var postMessage0 = target.postMessage0;
        if (typeof(postMessage0) != "undefined") {
            setTimeout(function() {
                postMessage0.attach(target.parent, sourceOrigin, sourceToken, window, parent, sourceBridgeURL);
            }, 0);
        }
    };

	window.onload = pollHash;
	
    window.onunload = function() {
        if (sourceBridge != undefined) {
            var target = sourceBridge.parent;
            try {
                var postMessage0 = target.postMessage0;
                if (typeof(postMessage0) != "undefined") {
                    postMessage0.detach(target.parent);
                }
            }
            catch (domainError) {
                // this can safely be ignored as it is triggered during
                // pre-emptive unload, or when self-signed certificates are
                // interactively trusted by the end-user, causing a page reload
            }
        }
    };
})();

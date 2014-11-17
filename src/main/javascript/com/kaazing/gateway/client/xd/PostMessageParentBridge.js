/**
 * Copyright (c) 2007-2013, Kaazing Corporation. All rights reserved.
 */

(function() {
   var explicitDocumentDomain = false;

    window.onload = function() {
        // IE6 cannot access window.location after document.domain is assigned, use document.URL instead
        var locationURI = new URI((browser == "ie") ? document.URL : location.href);
        var defaultPorts = { "http":80, "https":443 };
        if (locationURI.port == null) {
            locationURI.port = defaultPorts[locationURI.scheme];
            locationURI.authority = locationURI.host + ":" + locationURI.port;
        }

        // If the frame cannot read the location of a frame known to be in
        // the same domain, then the document.domain must be set explicitly.
        try {
            var ownerLocation = parent.parent.location.href;
            // Safari returns undefined rather than throwing an exception
            // when document.domain does not match correctly
            if (typeof(ownerLocation) === "undefined") {
                throw new Error("Access discouraged");
            }
        } catch (domainError) {
            var parts = document.domain.split(".");
            do  {
                try {
                    if (typeof(CollectGarbage) !== "undefined") {
                        CollectGarbage();
                    }
                    document.domain = parts.join(".");
                    explicitDocumentDomain = document.domain;
                    var ownerLocation = parent.parent.location.href;
                    // Safari returns undefined rather than throwing an exception
                    // when document.domain does not match correctly
                    if (typeof(ownerLocation) === "undefined") {
                        throw new Error("Access discouraged");
                    }
                    break;
                } catch (accessDenied) {
                }
            } while (parts.shift());
            
            // If the parent domain (grandparent frame) completely mismatches the
            // parent resources domain, try again.
            if (parts.length === 0) {
                // IE6 spuriously causes document domains to mismatch when they should not
                throw new Error("PostMessage0 document domain mismatch");
            }
        }

        window.parent.parent.postMessage0.__init__(window, explicitDocumentDomain)
    }



})();

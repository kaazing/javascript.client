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


// This closure ends in the kickstart files
(function() {

var ___Loader = function(BASE_NAME) {
    var self = this;

    // Now using a longer timeout (3s) as Firefox fails too quickly
    // Flash loads properly when loading is completed, even if flash:wse
    // connections have already started processing
    var FLASH_LOAD_TIMEOUT = 3000;
    var ID = "Loader"; // needed by IE to reaquire live element?

    var ie = false;
    var flash_timer = -1;
    self.elt = null;

    /*
     * URL detection from included scripts (relative or absolute) 
     */
    var getBaseUrl = function() {
        var exp = new RegExp(".*" + BASE_NAME + ".*.js$");
        var scripts = document.getElementsByTagName("script");
        for (var i=0; i<scripts.length; i++) {
            if (scripts[i].src) {
                var name = (scripts[i].src).match(exp);
                if (name) {
                    name = name.pop();
                    var parts = name.split("/");

                    // remove script name
                    parts.pop();

		    if (parts.length > 0) {
                        // both relative and absolute urls taken from the
                        // script.src will be valid src attributes for the new
                        // script elements created to fetch the impl javascript
                        // and flash
                        return parts.join("/") + "/";
		    }
                    else {
                        // Relative from current location (same directory)
                        return "";
                    }
                }
            }
        }
    };

    var baseUrl = getBaseUrl();
    var SWF_URL = baseUrl + "Loader.swf";

    // Flash detection, injection, and handshake all starts here.
    // The loader checks if 1) there is a meta tag for kaazing:upgrade content="none"
    // or 2) there is no flash player version 9 or greater available. If either
    // of these is true, the flash loading is skipped and the JavaScript fallback
    // occurs immediately.
    self.loader = function() {
        var upgrade = "flash";
        var tags = document.getElementsByTagName("meta");
        for(var i=0; i < tags.length; i++) {
            if (tags[i].name === "kaazing:upgrade") {
                upgrade = tags[i].content;
            }
        }
        // Detect flash player plugin and browser family
        if (upgrade != "flash" || !hasMinimumFlashVersion([9,0,115])) {
            failFlash();
        } else {
            flash_timer = setTimeout(failFlash, FLASH_LOAD_TIMEOUT);
            inject_flash();
        }
    };

    // clearFlashTimer is called by flash to cancel the fallback timer
    self.clearFlashTimer = function() {
        clearTimeout(flash_timer);
        flash_timer = "cleared";

        // without setTimeout, we are creating a cycle back into Flash plugin
        // which causes a problem on Internet Explorer
        setTimeout(function() {
            startFlash(self.elt.handshake(BASE_NAME));
        }, 0);
    };
    
    var startFlash = function(handshakeToken) {
        if (handshakeToken) {
            WebSocketEmulatedFlashProxy._flashBridge.flashHasLoaded = true;
            WebSocketEmulatedFlashProxy._flashBridge.elt = self.elt;
            // alert waiting sockets that the flash impl has loaded
            WebSocketEmulatedFlashProxy._flashBridge.onready();
        } else {
            failFlash();
        }

        window.___Loader = undefined;
    }

    var failFlash = function() {
        WebSocketEmulatedFlashProxy._flashBridge.flashHasLoaded = true;
        WebSocketEmulatedFlashProxy._flashBridge.flashHasFailed = true;
        // alert waiting sockets that the flash impl has failed to load
        WebSocketEmulatedFlashProxy._flashBridge.onfail();
    }

    var detectFlashVersion = function() {
        var version = null;

        // ie looks something like this:
        // "WIN 9,0,124,0"
        if (typeof(ActiveXObject) != "undefined") {
                try {
                    ie = true;
                    var swf = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
                    var version_string = swf.GetVariable("$version");
                    // TODO: use match (below also)
                    var versionArray = version_string.split(" ")[1].split(",");
                    version = [];
                    for (var i=0; i < versionArray.length; i++) {
                        version[i] = parseInt(versionArray[i]);
                    }
                } catch (e) {
                    ie = false;
                }
            }
            
        // On other browsers it looks like this:
        // "Shockwave Flash 9.0 r124"
        if (typeof navigator.plugins != "undefined") {
            if (typeof navigator.plugins["Shockwave Flash"] != "undefined") {
                var version_string = navigator.plugins["Shockwave Flash"].description;
                version_string = version_string.replace(/\s*r/g, ".");
                    var versionArray = version_string.split(" ")[2].split(".");
                    version = [];
                    for (var i=0; i < versionArray.length; i++) {
                        version[i] = parseInt(versionArray[i]);
                    }
            }
        }

        // Prevent Vista + Flash 10.0 freezing behavior
        // http://www.adobe.com/cfusion/webforums/forum/messageview.cfm?forumid=44&catid=184&threadid=1401765&enterthread=y
        // The above link is no longer available, but several threads online still refer to it.
        var userAgent = navigator.userAgent;
        if (version !== null && version[0] === 10 && version[1] === 0 && userAgent.indexOf("Windows NT 6.0") !== -1) {
            version = null;
        }

        // null out flash version except on for IE6 and 7
//        if (userAgent.indexOf("MSIE 6.0") == -1 && userAgent.indexOf("MSIE 7.0") == -1) {
//            version = null;
//        }

        return version;
    };

    var hasMinimumFlashVersion = function(minimumVersion) {
        var flashVersion = detectFlashVersion();
        
        // not installed
        if (flashVersion == null) {
                return false;
        }
        
        for (var i=0; i < Math.max(flashVersion.length, minimumVersion.length); i++) {
                var difference = flashVersion[i] - minimumVersion[i];
                if (difference != 0) {
                        return (difference > 0) ? true : false;
                }
        }

        // exact match
        return true;
    }
    
    var inject_flash = function() {
        if (ie) {
            var elt = document.createElement("div");
            // IE requires a live element to be replaced
            document.body.appendChild(elt);
            // Inject object tag and params including ActiveX classid
            elt.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" height="0" width="0" id="' + ID + '"><param name="movie" value="'+SWF_URL+'"></param></object>';
            self.elt = document.getElementById(ID);
        } else {
            var elt = document.createElement("object");
            elt.setAttribute("type", "application/x-shockwave-flash");
            elt.setAttribute("width", 0);
            elt.setAttribute("height", 0);
            elt.setAttribute("id", ID);
            elt.setAttribute("data", SWF_URL);

            document.body.appendChild(elt);
            self.elt = elt;
        }
    };

    self.attachToOnload = function(handler) {
        if (window.addEventListener) {
            window.addEventListener("load", handler, true);
        } else if (window.attachEvent) {
            window.attachEvent("onload", handler);
        } else {
            onload = handler;
        }
    };

    // Detect if document already loaded using HTML5 readyState
    // Otherwise loader is not called, for example in JS Test Framework
    if (document.readyState === "complete") {
        self.loader();
    }
    else {
        // Start this loader on page load
        self.attachToOnload(self.loader);
    }
};


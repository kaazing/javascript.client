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
 * @ignore
 */
var XMLHttpBridge = (function () {
    /*
     //
     // The emulation of cross-origin XMLHttpRequest uses postMessage.
     //
     // Each message is of the form opcode [hex(int-id) [ parameters... ]], for example:
     //
     //    - init -
     //    --> "I"
     //
     //    - send -
     //    --> "s" 00000001 4 "POST" 0029 "http://gateway.example.com:8000/stomp"
     //            0001 000b "Content-Type" 000a "text/plain" 0000000c "Hello, world" 0005 t|f]
     //
     //    - abort -
     //    --> "a" 00000001
     //
     //    - delete -
     //    --> "d" 00000001
     //
     //    - readystate -
     //    <-- "r" 00000001 01 000b "Content-Type" 000a "text/plain" 00c2 02 "OK"
     //
     //    - progress -
     //    <-- "p" 00000001 3 0000000c "Hello, world"
     //
     //    - error -
     //    <-- "e" 00000001
     //
     //    - timeout -
     //    <-- "t" 00000001
     //
     */
    // IE6 cannot access window.location after document.domain is assigned, use document.URL instead
    var locationURI = new URI((browser == "ie") ? document.URL : location.href);
    var defaultPorts = {"http": 80, "https": 443};
    if (locationURI.port == null) {
        locationURI.port = defaultPorts[locationURI.scheme];
        locationURI.authority = locationURI.host + ":" + locationURI.port;
    }

    var pipes = {};
    var registry = {};
    var nextId = 0;

    //Creates a new XMLHttpRequest0 instance.
    function XMLHttpBridge(outer) {
        // TODO implement Agent capabilities instead of browser checks
        // detect IE8 or higher

        // KG-2454: disable native XHR, use bridge to send out request
        // Note: IE10 reports as "chrome"
        this.outer = outer;
    }

    var $prototype = XMLHttpBridge.prototype;

    $prototype.open = function (method, location) {

        // attach this instance to the pipe
        var id = register(this);
        var pipe = supplyPipe(this, location);
        pipe.attach(id);

        this._pipe = pipe;
        this._method = method;
        this._location = location;
        this.outer.readyState = 1;

        // reset properties
        // in case of reuse        
        this.outer.status = 0;
        this.outer.statusText = "";
        this.outer.responseText = "";

        // allow handler to be assigned after open completes
        var $this = this;
        setTimeout(function () {
            $this.outer.readyState = 1; // opened
            onreadystatechange($this);
        }, 0);
    }

    $prototype.send = function (payload) {
        doSend(this, payload);
    }

    $prototype.abort = function () {
        var pipe = this._pipe;
        if (pipe !== undefined) {
            //    - abort -
            //    --> "a" 00000001
            pipe.post(["a", this._id].join(""));
            pipe.detach(this._id);
        }
    }

    function onreadystatechange($this) {
        if (typeof($this.onreadystatechange) !== "undefined") {
            $this.onreadystatechange($this.outer);
        }

        switch ($this.outer.readyState) {
            case 3:
                if (typeof($this.onprogress) !== "undefined") {
                    $this.onprogress($this.outer);
                }
                break;
            case 4:
                if ($this.outer.status < 100 || $this.outer.status >= 500) {
                    if (typeof($this.onerror) !== "undefined") {
                        $this.onerror($this.outer);
                    }
                }
                else {
                    if (typeof($this.onprogress) !== "undefined") {
                        $this.onprogress($this.outer);
                    }
                    if (typeof($this.onload) !== "undefined") {
                        $this.onload($this.outer);
                    }
                }
                break;
        }
    }

    function fromHex(formatted) {
        return parseInt(formatted, 16);
    }

    function toPaddedHex(value, width) {
        var hex = value.toString(16);
        var parts = [];
        width -= hex.length;
        while (width-- > 0) {
            parts.push("0");
        }
        parts.push(hex);
        return parts.join("");
    }

    function register($this) {
        var id = toPaddedHex(nextId++, 8);
        registry[id] = $this;
        $this._id = id;
        return id;
    }

    function doSend($this, payload) {

        // sending null causes FF not to send any Content-Length header
        // which Squid rejects with status 411 Content-Length Required
        if (typeof(payload) !== "string") {
            payload = "";
        }

        //    - send -
        //    --> "s" 00000001 4 "POST" 0029 "http://gateway.example.com:8000/stomp" 
        //            0001 000b "Content-Type" 000a "text/plain" 0000000c "Hello, world" 0005 t|f]

        var method = $this._method.substring(0, 10); // single digit length
        var location = $this._location;
        var requestHeaders = $this.outer._requestHeaders;
        var timeout = toPaddedHex($this.outer.timeout, 4);
        var streaming = ($this.outer.onprogress !== undefined) ? "t" : "f";

        var message = ["s", $this._id, method.length, method, toPaddedHex(location.length, 4), location, toPaddedHex(requestHeaders.length, 4)];
        for (var i = 0; i < requestHeaders.length; i++) {
            var requestHeader = requestHeaders[i];
            message.push(toPaddedHex(requestHeader[0].length, 4));
            message.push(requestHeader[0]);
            message.push(toPaddedHex(requestHeader[1].length, 4));
            message.push(requestHeader[1]);
        }

        message.push(toPaddedHex(payload.length, 8), payload, toPaddedHex(timeout, 4), streaming);

        // schedule post after readyState 2, as pipe.post can schedule readyState 4 (error condition)        
        $this._pipe.post(message.join(""));
    }

    // Fetch the pipe for the target origin of the location specified.
    function supplyPipe($this, location) {
        var uri = new URI(location);
        var hasTargetOrigin = (uri.scheme != null && uri.authority != null);
        var targetScheme = hasTargetOrigin ? uri.scheme : locationURI.scheme;
        var targetAuthority = hasTargetOrigin ? uri.authority : locationURI.authority;
        if (targetAuthority != null && uri.port == null) {
            targetAuthority = uri.host + ":" + defaultPorts[targetScheme];
        }
        var targetOrigin = targetScheme + "://" + targetAuthority;

        // IE8 "converts" the iframe contentWindow to type "unknown"
        // under certain conditions (including in jsTestFramework)
        var pipe = pipes[targetOrigin];
        if (pipe !== undefined) {
            if (!("iframe" in pipe &&
                "contentWindow" in pipe.iframe &&
                typeof pipe.iframe.contentWindow == 'object')) {
                pipe = pipes[targetOrigin] = undefined;
            }
        }

        if (pipe === undefined) {
            var iframe = document.createElement("iframe");
            iframe.style.position = "absolute";
            iframe.style.left = "-10px";
            iframe.style.top = "10px";
            iframe.style.visibility = "hidden";
            iframe.style.width = "0px";
            iframe.style.height = "0px";

            var bridgeURI = new URI(targetOrigin);
            bridgeURI.query = ".kr=xs";  // cross-site bridge
            bridgeURI.path = "/";
            iframe.src = bridgeURI.toString();

            function post(message) {
                this.buffer.push(message);
            }

            function attach(id) {
                // lookup previously attached entry
                var entry = this.attached[id];

                // attach new entry if necessary 
                if (entry === undefined) {
                    entry = {};
                    this.attached[id] = entry;
                }

                // cancel entry cleanup if necessary
                if (entry.timerID !== undefined) {
                    clearTimeout(entry.timerID);
                    delete entry.timerID;
                }
            }

            function detach(id) {
                // lookup previously attached entry
                var entry = this.attached[id];

                // schedule entry cleanup if necessary
                if (entry !== undefined && entry.timerID === undefined) {
                    var $this = this;
                    entry.timerID = setTimeout(function () {
                        // detach entry
                        delete $this.attached[id];

                        // unregister xhr, unless reused by different pipe
                        // this occurs if xhr opens a subsequent request
                        // to a different target origin
                        var xhr = registry[id];
                        if (xhr._pipe == pipe) {
                            delete registry[id];
                            delete xhr._id;
                            delete xhr._pipe;
                        }

                        // send message to cleanup delegate instance
                        // Note: do not use $this.post in case pipe has changed
                        //    - delete -
                        //    --> "d" 00000001
                        postMessage0(pipe.iframe.contentWindow, ["d", id].join(""), pipe.targetOrigin);
                    }, 0);
                }
            }

            pipe = {
                'targetOrigin': targetOrigin,
                'iframe': iframe,
                'buffer': [],
                'post': post,
                'attach': attach,
                'detach': detach,
                'attached': {count: 0}
            };
            pipes[targetOrigin] = pipe;

            // initialize postMessage from parent
            function sendInitWhenReady() {
                var targetWindow = iframe.contentWindow;
                if (!targetWindow) {
                    setTimeout(sendInitWhenReady, 20);
                }
                else {
                    postMessage0(targetWindow, "I", targetOrigin);
                }
            }

            // 30 sec timeout for cross-origin iframe wrapper initialization
            // TODO: cancel timerID when "I" arrives from embedded iframe
            pipe.handshakeID = setTimeout(function () {
                // when timeout occurs, then clearing previously associated
                // targetOrigin pipe because we cannot wait for success to
                // associate the targetOrigin pipe, otherwise 2 parallel requests
                // in-flight could have different pipes for same targetOrigin
                // and we require them to have the same pipe for the same targetOrigin
                pipes[targetOrigin] = undefined;
                pipe.post = function (message) {
                    // pipe.post will first be called
                    // when XMLHttpRequest0.send() is called
                    // triggering the onerror callback
                    $this.readyState = 4; // loaded
                    $this.status = 0; // error
                    onreadystatechange($this);
                }
                // if already attempting to send,
                // then trigger onerror callback
                if (pipe.buffer.length > 0) {
                    pipe.post();
                }
            }, 30000);

            // append the iframe to trigger the HTTP request
            // successful handshake will receive "I" message from iframe
            document.body.appendChild(iframe);

            // delay calling until after iframe appended, otherwise
            // this produces a general error on IE.
            // Browsers implementing postMessage natively do not require
            // Init to be sent (special case Chrome only for now).
            if (typeof(postMessage) === "undefined") {
                sendInitWhenReady();
            }
        }

        return pipe;
    }

    function onmessage(event) {
        var origin = event.origin;
        var defaultPorts = {"http": ":80", "https": ":443"};
        var originParts = origin.split(":");
        if (originParts.length === 2) {
            origin += defaultPorts[originParts[0]];
        }
        var pipe = pipes[origin];

        if (pipe !== undefined && pipe.iframe !== undefined && event.source == pipe.iframe.contentWindow) {
            if (event.data == "I") {
                // now that cross-domain pipeline has been established,
                // clear the handshake timer, flush buffered messages and update post function
                clearTimeout(pipe.handshakeID);
                var message;
                while ((message = pipe.buffer.shift()) !== undefined) {
                    postMessage0(pipe.iframe.contentWindow, message, pipe.targetOrigin);
                }
                pipe.post = function (message) {
                    postMessage0(pipe.iframe.contentWindow, message, pipe.targetOrigin);
                }
            }
            else {
                var message = event.data;
                if (message.length >= 9) {
                    var position = 0;
                    var type = message.substring(position, position += 1);
                    var id = message.substring(position, position += 8);
                    var xmlHttp = registry[id];
                    if (xmlHttp !== undefined) {
                        switch (type) {
                            case "r":
                                /*    - readystate -
                                 //    <-- "r" 00000001 01 000b "Content-Type" 000a "text/plain" 00c2 02 "OK"
                                 */
                                var responseHeaders = {};
                                var responseHeaderCount = fromHex(message.substring(position, position += 2));
                                for (var i = 0; i < responseHeaderCount; i++) {
                                    var labelSize = fromHex(message.substring(position, position += 4));
                                    var label = message.substring(position, position += labelSize);
                                    var valueSize = fromHex(message.substring(position, position += 4));
                                    var value = message.substring(position, position += valueSize);
                                    responseHeaders[label] = value;
                                }

                                var status = fromHex(message.substring(position, position += 4));
                                var statusTextSize = fromHex(message.substring(position, position += 2));
                                var statusText = message.substring(position, position += statusTextSize);

                                switch (status) {
                                    case 301:
                                    case 302:
                                    case 307:
                                        var redirectURI = responseHeaders["Location"];
                                        var originalURI = event.origin;

                                        // If redirect policy is supported then onredirectallowed handler
                                        // will be setup. And, we will use it to determine if the redirect
                                        // is legal based on the specified policy. If redirect policy is
                                        // not supported, then we just continue to do what we always did.
                                        if (typeof(xmlHttp.outer.onredirectallowed) === "function") {
                                            if (!xmlHttp.outer.onredirectallowed(originalURI, redirectURI)) {
                                                // Cannot redirect. Error message must have been reported
                                                // in the appropriate layer(WS or SSE) above the transport.
                                                return;
                                            }
                                        }

                                        var id = register(xmlHttp);
                                        var pipe = supplyPipe(xmlHttp, redirectURI);
                                        pipe.attach(id);
                                        xmlHttp._pipe = pipe;
                                        xmlHttp._method = "GET";
                                        xmlHttp._location = redirectURI;
                                        xmlHttp._redirect = true;
                                        break
                                    case 403:
                                        // trigger callback handler
                                        xmlHttp.outer.status = status;
                                        onreadystatechange(xmlHttp);
                                        break;
                                    default:
                                        xmlHttp.outer._responseHeaders = responseHeaders;
                                        xmlHttp.outer.status = status;
                                        xmlHttp.outer.statusText = statusText;
                                        break;
                                }

                                break;
                            case "p":
                                /*
                                 //    - progress -
                                 //    <-- "p" 00000001 3 0000000c "Hello, world"
                                 */

                                // update the readyState
                                var readyState = parseInt(message.substring(position, position += 1));

                                if (xmlHttp._id === id) {
                                    xmlHttp.outer.readyState = readyState;

                                    // handle case where response text includes separator character
                                    var responseChunkSize = fromHex(message.substring(position, position += 8));
                                    var responseChunk = message.substring(position, position += responseChunkSize);
                                    if (responseChunk.length > 0) {
                                        xmlHttp.outer.responseText += responseChunk;
                                    }

                                    // trigger callback handler
                                    onreadystatechange(xmlHttp);
                                }
                                else if (xmlHttp._redirect) {
                                    xmlHttp._redirect = false;
                                    doSend(xmlHttp, "");
                                }

                                // detach from pipe
                                if (readyState == 4) {
                                    pipe.detach(id);
                                }
                                break;
                            case "e":
                                /*    - error -
                                 //    <-- "e" 00000001
                                 */
                                if (xmlHttp._id === id) {
                                    // reset status
                                    xmlHttp.outer.status = 0;
                                    xmlHttp.outer.statusText = "";

                                    // complete readyState
                                    xmlHttp.outer.readyState = 4;

                                    // trigger callback handler
                                    onreadystatechange(xmlHttp);
                                }

                                // detach from pipe
                                pipe.detach(id);
                                break;
                            case "t":
                                /*    - timeout -
                                 //    <-- "t" 00000001
                                 */
                                if (xmlHttp._id === id) {
                                    // reset status
                                    xmlHttp.outer.status = 0;
                                    xmlHttp.outer.statusText = "";

                                    // complete readyState
                                    xmlHttp.outer.readyState = 4;

                                    // trigger callback handler
                                    if (typeof(xmlHttp.ontimeout) !== "undefined") {
                                        xmlHttp.ontimeout();
                                    }
                                }

                                // detach from pipe
                                pipe.detach(id);
                                break;
                        }
                    }
                }
            }
        } else {
            //throw new Error("Could not perform x-domain XHR emulation: message pipe not found");
        }
    }


    // attach message processing
    window.addEventListener("message", onmessage, false);

    return XMLHttpBridge;
})();

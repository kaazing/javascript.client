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


var coverNativeSSE = true;
if (coverNativeSSE || typeof(window.EventSource) === "undefined") {
    var EventSource = (function() {
        /**
         * Creates a new EventSource instance and connects to the stream location.
         *
         * @param {String} location      the stream location
         *
         * @constructor
         * @name EventSource
         * 
         * @class  EventSource provides a text-based stream abstraction for JavaScript.
         */
        function EventSource(location) {
            this.lastEventId = null;
            this.immediate = false;
            this.retry = 3000;  // default retry to 3s
            
            // determine event source origin
            var locationURI = new URI(location);
            var defaultPorts = { "http":80, "https":443 };
            if (locationURI.port == null) {
                locationURI.port = defaultPorts[locationURI.scheme];
                locationURI.authority = locationURI.host + ":" + locationURI.port;
            }
            this.origin = locationURI.scheme + "://" + locationURI.authority;
            
            this.location = location;
            this.lineQueue = [];
            
            this.xhr = null;
            this.reconnectTimer = null;
            
            // allow onopen to be assigned before triggering
            var $this = this;
            setTimeout(function() { _connect($this, false) }, 0);
        }
        
        var $prototype = EventSource.prototype;
        
        /**
         * The ready state indicates the stream status, 
         * Possible values are 0 (CONNECTING), 1 (OPEN) and 2 (CLOSED)
         *
         * @public
         * @field
         * @name readyState
         * @type Number
         * @memberOf EventSource
         */
        $prototype.readyState = 0;

        /**
         * The onopen handler is called when the stream is established.
         *
         * @public
         * @field
         * @name onopen
         * @type Function
         * @memberOf EventSource
         */
        $prototype.onopen = function() {};
        
        /**
         * The onmessage handler is called when data arrives.
         *
         * @public
         * @field
         * @name onmessage
         * @type Function
         * @memberOf EventSource
         */
        $prototype.onmessage = function(event) {};

        /**
         * The onerror handler is called when the stream has a network or server error.
         *
         * @public
         * @field
         * @name onerror
         * @type Function
         * @memberOf EventSource
         */
        $prototype.onerror = function() {};

        /**
         * Disconnects the stream.
         *
         * @return {void}
         *
         * @public
         * @function
         * @name disconnect
         * @memberOf EventSource
         */
        $prototype.disconnect = function() {
            // disconnect only if not already disconnected
            if (this.readyState !== 2) {
                _disconnect(this);
            }
        };
        
        function _connect($this, immediate, queryParams) {
            // ensure reconnect timer is null
            if ($this.reconnectTimer !== null) {
                $this.reconnectTimer = null;
            }
            
            // construct XDR destination
            var connectURI = new URI($this.location);
            if (queryParams === undefined){ 
                queryParams = [];
            }
            if ($this.lastEventId !== null) {
                queryParams.push(".ka=" + this.lastEventId);
            }
            
            // check for existing threshold
            if ($this.location.indexOf("&.kb=") === -1 && $this.location.indexOf("?.kb=") === -1) {
                queryParams.push(".kb=512");  // stream threshold in KB
            }
                
            switch (browser) {
            case 'ie':
            case 'safari':
                // TODO: "safari" seems to work without the padding, 
                //       but might only be for recent versions
                queryParams.push(".kp=256");  // stream padding in bytes
                break;
            case 'firefox':
                queryParams.push(".kp=1025");  // stream padding in bytes
                
                // FF will not open multiple "GET" streams to the same URI
                queryParams.push(String(Math.random()).substring(2));
                break;

            case 'android':
                // Android requires 4K buffer to start (on 2.2.1), 
                // plus 4K buffer to be filled since previous message
                queryParams.push(".kp=4096");  // "initial padding" in bytes
                queryParams.push(".kbp=4096"); // "block padding" in bytes
                break;
            }
           
            if (queryParams.length > 0) {
                if (connectURI.query === undefined) {
                   connectURI.query = queryParams.join("&");
                }
                else {
                   connectURI.query += "&" + queryParams.join("&");
                }
            }

            // initialize CS-XHR (FF3.5 cannot reuse CS-XHRs)
            var xhr = $this.xhr = new XMLHttpRequest0();
            var progress = { "xhr":xhr, "position":0 };
    
            // attach listeners and send request
            // if in proxy mode and not secure, don't attach progress handler
            // this prevents use of iframe for IE, allowing us to detect timeout
            if ($this.location.indexOf(".ki=p") == -1 || $this.location.indexOf("https://") == 0) {
                xhr.onprogress = function() { 
                    // FF 3.5 updates responseText after onprogress
                    setTimeout(function() {_process($this, progress); }, 0);
                };
            }

            xhr.onload = function() { 
                _process($this, progress);
                if ($this.xhr == progress.xhr && $this.readyState != 2) { // CLOSED
                    _reconnect($this);
                }
            };
            xhr.onerror = function() {
                if ($this.readyState != 2) { // CLOSED
                    _disconnect($this);
                    _error($this);
                   }
            };
            xhr.ontimeout = function() { 
                if ($this.readyState != 2) { // CLOSED
                    _disconnect($this);
                    _error($this);
                   }
            };
            xhr.onreadystatechange = function() {
                if (!immediate) {
                    if (xhr.readyState >= 3) {
                        $this.readyState = 1; // OPEN
                        if (typeof($this.onopen) === "function") {
                            $this.onopen();
                        }
                        xhr.onreadystatechange = function() {};
                    }
                }
            };
            
            // FF 3.5 requires onprogress handler attached before calling open()
            // FF will not open multiple "GET" streams to the same URI (see random query param above)
            xhr.open("GET", connectURI.toString(), true);

            xhr.send(null);
            
            // TODO: use ontimeout instead if it means timeout to start response (not complete response)
            // if an intermediate transparent proxy defeats HTTP streaming response
            // then force proxy mode, resulting in either HTTPS streaming or long-polling
            if ($this.location.indexOf(".ki=p") == -1) {
                setTimeout(function() {
                    // successful XHR streaming mode will already be in XHR readyState 3
                    // and EventSource is not disconnected if SSE readyState < 2
                    if(xhr.readyState < 3 && $this.readyState < 2) {
                        // force proxy mode on the location (reused by reconnects)
                        // reconnect in force proxy mode
                        _connect($this, false, new Array(".ki=p"));
                    }
                }, 
                3000);
            }
        }
        
        function _disconnect($this) {
            if ($this.reconnectTimer !== null) {
                clearTimeout($this.reconnectTimer);
                $this.reconnectTimer = null;
            }
            
            $this.lineQueue = [];
            $this.lastEventId = null;
            $this.location = null;
            $this.readyState = 2; // CLOSED
            
            if ($this.xhr !== null) {
                $this.xhr.onprogress = function() { };
                $this.xhr.onload = function() { };
                $this.xhr.onerror = function() { };
                $this.xhr.onreadystatechange = function() {};
                $this.xhr.abort();
            }
        }

        function _reconnect($this) {
            $this.readyState = 0; // CONNECTING
            
            // schedule connect after retry milliseconds, unless disconnected
            if ($this.location !== null) {
                var delay = $this.retry;
                var immediate = $this.immediate;
                if (immediate) {
                    $this.immediate = false;
                    delay = 0;
                }
                else {
                    _error($this);
                }
                
                // onerror callback can disconnect
                // so verify readyState before scheduling reconnect
                if ($this.readyState == 0) {
                    $this.reconnectTimer = setTimeout(function() { _connect($this, immediate); }, delay);
                }
            }
        }
    
        // end of line can be \r, \n or \r\n
        var linesPattern = /[^\r\n]+|\r\n|\r|\n/g;
        
        function _process($this, progress) {
            var responseText = progress.xhr.responseText;
            var progressText = responseText.slice(progress.position);
            
            // return an array of line data interspersed with end-of-line sequences
            var matchInfo = progressText.match(linesPattern) || [];
            var lineQueue = $this.lineQueue;
    
            // walk the array of matches, dispatching events
            var lineInfo = "";
            while (matchInfo.length > 0) {
                var matchItem = matchInfo.shift();
                switch (matchItem.charAt(0)) {
                case '\r':
                case '\n':
                        // advance the pointer only on the new line in the data
                    progress.position += lineInfo.length + matchItem.length;
                    // end-of-line sequence detected
                    if (lineInfo === "") {
                        // empty line, dispatch line queue as complete event
                        _dispatch($this);
                    }
                    else {
                        // non-empty line, add to line queue
                        lineQueue.push(lineInfo);
                        lineInfo = "";
                    }
                    break;
                default:
                    // line data detected
                    lineInfo = matchItem;
                    break;
                }
            }
        }
    
        function _dispatch($this) {
            var data = "";
            var name = "message";
            var lineQueue = $this.lineQueue;
    
            // process line queue as a complete event
            while (lineQueue.length > 0) {
                var line = lineQueue.shift();
    
                var field = null;
                var value = "";
    
                var colonAt = line.indexOf(':');
                if (colonAt == -1) {
                    // no colon, line is field name with empty value
                    field = line;
                    value = "";
                }
                else if (colonAt === 0) {
                    // leading colon indicates comment line
                    continue;
                }
                else {
                    // field:[ ]value
                    field = line.slice(0, colonAt);
                    
                    var valueAt = colonAt + 1;
                    if (line.charAt(valueAt) == " ") {
                        valueAt++;
                    }
                    value = line.slice(valueAt);
                }
    
                // process field of completed event            
                switch (field) {
                  case "event":
                    name = value;
                    break;
                  case "id":
                    $this.lastEventId = value;
                    break;
                  case "retry":
                    value = parseInt(value, 10);
                    if (!isNaN(value)) {
                        $this.retry = value;
                    }
                    break;
                  case "data":
                    if (data.length > 0) {
                        data += "\n";
                    }
                    data += value;
                    break;
                  case "location":
                    if (value != "") {
                       $this.location = value;
                    }
                    break;
                  case "reconnect":
                    $this.immediate = true;
                    break;
                  default:
                    // ignore other field names
                    break;
                }
            }
    
            // dispatch if the data is non-null, or the event name is specified and not "message"        
            if (data.length > 0 || (name.length > 0 && name != "message")) {
                var e = document.createEvent("Events");
                e.initEvent(name, true, true);
                e.lastEventId = $this.lastEventId;
                e.data = data;
                e.origin = $this.origin;
    
                // ie8 fails on assigning event source (already null, readonly)             
                if (e.source !== null) {
                    e.source = null;
                }
    
                if (typeof($this.onmessage) === "function") {
                    $this.onmessage(e);
                }
            }
        }

        function _error($this) {
            var e = document.createEvent("Events");
            e.initEvent("error", true, true);
            if (typeof($this.onerror) === "function") {
                $this.onerror(e);
            }
        }
        
        return EventSource;
    })();
} else {
    // overwrite native EventSource with cross-origin bridged version
    window.EventSource = (function() {
        // emulating cross-origin EventSource uses postMessage
        //
        //  init
        //      -> I
        //
        //  connect
        //      -> c
        //
        //  event
        //      <- E 
        //          id (byte)
        //          event name (length prefixed string)
        //          event data (length prefixed string)


        var pipes = {};
        var registry = {};
        var nextId = 0;


        function EventSource(location) {
            this.readyState = 0;

            // attach this instance to the pipe
            var id = register(this);
            var pipe = supplyPipe(this, location);
            pipe.attach(id);

            // connect message
            var message = ["c", id, toPaddedHex(location.length, 4), location].join("");
            pipe.post(message);

            this._id = id;
            this._pipe = pipe;
        }

        var $prototype = EventSource.prototype;

        $prototype.disconnect = function() {
            var pipe = this._pipe;
            if (pipe !== undefined) {
                //    - abort -
                //    --> "a" 00000001
                pipe.post(["a", this._id].join(""));
                pipe.detach(this._id);
            }
            this.readyState = 2;
        }

        function register($this) {
            var id = toPaddedHex(nextId++, 8);
            registry[id] = $this;
            $this._id = id;
            return id;
        }

        function supplyPipe($this, location) {
            var uri = new URI(location);
            var hasTargetOrigin = (uri.scheme != null && uri.authority != null);
            var targetScheme = hasTargetOrigin ? uri.scheme : locationURI.scheme;
            var targetAuthority = hasTargetOrigin ? uri.authority : locationURI.authority;
            if (targetAuthority != null && uri.port == null) {
                targetAuthority = uri.host + ":" + defaultPorts[targetScheme];
            }
            var targetOrigin = targetScheme + "://" + targetAuthority;
            var pipe = pipes[targetOrigin];
            if (pipe === undefined) {
                var iframe = document.createElement("iframe");
                iframe.style.position = "absolute";
                iframe.style.left = "-10px";
                iframe.style.top = "10px";
                iframe.style.visibility = "hidden";
                iframe.style.width = "0px";
                iframe.style.height = "0px";
                
                var bridgeURI = new URI(targetOrigin);
                bridgeURI.query = ".kr=xse&.kv=10.05";  // cross-site bridge
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
                        entry.timerID = setTimeout(function() {
                            // detach entry
                            delete $this.attached[id];
                            
                            // send message to cleanup delegate instance
                            // Note: do not use $this.post in case pipe has changed
                            //    - delete -
                            //    --> "d" 00000001
                            postMessage0(pipe.iframe.contentWindow, ["d", id].join(""), pipe.targetOrigin);
                        }, 10000);
                    }
                }
                
                pipe = {'targetOrigin':targetOrigin, 'iframe':iframe, 'buffer':[], 'post':post, 'attach':attach, 'detach':detach, 'attached':{count:0}};
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
                pipe.handshakeID = setTimeout(function() {
                      // when timeout occurs, then clearing previously associated
                      // targetOrigin pipe because we cannot wait for success to
                      // associate the targetOrigin pipe, otherwise 2 parallel requests  
                      // in-flight could have different pipes for same targetOrigin
                      // and we require them to have the same pipe for the same targetOrigin
                    pipes[targetOrigin] = undefined;
                        pipe.post = function(message) {
                        // pipe.post will first be called
                        // when XMLHttpRequest0.send() is called
                        // triggering the onerror callback
                        // TODO understand and change this
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
                // this produces a general error on IE
                sendInitWhenReady();
            }
            
            return pipe;
        }

        function onmessage(event) {
            var origin = event.origin;
            var defaultPorts = {"http":":80", "https": ":443"};
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
                    pipe.post = function(message) {
                        postMessage0(pipe.iframe.contentWindow, message, pipe.targetOrigin);
                    }
                }
                else {
                    var message = event.data;
                    if (message.length >= 9) {
                        var position = 0;
                        var type = message.substring(position, position += 1);
                        var id = message.substring(position, position += 8);
                        var eventsource = registry[id];
                        if (eventsource !== undefined) {
                            switch (type) {
                            case "D":
                                // data
                                // d id, nameLength, name, dataLength, data
                                var nameLength = fromHex(message.substring(position, position += 4));
                                var name = message.substring(position, position += nameLength);
                                var dataLength = fromHex(message.substring(position, position += 4));
                                var data = message.substring(position, position += dataLength);

                                // dispatch if the data is non-null, or 
                                // the event name is specified and not "message"
                                if (data.length > 0 || (name.length > 0 && name != "message")) {
                                    var e = document.createEvent("Events");
                                    e.initEvent(name, true, true);
                                    e.lastEventId = eventsource.lastEventId;
                                    e.data = data;
                                    e.origin = eventsource.origin;

                                    if (typeof(eventsource.onmessage) === "function") {
                                        eventsource.onmessage(e);
                                    }
                                }

                                break;
                            case "O":
                                // open event
                                eventsource.readyState = 1;
                                eventsource.onopen();
                                break;
                            case "E":
                                //    - error -
                                //    <-- "e" 00000001
                                if (eventsource._id === id) {
                                    eventsource.onerror();
                                }
                                break;
                            }
                        }
                    }
                }
            } else {
                //throw new Error("Could not perform x-domain EventSource emulation: message pipe not found");
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

    // attach message processing
    window.addEventListener("message", onmessage, false);

        return EventSource;
    })();


}

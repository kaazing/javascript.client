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
var WebSocketEmulatedProxyDownstream = (function () {
    ;
    ;
    ;
    var WSEBDLOG = Logger.getLogger('org.kaazing.gateway.client.html5.WebSocketEmulatedProxyDownstream');

    var STREAM_THRESHOLD = 512 * 1024; // 512k stream threshold
    var nextId = 1;

    /**
     * Creates a new stream instance and connects to the location.
     *
     * @param {String} location      the stream location
     *
     * @constructor
     * @name WebSocketEmulatedProxyDownstream
     * @ignore
     *
     * @class  WebSocketEmulatedProxyDownstream consitutes the downstream half of the binary WebSocket emulation protocol
     */
    var WebSocketEmulatedProxyDownstream = function (location, sequence) {
        ;
        ;
        ;
        WSEBDLOG.entering(this, 'WebSocketEmulatedProxyDownstream.<init>', location);
        this.sequence = sequence;
        this.retry = 3000; // default retry to 3s

        // Opera and IE need escaped upstream and downstream
        if (location.indexOf("/;e/dtem/") > 0) {
            this.requiresEscaping = true;
        }

        // determine event source origin
        var locationURI = new URI(location);
        var defaultPorts = {"http": 80, "https": 443};
        if (locationURI.port == undefined) {
            locationURI.port = defaultPorts[locationURI.scheme];
            locationURI.authority = locationURI.host + ":" + locationURI.port;
        }
        this.origin = locationURI.scheme + "://" + locationURI.authority;

        this.location = location;

        this.activeXhr = null;
        this.reconnectTimer = null;
        this.idleTimer = null;
        this.idleTimeout = null;
        this.lastMessageTimestamp = null;
        this.buf = new $rootModule.ByteBuffer();

        // allow event handlers to be assigned before triggering
        var $this = this;
        setTimeout(function () {
            connect($this, true);
            $this.activeXhr = $this.mostRecentXhr;
            startProxyDetectionTimer($this, $this.mostRecentXhr);
        }, 0);
        ;
        ;
        ;
        WSEBDLOG.exiting(this, 'WebSocketEmulatedProxyDownstream.<init>');
    }
    var $prototype = WebSocketEmulatedProxyDownstream.prototype;

    var TEXT_FRAME_START = 0x00;
    var TEXT_FRAME_TERMINATOR = 0xFF;
    var COMMAND_FRAME_START = 0x01;
    var BYTE_FRAME_START = 0x80;
    var PRE_LENGTH_TEXT_FRAME_START = 0x81;
    var ESCAPE_CHAR = 0x7F;
    var WSE_PING_FRAME_CODE = 0x89;

    var PROXY_DETECTION_TIMEOUT = 3000;    // timeout for proxy detection

    /**
     * The ready state indicates the stream status,
     * Possible values are 0 (CONNECTING), 1 (OPEN) and 2 (CLOSED)
     *
     * @public
     * @field
     * @name readyState
     * @type Number
     * @memberOf WebSocketEmulatedProxyDownstream
     */
    $prototype.readyState = 0;

    function connect($this, attach) {
        ;
        ;
        ;
        WSEBDLOG.entering(this, 'WebSocketEmulatedProxyDownstream.connect');
        // ensure reconnect timer is null
        if ($this.reconnectTimer !== null) {
            $this.reconnectTimer = null;
        }

        // ensure idle time if running is stopped
        stopIdleTimer($this);


        // construct destination
        var connectURI = new URI($this.location);

        var queryParams = [];

        // Annotate request with sequence number
        var sequenceNo = $this.sequence++;
        queryParams.push(".ksn=" + sequenceNo);

        // set padding required by different browsers
        switch (browser) {
            case 'ie':
                queryParams.push(".kns=1");  // no-sniff workaround for ie7
                // prevent ie10 with ie9 document compat mode from long polling
                queryParams.push(".kf=200&.kp=2048");
                break;
            case 'safari':
                queryParams.push(".kp=256");  // stream padding in bytes
                break;
            case 'firefox':
                queryParams.push(".kp=1025");  // stream padding in bytes
                break;
            case 'android':
                // Android requires 4K buffer to start (on 2.2.1),
                // plus 4K buffer to be filled since previous message
                queryParams.push(".kp=4096");  // "initial padding" in bytes
                queryParams.push(".kbp=4096"); // "block padding" in bytes
                break;
        }

        // add shorter keepalive time for certain mobile browsers
        if (browser == 'android' || browser.ios) {
            queryParams.push(".kkt=20");
        }

        // request that the stream be Windows-1252 encoded
        queryParams.push(".kc=text/plain;charset=windows-1252");

        // request that the server send back chunks of at most 4MB
        queryParams.push(".kb=4096");

        // Some browsers will not open multiple "GET" streams to the same URI
        queryParams.push(".kid=" + String(Math.random()).substring(2));

        if (queryParams.length > 0) {
            if (connectURI.query === undefined) {
                connectURI.query = queryParams.join("&");
            }
            else {
                connectURI.query += "&" + queryParams.join("&");
            }
        }

        // initialize CS-XHR (FF3.5 cannot reuse CS-XHRs)
        var xhr = new XMLHttpRequest0();
        xhr.id = nextId++;
        xhr.position = 0;
        xhr.opened = false;
        xhr.reconnect = false;
        xhr.requestClosing = false;

        //WSEBDLOG.debug(xhr.id+": new XHR");

        //attach listeners and send request

        xhr.onreadystatechange = function () {

            // onreadystatechange with ready state -3 is called immediately before receiving 
            // the message body (if any) as per the XMLHttpRequest api spec. 
            // All HTTP headers have been received by now.
            if (xhr.readyState == 3) {
                // onreadystatechange is called multiple times for the same ready state
                // the if condition will ensure that the idle timer is not initialized multiple times
                if ($this.idleTimer == null) {
                    var idleTimeoutHeaderValue = xhr.getResponseHeader("X-Idle-Timeout");
                    if (idleTimeoutHeaderValue) {
                        var idleTimeout = parseInt(idleTimeoutHeaderValue);
                        if (idleTimeout > 0) {

                            // Save in milliseconds
                            idleTimeout = idleTimeout * 1000;
                            $this.idleTimeout = idleTimeout;
                            $this.lastMessageTimestamp = new Date().getTime();
                            startIdleTimer($this, idleTimeout);

                        }
                    }
                }
            }
        };

        xhr.onprogress = function () {
            if (xhr == $this.activeXhr && $this.readyState != 2) { // CLOSED
                // FF 3.5 updates responseText after progress event
                //setTimeout(function() {
                _process($this);
                //}, 0);
            }
        };

        xhr.onload = function () {
            //WSEBDLOG.entering(this, 'WebSocketEmulatedProxyDownstream.connect.xhr.onload');

            // Only process currently activeXhr
            // and handle any other requests in progress (mostRecentXhr)
            if (xhr == $this.activeXhr && $this.readyState != 2) { // CLOSED
                _process($this);

                xhr.onerror = function () {
                };
                xhr.ontimeout = function () {
                };
                xhr.onreadystatechange = function () {
                };

                if (!xhr.reconnect) {
                    // Reconnect must always be present on downstream request
                    //LOG.debug(xhr.id+": doError (no reconnect)");
                    doError($this);
                }
                else if (xhr.requestClosing) {
                    // Found close
                    // TODO: This does not check the order - should be RECONNECT then CLOSE
                    // But we currently tolerate CLOSE followed by RECONNECT
                    // LOG.debug(xhr.id+": requestClosing");
                    doClose($this);
                }
                else {
                    // Reconnect requested on new downstream
                    if ($this.activeXhr == $this.mostRecentXhr) {
                        // No overlapping request sent yet
                        // Need to reconnect with new stream
                        // LOG.debug("SENDING RECONNECT");
                        connect($this);
                        $this.activeXhr = $this.mostRecentXhr;
                        startProxyDetectionTimer($this, $this.activeXhr);
                    }
                    else {
                        // An overlapping request is already in flight
                        // swap active xhr with the background overlapping request
                        var newXhr = $this.mostRecentXhr;
                        $this.activeXhr = newXhr;
                        //LOG.debug("SWITCHING STREAMS: "+newXhr.id+" readystate: "+newXhr.readyState);

                        switch (newXhr.readyState) {
                            case 1:
                            case 2:
                                startProxyDetectionTimer($this, newXhr);
                                break;
                            case 3:
                                // process any data on the new active xhr if it is streaming
                                _process($this);
                                break;
                            case 4:
                                // call the load handler again if the overlap xhr has already loaded
                                $this.activeXhr.onload();
                                break;
                            default:
                            // progress and load events will fire naturally
                        }
                    }
                }
            }
        };

        // error cases
        xhr.ontimeout = function () {
            ;
            ;
            ;
            WSEBDLOG.entering(this, 'WebSocketEmulatedProxyDownstream.connect.xhr.ontimeout');
            doError($this);
        };

        xhr.onerror = function () {
            ;
            ;
            ;
            WSEBDLOG.entering(this, 'WebSocketEmulatedProxyDownstream.connect.xhr.onerror');
            doError($this);
        };

        // FF 3.5 requires onprogress handler attached before calling open()
        // FF will not open multiple "GET" streams to the same URI (see random query param above)
        xhr.open("GET", connectURI.toString(), true);
        xhr.send("");

        $this.mostRecentXhr = xhr;
    }

    function startProxyDetectionTimer($this, xhr) {
        // TODO: use ontimeout instead if it means timeout to start response (not complete response)
        // if an intermediate transparent proxy defeats HTTP streaming response
        // then force proxy mode, resulting in either HTTPS streaming or long-polling
        if ($this.location.indexOf(".ki=p") == -1) {
            setTimeout(function () {
                    // successful XHR streaming mode will already be in XHR readyState 3
                    // and EventSource is not disconnected if SSE readyState < 2
                    if (xhr && xhr.readyState < 3 && $this.readyState < 2) {
                        // force proxy mode on the location (reused by reconnects)
                        if ($this.location.indexOf("?") == -1) {
                            $this.location += "?.ki=p";
                        } else {
                            $this.location += "&.ki=p";
                        }

                        // reconnect in force proxy mode
                        connect($this, false);
                    }
                },
                PROXY_DETECTION_TIMEOUT);
        }
    }

    /**
     * Disconnects the stream.
     *
     * @return {void}
     *
     * @public
     * @function
     * @name disconnect
     * @memberOf WebSocketEmulatedProxyDownstream
     */
    $prototype.disconnect = function () {
        ;
        ;
        ;
        WSEBDLOG.entering(this, 'WebSocketEmulatedProxyDownstream.disconnect');
        // disconnect only if not already disconnected
        if (this.readyState !== 2) {
            _disconnect(this);
        }
    }

    function _disconnect($this) {
        ;
        ;
        ;
        WSEBDLOG.entering(this, 'WebSocketEmulatedProxyDownstream._disconnect');
        if ($this.reconnectTimer !== null) {
            clearTimeout($this.reconnectTimer);
            $this.reconnectTimer = null;
        }

        // ensure idle time if running is stopped
        stopIdleTimer($this);

        if ($this.mostRecentXhr !== null) {
            $this.mostRecentXhr.onprogress = function () {
            };
            $this.mostRecentXhr.onload = function () {
            };
            $this.mostRecentXhr.onerror = function () {
            };
            $this.mostRecentXhr.abort();
        }

        if ($this.activeXhr != $this.mostRecentXhr && $this.activeXhr !== null) {
            $this.activeXhr.onprogress = function () {
            };
            $this.activeXhr.onload = function () {
            };
            $this.activeXhr.onerror = function () {
            };
            $this.activeXhr.abort();
        }

        $this.lineQueue = [];
        $this.lastEventId = null;
        $this.location = null;
        $this.readyState = 2; // CLOSED
    }

    /**
     * Handle incremental buffer updates
     *
     * @ignore
     * @private
     */
    function _process($this) {

        // update the last message timestamp to the current timestamp
        $this.lastMessageTimestamp = new Date().getTime();
        var xhr = $this.activeXhr;

        var responseText = xhr.responseText;
        if (responseText.length >= STREAM_THRESHOLD) {
            if ($this.activeXhr == $this.mostRecentXhr) {
                //LOG.debug("RECONNECT!");
                connect($this, false);
            }
        }

        // Check response text again!
        var progressText = responseText.slice(xhr.position);
        xhr.position = responseText.length;

        var buf = $this.buf;

        var bytes = Windows1252.toArray(progressText, $this.requiresEscaping);
        // handle fragmentation for escaped downstream
        if (bytes.hasRemainder) {
            // back up position by 1 to unread the escape char
            xhr.position--;
        }

        buf.position = buf.limit;
        buf.putBytes(bytes);
        buf.position = 0;
        buf.mark();

        parse:
            while (true) {
                if (!buf.hasRemaining()) {
                    break;
                }

                var type = buf.getUnsigned();
                switch (type & 0x80) {
                    case TEXT_FRAME_START:
                        var endOfFrameAt = buf.indexOf(TEXT_FRAME_TERMINATOR);
                        if (endOfFrameAt == -1) {
                            // incomplete text frame
                            break parse;
                        }

                        var dataBytes = buf.array.slice(buf.position, endOfFrameAt);
                        var data = new $rootModule.ByteBuffer(dataBytes);

                        // consume the payload bytes plus end of frame marker
                        var numBytes = endOfFrameAt - buf.position;
                        buf.skip(numBytes + 1);
                        buf.mark();

                        // handle command frames
                        if (type == COMMAND_FRAME_START) {
                            //LOG.debug(xhr.id+": COMMAND FRAME: "+data);
                            handleCommandFrame($this, data);
                        } else {
                            //LOG.debug(xhr.id+": DISPATCH TEXT");
                            dispatchText($this, data.getString(Charset.UTF8));
                        }
                        break;

                    case BYTE_FRAME_START:
                    case PRE_LENGTH_TEXT_FRAME_START:
                        var length = 0;
                        var lengthComplete = false;
                        while (buf.hasRemaining()) {
                            var b = buf.getUnsigned();

                            length = length << 7;
                            length |= (b & 0x7f);
                            if ((b & 0x80) != 0x80) {
                                lengthComplete = true;
                                break;
                            }
                        }

                        //LOG.debug(xhr.id+": BYTE FRAME: "+length);
                        if (!lengthComplete) {
                            //LOG.debug("incomplete length prefix");
                            break parse;
                        }
                        if (buf.remaining() < length) {
                            //LOG.debug("incomplete payload: "+buf.remaining()+" < "+length);
                            break parse;
                        }

                        // extract binary payload
                        var payloadData = buf.array.slice(buf.position, buf.position + length);
                        var payload = new $rootModule.ByteBuffer(payloadData);

                        // consume binary payload
                        buf.skip(length)
                        buf.mark()

                        // dispatch byte frame
                        // LOG.debug(xhr.id+": DISPATCH BYTES: "+payload.remaining());
                        if (type == BYTE_FRAME_START) {
                            dispatchBytes($this, payload);
                        }
                        else if (type == WSE_PING_FRAME_CODE) {
                            dispatchPingReceived($this);
                        } else {
                            //LOG.debug(xhr.id+": DISPATCH TEXT");
                            dispatchText($this, payload.getString(Charset.UTF8));
                        }

                        break;
                    default:
                        throw new Error("Emulation protocol error. Unknown frame type: " + type);
                }
            }

        buf.reset();
        buf.compact();
    }


    function handleCommandFrame($this, data) {
        //LOG.debug($this.activeXhr.id+": COMMAND FRAME: "+data);
        while (data.remaining()) {
            var command = String.fromCharCode(data.getUnsigned());
            switch (command) {
                case "0":
                    // ignore padding
                    break;
                case "1":
                    //LOG.debug($this.activeXhr.id+": RECONNECT")
                    $this.activeXhr.reconnect = true;
                    break;
                case "2":
                    //LOG.debug($this.activeXhr.id+": REQUEST CLOSING")
                    $this.activeXhr.requestClosing = true;
                    break;
                default:
                    throw new Error("Protocol decode error. Unknown command: " + command);
            }
        }
    }


    function dispatchBytes($this, buf) {
        var e = document.createEvent("Events");
        e.initEvent("message", true, true);
        e.lastEventId = $this.lastEventId;
        e.data = buf;
        e.decoder = decodeByteString;
        e.origin = $this.origin;

        // ie8 fails on assigning event source (already null, readonly)             
        if (e.source !== null) {
            e.source = null;
        }

        if (typeof($this.onmessage) === "function") {
            $this.onmessage(e);
        }
    }

    function dispatchText($this, data) {
        var e = document.createEvent("Events");
        e.initEvent("message", true, true);
        e.lastEventId = $this.lastEventId;
        e.text = data;

        e.origin = $this.origin;

        // ie8 fails on assigning event source (already null, readonly)
        if (e.source !== null) {
            e.source = null;
        }

        if (typeof($this.onmessage) === "function") {
            $this.onmessage(e);
        }
    }

    function dispatchPingReceived($this) {
        if (typeof($this.onping) === "function") {
            $this.onping();
        }
    }

    function doClose($this) {
        doError($this);
    }

    function doError($this) {
        if ($this.readyState != 2) { // CLOSED
            $this.disconnect();
            fireError($this);
        }
    }

    function fireError($this) {
        var e = document.createEvent("Events");
        e.initEvent("error", true, true);
        if (typeof($this.onerror) === "function") {
            $this.onerror(e);
        }
    }

    //------------ Idle Timer--------------------//
    function startIdleTimer($this, delayInMilliseconds) {
        // ensure idle time if running is stopped
        stopIdleTimer($this);

        $this.idleTimer = setTimeout(function () {
            idleTimerHandler($this);
        }, delayInMilliseconds);

    }

    function idleTimerHandler($this) {
        var currentTimestamp = new Date().getTime();
        var idleDuration = currentTimestamp - $this.lastMessageTimestamp;
        var idleTimeout = $this.idleTimeout;

        if (idleDuration > idleTimeout) {
            doError($this);
        }
        else {
            startIdleTimer($this, idleTimeout - idleDuration);
        }

    }

    function stopIdleTimer($this) {
        if ($this.idleTimer != null) {
            clearTimeout($this.idleTimer);
            $this.IdleTimer = null;
        }
    }

    return WebSocketEmulatedProxyDownstream;
})();


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
 * HTTP streaming half of WSEB
 *
 * @private
 * @ignore
 */
var WebSocketEmulatedProxy = (function () {
    ;;;var WSEBLOG = Logger.getLogger('WebSocketEmulatedProxy');

    /**
     * @private
     * @ignore
     */
    var WebSocketEmulatedProxy = function () {

        this.parent;
        this._listener;
        this.closeCode = 1005;
        this.closeReason = "";
        this.sequence = 0;
    };


    var $prototype = WebSocketEmulatedProxy.prototype;


    $prototype.connect = function (location, protocol) {
        ;
        ;
        ;
        WSEBLOG.entering(this, 'WebSocketEmulatedProxy.connect', {'location': location, 'subprotocol': protocol});

        this.URL = location.replace("ws", "http");
        this.protocol = protocol;

        this._prepareQueue = new AsyncActionQueue();
        this._sendQueue = [];
        connect(this);
        ;
        ;
        ;
        WSEBLOG.exiting(this, 'WebSocketEmulatedProxy.<init>');
    }

    /**
     * The ready state indicates the connection status.
     *
     * @private
     * @ignore
     * @field
     * @name readyState
     * @type Number
     * @memberOf WebSocketEmulatedProxy
     */
    $prototype.readyState = 0;

    /**
     * The number of bytes queued to be sent.
     *
     * @private
     * @ignore
     * @field
     * @name bufferedAmount
     * @type Number
     * @memberOf WebSocketEmulatedProxy
     */
    $prototype.bufferedAmount = 0;

    /**
     * The URL with which the WebSocket was constructed.
     *
     * @private
     * @ignore
     * @field
     * @name URL
     * @type String
     * @memberOf WebSocketEmulatedProxy
     */
    $prototype.URL = "";

    /**
     * The onopen handler is called when the connection is established.
     *
     * @private
     * @ignore
     * @field
     * @name onopen
     * @type Function
     * @memberOf WebSocketEmulatedProxy
     */
    $prototype.onopen = function () {
    };

    /**
     * The onopen handler is called when the connection is established.
     *
     * @private
     * @ignore
     * @field
     * @name onopen
     * @type Function
     * @memberOf WebSocketEmulatedProxy
     */
    $prototype.onerror = function () {
    };

    /**
     * The onmessage handler is called when data arrives.
     *
     * @private
     * @ignore
     * @field
     * @name onmessage
     * @type Function
     * @memberOf WebSocketEmulatedProxy
     */
    $prototype.onmessage = function (event) {
    };

    /**
     * The onclose handler is called when the connection is terminated.
     *
     * @private
     * @ignore
     * @field
     * @name onclose
     * @type Function
     * @memberOf WebSocketEmulatedProxy
     */
    $prototype.onclose = function () {
    };

    var BYTE_FRAME_START = 0x80;
    var FIXED_LENGTH_TEXT_FRAME_START = 0x81;
    var TEXT_FRAME_START = 0x00;
    var TEXT_FRAME_TERMINATOR = 0xFF;
    var COMMAND_FRAME_START = 0x01;
    var WSE_PONG_FRAME_CODE = 0x8A;
    var RECONNECT_FRAME_BYTES = [COMMAND_FRAME_START, 0x30, 0x31, TEXT_FRAME_TERMINATOR];
    var CLOSE_FRAME_BYTES = [COMMAND_FRAME_START, 0x30, 0x32, TEXT_FRAME_TERMINATOR];

    /**
     * Write a byte frame length encoding into a byte buffer
     * @private
     * @ignore
     */
    var encodeLength = function (buf, length) {
        ;
        ;
        ;
        WSEBLOG.entering(this, 'WebSocketEmulatedProxy.encodeLength', {'buf': buf, 'length': length});
        var byteCount = 0;
        var encodedLength = 0;

        do {
            // left shift one byte to make room for new data
            encodedLength <<= 8;
            // set 7 bits of length
            encodedLength |= (length & 0x7f);
            // right shift out the 7 bits we just set
            length >>= 7;
            // increment the byte count that we need to encode
            byteCount++;

            // continue if there are remaining set length bits
        } while (length > 0);


        do {
            // get byte from encoded length
            var encodedByte = encodedLength & 0xff;
            // right shift encoded length past byte we just got
            encodedLength >>= 8;
            // The last length byte does not have the highest bit set
            if (byteCount != 1) {
                // set highest bit if this is not the last
                encodedByte |= 0x80;
            }
            // write encoded byte
            buf.put(encodedByte);
        }
            // decrement and continue if we have more bytes left
        while (--byteCount > 0);
    }

    /**
     * Sends text-based data to the remote socket location.
     *
     * @param {String|ByteBuffer} data   the data payload
     *
     * @return {bool}
     *
     * @private
     * @ignore
     * @function
     * @name send
     * @memberOf WebSocketEmulatedProxy
     */
    $prototype.send = function (data) {
        var $this = this;
        ;
        ;
        ;
        WSEBLOG.entering(this, 'WebSocketEmulatedProxy.send', {'data': data});
        switch (this.readyState) {
            case 0:
                ;
                ;
                ;
                WSEBLOG.severe(this, 'WebSocketEmulatedProxy.send: Error: readyState is 0');
                throw new Error("INVALID_STATE_ERR");

            case 1:
                if (data === null) {
                    ;
                    ;
                    ;
                    WSEBLOG.severe(this, 'WebSocketEmulatedProxy.send: Error: data is null');
                    throw new Error("data is null");
                }

                // build the buffer for this data

                var buf = new $rootModule.ByteBuffer();

                if (typeof data == "string") {
                    ;
                    ;
                    ;
                    WSEBLOG.finest(this, 'WebSocketEmulatedProxy.send: Data is string');
                    var payload = new $rootModule.ByteBuffer();
                    payload.putString(data, Charset.UTF8);
                    buf.put(FIXED_LENGTH_TEXT_FRAME_START);
                    encodeLength(buf, payload.position);
                    buf.putBytes(payload.array);
                } else if (data.constructor == $rootModule.ByteBuffer) {
                    ;
                    ;
                    ;
                    WSEBLOG.finest(this, 'WebSocketEmulatedProxy.send: Data is ByteBuffer');
                    buf.put(BYTE_FRAME_START);
                    encodeLength(buf, data.remaining());
                    buf.putBuffer(data);
                } else if (data.byteLength) {
                    ;
                    ;
                    ;
                    WSEBLOG.finest(this, 'WebSocketEmulatedProxy.send: Data is ByteArray');
                    buf.put(BYTE_FRAME_START);
                    encodeLength(buf, data.byteLength);
                    buf.putByteArray(data);
                } else if (data.size) {
                    ;
                    ;
                    ;
                    WSEBLOG.finest(this, 'WebSocketEmulatedProxy.send: Data is Blob');
                    var cb = this._prepareQueue.enqueue(function (result) {
                        var b = new $rootModule.ByteBuffer();
                        b.put(BYTE_FRAME_START);
                        encodeLength(b, result.length);
                        b.putBytes(result);
                        b.flip();
                        doSend($this, b);
                    });
                    BlobUtils.asNumberArray(cb, data);
                    return true;
                } else {
                    // TODO handle blob async conversion here OR use blob building to construct framing
                    ;
                    ;
                    ;
                    WSEBLOG.severe(this, 'WebSocketEmulatedProxy.send: Error: Invalid type for send');
                    throw new Error("Invalid type for send");
                }
                buf.flip();

                // send the message
                this._prepareQueue.enqueue(function (result) {
                    doSend($this, buf);
                })();
                return true;

            case 2:
                return false;

            default:
                ;
                ;
                ;
                WSEBLOG.severe(this, 'WebSocketEmulatedProxy.send: Error: invalid readyState');
                throw new Error("INVALID_STATE_ERR");
        }
        ;
        ;
        ;
        WSEBLOG.exiting(this, 'WebSocketEmulatedProxy.send');
    }

    /**
     * Disconnects the remote socket location.
     *
     * @return {void}
     *
     * @private
     * @ignore
     * @function
     * @name close
     * @memberOf WebSocketEmulatedProxy
     */
    $prototype.close = function (code, reason) {
        ;
        ;
        ;
        WSEBLOG.entering(this, 'WebSocketEmulatedProxy.close');
        switch (this.readyState) {
            case 0:
                doClose(this);
                break;
            case 1:
                //TODO: before gateway send close frame back, we will  don't send cose frame code and reason until gateway is ready
                //      we save the code and reason and send back to application to pretend we received close frame from gateway
                if (code != null && code != 0) {
                    this.closeCode = code;
                    this.closeReason = reason;
                }
                doSend(this, new $rootModule.ByteBuffer(CLOSE_FRAME_BYTES));
                //doClose(this); waite for server's close frame
                break;
        }
    };

    $prototype.setListener = function (listener) {
        this._listener = listener;
    };

    function openUpstream($this) {
        if ($this.readyState != 1) {
            return; //websocket is closed, return
        }
        //console.log("openUpstream");
        if ($this.idleTimer) {
            clearTimeout($this.idleTimer);
        }
        var xdr = new XMLHttpRequest0();
        xdr.onreadystatechange = function () {
            //console.log("upstream.onreadystatechange " + $this.upstreamXHR.readyState);
            if (xdr.readyState == 4) {
                switch (xdr.status) {
                    case 200:
                        //open a new upstream, if this one if closed
                        setTimeout(function () {
                            doFlush($this);
                        }, 0);
                        break;
                }
            }
        };
        xdr.onload = function () {
            //console.log("upstream.onload " + xdr.readyState);
            openUpstream($this);
        }
        xdr.onerror = function() {
            if ($this._downstream) {
                $this._downstream.disconnect();
            }
            doClose($this);
        };
        xdr.open("POST", $this._upstream + "&.krn=" + Math.random(), true);
        $this.upstreamXHR = xdr;
        //open a new upstream if idle for 30 sec
        $this.idleTimer = setTimeout(function () {
            if ($this.upstreamXHR != null) {
                $this.upstreamXHR.abort();
            }
            openUpstream($this);
        }, 30000);
    }

    function doSend($this, buf) {
        ;
        ;
        ;
        WSEBLOG.entering(this, 'WebSocketEmulatedProxy.doSend', buf);
        $this.bufferedAmount += buf.remaining();
        $this._sendQueue.push(buf);
        doBufferedAmountChange($this);

        // flush the queue if possible
        if (!$this._writeSuspended) {
            doFlush($this);
        }
    }

    function doFlush($this) {
        ;
        ;
        ;
        WSEBLOG.entering(this, 'WebSocketEmulatedProxy.doFlush');
        var sendQueue = $this._sendQueue;
        var numSendPackets = sendQueue.length;
        $this._writeSuspended = (numSendPackets > 0);
        if (numSendPackets > 0) {
            var sequenceNo = $this.sequence++;
            if ($this.useXDR) {
                var out = new $rootModule.ByteBuffer();

                while (sendQueue.length) {
                    out.putBuffer(sendQueue.shift());
                }

                out.putBytes(RECONNECT_FRAME_BYTES);
                out.flip();
                $this.upstreamXHR.setRequestHeader("Content-Type", "text/plain; charset=utf-8");
                $this.upstreamXHR.setRequestHeader("X-Sequence-No", sequenceNo.toString());
                $this.upstreamXHR.send(encodeByteString(out, $this.requiresEscaping));
            }
            else {
                var xhr = new XMLHttpRequest0();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        ;
                        ;
                        ;
                        WSEBLOG.finest(this, 'WebSocketEmulatedProxy.doFlush: xhr.status=' + xhr.status);
                        switch (xhr.status) {
                            case 200:
                                // Flush if needed
                                setTimeout(function () {
                                    doFlush($this);
                                }, 0);
                                break;
                            default:
                                // failure, close the WebSocket
                                doClose($this);
                                break;
                        }
                    }
                };
                xhr.onerror = function() {
                    ;
                    ;
                    ;
                    WSEBLOG.finest(this, 'WebSocketEmulatedProxy.doFlush: xhr.onerror status = ' + xhr.status);
                    if ($this._downstream) {
                        $this._downstream.disconnect();
                    }
                    doClose($this);
                };

                xhr.open("POST", $this._upstream + "&.krn=" + Math.random(), true);
                var out = new $rootModule.ByteBuffer();

                while (sendQueue.length) {
                    out.putBuffer(sendQueue.shift());
                }

                out.putBytes(RECONNECT_FRAME_BYTES);
                out.flip();

                xhr.setRequestHeader("X-Sequence-No", sequenceNo.toString());

                if (browser == "firefox") {
                    if (xhr.sendAsBinary) {
                        ;
                        ;
                        ;
                        WSEBLOG.finest(this, 'WebSocketEmulatedProxy.doFlush: xhr.sendAsBinary');
                        xhr.setRequestHeader("Content-Type", "application/octet-stream");
                        xhr.sendAsBinary(encodeByteString(out));
                    }
                    else {
                        xhr.send(encodeByteString(out));
                    }
                } else {
                    xhr.setRequestHeader("Content-Type", "text/plain; charset=utf-8");
                    xhr.send(encodeByteString(out, $this.requiresEscaping));
                }
            }
        }
        $this.bufferedAmount = 0;
        doBufferedAmountChange($this);
    }

    /**
     * Send create post and bind to downstream
     * @private
     * @ignore
     */
    var connect = function ($this) {
        ;
        ;
        ;
        WSEBLOG.entering(this, 'WebSocketEmulatedProxy.connect');
        var url = new URI($this.URL);
        url.scheme = url.scheme.replace("ws", "http");

        // Opera and IE need escaped upstream and downstream UNLESS XDR is used
        // to use XDR: (1) is IE, (2) XDomainRequest is defined (3) no cross scheme
        locationURI = new URI((browser == "ie") ? document.URL : location.href);
        if (browser == "ie" && typeof(XDomainRequest) !== "undefined" && url.scheme === locationURI.scheme) {
            $this.useXDR = true;
        }
        switch (browser) {
            case "opera":
                $this.requiresEscaping = true;
                break;
            case "ie":
                if (!$this.useXDR) {
                    // If XDR is OFF, then turn escaping ON in all the IE browsers.
                    $this.requiresEscaping = true;
                }
                else if ((typeof(Object.defineProperties) === "undefined") && (navigator.userAgent.indexOf("MSIE 8") > 0)) {
                    // If XDR is ON, turn escaping ON in native IE8 browsers.
                    $this.requiresEscaping = true;
                }
                else {
                    // If XDR is ON, turn escaping OFF in IE9 and higher browsers.
                    $this.requiresEscaping = false;
                }
                break;
            default:
                // Chrome, Firefox, Safari, etc.
                $this.requiresEscaping = false;
                break;
        }

        var createSuffix = $this.requiresEscaping ? "/;e/ctem" : "/;e/ctm";

        // use replace with regular expression rather than string concatenation
        // to be tolerant of optional trailing slash at end of URL path
        url.path = url.path.replace(/[\/]?$/, createSuffix);

        var connectString = url.toString();
        var queryStart = connectString.indexOf("?");
        if (queryStart == -1) {
            connectString += "?";
        } else {
            connectString += "&";
        }
        connectString += ".kn=" + String(Math.random()).substring(2);
        ;
        ;
        ;
        WSEBLOG.finest(this, 'WebSocketEmulatedProxy.connect: Connecting to ' + connectString);

        var create = new XMLHttpRequest0();
        var connected = false;
        create.withCredentials = true;
        create.open("GET", connectString, true);
        create.setRequestHeader("Content-Type", "text/plain; charset=utf-8");
        // add kaazing extension headers
        create.setRequestHeader("X-WebSocket-Version", "wseb-1.0");

        // Notify gateway that client supports PING/PONG
        create.setRequestHeader("X-Accept-Commands", "ping");

        // Annotate request with sequence number
        var sequenceNo = $this.sequence++;
        create.setRequestHeader("X-Sequence-No", sequenceNo.toString());


        // join protocol array with comma
        if ($this.protocol.length) {
            var protocol = $this.protocol.join(",");
            create.setRequestHeader("X-WebSocket-Protocol", protocol);
        }

        var registeredExtensions = WebSocketExtensionSpi.getRegisteredExtensionNames();
        if (registeredExtensions.length > 0) {
            create.setRequestHeader("X-WebSocket-Extensions", registeredExtensions.join(", "));
        }

        for (var i = 0; i < $this.parent.requestHeaders.length; i++) {
            var requstHdr = $this.parent.requestHeaders[i];
            create.setRequestHeader(requstHdr.label, requstHdr.value);
        }

        create.onerror = function() {
            ;
            ;
            ;
            WSEBLOG.info(this, 'WebSocketEmulatedProxy.onerror', {'status':create.status});
            doError($this);
        }

        create.onredirectallowed = function (originalLoc, redirectLoc) {
            // ### TODO: Validate parameters.
            var compChannel = $this.parent.parent;
            var redirectPolicy = compChannel.getRedirectPolicy();
            if ((typeof(redirectPolicy) != "undefined") && (redirectPolicy != null)) {
                if (!redirectPolicy.isRedirectionAllowed(originalLoc, redirectLoc)) {
                    create.statusText = redirectPolicy.toString() + ": Cannot redirect from " + originalLoc + " to " + redirectLoc;
                    $this.closeCode = 1006;
                    $this.closeReason = create.statusText;
                    $this.parent.closeCode = $this.closeCode;
                    $this.parent.closeReason = $this.closeReason;
                    $this.parent.preventFallback = true;
                    doError($this);
                    return false;
                }
            }
            return true;
        }

        create.onreadystatechange = function () {
            switch (create.readyState) {
                case 2:
                    if (create.status == 403) {
                        //forbidden
                        doError($this);
                    }
                    else {
                        // Set the create timeout to the WebSocket connect timeout
                        var createTimeout = $this.parent.parent._webSocket.connectTimeout;

                        if (createTimeout == 0) {
                            createTimeout = 5000;
                        }

                        timer = setTimeout(function () {
                            if (!connected) {
                                doError($this);
                            }
                        }, createTimeout);
                    }
                    break;
                case 4:
                    connected = true;
                    if (create.status == 401) {
                        //handle 401
                        $this._listener.authenticationRequested($this.parent, create._location, create.getResponseHeader("WWW-Authenticate"));
                        return;
                    }
                    if ($this.readyState < 1) {
                        if (create.status == 201) {
                            $this.parent.responseHeaders[WebSocketHandshakeObject.HEADER_SEC_PROTOCOL] = create.getResponseHeader(WebSocketHandshakeObject.HEADER_SEC_PROTOCOL);
                            $this.parent.responseHeaders[WebSocketHandshakeObject.HEADER_SEC_EXTENSIONS] = create.getResponseHeader(WebSocketHandshakeObject.HEADER_SEC_EXTENSIONS);

                            var connectionTimeout = 10 * 1000; // Default connection timeout 10ms
                            var extensionsHeader = create.getResponseHeader(WebSocketHandshakeObject.HEADER_SEC_EXTENSIONS);

                            if (extensionsHeader) {
                                var extensions = extensionsHeader.split(",");
                                for (var j = 0; j < extensions.length; j++) {
                                    var extensionParts = extensions[j].split(";");
                                    var extensionName =  extensionParts[0].replace(/^\s+|\s+$/g,"");

                                    if (WebSocketHandshakeObject.KAAZING_SEC_EXTENSION_IDLE_TIMEOUT === extensionName) {
                                        // x-kaazing-idle-timeout extension has been negotiated. Use the timeout parameter
                                        // that will be specified like this: "x-kaazing-idle-timeout; timeout=5000"
                                        connectionTimeout = extensionParts[1].match(/\d+/)[0];
                                        ;
                                        ;
                                        ;
                                        WSEBLOG.info(this, 'WebSocketEmulatedProxy.onreadystatechange', {'timeout':connectionTimeout});
                                        break;
                                    }
                                }
                            }

                            var locations = create.responseText.split("\n");
                            var upstreamLocation = locations[0];
                            var downstreamLocation = locations[1];

                            // Since there might be redirection involved, use the location
                            // from the XMLHttpBridge as the original URL.
                            var createURI = new URI(create.xhr._location);
                            var upstreamURI = new URI(upstreamLocation);
                            var downstreamURI = new URI(downstreamLocation);

                            if (createURI.host.toLowerCase() != upstreamURI.host.toLowerCase()) {
                                throw new Error("Hostname in original URI does not match with the hostname in the upstream URI.")
                            }

                            if (createURI.host.toLowerCase() != downstreamURI.host.toLowerCase()) {
                                throw new Error("Hostname in original URI does not match with the hostname in the downstream URI.")
                            }

                            // Instead of directly using locations[0] as the upstream URL, construct the
                            // upstream URL using parts(scheme and authority) from the create URI so that
                            // tools such as Fortify can be satisfied while scanning the JS library.
                            $this._upstream = createURI.scheme + "://" + createURI.authority + upstreamURI.path;
                            $this._downstream = new WebSocketEmulatedProxyDownstream(downstreamLocation, $this.sequence, connectionTimeot);

                            //compare downstreamLocation with channel.location to check for redirected
                            var redirectUrl = downstreamLocation.substring(0, downstreamLocation.indexOf("/;e/"));
                            if (redirectUrl != $this.parent._location.toString().replace("ws", "http")) {
                                $this.parent._redirectUri = redirectUrl;
                            }
                            bindHandlers($this, $this._downstream);
                            // get response headers
                            // $this.parent.responseHeaders = create.getAllResponseHeaders();
                            doOpen($this);
                        }
                        else {
                            // failure, fire an error
                            doError($this);
                        }
                    }
                    break;
            }
        };

        create.send(null);
        ;
        ;
        ;
        WSEBLOG.exiting(this, 'WebSocketEmulatedProxy.connect');
    }

    /**
     * @private
     * @ignore
     */
    var doOpen = function ($this) {
        ;
        ;
        ;
        WSEBLOG.entering(this, 'WebSocketEmulatedProxy.doOpen');
        $this.readyState = 1;
        var channel = $this.parent;
        channel._acceptedProtocol = channel.responseHeaders["X-WebSocket-Protocol"] || ""; //get protocol

        var negotiatedExtensions = channel.responseHeaders["X-WebSocket-Extensions"];
        if (negotiatedExtensions) {
            var extensionArray = negotiatedExtensions.split(",");
            for (var i = 0; i < extensionArray.length; i++) {
                channel._negotiatedExtensions.push(extensionArray[i].replace(/^\s+|\s+$/g, ""));
            }
        }

        if ($this.useXDR) {
            this.upstreamXHR = null;
            openUpstream($this);  //open XDR if is IE8,IE9
        }
        $this._listener.connectionOpened($this.parent, channel._acceptedProtocol);
    }

    /**
     * @private
     * @ignore
     */
    function doError($this) {
        if ($this.readyState < 2) {
            ;
            ;
            ;
            WSEBLOG.entering(this, 'WebSocketEmulatedProxy.doError');
            $this.readyState = 2;
            if ($this.idleTimer) {
                clearTimeout($this.idleTimer);
            }
            if ($this.upstreamXHR != null) {
                $this.upstreamXHR.abort();
            }
            if ($this.onerror != null) {
                //$this.onerror();
                $this._listener.connectionFailed($this.parent);
            }
        }
    }

    /**
     * @private
     * @ignore
     */
    var doClose = function ($this, wasClean, code, reason) {
        ;
        ;
        ;
        WSEBLOG.entering(this, 'WebSocketEmulatedProxy.doClose');
        switch ($this.readyState) {
            case 2:
                break;
            case 0:
            case 1:
                $this.readyState = WebSocket.CLOSED;
                if ($this.idleTimer) {
                    clearTimeout($this.idleTimer);
                }
                if ($this.upstreamXHR != null) {
                    $this.upstreamXHR.abort();
                }
                if (typeof wasClean === 'undefined') {
                    $this._listener.connectionClosed($this.parent, true, 1005, "");
                }
                else {
                    $this._listener.connectionClosed($this.parent, wasClean, code, reason);
                }
                break;
            default:
            // ignore;
        }
    }

    var doBufferedAmountChange = function ($this) {
        // TODO: Re-implement bufferedAmountChange - failing on IE8
        //        if (!Object.defineProperty) {
        //            $this._listener.bufferedAmountChange($this.parent, $this.bufferedAmount);
        //        }
    }

    var handleMessage = function ($this, event) {
        ;
        ;
        ;
        WSEBLOG.finest("WebSocket.handleMessage: A WebSocket frame received on a WebSocket");
        if (event.text) {
            $this._listener.textMessageReceived($this.parent, event.text);
        } else if (event.data) {
            $this._listener.binaryMessageReceived($this.parent, event.data);
        }
    }

    var handlePing = function ($this) {
        // Reply PING with PONG via upstream
        // The wire representation of PONG frame is 0x8a 0x00
        var pongFrameBuffer = $rootModule.ByteBuffer.allocate(2);
        pongFrameBuffer.put(WSE_PONG_FRAME_CODE);
        pongFrameBuffer.put(0x00);
        pongFrameBuffer.flip();
        doSend($this, pongFrameBuffer);
    }

    var bindHandlers = function ($this, downstream) {
        ;
        ;
        ;
        WSEBLOG.entering(this, 'WebSocketEmulatedProxy.bindHandlers');
        downstream.onmessage = function (event) {
            switch (event.type) {
                case "message":
                    if ($this.readyState == 1) {
                        // dispatch only if open
                        handleMessage($this, event)
                    }
                    break;
            }
        }

        downstream.onping = function () {
            if ($this.readyState == 1) {
                handlePing($this);
            }
        }

        downstream.onerror = function () {
            // TODO error event (KG-3742)
            try {
                downstream.disconnect();
            }
            finally {
                doClose($this, true, $this.closeCode, $this.closeReason);
            }
        };
        downstream.onclose = function (event) {
            // TODO error event (KG-3742)
            try {
                downstream.disconnect();
            }
            finally {
                //TODO: read close code and reason from close frame when gateway sends close frame, for now, read from cache
                doClose($this, true, this.closeCode, this.closeReason);
                //doClose($this, event.wasClean, event.code, event.reason);
            }
        };
    }

    return WebSocketEmulatedProxy;
})();

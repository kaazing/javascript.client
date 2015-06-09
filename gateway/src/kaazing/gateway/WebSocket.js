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
 Creates a new ArrayBuffer of the given length in bytes.
 For details, click <a href="http://www.khronos.org/registry/typedarray/specs/latest/#5" target="_blank">here</a>.

 @constructor
 @name  ArrayBuffer
 @param {Number} length The length of the ArrayBuffer in bytes.
 @class The ArrayBuffer type describes a buffer used to store data for the array buffer views.
 Kaazing JavaScript client library supports ArrayBuffer only if the browser supports it.
 <BR />
 It does not provide any custom implementation of ArrayBuffer for browsers that does not support ArrayBuffer.
 <BR />
 The recommended practice is to use either <a href="./Blob.html">Blob</a> or <a href="./ByteBuffer.html">ByteBuffer</a>
 as a binary type for browsers that do not provide support for ArrayBuffer.
 For details on ArrayBuffer and ArrayBufferView, click <a href="http://www.khronos.org/registry/typedarray/specs/latest/#5" target="_blank">here</a>.
 */

/**
 Creates and immedately connects a new WebSocket instance..
 If the url is not valid, the constructor will throw a
 <code>SyntaxError</code>.

 If the port is blocked by the browser or if a secure connection is
 attemped from a non-secure origin, the constructor will throw a
 <code>SecurityException</code>.

 If any protocol value is invalid or if a protocol appears in the Array
 more than once, the constructor will throw a <code>SyntaxError</code>.

 <b>Application developers should use WebSocketFactory.createWebSocket function
 to create an instance of WebSocket.</b>

 @constructor
 @name  WebSocket
 @param  url {String}
 @param  protocols {String|String[]}

 @class WebSocket provides a bidirectional communication channel. <b>Application
 developers should use <code>WebSocketFactory#createWebSocket()</code> function to
 create an instance of WebSocket. </b>

 @see {@link WebSocketFactory#createWebSocket}
 See <a href="./WebSocketFactory.html">WebSocketFactory</a>.
 */

/**
 Disconnects the WebSocket. If code is not an integer equal to 1000
 or in the range 3000..4999, close() will throw an
 <code>InvalidAccessError</code>.

 The reason string must be at most 123 bytes when UTF-8 encoded. If the
 reason string is too long, close() will throw a <code>SyntaxError</code>.

 @name       close
 @return     {void}

 @function
 @memberOf   WebSocket#
 @param  code {Number}    <B>(Optional)</B> A numeric value indicating close code.
 @param  reason {String}  <B>(Optional)</B> A human readable string indicating why the client is closing the WebSocket
 */

/**
 Sends a WebSocket message containing the given payload. Can be called with
 a String, Blob, ArrayBuffer or ByteBuffer. When send() is called with a String, a
 text WebSocket message is sent. When send() is called with a Blob, ArrayBuffer or
 ByteBuffer, a binary WebSocket message is sent.

 If send() is called with other data types an invalid type Error will be thrown.

 If send() is called while the WebSocket is in the CONNECTING state,
 an <code>InvalidStateError</code> will be thrown.

 @name       send
 @return     {void}

 @public
 @function
 @memberOf   WebSocket#
 @param  data {String|Blob|ArrayBuffer|ByteBuffer}   message payload
 */

/**
 Gets the ChallengeHandler that is used during authentication both at the
 connect-time as well as at subsequent revalidation-time that occurs at
 regular intervals.

 @name      getChallengeHandler
 @return {ChallengeHandler}

 @public
 @function
 @memberOf  WebSocket#
 */

/**
 Sets the ChallengeHandler that is used during authentication both at the
 connect-time as well as at subsequent revalidation-time that occurs at
 regular intervals.

 @name      setChallengeHandler
 @return {void}

 @public
 @function
 @memberOf  WebSocket#
 @param challengeHandler {ChallengeHandler}  used for authentication
 */

/**
 Gets the default HTTP redirect policy used in a clustered environment for
 this connection. Default redirect policy is HttpRedirectPolicy.ALWAYS.

 @name   getRedirectPolicy
 @return {HttpRedirectPolicy}

 @public
 @function
 @memberOf  WebSocket#
 */

/**
 Sets the HTTP redirect policy used in a clustered environment for this
 connection. Overrides the redirect policy inherited from WebSocketFactory.

 @name   setRedirectPolicy
 @return {void}

 @public
 @function
 @memberOf  WebSocket#
 @param redirectPolicy {HttpRedirectPolicy}  HTTP redirect policy
 */

/**
 <B>(Read only)</B> Connect timeout in milliseconds. The timeout will expire if
 there is no exchange of packets(for example, 100% packet loss) while
 establishing the connection. A timeout value of zero indicates
 no timeout.

 @field
 @readonly
 @name connectTimeout
 @type Number(Integer)
 @memberOf WebSocket#
 */

/**
 <B>(Read only)</B> State of the connection.
 It can be one of the following constants - <BR /><BR />
 <B>CONNECTING(0):</B> The connection is not yet open.<BR />
 <B>OPEN(1):</B> The connection is open and ready to communicate.<BR />
 <B>CLOSING(2):</B> The connection is in the process of closing.<BR />
 <B>CLOSED(3):</B> The connection is closed or couldn't be opened.<BR />

 @field
 @readonly
 @name       readyState
 @type       Number
 @memberOf   WebSocket#
 */

/**
 <B>(Read only)</B> Number of bytes that are queued to send but not yet written to the
 network.

 @field
 @readonly
 @name       bufferedAmount
 @type       Number
 @memberOf   WebSocket#
 */

/**
 <B>(Read only)</B> Protocol name selected by the WebSocket server during the connection
 handshake.

 @field
 @readonly
 @name       protocol
 @type       String
 @memberOf   WebSocket#
 */

/*
 <B>(Read only)</B> Extensions chosen by the server during the connection handshake. If
 the connection has not yet been established, or if no extensions were selected,
 this property will be the empty string.

 Ignore for time being as we should figure out our extension strategy before exposing
 anything publicly.

 @ignore
 @field
 @readonly
 @name       extensions
 @type       String
 @memberOf   WebSocket#
 */

/**
 <B>(Read only)</B> WebSocket end-point or location.

 @field
 @readonly
 @name       url
 @type       String
 @memberOf   WebSocket#
 */

/**
 Type of binary data for message events. Valid values are "blob", "arraybuffer"
 and "bytebuffer". Blob and ByteBuffer will work on any supported browser.
 ArrayBuffer is only an allowable value on browsers that support the
 <a href="http://www.khronos.org/registry/typedarray/specs/latest/">
 Typed Array Specification
 </a>.
 If this property is set to an invalid type, a <code>SyntaxError</code> will
 be thrown.

 NOTE: On older platforms where setter cannot be defined, the value is checked
 onmessage is fired.
 If set to an invalid value, the error event is fired.

 @field
 @name       binaryType
 @type       String
 @memberOf   WebSocket#
 */

// Callbacks

/**
 MessageEvent handler property.
 See <a href="./MessageEvent.html">MessageEvent</a>.

 @field
 @name       onmessage
 @type       Function
 @memberOf   WebSocket#
 */

/**
 OpenEvent handler property.

 @field
 @name       onopen
 @type       Function
 @memberOf   WebSocket#
 */

/**
 ErrorEvent handler property.

 @field
 @name       onerror
 @type       Function
 @memberOf   WebSocket#
 */

/**
 CloseEvent handler property.
 See <a href="./CloseEvent.html">CloseEvent</a>.

 @field
 @name       onclose
 @type       Function
 @memberOf   WebSocket#
 */

// Events

/**
 Event fired when a WebSocket message arrives.
 The <code>data</code> property of the MessageEvent will be a String when
 the WebSocket message is a WebSocket text message. It will be the type
 specified by <code>binaryType</code> if the message is a WebSocket
 binary message.

 @event
 @name       message
 @memberOf   WebSocket#
 */

/**
 Event fired when the WebSocket connection opens.

 @event
 @name       open
 @memberOf   WebSocket#
 */

/**
 Event fired when the WebSocket closes uncleanly.

 @event
 @name       error
 @memberOf   WebSocket#
 */

/**
 Event fired when the WebSocket connection closes.
 See <a href="./CloseEvent.html">CloseEvent</a>.

 @event
 @name       close
 @memberOf   WebSocket#
 */

(function ($rootModule, $module) {
    var _handler = new WebSocketCompositeHandler(); //singleton handler chain.

    $module.WebSocket = (function () {

        ;;;var CLASS_NAME = "WebSocket";
        ;;;var LOG = Logger.getLogger(CLASS_NAME);
        var webSocketChannelListener = {};

        var WebSocket = function (url, protocol, challengeHandler, connectTimeout, redirectPolicy) {
            ;
            ;
            ;
            LOG.entering(this, 'WebSocket.<init>', {'url': url, 'protocol': protocol});
            this.url = url;
            this.protocol = protocol;
            this.connectTimeout = 0;
            this._challengeHandler = challengeHandler;  // _challengeHandler is not public
            this._redirectPolicy = HttpRedirectPolicy.ALWAYS;

            if (typeof(connectTimeout) != "undefined") {
                validateConnectTimeout(connectTimeout);
                this.connectTimeout = connectTimeout;
            }

            if (typeof(redirectPolicy) != "undefined") {
                validateHttpRedirectPolicy(redirectPolicy);
                this._redirectPolicy = redirectPolicy;
            }

            this._queue = [];
            this._origin = "";
            this._eventListeners = {};
            setProperties(this);

            // connect
            connect(this, this.url, this.protocol, this._challengeHandler, this.connectTimeout);
        };

        // verify single protocol per WebSocket API spec (May 2012)
        var verifyOneProtocol = function (s) {
            if (s.length == 0) {
                return false;
            }

            var separators = "()<>@,;:\\<>/[]?={}\t \n"; // from RFC 2616

            for (var i = 0; i < s.length; i++) {
                var c = s.substr(i, 1);
                if (separators.indexOf(c) != -1) {
                    return false;
                }
                var code = s.charCodeAt(i);
                if (code < 0x21 || code > 0x7e) {
                    return false;
                }
            }
            return true;
        }

        // verify protocol(s) argument per WebSocket API spec (May 2012)
        var verifyProtocol = function (protocol) {
            if (typeof(protocol) === "undefined") {
                return true;
            } else if (typeof(protocol) === "string") {
                return verifyOneProtocol(protocol);
            } else {
                for (var i = 0; i < protocol.length; i++) {
                    if (!verifyOneProtocol(protocol[i])) {
                        return false;
                    }
                }
                return true;
            }
        }

        var connect = function ($this, location, protocol, challengeHandler, connectTimeout) {
            if (!verifyProtocol(protocol)) {
                throw new Error("SyntaxError: invalid protocol: " + protocol)
            }
            var uri = new WSCompositeURI(location);
            // bad x-origin check
            if (!uri.isSecure() && document.location.protocol === "https:") {
                throw new Error("SecurityException: non-secure connection attempted from secure origin");
            }
            var requestedProtocols = [];
            if (typeof(protocol) != "undefined") {
                if (typeof protocol == "string" && protocol.length) {
                    requestedProtocols = [protocol];
                } else if (protocol.length) {
                    requestedProtocols = protocol;
                }
            }
            $this._channel = new WebSocketCompositeChannel(uri, requestedProtocols);
            $this._channel._webSocket = $this;
            $this._channel._webSocketChannelListener = webSocketChannelListener;

            if (typeof(challengeHandler) != "undefined") {
                $this._channel.challengeHandler = challengeHandler;
            }

            if ((typeof(connectTimeout) != "undefined") && (connectTimeout > 0)) {
                var $channel = $this._channel;
                var connectTimer = new ResumableTimer(function () {
                        if ($channel.readyState == WebSocket.CONNECTING) {
                            // Inform the app by raising the CLOSE event.
                            _handler.doClose($channel, false, 1006, "Connection timeout");

                            // Try closing the connection all the way down. This may
                            // block when there is a network loss. That's why we are
                            // first informing the application about the connection
                            // timeout.
                            _handler.processClose($channel, 0, "Connection timeout");
                            $channel.connectTimer = null;
                        }
                    },
                    connectTimeout,
                    false);
                $this._channel.connectTimer = connectTimer;
                connectTimer.start();
            }

            _handler.processConnect($this._channel, uri.getWSEquivalent());
        }

        function setProperties($this) {
            // initialize null callback properties "TreatNonCallableAsNull"
            $this.onmessage = null;
            $this.onopen = null;
            $this.onclose = null;
            $this.onerror = null;

            if (Object.defineProperty) {
                try {
                    // readyState getters will work with pipeline
                    Object.defineProperty($this, "readyState", {
                        get: function () {
                            if ($this._channel) {
                                return $this._channel.readyState;
                            }
                            else {
                                return WebSocket.CLOSED; //_channel has been deleted, closed
                            }
                        },
                        set: function () {
                            throw new Error("Cannot set read only property readyState");
                        }
                    });
                    // binaryType property use getters and setters
                    var _binaryType = "blob";
                    Object.defineProperty($this, "binaryType", {
                        enumerable: true,
                        configurable: true,
                        get: function () {
                            return _binaryType;
                        },
                        set: function (val) {
                            if (val === "blob" || val === "arraybuffer" || val === "bytebuffer") {
                                _binaryType = val;
                            } else {
                                throw new SyntaxError("Invalid binaryType. Valid values are 'blob', 'arraybuffer' and 'bytebuffer'");
                            }
                        }
                    });
                    // native getters will work with native WebSocket pipeline
                    Object.defineProperty($this, "bufferedAmount", {
                        get: function () {
                            return $this._channel.getBufferedAmount();
                        },
                        set: function () {
                            throw new Error("Cannot set read only property bufferedAmount");
                        }
                    });
                } catch (ex) {
                    // error threw if running with IE10 set to IE8 mode
                    $this.readyState = WebSocket.CONNECTING;
                    $this.binaryType = "blob";
                    $this.bufferedAmount = 0;
                }
            } else {
                // fallback for oldest JS implemntations
                // property will be updated reactively for browsers not supporting
                // es 5.1 objects
                $this.readyState = WebSocket.CONNECTING;
                $this.binaryType = "blob";
                $this.bufferedAmount = 0;
            }
        }

        var $prototype = WebSocket.prototype;


        /**
         * Sends text-based data to the remote socket location.
         * @private
         *
         * @param  data  the data payload
         */
        $prototype.send = function (data) {
            //LOG.debug("ENTRY WebSocket.send with {0}", data)
            switch (this.readyState) {
                case 0:
                    ;
                    ;
                    ;
                    LOG.error("WebSocket.send: Error: Attempt to send message on unopened or closed WebSocket")
                    throw new Error("Attempt to send message on unopened or closed WebSocket");

                case 1:
                    if (typeof(data) === "string") {
                        _handler.processTextMessage(this._channel, data);
                    } else {
                        _handler.processBinaryMessage(this._channel, data);
                    }
                    break;

                case 2:
                case 3:
                    break;

                default:
                    ;
                    ;
                    ;
                    LOG.error("WebSocket.send: Illegal state error");
                    throw new Error("Illegal state error");
            }
        }

        /**
         * Disconnects the remote socket location.
         * @private
         */
        $prototype.close = function (code, reason) {
            if (typeof code != "undefined") {
                if (code != 1000 && (code < 3000 || code > 4999)) {
                    var invalidCodeError = new Error("code must equal to 1000 or in range 3000 to 4999");
                    invalidCodeError.name = "InvalidAccessError";
                    throw invalidCodeError;
                }
            }

            if (typeof reason != "undefined" && reason.length > 0) {
                //convert reason to UTF 8
                var buf = new $rootModule.ByteBuffer();
                buf.putString(reason, Charset.UTF8);
                buf.flip();
                if (buf.remaining() > 123) {
                    throw new SyntaxError("SyntaxError: reason is longer than 123 bytes");
                }
            }

            //LOG.debug("ENTRY WebSocket.close")
            switch (this.readyState) {
                case 0:
                case 1:
                    _handler.processClose(this._channel, code, reason);
                    break;
                case 2:
                case 3:
                    break;
                default:
                    ;
                    ;
                    ;
                    LOG.error("WebSocket.close: Illegal state error");
                    throw new Error("Illegal state error");
            }
        }

        /**
         * Gets the ChallengeHandler.
         * @private
         */
        $prototype.getChallengeHandler = function () {
            return this._challengeHandler || null;
        }

        /**
         * Sets the ChallengeHandler.
         * @private
         */
        $prototype.setChallengeHandler = function (challengeHandler) {
            if (typeof(challengeHandler) == "undefined") {
                var s = "WebSocket.setChallengeHandler(): Parameter \'challengeHandler\' is required";
                throw new Error(s);
            }

            this._challengeHandler = challengeHandler;
            this._channel.challengeHandler = challengeHandler;
        }

        /**
         * Gets the HTTP redirect policy.
         * @private
         */
        $prototype.getRedirectPolicy = function () {
            return this._redirectPolicy;
        }

        /**
         * Sets the HTTP redirect policy.
         * @private
         */
        $prototype.setRedirectPolicy = function (redirectPolicy) {
            validateHttpRedirectPolicy(redirectPolicy);
            this._redirectPolicy = redirectPolicy;
        }

        var validateConnectTimeout = function (connectTimeout) {
            if (typeof(connectTimeout) == "undefined") {
                var s = "WebSocket.setConnectTimeout(): int parameter \'connectTimeout\' is required";
                throw new Error(s);
            }

            if (typeof(connectTimeout) != "number") {
                var s = "WebSocket.setConnectTimeout(): connectTimeout should be an integer";
                throw new Error(s);
            }

            if (connectTimeout < 0) {
                var s = "WebSocket.setConnectTimeout(): Connect timeout cannot be negative";
                throw new Error(s);
            }

            return;
        }

        var validateHttpRedirectPolicy = function (redirectPolicy) {
            if (typeof(redirectPolicy) == "undefined") {
                var s = "WebSocket.validateHttpRedirectPolicy(): Parameter \'redirectPolicy\' is required";
                throw new Error(s);
            }

            if (!(redirectPolicy instanceof $module.HttpRedirectPolicy)) {
                var s = "WebSocket.validateHttpRedirectPolicy(): Parameter \'redirectPolicy\' must be of type Kaazing.Gateway.HttpRedirectPolicy";
                throw new Error(s);
            }
        }

        var doMessage = function ($this, data) {
            var messageEvent = new MessageEvent($this, data, $this._origin);
            $this.dispatchEvent(messageEvent);
        }

        var deliver = function ($this) {
            var start = new Date().getTime();
            var delay = start + 50; // Deliver messages for up to 50 milliseconds

            while ($this._queue.length > 0) {
                // Reschedule delivery if too much time has passed since we started
                if (new Date().getTime() > delay) {
                    setTimeout(function () {
                        deliver($this);
                    }, 0);
                    return;
                }

                var buf = $this._queue.shift();
                var ok = false;
                try {
                    if ($this.readyState == WebSocket.OPEN) {
                        doMessage($this, buf);

                        // No exception thrown
                        ok = true;
                    }
                    else {
                        // WebSocket is already closed, clear queue and return
                        $this._queue = [];
                        return;
                    }
                }
                finally {
                    if (!ok) {
                        if ($this._queue.length == 0) {
                            $this._delivering = false;
                        }
                        else {
                            // Schedule delivery of subsequent queued messages
                            setTimeout(function () {
                                deliver($this);
                            }, 0);
                        }
                        // The client application exception is thrown out of the finally block here!
                    }
                }
            }

            $this._delivering = false;
        }


        var doClose = function ($this, wasClean, code, reason) {
            ;
            ;
            ;
            LOG.entering($this, 'WebSocket.doClose');

            delete $this._channel; //clean up channel
            setTimeout(function () {
                var closeEvent = new CloseEvent($this, wasClean, code, reason);
                $this.dispatchEvent(closeEvent);
            }, 0);
        }

        webSocketChannelListener.handleOpen = function ($this, protocol) {
            //LOG.debug("ENTRY WebSocket.handleOpen with {0}", event)
            // Create new event dispatched with WebSocket as target
            $this.protocol = protocol;
            var openEvent = {type: "open", bubbles: true, cancelable: true, target: $this};
            $this.dispatchEvent(openEvent);
        }

        webSocketChannelListener.handleMessage = function ($this, obj) {

            // On platforms where a setter can be defined, we should check
            // binary type at the time it is set and throw an exception. On
            // older platforms, the value should be checked at the time it
            // is relevant, specifically when onmessage is fired. If set
            // to an invalid value, the onerror listener can be fired with
            // an error event.
            if (!Object.defineProperty && !(typeof(obj) === "string")) {
                var binaryType = $this.binaryType;
                if (!(binaryType === "blob" || binaryType === "arraybuffer" || binaryType === "bytebuffer")) {
                    var errorEvent = {
                        type: "error",
                        bubbles: true,
                        cancelable: true,
                        target: $this,
                        message: "Invalid binaryType. Valid values are 'blob', 'arraybuffer' and 'bytebuffer'"
                    };
                    $this.dispatchEvent(errorEvent);
                    return;
                }
            }

            //LOG.debug("ENTRY WebSocket.handleMessage with {0}", event)
            $this._queue.push(obj);
            if (!$this._delivering) {
                $this._delivering = true;
                deliver($this);
            }
        }

        webSocketChannelListener.handleClose = function ($this, wasClean, code, reason) {
            //LOG.debug("ENTRY WebSocket.handleClose with {0}", event)
            doClose($this, wasClean, code, reason);
        }

        webSocketChannelListener.handleError = function ($this, event) {
            ;
            ;
            ;
            LOG.entering($this, 'WebSocket.handleError' + event);
            setTimeout(function () {
                $this.dispatchEvent(event);
            }, 0);
        }

        webSocketChannelListener.handleBufferdAmountChange = function ($this, n) {
            $this.bufferedAmount = n;
        }

        // WebSocket implements EventTarget Interface
        // http://www.w3.org/TR/DOM-Level-3-Events/#interface-EventTarget

        /**
         @private
         @ignore
         @name addEventListener
         */
        $prototype.addEventListener = function (type, listener, capture) {
            this._eventListeners[type] = this._eventListeners[type] || [];
            this._eventListeners[type].push(listener);
        }

        /**
         @private
         @ignore
         @name removeEventListener
         */
        $prototype.removeEventListener = function (type, listener, capture) {
            var listeners = this._eventListeners[type];
            if (listeners) {
                for (var i = 0; i < listeners.length; i++) {
                    if (listeners[i] == listener) {
                        listeners.splice(i, 1);
                        return;
                    }
                }
            }
        }

        /**
         @private
         @ignore
         @name dispatchEvent
         */
        $prototype.dispatchEvent = function (e) {
            var type = e.type;
            if (!type) {
                throw new Error("Cannot dispatch invalid event " + e);
            }

            try {
                var callback = this["on" + type];
                if (typeof callback === "function") {
                    callback(e);
                }
            } catch (e) {
                ;
                ;
                ;
                LOG.severe(this, type + ' event handler: Error thrown from application');
            }

            var listeners = this._eventListeners[type];
            if (listeners) {
                for (var i = 0; i < listeners.length; i++) {
                    try {
                        listeners[i](e);
                    } catch (e2) {
                        ;
                        ;
                        ;
                        LOG.severe(this, type + ' event handler: Error thrown from application');
                    }
                }
            }
        }

        // readyState enum on prototype and constructor
        WebSocket.CONNECTING = $prototype.CONNECTING = 0;
        WebSocket.OPEN = $prototype.OPEN = 1;
        WebSocket.CLOSING = $prototype.CLOSING = 2;
        WebSocket.CLOSED = $prototype.CLOSED = 3;

        return WebSocket;
    })();
}(Kaazing, Kaazing.Gateway));

// This will help the rest of the code within the closure to access WebSocket by a
// straight variable name instead of using $module.WebSocket
var WebSocket = $module.WebSocket;

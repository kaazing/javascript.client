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
 * It is necessary to save a reference to window.WebSocket before defining
 * our own window.WebSocket in order to be able to construct native WebSockets
 *
 * @private
 */
var WebSocketNativeImpl = window.WebSocket;

/**
 * WebSocketNativeProxy wraps browsers' native WebSockets in order to communicate
 *  connection failure as error events and allow fallback from native.
 *
 * @class
 * @internal
 * @ignore
 */
var WebSocketNativeProxy = (function () {
    ;
    ;
    ;
    var WSNPLOG = Logger.getLogger('WebSocketNativeProxy');

    /**
     * @private
     * @ignore
     */
    var WebSocketNativeProxy = function () {

        this.parent;
        this._listener;
        this.code = 1005;
        this.reason = "";
    };

    // True if the WebSocket native implementation matches the old API & Hixie draft 76
    var draft76compat = (browser == "safari" && typeof(WebSocketNativeImpl.CLOSING) == "undefined");

    /**
     * True if the WebSocket native implementation is broken in older Android devices default browser
     *
     * @private
     * @ignore
     * @static
     */
    var brokenWebSocket = (browser == "android");

    var $prototype = WebSocketNativeProxy.prototype;

    $prototype.connect = function (location, protocol) {
        ;
        ;
        ;
        WSNPLOG.entering(this, 'WebSocketNativeProxy.<init>', {'location': location, 'protocol': protocol});

        // If the browser did not define window.WebSocket, then error (and fallback to emulated)
        // Android browsers define WebSocket support, but the sucky implmentation fails to fire onopen, so fallback
        if ((typeof(WebSocketNativeImpl) === "undefined") || brokenWebSocket) {
            doError(this);
            return;
        }

        // location may have a javascript: prefix, but the native WebSocket constructor
        // will only accept locations with ws or wss schemes
        if (location.indexOf("javascript:") == 0) {
            location = location.substr("javascript:".length);
        }

        var queryStart = location.indexOf("?");
        if (queryStart != -1) {
            if (!/[\?&]\.kl=Y/.test(location.substring(queryStart))) {
                location += "&.kl=Y"; //only add parameter once
            }
        } else {
            location += "?.kl=Y";
        }

        this._sendQueue = [];

        try {
            if (protocol) {
                this._requestedProtocol = protocol;
                this._delegate = new WebSocketNativeImpl(location, protocol);
            } else {
                this._delegate = new WebSocketNativeImpl(location);
            }
            this._delegate.binaryType = "arraybuffer"; //set arraybuffer for kaazing handshake
        } catch (e) {
            // If the native constructor throws an unexpected error, we would like
            // to attempt to connect with another strategy.
            // Allow the constructor to return successfully, then
            // call the error callback
            ;
            ;
            ;
            WSNPLOG.severe(this, 'WebSocketNativeProxy.<init> ' + e);
            doError(this);
            return;
        }
        bindHandlers(this);
    }

    /**
     * @private
     */
    $prototype.onerror = function () {
    };

    $prototype.onmessage = function () {
    };

    $prototype.onopen = function () {
    };

    $prototype.onclose = function () {
    };

    $prototype.close = function (code, reason) {
        ;
        ;
        ;
        WSNPLOG.entering(this, 'WebSocketNativeProxy.close');
        if (code) {
            if (draft76compat) {
                doCloseDraft76Compat(this, code, reason);
            }
            else {
                this._delegate.close(code, reason);
            }
        }
        else {
            this._delegate.close();
        }
    }

    function doCloseDraft76Compat($this, code, reason) {
        $this.code = code | 1005;
        $this.reason = reason | "";
        $this._delegate.close();
    }

    $prototype.send = function (message) {
        ;
        ;
        ;
        WSNPLOG.entering(this, 'WebSocketNativeProxy.send', message);

        doSend(this, message);
        return;
    }

    $prototype.setListener = function (listener) {
        this._listener = listener;
    };

    $prototype.setIdleTimeout = function (timeout) {
        ;
        ;
        ;
        WSNPLOG.entering(this, 'WebSocketNativeProxy.setIdleTimeout', timeout);

        // update the last message timestamp to the current timestamp
        this.lastMessageTimestamp = new Date().getTime();
        this.idleTimeout = timeout;
        startIdleTimer(this, timeout);
        return;
    }

    function doSend($this, message) {
        ;
        ;
        ;
        WSNPLOG.entering(this, 'WebSocketNativeProxy.doSend', message);
        if (typeof(message) == "string") {
            $this._delegate.send(message);
        } else if (message.byteLength || message.size) {
            $this._delegate.send(message);
        } else if (message.constructor == $rootModule.ByteBuffer) {
            $this._delegate.send(message.getArrayBuffer(message.remaining()));
        } else {
            ;
            ;
            ;
            WSNPLOG.severe(this, 'WebSocketNativeProxy.doSend called with unkown type ' + typeof(message));
            throw new Error("Cannot call send() with that type");
        }
    }

    function doError($this, e) {
        ;
        ;
        ;
        WSNPLOG.entering(this, 'WebSocketNativeProxy.doError', e);
        // TODO: the delay should be exposed at a higher level object (e.g. WebSocket), not here
        // delay the call to the error callback
        setTimeout(function () {
            $this._listener.connectionFailed($this.parent);
        }, 0);
    }

    function encodeMessageData($this, e) {
        var buf;
        // decode string or array buffer
        if (typeof e.data.byteLength !== "undefined") {
            buf = decodeArrayBuffer2ByteBuffer(e.data);
        } else {
            buf = $rootModule.ByteBuffer.allocate(e.data.length);
            if ($this.parent._isBinary && $this.parent._balanced > 1) {
                //ByteSocket, no decoding
                for (var i = 0; i < e.data.length; i++) {
                    buf.put(e.data.charCodeAt(i));
                }
            }
            else {
                //websocket, decode data with utf8
                buf.putString(e.data, Charset.UTF8);
            }
            buf.flip();
        }
        return buf;
    }

    function messageHandler($this, e) {
        ;
        ;
        ;
        WSNPLOG.entering(this, 'WebSocketNativeProxy.messageHandler', e);
        $this.lastMessageTimestamp = new Date().getTime();
        if (typeof(e.data) === "string") {
            $this._listener.textMessageReceived($this.parent, e.data);
        } else {
            $this._listener.binaryMessageReceived($this.parent, e.data);
        }
    }

    function closeHandler($this, e) {
        ;
        ;
        ;
        WSNPLOG.entering(this, 'WebSocketNativeProxy.closeHandler', e);
        //$this.onclose(e);
        unbindHandlers($this);
        if (draft76compat) {
            $this._listener.connectionClosed($this.parent, true, $this.code, $this.reason);
        }
        else {
            $this._listener.connectionClosed($this.parent, e.wasClean, e.code, e.reason);
        }
    }

    function errorHandler($this, e) {
        ;
        ;
        ;
        WSNPLOG.entering(this, 'WebSocketNativeProxy.errorHandler', e);
        //$this.onerror(e);
        //unbindHandlers($this);
        $this._listener.connectionError($this.parent, e);
    }

    function openHandler($this, e) {
        ;
        ;
        ;
        WSNPLOG.entering(this, 'WebSocketNativeProxy.openHandler', e);
        //KG-2770: Safari 5.1 does not set protocol property
        // force server agreement to requested protocol
        if (draft76compat) {
            $this._delegate.protocol = $this._requestedProtocol;
        }
        $this._listener.connectionOpened($this.parent, $this._delegate.protocol);
    }

    function bindHandlers($this) {
        ;
        ;
        ;
        WSNPLOG.entering(this, 'WebSocketNativeProxy.bindHandlers');
        var delegate = $this._delegate;
        delegate.onopen = function (e) {
            openHandler($this, e);
        }
        delegate.onmessage = function (e) {
            messageHandler($this, e);
        }
        delegate.onclose = function (e) {
            closeHandler($this, e);
        }
        delegate.onerror = function (e) {
            errorHandler($this, e);
        }
        $this.readyState = function () {
            return delegate.readyState;
        }
    }

    function unbindHandlers($this) {
        ;
        ;
        ;
        WSNPLOG.entering(this, 'WebSocketNativeProxy.unbindHandlers');
        var delegate = $this._delegate;
        delegate.onmessage = undefined;
        delegate.onclose = undefined;
        delegate.onopen = undefined;
        delegate.onerror = undefined;
        $this.readyState = WebSocket.CLOSED;
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
            // inactivity timeout reached, report close and close underline connection
            try {
                var delegate = $this._delegate;
                if (delegate) {
                    unbindHandlers($this);
                    delegate.close();
                }
            } finally {
                $this._listener.connectionClosed($this.parent, false, 1006, "");
            }
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

    return WebSocketNativeProxy;
})();

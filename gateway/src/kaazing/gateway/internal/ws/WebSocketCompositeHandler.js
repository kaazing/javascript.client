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
var WebSocketCompositeHandler = (function () {

    ;;;var CLASS_NAME = "WebSocketCompositeHandler";
    ;;;var _LOG = Logger.getLogger(CLASS_NAME);

    //when IE 10 runs as IE 8 mode, Object.defineProperty returns true, but throws exception when called
    // so use a dummyObj to check Object.defineProperty function really works at page load time.
    var legacyBrowser = true;
    var dummyObj = {};
    if (Object.defineProperty) {
        try {
            Object.defineProperty(dummyObj, "prop", {
                get: function () {
                    return true;
                }
            });
            legacyBrowser = false;
        }
        catch (e) {
        }
    }

    var WebSocketCompositeHandler = function () {
        this._handlerListener = createListener(this);
    };

    function createListener($this) {
        var listener = {};
        listener.connectionOpened = function (channel, protocol) {
            $this.handleConnectionOpened(channel, protocol);
        }
        listener.binaryMessageReceived = function (channel, buf) {
            $this.handleMessageReceived(channel, buf);
        }
        listener.textMessageReceived = function (channel, text) {
            var parent = channel.parent;
            parent._webSocketChannelListener.handleMessage(parent._webSocket, text);
        }
        listener.connectionClosed = function (channel, wasClean, code, reason) {
            $this.handleConnectionClosed(channel, wasClean, code, reason);
        }
        listener.connectionFailed = function (channel) {
            $this.handleConnectionFailed(channel);
        }
        listener.connectionError = function (channel, e) {
            $this.handleConnectionError(channel, e);
        }
        listener.authenticationRequested = function (channel, location, challenge) {
        }
        listener.redirected = function (channel, location) {
        }
        listener.onBufferedAmountChange = function (channel, n) {
            $this.handleBufferedAmountChange(channel, n);
        }
        return listener;
    }

    var $prototype = WebSocketCompositeHandler.prototype;

    $prototype.initDelegate = function (channel, strategyName) {
        var strategy = WebSocketStrategy._strategyMap[strategyName];

        // inject listener to the handler corresponding to the strategy
        strategy._handler.setListener(this._handlerListener);

        var channelFactory = strategy._channelFactory;
        var location = channel._location;
        var selectedChannel = channelFactory.createChannel(location, channel._protocol);
        channel._selectedChannel = selectedChannel;
        selectedChannel.parent = channel;
        selectedChannel._handler = strategy._handler;
        selectedChannel._handler.processConnect(channel._selectedChannel, location, channel._protocol);
    }

    $prototype.fallbackNext = function (channel) {
        ;;;_LOG.finest(CLASS_NAME, "fallbackNext");
        var strategyName = channel.getNextStrategy();
        if (strategyName == null) {
            this.doClose(channel, false, 1006, "");
        }
        else {
            this.initDelegate(channel, strategyName);
        }
    }

    $prototype.doOpen = function (channel, protocol) {
        if (channel._lastErrorEvent !== undefined) {
            delete channel._lastErrorEvent;
        }

        if (channel.readyState === WebSocket.CONNECTING) {
            channel.readyState = WebSocket.OPEN;
            if (legacyBrowser) {
                channel._webSocket.readyState = WebSocket.OPEN;
            }
            channel._webSocketChannelListener.handleOpen(channel._webSocket, protocol);
        }
    }


    $prototype.doClose = function (channel, wasClean, code, reason) {
        if (channel._lastErrorEvent !== undefined) {
            channel._webSocketChannelListener.handleError(channel._webSocket, channel._lastErrorEvent);
        }

        if (channel.readyState === WebSocket.CONNECTING || channel.readyState === WebSocket.OPEN || channel.readyState === WebSocket.CLOSING) {
            channel.readyState = WebSocket.CLOSED;
            if (legacyBrowser) {
                channel._webSocket.readyState = WebSocket.CLOSED;
            }
            channel._webSocketChannelListener.handleClose(channel._webSocket, wasClean, code, reason);
        }
    }

    $prototype.doBufferedAmountChange = function (channel, n) {
        channel._webSocketChannelListener.handleBufferdAmountChange(channel._webSocket, n);
    }

    $prototype.processConnect = function (channel, location, protocol) {
        ;;;_LOG.finest(CLASS_NAME, "connect", channel);
        var compositeChannel = channel;
        ;;;_LOG.finest("Current ready state = " + compositeChannel.readyState);
        if (compositeChannel.readyState === WebSocket.OPEN) {
            ;;;_LOG.fine("Attempt to reconnect an existing open WebSocket to a different location");
            throw new Error("Attempt to reconnect an existing open WebSocket to a different location");
        }
        var scheme = compositeChannel._compositeScheme;
        if (scheme != "ws" && scheme != "wss") {
            var strategy = WebSocketStrategy._strategyMap[scheme];
            if (strategy == null) {
                throw new Error("Invalid connection scheme: " + scheme);
            }
            ;;;_LOG.finest("Turning off fallback since the URL is prefixed with java:");
            compositeChannel._connectionStrategies.push(scheme);
        }
        else {
            var connectionStrategies = WebSocketStrategy._strategyChoices[scheme];
            if (connectionStrategies != null) {
                for (var i = 0; i < connectionStrategies.length; i++) {
                    compositeChannel._connectionStrategies.push(connectionStrategies[i]);
                }
            }
            else {
                throw new Error("Invalid connection scheme: " + scheme);
            }
        }
        this.fallbackNext(compositeChannel);
    }

    /*synchronized*/
    $prototype.processTextMessage = function (channel, message) {
        ;;;_LOG.finest(CLASS_NAME, "send", message);
        var parent = channel;
        if (parent.readyState != WebSocket.OPEN) {
            ;;;_LOG.fine("Attempt to post message on unopened or closed web socket");
            throw new Error("Attempt to post message on unopened or closed web socket");
        }
        var selectedChannel = parent._selectedChannel;
        selectedChannel._handler.processTextMessage(selectedChannel, message);
    }


    /*synchronized*/
    $prototype.processBinaryMessage = function (channel, message) {
        ;;;_LOG.finest(CLASS_NAME, "send", message);
        var parent = channel;
        if (parent.readyState != WebSocket.OPEN) {
            ;;;_LOG.fine("Attempt to post message on unopened or closed web socket");
            throw new Error("Attempt to post message on unopened or closed web socket");
        }
        var selectedChannel = parent._selectedChannel;
        selectedChannel._handler.processBinaryMessage(selectedChannel, message);
    }

    /*synchronized*/
    $prototype.processClose = function (channel, code, reason) {
        ;;;_LOG.finest(CLASS_NAME, "close");
        var parent = channel;

        if (channel.readyState === WebSocket.CONNECTING || channel.readyState === WebSocket.OPEN) {
            channel.readyState = WebSocket.CLOSING;
            if (legacyBrowser) {
                channel._webSocket.readyState = WebSocket.CLOSING;
            }
        }

        // When the connection timeout expires due to network loss, we first
        // invoke doClose() to inform the application immediately. Then, we
        // invoke processClose() to close the connection but it may take a
        // while to return. When doClose() is invoked, readyState is set to
        // CLOSED. However, we do want processClose() to be invoked all the
        // all the way down to close the connection. That's why we moved the
        // following two lines out of the IF statement that is above this
        // comment.
        var selectedChannel = parent._selectedChannel;
        selectedChannel._handler.processClose(selectedChannel, code, reason);

    }

    $prototype.setListener = function (listener) {
        this._listener = listener;
    }

    $prototype.handleConnectionOpened = function (channel, protocol) {
        var parent = channel.parent;
        this.doOpen(parent, protocol);
    }

    $prototype.handleMessageReceived = function (channel, obj) {
        var parent = channel.parent;
        switch (parent.readyState) {
            case WebSocket.OPEN:
                /*
                 * convert obj to correct datatype base on binaryType
                 */
                if (parent._webSocket.binaryType === "blob" && obj.constructor == $rootModule.ByteBuffer) {
                    //bytebuffer -> blob
                    obj = obj.getBlob(obj.remaining());
                }
                else if (parent._webSocket.binaryType === "arraybuffer" && obj.constructor == $rootModule.ByteBuffer) {
                    //bytebuffer -> arraybuffer
                    obj = obj.getArrayBuffer(obj.remaining());
                }
                else if (parent._webSocket.binaryType === "blob" && obj.byteLength) {
                    //arraybuffer -> blob
                    obj = new Blob([new Uint8Array(obj)]);
                }
                else if (parent._webSocket.binaryType === "bytebuffer" && obj.byteLength) {
                    //arraybuffer -> bytebuffer
                    var u = new Uint8Array(obj);
                    var bytes = [];
                    // copy bytes into $rootModule.ByteBuffer
                    for (var i = 0; i < u.byteLength; i++) {
                        bytes.push(u[i]);
                    }
                    obj = new $rootModule.ByteBuffer(bytes);
                }
                else if (parent._webSocket.binaryType === "bytebuffer" && obj.size) {
                    //blob -> bytebuffer
                    var cb = function (result) {
                        var b = new $rootModule.ByteBuffer();
                        b.putBytes(result);
                        b.flip();
                        parent._webSocketChannelListener.handleMessage(parent._webSocket, b);
                    };
                    BlobUtils.asNumberArray(cb, data);
                    return;
                }
                parent._webSocketChannelListener.handleMessage(parent._webSocket, obj);
                break;
            case WebSocket.CONNECTING:
            case WebSocket.CLOSING:
            case WebSocket.CLOSED:
                // ignore messages in other ready states
                break;
            default:
                throw new Error("Socket has invalid readyState: " + $this.readyState);
        }
    }

    $prototype.handleConnectionClosed = function (channel, wasClean, code, reason) {
        var parent = channel.parent;
        if (parent.readyState === WebSocket.CONNECTING && !channel.authenticationReceived && !channel.preventFallback) {
            this.fallbackNext(parent);
        }
        else {
            this.doClose(parent, wasClean, code, reason);
        }
    }

    $prototype.handleConnectionFailed = function (channel) {
        var parent = channel.parent;

        var closeCode = 1006;
        var closeReason = "";

        if (channel.closeReason.length > 0) {
            closeCode = channel.closeCode;
            closeReason = channel.closeReason;
        }

        if (parent.readyState === WebSocket.CONNECTING && !channel.authenticationReceived && !channel.preventFallback) {
            this.fallbackNext(parent);
        }
        else {
            this.doClose(parent, false, closeCode, closeReason);
        }
    }

    $prototype.handleConnectionError = function (channel, e) {
        channel.parent._lastErrorEvent = e;
    }

    return WebSocketCompositeHandler;
})();

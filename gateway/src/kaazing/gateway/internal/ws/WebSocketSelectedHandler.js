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
var WebSocketSelectedHandler = (function () {

    ;;;var CLASS_NAME = "WebSocketSelectedHandler";
    ;;;var _LOG = Logger.getLogger(CLASS_NAME);

    var WebSocketSelectedHandler = function () {
        ;;;_LOG.fine(CLASS_NAME, "<init>");
    };

    var $prototype = WebSocketSelectedHandler.prototype = new WebSocketHandlerAdapter();

    $prototype.processConnect = function (channel, uri, protocol) {
        ;;;_LOG.fine(CLASS_NAME, "connect", channel);
        if (channel.readyState == WebSocket.CLOSED) {
            throw new Error("WebSocket is already closed");
        }
        this._nextHandler.processConnect(channel, uri, protocol);
    }


    $prototype.handleConnectionOpened = function (channel, protocol) {
        ;;;_LOG.fine(CLASS_NAME, "handleConnectionOpened");
        var selectedChannel = channel;
        if (selectedChannel.readyState == WebSocket.CONNECTING) {
            selectedChannel.readyState = WebSocket.OPEN;
            this._listener.connectionOpened(channel, protocol);
        }
    }


    $prototype.handleMessageReceived = function (channel, message) {
        ;;;_LOG.fine(CLASS_NAME, "handleMessageReceived", message);
        if (channel.readyState != WebSocket.OPEN) {
            return;
        }
        this._listener.textMessageReceived(channel, message);
    }

    $prototype.handleBinaryMessageReceived = function (channel, message) {
        ;;;_LOG.fine(CLASS_NAME, "handleBinaryMessageReceived", message);
        if (channel.readyState != WebSocket.OPEN) {
            return;
        }
        this._listener.binaryMessageReceived(channel, message);
    }


    $prototype.handleConnectionClosed = function (channel, wasClean, code, reason) {
        ;;;_LOG.fine(CLASS_NAME, "handleConnectionClosed");
        var selectedChannel = channel;
        if (selectedChannel.readyState != WebSocket.CLOSED) {
            selectedChannel.readyState = WebSocket.CLOSED;
            this._listener.connectionClosed(channel, wasClean, code, reason);
        }
    }


    $prototype.handleConnectionFailed = function (channel) {
        ;;;_LOG.fine(CLASS_NAME, "connectionFailed");
        if (channel.readyState != WebSocket.CLOSED) {
            channel.readyState = WebSocket.CLOSED;
            this._listener.connectionFailed(channel);
        }
    }

    $prototype.handleConnectionError = function (channel, e) {
        ;;;_LOG.fine(CLASS_NAME, "connectionError");
        this._listener.connectionError(channel, e);
    }

    $prototype.setNextHandler = function (nextHandler) {
        this._nextHandler = nextHandler;
        var listener = {};
        var $this = this;
        listener.connectionOpened = function (channel, protocol) {
            $this.handleConnectionOpened(channel, protocol);
        }
        listener.redirected = function (channel, location) {
            throw new Error("invalid event received");
        }
        listener.authenticationRequested = function (channel, location, challenge) {
            throw new Error("invalid event received");
        }
        listener.textMessageReceived = function (channel, buf) {
            $this.handleMessageReceived(channel, buf);
        }
        listener.binaryMessageReceived = function (channel, buf) {
            //alert(CLASS_NAME + "messageReceived");
            $this.handleBinaryMessageReceived(channel, buf);
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
        nextHandler.setListener(listener);
    }

    $prototype.setListener = function (listener) {
        this._listener = listener;
    }

    return WebSocketSelectedHandler;
})();


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
var WebSocketHandlerAdapter = (function () {

    var WebSocketHandlerAdapter = function () {
        this._nextHandler /*:WebSocketHandler*/;
        this._listener /*:WebSocketHandlerListener*/;
    };

    var $prototype = WebSocketHandlerAdapter.prototype;

    $prototype.processConnect = function (channel, location, protocol) {
        this._nextHandler.processConnect(channel, location, protocol);
    }

    $prototype.processAuthorize = function (channel, authorizeToken) {
        this._nextHandler.processAuthorize(channel, authorizeToken);
    }

    $prototype.processTextMessage = function (channel, text) {
        this._nextHandler.processTextMessage(channel, text);
    }

    $prototype.processBinaryMessage = function (channel, buffer) {
        this._nextHandler.processBinaryMessage(channel, buffer);
    }

    $prototype.processClose = function (channel, code, reason) {
        this._nextHandler.processClose(channel, code, reason);
    }

    $prototype.setIdleTimeout = function (channel, timeout) {
        this._nextHandler.setIdleTimeout(channel, timeout);
    }

    $prototype.setListener = function (listener) {
        this._listener = listener;
    }

    $prototype.setNextHandler = function (handler) {
        this._nextHandler = handler;
    }

    return WebSocketHandlerAdapter;
})();

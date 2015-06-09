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
var WebSocketEmulatedHandler = (function () {
    ;;;var CLASS_NAME = "WebSocketEmulatedHandler";
    
    ;;;var LOG = Logger.getLogger(CLASS_NAME);

    var _authHandler = new WebSocketEmulatedAuthenticationHandler();
    var _controlFrameHandler = new WebSocketControlFrameHandler();
    var _delegateHandler = new WebSocketEmulatedDelegateHandler();
    var _extensionHandler = new WebSocketExtensionHandler();

    var WebSocketEmulatedHandler = function () {
        ;;;LOG.finest(CLASS_NAME, "<init>");
        this.setNextHandler(_authHandler);
        _authHandler.setNextHandler(_extensionHandler);

        // Parent handler is needed to setup handler pipeline of negotiated extensions
        // between _authHandler and _extensionHandler
        _extensionHandler.setParentHandler(_authHandler);
        _extensionHandler.setNextHandler(_controlFrameHandler)
        _controlFrameHandler.setNextHandler(_delegateHandler);
    };

    var $prototype = WebSocketEmulatedHandler.prototype = new WebSocketHandlerAdapter();

    $prototype.processConnect = function (channel, location, protocol) {
        var protocols = [];
        for (var i = 0; i < protocol.length; i++) {
            protocols.push(protocol[i]);
        }

        this._nextHandler.processConnect(channel, location, protocols);
    }

    $prototype.setNextHandler = function (nextHandler) {
        this._nextHandler = nextHandler;
        var $this = this;
        var listener = new WebSocketHandlerListener(this);

        listener.commandMessageReceived = function (channel, message) {
            if (message == "CloseCommandMessage" && channel.readyState == 1 /*ReadyState.OPEN*/) {
                //server initiated close, echo close command message
                //upstreamHandler.processClose(wsebChannel.upstreamChannel, ((CloseCommandMessage)message).getCode(), ((CloseCommandMessage)message).getReason());
            }
            $this._listener.commandMessageReceived(channel, message);
        }
        nextHandler.setListener(listener);
    }


    $prototype.setListener = function (listener) {
        this._listener = listener;
    }

    return WebSocketEmulatedHandler;
})();

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

// The extension handler delegates the control to the negotiated extensions
var WebSocketExtensionHandler = (function () {

    var WebSocketExtensionHandler = function () {
    }

    var $prototype = WebSocketExtensionHandler.prototype = new WebSocketHandlerAdapter();

    $prototype.handleConnectionOpened = function (channel, protocol) {
        var negotiatedExtensions = channel._negotiatedExtensions;
        if (negotiatedExtensions && negotiatedExtensions.length > 0) {
            var head = null;
            var tail = null
            // Create Extension Pipeline and attach it to the channel.
            // Extension pipeline is delegated the control from this class(WebSocketExtensionHandler)
            // Once the message is processed by the extension pipeline, the message is forwarded to
            // rest of the handler chain. Cannot attach extension pipeline to handler chain as it
            // is singleton but extension pipeline is per connection.
            for (var i = 0; i < negotiatedExtensions.length; i++) {
                var extensionElements = negotiatedExtensions[i].split(";");
                var extensionName = extensionElements[0].replace(/^\s+|\s+$/g, "");
                var extensionParameter = null;

                if (extensionElements.length == 2) {
                    extensionParameter = extensionElements[1].replace(/^\s+|\s+$/g, "");
                }

                var extensionSpiFactory = WebSocketExtensionSpi.get(extensionName);
                var extensionSpi = extensionSpiFactory.create(extensionParameter);
                if (head == null) {
                    head = extensionSpi;
                }
                if (tail == null) {
                    tail = extensionSpi;
                }
                else {
                    tail.setNext(extensionSpi);
                }
            }
            tail.setNext(this);
            channel._extensionPipeline = head;
        }
        this._listener.connectionOpened(channel, protocol);
    }

    // ----- START: Handler Pipeline ----- //
    $prototype.handleTextMessageReceived = function (channel, message) {
        if (channel._extensionPipeline == null) {
            this._listener.textMessageReceived(channel, message);
        }
        else {
            channel._extensionPipeline.onTextReceived(channel, message);
        }
    }

    $prototype.handleMessageReceived = function (channel, message) {
        if (channel._extensionPipeline == null) {
            this._listener.binaryMessageReceived(channel, message);
        }
        else {
            channel._extensionPipeline.onBinaryReceived(channel, message);
        }
    }
    // ----- END: Handler Pipeline ----- //

    // ----- START: Extension Pipeline ----- //
    $prototype.onTextReceived = function(channel, message) {
        this._listener.textMessageReceived(channel, message);
    }

    $prototype.onBinaryReceived = function(channel, message) {
        this._listener.binaryMessageReceived(channel, message);
    }
    // ----- END: Extension Pipeline ----- //

    $prototype.setNextHandler = function (nextHandler) {
        var $this = this;
        this._nextHandler = nextHandler;
        var listener = new WebSocketHandlerListener(this);
        listener.connectionOpened = function (channel, protocol) {
            $this.handleConnectionOpened(channel, protocol);
        }
        listener.textMessageReceived = function (channel, buf) {
            $this.handleTextMessageReceived(channel, buf);
        }
        listener.binaryMessageReceived = function (channel, buf) {
            $this.handleMessageReceived(channel, buf);
        }
        nextHandler.setListener(listener);
    }

    $prototype.setListener = function (listener) {
        this._listener = listener;
    }

    $prototype.setParentHandler = function (parentHandler) {
        this._parentHandler = parentHandler;
    }

    return WebSocketExtensionHandler;
})();

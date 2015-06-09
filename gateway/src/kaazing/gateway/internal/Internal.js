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

// Internal Namespace object
// The objects attached to the Kaazing.Internal namespace are for internal purpose which will
// eventually be moved to Kaazing.Gateway namespace for public usage.
// NOTE: It is not recommended to use the objects from Kaazing.Internal namespace as they will
//       undergo frequent API changes.

/*
 * @private
 */
Kaazing.Internal = Kaazing.namespace("Internal");

(function ($module) {

    var WebSocketExtensionSpiFactory = (function () {
        var factorySpi = function (name, factoryFunction) {
            this.name = name;
            this.factoryFunction = factoryFunction;
        }

        var $prototype = factorySpi.prototype;

        $prototype.create = function (parameter) {
            return this.factoryFunction(parameter);
        }
        return factorySpi;
    })();

    Kaazing.Internal.WebSocketExtensionSpiFactory = WebSocketExtensionSpiFactory;

    var WebSocketExtensionSpi = (function () {
        var spi = function (name) {
            this.name = name;
        }

        var $prototype = spi.prototype = new WebSocketHandlerAdapter();

        $prototype.handleConnectionOpened = function (channel, protocol) {
            this._listener.connectionOpened(channel, protocol);
        }

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

        return spi;
    })();

    var registeredExtensions = [];

    WebSocketExtensionSpi.register = function (extensionSpiFactory) {
        registeredExtensions.push(extensionSpiFactory);
    };

    WebSocketExtensionSpi.get = function (name) {
        for (var i = 0; i < registeredExtensions.length; i++) {
            if (registeredExtensions[i].name == name) {
                return registeredExtensions[i];
            }
        }
        return null;
    }

    WebSocketExtensionSpi.getRegisteredExtensionNames = function () {
        var registeredExtensionNames = [];
        for (var i = 0; i < registeredExtensions.length; i++) {
            registeredExtensionNames.push(registeredExtensions[i].name);
        }
        return registeredExtensionNames;
    }

    $module.WebSocketExtensionSpi = WebSocketExtensionSpi;

})(Kaazing.Internal);

var WebSocketExtensionSpi = Kaazing.Internal.WebSocketExtensionSpi;

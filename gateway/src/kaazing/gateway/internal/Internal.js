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

(function($module){

    var WebSocketExtensionSpi = (function(){
        var spi = function(name) {
            this.name = name;
        }

        var $prototype = spi.prototype;

        $prototype.onBinaryReceived = function(channel, message) {
            handler._listener.binaryMessageReceived(channel, message);
        }

        $prototype.onTextReceived = function(channel, message) {
            handler._listener.textMessageReceived(channel, message);
        }

        return spi;
    })();

    WebSocketExtensionSpi._registeredExtensions = [];

    WebSocketExtensionSpi.register = function(name, factoryFunction) {
        var extensionInfo = {"name": name, "factoryFunction": factoryFunction}
        WebSocketExtensionSpi._registeredExtensions.push(extensionInfo);
    };

    WebSocketExtensionSpi.getRegisteredExtensionInfo = function(name) {
        var registeredExtensions = WebSocketExtensionSpi._registeredExtensions;
        for (var i = 0; i < registeredExtensions.length; i++) {
            if (registeredExtensions[i].name == name) {
                return registeredExtensions[i];
            }
        }
        return null;
    }

    WebSocketExtensionSpi.getRegisteredExtensionNames = function() {
        var registeredExtensionNames = [];
        var registeredExtensions = WebSocketExtensionSpi._registeredExtensions;
        for (var i = 0; i < registeredExtensions.length; i++) {
            registeredExtensionNames.push(registeredExtensions[i].name);
        }
        return registeredExtensionNames;
    }

    $module.WebSocketExtensionSpi = WebSocketExtensionSpi;

})(Kaazing.Internal);

var WebSocketExtensionSpi = Kaazing.Internal.WebSocketExtensionSpi;

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
var WebSocketCompositeChannel = (function() {

    var WebSocketCompositeChannel = function(location, protocol) {
        this._location = location.getWSEquivalent();
        this._protocol = protocol;

        this._webSocket;
        this._compositeScheme = location._compositeScheme;
        this._connectionStrategies/*<String>*/ = [];
        this._selectedChannel;
        this.readyState = 0; //WebSocket.CONNECTING;
        this._closing = false;
        this._negotiatedExtensions = {}; //server accepted extensions 

        this._compositeScheme = location._compositeScheme;
    };
        
    var $prototype = WebSocketCompositeChannel.prototype = new WebSocketChannel();

    $prototype.getReadyState = function() {
        return this.readyState;
    }

    $prototype.getWebSocket = function() {
        return this._webSocket;
    }

    $prototype.getCompositeScheme = function() {
        return this._compositeScheme;
    }

    $prototype.getNextStrategy = function() {
        if (this._connectionStrategies.length <= 0) {
            return null;
        }
        else {
            return this._connectionStrategies.shift();
        }
    }

    $prototype.getRedirectPolicy = function() {
        return this.getWebSocket().getRedirectPolicy();
    }

    return WebSocketCompositeChannel;
})();

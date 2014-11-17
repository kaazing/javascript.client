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
 * WebSocketRtmpFlashProxy provides a JavaScript WebSocket interface from the flash impl
 *
 * @private
 */
var WebSocketRtmpFlashProxy = (function() {
    ;;;var WSEFPLOG = Logger.getLogger('WebSocketRtmpFlashProxy');
    
    var WebSocketRtmpFlashProxy = function() {
        this.parent;
        this._listener;
    };

    var $prototype = WebSocketRtmpFlashProxy.prototype;

    $prototype.connect = function(location, protocol) {
        ;;;WSEFPLOG.entering(this, 'WebSocketRtmpFlashProxy.<init>', location);
        this.URL = location;
        // key is returned back from flash
        //console.log("js is registering a web socket for ", location)
        try {
            registerWebSocket(this, location, protocol);
        } catch(e) {
            ;;;WSEFPLOG.severe(this, 'WebSocketRtmpFlashProxy.<init> ' + e);
            doError(this, e);
        }
        this.constructor = WebSocketRtmpFlashProxy;
        ;;;WSEFPLOG.exiting(this, 'WebSocketRtmpFlashProxy.<init>');
    };

    $prototype.setListener = function(listener) {
			this._listener = listener;
	};
    
    // add the flash hook to the package private WebSocketRtmpFlashProxy object
    WebSocketEmulatedFlashProxy._flashBridge = {};
    WebSocketEmulatedFlashProxy._flashBridge.readyWaitQueue = [];
    WebSocketEmulatedFlashProxy._flashBridge.failWaitQueue = [];
    WebSocketEmulatedFlashProxy._flashBridge.flashHasLoaded = false;
    WebSocketEmulatedFlashProxy._flashBridge.flashHasFailed = false;

    $prototype.URL = "";
    $prototype.readyState = 0;
    $prototype.bufferedAmount = 0;
    
    //listener functions
    $prototype.connectionOpened = function(channel, headers) {
        var headers = headers.split("\n");
        for (var i = 0; i < headers.length; i++) {
            var header = headers[i].split(":");
            channel.responseHeaders[header[0]] = header[1];
        }
        this._listener.connectionOpened(channel, "");
    };
    
    $prototype.connectionClosed = function(channel, wasClean, code, reason) {
        this._listener.connectionClosed(channel, wasClean, code, reason);
    };
    
    $prototype.connectionFailed = function(channel) {
        this._listener.connectionFailed(channel);
    };
    
    $prototype.binaryMessageReceived = function(channel, data) {
        this._listener.binaryMessageReceived(channel, data);
    };
    
    $prototype.textMessageReceived = function(channel, s) {
        this._listener.textMessageReceived(channel, s);
    };
    
    $prototype.redirected = function(channel, location) {
        this._listener.redirected(channel, location);
    };
    
    $prototype.authenticationRequested = function(channel, location, challenge) {
        this._listener.authenticationRequested(channel, location, challenge);
    };

    $prototype.send = function(data) {
        ;;;WSEFPLOG.entering(this, 'WebSocketRtmpFlashProxy.send', data);
        switch (this.readyState) {
            case 0:
                ;;;WSEFPLOG.severe(this, 'WebSocketRtmpFlashProxy.send: readyState is 0');
                throw new Error("INVALID_STATE_ERR");
                break;
            case 1:
                //console.log("trying to send", data)
                if (data === null) {
                    ;;;WSEFPLOG.severe(this, 'WebSocketRtmpFlashProxy.send: Data is null');
                    throw new Error("data is null");
                }
                if (typeof(data) == "string") {
                    // send string message
                    WebSocketEmulatedFlashProxy._flashBridge.sendText(this._instanceId, data);
                } else if (typeof(data.array) == "object") {
                    var byteString;

                    var a = [];
                    var b;
                    while (data.remaining()) {
                        b = data.get();
                        a.push(String.fromCharCode(b));
                    }
                    var byteString = a.join("");
                    WebSocketEmulatedFlashProxy._flashBridge.sendByteString(this._instanceId, byteString);

                    return;
                } else {
                    ;;;WSEFPLOG.severe(this, 'WebSocketRtmpFlashProxy.send: Data is on invalid type ' + typeof(data));
                    throw new Error("Invalid type");
                }



                updateBufferedAmount(this);
                return true;
                break;
            case 2:
                return false;
                break;
            default:
                ;;;WSEFPLOG.severe(this, 'WebSocketRtmpFlashProxy.send: Invalid readyState ' + this.readyState);
                throw new Error("INVALID_STATE_ERR");
        }
    };

    $prototype.close = function(code, reason) {
        ;;;WSEFPLOG.entering(this, 'WebSocketRtmpFlashProxy.close');
        switch (this.readyState) {
            case 1:
            case 2:
                WebSocketEmulatedFlashProxy._flashBridge.disconnect(this._instanceId, code, reason);
                break;
        }
    };

    $prototype.disconnect = $prototype.close;
    
    var updateBufferedAmount = function($this) {
        ;;;WSEFPLOG.entering(this, 'WebSocketRtmpFlashProxy.updateBufferedAmount');
        $this.bufferedAmount = WebSocketEmulatedFlashProxy._flashBridge.getBufferedAmount($this._instanceId);

        if ($this.bufferedAmount != 0) {
            setTimeout(function() {
                updateBufferedAmount($this);
            }, 1000);
        }
    }

    var registerWebSocket = function($this, location, protocol) {
        ;;;WSEFPLOG.entering(this, 'WebSocketRtmpFlashProxy.registerWebSocket', location);
        var handleReady = function(key, registry) {
            registry[key] = $this;
            $this._instanceId = key;
        }

        var handleError = function() {
            doError($this);
        }
        var headers = [];
        if ($this.parent.requestHeaders && $this.parent.requestHeaders.length > 0) {
            for (var i = 0; i < $this.parent.requestHeaders.length; i++) {
                headers .push($this.parent.requestHeaders[i].label + ":" + $this.parent.requestHeaders[i].value);
            }
        }
        WebSocketEmulatedFlashProxy._flashBridge.registerWebSocketRtmp(location, headers.join("\n"), handleReady, handleError);
    };

    function doError($this, e) {
        ;;;WSEFPLOG.entering(this, 'WebSocketRtmpFlashProxy.doError', e);
        setTimeout(function() {
//                if($this.onerror) {
//                    $this.onerror(e);
//                }
                $this._listener.connectionFailed($this.parent);
            }, 0);
    }

   return WebSocketRtmpFlashProxy;
})();


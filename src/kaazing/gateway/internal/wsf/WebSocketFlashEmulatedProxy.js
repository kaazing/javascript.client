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
 * WebSocketEmulatedFlashProxy provides a JavaScript WebSocket interface from the flash impl
 *
 * @private
 */
var WebSocketEmulatedFlashProxy = (function() {
    ;;;var WSEFPLOG = Logger.getLogger('WebSocketEmulatedFlashProxy');
    
    var WebSocketEmulatedFlashProxy = function() {
        this.parent;
        this._listener;
    };

    var $prototype = WebSocketEmulatedFlashProxy.prototype;

    $prototype.connect = function(location, protocol) {
        ;;;WSEFPLOG.entering(this, 'WebSocketEmulatedFlashProxy.<init>', location);
        this.URL = location;
        // key is returned back from flash
        //console.log("js is registering a web socket for ", location)
        try {
            registerWebSocket(this, location, protocol);
        } catch(e) {
            ;;;WSEFPLOG.severe(this, 'WebSocketEmulatedFlashProxy.<init> ' + e);
            doError(this, e);
        }
        this.constructor = WebSocketEmulatedFlashProxy;
        ;;;WSEFPLOG.exiting(this, 'WebSocketEmulatedFlashProxy.<init>');
    };

    $prototype.setListener = function(listener) {
			this._listener = listener;
	};
    
    // add the flash hook to the package private WebSocketEmulatedFlashProxy object
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
        ;;;WSEFPLOG.entering(this, 'WebSocketEmulatedFlashProxy.send', data);
        switch (this.readyState) {
            case 0:
                ;;;WSEFPLOG.severe(this, 'WebSocketEmulatedFlashProxy.send: readyState is 0');
                throw new Error("INVALID_STATE_ERR");
                break;
            case 1:
                //console.log("trying to send", data)
                if (data === null) {
                    ;;;WSEFPLOG.severe(this, 'WebSocketEmulatedFlashProxy.send: Data is null');
                    throw new Error("data is null");
                }
                if (typeof(data) == "string") {
                    // send string message
                    WebSocketEmulatedFlashProxy._flashBridge.sendText(this._instanceId, data);
                } else if (data.constructor == $rootModule.ByteBuffer) {
                    var byteString;
                    var a = [];
                    while (data.remaining()) {
                    	a.push(String.fromCharCode(data.get()));
                    }
                    var byteString = a.join("");
                    WebSocketEmulatedFlashProxy._flashBridge.sendByteString(this._instanceId, byteString);
                } else if (data.byteLength) {//ByteArray
                	var byteString;
                    var a = [];
                    var tArray = new DataView(data);
                    for (var i = 0; i < data.byteLength; i++) {
                    	a.push(String.fromCharCode(tArray.getUint8(i)));
                    }
                    var byteString = a.join("");
                    WebSocketEmulatedFlashProxy._flashBridge.sendByteString(this._instanceId, byteString);
                } else if (data.size) {
                	var $this = this;
                	var cb = function(result) {
                    	WebSocketEmulatedFlashProxy._flashBridge.sendByteString($this._instanceId, result);
                    };
                    BlobUtils.asBinaryString(cb, data);
                    return;
                } else {
                    ;;;WSEFPLOG.severe(this, 'WebSocketEmulatedFlashProxy.send: Data is on invalid type ' + typeof(data));
                    throw new Error("Invalid type");
                }

                updateBufferedAmount(this);
                return true;
                break;
            case 2:
                return false;
                break;
            default:
                ;;;WSEFPLOG.severe(this, 'WebSocketEmulatedFlashProxy.send: Invalid readyState ' + this.readyState);
                throw new Error("INVALID_STATE_ERR");
        }
    };

    $prototype.close = function(code, reason) {
        ;;;WSEFPLOG.entering(this, 'WebSocketEmulatedFlashProxy.close');
        switch (this.readyState) {
            case 0:
            case 1:
                WebSocketEmulatedFlashProxy._flashBridge.disconnect(this._instanceId, code, reason);
                break;
        }
    };

    $prototype.disconnect = $prototype.close;
    
    var updateBufferedAmount = function($this) {
        ;;;WSEFPLOG.entering(this, 'WebSocketEmulatedFlashProxy.updateBufferedAmount');
        $this.bufferedAmount = WebSocketEmulatedFlashProxy._flashBridge.getBufferedAmount($this._instanceId);

        if ($this.bufferedAmount != 0) {
            setTimeout(function() {
                updateBufferedAmount($this);
            }, 1000);
        }
    }

    var registerWebSocket = function($this, location, protocol) {
        ;;;WSEFPLOG.entering(this, 'WebSocketEmulatedFlashProxy.registerWebSocket', location);
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
        WebSocketEmulatedFlashProxy._flashBridge.registerWebSocketEmulated(location, headers.join("\n"), handleReady, handleError);
    };

    function doError($this, e) {
        ;;;WSEFPLOG.entering(this, 'WebSocketEmulatedFlashProxy.doError', e);
        setTimeout(function() {
//                if($this.onerror) {
//                    $this.onerror(e);
//                }
                $this._listener.connectionFailed($this.parent);
            }, 0);
    }

   return WebSocketEmulatedFlashProxy;
})();


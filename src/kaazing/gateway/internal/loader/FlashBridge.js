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


(function($rootModule) {
;;;var FBLOG = Logger.getLogger('org.kaazing.gateway.client.loader.FlashBridge');
	
//WebSocket flash bridge (JS->flash side)
//Functions for communicating across the bridge
var registry = {};

WebSocketEmulatedFlashProxy._flashBridge.registerWebSocketEmulated = function(location, protocol, callback, errback) {
    ;;;FBLOG.entering(this, 'WebSocketEmulatedFlashProxy._flashBridge.registerWebSocketEmulated', {'location':location, 'callback':callback, 'errback':errback});
    var readyHandler = function() {
        var key = WebSocketEmulatedFlashProxy._flashBridge.doRegisterWebSocketEmulated(location, protocol);
        callback(key, registry);
    }
    if (WebSocketEmulatedFlashProxy._flashBridge.flashHasLoaded) {
        if (WebSocketEmulatedFlashProxy._flashBridge.flashHasFailed) {
            errback();
        } else {
            readyHandler();
        }
    } else {
        // defer registration if flash has not yet loaded
        this.readyWaitQueue.push(readyHandler);
        this.failWaitQueue.push(errback);
    }
    ;;;FBLOG.exiting(this, 'WebSocketEmulatedFlashProxy._flashBridge.registerWebSocketEmulated');
};

WebSocketEmulatedFlashProxy._flashBridge.doRegisterWebSocketEmulated = function(location, headers) {
    ;;;FBLOG.entering(this, 'WebSocketEmulatedFlashProxy._flashBridge.doRegisterWebSocketEmulated', {'location':location, 'headers':headers});
    var key = WebSocketEmulatedFlashProxy._flashBridge.elt.registerWebSocketEmulated(location, headers);
    ;;;FBLOG.exiting(this, 'WebSocketEmulatedFlashProxy._flashBridge.doRegisterWebSocketEmulated', key);
    return key;
};

WebSocketEmulatedFlashProxy._flashBridge.registerWebSocketRtmp = function(location, protocol, callback, errback) {
    ;;;FBLOG.entering(this, 'WebSocketEmulatedFlashProxy._flashBridge.registerWebSocketRtmp', {'location':location, 'callback':callback, 'errback':errback});
    var readyHandler = function() {
        var key = WebSocketEmulatedFlashProxy._flashBridge.doRegisterWebSocketRtmp(location, protocol);
        callback(key, registry);
    }
    if (WebSocketEmulatedFlashProxy._flashBridge.flashHasLoaded) {
        if (WebSocketEmulatedFlashProxy._flashBridge.flashHasFailed) {
            errback();
        } else {
            readyHandler();
        }
    } else {
        // defer registration if flash has not yet loaded
        this.readyWaitQueue.push(readyHandler);
        this.failWaitQueue.push(errback);
    }
    ;;;FBLOG.exiting(this, 'WebSocketEmulatedFlashProxy._flashBridge.registerWebSocketEmulated');
};

WebSocketEmulatedFlashProxy._flashBridge.doRegisterWebSocketRtmp = function(location, protocol) {
    ;;;FBLOG.entering(this, 'WebSocketEmulatedFlashProxy._flashBridge.doRegisterWebSocketRtmp', {'location':location, 'protocol':protocol});
    var key = WebSocketEmulatedFlashProxy._flashBridge.elt.registerWebSocketRtmp(location, protocol);
    ;;;FBLOG.exiting(this, 'WebSocketEmulatedFlashProxy._flashBridge.doRegisterWebSocketRtmp', key);
    return key;
};

WebSocketEmulatedFlashProxy._flashBridge.onready = function() {
    ;;;FBLOG.entering(this, 'WebSocketEmulatedFlashProxy._flashBridge.onready');
    var waitQueue = WebSocketEmulatedFlashProxy._flashBridge.readyWaitQueue;
    for (var i=0; i<waitQueue.length; i++) {
        var readyCallback = waitQueue[i];
        readyCallback();
    }
    ;;;FBLOG.exiting(this, 'WebSocketEmulatedFlashProxy._flashBridge.onready');
};

WebSocketEmulatedFlashProxy._flashBridge.onfail = function() {
    ;;;FBLOG.entering(this, 'WebSocketEmulatedFlashProxy._flashBridge.onfail');
    var waitQueue = WebSocketEmulatedFlashProxy._flashBridge.failWaitQueue;
    for (var i=0; i<waitQueue.length; i++) {
        var errback = waitQueue[i];
        errback();
    }
    ;;;FBLOG.exiting(this, 'WebSocketEmulatedFlashProxy._flashBridge.onfail');
};


//WebSocketEmulatedFlashProxy._flashBridge.doOpen = function(key) {
//    ;;;FBLOG.entering(this, 'WebSocketEmulatedFlashProxy._flashBridge.doOpen', key);
//    registry[key].readyState = 1;
//    registry[key].onopen();
//    killLoadingBar();
//    ;;;FBLOG.exiting(this, 'WebSocketEmulatedFlashProxy._flashBridge.doOpen');
//};
//
//WebSocketEmulatedFlashProxy._flashBridge.doClose = function(key) {
//    ;;;FBLOG.entering(this, 'WebSocketEmulatedFlashProxy._flashBridge.doClose', key);
//    registry[key].readyState = 2;
//    registry[key].onclose();
//    ;;;FBLOG.exiting(this, 'WebSocketEmulatedFlashProxy._flashBridge.doClose');
//};
//
//WebSocketEmulatedFlashProxy._flashBridge.doError = function(key) {
//    ;;;FBLOG.entering(this, 'WebSocketEmulatedFlashProxy._flashBridge.doError', key);
//    registry[key].onerror();
//    ;;;FBLOG.exiting(this, 'WebSocketEmulatedFlashProxy._flashBridge.doError');
//};

//WebSocketEmulatedFlashProxy._flashBridge.doMessage = function(key, data) {
//    ;;;FBLOG.entering(this, 'WebSocketEmulatedFlashProxy._flashBridge.doMessage', {'key':key, 'data':data});
//    var socket = registry[key];
//
//    if (socket.readyState == 1) {
//        var e;
//        try {
//            e = document.createEvent("Events");
//            e.initEvent("message", true, true);
//        }
//        catch (ie) {
//            ;;;FBLOG.error(this, 'WebSocketEmulatedFlashProxy._flashBridge.doMessage ' + ie);
//            e = { type: "message", bubbles: true, cancelable:true };
//        }
//
//        e.data = unescape(data);
//        e.decoder = decodeByteString;
//        e.origin = document.domain;
//        e.source = null;
//
//        socket.onmessage(e);
//    }
//    ;;;FBLOG.exiting(this, 'WebSocketEmulatedFlashProxy._flashBridge.doMessage');
//};

WebSocketEmulatedFlashProxy._flashBridge.connectionOpened = function(key, headers) {
    ;;;FBLOG.entering(this, 'WebSocketEmulatedFlashProxy._flashBridge.connectionOpened', key);
    registry[key].readyState = 1;
    registry[key].connectionOpened(registry[key].parent, headers);
    killLoadingBar();
    ;;;FBLOG.exiting(this, 'WebSocketEmulatedFlashProxy._flashBridge.connectionOpened');
};

WebSocketEmulatedFlashProxy._flashBridge.connectionClosed = function(key, wasClean, code, reason) {
    ;;;FBLOG.entering(this, 'WebSocketEmulatedFlashProxy._flashBridge.connectionClosed', key);
    registry[key].readyState = 2;
    registry[key].connectionClosed(registry[key].parent, wasClean, code, reason);
    ;;;FBLOG.exiting(this, 'WebSocketEmulatedFlashProxy._flashBridge.connectionClosed');
};

WebSocketEmulatedFlashProxy._flashBridge.connectionFailed = function(key) {
    ;;;FBLOG.entering(this, 'WebSocketEmulatedFlashProxy._flashBridge.connectionFailed', key);
    registry[key].connectionFailed(registry[key].parent);
    ;;;FBLOG.exiting(this, 'WebSocketEmulatedFlashProxy._flashBridge.connectionFailed');
};

WebSocketEmulatedFlashProxy._flashBridge.binaryMessageReceived = function(key, data) {
    ;;;FBLOG.entering(this, 'WebSocketEmulatedFlashProxy._flashBridge.binaryMessageReceived', {'key':key, 'data':data});
    var proxy = registry[key];

    if (proxy.readyState == 1) {
        //data = unescape(data);
        var	buf = $rootModule.ByteBuffer.allocate(data.length); 
		for(var i = 0; i < data.length; i++) {
            buf.put(data[i])
        }
		buf.flip();
        proxy.binaryMessageReceived(proxy.parent, buf);
    }
    ;;;FBLOG.exiting(this, 'WebSocketEmulatedFlashProxy._flashBridge.binaryMessageReceived');
};

WebSocketEmulatedFlashProxy._flashBridge.textMessageReceived = function(key, data) {
    ;;;FBLOG.entering(this, 'WebSocketEmulatedFlashProxy._flashBridge.textMessageReceived', {'key':key, 'data':data});
    var proxy = registry[key];

    if (proxy.readyState == 1) {
        proxy.textMessageReceived(proxy.parent, unescape(data));
    }
    ;;;FBLOG.exiting(this, 'WebSocketEmulatedFlashProxy._flashBridge.textMessageReceived');
};

WebSocketEmulatedFlashProxy._flashBridge.redirected = function(key, location) {
    ;;;FBLOG.entering(this, 'WebSocketEmulatedFlashProxy._flashBridge.redirected', {'key':key, 'data':location});
    var proxy = registry[key];
    proxy.redirected(proxy.parent, location);
    ;;;FBLOG.exiting(this, 'WebSocketEmulatedFlashProxy._flashBridge.redirected');
};

WebSocketEmulatedFlashProxy._flashBridge.authenticationRequested = function(key, location, challenge) {
    ;;;FBLOG.entering(this, 'WebSocketEmulatedFlashProxy._flashBridge.authenticationRequested', {'key':key, 'data':location});
    var proxy = registry[key];
    proxy.authenticationRequested(proxy.parent, location, challenge);
    ;;;FBLOG.exiting(this, 'WebSocketEmulatedFlashProxy._flashBridge.authenticationRequested');
};

var killLoadingBar = function() {
    ;;;FBLOG.entering(this, 'WebSocketEmulatedFlashProxy.killLoadingBar');
    if (browser === "firefox") {
        var e = document.createElement("iframe")
        e.style.display = "none"
        document.body.appendChild(e)
        document.body.removeChild(e)
    }
}

WebSocketEmulatedFlashProxy._flashBridge.sendText = function(key, message) {
    ;;;FBLOG.entering(this, 'WebSocketEmulatedFlashProxy._flashBridge.sendText', {'key':key, 'message':message});
    //this.elt.wsSend(key, escape(message));
    this.elt.processTextMessage(key, escape(message));
    setTimeout(killLoadingBar,200);
};

WebSocketEmulatedFlashProxy._flashBridge.sendByteString = function(key, message) {
    ;;;FBLOG.entering(this, 'WebSocketEmulatedFlashProxy._flashBridge.sendByteString', {'key':key, 'message':message});
    //this.elt.wsSendByteString(key, escape(message));
    this.elt.processBinaryMessage(key, escape(message));
    setTimeout(killLoadingBar,200);
};


WebSocketEmulatedFlashProxy._flashBridge.disconnect = function(key, code, reason) {
    ;;;FBLOG.entering(this, 'WebSocketEmulatedFlashProxy._flashBridge.disconnect', key);
    //this.elt.wsDisconnect(key);
    this.elt.processClose(key, code, reason);
};

WebSocketEmulatedFlashProxy._flashBridge.getBufferedAmount = function(key) {
    ;;;FBLOG.entering(this, 'WebSocketEmulatedFlashProxy._flashBridge.getBufferedAmount', key);
    var v = this.elt.getBufferedAmount(key);
    ;;;FBLOG.exiting(this, 'WebSocketEmulatedFlashProxy._flashBridge.getBufferedAmount', v);
    return v;
}

})(Kaazing);


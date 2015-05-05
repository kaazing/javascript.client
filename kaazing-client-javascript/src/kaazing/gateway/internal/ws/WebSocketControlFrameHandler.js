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
var WebSocketControlFrameHandler = (function() /*extends WebSocketHandlerAdapter*/{
    ;;;var CLASS_NAME = "WebSocketControlFrameHandler";
    ;;;var LOG = Logger.getLogger(CLASS_NAME);

    var WebSocketControlFrameHandler = function() {
        ;;;LOG.finest(CLASS_NAME, "<init>");
    };

    //internal functions

    //get int from ByteBuffer
    var ByteBufferToInt = function(message, position) {
        var result = 0;
        for ( var i = position; i < position + 4; i++) {
            result = (result << 8) + message.getAt(i);
        }
        return result;
    }

    //get int from ArrayBuffer
    var ArrayBufferToInt = function(message) {
        if (message.byteLength > 3) {
            var tArray = new DataView(message);
            return tArray.getInt32(0);
        }
        return 0;
    }

    //get int from ByteBuffer
    var StringToInt = function(message) {
        var result = 0;
        for ( var i = 0; i < 4; i++) {
            result = (result << 8) + message.charCodeAt(i);
        }
        return result;
    }

    //kaazing ping-pong functions
    var ping = [ 0x09, 0x00 ];
    var pong = [ 0x0a, 0x00 ];
    var pongBytes = {};

    var getPong = function(escape) {
        if (typeof pongBytes.escape === "undefined") {
            var bytes = [];
            var i = 4;
            do {
                bytes[--i] = escape & (255);
                escape = escape >> 8;
            } while (i);
            pongBytes.escape = String.fromCharCode.apply(null, bytes
                    .concat(pong));
        }
        return pongBytes.escape;
    }

    var handleControlFrame = function(thisHandler, channel, controlMessage, escapeByte) {
        if (WebSocketHandshakeObject.KAAZING_SEC_EXTENSION_PING_PONG == channel._controlFrames[escapeByte]) {
            //kaazing ping message received, send kaazing pong message
            if (controlMessage.charCodeAt(4) == ping[0]) {
                // ping received, send pong
                var pong = getPong(escapeByte);
                thisHandler._nextHandler.processTextMessage(channel, pong);
            }
        }

    }

    /**
     * Implement WebSocketListener methods
     *
     * @private
     */
    var $prototype = WebSocketControlFrameHandler.prototype = new WebSocketHandlerAdapter();

    /**
     * @private
     */
    $prototype.handleConnectionOpened = function(channel, protocol) {
        ;;;LOG.finest(CLASS_NAME, "handleConnectionOpened");
        var headers = channel.responseHeaders;
        //get escape bytes for control frames from X-WebSocket-Extensions header, this is for emulated connection
        if (headers[WebSocketHandshakeObject.HEADER_SEC_EXTENSIONS] != null) {
            var extensionsHeader = headers[WebSocketHandshakeObject.HEADER_SEC_EXTENSIONS];
            if (extensionsHeader != null && extensionsHeader.length > 0) {
                var extensions = extensionsHeader.split(",");
                for ( var j = 0; j < extensions.length; j++) {
                    var tmp = extensions[j].split(";");
                    var ext = tmp[0].replace(/^\s+|\s+$/g, "");
                    var extension = new WebSocketExtension(ext);
                    extension.enabled = true;
                    extension.negotiated = true;
                    if (tmp.length > 1) {
                        var escape = tmp[1].replace(/^\s+|\s+$/g, "");
                        if (escape.length == 8) {
                            //has escape bytes
                            try {
                                var escapeKey = parseInt(escape, 16);
                                channel._controlFrames[escapeKey] = ext; //control frame for text message
                                extension.escape = escape;
                            } catch (e) {
                                // this is not escape parameter, ignored
                                ;
                                ;
                                ;
                                LOG.finest(CLASS_NAME,
                                        "parse control frame bytes error");
                            }
                        }
                    }
                    channel.parent._negotiatedExtensions[ext] = extension;
                }
            }
        }
        this._listener.connectionOpened(channel, protocol);
    }

    $prototype.handleTextMessageReceived = function(channel, message) {
        ;;;LOG.finest(CLASS_NAME, "handleMessageReceived", message);

        //check for escape message
        if (channel._isEscape) {
            //isEscape is true, this is orginal messasge, reset flag and raise event
            channel._isEscape = false;
            this._listener.textMessageReceived(channel, message);
            return;
        }
        if (message == null || message.length < 4) {
            //message length < 4, it is a message for sure
            this._listener.textMessageReceived(channel, message);
            return;
        }
        var escapeByte = StringToInt(message);
        if (channel._controlFrames[escapeByte] != null) {
            if (message.length == 4) {
                //is escape message
                channel._isEscape = true;
                return;
            } else {
                handleControlFrame(this, channel, message, escapeByte);
            }
        } else { //not control frame message, raise event
            this._listener.textMessageReceived(channel, message);
        }
    }

    $prototype.handleMessageReceived = function(channel, message) {
        ;;;LOG.finest(CLASS_NAME, "handleMessageReceived", message);

        //check for escape message
        if (channel._isEscape) {
            //isEscape is true, this is orginal messasge, reset flag and raise event
            channel._isEscape = false;
            this._listener.binaryMessageReceived(channel, message);
            return;
        }
        if (typeof (message.byteLength) != "undefined") { //ArrayBuffer

            var escapeByte = ArrayBufferToInt(message);
            if (channel._controlFramesBinary[escapeByte] != null) {
                if (message.byteLength == 4) {
                    //is escape message
                    channel._isEscape = true;
                    return;
                } else {
                    handleControlFrame(this, channel, String.fromCharCode.apply(null, new Uint8Array(message, 0)), escapeByte);
                }
            } else { //not control frame message, raise event
                this._listener.binaryMessageReceived(channel, message);
            }
        } else if (message.constructor == $rootModule.ByteBuffer) {
            //bytebuffer
            if (message == null || message.limit < 4) {
                //message length < 4, it is a message for sure
                this._listener.binaryMessageReceived(channel, message);
                return;
            }

            var escapeByte = ByteBufferToInt(message, message.position);
            if (channel._controlFramesBinary[escapeByte] != null) {
                if (message.limit == 4) {
                    //is escape message
                    channel._isEscape = true;
                    return;
                } else {

                    handleControlFrame(this, channel, message
                            .getString(Charset.UTF8), escapeByte);
                }
            } else { //not control frame message, raise event
                this._listener.binaryMessageReceived(channel, message);
            }

        }
    }

    $prototype.processTextMessage = function(channel, message) {
        if (message.length >= 4) {
            var escapeByte = StringToInt(message);
            if (channel._escapeSequences[escapeByte] != null) {
                //inject escape message
                var inject = message.slice(0, 4);
                this._nextHandler.processTextMessage(channel, inject);
            }
        }
        this._nextHandler.processTextMessage(channel, message);
    }

    $prototype.setNextHandler = function(nextHandler) {
        var $this = this;
        this._nextHandler = nextHandler;
        var listener = new WebSocketHandlerListener(this);
        listener.connectionOpened = function(channel, protocol) {
            $this.handleConnectionOpened(channel, protocol);
        }
        listener.textMessageReceived = function(channel, buf) {
            $this.handleTextMessageReceived(channel, buf);
        }
        listener.binaryMessageReceived = function(channel, buf) {
            $this.handleMessageReceived(channel, buf);
        }
        nextHandler.setListener(listener);
    }

    $prototype.setListener = function(listener) {
        this._listener = listener;
    }

    return WebSocketControlFrameHandler;
})()

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
var WebSocketHixie76FrameCodecHandler = (function () /*extends WebSocketHandlerAdapter*/ {
    ;
    ;
    ;
    var CLASS_NAME = "WebSocketHixie76FrameCodecHandler";
    ;
    ;
    ;
    var LOG = Logger.getLogger(CLASS_NAME);

    var WebSocketHixie76FrameCodecHandler = function () {
        ;
        ;
        ;
        LOG.finest(CLASS_NAME, "<init>");
    };

    var $prototype = WebSocketHixie76FrameCodecHandler.prototype = new WebSocketHandlerAdapter();
    $prototype.processConnect = function (channel, uri, protocol) {
        this._nextHandler.processConnect(channel, uri, protocol);
    }

    $prototype.processBinaryMessage = function (channel, data) {
        if (data.constructor == $rootModule.ByteBuffer) { //bytebuffer
            var bytes = data.array.slice(data.position, data.limit);
            this._nextHandler.processTextMessage(channel, Charset.UTF8.encodeByteArray(bytes));
        } else if (data.byteLength) { //arraybuffer
            this._nextHandler.processTextMessage(channel, Charset.UTF8.encodeArrayBuffer(data));
        } else if (data.size) { //blob, send data in callback function
            var $this = this;
            var cb = function (result) {
                $this._nextHandler.processBinaryMessage(channel, Charset.UTF8.encodeByteArray(result));
            };
            BlobUtils.asNumberArray(cb, data);
        } else {
            throw new Error("Invalid type for send");
        }
    }
    $prototype.setNextHandler = function (nextHandler) {
        this._nextHandler = nextHandler;
        var $this = this;
        var listener = new WebSocketHandlerListener(this);
        //KG-9437 temp work around, always fire binaryMessageReceived
        listener.textMessageReceived = function (channel, text) {
            //conver UTF8 string to Bytebuffer
            $this._listener.binaryMessageReceived(channel, $rootModule.ByteBuffer.wrap(Charset.UTF8.toByteArray(text)));
        }

        listener.binaryMessageReceived = function (channel, buf) {
            throw new Error("draft76 won't receive binary frame");
        }
        nextHandler.setListener(listener);
    }

    $prototype.setListener = function (listener) {
        this._listener = listener;
    }

    return WebSocketHixie76FrameCodecHandler;
})()

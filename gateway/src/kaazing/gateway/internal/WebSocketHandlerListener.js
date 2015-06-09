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
var WebSocketHandlerListener = function ($this) {
    this.connectionOpened = function (channel, protocol) {
        $this._listener.connectionOpened(channel, protocol);
    }
    this.textMessageReceived = function (channel, s) {
        $this._listener.textMessageReceived(channel, s);
    }
    this.binaryMessageReceived = function (channel, obj) {
        $this._listener.binaryMessageReceived(channel, obj);
    }
    this.connectionClosed = function (channel, wasClean, code, reason) {
        $this._listener.connectionClosed(channel, wasClean, code, reason);
    }
    this.connectionError = function (channel, e) {
        $this._listener.connectionError(channel, e);
    }
    this.connectionFailed = function (channel) {
        $this._listener.connectionFailed(channel);
    }
    this.authenticationRequested = function (channel, location, challenge) {
        $this._listener.authenticationRequested(channel, location, challenge);
    }
    this.redirected = function (channel, location) {
        $this._listener.redirected(channel, location);
    }
    this.onBufferedAmountChange = function (channel, n) {
        $this._listener.onBufferedAmountChange(channel, n);
    }
}

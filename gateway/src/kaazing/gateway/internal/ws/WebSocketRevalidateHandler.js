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


/*
 * WebSocket (HTTP Fallback Version)
 *
 * HTML5 WebSocket using URLStream (Comet style streaming)
 * http://www.whatwg.org/specs/web-apps/current-work/#network
 */

/**
 * @private
 */
var WebSocketRevalidateHandler = (function () {

    var WebSocketRevalidateHandler = function (channel) {
        this.channel = channel;
    }

    var isWebSocketClosing = function (channel) {
        var parent = channel.parent;
        if (parent) {
            return (parent.readyState >= 2)
        }
        return false;
    }

    var $prototype = WebSocketRevalidateHandler.prototype;

    $prototype.connect = function (location) {
        ;;;LOG.finest("ENTRY Revalidate.connect with {0}", location)
        if (isWebSocketClosing(this.channel)) {
            return;
        }
        var $this = this;
        var create = new XMLHttpRequest0();
        create.withCredentials = true;

        create.open("GET", location + "&.krn=" + Math.random(), true); //KG-3537 use unique url to prevent browser load from cache
        if ($this.channel._challengeResponse != null && $this.channel._challengeResponse.credentials != null) {
            create.setRequestHeader("Authorization", $this.channel._challengeResponse.credentials);
            this.clearAuthenticationData($this.channel);
        }
        create.onreadystatechange = function () {
            switch (create.readyState) {
                case 2:
                    if (create.status == 403) {
                        //forbidden
                        create.abort();
                    }
                    break;
                case 4:
                    if (create.status == 401) {
                        //handle 401
                        $this.handle401($this.channel, location, create.getResponseHeader("WWW-Authenticate"));
                        return;

                    }
                    break;
            }
        };

        create.send(null);

    }

    $prototype.clearAuthenticationData = function (channel) {
        if (channel._challengeResponse != null) {
            channel._challengeResponse.clearCredentials();
        }
    }
    $prototype.handle401 = function (channel, location, challenge) {
        if (isWebSocketClosing(channel)) {
            return;
        }
        var $this = this;
        var challengeLocation = location;
        if (challengeLocation.indexOf("/;a/") > 0) {
            challengeLocation = challengeLocation.substring(0, challengeLocation.indexOf("/;a/"));
        }
        else if (challengeLocation.indexOf("/;ae/") > 0) {
            challengeLocation = challengeLocation.substring(0, challengeLocation.indexOf("/;ae/"));
        }
        else if (challengeLocation.indexOf("/;ar/") > 0) {
            challengeLocation = challengeLocation.substring(0, challengeLocation.indexOf("/;ar/"));
        }

        var challengeRequest = new Kaazing.Gateway.ChallengeRequest(challengeLocation, challenge);
        var challengeHandler;
        if (this.channel._challengeResponse.nextChallengeHandler != null) {
            challengeHandler = this.channel._challengeResponse.nextChallengeHandler;
        } else {
            challengeHandler = channel.challengeHandler;
        }

        if (challengeHandler != null && challengeHandler.canHandle(challengeRequest)) {
            challengeHandler.handle(challengeRequest, function (challengeResponse) {
                //fulfilled callback function
                try {
                    if (challengeResponse != null && challengeResponse.credentials != null) {
                        // Retry request with the auth response.
                        $this.channel._challengeResponse = challengeResponse;
                        $this.connect(location);
                    }
                } catch (e) {
                }
            });
        }
    }
    return WebSocketRevalidateHandler;
})();

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


(function ($module) {

    /**
     * An immutable object representing the challenge presented by the server when the client accessed
     * the URI represented by a location.
     *
     * <p>According to <a href="http://tools.ietf.org/html/rfc2617#section-1.2">RFC 2617</a>,
     * <pre>
     *     challenge   = auth-scheme 1*SP 1#auth-param
     * </pre>
     * so we model the authentication scheme and parameters in this class.</p>
     *
     * <p>This class is also responsible for detecting and adapting the <code>Application Basic</code>
     * and <code>Application Negotiate</code> authentication schemes into their <code>Basic</code> and
     * <code>Negotiate</code> counterpart authentication schemes.</p>
     * Constructor from the protected URI location triggering the challenge,
     * and an entire server-provided 'WWW-Authenticate:' string.
     *
     * @class
     * @alias ChallengeRequest
     * @constructor
     * @param location  the protected URI location triggering the challenge
     * @param challenge an entire server-provided 'WWW-Authenticate:' string
     */
    var ChallengeRequest = function (location, challenge) {
        if (location == null) {
            throw new Error("location is not defined.");
        }
        if (challenge == null) {
            return;
        }
        var APPLICATION_PREFIX = "Application ";
        if (challenge.indexOf(APPLICATION_PREFIX) == 0) {
            challenge = challenge.substring(APPLICATION_PREFIX.length);
        }
        this.location = location;
        this.authenticationParameters = null;
        var space = challenge.indexOf(' ');
        if (space == -1) {
            this.authenticationScheme = challenge;
        } else {
            this.authenticationScheme = challenge.substring(0, space);
            if (challenge.length > space + 1) {
                this.authenticationParameters = challenge
                    .substring(space + 1);
            }
        }
    };

    $module.ChallengeRequest = ChallengeRequest;

    /**
     * <B>(Read only)</B> The authentication scheme with which the server is
     *                    challenging.
     *   @field
     *   @name authenticationScheme
     *   @type String
     *   @memberOf ChallengeRequest#
     */
    /**
     * <B>(Read only)</B> The string after the space separator, not including the
     *                    authentication scheme nor the space itself, or null if
     *                    no such string exists.
     *   @field
     *   @name authenticationParameters
     *   @type String
     *   @memberOf ChallengeRequest#
     */
    /**
     * <B>(Read only)</B> The protected URI the access of which triggered this
     *                    challenge.
     *
     *   @field
     *   @name location
     *   @type String
     *   @memberOf ChallengeRequest#
     */
    return ChallengeRequest;
})(Kaazing.Gateway);

// This will help the rest of the code within the closure to access ChallengeRequest by a
// straight variable name instead of using $module.ChallengeRequest
var ChallengeRequest = Kaazing.Gateway.ChallengeRequest;

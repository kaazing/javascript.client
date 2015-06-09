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
     * Challenge handler for Basic authentication as defined in
     * <a href="http://tools.ietf.org/html/rfc2617#section-2">RFC 2617.</a>
     *
     * <p>This BasicChallengeHandler can be instantiated using <code>new BasicChallengeHandler()</code>,
     * and registered at a location using <code>DispatchChallengeHandler.register(String, ChallengeHandler)</code>.<p/>
     *
     * <p>In addition, one can install general and realm-specific <code>loginHandler</code> functions onto this
     * <code>BasicChallengeHandler</code> to assist in handling challenges associated
     * with any or specific realms.<p/>
     *
     *<p>After instantiated a BasicChallengeHandler instance, the loginHandler function must be implemented to
     * handle authentication challenge. By default, loginHandler will send an empty PasswordAuthentication.
     *
     * <p>The following example loads an instance of a <code>BasicChallengeHandler</code>, sets a login
     * handler onto it and registers the basic handler at a URI location.  In this way, all attempts to access
     * that URI for which the server issues "Basic" challenges are handled by the registered <code>BasicChallengeHandler</code> .
     * <listing>
     * var factory = new WebSocketFactory();
     * var basicHandler = new BasicChallengeHandler();
     * basicHandler.loginHandler = function(callback) {
     *        callback(new PasswordAuthentication("global", "credentials"));
     *    };
     * factory.setChallengeHandler(basicHandler);
     * </listing>
     *
     * @class
     * @alias BasicChallengeHandler
     * @constructor
     * @see http://tools.ietf.org/html/rfc2616 RFC 2616 - HTTP 1.1
     * @see http://tools.ietf.org/html/rfc2617#section-2 RFC 2617 Section 2 - Basic Authentication
     */
    var BasicChallengeHandler = function () {
        this.loginHandler = undefined;
        this.loginHandlersByRealm = {};
    };

    var $prototype = BasicChallengeHandler.prototype;

    /**
     * Set a Login Handler to be used if and only if a challenge request has
     * a realm parameter matching the provided realm.
     *
     * @param realm  the realm upon which to apply the <code>loginHandler</code>.
     * @param loginHandler the login handler to use for the provided realm.
     * @return {void}
     *
     * @public
     * @alias setRealmLoginHandler
     * @memberOf BasicChallengeHandler#
     */
    $prototype.setRealmLoginHandler = function (realm, loginHandler) {
        if (realm == null) {
            throw new ArgumentError("null realm");
        }
        if (loginHandler == null) {
            throw new ArgumentError("null loginHandler");
        }
        this.loginHandlersByRealm[realm] = loginHandler;
        return this;
    }

    /**
     * Can the presented challenge be potentially handled by this challenge handler?
     *
     * @param challengeRequest a challenge request object containing a challenge
     * @return {boolean} true, if this challenge handler could potentially respond meaningfully to the challenge;
     *                   otherwise false
     * @public
     * @alias canHandle
     * @memberOf BasicChallengeHandler#
     */
    $prototype.canHandle = function (challengeRequest) {
        return challengeRequest != null && "Basic" == challengeRequest.authenticationScheme;
    }

    /**
     * Handle the presented challenge by invoking the callback function with a
     * challenge response processed appropriately.
     *
     * <p>By default, the implementation of this method invokes the callback function using a
     * <code>null</code> challenge response and failing authentication.</p>
     *
     * @param challengeRequest a challenge object
     * @param callback function that is called when the challenge request handling is completed.
     * @return {void}
     *
     * @public
     * @alias handle
     * @memberOf BasicChallengeHandler#
     */
    $prototype.handle = function (challengeRequest, callback) {

        if (challengeRequest.location != null) {
            var loginHandler = this.loginHandler;
            var realm = RealmUtils.getRealm(challengeRequest);
            if (realm != null && this.loginHandlersByRealm[realm] != null) {
                loginHandler = this.loginHandlersByRealm[realm];
            }
            var nextChallengeHandler = this;
            if (loginHandler != null) {
                loginHandler(function (credentials) {
                    if (credentials != null && credentials.username != null) {
                        callback(BasicChallengeResponseFactory.create(credentials.username, credentials.password, nextChallengeHandler));
                    }
                    else {
                        callback(null);
                    }
                });
                return;
            }
        }
        callback(null);
    }

    /**
     * handle authentication challenge
     * loginHandler will be called when an authentication challenge is received from the server. To respond to the challenge,
     * simply invoke the "callback" function with a PasswordAuthentication object as the argument,
     * or invoke the "callback" function with null as the argument if no credentials have been returned.
     *
     * @param callback the function to be invoked when the credentials are retrieved. To invoke the callback function,
     * use <code>callback(new PasswordAuthentication(username, password));</code> to login
     * or <code>callback(null)</code> to cancel
     * @return {void}
     * @public
     * @alias loginHandler
     * @memberOf BasicChallengeHandler#
     */
    $prototype.loginHandler = function (callback) {
        callback(null);
    }

    $module.BasicChallengeHandler = BasicChallengeHandler;

})(Kaazing.Gateway);

// This will help the rest of the code within the closure to access BasicChallengeHandler by a
// straight variable name instead of using $module.BasicChallengeHandler
var BasicChallengeHandler = Kaazing.Gateway.BasicChallengeHandler;

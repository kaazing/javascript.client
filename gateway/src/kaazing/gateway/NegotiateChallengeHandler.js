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
     * A Negotiate Challenge Handler handles initial empty "Negotiate" challenges from the
     * server.  It uses other "candidate" challenger handlers to assemble an initial context token
     * to send to the server, and is responsible for creating a challenge response that can delegate
     * to the winning candidate.
     *
     * <p>This NegotiateChallengeHandler can be loaded and instantiated using <code>new NegotiateChallengeHandler()</code> ,
     * and registered at a location using <code>DispatchChallengeHandler.register()</code>.</p>
     *
     * <p>In addition, one can register more specific <code>NegotiableChallengeHandler</code> objects with
     * this initial <code>NegotiateChallengeHandler</code> to handle initial Negotiate challenges and subsequent challenges associated
     * with specific Negotiation <a href="http://tools.ietf.org/html/rfc4178#section-4.1">mechanism types / object identifiers</a>.</p>
     *
     * <p>The following example establishes a Negotiation strategy at a specific URL location.
     * We show the use of a  <code>DispatchChallengeHandler</code> to register a  <code>NegotiateChallengeHandler</code> at
     * a specific location.  The  <code>NegotiateChallengeHandler</code> has a  <code>NegotiableChallengeHandler</code>
     * instance registered as one of the potential negotiable alternative challenge handlers.
     * <listing>
     * var factory = new WebSocketFactory();
     * var negotiableHandler = new NegotiableChallengeHandler();
     * var negotiableHandler.loginHandler  = function(callback) {...};
     * var negotiateHandler = new NegotiateChallengeHandler();
     * negotiateHandler.register(negotiableHandler);
     * factory.setChallengeHandler(negotiateHandler);
     * </listing>
     *
     * @see DispatchChallengeHandler#register()
     * @see NegotiableChallengeHandler
     *
     * @see http://tools.ietf.org/html/rfc4559: RFC 4559 - Microsoft SPNEGO
     * @see http://tools.ietf.org/html/rfc4178: RFC 4178 - GSS-API SPNEGO
     * @see http://tools.ietf.org/html/rfc2743: RFC 2743 - GSS-API
     * @see http://tools.ietf.org/html/rfc4121: RFC 4121 - Kerberos v5 GSS-API (version 2)
     * @see http://tools.ietf.org/html/rfc2616: RFC 2616 - HTTP 1.1
     * @see http://tools.ietf.org/html/rfc2617: RFC 2617 - HTTP Authentication
     *
     * @class
     * @alias NegotiateChallengeHandler
     * @constructor
     */
    var NegotiateChallengeHandler = function () {
        this.candidateChallengeHandlers = new Array();
    };

    var Oid = $module.Oid;

    var makeSPNEGOInitTokenByOids = function (strings) {
        var oids = new Array();
        for (var i = 0; i < strings.length; i++) {
            oids.push(Oid.create(strings[i]).asArray());
        }
        var gssTokenLen = GssUtils.sizeOfSpnegoInitialContextTokenWithOids(null, oids);
        var gssTokenBuf = $rootModule.ByteBuffer.allocate(gssTokenLen);
        gssTokenBuf.skip(gssTokenLen);
        GssUtils.encodeSpnegoInitialContextTokenWithOids(null, oids, gssTokenBuf);
        return ByteArrayUtils.arrayToByteArray(Base64Util.encodeBuffer(gssTokenBuf));
    }

    var $prototype = NegotiateChallengeHandler.prototype;
    /**
     * Register a candidate negotiable challenge handler that will be used to respond
     * to an initial "Negotiate" server challenge and can then potentially be
     * a winning candidate in the race to handle the subsequent server challenge.
     *
     * @param handler the mechanism-type-specific challenge handler.
     * @return {ChallengeHandler} a reference to this handler, to support chained calls
     *
     * @public
     * @function
     * @name register
     * @memberOf NegotiateChallengeHandler#
     */
    $prototype.register = function (handler) {
        if (handler == null) {
            throw new Error("handler is null");
        }
        for (var i = 0; i < this.candidateChallengeHandlers.length; i++) {
            if (handler === this.candidateChallengeHandlers[i]) {
                return this;
            }
        }
        this.candidateChallengeHandlers.push(handler);
        return this;
    }

    $prototype.canHandle = function (challengeRequest) {
        return challengeRequest != null &&
            challengeRequest.authenticationScheme == "Negotiate" &&
            challengeRequest.authenticationParameters == null;
    }

    $prototype.handle = function (challengeRequest, callback) {
        if (challengeRequest == null) {
            throw Error(new ArgumentError("challengeRequest is null"));
        }

        var handlersByOid = new OrderedDictionary();
        for (var i = 0; i < this.candidateChallengeHandlers.length; i++) {
            var candidate = this.candidateChallengeHandlers[i];
            if (candidate.canHandle(challengeRequest)) {
                try {
                    var supportedOids = candidate.getSupportedOids();
                    for (var j = 0; j < supportedOids.length; j++) {
                        var oid = new Oid(supportedOids[j]).asString();
                        if (!handlersByOid.containsKey(oid)) {
                            handlersByOid.put(oid, candidate);
                        }
                    }
                }
                catch (e) {
                    //LOG.info(RESPONSE_FAILURE_MSG, candidate, e);
                }
            }
        }
        if (handlersByOid.isEmpty()) {
            callback(null);
            return;
        }
        /* TODO
         var selectChallengeHandler = new SelectChallengeHandler();
         selectChallengeHandler.setHandlersByOid(handlersByOid);
         callback(new $module.ChallengeResponse(makeSPNEGOInitTokenByOids(handlersByOid.keySet()), selectChallengeHandler));
         */

    }

//$module.NegotiableChallengeHandler = (function() {


    return NegotiateChallengeHandler;
})(Kaazing.Gateway);

// This will help the rest of the code within the closure to access NegotiateChallengeHandler by a 
// straight variable name instead of using $module.NegotiateChallengeHandler
var NegotiateChallengeHandler = Kaazing.Gateway.NegotiateChallengeHandler;

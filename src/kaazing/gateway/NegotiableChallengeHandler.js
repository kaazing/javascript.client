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
 * @ignore
 */
$module.NegotiableChallengeHandler = (function() {
    
    /**
     * A <code>NegotiableChallengeHandler</code> can be used to directly respond to
     * "Negotiate" challenges, and in addition, can be used indirectly in conjunction
     * with a <code>NegotiateChallengeHandler</code>
     * to assist in the construction of a challenge response using object identifiers.
     *
     * <p>See also RFC 4178 Section 4.2.1 for details about how the supported object
     * identifiers contribute towards the initial context token in the challenge response.</p>
     *
     * @see NegotiateChallengeHandler
     * 
     * @class
     */
    var NegotiableChallengeHandler = function() {
        this.loginHandler = undefined;
    };



    /**
     * Return a collection of string representations of object identifiers
     * supported by this challenge handler implementation, in dot-separated notation.
     * For example, <code>1.3.5.1.5.2</code>
     *
     * @return {Array} a collection of string representations of object identifiers
     *         supported by this challenge handler implementation.
     *
     * @see Oid
     * @public
     * @function
     * @name getSupportedOids
     * @memberOf NegotiableChallengeHandler
     */
    NegotiableChallengeHandler.prototype.getSupportedOids = function() {
        return new Array();
    }
    return NegotiableChallengeHandler;
})();

// This will help the rest of the code within the closure to access NegotiableChallengeHandler by a 
// straight variable name instead of using $module.NegotiableChallengeHandler
var NegotiableChallengeHandler = $module.NegotiableChallengeHandler;

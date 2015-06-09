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
     * @ignore
     */
    $module.ChallengeResponse = (function () {

        /**
         * A challenge response contains a byte array representing the response to the server,
         * and a reference to the next challenge handler to handle any further challenges for the request.
         *
         * Constructor from a set of credentials to send to the server in an 'Authorization:' header
         * and the next challenge handler responsible for handling any further challenges for the request.
         * @class
         * @alias ChallengeResponse
         * @constructor
         * @param credentials a set of credentials to send to the server in an 'Authorization:' header
         * @param nextChallengeHandler the next challenge handler responsible for handling any further challenges for the request.
         */
        var ChallengeResponse = function (credentials, nextChallengeHandler) {
            this.credentials = credentials;
            this.nextChallengeHandler = nextChallengeHandler;
        };

        var $prototype = ChallengeResponse.prototype;

        $prototype.clearCredentials = function () {
            if (this.credentials != null) {
                //this.credentials.clear();
                this.credentials = null;
            }
        }

        return ChallengeResponse;
    })();

})(Kaazing.Gateway);

// This will help the rest of the code within the closure to access ChallengeResponse by a 
// straight variable name instead of using $module.ChallengeResponse
var ChallengeResponse = Kaazing.Gateway.ChallengeResponse;

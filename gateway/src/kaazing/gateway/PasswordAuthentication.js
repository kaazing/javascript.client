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
(function ($module) {

    /**
     * Represents a user name and password as a model object, used in <code>BasicChallengeHandler</code> instances.
     *
     * @class
     * @alias PasswordAuthentication
     * @param username {String}    user name
     * @param password {String}    password
     * @constructor
     */
    var PasswordAuthentication = function (username, password) {
        this.username = username;
        this.password = password;
    }

    /**
     * Clears the username and the password.
     *
     * @function
     * @memberOf PasswordAuthentication#
     */
    PasswordAuthentication.prototype.clear = function () {
        this.username = null;
        this.password = null;
    }

    $module.PasswordAuthentication = PasswordAuthentication;

    return PasswordAuthentication;
})(Kaazing.Gateway);


// This will help the rest of the code within the closure to access PasswordAuthentication by a 
// straight variable name instead of using $module.PasswordAuthentication
var PasswordAuthentication = Kaazing.Gateway.PasswordAuthentication;

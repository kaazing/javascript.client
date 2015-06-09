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
var RealmUtils = (function () {

    var RealmUtils = function () {
    };

    RealmUtils.getRealm = function (challengeRequest) {
        var authenticationParameters = challengeRequest.authenticationParameters;
        if (authenticationParameters == null) {
            return null;
        }
        var regex = /realm=(\"(.*)\")/i;
        var match = regex.exec(authenticationParameters);
        return (match != null && match.length >= 3) ? match[2] : null;

    };

    return RealmUtils;
})();


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
var WSCompositeURI = (function () {

    var wsEquivalent = {};
    wsEquivalent["ws"] = "ws";
    wsEquivalent["wss"] = "wss";
    wsEquivalent["javascript:wse"] = "ws";
    wsEquivalent["javascript:wse+ssl"] = "wss";
    wsEquivalent["javascript:ws"] = "ws";
    wsEquivalent["javascript:wss"] = "wss";
    wsEquivalent["flash:wsr"] = "ws";
    wsEquivalent["flash:wsr+ssl"] = "wss";
    wsEquivalent["flash:wse"] = "ws";
    wsEquivalent["flash:wse+ssl"] = "wss";

    var WSCompositeURI = function (location) {

        var compositeScheme = getProtocol(location);
        if (isValidScheme(compositeScheme)) {
            this._uri = new URI(URI.replaceProtocol(location, wsEquivalent[compositeScheme]));
            this._compositeScheme = compositeScheme;
            this._location = location;
        }
        else {
            throw new SyntaxError("WSCompositeURI - invalid composite scheme: " + getProtocol(location));
        }
    };

    function getProtocol(location) {
        var indx = location.indexOf("://");
        if (indx > 0) {
            return location.substr(0, indx);
        }
        else {
            return "";
        }
    }

    function isValidScheme(scheme) {
        return wsEquivalent[scheme] != null;
    }

    function duplicate(uri) {
        try {
            return new WSCompositeURI(uri);
        }
        catch (e) {
            throw e;
        }
        return null;
    }

    var $prototype = WSCompositeURI.prototype;

    $prototype.isSecure = function () {
        var scheme = this._uri.scheme;
        return "wss" == wsEquivalent[scheme];
    }

    $prototype.getWSEquivalent = function () {
        try {
            var wsEquivScheme = wsEquivalent[this._compositeScheme];
            return WSURI.replaceScheme(this._location, wsEquivScheme);
        } catch (e) {
            throw e;
        }
        return null;
    }
    $prototype.getPlatformPrefix = function () {
        if (this._compositeScheme.indexOf("javascript:") === 0) {
            return "javascript";
        } else if (this._compositeScheme.indexOf("flash:") === 0) {
            return "flash";
        } else {
            return "";
        }
    }
    $prototype.toString = function () {
        return this._location;
    }
    return WSCompositeURI;
})();
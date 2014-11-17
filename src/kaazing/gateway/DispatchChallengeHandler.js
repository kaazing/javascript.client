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
 * A <code>DispatchChallengeHandler</code> is responsible for dispatching challenge requests
 * to appropriate challenge handlers when challenges
 * arrive from specific URI locations in challenge responses.
 *
 * <p>This allows clients to use specific challenge handlers to handle specific
 * types of challenges at different URI locations.</p>
 * 
 * @class DispatchChallengeHandler
 */
$module.DispatchChallengeHandler  = (function(){
    
    var DispatchChallengeHandler  = function() {
        //private members
        this.rootNode =new Node();
        var SCHEME_URI = "^(.*)://(.*)";
        this.SCHEME_URI_PATTERN = new RegExp(SCHEME_URI);
    };

    function delChallengeHandlerAtLocation(rootNode, locationDescription, challengeHandler) {
        var tokens = tokenize(locationDescription);
        var cursor = rootNode;

        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (!cursor.hasChild(token.name, token.kind)) {
                return;
            }
            else {
                cursor = cursor.getChild(token.name);
            }
        }
        cursor.removeValue(challengeHandler);
    }

    function addChallengeHandlerAtLocation(rootNode, locationDescription, challengeHandler) {
        var tokens = tokenize(locationDescription);
        var cursor = rootNode;
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (!cursor.hasChild(token.name, token.kind)) {
                cursor = cursor.addChild(token.name, token.kind);
            }
            else {
                cursor = cursor.getChild(token.name);
            }
        }
        cursor.appendValues(challengeHandler);
    }

    function lookupByLocation(rootNode, location) {
        var result = new Array();
        if (location != null) {
            var resultNode = findBestMatchingNode(rootNode, location);
            if (resultNode != null) {
                return resultNode.values;         // FIXME use a standard getter reference
            }
        }
        return result;
    }

    function lookupByRequest(rootNode, challengeRequest) {
        var result = null;
        var location = challengeRequest.location;
        if (location != null) {
            var resultNode = findBestMatchingNode(rootNode, location);
            if (resultNode != null) {
                var handlers = resultNode.getValues();
                if (handlers != null) {
                    for (var i = 0; i < handlers.length; i++) {
                        var challengeHandler = handlers[i];
                        if (challengeHandler.canHandle(challengeRequest)) {
                            result = challengeHandler;
                            break;
                        }
                    }
                }
            }
        }
        return result;
    }

    function findBestMatchingNode(rootNode, location) {
        var tokens = tokenize(location);
        var tokenIdx = 0;
        return rootNode.findBestMatchingNode(tokens, tokenIdx);
    }

    function tokenize(uri) {
        var result = new Array();
        if (uri == null || uri.length == 0) {
            return result;
        }
        //  Lifted and modified from RFC 3986
        var uriRegex = new RegExp('^(([^:/?#]+):(//))?([^/?#]*)?([^?#]*)(\\?([^#]*))?(#(.*))?');
        var matches = uriRegex.exec(uri);
        if (matches == null) {
            return result;
        }

        var scheme    = matches[2] || "http";
        var authority = matches[4];
        var path      = matches[5];
        //            var query:String     = matches[7];
        //            var fragment:String  = matches[9];

        var parsedPortFromAuthority = null;
        var parsedUserInfoFromAuthority = null;
        var userFromAuthority = null;
        var passwordFromAuthority = null;

        if (authority != null) {
            var host = authority;
            var asteriskIdx = host.indexOf("@");
            if (asteriskIdx >= 0) {
                parsedUserInfoFromAuthority = host.substring(0, asteriskIdx);
                host = host.substring(asteriskIdx + 1);
                var colonIdx = parsedUserInfoFromAuthority.indexOf(":");
                if (colonIdx >= 0) {
                    userFromAuthority = parsedUserInfoFromAuthority.substring(0, colonIdx);
                    passwordFromAuthority = parsedUserInfoFromAuthority.substring(colonIdx + 1);
                }
            }
            var colonIdx1 = host.indexOf(":");
            if (colonIdx1 >= 0) {
                parsedPortFromAuthority = host.substring(colonIdx1 + 1);
                host = host.substring(0, colonIdx1);
            }
        }
        else {
            throw new ArgumentError("Hostname is required.");
        }

        var hostParts = host.split(/\./);
        hostParts.reverse();
        for (var k = 0; k < hostParts.length; k++) {
            result.push(new /*<UriElement>*/Token(hostParts[k], UriElementKind.HOST))
        }
        if (parsedPortFromAuthority != null) {
            result.push(new /*<UriElement>*/Token(parsedPortFromAuthority, UriElementKind.PORT));
        }
        else {
            if (getDefaultPort(scheme) > 0) {
                result.push(new /*<UriElement>*/Token(getDefaultPort(scheme).toString(), UriElementKind.PORT));
            }
        }
        if (parsedUserInfoFromAuthority != null) {
            if (userFromAuthority != null) {
                result.push(new /*<UriElement>*/Token(userFromAuthority, UriElementKind.USERINFO));
            }
            if (passwordFromAuthority != null) {
                result.push(new /*<UriElement>*/Token(passwordFromAuthority, UriElementKind.USERINFO));
            }
            if (userFromAuthority == null && passwordFromAuthority == null) {
                result.push(new /*<UriElement>*/Token(parsedUserInfoFromAuthority, UriElementKind.USERINFO));
            }
        }

        /*
        // This appears to be redundant to the parsedUserInfoFromAuthority check.
        else if (uri.userInfo != null) {
        var userInfo:String = uri.userInfo;
        var colonIdx:int = userInfo.indexOf(":");
        if (colonIdx >= 0) {
        result.push(new Token(userInfo.substring(0, colonIdx), UriElementKind.USERINFO));
        result.push(new Token(userInfo.substring(colonIdx + 1), UriElementKind.USERINFO));
        }
        else {
        result.add(new Token(uri.userInfo, UriElementKind.USERINFO));
        }
        */
        if (isNotBlank(path)) { // path
            if (path.charAt(0) == '/') {
                path = path.substring(1);
            }
            if (isNotBlank(path)) {
                var pathElements = path.split('/');
                for(var p = 0; p<pathElements.length;p++) {
                    var pathElement = pathElements[p];
                    result.push(new /*<UriElement>*/Token(pathElement, UriElementKind.PATH));
                }
            }
        }
        return result;
    }

    function getDefaultPort(scheme) {
        if (defaultPortsByScheme[scheme.toLowerCase()] != null) {
            return defaultPortsByScheme[scheme];
        }
        else {
            return -1;
        }
    }

    function defaultPortsByScheme()
    {
        http = 80;
        ws = 80;
        wss = 443;
        https = 443;
    }
    
    function isNotBlank(s) {
        return s != null && s.length > 0;
    }

    var $prototype = DispatchChallengeHandler.prototype; //extends DispatchChallengeHandler

    $prototype.clear = function() {
        this.rootNode = new Node();
    }
        
    $prototype.canHandle  = function(challengeRequest) {
        return lookupByRequest(this.rootNode, challengeRequest) != null;
    }

    $prototype.handle  = function(challengeRequest, callback) {
        var challengeHandler = lookupByRequest(this.rootNode, challengeRequest);
        if (challengeHandler == null) {
            return null;
        }
        return challengeHandler.handle(challengeRequest, callback);
    }

    /**
     * Register a challenge handler to respond to challenges at one or more locations.
     *
     * <p>When a challenge response is received for a protected URI, the <code>locationDescription</code>
     * matches against elements of the protected URI; if a match is found, one
     * consults the challenge handler(s) registered at that <code>locationDescription</code> to find
     * a challenge handler suitable to respond to the challenge.</p>
     *
     * <p>A <code>locationDescription</code> comprises a username, password, host, port and paths,
     * any of which can be wild-carded with the <code>*</code> character to match any number of request URIs.
     * If no port is explicitly mentioned in a <code>locationDescription</code>, a default port will be inferred
     * based on the scheme mentioned in the location description, according to the following table:
     * <table border=1>
     *     <tr><th>scheme</th><th>default port</th><th>Sample locationDescription</th></tr>
     *     <tr><td>http</td><td>80</td><td>foo.example.com or http://foo.example.com</td></tr>
     *     <tr><td>ws</td><td>80</td><td>foo.example.com or ws://foo.example.com</td></tr>
     *     <tr><td>https</td><td>443</td><td>https://foo.example.com</td></tr>
     *     <tr><td>wss</td><td>443</td><td>wss://foo.example.com</td></tr>
     * </table>
     * </p>
     *
     * <p>The protocol scheme (e.g. http or ws) if present in <code>locationDescription</code> will not be used to
     * match <code>locationDescription</code> with the protected URI, because authentication challenges are
     * implemented on top of one of the HTTP/s protocols always, whether one is initiating web socket
     * connections or regular HTTP connections.  That is to say for example, the <code>locationDescription</code> <code>foo.example.com</code>
     * matches both URIs <code>http://foo.example.com</code> and <code>ws://foo.example.com</code>.</p>
     *
     * <p>Some examples of <code>locationDescription</code> values with wildcards are:
     * <ol>
     *     <li>&#042;&#047; -- matches all requests to any host on port 80 (default port), with no user info or path specified.  </li>
     *     <li>&#042;<code>.hostname.com:8000</code>  -- matches all requests to port 8000 on any sub-domain of <code>hostname.com</code>,
     *         but not <code>hostname.com</code> itself.</li>
     *     <li><code>server.hostname.com:</code>&#042;&#047;&#042; -- matches all requests to a particular server on any port on any path but not the empty path. </li>
     * </ol></p>
     *
     * @param locationDescription the (possibly wild-carded) location(s) at which to register a handler.
     * @param challengeHandler the challenge handler to register at the location(s).
     *
     * @return {ChallengeHandler} a reference to this challenge handler for chained calls
     * @public
     * @function
     * @name register
     * @memberOf DispatchChallengeHandler
     */
    $prototype.register  = function(locationDescription, challengeHandler) {
        if (locationDescription == null || locationDescription.length == 0) {
            throw new Error("Must specify a location to handle challenges upon.");
        }
        if (challengeHandler == null) {
            throw new Error("Must specify a handler to handle challenges.");
        }
        
        addChallengeHandlerAtLocation(this.rootNode, locationDescription, challengeHandler);
        return this;
    }

    /**
     * If the provided challengeHandler is registered at the provided location, clear that
     * association such that any future challenge requests matching the location will never
     * be handled by the provided challenge handler.
     *
     * <p>If no such location or challengeHandler registration exists, this method silently succeeds.</p>
     *
     * @param locationDescription the exact location description at which the challenge handler was originally registered
     * @param challengeHandler the challenge handler to de-register.
     *
     * @return {ChallengeHandler} a reference to this object for chained call support
     * @public
     * @function
     * @name unregister
     * @memberOf DispatchChallengeHandler
     */
    $prototype.unregister  = function(locationDescription, challengeHandler) {
        if (locationDescription == null || locationDescription.length == 0) {
            throw new Error("Must specify a location to un-register challenge handlers upon.");
        }
        if (challengeHandler == null) {
            throw new Error("Must specify a handler to un-register.");
        }
        delChallengeHandlerAtLocation(this.rootNode, locationDescription, challengeHandler);
        return this;
    }

    return DispatchChallengeHandler;
})();

// This will help the rest of the code within the closure to access DispatchChallengeHandler by a 
// straight variable name instead of using $module.DispatchChallengeHandler
var DispatchChallengeHandler = $module.DispatchChallengeHandler;

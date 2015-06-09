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
 <b>Do not create a new instance of HttpRedirectPolicy. Use the pre-defined
 policies for following HTTP redirect requests with response code 3xx.</b>

 @name  HttpRedirectPolicy
 @class Using HttpRedirectPolicy, application developers can more control over
 HTTP redirect in a clustered environment. Application developers can
 specify the policy using WebSocketFactory.setDefaultRedirectPolicy()
 that will be inherited by all the WebSocket objects that are created
 from the factory. The policy can be overridden on individual connection
 basis using WebSocket.setRedirectPolicy().
 <p>
 The pre-defined policies are HttpRedirectPolicy.ALWAYS,
 HttpRedirectPolicy.NEVER, HttpRedirectPolicy.PEER_DOMAIN,
 HttpRedirectPolicy.SAME_DOMAIN, HttpRedirectPolicy.SAME_ORIGIN, and
 HttpRedirectPolicy.SUB_DOMAIN.
 */

/**
 <B>(Read only)</B> Follow HTTP redirect requests always regardless of the
 origin, host, domain, etc.

 @field
 @readonly
 @name HttpRedirectPolicy.ALWAYS
 @type HttpRedirectPolicy
 @memberOf HttpRedirectPolicy
 */

/**
 <B>(Read only)</B> Do not follow HTTP redirects.

 @field
 @readonly
 @name HttpRedirectPolicy.NEVER
 @type HttpRedirectPolicy
 @memberOf HttpRedirectPolicy
 */

/**
 <B>(Read only)</B> Follow HTTP redirect only if the redirected request is
 for a peer-domain. This implies that both the scheme/protocol and the
 <b>domain</b> should match between the current and the redirect URIs.
 <p>
 URIs that satisfy HttpRedirectPolicy.SAME_DOMAIN policy will implicitly
 satisfy HttpRedirectPolicy.PEER_DOMAIN policy.
 <p>
 To determine if the two URIs that are passed into
 <b>isRedirectionAllowed(originalURI, redirectedURI)</b>
 function have peer-domains, we do the following:
 <ul>
 <li>compute base-domain by removing the token before the first '.' in the
 hostname of the original URI and check if the hostname of the redirected
 URI ends with the computed base-domain
 <li>compute base-domain by removing the token before the first '.' in the
 hostname of the redirected URI and check if the hostname of the original
 URI ends with the computed base-domain
 </ul>
 <p>
 If both the conditions are satisfied, then we conclude that the URIs are for
 peer-domains. However, if the host in the URI has no '.'(for eg., ws://localhost:8000),
 then we just use the entire hostname as the computed base-domain.
 <p>
 <p>
 If you are using this policy, it is recommended that the number of tokens in
 the hostname be atleast 2 + number_of_tokens(top-level-domain). For example,
 if the top-level-domain(TLD) is "com", then the URIs should have atleast 3 tokens
 in the hostname. So, ws://marketing.example.com:8001 and ws://sales.example.com:8002
 are examples of URIs with peer-domains. Similarly, if the TLD is "co.uk", then
 the URIs should have atleast 4 tokens in the hostname. So,
 ws://marketing.example.co.uk:8001 and ws://sales.example.co.uk:8002 are examples of
 URIs with peer-domains.
 @field
 @readonly
 @name HttpRedirectPolicy.PEER_DOMAIN
 @type HttpRedirectPolicy
 @memberOf HttpRedirectPolicy
 */

/**
 <B>(Read only)</B> Follow HTTP redirect only if the redirected request is
 for same domain. This implies that both the scheme/protocol and the
 <b>hostname</b> should match between the current and the redirect URIs.
 <p>
 URIs that satisfy HttpRedirectPolicy.SAME_ORIGIN policy will implicitly satisfy
 HttpRedirectPolicy.SAME_DOMAIN policy.
 <p>
 URIs with identical domains would be ws://production.example.com:8001 and
 ws://production.example.com:8002.

 @field
 @readonly
 @name HttpRedirectPolicy.SAME_DOMAIN
 @type HttpRedirectPolicy
 @memberOf HttpRedirectPolicy
 */

/**
 <B>(Read only)</B> Follow HTTP redirect only if the redirected request is
 for same origin. This implies that both the scheme/protocol and the
 <b>authority</b> should match between the current and the redirect URIs.
 Note that authority includes the hostname and the port.

 @field
 @readonly
 @name HttpRedirectPolicy.SAME_ORIGIN
 @type HttpRedirectPolicy
 @memberOf HttpRedirectPolicy
 */

/**
 <B>(Read only)</B> Follow HTTP redirect only if the redirected request is
 for child-domain or sub-domain of the original request.
 <p>
 URIs that satisfy HttpRedirectPolicy.SAME_DOMAIN policy will implicitly
 satisfy HttpRedirectPolicy.SUB_DOMAIN policy.
 <p>
 To determine if the domain of the redirected URI is sub-domain/child-domain
 of the domain of the original URI, we check if the hostname of the
 redirected URI ends with the hostname of the original URI.
 <p>
 Domain of the redirected URI ws://benefits.hr.example.com:8002 is a
 sub-domain/child-domain of the domain of the original URI
 ws://hr.example.com:8001. Note that domain in ws://example.com:9001 is a
 sub-domain of the domain in ws://example.com:9001.

 @field
 @readonly
 @name HttpRedirectPolicy.SUB_DOMAIN
 @type HttpRedirectPolicy
 @memberOf HttpRedirectPolicy
 */
(function ($module) {
    $module.HttpRedirectPolicy = (function () {
        ;
        ;
        ;
        var CLASS_NAME = "HttpRedirectPolicy";
        ;
        ;
        ;
        var LOG = Logger.getLogger(CLASS_NAME);

        /*
         * @private
         */
        var HttpRedirectPolicy = function (name) {
            if (arguments.length < 1) {
                var s = "HttpRedirectPolicy: Please specify the policy name.";
                throw Error(s);
            }

            if (typeof(name) == "undefined") {
                var s = "HttpRedirectPolicy: Please specify required \'name\' parameter.";
                throw Error(s);
            }
            else if (typeof(name) != "string") {
                var s = "HttpRedirectPolicy: Required parameter \'name\' is a string.";
                throw Error(s);
            }

            this.name = name;
        };

        var $prototype = HttpRedirectPolicy.prototype;

        /**
         Returns the policy name.

         @name    toString
         @returns {string}

         @public
         @function
         @memberOf HttpRedirectPolicy#
         */
        $prototype.toString = function () {
            return "HttpRedirectPolicy." + this.name;
        }

        /**
         Returns true if the policy allows redirecting from the original URI to
         the redirect URI. Otherwise false is returned.

         @name    isRedirectAllowed
         @param   originalLoc {String} the original URI
         @param   redirectLoc {String} the redirected URI
         @returns {boolean}

         @public
         @function
         @memberOf HttpRedirectPolicy#
         */
        $prototype.isRedirectionAllowed = function (originalLoc, redirectLoc) {
            if (arguments.length < 2) {
                var s = "HttpRedirectPolicy.isRedirectionAllowed(): Please specify both the \'originalLoc\' and the \'redirectLoc\' parameters.";
                throw Error(s);
            }

            if (typeof(originalLoc) == "undefined") {
                var s = "HttpRedirectPolicy.isRedirectionAllowed(): Please specify required \'originalLoc\' parameter.";
                throw Error(s);
            }
            else if (typeof(originalLoc) != "string") {
                var s = "HttpRedirectPolicy.isRedirectionAllowed(): Required parameter \'originalLoc\' is a string.";
                throw Error(s);
            }

            if (typeof(redirectLoc) == "undefined") {
                var s = "HttpRedirectPolicy.isRedirectionAllowed(): Please specify required \'redirectLoc\' parameter.";
                throw Error(s);
            }
            else if (typeof(redirectLoc) != "string") {
                var s = "HttpRedirectPolicy.isRedirectionAllowed(): Required parameter \'redirectLoc\' is a string.";
                throw Error(s);
            }

            var retval = false;
            var originalURI = new URI(originalLoc.toLowerCase().replace("http", "ws"));
            var redirectURI = new URI(redirectLoc.toLowerCase().replace("http", "ws"));

            switch (this.name) {
                case "ALWAYS":
                    retval = true;
                    break;

                case "NEVER":
                    retval = false;
                    break;

                case "PEER_DOMAIN":
                    retval = isPeerDomain(originalURI, redirectURI);
                    break;

                case "SAME_DOMAIN":
                    retval = isSameDomain(originalURI, redirectURI);
                    break;

                case "SAME_ORIGIN":
                    retval = isSameOrigin(originalURI, redirectURI);
                    break;

                case "SUB_DOMAIN":
                    retval = isSubDomain(originalURI, redirectURI);
                    break;

                default:
                    var s = "HttpRedirectPolicy.isRedirectionAllowed(): Invalid policy: " + this.name;
                    throw new Error(s);
            }

            return retval;
        }

        // Returns true if redirectURI is a peer-domain of the orginalURI. Otherwise,
        // false is returned.
        function isPeerDomain(originalURI, redirectURI) {
            if (isSameDomain(originalURI, redirectURI)) {
                // If the domains are the same, then they are peers.
                return true;
            }

            var originalScheme = originalURI.scheme.toLowerCase();
            var redirectScheme = redirectURI.scheme.toLowerCase();

            // We should allow redirecting to a more secure scheme from a less
            // secure scheme. For example, we should allow redirecting from 
            // ws -> wss and wse -> wse+ssl.
            if (redirectScheme.indexOf(originalScheme) == -1) {
                return false;
            }

            var originalHost = originalURI.host;
            var redirectHost = redirectURI.host;
            var originalBaseDomain = getBaseDomain(originalHost);
            var redirectBaseDomain = getBaseDomain(redirectHost);

            if (redirectHost.indexOf(originalBaseDomain, (redirectHost.length - originalBaseDomain.length)) == -1) {
                // If redirectHost does not end with the base domain computed using
                // the originalURI, then return false.
                return false;
            }

            if (originalHost.indexOf(redirectBaseDomain, (originalHost.length - redirectBaseDomain.length)) == -1) {
                // If originalHost does not end with the base domain computed using
                // the redirectURI, then return false.
                return false;
            }

            // Otherwise, the two URIs have peer-domains.
            return true;
        }

        // Returns true if redirectURI has same domain as the orginalURI. Otherwise,
        // false is returned.
        function isSameDomain(originalURI, redirectURI) {
            if (isSameOrigin(originalURI, redirectURI)) {
                // If the URIs have same origin, then they implicitly have same
                // domain.
                return true;
            }

            var originalScheme = originalURI.scheme.toLowerCase();
            var redirectScheme = redirectURI.scheme.toLowerCase();

            // We should allow redirecting to a more secure scheme from a less
            // secure scheme. For example, we should allow redirecting from 
            // ws -> wss and wse -> wse+ssl.
            if (redirectScheme.indexOf(originalScheme) == -1) {
                return false;
            }

            var originalHost = originalURI.host.toLowerCase();
            var redirectHost = redirectURI.host.toLowerCase();
            if (originalHost == redirectHost) {
                return true;
            }

            return false;
        }

        // Returns true if redirectURI has same origin as the orginalURI. Otherwise,
        // false is returned.
        function isSameOrigin(originalURI, redirectURI) {
            var originalScheme = originalURI.scheme.toLowerCase();
            var redirectScheme = redirectURI.scheme.toLowerCase();
            var originalAuthority = originalURI.authority.toLowerCase();
            var redirectAuthority = redirectURI.authority.toLowerCase();

            if ((originalScheme == redirectScheme) &&
                (originalAuthority == redirectAuthority)) {
                return true;
            }

            return false;
        }

        // Returns true if redirectURI is a sub-domain of the orginalURI. Otherwise,
        // false is returned.
        function isSubDomain(originalURI, redirectURI) {
            if (isSameDomain(originalURI, redirectURI)) {
                // If the domains are the same, then one can be a sub-domain of the other.
                return true;
            }

            var originalScheme = originalURI.scheme.toLowerCase();
            var redirectScheme = redirectURI.scheme.toLowerCase();

            // We should allow redirecting to a more secure scheme from a less
            // secure scheme. For example, we should allow redirecting from 
            // ws -> wss and wse -> wse+ssl.
            if (redirectScheme.indexOf(originalScheme) == -1) {
                return false;
            }

            var originalHost = originalURI.host.toLowerCase();
            var redirectHost = redirectURI.host.toLowerCase();

            // If the current host is gateway.example.com, and the new
            // is child.gateway.example.com, then allow redirect.
            if (redirectHost.length < originalHost.length) {
                return false;
            }

            var s = "." + originalHost;

            if (redirectHost.indexOf(s, (redirectHost.length - s.length)) == -1) {
                // If the redirectHost does not end with the originalHost, then
                // return false.
                return false;
            }

            return true;
        }

        /*
         function getBaseDomain(host) {
         var tokens = host.split('.');
         var len = tokens.length;

         if (len <= 2) {
         return host;
         }

         var domain = tokens[len - 2] + "." + tokens[len - 1];
         return domain;
         }
         */

        // Compute base-domain by removing the token before the first '.' in
        // the specified hostname.
        function getBaseDomain(host) {
            var tokens = host.split('.');
            var len = tokens.length;

            if (len <= 2) {
                // If the specified hostname does not have more than 2 tokens,
                // then just use the hostname as the base domain.
                return host;
            }

            var baseDomain = "";
            for (var i = 1; i < len; i++) {
                baseDomain += "." + tokens[i];
            }

            return baseDomain;
        }

        HttpRedirectPolicy.ALWAYS = new HttpRedirectPolicy("ALWAYS");
        HttpRedirectPolicy.NEVER = new HttpRedirectPolicy("NEVER");
        HttpRedirectPolicy.PEER_DOMAIN = new HttpRedirectPolicy("PEER_DOMAIN");
        HttpRedirectPolicy.SAME_DOMAIN = new HttpRedirectPolicy("SAME_DOMAIN");
        HttpRedirectPolicy.SAME_ORIGIN = new HttpRedirectPolicy("SAME_ORIGIN");
        HttpRedirectPolicy.SUB_DOMAIN = new HttpRedirectPolicy("SUB_DOMAIN");

        return HttpRedirectPolicy;
    })();
})(Kaazing.Gateway);

//This will help the rest of the code within the closure to access HttpRedirectPolicy by a 
//straight variable name instead of using $module.HttpRedirectPolicy
var HttpRedirectPolicy = Kaazing.Gateway.HttpRedirectPolicy;

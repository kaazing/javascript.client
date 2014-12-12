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
  Creates a new WebSocketFactory instance.

  @constructor
  @name  WebSocketFactory
  @class WebSocketFactory is used to create instances of WebSocket by specifying 
         the end-point and the enabled protocols.
         <p>
         Using WebSocketFactory instance, application developers can set the ChallengeHandler
         or enabled extensions that will be inherited by all the WebSocket instances created 
         from the factory. Once the WebSocket is connected, extensions that were successfully
         negotiated with the server can be determined using <code>WebSocket.extensions</code>
         property.
*/

(function($module) {
    
    $module.WebSocketFactory = (function() {
        
        ;;;var CLASS_NAME = "WebSocketFactory";
        ;;;var LOG = Logger.getLogger(CLASS_NAME);

        var WebSocketFactory = function() {
            this.extensions = {};
            this.redirectPolicy = $module.HttpRedirectPolicy.ALWAYS;
        }

        var $prototype = WebSocketFactory.prototype;
        
        /**
          Gets the specified extension from the list of registered extensions. A null is
          returned if no extension with the specified name has been registered for this factory. 
          
          @name getExtension
          @param name {String} extension name
          @return {WebSocketExtension}  the registered extension with the specified name

          @public
          @function
          @memberOf WebSocketFactory#
         */
        $prototype.getExtension = function(name) {
            return this.extensions[name];
        }
        
        /**
          Registers the specified extension. All the registered extensions are inherited by 
          the WebSocket instances created using this factory. The extensions will be
          negotiated between the client and the server during the WebSocket handshake.
          The negotiated extensions can be obtained directly from the WebSocket
          instance using <code>WebSocket.extensions</code> property after the connection has 
          been established. 
          <p>
          @name setExtension
          @param extension  {WebSocketExtension} extension to be inherited by all the WebSockets 
                                                 created using this factory
          @return {void}

          @public
          @function
          @memberOf WebSocketFactory#
         */
        $prototype.setExtension = function(extension) {
            this.extensions[extension.name] = extension;
        }

        /**
          Sets the default ChallengeHandler that is used during
          authentication both at the connect-time as well as at subsequent 
          revalidation-time that occurs at regular intervals. All the 
          WebSockets created using this factory will inherit the default
          ChallengeHandler.
         
          @name setChallengeHandler
          @param challengeHandler  {ChallengeHandler}  the default ChallengeHandler
          @return {void}

          @public
          @function
          @memberOf WebSocketFactory#
         */
        $prototype.setChallengeHandler = function(challengeHandler) {
            if (typeof(challengeHandler) == "undefined") {
                var s = "WebSocketFactory.setChallengeHandler(): Parameter \'challengeHandler\' is required";
                throw new Error(s);
            }
            
            this.challengeHandler = challengeHandler;
        }
        
        /**
          Gets the default ChallengeHandler that is used during
          authentication both at the connect-time as well as at subsequent 
          revalidation-time that occurs at regular intervals. 
          
          @name getChallengeHandler
          @return {ChallengeHandler} the default ChallengeHandler
                    
          @public
          @function
          @memberOf WebSocketFactory#
         */
        $prototype.getChallengeHandler = function() {
            return this.challengeHandler || null;
        }
        
        /**
          Creates a WebSocket to establish a full-duplex connection to the 
          target location.
          <p>
          The extensions that were registered with the WebSocketFactory instance 
          prior to this call are inherited by the newly created WebSocket instance.
          <p>
          If the port is blocked by the browser or if a secure connection is
          attempted from a non-secure origin, this function will throw a
          <code>SecurityException</code>.
          <p>
          If any protocol value is invalid or if a protocol appears in the Array
          more than once, this function will throw a <code>SyntaxError</code>.
          <p>

          @name createWebSocket
          @param location    {string} URL of the WebSocket service for the connection
          @param protocols{string[]} protocols for the connection
          @return {WebSocket} the WebSocket
      
          @public
          @function
          @memberOf WebSocketFactory#
        */
       $prototype.createWebSocket = function(url, protocols) {
           var ext = [];
           for (var key in this.extensions) {
               if (this.extensions.hasOwnProperty(key) && this.extensions[key].enabled) {
                   ext.push(this.extensions[key].toString());
               }
           }

           var challengeHandler = this.getChallengeHandler();
           var connectTimeout = this.getDefaultConnectTimeout();
           var redirectPolicy = this.getDefaultRedirectPolicy();
           var ws = new WebSocket(url, protocols, ext, challengeHandler, connectTimeout, redirectPolicy);

           return ws;
       }
    
       /**
         Sets the default connect timeout in milliseconds. The specified
         timeout is inherited by all the WebSocket instances that are created
         using this WebSocketFactory instance. The timeout will expire if there is
         no exchange of packets(for example, 100% packet loss) while establishing
         the connection. A timeout value of zero indicates no timeout.

         @name setDefaultConnectTimeout
         @param connectTimeout  {int}   default connection timeout
         @return {void}

         @public
         @function
         @memberOf WebSocketFactory#
         */
        $prototype.setDefaultConnectTimeout = function(connectTimeout) {
            if (typeof(connectTimeout) == "undefined") {
                var s = "WebSocketFactory.setDefaultConnectTimeout(): int parameter \'connectTimeout\' is required";
                throw new Error(s);
            }

            if (typeof(connectTimeout) != "number") {
                var s = "WebSocketFactory.setDefaultConnectTimeout(): connectTimeout should be an integer";
                throw new Error(s);
            }
        
            if (connectTimeout < 0) {
                var s = "WebSocketFactory.setDefaultConnectTimeout(): Connect timeout cannot be negative";
                throw new Error(s);
            }

            this.connectTimeout = connectTimeout;
         }

        /**
          Gets the default connect timeout in milliseconds. Default value of the
          default connect timeout is zero -- which means no timeout.
          
          @name getDefaultConnectTimeout
          @return {int}  default connect timeout
                    
          @public
          @function
          @memberOf WebSocketFactory#
         */
        $prototype.getDefaultConnectTimeout = function() {
            return this.connectTimeout || 0;
        }

        /**
          Sets the default HTTP redirect policy used in a clustered environment.
          The specified policy is inherited by all the WebSocket instances that
          are created using this WebSocketFactory instance.

          @name setDefaultRedirectPolicy
          @param redirectPolicy  {HttpRedirectPolicy}   default HTTP redirect policy
          @return {void}

          @public
          @function
          @memberOf WebSocketFactory#
        */
        $prototype.setDefaultRedirectPolicy = function(redirectPolicy) {
            if (typeof(redirectPolicy) == "undefined") {
                var s = "WebSocketFactory.setDefaultRedirectPolicy(): int parameter \'redirectPolicy\' is required";
                throw new Error(s);
            }

            if (!(redirectPolicy instanceof $module.HttpRedirectPolicy)) {
                var s = "WebSocketFactory.setDefaultRedirectPolicy(): redirectPolicy should be an instance of HttpRedirectPolicy";
                throw new Error(s);
            }

            this.redirectPolicy = redirectPolicy;
        }

        /**
          Gets the default HTTP redirect policy used in a clustered environment.
          Default redirect policy is HttpRedirectPolicy.ALWAYS.

          @name getDefaultRedirectPolicy
          @return {HttpRedirectPolicy}  default HTTP redirect policy

          @public
          @function
          @memberOf WebSocketFactory#
        */
        $prototype.getDefaultRedirectPolicy = function() {
            return this.redirectPolicy;
        }

        return WebSocketFactory;
    })();
})(Kaazing.Gateway);

// This will help the rest of the code within the closure to access WebSocketFactory by a 
// straight variable name instead of using $module.WebSocketFactory
var WebSocketFactory = Kaazing.Gateway.WebSocketFactory;

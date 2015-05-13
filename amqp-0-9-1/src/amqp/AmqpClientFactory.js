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
  Creates a new AmqpClientFactory instance.

  @constructor
  @class AmqpClientFactory is used to create instances of AmqpClient.
*/
var AmqpClientFactory = function() {
    if ($gatewayModule && typeof($gatewayModule.WebSocketFactory) === "function") {
        this._webSocketFactory = new $gatewayModule.WebSocketFactory();
    }
};

(function($module) {    
    var $prototype = AmqpClientFactory.prototype;
    
    /**
     * Creates an instance of AmqpClient to run AMQP 0-9-1 protocol over a 
     * full-duplex WebSocket connection.
     *
     * @public
     * @function
     * @name createAmqpClient
     * @return {AmqpClient} the AmqpClient
     * @memberOf AmqpClientFactory#
     */
    $prototype.createAmqpClient = function() {
        return new AmqpClient(this);
    }

    /**
     * Returns WebSocketFactory instance that is used to create connection
     * if Kaazing's WebSocket implementation is used. This method returns a
     * null if the browser's WebSocket implementation is being used. The
     * WebSocketFactory instance can be used to set WebSocket related
     * characteristics such as connection-timeout, challenge handlers, etc.
     *
     * @public
     * @function
     * @name getWebSocketFactory
     * @return {WebSocketFactory}
     * @memberOf AmqpClientFactory#
     */
    $prototype.getWebSocketFactory = function() {
        return (this._webSocketFactory || null);
    }

    /**
     * Sets WebSocketFactory instance that is used to create connection if
     * Kaazing's WebSocket implementation is used. This method will throw an 
     * error if the parameter is null, undefined or not an instance of 
     * WebSocketFactory.
     *
     * @public
     * @function
     * @name setWebSocketFactory
     * @param factory {WebSocketFactory}  instance of WebSocketFactory
     * @return {void}
     * @memberOf AmqpClientFactory#
     */
    $prototype.setWebSocketFactory = function(factory) {
        if ((factory === null) || (typeof(factory) === "undefined")) {
            throw new Error("AmqpClientFactory.setWebSocketFactory(): \'factory\' is required parameter.");
        }
        if (!(factory instanceof $gatewayModule.WebSocketFactory)) {
            throw new Error("AmqpClientFactory.setWebSocketFactory(): \'factory\' must be an instance of WebSocketFactory.");
        }
        this._webSocketFactory = factory;
    }

    $module.AmqpClientFactory = AmqpClientFactory;

})(Kaazing.AMQP);

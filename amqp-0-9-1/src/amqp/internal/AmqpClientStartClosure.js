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
 * <b>Application developers should use AmqpClientFactory.createAmqpClient() 
 * function to create an instance of AmqpClient.</b>
 *
 * AmqpClient is used to connect to the end-point that handles AMQP 0-9-1
 * protocol over WebSocket.
 *
 * @constructor
 * @param factory {AmqpClientFactory} factory used to create AmqpClient instance
 *
 * @class  AmqpClient models the CONNECTION class defined in AMQP 0-9-1 protocol
 * by abstracting the methods defined in the protocol and exposing a far simpler 
 * API. <b>Application developers should use 
 * <code>AmqpClientFactory#createAmqpClient()</code> function to create an 
 * instance of AmqpClient.</b>
 *
 */
var AmqpClient = function(factory) {
    if (!factory || !(factory instanceof AmqpClientFactory)) {
        throw new Error("AmqpClient: Required parameter \'factory\' must be an instance of AmqpClientFactory");
    }

    this._amqpClientFactory = factory;
    this._options = {}
    this._readyState = 0;

    this._init();
};

(function() {

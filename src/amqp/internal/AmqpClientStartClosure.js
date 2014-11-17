/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
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

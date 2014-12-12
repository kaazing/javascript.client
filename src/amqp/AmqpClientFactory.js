/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

/**
  Creates a new AmqpClientFactory instance.

  @constructor
  @name  AmqpClientFactory
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
     * @name createAmqpClient
     * @return {AmqpClient} the AmqpClient
     *
     * @public
     * @function
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
     * @return {WebSocketFactory}
     *
     * @public
     * @function
     * @name getWebSocketFactory
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
     * @param factory {WebSocketFactory}  instance of WebSocketFactory
     * @return {void}
     *
     * @public
     * @function
     * @name setWebSocketFactory
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

})(window || Kaazing.AMQP);

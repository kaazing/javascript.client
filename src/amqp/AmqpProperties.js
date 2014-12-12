/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

/**
 * Creates an AmqpProperties instance.  
 * <p>
 * The value of the "headers" property is of type AmqpArguments. Kaazing
 * AMQP implementation uses AmqpArguments to encode the "table". Similarly,
 * Kaazing AMQP implementation decodes the "table" and constructs an instance
 * of AmqpArguments.
 *
 * @constructor
 *
 * @class AmqpProperties class is used to specify the pre-defined properties as per
 * AMQP 0-9-1 specification. This class provides type-safe convenience getters
 * and setters for the pre-defined or standard AMQP properties.
 *
 * @see AmqpArguments
 */

var AmqpProperties = function(headers) {
    this._properties = {};
    if (headers != null) {
        // Confirm that the passed in map contains just the pre-defined
        // properties.
        var propFound = false;
            
        // For each property available in the set, we confirm whether it is
        // a valid pre-defined property by cross-checking with the
        // AmqpBuffer.basicProperties.
        for (var prop in headers) {
            propFound = false;
            for (var i = 0; i <_basicProperties.length; i++) {
                if (prop == _basicProperties[i].name) {
                    // Move to the next prop in the set.
                    propFound = true;
                    break;
                }
            }
                
            if (!propFound) {
                throw new Error("Illegal property: '" + prop.getKey() + "' passed");
            }
        }
            
        // Validate the values specified in the map.
        for (var propName in headers) {
            var propValue = headers[propName];
            if (propName == "appId"           ||
                propName == "contentType"     ||
                propName == "contentEncoding" ||
                propName == "correlationId"   ||
                propName == "expiration"      ||
                propName == "messageId"       ||
                propName == "replyTo"         ||
                propName == "type"            ||
                propName == "userId")
                {
                    
                if ((propValue != null) && (typeof(propValue) != "string")) {
                    var s = "Invalid type: Value of '" + propName +
                    "' should be of type String";
                    throw new Error(s);
                }
            }
            else if (propName == "headers") {
                if ((propValue != null) && 
                    !(propValue instanceof AmqpArguments)) {
                    s = "Invalid type: Value of '" + propName +
                    "' should be of type AmqpArguments";
                    throw new Error(s);
                }
            }
            else if (propName =="timestamp") {
                // There is no good way to figure out whether an object is
                // an instance of Date. That's why we are checking whether
                // the object has getMonth function that is callable.
                if ((propValue != null) && 
                     propValue.getMonth && propValue.getMonth.call) {
                    continue;
                }
                
                // Otherwise, throw an error.
                var s = "Invalid type: Value of '" + propName +
                    "' should be of type Date";
                throw new Error(s);
            }
            else if (propName== "deliveryMode") {
                if ((propValue != null) && (typeof(propValue) != "number")) {
                    var s = "Invalid type: Value of '" + propName +
                    "' should be of type Integer";
                    throw new Error(s);
                }
                    
                if ((propValue != 1) && (propValue != 2)) {
                    var s = "Invalid value: Value of '" + propName +
                    "' should be either 1(non-persistent) or 2(persistent)";
                    throw new Error(s);
                }
            }
            else if (propName == "priority") {
                if ((propValue != null) && (typeof(propValue) != "number")) {
                    var s = "Invalid type: Value of '" + propName +
                    "' should be of type Integer";
                    throw new Error(s);
                }
                    
                if ((propValue < 0) || (propValue > 9)) {
                    var s = "Invalid value: Value of property '" + propName +
                    "' should be between 0 and 9";
                    throw new Error(s);
                }
            }
            else {
                var s = "Illegal property '" + propName + "' specified";
                throw new Error(s);
            }
        }      
        this._properties = headers;
    }
};
(function() {    
    var $prototype = AmqpProperties.prototype;
    /**
     * Returns the value of "appId" property. A null is returned if the property
     * is not set.
     * 
     * @public
     * @function
     * @return {String}
     * @name getAppId
     * @memberOf AmqpProperties#
     * @return String value for "appId" property
     */
    $prototype.getAppId = function() {
        return this._properties["appId"];
    }

    /**
     * Returns the value of "contentType" property. A null is returned if the
     * property is not set.
     * 
     * @public
     * @function
     * @return {String}
     * @name getContentType
     * @memberOf AmqpProperties#
     * @return String value for "contentType" property
     */
    $prototype.getContentType = function() {
        return this._properties["contentType"];
    }
    
    /**
     * Returns the value of "contentEncoding" property. A null is returned if
     * the property is not set.
     * 
     * @public
     * @function
     * @return {String}
     * @name getContentEncoding
     * @memberOf AmqpProperties#
     * @return String value for "contentEncoding" property
     */
    $prototype.getContentEncoding = function() {
        return /*(String)*/ this._properties["contentEncoding"];
    }
    
    /**
     * Returns the value of "correlationId" property. A null is returned if the
     * property is not set.
     * 
     * @public
     * @function
     * @return {String}
     * @name getCorrelationId
     * @memberOf AmqpProperties#
     * @return String value for "correlationId" property
     */
    $prototype.getCorrelationId = function() {
        return /*(String)*/ this._properties["correlationId"];
    }

    /**
     * Returns the value of "deliveryMode" property. A null is returned if the
     * property is not set. If deliveryMode is 1, then it indicates 
     * non-persistent mode. If deliveryMode is 2, then it indicates a persistent
     * mode.
     * 
     * @public
     * @function
     * @return {Number}
     * @name getDeliveryMode
     * @memberOf AmqpProperties#
     * @return Integer value between 0 and 9 for "deliveryMode" property
     */
    $prototype.getDeliveryMode = function() {
        return parseInt(this._properties["deliveryMode"]);
    }
    
    /**
     * Returns the value of "expiration" property. A null is returned if the
     * property is not set.
     * 
     * @public
     * @function
     * @return {Number}
     * @name getExpiration
     * @memberOf AmqpProperties#
     * @return String value for "expiration" property
     */
    $prototype.getExpiration = function() {
        return this._properties["expiration"];
    }

    /**
     * Returns the value of "headers" property. A null is returned if the
     * property is not set.
     * 
     * @public
     * @function
     * @return {object}
     * @name getHeaders
     * @memberOf AmqpProperties#
     * @return AmqpArguments as value for "headers" property
     */
    $prototype.getHeaders = function() {
        return this._properties["headers"];
    }
    
    /**
     * Returns the value of "messageId" property. A null is returned if the
     * property is not set.
     * 
     * @public
     * @function
     * @return {String}
     * @name getMessageId
     * @memberOf AmqpProperties#
     * @return String value for the "messageId" property
     */
    $prototype.getMessageId = function() {
        return this._properties["messageId"];
    }

    /**
     * Returns the value of "priority" property. A null is returned if the
     * property is not set.
     * 
     * @public
     * @function
     * @return {Number}
     * @name getPriority
     * @memberOf AmqpProperties#
     * @return Integer value for "priority" property between 0 and 9
     */
    $prototype.getPriority = function() {
        return parseInt(this._properties["priority"]);
    }
    
    /**
     * Returns a clone of the properties by shallow copying the values.
     * 
     * @public
     * @function
     * @return {object}
     * @name getProperties
     * @memberOf AmqpProperties#
     * @return Object with the name-value pairs
     */
    $prototype.getProperties = function() {
        // Shallow copy entries to a newly instantiated HashMap.
        var clone = {};
        
        for (var key in this._properties) {
            if (this._properties[key] != null) {
                clone[key] =  this._properties[key];
            }
        }
        
        return clone;
    }

    /**
     * Returns the value of "replyTo" property. A null is returned if the
     * property is not set.
     * 
     * @public
     * @function
     * @return {String}
     * @name getReplyTo
     * @memberOf AmqpProperties#
     * @return String value for "replyTo" property
     */
    $prototype.getReplyTo = function() {
        return this._properties["replyTo"];
    }
    
    /**
     * Returns the value of "timestamp" property. A null is returned if the
     * property is not set.
     * 
     * @public
     * @function
     * @return {Number}
     * @name getTimestamp
     * @memberOf AmqpProperties#
     * @return Timestamp value for "timestamp" property
     */
    $prototype.getTimestamp = function() {
        return this._properties["timestamp"];
    }
    
    /**
     * Returns the value of "type" property. A null is returned if the
     * property is not set.
     * 
     * @public
     * @function
     * @return {String}
     * @name getType
     * @memberOf AmqpProperties#
     * @return String value for "type" property
     */
    $prototype.getType = function() {
        return this._properties["type"];
    }
    
    /**
     * Returns the value of "userId" property. A null is returned if the
     * property is not set.
     * 
     * @public
     * @function
     * @return {String}
     * @name getUserId
     * @memberOf AmqpProperties#
     * @return String value for  "userId" property
     */
    $prototype.getUserId = function() {
        return this._properties["userId"];
    }
    
    /**
     * Sets the value of "appId" property. If a null value is passed in, it
     * indicates that the property is not set.
     * 
     * @public
     * @function
     * @name setAppId
     * @param  appId    value of "appId" property
     * @memberOf AmqpProperties#
     */
    $prototype.setAppId = function(appId) {
        this._properties["appId"] = appId;
    }

    /**
     * Sets the value of "contentType" property. If a null value is passed in, it
     * indicates that the property is not set.
     * 
     * @public
     * @function
     * @name setContentType
     * @param  contentType    value of "contentType" property
     * @memberOf AmqpProperties#
     */
    $prototype.setContentType = function(contentType) {
        this._properties["contentType"] = contentType;
    }
    
    /**
     * Sets the value of "contentEncoding" property. If a null value is passed 
     * in, it indicates that the property is not set.
     * 
     * @public
     * @function
     * @name setContentEncoding
     * @param  encoding    value of "contentEncoding" property
     * @memberOf AmqpProperties#
     */
    $prototype.setContentEncoding = function(encoding) {
        this._properties["contentEncoding"] = encoding;
    }
    
    /**
     * Sets the value of "correlationId" property.  If a null value is passed 
     * in, it indicates that the property is not set.
     * 
     * @public
     * @function
     * @name setCorrelationId
     * @param  correlationId    value of "correlationId" property
     * @memberOf AmqpProperties#
     */
    $prototype.setCorrelationId = function(correlationId) {
        this._properties["correlationId"] = correlationId;
    }

    /**
     * Sets the value of "deliveryMode" property.  If a null value is passed 
     * in, it indicates that the property is not set.
     * 
     * @public
     * @function
     * @name setDeliveryMode
     * @memberOf AmqpProperties#
     * @param  deliveryMode    value of "deliveryMode" property
     */
    $prototype.setDeliveryMode = function(deliveryMode) {
        if (deliveryMode == null) {
            var s = "Null parameter passed into AmqpProperties.setPriority()";
            throw new Error(s);
        }
        
        // Perhaps, we could do an enum for deliveryMode. But, it will require
        // some major changes in encoding and decoding and we don't have much
        // time to do it across all the clients.
        if ((deliveryMode != 1) && (deliveryMode != 2)) {
            s = "AMQP 0-9-1 spec mandates 'deliveryMode' value to be " +
            "either 1(for non-persistent) or 2(for persistent)";
            throw new Error(s);
        }
        
        this._properties["deliveryMode"] = deliveryMode;
    }
    
    /**
     * Sets the value of "expiration" property.  If a null value is passed 
     * in, it indicates that the property is not set.
     * 
     * @public
     * @function
     * @name setExpiration
     * @memberOf AmqpProperties#
     * @param  expiration    value of "expiration" property
     */
    $prototype.setExpiration = function(expiration) {
        this._properties["expiration"] = expiration;
    }

    /**
     * Sets the value of "headers" property.  If a null value is passed 
     * in, it indicates that the property is not set.
     * 
     * @public
     * @function
     * @name setHeaders
     * @memberOf AmqpProperties#
     * @param  headers    value of "headers" property
     */
    $prototype.setHeaders = function(headers) {
        this._properties["headers"] = headers;
    }
    
    /**
     * Sets the value of "messageId" property. If a null value is passed 
     * in, it indicates that the property is not set.
     * 
     * @public
     * @function
     * @name setMessageId
     * @memberOf AmqpProperties#
     * @param  messageId    value of "messageId" property
     */
    $prototype.setMessageId = function(messageId) {
        this._properties["messageId"] = messageId;
    }

    /**
     * Sets the value of "priority" property. If a null value is passed 
     * in, it indicates that the property is not set.
     * 
     * @public
     * @function
     * @name setPriority
     * @memberOf AmqpProperties#
     * @param  priority    value of "priority" property
     */
    $prototype.setPriority = function(priority) {        
        if (priority == null) {
            var s = "Null parameter passed into AmqpProperties.setPriority()";
            throw new Error(s);
        }
        
        if ((priority < 0) || (priority > 9)) {
            s = "AMQP 0-9-1 spec mandates 'priority' value to be between 0 and 9";
            throw new Error(s);
        }
        
        this._properties["priority"] = priority;
    }
    
    /**
     * Sets the value of "replyTo" property. If a null value is passed 
     * in, it indicates that the property is not set.
     * 
     * @public
     * @function
     * @name setReplyTo
     * @memberOf AmqpProperties#
     * @param  replyTo    value of "replyTo" property
     */
    $prototype.setReplyTo = function(replyTo) {
        this._properties["replyTo"] = replyTo;
    }
    
    /**
     * Sets the value of "timestamp" property. If a null value is passed 
     * in, it indicates that the property is not set.
     * 
     * @public
     * @function
     * @name setTimestamp
     * @memberOf AmqpProperties#
     * @param  date    of type Date
     */
    $prototype.setTimestamp = function(date) {
        if (date != null) {
            if (date.getMonth && date.getMonth.call) {
               s = "AmqpProperties.setTimestamp() expects a Date"
            }
        }
        this._properties["timestamp"] = date;
    }
    
    /**
     * Sets the value of "type" property. If a null value is passed 
     * in, it indicates that the property is not set.
     * 
     * @public
     * @function
     * @name setType
     * @memberOf AmqpProperties#
     * @param  type    value of "type" property
     */
    $prototype.setType = function(type) {
        this._properties["type"] = type;
    }
    
    /**
     * Sets the value of "userId" property. If a null value is passed 
     * in, it indicates that the property is not set.
     * 
     * @public
     * @function
     * @name setUserId
     * @memberOf AmqpProperties#
     * @param  userId    value of "userId" property
     */
    $prototype.setUserId = function(userId) {
        this._properties["userId"] = userId;
    }
    
    /**
     * Returns String representation of the properties.
     *
     * @public
     * @function
     * @return {String}
     * @name toString
     * @memberOf AmqpProperties#
     *
     */
    $prototype.toString = function() {
        if ((this._properties == null) || (this._properties.length == 0)) {
            return "";
        }
        
        var buffer = []; 
        
        for (var key in this._properties) {
            if (this._properties[key] != null) {
                buffer.push(key + ":" + this._properties[key]);
            }
        }
        
        return "{" + buffer.join(", ") + "}";
    };

    $module.AmqpProperties = AmqpProperties;
    
})(window || Kaazing.AMQP);

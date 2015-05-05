/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

(function($module) {

    var _rename = function(type) {
        switch(type) {
            case "deliverBasic":
                return "message";
    
            case "closeOkChannel":
            case "closeChannel":
            case "closeOkConnection":
            case "closeConnection":
                return "close";
    
            case "getOkBasic":
            case "getEmptyBasic":
                return "get";
    
            // change in terminology
            case "consumeOkBasic":
                return "consume";
            case "cancelOkBasic":
                return "cancel";
            
            case "openOkConnection":
            case "openOkChannel":
                return "open";
            case "declareOkQueue":
                return "declarequeue";
            case "declareOkExchange":
                return "declareexchange";
            case "flowOkChannel":
                return "flow";
            case "bindOkQueue":
                return "bindqueue";
            case "unbindOkQueue":
                return "unbindqueue";
            case "deleteOkQueue":
                return "deletequeue";
            case "deleteOkExchange":
                return "deleteexchange";
            case "commitOkTx":
                return "committransaction";
            case "rollbackOkTx":
                return "rollbacktransaction";
            case "selectOkTx":
                return "selecttransaction";
            case "purgeOkQueue":
                return "purgequeue";
            case "recoverOkBasic":
                return "recover";
            case "rejectOkBasic":
                return "reject";
                
            case "error":
                return "error";
    
    
            default:
                throw(new Error("AMQP: unknown event name " + type));
    
        }    
    };
    
    /**
     * AmqpEvent is dispatched to event listeners and callback functions
     *  registered when using AmqpClient and AmqpChannel
     *
     * @constructor
     *
     * @class  AmqpEvent 
     *
     */
    AmqpEvent = function(sender, frame, headers) {
        this.type = frame.methodName;
        this.type = _rename(this.type);
    
        /*
         ideas :
            pull out method arguments into a dictionary with arg name and value
        */
        this.args = {};
        for (var i=0; i<frame.args.length; i++) {
            this.args[frame.args[i].name] = frame.args[i].value;
        }
    
        // TODO: change message event construction to pass in body param, headers
        this.headers = headers
        this.target = sender;
        
        // No longer exposing body as a public property. Instead, we are exposing
        // two methods/function -- getBodyAsArrayBuffer() and getBodyAsByteBuffer().
        this._body = frame.body;

        if (this.type == "message") {
            this.properties = new AmqpProperties(headers);
        }
    
        if (this.type == "error") {
            this.message = this.args["replyText"];
        }
    };
    
    var $prototype = AmqpEvent.prototype;

    /**
     * Indicates the type of the event.
     *
     * @public
     * @field
     * @type String
     * @name type
     * @memberOf AmqpEvent#
     */
    $prototype.type;

    /**
     * Specifies the error message when the event type is "error".
     *
     * @public
     * @field
     * @type String
     * @name errorMessage
     * @memberOf AmqpEvent#
     */
    $prototype.message;

    /**
     * This has been <b>deprecated</b>. Please use the 'properties' field to 
     * retrieve AMQP 0-9-1 properties included with the message.
     *
     * @public
     * @field
     * @type Object
     * @name headers
     * @memberOf AmqpEvent#
     * @deprecated  -- Please use 'properties' field of type AmqpProperties
     */
    $prototype.headers;

    /**
     * The content properties for message events. The type of the 'properties'
     * field is AmqpProperties.
     *
     * @public
     * @field
     * @type AmqpProperties
     * @name properties
     * @memberOf AmqpEvent#
     */
    $prototype.properties;
    
    /**
     * The target object that dispatched the event.
     *
     * @public
     * @field
     * @type AmqpChannel | AmqpClient
     * @name target
     * @memberOf AmqpEvent#
     */
    $prototype.target;

    /**
     * Returns the body or the payload of the event as an ArrayBuffer. If
     * the browser does not support ArrayBuffer, then an error is thrown.
     *
     * @return {ArrayBuffer}
     *
     * @public
     * @function
     * @name getBodyAsArrayBuffer
     * @memberOf AmqpEvent#
     */
    $prototype.getBodyAsArrayBuffer = function() {
        if (typeof(ArrayBuffer) === "undefined") {
            throw new Error("AmqpEvent.getBodyAsArrayBuffer(): Browser does not support ArrayBuffer.");
        }

        if (typeof (this._body) !== "undefined") {
            return this._body.getArrayBuffer(this._body.remaining());
        }
        
        return null;
    }
    
    /**
     * Returns the body or the payload of the event as a ByteBuffer.
     *
     * @return {ByteBuffer}
     *
     * @public
     * @function
     * @name getBodyAsByteBuffer
     * @memberOf AmqpEvent#
     */
    $prototype.getBodyAsByteBuffer = function() {
        return (this._body || null);
    }

    $module.AmqpEvent = AmqpEvent;
    
})(Kaazing.AMQP);



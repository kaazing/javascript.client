/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

/**
 * AmqpArguments is a table of optional arguments for AMQP commands
 *
 * @constructor
 *
 * @class AmqpArguments
 *
 */
var AmqpArguments = function() {};
AmqpArguments.prototype = new Array();
(function($module) {
    var $prototype = AmqpArguments.prototype;

    var _add = function($this, key, value, type) {
        var entry = {};
        entry.key = key;
        entry.value = value;
        // If value is null, we will use Void as the type so that the
        // encoding and decoding can work properly.
        if (value==null) {
           type = "void";
        }
        entry.type = type;
        $this.push(entry);
    }


    /**
     * Adds a long string value to an AmqpArguments table.
     *
     * @param {String} key
     * <p>
     * @param {String} value
     *
     * @return {AmqpArguments}
     *
     * @public
     * @function
     * @name addLongString
     * @memberOf AmqpArguments#
     */
    $prototype.addLongString = function(key, value) {
        _add(this, key, value, "longstr");
        return this;
    }

    /**
     * Adds an integer value to an AmqpArguments table.
     *
     * @param {String}  key
     * <p>
     * @param {Number} value
     *
     * @return {AmqpArguments}
     *
     * @public
     * @function
     * @name addInteger
     * @memberOf AmqpArguments#
     */
    $prototype.addInteger = function(key, value) {
        _add(this, key, value, "int");
        return this;
    }

    /**
     * Returns String representation of the AmqpArguments.
     *
     * @public
     * @function
     * @return {String}
     * @name toString
     * @memberOf AmqpArguments#
     */
    $prototype.toString = function() {
        var buffer = [];
        for (var i = 0; i < this.length; i++) {
            if (this[i].key != null) {
                buffer.push("{key:" + this[i].key + ", value:" + this[i].value + ", type:" + this[i].type + "}");
            }
        }
        
        return "{" + buffer.join(", ") + "}";
    };

    $module.AmqpArguments = AmqpArguments;
    
})(window || Kaazing.AMQP);



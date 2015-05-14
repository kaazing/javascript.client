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
    
})(Kaazing.AMQP);



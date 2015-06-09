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
 *@ignore
 */
$module.Oid = (function () {

    /**
     * Model an object identifier, and provide facilities to see the object identifier
     * as an array of numbers (e.g. <code>(1,3,2,5,3,2)</code>).
     *
     * @class
     * @alias Oid
     *
     * @param data    the array with object identifier
     * @constructor
     */
    var Oid = function (data) {
        this.rep = data;
    }

    var $prototype = Oid.prototype;

    /**
     * Returns an array representation of the object identifier.
     *
     * @return {Array} an array representation of the object identifier.
     * @public
     * @function
     * @name asArray
     * @memberOf Oid#
     */
    $prototype.asArray = function () {
        return this.rep;
    }

    /**
     * Returns a string representation of the object identifier.
     *
     * @return {String} a string representation of the object identifier.
     * @public
     * @function
     * @name asString
     * @memberOf Oid#
     */
    $prototype.asString = function () {
        var s = "";
        for (var i = 0; i < this.rep.length; i++) {
            s += (this.rep[i].toString());
            s += ".";
        }
        if (s.length > 0 && s.charAt(s.length - 1) == ".") {
            s = s.slice(0, s.length - 1);
        }
        return s;
    }

    /**
     * Model an object identifier, and provide facilities to see the object identifier
     * as a string (e.g. <code>"1.3.2.5.3.2"</code>).
     * @param a string (e.g. <code>"1.3.2.5.3.2"</code>).
     * @return {Oid} newly created instance of Oid
     *
     * @public
     * @function
     * @static
     * @name create
     * @memberOf Oid#
     */
    Oid.create = function (data) {
        return new Oid(data.split("."));
    }
    return Oid;
})();


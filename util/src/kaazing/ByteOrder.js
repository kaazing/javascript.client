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

(function($module){
   
   if (typeof $module.ByteOrder === "undefined") {
        /**
         * A typesafe enumeration for byte orders.
         *
         * @class ByteOrder
         * @alias ByteOrder
         */
       var ByteOrder = function() {};
    
	    // Note:
	    //   Math.pow(2, 32) = 4294967296
	    //   Math.pow(2, 16) = 65536
	    //   Math.pow(2,  8) = 256
	
	    /**
	     * @ignore
	     */
	    var $prototype = ByteOrder.prototype;
	
	    /**
	     * Returns the string representation of a ByteOrder.
	     *
	     * @return string
	     *
	     * @public
	     * @function
	     * @name toString
	     * @memberOf ByteOrder#
	     */
	    $prototype.toString = function() {
	        throw new Error ("Abstract");
	    }
	    
	    /**
	     * Returns the single-byte representation of an 8-bit integer.
	     *
	     * @private 
	     * @static
	     * @function
	     * @memberOf ByteOrder
	     */
	    var _toUnsignedByte = function(v) {
	        return (v & 255);
	    }
	    
	    /**
	     * Returns a signed 8-bit integer from a single-byte representation.
	     *
	     * @private 
	     * @static
	     * @function
	     * @memberOf ByteOrder
	     */
	    var _toByte = function(byte0) {
	        return (byte0 & 128) ? (byte0 | -256) : byte0;
	    }
	    
	    /**
	     * Returns the big-endian 2-byte representation of a 16-bit integer.
	     *
	     * @private 
	     * @static
	     * @function
	     * @memberOf ByteOrder
	     */
	    var _fromShort = function(v) {
	        return [((v >> 8) & 255), (v & 255)];
	    }
	    
	    /**
	     * Returns a signed 16-bit integer from a big-endian two-byte representation.
	     *
	     * @private 
	     * @static
	     * @function
	     * @memberOf ByteOrder
	     */
	    var _toShort = function(byte1, byte0) {
	        return (_toByte(byte1) << 8) | (byte0 & 255);
	    }
	    
	    /**
	     * Returns an unsigned 16-bit integer from a big-endian two-byte representation.
	     *
	     * @private 
	     * @static
	     * @function
	     * @memberOf ByteOrder
	     */
	    var _toUnsignedShort = function(byte1, byte0) {
	        return ((byte1 & 255) << 8) | (byte0 & 255);
	    }
	
	    /**
	     * Returns an unsigned 24-bit integer from a big-endian three-byte representation.
	     *
	     * @private 
	     * @static
	     * @function
	     * @memberOf ByteOrder
	     */
	    var _toUnsignedMediumInt = function(byte2, byte1, byte0) {
	        return ((byte2 & 255) << 16) | ((byte1 & 255) << 8) | (byte0 & 255);
	    }
	
	    /**
	     * Returns the big-endian three-byte representation of a 24-bit integer.
	     *
	     * @private 
	     * @static
	     * @function
	     * @memberOf ByteOrder
	     */
	    var _fromMediumInt = function(v) {
	        return [((v >> 16) & 255), ((v >> 8) & 255), (v & 255)];
	    }
	    
	    /**
	     * Returns a signed 24-bit integer from a big-endian three-byte representation.
	     *
	     * @private 
	     * @static
	     * @function
	     * @memberOf ByteOrder
	     */
	    var _toMediumInt = function(byte2, byte1, byte0) {
	        return ((byte2 & 255) << 16) | ((byte1 & 255) << 8) | (byte0 & 255);
	    }
	    
	    /**
	     * Returns the big-endian four-byte representation of a 32-bit integer.
	     *
	     * @private 
	     * @static
	     * @function
	     * @memberOf ByteOrder
	     */
	    var _fromInt = function(v) {
	        return [((v >> 24) & 255), ((v >> 16) & 255), ((v >> 8) & 255), (v & 255)];
	    }
	    
	    /**
	     * Returns a signed 32-bit integer from a big-endian four-byte representation.
	     *
	     * @private 
	     * @static
	     * @function
	     * @memberOf ByteOrder
	     */
	    var _toInt = function(byte3, byte2, byte1, byte0) {
	        return (_toByte(byte3) << 24) | ((byte2 & 255) << 16) | ((byte1 & 255) << 8) | (byte0 & 255);
	    }
	    
	    /**
	     * Returns an unsigned 32-bit integer from a big-endian four-byte representation.
	     *
	     * @private 
	     * @static
	     * @function
	     * @memberOf ByteOrder
	     */
	    var _toUnsignedInt = function(byte3, byte2, byte1, byte0) {
	        var nibble1 = _toUnsignedShort(byte3, byte2);
	        var nibble0 = _toUnsignedShort(byte1, byte0);
	        return (nibble1 * 65536 + nibble0);
	    }
	
	    /**
	     * The big-endian byte order.
	     *
	     * @public
	     * @static
	     * @final
	     * @field
	     * @name BIG_ENDIAN
	     * @type ByteOrder
	     * @memberOf ByteOrder
	     */
	    ByteOrder.BIG_ENDIAN = (function() {
	        
	        var BigEndian = function() {}
	        BigEndian.prototype = new ByteOrder();
	        var $prototype = BigEndian.prototype;
	
	        $prototype._toUnsignedByte = _toUnsignedByte;
	        $prototype._toByte = _toByte;
	        $prototype._fromShort = _fromShort;
	        $prototype._toShort = _toShort;
	        $prototype._toUnsignedShort = _toUnsignedShort;
	        $prototype._toUnsignedMediumInt = _toUnsignedMediumInt;
	        $prototype._fromMediumInt = _fromMediumInt;
	        $prototype._toMediumInt = _toMediumInt;
	        $prototype._fromInt = _fromInt;
	        $prototype._toInt = _toInt;
	        $prototype._toUnsignedInt = _toUnsignedInt;
	
	        $prototype.toString = function() {
	            return "<ByteOrder.BIG_ENDIAN>";
	        }
	
	        return new BigEndian();
	    })();
	
	    /**
	     * The little-endian byte order.
	     *
	     * @public
	     * @static
	     * @final
	     * @field
	     * @name BIG_ENDIAN
	     * @type ByteOrder
	     * @memberOf ByteOrder
	     */
	    ByteOrder.LITTLE_ENDIAN = (function() {
	        var LittleEndian = function() {}
	        LittleEndian.prototype = new ByteOrder();
	        var $prototype = LittleEndian.prototype;
	
	        $prototype._toByte = _toByte;
	        $prototype._toUnsignedByte = _toUnsignedByte;
	        
	        $prototype._fromShort = function(v) {
	            return _fromShort(v).reverse();
	        }
	        
	        $prototype._toShort = function(byte1, byte0) {
	            return _toShort(byte0, byte1);
	        }
	        
	        $prototype._toUnsignedShort = function(byte1, byte0) {
	            return _toUnsignedShort(byte0, byte1);
	        }
	
	        $prototype._toUnsignedMediumInt = function(byte2, byte1, byte0) {
	            return _toUnsignedMediumInt(byte0, byte1, byte2);
	        }
	
	        $prototype._fromMediumInt = function(v) {
	            return _fromMediumInt(v).reverse();
	        }
	        
	        $prototype._toMediumInt = function(byte5, byte4, byte3, byte2, byte1, byte0) {
	            return _toMediumInt(byte0, byte1, byte2, byte3, byte4, byte5);
	        }
	        
	        $prototype._fromInt = function(v) {
	            return _fromInt(v).reverse();
	        }
	        
	        $prototype._toInt = function(byte3, byte2, byte1, byte0) {
	            return _toInt(byte0, byte1, byte2, byte3);
	        }
	        
	        $prototype._toUnsignedInt = function(byte3, byte2, byte1, byte0) {
	            return _toUnsignedInt(byte0, byte1, byte2, byte3);
	        }
	        
	        $prototype.toString = function() {
	            return "<ByteOrder.LITTLE_ENDIAN>";
	        }
	
	        return new LittleEndian();
	    })();
		
		$module.ByteOrder = ByteOrder;
   }

})(Kaazing);



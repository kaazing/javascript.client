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

(function($module) {

    if (typeof $module.Charset === "undefined") {
    
        /**
         * Charset is an abstract super class for all character set encoders and decoders.
         *
         * @class  Charset provides character set encoding and decoding for JavaScript.
         * @alias Charset
         * @constructor
         */
        var Charset = function(){}

        /**
         * @ignore
         */
        var $prototype = Charset.prototype; 
    
        /**
         * Decodes a ByteBuffer into a String.  Bytes for partial characters remain 
         * in the ByteBuffer after decode has completed.
         *
         * @param {ByteBuffer} buf  the ByteBuffer to decode
         * @return {String}  the decoded String
         *
         * @public
         * @function
         * @name decode
         * @memberOf Charset#
         */
        $prototype.decode = function(buf) {}
        
        /**
         * Encodes a String into a ByteBuffer.
         *
         * @param {String}     text  the String to encode
         * @param {ByteBuffer} buf   the target ByteBuffer
         * @return {void}
         *
         * @public
         * @function
         * @name encode
         * @memberOf Charset#
         */
        $prototype.encode = function(str, buf) {}
        
        /**
         * The UTF8 character set encoder and decoder.
         *
         * @public
         * @static
         * @final
         * @field
         * @name UTF8
         * @type Charset
         * @memberOf Charset
         */
        Charset.UTF8 = (function() {
            function UTF8() {}
            UTF8.prototype = new Charset();
        
            /**
             * @ignore
             */
            var $prototype = UTF8.prototype; 
    
            $prototype.decode = function(buf) {
            
                var remainingData = buf.remaining();
                
                // use different strategies for building string sizes greater or
                // less than 10k.
                var shortBuffer = remainingData < 10000;
    
                var decoded = [];
                var sourceArray = buf.array;
                var beginIndex = buf.position;
                var endIndex = beginIndex + remainingData;
                var byte0, byte1, byte2, byte3;
                for (var i = beginIndex; i < endIndex; i++) {
                    byte0 = (sourceArray[i] & 255);
                    var byteCount = charByteCount(byte0);
                    var remaining = endIndex - i;
                    if (remaining < byteCount) {
                        break;
                    }
                    var charCode = null;
                    switch (byteCount) {
                        case 1:
                            // 000000-00007f    0zzzzzzz
                            charCode = byte0;
                            break;
                        case 2:
                            // 000080-0007ff    110yyyyy 10zzzzzz
                            i++;
                            byte1 = (sourceArray[i] & 255);
                            
                            charCode = ((byte0 & 31) << 6) | (byte1 & 63);
                            break;
                        case 3:
                            // 000800-00ffff    1110xxxx 10yyyyyy 10zzzzzz
                            i++;
                            byte1 = (sourceArray[i] & 255);
                            
                            i++;
                            byte2 = (sourceArray[i] & 255);
                            
                            charCode = ((byte0 & 15) << 12) | ((byte1 & 63) << 6) | (byte2 & 63);
                            break;
                        case 4:
                            // 010000-10ffff    11110www 10xxxxxx 10yyyyyy 10zzzzzz
                            i++;
                            byte1 = (sourceArray[i] & 255);
                            
                            i++;
                            byte2 = (sourceArray[i] & 255);
                            
                            i++;
                            byte3 = (sourceArray[i] & 255);
                            
                            charCode = ((byte0 & 7) << 18) | ((byte1 & 63) << 12) | ((byte2 & 63) << 6) | (byte3 & 63);
                            break;
                    }
    
                    if (shortBuffer) {
                        decoded.push(charCode);
                    } else {
                        decoded.push(String.fromCharCode(charCode));
                    }
                }
                
                if (shortBuffer) {
                    return String.fromCharCode.apply(null, decoded);
                } else {
                    return decoded.join("");
                }
            };
    
            $prototype.encode = function(str, buf) {
                var currentPosition = buf.position;
                var mark = currentPosition;
                var array = buf.array;
                for (var i = 0; i < str.length; i++) {
                    var charCode = str.charCodeAt(i);
                    if (charCode < 0x80) {
                        // 000000-00007f    0zzzzzzz
                        array[currentPosition++] = charCode;
                    }
                    else if (charCode < 0x0800) {
                        // 000080-0007ff    110yyyyy 10zzzzzz
                        array[currentPosition++] = (charCode >> 6) | 192;
                        array[currentPosition++] = (charCode & 63) | 128;
                    }
                    else if (charCode < 0x10000) {
                        // 000800-00ffff  1110xxxx 10yyyyyy 10zzzzzz
                        array[currentPosition++] = (charCode >> 12) | 224;
                        array[currentPosition++] = ((charCode >> 6) & 63) | 128;
                        array[currentPosition++] = (charCode & 63) | 128;
                    }
                    else if (charCode < 0x110000) {
                        // 010000-10ffff  11110www 10xxxxxx 10yyyyyy 10zzzzzz
                        array[currentPosition++] = (charCode >> 18) | 240;
                        array[currentPosition++] = ((charCode >> 12) & 63) | 128;
                        array[currentPosition++] = ((charCode >> 6) & 63) | 128;
                        array[currentPosition++] = (charCode & 63) | 128;
                    }
                    else {
                        throw new Error("Invalid UTF-8 string");
                    }
                }
                buf.position = currentPosition;
                buf.expandAt(currentPosition, currentPosition - mark);
            };
            
            $prototype.encodeAsByteArray = function(str) {
                var bytes = new Array();
                for (var i = 0; i < str.length; i++) {
                    var charCode = str.charCodeAt(i);
                    if (charCode < 0x80) {
                        // 000000-00007f    0zzzzzzz
                        bytes.push(charCode);
                    }
                    else if (charCode < 0x0800) {
                        // 000080-0007ff    110yyyyy 10zzzzzz
                        bytes.push((charCode >> 6) | 192);
                        bytes.push((charCode & 63) | 128);
                    }
                    else if (charCode < 0x10000) {
                        // 000800-00ffff  1110xxxx 10yyyyyy 10zzzzzz
                        bytes.push((charCode >> 12) | 224);
                        bytes.push(((charCode >> 6) & 63) | 128);
                        bytes.push((charCode & 63) | 128);
                    }
                    else if (charCode < 0x110000) {
                        // 010000-10ffff  11110www 10xxxxxx 10yyyyyy 10zzzzzz
                        bytes.push((charCode >> 18) | 240);
                        bytes.push(((charCode >> 12) & 63) | 128);
                        bytes.push(((charCode >> 6) & 63) | 128);
                        bytes.push((charCode & 63) | 128);
                    }
                    else {
                        throw new Error("Invalid UTF-8 string");
                    }
                }
                return bytes;
            };
        
            // encode a byte array to UTF-8 string
            $prototype.encodeByteArray = function(array) {
                var strLen = array.length;
                var bytes = [];
                for (var i = 0; i < strLen; i++) {
                    var charCode = array[i];
                    if (charCode < 0x80) {
                        // 000000-00007f    0zzzzzzz
                        bytes.push(charCode);
                    }
                    else if (charCode < 0x0800) {
                        // 000080-0007ff    110yyyyy 10zzzzzz
                        bytes.push((charCode >> 6) | 192);
                        bytes.push((charCode & 63) | 128);
                    }
                    else if (charCode < 0x10000) {
                        // 000800-00ffff  1110xxxx 10yyyyyy 10zzzzzz
                        bytes.push((charCode >> 12) | 224);
                        bytes.push(((charCode >> 6) & 63) | 128);
                        bytes.push((charCode & 63) | 128);
                    }
                    else if (charCode < 0x110000) {
                        // 010000-10ffff  11110www 10xxxxxx 10yyyyyy 10zzzzzz
                        bytes.push((charCode >> 18) | 240);
                        bytes.push(((charCode >> 12) & 63) | 128);
                        bytes.push(((charCode >> 6) & 63) | 128);
                        bytes.push((charCode & 63) | 128);
                    }
                    else {
                        throw new Error("Invalid UTF-8 string");
                    }
                }
                return String.fromCharCode.apply(null, bytes);
            };
            
            // encode an arraybuffer to UTF-8 string
            $prototype.encodeArrayBuffer = function(arraybuffer) {
                var buf = new Uint8Array(arraybuffer);
                var strLen = buf.length;
                var bytes = [];
                for (var i = 0; i < strLen; i++) {
                    var charCode = buf[i];
                    if (charCode < 0x80) {
                        // 000000-00007f    0zzzzzzz
                        bytes.push(charCode);
                    }
                    else if (charCode < 0x0800) {
                        // 000080-0007ff    110yyyyy 10zzzzzz
                        bytes.push((charCode >> 6) | 192);
                        bytes.push((charCode & 63) | 128);
                    }
                    else if (charCode < 0x10000) {
                        // 000800-00ffff  1110xxxx 10yyyyyy 10zzzzzz
                        bytes.push((charCode >> 12) | 224);
                        bytes.push(((charCode >> 6) & 63) | 128);
                        bytes.push((charCode & 63) | 128);
                    }
                    else if (charCode < 0x110000) {
                        // 010000-10ffff  11110www 10xxxxxx 10yyyyyy 10zzzzzz
                        bytes.push((charCode >> 18) | 240);
                        bytes.push(((charCode >> 12) & 63) | 128);
                        bytes.push(((charCode >> 6) & 63) | 128);
                        bytes.push((charCode & 63) | 128);
                    }
                    else {
                        throw new Error("Invalid UTF-8 string");
                    }
                }
                return String.fromCharCode.apply(null, bytes);
            };
            
            //decode a UTF-8 string to byte array
            $prototype.toByteArray = function(str) {
                
                
                var decoded = [];
                var byte0, byte1, byte2, byte3;
                var strLen = str.length;
                for (var i = 0; i < strLen; i++) {
                    byte0 = (str.charCodeAt(i) & 255);
                    var byteCount = charByteCount(byte0);
                    
                    var charCode = null;
                    if (byteCount + i > strLen) {
                        break;
                    }
                    switch (byteCount) {
                        case 1:
                            // 000000-00007f    0zzzzzzz
                            charCode = byte0;
                            break;
                        case 2:
                            // 000080-0007ff    110yyyyy 10zzzzzz
                            i++;
                            byte1 = (str.charCodeAt(i) & 255);
                            
                            charCode = ((byte0 & 31) << 6) | (byte1 & 63);
                            break;
                        case 3:
                            // 000800-00ffff    1110xxxx 10yyyyyy 10zzzzzz
                            i++;
                            byte1 = (str.charCodeAt(i) & 255);
                            
                            i++;
                            byte2 = (str.charCodeAt(i) & 255);
                            
                            charCode = ((byte0 & 15) << 12) | ((byte1 & 63) << 6) | (byte2 & 63);
                            break;
                        case 4:
                            // 010000-10ffff    11110www 10xxxxxx 10yyyyyy 10zzzzzz
                            i++;
                            byte1 = (str.charCodeAt(i) & 255);
                            
                            i++;
                            byte2 = (str.charCodeAt(i) & 255);
                            
                            i++;
                            byte3 = (str.charCodeAt(i) & 255);
                            
                            charCode = ((byte0 & 7) << 18) | ((byte1 & 63) << 12) | ((byte2 & 63) << 6) | (byte3 & 63);
                            break;
                    }
                    decoded.push(charCode & 255);
                }
                return decoded;
            };
    
            /**
             * Returns the number of bytes used to encode a UTF-8 character, based on the first byte.
             *
             * 000000-00007f  0zzzzzzz
             * 000080-0007ff  110yyyyy 10zzzzzz
             * 000800-00ffff  1110xxxx 10yyyyyy 10zzzzzz
             * 010000-10ffff  11110www 10xxxxxx 10yyyyyy 10zzzzzz
             *
             * @private 
             * @static
             * @function
             * @memberOf UTF8
             */    
            function charByteCount(b) {
        
                // determine number of bytes based on first zero bit,
                // starting with most significant bit
        
                if ((b & 128) === 0) {
                    return 1;
                }
                
                if ((b & 32) === 0) {
                    return 2;
                }
                
                if ((b & 16) === 0) {
                    return 3;
                }
                
                if ((b & 8) === 0) {
                    return 4;
                }
                
                throw new Error("Invalid UTF-8 bytes");
            }
            
            return new UTF8();
        })();
        
        $module.Charset = Charset;
    }
})(Kaazing);

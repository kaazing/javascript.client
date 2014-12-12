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


// latest published draft:
//       http://www.w3.org/TR/FileAPI/
// editor's draft with Blob constructor:
//      http://dev.w3.org/2006/webapi/FileAPI/

/**
    Creates a new Blob instance.

    @constructor
    @name  Blob
    @class Blob represents an immutable binary data container. 
           For browsers providing support for Blob, the Kaazing JavaScript client library uses the 
           browser's underlying Blob implementation. For older browsers where Blob is not supported, 
           the Kaazing JavaScript client library provides a custom implementation as an Array-backed 
           MemoryBlob.            

    @param  {Array}               parts          <B>(Optional)</B> An array of data objects which can be any number of 
                                                 ArrayBuffer, ArrayBufferView, Blob, or strings in any order.
                                                 
    @param  {BlobPropertyBag} properties  <B>(Optional)</B> A BlobPropertyBag object that provides the properties for the new Blob object.
*/
(function() {

    // cover built in Blob constructor to fixup slice properties
    // Safari has Blob now, use Safari build Blob object
    if (typeof(Blob) !== "undefined") { 
        try {
            var temp = new Blob(['Blob']);
            return;  //browser support Blob, we will use native Blob by exiting this function
        } catch(e) {
           // Andriod browser, Blob is defined, but cannot construct
        }
    }
    var kaazingBlob = function (blobParts, blobPropertyBag) {
        var properties = blobPropertyBag || {};

        if (window.WebKitBlobBuilder) {
            var builder = new window.WebKitBlobBuilder();
            for (var i=0; i<blobParts.length; i++) {
                var part = blobParts[i];

                if (properties.endings) {
                    builder.append(part, properties.endings);
                } else {
                    builder.append(part);
                }
            }
            var blob;
            if (properties.type) {
                blob =  builder.getBlob(type);
            } else {
                blob =  builder.getBlob();
            }
            // fixup slice method
            blob.slice = blob.webkitSlice || blob.slice;
            return blob;
        } else if (window.MozBlobBuilder) {
            var builder = new window.MozBlobBuilder();
            for (var i=0; i<blobParts.length; i++) {
                var part = blobParts[i];

                if (properties.endings) {
                    builder.append(part, properties.endings);
                } else {
                    builder.append(part);
                }
            }
            var blob;
            if (properties.type) {
                blob =  builder.getBlob(type);
            } else {
                blob =  builder.getBlob();
            }
            blob.slice = blob.mozSlice || blob.slice;
            return blob;
        } else {
            // create an Array-backed MemoryBlob
            var bytes = [];
            for (var i=0; i<blobParts.length; i++) {
                var part = blobParts[i];
                if (typeof part === "string") {
                    var b = BlobUtils.fromString(part, properties.endings);
                    bytes.push(b);
                } else if (part.byteLength) {
                    var byteView = new Uint8Array(part);
                    for (var i=0; i<part.byteLength; i++) {
                        bytes.push(byteView[i]);
                    }
                } else if (part.length) {
                    // append number array directly
                    bytes.push(part);
                }  else if (part._array) {
                    // compose multiple MemoryBlobs
                    bytes.push(part._array);
                } else {
                    throw new Error("invalid type in Blob constructor");
                }
            }
            var blob = concatMemoryBlobs(bytes);
            blob.type = properties.type;
            return blob;
        }
    }

    /**
     * @class
     */
    function MemoryBlob(array, contentType) {
        return {
            // internal number array
            _array: array,

            /**
                
                <B>(Read only)</B> Size (in bytes) of the Blob.

                @field
                @readonly
                @name       size
                @type       Number
                @memberOf   Blob#
            */
            size: array.length,

            /**
                <B>(Read only)</B> MIME type of the Blob if it is known. Empty string otherwise.

                @field
                @readonly
                @name       type
                @type       String
                @memberOf   Blob#
            */
            type: contentType || "",

            /**
                Slice the Blob and return a new Blob.

                @name       slice
                @memberOf   Blob#
                @function
                @return {Blob}

                @param  {Number}   start <B>(Optional)</B> An index indicating the first byte 
                  to copy from the source Blob to the new Blob.
                @param  {Number}   end   <B>(Optional)</B> An index indicating the last byte 
                  to copy from the source Blob to the new Blob.
                @param  {String}   contentType <B>(Optional)</B> The content type to assign to the new Blob.
            */
            slice: function(start,end,contentType) {
                var a = this._array.slice(start,end);
                return MemoryBlob(a, contentType);
            },

            toString: function() {
                return "MemoryBlob: " + array.toString();
            }
        }
    }

    function concatMemoryBlobs(bytes) {
        var a = Array.prototype.concat.apply([], bytes);
        return new MemoryBlob(a);
    }
    
    window.Blob = kaazingBlob;
})();

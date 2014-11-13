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


(function($module) {

/**
    @static
    @name  BlobUtils

    @class BlobUtils is a portable, cross-browser utility library for working
    with Blob instances.
    See <a href="./Blob.html">Blob</a>.
*/
var BlobUtils = {};

/**
    Reads a UTF-8 string from a Blob.
    The start and end arguments can be used to subset the Blob.

    @return {String} the decoded string


    @name asString

    @public
    @static
    @function
    @memberOf BlobUtils

    @param  {Blob}      blob
    @param  {Number}    start            optional
    @param  {Number}    end              optional
*/
BlobUtils.asString = function asString(blob, start, end) {
    // check impl of blob
    if (blob._array) {
        // TODO read strings from MemoryBlobs
    } else if (FileReader) {
        var reader = new FileReader();
        reader.readAsText(blob);
        reader.onload = function() {
            cb(reader.result);
        }
        reader.onerror = function(e) {
            console.log(e, reader)
        }
    }
}

/**
    Read an Array of JavaScript Numbers from a Blob instance and passes it as a
    parameter to the specified callback function.
    Each Number is an integer in the range 0..255 equal to the
    value of the corresponding byte in the Blob.

    @return {void}


    @name asNumberArray

    @public
    @static
    @function
    @memberOf BlobUtils

    @param  {Function}  callback
    @param  {Blob}      blob
*/
BlobUtils.asNumberArray = (function () {
    // For our implementation of Blob i.e. MemoryBlob, rather than immediately 
    // calling setTimeout and adding more pressure to the browser event loop on each call 
    // to asNumber array, we hold on to the data in an internal queue if data 
    // already dispatched to the callback via setTimeout is in progress. 
    // Once the preceding data gets processed and callback returns,
    // data from the queue is dispatched via setTimeout.
    var blobQueue = [];
    var processBlobs = function() {
        if (blobQueue.length > 0) {
            try {
                var nextBlob = blobQueue.shift();
                nextBlob.cb(nextBlob.blob._array);
                
            } finally {
                if (blobQueue.length > 0) {
                    setTimeout(function () {
                        processBlobs();
                    }, 0);
                }
            }
        }
    };

    var asNumberArray = function (cb, blob) {
        // check impl of blob
        if (blob._array) {
            blobQueue.push({cb:cb, blob:blob});
            if (blobQueue.length == 1) {
                setTimeout(function() {
                    processBlobs();
                }, 0);
            }
        } else if (FileReader) {
            var reader = new FileReader();
            reader.readAsArrayBuffer(blob);
            reader.onload = function() {
                var dataview = new DataView(reader.result);
                var a = [];
                for (var i=0; i<reader.result.byteLength; i++) {
                    a.push(dataview.getUint8(i));
                }
                cb(a);
            }
        } else {
            throw new Error("Cannot convert Blob to binary string");
        }
    };

    return asNumberArray;
})();

/**
    Reads a string from a Blob and passes it as a parameter to the specified 
    callback function.
    Each character in the resulting string has a character code equal to the
    unsigned byte value of the corresponding byte in the Blob.

    @return {void}


    @name asBinaryString

    @public
    @static
    @function
    @memberOf BlobUtils

    @param  {Function}  callback
    @param  {Blob}      blob
*/
BlobUtils.asBinaryString = function asBinaryString(cb, blob) {
    // check impl of blob
    if (blob._array) {
        var input = blob._array;
        var a = [];
        for (var i=0; i<input.length; i++) {
            a.push(String.fromCharCode(input[i]));
        }
        // join the characters into a single byte string
        setTimeout(function() {
            cb(a.join(""));
        }, 0);
    } else if (FileReader) {
        var reader = new FileReader();
        if (reader.readAsBinaryString) {
            reader.readAsBinaryString(blob);
            reader.onload = function() {
                cb(reader.result);
            }
        }
        else {//IE 10, readAsBinaryString is not supported
            reader.readAsArrayBuffer(blob);
            reader.onload = function() {
                var dataview = new DataView(reader.result);
                var a = [];
                for (var i=0; i<reader.result.byteLength; i++) {
                    a.push(String.fromCharCode(dataview.getUint8(i)));
                }
                // join the characters into a single byte string
                cb(a.join(""));
            }
        }
    } else {
        throw new Error("Cannot convert Blob to binary string");
    }
}


/**
    Create a Blob from a Byte string.

    @return {Blob} the new Blob instance.

    @name fromBinaryString

    @public
    @static
    @function
    @memberOf BlobUtils

    @param  {String}      byte string
*/
BlobUtils.fromBinaryString = function fromByteString(s) {
    var bytes = [];
    for (var i=0; i<s.length; i++) {
        bytes.push(s.charCodeAt(i));
    }
    return BlobUtils.fromNumberArray(bytes);
}

/**
    Create a Blob from a Number Array.

    @return {Blob} the new Blob instance.

    @name fromNumberArray

    @public
    @static
    @function
    @memberOf BlobUtils

    @param  {Array}      Number Array
*/
BlobUtils.fromNumberArray = function fromNumberArray(a) {
    if (typeof (Uint8Array) !== "undefined") {  // safari 6.0 report Uint8Array type as object
        return new Blob([new Uint8Array(a)]);  //Chrome reports warning on coustructor with parameter of ArrayBuffer
    } else {
        return new Blob([a]);
    }
}

/**
    Create a Blob from a String via UTF-8 encoding.

    @return {Blob} the new Blob instance.

    @name fromString

    @public
    @static
    @function
    @memberOf BlobUtils

    @param  {Array}      string
    @param  {String}      endings line ending style: "transparent" or "native"
*/
BlobUtils.fromString = function fromString(s, endings) {
    if (endings && endings === "native") {
        if (navigator.userAgent.indexOf("Windows") != -1) {
            // convert line endings to canonical windows endings (\r\n)
            // convert all line endings to \n, then all \n to \r\n
            s = s.replace("\r\n", "\n", "g").replace("\n", "\r\n", "g");
        }
    }

    var buf = new $module.ByteBuffer();
    $module.Charset.UTF8.encode(s, buf);
    var a = buf.array;
    return BlobUtils.fromNumberArray(a);
}

$module.BlobUtils = BlobUtils;

})(Kaazing);

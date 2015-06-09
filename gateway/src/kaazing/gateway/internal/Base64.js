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


(function () {
    Base64 = {};

    Base64.encode = function (bytes) {
        var base64 = [];
        var byte0;
        var byte1;
        var byte2;
        while (bytes.length) {
            switch (bytes.length) {
                case 1:
                    byte0 = bytes.shift();
                    base64.push(INDEXED[(byte0 >> 2) & 0x3f]);
                    base64.push(INDEXED[((byte0 << 4) & 0x30)]);
                    base64.push("=");
                    base64.push("=");
                    break;
                case 2:
                    byte0 = bytes.shift();
                    byte1 = bytes.shift();
                    base64.push(INDEXED[(byte0 >> 2) & 0x3f]);
                    base64.push(INDEXED[((byte0 << 4) & 0x30) | ((byte1 >> 4) & 0x0f)]);
                    base64.push(INDEXED[(byte1 << 2) & 0x3c]);
                    base64.push("=");
                    break;
                default:
                    byte0 = bytes.shift();
                    byte1 = bytes.shift();
                    byte2 = bytes.shift();
                    base64.push(INDEXED[(byte0 >> 2) & 0x3f]);
                    base64.push(INDEXED[((byte0 << 4) & 0x30) | ((byte1 >> 4) & 0x0f)]);
                    base64.push(INDEXED[((byte1 << 2) & 0x3c) | ((byte2 >> 6) & 0x03)]);
                    base64.push(INDEXED[byte2 & 0x3f]);
                    break;
            }
        }
        return base64.join("");
    }

    Base64.decode = function (base64) {
        if (base64.length === 0) {
            return [];
        }

        if (base64.length % 4 !== 0) {
            throw new Error("Invalid base64 string (must be quads)");
        }

        var bytes = [];
        for (var i = 0; i < base64.length; i += 4) {
            var char0 = base64.charAt(i);
            var char1 = base64.charAt(i + 1);
            var char2 = base64.charAt(i + 2);
            var char3 = base64.charAt(i + 3);

            var index0 = MAPPED[char0];
            var index1 = MAPPED[char1];
            var index2 = MAPPED[char2];
            var index3 = MAPPED[char3];

            bytes.push(((index0 << 2) & 0xfc) | ((index1 >> 4) & 0x03));
            if (char2 != '=') {
                bytes.push(((index1 << 4) & 0xf0) | ((index2 >> 2) & 0x0f));
                if (char3 != '=') {
                    bytes.push(((index2 << 6) & 0xc0) | (index3 & 0x3f));
                }
            }
        }

        return bytes;
    };

    var INDEXED = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
    var MAPPED = {"=": 0};

    for (var i = 0; i < INDEXED.length; i++) {
        MAPPED[INDEXED[i]] = i;
    }


    // If the browser does not have a built in btoa and atob (IE), use these
    if (typeof(window.btoa) === "undefined") {
        window.btoa = function (s) {
            var bytes = s.split("");
            for (var i = 0; i < bytes.length; i++) {
                bytes[i] = (bytes[i]).charCodeAt();
            }
            return Base64.encode(bytes);
        };
        window.atob = function (bytes) {
            var decoded = Base64.decode(bytes);
            for (var i = 0; i < decoded.length; i++) {
                decoded[i] = String.fromCharCode(decoded[i])
            }
            return decoded.join("");
        };
    }

})();

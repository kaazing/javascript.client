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
 * Windows-1252 codec
 * http://en.wikipedia.org/wiki/Windows-1252
 *
 * @ignore
 */
var Windows1252 = {};

(function() {
    ;;;var W1252LOG = Logger.getLogger('org.kaazing.gateway.client.html5.Windows1252');

    /**
     * Map of char codes to numerical byte values
     *
     * @ignore
     */
    var charCodeToByte = { 0x20ac: 128
        , 129 : 129     // C1 control code
        , 0x201A : 130
        , 0x0192 : 131
        , 0x201E : 132
        , 0x2026 : 133
        , 0x2020 : 134
        , 0x2021 : 135
        , 0x02C6 : 136
        , 0x2030 : 137
        , 0x0160: 138
        , 0x2039 : 139
        , 0x0152 : 140

        , 141 : 141     // C1 control code
        , 0x017D : 142
        , 143 : 143     // C1 control code
        , 144 : 144     // C1 control code

        , 0x2018 : 145
        , 0x2019 : 146
        , 0x201C : 147
        , 0x201D : 148
        , 0x2022 : 149
        , 0x2013 : 150
        , 0x2014 : 151
        , 0x02DC : 152
        , 0x2122 : 153
        , 0x0161 : 154
        , 0x203A : 155
        , 0x0153 : 156

        , 157 : 157     // C1 control code

        , 0x017E : 158
        , 0x0178 : 159
    }


    /**
     * Map of numerical byte values to character codes
     *
     * @ignore
     */
    var byteToCharCode = { 128: 0x20ac
        , 129: 129     // C1 control code
        , 130 : 0x201A

        , 131 : 0x0192
        , 132 : 0x201E
        , 133 : 0x2026
        , 134 : 0x2020
        , 135 : 0x2021
        , 136 : 0x02C6
        , 137 : 0x2030
        , 138 : 0x0160
        , 139 : 0x2039
        , 140 : 0x0152

        , 141 : 141     // C1 control code
        , 142 : 0x017D
        , 143 : 143     // C1 control code
        , 144 : 144     // C1 control code

        , 145 : 0x2018
        , 146 : 0x2019
        , 147 : 0x201C
        , 148 : 0x201D
        , 149 : 0x2022
        , 150 : 0x2013
        , 151 : 0x2014
        , 152 : 0x02DC
        , 153 : 0x2122
        , 154 : 0x0161
        , 155 : 0x203A
        , 156 : 0x0153

        , 157 : 157     // C1 control code
        , 158 : 0x017E
        , 159 : 0x0178
    }

    /**
     * Returns the single character string corresponding to a numerical value
     *
     * @ignore
     */
    Windows1252.toCharCode = function(n) {
        //W1252LOG.entering(this, 'Windows1252.toCharCode', n);
        if (n < 128 || (n > 159 && n < 256)) {
            //W1252LOG.exiting(this, 'Windows1252.toCharCode', n);
            return n;
        } else {
            var result = byteToCharCode[n];
            if (typeof(result) == "undefined") {
                ;;;W1252LOG.severe(this, 'Windows1252.toCharCode: Error: Could not find ' + n);
                throw new Error("Windows1252.toCharCode could not find: " + n);
            }
            //W1252LOG.exiting(this, 'Windows1252.toCharCode', result);
            return result;
        }
    }

    /**
     * Returns the byte value of a single character code
     *
     * @ignore
     */
    Windows1252.fromCharCode = function(code) {
        //W1252LOG.entering(this, 'Windows1252.fromCharCode', code);
        if (code < 256) {
            //W1252LOG.exiting(this, 'Windows1252.fromCharCode', code);
            return code;
        } else {
            var result = charCodeToByte[code];
            if (typeof(result) == "undefined") {
                ;;;W1252LOG.severe(this, 'Windows1252.fromCharCode: Error: Could not find ' + code);
                throw new Error("Windows1252.fromCharCode could not find: " + code);
            }
            //W1252LOG.exiting(this, 'Windows1252.fromCharCode', result);
            return result;
        }
    }


    var ESCAPE_CHAR = String.fromCharCode(0x7F);
    var NULL = String.fromCharCode(0);
    var LINEFEED = "\n";

    /**
     * Returns the byte values of an escaped Windows-1252 string
     *
     * @ignore
     */
    var escapedToArray = function(s) {
        ;;;W1252LOG.entering(this, 'Windows1252.escapedToArray', s);
        var a = [];
        for (var i=0; i<s.length; i++) {
            var code = Windows1252.fromCharCode(s.charCodeAt(i));

            if (code == 0x7f) {
                i++;
                // if the escape character is the last character,
                // indicate that there is a remainder
                if (i == s.length) {
                    a.hasRemainder = true;
                    // do not process this escape character
                    break;
                }

                var next_code = Windows1252.fromCharCode(s.charCodeAt(i));
                switch(next_code) {
                    case 0x7f:
                        a.push(0x7f);
                        break;
                    case 0x30:
                        a.push(0x00);
                        break;
                    case 0x6e:
                        a.push(0x0a);
                        break;
                    case 0x72:
                        a.push(0x0d);
                        break;
                    default:
                        ;;;W1252LOG.severe(this, 'Windows1252.escapedToArray: Error: Escaping format error');
                        throw new Error("Escaping format error");
                }
            } else {
                a.push(code);
            }
        }
        return a;
    }

    var toEscapedByteString = function(buf) {
        ;;;W1252LOG.entering(this, 'Windows1252.toEscapedByteString', buf);
        var a = [];
        while(buf.remaining()) {
            var n = buf.getUnsigned();
            var chr = String.fromCharCode(Windows1252.toCharCode(n));
            switch(chr) {
                case ESCAPE_CHAR:
                    a.push(ESCAPE_CHAR);
                    a.push(ESCAPE_CHAR);
                    break;
                case NULL:
                    a.push(ESCAPE_CHAR);
                    a.push("0");
                    break;
                case LINEFEED:
                    a.push(ESCAPE_CHAR);
                    a.push("n");
                    break;
                default:
                    a.push(chr);
            }

        }
        return a.join("");
    }

    /**
     * Returns the byte values of a Windows-1252 string
     *
     * @ignore
     */
    Windows1252.toArray = function(s, escaped) {
        ;;;W1252LOG.entering(this, 'Windows1252.toArray', {'s':s, 'escaped':escaped});
        if (escaped) {
            return escapedToArray(s);
        } else {
            var a = [];
            for (var i=0; i<s.length; i++) {
                a.push(Windows1252.fromCharCode(s.charCodeAt(i)));
            }
            return a;
        }
    }

    /**
     * Takes a ByteBuffer and returns a Windows-1252 string
     *
     * @ignore
     */
    Windows1252.toByteString = function(buf, escaped) {
        ;;;W1252LOG.entering(this, 'Windows1252.toByteString', {'buf':buf, 'escaped':escaped});
        if (escaped) {
            return toEscapedByteString(buf);
        } else {
            var a = [];
            while(buf.remaining()) {
                var n = buf.getUnsigned();
                a.push(String.fromCharCode(Windows1252.toCharCode(n)));
            }
            return a.join("");
        }
    }



})();


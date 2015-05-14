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
 * @ignore
 */
var XDRHttpDirect = (function() {

	var id = 0;

    //console.log("XDRHttpRequest");
    // IE8, IE9 XDomainRequest is cross-domain
    function XDRHttpDirect(outer) {
        this.outer = outer;
    }
        
    var $prototype = XDRHttpDirect.prototype;         
    $prototype.open = function(method, location) {
        //console.log("xdr "+ id + " .open(" + [method, location] + ")" + new Date().getTime());
        var $this = this;
        var xhr = this.outer;
        
        xhr.responseText = "";
        var readyState = 2;
        var progressAt = 0;
        var startOfResponseAt = 0;
        
        this._method = method;        
        this._location = location;
              
        if (location.indexOf("?") == -1) {
            location += "?.kac=ex&.kct=application/x-message-http";
        }
        else {
            location += "&.kac=ex&.kct=application/x-message-http";
        }
        this.location = location;              
        var xdr = this.xdr = new XDomainRequest();
        
        var onProgressFunc = function(e) {
            //console.log("xdr "+ id + " .onprogress1(" + [e] + ")" + new Date().getTime());
            try {
                // process emulated headers in payload
                var responseText = xdr.responseText;
                if(readyState <= 2) {
                    var endOfHeadersAt = responseText.indexOf("\r\n\r\n");
                    //console.log("endOfHeadersAt: " + endOfHeadersAt);
                    if (endOfHeadersAt == -1) {
                        return;  //wait for header to complete
                    }
                    var endOfStartAt = responseText.indexOf("\r\n");
                    var startText = responseText.substring(0, endOfStartAt);
                    var startMatch = startText.match(/HTTP\/1\.\d\s(\d+)\s([^\r\n]+)/);  // match all line endings
                    // assert start[0] === "HTTP/1.1"
                    xhr.status = parseInt(startMatch[1]);
                    xhr.statusText = startMatch[2];

                    var startOfHeadersAt = endOfStartAt + 2; // "\r\n".length
                    startOfResponseAt = endOfHeadersAt + 4; // "\r\n\r\n".length
                    var headerLines = responseText.substring(startOfHeadersAt, endOfHeadersAt).split("\r\n");
                    //console.log("_responseHeaders: " + headerLines);
                    xhr._responseHeaders = {};
                    for (var i=0; i < headerLines.length; i++) {
                        var header = headerLines[i].split(":");
                        xhr._responseHeaders[header[0].replace(/^\s+|\s+$/g,"")] = header[1].replace(/^\s+|\s+$/g,"");
                    }
        	        progressAt = startOfResponseAt;
              	    //console.log("xdr "+ id + " .readyState = 2");
                    readyState = xhr.readyState = 3;
                    if (typeof($this.onreadystatechange) == "function") {
  	                    $this.onreadystatechange(xhr);
    	            }

                }
 
                // detect new data
                var newDataLength = xdr.responseText.length;
                if (newDataLength > progressAt) {
                	xhr.responseText = responseText.slice(startOfResponseAt);
                    progressAt = newDataLength;
                 
                    if (typeof($this.onprogress) == "function") {
                        //console.log("onprogress: " + xhr.responseText);
                        $this.onprogress(xhr);
                    }
                } else {
                    //console.log("xdr " + id + " onprogress fired, but no new data");
                }
            }
            catch (e1) {
               $this.onload(xhr);
            }
            //console.log("xdr "+ id + " .onprogress2(" + [e] + ")" + new Date().getTime());
        }

        xdr.onprogress = onProgressFunc;
        xdr.onerror = function(e) {
            //console.log("xdr.onerror(" + [e] + ")" + new Date().getTime());
            xhr.readyState = 0;
            if (typeof(xhr.onerror) == "function") {
                xhr.onerror(xhr);
            }
        }
        xdr.onload = function(e) {
            //console.log("xdr "+ id + " .onload(" + [e] + ")" + new Date().getTime());
            if (readyState <= 3) {
            	onProgressFunc(e);
            }
            reayState = xhr.readyState = 4;
	        if (typeof(xhr.onreadystatechange) == "function") {
  	             xhr.onreadystatechange(xhr);
    	    }
            if (typeof(xhr.onload) == "function") {
                xhr.onload(xhr);
            }
        }
        xdr.open("POST", location);
     }
            
     $prototype.send = function(payload) {
         //console.log("xdr "+ id + " .send()" + new Date().getTime());
         
         // wrapper http request, remove &.kct=application%2Fx-message-http to match outer request path
         var wpayload = this._method + " " + this.location.substring(this.location.indexOf("/", 9), this.location.indexOf("&.kct")) + " HTTP/1.1\r\n";
         //headers
         for (var i = 0; i < this.outer._requestHeaders.length; i++) {
  	         wpayload += this.outer._requestHeaders[i][0] + ": " + this.outer._requestHeaders[i][1] + "\r\n";
         }
         var content = payload || "";
         if (content.length > 0 || this._method.toUpperCase() === "POST") {
             // calculate content-length
             var len = 0;
             for (var i = 0; i < content.length; i++) {
                 len++;
                 if (content.charCodeAt(i) >= 0x80) {
                     // handle \u0100 as well as \u0080 
                     len++;
                 }
             }
             wpayload += "Content-Length: " + len + "\r\n";
         }
         // end of header
         wpayload += "\r\n";
         wpayload += content;
         this.xdr.send(wpayload);
     }

     $prototype.abort = function() {
          //console.log("xdr "+ id + " .abort() + new Date().getTime()" + new Date().getTime());
          this.xdr.abort();
     }
                        
     return XDRHttpDirect;
})();

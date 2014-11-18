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

(function() {
	// IE6 cannot access window.location after document.domain is assigned, use document.URL instead
    var locationURI = new URI((browser == "ie") ? document.URL : location.href);
    var defaultPorts = { "http":80, "https":443 };
    if (locationURI.port == null) {
    	locationURI.port = defaultPorts[locationURI.scheme];
    	locationURI.authority = locationURI.host + ":" + locationURI.port;
    }
    
    var registry = {};
    
    var htmlfile;
    
    // Cross-site Access Control
    var xsRequestMethods = { "GET":1, "POST":1 };
    var xsRequestHeaders = { "Accept": 1, "Accept-Language": 1, "Content-Type": 1, "Authorization": 1, "X-WebSocket-Protocol": 1, "X-WebSocket-Extensions": 1, "X-WebSocket-Version": 1, "X-Accept-Commands": 1};
    var xsPostContentTypes = { "application/x-www-form-url-encoded":1, "multipart/form-data":1, "text/plain":1 };
    var xsResponseHeaders = { "Location":1, "Cache-Control":1, "Content-Language":1, "Content-Type":1, "Expires":1, "Last-Modified":1, "Pragma":1, "WWW-Authenticate":1, "X-WebSocket-Protocol": 1, "X-WebSocket-Extensions": 1, "X-WebSocket-Version": 1, "X-Accept-Commands": 1, "X-Idle-Timeout": 1};
    

    /**
     * @ignore
     */
    window.onload = function() {
        if (browser == "ie") {
            // use the ActiveXObject "htmlfile" to avoid loading bar and clicking sound
            // set iframe source URL, and start polling to detect when 
            // iframe content window becomes available for scripting    
            htmlfile = new ActiveXObject("htmlfile");
            htmlfile.open();
            htmlfile.write("<html>");
            htmlfile.write("<body>");
            htmlfile.write("</body>");
            htmlfile.write("<html>");
            htmlfile.close();

        	// Note: It is important _not_ to set htmlfile.domain when document.domain
        	//       is explicit in the XMLHttpBridge iframe because streaming
        	//       iframes inside htmlfile will not have explicit document.domain
        	//       so the htmlfile must also have implicit document.domain.
        	//       Fortunately, iframes created via htmlfile.createElement have
        	//       contentWindow accessible to the XMLHttpBridge iframe, 
        	//       even if document.domain is explict in the XMLHttpBridge iframe.
        }

        // initialize communication
        postMessage0(parent, "I", "*");
    };

    /**
     * Ensures that the iframe timers terminate by causing
     * any pending streams to abort.
     * @ignore
     */
    window.onbeforeonload = function() {
        while (document.body.firstChild) {
            var iframe = document.body.firstChild;
            iframe.src = "about:blank";
        }
    }

    /**
     * Cleans up the htmlfile ActiveXObject on unload.
     * @ignore
     */
    window.onunload = function() {
        if (browser == "ie") {
            // explicitly clear out contents
            htmlfile.open();
            htmlfile.close();
            
            // remove the reference to the ActiveXObject
            htmlfile = null;
            // garbage collect ActiveXObject
            CollectGarbage();
        }
    };

    /**
     *  Polls until the iframe has become available for scripting.
     *  Note: we cannot use iframe.onreadystatechange due to IE bug
     *        see http://support.microsoft.com/kb/239638
     * @ignore
     */
    function loading(source, origin, id, iframe, timerID) {
        var contentWindow;

        try {
            // IE throws exception accessing iframe.contentWindow
            // when the request fails, so deliver onerror callback
            // and do not schedule any additional processing
            // of the iframe contents
            contentWindow = iframe.contentWindow;
        }
        catch (e) {
            if (timerID != null) { 
                clearTimeout(timerID);
            }
            doError(id);
            return;
        }
        
        var contentDocument = contentWindow.document;
        if (!contentDocument) {
            // suggested workaround from knowledge base, use timer
            setTimeout(function() {
                loading(source, origin, id, iframe, timerID);
            }, 20);
            return;
        }

        // check if iframe content window document is ready
        // Note: contentDocument.onreadystatechange does not seem reliable
        //       so we are polling here instead
        // Note: contentDocument.readyState will be stuck in "loading" if
        //       the content type is not served as text/plain
        switch (contentDocument.readyState) {
        case "interactive":
        case "complete":
            // no longer loading, cancel error timer        
            if (timerID != null) {
                clearTimeout(timerID);
            }

            setTimeout(function() {
                interactive(source, origin, id, iframe);
            }, 0);
            break;

        default:
            setTimeout(function() {
                loading(source, origin, id, iframe, timerID);
            }, 20);
            break;
        }
    }

    /**
     * Represents the behavior for streaming response.
     * @ignore
     */    
    function interactive(source, origin, id, iframe) {
        var contentWindow = iframe.contentWindow;
        var preNode = contentWindow.document.body.childNodes[0];
        contentWindow._progressAt = 0;
        contentWindow._readyState = 2;

        // poll the contents of the stream  
        function poll() {
            try {
                var contentDocument = contentWindow.document;;
                var readyState = (contentDocument.readyState == "complete") ? 4 : 3;
                var currentNodeIndex = contentWindow.currentNodeIndex || 0;            
            
                // process emulated headers in payload
                switch (contentWindow._readyState) {
                case 2:
                    var combinedTextNodes = [];
                    for (var node=preNode.firstChild; node; node=node.nextSibling) {
                        combinedTextNodes.push(node.data);
                    }

                    var xmlHttp0 = parseEmulatedResponse(combinedTextNodes.join(""));

                    if (xmlHttp0 !== null) {
                        contentWindow._readyState = readyState;
                    
                        // TODO: verify Access-Control headers
                    
                        // access restricted for non-whitelist response headers
                        var responseHeaders = [];
                        for (var responseHeaderName in xsResponseHeaders) {
                            if (typeof(responseHeaderName) == "string") {
                                var responseHeaderValue = xmlHttp0.getResponseHeader(responseHeaderName);
                                if (responseHeaderValue != null) {
                                    responseHeaders.push([responseHeaderName, responseHeaderValue]);
                                }
                            }
                        }
                    
                        // notify meta data changes
                        postReadyMessage(source, origin, id, responseHeaders, xmlHttp0.status, xmlHttp0.statusText);
                    
                        var endOfHeadersAt = xmlHttp0.endOfHeadersAt;

                        while (endOfHeadersAt > preNode.childNodes[currentNodeIndex].length) {
                            endOfHeadersAt -= preNode.childNodes[currentNodeIndex].length;
                            currentNodeIndex++;
                        }
                        contentWindow.oldNodeCount = currentNodeIndex;
                        contentWindow.oldNodeDataLength = endOfHeadersAt;
                    }
                    break;
                case 3:
                case 4:
                    contentWindow._readyState = readyState;
                    break;
                }
            
                if (contentWindow._readyState >= 3) {
                    // detect progress
                    var currentNode = preNode.childNodes[currentNodeIndex];
                    var currentNodeData = typeof(currentNode) !== "undefined" ? currentNode.data : "";
                    var newNodeCount = preNode.childNodes.length;
                    var oldNodeCount = contentWindow.oldNodeCount || 1; 
                    var oldNodeDataLength = contentWindow.oldNodeDataLength || 0;
                    var newNodeDataLength = currentNodeData.length;
                    var responseChunk = "";

                    if (newNodeDataLength > oldNodeDataLength || readyState == 4) {
                        responseChunk += currentNodeData.slice(oldNodeDataLength);
                        contentWindow.oldNodeDataLength = newNodeDataLength;  
                    }

                    // IE8 will append new textNodes to the PRE in text documents
                    if (newNodeCount > oldNodeCount) {
                        do {
                            currentNodeIndex++;
                            responseChunk += preNode.childNodes[currentNodeIndex].data;
                        } while (currentNodeIndex < newNodeCount - 1);

                        contentWindow.currentNodeIndex = currentNodeIndex;
                        contentWindow.oldNodeDataLength = preNode.childNodes[currentNodeIndex].data.length;
                        contentWindow.oldNodeCount = newNodeCount;
                    }

                    //    - progress -
                    //    <-- "p" 00000001 3 0000000c "Hello, world"
                
                    // deliver the progress callback
                    if (responseChunk.length > 0 || readyState === 4) {
                        postMessage0(source, ["p", id, readyState, toPaddedHex(responseChunk.length, 8), responseChunk].join(""), origin);
                    }
                }

                // detect close
                if (contentWindow._readyState != 4) {
                    // poll for changes in the response
                    contentWindow.setTimeout(poll, 50);
                }
                else {
                    doError(id);
                }
            }
            catch (e1) {
                doError(id);
            }
        }
    
        // preNode is undefined if stream not yet open due to content-type sniffing
        if (preNode) {
            // start polling the contents of the text stream to notice
            // events as they become available, and when the stream closes
            // Note: scheduling on the contentWindow implicitly cancels
            //       timer when content is changed to about:blank when aborting
            contentWindow.setTimeout(poll, 0);
        }
    }

    function onmessage(event) {
        if (event.source == parent) {
            // parse message
            var message = event.data;
            if (message.length >= 9) {
                var position = 0;
                var type = message.substring(position, position += 1);
                var id = message.substring(position, position += 8);
                
                switch (type) {
                case "s":
                    //    - send -
                    //    --> "s" 00000001 4 "POST" 0029 "http://gateway.example.com:8000/stomp" 
                    //            0001 000b "Content-Type" 000a "text/plain" 0000000c "Hello, world" 0005 t|f]

                    var methodSize = fromHex(message.substring(position, position += 1));
                    var method = message.substring(position, position += methodSize);
                    var locationSize = fromHex(message.substring(position, position += 4));
                    var location = message.substring(position, position += locationSize);

                    var requestHeaders = {};
                    var requestHeaderCount = fromHex(message.substring(position, position += 4));
                    for (var i=0; i < requestHeaderCount; i++) {
                        var labelSize = fromHex(message.substring(position, position += 4));
                        var label = message.substring(position, position += labelSize);
                        var valueSize = fromHex(message.substring(position, position += 4));
                        var value = message.substring(position, position += valueSize);
                        requestHeaders[label] = value;
                    }
                    
                    var payloadSize = fromHex(message.substring(position, position += 8));
                    var payload = message.substring(position, position += payloadSize);
                    var timeout = fromHex(message.substring(position, position += 4));
                    var streaming = (message.substring(position, position += 1) == "t");
                    var origin = event.origin;
                    
                    // default port if necessary
                    // preserve "null" origins (from file:///)
                    var originURI = new URI(origin);
                    if (originURI.port === undefined && origin !== "null") {
                    	var defaultPorts0 = { "http":80, "https":443 };
                    	originURI.port = defaultPorts0[originURI.scheme];
                    	originURI.authority = originURI.host + ":" + originURI.port;

                    	// Note: new URI(origin).toString() adds slash for path
                    	origin = originURI.scheme + "://" + originURI.authority;
                    }
                    // represent file origins as null, too
                    if (originURI.scheme === "file") {
                        origin = "null";
                    }
                
                    doSend(event.source, origin, id, method, location, requestHeaders, payload, timeout, streaming);
                    break;
                case "a":
                    doAbort(id);
                    break;
                case "d":
                    doDelete(id);
                    break;
                }
            }
        }
    }
    
    function createXHR() {
        try { return new XMLHttpRequest(); } catch(e2) {}
        try { return new ActiveXObject("Microsoft.XMLHTTP"); } catch (e1) {}
        try { return new ActiveXObject("Msxml2.XMLHTTP"); } catch (e0) {}
        throw new Error("Unable to create XHR");
    }

    function doSend(source, origin, id, method, location, requestHeaders, payload, timeout, streaming) {
        // preflight required if method is not GET or POST
        var xsPreflight = !xsRequestMethods[method];
        
        if (!xsPreflight) {
            // preflight required for non-whitelist request header
            for (var headerName in requestHeaders) {
                if (!xsPreflight && typeof(headerName) == "string") {
                   xsPreflight = !xsRequestHeaders[headerName];
                }
            }
            
            // preflight required for non-whitelist POST content type
            if (!xsPreflight && method == "POST") {
               var xsContentType = requestHeaders["Content-Type"];
               if (xsContentType !== undefined) {
                   var extAt = xsContentType.indexOf(";");
                   if (extAt != -1) {
                       xsContentType = xsContentType.substring(0, extAt);
                   }
                   xsPreflight = !xsPostContentTypes[xsContentType];
               }
            }
        }
        
        if (xsPreflight) {
            var xmlHttp = createXHR();
            var xsLocation = location;
            var xsQuery = [];
            xsQuery.push(location.indexOf("?") == -1 ? "?" : "&");
            xsQuery.push(".km=O");  // indicate "OPTIONS" method
            xmlHttp.open("POST", location + xsQuery.join(""), true); // emulating the method requires "POST"
            xmlHttp.setRequestHeader("X-Origin", origin);  // emulated Origin header
            xmlHttp.setRequestHeader("Access-Control-Request-Method", method);
           
            var acRequestHeaders = [];
            for (var headerName in requestHeaders) {
                if (typeof(headerName) == "string" && !xsRequestHeaders[headerName]) {
                   acRequestHeaders.push(headerName);
                }
            }
           xmlHttp.setRequestHeader("Access-Control-Request-Headers", acRequestHeaders.join(","));
           xmlHttp.onreadystatechange = function() { onpreflightreadystatechange(source, origin, id, method, location, requestHeaders, payload, timeout, streaming, xmlHttp); };
           xmlHttp.send("");
        }
        else {
           doSendWithoutPreflight(source, origin, id, method, location, requestHeaders, payload, timeout, streaming);
        }
    }
        
    function doSendWithoutPreflight(source, origin, id, method, location, requestHeaders, payload, timeout, streaming) {
        if (browser == "ie" && payload === "" && streaming) {
                if((navigator.userAgent.indexOf("MSIE 9") >= 0 || navigator.userAgent.indexOf("MSIE 8") >= 0)&& typeof(XDomainRequest) !== "undefined") {
                    //IE 9 use XDomainRequest instead of iframe because some systems iframe freeze after 10 minutes
                    doSendXDR(source, origin, id, method, location, requestHeaders, payload, timeout);
                }
                else {
                    doSendIFrame(source, origin, id, method, location, timeout);
                }
            }
        else {
            doSendXHR(source, origin, id, method, location, requestHeaders, payload, timeout, streaming);
        }
    }
    
    function doError(id) {
        var registered = registry[id];
        if (registered !== undefined) {
            registered.onError();
        }
        doDelete(id);
    }

    function doAbort(id) {
        var registered = registry[id];
        if (registered !== undefined) {
            switch (registered.type) {
            case "iframe":
                registered.transport.src = "about:blank";
                break;
            case "xhr":
                registered.transport.abort();
                break;
            }
        }
    }
    
    function doDelete(id) {
        var registered = registry[id];
        if (registered !== undefined) {
            switch (registered.type) {
            case "iframe":
                var iframe = registered.transport;
                iframe.parentNode.removeChild(iframe);
                break;
            }
        }
        delete registry[id];
    }
    
    function doSendIFrame(source, origin, id, method, location, timeout) {
    	
    	// TODO: support non-GET streaming 
    	//       but still using GET on the wire to avoid polluting browsing history
    	if (method !== "GET") {
            throw new Error("Method not supported for streaming response: " + method);
    	}
    	
        var locationURI = new URI(location);
        var params = ".ko=" + escape(origin);
        if (locationURI.query !== undefined) {
            locationURI.query += "&" + params;
        }
        else {
            locationURI.query = params;
        }
        
        // clean up old iframe if XMLHttpRequest0 is reused
        // TODO: support cleanly switching between "iframe" and "xhr" modes for XMLHttpRequest0 instance
        var registration = registry[id] || {};
        var iframe = (registration.type == "iframe") ? registration.transport : null;
        if (iframe !== null) {
        	iframe.parentNode.removeChild(iframe);
        }
        
        iframe = htmlfile.createElement("iframe");
        // IE9 mode incorrectly calls Object.prototype.toString by default
            iframe.setAttribute("src", locationURI.toString());
        htmlfile.body.appendChild(iframe);
        
        // schedule the error event callback, canceling when iframe stream connects successfully
        // Note: this value needs to be longer than recovering SSE stream detecting buffering proxy traversal
        var timerID = setTimeout(function() { 
            doError(id);
        }, 5000);
        
        // start monitoring the iframe contents
        setTimeout(function() {
            loading(source, origin, id, iframe, timerID);
        }, 20);

        // update the registry with the iframe transport to support XMLHttpRequest0.abort()
        registry[id] = {
            type: "iframe",
            transport: iframe, 
            onError: function() {
                postMessage0(source, ["e", id].join(""), origin);
            }
        };
    }
    
    function doSendXHR(source, origin, id, method, location, requestHeaders, payload, timeout, streaming) {
        // register new XMLHttpRequest delegate
        var xmlHttp = createXHR();
        registry[id] = { type: "xhr", transport: xmlHttp };
        
        // track progress of response
        var readyState = 2;
        var progressAt = 0;
        var monitorID = null;
        var responseState = (browser === "ie") ? 4 : 3;
        var doMonitor = (streaming && browser == "opera");
        
        function monitorResponse() {
            // notify responseText
            var responseChunk = "";
            var responseText = null;

            if (xmlHttp.readyState >= 3) {
                if (xmlHttp.status == 200) {
                    // Note: IE throws exception when accessing responseText for early readyState
                    responseText = xmlHttp.responseText;

                    // process emulated headers in payload
                    switch (readyState) {
                    case 2:
                    	var xmlHttp0 = parseEmulatedResponse(responseText);
                    	if (xmlHttp0 !== null) {
                    		readyState = xmlHttp.readyState;
                    		
                    		// TODO: verify Access-Control headers
                    		
                    		// access restricted for non-whitelist response headers
                    		var responseHeaders = [];
                    		for (var responseHeaderName in xsResponseHeaders) {
                    			if (typeof(responseHeaderName) == "string") {
                    				var responseHeaderValue = xmlHttp0.getResponseHeader(responseHeaderName);
                    				if (responseHeaderValue != null) {
                    					responseHeaders.push([responseHeaderName, responseHeaderValue]);
                    				}
                    			}
                    		}
                    		
                    		// notify meta data changes
                    		postReadyMessage(source, origin, id, responseHeaders, xmlHttp0.status, xmlHttp0.statusText);
                    		
                    		// skip over emulated response status and headers
                    		progressAt = responseText.length - xmlHttp0.responseText.length;
                    	}
                    	break;
                    case 3:
                    case 4:
                		readyState = xmlHttp.readyState;
                    	break;
                    }
                }
                else {
                    //receive other http status code
                    // notify meta data changes
                    var responseHeaders = [];
                    postReadyMessage(source, origin, id, responseHeaders, xmlHttp.status, xmlHttp.statusText);
                   
                }
            }
            
            if (readyState > 2) {
                if (responseText !== null) {
                    var responseSize = responseText.length;
                    if (responseSize > progressAt) {
                        responseChunk = responseText.slice(progressAt);
                        progressAt = responseSize;
                    }
                }
                
                //    - progress -
                //    <-- "p" 00000001 3 0000000c "Hello, world"
                
                // deliver the progress callback
                postMessage0(source, ["p", id, readyState, toPaddedHex(responseChunk.length, 8), responseChunk].join(""), origin);
            }
               
            if (doMonitor && readyState < 4) {
                monitorID = setTimeout(monitorResponse, 20);
            }
        }
        var textContentType = false;
        xmlHttp.open(method, location, true);
        for (var headerName in requestHeaders) {
            if (typeof(headerName) == "string") {
                xmlHttp.setRequestHeader(headerName, requestHeaders[headerName]);
                if (headerName == "Content-Type" && requestHeaders[headerName].indexOf("text/plain") == 0) {
                    textContentType = true;
                }
            }
        }

        // W3C Cross-site Access Control emulation
        xmlHttp.setRequestHeader("X-Origin", origin);

        xmlHttp.onreadystatechange = function() {
            // notify readyState
            var readyState = xmlHttp.readyState;
            if (readyState >= responseState) {
                monitorResponse();
            }
            
            // cleanup on request completion
            if (readyState == 4) {
                if (monitorID !== null) {
                    clearTimeout(monitorID);
                }
            }
        }

		// IE throws exception when trying to assign xmlHttp.onerror (!)
		if (browser != "ie") {
	        xmlHttp.onerror = function() {
		        // notify meta data changes
		        postMessage0(source, ["e", id].join(""), origin);
	        }
	    }
        
        if (xmlHttp.sendAsBinary && !textContentType) {
            xmlHttp.setRequestHeader("Content-Type", "application/octet-stream");
            xmlHttp.sendAsBinary(payload);
        } else {
            xmlHttp.send(payload);
        }
    }

    function doSendXDR(source, origin, id, method, location, requestHeaders, payload, timeout) {
        // register new XMLHttpRequest delegate
        
        //for 3.5 clients - add .kf=200&.kp=2048 to tell server to doFlush()
        if (location.indexOf(".kf=200") == -1) {
            location += "&.kf=200&.kp=2048"
        }
        // add .kac=ex to tell server send allow-origin header and .kac to tell server read headers from post body
        location += "&.kac=ex&.kct=application/x-message-http";
        var xmlHttp = new XDomainRequest();
        registry[id] = { type: "xhr", transport: xmlHttp };
        
        // track progress of response
        var readyState = 2;
        var progressAt = 0;
        
        xmlHttp.onprogress = function () {
            try {
                // process emulated headers in payload
               if(readyState == 2) {
                    var responseText = xmlHttp.responseText;
                    progressAt = responseText.length;
                    var xmlHttp0 = parseEmulatedResponse(responseText);

                    if (xmlHttp0 !== null) {
                        readyState = 3;
                        // access restricted for non-whitelist response headers
                        var responseHeaders = [];
                        for (var responseHeaderName in xsResponseHeaders) {
                            if (typeof(responseHeaderName) == "string") {
                                var responseHeaderValue = xmlHttp0.getResponseHeader(responseHeaderName);
                                if (responseHeaderValue != null) {
                                    responseHeaders.push([responseHeaderName, responseHeaderValue]);
                                }
                            }
                        }
                    
                        // notify meta data changes
                        postReadyMessage(source, origin, id, responseHeaders, xmlHttp0.status, xmlHttp0.statusText);
                        // skip over emulated response status and headers
                    	progressAt = responseText.length - xmlHttp0.responseText.length;
                    }
                }
 
                // detect new data
                var newDataLength = xmlHttp.responseText.length;
                
                if (newDataLength > progressAt) {
                    var responseChunk = xmlHttp.responseText.slice(progressAt);
                    progressAt = newDataLength;
                    //    - progress -
                    //    <-- "p" 00000001 3 0000000c "Hello, world"
            
                    // deliver the progress callback
                    postMessage0(source, ["p", id, readyState, toPaddedHex(responseChunk.length, 8), responseChunk].join(""), origin);
                }

            }
            catch (e1) {
                doError(id);
            }
        }
        xmlHttp.onerror = function() {
	    // notify meta data changes
	    postMessage0(source, ["e", id].join(""), origin);
        }
        xmlHttp.ontimeout = function() {
	    // notify meta data changes
	    postMessage0(source, ["e", id].join(""), origin);
        }
        xmlHttp.onload = function() {
            readyState = 4;
            var responseChunk = "";
            //detect progress
            var newDataLength = xmlHttp.responseText.length;
                 
            if (newDataLength > progressAt) {
                responseChunk = xmlHttp.responseText.slice(progressAt);
                progressAt = newDataLength;
                //    - progress -
                //    <-- "p" 00000001 3 0000000c "Hello, world"
            }
            // deliver the progress callback
            postMessage0(source, ["p", id, readyState, toPaddedHex(responseChunk.length, 8), responseChunk].join(""), origin);
            
        }
        // wrapper http request, remove &.kct=application/x-message-http to match outer request path
        var wpayload = method + " " + location.substring(location.indexOf("/", 9), location.indexOf("&.kct")) + " HTTP/1.1\r\nContent-Type: text/plain; charset=windows-1252\r\n\r\n";
         
        xmlHttp.open("POST", location);
        xmlHttp.send(wpayload);
    }
    
    function parseEmulatedResponse(responseText) {
        // end of line can be \r, \n or \r\n
        var linesPattern = /(\r\n|\r|\n)/;
        var matchParts = responseText.match(linesPattern);
        if (!matchParts || matchParts.length <= 1) {
            // stop parsing if fewer than two newlines were found
            return null;
        }
        var endOfLineMark = matchParts[1];


    	// verify emulated response status and headers available
    	var endOfHeadersMark = endOfLineMark + endOfLineMark;
    	var endOfHeadersAt = responseText.indexOf(endOfHeadersMark) + endOfHeadersMark.length;
    	if (endOfHeadersAt < endOfHeadersMark.length) {
    		return null;
    	}

    	// parse emulated response status and headers
        var endOfStartAt = responseText.indexOf(endOfLineMark) + endOfLineMark.length;
        var startText = responseText.substring(0, endOfStartAt);
        var startMatch = startText.match(/HTTP\/1\.\d\s(\d+)\s([^\r\n]+)/);  // match all line endings
        var responseHeadersText = responseText.substring(endOfStartAt, endOfHeadersAt);
        var responseHeaderNameValues = responseHeadersText.split(endOfLineMark);
        var responseHeaders = {};
        for (var i=0; i < responseHeaderNameValues.length; i++) {
        	var responseHeaderMatch = responseHeaderNameValues[i].match(/([^\:]+)\:\s?(.*)/);
        	if (responseHeaderMatch) {
        		responseHeaders[responseHeaderMatch[1]] = responseHeaderMatch[2];
        	}
        }
        
        // return emulated response
        var xmlHttp = {};
        xmlHttp.status = parseInt(startMatch[1]);
        xmlHttp.statusText = startMatch[2];
        xmlHttp.endOfHeadersAt = endOfHeadersAt;
        xmlHttp.responseText = responseText.substring(endOfHeadersAt);
        xmlHttp.getResponseHeader = function(headerName) { return responseHeaders[headerName]; };

        return xmlHttp;
    }
    
    function onpreflightreadystatechange(source, origin, id, method, location, requestHeaders, payload, timeout, streaming, xmlHttp) {
        switch (xmlHttp.readyState) {
        case 4:
        	var xmlHttp0 = parseEmulatedResponse(xmlHttp.responseText);
            if (xmlHttp0.status == 200 && accessControlCheck(xmlHttp0, origin) == "pass") {
                var acAllowMethods = (xmlHttp0.getResponseHeader("Access-Control-Allow-Methods") || "").split(",");
                var methodAllowed = false;
                for (var i=0; i < acAllowMethods.length; i++) {
                    if (acAllowMethods[i] == method) {
                        methodAllowed = true;
                        break;
                    }
                }
                if (methodAllowed) {
                    var acAllowHeaders = (xmlHttp0.getResponseHeader("Access-Control-Allow-Headers") || "").split(",");
                    var allHeadersAllowed = true;
                    for (var headerName in requestHeaders) {
                        if (typeof(headerName) == "string") {
                            // always allow whitelist cross-site request headers
                            var headerAllowed = xsRequestHeaders[headerName];
                            
                            // require explicit allow for non-whitelist cross-site request headers
                            if (!headerAllowed) {
                                for (var i=0; i < acAllowHeaders.length; i++) {
                                    if (acAllowHeaders[i] == headerName) {
                                        headerAllowed = true;
                                        break;
                                    }
                                }
                            }
                            allHeadersAllowed = headerAllowed;
                            
                            // if any header not allowed, skip remaining
                            if (!allHeadersAllowed) {
                              break;
                            }
                        }
                    }

                    // method allowed and all headers allowed                    
                    if (allHeadersAllowed) {
                       doSendWithoutPreflight(source, origin, id, method, location, requestHeaders, payload, timeout, streaming);
                       return;
                    }
                }
            }
            
            // this is reachable only if preflight was unsuccessful
	        postMessage0(source, ["e", id].join(""), origin);
            
            break;
        }
    }
    
    function accessControlCheck(xmlHttp, origin) {
        var acAllowOrigin = xmlHttp.getResponseHeader("Access-Control-Allow-Origin");
        if (acAllowOrigin != origin) {
            return "fail";
        }

        // Note: credentials flag is implicitly true for emulation
        var acAllowCredentials = xmlHttp.getResponseHeader("Access-Control-Allow-Credentials");
        if (acAllowCredentials != "true") {
            return "fail";
        }
        
        return "pass";
    }
    
    function postReadyMessage(source, origin, id, responseHeaders, status, statusText) {
        //    - readystate -
        //    <-- "r" 00000001 01 000b "Content-Type" 000a "text/plain" 00c2 02 "OK"

        var message = ["r", id];
        message.push(toPaddedHex(responseHeaders.length, 2));
        for (var i=0; i < responseHeaders.length; i++) {
            var responseHeader = responseHeaders[i];
            message.push(toPaddedHex(responseHeader[0].length, 4));
            message.push(responseHeader[0]);
            message.push(toPaddedHex(responseHeader[1].length, 4));
            message.push(responseHeader[1]);
        }
        message.push(toPaddedHex(status, 4));
        message.push(toPaddedHex(statusText.length, 2));
        message.push(statusText);
        
        postMessage0(source, message.join(""), origin);
    }
    
    function fromHex(formatted) {
        return parseInt(formatted, 16);
    }
    
    function toPaddedHex(value, width) {
        var hex = value.toString(16);
        var parts = [];
        width -= hex.length;
        while (width-- > 0) {
            parts.push("0");
        }
        parts.push(hex);
        return parts.join("");
    }

    window.addEventListener("message", onmessage, false);
})();

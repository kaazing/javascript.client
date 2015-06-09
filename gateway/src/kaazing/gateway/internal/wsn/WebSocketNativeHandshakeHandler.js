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
 * @private
 */
var WebSocketNativeHandshakeHandler = (function() /*extends WebSocketHandlerAdapter*/ {
	;;;var CLASS_NAME = "WebSocketNativeHandshakeHandler";
	;;;var LOG = Logger.getLogger(CLASS_NAME);
    /*static final String*/var  HEADER_SEC_PROTOCOL = "Sec-WebSocket-Protocol";
    /*final String*/var HEADER_SEC_EXTENSIONS = "Sec-WebSocket-Extensions";
    /*final String*/var HEADER_AUTHORIZATION = "Authorization";
    /*final String*/var HEADER_WWW_AUTHENTICATE = "WWW-Authenticate";
    /*final String*/var HEADER_SET_COOKIE = "Set-Cookie";
    var GET_BYTES = "GET";
    var HTTP_1_1_BYTES = "HTTP/1.1";
    var COLON_BYTES = ":";
    var SPACE_BYTES = " ";
    var CRLF_BYTES = "\r\n";
    

	
    var WebSocketNativeHandshakeHandler = function() {
		;;;LOG.finest(CLASS_NAME, "<init>");
    };
		
    //internal functions
    
    var sendCookieRequest = function(channel, kSessionId) {
        ;;;LOG.finest(CLASS_NAME, "sendCookieRequest with {0}", kSessionId)

        var create = new XMLHttpRequest0();
        var path = channel._location.getHttpEquivalentScheme() + "://" + channel._location.getAuthority() + (channel._location._uri.path || "");
        path = path.replace(/[\/]?$/, "/;api/set-cookies");
        create.open("POST", path, true);
        create.setRequestHeader("Content-Type", "text/plain; charset=utf-8");
        create.send(kSessionId);
    }

    var sendHandshakePayload = function($this, channel, authToken) {
        var headerNames = [];
        var headerValues = [];
        headerNames.push("WebSocket-Protocol");
        headerValues.push("");  //for now use Sec-Websockect-Protocol header instead
        headerNames.push(HEADER_SEC_PROTOCOL);
        headerValues.push(channel._protocol.join(","));  //now send the Websockect-Protocol
        var extensions = [WebSocketHandshakeObject.KAAZING_SEC_EXTENSION_IDLE_TIMEOUT, WebSocketHandshakeObject.KAAZING_SEC_EXTENSION_PING_PONG];
        var registeredExtensions = WebSocketExtensionSpi.getRegisteredExtensionNames();
        if (registeredExtensions.length > 0) {
            extensions.push(registeredExtensions);
        }
        headerNames.push(HEADER_SEC_EXTENSIONS);
        headerValues.push(extensions.join(","));
        headerNames.push(HEADER_AUTHORIZATION);
        headerValues.push(authToken);  //send authorization token
            
        var payload = encodeGetRequest(channel._location, headerNames, headerValues);
        $this._nextHandler.processTextMessage(channel, payload);
    }
    
    var encodeGetRequest = function(requestURI, names, values) {

        ;;;LOG.entering(CLASS_NAME, "encodeGetRequest");
        // Encode Request line
        var lines = [];
        lines.push(GET_BYTES);
        lines.push(SPACE_BYTES);
        var path = [];
        if(requestURI._uri.path != undefined) {
            path.push(requestURI._uri.path);
        }
        if(requestURI._uri.query != undefined) {
            path.push("?");
            path.push(requestURI._uri.query)
        }
        lines.push(path.join(""));
        lines.push(SPACE_BYTES);
        lines.push(HTTP_1_1_BYTES);
        lines.push(CRLF_BYTES);

        // Encode headers
        for (var i = 0; i < names.length; i++) {
            var headerName = names[i];
            var headerValue = values[i];
            if (headerName != null && headerValue != null) {
                lines.push(headerName);
                lines.push(COLON_BYTES);
                lines.push(SPACE_BYTES);
                lines.push(headerValue);
                lines.push(CRLF_BYTES);
            }
        }

        // Encoding cookies, content length and content not done here as we
        // don't have it in the initial GET request.

        lines.push(CRLF_BYTES);
        var requestStr = lines.join("");
        return requestStr;
    }

    var handleHandshakeMessage = function($this, channel, s) {
        
        if (s.length > 0) {
            channel.handshakePayload += s;
            //wait for more messages
            return;
        }

        var lines = channel.handshakePayload.split("\n");
        channel.handshakePayload = "";
        var httpCode = "";
        //parse the message for embeded http response, should read last one if there are more than one HTTP header
        for (var i = lines.length - 1; i >= 0; i--) {
            if (lines[i].indexOf("HTTP/1.1") == 0) { //"HTTP/1.1 101 ..."
                var temp = lines[i].split(" ");
                httpCode = temp[1];
                break;
            }
        }

        if ("101" == httpCode) {
            //handshake completed, websocket Open

            //get supported extensions escape bytes
            var extensionsHeader = []; // we may have multiple extension headers,and each header may have multiple extensions
            var acceptedProtocol ="";
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (line != null && line.indexOf(HEADER_SEC_EXTENSIONS) == 0) {
                    extensionsHeader.push(line.substring(HEADER_SEC_EXTENSIONS.length + 2));
                }
                else if (line != null && line.indexOf(HEADER_SEC_PROTOCOL) == 0) {
                    acceptedProtocol = line.substring(HEADER_SEC_PROTOCOL.length + 2);
                }
                else if (line != null && line.indexOf(HEADER_SET_COOKIE) == 0) {
                    //send setcookie request
                    sendCookieRequest(channel, line.substring(HEADER_SET_COOKIE.length + 2));
                }
            }
            channel._acceptedProtocol = acceptedProtocol; //set server accepted protocol
            
            // extensions header
            if (extensionsHeader.length > 0) {
                var extensions = extensionsHeader.join(", ").split(", ");
                for (var j = 0; j < extensions.length; j++) {
                    var extensionElements = extensions[j].split(";");
                    var extensionName =  extensionElements[0].replace(/^\s+|\s+$/g,"");
                    if (WebSocketHandshakeObject.KAAZING_SEC_EXTENSION_IDLE_TIMEOUT === extensionName) {
                        //x-kaazing-idle-timeout extension, the timeout parameter is like "timeout=500"
                        var timeout = extensionElements[1].match(/\d+/)[0];
                        if (timeout > 0) {
                            $this._nextHandler.setIdleTimeout(channel, timeout);
                        }
                        continue; //x-kaazing-idle-timeout is internal extension
                    }
                    else if (WebSocketHandshakeObject.KAAZING_SEC_EXTENSION_PING_PONG === extensionName) {
                    	//x-kaazing-ping pong, cache the extension using the escapeKey
                    	try {
                    		var escape = extensionElements[1].replace(/^\s+|\s+$/g,"");
                            var escapeKey = parseInt(escape, 16);
                            channel._controlFrames[escapeKey] = extensionName; // x-kaazing-ping-pong only send text messages
                            channel._escapeSequences[escapeKey] = extensionName;
                            continue; //x-kaazing-ping-pong is internal only
                        } catch(e) {
                            // this is not escape parameter, ignored
                            throw new Error("failed to parse escape key for x-kaazing-ping-pong extension");
                        }
                    }
                    else {
                        var extensionSpiFactory = WebSocketExtensionSpi.get(extensionName);

                        if (extensionSpiFactory == null) {
                            // error - there should be extension registered for negotiated extension
                            throw new Error("Extended Handshake failed. Negotiated extension - '" + extensionName + "' is not registered.");
                        }
                        channel._negotiatedExtensions.push(extensions[j]);
                    }
                }//end of extensions loop
            }
            //wait balancer message
            return;
        } else if ("401" == httpCode) {
            //receive HTTP/1.1 401 from server, pass event to Authentication handler
            channel.handshakestatus = 2; //handshake completed
            var challenge = "";
            for (var i = 0; i < lines.length; i++) {
                if (lines[i].indexOf(HEADER_WWW_AUTHENTICATE) == 0) {
                    challenge = lines[i].substring(HEADER_WWW_AUTHENTICATE.length + 2);
                    break;
                }
            }
            $this._listener.authenticationRequested(channel, channel._location.toString(), challenge);
        } else {
            // Error during handshake, close connect, report connectionFailed
            $this._listener.connectionFailed(channel);
        }
    }
    
    var handleTimeout = function($this, channel) {
        try {
            channel.handshakestatus = 3; //handshake timeout
            $this._nextHandler.processClose(channel);
        }
        finally {
            $this._listener.connectionFailed(channel);
        }
    }

    /**
	 * @private
	 */
	var $prototype = WebSocketNativeHandshakeHandler.prototype = new WebSocketHandlerAdapter();

    $prototype.processConnect = function(channel, uri, protocol) {
        channel.handshakePayload = "";
        //add x-kaazing-extension protocol
        var protocols = [WebSocketHandshakeObject.KAAZING_EXTENDED_HANDSHAKE];
        for (var i = 0; i < protocol.length; i++) {
            protocols.push(protocol[i]);
        }
        this._nextHandler.processConnect(channel, uri, protocols);

        if ((typeof(channel.parent.connectTimer) == "undefined") ||
            (channel.parent.connectTimer == null)) {
            //KG-5435: add 5 seconds timer for native handshake
            //use channel.handshakestatue to determin hadnshake status
            // 0 - connecting, 1 - inprocess, 2 - completed, 3 - handshake timeout
            // ontimer function: if handshakestatus < 2, set handshakestatus to 3, disconnect
            channel.handshakestatus = 0; //start connect
            var $this = this;
            setTimeout(function () {
                if (channel.handshakestatus == 0) {
                    //open not fired in 5 seconds, call handleTimeout
                    handleTimeout($this, channel);
                }
            }, 5000);
        }
    }

    $prototype.processAuthorize = function(channel, authorizeToken) {
        sendHandshakePayload(this, channel, authorizeToken);
    }

    $prototype.handleConnectionOpened = function(channel, protocol) {
		;;;LOG.finest(CLASS_NAME, "handleConnectionOpened");
        //check response for "x-kaazing-handshake protocol"
        if (WebSocketHandshakeObject.KAAZING_EXTENDED_HANDSHAKE == protocol) {
            sendHandshakePayload(this, channel, null);
            //open fired, wait 5 seconds for handshake process
            channel.handshakestatus = 1; //handshake inprocess

            if ((typeof(channel.parent.connectTimer) == "undefined") ||
                (channel.parent.connectTimer == null)) {
                var $this = this;
                setTimeout(function () {
                    if (channel.handshakestatus < 2) {
                        handleTimeout($this, channel);
                    }
                }, 5000);
            }

        } else {
            // old WebSocket protocol
            channel.handshakestatus = 2; //handshake completed
            this._listener.connectionOpened(channel, protocol);
        }
    }

	$prototype.handleMessageReceived = function(channel, message) {
		;;;LOG.finest(CLASS_NAME, "handleMessageReceived", message);
        if (channel.readyState == WebSocket.OPEN) {
            //isEscape is true, this is orginal messasge, reset flag and raise event
			channel._isEscape = false;
			this._listener.textMessageReceived(channel, message);
        }
		else {
            handleHandshakeMessage(this, channel, message);
		}
	}

	$prototype.handleBinaryMessageReceived = function(channel, message) {
		;;;LOG.finest(CLASS_NAME, "handleMessageReceived", message);
        if (channel.readyState == WebSocket.OPEN) {
            //isEscape is true, this is orginal messasge, reset flag and raise event
			channel._isEscape = false;
			this._listener.binaryMessageReceived(channel, message);
        }
		else
		{
	        handleHandshakeMessage(this, channel, String.fromCharCode.apply(null, new Uint8Array(message)));
		}
	}

    $prototype.setNextHandler = function(nextHandler) {
        this._nextHandler = nextHandler;
        var $this = this;
        var listener = new WebSocketHandlerListener(this);
        listener.connectionOpened = function(channel, protocol) {
            //alert(CLASS_NAME + "connectionOpened");
            $this.handleConnectionOpened(channel, protocol);
        }
        listener.textMessageReceived = function(channel, buf) {
            $this.handleMessageReceived(channel, buf);
        }
        listener.binaryMessageReceived = function(channel, buf) {
            $this.handleBinaryMessageReceived(channel, buf);
        }
        listener.connectionClosed = function(channel, wasClean, code, reason) {
            if (channel.handshakestatus <3)
                channel.handshakestatus = 3; //only fire this event once
                $this._listener.connectionClosed(channel, wasClean, code, reason);
        }
        listener.connectionFailed = function(channel) {
            if (channel.handshakestatus <3)
                channel.handshakestatus = 3; //only fire this event once
                $this._listener.connectionFailed(channel);
        }
        nextHandler.setListener(listener);
    }

	$prototype.setListener = function(listener) {
		this._listener = listener;
	}

	return WebSocketNativeHandshakeHandler;
})()

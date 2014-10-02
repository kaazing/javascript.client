/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

// See HTML5 Specification, Section 6.4 Cross-document Messaging
/**
 * Provides an emulation of HTML5 window.postMessage, 
 * leveraging the native implementation if available.
 *
 * @function
 *
 * @param {Window} target  the target window to receive messages
 * @param {String} message the message to send to the target window
 * @param {String} origin  the origin of the message
 */
var postMessage0 =
(function() {
    // IE6 cannot access window.location after document.domain is assigned, use document.URL instead
    var locationURI = new URI((browser == "ie") ? document.URL : location.href);
    var defaultPorts = { "http":80, "https":443 };
    if (locationURI.port == null) {
        locationURI.port = defaultPorts[locationURI.scheme];
        locationURI.authority = locationURI.host + ":" + locationURI.port;
    }

    var windowOrigin = locationURI.scheme + "://" + locationURI.authority;
    var prefix = "/.kr";

    // Note: typeof(postMessage) returns "object" on IE8, others return "function"
    if (typeof(postMessage) !== "undefined") {
        return function(target, message, origin) {
            if (typeof(message) != "string") {
                throw new Error("Unsupported type. Messages must be strings");
            }

            // widen target for null origins (such as file:///)
            if (origin === "null") {
                origin = "*";
            }

            // delegate to native postMessage
            switch (browser) {
            case "ie":
            case "opera":
            case "firefox":
                // IE 8, Opera 9.64 and Firefox 3.0 implement postMessage with synchronous behavior (!)
                setTimeout(function() {
                    target.postMessage(message, origin);
                }, 0);
                break;
            default:
                target.postMessage(message, origin);
                break;
            }
        }
    }
    else {
        // The emulation of postMessage uses fragment-identifier-messaging.
        //
        // Each message is of the form token(8) syn#(8) ack#(8) type[!payload], for example:
        //
        //    -->  01234567 00000001 00000000 f 06 "Hello,"
        //    <--  89abcdef 00000001 00000001 a
        //    -->  01234567 00000002 00000001 F 06 " world"
        //    <--  89abcdef 00000002 00000002 a
        //
        // Writes are immediately enabled after ack, because acks have no ack
        // so acks could be overwritten as follows:
        //
        //    -->  01234567 00000001 00000000 F 06 "Hello "
        //    <--  89abcdef 00000001 00000001 a
        //    <--  01234567 00000002 00000001 F 07 "welcome"
        //
        // The timing is sensitive to when ack#0 and message#1 are written versus
        // when the receiving fragment is read and processed.
        //
        // To overcome this, the ack is repeated by the sender, and the receiver
        // ignores old acks as follows:
        //
        //    -->  01234567 00000001 00000000 F 06 "Hello "
        //    <--  89abcdef 00000001 00000000 a
        //    <--  01234567 00000001 00000001 a 00000002 00000001 F 07 "welcome"
        //
        // No matter the relative timing, the receiver processes one and only one
        // ack#0 and message#1.
        //
        // Another problem is caused due to bidirectional messaging, when both sides
        // send a message before receiving the in-flight message, as follows:
        //  
        //    -->  01234567 00000001 00000000 F 06 "Hello "
        //    <--  89abcdef 00000001 00000000 F 07 "welcome"
        //
        // Now both sides are waiting for an ack before sending the ack, so deadlock occurs.
        //
        // To overcome this, when an ack is needed and a message is in flight, then the
        // message is repeated, but with an updated ack index as follows:
        //
        //    -->  01234567 00000001 00000000 F 06 "Hello "
        //    <--  89abcdef 00000001 00000000 F 07 "welcome"
        //    -->  01234567 00000001 00000001 F 05 "Hello"
        //
        // This repeated send causes the receiver to send the next message, acknowledging the
        // repeated send.  However, the duplicated message is not re-processed.
        // If the repeated send is received before the receiver observes the original, then
        // it behaves the same as if no deadlock occurred.
        //
        // Note: an alternative, to use a total of 4 iframes, with 2 pairs of (write, ack) iframes
        //       is considered unnecessary overhead
        
        function MessagePipe(iframe) {
            this.sourceToken = toPaddedHex(Math.floor(Math.random() * (Math.pow(2, 32) - 1)), 8);
            this.iframe = iframe;
            this.bridged = false;
            this.lastWrite = 0;
            this.lastRead = 0;
            this.lastReadIndex = 2; // ack# position in payload structure (zero-based)
            this.lastSyn = 0;
            this.lastAck = 0;
            this.queue = [];
            this.escapedFragments = [];
        }
        
        var $prototype = MessagePipe.prototype;

        $prototype.attach = function(target, targetOrigin, targetToken, reader, writer, writerURL) {
            this.target = target;
            this.targetOrigin = targetOrigin;
            this.targetToken = targetToken;
            this.reader = reader;
            this.writer = writer;
            this.writerURL = writerURL;
            
            // initialize the polling state to detect hash changes
            try {
                this._lastHash = reader.location.hash;
                // poll location.hash for updates
                this.poll = pollLocationHash;
            }
            catch (permissionDenied) {
                this._lastDocumentURL = reader.document.URL;
                // poll document.URL for updates
                this.poll = pollDocumentURL;
            }
            
            if (target == parent) {
                // target can write immediately
                // send ack to parent
                dequeue(this, true);
            }
        }
        
        $prototype.detach = function() {
            // no more updates, stop polling reader
            this.poll = function() {};
            delete this.target;
            delete this.targetOrigin;
            delete this.reader;
            delete this.lastFragment;
            delete this.writer;
            delete this.writerURL;
        }
        
        $prototype.poll = function() {};
        
        function pollLocationHash() {
            // handle normal case, where location.hash is readable
            var currentHash = this.reader.location.hash;
            if (this._lastHash != currentHash) {
                process(this, currentHash.substring(1));
                this._lastHash = currentHash;
            }
        }
        
        function pollDocumentURL() {
            // handle IE6 case, where same document.domain permits access
            // to objects in collaborating windows, but not the location.hash
            var documentURL = this.reader.document.URL;
            if (this._lastDocumentURL != documentURL) {
                var hashAt = documentURL.indexOf("#");
                if (hashAt != -1) {
                    process(this, documentURL.substring(hashAt + 1));
                    this._lastDocumentURL = documentURL;
                }
            }
        }
        
        $prototype.post = function(target, message, targetOrigin) {
            // create bridge iframe, or enable target to create bridge iframe
            bridgeIfNecessary(this, target);
            
            // fragmentation: f = fragment, F = final fragment
            var maxFragmentSize = 1000;
            var escapedMessage = escape(message);
            var escapedFragments = [];
            while (escapedMessage.length > maxFragmentSize) {
                var escapedFragment = escapedMessage.substring(0, maxFragmentSize);
                escapedMessage = escapedMessage.substring(maxFragmentSize);
                escapedFragments.push(escapedFragment);
            }
            escapedFragments.push(escapedMessage);
            
            this.queue.push([targetOrigin, escapedFragments]);
            
            if (this.writer != null && this.lastAck >= this.lastSyn) {
                dequeue(this, false);
            }
        }
        
        function bridgeIfNecessary($this, target) {
            if ($this.lastWrite < 1 && !$this.bridged) {
                if (target.parent == window) {
                    // first write to target writes parent origin to target hash
                    var src = $this.iframe.src;
                    var parts = src.split("#");

                    var sourceBridgeAuthority = null;
                    // TODO: and move this out to a sensible place
                    var tags = document.getElementsByTagName("meta");
                    for (var i=0; i<tags.length; i++) {
                        if (tags[i].name == "kaazing:resources") {
                            alert('kaazing:resources is no longer supported. Please refer to the Administrator\'s Guide section entitled "Configuring a Web Server to Integrate with Kaazing Gateway"');
                        }
                    }

                    // default sourceBridgeURL using this location, the configured prefix, and the usual qs
                    var sourceOrigin = windowOrigin;
                    var sourceBridgeURL = sourceOrigin.toString() + prefix + "?.kr=xsp&.kv=10.05";

                    // narrow the bridge location if subdomain was specified
                    if (sourceBridgeAuthority) {
                        var sourceOriginURL = new URI(sourceOrigin.toString())

                        // sourceBridgeAuthority may have an explicit port
                        var parts = sourceBridgeAuthority.split(":");
                        sourceOriginURL.host = parts.shift();
                        if (parts.length) {
                            sourceOriginURL.port = parts.shift()
                        }

                        sourceBridgeURL = sourceOriginURL.toString() + prefix + "?.kr=xsp&.kv=10.05";
                    }

                    // if there is a bridge location configured, it should take precedence
                    for (var i=0; i<tags.length; i++) {
                        if (tags[i].name == "kaazing:postMessageBridgeURL") {
                            var bridgeUrlString = tags[i].content
                            var postMessageBridgeURL = new URI(bridgeUrlString);

                            // verify URL and populate missing fields if it is a relative URL
                            var baseURL = new URI(location.toString());

                            // if the location is relative, use the page location as the base url 
                            if (!postMessageBridgeURL.authority) {
                                postMessageBridgeURL.host = baseURL.host;
                                postMessageBridgeURL.port = baseURL.port;
                                postMessageBridgeURL.scheme = baseURL.scheme;
                                // if the path is relative, replace the filename in the
                                // base url with the configured string
                                if (bridgeUrlString.indexOf("/") != 0) {
                                    var pathParts = baseURL.path.split("/");
                                    pathParts.pop();
                                    pathParts.push(bridgeUrlString);
                                    postMessageBridgeURL.path = pathParts.join("/");
                                }

                            }
                            postMessage0.BridgeURL = postMessageBridgeURL.toString();
                            
                        }
                    }
                    // overwrite the derived bridge url with an explicit version if present
                    if (postMessage0.BridgeURL) {
                        sourceBridgeURL = postMessage0.BridgeURL;
                    }

                    // Sending the initialization message to a listening frame containing postMessage0 (such as
                    // the XHRBridge) will trigger the creation of bridge iframes that have initialization arguments
                    // pushed down into them by hash replacement.
                    //
                    // source -> target 
                    // target -> (creates and sets hash) sourceBridge
                    // sourceBridge -> (creates and sets hash) targetBridge
                    var payload = ["I", sourceOrigin, $this.sourceToken, escape(sourceBridgeURL)];
                    if (parts.length > 1) {
                        var oldHash = parts[1];
                        payload.push(escape(oldHash));
                    }
                    parts[1] = payload.join("!")

                    // schedule location update to avoid stalling onload in FF15
                    setTimeout(function() {
                        target.location.replace(parts.join("#"));
                    }, 200);
                    
                    $this.bridged = true;
                }
            }
        }
        
        function flush($this, payload) {
            var newLocation = $this.writerURL + "#" + payload;
            $this.writer.location.replace(newLocation);
            //console.log("[" + $this.targetOrigin + "] flush:   " + payload);
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
        
        function dequeue($this, ackIfEmpty) {
            var queue = $this.queue;
            var lastRead = $this.lastRead;
            
            if ((queue.length > 0 || ackIfEmpty) && $this.lastSyn > $this.lastAck) {
                // resend last payload with updated ack index to avoid deadlock
                var lastFrames = $this.lastFrames;
                var lastReadIndex = $this.lastReadIndex;
                
                if (fromHex(lastFrames[lastReadIndex]) != lastRead) {
                    lastFrames[lastReadIndex] = toPaddedHex(lastRead, 8);
                    flush($this, lastFrames.join(""));
                }
            }
            else if (queue.length > 0) {
                var entry = queue.shift();
                var targetOrigin = entry[0];

                // check target origin
                if (targetOrigin == "*" || targetOrigin == $this.targetOrigin) {
                    // reserve fragment frame index
                    $this.lastWrite++;

                    // build the fragment frame
                    var escapedFragments = entry[1];
                    var escapedFragment = escapedFragments.shift();
                    var typeIndex = 3; // location of "F" in array below
                    var lastFrames = [$this.targetToken, toPaddedHex($this.lastWrite, 8), toPaddedHex(lastRead, 8), 
                                      "F", toPaddedHex(escapedFragment.length, 4), escapedFragment];
                    var lastReadIndex = 2;

                    // convert to partial fragment frame if necessary
                    if (escapedFragments.length > 0) {
                        lastFrames[typeIndex] = "f";
                        $this.queue.unshift(entry);
                    }

                    // resend ack with subsequent frame
                    // avoids potential gap in frame index sequence
                    if ($this.resendAck) {
                        // resend the previous ack frame before fragment frame
                        var ackFrame = [$this.targetToken, toPaddedHex($this.lastWrite-1, 8), toPaddedHex(lastRead, 8), "a"];
                        lastFrames = ackFrame.concat(lastFrames);
                        // increment the last read index (see ackIfEmpty case above)
                        lastReadIndex += ackFrame.length;
                    }

                    // send frame(s)
                    flush($this, lastFrames.join(""));

                    // remember last frames to manage deadlock
                    $this.lastFrames = lastFrames;
                    $this.lastReadIndex = lastReadIndex;

                    // expect ack for fragment frame
                    $this.lastSyn = $this.lastWrite;
                    
                    $this.resendAck = false;
                }
            }
            else if (ackIfEmpty) {
                // reserve ack frame index
                $this.lastWrite++;
                
                // build the ack frame
                var lastFrames = [$this.targetToken, toPaddedHex($this.lastWrite, 8), toPaddedHex(lastRead, 8), "a"];
                var lastReadIndex = 2;

                // resend ack with subsequent frame
                // avoids potential gap in frame index sequence
                if ($this.resendAck) {
                    // resend the previous ack frame before fragment frame
                    var ackFrame = [$this.targetToken, toPaddedHex($this.lastWrite-1, 8), toPaddedHex(lastRead, 8), "a"];
                    lastFrames = ackFrame.concat(lastFrames);
                    // increment the last read index (see ackIfEmpty case above)
                    lastReadIndex += ackFrame.length;
                }

                // send frame(s)
                flush($this, lastFrames.join(""));
                    
                // remember last frames to manage deadlock
                $this.lastFrames = lastFrames;
                $this.lastReadIndex = lastReadIndex;

                // support ack resend with subsequent frame
                // avoids potential gap in message index sequence
                $this.resendAck = true;
            }
        }
        
        function process($this, payload) {
            //console.log("[" + windowOrigin + "] process: " + payload);
            
            var sourceToken = payload.substring(0, 8);
            var synIndex = fromHex(payload.substring(8, 16));
            var ackIndex = fromHex(payload.substring(16, 24));
            var type = payload.charAt(24);

            if (sourceToken != $this.sourceToken) {
                throw new Error("postMessage emulation tampering detected");
            }

            // calculate the last read index and expected read index            
            var lastRead = $this.lastRead;
            var expectedRead = lastRead + 1;

            // update the last read index if the expected read index is observed
            if (synIndex == expectedRead) {
                $this.lastRead = expectedRead;
            }

            // support updating lastAck for expected or last read frame
            // the last read frame scenario is triggered by race condition
            // of both sides sending messages before the other side has
            // polled an incoming message
            if (synIndex == expectedRead || synIndex == lastRead) {
                $this.lastAck = ackIndex;
            }
            
            // process message payload, or skip over old ack to process remaining parts
            // when sending an ack, writes are enabled immediately, so a subsequent write
            // could overwrite the ack before it has been processed - to address this,
            // the new fragment contains both the original ack and the new message, so
            // we need the ability to skip over repeated acks, and process the remaining parts
            if (synIndex == expectedRead || (synIndex == lastRead && type == "a")) {
                switch (type) {
                    case "f":
                        var escapedFragment = payload.substr(29, fromHex(payload.substring(25,29)));
                        $this.escapedFragments.push(escapedFragment);

                        // send next message or ack
                        dequeue($this, true);
                        break;
                    case "F":
                        var escapedMessage = payload.substr(29, fromHex(payload.substring(25,29)));
                        if ($this.escapedFragments !== undefined) {
                            $this.escapedFragments.push(escapedMessage);
                            escapedMessage = $this.escapedFragments.join("");
                            $this.escapedFragments = [];
                        }
                        
                        var message = unescape(escapedMessage);

                        // dispatch message
                        dispatch(message, $this.target, $this.targetOrigin);

                        // send next message or ack
                        dequeue($this, true);
                        break;
                    case "a":
                        if (payload.length > 25) {
                            // process remaining frame fragments
                            process($this, payload.substring(25));
                        }
                        else {
                            // send next message
                            dequeue($this, false);
                        }
                        break;
                    default:
                        throw new Error("unknown postMessage emulation payload type: " + type)
                }
            }
        }
        
        function dispatch(message, source, origin) {
            //console.log("[" + origin + " -> " + windowOrigin + "]\n" + message);
            var messageEvent = document.createEvent("Events");
            messageEvent.initEvent("message", false, true);
            messageEvent.data = message;
            messageEvent.origin = origin;
            messageEvent.source = source;
            dispatchEvent(messageEvent);
        }
        
        // Note: ShrinkSafe requires var definitions before references
        var messagePipes = {};
        var pollMessagePipes = [];
        
        function pollReaders() {
            for (var i=0,len=pollMessagePipes.length; i < len; i++) {
                var messagePipe = pollMessagePipes[i];
                messagePipe.poll();
            }
            setTimeout(pollReaders, 20);
        }
        
        function findMessagePipe(target) {
            if (target == parent) {
                return messagePipes["parent"];
            }
            else if (target.parent == window) {
                var iframes = document.getElementsByTagName("iframe");
                for (var i=0; i < iframes.length; i++) {
                    var iframe = iframes[i];
                    if (target == iframe.contentWindow) {
                        return supplyIFrameMessagePipe(iframe);
                    }
                }
            }
            else {
                throw new Error("Generic peer postMessage not yet implemented");
            }
        }
        
        function supplyIFrameMessagePipe(iframe) {
            var name = iframe._name;
            if (name === undefined) {
                name = "iframe$" + String(Math.random()).substring(2);
                iframe._name = name;
            }
            var messagePipe = messagePipes[name];
            if (messagePipe === undefined) {
                messagePipe = new MessagePipe(iframe);
                messagePipes[name] = messagePipe;
            }
            return messagePipe;
        }
        
        function postMessage0(target, message, targetOrigin) {
            if (typeof(message) != "string") {
                throw new Error("Unsupported type. Messages must be strings");
            }

            //console.log("[" + windowOrigin + " -> " + targetOrigin + "]\n" + message);
            if (target == window) {
                // dispatch message locally
                if (targetOrigin == "*" || targetOrigin == windowOrigin) {
                    dispatch(message, window, windowOrigin);
                }
            }
            else {
                var messagePipe = findMessagePipe(target);
                messagePipe.post(target, message, targetOrigin);
            }
        }
        
        postMessage0.attach = function(target, targetOrigin, targetToken, reader, writer, writerURL) {
            var messagePipe = findMessagePipe(target);
            messagePipe.attach(target, targetOrigin, targetToken, reader, writer, writerURL);
            pollMessagePipes.push(messagePipe);
        }

    var initSourceOriginBridge = function(htmlfileDomain) {
        // IE6 cannot access window.location after document.domain is assigned, use document.URL instead
        var locationURI = new URI((browser == "ie") ? document.URL : location.href);
        var htmlfile;

        var defaultPorts = { "http":80, "https":443 };
        if (locationURI.port == null) {
            locationURI.port = defaultPorts[locationURI.scheme];
            locationURI.authority = locationURI.host + ":" + locationURI.port;
        }

        var locationHash = unescape(locationURI.fragment || "");
        
        if (locationHash.length > 0) {
            var locationHashParts = locationHash.split(",");

            // create the postMessage target iframe
            var targetOrigin = locationHashParts.shift();
            var sourceToken = locationHashParts.shift();
            var targetToken = locationHashParts.shift();

            var sourceOrigin = locationURI.scheme + "://" + document.domain + ":" + locationURI.port;
            var sourceBridgeOrigin = locationURI.scheme + "://" + locationURI.authority;
            var targetBridgeURL = targetOrigin + "/.kr?.kr=xsc&.kv=10.05";

            // derive the source bridge location (without hash) from the current page:
            var sourceBridgeURL = document.location.toString().split("#")[0];
            var targetBridgeInitURL = targetBridgeURL + "#" + escape([sourceOrigin, sourceToken, escape(sourceBridgeURL)].join(","));

            // avoid IE clicking
            if (typeof(ActiveXObject) != "undefined") {
                htmlfile = new ActiveXObject("htmlfile");
                htmlfile.open();
                // some IE versions (such as MultipleIEs) give "Access denied" error when setting 
                // parentWindow.opener unless the document domain is specified on the htmlfile
                // other IE versions (such as vanilla IE6 and IE7) fail to synchronize the domains
                // if document domain is specified explicitly for the htmlfile
                try {
                    // let the sourceBridge window be reachable from postMessage target bridge iframe
                    htmlfile.parentWindow.opener = window;

                }
                catch (domainError) {

                    if(htmlfileDomain){
                        htmlfile.domain = htmlfileDomain;
                    } 
                    // let the sourceBridge window be reachable from postMessage target bridge iframe
                    htmlfile.parentWindow.opener = window;
                }
                htmlfile.write("<html>");
                htmlfile.write("<body>");

                // set document.domain for htmlfile if necessary
                if (htmlfileDomain) {
                    htmlfile.write("<script>CollectGarbage();document.domain='" + htmlfileDomain + "';</" + "script>");
                };
                
                // IE cannot tolerate # in the initial iframe URL inside ActiveXObject("htmlfile")
                htmlfile.write("<iframe src=\"" + targetBridgeURL + "\"></iframe>");
                htmlfile.write("</body>");
                htmlfile.write("</html>");
                htmlfile.close();

                var iframe = htmlfile.body.lastChild;
                var sourceBridge = htmlfile.parentWindow;
                var target = parent;
                var postMessage0 = target.parent.postMessage0;

                if (typeof(postMessage0) != "undefined") {
                    // we must wait until the iframe has completed loading before
                    // replacing the targetBridge location, otherwise many cascading
                    // new IE windows or tabs will be opened (a.k.a "postMessage bomb")
                    iframe.onload = function() {
                        // delay accessing the iframe contentWindow until after iframe has loaded
                        var targetBridge = iframe.contentWindow;
                        
                        // replace the location to include the # that initializes the target bridge
                        targetBridge.location.replace(targetBridgeInitURL);

                        // attach the targetBridge writer to the sourceWindow postMessage emulation
                        postMessage0.attach(target, targetOrigin, targetToken, sourceBridge, targetBridge, targetBridgeURL);
                    }
                }
            }
            else {
                // Note: Safari requires initial URL to have a # in order to support
                //       fragment identifier changes with location.replace
                //       otherwise the first fragment change causes page reload
                var iframe = document.createElement("iframe");
                iframe.src = targetBridgeInitURL;
                document.body.appendChild(iframe);

                var sourceBridge = window;
                var targetBridge = iframe.contentWindow;
                var target = parent;
                var postMessage0 = target.parent.postMessage0;


                if (typeof(postMessage0) != "undefined") {
                    // attach the targetBridge writer to the source postMessage emulation
                    postMessage0.attach(target, targetOrigin, targetToken, sourceBridge, targetBridge, targetBridgeURL);
                }
            }
        }

        window.onunload = function() {
            // detach sourceBridge window reference (htmlfile for IE)
            try {
                var postMessage0 = window.parent.parent.postMessage0;
                if (typeof(postMessage0) != "undefined") {
                    postMessage0.detach(target);
                }
            }
            catch (permissionDenied) {
                // Note: this occurs for IE6 when domain mismatch causes this document to be reloaded
                // deliberately ignore
            }
            
            // clean up htmlfile
            if (typeof(htmlfile) !== "undefined") {
                // explicitly remove window reference
                htmlfile.parentWindow.opener = null;

                // explicitly clear out contents
                htmlfile.open();
                htmlfile.close();
                
                // remove the reference to the ActiveXObject
                htmlfile = null;
                // garbage collect ActiveXObject
                CollectGarbage();
            }
        };
    };

        postMessage0.__init__ = function(sourceOriginBridgeWindow, explicitDocumentDomain) {
            var funcString = initSourceOriginBridge.toString()

            // Inject URI and browser (dependencies for initSourceOriginBridge)
            sourceOriginBridgeWindow.URI = URI;
            sourceOriginBridgeWindow.browser = browser;

            // send falsy value for explicitDocumentDomain if it is falsy
            if (!explicitDocumentDomain) {
                explicitDocumentDomain = "";
            }

            // For IE6, the htmlfile object cannot be created in a callstack
            // that touches the source window. Executing initSourceOriginBridge
            // in the source window creates an ActiveX htmlfile object with the
            // source location rather than the bridge location. The same
            // incorrect location is set when a closure is scheduled from the
            // source window.
            //
            // For this reason, a string is scheduled to be evaled in the source
            // window.
            sourceOriginBridgeWindow.setTimeout("(" + funcString + ")('" + explicitDocumentDomain + "')", 0);

        }

        postMessage0.bridgeURL = false;

        postMessage0.detach = function(target) {
            var messagePipe = findMessagePipe(target);
            for (var i=0; i < pollMessagePipes.length; i++) {
                if (pollMessagePipes[i] == messagePipe) {
                    pollMessagePipes.splice(i, 1);
                }
            }
            messagePipe.detach();
        }

        // target frames poll to get parent origin        
        if (window != top) {
            // no parent pipe needed for top window
            messagePipes["parent"] = new MessagePipe();
        
            function initializeAsTargetIfNecessary() {
                // IE6 cannot access window.location after document.domain is assigned, use document.URL instead
                var locationURI = new URI((browser == "ie") ? document.URL : location.href);
                var locationHash = locationURI.fragment || "";
                if (document.body != null && locationHash.length > 0 && locationHash.charAt(0) == "I") {
                    var payload = unescape(locationHash);
                    var parts = payload.split("!");
                    // init command
                    if (parts.shift() == "I") {
                        var sourceOrigin = parts.shift();
                        var sourceToken = parts.shift();
                        var sourceBridgeURL = unescape(parts.shift());
                        var targetOrigin = windowOrigin;
                        
                        // handle IE6 same-origin, mixed implicit / explicit document.domain case
                        if (sourceOrigin == targetOrigin) {
                            try {
                                // Note: IE restricts access to location object when parent is in 
                                //       the same domain with explicit document.domain
                                //       testing parent.location.hash rather than just location.hash
                                //       is necessary for Win2K3
                                parent.location.hash;
                            }
                            catch (permissionDenied) {
                                // explicitly assign domain, making parent.postMessage0 accessible
                                document.domain = document.domain;
                            }
                        }



                        // we have finished observing the postMessage initialization hash sent by parent
                        // so now restore the original hash
                        var oldHash = parts.shift() || "";
                        switch (browser) {
                        case "firefox":
                            // Firefox 3.0 and higher has a native implementation of postMessage
                            // assigning location.hash in Firefox 2.0 causes history entry
                            location.replace([location.href.split("#")[0], oldHash].join("#"));
                            break;
                        default:
                            // location.hash is always writable, even in IE6 after document.domain assigned
                            location.hash = oldHash;
                            break;
                        }
                        
                        var sourceMessagePipe = findMessagePipe(parent);
                        sourceMessagePipe.targetToken = sourceToken;
                        var targetToken = sourceMessagePipe.sourceToken;


                        var sourceBridgeURLwithHash = sourceBridgeURL + "#" + escape([targetOrigin, sourceToken, targetToken].join(","));
                        var sourceBridge;


                        sourceBridge = document.createElement("iframe");
                        sourceBridge.src = sourceBridgeURLwithHash;

                        
                        sourceBridge.style.position = "absolute";
                        sourceBridge.style.left = "-10px";
                        sourceBridge.style.top = "10px";
                        sourceBridge.style.visibility = "hidden";
                        sourceBridge.style.width = "0px";
                        sourceBridge.style.height = "0px";
                        document.body.appendChild(sourceBridge);
                        return;
                    }
                }
                setTimeout(initializeAsTargetIfNecessary, 20);
            }
            
            initializeAsTargetIfNecessary();
        }

        // proactively set the parent origin information on appropriately tagged iframes
        var tags = document.getElementsByTagName("meta");
        for(var i=0; i < tags.length; i++) {
            if (tags[i].name === "kaazing:postMessage") {
                if ("immediate" == tags[i].content) {
                    var checkAllIframes = function() {
                        var iframes = document.getElementsByTagName("iframe");
                        for (var i=0; i < iframes.length; i++) {
                            var iframe = iframes[i];
                            if (iframe.style["KaaPostMessage"] == "immediate") {
                                iframe.style["KaaPostMessage"] = "none";
                                var messagePipe = supplyIFrameMessagePipe(iframe);
                                bridgeIfNecessary(messagePipe, iframe.contentWindow);
                            }
                        }
                        setTimeout(checkAllIframes, 20);
                    };
                    setTimeout(checkAllIframes, 20);
                }
                break;
            }
        }
        for(var i = 0; i < tags.length; i++) {
            if (tags[i].name === "kaazing:postMessagePrefix") {
                var newPrefix = tags[i].content;
                if (newPrefix != null && newPrefix.length > 0) {
                    if (newPrefix.charAt(0) != "/") {
                        newPrefix = "/" + newPrefix;
                    }
                    prefix = newPrefix;
                }
            }
        }
        
        setTimeout(pollReaders, 20);

        // return postMessage0 for non-native postMessage
        return postMessage0;
    }
})();

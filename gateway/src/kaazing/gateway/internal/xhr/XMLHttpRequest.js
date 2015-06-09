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
var XMLHttpRequest0 = (function () {
    //
    // The emulation of cross-origin XMLHttpRequest uses postMessage.
    //

    // IE6 cannot access window.location after document.domain is assigned, use document.URL instead
    var locationURI = new URI((browser == "ie") ? document.URL : location.href);
    var defaultPorts = {"http": 80, "https": 443};
    if (locationURI.port == null) {
        locationURI.port = defaultPorts[locationURI.scheme];
        locationURI.authority = locationURI.host + ":" + locationURI.port;
    }

    function onreadystatechange($this) {
        if (typeof($this.onreadystatechange) !== "undefined") {
            $this.onreadystatechange();
        }
    }

    function onprogress($this) {
        if (typeof($this.onprogress) !== "undefined") {
            $this.onprogress();
        }
    }

    function onerror($this) {
        if (typeof($this.onerror) !== "undefined") {
            $this.onerror();
        }
    }

    function onload($this) {
        if (typeof($this.onload) !== "undefined") {
            $this.onload();
        }
    }

    /**
     * Creates a new XMLHttpRequest0 instance.
     *
     * @constructor
     * @name XMLHttpRequest0
     *
     * @class  XMLHttpRequest0 emulates cross-origin XMLHttpRequest.
     * @ignore
     */
    function XMLHttpRequest0() {
        this._requestHeaders = [];
        this.responseHeaders = {};
        this.withCredentials = false;
    }

    var $prototype = XMLHttpRequest0.prototype;

    /**
     * The readyState property specifies the current state of the request.
     *
     * @public
     * @field
     * @name readyState
     * @type int
     * @memberOf XMLHttpRequest0
     */
    $prototype.readyState = 0;

    /**
     * The responseText property specifies the response text of the request.
     *
     * @public
     * @field
     * @name responseText
     * @type String
     * @memberOf XMLHttpRequest0
     */
    $prototype.responseText = "";

    /**
     * The status property specifies the response status code of the request.
     *
     * @public
     * @field
     * @name status
     * @type int
     * @memberOf XMLHttpRequest0
     */
    $prototype.status = 0;

    /**
     * The statusText property specifies the response status text of the request.
     *
     * @public
     * @field
     * @name statusText
     * @type String
     * @memberOf XMLHttpRequest0
     */
    $prototype.statusText = "";

    /**
     * The timeout property specifies the timeout period for the initial request connection.
     *
     * @public
     * @field
     * @name timeout
     * @type int
     * @memberOf XMLHttpRequest0
     */
    $prototype.timeout = 0;

    /**
     * The onreadystatechange handler is called each time the responseState is updated.
     *
     * @public
     * @field
     * @name onreadystatechange
     * @type Function
     * @memberOf XMLHttpRequest0
     */
    $prototype.onreadystatechange;

    /**
     * The onerror handler is called when the request has an error.
     *
     * @public
     * @field
     * @name onerror
     * @type Function
     * @memberOf XMLHttpRequest0
     */
    $prototype.onerror;

    /**
     * The onload handler is called when the request has completed successfully.
     *
     * @public
     * @field
     * @name onload
     * @type Function
     * @memberOf XMLHttpRequest0
     */
    $prototype.onload;

    /**
     * The onprogress handler is called each time the responseText is updated.
     *
     * @public
     * @field
     * @name onprogress
     * @type Function
     * @memberOf XMLHttpRequest0
     */
    $prototype.onprogress;

    /**
     * The onredirectallowed handler is setup in the appropriate layer(WS or SSE)
     * above the transport based on whether the support for HTTP redirect policy
     * is present. This function is typically used to confirm whether the redirect
     * is allowed based on the specified policy.
     *
     * @public
     * @field
     * @name onredirectallowed
     * @type Function
     * @param originalLoc {String}
     * @param redirectLoc {String}
     * @return {boolean} true, if redirect is allowed; otherwise false
     * @memberOf XMLHttpRequest0
     */
    $prototype.onredirectallowed;

    /**
     * Opens the request.
     *
     * @param {String} method    the request method
     * @param {String} location  the request location
     * @param {boolean} async    whether or not the request is asynchronous
     *
     * @return {void}
     *
     * @public
     * @function
     * @name open
     * @memberOf XMLHttpRequest0
     */
    $prototype.open = function (method, location, async) {
        if (!async) {
            throw new Error("Asynchronous is required for cross-origin XMLHttpRequest emulation");
        }

        switch (this.readyState) {
            case 0:
            case 4:
                break;
            default:
                throw new Error("Invalid ready state");
        }

        var $this = this;
        this._method = method;
        this._location = location;
        this.readyState = 1;

        // reset properties
        // in case of reuse        
        this.status = 0;
        this.statusText = "";
        this.responseText = "";

        var xhr;
        var targetURI = new URI(location);
        if (targetURI.port == null) {
            targetURI.port = defaultPorts[targetURI.scheme];
            targetURI.authority = targetURI.host + ":" + targetURI.port;
        }
        if (browser == "ie" && typeof(XDomainRequest) !== "undefined" &&
            targetURI.scheme == locationURI.scheme && !this.withCredentials) {
            //use XDR?
            xhr = new XDRHttpDirect(this);

        }
        else if (targetURI.scheme == locationURI.scheme && targetURI.authority == locationURI.authority) {
            //same origin - use XMLHttpDirect
            try {
                xhr = new XMLHttpBridge(this);    // use XMLHttpDirect  new XMLHttpDirect(this);
            } catch (e) {
                xhr = new XMLHttpBridge(this);
            }
        }
        else {
            //use bridge
            xhr = new XMLHttpBridge(this);
        }

        xhr.onload = onload;
        xhr.onprogress = onprogress;
        xhr.onreadystatechange = onreadystatechange;
        xhr.onerror = onerror;
        xhr.open(method, location);

        this.xhr = xhr;
        setTimeout(function () {
            if ($this.readyState > 1) {
                return; // readystatechange already fired for readyState=2 or bigger vaue
            }
            if ($this.readyState < 1) {
                $this.readyState = 1; // opened
            }
            onreadystatechange($this);
        }, 0);
    }

    /**
     * Sets the request header.
     *
     * @param {String} label  the request header name
     * @param {String} value  the request header value
     *
     * @return {void}
     *
     * @public
     * @function
     * @name setRequestHeader
     * @memberOf XMLHttpRequest0
     */
    $prototype.setRequestHeader = function (label, value) {
        if (this.readyState !== 1) {
            throw new Error("Invalid ready state");
        }

        this._requestHeaders.push([label, value]);
    }

    /**
     * Sends the request payload.
     *
     * @param {String} payload  the request payload
     *
     * @return {void}
     *
     * @public
     * @function
     * @name send
     * @memberOf XMLHttpRequest0
     */
    $prototype.send = function (payload) {
        if (this.readyState !== 1) {
            throw new Error("Invalid ready state");
        }

        // allow handler to be assigned after open completes
        var $this = this;
        setTimeout(function () {
            if ($this.readyState > 2) {
                return; // readystatechange already fired for readyState=2
            }
            if ($this.readyState < 2) {
                $this.readyState = 2;
            }
            onreadystatechange($this);
        }, 0);

        this.xhr.send(payload);
    }

    /**
     * Aborts the request.
     *
     * @return {void}
     *
     * @public
     * @function
     * @name abort
     * @memberOf XMLHttpRequest0
     */
    $prototype.abort = function () {
        this.xhr.abort();
    }

    /**
     * Returns the response header.
     *
     * @param {String} label  the response header name
     *
     * @return {String}  the response header value
     *
     * @public
     * @function
     * @name getResponseHeader
     * @memberOf XMLHttpRequest0
     */
    $prototype.getResponseHeader = function (label) {
        if (this.status == 0) {
            throw new Error("Invalid ready state");
        }

        var headers = this._responseHeaders;
        if (headers) {
            return headers[label];
        }
        else {
            return null;
        }
    }

    /**
     * Returns the response header.
     *
     * @return {String}  all response header values
     *
     * @public
     * @function
     * @name getAllResponseHeaders
     * @memberOf XMLHttpRequest0
     */
    $prototype.getAllResponseHeaders = function () {
        if (this.status == 0) {
            throw new Error("Invalid ready state");
        }

        return this._responseHeaders;
    }

    return XMLHttpRequest0;
})();
    
    
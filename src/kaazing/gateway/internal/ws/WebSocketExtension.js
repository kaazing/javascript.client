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
  Creates a new WebSocketExtension instance.

  @constructor
  @name  WebSocketExtension
  @class WebSocketExtension represents an extension as defined by RFC-6455 that 
         the WebSocket clients and the WebSocket servers can negotiate during the
         handshake. An extension can have zero or more parameters.
*/
(function($module) {
    
    $module.WebSocketExtension = (function() {
        
        ;;;var CLASS_NAME = "WebSocketExtension";
        ;;;var LOG = Logger.getLogger(CLASS_NAME);
        
        var WebSocketExtension = function(name) {
            this.name = name;
            this.parameters = {};
            this.enabled = false;
            this.negotiated = false;
        }
    
        var $prototype = WebSocketExtension.prototype;

        /**
          Gets the value of the specified parameter from the list of registered parmeters. A null is
          returned if no parameter with the specified name has been registered for this extension. 
          
          @name getParameter
          @param name {String} parmaeter name
          @return {String}  the value of the parameter with the specified name

	      @public
   	      @function
          @memberOf WebSocketExtension
         */
        $prototype.getParameter = function(pname) {
            return this.parameters[pname];
        }

        /**
          Sets a parameter on the extension by specifying it's name and the value.
          
          @name setParameter
          @param pname {String} parmaeter name
          @param pvalue {String} parmaeter value
          @return {void}

	      @public
   	      @function
          @memberOf WebSocketExtension
         */
        $prototype.setParameter = function(pname, pvalue) {
            this.parameters[pname] = pvalue;
        }

        /**
          Returns an array consisting of the names of all the parameters specified for the 
          extension. If no parameters are set, then an empty array is returned.
          
          @name getParameters
          @return {Array}  names of all the parameters

	      @public
   	      @function
          @memberOf WebSocketExtension
         */
	    $prototype.getParameters = function() {
            var arr = [];
            for(var name in this.parameters) {
                if (this.parameters.hasOwnProperty(name)) {
                    arr.push(name);
                }
            }
            return arr;
        }
    
        $prototype.parse = function(str) {
            var arr = str.split(";");
            if (arr[0] != this.name) {
                throw new Error("Error: name not match");
            }
            this.parameters = {};
            for(var i = 1; i < arr.length; i++) {
                var equalSign = arr[i].indexOf("=");
                this.parameters[arr[i].subString(0, equalSign)] = arr[i].substring(equalSign+1);
            }
        }

        /**
          Returns string representation of the extension and it's parameters as per RFC 2616.
          
          @name toString
          @return {String}  string representation of the extension

	      @public
   	      @function
          @memberOf WebSocketExtension
         */
        $prototype.toString = function() {
            var arr = [this.name];
            for(var p in this.parameters) {
                if (this.parameters.hasOwnProperty(p)) {
                    arr.push(p.name + "=" + this.parameters[p]);
                }
            }
            return arr.join(";");
        }
        return WebSocketExtension;
    })();
})(Kaazing.Gateway);

// This will help the rest of the code within the closure to access WebSocketExtension by a 
// straight variable name instead of using $module.WebSocketExtension
var WebSocketExtension = Kaazing.Gateway.WebSocketExtension;

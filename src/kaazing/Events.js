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

switch (browser) {
case 'ie':
(function(){
    if (document.createEvent === undefined) {
	    var Event = function() {};
	    
	    Event.prototype.initEvent = function(eventType, canBubble, cancelable) {
	        this.type = eventType;
	        this.bubbles = canBubble;
	        this.cancelable = cancelable;
	    };
	
	    document.createEvent = function(eventName) {
	        if (eventName != "Events") {
	           throw new Error("Unsupported event name: " + eventName);
	        }
	        return new Event();
	    };
	}
    
	document._w_3_c_d_o_m_e_v_e_n_t_s_createElement = document.createElement;
	document.createElement = function(name) {
	
	    var element = this._w_3_c_d_o_m_e_v_e_n_t_s_createElement(name);
	
	    if (element.addEventListener === undefined) {
		    var allListeners = {};
		    element.addEventListener = function(name, listener, capture) { element.attachEvent("on" + name, listener); return addEventListener(allListeners, name, listener, capture); };
		    element.removeEventListener = function(name, listener, capture) { return removeEventListener(allListeners, name, listener, capture); };
		    element.dispatchEvent = function(event) { return dispatchEvent(allListeners, event); };
		}
	    
	    return element;
	};
	
    if (window.addEventListener === undefined) {
    	// Note: fireEvent does not support custom events
    	//       use an orphan router element instead
    	var router = document.createElement("div");
    	var routeMessage = (typeof(postMessage) === "undefined");
    	
        window.addEventListener = function(name, listener, capture) {
        	if (routeMessage && name == "message") {
        		router.addEventListener(name, listener, capture);
        	}
        	else {
	        	window.attachEvent("on" + name, listener);
	       	} 
       	};
        window.removeEventListener = function(name, listener, capture) { 
        	if (routeMessage && name == "message") {
        		router.removeEventListener(name, listener, capture);
        	}
        	else {
	        	window.detachEvent("on" + name, listener);
	       	} 
        };
        window.dispatchEvent = function(event) {
        	if (routeMessage && event.type == "message") {
        		router.dispatchEvent(event);
        	}
        	else {
        		window.fireEvent("on" + event.type, event);
        	} 
        };
    }
        
	function addEventListener(allListeners, name, listener, capture) {
	  if (capture) {
	    throw new Error("Not implemented");
	  }
	  var listeners = allListeners[name] || {};
	  allListeners[name] = listeners;
	  listeners[listener] = listener;
	}
	
	function removeEventListener(allListeners, name, listener, capture) {
	  if (capture) {
	    throw new Error("Not implemented");
	  }
	  var listeners = allListeners[name] || {};
	  delete listeners[listener];
	}
	
	function dispatchEvent(allListeners, event) {
	  var name = event.type;
	  var listeners = allListeners[name] || {};
	  for (var key in listeners) {
	      if (listeners.hasOwnProperty(key) && typeof(listeners[key]) == "function") {
                try {
                    listeners[key](event);
                }
                catch (e) {
                    // avoid letting listener exceptions
                    // prevent other listeners from firing
                }
	      }
	  }
	}
})();
break;
case 'chrome':
case 'android':
case 'safari':
	if (typeof(window.postMessage) === "undefined" && typeof(window.dispatchEvent) === "undefined" && typeof(document.dispatchEvent) === "function") {
	    window.dispatchEvent = function(event) {
	   		document.dispatchEvent(event);
	    };
		var addEventListener0 = window.addEventListener;
		window.addEventListener = function(type, listener, capture) {
			if (type === "message") {
			  document.addEventListener(type, listener, capture);
			}
			else {
			  addEventListener0.call(window, type, listener, capture);
			}
		}
		var removeEventListener0 = window.removeEventListener;
		window.removeEventListener = function(type, listener, capture) {
			if (type === "message") {
			  document.removeEventListener(type, listener, capture);
			}
			else {
			  removeEventListener0.call(window, type, listener, capture);
			}
		}
	}
	break;
case 'opera':
	var addEventListener0 = window.addEventListener;
	window.addEventListener = function(type, listener, capture) {
		var listener0 = listener;
		if (type === "message") {
			listener0 = function(event) {
				if (event.origin === undefined && event.uri !== undefined) {
					var uri = new URI(event.uri);
					delete uri.path;
					delete uri.query;
					delete uri.fragment;
					event.origin = uri.toString();
				}
				return listener(event);
			};
			listener._$ = listener0;
		}
		addEventListener0.call(window, type, listener0, capture);
	}

	var removeEventListener0 = window.removeEventListener;
	window.removeEventListener = function(type, listener, capture) {
		var listener0 = listener;
		if (type === "message") {
		  	listener0 = listener._$;
		}
		removeEventListener0.call(window, type, listener0, capture);
	}
	break;
}

/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

/**
 * Base class for classes that dispatch event.
 *
 *
 * @constructor
 *
 * @class  EventDispatcher implements the observer pattern.
 *
 */
var EventDispatcher = function() {

}

;(function($module) {
var $prototype = EventDispatcher.prototype;

$prototype._initEventDispatcher = function() {
    this._eventListeners = {};
}

/**
 * Adds an event listener for the specified type.
 *
 * @param {String}            type      the event type
 *<p>
 * @param {Function}            listener      the listener
 *<p>
 * @return {void}
 *
 * @public
 * @function
 * @name addEventListener
 * @memberOf EventDispatcher#
 */
$prototype.addEventListener = function(type, listener) {
    var listeners = this._eventListeners[type];
    if (listeners) {
        listeners.push(listener);
    } else {
        this._eventListeners[type] = [listener];
    }
}

/**
 * Removes the specified event listener.
 *
 * @param {String}            type      the event type
 *<p>
 * @param {Function}            listener      the listener
 *<p>
 *
 * @return {void}
 *
 * @public
 * @function
 * @name removeEventListener
 * @memberOf EventDispatcher#
 */
$prototype.removeEventListener = function(type, listener) {
    var listeners = this._eventListeners[type];
    if (listeners) {
        var newListeners = [];
        for (var i=0; i<listeners.length; i++) {
            if (listeners[i] !== listener) {
                newListeners.push(listeners[i]);
            }
        }
        this._eventListeners[type] = new Listeners
    }
}

/**
 * Returns true if the event type has at least one listener associated with it.
 *
 * @param {String}            type      the event type
 *
 * @return {Boolean}
 *
 * @public
 * @function
 * @name hasEventListener
 * @memberOf EventDispatcher#
 */
$prototype.hasEventListener = function(type) {
    var listeners = this._eventListeners[type];
    return Boolean(listeners);
}

/**
 * Dispatches an event.
 *
 * @return {void}
 *
 * @public
 * @function
 * @name dispatchEvent
 * @memberOf EventDispatcher#
 */
$prototype.dispatchEvent = function(e) {
    var listeners = this._eventListeners[e.type];
    // if there are any listeners registered for this event type
    if (listeners) {
        for (var i=0; i<listeners.length; i++) {
            listeners[i](e);
        }
    }

    // also fire callback property
    if (this["on" + e.type]) {
        this["on" + e.type](e);    
    }
}

$module.EventDispatcher = EventDispatcher;
// end module closure
})(window || Kaazing.AMQP);


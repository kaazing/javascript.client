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
 * Abstract class AsycClient.
 *
 * @constructor
 *
 * @class  AsyncClient provides base structure and functionality for asynchronous network clients
 *
 * @abstract
 * @private
 *
 */

/*
How to use AsyncClient to develop networking clients
    - register states and transition rules
    - feed input
    - enqueue actions



== I/O ==
How to send and receive data and interact with the lower layer. This is usually
(but not necessarily) a socket. The lower layer might be a network service or
another logical layer within a protocol implementation. For instance AMQP can be
implemented with two AsycClients. AMQP requires state in both the Connection
and Channel layers. The Connection is an asynchronous client which uses a socket
for I/O. Channels are asynchronous clients that use the Connection for I/O.

=== Sending ===

=== Handling Read Events ===



== API ==

=== Raising Events ===

=== Chaining blocking commands ===
AsyncClient is designed to facilitate chained interaction. Public methods should
return 'this' so that several can be called in the same expression, like so:
    client.open().authenticate().getData().sendData().logout();



 *
 *
 */
var AsyncClient = function() {

};
;(function() {
AsyncClient.prototype = new EventDispatcher();
var _prototype = AsyncClient.prototype;

var nullCallable = function nullCallable(){};

var defaultErrorCallable = function defaultErrorCallable(ex) {
    throw ex;
};

//
_prototype._stateMachine = null;

// event dispatching
_prototype.onerror = function(e) {};

// promises?
_prototype._actions = [];

_prototype._processActions = function _processActions() {
    if (!this._actions.length) {
        return;
    }

    var action = this._actions[0];

        //console.info("current state!", this._stateMachine.currentState);
        var movedSuccessfully = this._stateMachine.feedInput(action.actionName + "Action", action);

        if (movedSuccessfully) {
            var context = this;
            setTimeout( function() {
                try {
                    // FIXME: return value is actually a network return value
                    action.func.apply(context, action.args);

                } catch (ex1) {
                    action.error(ex1);
                }
            }, 0);

            // dequeue a successfully processed action
            this._actions.shift();
        };

};

_prototype._enqueueAction = function _enqueueAction(actionName, func, args, continuation, error) {
    var action = {};
    action.actionName = actionName || "";
    action.func = func || nullCallable;
    action.args = args || null;
    action.continuation = continuation || nullCallable;
    action.error = error || defaultErrorCallable;

    this._actions.push(action);

    var context = this;
    var func = function(){context._processActions();};
    setTimeout(func,0);
};

_prototype._initAsyncClient = function() {
    this._initEventDispatcher();
    this._stateMachine = new StateMachine(this);
    this._actions = [];

    // input/output
    this._buffer = null;
    this._socket = null;
}

_prototype._send = null;
_prototype._readHandler = null;

// end module closure
})();

/**
 * Copyright (c) 2007-2013, Kaazing Corporation. All rights reserved.
 */


/**
 * <b>Application developers should use AmqpClientFactory.createAmqpClient() 
 * function to create an instance of AmqpClient.</b>
 *
 * AmqpClient is used to connect to the end-point that handles AMQP 0-9-1
 * protocol over WebSocket.
 *
 * @constructor
 * @param factory {AmqpClientFactory} factory used to create AmqpClient instance
 *
 * @class  AmqpClient models the CONNECTION class defined in AMQP 0-9-1 protocol
 * by abstracting the methods defined in the protocol and exposing a far simpler 
 * API. <b>Application developers should use 
 * <code>AmqpClientFactory#createAmqpClient()</code> function to create an 
 * instance of AmqpClient.</b>
 *
 */


AmqpClient.prototype = new AsyncClient();
var _prototype = AmqpClient.prototype;

_prototype.CLOSED = 0;
_prototype.OPEN = 1;
_prototype.CONNECTING = 2;

_prototype.getReadyState = function() { return this._readyState; };

_prototype.setReadyState = function(state) {
    this._readyState = state;    
};

/**
 * The onopen handler is called when the connection opens.
 *
 * @param {AmqpEvent} e  the event
 *
 * @public
 * @field
 * @type Function
 * @name onopen
 * @memberOf AmqpClient#
 */
_prototype.onopen = function(e) {};

/**
 * The onclose handler is called when the connection closes.
 *
 * @param {AmqpEvent} e  the event
 *
 * @public
 * @field
 * @type Function
 * @name onclose
 * @memberOf AmqpClient#
 */
_prototype.onclose = function(e) {};

/**
 * The onerror handler is called when the ..
 *
 * @param {AmqpEvent} e  the event
 *
 * @public
 * @field
 * @type Function
 * @name onerror
 * @memberOf AmqpClient#
 */
_prototype.onerror = function(e) {};

var _assert = function(condition, message) {
    if (!condition) {
        throw(new Error(message));
    }
};


/**
 * _init sets up the client's state
 * @private
 */
_prototype._init = function() {
    this._initAsyncClient();
    this._buffer = new AmqpBuffer();
    this._channels = {};
    this._channelCount = 0;

    // Setup state machine
    this._stateMachine.addState("handshaking", 
        [
            {"inputs": ["startConnectionFrame"], "targetState": "starting"},
            {"inputs": ["closeConnectionFrame"], "targetState": "closing"}
        ], handshakeStartHandler);

    this._stateMachine.addState("starting",
        [
            {"inputs": ["startOkConnectionAction"], "targetState": "started"}
        ], startingHandler);

    this._stateMachine.addState("started",
        [
            {"inputs": ["tuneConnectionFrame"], "targetState": "tuning"}
        ]);

    this._stateMachine.addState("tuning",
        [
            {"inputs": ["tuneOkConnectionAction"], "targetState": "tuned"}
        ], tuneConnectionHandler, advanceActionsHandler);

    this._stateMachine.addState("tuned",
        [
            {"inputs": ["openConnectionAction"], "targetState": "opening"}
        ]);

    this._stateMachine.addState("opening",
        [
            {"inputs": ["openOkConnectionFrame"], "targetState": "ready"}
        ], registerSynchronousRequest, genericResponseHandler);

    this._stateMachine.addState("ready",
        [
            // inputs that renter the idling/ready state
            // these are (probably) all frames intended for channels
            {"inputs": [                        
                         // channel management
                         "openOkChannelFrame",
                         "closeChannelFrame",
                         "closeOkChannelFrame",

                         "flowOkChannelFrame",
                         "flowChannelFrame",

                         // queues and exchanges
                         "declareOkExchangeFrame",
                         "declareOkQueueFrame",
                         "bindOkQueueFrame",
                         "unbindOkQueueFrame",
                         "deleteOkQueueFrame",
                         "deleteOkExchangeFrame",

                         // transactions
                         "commitOkTxFrame",
                         "rollbackOkTxFrame",
                         "selectOkTxFrame",

                         // browsing
                         "purgeOkQueueFrame",
                         "cancelOkBasicFrame",
                         "getOkBasicFrame",
                         "getEmptyBasicFrame",
                         "consumeOkBasicFrame",
                         "recoverOkBasicFrame",
                         "rejectOkBasicFrame",


                        // async message delivery:
                        "deliverBasicFrame",
                        "bodyFrame",
                        "headerFrame"


                        ], "targetState": "ready"},
            {"inputs": ["closeConnectionFrame",
                        "closeConnectionAction"

                        ], "targetState": "closing"}
            

        ], idlingHandler);
    this._stateMachine.addState("closing", 
        [
            {"inputs": ["closeOkConnectionFrame", "closeOkConnectionAction"], "targetState": "closed"}
        ], genericResponseHandler, null);
    this._stateMachine.addState("closed", [], closedHandler, null);
};



// 'A', 'M', 'Q', "P', 0, 0, 9, 1
// But, to talk to rabbit, use this instead : 'A', 'M', 'Q', "P', 1, 1, 8, 0
// But, to talk to openamq, use this instead : 'A', 'M', 'Q', "P', 0, 0, 9, 1
// But, to talk to qpid, use this instead : 'A', 'M', 'Q', "P', 1, 1, 0, 9
// true for the latest releases as of may 20, 09
var _protocolHeaders = {"0-9-1" : [65, 77, 81, 80, 0, 0, 9, 1] };

/*
 * Connects to the AMQP broker at the given URL with given credentials
 *
 * @param {String}     url            Location of AMQP broker
 * @param {String}     virtualHost    Name of the virtual host
 * @param {Object|Key} credentials    Login credentials or Key
 * @param {Function}   callback       Function to be called on success
 * @return {void}
 *
 * @private
 * @function
 * @name connect
 * @memberOf AmqpClient#
 */
_prototype.connect = function connect(url, virtualHost, credentials, callback) {
    if (this._socket) {
        throw(new Error("AmqpClient already connected."));
    }

    // url might be a String or an Array of Strings
    var url0;
    if (typeof(url) === "string") {
        url0 = [url]
    } else {
        url0 = url;
    }

    //this._readyState = this.CONNECTING;
    this.setReadyState(this.CONNECTING);

    var args = {
        "url":url0[0],
        "virtualHost":virtualHost,
        "credentials":credentials
    };

    this._openContinuation = callback;
    // this._openErrorCb = error;
    this._hasNegotiated = false;

    _reconnect(this, url0[0], virtualHost, credentials);
};

/**
 * Connects to the AMQP broker at the given URL with given credentials using
 * Configuration style API with named parameters/properties.
 * 
 * <p> For example, the developers should use this function as shown below:
 * <pre>
 *   var client = new AmqpClient();
 *   var config = {url: 'ws://localhost:8001/amqp',
 *                 virtualHost: '/',
 *                 credentials: {username: 'guest', password: 'guest'}
 *                };
 *   client.connect(config, openHandler);
 * </pre>
 * 
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           url: 'url_str_value', 
 *                           virtualHost: 'vh_str_value', 
 *                           credentials: {username: 'uname_str_value', 
 *                                         password: 'passwd_str_value'}
 *                         }
 *                        </pre>
 *  
 *  Note that 'url', 'virtualHost' and 'credentials' are required properties
 *  and valid values must be passed in. A JavaScript error is thrown if the
 *  aforementioned arguments are undefined, null, or empty string.
 * <p>
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * @return {void}
 * @public
 * @function
 * @name connect
 * @memberOf AmqpClient#
 */
var clientConnFunc = _prototype.connect;
_prototype.connect = function(config, callback) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var url = myConfig.url;
       var virtualHost = myConfig.virtualHost;
       var credentials = myConfig.credentials;
       
       if (!url || typeof url != 'string') {
           throw new Error("AmqpClient.connect(): Parameter \'url\' is required");
       }
       
       if (!virtualHost || typeof url != 'string')
       {
           throw new Error("AmqpClient.connect(): Parameter \'virtualHost\' is required");
       }

       if (!credentials                            || 
           !credentials.username                   || 
           !credentials.password                   ||
           typeof credentials.username != 'string' ||
           typeof credentials.password != 'string')
       {
           throw new Error("AmqpClient.connect(): credentials are required");
       }

       clientConnFunc.call(this, url, virtualHost, credentials, callback);
   }
   else {
       clientConnFunc.apply(this, arguments);
   }
};

/**
 * Disconnect from the AMQP broker.
 * @return {void}
 *
 * @public
 * @function
 * @name disconnect 
 * @memberOf AmqpClient#
 */
_prototype.disconnect = function disconnect() {
    if (this.getReadyState() == this.OPEN) {
        closeConnection(this, 0, "", 0, 0)
    }

    if(this.getReadyState() == this.CONNECTING) {
        this.setReadyState(this.CLOSED);
        var frame = {};
        frame.methodName = "closeConnection";
        frame.type = "closeConnection";
        frame.args = "";
        var e = new AmqpEvent(this, frame);        
        this.dispatchEvent(e);
    }
};

/**
 * Opens an AMQP Channel
 *
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name openChannel
 * @memberOf AmqpClient#
 */
_prototype.openChannel = function openChannel(callback) {
    //log2("calling openChannel on ", this);  

    var id = ++this._channelCount;
    var channel = new $module.AmqpChannel();
    initChannel(channel, id, this, callback);
    this._channels[id] = channel;
    return channel;
};

/**
 * Returns the AmqpClientFactory that was used to create AmqpClient.
 * 
 * @return {AmqpClientFactory}
 *
 * @public
 * @function
 * @name getAmqpClientFactory
 * @memberOf AmqpClient#
 */
_prototype.getAmqpClientFactory = function getAmqpClientFactory(callback) {
    return (this._amqpClientFactory || null);
}


////////////////////////////////////////////////////////////////////////////////
// Socket IO
//
////////////////////////////////////////////////////////////////////////////////


var _socketOpenHandler = function (client) {
    var header = new $rootModule.ByteBuffer(_protocolHeaders["0-9-1"]);
    var buf = header;

    if ((typeof(ArrayBuffer) !== "undefined") && 
        (client._socket.binaryType == "arraybuffer")) {
        buf = header.getArrayBuffer(header.remaining());
    }
    client._socket.send(buf);
};

var _socketCloseHandler = function(client) {
    closedHandler(client);
};


var compareStringToBuffer = function (s, b) {
    if (b.remaining() < s.length) {
        return false;
    } else {
        var lim = b.limit;
        b.limit = s.length;
        var bufferString = b.getString($rootModule.Charset.UTF8);
        b.limit = lim;

        return s === bufferString;
    }
}

var _socketMessageHandler = function(client, e) {
    // question: why is skipping, flipping not working w/amqpbuffer?
    var bytebuf = e.data;

    if ((typeof(ArrayBuffer) !== "undefined") && 
        (client._socket.binaryType == "arraybuffer")) {
        bytebuf = decodeArrayBuffer2ByteBuffer(e.data);
    }

    var buf = client._buffer;
    buf.mark();
    buf.position = buf.limit;
    buf.putBuffer(bytebuf);
    buf.reset();

    if (!client._hasNegotiated && buf.remaining() > 7) {
        if (compareStringToBuffer("AMQP", buf)) {
            var serverVersion = [buf.get(), buf.get(), buf.get(), buf.get()];

            var protocolNegotiationFrame = {"args":[
                {
                    "name" : "replyText",
                    "value" : "Server does not support AMQP protocol versions after " + serverVersion[2] + "-" + serverVersion[3]
                }
            ], "methodName":"closeOkConnection"}

            var errFrame = {};
            errFrame.methodName = "error";
            errFrame.args = protocolNegotiationFrame.args;
            client.dispatchEvent(new AmqpEvent(client, errFrame));

            closedHandler(client, "", protocolNegotiationFrame);
            return;
        } else {
            buf.reset();
            client._hasNegotiated = true;
        }
    }

    var frame = null;
    while (frame = buf.getFrame()) {
        var f = frame;
        client._stateMachine.feedInput(f.methodName + "Frame", f);
    }

    buf.compact();
};

var _sendFrame = function (client, buffer) {
    var buf = buffer;

    if ((typeof(ArrayBuffer) !== "undefined") && 
        (client._socket.binaryType == "arraybuffer")) {
        buf = buffer.getArrayBuffer(buffer.remaining());
    }

    client._socket.send(buf);
};

var _write = function write(client, amqpMethod, channel, args) {
    var buf = new AmqpBuffer();
    //log2("_write", client, amqpMethod, channel, args);
    var classIndex = amqpMethod.classIndex;

    buf.putMethodFrame(amqpMethod, channel, args);

    buf.flip();
    //log2("sending with buffer", buf.getHexDump());
    _sendFrame(client, buf);
};


////////////////////////////////////////////////////////////////////////////////
// State Behavior
//
////////////////////////////////////////////////////////////////////////////////
var handshakeStartHandler = function handshakeStartHandler(connection, input, args, stateName) {
    // Setup IO handlers
    var socket = null;

    if (connection._amqpClientFactory) {
         var wsFactory = connection._amqpClientFactory.getWebSocketFactory();
         if (wsFactory) {
             // Use Kaazing's WebSocket implementation.
             socket = wsFactory.createWebSocket(args.url);
         }
    }

    if (socket == null) {
        // Use browser's WebSocket implementation.
    	if (typeof(WebSocket) !== "undefined") {
            socket = new WebSocket(args.url);
    	}
    	else {
    		throw new Error("Browser does not support WebSocket.");
    	}
    }

    if (typeof(ArrayBuffer) === "undefined") {
        // If an older browser is being used that does not support ArrayBuffer,
        // then set "bytebuffer" as the binaryType. This implies using Kaazing's
        // WebSocket implementation.
        socket.binaryType = "bytebuffer";
    }
    else {
        // If ArrayBuffer is available/supported, then set "bytebuffer" as the 
        // binaryType. This will optionally allow us to use browser's WebSocket 
        // implementation without relying on Kaazing's WebSocket implementation.
        socket.binaryType = "arraybuffer";
    }

    socket.onopen = function() { _socketOpenHandler(connection); };
    socket.onclose = function() { _socketCloseHandler(connection); };
    socket.onmessage = function(e) { _socketMessageHandler(connection, e); };
    connection._socket = socket;

    // other state
    connection._virtualHost = args.virtualHost;
    connection._credentialsOrKey = args.credentials;
};

// declare startOkConnection early so we can use it in startingHandler
var startOkConnection = null;

var startingHandler = function(client, input, frame) {
    _assert((frame.channel === 0), _constants.UNEXPECTED_FRAME.message);
    var buf = new AmqpBuffer();

    // Respond with startOk
    var clientProperties = new AmqpArguments();
    clientProperties.addLongString("library", "KaazingAmqpClient");
    clientProperties.addLongString("library_version", "5.0.0");
    clientProperties.addLongString("library_platform", "JavaScript");

    // TODO locale setting (probably system-wide, like Kaazing.locale)
    var locale = client._locale || "en_US";
    var mechanism = "AMQPLAIN";

    var credentialsOrKey = client._credentialsOrKey

    if (typeof(credentialsOrKey.resolve) != "function") {
        var response = _encodeAuthAmqPlain(credentialsOrKey.username, credentialsOrKey.password);
        startOkConnection(client, clientProperties, mechanism, response, locale);
    }
    else {
        credentialsOrKey.resolve(function(credentials) {
            var response = _encodeAuthAmqPlain(credentials.username, credentials.password);
            startOkConnection(client, clientProperties, mechanism, response, locale);
        });
    }
};


/**
 * tuneConnectionHandler responds to the server's tuneConnection frame and also
 *      sends the open frame.
 *
 *  At this stage it is legal to set lower values for any of the connection 
 *      options sent by the server.
 * @private
 */
var tuneConnectionHandler = function(client, input, frame) {
    _assert((frame.channel === 0), _constants.UNEXPECTED_FRAME.message);
    // TODO tune connection with platform appropriate limits
    // This is where we can prevent the server from sending 10gB frames to
    //      JavaScript clients.

    var channelMax = frame.args[0].value;
    var frameMax = frame.args[1].value;
    var heartbeat = 0;  // (server asks for heartbeat=frame.args[2].value)
                        // ...we respond by asking for no heartbeat

    tuneOkConnection(client, channelMax,frameMax,heartbeat);
    openConnection(client, client._virtualHost, client._openContinuation, client._openErrorCb);
}

var genericResponseHandler = function genericResponseHandler(clientOrChannel, input, frame) {
    if (frame) {
        if (frame.actionName && (frame.actionName == "closeConnection")) {
            return;
        }
    }

    if (input === "nowaitAction") {
        clientOrChannel._waitingAction = null;
        return;
    }
    
    var client = {};
    if (!client._connection) {
        client = clientOrChannel;
    }
    else {
        client = clientOrChannel._connection; 
    }

    var e = new AmqpEvent(clientOrChannel, frame);

    // Return result in two styles 1) continuation 2) event dispatch
    if (clientOrChannel._waitingAction) {
        if (input === "closeChannelFrame") {
            clientOrChannel._waitingAction.error(e);
        } 
        else if (frame.methodName == "closeConnection") {
            // The broker is closing the connection. This might be due to an
            // application error. So, we will fire the error event.
            var errFrame = {};
            errFrame.methodName = "error";
            errFrame.args = frame.args;
            client.dispatchEvent(new AmqpEvent(client, errFrame));

            // And, when we close the WebSocket, we will be notified
            // when the socket is really closed via socketClosedHandler()
            // in which we can fire the close event.
            closedHandler(client, "", frame);
            return;
        }
        else {            
            if (frame.methodName == "openOkConnection") {
                client.setReadyState(client.OPEN);
            }
            else {
                clientOrChannel._waitingAction.continuation(e);
            }
        }

        // clientOrChannel._waitingAction = null;
    }
    else {
        throw(new Error("AmqpClient not in waiting state: protocol violation")); 
    }

    clientOrChannel.dispatchEvent(e);
    if (frame.methodName == "openOkConnection") {
        client._openContinuation();
    }
}

/**
 * advanceActionsHandler is a behavior that causes the client's wait queue
 * to attempt to advance.
 *
 * @private
 */
var advanceActionsHandler = function advanceActionsHandler(client, input, frame) {
    var context = client;
    setTimeout(function(){
        context._processActions();
    },0);
}

/**
 * idlingHandler is called when the amqp client enters or reenters
 * the ready state.
 *
 * @private
 */
var idlingHandler = function openHandler (client, input, frame) {
    // rules
    if (frame.channel === 0) {

    } else if (client._channels[frame.channel]) {
        // dispatch frame to the channel's io layer
        var channel = client._channels[frame.channel];
        _channelReadHandler(channel, input, frame);
    } else {
        // error and close connection
    }
};

var closingHandler = function closingHandler (context, input, frame) {
};

var closedHandler = function closedHandler (context, input, frame) {
    if( !(context.getReadyState() == context.CLOSED) )
    {
        // dispatch close event
        var e;
        if (typeof(frame) === "undefined") {
            e = new AmqpEvent(context, {"args":[], "methodName":"closeOkConnection"});
        } else {
            frame.methodName = "closeOkConnection";
            e = new AmqpEvent(context, frame);
        }
        context.dispatchEvent(e);
        context.setReadyState(context.CLOSED);

        if (typeof(context._channels) !== "undefined") {
            // dispatch close event on each channel
            for (var i in context._channels) {
                var channel = context._channels[i];
                channel.dispatchEvent(e);
            }
        }
    }

    // close socket without the previously registered socket.onclose firing
    context._socket.onclose = function() {};
    if (context._socket.readyState == 0 || context._socket.readyState == 1) {
        //close the socket if is OPEN
        context._socket.close();
    }

    // call connection error cb
    if (typeof(context._openErrorCb) !== "undefined") {
        context._openErrorCb(e);
    }
};

function _reconnect(context, url, virtualHost, credentials) {
    var args = {"url":url,"virtualHost":virtualHost,"credentials":credentials};
    context._stateMachine.enterState("handshaking", "", args);
};


var initChannel = function initChannel(channel, id, connection, cb) {
    channel._id = id;
    // channel._callbacks = {};
    channel._callbacks = cb;
    channel._connection = connection;

    // transaction state
    channel._transacted = false;
    // action for which the client is waiting to get a response
    channel._waitingAction = null;

    channel._initAsyncClient();

    channel._stateMachine.addState("channelReady",
        [
            // transition to a waiting state (synchronous requests)
            {"inputs": [
                         "openChannelAction",
                         "closeChannelAction",

                         "consumeBasicAction",
                         "flowChannelAction",

                         "declareExchangeAction",
                         "declareQueueAction",
                         "bindQueueAction",
                         "unbindQueueAction",
                         "deleteQueueAction",
                         "deleteExchangeAction",
                         "purgeQueueAction",
                         "cancelBasicAction",

                         "recoverBasicAction",
                         "rejectBasicAction",


                         "selectTxAction",
                         "commitTxAction",
                         "rollbackTxAction",


                        ], "targetState": "waiting"},

            // perform asychronous action and stay in the ready state
            {"inputs": ["publishBasicAction",
                        "ackBasicAction"
                        ], "targetState" : "channelReady"},

            // start getting a single message
            {"inputs": ["getBasicAction"
                        ], "targetState" : "getting"},


            // start reading a delivered message
            {"inputs": ["deliverBasicFrame"
                        ], "targetState" : "readingContentHeader"}
  

        ], advanceActionsHandler);

    channel._stateMachine.addState("getting",
        [
            {"inputs": ["getOkBasicFrame"
                        ], "targetState": "readingContentHeader"},

            {"inputs": ["getEmptyBasicFrame"
                        ], "targetState": "channelReady"},

            {"inputs": ["closeChannelFrame"
                        ], "targetState": "closing"}

        ], registerSynchronousRequest, getEmptyResponseHandler);


    channel._stateMachine.addState("waiting",
        [
            // return from a waiting state (synchronous responses);
            {"inputs": [
                         // channel management
                         "openOkChannelFrame",
                         "closeOkChannelFrame",                         

                         "flowOkChannelFrame",

                         // queues and exchanges
                         "declareOkExchangeFrame",
                         "declareOkQueueFrame",
                         "bindOkQueueFrame",
                         "unbindOkQueueFrame",
                         "deleteOkQueueFrame",
                         "deleteOkExchangeFrame",
                         "purgeOkQueueFrame",
                         "cancelOkBasicFrame",
                         "recoverOkBasicFrame",
                         "rejectOkBasicFrame",


                         // transactions
                         "commitOkTxFrame",
                         "rollbackOkTxFrame",
                         "selectOkTxFrame",

                         // browsing
                         "getOkBasicFrame",
                         "getEmptyBasicFrame",
                         "consumeOkBasicFrame",

                         // sometimes (nowait) we don't want to return anything
                        "nowaitAction"
                         
                        ], "targetState": "channelReady"},

            {"inputs": ["closeChannelFrame"
                        ], "targetState" : "closing"}


        ], registerSynchronousRequest, genericResponseHandler);

    channel._stateMachine.addState("readingContentHeader",
        [
            {"inputs": ["headerFrame"], "targetState": "readingContentBody"}
        ], deliveryHandler, contentHeaderHandler);

    channel._stateMachine.addState("readingContentBody",
        [
            {"inputs": ["bodyFrame"
                        ], "targetState": "channelReady"}
        ], null, messageBodyHandler);

    channel._stateMachine.addState("closing",
        [
            {"inputs": ["closeOkChannelAction"
                        ], "targetState": "closed"}
        ], null);
    channel._stateMachine.addState("closed", null, null);


    //channel._stateMachine.enterState("channelReady", "", null);
    if (connection.getReadyState() == connection.OPEN) {
        openChannel(channel, [cb]);
    }

};

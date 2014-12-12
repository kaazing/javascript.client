/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

/**
 * AmqpChannel
 *
 * @class  AmqpChannel is a channel opened with the AMQP broker. Use AmqpClient.openChannel() to create a new AmqpChannel.
 * @alias AmqpChannel
 * @constructor
 */
var AmqpChannel = function() {
}

AmqpChannel.prototype = new AsyncClient();
var _prototype = AmqpChannel.prototype;

_prototype._init = function(params) {
};

////////////////////////////////////////////////////////////////////////////////
// Channel IO
//
////////////////////////////////////////////////////////////////////////////////
var _channelWrite = function _channelWrite(channel, amqpMethod, channelId, args, body, headers) {
    var buf = new AmqpBuffer();
    var classIndex = amqpMethod.classIndex;

    buf.putMethodFrame(amqpMethod, channelId, args);

    if (amqpMethod.hasContent) {
        // weight is deprecated:
        // "The weight field is unused and must be zero"
        var weight = 0;

        buf.putHeaderFrame(channelId, classIndex, weight, body.remaining(), headers);

        // skip the body frame if there is a zero-length body
        if (body.remaining() > 0) {
            buf.putBodyFrame(channelId, body);
        }

    }

    buf.flip();
    //log2("sending with buffer", buf.getHexDump());
    _sendFrame(channel._connection, buf);

};

var _channelReadHandler = function _channelReadHandler(channel, input, frame) {
    if (frame) {
        var methodName = frame.methodName || "";
        if (methodName == "closeChannel") {
            var errFrame = {};
            errFrame.methodName = "error";
            errFrame.type = "error";
            errFrame.args = frame.args;
            
            channel.dispatchEvent(new AmqpEvent(channel, errFrame)); 
    
            channel.dispatchEvent(new AmqpEvent(channel, frame));
            return;
        }
    }  
    channel._stateMachine.feedInput(input, frame);
}

////////////////////////////////////////////////////////////////////////////////
// Channel state behaviors
//
////////////////////////////////////////////////////////////////////////////////

var messageBodyHandler = function messageBodyHandler(client, input, frame) {
    frame.args = client._headerFrame.args;
    frame.methodName = client._headerFrame.methodName;
    var e = new AmqpEvent(client, frame, client._headerFrame.contentProperties);

    if (frame.methodName === "getOkBasic") {
        client._waitingAction.continuation(e);
    }

    client.dispatchEvent(e);
}


var deliveryHandler = function deliveryHandler(client, input, frame) {
    client._headerFrame = frame;
}

var contentHeaderHandler = function contentHeaderHandler(client, input, frame) {
    client._headerFrame.contentProperties = frame.contentProperties;
}

var getEmptyResponseHandler = function (channel, input, frame) {
    var e = new AmqpEvent(channel, frame);

    // Return result in two styles 1) continuation 2) event dispatch
    if (channel._waitingAction) {

        // don't dispatch an event for successful get requests yet
        // the body needs to be read in in the next two states

        if (input === "closeChannelFrame") {
            channel._waitingAction.error(e);
            channel.dispatchEvent(e);
            channel._waitingAction = null;
        }
        else if (input === "getEmptyBasicFrame") {
            channel._waitingAction.continuation(e);
            channel.dispatchEvent(e);
            channel._waitingAction = null;
        }
    }
    else {
        throw new Error("AmqpClient not in waiting state: protocol violation");
    }
}


/**
 * registerSynchronousRequest puts the client into a waiting state that will
 * be able to call the continuation for a method that expects a particular
 * synchronous response
 *
 * This also lets us call the error cb when there is a close frame (which
 * AMQP uses to raise exceptions) with a reason why the last command failed.
 *
 * @private
 */
var registerSynchronousRequest = function registerSynchronousRequest(context, input, action) {

    // extract method from positional args (regrettable, but expedient)
    var method = action.args[1];
    if (method.synchronous) {

        context._waitingAction = action;
    } else {
        throw(new Error("AMQP: trying to enter wait state for method that is not sychronous"));
    }  

}

/**
 * property used to indicate current flow 
 * @private
 */
AmqpChannel.prototype.flowFlag = true;


/**
 * The message handler is called when a message is received.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onmessage
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onmessage = function(e) {};


/**
 * The close handler is called when the channel closes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onclose
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onclose = function(e) {};


/**
 * The error handler is called when the channel ...
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onerror
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onerror = function(e) {};


/**
 * The open handler is called when the channel opens.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onopen
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onopen = function(e) {};


/**
 * The declarequeue handler is called when a queue declaration completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name ondeclarequeue
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.ondeclarequeue = function(e) {};


/**
 * The declareexchange handler is called when an exchange declaration completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name ondeclareexchange
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.ondeclareexchange = function(e) {};


/**
 * The flow handler is called when a flow request completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onflow
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onflow = function(e) {};


/**
 * The bindqueue handler is called when a bind request completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onbindqueue
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onbindqueue = function(e) {};


/**
 * The unbindqueue handler is called when a request to unbind a queue from and exchange completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onunbindqueue
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onunbindqueue = function(e) {};


/**
 * The deletequeue handler is called when a request to delete a queue completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name ondeletequeue
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.ondeletequeue = function(e) {};


/**
 * The deleteexchange handler is called when a request to delete an exchange completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name ondeleteexchange
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.ondeleteexchange = function(e) {};


/**
 * The consume handler is called when a consume request completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onconsume
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onconsume = function(e) {};


/**
 * The cancel handler is called when a cancel request completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name oncancel
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.oncancel = function(e) {};


/**
 * The committransaction handler is called when a transaction commit completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name oncommittransaction
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.oncommittransaction = function(e) {};


/**
 * The rollbacktransaction handler is called when a transaction rollback completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onrollbacktransaction
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onrollbacktransaction = function(e) {};


/**
 * The selecttransaction handler is called when a select request completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onselecttransaction
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onselecttransaction = function(e) {};


/**
 * The get handler is called when a get request returns.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onget
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onget = function(e) {};


/**
 * The purgequeue handler is called when a purge request completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onpurgequeue
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onpurgequeue = function(e) {};


/**
 * The recover handler is called when a recover request completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onrecover
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onrecover = function(e) {};


/**
 * The reject handler is called when a reject request completes.
 *
 * @param {AmqpEvent} e     the event
 *
 * @public
 * @field
 * @type Function
 * @name onreject
 * @memberOf AmqpChannel#
 */
AmqpChannel.prototype.onreject = function(e) {};





////////////////////////////////////////////////////////////////////////////////
// generate public methods and jsdoc
//
////////////////////////////////////////////////////////////////////////////////



 


   

  var startOkConnection = function(_this,  clientProperties, mechanism, response, locale, callback) {
      var args = [ clientProperties  , mechanism  , response  , locale   ];

      var methodName = 'startOkConnection';

      // channel identifier is 0 cor connection methods
      _this._enqueueAction(methodName, _write, [_this, _methodsByName[methodName], 0, args], callback);
      return _this;
  };


   

  var secureOkConnection = function(_this, response, callback) {
      var args = [ response   ];

      var methodName = 'secureOkConnection';

      // channel identifier is 0 cor connection methods
      _this._enqueueAction(methodName, _write, [_this, _methodsByName[methodName], 0, args], callback);
      return _this;
  };


   

  var tuneOkConnection = function(_this,  channelMax,frameMax,heartbeat, callback) {
      var args = [ channelMax  , frameMax  , heartbeat   ];

      var methodName = 'tuneOkConnection';

      // channel identifier is 0 cor connection methods
      _this._enqueueAction(methodName, _write, [_this, _methodsByName[methodName], 0, args], callback);
      return _this;
  };

   

  var openConnection = function(_this,  virtualHost, callback) {
      var args = [ virtualHost  , 0  , 0   ];

      var methodName = 'openConnection';

      // channel identifier is 0 cor connection methods
      _this._enqueueAction(methodName, _write, [_this, _methodsByName[methodName], 0, args], callback);
      return _this;
  };


   

  var closeConnection = function(_this,  replyCode,replyText,classId,methodId, callback) {
      var args = [ replyCode  , replyText  , classId  , methodId   ];

      var methodName = 'closeConnection';

      // channel identifier is 0 cor connection methods
      _this._enqueueAction(methodName, _write, [_this, _methodsByName[methodName], 0, args], callback);
      return _this;
  };

   

  var closeOkConnection = function(_this,   callback) {
      var args = [ ];

      var methodName = 'closeOkConnection';

      // channel identifier is 0 cor connection methods
      _this._enqueueAction(methodName, _write, [_this, _methodsByName[methodName], 0, args], callback);
      return _this;
  };


   


  AmqpChannel.prototype.openChannel = function(callback) {
      var args = [ 0   ];
      var methodName = 'openChannel';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


   
   
  /**
  *
  * This method asks the peer to pause or restart the flow of content data sent by
  * a consumer. This is a simple flow-control mechanism that a peer can use to avoid
  * overflowing its queues or otherwise finding itself receiving more messages than
  * it can process. Note that this method is not intended for window control. It does
  * not affect contents returned by Basic.Get-Ok methods.
  *
  * @param {Bit} active  start/stop content frames
  * <p>
  * @param {Function} callback Function to be called on success
  * <p>
  * @return {AmqpChannel}
  *
  * @public
  * @function
  * @name flowChannel
  * @memberOf AmqpChannel#
  */
  AmqpChannel.prototype.flowChannel = function(
   active, callback) {
      var args = [ active   ];
      var methodName = 'flowChannel';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };

   
   
  /**
  *
  * Confirms to the peer that a flow command was received and processed.
  *
  * @param {Bit} active  current flow setting
  * <p>
  * @param {Function} callback Function to be called on success
  * <p>
  * @return {AmqpChannel}
  *
  * @public
  * @function
  * @name flowOkChannel
  * @memberOf AmqpChannel#
  */
  AmqpChannel.prototype.flowOkChannel = function(
   active, callback) {
      var args = [ active   ];
      var methodName = 'flowOkChannel';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };

   
   
  /*
  *
          This method indicates that the sender wants to close the channel. This may be due to
          internal conditions (e.g. a forced shut-down) or due to an error handling a specific
          method, i.e. an exception. When a close is due to an exception, the sender provides
          the class and method id of the method which caused the exception.
        
  *
  *
  * @param {ReplyCode} replyCode  reply-code
  * @param {ReplyText} replyText  reply-text
  * @param {ClassId} classId  failing method class
  * @param {MethodId} methodId  failing method ID
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name closeChannel
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.closeChannel = function(replyCode,replyText,classId,methodId, callback) {
      var args = [ replyCode  , replyText  , classId  , methodId   ];
      var methodName = 'closeChannel';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };

   


  AmqpChannel.prototype.closeOkChannel = function(
    callback) {
      var args = [ ];
      var methodName = 'closeOkChannel';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


   
   
  /*
  *
          This method creates an exchange if it does not already exist, and if the exchange
          exists, verifies that it is of the correct and expected class.
        
  *
  *
  * @param {ExchangeName} exchange  exchange
  * @param {Shortstr} type  exchange type
  * @param {Bit} passive  do not create exchange
  * @param {Bit} durable  request a durable exchange
  * @param {NoWait} noWait  no-wait
  * @param {Table} arguments  arguments for declaration
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name declareExchange
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.declareExchange = function(
   exchange,type,passive,durable,noWait,arguments, callback) {
      var args = [ 0  , exchange  , type  , passive  , durable  , 0  , 0  , noWait  , arguments   ];
      var methodName = 'declareExchange';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


   
   
  /*
  *
          This method deletes an exchange. When an exchange is deleted all queue bindings on
          the exchange are cancelled.
        
  *
  *
  * @param {ExchangeName} exchange  exchange
  * @param {Bit} ifUnused  delete only if unused
  * @param {NoWait} noWait  no-wait
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name deleteExchange
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.deleteExchange = function(
   exchange,ifUnused,noWait, callback) {
      var args = [ 0  , exchange  , ifUnused  , noWait   ];
      var methodName = 'deleteExchange';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };



   
   
  /*
  *
          This method creates or checks a queue. When creating a new queue the client can
          specify various properties that control the durability of the queue and its
          contents, and the level of sharing for the queue.
        
  *
  *
  * @param {QueueName} queue  queue
  * @param {Bit} passive  do not create queue
  * @param {Bit} durable  request a durable queue
  * @param {Bit} exclusive  request an exclusive queue
  * @param {Bit} autoDelete  auto-delete queue when unused
  * @param {NoWait} noWait  no-wait
  * @param {Table} arguments  arguments for declaration
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name declareQueue
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.declareQueue = function(
   queue,passive,durable,exclusive,autoDelete,noWait,arguments, callback) {
      var args = [ 0  , queue  , passive  , durable  , exclusive  , autoDelete  , noWait  , arguments   ];
      var methodName = 'declareQueue';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


   
   
  /*
  *
          This method binds a queue to an exchange. Until a queue is bound it will not
          receive any messages. In a classic messaging model, store-and-forward queues
          are bound to a direct exchange and subscription queues are bound to a topic
          exchange.
        
  *
  *
  * @param {QueueName} queue  queue
  * @param {ExchangeName} exchange  name of the exchange to bind to
  * @param {Shortstr} routingKey  message routing key
  * @param {NoWait} noWait  no-wait
  * @param {Table} arguments  arguments for binding
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name bindQueue
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.bindQueue = function(
   queue,exchange,routingKey,noWait,arguments, callback) {
      var args = [ 0  , queue  , exchange  , routingKey  , noWait  , arguments   ];
      var methodName = 'bindQueue';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


   
   
  /*
  *This method unbinds a queue from an exchange.
  *
  *
  * @param {QueueName} queue  queue
  * @param {ExchangeName} exchange  exchange
  * @param {Shortstr} routingKey  routing key of binding
  * @param {Table} arguments  arguments of binding
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name unbindQueue
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.unbindQueue = function(
   queue,exchange,routingKey,arguments, callback) {
      var args = [ 0  , queue  , exchange  , routingKey  , arguments   ];
      var methodName = 'unbindQueue';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


   
   
  /*
  *
          This method removes all messages from a queue which are not awaiting
          acknowledgment.
        
  *
  *
  * @param {QueueName} queue  queue
  * @param {NoWait} noWait  no-wait
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name purgeQueue
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.purgeQueue = function(
   queue,noWait, callback) {
      var args = [ 0  , queue  , noWait   ];
      var methodName = 'purgeQueue';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


   
   
  /*
  *
          This method deletes a queue. When a queue is deleted any pending messages are sent
          to a dead-letter queue if this is defined in the server configuration, and all
          consumers on the queue are cancelled.
        
  *
  *
  * @param {QueueName} queue  queue
  * @param {Bit} ifUnused  delete only if unused
  * @param {Bit} ifEmpty  delete only if empty
  * @param {NoWait} noWait  no-wait
   
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name deleteQueue
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.deleteQueue = function(
   queue,ifUnused,ifEmpty,noWait, callback) {
      var args = [ 0  , queue  , ifUnused  , ifEmpty  , noWait   ];
      var methodName = 'deleteQueue';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };



   
   
  /*
  *
          This method requests a specific quality of service. The QoS can be specified for the
          current channel or for all channels on the connection. The particular properties and
          semantics of a qos method always depend on the content class semantics. Though the
          qos method could in principle apply to both peers, it is currently meaningful only
          for the server.
        
  *
  *
  * @param {Long} prefetchSize  prefetch window in octets
  * @param {Short} prefetchCount  prefetch window in messages
  * @param {Bit} global  apply to entire connection
   
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name qosBasic
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.qosBasic = function(
   prefetchSize,prefetchCount,global, callback) {
      var args = [ prefetchSize  , prefetchCount  , global   ];
      var methodName = 'qosBasic';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


   
   
  /*
  *
          This method asks the server to start a "consumer", which is a transient request for
          messages from a specific queue. Consumers last as long as the channel they were
          declared on, or until the client cancels them.
        
  *
  *
  * @param {QueueName} queue  queue
  * @param {ConsumerTag} consumerTag  consumer-tag
  * @param {NoLocal} noLocal  no-local
  * @param {NoAck} noAck  no-ack
  * @param {Bit} exclusive  request exclusive access
  * @param {NoWait} noWait  no-wait
  * @param {Table} arguments  arguments for declaration
   
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name consumeBasic
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.consumeBasic = function(
   queue,consumerTag,noLocal,noAck,exclusive,noWait,arguments, callback) {
      var args = [ 0  , queue  , consumerTag  , noLocal  , noAck  , exclusive  , noWait  , arguments   ];
      var methodName = 'consumeBasic';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


   
   
  /*
  *
          This method cancels a consumer. This does not affect already delivered
          messages, but it does mean the server will not send any more messages for
          that consumer. The client may receive an arbitrary number of messages in
          between sending the cancel method and receiving the cancel-ok reply.
        
  *
  *
  * @param {ConsumerTag} consumerTag  consumer-tag
  * @param {NoWait} noWait  no-wait
   
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name cancelBasic
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.cancelBasic = function(
   consumerTag,noWait, callback) {
      var args = [ consumerTag  , noWait   ];
      var methodName = 'cancelBasic';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


   
   
  /*
  *
          This method publishes a message to a specific exchange. The message will be routed
          to queues as defined by the exchange configuration and distributed to any active
          consumers when the transaction, if any, is committed.
        
  *
  *
  * @param {ByteBuffer} body AMQP message payload 
  * @param {Object} headers AMQP content properties 
  * @param {ExchangeName} exchange  exchange
  * @param {Shortstr} routingKey  Message routing key
  * @param {Bit} mandatory  indicate mandatory routing
  * @param {Bit} immediate  request immediate delivery
   
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name publishBasic
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.publishBasic = function(
  body, headers, 
   exchange,routingKey,mandatory,immediate, callback) {
      var args = [ 0  , exchange  , routingKey  , mandatory  , immediate   ];
      var methodName = 'publishBasic';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args, body, headers], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };



   
   
  /*
  *
          This method provides a direct access to the messages in a queue using a synchronous
          dialogue that is designed for specific types of application where synchronous
          functionality is more important than performance.
        
  *
  *
  * @param {QueueName} queue  queue
  * @param {NoAck} noAck  no-ack
   
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name getBasic
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.getBasic = function(
   queue,noAck, callback) {
      var args = [ 0  , queue  , noAck   ];
      var methodName = 'getBasic';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };



   
   
  /*
  *
          This method acknowledges one or more messages delivered via the Deliver or Get-Ok
          methods. The client can ask to confirm a single message or a set of messages up to
          and including a specific message.
        
  *
  *
  * @param {DeliveryTag} deliveryTag  delivery-tag
  * @param {Bit} multiple  acknowledge multiple messages
   
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name ackBasic
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.ackBasic = function(
   deliveryTag,multiple, callback) {
      var args = [ deliveryTag  , multiple   ];
      var methodName = 'ackBasic';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };

   
   
  /*
  *
          This method allows a client to reject a message. It can be used to interrupt and
          cancel large incoming messages, or return untreatable messages to their original
          queue.
        
  *
  *
  * @param {DeliveryTag} deliveryTag  delivery-tag
  * @param {Bit} requeue  requeue the message
   
  * @param {Function} callback Function to be called on success
  * @return {AmqpChannel}
  *
  * @private
  * @function
  * @name rejectBasic
  * @memberOf AmqpChannel#
  */


  AmqpChannel.prototype.rejectBasic = function(
   deliveryTag,requeue, callback) {
      var args = [ deliveryTag  , requeue   ];
      var methodName = 'rejectBasic';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


   
   

  /**
   *
   * This method asks the server to redeliver all unacknowledged messages on a
   * specified channel. Zero or more messages may be redelivered.  This method
   * replaces the asynchronous Recover.
   *
   * @param {Bit} requeue  requeue the message
   * <p>
   * @param {Function} callback Function to be called on success
   * <p>
   * @return {AmqpChannel}
   *
   * @public
   * @function
   * @name recoverBasic
   * @memberOf AmqpChannel#
   */
  AmqpChannel.prototype.recoverBasic = function(
   requeue, callback) {
      var args = [ requeue   ];
      var methodName = 'recoverBasic';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;
          for (var i=0; i<amqpMethod.allParameters.length; i++) {
              var argname = amqpMethod.allParameters[i].name;
              if (argname = "noWait") {
                  hasnowait = true;
                  break;
              }
          }


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


_basicProperties = [
 {"name":"contentType", "domain":"Shortstr", "label":"MIME content type"}, {"name":"contentEncoding", "domain":"Shortstr", "label":"MIME content encoding"}, {"name":"headers", "domain":"Table", "label":"message header field table"}, {"name":"deliveryMode", "domain":"Octet", "label":"non-persistent (1) or persistent (2)"}, {"name":"priority", "domain":"Octet", "label":"message priority, 0 to 9"}, {"name":"correlationId", "domain":"Shortstr", "label":"application correlation identifier"}, {"name":"replyTo", "domain":"Shortstr", "label":"address to reply to"}, {"name":"expiration", "domain":"Shortstr", "label":"message expiration specification"}, {"name":"messageId", "domain":"Shortstr", "label":"application message identifier"}, {"name":"timestamp", "domain":"Timestamp", "label":"message timestamp"}, {"name":"type", "domain":"Shortstr", "label":"message type name"}, {"name":"userId", "domain":"Shortstr", "label":"creating user id"}, {"name":"appId", "domain":"Shortstr", "label":"creating application id"}, {"name":"reserved", "domain":"Shortstr", "label":"reserved, must be empty"}
];
   
   
/**
*
* This method sets the channel to use standard transactions. The client must use this
* method at least once on a channel before using the Commit or Rollback methods.
*
* @param {Function} callback Function to be called on success
* <p>
* @return {AmqpChannel}
*
* @public
* @function
* @name selectTx
* @memberOf AmqpChannel#
*/
  AmqpChannel.prototype.selectTx = function(
    callback) {
      var args = [ ];
      var methodName = 'selectTx';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


   
   
  /**
  *
  * This method commits all message publications and acknowledgments performed in
  * the current transaction.  A new transaction starts immediately after a commit.
  *
  * @param {Function} callback Function to be called on success
  * <p>
  * @return {AmqpChannel}
  *
  * @public
  * @function
  * @name commitTx
  * @memberOf AmqpChannel#
  */
  AmqpChannel.prototype.commitTx = function(
    callback) {
      var args = [ ];
      var methodName = 'commitTx';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };


   
   
  /**
  *
  * This method abandons all message publications and acknowledgments performed in
  * the current transaction. A new transaction starts immediately after a rollback.
  * Note that unacked messages will not be automatically redelivered by rollback;
  * if that is required an explicit recover call should be issued.
  *
  * @param {Function} callback Function to be called on success
  * <p>
  * @return {AmqpChannel}
  *
  * @public
  * @function
  * @name rollbackTx
  * @memberOf AmqpChannel#
  */
  AmqpChannel.prototype.rollbackTx = function(
    callback) {
      var args = [ ];
      var methodName = 'rollbackTx';
      var amqpMethod = _methodsByName[methodName];


      // TODO
      // This is a temporary workaround to get the value of the noack flag
      //   without knowing up front if the method has a noack parameter.
      //
      // This logic can be removed if a noack field is added to the codegen model
      var hasnowait = false;


      if(this._connection._readyState == this._connection.OPEN)
          this._enqueueAction(methodName, _channelWrite, [this, amqpMethod, this._id, args], callback);

      // need for conditional insertion of code while using string template
      // Below if condition should be added for funtions like declareExchange(), declareQueue(), bindQueue() and consumeBasic()
      // As of now they are added in all functions due to string template

      if (methodName == "flowChannel") {
          AmqpChannel.prototype.flowFlag = active;
      }

      // if there is a nowait param, and it is true, we need to get out of the waiting state
      if (hasnowait) {
          if (typeof(noWait) !== "undefined" && noWait) {
              this._enqueueAction("nowait");
          }
      }

      return this;
  };




// AmqpChannel.openChannel is public but should be private
// wrap it, store it locally, and remove it
var func = AmqpChannel.prototype.openChannel;
var openChannel = function(channel, args) {
    channel._stateMachine.enterState("channelReady", "", null);
    func.apply(channel, args);
}
delete AmqpChannel.prototype.openChannel;

// make closeOkChannel private

var func2 = AmqpChannel.prototype.closeOkChannel;
var closeOkChannel = function(channel, args) {
    func2.apply(channel, args);
}
delete AmqpChannel.prototype.closeOkChannel;


/**
 * This method indicates that the sender wants to close the channel. This 
 * may be due to internal conditions (e.g. a forced shut-down) or due to an error 
 * handling a specific method, i.e. an exception. When a close is due to an
 * exception, the sender provides the class and method id of the method which
 * caused the exception.
 * 
 * <p> AmqpChannel.closeChannel() function that supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * <pre>
 *     var channel = ...;
 *     var config = {replyCode: int1, 
 *                   replyText, 'foo', 
 *                   classId: int2,
 *                   methodId: int3};
 *     channel.closeChannel(config, callback);
 * </pre>
 *
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                        {
 *                          replyCode: int_value,
 *                          replyText: 'str_value',
 *                          classId: int_value,
 *                          methodId: int_value
 *                        }
 *                        </pre>
 * Default values are as follows: 
 *                        <pre>
 *                          replyCode  --  0
 *                          replyText  --  "" 
 *                          classId    --  0
 *                          methodId   --  0
 *                          callback   -- undefined
 *                        </pre>
 * <p>
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name closeChannel
 * @memberOf AmqpChannel#
 */
var closeChannelFunc = AmqpChannel.prototype.closeChannel;
AmqpChannel.prototype.closeChannel = function(config, callback) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var replyCode = myConfig.replyCode || 0;
       var replyText = myConfig.replyText || '';
       var classId = myConfig.classId || 0;
       var methodId = myConfig.methodId || 0;
       
       if (typeof replyCode != 'number') {
           throw new Error("AmqpChannel.closeChannel(): Parameter \'replyCode\' is expected to be of numeric type");
       }

       if (typeof replyText != 'string') {
           throw new Error("AmqpChannel.closeChannel(): Parameter \'replyText\' is expected to be a string");
       }

       if (typeof classId != 'number') {
           throw new Error("AmqpChannel.closeChannel(): Parameter \'classId\' is expected to be of numeric type");
       }
       
       if (typeof methodId != 'number') {
           throw new Error("AmqpChannel.closeChannel(): Parameter \'methodId\' is expected to be of numeric type");
       }
       
       return closeChannelFunc.call(this, replyCode, replyText, classId, methodId, callback);
   }
   else {
       return closeChannelFunc.apply(this, arguments);
   }
};


/**
 * This method creates an exchange if it does not already exist, and if the 
 * exchange exists, verifies that it is of the correct and expected class.
 * 
 * <p> AmqpChannel.declareExchange() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * <pre>
 *    var channel = ...;
 *    var config = {exchange: myExchangeName, type: 'direct'};
 *    channel.declareExchange(config, callback);
 * </pre>
 *
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           exchange: 'str_value',
 *                           type: 'direct'|'fanout'|'headers'|'topic',
 *                           passive: true|false,
 *                           durable: true|false,
 *                           noWait: true|false,
 *                           args: {  }
 *                         }
 *                        </pre>
 * 'exchange' specifies the name of the exchange and is a required param. The
 * legal values of the required 'type' param are 'direct', 'fanout', 'headers', 
 * and 'topic' Boolean params 'passive', 'durable', and 'noWait' have a default
 * value of false. Param 'args' is an optional param that can be used to pass 
 * in additional properties. 
 * <p>
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name declareExchange
 * @memberOf AmqpChannel#
 */
var declareExchangeFunc = AmqpChannel.prototype.declareExchange;
AmqpChannel.prototype.declareExchange = function(config, callback) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var exchange = myConfig.exchange;
       var type = myConfig.type;
       var passive = myConfig.passive || false;
       var durable = myConfig.durable || false;
       var noWait = myConfig.noWait || false;
       var args = myConfig.args || null;
       
       if (!exchange || typeof exchange != 'string') {
           throw new Error("AmqpChannel.declareExchange(): String parameter \'exchange\' is required");
       }

       if (!type                   || 
           typeof type != 'string' ||
           ((type != 'fanout') && (type != 'direct') && (type != 'topic') && (type != 'headers'))) {
           throw new Error("AmqpChannel.declareExchange(): Legal values of parameter \'type\' are direct | fanout | headers | topic");
       }
       
       if (typeof passive != 'boolean') {
           throw new Error("AmqpChannel.declareExchange(): Parameter \'passive\' only accepts boolean values");
       }

       if (typeof durable != 'boolean') {
           throw new Error("AmqpChannel.declareExchange(): Parameter \'durable\' only accepts boolean values");
       }

       if (typeof noWait != 'boolean') {
           throw new Error("AmqpChannel.declareExchange(): Parameter \'noWait\' only accepts boolean values");
       }
       
       return declareExchangeFunc.call(this, exchange, type, passive, durable, noWait, args, callback);
   }
   else {
       return declareExchangeFunc.apply(this, arguments);
   }
};

/**
 * This method deletes an exchange. When an exchange is deleted all queue 
 * bindings on the exchange are cancelled.
 * 
 * <p> AmqpChannel.deleteExchange() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * 
 * <pre>
 *    var channel = ...;
 *    var config = {exchange: myExchangeName, noWait: false};
 *    channel.deleteExchange(config, callback);
 * </pre>
 *
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           exchange: 'exchange_name_str_value',
 *                           ifUnused: true|false,
 *                           noWait: true|false
 *                         }
 *                        </pre>
 * Required parameter 'exchange' specifies the name of the exchange. Default 
 * values of the optional boolean parameters 'ifUnused' and 'noWait' is false.
 * <p>
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name deleteExchange
 * @memberOf AmqpChannel#
 */
var deleteExchangeFunc = AmqpChannel.prototype.deleteExchange;
AmqpChannel.prototype.deleteExchange = function(config, callback) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var exchange = myConfig.exchange;
       var ifUnused = myConfig.ifUnused || false;
       var noWait = myConfig.noWait || false;
       
       if (!exchange || typeof exchange != 'string') {
           throw new Error("AmqpChannel.deleteExchange(): String parameter \'exchange\' is required");
       }

       if (typeof ifUnused != 'boolean') {
           throw new Error("AmqpChannel.deleteExchange(): Parameter \'ifUnused\' only accepts boolean values");
       }

       if (typeof noWait != 'boolean') {
           throw new Error("AmqpChannel.deleteExchange(): Parameter \'noWait\' only accepts boolean values");
       }
       
       return deleteExchangeFunc.call(this, exchange, ifUnused, noWait, callback);
   }
   else {
       return deleteExchangeFunc.apply(this, arguments);
   }
};

/**
 * This method creates or checks a queue. When creating a new queue the client 
 * can specify various properties that control the durability of the queue and 
 * its contents, and the level of sharing for the queue.
 *
 * <p> AmqpChannel.declareQueue() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * 
 * <pre>
 *    var channel = ...;
 *    var config = {queue: myQueueName, exclusive: false};
 *    channel.declareQueue(config, callback);
 * </pre>
 *
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           queue: 'queue_name_str_value',
 *                           passive: true|false,
 *                           durable: true|false,
 *                           exclusive: true|false,
 *                           autoDelete: true|false,
 *                           noWait: true|false,
 *                           args: { }
 *                         }
 *                        </pre>
 * Required parameter 'queue' specifies the queue name. Boolean parameters
 * 'passive', 'durable', 'noWait', 'exclusive' and 'autoDelete' are optional 
 * with false as the default value. Param 'args' is an optional param that 
 * can be used to pass in additional properties for declaration.
 * <p>
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name declareQueue
 * @memberOf AmqpChannel#
 */
var declareQueueFunc = AmqpChannel.prototype.declareQueue;
AmqpChannel.prototype.declareQueue = function(config, callback) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var queue = myConfig.queue;
       var passive = myConfig.passive || false;
       var durable = myConfig.durable || false;
       var exclusive = myConfig.exclusive || false;
       var autoDelete = myConfig.autoDelete || false;
       var noWait = myConfig.noWait || false;
       var args = myConfig.args || null;
       
       if (!queue || typeof queue != 'string') {
           throw new Error("AmqpChannel.declareQueue(): String parameter \'queue\' is required");
       }

       if (typeof passive != 'boolean') {
           throw new Error("AmqpChannel.declareQueue(): Parameter \'passive\' only accepts boolean values");
       }

       if (typeof durable != 'boolean') {
           throw new Error("AmqpChannel.declareQueue(): Parameter \'durable\' only accepts boolean values");
       }

       if (typeof exclusive != 'boolean') {
           throw new Error("AmqpChannel.declareQueue(): Parameter \'exclusive\' only accepts boolean values");
       }

       if (typeof autoDelete != 'boolean') {
           throw new Error("AmqpChannel.declareQueue(): Parameter \'autoDelete\' only accepts boolean values");
       }

       if (typeof noWait != 'boolean') {
           throw new Error("AmqpChannel.declareQueue(): Parameter \'noWait\' only accepts boolean values");
       }
       
       return declareQueueFunc.call(this, queue, passive, durable, exclusive, autoDelete, noWait, args, callback);
   }
   else {
       return declareQueueFunc.apply(this, arguments);
   }
};

/**
 * This method binds a queue to an exchange. Until a queue is bound it will not
 * receive any messages. In a classic messaging model, store-and-forward queues
 * are bound to a direct exchange and subscription queues are bound to a topic
 * exchange. Developers should invoke this function as shown below:
 * 
 * <p> AmqpChannel.bindQueue() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * 
 * <pre>
 *    var channel = ...;
 *    var config = {queue: myQueueName, 
 *                  exchange: myExchangeName,
 *                  routingKey: key};
 *    channel.bindQueue(config, callback);
 * </pre>
 *
 * <p> 
 * 
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           queue: 'queue_name_str_value',
 *                           exchange: 'exchange_name_str_value',
 *                           routingKey: 'key_str_value'
 *                           noWait: true|false,
 *                           args: { }
 *                         }
 *                        </pre>
 * Required parameter 'queue' specifies the queue name. Required parameter
 * 'exchange' specifies the exchange name. Required parameter 'routingKey'
 * specifies the key to be used to bind the queue to the exchange. Boolean
 * parameter 'noWait' is optional with false as the default value. Param 'args'
 * is an optional amd can be used to pass in additional properties for 
 * declaration.
 * <p>
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name bindQueue
 * @memberOf AmqpChannel#
 */
var bindQueueFunc = AmqpChannel.prototype.bindQueue;
AmqpChannel.prototype.bindQueue = function(config, callback) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var queue = myConfig.queue;
       var exchange = myConfig.exchange;
       var routingKey = myConfig.routingKey;
       var noWait = myConfig.noWait || false;
       var args = myConfig.args || null;
       
       if (!queue || typeof queue != 'string') {
           throw new Error("AmqpChannel.bindQueue(): String parameter \'queue\' is required");
       }

       if (!exchange || typeof exchange != 'string') {
           throw new Error("AmqpChannel.bindQueue(): String parameter \'exchange\' is required");
       }

       if (!routingKey || typeof routingKey != 'string') {
           throw new Error("AmqpChannel.bindQueue(): String parameter \'routingKey\' is required");
       }

       if (typeof noWait != 'boolean') {
           throw new Error("AmqpChannel.bindQueue(): Parameter \'noWait\' only accepts boolean values");
       }
       
       return bindQueueFunc.call(this, queue, exchange, routingKey, noWait, args, callback);
   }
   else {
       return bindQueueFunc.apply(this, arguments);
   }
};

/**
 * This method unbinds a queue from an exchange.
 * 
 * <p> AmqpChannel.unbindQueue() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * 
 * <pre>
 *    var channel = ...;
 *    var config = {queue: myQueueName, exchange: exchangeName, routingKey: key};
 *    channel.unbindQueue(config, callback);
 * </pre>
 *
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           queue: 'queue_name_str_value',
 *                           exchange: 'exchange_name_str_value',
 *                           routingKey: 'routingKey_str_value',
 *                           args: { }
 *                         }
 *                        </pre>
 * Required parameter 'queue' specifies the queue name. Required parameter
 * 'exchange' specifies the exchange name. Required parameter 'routingKey'
 * specifies the key that was used to bind the queue to the exchange. Parameter 
 * 'args' is optional and can be used to pass in additional properties for 
 * declaration.
 * <p>
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name unbindQueue
 * @memberOf AmqpChannel#
 */
var unbindQueueFunc = AmqpChannel.prototype.unbindQueue;
AmqpChannel.prototype.unbindQueue = function(config, callback) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var queue = myConfig.queue;
       var exchange = myConfig.exchange;
       var routingKey = myConfig.routingKey;
       var args = myConfig.args || null;
       
       if (!queue || typeof queue != 'string') {
           throw new Error("AmqpChannel.unbindQueue(): String parameter \'queue\' is required");
       }

       if (!exchange || typeof exchange != 'string') {
           throw new Error("AmqpChannel.unbindQueue(): String parameter \'exchange\' is required");
       }

       if (!routingKey || typeof routingKey != 'string') {
           throw new Error("AmqpChannel.unbindQueue(): String parameter \'routingKey\' is required");
       }
       
       return unbindQueueFunc.call(this, queue, exchange, routingKey, args, callback);
   }
   else {
       return unbindQueueFunc.apply(this, arguments);
   }
};

/**
 * This method removes all messages from a queue which are not awaiting
 * acknowledgment.
 * 
 * <p> AmqpChannel.purgeQueue() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * 
 * <pre>
 *    var channel = ...;
 *    var config = {queue: myQueueName};
 *    channel.purgeQueue(config, callback);
 * </pre>
 * 
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           queue: 'queue_name_str_value',
 *                           noWait: true|false
 *                         }
 *                        </pre>
 * Required parameter 'queue' specifies the queue name. Boolean parameter 
 * 'noWait' is optional with false as the default value.
 * <p>
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name purgeQueue
 * @memberOf AmqpChannel#
 */
var purgeQueueFunc = AmqpChannel.prototype.purgeQueue;
AmqpChannel.prototype.purgeQueue = function(config, callback) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var queue = myConfig.queue;
       var noWait = myConfig.noWait || false;
       
       if (!queue || typeof queue != 'string') {
           throw new Error("AmqpChannel.purgeQueue(): String parameter \'queue\' is required");
       }

       if (typeof noWait != 'boolean') {
           throw new Error("AmqpChannel.purgeQueue(): Parameter \'noWait\' only accepts boolean values");
       }
       
       return purgeQueueFunc.call(this, queue, noWait, callback);
   }
   else {
       return purgeQueueFunc.apply(this, arguments);
   }
};


/**
 * This method deletes a queue. When a queue is deleted any pending messages 
 * are sent to a dead-letter queue if this is defined in the server configuration, 
 * and all consumers on the queue are cancelled.
 *
 * <p> AmqpChannel.deleteQueue() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * 
 * <pre>
 *    var channel = ...;
 *    var config = {queue: myQueueName, ifEmpty: true};
 *    channel.deleteQueue(config, callback);
 * </pre>
 *
 * @param {Configuration} config    Format is as shown below:
 *                        {
 *                          queue: 'queue_name_str_value',
 *                          ifUnused: true|false,
 *                          ifEmpty: true|false,
 *                          noWait: true|false
 *                        }
 * Required parameter 'queue' specifies the queue name. Boolean parameters 
 * 'ifUnused', 'ifEmpty', and 'noWait' are optional with false as the default 
 * value. 
 * <p>
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name deleteQueue
 * @memberOf AmqpChannel#
 */
var deleteQueueFunc = AmqpChannel.prototype.deleteQueue;
AmqpChannel.prototype.deleteQueue = function(config, callback) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var queue = myConfig.queue;
       var ifUnused = myConfig.ifUnused || false;
       var ifEmpty = myConfig.ifEmpty || false;
       var noWait = myConfig.noWait || false;
       
       if (!queue || typeof queue != 'string') {
           throw new Error("AmqpChannel.deleteQueue(): String parameter \'queue\' is required");
       }

       if (typeof ifUnused != 'boolean') {
           throw new Error("AmqpChannel.deleteQueue(): Parameter \'ifUnused\' only accepts boolean values");
       }
       
       if (typeof ifEmpty != 'boolean') {
           throw new Error("AmqpChannel.deleteQueue(): Parameter \'ifEmpty\' only accepts boolean values");
       }

       if (typeof noWait != 'boolean') {
           throw new Error("AmqpChannel.deleteQueue(): Parameter \'noWait\' only accepts boolean values");
       }
       
       return deleteQueueFunc.call(this, queue, ifUnused, ifEmpty, noWait, callback);
   }
   else {
       return deleteQueueFunc.apply(this, arguments);
   }
};

/**
 * This method requests a specific quality of service. The QoS can be specified
 * for the current channel or for all channels on the connection. The particular
 * properties and semantics of a qos method always depend on the content class 
 * semantics. Though the qos method could in principle apply to both peers, it 
 * is currently meaningful only for the server.
 * 
 * <p> AmqpChannel.qosBasic() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * 
 * <pre>
 *    var channel = ...;
 *    var config = {prefetchSize: size, prefetchCount: count, global: true};
 *    channel.qosBasic(config, callback);
 * </pre>
 *
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           prefetchSize: size_long_value_in_octets,
 *                           prefetchCount: count_short_value_in_octets,
 *                           global: true|false
 *                         }
 *                        </pre>
 * Parameter 'prefetchSize' and 'prefetchCount' are required. Boolean parameter
 * 'global' is optional with false as the default value.
 * <p>
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name qosBasic
 * @memberOf AmqpChannel#
 */
var qosBasicFunc = AmqpChannel.prototype.qosBasic;
AmqpChannel.prototype.qosBasic = function(config, callback) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var prefetchSize = myConfig.prefetchSize || 0;
       var prefetchCount = myConfig.prefetchCount || 0;
       var global = myConfig.global || false;
       
       if (typeof prefetchSize != 'number') {
           throw new Error("AmqpChannel.qosBasic(): Parameter \'prefetchSize\' is expected to be of numeric type");
       }

       if (typeof prefetchCount != 'number') {
           throw new Error("AmqpChannel.qosBasic(): Parameter \'prefetchCount\' is expected to be of numeric type");
       }

       if (typeof global != 'boolean') {
           throw new Error("AmqpChannel.qosBasic(): Parameter \'global\' only accepts boolean values");
       }
       
       return qosBasicFunc.call(this, prefetchSize, prefetchCount, global, callback);
   }
   else {
       return qosBasicFunc.apply(this, arguments);
   }
};


/**
 * This method asks the server to start a "consumer", which is a transient 
 * request for messages from a specific queue. Consumers last as long as the 
 * channel they were declared on, or until the client cancels them.
 * 
 * <p> AmqpChannel.consumeBasic() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * 
 * <pre>
 *    var channel = ...;
 *    var config = {queue: myQueueName, 
 *                  consumerTag: clientTag, 
 *                  exclusive: false,
 *                  noLocal: true};
 *    channel.consumeBasic(config, callback);
 * </pre>
 *
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           queue: 'queue_name_str_value',
 *                           consumerTag: 'consumer_tag_str_value',
 *                           noLocal: true|false,
 *                           noAck: true|false,
 *                           exclusive: true|false,
 *                           noWait: true|false,
 *                           args: { }
 *                         }
 *                        </pre>
 *
 * Required parameter 'queue' specifies the queue name. Parameter
 * 'consumerTag' is required. Boolean parameters 'noLocal', 'noWait', and
 * 'exclusive' are optional with false as the default value. 
 *<p>
 * Boolean parameter 'noAck' is optional with default value of true. If noAck is 
 * true, the broker will not expect any acknowledgement from the client before
 * discarding the message. If noAck is false, then the broker will expect an
 * acknowledgement before discarding the message.  If noAck is specified to be
 * false, then it's developers responsibility to explicitly acknowledge the
 * received message using AmqpChannel.ackBasic() as shown below: 
 * 
 * <pre>
 * var handleMessageReceived = function(event) {
 *    ....
 *    var props = event.properties;
 *    var exchange = event.args.exchange;
 *    var routingKey = event.args.routingKey;
 *    var dt = event.args.deliveryTag;
 *    var channel = event.target;
 *   
 *    // Acknowledge the received message. Otherwise, the broker will eventually
 *    // run out of memory.
 *    var config = {deliveryTag: dt, multiple: true};
 *    setTimeout(function() {
 *                channel.ackBasic(config);
 *              }, 0);
 * }
 * </pre>
 *
 * Parameter 'args' is optional and can be used to pass in additional properties
 * for declaration.
 * 
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name consumeBasic
 * @memberOf AmqpChannel#
 */
var consumeBasicFunc = AmqpChannel.prototype.consumeBasic;
AmqpChannel.prototype.consumeBasic = function(config, callback) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var queue = myConfig.queue;
       var consumerTag = myConfig.consumerTag;
       var noLocal = myConfig.noLocal || false;
       var noAck = true;
       var exclusive = myConfig.exclusive || false;
       var noWait = myConfig.noWait || false;
       var args = myConfig.args || null;
       
       if (!queue || typeof queue != 'string') {
           throw new Error("AmqpChannel.consumeBasic(): String parameter \'queue\' is required");
       }

       if (!consumerTag || typeof consumerTag != 'string') {
           throw new Error("AmqpChannel.consumeBasic(): String parameter \'consumerTag\' is required");
       }

       if (typeof noLocal != 'boolean') {
           throw new Error("AmqpChannel.consumeBasic(): Parameter \'noLocal\' only accepts boolean values");
       }

       if (typeof(myConfig.noAck) !== "undefined" ) {
           if (typeof(myConfig.noAck) != 'boolean') {
               throw new Error("AmqpChannel.consumeBasic(): Parameter \'noAck\' only accepts boolean values");
           }

           // If myConfig.noAck is defined and it is a boolean, then use it.
           noAck = myConfig.noAck;
       }

       if (typeof exclusive != 'boolean') {
           throw new Error("AmqpChannel.consumeBasic(): Parameter \'exclusive\' only accepts boolean values");
       }
       
       if (typeof noWait != 'boolean') {
           throw new Error("AmqpChannel.consumeBasic(): Parameter \'noWait\' only accepts boolean values");
       }
       
       return consumeBasicFunc.call(this, queue, consumerTag, noLocal, noAck, exclusive, noWait, args, callback);
   }
   else {
       return consumeBasicFunc.apply(this, arguments);
   }
};

/**
 * This method cancels a consumer. This does not affect already delivered
 * messages, but it does mean the server will not send any more messages for
 * that consumer. The client may receive an arbitrary number of messages in
 * between sending the cancel method and receiving the cancel-ok reply.
 * 
 * <p> AmqpChannel.cancelBasic() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * 
 * <pre>
 *    var channel = ...;
 *    var config = {consumerTag: clientTag, noWait: true};
 *    channel.cancelBasic(config, callback);
 * </pre>
 *
 * <p> 
 *
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           consumerTag: 'consumer_tag_str_value',
 *                           noWait: true|false
 *                         }
 *                        </pre>
 * Required parameter consumerTag' is required. Boolean parameters 'noWait' is 
 * optional with false as the default value.
 * <p>
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name cancelBasic
 * @memberOf AmqpChannel#
 */
var cancelBasicFunc = AmqpChannel.prototype.cancelBasic;
AmqpChannel.prototype.cancelBasic = function(config, callback) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var consumerTag = myConfig.consumerTag;
       var noWait = myConfig.noWait || false;
       
       if (!consumerTag || typeof consumerTag != 'string') {
           throw new Error("AmqpChannel.cancelBasic(): String parameter \'consumerTag\' is required");
       }

       if (typeof noWait != 'boolean') {
           throw new Error("AmqpChannel.cancelBasic(): Parameter \'noWait\' only accepts boolean values");
       }
       
       return cancelBasicFunc.call(this, consumerTag, noWait, callback);
   }
   else {
       return cancelBasicFunc.apply(this, arguments);
   }
};

/**
 * This method publishes a message to a specific exchange. The message will 
 * be routed to queues as defined by the exchange configuration and distributed
 * to any active consumers when the transaction, if any, is committed.
 * 
 * <p> AmqpChannel.publishBasic() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * 
 * <pre>
 *    var channel = ...;
 *    var props = new AmqpProperties();
 *    props.setMessageId("msgId1");
 *    var config = {body: buffer, 
 *                  properties: props,
 *                  exchange: myExchangeName, 
 *                  routingKey: key};
 *    channel.publishBasic(config, callback);
 * </pre>
 *
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           body: ArrayBuffer_or_ByteBuffer_instance,
 *                           properties: AmqpProperties_instance,
 *                           exchange: 'exchange_name_str_value',
 *                           routingKey: 'routingKey_str_value',
 *                           mandatory: true|false,
 *                           immediate: true|false
 *                         }
 *                        </pre>
 * Required parameter 'body' takes an instance of either ArrayBuffer or 
 * ByteBuffer. Newer browsers support ArrayBuffer. However, developers can
 * continue to support older browsers by specify a ByteBuffer payload as 'body'.
 * The 'properties' parameter takes an instance of AmqpProperties topass the 
 * pre-defined properties as per AMQP 0-9-1 specification. AmqpProperties 
 * provides getter/setter APIs for all the pre-defined properties as a 
 * convenience. Required parameter 'exchange' specifies the name of the exchange. 
 * Parameter 'routingKey' is required. Boolean parameters 'mandatory' and 
 * 'immediate' are optional with false as the default value.
 * <p>
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name publishBasic
 * @memberOf AmqpChannel#
 */
var publishBasicFunc = AmqpChannel.prototype.publishBasic;
AmqpChannel.prototype.publishBasic = function(config, callback) {
    if (typeof config == 'object' && config.body) {
       myConfig = config || {};
       var body = myConfig.body;
       var properties = myConfig.properties;
       var exchange = myConfig.exchange;
       var routingKey = myConfig.routingKey;
       var mandatory = myConfig.mandatory || false;
       var immediate = myConfig.immediate || false;
       var msgBody = null;
       
       if (!body) {
           throw new Error("AmqpChannel.publishBasic(): \'body\' is a required parameter.");
       }

       if ((typeof(ArrayBuffer) !== "undefined") &&
           (body instanceof ArrayBuffer)) {
           msgBody = decodeArrayBuffer2ByteBuffer(body);
       }
       else if (body instanceof $rootModule.ByteBuffer) {
           msgBody = body;
       }
       else {
           throw new Error("AmqpChannel.publishBasic(): \'body\' should be an instance of either ArrayBuffer or ByteBuffer");
       }

       if (!exchange || typeof exchange != 'string') {
           throw new Error("AmqpChannel.publishBasic(): String parameter \'exchange\' is required");
       }

       if (!routingKey || typeof routingKey != 'string') {
           throw new Error("AmqpChannel.publishBasic(): String parameter \'routingKey\' is required");
       }

       if (typeof mandatory != 'boolean') {
           throw new Error("AmqpChannel.publishBasic(): Parameter \'mandatory\' only accepts boolean values");
       }

       if (typeof immediate != 'boolean') {
           throw new Error("AmqpChannel.publishBasic(): Parameter \'immediate\' only accepts boolean values");
       }
       var prop = {};
       if (properties != undefined) {
           prop = properties.getProperties();
       }

       return publishBasicFunc.call(this, msgBody, prop, exchange, routingKey, mandatory, immediate, callback);
   }
   else {
       return publishBasicFunc.apply(this, arguments);
   }
};

/**
 * This method provides a direct access to the messages in a queue using a 
 * synchronous dialogue that is designed for specific types of application 
 * where synchronous functionality is more important than performance.
 * 
 * <p> AmqpChannel.getBasic() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * <pre>
 *    var channel = ...;
 *    var config = {queue: myQueueName, noAck: true};
 *    channel.getBasic(config, callback);
 * </pre>
 *
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           queue: 'queue_name_str_value',
 *                           noAck: true|false
 *                         }
 *                        </pre>
 * Required parameter 'queue' specifies the queue name. Boolean parameter 
 * 'noAck' is optional with false as the default value.
 * <p>
 * @param {Function} callback   Optional param specifies the function that is to be invoked on success.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name getBasic
 * @memberOf AmqpChannel#
 */
var getBasicFunc = AmqpChannel.prototype.getBasic;
AmqpChannel.prototype.getBasic = function(config, callback) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var queue = myConfig.queue;
       var noAck = myConfig.noAck || false;
       
       if (!queue || typeof queue != 'string') {
           throw new Error("AmqpChannel.getBasic(): String parameter \'queue\' is required");
       }

       if (typeof noAck != 'boolean') {
           throw new Error("AmqpChannel.getBasic(): Parameter \'noAck\' only accepts boolean values");
       }
       
       return getBasicFunc.call(this, queue, noAck, callback);
   }
   else {
       return getBasicFunc.apply(this, arguments);
   }
};

/**
 * This method acknowledges one or more messages delivered via the Deliver
 * or Get-Ok methods. The client can ask to confirm a single message or a set of 
 * messages up to and including a specific message.
 * 
 * <p> AmqpChannel.ackBasic() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * 
 * <pre>
 *    var channel = ...;
 *    var config = {deliveryTag: dt, multiple: true};
 *    channel.ackBasic(config);
 * </pre>
 *
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           deliveryTag: dt_num_value,
 *                           multiple: true|false
 *                         }
 *                        </pre>
 * Parameter 'deliveryTag' is required. Boolean parameter 'multiple' is optional
 * with false as the default value.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name ackBasic
 * @memberOf AmqpChannel#
 */
var ackBasicFunc = AmqpChannel.prototype.ackBasic;
AmqpChannel.prototype.ackBasic = function(config) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var deliveryTag = myConfig.deliveryTag;
       var multiple = myConfig.multiple || false;
       
       if (!deliveryTag || typeof deliveryTag != 'number') {
           throw new Error("AmqpChannel.ackBasic(): Numeric parameter \'deliveryTag\' is required");
       }

       if (typeof multiple != 'boolean') {
           throw new Error("AmqpChannel.ackBasic(): Parameter \'multiple\' only accepts boolean values");
       }
       
       return ackBasicFunc.call(this, deliveryTag, multiple, null);
   }
   else {
       return ackBasicFunc.apply(this, arguments);
   }
};


/**
 * This is the overloaded form of AmqpChannel.rejectBasic() function that 
 * named parameters or arguments using the Configuration object.
 * 
 * <p> AmqpChannel.rejectBasic() function supports named parameters or 
 * arguments using the Configuration object. Developers must invoke this 
 * function as shown below:
 * <pre>
 *    var channel = ...;
 *    var config = {deliveryTag: dt, requeue: true};
 *    channel.rejectBasic(config);
 * </pre>
 *
 * This method allows a client to reject a message. It can be used to interrupt 
 * and cancel large incoming messages, or return untreatable messages to their 
 * original queue.
 *
 * @param {Configuration} config    Format is as shown below:
 *                        <pre>
 *                         {
 *                           deliveryTag: dt_num_value,
 *                           requeue: true|false
 *                         }
 *                        </pre>
 * Parameter 'deliveryTag' is required. Boolean parameter 'requeue' is optional
 * with false as the default value.
 * <p>
 * @return {AmqpChannel}
 *
 * @public
 * @function
 * @name rejectBasic
 * @memberOf AmqpChannel#
 */
var rejectBasicFunc = AmqpChannel.prototype.rejectBasic;
AmqpChannel.prototype.rejectBasic = function(config) {
    if (typeof config == 'object') {
       myConfig = config || {};
       var deliveryTag = myConfig.deliveryTag;
       var requeue = myConfig.requeue || false;
       
       if (!deliveryTag || typeof deliveryTag != 'number') {
           throw new Error("AmqpChannel.rejectBasic(): Numeric parameter \'deliveryTag\' is required");
       }

       if (typeof requeue != 'boolean') {
           throw new Error("AmqpChannel.rejectBasic(): Parameter \'requeue\' only accepts boolean values");
       }
       
       return rejectBasicFunc.call(this, deliveryTag, requeue, null);
   }
   else {
       return rejectBasicFunc.apply(this, arguments);
   }
};

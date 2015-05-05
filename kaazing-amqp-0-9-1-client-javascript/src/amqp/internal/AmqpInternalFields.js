/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

////////////////////////////////////////////////////////////////////////////////
// AMQP Internal lookup structures
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// index->classes
////////////////////////////////////////////////////////////////////////////////
var _classLookup = {

    10 : _classes.Connection, 
    20 : _classes.Channel, 
    40 : _classes.Exchange, 
    50 : _classes.Queue, 
    60 : _classes.Basic, 
    90 : _classes.Tx
};

////////////////////////////////////////////////////////////////////////////////
// methodName->function object
////////////////////////////////////////////////////////////////////////////////
var _methodsByName = {
  "startConnection" : _classes.Connection.startConnection ,"startOkConnection" : _classes.Connection.startOkConnection ,"secureConnection" : _classes.Connection.secureConnection ,"secureOkConnection" : _classes.Connection.secureOkConnection ,"tuneConnection" : _classes.Connection.tuneConnection ,"tuneOkConnection" : _classes.Connection.tuneOkConnection ,"openConnection" : _classes.Connection.openConnection ,"openOkConnection" : _classes.Connection.openOkConnection ,"closeConnection" : _classes.Connection.closeConnection ,"closeOkConnection" : _classes.Connection.closeOkConnection 
,"openChannel" : _classes.Channel.openChannel ,"openOkChannel" : _classes.Channel.openOkChannel ,"flowChannel" : _classes.Channel.flowChannel ,"flowOkChannel" : _classes.Channel.flowOkChannel ,"closeChannel" : _classes.Channel.closeChannel ,"closeOkChannel" : _classes.Channel.closeOkChannel 
,"declareExchange" : _classes.Exchange.declareExchange ,"declareOkExchange" : _classes.Exchange.declareOkExchange ,"deleteExchange" : _classes.Exchange.deleteExchange ,"deleteOkExchange" : _classes.Exchange.deleteOkExchange 
,"declareQueue" : _classes.Queue.declareQueue ,"declareOkQueue" : _classes.Queue.declareOkQueue ,"bindQueue" : _classes.Queue.bindQueue ,"bindOkQueue" : _classes.Queue.bindOkQueue ,"unbindQueue" : _classes.Queue.unbindQueue ,"unbindOkQueue" : _classes.Queue.unbindOkQueue ,"purgeQueue" : _classes.Queue.purgeQueue ,"purgeOkQueue" : _classes.Queue.purgeOkQueue ,"deleteQueue" : _classes.Queue.deleteQueue ,"deleteOkQueue" : _classes.Queue.deleteOkQueue 
,"qosBasic" : _classes.Basic.qosBasic ,"qosOkBasic" : _classes.Basic.qosOkBasic ,"consumeBasic" : _classes.Basic.consumeBasic ,"consumeOkBasic" : _classes.Basic.consumeOkBasic ,"cancelBasic" : _classes.Basic.cancelBasic ,"cancelOkBasic" : _classes.Basic.cancelOkBasic ,"publishBasic" : _classes.Basic.publishBasic ,"returnBasic" : _classes.Basic.returnBasic ,"deliverBasic" : _classes.Basic.deliverBasic ,"getBasic" : _classes.Basic.getBasic ,"getOkBasic" : _classes.Basic.getOkBasic ,"getEmptyBasic" : _classes.Basic.getEmptyBasic ,"ackBasic" : _classes.Basic.ackBasic ,"rejectBasic" : _classes.Basic.rejectBasic ,"recoverAsyncBasic" : _classes.Basic.recoverAsyncBasic ,"recoverBasic" : _classes.Basic.recoverBasic ,"recoverOkBasic" : _classes.Basic.recoverOkBasic 
,"selectTx" : _classes.Tx.selectTx ,"selectOkTx" : _classes.Tx.selectOkTx ,"commitTx" : _classes.Tx.commitTx ,"commitOkTx" : _classes.Tx.commitOkTx ,"rollbackTx" : _classes.Tx.rollbackTx ,"rollbackOkTx" : _classes.Tx.rollbackOkTx 

};
////////////////////////////////////////////////////////////////////////////////
// AMQP Basic Content fields
////////////////////////////////////////////////////////////////////////////////
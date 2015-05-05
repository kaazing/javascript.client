/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

////////////////////////////////////////////////////////////////////////////////
// AMQP Methods
//
// TODO (optimization):
// As a second pass, we can reduce the generated file size by making these
// structures literals instead of instantiating empty objects and populating
// them with assignment operators.
////////////////////////////////////////////////////////////////////////////////

var _classes = {};


_classes.Connection = {};
_classes.Connection.startConnection = {};

    _classes.Connection.startConnection.allParameters = [ { "name" : "versionMajor", "type" : "Octet"},  { "name" : "versionMinor", "type" : "Octet"},  { "name" : "serverProperties", "type" : "PeerProperties"},  { "name" : "mechanisms", "type" : "Longstr"},  { "name" : "locales", "type" : "Longstr"}];

    _classes.Connection.startConnection.returnType = "StartOkConnection";
    _classes.Connection.startConnection.index = 10;
    _classes.Connection.startConnection.classIndex = 10;
    _classes.Connection.startConnection.synchronous = true;
    _classes.Connection.startConnection.hasContent = false;
_classes.Connection.startOkConnection = {};

    _classes.Connection.startOkConnection.allParameters = [ { "name" : "clientProperties", "type" : "PeerProperties"},  { "name" : "mechanism", "type" : "Shortstr"},  { "name" : "response", "type" : "Longstr"},  { "name" : "locale", "type" : "Shortstr"}];

    _classes.Connection.startOkConnection.returnType = "voidConnection";
    _classes.Connection.startOkConnection.index = 11;
    _classes.Connection.startOkConnection.classIndex = 10;
    _classes.Connection.startOkConnection.synchronous = true;
    _classes.Connection.startOkConnection.hasContent = false;
_classes.Connection.secureConnection = {};

    _classes.Connection.secureConnection.allParameters = [ { "name" : "challenge", "type" : "Longstr"}];

    _classes.Connection.secureConnection.returnType = "SecureOkConnection";
    _classes.Connection.secureConnection.index = 20;
    _classes.Connection.secureConnection.classIndex = 10;
    _classes.Connection.secureConnection.synchronous = true;
    _classes.Connection.secureConnection.hasContent = false;
_classes.Connection.secureOkConnection = {};

    _classes.Connection.secureOkConnection.allParameters = [ { "name" : "response", "type" : "Longstr"}];

    _classes.Connection.secureOkConnection.returnType = "voidConnection";
    _classes.Connection.secureOkConnection.index = 21;
    _classes.Connection.secureOkConnection.classIndex = 10;
    _classes.Connection.secureOkConnection.synchronous = true;
    _classes.Connection.secureOkConnection.hasContent = false;
_classes.Connection.tuneConnection = {};

    _classes.Connection.tuneConnection.allParameters = [ { "name" : "channelMax", "type" : "Short"},  { "name" : "frameMax", "type" : "Long"},  { "name" : "heartbeat", "type" : "Short"}];

    _classes.Connection.tuneConnection.returnType = "TuneOkConnection";
    _classes.Connection.tuneConnection.index = 30;
    _classes.Connection.tuneConnection.classIndex = 10;
    _classes.Connection.tuneConnection.synchronous = true;
    _classes.Connection.tuneConnection.hasContent = false;
_classes.Connection.tuneOkConnection = {};

    _classes.Connection.tuneOkConnection.allParameters = [ { "name" : "channelMax", "type" : "Short"},  { "name" : "frameMax", "type" : "Long"},  { "name" : "heartbeat", "type" : "Short"}];

    _classes.Connection.tuneOkConnection.returnType = "voidConnection";
    _classes.Connection.tuneOkConnection.index = 31;
    _classes.Connection.tuneOkConnection.classIndex = 10;
    _classes.Connection.tuneOkConnection.synchronous = true;
    _classes.Connection.tuneOkConnection.hasContent = false;
_classes.Connection.openConnection = {};

    _classes.Connection.openConnection.allParameters = [ { "name" : "virtualHost", "type" : "Path"},  { "name" : "reserved1", "type" : "Shortstr"},  { "name" : "reserved2", "type" : "Bit"}];

    _classes.Connection.openConnection.returnType = "OpenOkConnection";
    _classes.Connection.openConnection.index = 40;
    _classes.Connection.openConnection.classIndex = 10;
    _classes.Connection.openConnection.synchronous = true;
    _classes.Connection.openConnection.hasContent = false;
_classes.Connection.openOkConnection = {};

    _classes.Connection.openOkConnection.allParameters = [ { "name" : "reserved1", "type" : "Shortstr"}];

    _classes.Connection.openOkConnection.returnType = "voidConnection";
    _classes.Connection.openOkConnection.index = 41;
    _classes.Connection.openOkConnection.classIndex = 10;
    _classes.Connection.openOkConnection.synchronous = true;
    _classes.Connection.openOkConnection.hasContent = false;
_classes.Connection.closeConnection = {};

    _classes.Connection.closeConnection.allParameters = [ { "name" : "replyCode", "type" : "ReplyCode"},  { "name" : "replyText", "type" : "ReplyText"},  { "name" : "classId", "type" : "ClassId"},  { "name" : "methodId", "type" : "MethodId"}];

    _classes.Connection.closeConnection.returnType = "CloseOkConnection";
    _classes.Connection.closeConnection.index = 50;
    _classes.Connection.closeConnection.classIndex = 10;
    _classes.Connection.closeConnection.synchronous = true;
    _classes.Connection.closeConnection.hasContent = false;
_classes.Connection.closeOkConnection = {};

    _classes.Connection.closeOkConnection.allParameters = [];

    _classes.Connection.closeOkConnection.returnType = "voidConnection";
    _classes.Connection.closeOkConnection.index = 51;
    _classes.Connection.closeOkConnection.classIndex = 10;
    _classes.Connection.closeOkConnection.synchronous = true;
    _classes.Connection.closeOkConnection.hasContent = false;


_classes.Connection.methodLookup = {10 : "startConnection", 11 : "startOkConnection", 20 : "secureConnection", 21 : "secureOkConnection", 30 : "tuneConnection", 31 : "tuneOkConnection", 40 : "openConnection", 41 : "openOkConnection", 50 : "closeConnection", 51 : "closeOkConnection"}
_classes.Connection.className = "Connection";

_classes.Channel = {};
_classes.Channel.openChannel = {};

    _classes.Channel.openChannel.allParameters = [ { "name" : "reserved1", "type" : "Shortstr"}];

    _classes.Channel.openChannel.returnType = "OpenOkChannel";
    _classes.Channel.openChannel.index = 10;
    _classes.Channel.openChannel.classIndex = 20;
    _classes.Channel.openChannel.synchronous = true;
    _classes.Channel.openChannel.hasContent = false;
_classes.Channel.openOkChannel = {};

    _classes.Channel.openOkChannel.allParameters = [ { "name" : "reserved1", "type" : "Longstr"}];

    _classes.Channel.openOkChannel.returnType = "voidChannel";
    _classes.Channel.openOkChannel.index = 11;
    _classes.Channel.openOkChannel.classIndex = 20;
    _classes.Channel.openOkChannel.synchronous = true;
    _classes.Channel.openOkChannel.hasContent = false;
_classes.Channel.flowChannel = {};

    _classes.Channel.flowChannel.allParameters = [ { "name" : "active", "type" : "Bit"}];

    _classes.Channel.flowChannel.returnType = "FlowOkChannel";
    _classes.Channel.flowChannel.index = 20;
    _classes.Channel.flowChannel.classIndex = 20;
    _classes.Channel.flowChannel.synchronous = true;
    _classes.Channel.flowChannel.hasContent = false;
_classes.Channel.flowOkChannel = {};

    _classes.Channel.flowOkChannel.allParameters = [ { "name" : "active", "type" : "Bit"}];

    _classes.Channel.flowOkChannel.returnType = "voidChannel";
    _classes.Channel.flowOkChannel.index = 21;
    _classes.Channel.flowOkChannel.classIndex = 20;
    _classes.Channel.flowOkChannel.synchronous = false;
    _classes.Channel.flowOkChannel.hasContent = false;
_classes.Channel.closeChannel = {};

    _classes.Channel.closeChannel.allParameters = [ { "name" : "replyCode", "type" : "ReplyCode"},  { "name" : "replyText", "type" : "ReplyText"},  { "name" : "classId", "type" : "ClassId"},  { "name" : "methodId", "type" : "MethodId"}];

    _classes.Channel.closeChannel.returnType = "CloseOkChannel";
    _classes.Channel.closeChannel.index = 40;
    _classes.Channel.closeChannel.classIndex = 20;
    _classes.Channel.closeChannel.synchronous = true;
    _classes.Channel.closeChannel.hasContent = false;
_classes.Channel.closeOkChannel = {};

    _classes.Channel.closeOkChannel.allParameters = [];

    _classes.Channel.closeOkChannel.returnType = "voidChannel";
    _classes.Channel.closeOkChannel.index = 41;
    _classes.Channel.closeOkChannel.classIndex = 20;
    _classes.Channel.closeOkChannel.synchronous = true;
    _classes.Channel.closeOkChannel.hasContent = false;


_classes.Channel.methodLookup = {10 : "openChannel", 11 : "openOkChannel", 20 : "flowChannel", 21 : "flowOkChannel", 40 : "closeChannel", 41 : "closeOkChannel"}
_classes.Channel.className = "Channel";

_classes.Exchange = {};
_classes.Exchange.declareExchange = {};

    _classes.Exchange.declareExchange.allParameters = [ { "name" : "reserved1", "type" : "Short"},  { "name" : "exchange", "type" : "ExchangeName"},  { "name" : "type", "type" : "Shortstr"},  { "name" : "passive", "type" : "Bit"},  { "name" : "durable", "type" : "Bit"},  { "name" : "reserved2", "type" : "Bit"},  { "name" : "reserved3", "type" : "Bit"},  { "name" : "noWait", "type" : "NoWait"},  { "name" : "arguments", "type" : "Table"}];

    _classes.Exchange.declareExchange.returnType = "DeclareOkExchange";
    _classes.Exchange.declareExchange.index = 10;
    _classes.Exchange.declareExchange.classIndex = 40;
    _classes.Exchange.declareExchange.synchronous = true;
    _classes.Exchange.declareExchange.hasContent = false;
_classes.Exchange.declareOkExchange = {};

    _classes.Exchange.declareOkExchange.allParameters = [];

    _classes.Exchange.declareOkExchange.returnType = "voidExchange";
    _classes.Exchange.declareOkExchange.index = 11;
    _classes.Exchange.declareOkExchange.classIndex = 40;
    _classes.Exchange.declareOkExchange.synchronous = true;
    _classes.Exchange.declareOkExchange.hasContent = false;
_classes.Exchange.deleteExchange = {};

    _classes.Exchange.deleteExchange.allParameters = [ { "name" : "reserved1", "type" : "Short"},  { "name" : "exchange", "type" : "ExchangeName"},  { "name" : "ifUnused", "type" : "Bit"},  { "name" : "noWait", "type" : "NoWait"}];

    _classes.Exchange.deleteExchange.returnType = "DeleteOkExchange";
    _classes.Exchange.deleteExchange.index = 20;
    _classes.Exchange.deleteExchange.classIndex = 40;
    _classes.Exchange.deleteExchange.synchronous = true;
    _classes.Exchange.deleteExchange.hasContent = false;
_classes.Exchange.deleteOkExchange = {};

    _classes.Exchange.deleteOkExchange.allParameters = [];

    _classes.Exchange.deleteOkExchange.returnType = "voidExchange";
    _classes.Exchange.deleteOkExchange.index = 21;
    _classes.Exchange.deleteOkExchange.classIndex = 40;
    _classes.Exchange.deleteOkExchange.synchronous = true;
    _classes.Exchange.deleteOkExchange.hasContent = false;


_classes.Exchange.methodLookup = {10 : "declareExchange", 11 : "declareOkExchange", 20 : "deleteExchange", 21 : "deleteOkExchange"}
_classes.Exchange.className = "Exchange";

_classes.Queue = {};
_classes.Queue.declareQueue = {};

    _classes.Queue.declareQueue.allParameters = [ { "name" : "reserved1", "type" : "Short"},  { "name" : "queue", "type" : "QueueName"},  { "name" : "passive", "type" : "Bit"},  { "name" : "durable", "type" : "Bit"},  { "name" : "exclusive", "type" : "Bit"},  { "name" : "autoDelete", "type" : "Bit"},  { "name" : "noWait", "type" : "NoWait"},  { "name" : "arguments", "type" : "Table"}];

    _classes.Queue.declareQueue.returnType = "DeclareOkQueue";
    _classes.Queue.declareQueue.index = 10;
    _classes.Queue.declareQueue.classIndex = 50;
    _classes.Queue.declareQueue.synchronous = true;
    _classes.Queue.declareQueue.hasContent = false;
_classes.Queue.declareOkQueue = {};

    _classes.Queue.declareOkQueue.allParameters = [ { "name" : "queue", "type" : "QueueName"},  { "name" : "messageCount", "type" : "MessageCount"},  { "name" : "consumerCount", "type" : "Long"}];

    _classes.Queue.declareOkQueue.returnType = "voidQueue";
    _classes.Queue.declareOkQueue.index = 11;
    _classes.Queue.declareOkQueue.classIndex = 50;
    _classes.Queue.declareOkQueue.synchronous = true;
    _classes.Queue.declareOkQueue.hasContent = false;
_classes.Queue.bindQueue = {};

    _classes.Queue.bindQueue.allParameters = [ { "name" : "reserved1", "type" : "Short"},  { "name" : "queue", "type" : "QueueName"},  { "name" : "exchange", "type" : "ExchangeName"},  { "name" : "routingKey", "type" : "Shortstr"},  { "name" : "noWait", "type" : "NoWait"},  { "name" : "arguments", "type" : "Table"}];

    _classes.Queue.bindQueue.returnType = "BindOkQueue";
    _classes.Queue.bindQueue.index = 20;
    _classes.Queue.bindQueue.classIndex = 50;
    _classes.Queue.bindQueue.synchronous = true;
    _classes.Queue.bindQueue.hasContent = false;
_classes.Queue.bindOkQueue = {};

    _classes.Queue.bindOkQueue.allParameters = [];

    _classes.Queue.bindOkQueue.returnType = "voidQueue";
    _classes.Queue.bindOkQueue.index = 21;
    _classes.Queue.bindOkQueue.classIndex = 50;
    _classes.Queue.bindOkQueue.synchronous = true;
    _classes.Queue.bindOkQueue.hasContent = false;
_classes.Queue.unbindQueue = {};

    _classes.Queue.unbindQueue.allParameters = [ { "name" : "reserved1", "type" : "Short"},  { "name" : "queue", "type" : "QueueName"},  { "name" : "exchange", "type" : "ExchangeName"},  { "name" : "routingKey", "type" : "Shortstr"},  { "name" : "arguments", "type" : "Table"}];

    _classes.Queue.unbindQueue.returnType = "UnbindOkQueue";
    _classes.Queue.unbindQueue.index = 50;
    _classes.Queue.unbindQueue.classIndex = 50;
    _classes.Queue.unbindQueue.synchronous = true;
    _classes.Queue.unbindQueue.hasContent = false;
_classes.Queue.unbindOkQueue = {};

    _classes.Queue.unbindOkQueue.allParameters = [];

    _classes.Queue.unbindOkQueue.returnType = "voidQueue";
    _classes.Queue.unbindOkQueue.index = 51;
    _classes.Queue.unbindOkQueue.classIndex = 50;
    _classes.Queue.unbindOkQueue.synchronous = true;
    _classes.Queue.unbindOkQueue.hasContent = false;
_classes.Queue.purgeQueue = {};

    _classes.Queue.purgeQueue.allParameters = [ { "name" : "reserved1", "type" : "Short"},  { "name" : "queue", "type" : "QueueName"},  { "name" : "noWait", "type" : "NoWait"}];

    _classes.Queue.purgeQueue.returnType = "PurgeOkQueue";
    _classes.Queue.purgeQueue.index = 30;
    _classes.Queue.purgeQueue.classIndex = 50;
    _classes.Queue.purgeQueue.synchronous = true;
    _classes.Queue.purgeQueue.hasContent = false;
_classes.Queue.purgeOkQueue = {};

    _classes.Queue.purgeOkQueue.allParameters = [ { "name" : "messageCount", "type" : "MessageCount"}];

    _classes.Queue.purgeOkQueue.returnType = "voidQueue";
    _classes.Queue.purgeOkQueue.index = 31;
    _classes.Queue.purgeOkQueue.classIndex = 50;
    _classes.Queue.purgeOkQueue.synchronous = true;
    _classes.Queue.purgeOkQueue.hasContent = false;
_classes.Queue.deleteQueue = {};

    _classes.Queue.deleteQueue.allParameters = [ { "name" : "reserved1", "type" : "Short"},  { "name" : "queue", "type" : "QueueName"},  { "name" : "ifUnused", "type" : "Bit"},  { "name" : "ifEmpty", "type" : "Bit"},  { "name" : "noWait", "type" : "NoWait"}];

    _classes.Queue.deleteQueue.returnType = "DeleteOkQueue";
    _classes.Queue.deleteQueue.index = 40;
    _classes.Queue.deleteQueue.classIndex = 50;
    _classes.Queue.deleteQueue.synchronous = true;
    _classes.Queue.deleteQueue.hasContent = false;
_classes.Queue.deleteOkQueue = {};

    _classes.Queue.deleteOkQueue.allParameters = [ { "name" : "messageCount", "type" : "MessageCount"}];

    _classes.Queue.deleteOkQueue.returnType = "voidQueue";
    _classes.Queue.deleteOkQueue.index = 41;
    _classes.Queue.deleteOkQueue.classIndex = 50;
    _classes.Queue.deleteOkQueue.synchronous = true;
    _classes.Queue.deleteOkQueue.hasContent = false;


_classes.Queue.methodLookup = {10 : "declareQueue", 11 : "declareOkQueue", 20 : "bindQueue", 21 : "bindOkQueue", 50 : "unbindQueue", 51 : "unbindOkQueue", 30 : "purgeQueue", 31 : "purgeOkQueue", 40 : "deleteQueue", 41 : "deleteOkQueue"}
_classes.Queue.className = "Queue";

_classes.Basic = {};
_classes.Basic.qosBasic = {};

    _classes.Basic.qosBasic.allParameters = [ { "name" : "prefetchSize", "type" : "Long"},  { "name" : "prefetchCount", "type" : "Short"},  { "name" : "global", "type" : "Bit"}];

    _classes.Basic.qosBasic.returnType = "QosOkBasic";
    _classes.Basic.qosBasic.index = 10;
    _classes.Basic.qosBasic.classIndex = 60;
    _classes.Basic.qosBasic.synchronous = true;
    _classes.Basic.qosBasic.hasContent = false;
_classes.Basic.qosOkBasic = {};

    _classes.Basic.qosOkBasic.allParameters = [];

    _classes.Basic.qosOkBasic.returnType = "voidBasic";
    _classes.Basic.qosOkBasic.index = 11;
    _classes.Basic.qosOkBasic.classIndex = 60;
    _classes.Basic.qosOkBasic.synchronous = true;
    _classes.Basic.qosOkBasic.hasContent = false;
_classes.Basic.consumeBasic = {};

    _classes.Basic.consumeBasic.allParameters = [ { "name" : "reserved1", "type" : "Short"},  { "name" : "queue", "type" : "QueueName"},  { "name" : "consumerTag", "type" : "ConsumerTag"},  { "name" : "noLocal", "type" : "NoLocal"},  { "name" : "noAck", "type" : "NoAck"},  { "name" : "exclusive", "type" : "Bit"},  { "name" : "noWait", "type" : "NoWait"},  { "name" : "arguments", "type" : "Table"}];

    _classes.Basic.consumeBasic.returnType = "ConsumeOkBasic";
    _classes.Basic.consumeBasic.index = 20;
    _classes.Basic.consumeBasic.classIndex = 60;
    _classes.Basic.consumeBasic.synchronous = true;
    _classes.Basic.consumeBasic.hasContent = false;
_classes.Basic.consumeOkBasic = {};

    _classes.Basic.consumeOkBasic.allParameters = [ { "name" : "consumerTag", "type" : "ConsumerTag"}];

    _classes.Basic.consumeOkBasic.returnType = "voidBasic";
    _classes.Basic.consumeOkBasic.index = 21;
    _classes.Basic.consumeOkBasic.classIndex = 60;
    _classes.Basic.consumeOkBasic.synchronous = true;
    _classes.Basic.consumeOkBasic.hasContent = false;
_classes.Basic.cancelBasic = {};

    _classes.Basic.cancelBasic.allParameters = [ { "name" : "consumerTag", "type" : "ConsumerTag"},  { "name" : "noWait", "type" : "NoWait"}];

    _classes.Basic.cancelBasic.returnType = "CancelOkBasic";
    _classes.Basic.cancelBasic.index = 30;
    _classes.Basic.cancelBasic.classIndex = 60;
    _classes.Basic.cancelBasic.synchronous = true;
    _classes.Basic.cancelBasic.hasContent = false;
_classes.Basic.cancelOkBasic = {};

    _classes.Basic.cancelOkBasic.allParameters = [ { "name" : "consumerTag", "type" : "ConsumerTag"}];

    _classes.Basic.cancelOkBasic.returnType = "voidBasic";
    _classes.Basic.cancelOkBasic.index = 31;
    _classes.Basic.cancelOkBasic.classIndex = 60;
    _classes.Basic.cancelOkBasic.synchronous = true;
    _classes.Basic.cancelOkBasic.hasContent = false;
_classes.Basic.publishBasic = {};

    _classes.Basic.publishBasic.allParameters = [ { "name" : "reserved1", "type" : "Short"},  { "name" : "exchange", "type" : "ExchangeName"},  { "name" : "routingKey", "type" : "Shortstr"},  { "name" : "mandatory", "type" : "Bit"},  { "name" : "immediate", "type" : "Bit"}];

    _classes.Basic.publishBasic.returnType = "voidBasic";
    _classes.Basic.publishBasic.index = 40;
    _classes.Basic.publishBasic.classIndex = 60;
    _classes.Basic.publishBasic.synchronous = false;
    _classes.Basic.publishBasic.hasContent = true;
_classes.Basic.returnBasic = {};

    _classes.Basic.returnBasic.allParameters = [ { "name" : "replyCode", "type" : "ReplyCode"},  { "name" : "replyText", "type" : "ReplyText"},  { "name" : "exchange", "type" : "ExchangeName"},  { "name" : "routingKey", "type" : "Shortstr"}];

    _classes.Basic.returnBasic.returnType = "voidBasic";
    _classes.Basic.returnBasic.index = 50;
    _classes.Basic.returnBasic.classIndex = 60;
    _classes.Basic.returnBasic.synchronous = false;
    _classes.Basic.returnBasic.hasContent = true;
_classes.Basic.deliverBasic = {};

    _classes.Basic.deliverBasic.allParameters = [ { "name" : "consumerTag", "type" : "ConsumerTag"},  { "name" : "deliveryTag", "type" : "DeliveryTag"},  { "name" : "redelivered", "type" : "Redelivered"},  { "name" : "exchange", "type" : "ExchangeName"},  { "name" : "routingKey", "type" : "Shortstr"}];

    _classes.Basic.deliverBasic.returnType = "voidBasic";
    _classes.Basic.deliverBasic.index = 60;
    _classes.Basic.deliverBasic.classIndex = 60;
    _classes.Basic.deliverBasic.synchronous = false;
    _classes.Basic.deliverBasic.hasContent = true;
_classes.Basic.getBasic = {};

    _classes.Basic.getBasic.allParameters = [ { "name" : "reserved1", "type" : "Short"},  { "name" : "queue", "type" : "QueueName"},  { "name" : "noAck", "type" : "NoAck"}];

    _classes.Basic.getBasic.returnType = "GetOkBasic";
    _classes.Basic.getBasic.index = 70;
    _classes.Basic.getBasic.classIndex = 60;
    _classes.Basic.getBasic.synchronous = true;
    _classes.Basic.getBasic.hasContent = false;
_classes.Basic.getOkBasic = {};

    _classes.Basic.getOkBasic.allParameters = [ { "name" : "deliveryTag", "type" : "DeliveryTag"},  { "name" : "redelivered", "type" : "Redelivered"},  { "name" : "exchange", "type" : "ExchangeName"},  { "name" : "routingKey", "type" : "Shortstr"},  { "name" : "messageCount", "type" : "MessageCount"}];

    _classes.Basic.getOkBasic.returnType = "voidBasic";
    _classes.Basic.getOkBasic.index = 71;
    _classes.Basic.getOkBasic.classIndex = 60;
    _classes.Basic.getOkBasic.synchronous = true;
    _classes.Basic.getOkBasic.hasContent = true;
_classes.Basic.getEmptyBasic = {};

    _classes.Basic.getEmptyBasic.allParameters = [ { "name" : "reserved1", "type" : "Shortstr"}];

    _classes.Basic.getEmptyBasic.returnType = "voidBasic";
    _classes.Basic.getEmptyBasic.index = 72;
    _classes.Basic.getEmptyBasic.classIndex = 60;
    _classes.Basic.getEmptyBasic.synchronous = true;
    _classes.Basic.getEmptyBasic.hasContent = false;
_classes.Basic.ackBasic = {};

    _classes.Basic.ackBasic.allParameters = [ { "name" : "deliveryTag", "type" : "DeliveryTag"},  { "name" : "multiple", "type" : "Bit"}];

    _classes.Basic.ackBasic.returnType = "voidBasic";
    _classes.Basic.ackBasic.index = 80;
    _classes.Basic.ackBasic.classIndex = 60;
    _classes.Basic.ackBasic.synchronous = false;
    _classes.Basic.ackBasic.hasContent = false;
_classes.Basic.rejectBasic = {};

    _classes.Basic.rejectBasic.allParameters = [ { "name" : "deliveryTag", "type" : "DeliveryTag"},  { "name" : "requeue", "type" : "Bit"}];

    _classes.Basic.rejectBasic.returnType = "voidBasic";
    _classes.Basic.rejectBasic.index = 90;
    _classes.Basic.rejectBasic.classIndex = 60;
    _classes.Basic.rejectBasic.synchronous = false;
    _classes.Basic.rejectBasic.hasContent = false;
_classes.Basic.recoverAsyncBasic = {};

    _classes.Basic.recoverAsyncBasic.allParameters = [ { "name" : "requeue", "type" : "Bit"}];

    _classes.Basic.recoverAsyncBasic.returnType = "voidBasic";
    _classes.Basic.recoverAsyncBasic.index = 100;
    _classes.Basic.recoverAsyncBasic.classIndex = 60;
    _classes.Basic.recoverAsyncBasic.synchronous = false;
    _classes.Basic.recoverAsyncBasic.hasContent = false;
_classes.Basic.recoverBasic = {};

    _classes.Basic.recoverBasic.allParameters = [ { "name" : "requeue", "type" : "Bit"}];

    _classes.Basic.recoverBasic.returnType = "voidBasic";
    _classes.Basic.recoverBasic.index = 110;
    _classes.Basic.recoverBasic.classIndex = 60;
    _classes.Basic.recoverBasic.synchronous = false;
    _classes.Basic.recoverBasic.hasContent = false;
_classes.Basic.recoverOkBasic = {};

    _classes.Basic.recoverOkBasic.allParameters = [];

    _classes.Basic.recoverOkBasic.returnType = "voidBasic";
    _classes.Basic.recoverOkBasic.index = 111;
    _classes.Basic.recoverOkBasic.classIndex = 60;
    _classes.Basic.recoverOkBasic.synchronous = true;
    _classes.Basic.recoverOkBasic.hasContent = false;


_classes.Basic.methodLookup = {10 : "qosBasic", 11 : "qosOkBasic", 20 : "consumeBasic", 21 : "consumeOkBasic", 30 : "cancelBasic", 31 : "cancelOkBasic", 40 : "publishBasic", 50 : "returnBasic", 60 : "deliverBasic", 70 : "getBasic", 71 : "getOkBasic", 72 : "getEmptyBasic", 80 : "ackBasic", 90 : "rejectBasic", 100 : "recoverAsyncBasic", 110 : "recoverBasic", 111 : "recoverOkBasic"}
_classes.Basic.className = "Basic";

_classes.Tx = {};
_classes.Tx.selectTx = {};

    _classes.Tx.selectTx.allParameters = [];

    _classes.Tx.selectTx.returnType = "SelectOkTx";
    _classes.Tx.selectTx.index = 10;
    _classes.Tx.selectTx.classIndex = 90;
    _classes.Tx.selectTx.synchronous = true;
    _classes.Tx.selectTx.hasContent = false;
_classes.Tx.selectOkTx = {};

    _classes.Tx.selectOkTx.allParameters = [];

    _classes.Tx.selectOkTx.returnType = "voidTx";
    _classes.Tx.selectOkTx.index = 11;
    _classes.Tx.selectOkTx.classIndex = 90;
    _classes.Tx.selectOkTx.synchronous = true;
    _classes.Tx.selectOkTx.hasContent = false;
_classes.Tx.commitTx = {};

    _classes.Tx.commitTx.allParameters = [];

    _classes.Tx.commitTx.returnType = "CommitOkTx";
    _classes.Tx.commitTx.index = 20;
    _classes.Tx.commitTx.classIndex = 90;
    _classes.Tx.commitTx.synchronous = true;
    _classes.Tx.commitTx.hasContent = false;
_classes.Tx.commitOkTx = {};

    _classes.Tx.commitOkTx.allParameters = [];

    _classes.Tx.commitOkTx.returnType = "voidTx";
    _classes.Tx.commitOkTx.index = 21;
    _classes.Tx.commitOkTx.classIndex = 90;
    _classes.Tx.commitOkTx.synchronous = true;
    _classes.Tx.commitOkTx.hasContent = false;
_classes.Tx.rollbackTx = {};

    _classes.Tx.rollbackTx.allParameters = [];

    _classes.Tx.rollbackTx.returnType = "RollbackOkTx";
    _classes.Tx.rollbackTx.index = 30;
    _classes.Tx.rollbackTx.classIndex = 90;
    _classes.Tx.rollbackTx.synchronous = true;
    _classes.Tx.rollbackTx.hasContent = false;
_classes.Tx.rollbackOkTx = {};

    _classes.Tx.rollbackOkTx.allParameters = [];

    _classes.Tx.rollbackOkTx.returnType = "voidTx";
    _classes.Tx.rollbackOkTx.index = 31;
    _classes.Tx.rollbackOkTx.classIndex = 90;
    _classes.Tx.rollbackOkTx.synchronous = true;
    _classes.Tx.rollbackOkTx.hasContent = false;


_classes.Tx.methodLookup = {10 : "selectTx", 11 : "selectOkTx", 20 : "commitTx", 21 : "commitOkTx", 30 : "rollbackTx", 31 : "rollbackOkTx"}
_classes.Tx.className = "Tx";
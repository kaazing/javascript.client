/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

////////////////////////////////////////////////////////////////////////////////
// AMQP Domains
////////////////////////////////////////////////////////////////////////////////

var _domains = {

    "ClassId" : 
        { "type" : "short",
          "asserts" : [ ]
        }, 
    "ConsumerTag" : 
        { "type" : "shortstr",
          "asserts" : [ ]
        }, 
    "DeliveryTag" : 
        { "type" : "longlong",
          "asserts" : [ ]
        }, 
    "ExchangeName" : 
        { "type" : "shortstr",
          "asserts" : [ ]
        }, 
    "MethodId" : 
        { "type" : "short",
          "asserts" : [ ]
        }, 
    "NoAck" : 
        { "type" : "bit",
          "asserts" : [ ]
        }, 
    "NoLocal" : 
        { "type" : "bit",
          "asserts" : [ ]
        }, 
    "NoWait" : 
        { "type" : "bit",
          "asserts" : [ ]
        }, 
    "Path" : 
        { "type" : "shortstr",
          "asserts" : [ ]
        }, 
    "PeerProperties" : 
        { "type" : "table",
          "asserts" : [ ]
        }, 
    "QueueName" : 
        { "type" : "shortstr",
          "asserts" : [ ]
        }, 
    "Redelivered" : 
        { "type" : "bit",
          "asserts" : [ ]
        }, 
    "MessageCount" : 
        { "type" : "long",
          "asserts" : [ ]
        }, 
    "ReplyCode" : 
        { "type" : "short",
          "asserts" : [ ]
        }, 
    "ReplyText" : 
        { "type" : "shortstr",
          "asserts" : [ ]
        }, 
    "Bit" : 
        { "type" : "bit",
          "asserts" : [ ]
        }, 
    "Octet" : 
        { "type" : "octet",
          "asserts" : [ ]
        }, 
    "Short" : 
        { "type" : "short",
          "asserts" : [ ]
        }, 
    "Long" : 
        { "type" : "long",
          "asserts" : [ ]
        }, 
    "Longlong" : 
        { "type" : "longlong",
          "asserts" : [ ]
        }, 
    "Shortstr" : 
        { "type" : "shortstr",
          "asserts" : [ ]
        }, 
    "Longstr" : 
        { "type" : "longstr",
          "asserts" : [ ]
        }, 
    "Timestamp" : 
        { "type" : "timestamp",
          "asserts" : [ ]
        }, 
    "Table" : 
        { "type" : "table",
          "asserts" : [ ]
        }
};
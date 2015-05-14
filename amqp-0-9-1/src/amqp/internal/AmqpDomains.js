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
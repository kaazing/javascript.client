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


// http://dev.w3.org/html5/postmsg/#event-definitions

/**
 MessageEvent

 @name  MessageEvent
 @class MessageEvent
 */
function MessageEvent(target_, data_, origin_) {
    return {
        target: target_,
        data: data_,
        origin: origin_,
        bubbles: true,
        cancelable: true,
        type: "message",
        lastEventId: ""
    }
}

/**
 Contents of the message.

 @field
 @readonly
 @name       data
 @type       Object
 @memberOf   MessageEvent#
 */

/**
 Origin that produced the message.
 See <a href="http://tools.ietf.org/html/rfc6454">RFC6455</a> The Web Origin
 Concept.

 @field
 @readonly
 @name       origin
 @type       String
 @memberOf   MessageEvent#
 */

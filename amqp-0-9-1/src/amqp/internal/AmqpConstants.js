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
// AMQP constants
////////////////////////////////////////////////////////////////////////////////
var _constants = {};
_constants.FRAME_METHOD = {"value": 1, "message" : ""};
_constants.FRAME_HEADER = {"value": 2, "message" : ""};
_constants.FRAME_BODY = {"value": 3, "message" : ""};
_constants.FRAME_HEARTBEAT = {"value": 8, "message" : ""};
_constants.FRAME_MIN_SIZE = {"value": 4096, "message" : ""};
_constants.FRAME_END = {"value": 206, "message" : ""};
_constants.REPLY_SUCCESS = {"value": 200, "message" : "Indicates that the method completed successfully. This reply code is reserved for future use - the current protocol design does not use positive confirmation and reply codes are sent only in case of an error."};
_constants.CONTENT_TOO_LARGE = {"value": 311, "message" : "The client attempted to transfer content larger than the server could accept at the present time. The client may retry at a later time."};
_constants.NO_CONSUMERS = {"value": 313, "message" : "When the exchange cannot deliver to a consumer when the immediate flag is set. As a result of pending data on the queue or the absence of any consumers of the queue."};
_constants.CONNECTION_FORCED = {"value": 320, "message" : "An operator intervened to close the connection for some reason. The client may retry at some later date."};
_constants.INVALID_PATH = {"value": 402, "message" : "The client tried to work with an unknown virtual host."};
_constants.ACCESS_REFUSED = {"value": 403, "message" : "The client attempted to work with a server entity to which it has no access due to security settings."};
_constants.NOT_FOUND = {"value": 404, "message" : "The client attempted to work with a server entity that does not exist."};
_constants.RESOURCE_LOCKED = {"value": 405, "message" : "The client attempted to work with a server entity to which it has no access because another client is working with it."};
_constants.PRECONDITION_FAILED = {"value": 406, "message" : "The client requested a method that was not allowed because some precondition failed."};
_constants.FRAME_ERROR = {"value": 501, "message" : "The sender sent a malformed frame that the recipient could not decode. This strongly implies a programming error in the sending peer."};
_constants.SYNTAX_ERROR = {"value": 502, "message" : "The sender sent a frame that contained illegal values for one or more fields. This strongly implies a programming error in the sending peer."};
_constants.COMMAND_INVALID = {"value": 503, "message" : "The client sent an invalid sequence of frames, attempting to perform an operation that was considered invalid by the server. This usually implies a programming error in the client."};
_constants.CHANNEL_ERROR = {"value": 504, "message" : "The client attempted to work with a channel that had not been correctly opened. This most likely indicates a fault in the client layer."};
_constants.UNEXPECTED_FRAME = {"value": 505, "message" : "The peer sent a frame that was not expected, usually in the context of a content header and body.  This strongly indicates a fault in the peer's content processing."};
_constants.RESOURCE_ERROR = {"value": 506, "message" : "The server could not complete the method because it lacked sufficient resources. This may be due to the client creating too many of some type of entity."};
_constants.NOT_ALLOWED = {"value": 530, "message" : "The client tried to work with some entity in a manner that is prohibited by the server, due to security settings or by some other criteria."};
_constants.NOT_IMPLEMENTED = {"value": 540, "message" : "The client tried to use functionality that is not implemented in the server."};
_constants.INTERNAL_ERROR = {"value": 541, "message" : "The server could not complete the method because of an internal error. The server may require intervention by an operator in order to resume normal operations."};

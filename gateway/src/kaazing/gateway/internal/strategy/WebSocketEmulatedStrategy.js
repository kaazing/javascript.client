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

(function() {

        var JAVASCRIPT_WSE =     "javascript:wse";
        var JAVASCRIPT_WSE_SSL = "javascript:wse+ssl";

        var handler = new WebSocketSelectedHandler();
        var emulatedHandler = new WebSocketEmulatedHandler();
        handler.setNextHandler(emulatedHandler);

        var channelFactory = new WebSocketEmulatedChannelFactory();

        WebSocketStrategy._strategyMap[JAVASCRIPT_WSE] = new WebSocketStrategy("ws", handler, channelFactory);
        WebSocketStrategy._strategyMap[JAVASCRIPT_WSE_SSL] = new WebSocketStrategy("wss", handler, channelFactory);

        WebSocketStrategy._strategyChoices["ws"].push(JAVASCRIPT_WSE);
        WebSocketStrategy._strategyChoices["wss"].push(JAVASCRIPT_WSE_SSL);

})();

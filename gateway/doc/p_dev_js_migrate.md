Migrate JavaScript Applications to KAAZING Gateway 5.0
==========================================================================

**Note:** To use the Gateway, a KAAZING client library, or a KAAZING demo, fork the repository from [kaazing.org](http://kaazing.org).

This topic explains how to migrate KAAZING Gateway 4.0 JavaScript clients to the WebSocket API in KAAZING Gateway 5.0.x. 

**Notes:**
 
Before You Begin
----------------

This procedure is part of [Build JavaScript WebSocket Clients](o_dev_js.md):

1.  [Use the JavaScript WebSocket API](p_dev_js_websocket.md)
2.  [Use the JavaScript EventSource API](p_dev_js_eventsource.md)
3.  **Migrate JavaScript Applications to KAAZING Gateway 5.0**
4.  [Secure Your JavaScript Client](p_dev_js_secure.md)
5.  [Display Logs for the JavaScript Client](p_clientlogging_js.md)

To Migrate KAAZING Gateway 4.x WebSocket JavaScript Applications to KAAZING Gateway 5.0
---------------------------------------------------------------------------------------

The only major changes from the KAAZING Gateway 4.x WebSocket API are changes to how namespace objects are accessed. In the KAAZING Gateway 4.x WebSocket API, all the publicly-accessible JavaScript objects were available under `window` object. However, in KAAZING Gateway 5.x, the namespace object `Kaazing.Gateway` is introduced and the JavaScript objects are now available under the `Kaazing.Gateway` namespace object.

In the KAAZING Gateway 4.x WebSocket API, the namespace object was accessed like this:

``` js
var factory = new WebSocketFactory();
websocket = factory.createWebSocket(wsurl.value);
```

In KAAZING Gateway 5.0.x, the namespace object is accessed using the full name:

``` js
var factory = new Kaazing.Gateway.WebSocketFactory();
websocket = factory.createWebSocket(wsurl.value);
```

To migrate your client, update your namespace object references to include the full name.

Next Step
---------

[Secure Your JavaScript Client](p_dev_js_secure.md)

See Also
--------

[JavaScript API](http://developer.kaazing.com/documentation/5.0/apidoc/client/javascript/gateway/index.html) documentation



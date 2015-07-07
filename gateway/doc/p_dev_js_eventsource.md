-   [Home](../../index.md)
-   [Documentation](../index.md)
-   Use the JavaScript EventSource API

Use the JavaScript EventSource API
=====================================================================

**Note:** To use the Gateway, a KAAZING client library, or a KAAZING demo, fork the repository from [kaazing.org](http://kaazing.org).

This section describes how you can use the `EventSource` API provided by the Kaazing JavaScript client library. This API allows you to take advantage of the Server-Sent Events standard as described in the [HTML5 specification](http://www.w3.org/html/wg/html5/#server-sent-events). For example, you can create a JavaScript client that uses the JavaScript HTML5 Communications client library to receive streaming data from a news feed or streaming financial data. The support for Server-Sent Events is provided by the `EventSource` class and its supporting classes.

The following steps show you how to use the `EventSource` API. This example highlights some of the most commonly used `EventSource` methods and is not meant to be an end-to-end tutorial. Refer to the [EventSource API documentation](http://developer.kaazing.com/documentation/5.0/apidoc/client/javascript/gateway/EventSource.html) for a complete description of all the available methods.

Before You Begin
----------------

This procedure is part of [Build JavaScript WebSocket Clients](o_dev_js.md):

1.  [Use the JavaScript WebSocket API](p_dev_js_websocket.md)
2.  **Use the JavaScript EventSource API**
3.  [Migrate JavaScript Applications to KAAZING Gateway 5.0](p_dev_js_migrate.md)
4.  [Secure Your JavaScript Client](p_dev_js_secure.md)
5.  [Display Logs for the JavaScript Client](p_clientlogging_js.md)

To Use the EventSource API with the Gateway
----------------------------------------------

1.  Add the required Server Sent Event library script reference:

    ``` xml
    <script type="text/javascript" language="javascript" src="ServerSentEvents.js"></script>
    ```

2.  Create a new `eventSource` object.

    ``` js
    var eventSource = new EventSource(url.value);
    ```

3.  Add listeners to the `eventSource` object to listen for eventSource events, as shown in the following example. The `eventSourceListener` has three methods: the `onopen` method is called when a Server-Sent Events connection is established, the `onmessage` method is called when messages are received, and the `onerror` method is called when errors occur.

    ``` js
    eventSource.onopen = updateStatus;
    eventSource.onerror = updateStatus
    eventSource.onmessage = function(event) {
      dataCell.innerHTML = event.data;
    }
    ```

Next Step
---------

[Migrate JavaScript Applications to KAAZING Gateway 5.0](p_dev_js_migrate.md)

See Also
--------

[EventSource API documentation](http://developer.kaazing.com/documentation/5.0/apidoc/client/javascript/gateway/EventSource.html)



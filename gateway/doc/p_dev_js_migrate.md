Migrate JavaScript Applications to KAAZING Gateway 5.0
==========================================================================

**Note:** To use the Gateway, a KAAZING client library, or a KAAZING demo, fork the repository from [kaazing.org](http://kaazing.org).

This topic explains how to migrate KAAZING Gateway 3.3-3.5 JavaScript clients built using the ByteSocket API to the WebSocket API in KAAZING Gateway 5.0. KAAZING Gateway 5.0 no longer includes the ByteSocket API because the WebSocket API in the KAAZING Gateway 5.0 JavaScript library supports binary messaging.

After the simple code changes described in this topic, updated ByteSocket implementations can continue to deliver binary messages using a ByteBuffer object in which you store the bytes that you want to send. The ByteSocket interface is now included in the WebSocket library to support existing ByteBuffer implementations. To use ByteBuffer, you must replace references to ByteSocket.js with WebSocket.js.

**Notes:**
 
-   Developers of WebSocket-based clients built using previous versions of KAAZING Gateway should be aware connection state changes in KAAZING Gateway 5.0. Previous versions of the Gateway used numeric values for `readyState` that are different than those in the finalized WebSocket API standard. KAAZING Gateway 5.0 uses the `readyState` values of the WebSocket API standard. For more information, see [Reading WebSocket Connection State](../dev-general/c_general_client_information.md).
-   When using ByteBuffer in KAAZING Gateway 5.0, the Gateway defaults to sending binary messages over the network.
-   The numeric value of the readyState attribute of a WebSocket connection has changed to align with the finalized WebSocket API standard. For more information, see [Reading WebSocket Connection State](../dev-general/c_general_client_information.md).
-   For binary data support details specific to the Gateway, see [the Gateway Configuration Options](../dev-general/c_general_client_information.md).

Before You Begin
----------------

This procedure is part of [Build JavaScript WebSocket Clients](o_dev_js.md):

1.  [Use the JavaScript WebSocket API](p_dev_js_websocket.md)
2.  [Use the JavaScript EventSource API](p_dev_js_eventsource.md)
3.  **Migrate JavaScript Applications to KAAZING Gateway 5.0**
4.  [Secure Your JavaScript Client](p_dev_js_secure.md)
5.  [Display Logs for the JavaScript Client](p_clientlogging_js.md)

To Migrate ByteSocket Applications to KAAZING Gateway 5.0
---------------------------------------------------------

1.  In your JavaScript client, replace the following `script` tag:

    ``` xml
    <script src="/javascript/ByteSocket.js"></script>
    ```

    with `script` tags for the WebSocket library (that also contains the ByteBuffer code):

    ``` xml
    <script src="/javascript/WebSocket.js"></script>
    ```

2.  Replace ByteSocket objects with WebSocket objects. For example, replace:

    ``` js
    byteSocket = new ByteSocket("ws://example.com:8000/path");
    ```

    with:

    ``` js
    var factory = new Kaazing.Gateway.WebSocketFactory();
    websocket = factory.createWebSocket("ws://example.com:8000/path");
    websocket.binaryType = "bytebuffer";
    ```

    The `websocket.binaryType = "bytebuffer"` statement creates a `ByteBuffer` object with the data received from the WebSocket message event. This is similar to how ByteSocket data objects were managed in KAAZING Gateway 3.x.

3.  The remaining code from a ByteSocket object needs only a minor change (highlighted below). When you send messages, you send binary data using a ByteBuffer object as shown in the following example. Since you are sending binary data, you first have to create a ByteBuffer object in which you store the bytes that you want to send.

    Here is an example of ByteSocket code from earlier versions of the Gateway. The function takes a text string entered by a user (`message.value`), puts the string into a buffer using the UTF-8 character set to encode the string as bytes (`putString()`), flips the buffer to put in read mode (`flip()`), and sends the buffer to the Gateway (`byteSocket.send(buf)`):

    ``` js
    send.onclick = function() {
        var buf = new ByteBuffer();
        buf.putString(message.value, Charset.UTF8);
        buf.flip();
        log("SENT: " + buf);
        byteSocket.send(buf);
    }
    ```

    Here is the equivalent function in WebSocket code from KAAZING Gateway 5.0:

    ``` js
    send.onclick = function() {
        var buf = new Kaazing.ByteBuffer();
        buf.putString(message.value, Kaazing.Charset.UTF8);
        buf.flip();
        log("SENT: " + buf);
        websocket.send(buf);
    }
    ```

    Note that the only different in these functions is that the ByteSocket object (`byteSocket`) is changed to a WebSocket object (`websocket`).

For more information, see the ByteBuffer in the [JavaScript API](http://tech.kaazing.com/documentation/gateway/4.0/apidoc/client/javascript/gateway/index.html).

Binary Support with Blob and Array Buffer
-----------------------------------------

In addition to including binary support with ByteBuffer, KAAZING Gateway 5.0 includes support for blob and array buffer.

-   **Blob** - A pointer to a single, raw binary object called a blob (binary large object). Blobs can be multimedia, images, or even executable code. Blob objects are considered safe to spool to disk because the entire data object is intact. You might use a Blob data type when you do not intend to manipulate the data, but simply write it to disk, or you might use a blob when you want to slice a file into byte ranges. The blob data type will work on any web browser that supports the [File API](http://www.w3.org/TR/FileAPI/ "File API"). For a list of web browsers that support the File API, see [caniuse.com](http://caniuse.com/#feat=fileapi).
-   **ArrayBuffer** - A fixed-length binary data buffer used to store data temporarily. You use a ArrayBufferView mask, such as Uint8Array, to view, index and manipulate the raw binary of the ArrayBuffer. There are different ArrayBufferView masks for different integer and floating point values (for example, you use a Uint16Array view to manipulate a 16-bit array of unsigned integers).
    Use an ArrayBuffer data type instead of a Blob when you intend to work with the data, such as perform a calculation on the data. The ArrayBuffer data type is supported by web browsers that support the [Typed Array Specification](https://www.khronos.org/registry/typedarray/specs/latest/#7). For a list of web browsers that support the Typed Array Specification, see [caniuse.com](http://caniuse.com/#feat=typedarrays).

Here is an example of a function using blob:

``` js
//  Run this function when the Send Blob button is clicked
sendBlob.onclick = function() {
    try {
        /* Use BlobUtils to create a Blob from a string via UTF-8 encoding. 
        Returns a blob instance*/
        var blob = Kaazing.BlobUtils.fromString(message.value, "transparent");
        // Log the blob
        log("SEND BLOB: " + blob);
        // Identify the data type of the WebSocket connection as blob
        websocket.binaryType = "blob";
        // Send the blob over WebSocket
        websocket.send(blob);
    } catch (e) {
        log("EXCEPTION: "+e);
    }
}
```

Note the binaryType specified for the WebSocket message is `websocket.binaryType = "blob"`. Blob is the default binary type for a binary message, but you must specify a value for `binaryType`.

Here is an example of a function using ByteBuffer and the browser’s support for ArrayBuffer to convert a string into binary and then send that binary as an array buffer:

``` js
// Takes a string and returns an array of bytes decoded as UTF8
var getBytes = function(str) {
    // Create a new ByteBuffer container for the binary data
    var buf = new Kaazing.ByteBuffer();
    // Encode a string into a ByteBuffer
    Kaazing.Charset.UTF8.encode(str, buf);
    /* Flip the buffer so that it can be read starting at 0,
    switching the buffer from writing mode to reading mode.
    */
    buf.flip();
    // Return the byte array to the sendArrayBuffer function
    return buf.array;
}

// Run this function when the Send Array Buffer button is clicked
sendArrayBuffer.onclick = function() {
    try {
        /* Send the text message to the getBytes function,
        and get a byte buffer array back
        */
        var bytes = getBytes(message.value);
        // View the byte buffer as an array of 8-bit unsigned integers
        var array = new Uint8Array(bytes);
        // Identify the data type of the WebSocket connection as arraybuffer
        websocket.binaryType = "arraybuffer";
        // Send the array buffer over WebSocket
        websocket.send(array.buffer);
    } catch (e) {
        // Log exceptions
        log("EXCEPTION: "+e);
    }
}
```

Note the `binaryType` specified for the WebSocket message is `websocket.binaryType = "arraybuffer"`. Always specify the `binaryType` when sending a message as an Array Buffer.

Next Step
---------

[Secure Your JavaScript Client](p_dev_js_secure.md)

See Also
--------

[JavaScript API](../apidoc/client/javascript/gateway/WebSocket.md) documentation



Use the JavaScript WebSocket API
================================

**Note:** To use the Gateway, a KAAZING client library, or a KAAZING demo, fork the repository from [kaazing.org](http://kaazing.org).

This section describes how you can use the `WebSocket` API provided by the KAAZING Gateway JavaScript client library ([JavaScript Client API](../apidoc/client/javascript/gateway/index.md "JsDoc")). This API allows you to take advantage of the WebSocket standard as described in the [HTML5 specification](http://www.w3.org/TR/html5/ "HTML5") and [WebSocket API](http://dev.w3.org/html5/websockets/ "The WebSocket API") including the sending and receiving of string and binary messages.

The steps in this topic show you how to create a simple JavaScript client using the WebSocket API as implemented in the KAAZING Gateway JavaScript WebSocket library. The Gateway JavaScript client library is fully-compliant with the WebSocket API standard and includes several enhancements.

This topic covers the following information:

-   [Components and Tools](#components-and-tools)
-   [Taking a Look at the JavaScript Client Demo](#taking-a-look-at-the-javascript-client-demo)
-   [Supported Data Types](#supported-data-types)
-   [Primary WebSocket JavaScript API Features](#primary-websocket-javascript-api-features)
-   [Build the WebSocket JavaScript Demo](#build-the-websocket-javascript-demo)
-   [Setting and Overriding HttpRedirectPolicy Defaults on the WebSocketFactory](#setting-and-overriding-httpredirectpolicy-defaults-on-the-websocketfactory)

The examples in this topic highlight some of the most commonly used WebSocket methods. Refer to the [JavaScript Client API](../apidoc/client/javascript/gateway/index.md "JsDoc") for a complete description of all the available methods.

Before You Begin
----------------

This procedure is part of [Build JavaScript WebSocket Clients](o_dev_js.md):

1.  **Use the JavaScript WebSocket API**
2.  [Use the JavaScript EventSource API](p_dev_js_eventsource.md)
3.  [Migrate JavaScript Applications to KAAZING Gateway 5.0](p_dev_js_migrate.md)
4.  [Secure Your JavaScript Client](p_dev_js_secure.md)
5.  [Display Logs for the JavaScript Client](p_clientlogging_js.md)

Components and Tools
--------------------

Before you get started, review the components and tools used to build the WebSocket JavaScript client in this procedure.

| Component or Tool                                        | Description                                                                                                                                                                                                                                                                 | Location                                                                                                                                                                                                   |
|----------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| KAAZING Gateway or any RFC-6455 WebSocket endpoint. | You can use the KAAZING Gateway or any RFC-6455 WebSocket endpoint that hosts an Echo service, such as [www.websocket.org](http://www.websocket.org).                                                                                                                  | The KAAZING Gateway is available at [kaazing.org](http://kaazing.org).                                                                                                                                |
| KAAZING Gateway WebSocket JavaScript Client library | The JavaScript file WebSocket.js.                                                                                                                                                                                                                                           | The library is located at [kaazing.org](http://kaazing.org).                                                                                                                                               |
| Development Tool                                         | A JavaScript development IDE, or a text editor.                                                                                                                                                                                                                             |                                                                                                                                                                                                            |
| Secure Networking of TLS/SSL                             | JavaScript is run in the web browser and the browser manages TLS/SSL connections, requesting TLS/SSL certificates from the Gateway or RFC-6455 WebSocket endpoint.                                                                                                       | For more information on securing network connections between the Gateway and a JavaScript client, see [Secure Network Traffic with the Gateway](../security/o_tls.md "Kaazing Developer Network"). |
| Authentication with Challenge Handlers                   | Authenticating your JavaScript client involves implementing a challenge handler to respond to authentication challenges from the Gateway. If your challenge handler is responsible for obtaining user credentials, then you will also need to implement a login handler. | For examples, see the `setupSSO()` function in [JavaScript for index.md](#index_javascript).                                                                                                             |

Taking a Look at the JavaScript Client Demo
-------------------------------------------

Before you start, take a look at a demo that was built with the JavaScript client library at [kaazing.org](http://kaazing.org). To see the JavaScript client in action, perform the following steps:

1.  Fork or download the KAAZING Gateway JavaScript demo from [kaazing.org](http://kaazing.org).
2.  Using the demo, connect to [echo.websocket.org](http://echo.websocket.org), send messages to the Echo service, and see an Echo reply message.

To view the WebSocket information on the network, do the following:

1.  Run [Google Chrome](http://www.google.com/chrome/) with Chrome’s [Developer Tools](https://developers.google.com/chrome-developer-tools/docs/overview) opened. To open the Developer Tools on Windows and Linux use Control+Shift+I. On a Mac, use ⌥⌘I.
2.  Open the **Network** panel. For more information, see [Network panel](https://developers.google.com/chrome-developer-tools/docs/network) on Google Developers.
3.  Click the filter icon, and then click **WebSockets** at the top of the panel.
4.  Navigate to the Javascript WebSocket Echo demo.
5.  In the demo, click **Connect**.
6.  The panel displays the new WebSocket connection.
7.  In the **Name** column, click the connection icon.
8.  The **Headers** and **Frames** tabs display the details of the connection. In the **Headers** tab you can see the request and response headers used to establish the WebSocket handshake and connection.
9.  Click the **Frames** tab and then click **Send** in the demo.
10. In the **Name** column, click the connection icon again and the message is displayed in the **Frames** tab.
11. You have now seen both the information used to establish the WebSocket connection and the contents of WebSocket frames (messages) sent over the connection.

Supported Data Types
--------------------

You can send a WebSocket message using one of the following data types:

-   **String** - A text WebSocket message (UTF-8).
-   **Blob** - A pointer to a single, raw binary object called a blob (binary large object). Blobs can be multimedia, images, or even executable code. Blob objects are considered safe to spool to disk because the entire data object is intact. You might use a Blob data type when you do not intend to manipulate the data, but simply write it to disk, or you might use a blob when you want to slice a file into byte ranges. The blob data type will work on any web browser that supports the [File API](http://www.w3.org/TR/FileAPI/ "File API"). For a list of web browsers that support the File API, see [caniuse.com](http://caniuse.com/#feat=fileapi).
-   **ArrayBuffer** - A fixed-length binary data buffer used to store data temporarily. You use a ArrayBufferView mask, such as Uint8Array, to view, index and manipulate the raw binary of the ArrayBuffer. There are different ArrayBufferView masks for different integer and floating point values (for example, you use a Uint16Array view to manipulate a 16-bit array of unsigned integers).
    Use an ArrayBuffer data type instead of a Blob when you intend to work with the data, such as perform a calculation on the data. The ArrayBuffer data type is supported by web browsers that support the [Typed Array Specification](https://www.khronos.org/registry/typedarray/specs/latest/#7). For a list of web browsers that support the Typed Array Specification, see [caniuse.com](http://caniuse.com/#feat=typedarrays).
-   **ByteBuffer** - A compact byte array representation for sending, receiving and processing binary data using WebSocket. ByteBuffer is available for JavaScript clients built using the legacy KAAZING Gateway JavaScript ByteBuffer library. Legacy clients can use the latest JavaScript WebSocket library without having to change their client code. The current WebSocket.js library is all that is needed. The current JavaScript WebSocket API enables clients to convert `blob` to and from `bytebuffer`, thereby supporting the integration of blob binary messages in legacy clients.

**Note:** In the code examples in this topic, `binaryType` is specified in the send functions prior to sending binary data. This is to ensure that the received binary data will be of same binary type as the sent binary data. If you build an application that sends binary data (ArrayBuffer, Blob, ByteBuffer), you should specify `binaryType` based on the data type that you expect your received data will be. For example, you would set `binaryType="arraybuffer"` if you intend to receive binary message as ArrayBuffer.

Primary WebSocket JavaScript API Features
-----------------------------------------

The examples in this section will demonstrate how to open and close a WebSocket connect, send and receive message, and error handling.

### Connecting and Closing Connections

The following example demonstrates how to open and close a connection. A best practice when connecting is to use a try...catch statement.

``` js
try {
  var factory = new Kaazing.Gateway.WebSocketFactory();
  websocket = factory.createWebSocket('ws://echo.websocket.org');

  // update GUI
  websocket.onopen = function(evt) {
    log("CONNECTED");
    setFormState(true);
    message.focus();
  }
...
close.onclick = function() {
  log("CLOSE");
  websocket.close();
};
```

### Sending and Receiving Messages

The following code demonstrates sending messages using all of the supported data types.

``` js
// sending messages
sendText.onclick = function() {
    try {
        var text = message.value;
        log("SEND TEXT: " + text);
        websocket.send(text);
    } catch (e) {
        log("EXCEPTION: "+e);
    }
};
...
sendBlob.onclick = function() {
    try {
        // BlobUtils is implemented for all supported platforms
        var blob = Kaazing.BlobUtils.fromString(message.value, "transparent");
        log("SEND BLOB: " + blob);
        websocket.binaryType = "blob";
        websocket.send(blob);
    } catch (e) {
        log("EXCEPTION: "+e);
    }
}

sendArrayBuffer.onclick = function() {
    try {
        // ArrayBuffer is only supported on modern browsers
        var bytes = getBytes(message.value);
        var array = new Uint8Array(bytes);
        log("SEND ARRAY BUFFER: " + array.buffer);
        websocket.binaryType = "arraybuffer";
        websocket.send(array.buffer);
    } catch (e) {
        log("EXCEPTION: "+e);
    }
}

sendByteBuffer.onclick = function() {
    try {
        // Convert ByteBuffer to 
        var buf = new Kaazing.ByteBuffer();
        buf.putString(message.value, Kaazing.Charset.UTF8);
        buf.flip();

        log("SEND BYTE BUFFER: " + buf);
        websocket.binaryType = "bytebuffer";
        websocket.send(buf);
    } catch (e) {
        log("EXCEPTION: "+e);
    }
}
...
// receiving messages
websocket.onmessage = function(evt) {
    var data = evt.data;
    if (typeof(data) == "string") {
        //text
        logResponse("RECEIVED TEXT: " + data);
    }
    else if (data.constructor == Kaazing.ByteBuffer) {
        //bytebuffer
        logResponse("RECEIVED BYTE BUFFER: " + data);
    }
    else if (data.byteLength) {
        //arraybuffer
        var u = new Uint8Array(data);
        var bytes = [];
        for (var i=0; i<u.byteLength; i++) {
            bytes.push(u[i]);
        }
        logResponse("RECEIVED ARRAY BUFFER: " + bytes);
    }
    else if (data.size) {
        //blob
        var cb = function(result) {
            logResponse("RECEIVED BLOB: " + result);
        };
        Kaazing.BlobUtils.asNumberArray(cb, data);
    }
    else {
        logResponse("RECEIVED UNKNOWN TYPE: " + data);
    }
}
```

### Error Handling

Error handling is performed using a `try...catch` statement and the `e` exception identifier, local to the catch clause.

``` js
sendByteBuffer.onclick = function() {
    try {
        // Convert ByteBuffer to 
        var buf = new Kaazing.ByteBuffer();
        buf.putString(message.value, Kaazing.Charset.UTF8);
        buf.flip();

        log("SEND BYTE BUFFER: " + buf);
        websocket.binaryType = "bytebuffer";
        websocket.send(buf);
    } catch (e) {
        log("EXCEPTION: "+e);
    }
}
```

Build the WebSocket JavaScript Demo
-----------------------------------

The following example demonstrates how to build the WebSocket JavaScript demo using the WebSocket JavaScript library and the KAAZING Gateway.

The demo you build will send and receive text and binary messages with the Gateway or RFC-6455 WebSocket endpoint over WebSocket using a JavaScript client and KAAZING Gateway [JavaScript Client API](../apidoc/client/javascript/gateway/index.md "JsDoc"). The JavaScript client consists of an HTML page hosted that can be hosted by the directory service on the Gateway or simply dragged into a web browser. You will add a `script` tag that points to the JavaScript WebSocket library from the HTML page, an HTML form, and the JavaScript needed to connect to a RFC-6455 WebSocket endpoint over WebSocket and send and receive WebSocket messages with the Echo service hosted on [websocket.org](http://www.websocket.org).

1.  Create a new HTML page named **index.md** and save it in a development folder on you computer.

2.  Copy and paste the text and HTML form from [HTML for index.md](#html-for-indexmd) into the **index.md** file.

    Note the `id` in each form element. These `ids` will be used in your JavaScript code to reference user input and events.

    In the `head` section, note the following CSS style and JQuery component:

    ``` xml
    <style type="text/css" media="screen">
        #location-div {
            display: table;
        }
    </style>
    <script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
    ```

3.  Save the HTML page.
4.  To see how the page looks, drag it into a browser.
5.  Navigate to the the Gateway JavaScript WebSocket library, as listed in [Components and Tools](#components-and-tools).
6.  Copy the file **WebSocket.js** and paste it into your development folder.
7.  In your HTML page named **index.md**, copy and paste the JavaScript from [JavaScript for index.md](#javascript-for-indexmd) into the index.md file and save the file.

    Note the `script` tag in the `head` section that points to where you pasted the Gateway JavaScript WebSocket library:

    ``` xml
    <script src="WebSocket.js"></script>
    ```

8.  Review the following notes about the JavaScript code:

    The JavaScript code comes after the script tag for the Gateway JavaScript WebSocket library, and is contained in a JavaScript function named `setup()`.

    ``` xml
    <script>
    function setup() {

    }
    </script>
    ```

    This function will contain all of the JavaScript for the client. The function is named `setup()` because it is run when the page loads using a JQuery component.

    When the JavaScript client sends or receives messages, the messages are displayed in the **Log messages** section of the client.

    The ByteBuffer object enables the JavaScript client to convert text messages (strings) to binary before sending them. The messages sent using the JavaScript client are text messages. When you want to send these text messages as binary by clicking the **Send Array Buffer** button, you will need to convert the text string into a byte buffer first. A byte buffer is just an allocation of memory containing binary.

    An ArrayBuffer function is included because of the limitations of ByteBuffer. Turning a text string into binary via a byte buffer provides you with a memory allocation of binary data, but it does not give you a context or view of the data, such as the data type, starting offset, and number of elements. Without that context, it is impossible to access the data stored in the buffer accurately. The ArrayBuffer as defined in the [Typed Array Specification](https://www.khronos.org/registry/typedarray/specs/latest/) stores the data in a typed array and provides array buffer views to access the memory contained in the buffer. You use a ArrayBufferView mask, such as Uint8Array, to view, index and manipulate the raw binary of the ArrayBuffer. For a list of web browsers that support the Typed Array Specification, see [caniuse.com](http://caniuse.com/#feat=typedarrays).

    The Blob function uses [Kaazing.BlobUtils](../apidoc/client/javascript/gateway/BlobUtils.md), a portable, cross-browser utility library for working with Blob instances. Blob is the default binaryType for WebSocket connections.

    The ByteBuffer is available for JavaScript clients built using the legacy KAAZING Gateway JavaScript ByteBuffer library. Legacy clients can use the latest JavaScript WebSocket library without having to change their client code. The current WebSocket.js library is all that is needed. The current JavaScript WebSocket API enables clients to convert blob to and from Bytebuffer, thereby supporting the integration of blob binary messages in legacy clients.

    The Text function is used when a user clicks **Send Text**. No binaryType is specified for this WebSocket message, and a text string is expected by the Gateway.

    Event handlers manage the WebSocket connection and messages. These handlers are contained within the `connect.onclick` handler and use a `try...catch` block:

    ``` js
    // Run this function when the Connect button is clicked
    connect.onclick = function() {
        // Log the value entered in the Location field
        log("CONNECT: "+wsurl.value);
        try {
            // Create a new WebSocket connection using the location provided by the user
            var factory = new Kaazing.Gateway.WebSocketFactory();
            websocket = factory.createWebSocket(wsurl.value);
            ... // event handlers for the GUI buttons
        } catch (e) {
            // Log exceptions
            log("EXCEPTION: "+e);
            connect.disabled = false;
            close.disabled = true;
        }
    };

    // Run this function when the Close button is clicked
    close.onclick = function() {
        // Log the close event
        log("CLOSE");
        // Close the WebSocket connection
        websocket.close();
    };
    ...
    ```

9.  Test the JavaScript client. Reload the HTML page, and enter `ws://echo.websocket.org` in the **Location** field.
10. Click **Connect**. The **Log** displays a successful connection to the RFC-6455 WebSocket endpoint at [websocket.org](http://www.websocket.org). If there is an exception, review your code for possible errors.
11. Click each of the send buttons and note the information displayed in the log.

    The following table provides examples of what the log should display for each button and the message `“Hello, WebSocket!”`.

    | Button            | Message Returned                                                                                                                                                       |
    |-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | Send Text         | `RECEIVED: Hello, WebSocket!                         SEND TEXT: Hello, WebSocket!`                                                                                     |
    | Send Blob         | `RECEIVED BLOB: 72,101,108,108,111,44,32,87,101,98,83,111,99,107,101,116,33                         SEND BLOB: [object Blob]`                                          |
    | Send Array Buffer | `RECEIVED ARRAYBUFFER: 72,101,108,108,111,44,32,87,101,98,83,111,99,107,101,116,33                         SEND ARRAY BUFFER: [object ArrayBuffer]`                    |
    | Send Byte Buffer  | `RECEIVED BYTEBUFFER: 48 65 6c 6c 6f 2c 20 57 65 62 53 6f 63 6b 65 74 21                         SEND BYTE BUFFER: 48 65 6c 6c 6f 2c 20 57 65 62 53 6f 63 6b 65 74 21` |

12. Click **Close** to close the WebSocket connection.

### Demo Files

The following HTML and JavaScript demo files are used to build the JavaScript WebSocket demo.

**Note:** When coding JavaScript using the JavaScript WebSocket client library, use explicit namespaces to avoid collisions with other scripts in your client application. For example, instead of `var uri = new URI();` use `var uri = new Kaazing.Gateway.URI();`.

#### HTML for index.md

``` html
<!DOCTYPE html>
<head>

<style type="text/css" media="screen">
    #location-div {
        display: table;
    }
</style>
<script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>

<title>Demo</title>

</head>
<body>

<h1>JavaScript Echo Demo</h1>

<p>This demo uses the WebSocket API to send text messages to the the Gateway Echo service, which echoes back the messages.</p>

<div id="location-div" class="clearfix">
    <div class="form-labels">
        <label>Location</label>
    </div>

    <div class="form-fields">
        <input id="wsurl" size="40"> <button id="connect">Connect</button> <button id="close">Close</button>
    </div>

    <div id="logindiv" style="display: none;">
        <div class="heading clearfix">
            <div class="text">
                Login
            </div>

            <div class="image">
                <img src="images/lock-icon.png" width="56" height="56">
            </div>
        </div>

        <div class="clearfix">
            <div class="form-labels">
                <label for="username">Username:</label>
            </div>

            <div class="form-fields">
                <input id="username" size="12" value="">
            </div>
        </div>

        <div class="clearfix">
            <div class="form-labels">
                <label for="password">Password:</label>
            </div>

            <div class="form-fields">
                <input id="password" type="password" size="12" value=""><br>
                <button id="login">OK</button> <button id="cancel">Cancel</button>
            </div>
        </div>
    </div><!-- logindiv -->
</div><!-- location-div -->

<div id="message-div" class="clearfix">
    <div class="form-labels">
        <label>Message</label>
    </div>

    <div class="form-fields">
        <input id="message" size="40" value="Hello, WebSocket!"><br>
        <button id="sendText">Send Text</button> <button id="sendBlob">Send Blob</button> <button id="sendArrayBuffer">Send Array Buffer</button> <button id="sendByteBuffer">Send Byte Buffer</button>
    </div>
</div>

<div id="console-div">
    Log messages

    <div id="consoleLog"></div><button id="clear">Clear Log</button>
</div>
</body>
</html>
```

#### JavaScript for index.md

``` js
function setupSSO(factory) {
  /* Respond to authentication challenges with popup login dialog */
  var basicHandler = new Kaazing.Gateway.BasicChallengeHandler();
  basicHandler.loginHandler = function(callback) {
    popupLoginDialog(callback);
  }
  factory.setChallengeHandler(basicHandler);
}

function popupLoginDialog(callback) {

  //popup dialog to get credentials
  var popup = document.getElementById("logindiv");
  $("#logindiv").slideToggle(300);
  var login = document.getElementById("login");
  var cancel = document.getElementById("cancel");

  $('#username').focus();

  // As a convenience, connect when the user presses Enter
  // in the location field.
  $('#password').keypress(function(e) {
    if (e.keyCode == 13) {
      e.stopImmediatePropagation(); // Prevent firing twice.
      login.click();
    }
  });

  //"OK" button was clicked, invoke callback function with credential to login
  login.onclick = function() {
    var username = document.getElementById("username");
    var password = document.getElementById("password");
    var credentials = new Kaazing.Gateway.PasswordAuthentication(username.value, password.value);
    //clear user input
    username.value = "";
    password.value = "";
    //hide popup
    $("#logindiv").slideToggle(100);
    callback(credentials);
  }

  //"Cancel" button has been clicked, invoke callback function with null argument to cancel login
  cancel.onclick = function() {
    var username = document.getElementById("username");
    var password = document.getElementById("password");
    //clear user input
    username.value = "";
    password.value = "";
    //hide popup
    $("#logindiv").slideToggle(100);
    callback(null);
  }
}

function setup() {

  var locationURI = new Kaazing.Gateway.URI(document.URL || location.href);
  var websocket;

  // default port if necessary
  if (locationURI.port == null) {
    var defaultPorts = {
      "http": 80,
      "https": 443
    };
    locationURI.port = defaultPorts[locationURI.scheme];
  }

  // construct the WebSocket location
  locationURI.scheme = locationURI.scheme.replace("http", "ws");
  locationURI.path = "/echo";
  delete locationURI.query;
  delete locationURI.fragment;

  var consoleLog = document.getElementById("consoleLog");
  var clear = document.getElementById("clear");
  var wsurl = document.getElementById("wsurl");
  var message = document.getElementById("message");
  var connect = document.getElementById("connect");
  var sendText = document.getElementById("sendText");
  var sendBlob = document.getElementById("sendBlob");
  var sendArrayBuffer = document.getElementById("sendArrayBuffer");
  var sendByteBuffer = document.getElementById("sendByteBuffer");
  var close = document.getElementById("close");

  // Enable or disable controls based on whether or not we are connected.
  // For example, disable the Connect button if we're connected.
  var setFormState = function(connected) {
    wsurl.disabled = connected;
    connect.disabled = connected;
    close.disabled = !connected;
    message.disabled = !connected;
    sendText.disabled = !connected;
    sendBlob.disabled = !connected;
    sendArrayBuffer.disabled = !connected || (typeof(Uint8Array) === "undefined");
    sendByteBuffer.disabled = !connected;
  }

  // As a convenience, connect when the user presses Enter
  // if no fields have focus, and we're not currently connected.
  $(window).keypress(function(e) {
    if (e.keyCode == 13) {
      if (e.target.nodeName == "BODY" && wsurl.disabled == false) {
        doConnect();
      }
    }
  });

  // As a convenience, connect when the user presses Enter
  // in the location field.
  $('#wsurl').keypress(function(e) {
    if (e.keyCode == 13) {
      doConnect();
    }
  });

  // As a convenience, send as text when the user presses Enter
  // in the message field.
  $('#message').keypress(function(e) {
    if (e.keyCode == 13) {
      doSendText();
    }
  });

  wsurl.value = locationURI.toString();
  setFormState(false);
  var log = function(message) {
    var pre = document.createElement("pre");
    pre.style.wordWrap = "break-word";
    pre.innerHTML = message;
    consoleLog.appendChild(pre);
    consoleLog.scrollTop = consoleLog.scrollHeight;
    while (consoleLog.childNodes.length > 25) {
      consoleLog.removeChild(consoleLog.firstChild);
    }
  };

  var logResponse = function(message) {
    log("<span style='color:blue'>" + message + "</span>");
  }

  // Takes a string and Returns an array of bytes decoded as UTF8
  var getBytes = function(str) {
    var buf = new Kaazing.ByteBuffer();
    Kaazing.Charset.UTF8.encode(str, buf);
    buf.flip();
    return buf.array;
  }

  var doSendText = function() {
    try {
      var text = message.value;
      log("SEND TEXT: " + text);
      websocket.send(text);
    } catch (e) {
      log("EXCEPTION: " + e);
    }
  };

  sendText.onclick = doSendText;

  sendBlob.onclick = function() {
    try {
      // BlobUtils is implemented for all supported platforms
      var blob = Kaazing.BlobUtils.fromString(message.value, "transparent");
      log("SEND BLOB: " + blob);
      websocket.binaryType = "blob";
      websocket.send(blob);
    } catch (e) {
      log("EXCEPTION: " + e);
    }
  }

  sendArrayBuffer.onclick = function() {
    try {
      // ArrayBuffer is only supported on modern browsers
      var bytes = getBytes(message.value);
      var array = new Uint8Array(bytes);
      log("SEND ARRAY BUFFER: " + array.buffer);
      websocket.binaryType = "arraybuffer";
      websocket.send(array.buffer);
    } catch (e) {
      log("EXCEPTION: " + e);
    }
  }

  sendByteBuffer.onclick = function() {
    try {
      // Convert ByteBuffer to 
      var buf = new Kaazing.ByteBuffer();
      buf.putString(message.value, Kaazing.Charset.UTF8);
      buf.flip();

      log("SEND BYTE BUFFER: " + buf);
      websocket.binaryType = "bytebuffer";
      websocket.send(buf);
    } catch (e) {
      log("EXCEPTION: " + e);
    }
  }

  var doConnect = function() {
    log("CONNECT: " + wsurl.value);
    try {
      var factory = new Kaazing.Gateway.WebSocketFactory();
      setupSSO(factory);
      websocket = factory.createWebSocket(wsurl.value);
      //websocket = new WebSocket(wsurl.value);

      websocket.onopen = function(evt) {
        log("CONNECTED");
        setFormState(true);
        message.focus();
      }

      websocket.onmessage = function(evt) {
        var data = evt.data;
        if (typeof(data) == "string") {
          //text
          logResponse("RECEIVED TEXT: " + data);
        } else if (data.constructor == Kaazing.ByteBuffer) {
          //bytebuffer
          logResponse("RECEIVED BYTE BUFFER: " + data);
        } else if (data.byteLength) {
          //arraybuffer
          var u = new Uint8Array(data);
          var bytes = [];
          for (var i = 0; i < u.byteLength; i++) {
            bytes.push(u[i]);
          }
          logResponse("RECEIVED ARRAY BUFFER: " + bytes);
        } else if (data.size) {
          //blob
          var cb = function(result) {
            logResponse("RECEIVED BLOB: " + result);
          };
          Kaazing.BlobUtils.asNumberArray(cb, data);
        } else {
          logResponse("RECEIVED UNKNOWN TYPE: " + data);
        }
      }

      websocket.onclose = function(evt) {
        log("CLOSED: (" + evt.code + ") " + evt.reason);
        setFormState(false);
      }

    } catch (e) {
      log("EXCEPTION: " + e);
      setFormState(true);
    }
  };

  connect.onclick = doConnect;

  close.onclick = function() {
    log("CLOSE");
    websocket.close();
  };

  clear.onclick = function() {
    while (consoleLog.childNodes.length > 0) {
      consoleLog.removeChild(consoleLog.lastChild);
    }
  };

}

$(document).ready(function() {
  setup();
});
```

Setting and Overriding HttpRedirectPolicy Defaults on the WebSocketFactory
--------------------------------------------------------------------------

You can set a default redirect-policy on the WebSocketFactory that enables you to determine how your application handles server redirects. For example, you can set the client application to never follow HTTP redirects. All the WebSockets created using that factory automatically inherit the default. You can then override the defaults on an individual WebSocket, if desired. The KAAZING Gateway JavaScript API also provides the following options:

| Option       | Description                                                                                                                                                                                                                                                     |
|--------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| NEVER        | Do not follow HTTP redirects.                                                                                                                                                                                                                                   |
| ALWAYS       | Follow the HTTP redirect requests always, regardless of the origin, domain, etc.                                                                                                                                                                                |
| SAME\_ORIGIN | Follow the HTTP redirect only if the origin of the redirect request matches. This implies that both the scheme/protocol and the authority between the current and the redirect URIs should match. The port number should also be the same between the two URIs. |
| SAME\_DOMAIN | Follow HTTP redirect only if the domain of the redirect request matches the domain of the current request. For example, URIs with identical domains would be `ws://production.example.com:8001` and `ws://production.example.com:8002`.                         |
| PEER\_DOMAIN | Follow the HTTP redirect only if the redirected request is for a peer-domain. For example, the domain in the URI ws://sales.example.com:8001 is a peer of the domain in the URI ws://marketing.example.com:8002.                                                |
| SUB\_DOMAIN  | Follow the HTTP redirect only if the request is for sub-domain. For example, the domain in the URI ws://benefits.hr.example.com:8002 is a sub-domain of the domain in the URI ws://hr.example.com:8001.                                                         |

You can specify HttpRedirectPolicy on the WebSocketFactory such that it will be inherited by all the WebSockets that are created using the factory. The following example shows `HttpRedirectPolicy.SAME_DOMAIN` as the default redirect policy set on the WebSocketFactory. So, all the WebSockets created using the factory will inherit the same redirect policy that was specified on the WebSocketFactory.

``` js
var webSocketFactory = new Kaazing.Gateway.WebSocketFactory();
webSocketFactory.setDefaultRedirectPolicy(HttpRedirectPolicy.SAME_DOMAIN);
var webSocket = webSocketFactory.createWebSocket(“ws://localhost:8001/echo”);
```

You can also override the inherited HttpRedirectPolicy by specifying it directly on the WebSocket. The following example shows the redirect policy on the individual WebSocket can be overridden to `HttpRedirectPolicy.PEER_DOMAIN`.

``` js
var webSocketFactory = new Kaazing.Gateway.WebSocketFactory();
webSocketFactory.setDefaultRedirectPolicy(HttpRedirectPolicy.SAME_DOMAIN);
var webSocket = webSocketFactory.createWebSocket(“ws://localhost:8001/echo”);
webSocket.setRedirectPolicy(HttpRedirectPolicy.PEER_DOMAIN);
```

Notes
-----

The KAAZING Gateway JavaScript WebSocket library files also include the file XMLHttpRequest.js. XMLHttpRequest.js is used to support CORS ([Cross-Origin Resource Sharing](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing "Cross-origin resource sharing - Wikipedia, the free encyclopedia")) in old browsers that do not support CORS by default. For a list of browsers that support CORS, see [http://en.wikipedia.org/wiki/Cross-origin_resource_sharing#Browser_support](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing#Browser_support) and [http://caniuse.com/#feat=cors](http://caniuse.com/#feat=cors).

Next Step
---------

[Use the JavaScript EventSource API](p_dev_js_eventsource.md)

See Also
--------

[WebSocket API documentation](../apidoc/client/javascript/gateway/WebSocket.md)



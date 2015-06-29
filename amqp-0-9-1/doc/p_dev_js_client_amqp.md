-   [Home](../../index.md)
-   [Documentation](../index.md)
-   Use the KAAZING Gateway JavaScript AMQP Client Library

Use the KAAZING Gateway JavaScript AMQP Client Library
======================================================

**Note:** To use the Gateway, a KAAZING client library, or a KAAZING demo, fork the repository from [kaazing.org](http://kaazing.org).

In this procedure, you will learn how to use the KAAZING Gateway JavaScript AMQP Client Library and the supported APIs. You can use KAAZING Gateway or a RFC-6455 WebSocket endpoint that supports AMQP 0-9-1 and an AMQP broker that supports AMQP 0-9-1.

Before You Begin
----------------

This procedure is part of [Build JavaScript AMQP Clients](o_dev_js_amqp.md):

1.  [Overview of the KAAZING Gateway AMQP Client Library](#overview-of-the-kaazing-gateway-javascript-amqp-client-library)
2.  **Use the KAAZING Gateway JavaScript AMQP Client Library**
3.  [Secure Your JavaScript AMQP Client](p_dev_js_secure.md)

Components and Tools
--------------------

Before you get started, review the components and tools used to build your JavaScript AMQP client, described in the following table:

| Component or Tool                                                       | Description                                                                                                                            | Location                                                                                  |
|-------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| KAAZING Gateway or RFC-6455 WebSocket endpoint                     | You can use the KAAZING Gateway or any RFC-6455 WebSocket endpoint that hosts an AMQP 0-9-1 service.                                   | The Gateway is available at [kaazing.org](http://kaazing.org).                     |
| KAAZING Gateway JavaScript WebSocket and AMQP Client library files | The JavaScript files that make up the JavaScript WebSocket and AMQP Client libraries. Both library files are required.                 | WebSocket JavaScript library: **WebSocket.js** AMQP JavaScript library: **Amqp-0-9-1.js** |
| AMQP broker that supports AMQP 0-9-1                                    | Any AMQP broker that supports AMQP 0-9-1 will work with the KAAZING Gateway and the KAAZING Gateway JavaScript AMQP library. | [http://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol#Implementations](http://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol#Implementations)          |
| Text Editor or JavaScript IDE                                           | The procedures in this topic use text editors for HTML, CSS, and JavaScript development.                                               | [http://en.wikipedia.org/wiki/List_of_HTML_editors](http://en.wikipedia.org/wiki/List_of_HTML_editors)                                       |

To Use the KAAZING Gateway JavaScript AMQP Client Library
---------------------------------------------------------

In this section, you will learn the major steps when developing clients using the JavaScript AMQP client library, and then develop the JavaScript AMQP demo included in the Gateway download:

-   [Development Overview](#development-overview)
-   [Creating the JavaScript AMQP Demo](#creating-the-javascript-amqp-demo)
-   [JavaScript AMQP Demo Code](#javascript-amqp-demo-code)
-   [Other Coding Styles](#other-coding-styles)

### Development Overview

This topic shows you the major coding steps when developing JavaScript AMQP clients using the JavaScript AMQP client library.

### Set up your development environment

The development environment for JavaScript clients that use the JavaScript AMQP library includes the following:

-   HTML file for the client interface.
-   WebSocket and AMQP JavaScript AMQP libraries.
-   KAAZING Gateway or RFC-6455 WebSocket endpoint that supports AMQP 0-9-1.
-   AMQP broker that supports AMQP 0-9-1.

For more information, see [Components and Tools](#components-and-tools).

### Import the libraries

Import the WebSocket and AMQP JavaScript client libraries from the location listed in [Components and Tools](#components-and-tools). The client libraries instruct the application to use the `AmqpClient` protocol commands.

To import the client libraries and create the `AmqpClient` object:

1.  Open your Web application in your favorite editor and import the JavaScript AMQP client libraries.
2.  In the `<HEAD>` section of your HTML Web application file, add the following script. Ensure you adjust the location of the file to where you are building your client.

    ``` html
      <script src="WebSocket.js"></script>
      <script src="Amqp-0-9-1.js"></script>
    ```

Next, add your client code within a `<script type="text/javascript" charset="utf-8">...</script>` tag following the `<script>` tag used to import the libraries.

### Create the AmqpClient Object

Create an instance of the AmqpClient object as shown in the following example.

``` js
var amqpClientFactory = new Kaazing.AMQP.AmqpClientFactory();
var amqpClient;
amqpClient = amqpClientFactory.createAmqpClient();
```

Now that you have created an instance of the `AmqpClient` object, you can use the AMQP protocol commands to handle the interactions between the client and the AMQP broker. Refer to the `AmqpClient` [JavaScript AMQP API](../apidoc/client/javascript/amqp/index.md) documentation for the complete list of all the AMQP command and callback functions. In the next step, you will connect to your AMQP broker, which you can then use for publishing and consuming messages.

### Connect to an AMQP broker

The `AmqpClient` generally manages all of its communication on a single connection to an AMQP broker. In this step, you will establish a connection to an AMQP broker by passing in the **required** parameters: broker address, a username and password, and a virtual host name (the name of a collection of exchanges and queues hosted on independent server domains). These parameters are passed in when you call the `connect()` method as shown in the following example.

``` js
var amqpClientFactory = new Kaazing.AMQP.AmqpClientFactory();
var amqpClient;
...
  amqpClient = amqpClientFactory.createAmqpClient();
  amqpClient.addEventListener("close", function() {
    log("DISCONNECTED");
    updateGuiState(false);
  });

  amqpClient.addEventListener("error", function(e) {
    log("CONNECTION ERROR:" + e.message);
  });

  var credentials = {
    username: username.val(),
    password: password.val()
  };
  var options = {
    url: url.val(),
    virtualHost: virtualhost.val(),
    credentials: credentials
  };
  amqpClient.connect(options, openHandler);
```

In this example, the **required** parameters that are passed in are: url: `ws://localhost:8001/amqp` (this assumes that you are running the Gateway locally), virtualHost: `/`, username: `guest`, and password: `guest`. The `openHandler` parameter is a callback to another function. For more information about `amqpClient.connect()`, see the `AmqpClient` connect method in [AmqpClient JavaScript API](../apidoc/client/javascript/amqp/index.md) documentation.

### Create channels

You can define the `openHandler` that you specified in the `connect()` function in the previous section to create the channels, as shown in the following example:

``` js
var openHandler = function() {
  log("CONNECTED");
  channelsReady = 0;

  log("OPEN: Publish Channel");
  publishChannel = amqpClient.openChannel(publishChannelOpenHandler);

  log("OPEN: Consume Channel");
  consumeChannel = amqpClient.openChannel(consumeChannelOpenHandler);

  txnPublishChannel = amqpClient.openChannel(txnPublishChannelOpenHandler);
  txnConsumeChannel = amqpClient.openChannel(txnConsumeChannelOpenHandler);
};
```

Once the `publishChannel` is successfully opened, it calls the `publishChannelOpenHandler`. Similarly, once the `consumeChannel` is successfully opened, the `consumeChannelOpenHandler` is called.

### Declare an exchange

AMQP messages are published to exchanges. Messages contain a routing key that contains the information about the message's destination. The exchange accepts messages and their routing keys and delivers them to a message queue. You can think of an exchange as an electronic mailman that delivers the messages to a mailbox (the queue) based on the address on the message's envelope (the routing key). Exchanges do not store messages.

**Note:** AMQP brokers reserve the use of the System exchange type, and therefore the System exchange type should not be used by applications.
AMQP defines different exchange types. Some of these exchange types (Direct, Fanout, and Topic) must be supported by all AMQP brokers, while others (Headers and System) are optional. AMQP brokers can also support custom exchange types. The following are the different types of exchanges:

-   **Direct**: Messages are sent only to a queue that is bound with a binding key that matches the message's routing key
-   **Fanout**: Messages are sent to every queue that is bound to the exchange
-   **Topic**: Messages are sent to a queue based on categorical binding keys and wildcards
-   **Headers**: *Optional.* Messages are sent to a queue based on their header property values
-   **System**: *Optional.* Messages are sent to system services

Exchanges can be durable, meaning that the exchange survives broker shutdown and must be deleted manually, or non-durable (temporary), meaning that the exchange lasts only until the broker is shutdown. Finally, to check if an exchange exists on the AMQP broker (without actually creating it), you can create a passive exchange.

The following example shows how you can create a direct exchange on the publish channel. In this example, the `publishChannelOpenHandler` function will be called once the `publishChannel` is opened:

``` js
var publishChannelOpenHandler = function(channel) {
  log("OPENED: Publish Channel");

  publishChannel.declareExchange({
    exchange: consumeExchange.val(),
    type: "fanout"
  });

  // listen for these requests to return
  publishChannel.addEventListener("declareexchange", function() {
    log("EXCHANGE DECLARED: " + consumeExchange.val());
  });

  publishChannel.addEventListener("error", function(e) {
    log("CHANNEL ERROR: Publish Channel - " + e.message);
  });

  publishChannel.addEventListener("close", function() {
    log("CHANNEL CLOSED: Publish Channel");
  });

  updateGuiState(true);

  channelsReady++;
  if (channelsReady == 2) {
    doBind();
  }
};
```

**Note:** If you change the type of the exchange from `'fanout'` to one of the other options such as `'direct'`, you must either restart the AMQP broker or rename the exchange for the broker to recognize the new type.
After the exchange is created successfully, the `declareExchangeHandler` callback is called. Once you have an exchange, you can publish messages to the exchange, as you'll see in the next section.

### Publish messages

Messages are published to exchanges. The established binding rules (routing keys) then determine to which queue a message is delivered. Messages have content that consists of two parts:

-   **Content Header:** A set of properties that describes the message
-   **Content Body:** A blob of binary data

Additionally, messages can be marked mandatory to send a notification to the publisher in case a message cannot be delivered to a queue. You can also mark a message immediate so that it is returned to the sender if the message cannot be routed to a queue consumer immediately. The following example function shows how the content body of a message is added to a buffer (AMQP uses a binary message format) and published to an exchange using the publish channel:

``` js
var handleSend = function() {
    doSend(publishChannel, consumeExchange.val(), routingKey, consumeMessage.val(), "MESSAGE PUBLISHED: ", "sendMessage");
}

var addProperties = function(props) {
  var prop;

  prop = propAppId.val().trim();
  if (prop !== undefined && prop.length > 0) {
    props.setAppId(prop);
  }

  prop = propContentType.val().trim();
  if (prop !== undefined && prop.length > 0) {
    props.setContentType(prop);
  }

  prop = propContentEncoding.val().trim();
  if (prop !== undefined && prop.length > 0) {
    props.setContentEncoding(prop);
  }

  prop = propCorrelationId.val().trim();
  if (prop !== undefined && prop.length > 0) {
    props.setCorrelationId(prop);
  }

  prop = propCorrelationId.val().trim();
  if (prop !== undefined && prop.length > 0) {
    props.setCorrelationId(prop);
  }

  prop = propDeliveryMode.val().trim();
  props.setDeliveryMode(prop);

  prop = propExpiration.val().trim();
  if (prop !== undefined && prop.length > 0) {
    props.setExpiration(prop);
  }

  prop = propMessageId.prop('checked');
  if (prop) {
    props.setMessageId((messageIdCounter++).toString());
  }

  prop = propPriority.val().trim();
  props.setPriority(prop);

  prop = propReplyTo.val().trim();
  if (prop !== undefined && prop.length > 0) {
    props.setReplyTo(prop);
  }

  prop = propTimestamp.prop('checked');
  if (prop) {
    props.setTimestamp(new Date());
  }

  prop = propType.val().trim();
  if (prop !== undefined && prop.length > 0) {
    props.setType(prop);
  }

  prop = propUserId.val().trim();
  if (prop !== undefined && prop.length > 0) {
    props.setUserId(prop);
  }

}
```

The `AmqpProperties` class defines pre-defined properties as per AMQP 0-9-1 spec and provides type-safe getters and setters for those pre-defined properties. The value of AMQP 0-9-1's standard "headers" property is of type `AmqpArguments`. The KAAZING Gateway AMQP JavaScript library implementation uses `AmqpArguments` to encode the table. Similarly, the KAAZING Gateway AMQP implementation decodes the table and constructs an instance of `AmqpArguments`.

**Notes:** 
-   See the `AmqpChannel publishBasic()` method for more information.
-   The timestamp property (`setTimestamp(ts)`), will only handle 6-bytes (or 48-bit) timestamp values.
-   The username set with the `setUserId()` method must match the user that is currently authenticated with the AMQP broker. If they do not match you will see the following error:
     `PRECONDITION_FAILED - user_id property set to '<name>' but authenticated user was '<name>' `

Finally, to publish the message, you can use the `publishMessage()` function in the desired location in your code.

At this point, you can complete your first, "publish messages" application, then move on to the next section to create your "consume messages" application. Alternatively, you can continue to build on the same application, which will both publish and consume messages.

### Declare a queue

AMQP messages are consumed from queues. You can think of a queue as a mailbox: messages addressed to a particular address (the routing key) are placed in the mailbox for the consumer to pick up. If multiple consumers are bound to a single queue, only one of the consumers receives the message (the one that picked up the mail).

To check if a queue exists on the AMQP broker (without creating it), you can create a passive queue. Additionally, queues can be marked exclusive, tying them to a specific connection. If a queue is marked exclusive, it is deleted when the connection on which it was created is closed.

Queues can be durable, meaning the queue survives broker shutdown and must be deleted manually, or non-durable (temporary), meaning that the queue lasts only until the broker is shutdown. Queues can also be marked auto delete, which means that the queue is automatically deleted when it is no longer in use. The following example shows how you can create a queue on the consume channel. Here, you define the `consumeChannelOpenHandler` function that will be called once the `consumeChannel` is opened:

``` js
var consumeChannelOpenHandler = function(channel) {
  log("OPENED: Consume Channel");

  channelsReady++;
  if (channelsReady == 2) {
    doBind();
  }
};
```

### Bind an exchange to a queue

Once you have created an exchange and a queue in AMQP, you must bind or map one to the other so that messages published to a specific exchange are delivered to a particular queue. You bind a queue to an exchange with a routing key as shown in the following example. Here, you define the `declareQueue` to bind the queue to the exchange:

``` js
  consumeChannel.declareQueue({
    queue: queueName
  })
    .bindQueue({
      queue: queueName,
      exchange: consumeExchange.val(),
      routingKey: routingKey
    })
    .consumeBasic({
      queue: queueName,
      consumerTag: myConsumerTag,
      noAck: false
    });
```

### Consume messages

Once messages are published they can be consumed from a queue. A variety of options can be applied to messages in a queue. For example, publishers can choose to require acknowledgement (ack) of messages so that messages can be redelivered in the case of a delivery failure. If the queue is set to exclusive, it is scoped to just the current connection and deleted when the connection on which it was established is closed. Additionally, you can use the no local setting to notify the broker not to send messages to the connection on which the messages were published. The following example shows how you can define the `bindQueue` to prepare the `consumeBasic`, which will then consume messages from a queue on the consume channel:

``` js
  consumeChannel.declareQueue({
    queue: queueName
  })
    .bindQueue({
      queue: queueName,
      exchange: consumeExchange.val(),
      routingKey: routingKey
    })
    .consumeBasic({
      queue: queueName,
      consumerTag: myConsumerTag,
      noAck: false
    });
```

**Note:** For more information, see AmqpChannel `consumeBasic()` method.
After the `consumeBasic()` method is successful, the consume event is raised, and the event listener is fired. The AMQP broker can then start delivering messages to the client and these messages raise the message event:

``` js
  consumeChannel.addEventListener("message", function(message) {
    handleMessageReceived(message);
  });
...
var handleMessageReceived = function(event) {

  receivedMessageCount.text(++receivedMessageCounter);

  // var body = message.body.getString(Kaazing.Charset.UTF8);
  var body = null;

  if (typeof(ArrayBuffer) === "undefined") {
    body = event.getBodyAsByteBuffer().getString(Kaazing.Charset.UTF8);
  } else {
    body = arrayBufferToString(event.getBodyAsArrayBuffer())
  }
  var props = event.properties;
  var exchange = event.args.exchange;
  var routingKey = event.args.routingKey;
  var dt = event.args.deliveryTag;
  var channel = event.target;
  logMessageDiv("MESSAGE CONSUMED: ", "receiveMessage", body, props, exchange, routingKey);

  // Acknowledge the received message. Otherwise, the broker will eventually
  // run out of memory.
  var config = {
    deliveryTag: dt,
    multiple: true
  };
  setTimeout(function() {
    channel.ackBasic(config);
  }, 0);
}
```

**Note:** The function defined in this section is referenced from the [Declare a queue](#creating_queues) section. At this point, you've configured the Gateway (or RFC-6455 WebSocket endpoint) to communicate with your AMQP broker and set up your JavaScript client to publish messages to an exchange. You have also set up the client (or created a second application) to consume those messages from the AMQP broker. The next section explains how you can further enhance your application to use transactions.

#### Message Acknowledgement

The Boolean parameter `noAck` is optional with the default value of `true`. If `noAck` is `true`, the AMQP broker will not expect any acknowledgement from the client before discarding the message. If `noAck` is `false`, then the AMQP broker will expect an acknowledgement before discarding the message. If `noAck` is specified to be `false`, then you must explicitly acknowledge the received message using `AmqpChannel.ackBasic()`.

In the JavaScript AMQP demo code in this procedure, message acknowledgement is being performed because `false` was passed in for `noAck` in `consumeBasic()`. If the JavaScript client acknowledges a message **and** `noAck` is `true` (the default setting), then the AMQP message broker will close the channel.

### Use transactions

AMQP supports transactional messaging, through server local transactions. In a transaction the server only publishes a set of messages as one unit when the client commits the transaction. Transactions only apply to message publishing and not to the consumption of the messages.

**Note:** Once you commit or rollback a transaction on a channel, a new transaction is started automatically. For this reason, you must commit all future messages you want to publish on that channel or create a new, non-transactional channel to publish messages on.
Use separate publish and consume channels for transactions from the channels that are used for regular publishing and consuming of messages.

``` js
var handleSelect = function() {
  txnPublishChannel.selectTx(function() {
    log("TXN SELECT");
    updateGuiState(true, true);
  });
}

var handleCommit = function() {
  txnPublishChannel.commitTx(function() {
    log("TXN COMMIT");
    updateGuiState(true, false);
  });
}

var handleTxSend = function() {
  doSend(txnPublishChannel, txMessage.val(), "TXN MESSAGE PUBLISHED: ", "txSendMessage");
}

var handleRollback = function() {
  txnPublishChannel.rollbackTx(function() {
    log("TXN ROLLBACK");
    updateGuiState(true, false);
  });
}
```

After the transaction is selected successfully, committed, or rolled back, the corresponding events (`selecttransaction`, `committransaction`, and `rollbacktransaction`) are raised and the callback functions are called. These events call previously registered event handlers:

``` js
var txnPublishChannelOpenHandler = function(channel) {
  txnPublishChannel.declareExchange({
    exchange: txnExchangeName,
    type: "fanout"
  });

  // listen for these requests to return
  txnPublishChannel.addEventListener("selecttransaction", function() {
    log("TXN SELECTED/STARTED");
  });

  txnPublishChannel.addEventListener("committransaction", function() {
    log("TXN COMMITTED");
  });

  txnPublishChannel.addEventListener("rollbacktransaction", function() {
    log("TXN ROLLBACKED");
  });
};
```

### Control message flow

You can use flow control in AMQP to temporarily or permanently halt the flow of messages from a queue to a consumer on a channel. If you turn the message flow off, no messages are sent to the consumer. The following example shows how you can turn the flow of messages on a channel off and on:

``` js
var handleFlowOn = function() {
  consumeChannel.flowChannel(true);
}

var handleFlowOff = function() {
  consumeChannel.flowChannel(false);
}
```

After the flow on a channel is halted or resumed successfully, the flow event is raised and the callback functions are called.

### Handle Exceptions

Channels are lightweight and cheap, and therefore used in AMQP's exception handling mechanism. Channels are closed when an exception occurs. The following example shows how you can handle exceptions that occur:

``` js
publishChannel.addEventListener("error", function(e) {
  log("CHANNEL ERROR: Publish Channel - " + e.message);
});
```

When the channel is closed, the function that is called receives an `AmqpEvent` object, that contains a frame with detailed information about the exception.

### Setting a Challenge Handler using AmqpClientFactory

A`WebSocketFactory` can be obtained from `AmqpClientFactory`, and then the `WebSocketFactory` can be used to setup the `ChallengeHandler` used to secure your client.

``` js
setupSSO(amqpClientFactory.getWebSocketFactory());
...
var setupSSO = function(webSocketFactory) {
        /* Respond to authentication challenges with popup login dialog */
        if (webSocketFactory) {
                var basicHandler = new Kaazing.Gateway.BasicChallengeHandler();
                basicHandler.loginHandler = function(callback) {
                        popupLoginDialog(callback);
                }
                webSocketFactory.setChallengeHandler(basicHandler);
        }
}

var popupLoginDialog = function(callback) {

        //popup dialog to get credentials
        var popup = document.getElementById("logindiv");
        $("#logindiv").slideToggle(300);
        var login = document.getElementById("sso_login");
        var cancel = document.getElementById("sso_cancel");

        $('#sso_username').focus();

        // As a convenience, connect when the user presses Enter
        // in the location field.
        $('#sso_password').keypress(function(e) {
                if (e.keyCode == 13) {
                        e.stopImmediatePropagation(); // Prevent firing twice.
                        login.click();
                }
        });

        //"OK" button was clicked, invoke callback function with credential to login
        login.onclick = function() {
                var username = document.getElementById("sso_username");
                var password = document.getElementById("sso_password");
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
                var username = document.getElementById("sso_username");
                var password = document.getElementById("sso_password");
                //clear user input
                username.value = "";
                password.value = "";
                //hide popup
                $("#logindiv").slideToggle(100);
                callback(null);
        }
}
```

Creating the JavaScript AMQP Demo
---------------------------------

The following example demonstrates how to create the JavaScript AMQP demo listed in [Components and Tools](#components-and-tools). You will add a script tag in the HTML page that points to the JavaScript AMQP library, an HTML form, and the JavaScript needed to connect to the RFC-6455 WebSocket endpoint over WebSocket and send and receive AMQP messages with the AMQP broker.

1.  Configure the Gateway (or RFC-6455 WebSocket endpoint) for JavaScript client and AMQP broker connections.

    To develop applications using the KAAZING Gateway AMQP JavaScript client libraries, you must configure the Gateway (or RFC-6455 WebSocket endpoint) to communicate with your AMQP broker.

    For the Gateway, locate the following default configuration element for the AMQP service, located in the configuration file `GATEWAY_HOME/conf/gateway-config.xml`:

    ``` xml
    <!-- Proxy service to AMQP server -->
    <service>
        <name>AMQP Service</name>
        <description>AMQP Service</description>
        <accept>ws://${gateway.hostname}:${gateway.extras.port}/amqp</accept>
        <connect>tcp://${gateway.hostname}:5672</connect>

        <type>amqp.proxy</type>
        <properties>
            <service.domain>${gateway.hostname}</service.domain>
            <encryption.key.alias>session</encryption.key.alias>
        </properties>

        <realm-name>demo</realm-name>

        <!--
        <authorization-constraint>
            <require-role>AUTHORIZED</require-role>
        </authorization-constraint>
        -->

        <cross-site-constraint>
            <allow-origin>http://${gateway.hostname}:${gateway.extras.port}</allow-origin>
        </cross-site-constraint>
    </service>
    ```

    In this case, the service is configured to accept WebSocket AMQP requests from the browser at `ws://localhost:8001/amqp` (using the Property defaults described in [Configure KAAZING Gateway](../admin-reference/p_conf_files.md "Kaazing Developer Network")) and proxy those requests to a locally installed AMQP broker (localhost) at port 5672.

    To configure the Gateway to accept WebSocket requests at another URL or to connect to a different AMQP broker, you can edit `GATEWAY_HOME/conf/gateway-config.xml`, update the values for the accept elements, change the connect property, and restart the Gateway.

2.  Navigate to the location where your Web client files will be stored. When you are finished your file directory will looks like this:

    ```
    GATEWAY_HOME/web/base/amqp/
    - index.md
    - demo.css
    - WebSocket.js
    - Amqp-0-9-1.js
    ```

3.  Add a new folder named **amqp** .
4.  In the **amqp** folder, add an HTML page for the client named **index.md**.
5.  Copy the JavaScript AMQP Client Libraries into the **amqp** folder. For the location of the WebSocket.js and Amqp-0-9-1.js files, see [Components and Tools](#components-and-tools).
6.  Open index.md and enter the HTML in [HTML code for index.html](#html-code-for-indexhtml).
7.  In **index.md**, enter the links to the JavaScript AMQP library files:

    ``` html
        <script src="WebSocket.js"></script>
        <script src="Amqp-0-9-1.js"></script>
    ```

8.  In **index.md**, enter the JavaScript AMQP Client API calls from [JavaScript for index.html](#javascript-for-indexhtml).
9.  Start the Gateway (or RFC-6455 WebSocket endpoint) and AMQP broker.
10. Open **index.md** in a web browser to test the client.
    1.  In **Location**, enter `ws://localhost:8000/amqp` (or the address used by the RFC-6455 WebSocket endpoint).
    2.  Click **Connect**. You can see the connection opened, the channels opened, the exchange declared, and the queues opened:

        ``` txt
        CONSUME FROM QUEUE: client506938
        QUEUE BOUND: demo_exchange - client506938
        QUEUE DECLARED: client506938
        EXCHANGE DECLARED: demo_exchange
        OPENED: Consume Channel
        OPENED: Publish Channel
        OPEN: Consume Channel
        OPEN: Publish Channel
        CONNECTED
        CONNECTING: ws://localhost:8000/amqp guest
        ```

**Note:** You can also point your client at a live demo that doesn't require the Gateway (or RFC-6455 WebSocket endpoint) or a local AMQP broker. In the **Location** field, enter `ws://sandbox.kaazing.net:80/amqp091`. For more information, see [kaazing.org](http://kaazing.org).

JavaScript AMQP Demo Code
-------------------------

The code used in the demo is included below.

### HTML code for index.html

``` html
<!DOCTYPE html>
<head>
<script type="text/javascript" language="javascript" src="WebSocket.js"></script>
<script type="text/javascript" language="javascript" src="Amqp-0-9-1.js"></script>

<script type="text/javascript">
...
</script>
</head>

<body class="demo">

<h1>
  AMQP Messaging Demo (JavaScript)
</h1>
<div id="jms-javascript" class="amqp">
  <div id="middle">
    <div class="leftPanels">
      <div id="login_div" class="panel">
        <span class="info">Connection details</span><br>
        <label for="url">Location</label><input id="url" placeholder="Example: ws://localhost:8001/amqp"><br>
        <label for="username">AMQP Username</label><input id="username" value="guest" placeholder="Username on AMQP broker"><br>
        <label for="password">AMQP Password</label><input type="password" id="password" value="guest" placeholder="Password on AMQP broker"><br>
        <label for="virtualhost">AMQP Virtual Host</label><input id="virtualhost" value="/" placeholder="Virtual host on AMQP broker. Example: /"><br>
        <button id="connectBut">Connect</button> <button id="disconnectBut">Close</button>
        <div id="logindiv">
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
              <label for="sso_username">Username:</label>
            </div>
            <div class="form-fields">
              <input id="sso_username" size="12" value="">
            </div>
          </div>
          <div class="clearfix">
            <div class="form-labels">
              <label for="sso_password">Password:</label>
            </div>
            <div class="form-fields">
              <input id="sso_password" type="password" size="12" value=""><br>
              <button id="sso_login">OK</button> <button id="sso_cancel">Cancel</button>
            </div>
          </div>
        </div>
      </div>
      <div id="properties_div" class="panel">
        <span class="info"><a href="javascript:void(0);%20//%20Show%20AMQP%20Properties" id="propertiesToggle" class="infoHidden" name="propertiesToggle">Show</a> AMQP properties</span><br>
        <div id="properties_div_content">
          <label for="propAppId">appId</label><input id="propAppId" placeholder="Example: My app"><br>
          <label for="propContentEncoding">contentEncoding</label><input id="propContentEncoding" placeholder="Example: UTF-8" value="UTF-8"><br>
          <label for="propContentType">contentType</label><input id="propContentType" placeholder="Example: text/plain" value="text/plain"><br>
          <label for="propCorrelationId">correlationId</label><input id="propCorrelationId" placeholder="Example: 1"><br>
          <label for="propDeliveryMode">deliveryMode</label> <select id="propDeliveryMode" name="propDeliveryMode">
            <option value="1" selected>
              1 (Non-persistent)
            </option>
            <option value="2">
              2 (persistent)
            </option>
          </select><br>
          <label for="propExpiration">expiration</label><input id="propExpiration" placeholder="Time to live (milliseconds). Example: 60000"><br>
          <label>messageId</label><input type="checkbox" id="propMessageId" name="propMessageId" checked><label class="checkboxLabel" for="propMessageId">Include sequentially generated id</label><br>
          <label for="propPriority">priority</label> <select id="propPriority" name="propPriority">
            <!-- Options will be added dynamically. -->
          </select><br>
          <label for="propReplyTo">replyTo</label><input id="propReplyTo" placeholder="Address to send replies"><br>
          <label>timestamp</label> <input type="checkbox" id="propTimestamp" name="propTimestamp" checked><label class="checkboxLabel" for="propTimestamp">Include timestamp when sending</label><br>
          <label for="propType">type</label><input id="propType" placeholder="Message type. Example: custom-event"><br>
          <label for="propUserId">userId</label><input id="propUserId" placeholder="If set, must match AMQP Username"><br>
        </div>
      </div>
      <div id="headers_div" class="panel">
        <span class="info"><a href="javascript:void(0);%20//%20Show%20Headers" id="headersToggle" class="infoHidden" name="headersToggle">Show</a> Custom headers</span><br>
        <div id="headers_div_content">
          <label>Header 1</label> <input id="headerName1" placeholder="Name" value="headerKey1"> <select id="headerType1" name="headerType1">
            <option value="int" selected>
              int
            </option>
            <option value="LongString">
              LongString
            </option>
          </select> <input id="headerValue1" placeholder="Value" value="123"><br>
          <label>Header 2</label> <input id="headerName2" placeholder="Name" value="headerKey2"> <select id="headerType2" name="headerType2">
            <option value="int">
              int
            </option>
            <option value="LongString" selected>
              LongString
            </option>
          </select> <input id="headerValue2" placeholder="Value" value="abcde"><br>
        </div>
      </div>
      <div id="exchange_div" class="panel">
        <span class="info">Publish a message to an exchange</span><br>
        <label for="consumeExchange">Exchange</label><input id="consumeExchange" value="demo_exchange"><br>
        <label for="consumeMessage">Message</label><input id="consumeMessage" value="Hello, AMQP!"><br>
        <button id="sendBut">Publish</button> <button id="flowOnBut">Flow On</button> <button id="flowOffBut">Flow Off</button>
      </div>
      <div id="transaction_div" class="panel">
        <span class="info">Publish as a transaction</span><br>
        <label for="txExchange">Exchange</label><input id="txExchange" value="demo_txn_exchange"><br>
        <label for="txMessage">Message</label><input id="txMessage" value="Hello transaction message!"><br>
        <button id="selectBut">Select</button> <button id="txSendBut">Publish</button> <button id="commitBut">Commit</button> <button id="rollbackBut">Rollback</button>
      </div>
    </div><!-- .leftPanels -->
    <div class="rightPanels">
      <div id="console_div" class="panel">
        <div class="info">
          <div style="float: left;">
            Log messages
          </div>
          <div style="float: right; margin-right: 5px;">
            Messages received : <span id="receivedMessageCount">0</span>
          </div>
          <div class="clearfix"></div>
        </div>
        <div id="console"></div><button id="clearBut">Clear Log</button> <input type="checkbox" id="toggleAmqpPropsCb" class="cb" style="margin-left: 20px;"><label for="toggleAmqpPropsCb">Show AMQP Properties</label>
      </div>
    </div><!-- .rightPanels -->
    <div class="clearfix"></div>
  </div>
</div>


</body>
</html>
```

### JavaScript for index.html

``` html
<script type="text/javascript" language="javascript" src="WebSocket.js"></script>
<script type="text/javascript" language="javascript" src="Amqp-0-9-1.js"></script>

<script type="text/javascript">

var url, username, password, virtualhost, connectBut, disconnectBut;
var consumeExchange, consumeMessage, sendBut, flowOnBut, flowOffBut;
var txExchange, txMessage, selectBut, txSendBut, commitBut, rollbackBut;
var logConsole, clearBut, toggleAmqpPropsCb;
var propertiesToggle, propertiesDivContent;
var headersToggle, headersDivContent;

var propAppId, propContentEncoding, propContentType, propCorrelationId, propDeliveryMode;
var propExpiration, propMessageId, propPriority, propReplyTo, propTimestamp, propType, propUserId;
var headerName1, headerType1, headerValue1;
var headerName2, headerType2, headerValue2;

var amqpClientFactory = new Kaazing.AMQP.AmqpClientFactory();
var amqpClient;

var queueName;
var txnQueueName;
var myConsumerTag;
var myTxnConsumerTag;
var routingKey;
var txnRoutingKey;

var channelsReady;

var publishChannel;
var consumeChannel;
var txnPublishChannel;
var txnConsumeChannel;

var receivedMessageCount, receivedMessageCounter = 0;

var messageIdCounter;

$(document).ready(function() {

  url = $("#url");
  username = $("#username");
  password = $("#password");
  virtualhost = $("#virtualhost");
  connectBut = $("#connectBut");
  disconnectBut = $("#disconnectBut");

  propertiesToggle = $("#propertiesToggle");
  propertiesDivContent = $("#properties_div_content")

  propAppId = $("#propAppId");
  propContentEncoding = $("#propContentEncoding");
  propContentType = $("#propContentType");
  propCorrelationId = $("#propCorrelationId");
  propDeliveryMode = $("#propDeliveryMode");
  propExpiration = $("#propExpiration");
  propMessageId = $("#propMessageId");
  propPriority = $("#propPriority");
  propReplyTo = $("#propReplyTo");
  propTimestamp = $("#propTimestamp");
  propType = $("#propType");
  propUserId = $("#propUserId");

  headersToggle = $("#headersToggle");
  headersDivContent = $("#headers_div_content")

  headerName1 = $("#headerName1");
  headerType1 = $("#headerType1");
  headerValue1 = $("#headerValue1");
  headerName2 = $("#headerName2");
  headerType2 = $("#headerType2");
  headerValue2 = $("#headerValue2");

  consumeExchange = $("#consumeExchange");
  consumeMessage = $("#consumeMessage");
  sendBut = $("#sendBut");
  flowOnBut = $("#flowOnBut");
  flowOffBut = $("#flowOffBut");

  txExchange = $("#txExchange");
  txMessage = $("#txMessage");
  selectBut = $("#selectBut");
  txSendBut = $("#txSendBut");
  commitBut = $("#commitBut");
  rollbackBut = $("#rollbackBut");

  logConsole = $("div#console");
  receivedMessageCount = $("#receivedMessageCount");
  clearBut = $("#clearBut");
  toggleAmqpPropsCb = $("#toggleAmqpPropsCb");

  routingKey = "broadcastkey";
  txnRoutingKey = "txnBroadcastKey";

  updateGuiState(false);

  // Dynamically create the priority property poplist.
  for (var i = 0; i < 10; i++) {
    propPriority
      .append($("<option></option>")
        .attr("value", i)
        .text(i));
  }
  // Set the default priority.
  propPriority.find('option[value="6"]').attr("selected", true);

  if (window.location.protocol != "file:") {
    // construct the WebSocket location
    var locationURI = new Kaazing.Gateway.URI(document.URL || location.href);
    l = locationURI;

    // default port if necessary
    if (locationURI.port == null) {
      var defaultPorts = {
        "http": 80,
        "https": 443
      };
      locationURI.port = defaultPorts[locationURI.scheme];
    }

    locationURI.scheme = locationURI.scheme.replace("http", "ws");
    locationURI.path = "/amqp";
    delete locationURI.query;
    delete locationURI.fragment;

    // default the location
    url.val(locationURI.toString());
  } else {
    url.val("ws://localhost:8001/amqp");
  }

  connectBut.click(handleConnect);
  disconnectBut.click(handleDisconnect);

  propertiesToggle.click(handlePropertiesToggle);

  headersToggle.click(handleHeadersToggle);

  sendBut.click(handleSend);
  flowOnBut.click(handleFlowOn);
  flowOffBut.click(handleFlowOff);

  selectBut.click(handleSelect);
  commitBut.click(handleCommit);
  txSendBut.click(handleTxSend);
  rollbackBut.click(handleRollback);

  clearBut.click(clearLog);
  toggleAmqpPropsCb.change(toggleAmqpProperties);


  // Pick a random prefix for the counter, to minimize collisions
  // with other demo clients.
  messageIdCounter = getRandomInt(1, 10000);

  // As a convenience, connect when the user presses Enter
  // if no fields have focus, and we're not currently connected.
  $(window).keypress(function(e) {
    if (e.keyCode == 13) {
      if (e.target.nodeName == "BODY" && url.prop("disabled") == false) {
        handleConnect();
      }
    }
  });

  // As a convenience, connect when the user presses Enter
  // in the location field.
  $('#url').keypress(function(e) {
    if (e.keyCode == 13) {
      handleConnect();
    }
  });

  // As a convenience, send as text when the user presses Enter
  // in the message field.
  $('#consumeMessage').keypress(function(e) {
    if (e.keyCode == 13) {
      handleSend();
    }
  });

  setupSSO(amqpClientFactory.getWebSocketFactory());
});

var handlePropertiesToggle = function() {
  propertiesDivContent.toggle(200, function() {
    var linkText = "Show";
    if (propertiesDivContent.is(":visible")) {
      linkText = "Hide";
      propertiesToggle.removeClass("infoHidden");
      propertiesToggle.addClass("infoDisplayed");
    } else {
      propertiesToggle.removeClass("infoDisplayed");
      propertiesToggle.addClass("infoHidden");
    }
    propertiesToggle.text(linkText);
  });
}

var handleHeadersToggle = function() {
  headersDivContent.toggle(200, function() {
    var linkText = "Show";
    if (headersDivContent.is(":visible")) {
      linkText = "Hide";
      headersToggle.removeClass("infoHidden");
      headersToggle.addClass("infoDisplayed");
    } else {
      headersToggle.removeClass("infoDisplayed");
      headersToggle.addClass("infoHidden");
    }
    headersToggle.text(linkText);
  });
}

var clearLog = function() {
  logConsole.empty();
}

var toggleAmqpProperties = function() {
  $('div.properties').toggleClass('hidden', !toggleAmqpPropsCb.is(':checked'));
}

// Log a string message
var log = function(message) {
  var div = $('<div>');
  div.addClass("logMessage");
  div.md(message);
  logDiv(div);
}

var logDiv = function(div) {
  logConsole.append(div);
  toggleAmqpProperties(); // Hide the headers if that's what the user specified
  // Make sure the last line is visible.
  logConsole.scrollTop(logConsole[0].scrollHeight);
  // Only keep the most recent few rows so the log doesn't grow out of control.
  while (logConsole.children().length > 40) {
    // Delete two rows to preserved the alternate background colors.
    logConsole.children().first().remove();
    logConsole.children().first().remove();
  }
}

var stringToArrayBuffer = function(str) {
  var buf = new ArrayBuffer(str.length);
  var bufView = new Uint8Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

var arrayBufferToString = function(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}


// Returns a random integer between min (inclusive) and max (exclusive).

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

var updateGuiState = function(connected, transacted) {

  if (transacted === undefined) {
    transacted = false;
  }

  url.prop("disabled", connected);
  username.prop("disabled", connected);
  password.prop("disabled", connected);
  virtualhost.prop("disabled", connected);
  connectBut.prop("disabled", connected);
  disconnectBut.prop("disabled", !connected);

  propAppId.prop("disabled", !connected);
  propContentEncoding.prop("disabled", !connected);
  propContentType.prop("disabled", !connected);
  propCorrelationId.prop("disabled", !connected);
  propDeliveryMode.prop("disabled", !connected);
  propExpiration.prop("disabled", !connected);
  propMessageId.prop("disabled", !connected);
  propPriority.prop("disabled", !connected);
  propReplyTo.prop("disabled", !connected);
  propTimestamp.prop("disabled", !connected);
  propType.prop("disabled", !connected);
  propUserId.prop("disabled", !connected);

  headerName1.prop("disabled", !connected);
  headerType1.prop("disabled", !connected);
  headerValue1.prop("disabled", !connected);
  headerName2.prop("disabled", !connected);
  headerType2.prop("disabled", !connected);
  headerValue2.prop("disabled", !connected);

  consumeExchange.prop("disabled", !connected);
  consumeMessage.prop("disabled", !connected);
  sendBut.prop("disabled", !connected);
  flowOnBut.prop("disabled", !connected);
  flowOffBut.prop("disabled", !connected);

  txExchange.prop("disabled", !connected);
  txMessage.prop("disabled", !connected);

  if (connected) {
    selectBut.prop("disabled", transacted);
    txSendBut.prop("disabled", !transacted);
    commitBut.prop("disabled", !transacted);
    rollbackBut.prop("disabled", !transacted);
  } else {
    selectBut.prop("disabled", !connected);
    txSendBut.prop("disabled", !connected);
    commitBut.prop("disabled", !connected);
    rollbackBut.prop("disabled", !connected);
  }
}

var handleConnect = function() {
  log("CONNECTING: " + url.val() + " " + username.val());

  queueName = "client" + Math.floor(Math.random() * 1000000);
  txnQueueName = "txnclient" + Math.floor(Math.random() * 1000000);
  myConsumerTag = "client" + Math.floor(Math.random() * 1000000);
  myTxnConsumerTag = "txnclient" + Math.floor(Math.random() * 1000000);

  amqpClient = amqpClientFactory.createAmqpClient();
  amqpClient.addEventListener("close", function() {
    log("DISCONNECTED");
    updateGuiState(false);
  });

  amqpClient.addEventListener("error", function(e) {
    log("CONNECTION ERROR:" + e.message);
  });

  var credentials = {
    username: username.val(),
    password: password.val()
  };
  var options = {
    url: url.val(),
    virtualHost: virtualhost.val(),
    credentials: credentials
  };
  amqpClient.connect(options, openHandler);
}

var openHandler = function() {
  log("CONNECTED");
  channelsReady = 0;

  log("OPEN: Publish Channel");
  publishChannel = amqpClient.openChannel(publishChannelOpenHandler);

  log("OPEN: Consume Channel");
  consumeChannel = amqpClient.openChannel(consumeChannelOpenHandler);

  txnPublishChannel = amqpClient.openChannel(txnPublishChannelOpenHandler);
  txnConsumeChannel = amqpClient.openChannel(txnConsumeChannelOpenHandler);
};

var publishChannelOpenHandler = function(channel) {
  log("OPENED: Publish Channel");

  publishChannel.declareExchange({
    exchange: consumeExchange.val(),
    type: "fanout"
  });

  // listen for these requests to return
  publishChannel.addEventListener("declareexchange", function() {
    log("EXCHANGE DECLARED: " + consumeExchange.val());
  });

  publishChannel.addEventListener("error", function(e) {
    log("CHANNEL ERROR: Publish Channel - " + e.message);
  });

  publishChannel.addEventListener("close", function() {
    log("CHANNEL CLOSED: Publish Channel");
  });

  updateGuiState(true);

  channelsReady++;
  if (channelsReady == 2) {
    doBind();
  }
};

var consumeChannelOpenHandler = function(channel) {
  log("OPENED: Consume Channel");

  channelsReady++;
  if (channelsReady == 2) {
    doBind();
  }
};

var doBind = function() {
  consumeChannel.addEventListener("declarequeue", function() {
    log("QUEUE DECLARED: " + queueName);
  });

  consumeChannel.addEventListener("bindqueue", function() {
    log("QUEUE BOUND: " + consumeExchange.val() + " - " + queueName);
  });

  consumeChannel.addEventListener("consume", function() {
    log("CONSUME FROM QUEUE: " + queueName);
  });

  consumeChannel.addEventListener("flow", function(e) {
    log("FLOW: " + (e.args.active ? "ON" : "OFF"));
  });

  consumeChannel.addEventListener("close", function() {
    log("CHANNEL CLOSED: Consume Channel");
  });

  consumeChannel.addEventListener("message", function(message) {
    handleMessageReceived(message);
  });

  // Passing a false value for 'noAck' in the AmqpChannel.consumeBasic() 
  // function. This means, there should be be explicit acknowledgement when 
  // the message is received.
  consumeChannel.declareQueue({
    queue: queueName
  })
    .bindQueue({
      queue: queueName,
      exchange: consumeExchange.val(),
      routingKey: routingKey
    })
    .consumeBasic({
      queue: queueName,
      consumerTag: myConsumerTag,
      noAck: false
    });

  updateGuiState(true);
};

var txnPublishChannelOpenHandler = function(channel) {
  txnPublishChannel.declareExchange({
    exchange: txExchange.val(),
    type: "fanout"
  });

  // listen for these requests to return
  txnPublishChannel.addEventListener("selecttransaction", function() {
    log("TXN SELECTED/STARTED");
  });

  txnPublishChannel.addEventListener("committransaction", function() {
    log("TXN COMMITTED");
  });

  txnPublishChannel.addEventListener("rollbacktransaction", function() {
    log("TXN ROLLED BACK");
  });
};

var txnConsumeChannelOpenHandler = function(channel) {
  txnConsumeChannel.addEventListener("message", function(event) {
    var body = null;

    if (typeof(ArrayBuffer) === "undefined") {
      body = event.getBodyAsByteBuffer().getString(Kaazing.Charset.UTF8);
    } else {
      body = arrayBufferToString(event.getBodyAsArrayBuffer())
    }
    log("TXN MESSAGE CONSUMED: " + body);
    var props = event.properties;
    if (props != null) {
      var headers = props.getHeaders();
      if (headers != null) {
        log("Headers: " + headers.toString());
      }
      log("Properties " + props.toString());
    }

    var dt = event.args.deliveryTag;
    var channel = event.target;

    // Acknowledge the message as we passed in a false for 'noAck' in
    // AmqpChannel.consumeBasic() call. If the message is not acknowledged, 
    // the broker will keep holding the message. And, as more and more 
    // messages are held by the broker, it will eventually result in 
    // an OutOfMemoryError.
    var config = {
      deliveryTag: dt,
      multiple: true
    };
    setTimeout(function() {
      channel.ackBasic(config);
    }, 0);
  });

  // Passing a false value for 'noAck' in the AmqpChannel.consumeBasic() 
  // function. This means, there should be be explicit acknowledgement when 
  // the message is received.
  txnConsumeChannel.declareQueue({
    queue: txnQueueName
  })
    .bindQueue({
      queue: txnQueueName,
      exchange: txExchange.val(),
      routingKey: txnRoutingKey
    })
    .consumeBasic({
      queue: txnQueueName,
      consumerTag: myTxnConsumerTag,
      noAck: false
    });
};

var handleDisconnect = function() {
  log("DISCONNECT");
  amqpClient.disconnect();

  updateGuiState(false);
}

var handleSend = function() {
  doSend(publishChannel, consumeExchange.val(), routingKey, consumeMessage.val(), "MESSAGE PUBLISHED: ", "sendMessage");
}

var addProperties = function(props) {
  var prop;

  prop = propAppId.val().trim();
  if (prop !== undefined && prop.length > 0) {
    props.setAppId(prop);
  }

  prop = propContentType.val().trim();
  if (prop !== undefined && prop.length > 0) {
    props.setContentType(prop);
  }

  prop = propContentEncoding.val().trim();
  if (prop !== undefined && prop.length > 0) {
    props.setContentEncoding(prop);
  }

  prop = propCorrelationId.val().trim();
  if (prop !== undefined && prop.length > 0) {
    props.setCorrelationId(prop);
  }

  prop = propCorrelationId.val().trim();
  if (prop !== undefined && prop.length > 0) {
    props.setCorrelationId(prop);
  }

  prop = propDeliveryMode.val().trim();
  props.setDeliveryMode(prop);

  prop = propExpiration.val().trim();
  if (prop !== undefined && prop.length > 0) {
    props.setExpiration(prop);
  }

  prop = propMessageId.prop('checked');
  if (prop) {
    props.setMessageId((messageIdCounter++).toString());
  }

  prop = propPriority.val().trim();
  props.setPriority(prop);

  prop = propReplyTo.val().trim();
  if (prop !== undefined && prop.length > 0) {
    props.setReplyTo(prop);
  }

  prop = propTimestamp.prop('checked');
  if (prop) {
    props.setTimestamp(new Date());
  }

  prop = propType.val().trim();
  if (prop !== undefined && prop.length > 0) {
    props.setType(prop);
  }

  prop = propUserId.val().trim();
  if (prop !== undefined && prop.length > 0) {
    props.setUserId(prop);
  }

}

var fff = function(customHeaders, headerName, headerType, headerValue) {
  if (headerName !== undefined && headerName.length > 0) {
    switch (headerType) {
      case "int":
        customHeaders.addInteger(headerName, headerValue);
        break;
      case "LongString":
        customHeaders.addLongString(headerName, headerValue);
        break;
    }
  }
}

var doSend = function(channel, exchangeName, routeKey, messageText, logText, className) {
  if (messageText == null || messageText.length == 0) {
    alert("Enter a valid string for message");
    return;
  }

  var body = null;

  if (typeof(ArrayBuffer) === "undefined") {
    body = new Kaazing.ByteBuffer();
    body.putString(messageText, Kaazing.Charset.UTF8);
    body.flip();
  } else {
    body = stringToArrayBuffer(messageText);
  }

  var props = new Kaazing.AMQP.AmqpProperties();

  addProperties(props);

  var customHeaders = new Kaazing.AMQP.AmqpArguments();

  fff(customHeaders, headerName1.val().trim(), headerType1.val(), headerValue1.val().trim());
  fff(customHeaders, headerName2.val().trim(), headerType2.val(), headerValue2.val().trim());

  props.setHeaders(customHeaders);
  p2 = props;

  logMessageDiv(logText, className, messageText, props, exchangeName, routeKey);

  channel.publishBasic({
    body: body,
    properties: props,
    exchange: exchangeName,
    routingKey: routeKey
  });
}

var handleFlowOn = function() {
  consumeChannel.flowChannel(true);
}

var handleFlowOff = function() {
  consumeChannel.flowChannel(false);
}

var handleSelect = function() {
  txnPublishChannel.selectTx(function() {
    log("TXN SELECT");
    updateGuiState(true, true);
  });
}

var handleCommit = function() {
  txnPublishChannel.commitTx(function() {
    log("TXN COMMIT");
    updateGuiState(true, false);
  });
}

var handleTxSend = function() {
  doSend(txnPublishChannel, txExchange.val(), txnRoutingKey, txMessage.val(), "TXN MESSAGE PUBLISHED: ", "txSendMessage");
}

var handleRollback = function() {
  txnPublishChannel.rollbackTx(function() {
    log("TXN ROLLBACK");
    updateGuiState(true, false);
  });
}

var buildLogMessageRow = function(name, value) {
  var row = $('<tr>')
  row.append('<td>' + name + ':</td>');
  var v1 = value;
  if (v1 === undefined) {
    v1 = "-";
  }
  row.append('<td>' + v1 + '</td>');
  return row;
}

var handleMessageReceived = function(event) {

  receivedMessageCount.text(++receivedMessageCounter);

  var body = null;

  if (typeof(ArrayBuffer) === "undefined") {
    body = event.getBodyAsByteBuffer().getString(Kaazing.Charset.UTF8);
  } else {
    body = arrayBufferToString(event.getBodyAsArrayBuffer())
  }
  var props = event.properties;
  var exchange = event.args.exchange;
  var routingKey = event.args.routingKey;
  var dt = event.args.deliveryTag;
  var channel = event.target;
  logMessageDiv("MESSAGE CONSUMED: ", "receiveMessage", body, props, exchange, routingKey);

  // Acknowledge the message as we passed in a false for 'noAck' in
  // AmqpChannel.consumeBasic() call. If the message is not acknowledged, 
  // the broker will keep holding the message. And, as more and more 
  // messages are held by the broker, it will eventually result in 
  // an OutOfMemoryError.
  var config = {
    deliveryTag: dt,
    multiple: true
  };
  setTimeout(function() {
    channel.ackBasic(config);
  }, 0);
}

var logMessageDiv = function(text, divClass, body, props, exchange, routingKey) {
  var messageDiv = $('<div>');
  messageDiv.addClass(divClass);
  messageDiv.text(text + body);

  var table;
  var tbody;

  // Add the message information.
  var destinationDiv = $('<div>');
  destinationDiv.addClass("destination");
  table = $('<table>');
  destinationDiv.append(table);
  tbody = $('<tbody>');
  table.append(tbody);
  tbody.append(buildLogMessageRow("Exchange", exchange));
  tbody.append(buildLogMessageRow("Routing Key", routingKey));
  messageDiv.append(destinationDiv);

  if (props != null) {

    // Add the custom headers.
    var headers = props.getHeaders();
    if (headers != null || headers.length > 0) {
      var headersDiv = $('<div>');
      headersDiv.addClass("headers");
      table = $('<table>');
      headersDiv.append(table);
      tbody = $('<tbody>');
      table.append(tbody);
      for (var i = 0; i < headers.length; i++) {
        var h = headers[i];
        tbody.append(buildLogMessageRow(h.key, h.value + " <em>(" + h.type + ")</em>"));
      }
      messageDiv.append(headersDiv);
    }

    // Add the properties.
    var propertiesDiv = $('<div>');
    propertiesDiv.addClass("properties");
    table = $('<table>');
    propertiesDiv.append(table);
    tbody = $('<tbody>');
    table.append(tbody);
    tbody.append(buildLogMessageRow("appId", props.getAppId()));
    tbody.append(buildLogMessageRow("contentEncoding", props.getContentEncoding()));
    tbody.append(buildLogMessageRow("contentType", props.getContentType()));
    tbody.append(buildLogMessageRow("correlationId", props.getCorrelationId()));
    var deliveryMode;
    if (props.getDeliveryMode() === 1) {
      deliveryMode = "1 <em>(Non-persistent)</em>";
    } else if (props.getDeliveryMode() === 2) {
      deliveryMode = "2 <em>(Persistent)</em>";
    } else {
      deliveryMode = props.getDeliveryMode();
    }
    tbody.append(buildLogMessageRow("deliveryMode", deliveryMode));
    tbody.append(buildLogMessageRow("expiration", props.getExpiration()));
    tbody.append(buildLogMessageRow("messageId", props.getMessageId()));
    tbody.append(buildLogMessageRow("priority", props.getPriority()));
    tbody.append(buildLogMessageRow("replyTo", props.getReplyTo()));
    tbody.append(buildLogMessageRow("timestamp", props.getTimestamp()));
    tbody.append(buildLogMessageRow("type", props.getType()));
    tbody.append(buildLogMessageRow("userId", props.getUserId()));
    messageDiv.append(propertiesDiv);
  }

  logDiv(messageDiv);
}

var setupSSO = function(webSocketFactory) {
  /* Respond to authentication challenges with popup login dialog */
  if (webSocketFactory) {
    var basicHandler = new Kaazing.Gateway.BasicChallengeHandler();
    basicHandler.loginHandler = function(callback) {
      popupLoginDialog(callback);
    }
    webSocketFactory.setChallengeHandler(basicHandler);
  }
}

var popupLoginDialog = function(callback) {

  //popup dialog to get credentials
  var popup = document.getElementById("logindiv");
  $("#logindiv").slideToggle(300);
  var login = document.getElementById("sso_login");
  var cancel = document.getElementById("sso_cancel");

  $('#sso_username').focus();

  // As a convenience, connect when the user presses Enter
  // in the location field.
  $('#sso_password').keypress(function(e) {
    if (e.keyCode == 13) {
      e.stopImmediatePropagation(); // Prevent firing twice.
      login.click();
    }
  });

  //"OK" button was clicked, invoke callback function with credential to login
  login.onclick = function() {
    var username = document.getElementById("sso_username");
    var password = document.getElementById("sso_password");
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
    var username = document.getElementById("sso_username");
    var password = document.getElementById("sso_password");
    //clear user input
    username.value = "";
    password.value = "";
    //hide popup
    $("#logindiv").slideToggle(100);
    callback(null);
  }
}

</script>
```

Other Coding Styles
-------------------

In the procedure above, you have used a *continuation-passing* style of JavaScript programming. Additionally, you can use an *event listener* programming style or a *callback properties* programming style. The following example shows how you can declare an exchange using the event-listener programming style:

``` js
publishChannel.addEventListener("declareexchange", function(e) {log("Exchange declared");});
```

The following example shows how you can declare an exchange using the callback properties programming style:

``` js
publishChannel.ondeclareexchange = function(e) {log("Exchange declared");};
```

Finally, for completeness, you can add a `log()` function, which you can modify based on your logging requirements:

``` js
var log = function(message) {
        // Implement this function based on your logging requirements.
};
```

You can also combine one or more of these programming styles.

Next Step
---------

[Secure Your JavaScript AMQP Client](p_dev_js_secure.md)

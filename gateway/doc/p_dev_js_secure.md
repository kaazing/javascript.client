-   [Home](../../index.md)
-   [Documentation](../index.md)
-   Secure Your JavaScript Client

Secure Your JavaScript Client
=============================

Note: To use the Gateway, a KAAZING client library, or a KAAZING demo, fork the repository from [kaazing.org](http://kaazing.org).
Before you add security to your clients, follow the steps in [Secure Network Traffic with the Gateway](../security/o_tls.md) and [Configure Authentication and Authorization](https://github.com/kaazing/gateway/blob/develop/doc/security/o_auth_configure.md) to set up security on KAAZING Gateway for your client. The authentication and authorization methods configured on the Gateway influence your client security implementation. In this procedure, we provide an example of the most common implementation.


To Secure Your JavaScript Client
--------------------------------

This procedure contains the following topics:

-   [Creating a Basic Challenge Handler](#creating-a-basic-challenge-handler)
-   [Creating a Custom Challenge Handler](#creating-a-custom-challenge-handler)
-   [Managing Log In Attempts](#managing-log-in-attempts)
-   [Registering Challenge Handlers at Locations](#registering-challenge-handlers-at-locations)
-   [Using Wildcards to Match Sub-domains and Paths](#using-wildcards-to-match-sub-domains-and-paths)
-   [Negotiating a Challenge](#negotiating-a-challenge)

Authenticating your client involves implementing a challenge handler to respond to authentication challenges from the Gateway. If your challenge handler is responsible for obtaining user credentials, then you will also need to implement a login handler.

### Creating a Basic Challenge Handler

A challenge handler is a constructor used in an application to respond to authentication challenges from the Gateway when the application attempts to access a protected resource. Each of the resources protected by the Gateway is configured with a different authentication scheme (for example, Basic, Application Basic, Application Negotiate, or Application Token), and your application requires a challenge handler for each of the schemes that it will encounter or a single challenge handler that will respond to all challenges. Also, you can add a dispatch challenge handler to route challenges to specific challenge handlers according to the URI of the requested resource.

For information about each authentication scheme type, see [Configure the HTTP Challenge Scheme](https://github.com/kaazing/gateway/blob/develop/doc/security/p_authentication_config_http_challenge_scheme.md).

Clients with a single challenge handling strategy for all 401 challenges can simply set a specific challenge handler as the default using `webSocketFactory.setChallengeHandler()`. The following is an example of how to implement a single challenge handler for all challenges:

``` js
function setupSSO(factory) {
  /* Respond to authentication challenges with popup login dialog */
  var basicHandler = new Kaazing.Gateway.BasicChallengeHandler();

    basicHandler.loginHandler = function(callback) { 
        // Create static credentials for test
        var credentials = new Kaazing.Gateway.PasswordAuthentication("joe", "welcome");
        callback(credentials); 
    }

    factory.setChallengeHandler(basicHandler);
}
```

The preceding example uses static credentials, but you will want to create a login handler to obtain individual user credentials. Here is an example using a popup login dialog to respond to login challenges and obtain user credentials:

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
```

This example is taken from the out of the box JavaScript WebSocket Demo at kaazing.org. For more information on challenge handlers and how to configure location-specific challenge handling strategies, see the [JavaScript Client API](../apidoc/client/javascript/gateway/index.md).

To have the out of the box JavaScript WebSocket demo prompt you for authentication, open the Gateway configuration file (`GATEWAY_HOME/conf/gateway-config.xml`), remove the HTML comments surrounding the `<authorization-constraint>` child of the `<echo>` service, restart the Gateway, and then try the demo. You will be prompted for user credentials.

This `BasicChallengeHandler` can be instantiated using a new `BasicChallengeHandler()`. After instantiating `BasicChallengeHandler`, the `loginHandler` function can be implemented to handle the authentication challenge. By default, `loginHandler` will send an empty `PasswordAuthentication`.

``` js
        var basicHandler = new Kaazing.Gateway.BasicChallengeHandler(); 
        basicHandler.loginHandler = function(callback) {
            callback(new Kaazing.Gateway.PasswordAuthentication("global", "credentials"));
        };
        webSocketFactory.setChallengeHandler(basicHandler);
        
```

### Creating a Custom Challenge Handler

The `ChallengeHandler` object contains two methods, `canHandle()` and `handle()`. You create a custom challenge handler by using these methods to determine whether a challenge handler can handle the authentication scheme in the 401 response, and then passing the request to the `challengeRequest` object.

``` js
var myChallengeHander = function() {

  this.canHandle = function(challengeRequest) {
    // Return true if challengeRequest.authenticationScheme matches your scheme.
    return challengeRequest != null && "token" == challengeRequest.authenticationScheme.trim().toLowerCase();
  }
  this.handle = function(challengeRequest, callback) {
    var challengeResponse = null;
    if (challengeRequest.location != null) {
      var token = getToken();
      if (token != null) {
        // Set the token to challengeResponse
        challengeResponse = new Kaazing.Gateway.ChallengeResponse("Token "+token, null);
      }
    }
    // Invoke callback function with challenge response
    callback(challengeResponse);
  }
}
```

The first time the user visits the web page containing your challenge handler, the user will not have the token. Your application can obtain the token using whatever method best suits your users and authentication process. For example, you could prompt the user for credentials or use a third-party token provider. Once the token is obtained, the token can be used for all subsequent visits to the page.

Once this function has determined that it can handle the challenge, it calls `ChallengeRequest` and a callback to handle the challenge. The `ChallengeRequest` is an immutable object representing the challenge presented by the server that contains a constructor from the protected URI location triggering the challenge, and an entire server-provided 'WWW-Authenticate:' string.

Once you have created a custom challenge handler, you can set it as the default challenge handler to be used for all HTTP requests.

``` js
webSocketFactory.setChallengeHandler = function(challengeHandler) {
  if (challengeHandler == null) {
    throw new Error("challengeHandler not defined");
  }
  webSocketFactory.setChallengeHandler(new myChallengeHander());
}
```

### Managing Log In Attempts

When it is not possible for the KAAZING Gateway client to create a challenge response, the client must return `null` to the Gateway to stop the Gateway from continuing to issue authentication challenges.

The following example is modified code taken from the JavaScript demo (`GATEWAY_HOME/demo/javascript/`) and demonstrates how to stop the Gateway from issuing further challenges.

``` js
var maxRetries = 2;
var retry = 0;
function setupSSO(factory) {
  /* Respond to authentication challenges with popup login dialog */
  var basicHandler = new Kaazing.Gateway.BasicChallengeHandler();
  basicHandler.loginHandler = function(callback) {
    if (retry++ >= maxRetries) {
      callback(null);       // abort authentication process if reaches max retries
    }
    else {
      popupLoginDialog(callback);
    }
  }
  factory.setChallengeHandler(basicHandler);
}
...
```

### Registering Challenge Handlers at Locations

Client applications with location-specific challenge handling strategies can register a `DispatchChallengeHandler` object, on which location-specific `ChallengeHandler` objects are then registered. The result is that whenever a request matching one of the specific locations encounters a 401 challenge from the server, the corresponding `ChallengeHandler` object is invoked to handle the challenge. For example:

``` js
var basicHandler1 = new Kaazing.Gateway.BasicChallengeHandler();
basicHandler1.loginHandler = function(callback) {
    popupLoginDialog(callback);
};

var basicHandler2 = new Kaazing.Gateway.BasicChallengeHandler();
basicHandler2.loginHandler = function(callback) {
    callback(new Kaazing.Gateway.PasswordAuthentication("username", "password"))
};

var dispatchHandler = new Kaazing.Gateway.DispatchChallengeHandler();
dispatchHandler.register("ws://myserver.example.com", basicHandler1);
dispatchHandler.register("ws://anotherserver.example.com", basicHandler2);

webSocketFactory.setChallengeHandler(dispatchHandler);

// Enable the ChallengeHandler by using this webSocketFactory to create a new WebSocket object
var websocket = webSocketFactory.createWebSocket("ws://myserver.example.com");
```

### Using Wildcards to Match Sub-domains and Paths

You can use wildcards (“\*”) when registering locations using `DispatchChallengeHandler`. Some examples of `locationDescription` values with wildcards are:

-   `*/` matches all requests to any host on port 80 (default port), with no user information or path specified.
-   `*.hostname.com:8000` matches all requests to port 8000 on any sub-domain of hostname.com, but not hostname.com itself.
-   `server.hostname.com:*/*` matches all requests to a particular server on any port on any path but not the empty path.

### Negotiating a Challenge

A Negotiate challenge handler handles initial empty "Negotiate" challenges from the Gateway. It uses other candidate challenge handlers to assemble an initial context token to send to the Gateway, and is responsible for creating a challenge response that can delegate to the appropriate candidate.

In addition, you can register more specific `NegotiableChallengeHandler` objects with this initial `NegotiateChallengeHandler` to handle initial Negotiate challenges and subsequent challenges associated with specific Negotiation [mechanism types](http://tools.ietf.org/html/rfc4178#section-4.1) and object identifiers.

Use `DispatchChallengeHandler` to register a `NegotiateChallengeHandler` at a specific location. The `NegotiateChallengeHandler` has a `NegotiableChallengeHandler` instance registered as one of the potential negotiable alternative challenge handlers.

``` js
var negotiableHandler = new Kaazing.Gateway.NegotiableChallengeHandler();
var negotiableHandler.loginHandler  = function(callback) {...};
var negotiateHandler = new Kaazing.Gateway.NegotiateChallengeHandler();
negotiateHandler.register(negotiableHandler);

webSocketFactory.setChallengeHandler(negotiateHandler);
```

Next Step
---------

You have completed the JavaScript client examples.

See Also
--------

[JavaScript Client API](../apidoc/client/javascript/gateway/index.md)



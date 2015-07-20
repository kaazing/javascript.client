Display Logs for the JavaScript Client
=================================================================

**Note:** To use the Gateway, a KAAZING client library, or a KAAZING demo, fork the repository from [kaazing.org](http://kaazing.org).

You can display logs for the Javascript client by pointing to the relevant `*-debug.js` file located at [kaazing.org](http://kaazing.org):

-   `PostMessage-debug.js`
-   `ServerSentEvents-debug.js`
-   `WebSocket-debug.js`
-   `XMLHttpRequest-debug.js`

Before You Begin
----------------

This procedure is part of [Build JavaScript WebSocket Clients](o_dev_js.md):

1.  [Use the JavaScript WebSocket API](p_dev_js_websocket.md)
2.  [Use the JavaScript EventSource API](p_dev_js_eventsource.md)
3.  [Migrate JavaScript Applications to KAAZING Gateway 5.0](p_dev_js_migrate.md)
4.  [Secure Your JavaScript Client](p_dev_js_secure.md)
5.  **Display Logs for the JavaScript Client**

To Enable the JavaScript Client Logs
------------------------------------

1.  Build your Kaazing JavaScript client, as described in [Build JavaScript WebSocket Clients](o_dev_js.md).
2.  Edit the client HTML page containing the JavaScript to use the appropriate `*-debug.js` file. For example, if you are using WebSocket, change:

    `<script src="WebSocket.js"></script>`

    to

    `<script src="WebSocket-debug.js"></script>`

3.  Configure the logging level by adding a META tag called `kaazing:logging`, which specifies the package regular expressions and the log level for them. For example:

    `<meta name="kaazing:logging" content="org.kaazing.gateway.*=ALL" />`

4.  Navigate to your browser's console (such as Firebug for Firefox, or Developer Tools for Google Chrome, Safari, or Microsoft Internet Explorer 8 or greater).


    **Mozilla Firefox**
    
    1. Download and install [Firebug](http://getfirebug.com/downloads).
    2. Restart Firefox.
    3. See [How do I open Firebug?](https://getfirebug.com/faq/#How_do_I_open_Firebug) from Mozilla for information on starting Firebug on your OS.

    **Google Chrome**
    
    See [Opening DevTools](https://developers.google.com/chrome-developer-tools/docs/shortcuts#opening-devtools) from Google for information on opening the Console.
    
    **Safari 5**
    
    See [Using the Error Console](http://developer.apple.com/library/safari/#documentation/AppleApplications/Conceptual/Safari_Developer_Guide/DebuggingYourWebsite/DebuggingYourWebsite.html) from Apple for more information.
    
    **Internet Explorer 8 or greater**
    
    Press **F12** or choose **Tools \> Developer Tools**. For more information, see [How to use F12 Developer Tools to Debug your Webpages](http://msdn.microsoft.com/en-us/library/gg589507(v=vs.85).aspx) from Microsoft.


5.  Visit the page running the client code. You should now see log messages in the console.

See Also
--------

To learn how to build clients using the Kaazing client libraries, see the Kaazing client developer documentation in the **For Developer's** section of the [documentation](https://github.com/kaazing/gateway/blob/develop/doc/index.md) page.



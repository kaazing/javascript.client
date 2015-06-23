# gateway

# About this Project

The gateway (WebSocket) project implements the [WebSocket standard](https://tools.ietf.org/html/rfc6455) in JavaScript. It provides a WebSocket client API that enables developers to build JavaScript applications that communicate to a back-end service over WebSocket via an RFC-6455 endpoint, such as KAAZING Gateway.

# Building Projects

## Minimum Requirements for Building the Projects in This Repo
Before building kaazing-client-javascript, please install and configure the following dependencies:

* [Git](http://git-scm.com/): The [Github Guide to Installing Git](https://help.github.com/articles/set-up-git) is a good source of information.
* [Node.js](http://nodejs.org/): Node is used to install necessary dependancies. Depending on your system, you can install Node either from source or as a pre-packaged bundle.
* [Bower](http://bower.io/): Bower is used to manage project dependancies. Install the bower command-line tool globally with:  ```npm install -g bower```
* [Grunt](http://gruntjs.com/): Grunt is used to build kaazing-client-javascript, generate the documentation and run tests. Install the grunt command-line tool globally with: ```npm install -g grunt-cli```

**Note**: These may need elevated privileges requiring the use of either sudo (for OSX, *nix, BSD etc) or running the command shell as an Administrator (for Windows) to install Grunt & Bower globally.

## Steps for building this project

0. Clone the repo: ```git clone https://github.com/kaazing/javascript.client.git```
0. Go to the cloned directory: ```cd javascript.client```
0. Command to install all the dependencies:```npm install```
0. Command to run the configured tasks: ```grunt```

**Note**: These may need elevated privileges requiring the use of either sudo (for OSX, *nix, BSD etc) or running the command shell as an Administrator (for Windows) to install Grunt & Bower globally.

# Using KAAZING Gateway or any RFC-6455 Endpoint

You can use an RFC-6455 endpoint, such as KAAZING Gateway, to connect to a back-end service. To learn how to administer the Gateway, its configuration files, and security, see the documentation on [developer.kaazing.com](http://developer.kaazing.com/documentation/5.0/index.html).

# Learning How to Develop Client Applications

To learn how to develop client applications with this project, see the documentation on [developer.kaazing.com](http://developer.kaazing.com/documentation/5.0/index.html).

# View a Running Demo

To view demos of clients built with this project, see [kaazing.org](http://kaazing.org/)

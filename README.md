# javascript.client

# About This Project

The javascript.client project implements the [WebSocket standard](https://tools.ietf.org/html/rfc6455) in JavaScript. It provides a WebSocket client API and an AMQP client API that enables developers to build JavaScript applications that communicate with an RFC 6455 endpoint or an AMQP message broker over WebSocket.

# Building This Project

## Installing Dependencies
Before building kaazing-client-javascript, please install and configure the following dependencies:

* [Git](http://git-scm.com/): The [Github Guide to Installing Git](https://help.github.com/articles/set-up-git) is a good source of information.
* [Node.js](http://nodejs.org/): Node is used to install necessary dependancies. Depending on your system, you can install Node either from source or as a pre-packaged bundle.
* [Bower](http://bower.io/): Bower is used to manage project dependancies. Install the bower command-line tool globally with:  ```npm install -g bower```
* [Grunt](http://gruntjs.com/): Grunt is used to build kaazing-client-javascript, generate the documentation and run tests. Install the grunt command-line tool globally with: ```npm install -g grunt-cli```

**Note**: These might need elevated privileges requiring the use of either sudo (for OSX, *nix, BSD etc) or running the command shell as an Administrator (for Windows) to install Grunt & Bower globally.

## Steps for Building This Project

* Clone the repo: ```git clone https://github.com/kaazing/javascript.client.git```
* Go to the cloned directory: ```cd javascript.client```
* Command to install all the dependencies:```npm install```
* Command to run the configured tasks: ```grunt```

**Note**: These may need elevated privileges requiring the use of either sudo (for OSX, *nix, BSD etc) or running the command shell as an Administrator (for Windows) to install Grunt & Bower globally.

# Running a Prebuilt Project

You can also download and run this project from [kaazing.org/download](http://kaazing.org/download/)

# Using KAAZING Gateway or any RFC-6455 Endpoint

You can use an RFC-6455 endpoint, such KAAZING Gateway, to connect to a back-end service. To learn how to administer the Gateway, its configuration files, and security, see the documentation on [developer.kaazing.com](http://developer.kaazing.com/documentation/5.0/index.html).

# Learning How to Develop Client Applications

To learn how to develop client applications using the Gateway, see the documentation on [developer.kaazing.com](http://developer.kaazing.com/documentation/5.0/index.html).

# View a Running Demo

To view demo client applications running against the Gateway, visit [kaazing.org/demos](http://kaazing.org/demos/).

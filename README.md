# javascript.client

# About this Project

The javascript.client project implements the [WebSocket standard](https://tools.ietf.org/html/rfc6455) in JavaScript. It provides a WebSocket client API and an AMQP client API that enables developers to build JavaScript applications that communicate with an RFC 6455 endpoint or an AMQP message broker over WebSocket.

# Building this Project

##Installing Dependencies
Before building kaazing-client-javascript, please install and configure the following dependencies:

* [Git](http://git-scm.com/): The [Github Guide to Installing Git](https://help.github.com/articles/set-up-git) is a good source of information.
* [Node.js](http://nodejs.org/): Node is used to install necessary dependancies. Depending on your system, you can install Node either from source or as a pre-packaged bundle.
* [Bower](http://bower.io/): Bower is used to manage project dependancies. Install the bower command-line tool globally with:  ```npm install -g bower```
* [Grunt](http://gruntjs.com/): Grunt is used to build kaazing-client-javascript, generate the documentation and run tests. Install the grunt command-line tool globally with: ```npm install -g grunt-cli```

**Note**: These may need elevated privileges requiring the use of either sudo (for OSX, *nix, BSD etc) or running the command shell as an Administrator (for Windows) to install Grunt & Bower globally.

## Steps for building this project
0. (how do you build it)

* Clone the repo: ```git clone https://github.com/kaazing/javascript.client.git```
* Go to the cloned directory: ```cd javascript.client```
* Command to install all the dependencies:```npm install```
* Command to run the configured tasks: ```grunt```

**Note**: These may need elevated privileges requiring the use of either sudo (for OSX, *nix, BSD etc) or running the command shell as an Administrator (for Windows) to install Grunt & Bower globally.

# Running a Prebuilt Project

You can also download and run this project from [kaazing.org/download](http://kaazing.org/download/)

# Learning How to Develop Client Applications

To learn how to develop client applications using the Gateway, see the documentation on [kaazing.org](http://kaazing.org).  To contribute to the documentation source, see the doc directory under each protocol's folder.

# Learning How to Use an RFC 6455 endpoint

You can use an RFC 6455 endpoint, such as KAAZING's Gateway. To learn more about using the KAAZING's Gateway, see the documentation on [kaazing.org](http://kaazing.org).

# View a Running Demo

To view demo client applications running against the Gateway, visit [kaazing.org/demos](http://kaazing.org/demos/).

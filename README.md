#kaazing-amqp-0-9-1-client-javascript

This repository contains the source code for the ```Amqp-0-9-1.js``` library for running AMQP 0-9-1 Javascript clients over WebSocket. Using the library, you will be able to send and receive AMQP messages from within a browser and communicate with an AMQP 0-9-1 compliant message broker such as Apache Qpid or Pivotal RabbitMQ by way of the Kaazing Gateway AMQP Proxy service.

You can find pre-built versions of all the amqp-0-9-1.js build artifacts (the client library, demo page and jsdoc files) in the github [bower-kaazing-amqp-0-9-1-client-javascript](https://github.com/kaazing-bower-kaazing-amqp-0-9-1-client-javascript) repository.

##Installing Dependencies
Being a Github-based Javascript project, kaazing-amqp-0-9-1-client-javascript follows the common javascript-project build paradigm, using [git](http://git-scm.com/), node.js ([npm](http://nodejs.org/)), [bower](http://bower.io/) and [grunt](http://gruntjs.com/) to generate the amqp-0-9-1.js distribution file and documentation and run tests. 

You can get started by installing git (see the [Github Guide to Installing Git](https://help.github.com/articles/set-up-git) for a good source of details) and nodejs (depending on your system, you can install Node either from source or as a pre-packaged bundle.) Please see the relevant documentation on those sites for more details.

**Note**: These may need elevated privileges requiring the use of either sudo (for OSX, *nix, BSD etc) or running the command shell as an Administrator (for Windows) to install Grunt & Bower globally.

##Directory structure
* base-directory files: package.json, bower.json, Gruntfile.js, README.md, LICENSE.txt
* src: Source files
* demo: Demo files
* test: Test files and karma configuration to run tests. Test can be run by using ```grunt karma``` commnd.
* dist: This directory of distribution artifacts will be generated as needed. It contains:
    * javascript: The complete demo package, including the generated Amqp-0-9-1.js library, the amqp.html demo file, and resources and images directories.
    * jsdoc: API documentation generated from the Amqp-0-9-1.js file.

##Building the project
Once you've installed git and node (npm) globally, you can download the project and build the distribution artifacts:

* Clone the repository: ```git clone https://github.com/kaazing/amqp-0-9-1-client-javascript.git```
* Go to the cloned directory: ```cd amqp-0-9-1-client-javascript```
* Install the build dependencies:```npm install ```
* Install project dependencies:```bower install```
* Run the build tasks: ```grunt```

**Note**: These may need elevated privileges requiring the use of either sudo (for OSX, *nix, BSD etc) or running the command shell as an Administrator (for Windows) to install Grunt & Bower globally.

##Notes
* The Amqp-0-9-1.js library will not work with the WebSocket implementation available in Android's stock(default) browser. To make it work with the Android stock(default) browser, please use Amqp-0-9-1.js with Kaazing's WebSocket.js.
* Files in the "dist" subdirectory are regenerated each time you build the project with grunt. You'll find source code in the "src" subdirectory!

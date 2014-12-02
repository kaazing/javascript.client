#kaazing-amqp-0-9-1-client-javascript

kaazing-amqp-0-9-1-client-javascript delivers ```Amqp-0-9-1.js``` Javascript library for running AMQP 0-9-1 over WebSocket. Using the Javascript library, developers will be able to send and receive AMQP messages from within a browser and communicate with an AMQP 0-9-1 compliant message broker such as Apache QPid or Pivotal RabbitMQ by way of the Kaazing Gateway AMQP Proxy service.

##Installing Dependencies
Before building Amqp-0-9-1.js, please install and configure the following dependencies:

* [Git](http://git-scm.com/): The [Github Guide to Installing Git](https://help.github.com/articles/set-up-git) is a good source of information.
* [Node.js](http://nodejs.org/): Node(npm) is used to install necessary dependancies. Depending on your system, you can install Node either from source or as a pre-packaged bundle.
* [Bower](http://bower.io/): Bower is used to manage project dependancies. Install the bower command-line tool globally with:  ```npm install -g bower```
* [Grunt](http://gruntjs.com/): Grunt is used to build Amqp-0-9-1.js, generate the documentation and run tests. Install the grunt command-line tool globally with: ```npm install -g grunt-cli```

**Note**: These may need elevated privileges requiring the use of either sudo (for OSX, *nix, BSD etc) or running the command shell as an Administrator (for Windows) to install Grunt & Bower globally.

##Directory structure
* files: package.json, GruntFile.js, bower.json, README.md, LICENSE
* src: Source files
* demo: Demo files
* docs: Supporting documents
* test: Test files and karma config to run tests. Test can be run by using ```grunt karma``` commnd.
* dist: Distribution directory will be generated which has javascript and jsdoc directories.
    * javascript: Has the complete demo package, which includes generated Amqp-0-9-1.js library, amqp.html demo file, resources directory which has css and image files.
    * jsdoc: API doc generated from source files

##Steps to build Amqp-0-9-1.js project
Assumption: node, npm, grunt and bower Command Line Interface(CLI) should be installed. Following steps will build the project and generate files in the dist directory.

* Clone the repo: ```git clone https://github.com/kaazing/amqp-0-9-1.client.javascript```
* Go to the cloned directory: ```cd amqp-0-9-1.client.javascript```
* Command to install all the dependencies:```npm install ```
* Command to install project dependencies:```bower install```
* Command to run configured tasks: ```grunt```

**Note**: These may need elevated privileges requiring the use of either sudo (for OSX, *nix, BSD etc) or running the command shell as an Administrator (for Windows) to install Grunt & Bower globally.

##Notes
* Amqp-0-9-1.js library will not work with the WebSocket implementation available in Android stock(default) browser. To make it work with Android stock(default) browser, please use Amqp-0-9-1.js with Kaazing's WebSocket.js.
* Please don't edit files in the "dist" subdirectory as they are generated via Grunt. You'll find source code in the "src" subdirectory!
* During release the contents of this repo are released to https://github.com/kaazing/bower-kaazing-amqp-0-9-1-client-javascript repository.

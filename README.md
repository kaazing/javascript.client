#gateway.client.javascript is a library containing files necessary to develop a Javascript-based client for a Kaazing WebSocket Gateway.

##Installing Dependencies
Before building gateway.client.javascript, please install and configure the following dependencies:

* [Git](http://git-scm.com/): The [Github Guide to Installing Git](https://help.github.com/articles/set-up-git) is a good source of information.
* [Node.js](http://nodejs.org/): Node is used to install necessary dependancies. Depending on your system, you can install Node either from source or as a pre-packaged bundle.
* [Bower](http://bower.io/): Bower is used to manage project dependancies. Install the bower command-line tool globally with:  ```npm install -g bower```
* [Grunt](http://gruntjs.com/): Grunt is used to build gateway.client.javascript, generate the documentation and run tests. Install the grunt command-line tool globally with: ```npm install -g grunt-cli```

**Note**: These may need elevated privileges requiring the use of either sudo (for OSX, *nix, BSD etc) or running the command shell as an Administrator (for Windows) to install Grunt & Bower globally.


##Steps to build the gateway.client.javascript project
Assumptions: node, npm, grunt and bower Command Line Interface(CLI) are already installed. The following steps will build the project and generate files in the ''dist'' directory.

* Clone the repo: ```git clone https://github.com/kaazing/gateway.client.javascript.git```
* Go to the cloned directory: ```cd gateway.client.javascript```
* Command to install all the dependencies:```npm install```
* Command to install project dependencies:```bower install```
* Command to run the configured tasks: ```grunt```

**Note**: These may need elevated privileges requiring the use of either sudo (for OSX, *nix, BSD etc) or running the command shell as an Administrator (for Windows) to install Grunt & Bower globally.


##Directory structure
* files: package.json, GruntFile.js, bower.json, README.md, LICENSE
* src: Source files
* demo: Demo files
* docs: Supporting documents
* test: Test files and karma config to run tests. Test can be run by using ```grunt karma``` commnd.
* dist: A distribution directory will be generated which has generated-demo and jsdoc directories.
    * generated-demo: Has the complete demo package, which includes generated amqp-0-9-1.js library and demo files.
    * jsdoc: JSDOC generated from 

##Notes

#kaazing-client-javascript-demo 

kaazing-client-javascript-demo is a demo for [Kaazing WebSocket Javascript  library](https://github.com/kaazing/kaazing-client-javascript).

##Installing Dependencies
Before building kaazing-client-javascript-demo, please install and configure the following dependencies:

* [Git](http://git-scm.com/): The [Github Guide to Installing Git](https://help.github.com/articles/set-up-git) is a good source of information.
* [Node.js](http://nodejs.org/): Node is used to install necessary dependancies. Depending on your system, you can install Node either from source or as a pre-packaged bundle.
* [Bower](http://bower.io/): Bower is used to manage project dependancies. Install the bower command-line tool globally with:  ```npm install -g bower```
* [Grunt](http://gruntjs.com/): Grunt is used to build kaazing-client-javascript, generate the documentation and run tests. Install the grunt command-line tool globally with: ```npm install -g grunt-cli```

**Note**: These may need elevated privileges requiring the use of either sudo (for OSX, *nix, BSD etc) or running the command shell as an Administrator (for Windows) to install Grunt & Bower globally.


##Steps to build the kaazing-client-javascript-demo project
Assumptions: node, npm, grunt and bower Command Line Interface(CLI) are already installed. The following steps will build the project and generate files in the ''dist/javascript'' directory.

* Clone the repo: ```git clone https://github.com/kaazing/kaazing-client-javascript-demo.git```
* Go to the cloned directory: ```cd kaazing-client-javascript-demo```
* Command to install all the dependencies:```npm install```
* Command to install project dependencies:```bower install```
* Command to run the configured tasks: ```grunt```

**Note**: These may need elevated privileges requiring the use of either sudo (for OSX, *nix, BSD etc) or running the command shell as an Administrator (for Windows) to install Grunt & Bower globally.


##Directory structure
* top-level files: package.json, GruntFile.js, bower.json, README.md, LICENSE.txt
* src: Source files
* dist: A distribution directory will be generated which has javascript directory. During release
  the contents of this directory are released to https://github.com/kaazing/bower-kaazing-client-javascript-demo.

##Notes
* During release the contents of this repo are released to https://github.com/kaazing/bower-kaazing-client-javascript-demo repository.

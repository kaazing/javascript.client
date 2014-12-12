#kaazing-client-javascript-bridge#

###A library containing bridge file that can be served from Kaazing Gateway to Kaazing JavaScript clients on demand

##Installing Dependencies
Before building kaazing-client-javascript-bridge, please install and configure the following dependencies:

* [Git](http://git-scm.com/): The [Github Guide to Installing Git](https://help.github.com/articles/set-up-git) is a good source of information.
* [Node.js](http://nodejs.org/): Node is used to install necessary dependancies. Depending on your system, you can install Node either from source or as a pre-packaged bundle.
* [Bower](http://bower.io/): Bower is used to manage project dependancies. Install the bower command-line tool globally with:  ```npm install -g bower```
* [Grunt](http://gruntjs.com/): Grunt is used to build kaazing-client-javascript-bridge, generate the documentation and run tests. Install the grunt command-line tool globally with: ```npm install -g grunt-cli```

**Note**: These may need elevated privileges requiring the use of either sudo (for OSX, *nix, BSD etc) or running the command shell as an Administrator (for Windows) to install Grunt & Bower globally.


##Steps to build the kaazing-client-javascript-bridge project
Assumptions: node, npm, grunt and bower Command Line Interface(CLI) are already installed. The following steps will build the project and generate files in the ''dist'' directory.

* Clone the repo: ```git clone https://github.com/kaazing/kaazing-client-javascript-bridge.git```
* Go to the cloned directory: ```cd kaazing-client-javascript-bridge```
* Command to install all the dependencies:```npm install```
* Command to install project dependencies:```bower install```
* Command to run the configured tasks: ```grunt```

**Note**: These may need elevated privileges requiring the use of either sudo (for OSX, *nix, BSD etc) or running the command shell as an Administrator (for Windows) to install Grunt & Bower globally.


##Directory structure
* files: package.json, GruntFile.js, bower.json, README.md, LICENSE
* src: Source files
* dist: A distribution directory will be generated and contains js and jsdoc directories.
    * js: The generated Javascript artifacts.
    * jsdoc: JSDOC generated from the generated artifacts.
  On release, the contents of dist/ will be copied to the repo bower-kaazing-client-javascript-bridge.

##Notes

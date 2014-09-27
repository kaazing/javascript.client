#gateway.client.javascript.utils

##Installing Dependencies
Before you can build gateway.client.javascript.utils, you must install and configure the following dependencies on your machine:

* [Git](http://git-scm.com/): The [Github Guide to Installing Git](https://help.github.com/articles/set-up-git) is a good source of information.
* [Node.js](http://nodejs.org/): Node(npm) is used to install necessary dependancies. Depending on your system, you can install Node either from source or as a pre-packaged bundle.
* [Bower](http://bower.io/): Bower is used to manage project dependancies. Install the bower command-line tool globally with:  ```npm install -g bower```
* [Grunt](http://gruntjs.com/): Grunt is used to build gateway.client.javascript.utils.js, generate the documentation and run tests. Install the grunt command-line tool globally with: ```npm install -g grunt-cli```

**Note**: These may need elevated privileges requiring the use of either sudo (for OSX, *nix, BSD etc) or running the command shell as an Administrator (for Windows) to install Grunt & Bower globally.

##Directory structure
* files: package.json, GruntFile.js, bower.json, README.md, LICENSE
* src: Source files
* dist: Distribution directory will be generated which has generated gateway.client.javascript.utils.js.

##Steps to build gateway.client.javascript.utils project
Assumption: node, npm, grunt and bower Command Line Interface(CLI) should be installed. Following steps will build the project and generate files in the dist directory.

* Clone the repo: ```git clone https://github.com/kaazing/gateway.client.javascript.utils```
* Go to the cloned directory: ```cd gateway.client.javascript.utils```
* Command to install all the dependencies:``` npm install ```
* Command to run configured tasks: ```grunt```


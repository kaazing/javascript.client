#kaazing-client-javascript-util

##Installing Dependencies
Before you can build kaazing-client-javascript-util, you must install and configure the following dependencies on your machine:

* [Git](http://git-scm.com/): The [Github Guide to Installing Git](https://help.github.com/articles/set-up-git) is a good source of information.
* [Node.js](http://nodejs.org/): Node(npm) is used to install necessary dependencies. Depending on your system, you can install Node either from source or as a pre-packaged bundle.
* [Bower](http://bower.io/): Bower is used to manage project dependancies. Install the bower command-line tool globally with:  ```npm install -g bower```
* [Grunt](http://gruntjs.com/): Grunt is used to build the project. In this case there are only source files, which are copied to the dist/ directory. Install the grunt command-line tool globally with: ```npm install -g grunt-cli```

**Note**: These may need elevated privileges requiring the use of either sudo (for OSX, *nix, BSD etc) or running the command shell as an Administrator (for Windows) to install Grunt & Bower globally.

##Directory structure
* files: package.json, GruntFile.js, bower.json, README.md, LICENSE
* src: Source files
* dist: Distribution directory will be generated which has build artifacts. These will be copied to the bower-kaazing-client-javascript-util repo.

##Steps to build kaazing-client-javascript-util project
Assumption: node, npm, grunt and bower Command Line Interface(CLI) should be installed. Following steps will build the project and generate files in the dist directory.

* Clone the repo: ```git clone https://github.com/kaazing/kaazing-client-javascript-util.git```
* Go to the cloned directory: ```cd kaazing-client-javascript-util```
* Command to install all the build dependencies:``` npm install ```
* Command to install all the package dependencies:``` bower install ```
* Command to run configured tasks: ```grunt```


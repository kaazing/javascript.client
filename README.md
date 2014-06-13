#kaaz-utils.js is a Kaazing javaScript utils library.

##Installing Dependencies
Before you can build amqp-0-9-1.js, you must install and configure the following dependencies on your machine:

* [Git](http://git-scm.com/): The [Github Guide to Installing Git](https://help.github.com/articles/set-up-git) is a good source of information.
* [Node.js](http://nodejs.org/): We use Node to generate the documentation, run a development web server, run tests, and generate distributable files. Depending on your system, you can install Node either from source or as a pre-packaged bundle.
* [Grunt](http://gruntjs.com/): We use Grunt as our build system. Install the grunt command-line tool globally with: ```npm install -g grunt-cli```
* [Bower](http://bower.io/): We use Bower to manage client-side packages for the docs. Install the bower command-line tool globally with:  ``` npm install -g bower```

**Note**: You may need to use sudo (for OSX, *nix, BSD etc) or run your command shell as Administrator (for Windows) to install Grunt & Bower globally.


##Steps to build amqp-0-9-1.js project
Assumption: node, npm, grunt and bower Command Line Interface(CLI) should be installed. Following steps will build the project and generate files in the dist directory.

* Clone the repo: ```git clone https://github.com/kaazing/kaaz-utils.js```
* Go to the cloned directory: ```cd kaaz-utils.js```
* Command to install all the dependencies:``` npm install ```
* Command to run configured tasks: ```grunt```


##High level overview of directory structure
* files: package.json, GruntFile.js, bower.json, README.md, LICENSE
* src: Source files
* dist: Distribution directory will be generated which has generated kaaz-utils.js.

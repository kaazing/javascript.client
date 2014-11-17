# grunt-stripbanner

> Plugin to strip banner comments that match a particular form from all Javascript files in a directory tree.

## Getting Started
This plugin requires Grunt.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check 
out the [Getting Started](http://gruntjs.com/getting-started) guide, as 
it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) 
as well as install and use Grunt plugins. Once you're familiar with that 
process, you may install this plugin with this command:

```shell
npm install grunt-stripbanner --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-stripbanner');
```

## The "stripbanner" task

### Overview
In your project's Gruntfile, add a section named `stripbanner` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  stripbanner: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

### Options

#### options.cwd
Type: `String`
Default value: `'.'`

A string value that is used as the root directory under which Javascript files will be processed

#### options.content
Type: `String`
Default value: `'Copyright (c)'`

A string value that is used as the content to look for in C-style (/* */) comments. Any comment 
that contains the content string will be stripped from the source file.

### Usage options
stripbanner: {
    tmpFiles: {
        options: {
            cwd: 'dist/tmp'
        }
    }
}

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2014 Kaazing Corporation. Licensed under the Apache 2.0 license.

/**
 * Copyright (c) 2007-2014 Kaazing Corporation. All rights reserved.
 * 
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

'use strict';

module.exports = function (grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask(
      'stripbanner', 
      'Plugin to strip "banner" comments that match a particular form from all files in a directory tree', 
      function () {
          var options = this.options({
              content: 'Copyright (c)',
              cwd: '.'
          });

          var START = '/*';
          var END = '*/';

          var rootDir = options.cwd;
          grunt.log.writeln("Starting from directory '" + rootDir + "'");

          if (!grunt.file.isDir(rootDir)) {
              grunt.log.error("'cwd' path '" + rootDir + "' is not a directory.");
              return;
          }

          var fileArray = grunt.file.expand({cwd: rootDir}, '**/*.js');
          var numFiles = fileArray.length;

          for (var i = 0; i < numFiles; i++) {
              var fpath = rootDir + "/" + fileArray[i];

              var data = grunt.file.read(fpath);
              
              // Iterate through the file, removing any comment that contains
              // the comment start/end and content string.
              var startPos = 0;

              while (startPos < data.length) {
                  startPos = data.indexOf(START, startPos);
                  if (startPos < 0) {
                      break;
                  }
                  var endPos = data.indexOf(END, startPos + START.length);
                  if (endPos < 0) {
                      grunt.log.error("Source file '" + 
                                      fpath + 
                                      "' starts a comment, but does not finish it");
                      return;
                  }

                  if (data.substring(startPos, endPos).indexOf(options.content) >= 0) {
                      var tmp = (startPos > 0 ? data.substring(0, startPos) : "");
                      data = tmp + data.substring(endPos + END.length); 
                      startPos = 0;
                  } else {
                      startPos = endPos + END.length;
                  }
              }

              // Write the destination file.
              grunt.file.write(fpath, data);
          }
      });
};

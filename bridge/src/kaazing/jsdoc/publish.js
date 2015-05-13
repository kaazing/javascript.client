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


require("app/JsHilite.js");

function basename(filename) {
        filename.match(/([^\/\\]+)\.[^\/\\]+$/);
        return RegExp.$1;
}

function publish(fileGroup, context) {
        var classTemplate = new JsPlate(context.t+"class.tmpl");
        var indexTemplate = new JsPlate(context.t+"index.tmpl");
        
        var allFiles = {};
        var allClasses = {};
        var globals = {methods:[], properties:[], alias:"GLOBALS", isStatic:true};
        
        for (var i = 0; i < fileGroup.files.length; i++) {
                var file_basename = basename(fileGroup.files[i].filename);
                
                for (var s = 0; s < fileGroup.files[i].symbols.length; s++) {
                        if (fileGroup.files[i].symbols[s].isa == "CONSTRUCTOR") {
                                var thisClass = fileGroup.files[i].symbols[s];
                                // sort inherited methods by class
                                var inheritedMethods = fileGroup.files[i].symbols[s].getInheritedMethods();
                                if (inheritedMethods.length > 0) {
                                        thisClass.inherited = {};
                                        for (var n = 0; n < inheritedMethods.length; n++) {
                                                if (! thisClass.inherited[inheritedMethods[n].memberof]) thisClass.inherited[inheritedMethods[n].memberof] = [];
                                                thisClass.inherited[inheritedMethods[n].memberof].push(inheritedMethods[n]);
                                        }
                                }
                                
                                thisClass.name = fileGroup.files[i].symbols[s].alias;
                                thisClass.filename = fileGroup.files[i].filename;
                                thisClass.docs = thisClass.name+".html";
                                
                                if (!allClasses[thisClass.name]) allClasses[thisClass.name] = [];
                                allClasses[thisClass.name].push(thisClass);
                        }
                        else if (fileGroup.files[i].symbols[s].alias == fileGroup.files[i].symbols[s].name) {
                                if (fileGroup.files[i].symbols[s].isa == "FUNCTION") {
                                        globals.methods.push(fileGroup.files[i].symbols[s]);
                                }
                                else {
                                        globals.properties.push(fileGroup.files[i].symbols[s]);
                                }
                        }
                }
                
                allFiles[fileGroup.files[i].path] = true;
        }
        
        for (var c in allClasses) {
                outfile = c+".html";
                allClasses[c].outfile = outfile;
                var output = classTemplate.process(allClasses[c]);
                IO.saveFile(context.d, outfile, output);
        }
        
        output = classTemplate.process([globals]);
        IO.saveFile(context.d, "globals.html", output);
        
        var output = indexTemplate.process(allClasses);
        IO.saveFile(context.d, "allclasses-frame.html", output);
        IO.copyFile(context.t+"index.html", context.d);
        IO.copyFile(context.t+"splash.html", context.d);
}

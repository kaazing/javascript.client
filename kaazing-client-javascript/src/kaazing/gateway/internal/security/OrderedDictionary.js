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


/**
 * @ignore
 */

var OrderedDictionary = (function() {

    //constructor
    var OrderedDictionary = function(weakKeys) {
        this.weakKeys = weakKeys; /* boolean*/
        this.elements /*Item*/ = [];
        this.dictionary /*String->Item*/ = new Dictionary();
    };

    var $prototype = OrderedDictionary.prototype;
       
    $prototype.getlength = function() {
        return this.elements.length;
    }

    $prototype.getItemAt = function(index){
        return this.dictionary[this.elements[index]];
    }

    $prototype.get = function(key) {
        var result = this.dictionary[key];
        if ( result == undefined) result = null;
        return result;
    }
    
    $prototype.remove = function(key) {
        for(var i = 0; i < this.elements.length; i++) {
            var weakMatch = (this.weakKeys && (this.elements[i] == key));
            var strongMatch = (!this.weakKeys && (this.elements[i] === key));
            if  (weakMatch || strongMatch) {
                this.elements.remove(i);
                this.dictionary[this.elements[i]] = undefined;
                break;
            }
        }
    }

    $prototype.put = function(key,  value) {
        this.remove(key);
        this.elements.push(key);
        this.dictionary[key] = value;
    }

    $prototype.isEmpty = function() {
        return this.length == 0;
    }
    
    $prototype.containsKey = function(key) {
        for(var i = 0; i < this.elements.length; i++) {
            var weakMatch = (this.weakKeys && (this.elements[i] == key));
            var strongMatch = (!this.weakKeys && (this.elements[i] === key));
            if  (weakMatch || strongMatch) {
                return true;
            }
        }
        return false;
    }

    $prototype.keySet = function() {
        return this.elements;
    }

    $prototype.getvalues = function() {
        var result  = [];
        for(var i = 0; i < this.elements.length; i++) {
            result.push(this.dictionary[this.elements[i]]);
        }
        return result;
    };
    
    return OrderedDictionary;
})();
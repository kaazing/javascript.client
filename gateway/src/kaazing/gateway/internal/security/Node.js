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

var Node = (function () {

    var Node = function () {
        this.name = '';
        this.kind = '';
        this.values = [];
        this.children = new OrderedDictionary();
    };

    var $prototype = Node.prototype;

    $prototype.getWildcardChar = function () {
        return "*";
    }

    $prototype.addChild = function (name, kind) {
        if (name == null || name.length == 0) {
            throw new ArgumentError("A node may not have a null name.");
        }
        var result = Node.createNode(name, this, kind);
        this.children.put(name, result);
        return result;
    };

    $prototype.hasChild = function (name, kind) {
        return null != this.getChild(name) && kind == this.getChild(name).kind;
    };

    $prototype.getChild = function (name) {
        return this.children.get(name);
    };

    $prototype.getDistanceFromRoot = function () {
        var result = 0;
        var cursor = this;
        while (!cursor.isRootNode()) {
            result++;
            cursor = cursor.parent;
        }
        return result;
    };

    $prototype.appendValues = function () {
        if (this.isRootNode()) {
            throw new ArgumentError("Cannot set a values on the root node.");
        }

        if (this.values != null) {
            for (var k = 0; k < arguments.length; k++) {
                var value = arguments[k];
                this.values.push(value);
            }
        }
    };

    $prototype.removeValue = function (value) {
        if (this.isRootNode()) {
            return;
        }
        for (var i = 0; i < this.values.length; i++) {
            if (this.values[i] == value) {
                this.values.splice(i, 1);
            }
        }
    };

    $prototype.getValues = function () {
        return this.values;
    };

    $prototype.hasValues = function () {
        return this.values != null && this.values.length > 0;
    };

    $prototype.isRootNode = function () {
        return this.parent == null;
    };

    $prototype.hasChildren = function () {
        return this.children != null && this.children.getlength() > 0;
    };

    $prototype.isWildcard = function () {
        return this.name != null && this.name == this.getWildcardChar();
    };

    $prototype.hasWildcardChild = function () {
        return this.hasChildren() && this.children.containsKey(this.getWildcardChar());
    };

    $prototype.getFullyQualifiedName = function () {
        var b = new String();
        var name = [];
        var cursor = this;
        while (!cursor.isRootNode()) {
            name.push(cursor.name);
            cursor = cursor.parent;
        }
        name = name.reverse();

        for (var k = 0; k < name.length; k++) {
            b += name[k];
            b += ".";
        }
        if (b.length >= 1 && b.charAt(b.length - 1) == '.') {
            b = b.slice(0, b.length - 1);
        }
        return b.toString();
    };

    $prototype.getChildrenAsList = function () {
        return this.children.getvalues();
    };

    $prototype.findBestMatchingNode = function (tokens, tokenIdx) {
        var matches /*Node*/ = this.findAllMatchingNodes(tokens, tokenIdx);
        var resultNode = null;
        var score = 0;
        for (var i = 0; i < matches.length; i++) {
            var node = matches[i];
            if (node.getDistanceFromRoot() > score) {
                score = node.getDistanceFromRoot();
                resultNode = node;
            }
        }
        return resultNode;
    };

    $prototype.findAllMatchingNodes = function (tokens, tokenIdx) {
        var result = [];
        var nodes = this.getChildrenAsList();
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var matchResult = node.matches(tokens, tokenIdx);
            if (matchResult < 0) {
                continue;
            }
            if (matchResult >= tokens.length) {
                do {
                    if (node.hasValues()) {
                        result.push(node);
                    }
                    if (node.hasWildcardChild()) {
                        var child = node.getChild(this.getWildcardChar());
                        if (child.kind != this.kind) {
                            node = null;
                        }
                        else {
                            node = child;
                        }
                    }
                    else {
                        node = null;
                    }
                } while (node != null)
            }
            else {
                var allMatchingNodes = node.findAllMatchingNodes(tokens, matchResult);
                for (var j = 0; j < allMatchingNodes.length; j++) {
                    result.push(allMatchingNodes[j]);
                }
            }
        }
        return result;
    };

    $prototype.matches = function (tokens, tokenIdx) {
        if (tokenIdx < 0 || tokenIdx >= tokens.length) {
            return -1;
        }
        if (this.matchesToken(tokens[tokenIdx])) {
            return tokenIdx + 1;
        }
        if (!this.isWildcard()) {
            return -1;
        }
        else {
            if (this.kind != tokens[tokenIdx].kind) {
                return -1;
            }
            do {
                tokenIdx++;
            } while (tokenIdx < tokens.length && this.kind == tokens[tokenIdx].kind)

            return tokenIdx;
        }
    };

    $prototype.matchesToken = function (token) {
        return this.name == token.name && this.kind == token.kind;
    };

    //static function
    Node.createNode = function (name, parent, kind) {
        var node = new Node();
        node.name = name;
        node.parent = parent;
        node.kind = kind;
        return node;
    };

    return Node;
})();
 
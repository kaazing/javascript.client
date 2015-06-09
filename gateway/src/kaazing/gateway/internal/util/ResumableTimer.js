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
 @private
 */

var ResumableTimer = (function () {

    var ResumableTimer = function (callback, delay, updateDelayWhenPaused) {
        if (arguments.length < 3) {
            var s = "ResumableTimer: Please specify the required parameters \'callback\', \'delay\', and \'updateDelayWhenPaused\'.";
            throw Error(s);
        }

        if ((typeof(callback) == "undefined") || (callback == null)) {
            var s = "ResumableTimer: Please specify required parameter \'callback\'.";
            throw Error(s);
        }
        else if (typeof(callback) != "function") {
            var s = "ResumableTimer: Required parameter \'callback\' must be a function.";
            throw Error(s);
        }

        if (typeof(delay) == "undefined") {
            var s = "ResumableTimer: Please specify required parameter \'delay\' of type integer.";
            throw Error(s);
        }
        else if ((typeof(delay) != "number") || (delay <= 0)) {
            var s = "ResumableTimer: Required parameter \'delay\' should be a positive integer.";
            throw Error(s);
        }

        if (typeof(updateDelayWhenPaused) == "undefined") {
            var s = "ResumableTimer: Please specify required boolean parameter \'updateDelayWhenPaused\'.";
            throw Error(s);
        }
        else if (typeof(updateDelayWhenPaused) != "boolean") {
            var s = "ResumableTimer: Required parameter \'updateDelayWhenPaused\' is a boolean.";
            throw Error(s);
        }

        this._delay = delay;
        this._updateDelayWhenPaused = updateDelayWhenPaused;
        this._callback = callback;
        this._timeoutId = -1;
        this._startTime = -1;
    };

    var $prototype = ResumableTimer.prototype;

    $prototype.cancel = function () {
        if (this._timeoutId != -1) {
            window.clearTimeout(this._timeoutId);
            this._timeoutId = -1;
        }

        this._delay = -1;
        this._callback = null;
    };

    $prototype.pause = function () {
        if (this._timeoutId == -1) {
            // There is no timer to be paused.
            return;
        }

        window.clearTimeout(this._timeoutId);

        var currTime = new Date().getTime();
        var elapsedTime = currTime - this._startTime;

        this._timeoutId = -1;

        // If _updateDelayWhenPaused true, then update this._delay by
        // subtracting the elapsed time. Otherwise, this._delay is not modified.
        if (this._updateDelayWhenPaused) {
            this._delay = this._delay - elapsedTime;
        }
    };

    $prototype.resume = function () {
        if (this._timeoutId != -1) {
            // Timer is already running.
            return;
        }

        if (this._callback == null) {
            var s = "Timer cannot be resumed as it has been canceled."
            throw new Error(s);
        }

        this.start();
    };

    $prototype.start = function () {
        if (this._delay < 0) {
            var s = "Timer delay cannot be negative";
        }

        this._timeoutId = window.setTimeout(this._callback, this._delay);
        this._startTime = new Date().getTime();
    };

    return ResumableTimer;
})();
 
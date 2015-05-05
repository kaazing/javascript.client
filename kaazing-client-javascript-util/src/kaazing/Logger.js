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
 * @private
 */
var Logger = function(name) {
    this._name = name;
    this._level = Logger.Level.INFO; // default to INFO 
};
        
(function() {
    /**
     * Logging levels available. Matches java.util.logging.Level.
     * See http://java.sun.com/javase/6/docs/api/java/util/logging/Level.html
     * @ignore
     */
    Logger.Level = {
        OFF:8,
        SEVERE:7,
        WARNING:6,
        INFO:5,
        CONFIG:4,
        FINE:3,
        FINER:2,
        FINEST:1,
        ALL:0
    };
    
    // Load the logging configuration as specified by the kaazing:logging META tag
    var logConfString;
    var tags = document.getElementsByTagName("meta");
    for(var i = 0; i < tags.length; i++) {
        if (tags[i].name === 'kaazing:logging') {
            logConfString = tags[i].content;
            break;
        }
    }
    Logger._logConf = {};
    if (logConfString) {
        var tokens = logConfString.split(',');
        for (var i = 0; i < tokens.length; i++) {
            var logConfItems = tokens[i].split('=');
            Logger._logConf[logConfItems[0]] = logConfItems[1];
        }
    }
    
    var loggers = {};
    
    Logger.getLogger = function(name) {
        var logger = loggers[name];
        if (logger === undefined) {
            logger = new Logger(name);
            loggers[name] = logger;
        }
        return logger; 
    }
    
    var $prototype = Logger.prototype;
    
    /**
     * Set the log level specifying which message levels will be logged.
     * @param level the log level
     * @ignore
     * @memberOf Logger
     */
    $prototype.setLevel = function(level) {
        if (level && level >= Logger.Level.ALL && level <= Logger.Level.OFF) {
            this._level = level;
        }
    }    

    /**
     * Check if a message of the given level would actually be logged.
     * @param level the log level
     * @return whether loggable
     * @ignore
     * @memberOf Logger
     */
    $prototype.isLoggable = function(level) {
        for (var logKey in Logger._logConf) {
            if (Logger._logConf.hasOwnProperty(logKey)) {
                if (this._name.match(logKey)) {
                    var logVal = Logger._logConf[logKey];
                    if (logVal) {
                        return (Logger.Level[logVal] <= level);
                    }
                }
            }
        }
        return (this._level <= level);
    }
    
    var noop = function() {};
    
    var delegates = {};
    delegates[Logger.Level.OFF] = noop;
    delegates[Logger.Level.SEVERE] = (window.console) ? (console.error || console.log || noop) : noop;
    delegates[Logger.Level.WARNING] = (window.console) ? (console.warn || console.log || noop) : noop;
    delegates[Logger.Level.INFO] = (window.console) ? (console.info || console.log || noop) : noop;
    delegates[Logger.Level.CONFIG] = (window.console) ? (console.info || console.log || noop) : noop;
    delegates[Logger.Level.FINE] = (window.console) ? (console.debug || console.log || noop) : noop;
    delegates[Logger.Level.FINER] = (window.console) ? (console.debug || console.log || noop) : noop;
    delegates[Logger.Level.FINEST] = (window.console) ? (console.debug || console.log || noop) : noop;
    delegates[Logger.Level.ALL] = (window.console) ? (console.log || noop) : noop;
    
    $prototype.config = function(source, message) {
        this.log(Logger.Level.CONFIG, source, message);
    };

    $prototype.entering = function(source, name, params) {
        if (this.isLoggable(Logger.Level.FINER)) {
            if (browser == 'chrome' || browser == 'safari') {
                source = console;
            }
            var delegate = delegates[Logger.Level.FINER];
            if (params) {
                if (typeof(delegate) == 'object') {
                    delegate('ENTRY ' + name, params);
                } else {
                    delegate.call(source, 'ENTRY ' + name, params);
                }
            } else {
                if (typeof(delegate) == 'object') {
                    delegate('ENTRY ' + name);
                } else {
                    delegate.call(source, 'ENTRY ' + name);
                }
            }
        }  
    };

    $prototype.exiting = function(source, name, value) {
        if (this.isLoggable(Logger.Level.FINER)) {
            var delegate = delegates[Logger.Level.FINER];
            if (browser == 'chrome' || browser == 'safari') {
                source = console;
            }
            if (value) {
                if (typeof(delegate) == 'object') {
                    delegate('RETURN ' + name, value);
                } else {
                    delegate.call(source, 'RETURN ' + name, value);
                }
            } else {
                if (typeof(delegate) == 'object') {
                    delegate('RETURN ' + name);
                } else {
                    delegate.call(source, 'RETURN ' + name);
                }
            }
        }  
    };
    
    $prototype.fine = function(source, message) {
        this.log(Logger.Level.FINE, source, message);
    };

    $prototype.finer = function(source, message) {
        this.log(Logger.Level.FINER, source, message);
    };

    $prototype.finest = function(source, message) {
        this.log(Logger.Level.FINEST, source, message);
    };

    $prototype.info = function(source, message) {
        this.log(Logger.Level.INFO, source, message);
    };

    $prototype.log = function(level, source, message) {
        if (this.isLoggable(level)) {
            var delegate = delegates[level];
            if (browser == 'chrome' || browser == 'safari') {
                source = console;
            }
            if (typeof(delegate) == 'object') {
                delegate(message);
            } else {
                delegate.call(source, message);
            }
        }  
    };

    $prototype.severe = function(source, message) {
        this.log(Logger.Level.SEVERE, source, message);
    };

    $prototype.warning = function(source, message) {
        this.log(Logger.Level.WARNING, source, message);
    };

})();
    

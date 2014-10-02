/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

/**
 * @private
 */
var KzLogger = function(name) {
    this._name = name;
    this._level = KzLogger.Level.INFO; // default to INFO 
};
        
(function() {
    /**
     * Logging levels available. Matches java.util.logging.Level.
     * See http://java.sun.com/javase/6/docs/api/java/util/logging/Level.html
     * @ignore
     */
    KzLogger.Level = {
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
    KzLogger._logConf = {};
    if (logConfString) {
        var tokens = logConfString.split(',');
        for (var i = 0; i < tokens.length; i++) {
            var logConfItems = tokens[i].split('=');
            KzLogger._logConf[logConfItems[0]] = logConfItems[1];
        }
    }
    
    var loggers = {};
    
    KzLogger.getLogger = function(name) {
        var logger = loggers[name];
        if (logger === undefined) {
            logger = new KzLogger(name);
            loggers[name] = logger;
        }
        return logger; 
    }
    
    var $prototype = KzLogger.prototype;
    
    /**
     * Set the log level specifying which message levels will be logged.
     * @param level the log level
     * @ignore
     * @memberOf KzLogger
     */
    $prototype.setLevel = function(level) {
        if (level && level >= KzLogger.Level.ALL && level <= KzLogger.Level.OFF) {
            this._level = level;
        }
    }    

    /**
     * Check if a message of the given level would actually be logged.
     * @param level the log level
     * @return whether loggable
     * @ignore
     * @memberOf KzLogger
     */
    $prototype.isLoggable = function(level) {
        for (var logKey in KzLogger._logConf) {
            if (KzLogger._logConf.hasOwnProperty(logKey)) {
                if (this._name.match(logKey)) {
                    var logVal = KzLogger._logConf[logKey];
                    if (logVal) {
                        return (KzLogger.Level[logVal] <= level);
                    }
                }
            }
        }
        return (this._level <= level);
    }
    
    var noop = function() {};
    
    var delegates = {};
    delegates[KzLogger.Level.OFF] = noop;
    delegates[KzLogger.Level.SEVERE] = (window.console) ? (console.error || console.log || noop) : noop;
    delegates[KzLogger.Level.WARNING] = (window.console) ? (console.warn || console.log || noop) : noop;
    delegates[KzLogger.Level.INFO] = (window.console) ? (console.info || console.log || noop) : noop;
    delegates[KzLogger.Level.CONFIG] = (window.console) ? (console.info || console.log || noop) : noop;
    delegates[KzLogger.Level.FINE] = (window.console) ? (console.debug || console.log || noop) : noop;
    delegates[KzLogger.Level.FINER] = (window.console) ? (console.debug || console.log || noop) : noop;
    delegates[KzLogger.Level.FINEST] = (window.console) ? (console.debug || console.log || noop) : noop;
    delegates[KzLogger.Level.ALL] = (window.console) ? (console.log || noop) : noop;
    
    $prototype.config = function(source, message) {
        this.log(KzLogger.Level.CONFIG, source, message);
    };

    $prototype.entering = function(source, name, params) {
        if (this.isLoggable(KzLogger.Level.FINER)) {
            if (browser == 'chrome' || browser == 'safari') {
                source = console;
            }
            var delegate = delegates[KzLogger.Level.FINER];
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
        if (this.isLoggable(KzLogger.Level.FINER)) {
            var delegate = delegates[KzLogger.Level.FINER];
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
        this.log(KzLogger.Level.FINE, source, message);
    };

    $prototype.finer = function(source, message) {
        this.log(KzLogger.Level.FINER, source, message);
    };

    $prototype.finest = function(source, message) {
        this.log(KzLogger.Level.FINEST, source, message);
    };

    $prototype.info = function(source, message) {
        this.log(KzLogger.Level.INFO, source, message);
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
        this.log(KzLogger.Level.SEVERE, source, message);
    };

    $prototype.warning = function(source, message) {
        this.log(KzLogger.Level.WARNING, source, message);
    };

})();
    

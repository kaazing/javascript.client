/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

/**
 * An object for storing list of actions and then executing them when required
 * @private
 */
var ActionList = function() {
    this._actionList = new Array();
    this.currentAction = 0;
    this._replayLength = 0;
};

/**
 * Return reference to actionList array
 */
ActionList.prototype.getActionList = function() { return this._actionList };

ActionList.prototype.setReplayLength = function(l) { this._replayLength = l; };

/**
 * Executes an action in the actionList each time it is invoked and keeps 
 * track with of current action by using 'currentAction' variable
 */
ActionList.prototype._processActions = function _processActions() {
    if (!this._actionList.length) {            
        return;
    }

    if(this.currentAction == this._actionList.length) {
        this.currentAction = 0;
    }

    var action = this._actionList[this.currentAction];
    this.currentAction++;
    
    action.func.apply(action.object, action.args);
};

/**
 * Executes all the actions in the actionList
 */
ActionList.prototype._processAllActions = function _processAllActions() {
    for (i=0; i < this._replayLength; i++) {
        var action = this._actionList[i];
        action.func.apply(action.object, action.args);
    }
};

ActionList.prototype._processAllNewActions = function _processAllNewActions() {
    for (i=this._replayLength; i < this._actionList.length; i++) {
        var action = this._actionList[i];
        action.func.apply(action.object, action.args);
    }
};

/**
 * Function is used to add an action to list which will be executed later
 * @param {methodName} name of method to be executed (used for filtering out unwanted methods).
 * @param {object} object on which function to be executed
 * @param {func} function to be executed
 * @param {args} function arguments to be passed
 */
ActionList.prototype._addAction = function _addAction(methodName, object, func, args) {
    // switch case is used only to prevent addition of actions from unwanted methods and 
    // allow only declareExchange(), declareQueue(), bindQueue() and consumeBasic() methods to add action
    // need conditional insertion of function call while using string template to remove this switch case
    switch(methodName)
    {
        case 'declareExchange':
            break;
        case 'declareQueue':
            break;
        case 'bindQueue':
            break;
        case 'consumeBasic':
            break;
        default:
            return;
    }
    var nullCallable = function nullCallable(){};
    var action = {};
    action.object = object;        
    action.func = func || nullCallable;
    action.args = args || null;

    this._actionList.push(action);
};
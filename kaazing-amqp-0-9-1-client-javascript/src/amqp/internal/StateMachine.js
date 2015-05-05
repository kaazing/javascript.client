/**
 * Copyright (c) 2007-2014, Kaazing Corporation. All rights reserved.
 */

/**
 * State machine class for representing state graphs with behavior and
 * conditional transitions on input objects.
 *
 * @private
 */
var StateMachine = function(context) {
    this.context = context;
    this.states = {};
};
;(function() {
var _prototype = StateMachine.prototype;

/**
 * A noop function for the default behavior on states for which no
 *  behavior was given.
 * @private
 */
var nullBehavior = function nullBehavior(){};


_prototype.enterState = function(stateName, input, args) {
    if (this.currentState) {
        this.currentState.exitBehavior(this.context, input, args, stateName);
    }

    // change to next state
    var state = this.states[stateName];
    this.currentState = state;

    try {
        state.entryBehavior(this.context, input, args, stateName);
    } catch(e) {
        var transitionError = new Error("Could not call behavior for state " + state.stateName + "\n\n" + e.message);
        transitionError.innerException = e;
        throw(transitionError);
    }

}

_prototype.addState = function(stateName, ruleList, entryBehavior, exitBehavior) {
    var state = {};
    state.stateName = stateName;
    state.entryBehavior = entryBehavior || nullBehavior;
    state.exitBehavior = exitBehavior || nullBehavior;
    this.states[stateName] = (state);

    // build associative lookup of states by name
    state.rules = {};
    var rules = ruleList || [];
    for (var i=0; i<rules.length; i++) {
        var rule = rules[i];
        for (var j=0; j<rule.inputs.length; j++) {
            var input = rule.inputs[j];
            state.rules[input] = rule.targetState;
        }
    }
};

_prototype.feedInput = function(input, args) {
    //console.info("fed input", input, this.currentState);
    var state = this.currentState;
    if (state.rules[input]) {

        var sm = this;
        var func = function() {
            sm.enterState(state.rules[input], input, args);
        };
        
        func();

        // not blocked from moving
        return true;
    } else {
        // do nothing and stay in the same state
        // return false for blocking
        return false;
    }
};

// end module closure
})();
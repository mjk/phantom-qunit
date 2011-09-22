/**
* Simple QUnit output logger.
*
* @author niltz (@see http://www.niltzdesigns.com/blog/2011/04/08/adding-javascript-unit-tests-to-your-continuous-integration-scripts/)
*/
var QUnitLogger = {
    /**
     * Set this to be the name of your test suite
     */
    name: "QUnit Tests",
 
    /**
     * Returns whether the test is done or not
     */
    done: false,
 
    /**
     * Maintains a reference to the listeners
     * @private
     */
    __listeners: {},
 
    /**
     * Contains the results of the test suite
     */
    results: {
        modules: {},
        failed: 0,
        passed: 0,
        total: 0,
        runtime: 0
    },
 
    /**
     * The current running module name
     */
    __m: null,
 
    /**
     * The current module's start time
     */
    __ms: null,
 
    /**
     * The current running test name
     */
    __t: null,
 
    /**
     * The current test's start time
     */
    __ts: null,
 
    /**
     * Handles the QUnit.log callbacks
     * @private
     * { result, actual, expected, message }
     */
    __log: function(info) {
        this.results.modules[this.__m].tests[this.__t].asserts.push(info);
    },
 
    /**
     * Handles the QUnit.testStart callbacks
     * @private
     * { name }
     */
    __testStart: function(info) {
        this.__t = info.name;
        this.__ts = new Date();
        if (!this.results.modules[this.__m].tests[this.__t]) {
            this.results.modules[this.__m].tests[this.__t] = {
                asserts: [],
                failed: 0,
                passed: 0,
                total: 0,
                runtime: 0
            };
        }
    },
 
    /**
     * Handles the QUnit.testDone callbacks
     * @private
     * { name, failed, passed, total }
     */
    __testDone: function(info) {
        // Save the results of the module
        var now  = new Date();
        this.results.modules[this.__m].tests[this.__t].failed += info.failed;
        this.results.modules[this.__m].tests[this.__t].passed += info.passed;
        this.results.modules[this.__m].tests[this.__t].total += info.total;
        this.results.modules[this.__m].tests[this.__t].runtime += (now.getTime() - this.__ts.getTime());
        this.__t = null;
        this.__ts = null;
    },
 
    /**
     * Handles the QUnit.moduleStart callbacks
     * @private
     * { name }
     */
    __moduleStart: function(info) {
        this.__m = info.name;
        this.__ms = new Date();
        if (!this.results.modules[this.__m]) {
            this.results.modules[this.__m] = {
                tests: {},
                failed: 0,
                passed: 0,
                total: 0,
                runtime: 0
            };
        }
    },
 
    /**
     * Handles the QUnit.moduleDone callbacks
     * @private
     * { name, failed, passed, total }
     */
    __moduleDone: function(info) {
        // Save the results of the module
        var now  = new Date();

        if (this.__m) {
            this.results.modules[this.__m].failed += info.failed;
            this.results.modules[this.__m].passed += info.passed;
            this.results.modules[this.__m].total += info.total;
            this.results.modules[this.__m].runtime += (now.getTime() - this.__ms.getTime());
            this.__m = null;
            this.__ms = null;
        }
    },
 
    /**
     * Handles the QUnit.begin callbacks
     * @private
     */
    __begin: function() {
    },
 
    /**
     * Handles the QUnit.done callbacks
     * @private
     * { failed, passed, total, runtime }
     */
    __done: function(info) {
        this.results.failed += info.failed;
        this.results.passed += info.passed;
        this.results.total += info.total;
        this.results.runtime += info.runtime;
 
        this.done = true;
        this.__dispatchEvent('done');
    },
 
    /**
     * Add a listener for an available event.
     * @param {String} eventId The name of the event you want to listen for. Available events are:
     * 'done': Raised when the test suite is complete. No arguments are passed to the callback.
     * @param {Function} closure The callback to call
     */
    addEventListener: function(eventId, closure) {
        if (!this.__listeners[eventId]) {
            this.__listeners[eventId] = [];
        }
        this.__listeners[eventId].push(closure);
    },
 
    /**
     * Dispatches the given event, and passes any extra arguments along to the callback closure
     * @param {String} eventId The name of the event to dispatch
     * @private
     */
    __dispatchEvent: function(eventId) {
        var i;
        var params = [];
        for (i = 1; i < arguments.length; ++i) {
            params.push(arguments[i]);
        }
 
        var closures = this.__listeners[eventId];
        if (closures) {
            for (i = 0; i < closures.length; ++i) {
                closures[i].apply(window, params);
            }
        }
    }
};
 
//
// Override the available overrideable functions in order to capture the test results
//
QUnit.log = function() { QUnitLogger.__log.apply(QUnitLogger, arguments); };
QUnit.testStart = function() { QUnitLogger.__testStart.apply(QUnitLogger, arguments); };
QUnit.testDone = function() { QUnitLogger.__testDone.apply(QUnitLogger, arguments); };
QUnit.moduleStart = function() { QUnitLogger.__moduleStart.apply(QUnitLogger, arguments); };
QUnit.moduleDone = function() { QUnitLogger.__moduleDone.apply(QUnitLogger, arguments); };
QUnit.begin = function() { QUnitLogger.__begin.apply(QUnitLogger, arguments); };
QUnit.done = function() { QUnitLogger.__done.apply(QUnitLogger, arguments); };

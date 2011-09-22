/**
* Prints QUnit test results in JUnit style, for integration with your favorite continuous integration system.
*
* @author mjk
*/
var QUnitJUnitPrinter = {
    /**
     * Assumes that our custom QUnitLogger was included and running throughout a QUnit run (storing all our test results).
     * Call this result printer after test execution completes.
     * @return {String} A JUnit-style test results XML string
     */
    print: function() {
        var now = new Date(),
            QUL = QUnitLogger,
            moduleCount = 0,
            totalTestCount = 0,
            totalFailCount = 0,
            rv = '';

        // Output a test suite for each module, including only failed test cases
        for (var moduleId in QUnitLogger.results.modules) {
            var module = QUnitLogger.results.modules[moduleId],
                failures = '',
                testCount = 0,
                failCount = 0;
           
            moduleCount++; 

            for (var testId in module.tests) {
                var test = module.tests[testId];
                testCount++;
                totalTestCount++;

                if (test.failed) {
                    failCount++;
                    totalFailCount++;

                    // Output all failed assertions
                    for (var i = 0; i < test.asserts.length; ++i) {
                        var assert = test.asserts[i];
                        var msg = assert.message.split('\n').shift();
                        if (!assert.result) {
                            failures += '<testcase time="'+test.runtime+'" classname="' + moduleId + '" name="' + testId + '">\n'
                                     + '\t<failure type="diffResult" message="'+msg+'"></failure>\n</testcase>\n';
                        }
                    }
                }
            }

            rv += '<testsuite tests="'+testCount+'" failures="'+failCount+'" disabled="0" errors="0" time="'+module.runtime+'" name="'+moduleId+'">\n';
            rv += failures; 
            rv += '</testsuite>\n';
        }

        rv = '<?xml version="1.0" encoding="UTF-8"?>\n<testsuites tests="'+totalTestCount+'" failures="'+totalFailCount+'" name="all">\n' + rv + '</testsuites>';
        return rv;
    }
};

/**
 * Runs a QUnit test harness in PhantomJS, and outputs the results to the console in the JUnit XML format.
 *
 * Adapted from http://www.niltzdesigns.com/blog/2011/04/08/adding-javascript-unit-tests-to-your-continuous-integration-scripts/
 */
(function() {
    var PAGE_FAILED = 1,
        TEST_FAILED = 2,
        EXCEPTION = 3;

    // Suppress all console output so that phantomjs output can go straight to a file.
    // @todo In the future, perhaps this should go to stderr
    console.error = function () {};
    console.warn = function () {};
 
    try {
        if (0 === phantom.state.length) {
            if (1 !== phantom.args.length) {
                console.log('Usage: phantomjs-driver.js URL');
                phantom.exit();
            } else {
                phantom.state = 'phantomjs-driver-running';
                phantom.viewportSize = { width: 800, height: 600 };
                phantom.open(phantom.args[0]);
            }
        } else {
            var testDone = function() {
                phantom.state = 'phantomjs-driver-finish';
                var r = QUnitLogger.results;

                // Won't get printed (see above), but it might be nice to have someday
                console.error('Tests completed in '+r.runtime.toString()+' milliseconds.');
                console.error(r.passed.toString()+' tests of '+r.total.toString()+' passed, '+r.failed.toString()+' failed.');
 
                // JUnit-style output
                console.log(QUnitJUnitPrinter.print());

                phantom.exit(0 < r.failed ? TEST_FAILED : 0);
            };
 
            if ("success" === phantom.loadStatus) {
                if (QUnitLogger.done) {
                    testDone();
                } else {
                    QUnitLogger.addEventListener('done', testDone);
                }
            } else {
                console.log('Page failed to load: ' + phantom.args[0]);
                phantom.exit(PAGE_FAILED);
            }
        }
    } catch(e) {
        console.log('Unhandled exception: ' + e);
        phantom.exit(EXCEPTION);
    }
})();

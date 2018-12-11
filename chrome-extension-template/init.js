var mochaStarted = false;

/**
 * General output function
 * @param {String} str
 */
var logTAP = function(str) {
    if (str == null) {
        str = 'null';
    }
    var lines = str.split("\n");
    lines.map(function(line) {
        console.log('[TAP]' + line.replace('[TAP]', '(TAP)') + '[TAP]');
        return '';
    });

};

/**
 * Verbose output function.
 *
 * Indents and comments an output statement.
 * @param {Object} str
 */
var explainTest = function(str) {
    if (typeof str != 'string') {
        str = JSON.stringify(str);
    }

    if (str == null) {
        str = 'null';
    }
    var lines = str.split("\n");
    lines.map(function(line) {
        console.log('[DEBUG]#   ' + line.replace('[DEBUG]', '(DEBUG)') + '[DEBUG]');
        return '';
    });
};

/**
 * Debug only output function.
 *
 * Will stringify an object if it gets one.
 * @param {Object} str
 */
var logDebug = function(str) {
    if (typeof str != 'string') {
        str = JSON.stringify(str);
    }

    if (str == null) {
        str = 'null';
    }
    var lines = str.split("\n");
    lines.map(function(line) {
        console.log('[DEBUG]' + line.replace('[DEBUG]', '(DEBUG)') + '[DEBUG]');
        return '';
    });
};

chrome.privacy.services.autofillEnabled.set({ value: false });
chrome.privacy.services.passwordSavingEnabled.set({ value: false });

// Listen for when the first tab is loaded and then start the test.
chrome.tabs.onUpdated.addListener(function(tabId, info) {
    if (info.status == "complete") {
        if (mochaStarted) {
            return;
        }
        mochaStarted = true;
        chrome.automation.getTree(tabId, function(node) {

            window.reader = new ScreenReader(tabId);
            var page = chrome.extension.getBackgroundPage();

            // Bootstrap mocha.
            mocha.setup({ui: 'bdd', ignoreLeaks: true, timeout: window.timeout});

            // Create a div to store test results.
            var div = page.document.createElement('div');
            div.setAttribute('id', 'mocha');
            page.document.body.appendChild(div);

            // Append the feature file.
            var script = page.document.createElement('script');
            script.src = 'feature.js';
            script.onload = function() {
                var testNo = 1, passed = 0, failed = 0;
                logTAP('1..' + mocha.suite.total());

                mocha.run()
                    .on('suite', function(suite) {
                        logTAP('# Test suite: "' + suite.title + '". ' + suite.total() + ' test(s).');
                        window.reader.setPageUrl(window.startUrl);
                    })
                    .on('pass', function(test) {
                        logTAP("ok " + (testNo++) + " - it " + test.title);
                        passed++;
                    })
                    .on('fail', function(test, err) {
                        logTAP("not ok " + (testNo++) + " - it " + test.title);
                        logTAP(("# " + err).split("\n").join("\n# "));
                        failed++;
                    })
                    .on('end', function() {
                        // Quit browser.
                        chrome.windows.getCurrent(function(win) {
                            chrome.windows.remove(win.id);
                        });
                    });
            }
            page.document.body.appendChild(script);
        });
    }
});

chrome.tabs.reload();

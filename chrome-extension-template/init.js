console.log('Hello...');

var logTAP = function(str) {
    var lines = str.split("\n");
    lines.map(function(line) {
        console.log('[TAP]' + line.replace('[TAP]', '(TAP)') + '[TAP]');
        return '';
    });

};

var mochaStarted = false;

chrome.tabs.onUpdated.addListener(function(tabId, info) {
    console.log('tab updated');
    console.log(tabId);
    console.log(info.status);
    if (info.status == "complete") {
        console.log('tab complete');
        if (mochaStarted) {
            return;
        }
        mochaStarted = true;
        chrome.automation.getTree(tabId, function(node) {

            window.reader = new ScreenReader(tabId);
            console.log('tree');
            console.log(node.name);
            console.log(node.role);
            var page = chrome.extension.getBackgroundPage();


            // Bootstrap mocha.
            console.log('mocha.setup');
            mocha.setup({ui: 'bdd', ignoreLeaks: true});

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
                    .on('pass', function(test) {
                        logTAP("ok " + (testNo++) + " - " + test.title);
                        passed++;
                    })
                    .on('fail', function(test, err) {
                        logTAP("not ok " + (testNo++) + " - " + test.title);
                        logTAP(("# " + err).split("\n").join("\n# "));
                        logTAP("Bail out!");
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

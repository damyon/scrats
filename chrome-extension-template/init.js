console.log('Hello...');

var logTAP = function(str) {
    var lines = str.split("\n");
    lines.map(function(line) {
        console.log('[TAP]' + line.replace('[TAP]', '(TAP)') + '[TAP]');
        return '';
    });

};

chrome.tabs.onUpdated.addListener(function(tabId, info) {
    console.log('tab updated');
    console.log(tabId);
    console.log(info.status);
    if (info.status == "complete") {
        console.log('tab complete');
        chrome.automation.getTree(tabId, function(node) {
            console.log('tree');
            console.log(node.name);
            console.log(node.role);


            // Bootstrap mocha.
            mocha.setup({ui: 'bdd', ignoreLeaks: true});
            console.log('mocha.setup');
            describe('5', function() {
              it('should be a number', function() {
                expect('5').to.be.a('number');
              });
            });
            console.log('describe');

            // Create a div to store test results.
            var page = chrome.extension.getBackgroundPage();
            var div = page.document.createElement('div');
            div.setAttribute('id', 'mocha');
            page.document.body.appendChild(div);

            var testNo = 1, passed = 0, failed = 0;
            mocha.run()
                .on('suite', function(suite) {
                    logTAP('1..' + suite.total());
                })
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
        });
    }
});

chrome.tabs.reload();

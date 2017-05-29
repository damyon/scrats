console.log('Hello...');

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
        });
    }
});

chrome.tabs.reload();

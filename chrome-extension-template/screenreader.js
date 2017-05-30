(function() {
    var ScreenReader = function(tabId) {
        this.tabId = tabId;
    };

    ScreenReader.prototype.getFocus = function() {
        return new Promise(function(resolve, reject) {
            chrome.automation.getFocus(resolve);
        });
    };

    ScreenReader.prototype.getTree = function() {
        return new Promise(function(resolve, reject) {
            chrome.automation.getTree(this.tabId, resolve);
        });
    };

    ScreenReader.prototype.getAccessibleName = function(node) {
        return node.name;
    };

    // Export this class.
    window.ScreenReader = ScreenReader;
}());

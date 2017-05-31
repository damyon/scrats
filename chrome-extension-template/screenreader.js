(function() {
    var ScreenReader = function(tabId) {
        this.tabId = tabId;
    };

    ScreenReader.prototype.getFocus = function() {
        return new Promise(function(resolve, reject) {
            chrome.automation.getFocus(resolve);
        });
    };

    ScreenReader.prototype.getPage = function() {
        return new Promise(function(resolve, reject) {
            chrome.automation.getTree(this.tabId, resolve);
        });
    };

    ScreenReader.prototype.find = function(node, findParams) {
        return node.find(findParams);
    }

    ScreenReader.prototype.getAccessibleName = function(node) {
        return node.name;
    };

    ScreenReader.prototype.debugPrintTree = async function() {
        var page = await this.getPage();

        console.log(page + '');
    };

    ScreenReader.prototype.debugPrintNode = function(node) {
        var output = '';
        output += ' id=' + node.id + ' name=' + node.name + ' namefrom=' + node.nameFrom;
        output += ' description=' + node.description + ' role=' + node.role + ' state=' + JSON.stringify(node.state);
        console.log(output);
    };

    // Export this class.
    window.ScreenReader = ScreenReader;
}());

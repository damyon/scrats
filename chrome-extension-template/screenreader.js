(function() {
    var ScreenReader = function(tabId) {
        this.tabId = tabId;
    };

    var NodeWrapper = function(automationNode) {
        this._node = automationNode;
    };

    ScreenReader.prototype.getFocus = function() {
        return new Promise(function(resolve, reject) {
            chrome.automation.getFocus(this.tabId, (node) => {
                resolve(new NodeWrapper(node));
            });
        });
    };

    ScreenReader.prototype.getPage = function() {
        return new Promise(function(resolve, reject) {
            chrome.automation.getTree(this.tabId, (node) => {

                console.log('Page ready: ' + JSON.stringify(node.state));
                console.log('Page ready: ' + node.docLoaded);
                console.log('Page ready: ' + node.name);
                resolve(new NodeWrapper(node));
            });
        });
    };

    ScreenReader.prototype.find = function(node, attributes) {
        if (node === null || node._node === null) {
            throw Error('node is null');
        }
        return new NodeWrapper(node._node.find({attributes: attributes}));
    }

    ScreenReader.prototype.next = function(node, attributes) {
        if (node === null || node._node === null) {
            throw Error('node is null');
        }
        var result = this._next(node._node, attributes, false);
        if (result) {
            return new NodeWrapper(result);
        }
    }

    ScreenReader.prototype._next = function(node, attributes, skipChild) {
        var result = false;
        if (node === null || typeof node === "undefined") {
            return false;
        }
        if (node.name) {
            console.log(node.name);
        }
        if (node.matches({ "attributes": attributes })) {
            return node;
        }
        if (node.firstChild && !skipChild) {
            result = this._next(node.firstChild, attributes, false);
        }

        if (!result) {
            if (node.nextSibling) {
                result = this._next(node.nextSibling, attributes, false);
            }
        }
        if (!result) {
            if (node.parent) {
                result = this._next(node.parent, attributes, true);
            }
        }
        return result;
    }


    ScreenReader.prototype.focus = function(node) {
        if (node === null || node._node === null) {
            throw Error('node is null');
        }
        node._node.focus();
    }

    ScreenReader.prototype.doDefault = function(node) {
        if (node === null || node._node === null) {
            throw Error('node is null');
        }
        node._node.focus();
        node._node.doDefault();

        return new Promise(function(resolve) {
            setTimeout(resolve, 1000);
        });
    }

    ScreenReader.prototype.getAccessibleName = function(node) {
        if (node === null || node._node === null) {
            throw Error('node is null');
        }
        return node._node.name;
    };

    ScreenReader.prototype.debugPrintTree = async function() {
        var page = await this.getPage();

        console.log(page._node + '');
    };

    ScreenReader.prototype.debugPrintNode = function(node) {
        var output = '';

        if (node === null || node._node === null) {
            console.log('null');
            return;
        }
        output += ' id=' + node._node.id + ' name=' + node._node.name + ' namefrom=' + node._node.nameFrom;
        output += ' description=' + node._node.description + ' role=' + node._node.role + ' state=' + JSON.stringify(node._node.state);
        console.log(output);
    };

    // Export this class.
    window.ScreenReader = ScreenReader;
}());

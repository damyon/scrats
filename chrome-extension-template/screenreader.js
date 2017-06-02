(function() {
    var ScreenReader = function(tabId) {
        this.tabId = tabId;
        this.loadingComplete = () => {};
        this.loading = new Promise((resolve) => {
            this.loadingComplete = resolve;
            // We are initially resolved, because we create ourselves in the tab update completed event listener.
            this.loadingComplete();
        });

        chrome.tabs.onUpdated.addListener(function(tabId, info) {
            if (info.status == "complete") {
                this.loadingComplete();
            }
            if (info.status == "loading") {
                this.loading = new Promise((resolve) => {
                    this.loadingComplete = resolve;
                });
            }
        }.bind(this));
    };

    ScreenReader.prototype.waitForPage = function() {
        return this.loading;
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

    ScreenReader.prototype.getPageTitle = function() {
        return this._getPage().then((page) => {
            return page.name;
        });
    }

    ScreenReader.prototype._getPage = function() {
        return this.waitForPage().then(() => {
            return new Promise(function(resolve, reject) {
                chrome.automation.getTree(this.tabId, (node) => {
                    resolve(node);
                });
            });
        });
    };

    ScreenReader.prototype.findInPage = async function(attributes) {
        var page = await this._getPage();
        
        if (page === null) {
            throw Error('page is not available');
        }

        var result = page.find({attributes: attributes});
        if (result !== undefined && result !== null) {
            result = new NodeWrapper(result);
        }
        return result;
    };

    ScreenReader.prototype.existsInPage = async function(attributes) {
        var page = await this._getPage();
        
        if (page === null) {
            throw Error('page is not available');
        }

        var result = page.find({attributes: attributes});
        if (result !== undefined && result !== null) {
            return true;
        }
        return false;
    };

    ScreenReader.prototype.find = function(wrapper, attributes) {
        if (wrapper === null || wrapper._node === null) {
            throw Error('node is null');
        }
        return new NodeWrapper(wrapper._node.find({attributes: attributes}));
    }

    ScreenReader.prototype.next = function(wrapper, attributes) {
        if (wrapper === null || wrapper._node === null) {
            throw Error('node is null');
        }
        var result = this._next(wrapper._node, attributes, false);
        if (result) {
            return new NodeWrapper(result);
        }
    }

    ScreenReader.prototype._next = function(node, attributes, skipChild) {
        var result = false;
        if (node === null || typeof node === "undefined") {
            return false;
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


    ScreenReader.prototype.focus = function(wrapper) {
        if (wrapper === null || wrapper._node === null) {
            throw Error('node is null');
        }
        wrapper._node.focus();
    }

    ScreenReader.prototype.doDefault = function(wrapper) {
        if (wrapper === null || wrapper._node === null) {
            throw Error('node is null');
        }
        wrapper._node.focus();
        wrapper._node.doDefault();

        return new Promise(function(resolve) {
            setTimeout(resolve, 800);
        });
    }

    ScreenReader.prototype.isFocusable = function(wrapper) {
        if (wrapper === null || wrapper._node === null) {
            return false;
        }
        return wrapper._node.state.focusable === true;
    };

    ScreenReader.prototype.isExpanded = function(wrapper) {
        if (wrapper === null || wrapper._node === null) {
            return false;
        }
        return wrapper._node.state.expanded === true;
    };

    ScreenReader.prototype.isVisible = function(wrapper) {
        if (wrapper === null || wrapper._node === null) {
            return false;
        }
        return wrapper._node.state.invisible !== true;
    };

    ScreenReader.prototype.getAccessibleName = function(wrapper) {
        if (wrapper === null || wrapper._node === null) {
            throw Error('node is null');
        }
        return wrapper._node.name;
    };

    ScreenReader.prototype.debugPrintTree = async function() {
        var page = await this._getPage();

        console.log(page + '');
    };

    ScreenReader.prototype.debugPrintNode = function(wrapper) {
        var output = '';

        if (wrapper === null || wrapper._node === null || wrapper._node === undefined) {
            console.log('null');
            return;
        }
        output += ' id=' + wrapper._node.id + ' name=' + wrapper._node.name + ' namefrom=' + wrapper._node.nameFrom;
        output += ' level=' + wrapper._node.hierarchicalLevel;
        output += ' description=' + wrapper._node.description + ' role=' + wrapper._node.role + ' state=' + JSON.stringify(wrapper._node.state);
        console.log(output);
    };

    // Export this class.
    window.ScreenReader = ScreenReader;
}());

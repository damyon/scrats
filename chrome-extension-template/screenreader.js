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
        this._node = null;
        if (automationNode) {
            this._node = automationNode;
        }
    };

    ScreenReader.prototype.isEmpty = function(wrapper) {
        if (wrapper === null ||
                typeof wrapper == 'undefined' ||
                wrapper._node === null ||
                typeof wrapper._node == 'undefined') {
            return true;
        }
        return false;
    }

    ScreenReader.prototype.getFocus = function() {
        return new Promise(function(resolve, reject) {
            chrome.automation.getFocus((node) => {
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

    ScreenReader.prototype._mapSearchAttributes = function(role, name) {
        var attributes = { };
        if ((typeof name != 'undefined') && name != '') {
            attributes.name = name;
        }
        return { role: role, attributes: attributes };
    };

    ScreenReader.prototype.findInPage = async function(role, name) {
        var page = await this._getPage();

        if (page === null) {
            throw Error('page is not available');
        }

        var result = page.find(this._mapSearchAttributes(role, name));
        if (result !== undefined && result !== null) {
            result = new NodeWrapper(result);
        }
        return result;
    };

    ScreenReader.prototype.existsInPage = async function(role, name) {
        var page = await this._getPage();

        if (page === null) {
            throw Error('page is not available');
        }

        var result = page.find(this._mapSearchAttributes(role, name));
        if (result !== undefined && result !== null) {
            return true;
        }
        return false;
    };

    ScreenReader.prototype.find = function(wrapper, role, name) {
        if (this.isEmpty(wrapper)) {
            throw Error('node is null');
        }
        var result = wrapper._node.find(this._mapSearchAttributes(role, name));
        if (result !== undefined && result !== null) {
            result = new NodeWrapper(result);
        }
        return result;
    }

    ScreenReader.prototype.findAll = function(wrapper, role, name) {
        if (this.isEmpty(wrapper)) {
            throw Error('node is null');
        }
        var nodes = wrapper._node.findAll(this._mapSearchAttributes(role, name));
        var results = [];
        var i;
        var node;

        for (i = 0; i < nodes.length; i++) {
            node = nodes[i];

            if (node != null) {
                results[results.length] = new NodeWrapper(node);
            }
        }
        return results;
    }

    /**
     * We search down and across but not "up".
     */
    ScreenReader.prototype.next = function(wrapper, role, name) {
        if (this.isEmpty(wrapper)) {
            throw Error('node is null');
        }
        var result = this._next(wrapper._node, role, name, false, true);
        if (result) {
            return new NodeWrapper(result);
        }
        return null;
    }

    ScreenReader.prototype._next = function(node, role, name, skipChild, skipThis) {
        var result = false;
        if (node === null || typeof node === "undefined") {
            return false;
        }
        if (!skipThis && node.matches(this._mapSearchAttributes(role, name))) {
            return node;
        }
        if (node.firstChild && !skipChild) {
            result = this._next(node.firstChild, role, name, false, false);
        }

        if (!result) {
            if (node.nextSibling) {
                result = this._next(node.nextSibling, role, name, false, false);
            }
        }
        return result;
    }


    ScreenReader.prototype.focus = function(wrapper) {
        if (this.isEmpty(wrapper)) {
            throw Error('node is null');
        }

        wrapper._node.focus();

        return true;
    }

    ScreenReader.prototype.doDefault = async function(wrapper) {
        this.focus(wrapper);
        await wrapper._node.doDefault();

        return this.pause(800);
    }

    ScreenReader.prototype.isFocusable = function(wrapper) {
        if (this.isEmpty(wrapper)) {
            return false;
        }
        return wrapper._node.state.focusable === true;
    };

    ScreenReader.prototype.isExpanded = function(wrapper) {
        if (this.isEmpty(wrapper)) {
            return false;
        }
        return wrapper._node.state.expanded === true;
    };

    ScreenReader.prototype.isVisible = function(wrapper) {
        if (this.isEmpty(wrapper)) {
            return false;
        }
        return wrapper._node.state.invisible !== true;
    };

    ScreenReader.prototype.getAccessibleName = function(wrapper) {
        if (this.isEmpty(wrapper)) {
            throw Error('node is null');
        }
        return wrapper._node.name;
    };

    ScreenReader.prototype.debugPrintTree = async function() {
        var page = await this._getPage();

        logDebug(page + '');
    };

    ScreenReader.prototype.debugPrintNode = function(wrapper) {
        var output = '';

        if (this.isEmpty(wrapper)) {
            logDebug('null');
            return;
        }
        output += ' id=' + wrapper._node.id + ' name=' + wrapper._node.name + ' namefrom=' + wrapper._node.nameFrom;
        output += ' level=' + wrapper._node.hierarchicalLevel;
        output += ' description=' + wrapper._node.description + ' role=' + wrapper._node.role + ' state=' + JSON.stringify(wrapper._node.state);
        logDebug(output);
    };

    ScreenReader.prototype.sendKey = async function(key) {
        chrome.debugger.attach({ tabId: this.tabId }, "1.0");
        chrome.debugger.sendCommand({ tabId: this.tabId }, 'Input.dispatchKeyEvent', { type: 'keyDown', text : key });
        chrome.debugger.sendCommand({ tabId: this.tabId }, 'Input.dispatchKeyEvent', { type: 'keyUp', text : key });

        var complete = new Promise(function(resolve) {
            chrome.debugger.detach({ tabId: this.tabId }, resolve);
        });

        return complete;
    };

    ScreenReader.prototype.getPageUrl = async function() {
        var page = await this._getPage();

        return page.docUrl;
    };

    ScreenReader.prototype.getAttributeValue = async function(wrapper, attributeName) {
        var attributes;

        if (this.isEmpty(wrapper)) {
            throw Error('node is null');
        }

        attributes = wrapper._node.htmlAttributes;

        if (attributeName in attributes) {
            return attributes[attributeName];
        }
        return false;
    };

    ScreenReader.prototype.enterText = async function(wrapper, text) {
        this.focus(wrapper);

        if (wrapper._node.role == 'textField') {
            wrapper._node.setValue(text);
        } else {
            var i = 0;
            for (i = 0; i < text.length; i++) {
                var sentKey = await this.sendKey(text[i]);
            }
        }
        return this.pause(500);
    };

    ScreenReader.prototype.pause = async function(timeout) {
        return new Promise(function(resolve) {
            setTimeout(resolve, timeout);
        });
    };

    ScreenReader.prototype.getChild = async function(wrapper, role) {
        var result;

        if (this.isEmpty(wrapper)) {
            throw Error('node is null');
        }

        result = wrapper._node.firstChild;
        if (result == null) {
            throw Error('node has no children');
        }
        if (role != result.role) {
            throw Error('child has incorrect role. "' + result.role + ' + " found and "' + role + '" expected.');
        }

        return new NodeWrapper(result);
    };

    ScreenReader.prototype.getChildren = async function(wrapper, role) {
        var children, results, i, node;

        if (this.isEmpty(wrapper)) {
            throw Error('node is null');
        }

        children = wrapper._node.children;
        if (children == null) {
            throw Error('node has no children nodes');
        }
        results = [];
        for (i = 0; i < children.length; i++) {
            node = children[i];

            if (node == null) {
                throw Error('node has invalid child node');
            }
            if (role != node.role) {
                throw Error('child has incorrect role. "' + node.role + ' + " found and "' + role + '" expected.');
            }
            results[results.length] = new NodeWrapper(node);
        }
        return results;
    };

    // Export this class.
    window.ScreenReader = ScreenReader;
}());

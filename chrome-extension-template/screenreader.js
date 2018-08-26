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
    };

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
    };

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

        return await this.pause(800);
    }

    ScreenReader.prototype.isFocusable = function(wrapper) {
        if (this.isEmpty(wrapper)) {
            return false;
        }
        return wrapper._node.state.focusable === true;
    };

    ScreenReader.prototype.isFocused = function(wrapper) {
        if (this.isEmpty(wrapper)) {
            return false;
        }
        return wrapper._node.state.focused === true;
    };

    ScreenReader.prototype.getRole = function(wrapper) {
        if (this.isEmpty(wrapper)) {
            return false;
        }
        return wrapper._node.role;
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

    ScreenReader.prototype.specialKeys = {
        NONE: 0,
        TAB: 1,
        ENTER: 2,
        UP_ARROW: 3,
        DOWN_ARROW: 4,
        LEFT_ARROW: 5,
        RIGHT_ARROW: 6,
        SPACEBAR: 7,
        HOME: 8,
        END: 9,
        ESCAPE: 10
    };

    ScreenReader.prototype.sendSpecialKey = async function(key) {
        var keyCodes = [];

        keyCodes[this.specialKeys.TAB] = [9, "U+0009"];
        keyCodes[this.specialKeys.ENTER] = [13, "U+000D"];
        keyCodes[this.specialKeys.UP_ARROW] = [38, "U+0026"];
        keyCodes[this.specialKeys.DOWN_ARROW] = [40, "U+0028"];
        keyCodes[this.specialKeys.LEFT_ARROW] = [37, "U+0025"];
        keyCodes[this.specialKeys.RIGHT_ARROW] = [39, "U+0027"];
        keyCodes[this.specialKeys.SPACEBAR] = [32, "U+0020"];
        keyCodes[this.specialKeys.HOME] = [36, "U+0024"];
        keyCodes[this.specialKeys.END] = [35, "U+0023"];
        keyCodes[this.specialKeys.ESCAPE] = [27, "U+001B"];
    
        chrome.debugger.attach({ tabId: this.tabId }, "1.0");
        chrome.debugger.sendCommand({ tabId: this.tabId }, 'Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: keyCodes[key][0], keyIdenfifier: keyCodes[key][1]});
        chrome.debugger.sendCommand({ tabId: this.tabId }, 'Input.dispatchKeyEvent', { type: 'rawKeyUp', windowsVirtualKeyCode: keyCodes[key][0], keyIdenfifier: keyCodes[key][1]});

        // Wait for keyboard handlers to fire.
        // await this.pause(500);

        var complete = new Promise(function(resolve) {
            chrome.debugger.detach({ tabId: this.tabId }, resolve);
        });

        return complete;
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
        return await this.pause(500);
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

    ScreenReader.prototype.getFlowFrom = async function(wrapper) {
        var flowFrom, results, i, node;

        if (this.isEmpty(wrapper)) {
            throw Error('node is null');
        }

        flowFrom = wrapper._node.flowFrom;
        if (flowFrom == null) {
            throw Error('node flows from no nodes');
        }
        results = [];
        for (i = 0; i < flowFrom.length; i++) {
            node = flowFrom[i];

            if (node == null) {
                throw Error('node has invalid flow from node');
            }
            results[results.length] = new NodeWrapper(node);
        }
        return results;
    };

    ScreenReader.prototype.getFlowTo = async function(wrapper) {
        var flowTo, results, i, node;

        if (this.isEmpty(wrapper)) {
            throw Error('node is null');
        }

        flowTo = wrapper._node.flowTo;
        if (flowTo == null) {
            throw Error('node flows to no nodes');
        }
        results = [];
        for (i = 0; i < flowTo.length; i++) {
            node = flowTo[i];

            if (node == null) {
                throw Error('node has invalid flow to node');
            }
            results[results.length] = new NodeWrapper(node);
        }
        return results;
    };

    ScreenReader.prototype.getNextFocus = async function(wrapper) {
        var nextFocus;

        if (this.isEmpty(wrapper)) {
            throw Error('node is null');
        }

        nextFocus = wrapper._node.nextFocus;
        if (nextFocus == null) {
            throw Error('node flows to no nodes');
        }

        return new NodeWrapper(nextFocus);
    };


    ScreenReader.prototype.getControls = async function(wrapper) {
        var controls, results, i, node;

        if (this.isEmpty(wrapper)) {
            throw Error('node is null');
        }

        controls = wrapper._node.controls;
        if (controls == null) {
            throw Error('node controls no nodes');
        }
        results = [];
        for (i = 0; i < controls.length; i++) {
            node = controls[i];

            if (node == null) {
                throw Error('node has invalid control node');
            }
            results[results.length] = new NodeWrapper(node);
        }
        return results;
    };

    ScreenReader.prototype.startListening = function(wrapper, type) {
        if (this.isEmpty(wrapper)) {
            throw Error('node is null');
        }

        return new Promise(function(resolve, reject) {
            var stopListening = function(event) {
                wrapper._node.removeEventListener(type, stopListening);
                resolve(event);
            };
            wrapper._node.addEventListener(type, stopListening);
        });
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

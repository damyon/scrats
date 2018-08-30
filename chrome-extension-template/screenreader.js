(function() {

    /**
     * This class is used to wrap and not directly give access to the chrome automation nodes.
     * There is only supposed to be a limited set of things you can do with these nodes because
     * messing with them invalidates the tests you can perform. 
     *
     * @class NodeWrapper
     * @param automationNode {chrome.automation.AutomationNode}
     */
    var NodeWrapper = function(automationNode) {
        this._node = null;
        if (automationNode) {
            this._node = automationNode;
        }
    };

    /**
     * Class that provides screen reader access.
     * @param {String} tabId
     */
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

    /**
     * Returns a resolved promise when the page has finished loading.
     *
     * @method waitForPage
     * @return {Promise}
     */
    ScreenReader.prototype.waitForPage = function() {
        return this.loading;
    };

    /**
     * Return true if the NoreWrapper represents an empty node.
     *
     * @method isEmpty
     * @param {NodeWrapper} wrapper
     * @return {Boolean}
     */
    ScreenReader.prototype.isEmpty = function(wrapper) {
        if (wrapper === null ||
                typeof wrapper == 'undefined' ||
                wrapper._node === null ||
                typeof wrapper._node == 'undefined') {
            return true;
        }
        return false;
    };

    /**
     * Return a resolved promise with the node that currently has focus.
     *
     * @method getFocus
     * @return {Promise} The resolved promise will accept a NodeWrapper
     */
    ScreenReader.prototype.getFocus = function() {
        return new Promise(function(resolve, reject) {
            chrome.automation.getFocus((node) => {
                resolve(new NodeWrapper(node));
            });
        });
    };

    /**
     * Get the title of the page.
     *
     * @method getPageTitle
     * @return {Promise} The resolved promise will accept the title of the page as a string.
     */
    ScreenReader.prototype.getPageTitle = async function() {
        return this._getPage().then((page) => {
            return page.name;
        });
    };

    /**
     * Get the automation node representing the entire page.
     *
     * @method _getPage
     * @private
     * @return {Promise} The resolved promise will accept the AutomationNode of the current page.
     */
    ScreenReader.prototype._getPage = function() {
        return this.waitForPage().then(() => {
            return new Promise(function(resolve, reject) {
                chrome.automation.getTree(this.tabId, (node) => {
                    resolve(node);
                });
            });
        });
    };

    /**
     * Construct an object used to search for nodes.
     *
     * @method _mapSearchAttributes
     * @private
     * @param {String} role
     * @param {String} name
     * @return {Object} A standard structure used to pass search parameters.
     */
    ScreenReader.prototype._mapSearchAttributes = function(role, name) {
        var attributes = { };
        if ((typeof name != 'undefined') && name != '') {
            attributes.name = name;
        }
        return { role: role, attributes: attributes };
    };

    /**
     * Search the current page for an automation node.
     *
     * @method findInPage
     * @param {String} role
     * @param {String} name
     * @return {NodeWrapper} A wrapper for the AutomationNode
     */
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

    /**
     * Search the current page for an automation node and return true or false.
     *
     * @method existsInPage
     * @param {String} role
     * @param {String} name
     * @return {Boolean} True if a node exists.
     */
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

    /**
     * Search the given node for an automation node and return it.
     *
     * @method findInPage
     * @param {NodeWrapper} wrapper The search starting point.
     * @param {String} role
     * @param {String} name
     * @return {NodeWrapper} The search result.
     */
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

    /**
     * Search the given node for a list of automation nodes and return them.
     *
     * @method findAll
     * @param {NodeWrapper} wrapper The search starting point.
     * @param {String} role
     * @param {String} name
     * @return {NodeWrapper[]} A list of node wrappers.
     */
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
     * From the given starting point search for the next occurance of the given node.
     * We do not escape the container we are starting from, so this will not search the entire page.
     * We search down and across but not "up".
     *
     * @method next
     * @param {NodeWrapper} wrapper The search starting point.
     * @param {String} role
     * @param {String} name
     * @return {NodeWrapper} The next matching node.
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

    /**
     * Internal function used to search for the next node.
     *
     * @method _next
     * @private
     * @param {AutomationNode} node The search starting point.
     * @param {String} role
     * @param {String} name
     * @param {Boolean} skipChild
     * @param {Boolean} skipThis
     * @return {AutomationNode} The next matching node.
     */
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

    /**
     * Shift focus to the given node.
     *
     * @method focus
     * @param {NodeWrapper} wrapper Wrapper for the node to focus on.
     * @return {Boolean}
     */
    ScreenReader.prototype.focus = function(wrapper) {
        if (this.isEmpty(wrapper)) {
            throw Error('node is null');
        }

        wrapper._node.focus();

        return true;
    }

    /**
     * Peform the default action on the given node.
     *
     * @method doDefault
     * @param {NodeWrapper} wrapper Wrapper for the node to focus on.
     * @return {Promise} Resolved when this action is complete
     */
    ScreenReader.prototype.doDefault = async function(wrapper) {
        this.focus(wrapper);
        await wrapper._node.doDefault();

        return await this.pause(800);
    }

    /**
     * Is this node focusable?
     *
     * @method isFocusable
     * @param {NodeWrapper} wrapper Wrapper for the node to focus on.
     * @return {Boolean} True if we can focus on this node.
     */
    ScreenReader.prototype.isFocusable = function(wrapper) {
        if (this.isEmpty(wrapper)) {
            return false;
        }
        return wrapper._node.state.focusable === true;
    };

    /**
     * Does this node have focus?
     *
     * @method isFocused
     * @param {NodeWrapper} wrapper Wrapper for the node to focus on.
     * @return {Boolean} True if we have focus on this node.
     */
    ScreenReader.prototype.isFocused = function(wrapper) {
        if (this.isEmpty(wrapper)) {
            return false;
        }
        return wrapper._node.state.focused === true;
    };

    /**
     * Get the role of this node. The roles are stored in the accessibility tree.
     *
     * @method getRole
     * @param {NodeWrapper} wrapper Wrapper for the node to focus on.
     * @return {String} The role name
     */
    ScreenReader.prototype.getRole = function(wrapper) {
        if (this.isEmpty(wrapper)) {
            return false;
        }
        return wrapper._node.role;
    };

    /**
     * Get the expanded state of the current node.
     * The expanded state is only supported by some specific roles and the aria-expanded attribute
     * is used in some situations instead.
     *
     * @method isExpanded
     * @param {NodeWrapper} wrapper Wrapper for the node to focus on.
     * @return {Boolean} The value of the expanded state
     */
    ScreenReader.prototype.isExpanded = function(wrapper) {
        if (this.isEmpty(wrapper)) {
            return false;
        }
        return wrapper._node.state.expanded === true;
    };

    /**
     * Is this node currently displayed.
     *
     * @method isVisible
     * @param {NodeWrapper} wrapper Wrapper for the node to focus on.
     * @return {Boolean} True if the ndoe can be seen.
     */
    ScreenReader.prototype.isVisible = function(wrapper) {
        if (this.isEmpty(wrapper)) {
            return false;
        }
        return wrapper._node.state.invisible !== true;
    };

    /**
     * Get the calculated name of this node for accessibility. Takes account of things like
     * aria-label or aria-labelledby
     *
     * @method getAccessibleName
     * @param {NodeWrapper} wrapper Wrapper for the node to focus on.
     * @return {String} The name of the node.
     */
    ScreenReader.prototype.getAccessibleName = function(wrapper) {
        if (this.isEmpty(wrapper)) {
            throw Error('node is null');
        }
        return wrapper._node.name;
    };

    /**
     * For debug purposes print some information about the accessibility tree.
     *
     * @method debugPrintTree
     * @return {Boolean} true
     */
    ScreenReader.prototype.debugPrintTree = async function() {
        var page = await this._getPage();

        logDebug(page + '');
        return true;
    };

    /**
     * For debug purposes print some information about the node.
     *
     * @method debugPrintNode
     * @param {NodeWrapper} wrapper
     * @return {Boolean} true
     */
    ScreenReader.prototype.debugPrintNode = function(wrapper) {
        var output = '';

        if (this.isEmpty(wrapper)) {
            logDebug('null');
            return true;
        }
        output += ' id=' + wrapper._node.id + ' name=' + wrapper._node.name + ' namefrom=' + wrapper._node.nameFrom;
        output += ' level=' + wrapper._node.hierarchicalLevel;
        output += ' description=' + wrapper._node.description + ' role=' + wrapper._node.role + ' state=' + JSON.stringify(wrapper._node.state);
        logDebug(output);
        return true;
    };

    /**
     * List of the non-typable keys we can test against.
     */
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

    /**
     * Send one of the special keyboard keys.
     *
     * @method sendSpecialKey
     * @param {Number} key One of Screenreader.specialKeys
     * @return {Promise} resolved when the key is sent.
     */
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

        if (key == this.specialKeys.ESCAPE) {
            // Wait a bit longer for cancel keys because we may need to wait for focus to shift.
            await this.pause(500);
        } else {
            await this.pause(10);
        }

        var complete = new Promise(function(resolve) {
            chrome.debugger.detach({ tabId: this.tabId }, resolve);
        });

        return complete;
    };

    /**
     * Send a typable keyboard key.
     *
     * @method sendKey
     * @param {String} key The character typed by the key.
     * @return {Promise} resolved when the key is sent.
     */
    ScreenReader.prototype.sendKey = async function(key) {
        chrome.debugger.attach({ tabId: this.tabId }, "1.0");
        chrome.debugger.sendCommand({ tabId: this.tabId }, 'Input.dispatchKeyEvent', { type: 'keyDown', text : key });
        chrome.debugger.sendCommand({ tabId: this.tabId }, 'Input.dispatchKeyEvent', { type: 'keyUp', text : key });

        var complete = new Promise(function(resolve) {
            chrome.debugger.detach({ tabId: this.tabId }, resolve);
        });

        return complete;
    };

    /**
     * Get the url of the current page.
     *
     * @method getPageUrl
     * @return {Promise} resolved with the url for the page as a string.
     */
    ScreenReader.prototype.getPageUrl = async function() {
        var page = await this._getPage();

        return page.docUrl;
    };

    /**
     * Get value of the named attribute of this node.
     *
     * @method getAttributeValue
     * @param {NodeWrapper} wrapper
     * @param {String} attributeName The attribute name
     * @return {String} The attribute value
     */
    ScreenReader.prototype.getAttributeValue = function(wrapper, attributeName) {
        var attributes;

        if (this.isEmpty(wrapper)) {
            throw Error('node is null');
        }

        attributes = wrapper._node.htmlAttributes;

        if (attributeName in attributes) {
            return attributes[attributeName];
        }
        return 'false';
    };

    /**
     * Send a line of text.
     *
     * @method enterText
     * @param {NodeWrapper} wrapper
     * @param {String} text The text to send
     * @return {Promise} resolved when the text is sent.
     */
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

    /**
     * Wait a bit.
     *
     * @method pause
     * @param {Number} timeout The number of milli seconds to wait.
     * @return {Promise} resolved when we waited.
     */
    ScreenReader.prototype.pause = async function(timeout) {
        return new Promise(function(resolve) {
            setTimeout(resolve, timeout);
        });
    };

    /**
     * Get the first matching child node.
     *
     * @method getChild
     * @param {NodeWrapper} wrapper The node to start from.
     * @param {String} role The role to search form
     * @return {NodeWrapper} The matching child.
     */
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

    /**
     * Get the node that flows to here.
     *
     * @method getFlowFrom
     * @param {NodeWrapper} wrapper The node to start from.
     * @return {NodeWrapper} The matching node.
     */
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

    /**
     * Get the node that flows from here.
     *
     * @method getFlowTo
     * @param {NodeWrapper} wrapper The node to start from.
     * @return {NodeWrapper} The matching node.
     */
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

    /**
     * Get the next node that gets focus.
     *
     * @method getNextFocus
     * @param {NodeWrapper} wrapper The node to start from.
     * @return {NodeWrapper} The matching node.
     */
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

    /**
     * Assume aria-controls only returns a single node and get it.
     *
     * @method getSingleControl
     * @param {NodeWrapper} wrapper The node to start from.
     * @return {NodeWrapper} The matching node.
     */
    ScreenReader.prototype.getSingleControl = function(wrapper) {
        var controlledList = this.getControls(wrapper);
        expect(controlledList.length).to.be(1);
        return controlledList.pop();
    };

    /**
     * Get the list of nodes this one controls.
     *
     * @method getControls
     * @param {NodeWrapper} wrapper The node to start from.
     * @return {NodeWrapper[]} A list of node wrappers.
     */
    ScreenReader.prototype.getControls = function(wrapper) {
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

    /**
     * Get a promise that will be resolved when the menu controlled by this button is closed.
     *
     * @method listenForMenuClosed
     * @param {NodeWrapper} menuButton The button that controls the menu.
     * @return {Promise} Resolved when we get an event on the button and the menu is closed.
     */
    ScreenReader.prototype.listenForMenuClosed = async function(menuButton) {
        var p, pollDelay = 200;

        if (this.isEmpty(menuButton)) {
            throw Error('Menu button is null');
        }

        p = new Promise(function(resolve, reject) {
            var awaitChange = function() {
                var ariaExpanded;

                ariaExpanded = this.getAttributeValue(menuButton, 'aria-expanded');
                if (ariaExpanded != 'true') {
                    // We are happy the menu is closed.
                    resolve();
                } else {
                    setTimeout(awaitChange, pollDelay);
                }
            }.bind(this);
            setTimeout(awaitChange, pollDelay);
        }.bind(this));

        return p;
    };

    /**
     * Get a promise that will be resolved when the menu controlled by this button is opened.
     *
     * @method listenForMenuOpened
     * @param {NodeWrapper} menuButton The button that controls the menu.
     * @return {Promise} Resolved when we get an event on the button and the menu is opened.
     */
    ScreenReader.prototype.listenForMenuOpened = async function(menuButton) {
        var p, pollDelay = 200;

        if (this.isEmpty(menuButton)) {
            throw Error('Menu button is null');
        }

        p = new Promise(function(resolve, reject) {
            var awaitChange = function() {
                var ariaExpanded;

                ariaExpanded = this.getAttributeValue(menuButton, 'aria-expanded');
                if (ariaExpanded == 'true') {
                    // We are happy the menu is open.
                    resolve();
                } else {
                    setTimeout(awaitChange, pollDelay);
                }
            }.bind(this);
            setTimeout(awaitChange, pollDelay);
        }.bind(this));

        return p;
    };

    /**
     * Start listining on the given node for an event.
     *
     * @method startListening
     * @param {NodeWrapper} wrapper The node to listen on.
     * @param {String} type The event type to listen for.
     * @return {Promise} Resolved when we get an event of the given type on the node.
     */
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

    /**
     * Walk the menu items in a menu and find the index of the selected entry.
     *
     * @method getSelectedMenuIndex
     * @param {NodeWrapper} menu The node of the menu.
     * @return {Number} The number of the focused menu item.
     */
    ScreenReader.prototype.getSelectedMenuIndex = async function(menu) {
        var i = 0, selectedIndex = -1;
        var menuItems = await this.getChildren(menu, 'menuItem');

        for (i = 0; i < menuItems.length; i++) {
            menuItem = menuItems[i];
            expect(this.getRole(menuItem)).to.be("menuItem");
            expect(this.getAccessibleName(menuItem)).not.to.be('');
            expect(this.isFocusable(menuItem)).to.be(true);
            if (this.isFocused(menuItem)) {
                selectedIndex = i;
            }
        }
        return selectedIndex;
    };

    /**
     * Get the children with the specified role.
     *
     * @method getChildren
     * @param {NodeWrapper} wrapper The node to start from
     * @param {String} role The role to search for.
     * @return {NodeWrapper[]} A list of node wrappers.
     */
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

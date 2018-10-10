(function() {
    /**
     * WAI is the namespace for the functions returned by this module.
     */
    var WAI = function() {
    };

    /**
     * Check all navigation containers and regions have accessible names and
     * do not allow 2 regions in the same page with the same name.
     * Throws an error if the validation fails.
     *
     * @method validatePageRegionLabels
     * @return {Boolean} true on success.
     */
    WAI.prototype.validatePageRegionLabels = async function() {
        let navigations,
            name;

        navigations = await reader.findAllInPage('navigation');
        await reader.expectUniqueLabels(navigations);

        regions = await reader.findAllInPage('region');
        await reader.expectUniqueLabels(regions);

        return true;
    };

    /**
     * Check accessibility for a rearrangeable list box.
     *
     * @method validateRearrangeableListBox
     * @param {NodeWrapper} The from list
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateRearrangeableListBox = async function(fromlist, tolist, moveto, movefrom) {
        let movetobutton, movefrombutton, fromcount, tocount;

        await reader.waitForInteraction(true);
        await reader.focus(fromlist);
        await reader.sendSpecialKey(reader.specialKeys.TAB);

        explainTest('The from listbox is labelled');
        expect(reader.getAccessibleName(fromlist)).to.not.be('');
        explainTest('The from listbox is visible');
        expect(reader.isVisible(fromlist)).to.be(true);
        explainTest('The element has the correct role (listBox)');
        expect(reader.getRole(fromlist)).to.be("listBox");

        explainTest('The to listbox is labelled');
        expect(reader.getAccessibleName(tolist)).to.not.be('');
        explainTest('The to listbox is visible');
        expect(reader.isVisible(tolist)).to.be(true);
        explainTest('The element has the correct role (listBox)');
        expect(reader.getRole(tolist)).to.be("listBox");

        explainTest('The move to button is labelled');
        expect(reader.getAccessibleName(moveto)).to.not.be('');
        explainTest('The move to button is visible');
        expect(reader.isVisible(moveto)).to.be(true);
        explainTest('The element has the correct role (button)');
        expect(reader.getRole(moveto)).to.be("button");

        explainTest('The move from button is labelled');
        expect(reader.getAccessibleName(movefrom)).to.not.be('');
        explainTest('The move from button is visible');
        expect(reader.isVisible(movefrom)).to.be(true);
        explainTest('The element has the correct role (button)');
        expect(reader.getRole(movefrom)).to.be("button");

        explainTest('The listBox has options');
        options = await reader.findAll(fromlist, 'listBoxOption');
        expect(options).not.to.be.empty();
        fromcount = options.length;

        for (i = 0; i < options.length; i++) {
            option = options[i];
            expect(reader.getAccessibleName(option)).to.not.be('');
            expect(reader.isVisible(option)).to.be(true);
            expect(reader.isFocusable(option)).to.be(true);
        }
        await reader.focus(fromlist);
        explainTest('The listbox is controllable with the keyboard');
        explainTest('The down arrow selected the next option');
        await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
        option = await reader.getActiveDescendant(fromlist);
        activeName = reader.getAccessibleName(option);
        expectedName = reader.getAccessibleName(options[1]);
        expect(activeName).to.be(expectedName);
        explainTest('The up arrow selected the previous option');
        await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
        option = await reader.getActiveDescendant(fromlist);
        activeName = reader.getAccessibleName(option);
        expectedName = reader.getAccessibleName(options[0]);
        expect(activeName).to.be(expectedName);
        explainTest('The end key selected last option');
        await reader.sendSpecialKey(reader.specialKeys.END);
        option = await reader.getActiveDescendant(fromlist);
        activeName = reader.getAccessibleName(option);
        expectedName = reader.getAccessibleName(options[options.length - 1]);
        expect(activeName).to.be(expectedName);
        explainTest('The home key selected first option');
        await reader.sendSpecialKey(reader.specialKeys.HOME);
        option = await reader.getActiveDescendant(fromlist);
        activeName = reader.getAccessibleName(option);
        expectedName = reader.getAccessibleName(options[0]);
        expect(activeName).to.be(expectedName);

        options = await reader.findAll(tolist, 'listBoxOption');
        tocount = options.length;
        await reader.doDefault(moveto);
        await reader.waitForInteraction(true);
        explainTest('The first option was moved');
        options = await reader.findAll(fromlist, 'listBoxOption');
        expect(options.length).to.be(fromcount - 1);
        options = await reader.findAll(tolist, 'listBoxOption');
        expect(options.length).to.be(tocount + 1);
        explainTest('The first option was moved back');
        await reader.doDefault(movefrom);
        await reader.waitForInteraction(true);
        options = await reader.findAll(fromlist, 'listBoxOption');
        expect(options.length).to.be(fromcount);
        options = await reader.findAll(tolist, 'listBoxOption');
        expect(options.length).to.be(tocount);
        
        return true;
    };

    /**
     * Check accessibility for a collapsible list box.
     *
     * @method validateCollapsibleListBox
     * @param {NodeWrapper} The node that represents the element.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateCollapsibleListBox = async function(wrapper) {
        let options, i, option, activeName, expectedName, hasPopup, expanded, listBox;

        explainTest('The listbox is labelled');
        expect(reader.getAccessibleName(wrapper)).to.not.be('');
        explainTest('The listbox is visible');
        expect(reader.isVisible(wrapper)).to.be(true);
        explainTest('The element has the correct role (popUpButton)');
        expect(reader.getRole(wrapper)).to.be("popUpButton");
        hasPopup = await reader.getAttributeValue(wrapper, 'aria-haspopup');
        expect(hasPopup).to.be("listbox");
        await reader.doDefault(wrapper);
        expanded = await reader.getAttributeValue(wrapper, 'aria-expanded');
        expect(expanded).to.be("true");

        listBox = await reader.findInPage('listBox', '');

        explainTest('The listBox has options');
        options = await reader.findAll(listBox, 'listBoxOption');
        expect(options).not.to.be.empty();

        for (i = 0; i < options.length; i++) {
            option = options[i];
            expect(reader.getAccessibleName(option)).to.not.be('');
            expect(reader.isVisible(option)).to.be(true);
            expect(reader.isFocusable(option)).to.be(true);
        }
        explainTest('The listbox is controllable with the keyboard');
        explainTest('The down arrow selected the next option');
        await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
        option = await reader.getActiveDescendant(listBox);
        activeName = reader.getAccessibleName(option);
        expectedName = reader.getAccessibleName(options[1]);
        expect(activeName).to.be(expectedName);
        explainTest('The up arrow selected the previous option');
        await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
        option = await reader.getActiveDescendant(listBox);
        activeName = reader.getAccessibleName(option);
        expectedName = reader.getAccessibleName(options[0]);
        expect(activeName).to.be(expectedName);
        explainTest('The end key selected last option');
        await reader.sendSpecialKey(reader.specialKeys.END);
        option = await reader.getActiveDescendant(listBox);
        activeName = reader.getAccessibleName(option);
        expectedName = reader.getAccessibleName(options[options.length - 1]);
        expect(activeName).to.be(expectedName);
        explainTest('The home key selected first option');
        await reader.sendSpecialKey(reader.specialKeys.HOME);
        option = await reader.getActiveDescendant(listBox);
        activeName = reader.getAccessibleName(option);
        expectedName = reader.getAccessibleName(options[0]);
        expect(activeName).to.be(expectedName);

        return true;
    };

    /**
     * Check accessibility for a scrollable list box.
     *
     * @method validateScrollableListBox
     * @param {NodeWrapper} The node that represents the element.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateScrollableListBox = async function(wrapper) {
        let options, i, option, activeName, expectedName;

        explainTest('The listbox is labelled');
        expect(reader.getAccessibleName(wrapper)).to.not.be('');
        explainTest('The listbox is visible');
        expect(reader.isVisible(wrapper)).to.be(true);
        explainTest('The element has the correct role (listBox)');
        expect(reader.getRole(wrapper)).to.be("listBox");

        explainTest('The listBox has options');
        options = await reader.findAll(wrapper, 'listBoxOption');
        expect(options).not.to.be.empty();

        for (i = 0; i < options.length; i++) {
            option = options[i];
            expect(reader.getAccessibleName(option)).to.not.be('');
            expect(reader.isVisible(option)).to.be(true);
            expect(reader.isFocusable(option)).to.be(true);
        }
        explainTest('The listbox is controllable with the keyboard');
        await reader.focus(wrapper);
        explainTest('The down arrow selected the next option');
        await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
        option = await reader.getActiveDescendant(wrapper);
        activeName = reader.getAccessibleName(option);
        expectedName = reader.getAccessibleName(options[1]);
        expect(activeName).to.be(expectedName);
        explainTest('The up arrow selected the previous option');
        await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
        option = await reader.getActiveDescendant(wrapper);
        activeName = reader.getAccessibleName(option);
        expectedName = reader.getAccessibleName(options[0]);
        expect(activeName).to.be(expectedName);
        explainTest('The end key selected last option');
        await reader.sendSpecialKey(reader.specialKeys.END);
        option = await reader.getActiveDescendant(wrapper);
        activeName = reader.getAccessibleName(option);
        expectedName = reader.getAccessibleName(options[options.length - 1]);
        expect(activeName).to.be(expectedName);
        explainTest('The home key selected first option');
        await reader.sendSpecialKey(reader.specialKeys.HOME);
        option = await reader.getActiveDescendant(wrapper);
        activeName = reader.getAccessibleName(option);
        expectedName = reader.getAccessibleName(options[0]);
        expect(activeName).to.be(expectedName);

        return true;
    };

    /**
     * Check accesibility for a disclosure.
     *
     * @method validateDisclosure
     * @param {NodeWrapper} The node that represents the trigger.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateDisclosure = async function(wrapper) {
        let ariaExpanded;

        explainTest('The button is labelled');
        expect(reader.getAccessibleName(wrapper)).to.not.be('');
        explainTest('The button is visible');
        expect(reader.isVisible(wrapper)).to.be(true);
        explainTest('The element has the correct role (button)');
        expect(reader.getRole(wrapper)).to.be("button");

        ariaExpanded = await reader.getAttributeValue(wrapper, 'aria-expanded');

        explainTest('The disclosure is initially closed');
        expect(ariaExpanded).to.be('false');
        await reader.doDefault(wrapper);

        ariaExpanded = await reader.getAttributeValue(wrapper, 'aria-expanded');
        explainTest('The disclosure is now open');
        expect(ariaExpanded).to.be('true');

        controls = reader.getControls(wrapper);
        explainTest('The element controls a list of fields');
        expect(controls).not.to.be.empty();
        expect(reader.isVisible(controls[0])).to.be(true);
        await reader.doDefault(wrapper);
        ariaExpanded = await reader.getAttributeValue(wrapper, 'aria-expanded');
        explainTest('The disclosure is now closed');
        expect(ariaExpanded).to.be('false');
        
        return true;
    };

    /**
     * Check the accessibility of the link.
     *
     * @method validateLink
     * @param {NodeWrapper} The node that we are testing.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateLink = async function(wrapper) {
        let articles, i, article, size, position, firstIndex, secondIndex;

        explainTest('The link is visible');
        expect(reader.isVisible(wrapper)).to.be(true);
        explainTest('The element has the correct role (link)');
        expect(reader.getRole(wrapper)).to.be("link");
        explainTest('The link is focusable');
        expect(reader.isFocusable(wrapper)).to.be(true);
        explainTest('The link is labelled');
        expect(reader.getAccessibleName(wrapper)).to.not.be('');
    };

    /**
     * Check the accessibility of the feed.
     *
     * @method validateFeed
     * @param {NodeWrapper} The node that we are testing.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateFeed = async function(wrapper) {
        let articles, i, article, size, position, firstIndex, secondIndex;

        explainTest('The feed is visible');
        expect(reader.isVisible(wrapper)).to.be(true);
        explainTest('The element has the correct role (feed)');
        expect(reader.getRole(wrapper)).to.be("feed");
        await reader.waitForInteraction(true);

        explainTest('The feed contains a list of articles');
        articles = await reader.findAll(wrapper, 'article');
        expect(articles).not.to.be.empty();

        for (i = 0; i < articles.length; i++) {
            article = articles[i];
            explainTest('The article is labelled');
            expect(reader.getAccessibleName(article)).to.not.be('');
            explainTest('The article is focusable');
            expect(reader.isFocusable(article)).to.be(true);
            size = await reader.getAttributeValue(article, 'aria-setsize');
            position = await reader.getAttributeValue(article, 'aria-posinset');
            
            explainTest('The article is numbered correctly in the list');
            expect(position).to.be('' + (i + 1));
            explainTest('The list has the correct number of elements');
            expect(size).to.be('' + articles.length);
        }

        explainTest('The feed supports keyboard navigation');
        articles = await reader.findAll(wrapper, 'article');
        if (articles.length > 1) {
            explainTest('Move focus to the first article');
            await reader.focus(articles[0]);
            await reader.waitForInteraction(true);
            expect(reader.isFocused(articles[0])).to.be(true);
            
            explainTest('Move focus to the second article');
            await reader.sendSpecialKey(reader.specialKeys.PAGE_DOWN);
            await reader.waitForInteraction(true);
            expect(reader.isFocused(articles[1])).to.be(true);

            explainTest('Move focus back to the first article');
            await reader.sendSpecialKey(reader.specialKeys.PAGE_UP);
            await reader.waitForInteraction(true);
            expect(reader.isFocused(articles[0])).to.be(true);
        }

        return true;
    };

    /**
     * Check accesibility for a mixed checkbox controling a list of single checkboxes.
     *
     * @method validateMixedCheckbox
     * @param {NodeWrapper} The node that represents the mixed state checkbox.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateMixedCheckbox = async function(wrapper) {
        let controls, allChecked, i, checked;

        explainTest('The checkbox is labelled');
        expect(reader.getAccessibleName(wrapper)).to.not.be('');
        explainTest('The checkbox is visible');
        expect(reader.isVisible(wrapper)).to.be(true);
        explainTest('The element has the correct role (checkBox)');
        expect(reader.getRole(wrapper)).to.be("checkBox");

        controls = reader.getControls(wrapper);
        explainTest('The element controls a list of fields');
        expect(controls).not.to.be.empty();

        // Check the group.
        explainTest('Changing the group affects each item in the list');
        allChecked = await reader.getChecked(wrapper);
        if (allChecked != 'true') {
            await reader.doDefault(wrapper);
        }
        allChecked = await reader.getChecked(wrapper);
        expect(allChecked).to.be('true');

        for (i = 0; i < controls.length; i++) {
            checked = await reader.getChecked(controls[i]);
            expect(checked).to.be('true');
        }
        await reader.focus(wrapper);
        await reader.sendSpecialKey(reader.specialKeys.SPACEBAR);
        allChecked = await reader.getChecked(wrapper);
        expect(allChecked).to.be('false');

        for (i = 0; i < controls.length; i++) {
            checked = await reader.getChecked(controls[i]);
            expect(checked).to.be('false');
        }
        explainTest('Changing one item in the group sets the group to a mixed state');
        await reader.doDefault(controls[0]);
        checked = await reader.getChecked(controls[0]);
        expect(checked).to.be('true');
        allChecked = await reader.getChecked(wrapper);
        expect(allChecked).to.be('mixed');

        explainTest('Spacebar on the group cycles between true, false and mixed states');

        await reader.focus(wrapper);
        await reader.sendSpecialKey(reader.specialKeys.SPACEBAR);
        await reader.waitForInteraction();
        allChecked = await reader.getChecked(wrapper);
        expect(allChecked).to.be('true');

        await reader.focus(wrapper);
        await reader.sendSpecialKey(reader.specialKeys.SPACEBAR);
        await reader.waitForInteraction();
        allChecked = await reader.getChecked(wrapper);
        expect(allChecked).to.be('false');

        await reader.focus(wrapper);
        await reader.sendSpecialKey(reader.specialKeys.SPACEBAR);
        await reader.waitForInteraction();
        allChecked = await reader.getChecked(wrapper);
        expect(allChecked).to.be('mixed');

        explainTest('When mixed state is restored, the checked state of the items matches the last mixed state');

        checked = await reader.getChecked(controls[0]);
        expect(checked).to.be('true');
        return true;
    };
    /**
     * Check labels attributes for a checkbox.
     *
     * @method validateCheckbox
     * @param {NodeWrapper} The node that represents the checkbox.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateCheckbox = async function(wrapper) {
        let checked = false,
            toggleChecked = false;

        explainTest('The checkbox is labelled');
        expect(reader.getAccessibleName(wrapper)).to.not.be('');
        explainTest('The checkbox is visible');
        expect(reader.isVisible(wrapper)).to.be(true);

        explainTest('The element has the correct role (checkBox)');
        expect(reader.getRole(wrapper)).to.be("checkBox");

        explainTest('The checkbox can be focused');
        expect(reader.isFocusable(wrapper)).to.be(true);

        explainTest('The checkbox can be toggled');
        checked = await reader.getAttributeValue(wrapper, 'aria-checked');
        await reader.doDefault(wrapper);
        toggleChecked = await reader.getAttributeValue(wrapper, 'aria-checked');
        expect(checked).not.to.be(toggleChecked);

        explainTest('The checkbox can be toggled back');
        await reader.doDefault(wrapper);
        toggleChecked = await reader.getAttributeValue(wrapper, 'aria-checked');
        expect(checked).to.be(toggleChecked);

        return true;
    };

    /**
     * Check labels attributes for a button.
     *
     * @method validateButton
     * @param {NodeWrapper} The node that represents the button.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateButton = async function(wrapper) {
        explainTest('The button is visible');
        expect(reader.isVisible(wrapper)).to.be(true);
        explainTest('The button has the correct role (button)');
        expect(reader.getRole(wrapper)).to.be("button");
        explainTest('The button can be focused');
        expect(reader.isFocusable(wrapper)).to.be(true);
        return true;
    };

    /**
     * Check labels attributes for a toggle button.
     *
     * @method validateToggleButton
     * @param {NodeWrapper} The node that represents the button.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateToggleButton = async function(wrapper) {
        let pressed = false, togglePressed = false;

        explainTest('The button is visible');
        expect(reader.isVisible(wrapper)).to.be(true);
        explainTest('The button has the correct role (toggleButton)');
        expect(reader.getRole(wrapper)).to.be("toggleButton");
        explainTest('The button can be focused');
        expect(reader.isFocusable(wrapper)).to.be(true);
        explainTest('The button can be toggled');
        pressed = await reader.getAttributeValue(wrapper, 'aria-pressed');
        await reader.doDefault(wrapper);
        togglePressed = await reader.getAttributeValue(wrapper, 'aria-pressed');
        expect(pressed).not.to.be(togglePressed);
        explainTest('The button can be toggled back');
        await reader.doDefault(wrapper);
        togglePressed = await reader.getAttributeValue(wrapper, 'aria-pressed');
        expect(pressed).to.be(togglePressed);

        return true;
    };

    /**
     * Check labels and keyboard navigation for a menu of links.
     * Throws an error if the validation fails.
     *
     * @method validateMenuButtonLinks
     * @param {String} role The expected role of the menu button to validate.
     * @param {String} label The expected label text of the menu button to validate.
     * @param {Boolean} search Check searching of menu entries.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateMenuButtonLinks = async function(role, label, search = false) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/menu-button/menu-button-links.html
        let menuButton,
            ariaExpanded,
            menu,
            menuItems,
            i,
            done,
            menuSize,
            searchMenuItemLabel;

        menuButton = await reader.findInPage(role, label);

        explainTest('The menu button can be found with role: "' + role + '" and label: "' + label + '"');
        expect(reader.isEmpty(menuButton)).to.be(false);

        await reader.focus(menuButton);

        // Check the menu is closed until we act on the button.
        ariaExpanded = await reader.getAttributeValue(menuButton, 'aria-expanded');

        explainTest('The menu is initially closed');
        expect(ariaExpanded).to.be('false');

        // First we will action the button
        await reader.doDefault(menuButton);

        // Now the menu should be expanded.
        ariaExpanded = reader.getAttributeValue(menuButton, 'aria-expanded');
        explainTest('The menu is expanded when the button is actioned');
        expect(ariaExpanded).to.be('true');
        
        // The menu should now be findable from aria-controls.
        menu = reader.getSingleControl(menuButton);

        // The role of the menu should be "menu"
        explainTest('The menu is visible');
        expect(reader.isVisible(menu)).to.be(true);
        explainTest('The menu has the correct role (menu)');
        expect(reader.getRole(menu)).to.be("menu");

        menuItems = await reader.getChildren(menu, 'menuItem');

        explainTest('The menu has menu entries');
        expect(menuItems.length).not.to.be(0);
        explainTest('The menu entries have unique labels');
        await reader.expectUniqueLabels(menuItems);
        menuSize = menuItems.length;

        // Use the down arrow key to navigate through all the menu items.
        for (i = 0; i < menuItems.length - 1; i++) {
            explainTest('The currently selected menu item is ' + i);
            expect(await reader.getSelectedMenuIndex(menu)).to.be(i);
            done = reader.waitForFocusChange(menu);
            await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
            await done;
            explainTest('After the down key, the currently selected menu item is ' + (i + 1));
            expect(await reader.getSelectedMenuIndex(menu)).to.be(i + 1);
        }
        // Press the up arrow to move back.
        for (i = menuItems.length - 1; i > 0; i--) {
            explainTest('The currently selected menu item is ' + i);
            expect(await reader.getSelectedMenuIndex(menu)).to.be(i);
            done = reader.waitForFocusChange(menu);
            await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
            await done;
            explainTest('After the up key, the currently selected menu item is ' + (i - 1));
            expect(await reader.getSelectedMenuIndex(menu)).to.be(i - 1);
        }
        // Check that now up and down wrap around the menu.
        done = reader.waitForFocusChange(menu);
        await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
        await done;
        await reader.pause(3000);
        menu = reader.getSingleControl(menuButton);
        explainTest('After the up key, the selected menu item is the last one');
        expect(await reader.getSelectedMenuIndex(menu)).to.be(menuSize - 1);

        done = reader.waitForFocusChange(menu);
        await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
        await done;
        menu = reader.getSingleControl(menuButton);
        explainTest('After the down key, the selected menu item is the first one');
        expect(await reader.getSelectedMenuIndex(menu)).to.be(0);
        
        // Check that Home and End keys go to start and end.
        done = reader.waitForFocusChange(menu);
        await reader.sendSpecialKey(reader.specialKeys.END);
        await done;
        menu = reader.getSingleControl(menuButton);
        explainTest('After the end key, the selected menu item is the last one');
        expect(await reader.getSelectedMenuIndex(menu)).to.be(menuSize - 1);

        done = reader.waitForFocusChange(menu);
        await reader.sendSpecialKey(reader.specialKeys.HOME);
        await done;
        menu = reader.getSingleControl(menuButton);
        explainTest('After the home key, the selected menu item is the first one');
        expect(await reader.getSelectedMenuIndex(menu)).to.be(0);

        // Escape key should close the menu.
        done = reader.waitForNodeCollapsed(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;

        // Space should open the menu.
        done = reader.waitForNodeExpanded(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.SPACEBAR);
        await done;
        menu = reader.getSingleControl(menuButton);
        explainTest('After the space key, the menu is visible');
        expect(reader.isVisible(menu)).to.be(true);

        // Escape key should close the menu.
        done = reader.waitForNodeCollapsed(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;

        // Enter should open the menu.
        done = reader.waitForNodeExpanded(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ENTER);
        await done;
        menu = reader.getSingleControl(menuButton);
        explainTest('After the enter key, the menu is visible');
        expect(reader.isVisible(menu)).to.be(true);

        // Escape key should close the menu.
        done = reader.waitForNodeCollapsed(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;

        // Down arrow should open the menu.
        done = reader.waitForNodeExpanded(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
        await done;
        menu = reader.getSingleControl(menuButton);
        explainTest('After the down key, the menu is visible');
        expect(reader.isVisible(menu)).to.be(true);

        // Escape key should close the menu.
        done = reader.waitForNodeCollapsed(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;

        // Escape key again should not open the menu again.
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;
        await reader.waitForInteraction();
        ariaExpanded = await reader.getAttributeValue(menuButton, 'aria-expanded');

        explainTest('The menu is still closed after escape key was pressed twice');
        expect(ariaExpanded).to.be('false');

        // Up arrow should open the menu and select the last item..
        done = reader.waitForNodeExpanded(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
        await done;
        menu = reader.getSingleControl(menuButton);
        explainTest('After the up key, the menu is visible');
        expect(reader.isVisible(menu)).to.be(true);

        explainTest('After the up key, the selected menu item is the last one');
        expect(await reader.getSelectedMenuIndex(menu)).to.be(menuSize - 1);

        if (search) {
            menuItems = await reader.getChildren(menu, 'menuItem');
            searchMenuItemLabel = reader.getAccessibleName(menuItems[0]);
            done = reader.waitForFocusChange(menu);
            await reader.sendKey(searchMenuItemLabel[0]);
            await done;
            // Delay for focus stuff.
            await reader.waitForInteraction();

            explainTest('After searching, the selected menu item is the first menu item');
            expect(await reader.getSelectedMenuIndex(menu)).to.be(0);

            if (menuItems.length > 1) {
                searchMenuItemLabel = reader.getAccessibleName(menuItems[1]);
                done = reader.waitForFocusChange(menu);
                await reader.sendKey(searchMenuItemLabel[0]);
                await done;
                // Delay for focus stuff.
                await reader.waitForInteraction();

                explainTest('After searching, the selected menu item is the second menu item');
                expect(await reader.getSelectedMenuIndex(menu)).to.be(1);
            }
        }

        // Finish with a closed menu.
        done = reader.waitForNodeCollapsed(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;

        return true;
    };

    /**
     * Check labels and accessibility of links displayed in a breadcrumb trail of links.
     * Throws an error if the validation fails.
     *
     * @method validateBreadcrumb
     * @param {String} label The expected label text of the breadcrumb to validate.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateBreadcrumb = async function(label) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/breadcrumb/index.html
        let navigation,
            list,
            listItems,
            listItem,
            navLink,
            currentCount = 0,
            lastCurrent = false,
            ariaCurrent,
            pageUrl,
            samePageUrl,
            links = [];

        navigation = await reader.findInPage("navigation", label);

        // We should have found the navigation node.
        explainTest('The breadcrumbs can be found with role: "navigation" and label: "' + label + '"');
        expect(reader.isEmpty(navigation)).to.be(false);

        // We should have an ordered list.
        list = await reader.getChild(navigation, 'list');
        explainTest('The breadcrumbs contain a list');
        expect(reader.isEmpty(list)).to.be(false);

        listItems = await reader.getChildren(list, 'listItem');

        // Verify we have some entries in the list.
        explainTest('The list of breadcrumbs is not empty');
        expect(listItems).not.to.be.empty();
        // Get the url of the current page.
        pageUrl = await reader.getPageUrl();

        // For each entry in the list.
        for (i = 0; i < listItems.length; i++) {
            listItem = listItems[i];
            // See if it contains a link.
            navLink = await reader.find(listItem, 'link');
            if (navLink) {
                links.push(navLink);
                // See if it the current page.
                ariaCurrent = reader.getAttributeValue(navLink, 'aria-current');
                if (ariaCurrent == 'page') {
                    currentCount += 1;
                    lastCurrent = true;
                } else {
                    lastCurrent = false;
                }
            } else {
                lastCurrent = false;
            }
        }
        explainTest('Each breadcrumb has a unique label');
        await reader.expectUniqueLabels(links);

        // Verify only the last link in the breadcrumbs was marked as the current page.
        explainTest('The last link in the breadcrumbs has represents the current page');
        expect(lastCurrent).to.be(true);
        // Verify there was only one current page in the breadcrumbs.
        explainTest('There was only one current page in the list of breadcrumbs');
        expect(currentCount).to.be(1);

        // Follow the last link.
        await reader.doDefault(navLink);

        // Get the new page Url and verify it is the same page we were already on.
        samePageUrl = await reader.getPageUrl();
        explainTest('Following the last link in the breadcrumbs led to the same page');
        expect(pageUrl).to.be(samePageUrl);

        return true;
    };

    /**
     * Check a modal dialog opened from a button.
     *
     * @method validateModalDialog
     * @param {String} triggerLabel The name of the button to open the dialog
     * @param {String} cancelLabel The name of the button to cancel the dialog
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateModalDialog = async function(triggerLabel, cancelLabel) {
        let trigger, done, modal, cancel;

        explainTest('Open the dialog');
        trigger = await reader.findInPage('button', triggerLabel);
        done = reader.waitForDialog();
        await reader.doDefault(trigger);
        modal = await done;
        expect(reader.isModal(modal)).to.be(true);
        expect(reader.getAccessibleName(modal)).to.not.be('');

        explainTest('Close it with the cancel button');
        done = reader.waitForHideDialog();
        cancel = await reader.find(modal, 'button', cancelLabel);
        await reader.doDefault(cancel);
        await done;

        explainTest('Open it again');
        trigger = await reader.findInPage('button', triggerLabel);
        done = reader.waitForDialog();
        await reader.doDefault(trigger);
        modal = await done;
        expect(reader.isModal(modal)).to.be(true);
        expect(reader.getAccessibleName(modal)).to.not.be('');

        explainTest('Close it with the escape key');
        cancel = await reader.find(modal, 'button', cancelLabel);

        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);

        explainTest('Dialog should not be visible');
        modal = await reader.findInPage('dialog', '');
        if (!reader.isEmpty(modal)) {
            expect(reader.isVisible(modal)).to.be(false);
        }

    };

    /**
     * Check an alert dialog opened from a button.
     *
     * @method validateAlertDialog
     * @param {String} triggerLabel The name of the button to open the dialog
     * @param {String} cancelLabel The name of the button to cancel the dialog
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateAlertDialog = async function(triggerLabel, cancelLabel) {
        let trigger, done, modal, cancel;

        explainTest('Open the dialog');
        trigger = await reader.findInPage('button', triggerLabel);
        done = reader.waitForAlertDialog();
        await reader.doDefault(trigger);
        modal = await done;
        expect(reader.isModal(modal)).to.be(true);
        expect(reader.getAccessibleName(modal)).to.not.be('');

        explainTest('Close it with the cancel button');
        done = reader.waitForHideAlertDialog();
        cancel = await reader.find(modal, 'button', cancelLabel);
        await reader.doDefault(cancel);
        await done;

        explainTest('Open it again');
        trigger = await reader.findInPage('button', triggerLabel);
        done = reader.waitForAlertDialog();
        await reader.doDefault(trigger);
        modal = await done;
        expect(reader.isModal(modal)).to.be(true);
        expect(reader.getAccessibleName(modal)).to.not.be('');

        explainTest('Close it with the escape key');
        cancel = await reader.find(modal, 'button', cancelLabel);

        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);

        explainTest('Dialog should not be visible');
        modal = await reader.findInPage('alertdialog', '');
        if (!reader.isEmpty(modal)) {
            expect(reader.isVisible(modal)).to.be(false);
        }
    };

    /**
     * Check labels and accessibility of list of expandable regions.
     *
     * @method validateAccordion
     * @param {NodeWrapper} The node that represents the title of the accordion.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateAccordion = async function(wrapper) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/accordion/accordion.html
        let first,
            last,
            next,
            region,
            button,
            all = [];

        first = reader.next(wrapper, "heading", "");
        explainTest('The accordion has at least one expandable region');
        expect(reader.isEmpty(first)).to.be(false);
        last = first;
        all.push(first);

        next = reader.next(last, "heading", "");
        while (!reader.isEmpty(next)) {
            last = next;
            all.push(next);
            next = reader.next(next, "heading", "");
        }

        await reader.expectUniqueLabels(all);

        // Expand the first section.
        button = reader.next(first, "button", "");
        reader.focus(button);
        explainTest('The accordion heading has a button');
        expect(reader.isEmpty(button)).to.be(false);

        if (!reader.isExpanded(button)) {
            explainTest('We can expand the first region');
            done = reader.waitForNodeExpanded(button);
            await reader.sendSpecialKey(reader.specialKeys.ENTER);
            await done;
        }

        region = reader.getSingleControl(button);
        explainTest('The first button controls a visible region');
        expect(reader.isVisible(region)).to.be(true);
        
        next = reader.next(first, "heading", "");
        while (!reader.isEmpty(next)) {
            // Down moves to the next header.
            await reader.waitForInteraction();
            await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
            button = reader.next(next, "button", "");

            explainTest('The accordion heading has a button');
            expect(reader.isEmpty(button)).to.be(false);

            explainTest('The next region is not expanded');
            expect(reader.isExpanded(button)).to.be(false);

            explainTest('Space expands the region');
            await reader.waitForInteraction();
            reader.focus(button);
            done = reader.waitForNodeExpanded(button);
            await reader.doDefault(button);
            await done;

            explainTest('The button is now expanded');
            expect(reader.isExpanded(button)).to.be(true);
            expect(reader.getAttributeValue(button, 'aria-disabled')).to.be('true');
            region = reader.getSingleControl(button);
            explainTest('The button controls a visible region');
            expect(reader.isVisible(region)).to.be(true);
            explainTest('The region has a label');
            expect(reader.getAccessibleName(region)).not.to.be('');

            next = reader.next(next, "heading", "");
        }
        
        explainTest('The home key focuses on the first entry');
        done = reader.waitForFocusChange(first);
        await reader.sendSpecialKey(reader.specialKeys.HOME);
        await done;
        
        explainTest('The end key focuses on the first entry');
        done = reader.waitForFocusChange(last);
        await reader.sendSpecialKey(reader.specialKeys.END);
        await done;
    };

    // Export this class.
    window.WAI = WAI;
}());

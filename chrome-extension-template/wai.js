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

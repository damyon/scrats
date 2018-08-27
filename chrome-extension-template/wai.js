(function() {
    /**
     * WAI is the namespace for the functions returned by this module.
     */
    var WAI = function() {
    };

    /**
     * Check labels and keyboard navigation for a menu of links.
     * Throws an error if the validation fails.
     *
     * @method validateMenuButtonLinks
     * @param {String} role The expected role of the menu button to validate.
     * @param {String} label The expected label text of the menu button to validate.
     * @return {Boolean} true on success.
     */
    WAI.prototype.validateMenuButtonLinks = async function(role, label) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/menu-button/menu-button-links.html
        var menuButton,
            ariaExpanded,
            menu,
            menuItems,
            i,
            done,
            menuSize;

        menuButton = await reader.findInPage(role, label);

        await reader.focus(menuButton);

        // Check the menu is closed until we act on the button.
        ariaExpanded = await reader.getAttributeValue(menuButton, 'aria-expanded');
        expect(ariaExpanded).to.be(false);

        // First we will action the button
        await reader.doDefault(menuButton);

        // Now the menu should be expanded.
        ariaExpanded = reader.getAttributeValue(menuButton, 'aria-expanded');
        expect(ariaExpanded).to.be('true');
        
        // The menu should now be findable from aria-controls.
        menu = reader.getSingleControl(menuButton);

        // The role of the menu should be "menu"
        expect(reader.isVisible(menu)).to.be(true);
        expect(reader.getRole(menu)).to.be("menu");

        menuItems = await reader.getChildren(menu, 'menuItem');

        expect(menuItems.length).not.to.be(0);
        menuSize = menuItems.length;

        // Use the down arrow key to navigate through all the menu items.
        for (i = 0; i < menuItems.length - 1; i++) {
            expect(await reader.getSelectedMenuIndex(menu)).to.be(i);
            done = reader.startListening(menu, chrome.automation.EventType.FOCUS);
            await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
            await done;
            expect(await reader.getSelectedMenuIndex(menu)).to.be(i + 1);
        }
        // Press the up arrow to move back.
        for (i = menuItems.length - 1; i > 0; i--) {
            expect(await reader.getSelectedMenuIndex(menu)).to.be(i);
            done = reader.startListening(menu, chrome.automation.EventType.FOCUS);
            await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
            await done;
            expect(await reader.getSelectedMenuIndex(menu)).to.be(i - 1);
        }
        // Check that now up and down wrap around the menu.
        done = reader.startListening(menu, chrome.automation.EventType.FOCUS);
        await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
        await done;
        menu = reader.getSingleControl(menuButton);
        expect(await reader.getSelectedMenuIndex(menu)).to.be(menuSize - 1);

        done = reader.startListening(menu, chrome.automation.EventType.FOCUS);
        await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
        await done;
        menu = reader.getSingleControl(menuButton);
        expect(await reader.getSelectedMenuIndex(menu)).to.be(0);
        
        // Check that Home and End keys go to start and end.
        done = reader.startListening(menu, chrome.automation.EventType.FOCUS);
        await reader.sendSpecialKey(reader.specialKeys.END);
        await done;
        menu = reader.getSingleControl(menuButton);
        expect(await reader.getSelectedMenuIndex(menu)).to.be(menuSize - 1);

        done = reader.startListening(menu, chrome.automation.EventType.FOCUS);
        await reader.sendSpecialKey(reader.specialKeys.HOME);
        await done;
        menu = reader.getSingleControl(menuButton);
        expect(await reader.getSelectedMenuIndex(menu)).to.be(0);

        // Escape key should close the menu.
        done = reader.listenForMenuClosed(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;

        // Space should open the menu.
        done = reader.listenForMenuOpened(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.SPACEBAR);
        await done;
        menu = reader.getSingleControl(menuButton);
        expect(reader.isVisible(menu)).to.be(true);

        // Escape key should close the menu.
        done = reader.listenForMenuClosed(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;

        // Enter should open the menu.
        done = reader.listenForMenuOpened(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ENTER);
        await done;

        // Escape key should close the menu.
        done = reader.listenForMenuClosed(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;

        // Down arrow should open the menu.
        done = reader.listenForMenuOpened(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
        await done;
        // Escape key should close the menu.
        done = reader.listenForMenuClosed(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;

        // Up arrow should open the menu and select the last item..
        done = reader.listenForMenuOpened(menuButton);
        await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
        await done;

        menu = reader.getSingleControl(menuButton);
        expect(await reader.getSelectedMenuIndex(menu)).to.be(menuSize - 1);
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
        var navigation,
            list,
            listItems,
            listItem,
            navLink,
            currentCount = 0,
            lastCurrent = false,
            ariaCurrent,
            pageUrl,
            samePageUrl;

        navigation = await reader.findInPage("navigation", label);

        // We should have found the navigation node.
        expect(reader.isEmpty(navigation)).to.be(false);

        // We should have an ordered list.
        list = await reader.getChild(navigation, 'list');
        expect(reader.isEmpty(list)).to.be(false);

        listItems = await reader.getChildren(list, 'listItem');

        // Verify we have some entries in the list.
        expect(listItems.length).not.to.be(0);

        // Get the url of the current page.
        pageUrl = await reader.getPageUrl();

        // For each entry in the list.
        for (i = 0; i < listItems.length; i++) {
            listItem = listItems[i];
            // See if it contains a link.
            navLink = await reader.find(listItem, 'link');
            if (navLink) {
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
        // Verify only the last link in the breadcrumbs was marked as the current page.
        expect(lastCurrent).to.be(true);
        // Verify there was only one current page in the breadcrumbs.
        expect(currentCount).to.be(1);

        // Follow the last link.
        await reader.doDefault(navLink);

        // Get the new page Url and verify it is the same page we were already on.
        samePageUrl = await reader.getPageUrl();
        expect(pageUrl).to.be(samePageUrl);

        return true;
    };

    // Export this class.
    window.WAI = WAI;
}());

(function() {
    var WAI = function() {
    };

    var selectedMenuItemIndex = function(menuItems) {
        var i = 0, selectedIndex = -1;

        for (i = 0; i < menuItems.length; i++) {
            menuItem = menuItems[i];
            expect(reader.getRole(menuItem)).to.be("menuItem");
            expect(reader.getAccessibleName(menuItem)).not.to.be('');
            expect(reader.isFocusable(menuItem)).to.be(true);
            if (reader.isFocused(menuItem)) {
                selectedIndex = i;
            }
        }
        return selectedIndex;
    };

    WAI.prototype.validateMenuButtonLinks = async function(role, label) {
        // Example
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/menu-button/menu-button-links.html
        var menuButton,
            ariaExpanded,
            controlledList,
            menu,
            menuItems,
            i,
            done;

        menuButton = await reader.findInPage(role, label);

        await reader.focus(menuButton);

        // Check the menu is closed until we act on the button.
        ariaExpanded = await reader.getAttributeValue(menuButton, 'aria-expanded');
        expect(ariaExpanded).to.be(false);

        // First we will action the button
        await reader.doDefault(menuButton);

        // Now the menu should be expanded.
        ariaExpanded = await reader.getAttributeValue(menuButton, 'aria-expanded');
        expect(ariaExpanded).to.be('true');
        
        // The menu should now be findable from aria-controls.
        controlledList = await reader.getControls(menuButton);

        expect(controlledList.length).to.be(1);

        menu = controlledList.pop();

        // The role of the menu should be "menu"
        expect(reader.isVisible(menu)).to.be(true);
        expect(reader.getRole(menu)).to.be("menu");

        menuItems = await reader.getChildren(menu, 'menuItem');

        expect(menuItems.length).not.to.be(0);

        // Use the down arrow key to navigate through all the menu items.
        for (i = 0; i < menuItems.length - 1; i++) {
            expect(selectedMenuItemIndex(menuItems)).to.be(i);
            done = reader.startListening(menu, "focus");
            await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
            await done;
            expect(selectedMenuItemIndex(menuItems)).to.be(i+1);
        }
        // Press the up arrow to move back.
        for (i = menuItems.length - 1; i > 0; i--) {
            expect(selectedMenuItemIndex(menuItems)).to.be(i);
            done = reader.startListening(menu, "focus");
            await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
            await done;
            expect(selectedMenuItemIndex(menuItems)).to.be(i-1);
        }
        // Check that now up and down wrap around the menu.
        done = reader.startListening(menu, "focus");
        await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
        await done;
        menuItems = await reader.getChildren(menu, 'menuItem');
        expect(selectedMenuItemIndex(menuItems)).to.be(menuItems.length - 1);
        done = reader.startListening(menu, "focus");
        await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
        await done;
        menuItems = await reader.getChildren(menu, 'menuItem');
        expect(selectedMenuItemIndex(menuItems)).to.be(0);
        
        // Check that Home and End keys go to start and end.
        done = reader.startListening(menu, "focus");
        await reader.sendSpecialKey(reader.specialKeys.END);
        await done;
        expect(selectedMenuItemIndex(menuItems)).to.be(menuItems.length - 1);
        done = reader.startListening(menu, "focus");
        await reader.sendSpecialKey(reader.specialKeys.HOME);
        await done;
        menuItems = await reader.getChildren(menu, 'menuItem');
        expect(selectedMenuItemIndex(menuItems)).to.be(0);

        // Escape key should close the menu.
        done = reader.startListening(menu, "ariaAttributeChanged");
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        await done;

        // Check the menu is now closed.
        ariaExpanded = await reader.getAttributeValue(menuButton, 'aria-expanded');
        expect(ariaExpanded).to.be(false);

        // Space should open the menu.
        await reader.sendSpecialKey(reader.specialKeys.SPACEBAR);
        ariaExpanded = await reader.getAttributeValue(menuButton, 'aria-expanded');
        expect(ariaExpanded).to.be('true');
        expect(reader.isVisible(menu)).to.be(true);

        // Escape key should close the menu.
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        ariaExpanded = await reader.getAttributeValue(menuButton, 'aria-expanded');
        expect(ariaExpanded).to.be(false);
        // Enter should open the menu.
        await reader.sendSpecialKey(reader.specialKeys.ENTER);
        ariaExpanded = await reader.getAttributeValue(menuButton, 'aria-expanded');
        expect(ariaExpanded).to.be('true');
        // Escape key should close the menu.
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        ariaExpanded = await reader.getAttributeValue(menuButton, 'aria-expanded');
        expect(ariaExpanded).to.be(false);
        // Down arrow should open the menu.
        await reader.sendSpecialKey(reader.specialKeys.DOWN_ARROW);
        ariaExpanded = await reader.getAttributeValue(menuButton, 'aria-expanded');
        expect(ariaExpanded).to.be('true');
        // Escape key should close the menu.
        await reader.sendSpecialKey(reader.specialKeys.ESCAPE);
        ariaExpanded = await reader.getAttributeValue(menuButton, 'aria-expanded');
        expect(ariaExpanded).to.be(false);
        // Up arrow should open the menu and select the last item..
        await reader.sendSpecialKey(reader.specialKeys.UP_ARROW);
        ariaExpanded = await reader.getAttributeValue(menuButton, 'aria-expanded');
        expect(ariaExpanded).to.be('true');
        menuItems = await reader.getChildren(menu, 'menuItem');
        expect(selectedMenuItemIndex(menuItems)).to.be(menuItems.length - 1);
    };

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
                ariaCurrent = await reader.getAttributeValue(navLink, 'aria-current');
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

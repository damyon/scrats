describe('The Wooden Box Factory', function() {
  describe('Navigation tests', function() {
    it('We can open and close the navigation menu', async function() {
        this.timeout(20000);
        // Find the navigation region of the page.
        var siteNav = await reader.findInPage({'role' : 'navigation'});
        // Find the open close menu button.
        var menuButton = reader.next(siteNav, {'role' : 'button', 'name' : /Menu/});

        // Ensure the menu is closed.
        expect(reader.isExpanded(menuButton)).to.be(false);
        // Click the menu button.
        await reader.doDefault(menuButton);
        // Ensure the menu is now open.
        expect(reader.isExpanded(menuButton)).to.be(true);

        // Find the first menu item.
        var homeLink = reader.next(siteNav, {'role' : 'link', 'name' : /Home/});
        // Is it visible and focusable?
        expect(reader.isVisible(homeLink)).to.be(true);
        expect(reader.isFocusable(homeLink)).to.be(true);

        // Find the Boxes link.
        var boxesLink = reader.next(siteNav, {'role' : 'link', 'name' : /Boxes/});
        var toggleBoxesLink = reader.next(boxesLink, {'role' : 'link', 'name' : /toggle child menu/});

        // Is it a good link?
        expect(reader.isVisible(toggleBoxesLink)).to.be(true);
        expect(reader.isFocusable(toggleBoxesLink)).to.be(true);
        // Toggle the boxes menu.
        await reader.doDefault(toggleBoxesLink);

        // Now we should find more links.
        var chocolateBoxesLink = reader.next(boxesLink, {'role' : 'link', 'name' : /CHOCOLATE BOXES/});
        console.log("TESTING");
        expect(reader.isVisible(chocolateBoxesLink)).to.be(true);
        expect(reader.isFocusable(chocolateBoxesLink)).to.be(true);

        // Toggle the boxes menu.
        await reader.doDefault(toggleBoxesLink);

        // Click the menu button again.
        await reader.doDefault(menuButton);
        // Verify the menu is closed again.
        expect(reader.isExpanded(menuButton)).to.be(false);
        
        // Verify the home link is no longer available in the page.
        exists = await reader.existsInPage({'role' : 'link', 'name' : /Home/});
        expect(exists).to.be(false);
        return true;
    });
    it('We can follow links in the navigation menu', async function() {
        this.timeout(20000);
        // Find the navigation region of the page.
        var siteNav = await reader.findInPage({'role' : 'navigation'});
        // Find the open close menu button.
        var menuButton = reader.next(siteNav, {'role' : 'button', 'name' : /Menu/});

        // Ensure the menu is closed.
        expect(reader.isExpanded(menuButton)).to.be(false);
        // Click the menu button.
        await reader.doDefault(menuButton);
        // Ensure the menu is now open.
        expect(reader.isExpanded(menuButton)).to.be(true);

        // Find a menu item.
        var link = reader.next(siteNav, {'role' : 'link', 'name' : state.page});
        // Is it visible and focusable?
        await reader.doDefault(link);

        // We should have switched pages now.
        var title = await reader.getPageTitle();

        expect(title).to.be(state.page);

        // Go back to home page.
        siteNav = await reader.findInPage({'role' : 'navigation'});
        menuButton = reader.next(siteNav, {'role' : 'button', 'name' : /Menu/});
        await reader.doDefault(menuButton);

        link = reader.next(siteNav, {'role' : 'link', 'name' : /Home/});
        await reader.doDefault(link);
        
        var title = await reader.getPageTitle();
        // BAD BAD PEOPLE!
        expect(title).to.be(undefined);
        return true;
    });
  });
});

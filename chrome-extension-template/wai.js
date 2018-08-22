(function() {
    var WAI = function() {
    };

    WAI.prototype.validateBreadcrumb = async function(label) {
        // Example: https://www.w3.org/TR/wai-aria-practices-1.1/#breadcrumb
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

(function() {
    var WAI = function() {
    };

    WAI.prototype.validateBreadcrumb = async function(label) {
        // Example: https://www.w3.org/TR/2018/NOTE-wai-aria-practices-1.1-20180726/#breadcrumb
        var navigation,
            list,
            listItem,
            navLink,
            currentCount = 0,
            lastCurrent = false,
            ariaCurrent,
            href,
            pageUrl,
            samePageUrl;

        navigation = await reader.findInPage("navigation", label);

        // We should have found the navigation node.
        expect(navigation).not.to.be(null);

        // We should have an ordered list.
        list = reader.find(navigation, 'list', '');
        expect(list).not.to.be(null);

        listItem = reader.find(list, 'listItem', '');
        // Verify we have some entries in the list.
        expect(reader.isEmpty(listItem)).to.be(false);

        // Get the url of the current page.
        pageURL = await reader.getPageUrl();

        // For each entry in the list.
        while (!reader.isEmpty(listItem)) {
            // See if it is a link.
            navLink = await reader.find(listItem, 'link');
            if (navLink) {
                // See if it the current page.
                ariaCurrent = await reader.getAttributeValue(navLink, 'aria-current');
                href = await reader.getAttributeValue(navLink, 'href');
                // Verify we have a url for the current page.
                expect(href).not.to.be(null);
                if (ariaCurrent == 'page') {
                    currentCount += 1;
                    lastCurrent = true;

                    // Verify the current page matches the document url.
                    expect(href).to.be(pageURL);
                } else {
                    lastCurrent = false;
                }
            } else {
                lastCurrent = false;
            }
            // Get the next breadcrumb.
            listItem = await reader.next(listItem, 'listItem', '');
        }
        // Verify only the last link in the breadcrumbs was marked as the current page.
        expect(lastCurrent).to.be(true);
        // Verify there was only one current page in the breadcrumbs.
        expect(currentCount).to.be(1);

        // Follow the last link and verify we end up on the same page.
        await reader.doDefault(navLink);
        samePageUrl = await reader.getPageUrl();
        expect(pageURL).to.be(samePageUrl);

        return true;
    };

    // Export this class.
    window.WAI = WAI;
}());

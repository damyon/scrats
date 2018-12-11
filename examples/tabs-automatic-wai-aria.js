describe('WAI Aria Tabs', function() {
    it('Tabs with automatic activation are accessible', async function() {
        let wai,
            url = 'https://www.w3.org/TR/wai-aria-practices-1.1/examples/tabs/tabs-1/tabs.html',
            heading,
            container,
            tablist;

        wai = new WAI(reader);
        await reader.setPageUrl(url);
        heading = await reader.findInPage('heading', 'Example');
        container = await reader.parent(heading);

        tablist = await reader.find(container, 'tabList', '');
        explainTest('The page contains a tablist');
        await wai.validateTablist(tablist, false);
    })
});

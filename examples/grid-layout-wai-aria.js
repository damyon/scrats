describe('WAI Aria Grid', function() {
    it('Layout Grid is accessible', async function() {
        let wai,
            url = 'https://www.w3.org/TR/wai-aria-practices-1.1/examples/grid/LayoutGrids.html',
            heading, container, grid, previous;

        wai = new WAI(reader);
        await reader.setPageUrl(url);
        heading = await reader.findInPage('heading', 'Example 1: Simple List of Links');
        previous = await reader.findInPage('link', 'Advanced Data Grid Example');
        container = await reader.parent(heading);

        grid = await reader.find(container, 'grid', '');
        explainTest('The page contains grid');
        expect(grid).not.to.be.empty();

        await wai.validateGridLayout(grid, previous);
    })
});

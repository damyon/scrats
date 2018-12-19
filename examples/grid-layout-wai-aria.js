describe('WAI Aria Grid', function() {
    it('Layout Grid is accessible', async function() {
        let wai,
            url = 'https://www.w3.org/TR/wai-aria-practices-1.1/examples/grid/LayoutGrids.html',
            heading, container, grid;

        wai = new WAI(reader);
        await reader.setPageUrl(url);
        heading = await reader.findInPage('heading', 'Example 1: Simple List of Links');
        container = await reader.parent(heading);

        grid = await reader.find(container, 'grid', '');
        explainTest('The page contains grid');
        expect(grid).not.to.be.empty();

        await wai.validateGridLayout(grid);

        heading = await reader.findInPage('heading', 'Example 2: Pill List For a List of Message Recipients')
        container = await reader.parent(heading);

        grid = await reader.find(container, 'grid', '');
        explainTest('The page contains grid');
        expect(grid).not.to.be.empty();

        await wai.validateGridLayout(grid);

        heading = await reader.findInPage('heading', 'Example 3: Scrollable Search Results')
        container = await reader.parent(heading);

        grid = await reader.find(container, 'grid', '');
        explainTest('The page contains grid');
        expect(grid).not.to.be.empty();

        await wai.validateGridLayout(grid);
    })
});

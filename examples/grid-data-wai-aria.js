describe('WAI Aria Grid', function() {
    it('Data Grid is accessible', async function() {
        let wai,
            url = 'https://www.w3.org/TR/wai-aria-practices-1.1/examples/grid/dataGrids.html',
            heading, container, grid;

        wai = new WAI(reader);
        await reader.setPageUrl(url);
        heading = await reader.findInPage('heading', 'Example 1: Minimal Data Grid');
        container = await reader.parent(heading);

        grid = await reader.find(container, 'grid', '');
        explainTest('The page contains grid');
        expect(grid).not.to.be.empty();

        await wai.validateGridLayout(grid, 'cell');

        heading = await reader.findInPage('heading', 'Example 2: Sortable Data Grid With Editable Cells');
        container = await reader.parent(heading);

        grid = await reader.find(container, 'grid', '');
        explainTest('The page contains grid');
        expect(grid).not.to.be.empty();

        await wai.validateGridLayout(grid, 'button');

        heading = await reader.findInPage('heading', 'Example 3: Scrollable Data Grid With Column Hiding');
        container = await reader.parent(heading);

        grid = await reader.find(container, 'grid', '');
        explainTest('The page contains grid');
        expect(grid).not.to.be.empty();

        await wai.validateGridLayout(grid, 'cell');
    })
});

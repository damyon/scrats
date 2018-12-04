describe('WAI Aria', function() {
  describe('Table', function() {
    it('Table is accessible', async function() {
        let wai,
            url = 'https://www.w3.org/TR/wai-aria-practices-1.1/examples/table/table.html',
            heading,
            container,
            table;

        wai = new WAI(reader);
        await reader.setPageUrl(url);
        heading = await reader.findInPage('heading', 'Table Example');
        container = await reader.parent(heading);

        table = await reader.find(container, 'table', '');
        explainTest('The page contains a table');
        await wai.validateTable(table);
    })
  })
});

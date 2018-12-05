describe('WAI Aria', function() {
  describe('Toolbar', function() {
    it('Toolbar is accessible', async function() {
        let wai,
            url = 'https://www.w3.org/TR/wai-aria-practices-1.1/examples/toolbar/toolbar.html',
            heading, container, toolbar;

        wai = new WAI(reader);
        await reader.setPageUrl(url);
        heading = await reader.findInPage('heading', 'Toolbar Example');
        container = await reader.parent(heading);

        toolbar = await reader.find(container, 'toolbar', '');
        explainTest('The page contains a toolbar');
        expect(toolbar).not.to.be.empty();

        await wai.validateToolbar(toolbar);
    })
  })
});

describe('WAI Aria', function() {
  describe('Link', function() {
    it('Link is accessible', async function() {
        let wai,
            url = 'https://www.w3.org/TR/wai-aria-practices-1.1/examples/link/link.html',
            heading, container, links, i;

        wai = new WAI(reader);
        await reader.setPageUrl(url);
        heading = await reader.findInPage('heading', 'Examples');
        container = await reader.parent(heading);

        links = await reader.findAll(container, 'link', '');
        explainTest('The page contains links');
        expect(links).not.to.be.empty();

        for (i = 0; i < links.length; i++) {
            await wai.validateLink(links[i]);
        }
    })
  })
});

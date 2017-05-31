describe('World Wide Web search', function() {
  describe('Search page navigation', function() {
    it('The page should have a title', async function() {
        var page = await reader.getPage();

        expect(reader.getAccessibleName(page)).to.eql('World Wide Web Consortium (W3C)');
    });

    it('The search field should have an accessible name', async function() {
        var page = await reader.getPage();

        var search = reader.find(page, {'attributes': {'name' : /Search/}});
        //reader.debugPrintTree();
        //reader.debugPrintNode(search);
        expect(reader.getAccessibleName(search)).to.eql('Search');
    });
  });
});

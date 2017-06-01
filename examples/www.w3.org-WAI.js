describe('World Wide Web search', function() {
  describe('Search page navigation', function() {
    it('The page should have a title', async function() {
        var page = await reader.getPage();

        expect(reader.getAccessibleName(page)).to.match(/W3C/);
    });

    it('The search field should have an accessible name', async function() {
        var page = await reader.getPage();

        var search = reader.find(page, {'name' : /Search/});
        //reader.debugPrintTree();
        reader.debugPrintNode(search);
        expect(reader.getAccessibleName(search)).to.eql('Search');
        var siteNav = reader.find(page, {'role' : 'heading', 'hierarchicalLevel': 2});
        reader.debugPrintNode(siteNav);

        var gettingStartedLink = reader.next(siteNav, {'role' : 'link'});
        reader.debugPrintNode(siteNav);

        var done = await reader.doDefault(gettingStartedLink);

        var page = await reader.getPage();
        expect(reader.getAccessibleName(page)).to.match(/WAI Resources/);
    });
  });
});

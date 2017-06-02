describe('World Wide Web search', function() {
  describe('Search page navigation', function() {
    it('The page should have a title', async function() {
        var title = await reader.getPageTitle();
        expect(title).to.match(/W3C/);
    });

    it('The search field should have an accessible name', async function() {
        this.timeout(15000);

        var search = await reader.findInPage({'name' : /Search/});
        //reader.debugPrintTree();
        reader.debugPrintNode(search);
        expect(reader.getAccessibleName(search)).to.eql('Search');
        var siteNav = await reader.findInPage({'role' : 'heading', 'hierarchicalLevel': 2});
        reader.debugPrintNode(siteNav);

        var gettingStartedLink = reader.next(siteNav, {'role' : 'link'});
        reader.debugPrintNode(siteNav);

        var done = await reader.doDefault(gettingStartedLink);

        var title = await reader.getPageTitle();
        expect(title).to.match(/WAI Resources/);
    });
  });
});

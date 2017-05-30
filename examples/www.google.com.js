describe('Google search', function() {
  describe('Search page navigation', function() {
    it('The page should have a title', async function() {
        var tree = await reader.getTree();

        expect(reader.getAccessibleName(tree)).to.eql('Google');
    });

    it('The search field should have focus', async function() {
        var tree = await reader.getTree();

        var search = tree.find({RoleType: 'combobox'});
        console.log(JSON.stringify(search));
        expect(reader.getAccessibleName(search)).to.eql('Search');
    });
  });
});

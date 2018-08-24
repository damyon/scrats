describe('WAI Aria', function() {
  describe('Menu button', function() {
    it('Menu button is accessible', async function() {
        // This example validated the example menu button provided by aria at:
        //
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/menu-button/menu-button-links.html
        //
        var wai = new WAI(reader);
        await wai.validateMenuButtonLinks("popUpButton", "WAI-ARIA Quick Links");
    })
  })
});

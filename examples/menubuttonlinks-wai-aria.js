describe('WAI Aria', function() {
  describe('Menu button', function() {
    it('Menu button is accessible', async function() {
        let wai,
            url = 'https://www.w3.org/TR/wai-aria-practices-1.1/examples/menu-button/menu-button-links.html';

        wai = new WAI(reader);
        await reader.setPageUrl(url);

        await wai.validateMenuButtonLinks("popUpButton", "WAI-ARIA Quick Links");
    })
  })
});

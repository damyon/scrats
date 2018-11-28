describe('WAI Aria', function() {
  describe('Menubar', function() {
    it('Menubar is accessible', async function() {
        let wai,
            url = 'https://www.w3.org/TR/wai-aria-practices-1.1/examples/menubar/menubar-1/menubar-1.html',
            heading,
            element;

        wai = new WAI(reader);
        await reader.setPageUrl(url);

        await wai.validateMenuBar('menuBar', 'Mythical University');
    })
  })
});

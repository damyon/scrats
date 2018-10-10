describe('WAI Aria', function() {
  describe('Collapsible List Box', function() {
    it('Collapsible List Box is accessible', async function() {
        let wai,
            url = 'https://www.w3.org/TR/wai-aria-practices-1.1/examples/listbox/listbox-collapsible.html',
            element;

        wai = new WAI(reader);
        await reader.setPageUrl(url);
        element = await reader.findInPage('popUpButton', '');

        await wai.validateCollapsibleListBox(element);
    })
  })
});

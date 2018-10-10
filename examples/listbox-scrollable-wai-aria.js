describe('WAI Aria', function() {
  describe('Scrollable List Box', function() {
    it('Scrollable List Box is accessible', async function() {
        let wai,
            url = 'https://www.w3.org/TR/wai-aria-practices-1.1/examples/listbox/listbox-scrollable.html',
            element;

        wai = new WAI(reader);
        await reader.setPageUrl(url);
        element = await reader.findInPage('listBox', '');

        await wai.validateScrollableListBox(element);
    })
  })
});

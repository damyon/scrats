describe('WAI Aria', function() {
  describe('Accordion', function() {
    it('Accordion is accessible', async function() {
        let wai,
            url = 'https://www.w3.org/TR/wai-aria-practices-1.1/examples/accordion/accordion.html',
            header;

        wai = new WAI(reader);
        await reader.setPageUrl(url);
        header = await reader.findInPage('splitter', 'Start of Example');
        await wai.validateAccordion(header);
    })
  })
});

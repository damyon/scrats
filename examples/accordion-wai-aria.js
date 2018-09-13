describe('WAI Aria', function() {
  describe('Accordion', function() {
    it('Accordion is accessible', async function() {
        // This example validated the example accordion provided by aria at:
        //
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/accordion/accordion.html
        //
        var wai = new WAI(reader);
        var header = await reader.findInPage('splitter', 'Start of Example');
        await wai.validateAccordion(header);
    })
  })
});

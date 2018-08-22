describe('WAI Aria', function() {
  describe('Breadcrumb', function() {
    it('Breadcrumb is accessible', async function() {
        // This example validated the example breadcrumb provided by aria at:
        //
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/breadcrumb/index.html
        //
        var wai = new WAI(reader);
        await wai.validateBreadcrumb("Breadcrumb");
    })
  })
});
        

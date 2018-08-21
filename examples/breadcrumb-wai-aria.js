describe('WAI Aria', function() {
  describe('Breadcrumb', function() {
    it('Breadcrumb is accessible', async function() {
        // This example validated the example breadcrumb provided by aria at:
        //
        // https://www.w3.org/TR/2018/NOTE-wai-aria-practices-1.1-20180726/examples/breadcrumb/index.html
        //
        var wai = new WAI(reader);
        await wai.validateBreadcrumb("Breadcrumb");
    })
  })
});
        

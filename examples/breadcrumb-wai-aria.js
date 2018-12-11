describe('WAI Aria Breadcrumb', function() {
    it('Breadcrumb is accessible', async function() {
        let wai,
            url = 'https://www.w3.org/TR/wai-aria-practices-1.1/examples/breadcrumb/index.html';

        wai = new WAI(reader);
        await reader.setPageUrl(url);

        await wai.validateBreadcrumb("Breadcrumb");
    })
});

describe('WAI Aria Dialog', function() {
    it('Dialog is accessible', async function() {
        let wai,
            url = 'https://www.w3.org/TR/wai-aria-practices-1.1/examples/dialog-modal/dialog.html';

        wai = new WAI(reader);
        await reader.setPageUrl(url);

        // Button triggers a dialog - do all the tests.
        await wai.validateModalDialog('Add Delivery Address', 'Cancel');
    })
});

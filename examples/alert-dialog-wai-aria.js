describe('WAI Aria', function() {
  describe('Alert Dialog', function() {
    it('Alert dialog is accessible', async function() {
        let wai,
            url = 'https://www.w3.org/TR/wai-aria-practices-1.1/examples/dialog-modal/alertdialog.html';

        wai = new WAI(reader);
        await reader.setPageUrl(url);

        // Button triggers a dialog - do all the tests.
        await wai.validateAlertDialog('Discard', 'No');
    })
  })
});

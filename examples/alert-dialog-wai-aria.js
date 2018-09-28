describe('WAI Aria', function() {
  describe('Alert Dialog', function() {
    it('Alert dialog is accessible', async function() {
        // This example validated the example alert dialog provided by aria at:
        //
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/dialog-modal/alertdialog.html
        //
        let wai, trigger, done, modal, first, current;

        wai = new WAI(reader);

        // Button triggers a dialog - do all the tests.
        await wai.validateAlertDialog('Discard', 'No');
    })
  })
});

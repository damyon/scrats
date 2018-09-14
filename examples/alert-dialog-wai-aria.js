describe('WAI Aria', function() {
  describe('Alert Dialog', function() {
    it('Alert dialog is accessible', async function() {
        // This example validated the example alert dialog provided by aria at:
        //
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/dialog-modal/alertdialog.html
        //
        let wai, trigger, done, modal, first, current;

        wai = new WAI(reader);
        trigger = await reader.findInPage('button', 'Discard');
        done = reader.waitForAlertDialog(true);
        await reader.doDefault(trigger);
        modal = await done;
        expect(reader.isModal(modal)).to.be(true);
        expect(reader.getAccessibleName(modal)).to.not.be('');

        trigger = await reader.findInPage('button', 'No');
        await reader.doDefault(trigger);
    })
  })
});

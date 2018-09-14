describe('WAI Aria', function() {
  describe('Alert', function() {
    it('Alert is accessible', async function() {
        // This example validated the example accordion provided by aria at:
        //
        // https://www.w3.org/TR/wai-aria-practices-1.1/examples/alert/alert.html
        //
        var wai = new WAI(reader);
        var trigger = await reader.findInPage('button', 'Trigger Alert');
        done = reader.waitForAlert();
        await reader.doDefault(trigger);
        await done;
    })
  })
});

describe('WAI Aria', function() {
  describe('2 State Checkbox', function() {
    it('2 State Checkbox is accessible', async function() {
        let wai,
            url = 'https://www.w3.org/TR/wai-aria-practices-1.1/examples/checkbox/checkbox-1/checkbox-1.html',
            checkboxList,
            heading;

        wai = new WAI(reader);
        await reader.setPageUrl(url);
        checkboxList = await reader.findAllInPage('checkBox', '');
        for (i = 0; i < checkboxList.length; i++) {
            await wai.validateCheckbox(checkboxList[i]);
        }
    })
  })
});

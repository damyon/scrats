describe('WAI Aria', function() {
  describe('Mixed State Checkbox', function() {
    it('Mixed State Checkbox is accessible', async function() {
        let wai,
            url = 'https://www.w3.org/TR/wai-aria-practices-1.1/examples/checkbox/checkbox-2/checkbox-2.html',
            groupCheckBox,
            itemCheckBoxes;

        wai = new WAI(reader);
        await reader.setPageUrl(url);
        itemCheckBoxes = await reader.findAllInPage('checkBox', '');
        groupCheckBox = itemCheckBoxes.shift();

        await wai.validateMixedCheckbox(groupCheckBox);
        
    })
  })
});

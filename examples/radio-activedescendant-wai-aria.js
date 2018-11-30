describe('WAI Aria', function() {
  describe('Radio Group', function() {
    it('Radio Group is accessible', async function() {
        let wai,
            url = 'https://www.w3.org/TR/wai-aria-practices/examples/radio/radio-1/radio-1.html';

        wai = new WAI(reader);
        await reader.setPageUrl(url);
        group1 = await wai.validateRadioGroup('radioGroup', 'Pizza Crust');
        group2 = await wai.validateRadioGroup('radioGroup', 'Pizza Delivery');
    })
  })
});

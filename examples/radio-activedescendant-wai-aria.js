describe('WAI Aria Radio Group Active Descendant', function() {
    it('Radio Group is accessible', async function() {
        let wai,
            url = 'https://www.w3.org/TR/wai-aria-practices/examples/radio/radio-2/radio-2.html';

        wai = new WAI(reader);
        await reader.setPageUrl(url);
        group1 = await wai.validateRadioGroupActiveDescendant('radioGroup', 'Pizza Crust');
        group2 = await wai.validateRadioGroupActiveDescendant('radioGroup', 'Pizza Delivery');
    })
});

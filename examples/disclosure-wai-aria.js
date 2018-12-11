describe('WAI Aria Disclosure', function() {
    it('Disclosure is accessible', async function() {
        let wai,
            url = 'https://www.w3.org/TR/wai-aria-practices-1.1/examples/disclosure/disclosure-img-long-description.html',
            trigger;

        wai = new WAI(reader);
        await reader.setPageUrl(url);

        trigger = await reader.findInPage('button', 'Data Table for Minard\'s Chart');
        await wai.validateDisclosure(trigger);
    })
});

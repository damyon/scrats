describe('WAI Aria Alert', function() {
    it('Alert is accessible', async function() {
        let wai,
            url = 'https://www.w3.org/TR/wai-aria-practices-1.1/examples/alert/alert.html',
            trigger,
            done;
                                            
        wai = new WAI(reader);
        await reader.setPageUrl(url);

        trigger = await reader.findInPage('button', 'Trigger Alert');
        done = reader.waitForAlert();
        await reader.doDefault(trigger);
        await done;
    })
});

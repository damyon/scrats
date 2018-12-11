describe('WAI Aria Feed', function() {
    it('Feed is accessible', async function() {
        let wai,
            url = 'https://www.w3.org/TR/wai-aria-practices-1.1/examples/feed/feedDisplay.html',
            feedContainer;

        wai = new WAI(reader);
        await reader.setPageUrl(url);
        feedContainer = await reader.findInPage('feed', '');
        await wai.validateFeed(feedContainer);
    })
});

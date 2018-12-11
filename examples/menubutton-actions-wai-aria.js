describe('WAI Aria Menu button actions', function() {
    it('Menu button using actions is accessible', async function() {
        let wai,
            url = 'https://www.w3.org/TR/wai-aria-practices-1.1/examples/menu-button/menu-button-actions.html';

        wai = new WAI(reader);
        await reader.setPageUrl(url);

        await wai.validateMenuButtonActions("popUpButton", "Actions");
    })
});

describe('WAI Aria Menu button active descendant', function() {
    it('Menu button using active descendant is accessible', async function() {
        let wai,
            url = 'https://www.w3.org/TR/wai-aria-practices-1.1/examples/menu-button/menu-button-actions-active-descendant.html';

        wai = new WAI(reader);
        await reader.setPageUrl(url);

        await wai.validateMenuButtonActiveDescendant("popUpButton", "Actions");
    })
});

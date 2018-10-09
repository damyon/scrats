describe('WAI Aria', function() {
  describe('Button', function() {
    it('Button is accessible', async function() {
        let wai,
            url = 'https://www.w3.org/TR/wai-aria-practices-1.1/examples/button/button.html',
            normalButton,
            parentNode,
            toggleButton;

        wai = new WAI(reader);
        await reader.setPageUrl(url);
        normalButton = await reader.findInPage('button', 'Print Page');
        await reader.focus(normalButton);
        await wai.validateButton(normalButton);

        toggleButton = await reader.findInPage('toggleButton', '');
        await wai.validateToggleButton(toggleButton);
    })
  })
});

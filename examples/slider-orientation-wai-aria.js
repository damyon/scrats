describe('WAI Aria', function() {
  describe('Slider', function() {
    it('Slider is accessible', async function() {
        let wai,
            url = 'https://www.w3.org/TR/wai-aria-practices-1.1/examples/slider/slider-2.html',
            heading,
            container,
            sliders;

        wai = new WAI(reader);
        await reader.setPageUrl(url);
        heading = await reader.findInPage('heading', 'Example');
        container = await reader.parent(heading);

        sliders = await reader.findAll(container, 'slider', '');
        explainTest('The page contains sliders');
        expect(sliders).not.to.be.empty();

        for (i = 0; i < sliders.length; i++) {
            await wai.validateSlider(sliders[i], false);
        }
    })
  })
});

describe('WAI Aria Rearrangeable List Box', function() {
    it('Rearrangeable List Box is accessible', async function() {
        let wai,
            url = 'https://www.w3.org/TR/wai-aria-practices-1.1/examples/listbox/listbox-rearrangeable.html',
            fromlist,
            tolist,
            buttons,
            movetobutton,
            movefrombutton;

        wai = new WAI(reader);
        await reader.setPageUrl(url);
        fromlist = await reader.findInPage('listBox', 'Important Features:');
        tolist = await reader.findInPage('listBox', 'Unimportant Features:');
        buttons = await reader.findAllInPage('button', '');
        movetobutton = buttons[2];
        movefrombutton = buttons[3];

        await wai.validateRearrangeableListBox(fromlist, tolist, movetobutton, movefrombutton);
    })
});

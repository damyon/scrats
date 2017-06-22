describe('Moodle test', function() {
  describe('Login', function() {
    it('Can login to Moodle', async function() {
        this.timeout(15000);

        var link = await reader.findInPage({'role' : 'link', 'name' : 'Log in'});

        var followed = await reader.doDefault(link);

        var form = await reader.findInPage({'role' : 'form'});

        var username = await reader.find(form, {'role' : 'textField', 'name' : /Username/});

        reader.enterText(username, "admin");
        reader.debugPrintNode(username);
        var next = await reader.pause(2000);
    });

  });
});

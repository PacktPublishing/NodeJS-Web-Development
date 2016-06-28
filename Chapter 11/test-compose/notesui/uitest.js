
var notes = 'http://localhost:3000';

casper.test.begin('Can login to Notes application', function suite(test) {
    casper.start(notes, function() {
        test.assertTitle("Notes");
        test.assertExists('a#btnloginlocal', "Login button is found");
        this.click("a#btnloginlocal");
    });
    
    casper.then(function() {
        test.assertHttpStatus(200);
        test.assertUrlMatch(/users\/login/, 'should be on /users/login');
        this.fill('form', {
            username: "me",
            password: "w0rd"
        });
        this.click('button[type="submit"]');
    });
    
    casper.waitForSelector('#btnlogout', function() {
        // this.echo('Logged in?');
        test.assertHttpStatus(200);
        test.assertTitle("Notes");
        test.assertExists('a#btnlogout', "logout button is found");
        test.assertExists('a#btnaddnote', "Add Note button is found");
        this.click("#btnaddnote");
    });
    
    casper.waitForUrl(/notes\/add/, function() {
        test.assertHttpStatus(200);
        test.assertTitle("Add a Note");
        test.assertField("docreate", "create");
        this.fill('form', {
            notekey: 'testkey',
            title: 'Test Note Title',
            body: 'Test Note Body with various textual delights'
        });
        this.click('button[type="submit"]');
    });
    
    casper.waitForUrl(/notes\/view/, function() {
        test.assertHttpStatus(200);
        test.assertTitle("Test Note Title");
        test.assertSelectorHasText("p#notebody", 'Test Note Body with various textual delights');
        this.click('#btndestroynote');
    });
    
    casper.waitForUrl(/notes\/destroy/, function() {
        test.assertHttpStatus(200);
        test.assertTitle("Test Note Title");
        test.assertField("notekey", "testkey");
        this.click('input[type="submit"]');
    });
    
    casper.waitForUrl(notes, function() {
        test.assertHttpStatus(200);
        test.assertTitle("Notes");
        test.assertExists('a#btnlogout', "logout button is found");
        this.click("#btnlogout");
    });
    
    casper.waitForUrl(notes, function() {
        test.assertHttpStatus(200);
        test.assertTitle("Notes");
        test.assertExists('a#btnloginlocal', "Login button is found");
    });

    casper.run(function() {
        test.done();
    });
});
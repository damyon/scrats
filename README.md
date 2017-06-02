# Overview

Scrats is an automated testing framework for testing how well web pages can be used by screenreaders. It's most similar to tools like [Behat](https://github.com/Behat/Behat) but instead of "using javascript to simulate user input over a slow and buggy remote protocol", scrats gives you access to a standard testing framework [Mocha](https://mochajs.org/) where you can write javascript tests against the browser accessibility tree exposed by the [Chrome automation API](https://developer.chrome.com/extensions/automation). 

Expectations can be written in a nice declarative syntax thanks to [Expect.js](https://github.com/Automattic/expect.js) and the test results are reported with the [Test Anything Protocol](https://testanything.org/) so they can be easily hooked into an existing continuous integration workflow.

See [Installation](https://github.com/damyon/scrats/wiki/Installation) and [Getting Started](https://github.com/damyon/scrats/wiki/Getting-Started) for next steps.

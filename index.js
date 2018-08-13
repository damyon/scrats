#!/usr/bin/env node

var program = require('commander');
var tester = require('./tester');
var version = '0.1.7';

function increaseVerbosity(v, total) {
  return total + 1;
}

function appendPreflightScript(file, preflight) {
    preflight.push(file);
    return preflight;
}

program
 .version(version)
 .usage('[options] [url]')
 .option('-f, --feature <value>', 'The feature file to run on the url')
 .option('-t, --timeout <value>', 'The number of milliseconds for a valid timeout')
 .option('-c, --chrome <value>', 'Path to the chrome executable to run [/usr/bin/google-chrome-unstable]. This value is remembered between runs.', '')
 .option('-p, --preflight [value]', 'Path to a javascript file to pre-load before running tests.', appendPreflightScript, [])
 .option('-d, --dataset [json]', 'JSON encoded string representing an array of data. The test will be re-run for each row in the array with the current row set to a global "state" variable.', JSON.parse, [[]])
 .option('-v, --verbose', 'Increase log level', increaseVerbosity, 0)
 .action(function(url) {
 })
 .parse(process.argv);

var url = 'about:blank';
if (program.args.length > 0) {
    url = program.args[0];
}

program.chrome = tester.persistChrome(program.chrome);

tester.run(
    url,
    program.feature,
    program.chrome,
    program.verbose,
    program.preflight,
    program.dataset,
    program.timeout
).then(function() {
    process.exit(0);
}).catch(function(e) {
    console.log('Bail out! # Test execution failed.');
    console.log(e);
    process.exit(1);
});

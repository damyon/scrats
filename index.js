#!/usr/bin/env node

var program = require('commander');
var tester = require('./tester');

function increaseVerbosity(v, total) {
  return total + 1;
}

function appendPreflightScript(file, preflight) {
    preflight.push(file);
    return preflight;
}

program
 .arguments('<url>')
 .option('-f, --feature <value>', 'The feature file to run on the url')
 .option('-c, --chrome <value>', 'Path to the chrome executable to run [/usr/bin/google-chrome]', '/usr/bin/google-chrome-unstable')
 .option('-p, --preflight [value]', 'Path to a javascript file to pre-load before running tests.', appendPreflightScript, [])
 .option('-v, --verbose', 'Increase log level', increaseVerbosity, 0)
 .action(function(url) {
   tester.run(url, program.feature, program.chrome, program.verbose, program.preflight).then(function() {
     process.exit(0);
   }).catch(function(e) {
     console.log('Bail out! # Test execution failed.');
     console.log(e);
     process.exit(1);
   });

 })
 .parse(process.argv);

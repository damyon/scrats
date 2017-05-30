#!/usr/bin/env node

var program = require('commander');
var tester = require('./tester');

program
 .arguments('<url>')
 .option('-f, --feature <feature>', 'The feature file to run on the url')
 .option('-c, --chrome <path>', 'Path to the chrome executable to run [/usr/bin/google-chrome]', '/usr/bin/google-chrome-unstable')
 .action(function(url) {
   tester.run(url, program.feature, program.chrome).then(function() {
     process.exit(0);
   }).catch(function(e) {
     console.log('Bail out! # Test execution failed.');
     console.log(e);
     process.exit(1);
   });

 })
 .parse(process.argv);

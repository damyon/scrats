#!/usr/bin/env node

var program = require('commander');
var tester = require('./tester');

program
 .arguments('<url>')
 .option('-f, --feature <feature>', 'The feature file to run on the url')
 .option('-c, --chrome <path>', 'Path to the chrome executable to run [/usr/bin/google-chrome]', '/usr/bin/google-chrome-unstable')
 .action(function(url) {
   console.log('url: %s feature: %s chrome: %s',
       url, program.feature, program.chrome);

   tester.run(url, program.feature, program.chrome).then(function() {
     console.log('Test execution complete.');
     process.exit(0);
   }).catch(function(e) {
     console.log('Test execution failed.');
     console.log(e);
     process.exit(1);
   });

 })
 .parse(process.argv);

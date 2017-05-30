var Promise = require('promise');
var Tmp = require('tmp');
var Filesystem = require('fs-extra');
var Rmdir = require('rmdir');
var spawn = require('child_process').spawn;
var copy = require('recursive-copy');
var installDir = require('get-installed-path');

exports.run = function(url, feature, chrome, verbose) {
    console.log('# Execute test suite: ' + feature + ' on site: ' + url);

    var promise = new Promise(function(resolve, reject) {
        // Make a temp dir to hold the profile and extension.
        Tmp.dir(function(err, path, cleanupCallback) {
          if (err) {
            reject(err);
          }

          // Make the profile dir.
          var profileDir = path + '/profile';
          Filesystem.mkdirSync(profileDir);

          // Make the extension dir.
          var extensionDir = path + '/extension';
          Filesystem.mkdirSync(extensionDir);

          installDir('scrats').then(function(baseDir) {
            return baseDir;
          }).then(function(baseDir) {
              // Copy the files from the extension template to the tmp dir.
              return copy(baseDir + '/chrome-extension-template', extensionDir);
          }).then(function() {
              // Copy the feature file to feature.js in the extension.
              return Filesystem.copy(feature, extensionDir + '/feature.js');

          }).then(function() {
              // Launch chrome with the extension.
              var process = spawn(chrome, ['--user-data-dir=' + profileDir, '--load-extension=' + extensionDir, '--no-first-run', '--enable-logging', '--v=0', url]);

              // Handle exit.
              process.on('close', function(code, signal) {
                  var readFile = Promise.denodeify(Filesystem.readFile);
                  var rmdir = Promise.denodeify(Rmdir);

                  readFile(profileDir + '/chrome_debug.log', 'utf8').then(function(data) {

                    if (verbose > 0) {
                        console.log(data);
                    }
                    var lines = data.split("\n").filter(function(element) {
                        return element.match(/[TAP]/);
                    }).map(function(element) {
                        var parts = element.split('[TAP]');
                        parts.pop();
                        parts.shift();
                        var line = parts.join('');
                        if (line) {
                            console.log(line);
                        }
                    });
                    return lines;
                  }).then(function() {
                      return rmdir(profileDir);
                  }).then(function() {
                      return rmdir(extensionDir);
                  }).then(function() {
                    cleanupCallback();
                    resolve(true);
                  }).catch(reject);
              });
          }).catch(reject);


        });
    });


    return promise;
};

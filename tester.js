var Promise = require('promise');
var Tmp = require('tmp');
var Filesystem = require('fs-extra');
var Rmdir = require('rmdir');
var spawn = require('child_process').spawn;
var copyDir = require('recursive-copy');
var installDir = require('get-installed-path');
var settings = require('user-settings');

var MAX_EXECUTION_TIME = 60000;
exports.persistChrome = function(chrome) {
    // Remember some options between runs.
    let file = settings.file('.scrats');
    let savedValue = '';

    if ((typeof chrome) == 'undefined') {
        chrome = '';
    }
    if (chrome.length == 0) {
        savedValue = file.get('chrome');
        if (typeof savedValue != 'undefined') {
            chrome = savedValue;
        }
    } else {
        file.set('chrome', chrome);
    }
    if (chrome.length == 0) {
        chrome = '/usr/bin/google-chrome-unstable';
    }
    return chrome;
};

exports.run = function(url, feature, chrome, verbose, scripts, dataset, timeout) {
    console.log('# Execute test suite: ' + feature + ' on site: ' + url);

    var chain = Promise.resolve('start');

    if (typeof timeout == 'undefined') {
        timeout = 60000;
    }

    dataset.forEach((state) => {
        chain = chain.then(function() {
            return new Promise(function(resolve, reject) {
                // Make a temp dir to hold the profile and extension.
                Tmp.dir(function(err, path, cleanupCallback) {
                    if (err) {
                        return reject(err);
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
                        return copyDir(baseDir + '/chrome-extension-template', extensionDir);
                    }).then(function() {
                        // Copy the feature file to feature.js in the extension.
                        return Filesystem.copy(feature, extensionDir + '/feature.js');
                    }).then(function() {
                        // Copy each preflight script to the extension and append to the manifest.
                        var filesToCopy = [];
                        scripts.forEach((script, index) => {
                           filesToCopy.push(Filesystem.copy(script, extensionDir + '/preflight' + index + '.js'));
                        });
                        return Promise.all(filesToCopy);
                    }).then(function() {
                        // Write the execution dataset to a global variable.

                        var setGlobal = 'window.state = ' + JSON.stringify(state) + ';';
                        setGlobal += 'window.timeout = ' + timeout + ';';

                        return Filesystem.writeFile(extensionDir + '/dataset.js', setGlobal);
                    }).then(function() {
                        // Launch chrome with the extension.
                        var args = [
                            '--user-data-dir=' + profileDir,
                            '--disable-extensions-except=' + extensionDir,
                            '--no-first-run',
                            '--enable-logging',
                            '--v=0',
                            '--no-default-browser-check',
                            '--force-renderer-accessibility'
                        ];

                        args.push('--app=' + url);
                        var process = spawn(chrome, args);

                        setTimeout(function() {
                            process.kill();
                            console.log('# Execution time exceeded (' + MAX_EXECUTION_TIME/1000 + ' seconds) - killing process.');
                        }, MAX_EXECUTION_TIME);

                        // Handle exit.
                        process.on('close', function(code, signal) {
                            var readFile = Promise.denodeify(Filesystem.readFile);
                            var rmdir = Promise.denodeify(Rmdir);

                            readFile(profileDir + '/chrome_debug.log', 'utf8').then(function(data) {

                                var lines = data.split("\n").filter(function(element) {
                                    if (verbose > 0) {
                                        return element.match(/([TAP])|([DEBUG])/);
                                    } else {
                                        return element.match(/[TAP]/);
                                    }
                                }).map(function(element) {
                                    var parts = [];
                                    if (element.includes('[DEBUG]') && verbose > 0) {
                                        parts = element.split('[DEBUG]');
                                        parts.pop();
                                        parts.shift();
                                        line = parts.join('');
                                        if (line) {
                                            console.log(line);
                                        }
                                    } else {
                                        parts = element.split('[TAP]');
                                        parts.pop();
                                        parts.shift();
                                        var line = parts.join('');
                                        if (line) {
                                            console.log(line);
                                        }
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
                        }); // End process.on.
                    }); // End promise chain.
                }); // End Tmp.dir callback.
            }); // End new Promise.
        }); // End chain.then.
    }); // End forEach
    return chain;
};

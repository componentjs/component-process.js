/**
 * Lint command. No options as you should just add
 * relevant .rc files in relevant directories.
 * In the future, CSS linting as well as style checks
 * should be added.
 *
 * Generally speaking, lint commands should be run in
 * separate processes as they are very slow.
 */

var exec = require('child_process').execFile;
var jshint = require.resolve('jshint/bin/jshint');

var command = require('../command');
var config = require('../config');

module.exports = function* () {
  if (command.queue.lint) return;
  if (command.progress.lint) {
    command.queue.lint = true;
    yield command.await('lint');
  }

  delete command.queue.lint;
  command.queue.progress = true;

  var start = Date.now();
  console.log('\033[90m  --> linting    \033[34m%s\033[90m...\033[0m', config.name);

  exec(jshint, ['.'], function (err, stdout) {
    console.log('\033[90m  <-- linted     \033[34m%s\033[90m '
      + 'in \033[33m%sms\033[90m '
      + 'with%s errors\033[0m',
      config.name,
      Date.now() - start,
      err ? '' : ' no');
    if (err) console.error('\n' + stdout.toString('utf8'));
    done();
  })
}

function done() {
  command.progress.lint = false;
  command.emit('lint');
}
/**
 * To do:
 *   - Close watchers when the main `component.json` changes.
 *   - Ability to start, stop, and restart watching.
 *   - Check main `component.json` for files to watch
 */

var gaze = require('gaze');

var command = require('../command');
var config = require('../config');

var paths = config.paths;

module.exports = function () {
  // resolve watcher
  {
    var globs = paths.map(function (p) {
      return p + '/**/component.json';
    });

    gaze(globs)
      .on('error', onerror)
      .on('all', function () {
        command('resolve');
      });
  }

  // scripts watcher
  {
    var globs = [];
    paths.forEach(function (p) {
      config.extensions.scripts.forEach(function (ext) {
        globs.push(p + '/**/*.' + ext);
      });
    });

    gaze(globs)
      .on('error', onerror)
      .on('all', function (event, filename) {
        if (/component\.json$/.test(filename)) return;
        command('scripts');
        command('lint'); // should only lint scripts
      });
  }

  // styles watcher
  {
    var globs = [];
    paths.forEach(function (p) {
      config.extensions.styles.forEach(function (ext) {
        globs.push(p + '/**/*.' + ext);
      });
    });

    gaze(globs)
      .on('error', onerror)
      .on('all', function () {
        command('styles');
        command('lint'); // should only lint styles
      });
  }
}

function onerror(err) {
  if (err) console.error(err.stack);
}
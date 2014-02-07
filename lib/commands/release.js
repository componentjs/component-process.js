/**
 * An opinionated release system.
 * Adds a md5 hash to the build names.
 */

var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var bytes = require('bytes');
var spawn = require('co-child-process');
var hash = require('crypto').createHash;
var gzip = require('zlib').gzip;
var writeFile = require('fs').writeFile;
var join = require('path').join;

var uglifyjs = require.resolve('uglify-js/bin/uglifyjs');
var cleancss = require.resolve('clean-css/bin/cleancss');

var command = require('../command');
var config = require('../config');

var resolve = require('./resolve');

command.release = {};

// compression methods
// separate processes so it's non-blocking and parallel
// because this shit is so slow
var min = {
  scripts: function (str) {
    return spawn(uglifyjs, [
      '-',
      '--mangle',
      '--compress',
    ]).end(str);
  },
  styles: function (str) {
    return spawn(cleancss, [
      '--s0',
    ]).end(str);
  },
}

module.exports = function* (options) {
  if (command.locked
    || command.queue.resolve
    || command.progress.resolve
    || command.queue.styles
    || command.progress.styles
    || command.queue.scripts
    || command.progress.scripts
    || command.queue.files
    || command.progress.files
    || command.progress.release
    )
    return console.log('a resolve or build is in progress. wait until they are done.');

  command.progress.release = true;

  options = options || {};
  options.release = true;
  var save = options.save !== false;
  options.save = false;

  var start = Date.now();
  console.log('\033[90m  --> releasing  \033[34m%s\033[90m...\033[0m', config.name);

  if (save) {
    yield rimraf.bind(null, config.out);
    yield mkdirp.bind(null, config.out);
  }

  try {
    yield* resolve(options);
  } catch (err) {
    end(err);
    return;
  }

  yield Object.keys(command.bundles)
  .map(function (bundle) {
    var obj = command.release[bundle] = {
      scripts: {},
      styles: {},
    };

    return [
      ['scripts', 'js'],
      ['styles', 'css'],
    ].map(function (args) { return function* () {
      var type = args[0];
      var ext = args[1];
      var start = Date.now();

      var str = command[type][bundle];

      // minify
      str =
      obj[type].string = str
        ? yield min[type](command[type][bundle])
        : '';

      // gzip just see the size
      var length =
      obj[type].length = str
        ? (yield gzip.bind(null, str)).length
        : 0;

      if (!save) return;

      // hash the file
      var hex = obj[type].hash = hash('md5').update(str).digest('hex');
      var out = obj[type].filename = bundle + '.' + hex.slice(0, 8) + '.' + ext;

      yield writeFile.bind(null, join(config.out, out), str);

      console.log('\033[90m  --> released   \033[96m%s\033[90m'
        + ' in \033[33m%sms\033[90m'
        + ' - \033[37m%s'
        + '\033[90m / '
        + '\033[37m%s\033[0m',
        out,
        Date.now() - start,
        lengthof(str),
        bytes(length))
    }})
  })
  .reduce(concat, []);

  console.log('\033[90m  --> released   \033[34m%s\033[90m in \033[33m%sms\033[0m', config.name, Date.now() - start);

  end();

  function end(err) {
    if (err) console.error(err.stack);
    command.progress.release = false;
    if (save) command.emit('release');
  }
}

function concat(a, b) {
  return a.concat(b);
}

function lengthof(str) {
  return bytes(Buffer.byteLength(str));
}
var Table = require('cli-table');
var bytes = require('bytes');

var command = require('../command');
var release = require('./release');

module.exports = function* (options) {
  options = options || {};
  options.save = false;
  yield* release(options);

  var table = new Table({
    head: [
      'Build',
      'Original',
      'Minified',
      'Compressed',
    ]
  });

  Object.keys(command.bundles).forEach(function (bundle) {
    var obj = command.release[bundle];

    [
      ['scripts', 'js'],
      ['styles', 'css'],
    ].forEach(function (args) {
      var type = args[0];
      var ext = args[1];

      table.push([
        bundle + '.' + ext,
        lengthof(command[type][bundle]),
        lengthof(obj[type].string),
        bytes(obj[type].length),
      ]);
    });
  });

  console.log('\n' + indent(table.toString()) + '\n');
}


function lengthof(str) {
  return bytes(Buffer.byteLength(str));
}

function indent(str) {
  return str.replace(/^/gm, '  ');
}
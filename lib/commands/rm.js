var rimraf = require('rimraf');

var command = require('../command');
var config = require('../config');

module.exports = function* () {
  yield rimraf.bind(null, config.dir);
  command.emit('rm');
  command('resolve');
}
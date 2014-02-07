var command = require('../command');
var config = require('../config');

module.exports = function* () {
  var out = yield* command.bundle(command.tree, config.bundles);
  if (!Array.isArray(out)) return command.bundles = out;

  // no bundles
  var bundles = command.bundles = {};
  bundles[config.name] = out;
  return;
}
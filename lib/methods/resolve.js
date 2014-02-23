var resolve = require('component-resolver');

var config = require('../config');

/**
 * Resolve the dependency tree.
 * Should be a yieldable without any arguments.
 *
 * @return {Object} tree
 * @api public
 */

module.exports = function* () {
  return yield* resolve(config.root, {
    verbose: true,
    install: true,
    fields: config.fields,
  });
}
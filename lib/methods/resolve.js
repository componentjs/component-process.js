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
  var resolver = resolve(config.root, {
    silent: false,
    install: true,
    fields: config.fields,
  })

  return yield* resolver.tree();
}
var flatten = require('component-resolver').flatten;

/**
 * Although this example is synchronous,
 * the function should always be a yieldable for future support.
 * It should set each bundle as exports[name] = branches.
 * It should either return an array or an object of bundles.
 *
 * @return {Function} exports
 * @api public
 */

module.exports = function* (tree, bundles) {
  /* jshint noyield: true */

  // package everything at once.
  if (!bundles) return flatten(tree);

  /**
   * Note: this is my own bundling system.
   * Create a "boot" bundle and a "user" bundle
   * only for logged-in users.
   */

  var locals = tree.locals;
  var out = {};

  // bundle everything in boot
  out[bundles[0]] = flatten(locals[bundles[0]])
  .filter(function (branch) {
    return branch.bundle = true;
  })

  // include everything else in user
  out[bundles[1]] = flatten(locals[bundles[1]])
  .filter(function (branch) {
    return !branch.bundle;
  });

  return out;
}
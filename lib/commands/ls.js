/**
 * To do:
 *
 * - don't show local dependencies twice. only show it once at the highest branch possible.
 * - show the tree for a specific local dependency.
 *
 */

var archy = require('archy');

var command = require('../command');

module.exports = function* (options) {
  options = options || {};
  var max = options.depth || Infinity;

  if (!command.tree) yield command.await('resolved');

  // uses the currently resolved tree
  console.log(indent(archy(traverse(command.tree))));

  function traverse(branch, depth) {
    depth = depth || 0;

    var color = !branch.parent
      ? '\033[34m'
      : branch.type === 'local'
      ? '\033[35m'
      : '\033[36m';

    var node = {
      label: color + branch.name + '\033[m'
        + ' \033[90m' + (branch.version || branch.ref || '') + '\033[m',
      nodes: []
    };

    if (++depth > max) return node;

    Object.keys(branch.dependencies).forEach(function (name) {
      node.nodes.push(traverse(branch.dependencies[name]));
    });

    Object.keys(branch.locals).forEach(function (name) {
      node.nodes.push(traverse(branch.locals[name]));
    });

    return node;
  }
}

function indent(str) {
  return str.replace(/^/gm, '  ');
}
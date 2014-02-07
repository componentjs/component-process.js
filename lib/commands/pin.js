/**
 * Pin all semantically versioned dependencies to the satisfying
 * installed dependency in the components/ folder.
 */

var format = require('util').format;

var semver = require('semver');
var remotes = require('remotes');
var flatten = require('component-resolver').flatten;

var command = require('../command');
var config = require('../config');
var utils = require('../utils');

module.exports = function* () {
  if (command.locked) yield command.await('unlock');

  command.locked = true;

  var start = Date.now();
  console.log('\033[90m  --> pinning    \033[34m%s\033[90m\'s ranged dependencies\033[0m', config.name);

  var local = new remotes.local();
  var fns = [];

  flatten(command.tree)
  .filter(function (branch) {
    return branch.type === 'local';
  })
  .forEach(function (branch) { fns.push(function* () {
    var component;
    var json = branch.node;
    var fns = [];
    var updates = [];
    var logs = [];

    push(json.dependencies || {}, false);
    push((json.development || {}).dependencies || {}, true);

    yield fns;

    if (updates.length) {
      component = yield* utils.read(branch);
      updates.forEach(function (fn) {
        fn();
      })
      yield* utils.write(branch, component);
      console.log('  \033[90m    pinning:   \033[35m%s\033[90m', branch.name)
      console.log(logs.join('\n'));
    }

    function push(deps, dev) {
      Object.keys(deps).forEach(function (name) {
        var version = deps[name];
        if (!isRange(version)) return;
        fns.push(function* () {
          var versions = yield* local.getVersions(name);
          if (!versions || !versions.length) throw new Error('you need to reinstall first.');

          var latest = semver.maxSatisfying(versions, version);

          updates.push(function () {
            // to do: backwards compatibility
            var dep = dev
              ? component.development.dependencies
              : component.dependencies;
            dep[name] = latest;
          })

          logs.push(format('                   - '
            + '\033[96m%s\033[90m "\033[33m%s\033[90m" '
            + '--> "\033[32m%s\033[90m"\033[0m',
            name,
            version,
            latest
          ))
        })
      })
    }
  })})

  yield fns;

  console.log('\033[90m  <-- pinned     \033[34m%s\033[90m\'s ranged dependencies in \033[33m%sms\033[0m',
    config.name,
    Date.now() - start);

  command.locked = false;
  command.emit('unlock');
}

function isRange(x) {
  return semver.validRange(x)
    && !semver.valid(x);
}
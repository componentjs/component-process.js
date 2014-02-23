/**
 * Update all pinned dependencies to the latest version.
 */

var format = require('util').format;

var semver = require('semver');
var remotes = require('remotes');
var flatten = require('component-flatten');

var command = require('../command');
var config = require('../config');
var utils = require('../utils');

// should really use a channel with concurrency here
// but ideally, this should be very few components
module.exports = function* () {
  if (command.locked) yield command.await('unlock');

  command.locked = true;

  var start = Date.now();
  console.log('\033[90m  --> updating   \033[34m%s\033[90m\'s pinned dependencies\033[0m', config.name);

  var remote = new remotes(['github']);
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
      console.log('  \033[90m    updating:  \033[35m%s\033[90m', branch.name)
      console.log(logs.join('\n'));
    }

    function push(deps, dev) {
      Object.keys(deps).forEach(function (name) {
        var version = deps[name];
        if (!semver.valid(version)) return;
        fns.push(function* () {
          var r = yield* remote.resolve(name);
          if (!r) return;
          var versions = yield* r.versions(name);
          if (!versions || !versions.length) return;

          var latest = versions[0];
          if (semver.eq(version, latest)) return;

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

  console.log('\033[90m  <-- updated    \033[34m%s\033[90m\'s pinned dependencies in \033[33m%sms\033[0m',
    config.name,
    Date.now() - start);

  command.locked = false;
  command.emit('unlock');
}
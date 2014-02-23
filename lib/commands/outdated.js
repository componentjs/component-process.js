/**
 * Check all local components for outdated dependencies.
 * Does not check semantic version ranges.
 */

var semver = require('semver');
var remotes = require('remotes');
var flatten = require('component-flatten');

var command = require('../command');
var config = require('../config');

module.exports = function* () {
  var start = Date.now();
  console.log('\033[90m  --> checking   \033[34m%s\033[90m for outdated dependencies\033[0m', config.name);

  var remote = remotes(['github']);
  var fns = [];

  flatten(command.tree)
  .filter(function (branch) {
    return branch.type === 'local';
  })
  .forEach(function (branch) {
    var json = branch.node;
    push(json.dependencies || {});
    push((json.development || {}).dependencies || {});

    function push(deps) {
      Object.keys(deps).forEach(function (name) {
        var version = deps[name];
        if (!semver.valid(version)) return;
        fns.push(function* () {
          var r = yield* remote.resolve(name);
          if (!r) return;
          var versions = yield* r.versions(name);
          if (!versions || !versions.length) return;

          var latest = versions[0];
          if (!semver.gt(latest, version)) return;

          console.log('      \033[90moutdated:  '
            + '\033[35m%s\033[90m\'s dependency '
            + '\033[96m%s\033[90m\n'
            + '                   - current: \033[33m%s\033[90m\n'
            + '                   - latest:  \033[32m%s\033[0m',
            branch.name,
            name,
            version,
            latest)
        })
      })
    }
  })

  yield fns;

  console.log('\033[90m  <-- checked    \033[34m%s\033[90m for outdated dependencies in \033[33m%sms\033[0m',
    config.name,
    Date.now() - start);
}
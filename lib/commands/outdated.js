/**
 * Check all local components for outdated dependencies.
 * Does not check semantic version ranges.
 */

var co = require('co');
var semver = require('semver');
var chanel = require('chanel');
var remotes = require('remotes');
var flatten = require('component-resolver').flatten;

var command = require('../command');
var config = require('../config');

module.exports = function* () {
  var start = Date.now();
  console.log('\033[90m  --> checking   \033[34m%s\033[90m for outdated dependencies\033[0m', config.name);

  var ch = chanel();
  ch.concurrency = 5;
  ch.discard = true;

  var remote = remotes(['github']);

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
        ch.push(co(function* () {
          var r = yield* remote.resolve(name);
          if (!r) return;
          var versions = yield* r.getVersions(name);
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
        }))
      })
    }
  })

  yield* ch.flush();

  console.log('\033[90m  <-- checked    \033[34m%s\033[90m for outdated dependencies in \033[33m%sms\033[0m',
    config.name,
    Date.now() - start);
}
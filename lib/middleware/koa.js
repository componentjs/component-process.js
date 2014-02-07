var command = require('../command');

function isbundle(path) {
  var ext = /\.(js|css)$/.exec(path);
  if (!ext) return false;
  // remove leading / and extension
  path = path.slice(1, ext.index);
  ext = ext[1];
  if (~path.indexOf('/')) return false;
  var name = command.bundles[path];
  // not a bundle
  if (!name) return false;
  return {
    name: path,
    type: ext === 'js' ? 'scripts' : 'styles',
    ext: ext
  };
}

module.exports = function () {
  return function* (next) {
    var bundle = isbundle(this.path);
    if (!bundle) return yield* next;
    if (command.progress.resolve
      || command.queue.resolve
      || command.progress[bundle.type]
      || command.queue[bundle.type])
      yield command.await(bundle.type);

    this.type = bundle.ext;
    this.body = command[bundle.type][bundle.name];
  }
}
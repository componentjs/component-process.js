/**
 * script and style builder.
 * They're basically the same.
 */

var bytes = require('bytes');
var join = require('path').join;
var writeFile = require('fs').writeFile;

var command = require('../command')
var config = require('../config');

[
  ['scripts', 'js'],
  ['styles', 'css'],
].forEach(function (args) {
  var type = args[0];
  var ext = args[1];

  exports[type] = function* (options) {
    options = options || {};
    if (command.locked) return;
    if (command.queue.resolve || command.queue[type]) return;
    if (command.progress.resolve) {
      if (!options._resolver) {
        command.queue[type] = true;
        yield command.await(type);
      }
    } else if (command.progress[type]) {
      command.queue[type] = true;
      yield command.await(type);
    }

    command.queue[type] = false;
    command.progress[type] = true;

    yield Object.keys(command.bundles)
    .map(function (name) { return function* () {
      var start = Date.now();
      console.log('\033[90m  --> building   '
        + '\033[35m%s\033[90m\'s \033[96m%s\033[90m...\033[0m', name, type);

      var str
      try {
        str = yield* command[type](command.bundles[name], name, options);
        command[type] = command[type] || {};
        command[type][name] = str;

        if (options.save !== false && config.save !== false) {
          yield writeFile.bind(null,
            join(config.out, name + '.' + ext),
            str);
        }
      } catch (err) {
        end(err);
        return
      }

      console.log('\033[90m  <-- built      \033[35m%s\033[90m\'s'
        + ' \033[96m%s \033[90min '
        + '\033[33m%sms\033[90m'
        + ' - \033[37m%s\033[0m',
        name,
        type,
        Date.now() - start,
        lengthof(str));

      return str;
    }});

    end();
  }

  function end(err) {
    if (err) console.error(err.stack);
    command.progress[type] = false;
    command.emit(type);
  }
})

function lengthof(str) {
  return bytes(Buffer.byteLength(str));
}
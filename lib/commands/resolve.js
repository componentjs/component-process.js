var command = require('../command');
var config = require('../config');
var bundle = require('./bundle');
var commands = require('./');

module.exports = function* (options) {
  options = options || {};
  if (command.locked) yield command.await('unlock');
  if (command.queue.resolve) return;
  if (command.progress.resolve) {
    command.queue.resolve = true;
    yield command.await('resolved');
  }

  command.queue.resolve = false;
  command.progress.resolve = true;
  options._resolver = true;

  var start = Date.now();
  console.log('\033[90m  --> resolving  \033[34m%s\033[90m...\033[0m', config.name);

  try {
    command.tree = yield* command.resolve();
  } catch (err) {
    end(err);
    return;
  }

  console.log('\033[90m  <-- resolved   '
    + '\033[34m%s\033[90m '
    + 'in \033[33m%sms\033[0m', config.name, Date.now() - start);

  start = Date.now();
  console.log('\033[90m  --> bundling   \033[34m%s\033[90m...\033[0m', config.name);
  yield* bundle();
  console.log('\033[90m  <-- bundled    \033[34m%s\033[90m in \033[33m%sms\033[0m', config.name, Date.now() - start)

  yield [
    commands.scripts(options),
    commands.styles(options),
    commands.files(options),
  ];

  end();
}

function end(err) {
  if (err) console.error(err.stack);
  command.progress.resolve = false;
  command.emit('resolved');
}
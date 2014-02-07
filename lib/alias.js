var commands = require('./commands');

function alias(actual) {
  if (!commands[actual]) throw new Error('no command by the name of "' + actual + '"');

  [].slice.call(arguments, 1).forEach(function (alias) {
    Object.defineProperty(commands, alias, {
      enumerable: false,
      configurable: true,
      get: function () {
        return commands[actual];
      }
    });
  });
}

alias('update',
  'u',
  'up');
alias('pin',
  'p');
alias('outdated',
  'o',
  'out',
  'old');
alias('lint',
  'l');
alias('size',
  'sz',
  'z');
alias('rm',
  're',
  'ri');
alias('resolve',
  'i',
  'r',
  'b',
  'm',
  'install',
  'build',
  'make');
alias('scripts',
  's',
  'j',
  'sc',
  'js');
alias('styles',
  'c',
  'cs',
  'css',
  'st');
alias('files',
  'f');
alias('quit',
  'q',
  'esc',
  'exit');
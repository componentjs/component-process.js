var fs = require('fs');

fs.readdirSync(__dirname).filter(function (x) {
  return x[0] !== '.';
}).forEach(function (command) {
  command = command.replace('.js', '');
  exports[command] = require('./' + command);
});

exports.scripts = exports._build_strings.scripts;
exports.styles = exports._build_strings.styles;
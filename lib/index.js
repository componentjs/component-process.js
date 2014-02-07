var fs = require('fs');
var join = require('path').join;

var command = module.exports = require('./command');

fs.readdirSync(join(__dirname, 'methods'))
.filter(function (fn) {
  return fn[0] !== '.';
})
.forEach(function (fn) {
  fn = fn.replace('.js', '');
  command[fn] = require('./methods/' + fn);
})

command.config = require('./config');
command.middleware = require('./middleware/node');
command.koa = require('./middleware/koa');

require('./alias');

setImmediate(function () {
  command('resolve');
});

process.stdin.setEncoding('utf8');
process.stdin.on('data', function (data) {
  data = data.trim();
  if (!data) return;
  command(data);
});

command('watch');
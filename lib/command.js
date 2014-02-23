/* jshint proto:true */

var co = require('co');
var EventEmitter = require('events').EventEmitter;

module.exports = command;

var commands = command.commands = require('./commands');

/**
 * This is the "main" exported function.
 * This is also an emitter, mostly for handling states.
 *
 * @param {String} command
 * @param {Object} options
 * @api public
 */

function command(str, options, callback) {
  str = str.trim().toLowerCase();
  options = options || {};
  var fn = commands[str];
  if (!fn) return unknown(str);

  if (isGeneratorFunction(fn)) co(fn)(callback || onerror);
  else fn();
}

function unknown(command) {
  console.error('  \033[90mnot a command command: "\033[31m%s\033[90m"\033[0m', command);
}

command.__proto__ = EventEmitter.prototype;

/**
 * Handle states of every command.
 */

command.progress = Object.create(null);
command.queue = Object.create(null);

/**
 * Await an event as a yieldable.
 *
 * @param {String}
 * @api public
 */

command.await = function (event) {
  return function (done) {
    command.once(event, done);
  }
}

function onerror(err) {
  if (err) console.error(err.stack);
}

/**
 * Check if `obj` is a generator function.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGeneratorFunction(obj) {
  return obj
    && obj.constructor
    && 'GeneratorFunction' === obj.constructor.name;
}
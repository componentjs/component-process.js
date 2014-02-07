var path = require('path');
var mkdirp = require('mkdirp');

var CONFIG = process.env.COMPONENT_PROCESS_CONFIG;

exports = module.exports = CONFIG
  ? require(path.resolve(CONFIG))
  : require('../config.json');

// custom root
exports.root = exports.root
  ? path.resolve(exports.root)
  : process.cwd();

// install path
exports.dir = path.resolve(exports.root, exports.dir || 'components');

// build path
exports.out = path.resolve(exports.root, exports.out || 'build');
mkdirp.sync(exports.out);

var json = require(path.join(exports.root, 'component.json'));
exports.name = json.name || 'component';

// lookup paths
exports.paths = exports.paths || json.paths || [];
if (!exports.paths) throw new Error('no paths?');

// bundles
if (Array.isArray(exports.bundles)) {
  /* jshint noempty:false */
  // explicitly name the bundles
} else if (exports.bundles === true) {
  // bundles are locals listed
  var locals = json.local || json.locals;
  if (Array.isArray(locals) && json.paths) exports.bundles = locals;
}

// "boot" component
var locals = json.locals || json.local;
if (!locals || !locals.length) exports.boot = exports.name;
else exports.boot = locals[0];
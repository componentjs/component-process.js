var build = require('component-builder2');

var config = require('../config');

module.exports = function* (branches, bundle, options) {
  var builder = build.scripts(branches, {
    concurrency: config.scripts.concurrency || 64,
    development: !options.release && config.development,
    require: bundle === config.boot,
  });

  // set the middleware for each field
  builder.use('scripts',
      build.plugins.js());

  builder.use('json',
      build.plugins.json());

  builder.use('templates',
      build.plugins.string());

  var str = yield builder.toStr();
  // auto-require the bundle
  // assumes `bundle` is the correct name
  str += 'require("' + bundle + '");';

  return str;
}
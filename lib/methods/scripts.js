var build = require('component-builder2');

var config = require('../config');

module.exports = function* (branches, bundle, options) {
  var builder = build.scripts(branches, {
    concurrency: config.scripts.concurrency || 64,
    development: !options.release && config.development,
    require: bundle === config.boot,
  })
    .use('scripts',
      build.plugins.js())
    .use('json',
      build.plugins.json())
    .use('templates',
      build.plugins.string());

  var str = yield builder.toStr();
  str += 'require("' + bundle + '");';

  return str;
}
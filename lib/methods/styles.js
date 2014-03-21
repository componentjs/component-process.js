var build = require('component-builder2');
var spawn = require('co-child-process');

var autoprefix = require('builder-autoprefixer');

var config = require('../config');

module.exports = function* (branches, bundle, options) {
  var builder = build.styles(branches, {
    concurrency: config.styles.concurrency || 64,
    development: !options.release && config.development,
  });

  // set the middleware for each field
  builder.use('styles',
    build.plugins.css(),
    autoprefix(),
    build.plugins.urlRewriter(config.urlPrefix || ''));

  var css = yield builder.toStr();

  if (!css) return '';

  return css;
}
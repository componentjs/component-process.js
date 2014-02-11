var build = require('component-builder2');
var spawn = require('co-child-process');

var autoprefixer = require.resolve('autoprefixer/bin/autoprefixer');

var config = require('../config');

module.exports = function* (branches, bundle, options) {
  var builder = build.styles(branches, {
    concurrency: config.styles.concurrency || 64,
    development: !options.release && config.development,
  });

  // set the middleware for each field
  builder.use('styles',
    build.plugins.css(),
    build.plugins.urlRewriter(config.urlPrefix || ''));

  var css = yield builder.toStr();
  // early return because you can't spawn a
  // process with an empty `stdin`
  if (!css) return '';

  // autoprefix in a separate process because it's pretty slow
  css = yield spawn(autoprefixer).end(css)

  return css;
}
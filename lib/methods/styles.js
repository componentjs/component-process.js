var build = require('component-builder2');
var spawn = require('co-child-process');

var autoprefixer = require.resolve('autoprefixer/bin/autoprefixer');

var config = require('../config');

module.exports = function* (branches, bundle, options) {
  var builder = build.styles(branches, {
    concurrency: config.styles.concurrency || 64,
    development: !options.release && config.development,
    urlPrefix: config.urlPrefix || '',
  })
    .use('styles', build.plugins.css());

  var css = yield builder.toStr();
  if (!css) return '';

  // autoprefix in a separate process because it's pretty slow
  css = yield spawn(autoprefixer).end(css)

  return css;
}
var fs = require('fs');
var join = require('path').join;

// read a component.json
exports.read = function* (branch) {
  var path = join(branch.path, 'component.json');
  var str = yield fs.readFile.bind(null, path, 'utf8');
  return JSON.parse(str);
}

// save a component.json
exports.write = function* (branch, json) {
  var path = join(branch.path, 'component.json');
  var str = JSON.stringify(json, null, 2);
  yield fs.writeFile.bind(null, path, str);
}
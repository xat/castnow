var fs = require('fs');
var path = require('path');
var xtend = require('xtend');
var join = path.join;
var extname = path.extname;
var debug = require('debug')('castnow:directories');

var defaults = {
  extensions: ['.mp3', '.mp4']
};

var isDir = function(path) {
  return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
};

var directories = function(opts) {
  var options = xtend(defaults, opts || {});

  var filterByExt = function(filePath) {
    return options.extensions.indexOf(extname(filePath).toLowerCase()) > -1;
  };

  return function(castnow) {
    castnow.hook('flatten', function(ev, next, stop) {
      if (!isDir(ev.input)) return next();
      debug('directory found: %s', ev.input);
      var files = fs.readdirSync(ev.input)
        .filter(filterByExt)
        .map(function(filename) {
          return join(ev.input, filename);
        });
      ev.input = files;
      stop();
    });
  };
};

module.exports = directories;

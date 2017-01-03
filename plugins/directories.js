var fs = require('fs');
var diveSync = require('diveSync');
var path = require('path');
var join = path.join;
var extname = path.extname;
var debug = require('debug')('castnow:directories');

var acceptedExtensions = {
  '.mp3': true,
  '.mp4': true
};

function filter(filePath, dir) {
  if (dir) return true;
  return acceptedExtensions[extname(filePath)];
}

var isDir = function(item) {
  return fs.existsSync(item.path) && fs.lstatSync(item.path).isDirectory();
};

// check which items in the playlist are
// actually directories and get all mp4 and
// mp3 files out of those.
var flattenFiles = function(playlist, recursive) {
  var items = [];
  playlist.forEach(function(item) {
    if (isDir(item)) {
      debug('directory found: %s', item.path);
      var opts = { recursive: recursive, filter: filter };
      diveSync(item.path, opts, function(err, file) {
        if (err) throw err;
        debug('added file %s', file);
        items.push({ path: file });
      });
      return;
    }
    items.push(item);
  });
  return items;
};

var directories = function(ctx, next) {
  if (ctx.mode !== 'launch') return next();
  ctx.options.playlist = flattenFiles(ctx.options.playlist, ctx.options.recursive);
  next();
};

module.exports = directories;

var fs = require('fs-extended');
var path = require('path');
var join = path.join;
var extname = path.extname;

var acceptedExtensions = {
  '.mp3': true,
  '.mp4': true
};

function filter(filePath) {
  return !!acceptedExtensions[extname(filePath)];
}

var isDir = function(item) {
  return fs.existsSync(item.path) && fs.lstatSync(item.path).isDirectory();
};

// check which items in the playlist are
// actually directories and get all mp4 and
// mp3 files out of those.
var flattenFiles = function(playlist) {
  var items = [];
  playlist.forEach(function(item) {
    if (isDir(item)) {
      var mediaFiles = fs.listFilesSync(item.path, { filter: filter });
      items.push.apply(items, mediaFiles.map(function(file) {
        return {
          path: join(item.path, file)
        };
      }));
      return;
    }
    items.push(item);
  });
  return items;
};

var directories = function(ctx, next) {
  if (ctx.mode !== 'launch') return next();
  ctx.options.playlist = flattenFiles(ctx.options.playlist);
  next();
};

module.exports = directories;

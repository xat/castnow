var http = require('http');
var getPort = require('get-port');
var internalIp = require('internal-ip');
var fs = require('fs-extended');
var path = require('path');

function filter(filePath) {
    return path.extname(filePath) === '.mp4';
}

var isFile = function(path) {
  return fs.existsSync(path) && fs.statSync(path).isFile();
};

var isDir = function(path) {
  return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
};

var localfile = function(ctx, next) {
  if (ctx.mode !== 'launch') return next();

  if (isDir(ctx.options.path)) {
    var list = fs.listFilesSync(ctx.options.path, { filter: filter });
    ctx.options.localPlaylist = list.map(function each(item) { return ctx.options.path + item; });
  }

  if (!isFile(ctx.options.path) && !ctx.options.localPlaylist) return next();

  var filePath = (!ctx.options.localPlaylist) ? ctx.options.path : ctx.options.localPlaylist.shift();

  getPort(function(err, port) {
    ctx.options.path = 'http://' + internalIp() + ':' + port;
    ctx.options.type = 'video/mp4';
    ctx.options.media = {
      metadata: {
        title: path.basename(filePath)
      }
    };
    http.createServer(function(req, res) {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(filePath).pipe(res);
    }).listen(port);
    next();
  });
};

module.exports = localfile;

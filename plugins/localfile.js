var http = require('http');
var getPort = require('get-port');
var internalIp = require('internal-ip');
var fs = require('fs');

var isFile = function(path) {
  return fs.existsSync(path) && fs.statSync(path).isFile();
};

var localfile = function(ctx, next) {
  if (ctx.mode === 'attach') return next();
  if (!isFile(ctx.options.path)) return next();
  var filePath = ctx.options.path;

  getPort(function(err, port) {
    ctx.options.path = 'http://' + internalIp() + ':' + port;
    ctx.options.type = 'video/mp4';
    http.createServer(function(req, res) {
      fs.createReadStream(filePath).pipe(res);
    }).listen(port);
    next();
  });
};

module.exports = localfile;

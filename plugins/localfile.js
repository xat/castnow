var http = require('http');
var getPort = require('get-port');
var internalIp = require('internal-ip');
var router = require('router');
var path = require('path');
var ip = internalIp();
var fs = require('fs');

var isFile = function(item) {
  return fs.existsSync(item.path) && fs.statSync(item.path).isFile();
};

var contains = function(arr, cb) {
  for (var i=0, len=arr.length; i<len; i++) {
    if (cb(arr[i], i)) return true;
  }
  return false;
};

var localfile = function(ctx, next) {
  if (ctx.mode !== 'launch') return next();
  if (!contains(ctx.options.playlist, isFile)) return next();

  getPort(function(err, port) {
    var route = router();
    var list = ctx.options.playlist.slice(0);

    ctx.options.playlist = list.map(function(item, idx) {
      if (!isFile(item)) return item;
      return {
        path: 'http://' + internalIp() + ':' + port + '/' + idx,
        type: 'video/mp4',
        media: {
          metadata: {
            title: path.basename(item.path)
          }
        }
      }
    });

    route.all('/{idx}', function(req, res) {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*'
      });

      fs.createReadStream(list[req.params.idx].path).pipe(res);
    });

    http.createServer(route).listen(port);
    next();
  });
};

module.exports = localfile;

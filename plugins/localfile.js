var http = require('http');
var internalIp = require('internal-ip');
var router = require('router');
var path = require('path');
var serveMp4 = require('../utils/serve-mp4');
var debug = require('debug')('castnow:localfile');
var fs = require('fs');
var mime = require('mime')

var isFile = function(item) {
  const stat = fs.statSync(item.path);
  return fs.existsSync(item.path) && fsStat.isFile() && fsStat.size > 0;
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

  var route = router();
  var list = ctx.options.playlist.slice(0);
  var ip = (ctx.options.myip || internalIp.v4.sync());
  var port = ctx.options['localfile-port'] || 4100;

  ctx.options.playlist = list.map(function(item, idx) {
    if (!isFile(item)) return item;
    var mimeType = mime.lookup(item.path);
    var type = mimeType.split('/')[0];
    if (type !== 'audio' && type !== 'video') mimeType = 'video/mp4';
    return {
      path: 'http://' + ip + ':' + port + '/' + idx,
      type: mimeType,
      media: {
        metadata: {
          filePath: item.path,
          title: path.basename(item.path)
        }
      }
    };
  });

  route.all('/{idx}', function(req, res) {
    if (!list[req.params.idx]) {
      res.statusCode = '404';
      return res.end('page not found');
    }
    debug('incoming request serving %s', list[req.params.idx].path);
    serveMp4(req, res, list[req.params.idx].path);
  });

  http.createServer(route).listen(port);
  debug('started webserver on address %s using port %s', ip, port);
  next();

};

module.exports = localfile;

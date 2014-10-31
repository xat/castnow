var http = require('http');
var getPort = require('get-port');
var internalIp = require('internal-ip');
var fs = require('fs');
var path = require('path');
var got = require('got');
var Transcoder = require('stream-transcoder');

var transcode = function(ctx, next) {
  if (ctx.mode === 'attach') return next();
  if (!ctx.options.tomp4) return next();
  var orgPath = ctx.options.path;

  getPort(function(err, port) {
    ctx.options.path = 'http://' + internalIp() + ':' + port;
    ctx.options.type = 'video/mp4';
    http.createServer(function(req, res) {
      new Transcoder(got(orgPath))
        .videoCodec('h264')
        .format('mp4')
        .stream()
        .pipe(res);
    }).listen(port);
    next();
  });
};

module.exports = transcode;

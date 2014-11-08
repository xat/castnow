var http = require('http');
var getPort = require('get-port');
var internalIp = require('internal-ip');
var got = require('got');
var Transcoder = require('stream-transcoder');

var transcode = function(ctx, next) {
  if (ctx.mode !== 'launch' || !ctx.options.tomp4) return next();
  if (ctx.options.playlist.length > 1) return next();
  var orgPath = ctx.options.playlist[0].path;

  getPort(function(err, port) {
    ctx.options.playlist[0] = {
      path: 'http://' + internalIp() + ':' + port,
      type: 'video/mp4'
    };
    ctx.options.disableTimeline = true;
    ctx.options.disableSeek = true;
    http.createServer(function(req, res) {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*'
      });
      new Transcoder(got(orgPath))
        .videoCodec('h264')
        .format('mp4')
        .custom('strict', 'experimental')
        .stream()
        .pipe(res);
    }).listen(port);
    next();
  });
};

module.exports = transcode;

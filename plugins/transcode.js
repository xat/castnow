var http = require('http');
var getPort = require('get-port');
var internalIp = require('internal-ip');
var got = require('got');
var Transcoder = require('stream-transcoder');

var transcode = function(ctx, next) {
  if (ctx.mode !== 'launch' || !ctx.options.tomp4) return next();
  var orgPath = ctx.options.path;

  getPort(function(err, port) {
    ctx.options.path = 'http://' + internalIp() + ':' + port;
    ctx.options.type = 'video/mp4';
    ctx.options.disableTimeline = true;
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

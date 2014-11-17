var http = require('http');
var getPort = require('get-port');
var internalIp = require('internal-ip');
var got = require('got');
var Transcoder = require('stream-transcoder');
var grabOpts = require('../utils/grab-opts');
var logger = require('../utils/logger');

var transcode = function(ctx, next) {
  if (ctx.mode !== 'launch' || !ctx.options.tomp4) return next();
  if (ctx.options.playlist.length > 1) return next();
  var orgPath = ctx.options.playlist[0].path;

  getPort(function(err, port) {
    var ip = ctx.options.myip || internalIp();
    ctx.options.playlist[0] = {
      path: 'http://' + ip + ':' + port,
      type: 'video/mp4'
    };
    ctx.options.disableTimeline = true;
    ctx.options.disableSeek = true;
    http.createServer(function(req, res) {
      var opts = grabOpts(ctx.options, 'ffmpeg-');
      logger.print('[transcode] incoming request for path', orgPath);
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*'
      });
      var s = got(orgPath);
      s.on('error', function(err) {
        logger.print('[transcode] got error', err);
      });

      var trans = new Transcoder(s)
        .videoCodec('h264')
        .format('mp4')
        .custom('strict', 'experimental')
        .on('finish', function() {
            logger.print('[transcode] finished transcoding');
        })
        .on('error', function(err) {
            logger.print('[transcode] transcoding error', err);
        })
        .stream();
      for (var key in opts) {
        trans.custom(key, opts[key]);
      }
      trans.pipe(res);
    }).listen(port);
    logger.print('[transcode] started webserver on address', ip, 'using port', port);
    next();
  });
};

module.exports = transcode;

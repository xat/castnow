var readTorrent = require('read-torrent');
var peerflix = require('peerflix');
var internalIp = require('internal-ip');
var subtitles = require('./subtitles');

var torrent = function(ctx, next) {
  if (ctx.mode !== 'launch') return next();

  if (!/^magnet:/.test(ctx.options.path) &&
      !/torrent$/.test(ctx.options.path) &&
      !ctx.options.torrent) return next();

  readTorrent(ctx.options.path, function(err, torrent) {
    if (err) return next();

    var engine = peerflix(torrent);
    engine.server.once('listening', function() {
      ctx.options.path = 'http://'+internalIp()+':'+engine.server.address().port;
      ctx.options.media = {
        metadata: {
          title: engine.server.index.name
        }
      };
      ctx.options.type = 'video/mp4';
      subtitles(ctx);
      next();
    });
  });
};

module.exports = torrent;

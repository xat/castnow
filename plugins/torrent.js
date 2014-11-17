var readTorrent = require('read-torrent');
var peerflix = require('peerflix');
var internalIp = require('internal-ip');
var grabOpts = require('../utils/grab-opts');
var logger = require('../utils/logger');

var torrent = function(ctx, next) {
  if (ctx.mode !== 'launch') return next();
  if (ctx.options.playlist.length > 1) return next();
  var path = ctx.options.playlist[0].path;

  if (!/^magnet:/.test(path) &&
      !/torrent$/.test(path) &&
      !ctx.options.torrent) return next();

  readTorrent(path, function(err, torrent) {
    if (err) {
      logger.print('[torrent] error reading torrent', err);
      return next();
    }
    var engine = peerflix(torrent, grabOpts(ctx.options, 'peerflix-'));
    var ip = ctx.options.myip || internalIp();
    engine.server.once('listening', function() {
      logger.print('[torrent] started webserver on address', ip, 'using port', engine.server.address().port);
      ctx.options.playlist[0] = {
        path: 'http://' + ip + ':' + engine.server.address().port,
        type: 'video/mp4',
        media: {
          metadata: {
            title: engine.server.index.name
          }
        }
      };
      next();
    });
  });
};

module.exports = torrent;

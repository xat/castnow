var readTorrent = require('read-torrent');
var peerflix = require('peerflix');
var internalIp = require('internal-ip');

var torrent = function(ctx, next) {
  if (ctx.mode === 'attach' || !ctx.options.torrent) return next();
  readTorrent(ctx.options.path, function(err, torrent) {
    if (err) return next();
    var engine = peerflix(torrent);
    engine.server.once('listening', function() {
      ctx.options.path = 'http://'+internalIp()+':'+engine.server.address().port;
      ctx.options.type = 'video/mp4';
      next();
    });
  });
};

module.exports = torrent;

var isUrl = require('is-url');
var debug = require('debug')('castnow:url');

var url = function(castnow) {
  var playlist = castnow.getPlaylist();

  castnow.hook('resolve', function(ev, done, stop) {
    var item = ev.item;
    if (!isUrl(item.getSource())) return done();

    debug('url detected', item.getSource());

    item.setArgs({
      autoplay: true,
      currentTime: 0,
      media: {
        contentId: item.getSource(),
        contentType: 'video/mp4',
        streamType: 'BUFFERED'
      }
    });

    item.enable();
    stop();
  });

};

module.exports = url;

var isUrl = require('is-url');
var debug = require('debug')('castnow:url');

var url = function(castnow) {

  castnow.addItemCreator('url', function(o, cb) {
    var opts = {};
    var item;
    var url;

    if (typeof o === 'string') {
      opts.source = o;
    } else {
      opts = o;
    }

    if (!isUrl(opts.source)) return cb(new Error('not a valid url'));

    item = castnow.createBlankItem();
    item.setSource(opts.source);

    item.setArgs({
      autoplay: true,
      currentTime: opts.start || 0,
      media: {
        contentId: opts.source,
        contentType: 'video/mp4',
        streamType: 'BUFFERED'
      }
    });

    return cb(null, item);
  });

  castnow.hook('resolve', function(ev, done, stop) {
    var input = ev.input;
    if (!isUrl(item.source)) return done();

    debug('url detected', item.source);

    castnow.createItem('url', input, function(err, item) {
      if (err) return stop(err);
      ev.item = item;
      return stop();
    });
  }, 500);

};

module.exports = url;

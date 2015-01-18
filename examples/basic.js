var castnow = require('../castnow')();
var scanner = require('chromecast-scanner');
var keypress = require('keypress');
var engine = castnow.getEngine();
var pl = castnow.getPlaylist();

// plugins
var urlPlugin = require('../plugins/url');
var youtubePlugin = require('../plugins/youtube');
var youtubePlaylistPlugin = require('../plugins/youtubeplaylist');

// register plugins
castnow.use(urlPlugin);
castnow.use(youtubePlugin);
castnow.use(youtubePlaylistPlugin);

var list = [
  'https://www.youtube.com/watch?v=JskztPPSJwY',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/ED_1280.mp4',
  'https://www.youtube.com/watch?v=pcVRrlmpcWk',
  'https://www.youtube.com/playlist?list=PLrIJmi5XabBPNDJ_YyC-KNa_cZ6SwTOYC'
];

castnow.resolve(list, function(err, items) {
  if (err) return console.log('could not resolve items');

  console.log('%s items resolved', items.length);

  pl.append.apply(pl, items);
  scanner(function(err, service) {
    if (err) return console.log('chromecast not found');

    castnow.connect(service.address, function(err) {
      if (err) return console.log('chromecast connection failed');
      keypress(process.stdin);
      process.stdin.setRawMode(true);
      process.stdin.resume();

      pl.load();

      console.log('use the arrow keys to jump back and forward in the playlist');

      process.stdin.on('keypress', function(ch, key) {
        if (key && key.name) {
          if (key.name === 'left') {
            return pl.prev(function(err) {
              if (!err) console.log('jumped to prev item');
            });
          }
          if (key.name === 'right') {
            return pl.next(function(err) {
              if (!err) console.log('jumped to next item');
            });
          }
        }
        if (key && key.ctrl && key.name === 'c') {
          process.exit();
        }
      });
    });
  });
});

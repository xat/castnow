var got = require('got');
var parser = require('xml2js').parseString;
var debug = require('debug')('castnow:youtubeplaylist');
var queryExtend = require('query-extend');

var getYoutubeItemUrl = function(id) {
  return 'https://www.youtube.com/watch?v=' + id;
};

var getApiUrl = function(id) {
  return 'https://gdata.youtube.com/feeds/api/playlists/' + id + '?v=2&max-results=50';
};

var isYoutubePlaylist = function(input) {
  return /youtube/.test(input) && /playlist\?list/.test(input);
};

var getListId = function(url) {
  return queryExtend(url, true).list;
};

var getPlaylistItems = function(id, cb) {
  got(getApiUrl(id), function get(err, data, res) {
    if (err || res.statusCode !== 200) return cb(null, [])
    parser(data, { normalizeTags: true, explicitArray: true }, function(err, result) {
      if (err) return cb(null, []);
      var videos = result.feed.entry.map(function(entry) {
        return getYoutubeItemUrl(entry['media:group'][0]['yt:videoid']);
      });
      cb(null, videos);
    });
  });
};

var youtubePlaylist = function(castnow) {

  castnow.hook('flatten', function(ev, next, stop) {
    var input = ev.input;
    if (!isYoutubePlaylist(input)) return next();

    debug('youtube playlist detected %s', input);

    getPlaylistItems(getListId(input), function(err, videos) {
      ev.input = videos;
      stop();
    });
  });

};

module.exports = youtubePlaylist;

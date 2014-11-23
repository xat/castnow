var url = require('url');
var got = require('got');
var qs = require('query-string');
var parser = require('xml2js').parseString;
var debug = require('debug')('castnow:youtubeplaylist');

function getPlaylistItems(id, callback) {

  got('https://gdata.youtube.com/feeds/api/playlists/' + id + '?v=2&max-results=50', function get(err, data, res) {

    var videos = [];

    if (!err && res.statusCode === 200) {
      return parser(data, { normalizeTags: true, explicitArray: true }, function parse(err, result) {

        var i;

        for (i = 0; i < result.feed.entry.length; i++) {
          videos.push({path: 'https://www.youtube.com/watch?v=' + result.feed.entry[i]['media:group'][0]['yt:videoid']});
        }

        callback(videos);

      });
    }

    if (err) { console.log(err.stack); }

    callback(videos);

  });

}

function updatePlaylist(stash, ctx, next) {
  var out = [], i;

  for (i = 0; i < ctx.options.playlist.length; i++) {
    if (!stash[ctx.options.playlist[i]]) {
        out.push(ctx.options.playlist[i]);
    } else {
        out = out.concat(stash[ctx.options.playlist[i]]);
    }
  }
  ctx.options.playlist = out;
  next();
}

var youtubePlaylist = function youtubePlaylist(ctx, next) {

  if (ctx.mode !== 'launch') return next();

  var items = [], stash = {}, count = 0, i;

  for (i = 0; i < ctx.options.playlist.length; i++) {
      if (/youtube/.test(ctx.options.playlist[i].path) && /playlist\?list/.test(ctx.options.playlist[i].path)) {
        debug('loading youtube playlist %s', ctx.options.playlist[i].path);
        items.push(qs.parse(url.parse(ctx.options.playlist[i].path).query).list);
        ctx.options.playlist[i] = items.length;
      }
  }

  if (!items.length) return next();

  items.forEach(function grabDetails(item) {
    getPlaylistItems(item, function get(found) {
      count = count + 1;
      stash[count] = found;
      if (count === items.length) { updatePlaylist(stash, ctx, next); }
    });
  });

};

module.exports = youtubePlaylist;

var request = require('request'),
    cheerio = require('cheerio'),
    url = require('url'),
    qs = require('query-string');

function getPlaylistItems(path, callback) {

    'use strict';

    request('https://www.youtube.com/playlist?list=' + path, function get(err, res, body) {

        var videos = [];

        if (!err && res.statusCode === 200) {

            var $ = cheerio.load(body),
                list = $('#pl-load-more-destination').children('tr'),
                keys = Object.keys(list);

            keys.forEach(function each(item) {
                if (list[item].attribs) { videos.push({path: 'https://www.youtube.com/watch?v=' + list[item].attribs['data-video-id']}); }
            });

            return callback(videos);

        }

        if (err) { console.log(err.stack); }

        callback(videos);

    });
}

module.exports = function filerOutYoutubePlaylist(data, callback) {

    'use strict';

    var items = [], out = [], stash = {}, count = 0, i;

    var updateArgs = function updateArgs() {
        for (i = 0; i < data.playlist.length; i++) {
            if (!stash[data.playlist[i]]) {
                out.push(data.playlist[i]);
            } else {
                out = out.concat(stash[data.playlist[i]]);
            }
        }
        callback({playlist: out});
    };

    for (i = 0; i < data.playlist.length; i++) {
        if (/youtube/.test(data.playlist[i].path) && /playlist\?list/.test(data.playlist[i].path)) {
            items.push(qs.parse(url.parse(data.playlist[i].path).query).list);
            data.playlist[i] = items.length;
        }
    }

    if (!items.length) { return callback(data); }

    items.forEach(function grabDetails(item) {
        getPlaylistItems(item, function get(found) {
            count = count + 1;
            stash[count] = found;
            if (count === items.length) { updateArgs(); }
        });
    });

};

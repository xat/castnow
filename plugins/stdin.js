var http = require('http');
var internalIp = require('internal-ip');
var debug = require('debug')('castnow:stdin');

var isStdin = function(item) {
    return '-'===item.path;
};


var stdin = function(ctx, next) {
    debug(ctx.options.playlist);
    if (ctx.mode !== 'launch') return next();
    if (ctx.options.playlist.length != 1 || !isStdin(ctx.options.playlist[0])) return next();

    var port = ctx.options['stdin-port'] || 4104;
    var ip = ctx.options.myip || internalIp.v4.sync();
    ctx.options.playlist[0] = {
        path: 'http://' + ip + ':' + port,
        type: 'video/mp4'
    };

    http.createServer(function(req, res){
        process.stdin.pipe(res);
    }).listen(port);

    debug('started webserver for stdin on address %s using port %s', ip, port);
    next();

};

module.exports = stdin;

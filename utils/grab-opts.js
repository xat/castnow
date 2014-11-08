module.exports = function(options, prefix) {
  var opts = {};
  var len = prefix.length;
  for (var key in options) {
    if (key.substr(0, len) === prefix) {
      opts[key.substr(len)] = options[key];
    }
  }
  return opts;
};

var os = require('os');

// change a time-string in the format 'xx:xx:xx'
// or 'xx:xx' to seconds
var unformatTime = function(str) {
  return str.split(':')
    .reverse()
    .map(function(val, i) {
      return parseInt(val, 10) * Math.pow(60, i);
    })
    .reduce(function(a, b) {
      return a + b;
    }, 0);
};

// create unique ids
var uniqueId = function(start) {
  var c = start || 0;
  return function() {
    return c++;
  };
};

// basic key/val store
var store = function() {
  var memo = {};
  return {
    get: function(key) {
      return memo[key];
    },
    set: function(key, val) {
      memo[key] = val;
    }
  };
};

// count how many characters in two strings
// overlap, starting from the beginning
// and ending as soon there is a non-matching
// character
var overlapCount = function(str1, str2) {
  var len = Math.min(str1.length, str2.length);
  var i = 0;
  for (; i<len; i++) {
    if (str1[i] !== str2[i]) return i;
  }
  return len;
};

// get the local ip which matches
// the most with the given compare-ip
// Notice: since we don't know the subnetmask
// of our local network adapters overlap
// checking is better than nothing.
var guessIp = function(compare) {
  var interfaces = os.networkInterfaces();
  var memo = [];
  if (!compare) compare = '';

  Object.keys(interfaces).forEach(function(i) {
    interfaces[i].forEach(function(i2) {
      if (!i2.internal && i2.family === 'IPv4') {
        i2.overlap = overlapCount(i2.address, compare);
        memo.push(i2);
      }
    });
  });

  return memo
    .reduce(function(a, b) {
      return a.overlap > b.overlap ? a : b;
    }).address;
};

module.exports = {
  unformatTime: unformatTime,
  uniqueId: uniqueId,
  store: store,
  guessIp: guessIp
};

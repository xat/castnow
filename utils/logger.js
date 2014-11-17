var on = false;

module.exports.print = function() {
  if (!on) return;
  console.log.apply(console, arguments);
};

module.exports.on = function() {
  on = true;
};

module.exports.off = function() {
  on = false;
};

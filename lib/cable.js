var Cable;

Cable = (function() {
  function Cable(channels) {
    this.channels = channels;
  }

  Cable.prototype.channel = function(name) {
    return this.channels[name];
  };

  Cable.prototype.setChannel = function(name, channel) {
    return this.channels[name] = channel;
  };

  return Cable;

})();

module.exports = Cable;

var __slice = Array.prototype.slice;
module.exports = {
  startDebugging: function() {
    return this.debugging = true;
  },
  stopDebugging: function() {
    return this.debugging = null;
  },
  log: function() {
    var messages;
    messages = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (this.debugging) {
      messages.push(Date.now());
      return console.log.apply(console, ["[ActionCable]"].concat(__slice.call(messages)));
    }
  }
};

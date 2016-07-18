var ActionCable, Consumer;

Consumer = require('./consumer');

ActionCable = {
  createConsumer: function(url) {
    return new Consumer(this.createWebSocketURL(url));
  },
  createWebSocketURL: function(url) {
    var a;
    if (url && !/^wss?:/i.test(url)) {
      a = document.createElement('a');
      a.href = url;
      a.href = a.href;
      a.protocol = a.protocol.replace('http', 'ws');
      return a.href;
    } else {
      return url;
    }
  }
};

module.exports = ActionCable;

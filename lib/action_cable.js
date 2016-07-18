var Consumer, default_mount_path, startDebugging, stopDebugging, _ref;
Consumer = require('./action_cable/consumer');
default_mount_path = require('./action_cable/constants').default_mount_path;
_ref = require('./action_cable/log'), startDebugging = _ref.startDebugging, stopDebugging = _ref.stopDebugging;
module.exports = {
  createConsumer: function(url) {
    var _ref2;
    if (url == null) {
      url = (_ref2 = this.getConfig("url")) != null ? _ref2 : default_mount_path;
    }
    return new Consumer(this.createWebSocketURL(url));
  },
  getConfig: function(name) {
    var element;
    element = document.head.querySelector("meta[name='action-cable-" + name + "']");
    return element != null ? element.getAttribute("content") : void 0;
  },
  createWebSocketURL: function(url) {
    var a;
    if (url && !/^wss?:/i.test(url)) {
      a = document.createElement("a");
      a.href = url;
      a.href = a.href;
      a.protocol = a.protocol.replace("http", "ws");
      return a.href;
    } else {
      return url;
    }
  },
  debug: {
    start: startDebugging,
    stop: stopDebugging
  }
};

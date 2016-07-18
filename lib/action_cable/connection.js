var Connection, ConnectionMonitor, log, message_types, protocols, supportedProtocols, unsupportedProtocol, _i, _ref;
var __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __indexOf = Array.prototype.indexOf || function(item) {
  for (var i = 0, l = this.length; i < l; i++) {
    if (this[i] === item) return i;
  }
  return -1;
};
ConnectionMonitor = require('./connection_monitor');
_ref = require('./constants'), message_types = _ref.message_types, protocols = _ref.protocols;
log = require('./log').log;
supportedProtocols = 2 <= protocols.length ? __slice.call(protocols, 0, _i = protocols.length - 1) : (_i = 0, []), unsupportedProtocol = protocols[_i++];
Connection = (function() {
  Connection.reopenDelay = 500;
  function Connection(consumer) {
    this.consumer = consumer;
    this.open = __bind(this.open, this);
    this.subscriptions = this.consumer.subscriptions;
    this.monitor = new ConnectionMonitor(this);
    this.disconnected = true;
  }
  Connection.prototype.send = function(data) {
    if (this.isOpen()) {
      this.webSocket.send(JSON.stringify(data));
      return true;
    } else {
      return false;
    }
  };
  Connection.prototype.open = function() {
    if (this.isActive()) {
      log("Attempted to open WebSocket, but existing socket is " + (this.getState()));
      throw new Error("Existing connection must be closed before opening");
    } else {
      log("Opening WebSocket, current state is " + (this.getState()) + ", subprotocols: " + protocols);
      if (this.webSocket != null) {
        this.uninstallEventHandlers();
      }
      this.webSocket = new WebSocket(this.consumer.url, protocols);
      this.installEventHandlers();
      this.monitor.start();
      return true;
    }
  };
  Connection.prototype.close = function(_arg) {
    var allowReconnect, _ref2;
    allowReconnect = (_arg != null ? _arg : {
      allowReconnect: true
    }).allowReconnect;
    if (!allowReconnect) {
      this.monitor.stop();
    }
    if (this.isActive()) {
      return (_ref2 = this.webSocket) != null ? _ref2.close() : void 0;
    }
  };
  Connection.prototype.reopen = function() {
    log("Reopening WebSocket, current state is " + (this.getState()));
    if (this.isActive()) {
      try {
        return this.close();
      } catch (error) {
        return log("Failed to reopen WebSocket", error);
      } finally {
        log("Reopening WebSocket in " + this.constructor.reopenDelay + "ms");
        setTimeout(this.open, this.constructor.reopenDelay);
      }
    } else {
      return this.open();
    }
  };
  Connection.prototype.getProtocol = function() {
    var _ref2;
    return (_ref2 = this.webSocket) != null ? _ref2.protocol : void 0;
  };
  Connection.prototype.isOpen = function() {
    return this.isState("open");
  };
  Connection.prototype.isActive = function() {
    return this.isState("open", "connecting");
  };
  Connection.prototype.isProtocolSupported = function() {
    var _ref2;
    return _ref2 = this.getProtocol(), __indexOf.call(supportedProtocols, _ref2) >= 0;
  };
  Connection.prototype.isState = function() {
    var states, _ref2;
    states = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return _ref2 = this.getState(), __indexOf.call(states, _ref2) >= 0;
  };
  Connection.prototype.getState = function() {
    var state, value, _ref2;
    for (state in WebSocket) {
      value = WebSocket[state];
      if (value === ((_ref2 = this.webSocket) != null ? _ref2.readyState : void 0)) {
        return state.toLowerCase();
      }
    }
    return null;
  };
  Connection.prototype.installEventHandlers = function() {
    var eventName, handler;
    for (eventName in this.events) {
      handler = this.events[eventName].bind(this);
      this.webSocket["on" + eventName] = handler;
    }
  };
  Connection.prototype.uninstallEventHandlers = function() {
    var eventName;
    for (eventName in this.events) {
      this.webSocket["on" + eventName] = function() {};
    }
  };
  Connection.prototype.events = {
    message: function(event) {
      var identifier, message, type, _ref2;
      if (!this.isProtocolSupported()) {
        return;
      }
      _ref2 = JSON.parse(event.data), identifier = _ref2.identifier, message = _ref2.message, type = _ref2.type;
      switch (type) {
        case message_types.welcome:
          this.monitor.recordConnect();
          return this.subscriptions.reload();
        case message_types.ping:
          return this.monitor.recordPing();
        case message_types.confirmation:
          return this.subscriptions.notify(identifier, "connected");
        case message_types.rejection:
          return this.subscriptions.reject(identifier);
        default:
          return this.subscriptions.notify(identifier, "received", message);
      }
    },
    open: function() {
      log("WebSocket onopen event, using '" + (this.getProtocol()) + "' subprotocol");
      this.disconnected = false;
      if (!this.isProtocolSupported()) {
        log("Protocol is unsupported. Stopping monitor and disconnecting.");
        return this.close({
          allowReconnect: false
        });
      }
    },
    close: function(event) {
      log("WebSocket onclose event");
      if (this.disconnected) {
        return;
      }
      this.disconnected = true;
      this.monitor.recordDisconnect();
      return this.subscriptions.notifyAll("disconnected", {
        willAttemptReconnect: this.monitor.isRunning()
      });
    },
    error: function() {
      return log("WebSocket onerror event");
    }
  };
  return Connection;
})();
module.exports = Connection;

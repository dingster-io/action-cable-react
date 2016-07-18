var Subscription, Subscriptions;
var __slice = Array.prototype.slice;
Subscription = require('./subscription');
Subscriptions = (function() {
  function Subscriptions(consumer) {
    this.consumer = consumer;
    this.subscriptions = [];
  }
  Subscriptions.prototype.create = function(channelName, mixin) {
    var channel, params, subscription;
    channel = channelName;
    params = typeof channel === "object" ? channel : {
      channel: channel
    };
    subscription = new Subscription(this.consumer, params, mixin);
    return this.add(subscription);
  };
  Subscriptions.prototype.add = function(subscription) {
    this.subscriptions.push(subscription);
    this.consumer.ensureActiveConnection();
    this.notify(subscription, "initialized");
    this.sendCommand(subscription, "subscribe");
    return subscription;
  };
  Subscriptions.prototype.remove = function(subscription) {
    this.forget(subscription);
    if (!this.findAll(subscription.identifier).length) {
      this.sendCommand(subscription, "unsubscribe");
    }
    return subscription;
  };
  Subscriptions.prototype.reject = function(identifier) {
    var subscription, _i, _len, _ref, _results;
    _ref = this.findAll(identifier);
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      subscription = _ref[_i];
      this.forget(subscription);
      this.notify(subscription, "rejected");
      _results.push(subscription);
    }
    return _results;
  };
  Subscriptions.prototype.forget = function(subscription) {
    var s;
    this.subscriptions = (function() {
      var _i, _len, _ref, _results;
      _ref = this.subscriptions;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        s = _ref[_i];
        if (s !== subscription) {
          _results.push(s);
        }
      }
      return _results;
    }).call(this);
    return subscription;
  };
  Subscriptions.prototype.findAll = function(identifier) {
    var s, _i, _len, _ref, _results;
    _ref = this.subscriptions;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      s = _ref[_i];
      if (s.identifier === identifier) {
        _results.push(s);
      }
    }
    return _results;
  };
  Subscriptions.prototype.reload = function() {
    var subscription, _i, _len, _ref, _results;
    _ref = this.subscriptions;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      subscription = _ref[_i];
      _results.push(this.sendCommand(subscription, "subscribe"));
    }
    return _results;
  };
  Subscriptions.prototype.notifyAll = function() {
    var args, callbackName, subscription, _i, _len, _ref, _results;
    callbackName = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    _ref = this.subscriptions;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      subscription = _ref[_i];
      _results.push(this.notify.apply(this, [subscription, callbackName].concat(__slice.call(args))));
    }
    return _results;
  };
  Subscriptions.prototype.notify = function() {
    var args, callbackName, subscription, subscriptions, _i, _len, _results;
    subscription = arguments[0], callbackName = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
    if (typeof subscription === "string") {
      subscriptions = this.findAll(subscription);
    } else {
      subscriptions = [subscription];
    }
    _results = [];
    for (_i = 0, _len = subscriptions.length; _i < _len; _i++) {
      subscription = subscriptions[_i];
      _results.push(typeof subscription[callbackName] === "function" ? subscription[callbackName].apply(subscription, args) : void 0);
    }
    return _results;
  };
  Subscriptions.prototype.sendCommand = function(subscription, command) {
    var identifier;
    identifier = subscription.identifier;
    return this.consumer.send({
      command: command,
      identifier: identifier
    });
  };
  return Subscriptions;
})();
module.exports = Subscriptions;

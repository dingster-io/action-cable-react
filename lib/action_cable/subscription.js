var EventEmitter, Subscription,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

EventEmitter = require('eventemitter3');

Subscription = (function(superClass) {
  extend(Subscription, superClass);

  function Subscription(subscriptions, params, actions) {
    this.subscriptions = subscriptions;
    if (params == null) {
      params = {};
    }
    this.actions = actions != null ? actions : [];
    this.identifier = JSON.stringify(params);
    this.subscriptions.add(this);
    this.consumer = this.subscriptions.consumer;
  }

  Subscription.prototype.perform = function(action, data) {
    if (data == null) {
      data = {};
    }
    data.action = action;
    return this.send(data);
  };

  Subscription.prototype.send = function(data) {
    return this.consumer.send({
      command: 'message',
      identifier: this.identifier,
      data: JSON.stringify(data)
    });
  };

  Subscription.prototype.unsubscribe = function() {
    return this.subscriptions.remove(this);
  };

  Subscription.prototype.connected = function() {
    return this.emit('connected');
  };

  Subscription.prototype.disconnected = function() {
    return this.emit('disconnected');
  };

  Subscription.prototype.rejected = function() {
    return this.emit('rejected');
  };

  Subscription.prototype.received = function(data) {
    var ref;
    if (ref = data.action, indexOf.call(this.actions, ref) >= 0) {
      return this.emit(data.action, data);
    } else {
      return this.emit('received', data);
    }
  };

  return Subscription;

})(EventEmitter);

module.exports = Subscription;

var ConnectionMonitor, log;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
log = require('./log').log;
ConnectionMonitor = (function() {
  var clamp, now, secondsSince;
  ConnectionMonitor.pollInterval = {
    min: 3,
    max: 30
  };
  ConnectionMonitor.staleThreshold = 6;
  function ConnectionMonitor(connection) {
    this.connection = connection;
    this.visibilityDidChange = __bind(this.visibilityDidChange, this);
    this.reconnectAttempts = 0;
  }
  ConnectionMonitor.prototype.start = function() {
    if (!this.isRunning()) {
      this.startedAt = now();
      delete this.stoppedAt;
      this.startPolling();
      document.addEventListener("visibilitychange", this.visibilityDidChange);
      return log("ConnectionMonitor started. pollInterval = " + (this.getPollInterval()) + " ms");
    }
  };
  ConnectionMonitor.prototype.stop = function() {
    if (this.isRunning()) {
      this.stoppedAt = now();
      this.stopPolling();
      document.removeEventListener("visibilitychange", this.visibilityDidChange);
      return log("ConnectionMonitor stopped");
    }
  };
  ConnectionMonitor.prototype.isRunning = function() {
    return (this.startedAt != null) && !(this.stoppedAt != null);
  };
  ConnectionMonitor.prototype.recordPing = function() {
    return this.pingedAt = now();
  };
  ConnectionMonitor.prototype.recordConnect = function() {
    this.reconnectAttempts = 0;
    this.recordPing();
    delete this.disconnectedAt;
    return log("ConnectionMonitor recorded connect");
  };
  ConnectionMonitor.prototype.recordDisconnect = function() {
    this.disconnectedAt = now();
    return log("ConnectionMonitor recorded disconnect");
  };
  ConnectionMonitor.prototype.startPolling = function() {
    this.stopPolling();
    return this.poll();
  };
  ConnectionMonitor.prototype.stopPolling = function() {
    return clearTimeout(this.pollTimeout);
  };
  ConnectionMonitor.prototype.poll = function() {
    return this.pollTimeout = setTimeout(__bind(function() {
      this.reconnectIfStale();
      return this.poll();
    }, this), this.getPollInterval());
  };
  ConnectionMonitor.prototype.getPollInterval = function() {
    var interval, max, min, _ref;
    _ref = this.constructor.pollInterval, min = _ref.min, max = _ref.max;
    interval = 5 * Math.log(this.reconnectAttempts + 1);
    return Math.round(clamp(interval, min, max) * 1000);
  };
  ConnectionMonitor.prototype.reconnectIfStale = function() {
    if (this.connectionIsStale()) {
      log("ConnectionMonitor detected stale connection. reconnectAttempts = " + this.reconnectAttempts + ", pollInterval = " + (this.getPollInterval()) + " ms, time disconnected = " + (secondsSince(this.disconnectedAt)) + " s, stale threshold = " + this.constructor.staleThreshold + " s");
      this.reconnectAttempts++;
      if (this.disconnectedRecently()) {
        return log("ConnectionMonitor skipping reopening recent disconnect");
      } else {
        log("ConnectionMonitor reopening");
        return this.connection.reopen();
      }
    }
  };
  ConnectionMonitor.prototype.connectionIsStale = function() {
    var _ref;
    return secondsSince((_ref = this.pingedAt) != null ? _ref : this.startedAt) > this.constructor.staleThreshold;
  };
  ConnectionMonitor.prototype.disconnectedRecently = function() {
    return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
  };
  ConnectionMonitor.prototype.visibilityDidChange = function() {
    if (document.visibilityState === "visible") {
      return setTimeout(__bind(function() {
        if (this.connectionIsStale() || !this.connection.isOpen()) {
          log("ConnectionMonitor reopening stale connection on visibilitychange. visbilityState = " + document.visibilityState);
          return this.connection.reopen();
        }
      }, this), 200);
    }
  };
  now = function() {
    return new Date().getTime();
  };
  secondsSince = function(time) {
    return (now() - time) / 1000;
  };
  clamp = function(number, min, max) {
    return Math.max(min, Math.min(max, number));
  };
  return ConnectionMonitor;
})();
module.exports = ConnectionMonitor;

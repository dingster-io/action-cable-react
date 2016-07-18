var Connection, ConnectionMonitor, Consumer, Subscription, Subscriptions;

Connection = require('./connection');

ConnectionMonitor = require('./connection_monitor');

Subscriptions = require('./subscriptions');

Subscription = require('./subscription');

Consumer = (function() {
  function Consumer(url) {
    this.url = url;
    this.subscriptions = new Subscriptions(this);
    this.connection = new Connection(this);
    this.connectionMonitor = new ConnectionMonitor(this);
  }

  Consumer.prototype.send = function(data) {
    return this.connection.send(data);
  };

  Consumer.prototype.inspect = function() {
    return JSON.stringify(this, null, 2);
  };

  Consumer.prototype.toJSON = function() {
    return {
      url: this.url,
      subscriptions: this.subscriptions,
      connection: this.connection,
      connectionMonitor: this.connectionMonitor
    };
  };

  return Consumer;

})();

module.exports = Consumer;

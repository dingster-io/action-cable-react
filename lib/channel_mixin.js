var ChannelMixin, _capitalize;

_capitalize = require('lodash.capitalize');

ChannelMixin = function() {
  var channelNames;
  channelNames = Array.prototype.slice.call(arguments);
  return {
    componentDidMount: function() {
      var action, actionMethod, cable, channel, i, len, results;
      cable = this.props.cable || this.context.cable;
      this.mounted = true;
      results = [];
      for (i = 0, len = channelNames.length; i < len; i++) {
        channel = channelNames[i];
        if (cable.channel(channel)) {
          if (this.handleConnected != null) {
            cable.channel(channel).on('connected', this.handleConnected);
          }
          if (this.handleDisconnected != null) {
            cable.channel(channel).on('disconnected', this.handleDisconnected);
          }
          if (this.handleDisconnected != null) {
            cable.channel(channel).on('rejected', this.handleDisconnected);
          }
          if (this.handleReceived != null) {
            cable.channel(channel).on('received', this.handleReceived);
          }
          results.push((function() {
            var j, len1, ref, results1;
            ref = cable.channel(channel).actions;
            results1 = [];
            for (j = 0, len1 = ref.length; j < len1; j++) {
              action = ref[j];
              actionMethod = "handle" + (_capitalize(action));
              if (this[actionMethod] != null) {
                results1.push(cable.channel(channel).on(action, this[actionMethod]));
              } else {
                results1.push(void 0);
              }
            }
            return results1;
          }).call(this));
        } else {
          results.push(void 0);
        }
      }
      return results;
    },
    componentWillUnmount: function() {
      var action, actionMethod, cable, channel, i, len, results;
      cable = this.props.cable || this.context.cable;
      this.mounted = false;
      results = [];
      for (i = 0, len = channelNames.length; i < len; i++) {
        channel = channelNames[i];
        if (cable.channel(channel)) {
          if (this.handleConnected != null) {
            cable.channel(channel).removeListener('connected', this.handleConnected);
          }
          if (this.handleDisconnected != null) {
            cable.channel(channel).removeListener('disconnected', this.handleDisconnected);
          }
          if (this.handleDisconnected != null) {
            cable.channel(channel).removeListener('rejected', this.handleDisconnected);
          }
          if (this.handleReceived != null) {
            cable.channel(channel).removeListener('received', this.handleReceived);
          }
          results.push((function() {
            var j, len1, ref, results1;
            ref = cable.channel(channel).actions;
            results1 = [];
            for (j = 0, len1 = ref.length; j < len1; j++) {
              action = ref[j];
              actionMethod = "handle" + (_capitalize(action));
              if (this[actionMethod] != null) {
                results1.push(cable.channel(channel).removeListener(action, this[actionMethod]));
              } else {
                results1.push(void 0);
              }
            }
            return results1;
          }).call(this));
        } else {
          results.push(void 0);
        }
      }
      return results;
    },
    perform: function(channel, action, data) {
      var cable;
      if (data == null) {
        data = {};
      }
      cable = this.props.cable || this.context.cable;
      return cable.channel(channel).perform(action, data);
    }
  };
};

ChannelMixin.componentWillMount = function() {
  throw new Error('ActionCableReact.ChannelMixin is a function that takes one or more ' + 'store names as parameters and returns the mixin, e.g.: ' + 'mixins: [ActionCableReact.ChannelMixin("Channel1", "Channel2")]');
};

module.exports = ChannelMixin;

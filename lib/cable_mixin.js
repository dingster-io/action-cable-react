var CableMixin;

CableMixin = function(React) {
  return {
    componentWillMount: function() {
      var namePart;
      if (!(this.props.cable || (this.context && this.context.cable))) {
        namePart = this.constructor.displayName ? ' of ' + this.constructor.displayName : '';
        throw new Error("Could not find cable on this.props or this.context" + namePart);
      }
    },
    childContextTypes: {
      cable: React.PropTypes.object
    },
    contextTypes: {
      cable: React.PropTypes.object
    },
    getChildContext: function() {
      return {
        cable: this.getCable()
      };
    },
    getCable: function() {
      return this.props.cable || this.context && this.context.cable;
    }
  };
};

CableMixin.componentWillMount = function() {
  throw new Error('ActionCableReact.CableMixin is a function that takes React as a ' + 'parameter and returns the mixin, e.g.: mixins: [ActionCableReact.CableMixin(React)]');
};

module.exports = CableMixin;

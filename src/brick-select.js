(function () {

  var BrickSelectElementPrototype = Object.create(HTMLElement.prototype);

  // Lifecycle methods

  BrickSelectElementPrototype.createdCallback = function () {

  };

  BrickSelectElementPrototype.attachedCallback = function () {

  };

  BrickSelectElementPrototype.detachedCallback = function () {

  };

  BrickSelectElementPrototype.attributeChangedCallback = function (attr, oldVal, newVal) {
    if (attr in attrs) {
      attrs[attr].call(this, oldVal, newVal);
    }
  };

  // Attribute handlers

  var attrs = {
    'attr': function (oldVal, newVal) {

    }
  };

  // Custom methods

  BrickSelectElementPrototype.foo = function () {

  };

  // Property handlers

  Object.defineProperties(BrickSelectElementPrototype, {
    'prop': {
      get : function () {

      },
      set : function (newVal) {

      }
    }
  });

  // Register the element

  window.BrickSelectElement = document.registerElement('brick-select', {
    prototype: BrickSelectElementPrototype
  });

})();

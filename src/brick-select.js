/* global Platform */

(function () {

  var currentScript = document._currentScript || document.currentScript;
  var importDoc = currentScript.ownerDocument;

  var BrickSelectElementPrototype = Object.create(HTMLElement.prototype);

  // Attribute handlers

  var attrs = {
  };

  // Lifecycle methods

  BrickSelectElementPrototype.createdCallback = function () {
    this.ns = { };

    // HACK: Hide the <select> and jus tleave the proxy visible.
    this.style.display = 'none';
  };

  BrickSelectElementPrototype.attachedCallback = function () {
    var self = this;

    var proxy = this.ns.proxy = document.createElement('brick-select-proxy');
    this.parentNode.insertBefore(proxy, this);
    proxy.select = this;
  };

  BrickSelectElementPrototype.detachedCallback = function () {
    this.parentNode.removeChild(this.ns.proxy);
  };

  BrickSelectElementPrototype.attributeChangedCallback = function (attr, oldVal, newVal) {
    if (attr in attrs) {
      attrs[attr].call(this, oldVal, newVal);
    }
  };

  // Custom methods

  // Property handlers

  Object.defineProperties(BrickSelectElementPrototype, {
    options: {
      get: function () {
        return this.querySelectorAll('option');
      }
    }
  });

  // Register the element

  window.BrickSelectElement = document.registerElement('brick-select', {
    prototype: BrickSelectElementPrototype,
    extends: 'select'
  });

})();

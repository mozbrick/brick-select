/* global Platform */

(function () {

  var currentScript = document._currentScript || document.currentScript;
  var importDoc = currentScript.ownerDocument;

  var BrickSelectElementPrototype = Object.create(HTMLSelectElement.prototype);

  BrickSelectElementPrototype.createdCallback = function () {
    this.ns = { };

    // HACK: Hide the <select> and just leave the proxy visible.
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

  window.BrickSelectElement = document.registerElement('brick-select', {
    prototype: BrickSelectElementPrototype,
    extends: 'select'
  });

})();

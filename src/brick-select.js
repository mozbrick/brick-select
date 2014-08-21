(function () {
  var BrickSelectElementPrototype = Object.create(HTMLSelectElement.prototype);

  BrickSelectElementPrototype.createdCallback = function () {
    this.ns = { };

    // HACK: Hide the <select> and just leave the proxy visible.
    this.style.display = 'none';
  };

  BrickSelectElementPrototype.attachedCallback = function () {
    var proxy = this.ns.proxy = document.createElement('brick-select-proxy');
    this.parentNode.insertBefore(proxy, this);
    proxy.proxyForSelect(this);
  };

  BrickSelectElementPrototype.detachedCallback = function () {
    this.parentNode.removeChild(this.ns.proxy);
  };

  window.BrickSelectElement = document.registerElement('brick-select', {
    prototype: BrickSelectElementPrototype,
    extends: 'select'
  });
})();

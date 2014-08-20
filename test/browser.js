/* jshint expr: true */
/* global chai, before, describe, it */

var expect = chai.expect;

var ready;
before(function (done) {
  ready = done;
});

window.addEventListener('WebComponentsReady', function() {
  document.head.innerHTML += '<link rel="import" id="el" href="/base/src/brick-select.html">';
  document.querySelector('#el').addEventListener('load', function () {
    ready();
  });
});

describe('<select is="brick-select">', function () {
  var select;

  before(function (done) {
    select = document.createElement('select');
    select.setAttribute('is', 'brick-select');
    document.body.appendChild(select);

    setTimeout(done, 0); // HACK: Yield to let components set up.
  });

  it("should be attached to the DOM", function () {
    expect(document.querySelector("select")).not.to.be.null;
  });

  it('should be visually hidden', function () {
    expect(select.style.display).to.equal('none');
  });

  describe("injected <brick-select-proxy>", function () {
    var proxy;

    before(function () {
      proxy = document.querySelector('brick-select-proxy');
    });

    it('should exist', function () {
      expect(proxy).not.to.be.null;
    });

    it("should be associated with the injecting <select>", function () {
      expect(proxy.select).to.equal(select);
    });

  });

});

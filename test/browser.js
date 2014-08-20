/* jshint expr: true */
/* global chai, before, describe, it */

describe('<select is="brick-select" name="select1">', function () {
  var select, label;

  before(function (done) {
    select = document.createElement('select');
    select.setAttribute('name', 'select1');
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
    var proxy, dialog, handle, menu;

    before(function () {
      proxy = document.querySelector('brick-select-proxy');
      dialog = proxy.shadowRoot.querySelector('.dialogue');
      menu = proxy.shadowRoot.querySelector('.menu');
      handle = proxy.shadowRoot.querySelector('.handle');
    });

    beforeEach(function () {
      dialog.removeAttribute('show');
    });

    it('should exist', function () {
      expect(proxy).not.to.be.null;
    });

    it("should be associated with the injecting <select>", function () {
      expect(proxy.select).to.equal(select);
    });

    it('should reveal a dialog when the handle is clicked', function (done) {
      expect(dialog.hasAttribute('show')).to.be.false;
      click(handle);
      setTimeout(function () {
        expect(dialog.hasAttribute('show')).to.be.true;
        return done();
      }, 0);
    });

    describe('<label for="select1">', function () {
      var label;

      before(function () {
        label = document.createElement('label');
        label.setAttribute('for', select.getAttribute('name'));
        document.body.appendChild(label);
      });

      it('should reveal <brick-select-proxy> dialog when clicked', function (done) {
        expect(dialog.hasAttribute('show')).to.be.false;
        click(label);
        setTimeout(function () {
          expect(dialog.hasAttribute('show')).to.be.true;
          return done();
        }, 0);
      });

    });

    describe('<select> with <options>', function () {
      var options = [
        ['alpha', 'Alpha'],
        ['beta', 'Beta'],
        ['gamma', 'Gamma']
      ];

      beforeEach(function () {
        while (select.firstChild) {
          select.removeChild(select.firstChild);
        }
        options.forEach(function (pair) {
          var option = document.createElement('option');
          option.setAttribute('value', pair[0]);
          option.textContent = pair[1];
          select.appendChild(option);
        });
      });

      it('should update dialog with options when shown', function (done) {
        expect(menu.childNodes.length).to.equal(0);
        proxy.show();
        setTimeout(function () {
          var items = menu.childNodes;
          expect(items.length).to.equal(options.length);
          for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var expected = options[i];
            expect(item.getAttribute('data-value')).to.equal(expected[0]);
            expect(item.querySelector('.label').textContent).to.equal(expected[1]);
          }
          return done();
        }, 0);
      });

    });

  });

});

/*
 * Appendix: Setup & utility functions
 */

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


function click (el) {
  el.dispatchEvent(new MouseEvent('click', {
    view: window, bubbles: true, cancelable: true
  }));
}

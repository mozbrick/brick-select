/* jshint expr: true */
/* global chai, before, describe, it */

describe('<select is="brick-select" name="select1">', function () {
  var form, select, proxy, label;

  before(function (done) {
    form = document.createElement('form');
    form.setAttribute('id', 'form1');
    document.body.appendChild(form);

    if (navigator.userAgent.indexOf('Chrome/') !== -1) {

      // FIXME: For some reason, web components extending elements do not work
      // in karma. So, in the interests of at least running the rest of the
      // tests, let's simulate the proxy injection for now.
      // See also https://groups.google.com/forum/#!topic/polymer-dev/_990SYWcxHM

      select = document.createElement('select');
      select.setAttribute('name', 'select1');
      select.style.display = 'none';
      form.appendChild(select);

      proxy = document.createElement('brick-select-proxy');
      proxy.setAttribute('for', 'select1');
      form.insertBefore(proxy, select);

    } else {

      // In Firefox, at least, the extended element works as expected.
      select = document.createElement('select');
      select.setAttribute('name', 'select1');
      select.setAttribute('is', 'brick-select');
      form.appendChild(select);

    }

    setTimeout(done, 0); // HACK: Yield to let components set up.
  });

  it("should be attached to the DOM", function () {
    expect(document.querySelector("select")).not.to.be.null;
  });

  it('should be visually hidden', function () {
    expect(select.style.display).to.equal('none');
  });

  describe("<brick-select-proxy> injected by <select>", function () {
    var dialog, handle, close, menu;

    before(function () {
      proxy = document.querySelector('brick-select-proxy');
      dialog = proxy.shadowRoot.querySelector('.dialogue');
      menu = proxy.shadowRoot.querySelector('.menu');
      handle = proxy.shadowRoot.querySelector('.handle');
      close = proxy.shadowRoot.querySelector('.close');
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

      it('should reveal dialog when clicked', function (done) {
        expect(dialog.hasAttribute('show')).to.be.false;
        click(label);
        setTimeout(function () {
          expect(dialog.hasAttribute('show')).to.be.true;
          return done();
        }, 0);
      });

    });

    describe('<select> with <options> and handle clicked', function () {

      var options = [
        ['alpha', 'Alpha'],
        ['beta', 'Beta'],
        ['gamma', 'Gamma']
      ];

      beforeEach(function (done) {
        select.removeAttribute('multiple');
        while (select.firstChild) {
          select.removeChild(select.firstChild);
        }
        options.forEach(function (pair) {
          var option = document.createElement('option');
          option.setAttribute('value', pair[0]);
          option.textContent = pair[1];
          select.appendChild(option);
        });
        click(handle);
        setTimeout(function () {
          return done();
        }, 0);
      });

      it('should initialize dialog from <option>s', function () {
        var items = menu.childNodes;
        expect(items.length).to.equal(options.length);
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var expected = options[i];
          expect(item.getAttribute('data-value')).to.equal(expected[0]);
          expect(item.querySelector('.label').textContent).to.equal(expected[1]);
        }
      });

      it('should update when <option>s change and dialog is reopened', function (done) {
        expect(menu.childNodes.length).to.equal(options.length);

        var option = document.createElement('option');
        option.setAttribute('value', 'delta');
        option.textContent = 'Delta';
        select.appendChild(option);

        click(close);
        click(handle);

        setTimeout(function () {
          expect(menu.childNodes.length).to.equal(options.length + 1);
          return done();
        }, 0);
      });

      it('should update selected <option> on item click', function (done) {
        var expectedIndex = 1;
        var items = menu.querySelectorAll('li');

        click(items[expectedIndex]);

        setTimeout(function () {
          var optionNodes = select.querySelectorAll('option');
          for (var i = 0; i < optionNodes.length; i++) {
            expect(optionNodes[i].hasAttribute('selected'))
              .to.be[i === expectedIndex];
          }
          expect(select.selectedIndex).to.equal(expectedIndex);
          expect(document.forms[0].select1.value)
            .to.equal(options[expectedIndex][0]);
          return done();
        }, 0);
      });

      it('<select> emit a `change` event on item click', function (done) {
        var changeReceived = false;
        function handler () {
          changeReceived = true;
          select.removeEventListener('change', handler);
        }
        select.addEventListener('change', handler);

        var expectedIndex = 1;
        var items = menu.querySelectorAll('li');

        click(items[expectedIndex]);

        setTimeout(function () {
          expect(changeReceived).to.be.true;
          return done();
        }, 0);
      });

      it('should allow only one item to be selected at a time', function (done) {
        var items = menu.querySelectorAll('li');
        items[0].classList.add('selected');
        click(items[1]);
        setTimeout(function () {

          expect(items[0].classList.contains('selected')).to.be.false;
          expect(items[1].classList.contains('selected')).to.be.true;

          var options = select.querySelectorAll('option');
          expect(options[0].hasAttribute('selected')).to.be.false;
          expect(options[1].hasAttribute('selected')).to.be.true;

          expect(select.selectedIndex).to.equal(1);

          return done();
        }, 0);
      });

      it('should hide the dialog immediately on item click', function (done) {
        expect(dialog.hasAttribute('show')).to.be.true;
        click(menu.querySelectorAll('li')[0]);

        setTimeout(function () {
          expect(isHidden(dialog)).to.be.true;
          return done();
        }, 0);
      });

      it('should hide the dialog on close button click', function (done) {
        expect(dialog.hasAttribute('show')).to.be.true;
        click(dialog.querySelector('.close'));

        setTimeout(function () {
          expect(isHidden(dialog)).to.be.true;
          return done();
        }, 0);
      });

      it('should not have the multiple attribute', function () {
        expect(proxy.hasAttribute('multiple')).to.be.false;
      });

      describe('<select multiple>', function () {

        beforeEach(function (done) {
          select.setAttribute('multiple', true);
          click(close);
          click(handle);
          setTimeout(function () {
            return done();
          }, 0);
        });

        it('should have the multiple attribute', function () {
          expect(proxy.hasAttribute('multiple')).to.be.true;
        });

        it('should not hide the dialog immediately on item click', function (done) {
          expect(dialog.hasAttribute('show')).to.be.true;
          click(menu.querySelectorAll('li')[0]);
          setTimeout(function () {
            expect(!isHidden(dialog)).to.be.true;
            return done();
          }, 0);
        });

        it('should not change the backing <select> when button.cancel is clicked', function (done) {
          click(menu.querySelectorAll('li')[0]);
          click(dialog.querySelector('button.cancel'));
          setTimeout(function () {
            var option = select.querySelectorAll('option')[0];
            expect(option.hasAttribute('selected')).to.be.false;
            return done();
          }, 0);
        });

        it('should change the backing <select> when button.commit is clicked', function (done) {
          click(menu.querySelectorAll('li')[0]);
          click(dialog.querySelector('button.commit'));
          setTimeout(function () {
            var option = select.querySelectorAll('option')[0];
            expect(option.hasAttribute('selected')).to.be.true;
            return done();
          }, 0);
        });

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

function isHidden (dialog) {
  // FIXME: Should be able to defer until animation has completed.
  return (!dialog.hasAttribute('show') ||
          'out' === dialog.getAttribute('show'));
}

function click (el) {
  var ev = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  });
  el.dispatchEvent(ev);
}

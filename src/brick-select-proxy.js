/* global Platform */

(function () {

  var currentScript = document._currentScript || document.currentScript;
  var importDoc = currentScript.ownerDocument;

  var BrickSelectProxyElementPrototype = Object.create(HTMLElement.prototype);

  // Attributes
  var attrs = {
    "for": function (oldVal, newVal) {
      var name = this.ns['for'] = newVal;
      this.select = document.querySelector('select[name="' + name + '"]');
    }
  };

  // Properties
  var props = {
    "select": {
      get: function () {
        return this.ns.select;
      },
      set: function (el) {
        return this.proxyForSelect(el);
      }
    }
  };

  // Magical property boilerplating based on attributes
  function makeProp (name) {
    return {
      get: function () {
        return this.ns[name];
      },
      set: function (newVal) {
        return this.attributeChangedCallback(name, this.ns[name], newVal);
      }
    };
  }
  for (var name in attrs) {
    if (!props.hasOwnProperty(name)) {
      props[name] = makeProp(name);
    }
  }

  Object.defineProperties(BrickSelectProxyElementPrototype, props);

  // Lifecycle methods

  var TMPL_ROOT = 'template#brick-select-template';
  var TMPL_ITEM = 'template#brick-select-option-template';

  BrickSelectProxyElementPrototype.createdCallback = function () {
    this.ns = { };

    var template = importDoc.querySelector(TMPL_ROOT);

    shimShadowStyles(template.content.querySelectorAll('style'),
                     'brick-select-proxy');

    var shadowRoot = this.createShadowRoot();
    shadowRoot.appendChild(template.content.cloneNode(true));

    var title = this.getAttribute('title');
    if (title) {
      shadowRoot.querySelector('header h1').textContent = title;
    } else {
      var header = shadowRoot.querySelector('header');
      header.parentNode.removeChild(header);
    }

    shadowRoot.querySelector('button.handle span').textContent = title;

    for (var k in attrs) {
      if (this.hasAttribute(k)) {
        attrs[k].call(this, null, this.getAttribute(k));
      }
    }
  };

  BrickSelectProxyElementPrototype.attachedCallback = function () {
    var self = this;
    var shadowRoot = this.shadowRoot;

    this.updateSelectFromDialog();

    // Intercept <label> clicks to show select dialog
    document.addEventListener('click', function (ev) {
      if (!self.select) { return; }
      var sel = 'label[for="' + self.select.getAttribute('name') + '"]';
      return delegate(sel, function (ev) {
        self.show();
        return stopEvent(ev);
      })(ev);
    });

    // Clicks on the visible select handle button shows the dialog
    shadowRoot.querySelector('button.handle')
      .addEventListener('click', function (ev) {
        self.show();
        return stopEvent(ev);
      });

    shadowRoot.querySelector('button.close')
      .addEventListener('click', function (ev) {
        self.hide();
        return stopEvent(ev);
      });

    shadowRoot.addEventListener('click', function (ev) {
      if (ev.target === self.shadowRoot.querySelector('.dialogue')) {
        self.hide();
      } else {
        delegate('.menu-item', function (ev) {
          self.animateMenuItemClick(this, ev);
          if (self.select && self.select.hasAttribute('multiple')) {
            self.toggleSelected(this);
          } else {
            self.setSelected(this);
            self.hide();
          }
        })(ev);
      }
      return stopEvent(ev);
    });

  };

  BrickSelectProxyElementPrototype.detachedCallback = function () {
  };

  BrickSelectProxyElementPrototype.attributeChangedCallback = function (attr, oldVal, newVal) {
    if (attr in attrs) {
      attrs[attr].call(this, oldVal, newVal);
    }
  };

  // Custom methods

  BrickSelectProxyElementPrototype.show = function () {
    this.updateDialogFromSelect();

    var dialogue = this.shadowRoot.querySelector('.dialogue');
    dialogue.setAttribute('show', 'in');

    function animEnd () {
      this.removeEventListener('animationend', animEnd);
      this.removeEventListener('webkitAnimationEnd', animEnd);
      dialogue.setAttribute('show', '');
    }
    dialogue.querySelector('.panel').addEventListener('animationend', animEnd);
    dialogue.querySelector('.panel').addEventListener('webkitAnimationEnd', animEnd);
  };

  BrickSelectProxyElementPrototype.hide = function () {
    var dialogue = this.shadowRoot.querySelector('.dialogue');
    dialogue.setAttribute('show', 'out');

    function animEnd (ev) {
      if (ev.target !== this) { return; }
      this.removeEventListener('animationend', animEnd);
      this.removeEventListener('webkitAnimationEnd', animEnd);
      dialogue.removeAttribute('show');
    }
    dialogue.addEventListener('animationend', animEnd, false);
    dialogue.addEventListener('webkitAnimationEnd', animEnd, false);
  };

  BrickSelectProxyElementPrototype.proxyForSelect = function (select) {
    this.ns.select = select;
    if (select) { this.updateDialogFromSelect(); }
    return select;
  };

  BrickSelectProxyElementPrototype.setSelected = function (el) {
    this.clearSelected(false);
    el.setAttribute('selected', true);
    this.updateSelectFromDialog();
  };

  BrickSelectProxyElementPrototype.clearSelected = function (update) {
    var selected = this.shadowRoot.querySelectorAll('li[selected]');
    for (var i = 0; i < selected.length; i++) {
      selected[i].removeAttribute('selected');
    }
    if (update !== false) {
      this.updateSelectFromDialog();
    }
  };

  BrickSelectProxyElementPrototype.toggleSelected = function (el) {
    var sel = el.hasAttribute('selected');
    if (!sel) {
      el.setAttribute('selected', true);
    } else {
      el.removeAttribute('selected');
    }
    this.updateSelectFromDialog();
  };

  BrickSelectProxyElementPrototype.updateDialogFromSelect = function () {
    var menu = this.shadowRoot.querySelector('ul.menu');

    // Clear out any existing items.
    while (menu.firstChild) {
      menu.removeChild(menu.firstChild);
    }

    // Bail out if there's no associated <select>
    if (!this.ns.select) { return; }

    // Clone dialog menu items from <options>s in the <select>.
    var itemTemplateContent = importDoc.querySelector(TMPL_ITEM).content;
    var options = this.ns.select.querySelectorAll('option');
    for (var i = 0; i < options.length; i++) {
      var option = options[i];
      var item = itemTemplateContent.cloneNode(true).querySelector('li');
      if (option.hasAttribute('selected')) {
        item.setAttribute('selected', true);
      }
      item.setAttribute('data-value', option.getAttribute('value'));
      item.querySelector('.label').innerHTML = option.innerHTML;
      menu.appendChild(item);
    }

    this.updateHandleText();
  };

  BrickSelectProxyElementPrototype.updateSelectFromDialog = function () {
    // Bail if there's no associated <select>
    if (!this.ns.select) { return; }

    // Deselect all options, map by value.
    var options = this.ns.select.querySelectorAll('option');
    var optionsByValue = {};
    for (var i = 0; i < options.length; i++) {
      var option = options[i];
      option.removeAttribute('selected');
      optionsByValue[option.getAttribute('value')] = option;
    }

    // Walk through all the selected items in the dialog
    var selected = this.shadowRoot.querySelectorAll('li[selected]');
    for (var i = 0; i < selected.length; i++) {
      var item = selected[i];
      var value = item.getAttribute('data-value');

      // Flag the selected light <option>, if available.
      if (optionsByValue[value]) {
        optionsByValue[value].setAttribute('selected', true);
      }
    }

    this.updateHandleText();
  };

  // Update the handle button label with the list of selections
  BrickSelectProxyElementPrototype.updateHandleText = function () {
    var names = [];
    var selected = this.shadowRoot.querySelectorAll('li[selected]');
    for (var i = 0; i < selected.length; i++) {
      names.push(selected[i].querySelector('.label').textContent);
    }
    this.shadowRoot.querySelector('button.handle span')
        .textContent = names.join(', ');
  };

  BrickSelectProxyElementPrototype.animateMenuItemClick = function (item, ev) {
    var animate = this.shadowRoot.querySelector('.feedback.animate');
    if (animate) { animate.classList.remove('animate'); }

    var selected = item.querySelector('.feedback');
    if (selected) {
        // Use mouse click position as origin of the "ripple" effect
        var w = selected.parentNode.offsetWidth*2;
        selected.style.width = w+'px';
        selected.style.height = w+'px';
        selected.style.top = (w/2*-1)+(this.offsetHeight/2)+'px';
        selected.style.left = (ev.layerX-(w/2))+'px';
        selected.classList.add('animate');
    }
  };

  // Property handlers

  BrickSelectProxyElementPrototype.attributeChangedCallback = function (attr, oldVal, newVal) {
    if (!(attr in attrs)) { return; }
    attrs[attr].call(this, oldVal, newVal);
    render(this);
  };

  // Register the element

  window.BrickSelectProxyElement = document.registerElement('brick-select-proxy', {
    prototype: BrickSelectProxyElementPrototype
  });

  // Utility functions

  function shimShadowStyles(styles, tag) {
    if (!Platform.ShadowCSS) {
      return;
    }
    for (var i = 0; i < styles.length; i++) {
      var style = styles[i];
      var cssText = Platform.ShadowCSS.shimStyle(style, tag);
      Platform.ShadowCSS.addCssToDocument(cssText);
      style.remove();
    }
  }

  function delegate(selector, handler) {
    return function(e) {
      var target = e.target;
      var delegateEl = e.currentTarget;
      var matches = delegateEl.querySelectorAll(selector);
      for (var el = target; el.parentNode && el !== delegateEl; el = el.parentNode) {
        for (var i = 0; i < matches.length; i++) {
          if (matches[i] === el) {
            handler.call(el, e);
            return;
          }
        }
      }
    };
  }

  function stopEvent (ev) {
    ev.stopPropagation();
    ev.preventDefault();
    return false;
  }

})();

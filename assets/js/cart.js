(function () {
  var KEY = 'votg_cart';

  function lang() {
    return document.documentElement.lang === 'el' ? 'el' : 'en';
  }

  function copy(key) {
    var dict = {
      cart: { en: 'Cart', el: 'Καλαθι' },
      added: { en: 'added to cart', el: 'προστέθηκε στο καλάθι' },
      empty: { en: 'Your cart is empty. Add items from the catalog.', el: 'Το καλάθι είναι άδειο. Πρόσθεσε προϊόντα από τον κατάλογο.' },
      each: { en: 'each', el: 'το ένα' },
      remove: { en: 'Remove', el: 'Αφαίρεση' },
      orderSubject: { en: 'Vials On The Go Order Request', el: 'Αίτημα Παραγγελίας Vials On The Go' },
      orderGreeting: { en: 'Hello,', el: 'Γεια σας,' },
      orderIntro: { en: 'I would like to order:', el: 'Θα ήθελα να παραγγείλω:' },
      total: { en: 'Total', el: 'Σύνολο' }
    };
    return dict[key][lang()];
  }

  function getCart() {
    try {
      var raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(KEY, JSON.stringify(cart));
    updateCartUI();
  }

  function money(value) {
    return '€' + Number(value).toFixed(2);
  }

  function parseEuro(text) {
    var clean = String(text || '').replace('€', '').replace(',', '.').trim();
    var n = parseFloat(clean);
    return isNaN(n) ? 0 : n;
  }

  function itemCount(cart) {
    return cart.reduce(function (acc, i) { return acc + i.qty; }, 0);
  }

  function upsertItem(item) {
    var cart = getCart();
    var idx = cart.findIndex(function (c) { return c.id === item.id; });
    if (idx >= 0) {
      cart[idx].qty += 1;
    } else {
      cart.push(item);
    }
    saveCart(cart);
  }

  function showToast(text) {
    var old = document.querySelector('.cart-toast');
    if (old) old.remove();
    var toast = document.createElement('div');
    toast.className = 'cart-toast';
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 1800);
  }

  function ensureCartLinks() {
    if (!document.querySelector('.js-cart-cta')) {
      var cta = document.createElement('a');
      cta.href = 'cart.html';
      cta.className = 'cart-link js-cart-cta';
      cta.innerHTML = copy('cart') + ' <span class="cart-count js-cart-count">0</span>';
      var navActions = document.querySelector('.nav .nav-actions');
      var menuBtn = document.getElementById('menuBtn');
      if (navActions) {
        navActions.insertAdjacentElement('afterbegin', cta);
      } else if (menuBtn && menuBtn.parentElement) {
        menuBtn.insertAdjacentElement('beforebegin', cta);
      } else {
        var nav = document.querySelector('.nav');
        if (nav) nav.appendChild(cta);
      }
    }

    if (!document.querySelector('.cart-fab')) {
      var fab = document.createElement('a');
      fab.href = 'cart.html';
      fab.className = 'cart-fab';
      fab.innerHTML = copy('cart') + ' <span class="cart-count js-cart-count">0</span>';
      document.body.appendChild(fab);
    }
  }

  function relabelCartLinks() {
    document.querySelectorAll('.js-cart-cta, .cart-fab').forEach(function (el) {
      var count = el.querySelector('.js-cart-count');
      var qty = count ? count.textContent : '0';
      el.innerHTML = copy('cart') + ' <span class="cart-count js-cart-count">' + qty + '</span>';
    });
  }

  function updateCartUI() {
    var cart = getCart();
    var count = itemCount(cart);
    document.querySelectorAll('.js-cart-count').forEach(function (el) {
      el.textContent = count;
    });
    renderCartPage();
  }

  function bindAddButtons() {
    document.querySelectorAll('.js-add-to-cart').forEach(function (btn) {
      if (btn.dataset.bound === '1') return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', function () {
        var id = btn.dataset.id || btn.dataset.name;
        var name = btn.dataset.name || 'Product';
        var price = parseEuro(btn.dataset.price);
        var image = btn.dataset.image || '';
        upsertItem({ id: id, name: name, price: price, image: image, qty: 1 });
        showToast(name + ' ' + copy('added'));
      });
    });
  }

  function renderCartPage() {
    var list = document.getElementById('cartItems');
    var subtotalEl = document.getElementById('cartSubtotal');
    var totalEl = document.getElementById('cartTotal');
    var checkoutBtn = document.getElementById('checkoutBtn');
    if (!list) return;

    var cart = getCart();
    if (!cart.length) {
      list.innerHTML = '<p class="empty-cart">' + copy('empty') + '</p>';
      if (subtotalEl) subtotalEl.textContent = '€0.00';
      if (totalEl) totalEl.textContent = '€0.00';
      if (checkoutBtn) checkoutBtn.setAttribute('disabled', 'disabled');
      return;
    }

    var subtotal = 0;
    list.innerHTML = cart.map(function (item) {
      var line = item.price * item.qty;
      subtotal += line;
      return [
        '<article class="cart-item" data-id="' + item.id + '">',
        '  <img src="' + item.image + '" alt="' + item.name + '">',
        '  <div>',
        '    <h3 style="font-size:1.05rem;margin:0 0 6px;">' + item.name + '</h3>',
        '    <div style="color:#33424a;font-size:.9rem;">' + money(item.price) + ' ' + copy('each') + '</div>',
        '    <div class="qty-controls" style="margin-top:8px;">',
        '      <button class="qty-btn js-dec" type="button">-</button>',
        '      <strong>' + item.qty + '</strong>',
        '      <button class="qty-btn js-inc" type="button">+</button>',
        '      <button class="text-btn js-remove" type="button">' + copy('remove') + '</button>',
        '    </div>',
        '  </div>',
        '  <strong>' + money(line) + '</strong>',
        '</article>'
      ].join('');
    }).join('');

    if (subtotalEl) subtotalEl.textContent = money(subtotal);
    if (totalEl) totalEl.textContent = money(subtotal);
    if (checkoutBtn) checkoutBtn.removeAttribute('disabled');

    list.querySelectorAll('.js-inc').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.closest('.cart-item').dataset.id;
        var cart = getCart();
        var item = cart.find(function (x) { return x.id === id; });
        if (item) item.qty += 1;
        saveCart(cart);
      });
    });

    list.querySelectorAll('.js-dec').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.closest('.cart-item').dataset.id;
        var cart = getCart();
        var item = cart.find(function (x) { return x.id === id; });
        if (!item) return;
        item.qty -= 1;
        if (item.qty <= 0) {
          cart = cart.filter(function (x) { return x.id !== id; });
        }
        saveCart(cart);
      });
    });

    list.querySelectorAll('.js-remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.closest('.cart-item').dataset.id;
        var cart = getCart().filter(function (x) { return x.id !== id; });
        saveCart(cart);
      });
    });

    if (checkoutBtn) {
      checkoutBtn.onclick = function (event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        return false;
      };
    }

    var clearBtn = document.getElementById('clearCartBtn');
    if (clearBtn) {
      clearBtn.onclick = function () {
        saveCart([]);
      };
    }
  }

  ensureCartLinks();
  bindAddButtons();
  updateCartUI();
  relabelCartLinks();

  document.addEventListener('votg:languagechange', function () {
    relabelCartLinks();
    renderCartPage();
  });
})();

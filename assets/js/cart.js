(function () {
  var KEY = 'votg_cart';

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
    var topCta = document.querySelector('.nav > .cta');
    if (topCta && !document.querySelector('.js-cart-cta')) {
      var cta = document.createElement('a');
      cta.href = 'cart.html';
      cta.className = 'cta js-cart-cta';
      cta.innerHTML = 'Cart <span class="cart-count js-cart-count">0</span>';
      topCta.insertAdjacentElement('afterend', cta);
    }

    if (!document.querySelector('.cart-fab')) {
      var fab = document.createElement('a');
      fab.href = 'cart.html';
      fab.className = 'cart-fab';
      fab.innerHTML = 'Cart <span class="cart-count js-cart-count">0</span>';
      document.body.appendChild(fab);
    }
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
        showToast(name + ' added to cart');
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
      list.innerHTML = '<p class="empty-cart">Your cart is empty. Add items from the catalog.</p>';
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
        '    <div style="color:#33424a;font-size:.9rem;">' + money(item.price) + ' each</div>',
        '    <div class="qty-controls" style="margin-top:8px;">',
        '      <button class="qty-btn js-dec" type="button">-</button>',
        '      <strong>' + item.qty + '</strong>',
        '      <button class="qty-btn js-inc" type="button">+</button>',
        '      <button class="text-btn js-remove" type="button">Remove</button>',
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
      checkoutBtn.onclick = function () {
        var cart = getCart();
        var lines = cart.map(function (i) {
          return '- ' + i.name + ' x' + i.qty + ' (' + money(i.price * i.qty) + ')';
        }).join('%0D%0A');
        var total = cart.reduce(function (acc, i) { return acc + (i.price * i.qty); }, 0);
        var subject = 'Vials On The Go Order Request';
        var body = 'Hello,%0D%0A%0D%0AI would like to order:%0D%0A' + lines + '%0D%0A%0D%0ATotal: ' + money(total) + '%0D%0A';
        window.location.href = 'mailto:info@vialsonthego.com?subject=' + subject + '&body=' + body;
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
})();

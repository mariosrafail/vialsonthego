(function () {
  var AGE_KEY = 'votg_age_ok';
  var INTRO_SKIP_KEY = 'votg_skip_intro_once';
  var leavingPage = false;

  function mountIntroSplash() {
    var skipOnce = false;
    var skipFromQuery = false;
    try {
      var params = new URLSearchParams(window.location.search);
      skipFromQuery = params.get('votg_t') === '1';
      if (skipFromQuery && window.history && window.history.replaceState) {
        params.delete('votg_t');
        var q = params.toString();
        var cleanUrl = window.location.pathname + (q ? ('?' + q) : '') + window.location.hash;
        window.history.replaceState({}, '', cleanUrl);
      }
    } catch (e) {}
    try {
      skipOnce = sessionStorage.getItem(INTRO_SKIP_KEY) === '1';
      if (skipOnce) sessionStorage.removeItem(INTRO_SKIP_KEY);
    } catch (e) {}

    var firstLoad = true;
    try {
      firstLoad = sessionStorage.getItem('votg_intro_seen') !== '1';
      sessionStorage.setItem('votg_intro_seen', '1');
    } catch (e) {}

    if (skipOnce || skipFromQuery) {
      document.body.classList.add('page-entering');
      setTimeout(function () {
        document.body.classList.remove('page-entering');
      }, 760);
      return;
    }

    var mode = firstLoad ? 'long' : 'short';
    var holdMs = firstLoad ? 1650 : 560;

    if (!firstLoad) {
      document.body.classList.add('page-shift');
      setTimeout(function () {
        document.body.classList.remove('page-shift');
      }, 820);
    }

    function runWineReveal() {
      var reveal = document.createElement('div');
      reveal.className = 'wine-reveal';
      var vw = window.innerWidth || 1280;
      var vh = window.innerHeight || 720;
      var step = Math.max(130, Math.min(180, Math.floor(vw / 9)));
      var d = step * 1.08;

      for (var y = -step; y <= vh + step; y += step) {
        for (var x = -step; x <= vw + step; x += step) {
          var cell = document.createElement('span');
          cell.className = 'wine-cell';
          cell.style.setProperty('--x', String(x + (Math.random() * 10 - 5)));
          cell.style.setProperty('--y', String(y + (Math.random() * 10 - 5)));
          cell.style.setProperty('--d', String(d));
          cell.style.setProperty('--delay', String(40 + Math.floor(Math.random() * 420)));
          reveal.appendChild(cell);
        }
      }
      document.body.classList.add('reveal-site');
      document.body.appendChild(reveal);
      setTimeout(function () {
        reveal.remove();
        document.body.classList.remove('reveal-site');
      }, 1220);
    }

    var splash = document.createElement('div');
    splash.className = 'intro-splash ' + mode + (firstLoad ? ' no-bottle' : '');
    splash.id = 'introSplash';
    var bottleHtml = firstLoad ? '' : [
      '    <div class="bottle intro-bottle" aria-hidden="true">',
      '      <div class="bottle-cap"></div>',
      '      <div class="bottle-neck"></div>',
      '      <div class="bottle-body"><div class="bottle-liquid"></div></div>',
      '    </div>'
    ].join('');
    splash.innerHTML = [
      '<div class="intro-inner">',
      '  <div class="intro-logo-row">',
      bottleHtml,
      '    <div>',
      '      <p class="intro-main">VIALS</p>',
      '      <p class="intro-sub">ON THE GO</p>',
      '    </div>',
      '  </div>',
      '  <p class="intro-tag">A SIP OF ELEGANCE</p>',
      '</div>'
    ].join('');

    document.body.appendChild(splash);

    setTimeout(function () {
      if (firstLoad) {
        runWineReveal();
        splash.classList.add('text-fade');
        setTimeout(function () {
          splash.classList.add('fade');
          setTimeout(function () { splash.remove(); }, 820);
        }, 160);
      } else {
        splash.classList.add('fade');
        setTimeout(function () { splash.remove(); }, 520);
      }
    }, holdMs);
  }

  function mountAgeGate() {
    try {
      if (localStorage.getItem(AGE_KEY) === 'yes') return;
    } catch (e) {}

    var gate = document.createElement('div');
    gate.className = 'age-gate';
    gate.id = 'ageGate';
    gate.innerHTML = [
      '<div class="age-card">',
      '  <div class="logo-wrap">',
      '    <div class="bottle" aria-hidden="true">',
      '      <div class="bottle-cap"></div>',
      '      <div class="bottle-neck"></div>',
      '      <div class="bottle-body"><div class="bottle-liquid"></div></div>',
      '    </div>',
      '    <div class="logo-text">',
      '      <p class="logo-main">VIALS</p>',
      '      <p class="logo-sub">ON THE GO</p>',
      '    </div>',
      '  </div>',
      '  <p class="logo-tagline">A SIP OF ELEGANCE</p>',
      '  <p class="age-question">Are you over 18?</p>',
      '  <div class="age-actions">',
      '    <button class="age-btn yes" id="ageYes" type="button">Yes</button>',
      '    <button class="age-btn no" id="ageNo" type="button">No</button>',
      '  </div>',
      '  <p class="age-feedback" id="ageFeedback"></p>',
      '</div>'
    ].join('');

    document.body.appendChild(gate);
    document.body.style.overflow = 'hidden';

    var yes = document.getElementById('ageYes');
    var no = document.getElementById('ageNo');
    var feedback = document.getElementById('ageFeedback');

    yes.addEventListener('click', function () {
      try { localStorage.setItem(AGE_KEY, 'yes'); } catch (e) {}
      gate.classList.add('hidden');
      document.body.style.overflow = '';
      setTimeout(function () { gate.remove(); }, 700);
    });

    no.addEventListener('click', function () {
      feedback.textContent = 'Sorry, you must be 18+ to enter. :(';
    });
  }

  function mountLinkTransitions() {
    function shouldAnimateLink(anchor) {
      if (!anchor) return false;
      if (anchor.hasAttribute('download')) return false;
      if (anchor.getAttribute('target') && anchor.getAttribute('target') !== '_self') return false;

      var href = anchor.getAttribute('href');
      if (!href) return false;
      if (href.indexOf('#') === 0) return false;
      if (href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0 || href.indexOf('javascript:') === 0) return false;

      var url;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch (e) {
        return false;
      }

      if (url.origin !== window.location.origin) return false;
      if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return false;
      return true;
    }

    function goWithTransition(nextHref) {
      if (leavingPage) return;
      leavingPage = true;

      var overlay = document.createElement('div');
      overlay.className = 'nav-transition';
      overlay.innerHTML = [
        '<div class="nav-transition-inner">',
        '  <div class="nav-transition-spot"></div>',
        '  <div class="bottle nav-transition-bottle" aria-hidden="true">',
        '    <div class="bottle-cap"></div>',
        '    <div class="bottle-neck"></div>',
        '    <div class="bottle-body"><div class="bottle-liquid"></div></div>',
        '  </div>',
        '</div>'
      ].join('');

      document.body.classList.add('page-leaving');
      document.body.appendChild(overlay);

      try { sessionStorage.setItem(INTRO_SKIP_KEY, '1'); } catch (e) {}

      setTimeout(function () {
        try {
          var urlObj = new URL(nextHref, window.location.href);
          urlObj.searchParams.set('votg_t', '1');
          window.location.href = urlObj.toString();
        } catch (e) {
          var join = nextHref.indexOf('?') >= 0 ? '&' : '?';
          window.location.href = nextHref + join + 'votg_t=1';
        }
      }, 620);
    }

    document.addEventListener('click', function (event) {
      if (event.defaultPrevented) return;
      if (typeof event.button === 'number' && event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      var anchor = event.target.closest('a');
      if (!shouldAnimateLink(anchor)) return;

      event.preventDefault();
      goWithTransition(anchor.href);
    });
  }

  mountIntroSplash();
  mountAgeGate();
  mountLinkTransitions();

  var nav = document.getElementById('navWrap');
  var menuBtn = document.getElementById('menuBtn');
  var progress = document.getElementById('progress');

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });

    nav.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  if (progress) {
    var setProgress = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      progress.style.width = pct + '%';
    };
    document.addEventListener('scroll', setProgress, { passive: true });
    setProgress();
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    observer.observe(el);
  });
})();

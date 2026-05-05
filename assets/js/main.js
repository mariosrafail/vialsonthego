(function () {
  var AGE_SESSION_KEY = 'votg_age_ok_session';
  var INTRO_SKIP_KEY = 'votg_skip_intro_once';
  var LANG_KEY = 'votg_lang';
  var leavingPage = false;
  var languageSwitchTimer = null;
  var currentLang = getPreferredLanguage();

  function clampLanguage(lang) {
    return lang === 'el' ? 'el' : 'en';
  }

  function getPreferredLanguage() {
    try {
      return clampLanguage(localStorage.getItem(LANG_KEY) || document.documentElement.lang || 'en');
    } catch (e) {
      return clampLanguage(document.documentElement.lang || 'en');
    }
  }

  function getUiCopy() {
    if (currentLang === 'el') {
      return {
        introTag: 'A SIP OF ELEGANCE',
        ageQuestion: '\u0395\u03af\u03c3\u03b1\u03b9 \u03ac\u03bd\u03c9 \u03c4\u03c9\u03bd 18;',
        ageYes: '\u039d\u03b1\u03b9',
        ageNo: '\u039f\u03c7\u03b9',
        ageFeedback: '\u039b\u03c5\u03c0\u03bf\u03cd\u03bc\u03b1\u03c3\u03c4\u03b5, \u03c0\u03c1\u03ad\u03c0\u03b5\u03b9 \u03bd\u03b1 \u03b5\u03af\u03c3\u03b1\u03b9 18+ \u03b3\u03b9\u03b1 \u03bd\u03b1 \u03bc\u03c0\u03b5\u03b9\u03c2.',
        menuLabel: '\u0395\u03bd\u03b1\u03bb\u03bb\u03b1\u03b3\u03b7 \u03bc\u03b5\u03bd\u03bf\u03c5'
      };
    }

    return {
      introTag: 'A SIP OF ELEGANCE',
      ageQuestion: 'Are you over 18?',
      ageYes: 'Yes',
      ageNo: 'No',
      ageFeedback: 'Sorry, you must be 18+ to enter.',
      menuLabel: 'Toggle menu'
    };
  }

  function decodeMojibake(value) {
    var current = value || '';
    for (var i = 0; i < 3; i += 1) {
      if (!/[ÎÏÃÂâ]/.test(current)) break;
      try {
        var decoded = decodeURIComponent(escape(current));
        if (!decoded || decoded === current) break;
        current = decoded;
      } catch (e) {
        break;
      }
    }
    return current;
  }

  function fixReplacementArtifacts(value) {
    if (!value) return value;
    var v = value;
    v = v.replace(/�f/g, 'σ');
    v = v.replace(/�\./g, 'σ');
    v = v.replace(/�\?/g, 'σ');
    v = v.replace(/�,/g, 'ς');
    v = v.replace(/�/g, '');
    return v;
  }

  function normalizeGreekText(value) {
    return fixReplacementArtifacts(decodeMojibake(value || ''));
  }

  function countGreekChars(value) {
    var m = (value || '').match(/[Α-Ωα-ωΆ-ώ]/g);
    return m ? m.length : 0;
  }

  function pickLocalized(enValue, elValue) {
    if (currentLang !== 'el') return enValue;
    var fixedEl = normalizeGreekText(elValue || '');
    if (!fixedEl) return enValue;
    if (countGreekChars(fixedEl) >= 2) return fixedEl;
    return enValue;
  }

  function applyTranslations() {
    currentLang = getPreferredLanguage();
    document.documentElement.lang = currentLang;

    var body = document.body;
    if (body) {
      if (currentLang === 'el') {
        body.classList.add('lang-el');
      } else {
        body.classList.remove('lang-el');
      }

      if (body.dataset.titleEn && body.dataset.titleEl) {
        document.title = pickLocalized(body.dataset.titleEn, body.dataset.titleEl);
      }
    }

    document.querySelectorAll('[data-en-html][data-el-html]').forEach(function (el) {
      el.innerHTML = pickLocalized(el.dataset.enHtml, el.dataset.elHtml);
    });

    document.querySelectorAll('[data-en][data-el]').forEach(function (el) {
      if (el.hasAttribute('data-en-html') || el.hasAttribute('data-el-html')) return;
      el.textContent = pickLocalized(el.dataset.en, el.dataset.el);
    });

    document.querySelectorAll('[data-en-placeholder][data-el-placeholder]').forEach(function (el) {
      el.setAttribute('placeholder', pickLocalized(el.dataset.enPlaceholder, el.dataset.elPlaceholder));
    });

    document.querySelectorAll('[data-en-aria-label][data-el-aria-label]').forEach(function (el) {
      el.setAttribute('aria-label', pickLocalized(el.dataset.enAriaLabel, el.dataset.elAriaLabel));
    });

    document.querySelectorAll('[data-en-title][data-el-title]').forEach(function (el) {
      el.setAttribute('title', pickLocalized(el.dataset.enTitle, el.dataset.elTitle));
    });

    applyNavLocalization();
    applyFooterMetaLocalization();
    applyAboutTeamBios();
    applyAboutStoryText();

    document.querySelectorAll('.lang-switch button').forEach(function (btn) {
      var active = btn.dataset.lang === currentLang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    var menuBtn = document.getElementById('menuBtn');
    if (menuBtn) menuBtn.setAttribute('aria-label', getUiCopy().menuLabel);

    document.dispatchEvent(new CustomEvent('votg:languagechange', {
      detail: { lang: currentLang }
    }));
  }

  function applyAboutTeamBios() {
    if (!document.body || !document.body.classList.contains('about-page')) return;

    var bios = [
      {
        role: { en: 'Marketing', el: 'Marketing' },
        name: { en: 'Lefteris Parthenakis', el: '\u039b\u03b5\u03c5\u03c4\u03ad\u03c1\u03b7\u03c2 \u03a0\u03b1\u03c1\u03b8\u03b5\u03bd\u03ac\u03ba\u03b7\u03c2' },
        body: {
          en: "BA in Business Marketing and advertising, Minor in psychology from Florida Metropolitan University.<br><br>Twenty years of experience as a Regional Manager in promotion  sales and Marketing for Greece, Cyprus, Canada, USA, Europe and Scandinavia .  Experienced in driving revenue growth, managing relationships with key partners, and overseeing sales and marketing operations in multiple regions, providing innovative solutions to clients across a variety of industries.",
          el: "\u03a0\u03c4\u03c5\u03c7\u03b9\u03bf\u03cd\u03c7\u03bf\u03c2 Marketing \u03ba\u03b1\u03b9 \u03b4\u03b9\u03b1\u03c6\u03ae\u03bc\u03b7\u03c3\u03b7\u03c2 \u03bc\u03b5 \u03b4\u03b5\u03c5\u03c4\u03b5\u03c1\u03bf \u03c0\u03c4\u03c5\u03c7\u03af\u03bf \u03c3\u03c4\u03b7\u03bd \u03c8\u03c5\u03c7\u03bf\u03bb\u03bf\u03b3\u03af\u03b1 \u03b1\u03c0\u03bf \u03c4\u03bf \u03a0\u03b1\u03bd\u03b5\u03c0\u03b9\u03c3\u03c4\u03ae\u03bc\u03b9\u03bf \u03c4\u03b7\u03c2 \u03a6\u03bb\u03cc\u03c1\u03b9\u03bd\u03c4\u03b1.<br><br>\u0395\u03bc\u03c0\u03b5\u03b9\u03c1\u03af\u03b1 20 \u03c7\u03c1\u03bf\u03bd\u03ce\u03bd \u03c9\u03c2 \u03c5\u03c0\u03b5\u03cd\u03b8\u03c5\u03bd\u03bf\u03c2 \u03c0\u03c9\u03bb\u03ae\u03c3\u03b5\u03c9\u03bd \u03ba\u03b1\u03b9 \u03bc\u03ac\u03c1\u03ba\u03b5\u03c4\u03b9\u03bd\u03b3\u03ba \u03c3\u03b5 \u0395\u03bb\u03bb\u03ac\u03b4\u03b1,\u0391\u03bc\u03b5\u03c1\u03b9\u03ba\u03ae,\u039a\u03cd\u03c0\u03c1\u03bf,\u039a\u03b1\u03bd\u03b1\u03b4\u03ac \u03ba\u03b1\u03b9 \u0395\u03c5\u03c1\u03c9\u03c0\u03b7.<br><br>\u03a5\u03c0\u03b5\u03cd\u03b8\u03c5\u03bd\u03bf\u03c2 \u03b3\u03b9\u03b1 \u03c4\u03b7\u03bd \u03b1\u03cd\u03be\u03b7\u03c3\u03b7 \u03ba\u03b5\u03c1\u03b4\u03ce\u03bd, \u03b5\u03c0\u03af\u03b2\u03bb\u03b5\u03c8\u03b7 \u03c0\u03c9\u03bb\u03ae\u03c3\u03b5\u03c9\u03bd \u03ba\u03b1\u03b9 \u03b1\u03bd\u03ac\u03c0\u03c4\u03c5\u03be\u03b7 \u03c3\u03c7\u03ad\u03c3\u03b5\u03c9\u03bd \u03bc\u03b5\u03c4\u03b1\u03be\u03cd \u03c3\u03c5\u03bd\u03b5\u03c1\u03b3\u03b1\u03c4\u03ce\u03bd \u03bd\u03ad\u03c9\u03bd \u03ae \u03c0\u03b1\u03bb\u03b1\u03b9\u03ce\u03bd \u03c0\u03ac\u03bd\u03c4\u03b1 \u03ad\u03c4\u03bf\u03b9\u03bc\u03bf\u03c2 \u03bd\u03b1 \u03c0\u03c1\u03bf\u03c4\u03b5\u03af\u03bd\u03b5\u03b9 \u03c3\u03c4\u03c1\u03b1\u03c4\u03b7\u03b3\u03b9\u03ba\u03ae \u03ba\u03b1\u03b9 \u03bd\u03b1 \u03c0\u03c1\u03bf\u03c3\u03c6\u03b5\u03c1\u03b5\u03b9 \u03bb\u03cd\u03c3\u03b5\u03b9\u03c2 \u03c3\u03b5 \u03ba\u03ac\u03b8\u03b5 \u03c4\u03bf\u03bc\u03ad\u03b1 \u03c4\u03b7\u03c2 \u03c0\u03b1\u03c1\u03b1\u03b3\u03c9\u03b3\u03ae\u03c2."
        }
      },
      {
        role: { en: 'Chemist-Oenologist', el: '\u03a7\u03b7\u03bc\u03b9\u03ba\u03cc\u03c2-\u039f\u03b9\u03bd\u03bf\u03bb\u03cc\u03b3\u03bf\u03c2' },
        name: { en: 'Antony Melakis', el: '\u0391\u03bd\u03c4\u03ce\u03bd\u03b7\u03c2 \u039c\u03b5\u03bb\u03ac\u03ba\u03b7\u03c2' },
        body: {
          en: "Chemist licensed with chemist degree and 21 years of experience in a whole scale range of wineries in Greece. Outstanding interpersonal skills with a track record of establishing positive relationships with customers, representatives/manufacturers, agencies, organizations and providers.<br><br>Respected leader, able to train and manage teams. Dedicated to providing quality products depended on observation and technology enhancement. Great at achieving maximum growth on every enterprise he takes on.",
          el: "\u0391\u03c0\u03cc\u03c6\u03bf\u03b9\u03c4\u03bf\u03c2 \u03c4\u03bc\u03ae\u03bc\u03b1\u03c4\u03bf\u03c2 \u03a7\u03b7\u03bc\u03b5\u03af\u03b1\u03c2 \u03a0\u03b1\u03bd\u03b5\u03c0\u03b7\u03c3\u03c4\u03b9\u03bc\u03af\u03bf\u03c5 \u039a\u03c1\u03ae\u03c4\u03b7\u03c2 \u03ba\u03b1\u03b9 21 \u03c7\u03c1\u03cc\u03bd\u03b9\u03b1 \u03b5\u03bc\u03c0\u03b5\u03b9\u03c1\u03af\u03b1\u03c2 \u03c3\u03b5 \u03bc\u03b5\u03b3\u03ac\u03bb\u03b7 \u03b3\u03ba\u03ac\u03bc\u03b1 \u03bf\u03b9\u03bd\u03bf\u03c0\u03bf\u03b9\u03b5\u03af\u03c9\u03bd \u03c3\u03b5 \u03bf\u03bb\u03cc\u03ba\u03bb\u03b7\u03c1\u03b7 \u03c4\u03b7\u03bd \u0395\u03bb\u03bb\u03ac\u03b4\u03b1. \u0395\u03be\u03b1\u03b9\u03c1\u03b5\u03c4\u03b9\u03ba\u03ad\u03c2 \u03b4\u03b9\u03b1\u03c0\u03c1\u03bf\u03c3\u03c9\u03c0\u03b9\u03ba\u03ad\u03c2 \u03b4\u03b5\u03be\u03b9\u03cc\u03c4\u03b7\u03c4\u03b5\u03c2 \u03bc\u03b5 \u03b9\u03c3\u03c4\u03bf\u03c1\u03b9\u03ba\u03cc \u03b4\u03b7\u03bc\u03b9\u03bf\u03c5\u03c1\u03b3\u03af\u03b1\u03c2 \u03b8\u03b5\u03c4\u03b9\u03ba\u03ce\u03bd \u03c3\u03c7\u03ad\u03c3\u03b5\u03c9\u03bd \u03bc\u03b5 \u03c0\u03b5\u03bb\u03ac\u03c4\u03b5\u03c2, \u03b5\u03ba\u03c0\u03c1\u03bf\u03c3\u03ce\u03c0\u03bf\u03c5\u03c2/\u03ba\u03b1\u03c4\u03b1\u03c3\u03ba\u03b5\u03c5\u03b1\u03c3\u03c4\u03ad\u03c2, \u03c6\u03bf\u03c1\u03b5\u03af\u03c2, \u03bf\u03c1\u03b3\u03b1\u03bd\u03b9\u03c3\u03bc\u03bf\u03cd\u03c2 \u03ba\u03b1\u03b9 \u03c0\u03b1\u03c1\u03cc\u03c7\u03bf\u03c5\u03c2.<br><br>\u0391\u03be\u03b9\u03bf\u03c3\u03ad\u03b2\u03b1\u03c3\u03c4\u03bf\u03c2 \u03b7\u03b3\u03ad\u03c4\u03b7\u03c2, \u03b9\u03ba\u03b1\u03bd\u03cc\u03c2 \u03bd\u03b1 \u03b5\u03ba\u03c0\u03b1\u03b9\u03b4\u03b5\u03cd\u03b5\u03b9 \u03ba\u03b1\u03b9 \u03bd\u03b1 \u03b4\u03b9\u03b1\u03c7\u03b5\u03b9\u03c1\u03af\u03b6\u03b5\u03c4\u03b1\u03b9 \u03bf\u03bc\u03ac\u03b4\u03b5\u03c2. \u0391\u03c6\u03b9\u03b5\u03c1\u03c9\u03bc\u03ad\u03bd\u03bf\u03c2 \u03c3\u03c4\u03b7\u03bd \u03c0\u03b1\u03c1\u03bf\u03c7\u03ae \u03c0\u03bf\u03b9\u03bf\u03c4\u03b9\u03ba\u03ce\u03bd \u03c0\u03c1\u03bf\u03ca\u03cc\u03bd\u03c4\u03c9\u03bd \u03c0\u03bf\u03c5 \u03b5\u03be\u03b1\u03c1\u03c4\u03ce\u03bd\u03c4\u03b1\u03b9 \u03b1\u03c0\u03cc \u03c4\u03b7\u03bd \u03c0\u03b1\u03c1\u03b1\u03c4\u03ae\u03c1\u03b7\u03c3\u03b7 \u03ba\u03b1\u03b9 \u03c4\u03b7 \u03b2\u03b5\u03bb\u03c4\u03af\u03c9\u03c3\u03b7 \u03c4\u03b7\u03c2 \u03c4\u03b5\u03c7\u03bd\u03bf\u03bb\u03bf\u03b3\u03af\u03b1\u03c2. \u0395\u03be\u03b1\u03b9\u03c1\u03b5\u03c4\u03b9\u03ba\u03cc\u03c2 \u03c3\u03c4\u03bf \u03c7\u03b5\u03b9\u03c1\u03b9\u03c3\u03bc\u03cc \u03c4\u03bf\u03c5 \u03b1\u03bd\u03b8\u03c1\u03ce\u03c0\u03b9\u03bd\u03bf\u03c5 \u03b4\u03c5\u03bd\u03b1\u03bc\u03b9\u03ba\u03bf\u03cd."
        }
      }
    ];

    var cards = document.querySelectorAll('.grid-2 .card');
    cards.forEach(function (card, i) {
      var bio = bios[i];
      if (!bio) return;
      var body = card.querySelector('.card-body');
      if (!body) return;

      var roleEl = body.querySelector('.about-role');
      if (!roleEl) {
        roleEl = document.createElement('h4');
        roleEl.className = 'about-role';
        body.insertBefore(roleEl, body.firstChild);
      }
      roleEl.setAttribute('data-en', bio.role.en);
      roleEl.setAttribute('data-el', bio.role.el);
      roleEl.textContent = currentLang === 'el' ? bio.role.el : bio.role.en;

      var nameEl = body.querySelector('h3');
      if (nameEl) {
        nameEl.setAttribute('data-en', bio.name.en);
        nameEl.setAttribute('data-el', bio.name.el);
        nameEl.textContent = currentLang === 'el' ? bio.name.el : bio.name.en;
      }

      var bioEl = body.querySelector('p');
      if (!bioEl) return;
      bioEl.setAttribute('data-en-html', bio.body.en);
      bioEl.setAttribute('data-el-html', bio.body.el);
      bioEl.innerHTML = currentLang === 'el' ? bio.body.el : bio.body.en;
    });
  }

  function applyAboutStoryText() {
    if (!document.body || !document.body.classList.contains('about-page')) return;

    var content = document.querySelector('.container.split .content');
    if (!content) return;

    var heading = content.querySelector('h2');
    var lead = content.querySelector('p.lead');
    var list = content.querySelector('ul');

    var storyEn = 'It all began when three friends with diverse backgrounds decided to start a new venture together..<br><br>' +
      'One with a background on wines and chemistry, one on marketing and sales and one on new technologies and augmented reality.<br><br>' +
      'So, these three friends thought "How about creating an entirely new experience for people who love wine, combining the best parts of two worlds: fine wines and technology."<br><br>' +
      'Thus, Vials On The Go was born and here we all are..<br><br>' +
      'Creating a world of endless wonder that will let you experience the rich history and flavors of wine, while viewing them in a whole new light through AR.';

    var storyEl = 'Όλα ξεκίνησαν όταν δύο κολλητοί με διαφορετική εκπαίδευση, αποφάσισαν να ξεκινησουν κατι καινούργιο...<br><br>' +
      'Ένας Χημικός-Οινολόγος , ένας άσσος στις πωλήσεις και στο μαρκετινγκ.<br><br>' +
      'Αυτοι οι δύο κολλητοί λοιπον , σκέφτηκαν &lt;&lt;Πως θα ήταν να δημιουργούσαμε μια νέα και εντελώς πρωτοποριακή εμπειρία για τους λάτρεις του κρασιου, συνδιάζοντας τις ικανότητες του καθενός.&gt;&gt;<br><br>' +
      'Και αυτό είχε ως αποτέλεσμα την δημιουργία της εταιρίας μας.<br><br>' +
      'Μέσα απο την οποία θα προσπαθήσουμε να δημιουργήσουμε ενα καινούργιο κόσμο γεμάτο απο νεες εμπειρίες μεσω της επαυξημένης πραγματικότητας που θα αλλάξει τον τροπο που απολαμβάνουμε το κρασί.';

    if (heading) {
      heading.setAttribute('data-en', 'The Full Story');
      heading.setAttribute('data-el', 'Η Ιστορία μας');
      heading.textContent = currentLang === 'el' ? 'Η Ιστορία μας' : 'The Full Story';
    }

    if (lead) {
      lead.setAttribute('data-en-html', storyEn);
      lead.setAttribute('data-el-html', storyEl);
      lead.innerHTML = currentLang === 'el' ? storyEl : storyEn;
    }

    if (list) {
      list.remove();
    }
  }

  function applyNavLocalization() {
    var isEl = currentLang === 'el';
    var labelByHref = {
      'index.html': { en: 'Home', el: '\u0391\u03c1\u03c7\u03b9\u03ba\u03ae' },
      'products.html': { en: 'Products', el: '\u03a0\u03c1\u03bf\u03ca\u03cc\u03bd\u03c4\u03b1' },
      'catalog.html': { en: 'Catalog', el: '\u039a\u03b1\u03c4\u03ac\u03bb\u03bf\u03b3\u03bf\u03c2' },
      'services.html': { en: 'Services', el: '\u03a5\u03c0\u03b7\u03c1\u03b5\u03c3\u03af\u03b5\u03c2' },
      'about.html': { en: 'About', el: '\u03a3\u03c7\u03b5\u03c4\u03b9\u03ba\u03ac' },
      'contact.html': { en: 'Contact', el: '\u0395\u03c0\u03b9\u03ba\u03bf\u03b9\u03bd\u03c9\u03bd\u03af\u03b1' },
      'vials.html': { en: 'Vials', el: '\u03a6\u03b9\u03b1\u03bb\u03af\u03b4\u03b9\u03b1' },
      'gift-boxes.html': { en: 'Gift Boxes', el: '\u039a\u03bf\u03c5\u03c4\u03b9\u03ac \u0394\u03ce\u03c1\u03bf\u03c5' },
      'equipment.html': { en: 'Revine', el: 'Revine' },
      'quality-analysis.html': { en: 'Quality Analysis', el: '\u03a0\u03bf\u03b9\u03bf\u03c4\u03b9\u03ba\u03ae \u0391\u03bd\u03ac\u03bb\u03c5\u03c3\u03b7' },
      'warehouse.html': { en: 'Warehouse', el: '\u0391\u03c0\u03bf\u03b8\u03ae\u03ba\u03b7' },
      'augmented-reality.html': { en: 'Augmented Reality', el: '\u0395\u03c0\u03b1\u03c5\u03be\u03b7\u03bc\u03ad\u03bd\u03b7 \u03a0\u03c1\u03b1\u03b3\u03bc\u03b1\u03c4\u03b9\u03ba\u03cc\u03c4\u03b7\u03c4\u03b1' },
      'consulting.html': { en: 'Consulting', el: '\u03a3\u03c5\u03bc\u03b2\u03bf\u03c5\u03bb\u03b5\u03c5\u03c4\u03b9\u03ba\u03ae' },
      'bottling.html': { en: 'Bottling', el: '\u0395\u03bc\u03c6\u03b9\u03ac\u03bb\u03c9\u03c3\u03b7' },
      'logistics.html': { en: 'Logistics', el: 'Logistics' }
    };

    document.querySelectorAll('.nav-links a[href]').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('/').pop();
      var label = labelByHref[href];
      if (!label) return;
      a.textContent = isEl ? label.el : label.en;
    });

    document.querySelectorAll('.sub-toggle').forEach(function (btn) {
      btn.setAttribute('aria-label', isEl ? '\u0395\u03bc\u03c6\u03b1\u03bd\u03b9\u03c3\u03b7 \u03c5\u03c0\u03bf\u03ba\u03b1\u03c4\u03b7\u03b3\u03bf\u03c1\u03b9\u03c9\u03bd' : 'Toggle categories');
    });
  }

  function ensureFooterMeta() {
    var footer = document.querySelector('.footer');
    if (!footer) return null;

    var existing = footer.querySelector('.footer-meta');
    if (existing) return existing;

    var copyright = footer.querySelector('.copyright');
    var meta = document.createElement('div');
    meta.className = 'container footer-meta';
    meta.innerHTML = [
      '<div class="footer-meta-item">',
      '  <h4 data-footer-key="office-title"></h4>',
      '  <p data-footer-key="office-value"></p>',
      '</div>',
      '<div class="footer-meta-item">',
      '  <h4 data-footer-key="sales-title"></h4>',
      '  <p><a href="tel:+306953087694" data-footer-key="sales-value"></a></p>',
      '</div>',
      '<div class="footer-meta-item">',
      '  <h4 data-footer-key="consulting-title"></h4>',
      '  <p data-footer-key="consulting-value"></p>',
      '</div>',
      '<div class="footer-meta-item">',
      '  <h4 data-footer-key="social-title"></h4>',
      '  <p class="footer-social-links">',
      '    <a href="https://www.instagram.com/vialsonthego/" target="_blank" rel="noopener noreferrer">Instagram</a>',
      '    <span aria-hidden="true"> | </span>',
      '    <a href="https://www.facebook.com/people/Vials-On-The-Go/61553698253878/?locale=el_GR" target="_blank" rel="noopener noreferrer">Facebook</a>',
      '  </p>',
      '</div>',
      '<div class="footer-meta-item">',
      '  <h4 data-footer-key="contact-title"></h4>',
      '  <p><a href="mailto:info@vialsonthego.com">info@vialsonthego.com</a></p>',
      '</div>'
    ].join('');

    if (copyright) {
      footer.insertBefore(meta, copyright);
    } else {
      footer.appendChild(meta);
    }

    return meta;
  }

  function applyFooterMetaLocalization() {
    var meta = ensureFooterMeta();
    if (!meta) return;

    var isEl = currentLang === 'el';
    var copy = {
      'office-title': { en: 'Office', el: 'Γραφείο' },
      'office-value': { en: 'Kounavoi, Heraklion Crete', el: 'Κουνάβοι, Ηράκλειο Κρήτης' },
      'sales-title': { en: 'Sales', el: 'Πωλήσεις' },
      'sales-value': { en: '+30 6953087694', el: '+30 6953087694' },
      'consulting-title': { en: 'Consulting', el: 'Consulting' },
      'consulting-value': { en: 'Marketing & Oenology', el: 'Marketing & Οινολογία' },
      'social-title': { en: 'Social', el: 'Κοινωνικά' },
      'contact-title': { en: 'Contact Us', el: 'Επικοινωνία' }
    };

    meta.querySelectorAll('[data-footer-key]').forEach(function (el) {
      var key = el.getAttribute('data-footer-key');
      var entry = copy[key];
      if (!entry) return;
      el.textContent = isEl ? entry.el : entry.en;
    });
  }

  function setLanguage(nextLang) {
    var resolved = clampLanguage(nextLang);
    if (resolved === currentLang) return;

    var body = document.body;
    if (!body) {
      currentLang = resolved;
      try { localStorage.setItem(LANG_KEY, currentLang); } catch (e) {}
      applyTranslations();
      return;
    }

    if (languageSwitchTimer) clearTimeout(languageSwitchTimer);
    body.classList.add('is-language-switching');

    languageSwitchTimer = setTimeout(function () {
      currentLang = resolved;
      try { localStorage.setItem(LANG_KEY, currentLang); } catch (e) {}
      applyTranslations();

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          body.classList.remove('is-language-switching');
        });
      });
    }, 90);
  }

  function ensureNavActions() {
    var nav = document.getElementById('navWrap');
    if (!nav) return null;

    var actions = nav.querySelector('.nav-actions');
    if (actions) return actions;

    actions = document.createElement('div');
    actions.className = 'nav-actions';

    var cta = nav.querySelector(':scope > .cta');
    var menuBtn = nav.querySelector(':scope > .menu-btn');
    if (cta) actions.appendChild(cta);
    var arvrLink = nav.querySelector(':scope > .nav-arvr');
    if (arvrLink) actions.appendChild(arvrLink);
    if (menuBtn) actions.appendChild(menuBtn);
    nav.appendChild(actions);
    return actions;
  }

  function scrollToArVrHash() {
    if (window.location.hash !== '#ar-vr') return;

    var target = document.getElementById('ar-vr');
    if (!target) return;

    target.classList.add('show');
    setTimeout(function () {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  }

  function mountLanguageSwitcher() {
    var actions = ensureNavActions();
    if (!actions || actions.querySelector('.lang-switch')) return;

    var switcher = document.createElement('div');
    switcher.className = 'lang-switch';
    switcher.setAttribute('aria-label', 'Language switcher');
    switcher.innerHTML = [
      '<button type="button" data-lang="en">EN</button>',
      '<button type="button" data-lang="el">EL</button>'
    ].join('');

    switcher.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLanguage(btn.dataset.lang);
      });
    });

    actions.insertAdjacentElement('afterbegin', switcher);
  }

  function setupNavMenus(nav, menuBtn) {
    if (!nav) return;
    var links = nav.querySelectorAll('.nav-links a');
    var groups = nav.querySelectorAll('.has-sub');
    var currentPath = window.location.pathname.split('/').pop() || 'index.html';

    function closeSubMenus() {
      groups.forEach(function (group) {
        group.classList.remove('open');
        var toggle = group.querySelector('.sub-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
    }

    links.forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('/').pop();
      if (href === currentPath) a.classList.add('active');
    });

    var productChildren = ['vials.html', 'gift-boxes.html', 'equipment.html'];
    var serviceChildren = ['quality-analysis.html', 'warehouse.html', 'augmented-reality.html', 'consulting.html', 'bottling.html', 'logistics.html'];

    groups.forEach(function (group) {
      var parentLink = group.querySelector(':scope > a');
      var toggle = group.querySelector('.sub-toggle');
      if (!parentLink || !toggle) return;

      var parentPath = (parentLink.getAttribute('href') || '').split('/').pop();
      var childSet = group.dataset.group === 'services' ? serviceChildren : productChildren;
      if (childSet.indexOf(currentPath) >= 0 || parentPath === currentPath) {
        parentLink.classList.add('active');
      }

      toggle.addEventListener('click', function (event) {
        event.preventDefault();
        var shouldOpen = !group.classList.contains('open');
        closeSubMenus();
        if (shouldOpen) {
          group.classList.add('open');
          toggle.setAttribute('aria-expanded', 'true');
        }
      });
    });

    document.addEventListener('click', function (event) {
      if (!event.target.closest('.nav-links')) closeSubMenus();
    });

    nav.querySelectorAll('.sub-menu a').forEach(function (a) {
      a.addEventListener('click', closeSubMenus);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 940) closeSubMenus();
    });

    if (menuBtn) {
      menuBtn.addEventListener('click', function () {
        if (!nav.classList.contains('open')) closeSubMenus();
      });
    }
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
      setTimeout(function () { document.body.classList.remove('page-entering'); }, 760);
      return;
    }

    var mode = firstLoad ? 'long' : 'short';
    var holdMs = firstLoad ? 1650 : 560;
    var uiCopy = getUiCopy();

    if (!firstLoad) {
      document.body.classList.add('page-shift');
      setTimeout(function () { document.body.classList.remove('page-shift'); }, 820);
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
      '  <p class="intro-tag">' + uiCopy.introTag + '</p>',
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
      if (sessionStorage.getItem(AGE_SESSION_KEY) === 'yes') return;
    } catch (e) {}

    var uiCopy = getUiCopy();
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
      '  <p class="logo-tagline">' + uiCopy.introTag + '</p>',
      '  <p class="age-question">' + uiCopy.ageQuestion + '</p>',
      '  <div class="age-actions">',
      '    <button class="age-btn yes" id="ageYes" type="button">' + uiCopy.ageYes + '</button>',
      '    <button class="age-btn no" id="ageNo" type="button">' + uiCopy.ageNo + '</button>',
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
      try { sessionStorage.setItem(AGE_SESSION_KEY, 'yes'); } catch (e) {}
      runWineReveal();
      gate.classList.add('hidden');
      document.body.style.overflow = '';
      setTimeout(function () { gate.remove(); }, 700);
    });

    no.addEventListener('click', function () {
      feedback.textContent = uiCopy.ageFeedback;
    });
  }

  function mountLinkTransitions() {
    function shouldAnimateLink(anchor) {
      if (!anchor) return false;
      if (anchor.hasAttribute('download')) return false;
      if (anchor.hasAttribute('data-no-transition')) return false;
      if (anchor.getAttribute('target') && anchor.getAttribute('target') !== '_self') return false;
      var href = anchor.getAttribute('href');
      if (!href) return false;
      if (href.indexOf('#') === 0) return false;
      if (href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0 || href.indexOf('javascript:') === 0) return false;

      var url;
      try { url = new URL(anchor.href, window.location.href); } catch (e) { return false; }
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

  mountLanguageSwitcher();
  applyTranslations();
  scrollToArVrHash();
  mountIntroSplash();
  mountAgeGate();
  mountLinkTransitions();

  window.addEventListener('hashchange', scrollToArVrHash);

  var nav = document.getElementById('navWrap');
  var menuBtn = document.getElementById('menuBtn');
  var progress = document.getElementById('progress');

  setupNavMenus(nav, menuBtn);

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

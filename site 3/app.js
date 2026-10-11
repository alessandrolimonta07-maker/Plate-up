/* ============================================
   PlateUp — interactions
   ============================================ */

(() => {
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ── Cursor glow ── */
  const glow = $('#cursor-glow');
  if (matchMedia('(pointer: fine)').matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      glow.classList.add('active');
    });
    document.addEventListener('mouseleave', () => glow.classList.remove('active'));
    const tick = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    };
    tick();
  }

  /* ── Scroll progress + nav hide ── */
  const prog = $('#scroll-progress');
  const nav = $('#nav');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = ((y / max) * 100) + '%';
    if (y > 100 && y > lastY) nav.classList.add('hidden');
    else nav.classList.remove('hidden');
    lastY = y;
    const hint = document.querySelector('.hero-scroll-hint');
    if (hint) hint.classList.toggle('hidden', y > window.innerHeight * 0.3);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // forza aggiornamento iniziale hint
  
  /* ── Hero title word reveal ── */
  requestAnimationFrame(() => {
    $('.hero-title')?.classList.add('in');
    $$('[data-reveal]').forEach((el, i) => {
      const d = +el.dataset.delay || 0;
      el.style.setProperty('--delay', d + 'ms');
    });
    // First-paint reveals
    setTimeout(() => $$('[data-reveal]').forEach(el => el.classList.add('in')), 50);
  });

  /* ── Generic reveal on scroll ── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  $$('[data-reveal-block]').forEach(el => io.observe(el));
  // CTA title also gets the word-mask reveal when in view
  const ctaTitle = $('.cta-title');
  if (ctaTitle) {
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io2.unobserve(e.target); } });
    }, { threshold: 0.3 });
    io2.observe(ctaTitle);
  }

  /* ── Count-up numbers ── */
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      const dur = 1400;
      const start = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      countObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  $$('[data-count]').forEach(el => countObs.observe(el));

  /* ── Hero rotator ── */
  const rot = $('[data-rotator]');
  if (rot) {
    const items = $$('.r-item', rot);
    let i = 0;
    setInterval(() => {
      const cur = items[i];
      const next = items[(i + 1) % items.length];
      cur.classList.add('exit');
      cur.classList.remove('active');
      next.classList.add('active');
      next.classList.remove('exit');
      // cleanup
      setTimeout(() => cur.classList.remove('exit'), 700);
      i = (i + 1) % items.length;
    }, 2400);
  }

  /* ── Magnetic CTAs ── */
  if (matchMedia('(pointer: fine)').matches) {
    $$('[data-magnetic]').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${mx * 0.18}px, ${my * 0.25}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ── Bento card spotlight ── */
  $$('.bento-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });

  /* ── Sticky how-it-works step sync (scroll-driven for precise pinning) ── */
  const steps = $$('.how-step');
  const scenes = $$('.how-scene');
  if (steps.length) {
    let activeStep = -1;
    const setStep = (idx) => {
      if (idx === activeStep) return;
      activeStep = idx;
      steps.forEach((s, i) => s.classList.toggle('active', i === idx));
      scenes.forEach((s, i) => s.classList.toggle('active', i === idx));
    };

    const updateActiveStep = () => {
      const viewportCenter = window.innerHeight / 2;
      let bestIdx = 0;
      let bestDist = Infinity;
      steps.forEach((step, i) => {
        const r = step.getBoundingClientRect();
        const stepCenter = r.top + r.height / 2;
        const dist = Math.abs(stepCenter - viewportCenter);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      });
      setStep(bestIdx);
    };

    // Bind to scroll + initial
    window.addEventListener('scroll', () => {
      requestAnimationFrame(updateActiveStep);
    }, { passive: true });
    updateActiveStep();
  }

  /* ── Pricing billing toggle ── */
  const billingOpts = $$('.bs-opt');
  const thumb = $('.bs-thumb');
  const plans = $$('.plan');

  const setBilling = (mode) => {
    billingOpts.forEach((b) => b.classList.toggle('active', b.dataset.billing === mode));
    // move thumb
    const active = $('.bs-opt.active');
    if (active && thumb) {
      thumb.style.width = active.offsetWidth + 'px';
      thumb.style.transform = `translateX(${active.offsetLeft - 5}px)`;
    }
    // billing note
    const note = $('[data-billing-note]');
    if (note) note.classList.toggle('show', mode === 'annual');
    // discount chips on each plan
    $$('[data-discount]').forEach((d) => d.classList.toggle('show', mode === 'annual'));
    // "Massimo risparmio" pill 
    $$('[data-best]').forEach((b) => b.classList.toggle('show', mode === 'annual'));
    // update prices
    plans.forEach((plan) => {
      const num = $('.plan-price .num', plan);
      const per = $('.plan-price .per', plan);
      const strike = $('.plan-strike', plan);
      if (!num) return;
      const target = num.dataset[mode];
      if (target) animateNumber(num, +target);
      if (per) per.textContent = mode === 'annual' ? '/mese · annuale' : '/mese';
      if (strike) {
        const annual = strike.dataset.strikeAnnual;
        if (mode === 'annual' && annual && num.dataset.annual) {
          strike.innerHTML = '€' + (num.dataset.annual * 12) + '/anno <s>€' + annual + '</s>';
          strike.classList.add('show');
        } else {
          strike.classList.remove('show');
        }
      }
    });
  };

  const animateNumber = (el, target) => {
    const start = +el.textContent || 0;
    const dur = 400;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (target - start) * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  billingOpts.forEach((b) => {
    b.addEventListener('click', () => setBilling(b.dataset.billing));
  });
  // init thumb width
  requestAnimationFrame(() => setBilling('monthly'));
  window.addEventListener('resize', () => {
    const active = $('.bs-opt.active');
    if (active && thumb) {
      thumb.style.width = active.offsetWidth + 'px';
      thumb.style.transform = `translateX(${active.offsetLeft - 5}px)`;
    }
  });

  /* ── Smooth anchor scroll, ignore href="#" ── */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const t = document.querySelector(id);
      if (t) {
        e.preventDefault();
        const y = t.getBoundingClientRect().top + window.scrollY - 20;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  /* ── Marquee pause on hover ── */
  const m = $('.marquee-track');
  if (m) {
    m.addEventListener('mouseenter', () => m.style.animationPlayState = 'paused');
    m.addEventListener('mouseleave', () => m.style.animationPlayState = 'running');
  }

  /* ── Hamburger mobile nav ── */
  const hamburger = $('#hamburger');
  const mobileNav = document.createElement('div');
  mobileNav.className = 'mobile-nav';
  mobileNav.innerHTML = `
    <a href="#features" class="nav-link">Funzioni</a>
    <a href="#how" class="nav-link">Come funziona</a>
    <a href="#pricing" class="nav-link">Piani</a>
    <a href="#gallery" class="nav-link">Locali</a>
    <a href="#faq" class="nav-link">FAQ</a>
    <div class="mobile-nav-auth">
      <button class="mobile-login" id="mobile-open-auth">Accedi</button>
      <button class="mobile-register" id="mobile-open-signup">Registrati</button>
    </div>
    <a href="#contact" class="btn-primary" id="mobile-open-demo">
      <span>Prenota demo</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </a>
  `;
  document.body.appendChild(mobileNav);

  hamburger?.addEventListener('click', () => {
    document.body.classList.toggle('nav-open');
    mobileNav.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  });
  mobileNav.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', () => {
      document.body.classList.remove('nav-open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
  document.getElementById('mobile-open-demo')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.body.classList.remove('nav-open');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
    openAuth('demo');
  });
  document.getElementById('mobile-open-signup')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.body.classList.remove('nav-open');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
    openAuth('signup');
  });

  /* ── Auth modal ── */
  const overlay = $('#auth-overlay');
  const openBtn = $('#open-auth');
  const closeBtn = $('#auth-close');
  const tabsRoot = $('.auth-tabs');
  const tabs = $$('.auth-tab');
  const forms = $$('.auth-form');
  const success = $('[data-success]');
  const successMsg = $('[data-success-msg]');
  const successClose = $('#auth-success-close');

  const openAuth = (which = 'login') => {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTab(which);
    // reset success state
    success?.classList.add('hidden');
    forms.forEach(f => f.classList.toggle('hidden', f.dataset.form !== which));
  };
  const closeAuth = () => {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  document.getElementById('mobile-open-auth')?.addEventListener('click', () => {
    document.body.classList.remove('nav-open');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
    openAuth('login');
  });

  const setTab = (which) => {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === which));
    tabsRoot?.setAttribute('data-active', which);
    tabsRoot?.classList.toggle('hidden', which === 'demo');
    forms.forEach(f => f.classList.toggle('hidden', f.dataset.form !== which));
    success?.classList.add('hidden');
    // clear error state
    $$('.auth-error').forEach(e => { e.classList.remove('show'); e.textContent = ''; });
  };

  openBtn?.addEventListener('click', (e) => { e.preventDefault(); openAuth('login'); });
  // Tutti i "Richiedi / Prenota demo" aprono il modulo di richiesta
  $$('[data-demo]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); openAuth('demo'); }));
  document.getElementById('open-signup')?.addEventListener('click', (e) => { e.preventDefault(); openAuth('signup'); });
  $$('[data-goto-tab]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); setTab(a.dataset.gotoTab); }));
  closeBtn?.addEventListener('click', closeAuth);
  successClose?.addEventListener('click', closeAuth);

  const mostraEsito = (titolo, msg) => {
    forms.forEach(f => f.classList.add('hidden'));
    const t = $('[data-success-title]');
    if (t) t.textContent = titolo;
    if (successMsg) successMsg.textContent = msg;
    success?.classList.remove('hidden');
  };
  const haFirebase = () => typeof window.firebase !== 'undefined' && firebase.apps && firebase.apps.length;

  // Password dimenticata: mail di reset da Firebase
  $('#auth-forgot')?.addEventListener('click', async (e) => {
    e.preventDefault();
    const form = $('[data-form="login"]');
    const err = form.querySelector('[data-form-error]');
    const email = form.querySelector('input[name="email"]').value.trim();
    err.classList.remove('show');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      err.textContent = 'Scrivi la tua email qui sopra, poi premi "Password dimenticata?".';
      err.classList.add('show');
      return;
    }
    if (!haFirebase()) { err.textContent = 'Servizio non raggiungibile. Riprova tra poco.'; err.classList.add('show'); return; }
    try {
      firebase.auth().languageCode = 'it';
      await firebase.auth().sendPasswordResetEmail(email);
    } catch (x) {
      if (x.code === 'auth/invalid-email') { err.textContent = 'Email non valida.'; err.classList.add('show'); return; }
      if (x.code === 'auth/too-many-requests') { err.textContent = 'Troppi tentativi. Riprova più tardi.'; err.classList.add('show'); return; }
      // per gli altri casi (es. email non registrata) non diciamo se l'account esiste
    }
    mostraEsito('Controlla la posta', `Se ${email} è registrata, ti abbiamo mandato un link per scegliere una nuova password (guarda anche nello spam).`);
  });

  // Lista d'attesa VIP
  $('#vip-waitlist')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    const mail = f.querySelector('input').value.trim();
    const body = encodeURIComponent('Voglio essere avvisato quando il piano VIP è disponibile.\nLa mia email: ' + mail);
    window.location.href = 'mailto:plateupinfo@gmail.com?subject=' + encodeURIComponent("Lista d'attesa piano VIP") + '&body=' + body;
    f.querySelector('.wl-ok')?.classList.add('show');
  });
  overlay?.addEventListener('click', (e) => { if (e.target === overlay) closeAuth(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay?.classList.contains('open')) closeAuth();
  });
  tabs.forEach(t => t.addEventListener('click', () => setTab(t.dataset.tab)));

  // Password visibility toggles
  $$('.pw-eye').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });

  // Form submit handlers
  forms.forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const which = form.dataset.form;
      const err = form.querySelector('[data-form-error]');
      const errore = (m) => { err.textContent = m; err.classList.add('show'); };
      err.classList.remove('show');
      err.textContent = '';
      const data = new FormData(form);
      const val = (k) => (data.get(k) || '').toString().trim();
      const emailOk = (x) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);

      /* ── Registrazione ristoratore ── */
      if (which === 'signup') {
        if (!val('firstname') || !val('lastname') || !val('restaurant')) return errore('Compila nome, cognome e nome del locale.');
        if (val('phone').replace(/\D/g, '').length < 8) return errore('Scrivi un numero di telefono valido.');
        if (!emailOk(val('email'))) return errore("Inserisci un'email valida.");
        if ((data.get('password') || '').toString().length < 8) return errore('La password deve avere almeno 8 caratteri.');
        if (!form.querySelector('input[name="privacy"]').checked) return errore("Per creare l'account serve la presa visione dell'informativa privacy.");
        if (!haFirebase()) return errore('Servizio non raggiungibile. Controlla la connessione e riprova.');
        const submit = form.querySelector('.auth-submit');
        const label = submit.querySelector('span');
        submit.disabled = true; submit.classList.add('loading'); label.textContent = 'Creazione…';
        try {
          const cred = await firebase.auth().createUserWithEmailAndPassword(val('email'), data.get('password').toString());
          await firebase.firestore().collection('users').doc(cred.user.uid).set({
            email: val('email'),
            firstname: val('firstname'),
            lastname: val('lastname'),
            restaurant: val('restaurant'),
            phone: val('phone'),
            createdAt: new Date().toISOString(),
            privacyLettaIl: new Date().toISOString()
          });
          try { firebase.auth().languageCode = 'it'; await cred.user.sendEmailVerification(); } catch (_) {}
          window.location.href = 'dashboard.html';
        } catch (x) {
          submit.disabled = false; submit.classList.remove('loading'); label.textContent = 'Crea account';
          errore({
            'auth/email-already-in-use': 'Questa email ha già un account: accedi oppure usa "Password dimenticata?".',
            'auth/invalid-email': 'Email non valida.',
            'auth/weak-password': 'Password troppo debole: usa almeno 8 caratteri.',
            'auth/too-many-requests': 'Troppi tentativi. Riprova tra qualche minuto.',
            'auth/network-request-failed': 'Connessione assente. Riprova.'
          }[x.code] || 'Registrazione non riuscita. Riprova.');
        }
        return;
      }

      /* ── Richiesta demo ── */
      if (which === 'demo') {
        if (!val('nome') || !val('locale') || !val('citta')) return errore('Compila nome, locale e città.');
        if (val('telefono').replace(/\D/g, '').length < 8) return errore('Scrivi un numero di telefono valido.');
        if (val('email') && !emailOk(val('email'))) return errore('Email non valida.');
        if (!form.querySelector('input[name="privacy"]').checked) return errore("Per inviare la richiesta serve il consenso all'informativa privacy.");
        const testo = [
          'Ciao PlateUp, vorrei una demo.',
          '',
          'Nome: ' + val('nome'),
          'Locale: ' + val('locale') + ' (' + val('citta') + ')',
          'Telefono: ' + val('telefono'),
          val('email') ? 'Email: ' + val('email') : '',
          'Piano che mi interessa: ' + val('piano')
        ].filter((r, i) => r !== '' || i === 1).join('\n');
        const via = (e.submitter && e.submitter.dataset.via) || 'whatsapp';
        if (via === 'email') {
          window.location.href = 'mailto:plateupinfo@gmail.com?subject=' + encodeURIComponent('Richiesta demo — ' + val('locale')) + '&body=' + encodeURIComponent(testo);
        } else {
          window.open('https://wa.me/393429730557?text=' + encodeURIComponent(testo), '_blank', 'noopener');
        }
        mostraEsito('Richiesta pronta', via === 'email'
          ? "Si è aperta la tua app di posta con il messaggio già scritto: premi Invia. Se non si apre, scrivici a plateupinfo@gmail.com."
          : 'Si è aperto WhatsApp con il messaggio già scritto: premi Invia. Ti ricontattiamo al più presto.');
        return;
      }

      /* ── Accesso ── */
      const email = val('email');
      const pw = (data.get('password') || '').toString();
      if (!emailOk(email)) return errore("Inserisci un'email valida.");
      if (!pw) return errore('Inserisci la password.');
      if (!haFirebase()) return errore('Servizio non raggiungibile. Controlla la connessione e riprova.');

      const submit = form.querySelector('.auth-submit');
      const label = submit.querySelector('span');
      const originale = label.textContent;
      submit.disabled = true;
      submit.classList.add('loading');
      label.textContent = 'Accesso…';
      try {
        const ricorda = form.querySelector('input[name="remember"]')?.checked;
        await firebase.auth().setPersistence(ricorda ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION);
        await firebase.auth().signInWithEmailAndPassword(email, pw);
        window.location.href = 'dashboard.html';
      } catch (x) {
        submit.disabled = false;
        submit.classList.remove('loading');
        label.textContent = originale;
        const msg = {
          'auth/user-not-found': 'Email o password non corretti.',
          'auth/wrong-password': 'Email o password non corretti.',
          'auth/invalid-credential': 'Email o password non corretti.',
          'auth/invalid-login-credentials': 'Email o password non corretti.',
          'auth/invalid-email': 'Email non valida.',
          'auth/user-disabled': 'Account disattivato. Scrivici a plateupinfo@gmail.com.',
          'auth/too-many-requests': 'Troppi tentativi. Riprova tra qualche minuto o usa "Password dimenticata?".',
          'auth/network-request-failed': 'Connessione assente. Riprova.'
        }[x.code] || 'Accesso non riuscito. Riprova.';
        errore(msg);
      }
    });
  });

/* ── Bento scroll dots (mobile only) ── */
  const bentoEl = document.querySelector('.bento');
  const bentoDotsEl = document.querySelector('#bento-dots');
  if (bentoEl && bentoDotsEl) {
    const cards = [...bentoEl.children];
    cards.forEach((_, i) => {
      const d = document.createElement('span');
      d.className = 'scroll-dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', () => {
        cards[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      });
      bentoDotsEl.appendChild(d);
    });
    const dots = [...bentoDotsEl.children];
    const dotObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.intersectionRatio >= 0.5) {
          const idx = cards.indexOf(e.target);
          dots.forEach((d, i) => d.classList.toggle('active', i === idx));
        }
      });
    }, { root: bentoEl, threshold: 0.5 });
    cards.forEach(c => dotObs.observe(c));
  }

  /* ── Plans scroll dots (mobile only) ── */
  const plansEl = document.querySelector('.plans');
  const plansDotsEl = document.querySelector('#plans-dots');
  if (plansEl && plansDotsEl) {
    const planCards = [...plansEl.children];
    planCards.forEach((_, i) => {
      const d = document.createElement('span');
      d.className = 'scroll-dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', () => {
        planCards[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      });
      plansDotsEl.appendChild(d);
    });
    const planDots = [...plansDotsEl.children];
    const planDotObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.intersectionRatio >= 0.5) {
          const idx = planCards.indexOf(e.target);
          planDots.forEach((d, i) => d.classList.toggle('active', i === idx));
        }
      });
    }, { root: plansEl, threshold: 0.5 });
    planCards.forEach(c => planDotObs.observe(c));
  }
})();

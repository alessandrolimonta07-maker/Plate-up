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
  };
  window.addEventListener('scroll', onScroll, { passive: true });

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
    // "Massimo risparmio" pill (Elite only)
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
        if (mode === 'annual' && annual) {
          strike.textContent = '€' + annual + ' totale';
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

  /* ── "Vedi altre foto" button ── */
  const moreBtn = $('#btn-more-photos');
  if (moreBtn) {
    moreBtn.addEventListener('click', () => {
      // Subtle feedback — toast-style note. User will add real photos later.
      const old = moreBtn.querySelector('span:nth-child(2)');
      const original = old.textContent;
      moreBtn.classList.add('loading');
      old.textContent = 'Presto disponibili…';
      setTimeout(() => {
        old.textContent = original;
        moreBtn.classList.remove('loading');
      }, 1800);
    });
  }

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

  const setTab = (which) => {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === which));
    tabsRoot?.setAttribute('data-active', which);
    forms.forEach(f => f.classList.toggle('hidden', f.dataset.form !== which));
    success?.classList.add('hidden');
    // clear error state
    $$('.auth-error').forEach(e => { e.classList.remove('show'); e.textContent = ''; });
  };

  openBtn?.addEventListener('click', (e) => { e.preventDefault(); openAuth('login'); });
  closeBtn?.addEventListener('click', closeAuth);
  successClose?.addEventListener('click', () => {
    // After signup success, take them to the dashboard
    window.location.href = 'dashboard.html';
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
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const which = form.dataset.form;
      const submit = form.querySelector('.auth-submit');
      const err = form.querySelector('[data-form-error]');
      err.classList.remove('show');
      err.textContent = '';

      // Basic validation
      const data = new FormData(form);
      const email = data.get('email')?.toString().trim();
      const pw = data.get('password')?.toString();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        err.textContent = 'Inserisci un\'email valida.';
        err.classList.add('show');
        return;
      }
      if (!pw || pw.length < (which === 'signup' ? 8 : 1)) {
        err.textContent = which === 'signup'
          ? 'La password deve essere di almeno 8 caratteri.'
          : 'Inserisci la password.';
        err.classList.add('show');
        return;
      }
      if (which === 'signup') {
        const tos = form.querySelector('input[name="tos"]');
        if (tos && !tos.checked) {
          err.textContent = 'Devi accettare i termini per continuare.';
          err.classList.add('show');
          return;
        }
      }

      // Simulate request
      submit.disabled = true;
      submit.classList.add('loading');
      const originalLabel = submit.querySelector('span').textContent;
      submit.querySelector('span').textContent = which === 'login' ? 'Accesso…' : 'Creazione…';

      setTimeout(() => {
        submit.disabled = false;
        submit.classList.remove('loading');
        submit.querySelector('span').textContent = originalLabel;

        // Persist user data so dashboard can read it
        try {
          const existing = JSON.parse(localStorage.getItem('plateup-auth') || '{}');
          const payload = { email, mode: which, ts: Date.now() };
          if (which === 'signup') {
            payload.firstname  = data.get('firstname')?.toString().trim() || '';
            payload.lastname   = data.get('lastname')?.toString().trim()  || '';
            payload.restaurant = data.get('restaurant')?.toString().trim() || '';
          } else {
            // On login keep existing profile data if present
            payload.firstname  = existing.firstname  || '';
            payload.lastname   = existing.lastname   || '';
            payload.restaurant = existing.restaurant || '';
          }
          localStorage.setItem('plateup-auth', JSON.stringify(payload));
        } catch (_) {}

        // For login: redirect straight to the dashboard.
        if (which === 'login') {
          window.location.href = 'dashboard.html';
          return;
        }

        // For signup: show success state with email confirmation message.
        forms.forEach(f => f.classList.add('hidden'));
        if (success && successMsg) {
          successMsg.textContent = `Account creato per ${email}. Ti abbiamo inviato un'email di conferma — clicca sul link per attivare il tuo locale.`;
          success.classList.remove('hidden');
        }
      }, 900);
    });
  });

})();

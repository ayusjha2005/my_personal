/* ==========================================================================
   CORE APPLICATION JAVASCRIPT & TOKYO DRIFT EFFECTS
   ========================================================================== */
(function () {
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Live Footer Clock
  (function initFooterClock() {
    const el = document.getElementById('fClock');
    if (!el) return;
    function tick() {
      const now = new Date();
      el.textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    }
    tick();
    setInterval(tick, 1000);
  })();

  // 2. Aurora background
  if (!document.getElementById('aurora')) {
    const au = document.createElement('div');
    au.id = 'aurora';
    au.innerHTML = '<i></i><i></i><i></i>';
    document.body.prepend(au);
  }

  // 3. Tokyo Drift: Cursor Spotlight (520px radial glow rgba(0,229,255,0.09) fading to transparent at 62%)
  let spotlight = document.getElementById('cursorSpotlight');
  if (!spotlight && matchMedia('(pointer: fine)').matches) {
    spotlight = document.createElement('div');
    spotlight.id = 'cursorSpotlight';
    document.body.appendChild(spotlight);

    let sx = innerWidth / 2, sy = innerHeight / 2, tx = sx, ty = sy;
    addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });

    (function loopSpotlight() {
      sx += (tx - sx) * 0.12;
      sy += (ty - sy) * 0.12;
      spotlight.style.setProperty('--cx', `${sx}px`);
      spotlight.style.setProperty('--cy', `${sy}px`);
      requestAnimationFrame(loopSpotlight);
    })();
  }

  // 4. Tokyo Drift: Tyre-Smoke Cursor Trail (canvas, z-index 2, capped at 90)
  let smokeCanvas = document.getElementById('cursorSmokeCanvas');
  if (!smokeCanvas && !REDUCED && matchMedia('(pointer: fine)').matches) {
    smokeCanvas = document.createElement('canvas');
    smokeCanvas.id = 'cursorSmokeCanvas';
    document.body.appendChild(smokeCanvas);

    const sctx = smokeCanvas.getContext('2d');
    const MAX_CURSOR_SMOKE = 90;
    const cursorPuffs = [];

    function resizeSmokeCanvas() {
      smokeCanvas.width = innerWidth;
      smokeCanvas.height = innerHeight;
    }
    resizeSmokeCanvas();
    addEventListener('resize', resizeSmokeCanvas);

    addEventListener('pointermove', (e) => {
      // Spawn on about half of pointer moves
      if (Math.random() < 0.5 && cursorPuffs.length < MAX_CURSOR_SMOKE) {
        cursorPuffs.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 20, // ±10
          vy: -(10 + Math.random() * 16), // -(10–26)
          r: 2 + Math.random() * 2,       // 2–4
          life: 1.0,
        });
      }
    }, { passive: true });

    (function loopCursorSmoke() {
      sctx.clearRect(0, 0, smokeCanvas.width, smokeCanvas.height);
      for (let i = cursorPuffs.length - 1; i >= 0; i--) {
        const p = cursorPuffs[i];
        p.x += p.vx / 60;
        p.y += p.vy / 60;
        p.life -= 0.02;

        if (p.life <= 0) {
          cursorPuffs.splice(i, 1);
          continue;
        }

        sctx.beginPath();
        sctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        sctx.fillStyle = `rgba(200, 210, 225, ${p.life * 0.14})`;
        sctx.fill();
      }
      requestAnimationFrame(loopCursorSmoke);
    })();
  }

  // 5. Tokyo Drift: Scanlines Overlay (Toggle with 'S' key)
  let scanlines = document.getElementById('scanlines');
  if (!scanlines) {
    scanlines = document.createElement('div');
    scanlines.id = 'scanlines';
    document.body.appendChild(scanlines);
  }

  // 6. Tokyo Drift: NOS Boost Overlay (Press 'N' key)
  let nosOverlay = document.getElementById('nosBoost');
  if (!nosOverlay) {
    nosOverlay = document.createElement('div');
    nosOverlay.id = 'nosBoost';
    document.body.appendChild(nosOverlay);
  }

  function triggerNosBoost() {
    if (REDUCED || !nosOverlay) return;
    nosOverlay.classList.remove('active');
    document.body.classList.remove('nos-shaking');
    void nosOverlay.offsetWidth;
    nosOverlay.classList.add('active');
    document.body.classList.add('nos-shaking');

    setTimeout(() => nosOverlay.classList.remove('active'), 1300);
    setTimeout(() => document.body.classList.remove('nos-shaking'), 1200);
  }

  // 7. Page Transition Bridge (delegates to unified terminal-effects system)
  window.triggerCarTransition = function (cb) {
    if (window.triggerPageTransition) {
      window.triggerPageTransition(window.location.href, window.location.pathname);
    }
    if (cb) cb();
  };
  // 8. Global Keyboard handler for Scanlines & NOS
  addEventListener('keydown', (e) => {
    const isTyping = /INPUT|TEXTAREA|SELECT/i.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if (isTyping) return;

    if (e.key === 's' || e.key === 'S') {
      if (scanlines) scanlines.classList.toggle('active');
    } else if (e.key === 'n' || e.key === 'N') {
      triggerNosBoost();
    }
  });

  // 9. Magnetic buttons & nav links (within 90px of pointer shift by dx*0.18, dy*0.25)
  if (!REDUCED && matchMedia('(pointer: fine)').matches) {
    document.addEventListener('pointermove', (e) => {
      const magnetics = document.querySelectorAll('button, .btn, nav.main a, .ficon, .kbd-btn, .icon-btn');
      magnetics.forEach((el) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);

        if (dist < 90) {
          el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.25}px)`;
          el.dataset.magnet = '1';
        } else if (el.dataset.magnet) {
          el.style.transform = '';
          delete el.dataset.magnet;
        }
      });
    }, { passive: true });

    document.addEventListener('pointerleave', () => {
      document.querySelectorAll('[data-magnet]').forEach((el) => {
        el.style.transform = '';
        delete el.dataset.magnet;
      });
    });
  }

  // 10. Click Ripple on buttons
  document.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest && e.target.closest('button, .btn');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const ripple = document.createElement('span');
    ripple.className = 'click-ripple';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  });

  // 11. 3D Tilt on post and stat cards
  if (!REDUCED && matchMedia('(pointer: fine)').matches) {
    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest && e.target.closest('.post, .stat, .project-card, .tcard, .scard, .note');
      if (card) {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - (r.left + r.width / 2)) / r.width;   // [-0.5, 0.5]
        const py = (e.clientY - (r.top + r.height / 2)) / r.height; // [-0.5, 0.5]
        card.style.transform = `perspective(800px) rotateX(${-py * 7}deg) rotateY(${px * 9}deg) translateY(-4px)`;
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      }
    }, { passive: true });

    document.addEventListener('pointerout', (e) => {
      const card = e.target.closest && e.target.closest('.post, .stat, .project-card, .tcard, .scard, .note');
      if (card && !card.contains(e.relatedTarget)) {
        card.style.transform = '';
      }
    });
  }

  // 12. Cursor ring
  if (matchMedia('(pointer: fine)').matches && !document.getElementById('cursorRing')) {
    const ring = document.createElement('div');
    ring.id = 'cursorRing';
    document.body.appendChild(ring);
    let rx = innerWidth / 2, ry = innerHeight / 2, tx = rx, ty = ry;
    addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; });
    (function follow() {
      rx += (tx - rx) * 0.22;
      ry += (ty - ry) * 0.22;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(follow);
    })();
    document.addEventListener('pointerover', (e) => {
      ring.classList.toggle('hot', !!e.target.closest('a, button, .post, .tcard, .note, .project-card, .skill-pill'));
    });
  }

  // 13. Back to top & scroll progress
  let prog = document.getElementById('progressTop');
  if (!prog) {
    prog = document.createElement('div');
    prog.id = 'progressTop';
    document.body.appendChild(prog);
  }
  let toTop = document.getElementById('toTop');
  if (!toTop) {
    toTop = document.createElement('button');
    toTop.id = 'toTop';
    toTop.type = 'button';
    toTop.setAttribute('aria-label', 'back to top');
    toTop.innerHTML = '<svg viewBox="0 0 48 48"><circle class="track" cx="24" cy="24" r="22"/><circle class="bar" cx="24" cy="24" r="22" stroke-dasharray="138.2" stroke-dashoffset="138.2"/></svg><span>↑</span>';
    document.body.appendChild(toTop);
    toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  }
  const trackRing = toTop.querySelector('.bar');
  addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? scrollY / max : 0;
    if (prog) prog.style.transform = `scaleX(${p})`;
    if (trackRing) trackRing.style.strokeDashoffset = 138.2 * (1 - p);
    toTop.classList.toggle('show', scrollY > 400);
  }, { passive: true });

  const backTop = document.getElementById('backTop');
  if (backTop) backTop.addEventListener('click', (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); });

  // 14. Confetti burst
  const cf = document.createElement('canvas');
  cf.id = 'confetti';
  document.body.appendChild(cf);
  const cx = cf.getContext('2d');
  let parts = [];
  const rsCf = () => { cf.width = innerWidth; cf.height = innerHeight; };
  rsCf();
  addEventListener('resize', rsCf);
  window.__burst = (x, y) => {
    for (let i = 0; i < 46; i++) {
      const a = Math.random() * Math.PI * 2, s = Math.random() * 6 + 2;
      parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 4, life: 1, c: Math.random() < 0.5 ? '#e5353b' : '#fff', r: Math.random() * 3 + 1.5 });
    }
  };
  (function loopCf() {
    cx.clearRect(0, 0, cf.width, cf.height);
    parts = parts.filter(p => p.life > 0);
    for (const p of parts) {
      p.vy += 0.22; p.vx *= 0.98; p.x += p.vx; p.y += p.vy; p.life -= 0.016;
      cx.globalAlpha = Math.max(p.life, 0); cx.fillStyle = p.c; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 7); cx.fill();
    }
    cx.globalAlpha = 1;
    requestAnimationFrame(loopCf);
  })();

  // 15. Scramble headings
  const chars = '01/<>#%$&';
  const sIO = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target, final = el.textContent; let f = 0;
    const id = setInterval(() => {
      f++;
      el.textContent = final.split('').map((ch, i) => (ch === ' ' || i / final.length < f / 14) ? ch : chars[Math.floor(Math.random() * chars.length)]).join('');
      if (f >= 14) { clearInterval(id); el.textContent = final; }
    }, 40);
    sIO.unobserve(el);
  }), { threshold: 0.6 });
  document.querySelectorAll('.xhead .t').forEach(el => sIO.observe(el));

  // 16. Letter wave on name
  document.querySelectorAll('.wl:not([data-done])').forEach((el) => {
    el.dataset.done = '1';
    const txt = el.textContent;
    el.innerHTML = [...txt].map((ch, i) => `<span style="--d:${i}">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');
  });

  // 17. Desk tilt in writing corner
  const desk = document.querySelector('.desk');
  if (desk) {
    desk.addEventListener('pointermove', (e) => {
      const r = desk.getBoundingClientRect();
      desk.style.setProperty('--ry', ((e.clientX - r.left) / r.width - 0.5) * 8 + 'deg');
      desk.style.setProperty('--rx', -((e.clientY - r.top) / r.height - 0.5) * 6 + 'deg');
    });
    desk.addEventListener('pointerleave', () => {
      desk.style.setProperty('--rx', '0deg');
      desk.style.setProperty('--ry', '0deg');
    });
  }

  // 18. Floating notes
  document.querySelectorAll('.note:not([data-fl])').forEach((n, i) => {
    n.dataset.fl = '1'; n.classList.add('float'); n.style.setProperty('--fd', (i * 0.6) + 's');
  });

  // 19. Mailbox copy
  const cm = document.getElementById('copyMail');
  if (cm) {
    cm.addEventListener('click', async () => {
      const emailElem = document.getElementById('email2') || document.querySelector('[data-bind="email"]');
      const text = emailElem ? emailElem.textContent.trim() : 'reach2kr.ayush@gmail.com';
      const r = cm.getBoundingClientRect();
      if (window.__burst) window.__burst(r.left + r.width / 2, r.top + r.height / 2);
      try {
        await navigator.clipboard.writeText(text);
        cm.textContent = 'copied ✓';
      } catch (e) {
        cm.textContent = 'failed';
      }
      setTimeout(() => (cm.textContent = 'copy'), 1600);
    });
  }

  // 20. Footer / social email copy
  document.addEventListener('click', async (e) => {
    const el = e.target.closest('[data-copy-email="1"]');
    if (!el) return;
    e.preventDefault();
    const addr = el.getAttribute('href')?.replace('mailto:', '') || 'reach2kr.ayush@gmail.com';
    const r = el.getBoundingClientRect();
    if (window.__burst) window.__burst(r.left + r.width / 2, r.top + r.height / 2);
    try { await navigator.clipboard.writeText(addr); } catch (err) {}
    const lbl = document.getElementById('emailLabel');
    if (lbl) { lbl.textContent = 'copied ✓'; setTimeout(() => (lbl.textContent = 'copy email'), 1600); }
    el.classList.remove('copied-flash'); void el.offsetWidth; el.classList.add('copied-flash');
  });

  // 21. Theme toggle
  const themeBtn = document.getElementById('themeBtn');
  let saved = null; try { saved = localStorage.getItem('theme'); } catch (e) {}
  if (saved === 'light') document.body.classList.add('light');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('light');
      try { localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark'); } catch (e) {}
    });
  }

  // 22. Mobile menu drawer
  const burger = document.getElementById('burger');
  const scrim = document.querySelector('.scrim') || document.createElement('div');
  scrim.className = 'scrim';
  if (!scrim.parentElement) document.body.appendChild(scrim);

  const drawer = document.getElementById('drawer') || document.createElement('nav');
  drawer.className = 'drawer'; drawer.id = 'drawer';
  drawer.innerHTML = `
    <a href="/">home</a>
    <a href="/writings">writings</a>
    <a href="/projects">projects</a>
    <a href="/skills">skills</a>
    <a href="/about">about</a>
    <a href="/contact">contact</a>
    <button class="dbtn" id="dCmdBar" type="button" style="color:var(--red);">&gt;_ command bar</button>
    <button class="dbtn" id="dTheme" type="button">toggle theme</button>
    <div class="d-foot">Ayush Jha · ${new Date().getFullYear()}<br>computer science student & developer</div>
  `;
  if (!drawer.parentElement) document.body.appendChild(drawer);

  function setNav(open) {
    document.body.classList.toggle('nav-open', open);
    if (burger) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'close menu' : 'open menu');
    }
  }
  if (burger) burger.addEventListener('click', () => setNav(!document.body.classList.contains('nav-open')));
  scrim.addEventListener('click', () => setNav(false));
  drawer.addEventListener('click', e => { if (e.target.closest('a')) setNav(false); });
  const dTheme = document.getElementById('dTheme');
  if (dTheme && themeBtn) dTheme.addEventListener('click', () => themeBtn.click());

  // 23. Command palette
  const cmdk = document.getElementById('cmdk');
  const cmdInput = document.getElementById('cmdInput');
  const cmdList = document.getElementById('cmdList');
  const openCmd = document.getElementById('openCmd');

  if (cmdk && cmdInput && cmdList) {
    let items = [], sel = 0;
    const staticPages = [
      { label: 'Home', hint: 'g h', href: '/' },
      { label: 'All Writings', hint: 'g w', href: '/writings' },
      { label: 'Projects', hint: 'g p', href: '/projects' },
      { label: 'Skills', hint: 'g s', href: '/skills' },
      { label: 'About Me', hint: 'g a', href: '/about' },
      { label: 'Contact', hint: 'g m', href: '/contact' },
      { label: 'Admin Console (Login / Dashboard)', hint: 'admin', href: '/admin' },
    ];

    async function loadCmdItems() {
      try {
        const res = await fetch('/api/posts');
        const posts = await res.json();
        const postItems = posts.map(p => ({
          label: p.title,
          hint: p.category,
          href: `/writings/${p.slug}`,
        }));
        return [...postItems, ...staticPages];
      } catch (e) {
        return staticPages;
      }
    }

    async function buildCmd() {
      const all = await loadCmdItems();
      const q = cmdInput.value.trim().toLowerCase();
      items = all.filter(it => !q || it.label.toLowerCase().includes(q) || it.hint.toLowerCase().includes(q));
      sel = 0;
      cmdList.innerHTML = items.length
        ? items.map((it, i) => `<li data-i="${i}" class="${i === 0 ? 'sel' : ''}"><span>${it.label}</span><span class="k">${it.hint}</span></li>`).join('')
        : '<li style="cursor:default">no results</li>';
    }

    function openPalette() {
      cmdk.classList.add('open');
      cmdInput.value = '';
      buildCmd();
      setTimeout(() => cmdInput.focus(), 10);
    }
    function closePalette() { cmdk.classList.remove('open'); }
    function choose(i) {
      const it = items[i];
      if (!it) return;
      closePalette();
      window.location.href = it.href;
    }

    if (openCmd) openCmd.addEventListener('click', openPalette);
    const dCmdBar = document.getElementById('dCmdBar');
    if (dCmdBar) dCmdBar.addEventListener('click', () => { setNav(false); openPalette(); });
    cmdk.addEventListener('click', e => { if (e.target === cmdk) closePalette(); });
    cmdInput.addEventListener('input', buildCmd);
    cmdList.addEventListener('click', e => {
      const li = e.target.closest('li[data-i]');
      if (li) choose(+li.dataset.i);
    });
    cmdInput.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { sel = Math.min(sel + 1, items.length - 1); updateSel(); e.preventDefault(); }
      if (e.key === 'ArrowUp') { sel = Math.max(sel - 1, 0); updateSel(); e.preventDefault(); }
      if (e.key === 'Enter') choose(sel);
      if (e.key === 'Escape') closePalette();
    });
    function updateSel() {
      cmdList.querySelectorAll('li').forEach((li, i) => li.classList.toggle('sel', i === sel));
    }

    // Keyboard shortcuts
    let gPending = 0;
    addEventListener('keydown', e => {
      const typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); cmdk.classList.contains('open') ? closePalette() : openPalette(); return; }
      if (typing || cmdk.classList.contains('open')) { if (e.key === 'Escape') closePalette(); return; }
      if (e.key === '/') { const q = document.getElementById('q'); if (q) { e.preventDefault(); q.focus(); } return; }
      if (e.key === 't' && themeBtn) { themeBtn.click(); return; }
      if (e.key === 'g') { gPending = Date.now(); return; }
      if (Date.now() - gPending < 900) {
        const map = { h: '/', w: '/writings', b: '/writings', p: '/projects', s: '/skills', a: '/about', c: '/corner', m: '/contact', '!': '/admin' };
        if (map[e.key]) window.location.href = map[e.key];
        gPending = 0;
      }
    });
  }

  // 24. Typewriter in Hero Terminal
  const termEl = document.getElementById('termBody');
  if (termEl) {
    const script = [
      ['p', '$ whoami'],
      ['', 'ayush jha · cse @ vit'],
      ['p', '$ cat interests.txt'],
      ['', 'backend architecture · databases · algorithms · ai'],
      ['p', '$ git status'],
      ['ok', '✓ on branch main · learning & building continuously'],
    ];
    let html = '', li = 0, ci = 0;
    const cursor = '<span class="c"></span>';
    (function step() {
      if (!termEl.isConnected) return;
      if (li >= script.length) { termEl.innerHTML = html + cursor; return; }
      const [cls, text] = script[li];
      const open = cls ? `<span class="${cls}">` : '<span>';
      ci = Math.min(ci + 2, text.length);
      termEl.innerHTML = html + open + text.slice(0, ci).replace(/</g, '&lt;') + '</span>' + cursor;
      if (ci >= text.length) { html += open + text.replace(/</g, '&lt;') + '</span><br>'; li++; ci = 0; setTimeout(step, 450); }
      else setTimeout(step, 24);
    })();
  }

  // 25. Codeblock copy button
  document.querySelectorAll('.codeblock').forEach((cb) => {
    let bar = cb.querySelector('.bar2');
    if (!bar) {
      bar = document.createElement('div'); bar.className = 'bar2';
      bar.innerHTML = `<span>${cb.dataset.lang || 'code'}</span><button type="button">copy</button>`;
      cb.prepend(bar);
    }
    const btn = bar.querySelector('button');
    if (btn && !btn.dataset.init) {
      btn.dataset.init = '1';
      btn.addEventListener('click', async () => {
        try {
          const codeEl = cb.querySelector('code');
          await navigator.clipboard.writeText(codeEl ? codeEl.innerText : '');
          cb.classList.add('copied'); btn.textContent = 'copied ✓';
          setTimeout(() => { cb.classList.remove('copied'); btn.textContent = 'copy'; }, 1500);
        } catch (e) {}
      });
    }
  });

  // 26. Table of Contents Scrollspy on Blog Details
  const toc = document.getElementById('toc');
  if (toc) {
    const heads = [...document.querySelectorAll('article h2')];
    heads.forEach((h, i) => {
      if (!h.id) h.id = 'sec-' + i;
    });
    const links = [...toc.querySelectorAll('a')];
    const spy = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-30% 0px -60% 0px' });
    heads.forEach(h => spy.observe(h));
  }

  // 27. Reading progress bar on Blog Details
  const readBar = document.getElementById('readBar');
  const articleBody = document.getElementById('body') || document.querySelector('article');
  if (readBar && articleBody) {
    const onScroll = () => {
      const r = articleBody.getBoundingClientRect();
      const total = articleBody.offsetHeight - innerHeight * 0.4;
      readBar.style.width = Math.min(100, Math.max(0, -r.top / total * 100)) + '%';
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // 28. Like button handling
  const likeBtn = document.getElementById('likeBtn');
  if (likeBtn) {
    const slug = likeBtn.dataset.slug;
    likeBtn.addEventListener('click', async () => {
      const isLiked = likeBtn.classList.contains('on');
      const newStatus = !isLiked;
      likeBtn.classList.toggle('on', newStatus);
      const heart = document.getElementById('heart');
      if (heart) {
        heart.textContent = newStatus ? '♥' : '♡';
        heart.classList.remove('pop'); void heart.offsetWidth; heart.classList.add('pop');
      }
      const countEl = document.getElementById('likeCount');
      if (countEl) {
        countEl.textContent = Math.max(0, parseInt(countEl.textContent || 0) + (newStatus ? 1 : -1));
      }
      if (newStatus && window.__burst) {
        const r = likeBtn.getBoundingClientRect();
        window.__burst(r.left + r.width / 2, r.top + r.height / 2);
      }
      try {
        await fetch(`/api/posts/${slug}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ liked: newStatus }),
        });
      } catch (err) {}
    });
  }

  // 29. Contact form AJAX
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const msg = document.getElementById('contactMsg');
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      if (btn) { btn.disabled = true; btn.textContent = 'sending…'; }
      if (msg) { msg.className = 'msg'; msg.textContent = 'Sending message...'; }

      try {
        const res = await fetch('/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to submit form');

        if (msg) {
          msg.className = 'msg ok';
          msg.textContent = '✓ ' + json.message;
        }
        contactForm.reset();
        if (window.__burst && btn) {
          const r = btn.getBoundingClientRect();
          window.__burst(r.left + r.width / 2, r.top + r.height / 2);
        }
      } catch (err) {
        if (msg) {
          msg.className = 'msg err';
          msg.textContent = err.message;
        }
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'send'; }
      }
    });
  }

  // 30. Newsletter form AJAX
  const newsForm = document.getElementById('newsForm');
  if (newsForm) {
    newsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('newsEmail');
      const msg = document.getElementById('newsMsg');
      const email = input ? input.value.trim() : '';

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (input) input.classList.add('bad');
        if (msg) { msg.className = 'msg'; msg.textContent = 'enter a valid email address'; }
        return;
      }

      if (msg) { msg.className = 'msg'; msg.textContent = 'subscribing…'; }
      try {
        const res = await fetch('/contact/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const json = await res.json();
        if (msg) { msg.className = 'msg ok'; msg.textContent = '✓ ' + json.message; }
        if (input) input.value = '';
      } catch (err) {
        if (msg) { msg.className = 'msg'; msg.textContent = 'Failed to subscribe.'; }
      }
    });
  }

  // 31. Reveal observer for scroll animations
  const rvIO = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); rvIO.unobserve(e.target); }
  }), { threshold: 0.1 });
  document.querySelectorAll('.rv:not(.in), .exp:not(.in)').forEach(el => rvIO.observe(el));

  // ========================================================================
  // 32. TOKYO DRIFT: ARTICLE PAGES ENHANCEMENT
  // ========================================================================
  function initArticleDrift() {
    const article = document.querySelector('article');
    if (!article) return;

    // A. Insert article drift header above title if not already present
    if (!article.querySelector('.article-drift-header')) {
      const title = article.querySelector('h1');
      if (title) {
        const hdr = document.createElement('div');
        hdr.className = 'article-drift-header';
        hdr.setAttribute('aria-hidden', 'true');
        hdr.innerHTML = `
          <div class="article-drift-stars"></div>
          <div class="article-drift-road"></div>
          <div class="article-drift-car-wrap">
            <svg class="article-drift-car-svg" viewBox="-2 -22 84 26">
              <ellipse cx="40" cy="0" rx="38" ry="2.6" fill="rgba(0,229,255,0.25)"/>
              <path d="M 0 -4 L 3 -10 L 16 -13 L 28 -18 L 44 -18 L 54 -12 L 72 -10 L 80 -7 L 80 -3 Z" fill="#c81d1d" stroke="rgba(0,229,255,0.55)" stroke-width="0.7"/>
              <polygon points="28,-18 44,-18 50,-12 24,-12" fill="rgba(0,229,255,0.28)"/>
              <line x1="6" y1="-7" x2="76" y2="-7" stroke="rgba(255,77,46,0.9)" stroke-width="1.1"/>
              <rect x="2" y="-16" width="9" height="2" fill="#0a0c14"/>
              <circle cx="16" cy="-3" r="4.5" fill="#000000" stroke="#333" stroke-width="0.6"/>
              <circle cx="64" cy="-3" r="4.5" fill="#000000" stroke="#333" stroke-width="0.6"/>
              <circle cx="80" cy="-6" r="1.5" fill="#fff8dc"/>
              <circle cx="0" cy="-8" r="1.2" fill="#ff3b3b"/>
            </svg>
          </div>
        `;
        title.parentNode.insertBefore(hdr, title);

        // Add faint stars into header
        const starsWrap = hdr.querySelector('.article-drift-stars');
        if (starsWrap) {
          for (let i = 0; i < 35; i++) {
            const dot = document.createElement('span');
            dot.className = 'drift-star';
            dot.style.left = `${(Math.sin(i * 12.3) * 0.5 + 0.5) * 100}%`;
            dot.style.top = `${(Math.cos(i * 7.7) * 0.5 + 0.5) * 65}%`;
            dot.style.opacity = `${0.2 + (i % 5) * 0.12}`;
            starsWrap.appendChild(dot);
          }
        }
      }
    }

    // B. Headings underline bar reveal
    const headings = article.querySelectorAll('h2');
    const h2Observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          h2Observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    headings.forEach((h2) => {
      if (REDUCED) {
        h2.classList.add('revealed');
      } else {
        h2Observer.observe(h2);
      }
    });

    // C. Body children reveal (paragraphs, lists, code blocks, headings)
    const contentArea = document.getElementById('body') || article.querySelector('.terminal-article-content') || article;
    const targets = contentArea.querySelectorAll(':scope > p, :scope > ul, :scope > ol, :scope > .codeblock, :scope > h2, :scope > h3, :scope > blockquote, :scope > div:not(.actions-row):not(.like-corner-card)');

    if (REDUCED) {
      targets.forEach(el => el.classList.add('in-view'));
    } else {
      const childObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            childObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      targets.forEach(el => childObserver.observe(el));
    }
  }

  // Export initArticleDrift globally so both SSR and dynamic post views can call it
  window.initArticleDrift = initArticleDrift;

  // Run on load if viewing an article
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initArticleDrift);
  } else {
    initArticleDrift();
  }
})();

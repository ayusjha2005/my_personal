/* ==========================================================================
   TOKYO DRIFT: RACER GUIDE CHARACTER
   Animated SVG Racer Guide (Walking, Sitting, Sleeping, Waving, Jumping,
   Eye-Tracking, Page-Aware Speech Hints & Minimise/Hide Controls)
   ========================================================================== */

(function () {
  // Clean up any stale guide elements
  ['buddy', 'buddy2'].forEach((id) => {
    const old = document.getElementById(id);
    if (old) old.remove();
  });

  const tog = document.getElementById('buddyToggle');
  const toggleBtn = tog ? tog.cloneNode(true) : null;
  if (tog && toggleBtn) tog.replaceWith(toggleBtn);

  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Create Racer Guide Container
  const el = document.createElement('div');
  el.id = 'buddy2';
  el.className = 'bd walk';
  el.innerHTML = `
    <div class="say"><div class="bd-text"></div><div class="acts"></div></div>
    <div class="bd-inner" role="button" tabindex="0" aria-label="guide character. click to play">
      <svg viewBox="0 0 100 130" aria-hidden="true">
        <defs>
          <linearGradient id="racerSuit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#e02a2a"/>
            <stop offset="100%" stop-color="#4a0a0a"/>
          </linearGradient>
          <linearGradient id="racerHelmet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ff4a3a"/>
            <stop offset="100%" stop-color="#8b1111"/>
          </linearGradient>
          <linearGradient id="racerVisor" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#b8fbff"/>
            <stop offset="50%" stop-color="#1fb8d4"/>
            <stop offset="100%" stop-color="#0a3a4a"/>
          </linearGradient>
        </defs>

        <!-- Shadow: ellipse centre (50,127), radii 26 x 3.5, class "shadow" -->
        <ellipse class="shadow" cx="50" cy="127" rx="26" ry="3.5"/>

        <!-- Legs group (class "legs") -->
        <g class="legs">
          <!-- leg-l: rect x37 y96 11 x 28 radius 4, fill #161d2e -->
          <rect class="leg-l" x="37" y="96" width="11" height="28" rx="4" fill="#161d2e"/>
          <!-- leg-r: rect x52 same size -->
          <rect class="leg-r" x="52" y="96" width="11" height="28" rx="4" fill="#161d2e"/>

          <!-- Boots: path (34,118) to (48,118) to (48,124), rounded bottom to (35,126), fill #05060c with a 0.9px cyan #00e5ff stroke -->
          <path class="boot-l" d="M 34 118 L 48 118 L 48 124 Q 41.5 127 35 126 Z" fill="#05060c" stroke="#00e5ff" stroke-width="0.9"/>
          <line x1="36" y1="124" x2="46" y2="124" stroke="#00e5ff" stroke-width="2" stroke-linecap="round" opacity="0.8"/>

          <!-- Mirror for right boot at x52-67 -->
          <path class="boot-r" d="M 52 118 L 66 118 L 66 124 Q 59.5 127 53 126 Z" fill="#05060c" stroke="#00e5ff" stroke-width="0.9"/>
          <line x1="54" y1="124" x2="64" y2="124" stroke="#00e5ff" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
        </g>

        <!-- Body group (class "body") -->
        <g class="body">
          <!-- Arm-left (class "arm-l"): path (31,76) (25,98) curve to (29,104), (33,104), (38,80), fill suit gradient, 1.2px dark stroke -->
          <g class="arm-l">
            <path d="M 31 76 L 25 98 Q 27 104 29 104 L 33 104 L 38 80 Z" fill="url(#racerSuit)" stroke="#05060c" stroke-width="1.2"/>
            <circle cx="27" cy="102" r="4.6" fill="#05060c" stroke="#00e5ff" stroke-width="0.8"/>
          </g>

          <!-- Torso: path (31,72) Q(50,62) (69,72), L(70,102), Q(70,110) (62,110), L(38,110), Q(30,110) (30,102), Z -->
          <path class="torso" d="M 31 72 Q 50 62 69 72 L 70 102 Q 70 110 62 110 L 38 110 Q 30 110 30 102 Z" fill="url(#racerSuit)" stroke="#05060c" stroke-width="1.4"/>

          <!-- Shoulder pads: ellipses (34,74) and (66,74), radii 7 x 5, #8b1111 with cyan arcs (1.2px) -->
          <ellipse cx="34" cy="74" rx="7" ry="5" fill="#8b1111"/>
          <path d="M 29 74 Q 34 70 39 74" fill="none" stroke="#00e5ff" stroke-width="1.2"/>
          <ellipse cx="66" cy="74" rx="7" ry="5" fill="#8b1111"/>
          <path d="M 61 74 Q 66 70 71 74" fill="none" stroke="#00e5ff" stroke-width="1.2"/>

          <!-- Chest zip: vertical line x50 from y70 to y102, dark, 55% opacity -->
          <line x1="50" y1="70" x2="50" y2="102" stroke="#05060c" stroke-width="1.2" opacity="0.55"/>

          <!-- Sponsor patch: rect (40,86) 20 x 11, radius 2, #fff8dc with a dark 0.6px stroke. Number "7" centred at (50,94.5), font 9px bold, Arial, #05060c -->
          <rect x="40" y="86" width="20" height="11" rx="2" fill="#fff8dc" stroke="#05060c" stroke-width="0.6"/>
          <text x="50" y="94.5" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#05060c">7</text>

          <!-- Belt: rect (31,101) 38 x 4, #05060c. Buckle: rect (47,100.5) 6 x 5, radius 1, #ffd666 -->
          <rect x="31" y="101" width="38" height="4" fill="#05060c"/>
          <rect x="47" y="100.5" width="6" height="5" rx="1" fill="#ffd666"/>

          <!-- Arm-right (class "arm-r"): mirror at x69-76, glove circle (73,102) -->
          <g class="arm-r">
            <path d="M 69 76 L 75 98 Q 73 104 71 104 L 67 104 L 62 80 Z" fill="url(#racerSuit)" stroke="#05060c" stroke-width="1.2"/>
            <circle cx="73" cy="102" r="4.6" fill="#05060c" stroke="#00e5ff" stroke-width="0.8"/>
          </g>

          <!-- Head group (class "head") -->
          <g class="head">
            <!-- Neck: rect (44,60) 12 x 12, radius 3, #d9a07f -->
            <rect x="44" y="60" width="12" height="12" rx="3" fill="#d9a07f"/>

            <!-- Collar (HANS-style): path (38,66) Q(50,72) (62,66), L(63,72), Q(50,77) (37,72), #161d2e -->
            <path d="M 38 66 Q 50 72 62 66 L 63 72 Q 50 77 37 72 Z" fill="#161d2e"/>

            <!-- Helmet shell (class "hair-b"): path (28,46) Q(28,21) (50,19) Q(72,21) (72,46), L(72,58), Q(72,66) (62,66), L(38,66), Q(28,66) (28,58), Z -->
            <path class="hair-b" d="M 28 46 Q 28 21 50 19 Q 72 21 72 46 L 72 58 Q 72 66 62 66 L 38 66 Q 28 66 28 58 Z" fill="url(#racerHelmet)" stroke="#05060c" stroke-width="1.4"/>

            <!-- White centre stripe: path (45,20.5) Q(50,19) (55,20.5), L(57,47), L(43,47), Z, #fff8dc at 92% opacity -->
            <path d="M 45 20.5 Q 50 19 55 20.5 L 57 47 L 43 47 Z" fill="#fff8dc" opacity="0.92"/>

            <!-- Visor: path (33,47) Q(50,40) (67,47), L(65,56), Q(50,61) (35,56), Z -->
            <path class="visor" d="M 33 47 Q 50 40 67 47 L 65 56 Q 50 61 35 56 Z" fill="url(#racerVisor)" stroke="#05060c" stroke-width="1.1"/>

            <!-- Visor glint: path (37,47) Q(45,43) (52,44), L(49,47), Q(43,47) (37,50), white at 55% -->
            <path d="M 37 47 Q 45 43 52 44 L 49 47 Q 43 47 37 50 Z" fill="#ffffff" opacity="0.55"/>

            <!-- Chin guard: path (35,58) Q(50,64) (65,58), L(63,66), Q(50,70) (37,66), #161d2e -->
            <path d="M 35 58 Q 50 64 65 58 L 63 66 Q 50 70 37 66 Z" fill="#161d2e"/>

            <!-- Cyan side dot: circle (68,30) r2, #00e5ff -->
            <circle cx="68" cy="30" r="2" fill="#00e5ff"/>

            <!-- Eyes group (class "eyes"): eye-l at (43,51) and eye-r at (57,51) -->
            <g class="eyes">
              <g class="eye eye-l">
                <ellipse cx="43" cy="51" rx="2.6" ry="2.8" fill="#05060c"/>
                <circle cx="43.9" cy="50.1" r="0.8" fill="#ffffff"/>
              </g>
              <g class="eye eye-r">
                <ellipse cx="57" cy="51" rx="2.6" ry="2.8" fill="#05060c"/>
                <circle cx="57.9" cy="50.1" r="0.8" fill="#ffffff"/>
              </g>
            </g>
          </g>
        </g>
      </svg>
      <div class="bd-fx">
        <span class="zz">z</span>
        <span class="zz">z</span>
        <span class="zz">z</span>
      </div>
    </div>
    <div class="bctl">
      <button type="button" data-b="min" aria-label="minimise guide" title="minimise">–</button>
      <button type="button" data-b="gone" aria-label="hide guide" title="hide">×</button>
    </div>
  `;

  document.body.appendChild(el);

  const inner = el.querySelector('.bd-inner');
  const svg = el.querySelector('svg');
  const fx = el.querySelector('.bd-fx');
  const bText = el.querySelector('.bd-text');
  const bActs = el.querySelector('.acts');
  const eyes = [...el.querySelectorAll('.eye')];

  const ACT_LABELS = {
    latest: 'read latest',
    corner: 'writing corner',
    say: 'say hi',
    search: 'search ⌘K',
  };

  const CLICK_LINES = [
    "engine warm. let's go.",
    "lap one, no brakes.",
    "clean line through the city.",
    "hold the slide… hold it.",
    "the night is ours.",
  ];

  const IDLE_LINES = [
    "psst, ⌘K opens search",
    "g then c opens the writing corner",
    "every post shows a reading time",
    "click me for a little jump",
  ];

  let x = 40, dir = 1, mode = 'walk', hover = false, near = false;
  let lastT = performance.now(), modeUntil = performance.now() + 4500;
  let lastActive = performance.now(), hideT = null, clickLineIdx = 0, idleIdx = 0;
  let mouseX = window.innerWidth * 0.5, mouseY = window.innerHeight * 0.5;

  function setMode(m) {
    el.classList.remove('walk', 'sit', 'sleep');
    if (m) el.classList.add(m);
    mode = m || 'walk';
  }

  function say(text, acts = [], ms = 5000) {
    bText.textContent = text;
    bActs.innerHTML = acts.map(a => `<button type="button" data-act="${a}">${ACT_LABELS[a] || a}</button>`).join('');
    el.classList.add('talk');
    clearTimeout(hideT);
    if (!hover) {
      hideT = setTimeout(() => el.classList.remove('talk'), ms);
    }
  }

  window.racerSay = say;
  window.robotSay = say; // backwards compatibility

  // Sparks effect: 3 amber glyphs "✦" rising 14px right and 44px up over 1.1s
  function spawnSparks() {
    for (let i = 0; i < 3; i++) {
      const s = document.createElement('span');
      s.className = 'fx-spark';
      s.textContent = '✦';
      s.style.left = `${30 + Math.random() * 35}%`;
      s.style.animationDelay = `${i * 0.12}s`;
      fx.appendChild(s);
      setTimeout(() => s.remove(), 1200);
    }
  }

  function wake() {
    if (mode === 'sleep') setMode('walk');
  }

  // Pointer movement tracking
  addEventListener('pointermove', (e) => {
    lastActive = performance.now();
    mouseX = e.clientX;
    mouseY = e.clientY;

    const r = inner.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const d = Math.hypot(dx, dy) || 1;

    // Eye tracking: up to 2.2px horizontally and 0.6x that vertically
    const k = Math.min(d, 220) / 220 * 2.2;
    const tx = (dx / d * k).toFixed(2);
    const ty = (dy / d * k * 0.6).toFixed(2);

    eyes.forEach((ey) => {
      ey.style.transform = `translate(${tx}px, ${ty}px)`;
    });

    // Near cursor: |dx| < 170, dy between -200 and 40
    near = Math.abs(dx) < 170 && dy > -200 && dy < 40;
    if (near && mode !== 'sleep') {
      dir = dx > 0 ? 1 : -1;
    }

    if (mode === 'sleep' && d < 80) {
      wake();
    }
  }, { passive: true });

  // Hover character
  inner.addEventListener('pointerenter', () => {
    hover = true;
    wake();
    el.classList.add('wave');
    setTimeout(() => el.classList.remove('wave'), 2200);
    if (!el.classList.contains('min')) {
      say('hey. I can show you around.', ['latest', 'corner', 'say'], 8000);
    }
  });

  inner.addEventListener('pointerleave', () => {
    hover = false;
    el.classList.remove('wave');
    hideT = setTimeout(() => el.classList.remove('talk'), 2400);
  });

  // Click or Enter/Space: happy, jump, sparks, and random dialogue
  function playClick() {
    wake();
    el.classList.add('happy');
    setTimeout(() => el.classList.remove('happy'), 1200);

    inner.classList.remove('jump');
    void inner.offsetWidth;
    inner.classList.add('jump');
    setTimeout(() => inner.classList.remove('jump'), 750);

    spawnSparks();
    const line = CLICK_LINES[clickLineIdx++ % CLICK_LINES.length];
    say(line, [], 3000);
    lastActive = performance.now();
  }

  inner.addEventListener('click', () => {
    if (el.classList.contains('min')) {
      setVisual('on');
      return;
    }
    playClick();
  });

  inner.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      playClick();
    }
  });

  // Action button handling in speech bubble
  bActs.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;
    el.classList.remove('talk');

    if (act === 'latest') {
      // Find latest article or go to writings
      window.location.href = '/writings';
    } else if (act === 'corner') {
      window.location.href = '/corner';
    } else if (act === 'say') {
      window.location.href = '/contact';
    } else if (act === 'search') {
      document.getElementById('openCmd')?.click();
    }
  });

  // State management: helperMode ("min", "gone", or "on")
  function setVisual(m) {
    el.classList.remove('min', 'gone', 'talk');
    const modeVal = m || 'on';
    if (modeVal === 'min') el.classList.add('min');
    if (modeVal === 'gone') el.classList.add('gone');

    try {
      localStorage.setItem('helperMode', modeVal);
    } catch (e) {}

    syncToggle();
  }

  function syncToggle() {
    if (!toggleBtn) return;
    if (el.classList.contains('gone')) {
      toggleBtn.textContent = 'helper off';
    } else if (el.classList.contains('min')) {
      toggleBtn.textContent = 'helper min';
    } else {
      toggleBtn.textContent = 'helper on';
    }
  }

  // Minimise & Hide buttons
  el.querySelector('.bctl').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-b]');
    if (!b) return;
    e.stopPropagation();
    setVisual(b.dataset.b === 'min' ? 'min' : 'gone');
  });

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (el.classList.contains('gone')) {
        setVisual('on');
      } else if (el.classList.contains('min')) {
        setVisual('gone');
      } else {
        setVisual('min');
      }
    });
  }

  // Load saved helperMode
  let savedMode = null;
  try {
    savedMode = localStorage.getItem('helperMode');
  } catch (e) {}
  if (savedMode === 'min' || savedMode === 'gone') {
    el.classList.add(savedMode);
  }
  syncToggle();

  // Idle speech bubble every 14s
  setInterval(() => {
    if (!hover && !el.classList.contains('talk') && mode !== 'sleep' && !el.classList.contains('gone')) {
      say(IDLE_LINES[idleIdx++ % IDLE_LINES.length], [], 3800);
    }
  }, 14000);

  // Page-aware hints every 0.9s (between 25% and 75% of viewport)
  let lastHintSection = null;
  let hintExpires = 0;

  setInterval(() => {
    if (hover || el.classList.contains('talk') || mode === 'sleep' || el.classList.contains('gone')) return;
    const now = performance.now();
    if (now < hintExpires) return;

    const vh = window.innerHeight;
    const midTop = vh * 0.25;
    const midBottom = vh * 0.75;

    function isMid(elem) {
      if (!elem) return false;
      const rect = elem.getBoundingClientRect();
      const elemCenter = rect.top + rect.height / 2;
      return elemCenter >= midTop && elemCenter <= midBottom;
    }

    const hero = document.querySelector('.hero');
    const posts = document.getElementById('posts') || document.querySelector('.posts');
    const contact = document.getElementById('contactForm') || document.querySelector('.contact');
    const desk = document.querySelector('.desk');

    if (isMid(hero) && lastHintSection !== 'hero') {
      lastHintSection = 'hero';
      hintExpires = now + 6000;
      say('Welcome to the skyline. Want the latest post?', ['latest'], 6000);
    } else if (isMid(posts) && lastHintSection !== 'posts') {
      lastHintSection = 'posts';
      hintExpires = now + 6000;
      say('Tip: press / to search posts.', [], 6000);
    } else if (isMid(contact) && lastHintSection !== 'contact') {
      lastHintSection = 'contact';
      hintExpires = now + 6000;
      say('Copy my email in one tap.', ['say'], 6000);
    } else if (isMid(desk) && lastHintSection !== 'desk') {
      lastHintSection = 'desk';
      hintExpires = now + 6000;
      say('Ready to read? Check out the drafts.', ['corner'], 6000);
    }
  }, 900);

  // Random mode picker
  function pick(now) {
    if (near && mode !== 'sleep') {
      setMode('sit');
      modeUntil = now + 900;
      return;
    }
    if (mode === 'sleep') {
      setMode('walk');
      modeUntil = now + 4000 + Math.random() * 3000;
      return;
    }
    if (mode === 'walk') {
      // If cursor hasn't moved for 30s, 80% chance to sleep for 25s
      if (now - lastActive > 30000 && Math.random() < 0.8) {
        setMode('sleep');
        modeUntil = now + 25000;
        return;
      }
      // 35% chance to sit for 2-4s
      if (Math.random() < 0.35) {
        setMode('sit');
        modeUntil = now + 2000 + Math.random() * 2000;
      } else {
        modeUntil = now + 3500 + Math.random() * 3000;
      }
      return;
    }
    setMode('walk');
    modeUntil = now + 4000 + Math.random() * 3000;
  }

  // Main animation / walking tick
  function tick(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;

    if (!el.classList.contains('gone')) {
      const minX = 6;
      const maxX = Math.max(minX + 20, window.innerWidth - 120);

      if (REDUCED) {
        // Reduced motion: stands still
        setMode('sit');
      } else {
        if (!hover && now > modeUntil) {
          pick(now);
        }

        if (mode === 'walk' && !hover) {
          x += dir * 52 * dt; // walk right at 52px/s
          if (x > maxX) {
            x = maxX;
            dir = -1;
          }
          if (x < minX) {
            x = minX;
            dir = 1;
          }
        }
      }

      x = Math.max(6, Math.min(maxX, x));

      // Flip speech bubble when near right edge
      if (x > window.innerWidth - 280) {
        el.classList.add('flip-say');
      } else {
        el.classList.remove('flip-say');
      }

      el.style.transform = `translateX(${x}px)`;
      svg.style.transform = `scaleX(${dir})`;
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();

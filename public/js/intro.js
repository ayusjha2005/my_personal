/* ================= OPENING SEQUENCE (boot, robot wakes, name reveals) ================= */
(function () {
  const markDone = () => { window.__introDone = true; (window.__introWait || []).splice(0).forEach(f => { try { f(); } catch (e) {} }); };
  let seen = false; try { seen = sessionStorage.getItem('introSeen') === '1'; } catch (e) {}
  if (seen || matchMedia('(prefers-reduced-motion: reduce)').matches) { markDone(); return; }

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const intro = document.createElement('div');
  intro.id = 'intro';
  intro.setAttribute('role', 'dialog'); intro.setAttribute('aria-label', 'welcome');
  intro.innerHTML = `
    <div class="in-glow"></div>
    <div class="in-top"></div><div class="in-bot"></div>
    <div class="in-label">ayush.os · v2.0</div>
    <div class="in-body">
      <svg class="in-robot" viewBox="0 0 100 100" aria-hidden="true">
        <line x1="50" y1="20" x2="50" y2="8" stroke="#8b98aa" stroke-width="2.4" stroke-linecap="round"/>
        <circle class="in-bulb" cx="50" cy="7" r="4" fill="#e5353b"/>
        <rect x="22" y="20" width="56" height="48" rx="15" fill="#e8eef6" stroke="#6f7b8c" stroke-width="1"/>
        <rect x="30" y="30" width="40" height="28" rx="9" fill="#0b1d33"/>
        <rect class="in-eye" x="37" y="37" width="8" height="12" rx="3" fill="#7cf0ff"/>
        <rect class="in-eye" x="55" y="37" width="8" height="12" rx="3" fill="#7cf0ff"/>
        <rect x="42" y="55" width="16" height="3" rx="1.5" fill="#6f7b8c"/>
      </svg>
      <div class="in-term"></div>
      <div class="in-bar"><i></i></div>
      <div class="in-name"></div>
      <div class="in-tag">exploring technology · building things · sharing what I learn</div>
    </div>
    <button class="in-skip" type="button">skip ⏭</button>`;
  document.body.appendChild(intro);
  document.body.style.overflow = 'hidden';

  const term = intro.querySelector('.in-term');
  const lines = [
    ['> booting ayush.os', ''],
    ['> connecting to mongodb', 'ok'],
    ['> syncing technical articles', 'ok'],
    ['> waking the robot helper', 'ok'],
    ['> welcome back to Ayush Jha\'s tech blog 👋', ''],
  ];
  lines.forEach(([t, ok], i) => setTimeout(() => {
    const d = document.createElement('div');
    d.innerHTML = esc(t) + (ok ? ` <span class="ok">… ${ok} ✓</span>` : '');
    d.style.animationDelay = '0s';
    term.appendChild(d);
  }, 250 + i * 430));

  const name = 'AYUSH JHA';
  intro.querySelector('.in-name').innerHTML = [...name].map((c, i) => `<span style="transition-delay:${i * 70}ms">${c === ' ' ? '&nbsp;' : c}</span>`).join('');

  let finished = false;
  function finish() {
    if (finished) return; finished = true;
    intro.classList.add('out');
    document.body.style.overflow = '';
    try { sessionStorage.setItem('introSeen', '1'); } catch (e) {}
    markDone();
    setTimeout(() => intro.remove(), 1100);
  }
  setTimeout(() => intro.classList.add('awake'), 2300);
  setTimeout(() => intro.classList.add('name'), 2750);
  setTimeout(finish, 4700);
  setTimeout(() => { if (intro.isConnected) finish(); }, 7000);
  intro.querySelector('.in-skip').addEventListener('click', finish);
  const onKey = e => { if (e.key === 'Escape' || e.key === 'Enter') { finish(); removeEventListener('keydown', onKey); } };
  addEventListener('keydown', onKey);
})();

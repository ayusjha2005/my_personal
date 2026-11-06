/* ==============================================================
   TERMINAL PAGE TRANSITION & ARTICLE REVEAL SYSTEM
   ============================================================== */
(function () {
  'use strict';

  const prefersReducedMotion = () => {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  /* -------------------------------------------------------------
     1. UNIFIED AYUSH.OS PAGE TRANSITION SYSTEM
     ------------------------------------------------------------- */
  function getTransitionCommand(path) {
    if (!path || path === '/' || path === '') return '$ cd ~ (home)';
    if (path.includes('writing') || path.includes('blog')) {
      const parts = path.split('/').filter(Boolean);
      if (parts.length > 1) {
        return '$ cat posts/' + parts[parts.length - 1] + '.md';
      }
      return '$ cd /writings';
    }
    if (path.includes('project')) return '$ cd /projects';
    if (path.includes('skill')) return '$ cd /skills';
    if (path.includes('about')) return '$ cat /about.txt';
    if (path.includes('contact')) return '$ connect /contact';
    if (path.includes('corner')) return '$ cd /writing-corner';
    if (path.includes('admin')) return '$ sudo admin-console';

    const clean = path.replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9_-]/g, '-');
    return '$ open /' + (clean || 'system');
  }

  let isTransitioning = false;

  function triggerPageTransition(targetUrl, targetPath) {
    if (prefersReducedMotion()) {
      window.location.href = targetUrl;
      return;
    }
    if (isTransitioning) return;
    isTransitioning = true;

    let overlay = document.getElementById('os-transition');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'os-transition';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML =
        '<div class="trans-top"></div>' +
        '<div class="trans-bot"></div>' +
        '<div class="trans-laser"></div>' +
        '<div class="trans-glow"></div>' +
        '<div class="trans-hud">' +
          '<div class="trans-tag"><span class="trans-dot"></span> ayush.os · routing</div>' +
          '<div class="trans-cmd">' +
            '<span class="trans-prompt">ayush@system:~$</span>' +
            '<span class="trans-text"></span>' +
            '<span class="trans-cursor"></span>' +
          '</div>' +
        '</div>';
      document.body.appendChild(overlay);
    }

    const textEl = overlay.querySelector('.trans-text');
    const cmd = getTransitionCommand(targetPath);
    if (textEl) textEl.textContent = '';

    overlay.style.display = 'block';
    overlay.classList.remove('closed', 'opening');
    void overlay.offsetWidth;
    overlay.classList.add('closing');

    if (textEl) {
      let ci = 0;
      const stepTime = Math.max(12, Math.floor(180 / cmd.length));
      const timer = setInterval(() => {
        if (ci < cmd.length) {
          textEl.textContent += cmd[ci++];
        } else {
          clearInterval(timer);
        }
      }, stepTime);
    }

    try {
      sessionStorage.setItem('osPageTransition', '1');
      sessionStorage.setItem('osPageTransitionCmd', cmd);
    } catch (_) {}

    setTimeout(() => {
      window.location.href = targetUrl;
    }, 320);

    setTimeout(() => {
      if (overlay) {
        overlay.classList.remove('closing');
        isTransitioning = false;
      }
    }, 2000);
  }

  function initPageEntrance() {
    let hadTransition = false;
    let cmd = '';
    try {
      hadTransition = sessionStorage.getItem('osPageTransition') === '1';
      cmd = sessionStorage.getItem('osPageTransitionCmd') || 'ready ✓';
    } catch (_) {}

    if (!hadTransition || prefersReducedMotion()) {
      const existing = document.getElementById('os-transition');
      if (existing) existing.style.display = 'none';
      return;
    }

    try {
      sessionStorage.removeItem('osPageTransition');
      sessionStorage.removeItem('osPageTransitionCmd');
    } catch (_) {}

    // If initial intro boot animation is active on home page, do not fight it
    if (document.getElementById('intro')) {
      const existing = document.getElementById('os-transition');
      if (existing) existing.style.display = 'none';
      return;
    }

    let overlay = document.getElementById('os-transition');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'os-transition';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML =
        '<div class="trans-top"></div>' +
        '<div class="trans-bot"></div>' +
        '<div class="trans-laser"></div>' +
        '<div class="trans-glow"></div>' +
        '<div class="trans-hud">' +
          '<div class="trans-tag"><span class="trans-dot"></span> ayush.os · ready</div>' +
          '<div class="trans-cmd">' +
            '<span class="trans-prompt">ayush@system:~$</span>' +
            '<span class="trans-text">' + cmd + '</span>' +
          '</div>' +
        '</div>';
      document.body.appendChild(overlay);
    }

    overlay.style.display = 'block';
    overlay.classList.add('closed');
    void overlay.offsetWidth;

    setTimeout(() => {
      overlay.classList.add('opening');
      setTimeout(() => {
        overlay.style.display = 'none';
        overlay.classList.remove('closed', 'opening');
      }, 380);
    }, 40);
  }

  function initNavigationInterceptor() {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      const link = e.target.closest && e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        link.target === '_blank' ||
        link.hasAttribute('download')
      ) {
        return;
      }

      let targetUrl;
      try {
        targetUrl = new URL(href, window.location.href);
      } catch (_) {
        return;
      }

      if (targetUrl.origin !== window.location.origin) {
        return;
      }

      if (targetUrl.pathname === window.location.pathname && targetUrl.search === window.location.search) {
        return;
      }

      e.preventDefault();
      triggerPageTransition(targetUrl.href, targetUrl.pathname);
    });

    window.triggerPageTransition = triggerPageTransition;
  }
  /* -------------------------------------------------------------
     2. ARTICLE WINDOW & SEQUENTIAL TEXT REVEAL
     ------------------------------------------------------------- */
  function initArticleTerminalReveal() {
    const articleContainer = document.querySelector('.article-terminal-target');
    if (!articleContainer) return;

    const slug = articleContainer.getAttribute('data-slug') || 'article';
    const contentTarget = articleContainer.querySelector('.terminal-article-content');
    const cmdTextTarget = articleContainer.querySelector('.terminal-cmd-text');
    const cmdCursorTarget = articleContainer.querySelector('.terminal-cmd-cursor');

    if (!contentTarget || !cmdTextTarget) return;

    if (prefersReducedMotion()) {
      // Immediately reveal full content without delay
      cmdTextTarget.textContent = `cat ${slug}.md`;
      if (cmdCursorTarget) cmdCursorTarget.remove();
      return;
    }

    // Hide original rendered elements initially
    const children = Array.from(contentTarget.children);
    if (children.length === 0) return;

    // Collect all text nodes in order
    const textNodeEntries = [];
    const walker = document.createTreeWalker(contentTarget, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walker.nextNode())) {
      const originalText = node.nodeValue;
      // Keep only non-empty text (or meaningful whitespace)
      if (originalText && originalText.trim().length > 0) {
        textNodeEntries.push({
          node: node,
          originalText: originalText,
        });
        node.nodeValue = ''; // Clear initial text
      }
    }

    // Step 1: Type `cat <slug>.md` at 70ms per character
    const commandToType = `cat ${slug}.md`;
    let cmdIndex = 0;

    const cmdInterval = setInterval(() => {
      if (cmdIndex < commandToType.length) {
        cmdTextTarget.textContent += commandToType[cmdIndex];
        cmdIndex++;
      } else {
        clearInterval(cmdInterval);

        // Step 2: Pause 450ms, then reveal article text
        setTimeout(() => {
          // Remove command cursor or move it into typing stream
          if (cmdCursorTarget) {
            cmdCursorTarget.style.display = 'none';
          }
          startArticleTextReveal(textNodeEntries, contentTarget);
        }, 450);
      }
    }, 70);
  }

  function startArticleTextReveal(textEntries, container) {
    if (textEntries.length === 0) return;

    // Calculate total characters across all text nodes
    let totalChars = 0;
    textEntries.forEach(item => {
      totalChars += item.originalText.length;
    });

    // Target whole reveal to take ~12 seconds in 30ms ticks (approx 400 ticks)
    const tickIntervalMs = 30;
    const targetTotalTicks = 400; // 400 * 30ms = 12000ms = 12s
    const charsPerTick = Math.max(1, Math.ceil(totalChars / targetTotalTicks));

    // Create an active blinking red block cursor that stays at current typing location
    const typingCursor = document.createElement('span');
    typingCursor.className = 'term-cursor';
    typingCursor.id = 'article-typing-cursor';
    container.appendChild(typingCursor);

    let currentEntryIdx = 0;
    let currentCharInEntry = 0;

    const revealTimer = setInterval(() => {
      if (currentEntryIdx >= textEntries.length) {
        clearInterval(revealTimer);
        // Fade out or remove typing cursor at the end
        setTimeout(() => {
          if (typingCursor.parentNode) {
            typingCursor.parentNode.removeChild(typingCursor);
          }
        }, 1200);
        return;
      }

      for (let c = 0; c < charsPerTick; c++) {
        if (currentEntryIdx >= textEntries.length) break;

        const entry = textEntries[currentEntryIdx];
        const remainingChars = entry.originalText.length - currentCharInEntry;

        if (remainingChars > 0) {
          entry.node.nodeValue += entry.originalText[currentCharInEntry];
          currentCharInEntry++;

          // Keep blinking red cursor right after current text position
          if (entry.node.parentNode) {
            entry.node.parentNode.insertBefore(typingCursor, entry.node.nextSibling);
          }
        }

        if (currentCharInEntry >= entry.originalText.length) {
          currentEntryIdx++;
          currentCharInEntry = 0;
        }
      }
    }, tickIntervalMs);
  }

  /* -------------------------------------------------------------
     3. TERMINAL COMMAND BAR COMPONENT
     ------------------------------------------------------------- */
  let cmdBarEl = null;
  let cmdScrimEl = null;
  let cmdOutputEl = null;
  let cmdInputEl = null;
  let cmdHistory = [];
  let cmdHistoryIdx = -1;
  let articlesCache = null;
  let isMatrixRunning = false;
  let matrixCanvas = null;
  let matrixAnimFrame = null;
  let startTime = Date.now();

  function initTerminalCommandBar() {
    if (document.getElementById('terminal-cmdbar')) return;

    // Create Scrim
    cmdScrimEl = document.createElement('div');
    cmdScrimEl.className = 'cmdbar-scrim';
    cmdScrimEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cmdScrimEl);

    // Create Command Bar Drawer
    cmdBarEl = document.createElement('div');
    cmdBarEl.id = 'terminal-cmdbar';
    cmdBarEl.setAttribute('role', 'dialog');
    cmdBarEl.setAttribute('aria-label', 'Terminal Command Bar');

    cmdBarEl.innerHTML = `
      <div class="cmdbar-titlebar">
        <span class="cmdbar-title-text">
          <span style="color:#27c93f;font-weight:700;">&gt;_</span> ayush@blog · command bar · type help
        </span>
        <button type="button" class="cmdbar-close-btn" id="cmdBarClose" aria-label="Close command bar">×</button>
      </div>
      <div class="cmdbar-output" id="cmdBarOutput"></div>
      <div class="cmdbar-input-row">
        <span class="cmdbar-prompt">ayush@blog:~$</span>
        <div class="cmdbar-input-wrap">
          <input type="text" class="cmdbar-input" id="cmdBarInput" autocomplete="off" spellcheck="false" aria-label="Terminal command input" />
        </div>
      </div>
    `;

    document.body.appendChild(cmdBarEl);

    cmdOutputEl = document.getElementById('cmdBarOutput');
    cmdInputEl = document.getElementById('cmdBarInput');
    const closeBtn = document.getElementById('cmdBarClose');

    // Close handlers
    closeBtn.addEventListener('click', closeCommandBar);
    cmdScrimEl.addEventListener('click', closeCommandBar);

    // Command input handling
    cmdInputEl.addEventListener('keydown', handleCommandKeyDown);

    // Header >_ button trigger
    const headerBtn = document.getElementById('openCmdBar');
    if (headerBtn) {
      headerBtn.addEventListener('click', openCommandBar);
    }

    // Mobile drawer command bar button trigger
    document.addEventListener('click', (e) => {
      const dBtn = e.target.closest('#dCmdBar');
      if (dBtn) {
        document.body.classList.remove('nav-open');
        openCommandBar();
      }
    });

    // Global Key Listener: backtick to open/toggle, escape to close
    document.addEventListener('keydown', (e) => {
      // Don't intercept if user is typing in standard form inputs/textareas
      const activeEl = document.activeElement;
      const isInputActive = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.isContentEditable
      );

      if (e.key === '`' || e.key === '~') {
        // If typing in another input (and not our terminal input), don't open
        if (isInputActive && activeEl !== cmdInputEl) {
          return;
        }
        e.preventDefault();
        toggleCommandBar();
        return;
      }

      if (e.key === 'Escape' && isCommandBarOpen()) {
        e.preventDefault();
        closeCommandBar();
      }
    });
  }

  function isCommandBarOpen() {
    return cmdBarEl && cmdBarEl.classList.contains('open');
  }

  function openCommandBar() {
    if (!cmdBarEl) return;
    cmdBarEl.classList.add('open');
    cmdScrimEl.classList.add('open');

    // Welcome line on first open
    if (!sessionStorage.getItem('cmdbar_welcomed')) {
      sessionStorage.setItem('cmdbar_welcomed', '1');
      printOutput('ayush@blog v2.4.0 (x86_64-pc-linux-gnu)', 'cmd-muted');
      printOutput('Welcome! Type "help" to list available commands or "ls" to view articles.', 'cmd-ok');
      printOutput('------------------------------------------------------------', 'cmd-muted');
    }

    setTimeout(() => {
      if (cmdInputEl) {
        cmdInputEl.focus();
      }
    }, 50);
  }

  function closeCommandBar() {
    if (!cmdBarEl) return;
    cmdBarEl.classList.remove('open');
    cmdScrimEl.classList.remove('open');
    if (cmdInputEl) {
      cmdInputEl.blur();
    }
  }

  function toggleCommandBar() {
    if (isCommandBarOpen()) {
      closeCommandBar();
    } else {
      openCommandBar();
    }
  }

  function printOutput(text, className = '') {
    if (!cmdOutputEl) return;
    const line = document.createElement('div');
    if (className) line.className = className;
    line.textContent = text;
    cmdOutputEl.appendChild(line);
    cmdOutputEl.scrollTop = cmdOutputEl.scrollHeight;
  }

  /* ---------- Terminal Keyboard Mechanical Click Sound (Web Audio) ---------- */
  let audioCtx = null;
  let soundEnabled = true;
  try {
    const savedSound = localStorage.getItem('term_sound');
    if (savedSound !== null) soundEnabled = savedSound === '1';
  } catch (e) {}

  function playMechanicalClick() {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;
      // High-frequency transient burst + bandpass filtered noise
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400 + Math.random() * 600, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.024);

      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.028);
    } catch (e) {}
  }

  function handleCommandKeyDown(e) {
    // Play mechanical click on printable characters, backspace, space, enter
    if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') {
      playMechanicalClick();
    }

    if (e.key === 'Enter') {
      const rawCmd = cmdInputEl.value.trim();
      if (rawCmd.length > 0) {
        cmdHistory.push(rawCmd);
        cmdHistoryIdx = cmdHistory.length;
        printOutput(`ayush@blog:~$ ${rawCmd}`, 'cmd-line');
        executeCommand(rawCmd);
        cmdInputEl.value = '';
      } else {
        printOutput('ayush@blog:~$ ', 'cmd-line');
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      if (cmdHistoryIdx > 0) {
        cmdHistoryIdx--;
        cmdInputEl.value = cmdHistory[cmdHistoryIdx];
      } else if (cmdHistoryIdx === 0) {
        cmdInputEl.value = cmdHistory[0];
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      if (cmdHistoryIdx < cmdHistory.length - 1) {
        cmdHistoryIdx++;
        cmdInputEl.value = cmdHistory[cmdHistoryIdx];
      } else {
        cmdHistoryIdx = cmdHistory.length;
        cmdInputEl.value = '';
      }
      return;
    }
  }

  async function fetchArticles() {
    if (articlesCache) return articlesCache;
    try {
      const res = await fetch('/api/posts');
      articlesCache = await res.json();
      return articlesCache;
    } catch (e) {
      return [];
    }
  }

  async function executeCommand(cmdStr) {
    const parts = cmdStr.split(/\s+/).filter(Boolean);
    const cmd = (parts[0] || '').toLowerCase();
    const arg = parts.slice(1).join(' ').trim();

    switch (cmd) {
      case 'help':
        printOutput('Available terminal commands:', 'cmd-highlight');
        printOutput('  help                 - List every available command');
        printOutput('  ls                   - List all articles by date and slug');
        printOutput('  cat <slug>           - Open an article after short delay and close bar');
        printOutput('  open <target>        - Navigate to home, corner, about, writings, skills, projects, contact, admin');
        printOutput('  admin                - Access administrative console (/admin)');
        printOutput('  status               - Print online state, ping latency, article count, uptime');
        printOutput('  whoami               - Print site owner details and bio tagline');
        printOutput('  date                 - Print current date and time');
        printOutput('  theme light|dark     - Switch theme');
        printOutput('  ayush                - Show personal engineer greeting');
        printOutput('  matrix               - Start / toggle matrix digital rain effect');
        printOutput('  sudo                 - Elevated admin console access');
        printOutput('  clear                - Empty output area');
        printOutput('  exit                 - Close terminal command bar');
        break;

      case 'admin':
      case 'login':
        printOutput('Authenticating session credentials...', 'cmd-muted');
        printOutput('Redirecting to Admin Gateway (/admin)...', 'cmd-ok');
        setTimeout(() => {
          closeCommandBar();
          if (typeof triggerPageTransition === 'function') {
            triggerPageTransition('/admin', '/admin');
          } else {
            window.location.href = '/admin';
          }
        }, 380);
        break;

      case 'ls':
        printOutput('Fetching index of writings...', 'cmd-muted');
        const posts = await fetchArticles();
        if (!posts || posts.length === 0) {
          printOutput('No articles found or offline.', 'cmd-err');
        } else {
          printOutput(`total ${posts.length} articles:`, 'cmd-ok');
          posts.forEach(p => {
            const dateStr = p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '2026-04-12';
            printOutput(`  ${dateStr}  ${p.slug}.md  [${p.category || 'Tech'}]`);
          });
        }
        break;

      case 'cat':
        if (!arg) {
          printOutput('usage: cat <slug> (e.g. cat understanding-rest-apis-with-nodejs-and-express)', 'cmd-err');
          return;
        }
        const cleanSlug = arg.replace(/\.md$/i, '').trim();
        printOutput(`Reading ~/posts/${cleanSlug}.md ...`, 'cmd-ok');
        setTimeout(() => {
          closeCommandBar();
          if (typeof triggerPageTransition === 'function') {
            triggerPageTransition(`/writings/${cleanSlug}`, `/writings/${cleanSlug}`);
          } else {
            window.location.href = `/writings/${cleanSlug}`;
          }
        }, 380);
        break;

      case 'open':
        const target = arg.toLowerCase();
        let destination = '';
        if (target === 'home' || target === '/') destination = '/';
        else if (target === 'corner' || target === 'writing-corner') destination = '/corner';
        else if (target === 'about') destination = '/about';
        else if (target === 'writings' || target === 'blogs') destination = '/writings';
        else if (target === 'projects') destination = '/projects';
        else if (target === 'skills') destination = '/skills';
        else if (target === 'contact') destination = '/contact';
        else if (target === 'admin' || target === 'dashboard' || target === 'console') destination = '/admin';
        else {
          printOutput(`unknown destination: "${target}". Try: open home|corner|about|writings|projects|skills|contact|admin`, 'cmd-err');
          return;
        }
        printOutput(`Navigating to ${destination} ...`, 'cmd-ok');
        setTimeout(() => {
          closeCommandBar();
          if (typeof triggerPageTransition === 'function') {
            triggerPageTransition(destination, destination);
          } else {
            window.location.href = destination;
          }
        }, 350);
        break;

      case 'status':
        const isOnline = navigator.onLine ? 'ONLINE (HTTP/2 · TLS 1.3)' : 'OFFLINE';
        const pingStart = performance.now();
        let pingMs = 12;
        try {
          await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-store' });
          pingMs = Math.round(performance.now() - pingStart);
        } catch (e) {
          pingMs = Math.round(performance.now() - pingStart);
        }
        const allPosts = await fetchArticles();
        const uptimeSec = Math.floor((Date.now() - startTime) / 1000);
        const upMins = Math.floor(uptimeSec / 60);
        const upSecs = uptimeSec % 60;

        printOutput('System Telemetry Status:', 'cmd-highlight');
        printOutput(`  Network:      ${isOnline}`, 'cmd-ok');
        printOutput(`  Latency:      ${pingMs}ms roundtrip`, 'cmd-ok');
        printOutput(`  Articles:     ${allPosts.length} indexed`, 'cmd-ok');
        printOutput(`  Uptime:       ${upMins}m ${upSecs}s`, 'cmd-ok');
        printOutput(`  Memory Heap:  ${(performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB' : 'Active (optimized)')}`, 'cmd-muted');
        break;

      case 'whoami':
        printOutput('Ayush Jha', 'cmd-highlight');
        printOutput('B.Tech in Computer Science and Engineering @ VIT (2025–2029)', 'cmd-ok');
        printOutput('Computer Science Student | Aspiring Software Engineer', 'cmd-muted');
        break;

      case 'date':
        printOutput(new Date().toString(), 'cmd-ok');
        break;

      case 'sound':
        const sArg = arg.toLowerCase();
        if (sArg === 'off' || sArg === '0') {
          soundEnabled = false;
          try { localStorage.setItem('term_sound', '0'); } catch (e) {}
          printOutput('Mechanical keyboard click sound: OFF', 'cmd-ok');
        } else if (sArg === 'on' || sArg === '1') {
          soundEnabled = true;
          try { localStorage.setItem('term_sound', '1'); } catch (e) {}
          printOutput('Mechanical keyboard click sound: ON', 'cmd-ok');
        } else {
          printOutput(`Keyboard click sound is currently ${soundEnabled ? 'ON' : 'OFF'}. Type "sound on" or "sound off" to change.`, 'cmd-muted');
        }
        break;

      case 'ayush':
        printOutput('Hey there! Thanks for exploring my personal terminal command bar.', 'cmd-highlight');
        printOutput('I love systems programming, backend architectures, databases, and minimalist black & red aesthetics.', 'cmd-ok');
        printOutput('Feel free to inspect my writings or drop a note via "open contact".', 'cmd-muted');
        break;

      case 'matrix':
        toggleMatrixRain();
        break;

      case 'sudo':
        printOutput('ayush is in the sudoers file. Elevated credentials granted.', 'cmd-highlight');
        printOutput('Navigating to root admin console (/admin)...', 'cmd-ok');
        setTimeout(() => {
          closeCommandBar();
          if (typeof triggerPageTransition === 'function') {
            triggerPageTransition('/admin', '/admin');
          } else {
            window.location.href = '/admin';
          }
        }, 400);
        break;

      case 'clear':
        if (cmdOutputEl) {
          cmdOutputEl.innerHTML = '';
        }
        break;

      case 'exit':
        closeCommandBar();
        break;

      default:
        printOutput(`command not found. type help`, 'cmd-err');
        break;
    }
  }

  /* -------------------------------------------------------------
     4. MATRIX DIGITAL RAIN EFFECT
     ------------------------------------------------------------- */
  function toggleMatrixRain() {
    if (isMatrixRunning) {
      stopMatrixRain();
      printOutput('Matrix digital rain stopped.', 'cmd-muted');
    } else {
      startMatrixRain();
      printOutput('Matrix digital rain initiated. Run "matrix" again to stop.', 'cmd-ok');
    }
  }

  function startMatrixRain() {
    if (isMatrixRunning) return;
    isMatrixRunning = true;

    if (!matrixCanvas) {
      matrixCanvas = document.createElement('canvas');
      matrixCanvas.id = 'matrixCanvas';
      document.body.appendChild(matrixCanvas);
    }

    matrixCanvas.classList.add('active');
    const ctx = matrixCanvas.getContext('2d');

    const resize = () => {
      matrixCanvas.width = window.innerWidth;
      matrixCanvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const chars = '0123456789ABCDEFアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const fontSize = 14;
    const columns = Math.floor(matrixCanvas.width / fontSize);
    const drops = new Array(columns).fill(1);

    function draw() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

      ctx.fillStyle = '#e5353b'; // Black and red signature color palette
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      if (isMatrixRunning) {
        matrixAnimFrame = requestAnimationFrame(draw);
      }
    }

    draw();
  }

  function stopMatrixRain() {
    isMatrixRunning = false;
    if (matrixAnimFrame) {
      cancelAnimationFrame(matrixAnimFrame);
      matrixAnimFrame = null;
    }
    if (matrixCanvas) {
      matrixCanvas.classList.remove('active');
      const ctx = matrixCanvas.getContext('2d');
      ctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    }
  }

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initPageEntrance();
      initNavigationInterceptor();
      initArticleTerminalReveal();
      initTerminalCommandBar();
    });
  } else {
    initPageEntrance();
    initNavigationInterceptor();
    initArticleTerminalReveal();
    initTerminalCommandBar();
  }
})();


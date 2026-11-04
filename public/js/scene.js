/* ==========================================================================
   TOKYO DRIFT: Night-Street Scene Canvas
   Vanilla JS & Canvas Implementation
   ========================================================================== */

(function () {
  function initScene() {
    const c = document.getElementById('scene');
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const TAU = Math.PI * 2;
    const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W = 0, H = 0, dpr = 1, mx = 0.5;
    let animId = null;
    const sceneStartTime = performance.now();

    // Particle & history caps
    const MAX_SMOKE = 420;
    const MAX_SKID = 160;

    const smokePuffs = [];
    const skidPoints = [];

    // Pseudo-random deterministic helper for building layout
    function pseudoRand(seed) {
      const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
      return x - Math.floor(x);
    }

    // 1. Stars (~70 dots in top 45% of sky)
    const stars = [];
    for (let i = 0; i < 70; i++) {
      stars.push({
        fx: pseudoRand(i * 3 + 1),
        fy: pseudoRand(i * 7 + 2) * 0.45,
        r: 0.6 + pseudoRand(i * 11 + 3) * 1.2,
        phase: pseudoRand(i * 13 + 5) * TAU,
      });
    }

    // 2. Rain (~110 streaks)
    const rain = [];
    for (let i = 0; i < 110; i++) {
      rain.push({
        x: pseudoRand(i * 17 + 7),
        y: pseudoRand(i * 19 + 11),
        speed: 0.6 + pseudoRand(i * 23 + 13) * 0.6,
      });
    }

    // 3. Skyline Layers Configuration
    const layerDefs = [
      { count: 22, color: '#141026', minH: 0.25, maxH: 0.55, parallax: 0.25, winDensity: 0.25 },
      { count: 15, color: '#0b0716', minH: 0.30, maxH: 0.70, parallax: 0.60, winDensity: 0.40 },
      { count: 9,  color: '#050309', minH: 0.20, maxH: 0.50, parallax: 1.10, winDensity: 0.55 },
    ];

    const skylineLayers = layerDefs.map((def, layerIdx) => {
      const buildings = [];
      let curX = 0;
      for (let bi = 0; bi < def.count; bi++) {
        const seed = bi + layerIdx * 100;
        const widthRel = 0.05 + pseudoRand(seed * 1.3) * 0.06; // 5% - 11% of W
        const heightRel = def.minH + pseudoRand(seed * 2.7) * (def.maxH - def.minH);
        const hasNeon = pseudoRand(seed * 4.1) < 0.35;
        const neonColor = pseudoRand(seed * 5.3) < 0.4 ? '#00e5ff' : (pseudoRand(seed * 5.3) < 0.7 ? '#ff4d2e' : '#9ad7ff');
        const hasBeacon = pseudoRand(seed * 7.1) < 0.3;

        buildings.push({
          bi,
          seed: pseudoRand(seed * 8.9),
          xRel: curX,
          widthRel,
          heightRel,
          hasNeon,
          neonColor,
          hasBeacon,
          winSeed: seed * 12.3,
        });

        curX += widthRel * (0.85 + pseudoRand(seed * 9.7) * 0.3);
      }
      return { def, buildings };
    });

    // 4. Shooting Star State
    let nextShootingStarTime = 5;
    let currentShootingStar = null;

    // 5. Opening Convoy State
    const convoyCars = [
      { type: 'sports', start: 0.20, bodyColor: '#c81d1d', glowColor: '#00e5ff', phase: 0 },
      { type: 'sports', start: 0.65, bodyColor: '#e8edf5', glowColor: '#ff4d2e', phase: 1.7 },
      { type: 'sports', start: 1.10, bodyColor: '#101622', glowColor: '#00e5ff', phase: 3.4 },
      { type: 'police', start: 1.30, phase: 0 },
      { type: 'police', start: 1.75, phase: 1.5 },
    ];

    function resize() {
      dpr = window.devicePixelRatio || 1;
      const rect = c.getBoundingClientRect();
      W = rect.width || c.parentElement.clientWidth || 800;
      H = rect.height || 230;
      c.width = W * dpr;
      c.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    if (c.parentElement) {
      c.parentElement.addEventListener('pointermove', (e) => {
        const r = c.getBoundingClientRect();
        mx = (e.clientX - r.left) / (r.width || 1);
      });
      c.parentElement.addEventListener('pointerleave', () => { mx = 0.5; });
    }

    // Helper: Spawn smoke puff
    function spawnSmoke(x, y, vx, vy) {
      if (prefersReducedMotion || smokePuffs.length >= MAX_SMOKE) return;
      smokePuffs.push({
        x,
        y,
        vx,
        vy,
        radius: 2 + Math.random() * 2,
        life: 1,
      });
    }

    // Drawing: Sports Car
    function drawSportsCar(x, gy, k, yaw, distance, bodyColor, glowColor) {
      ctx.save();
      ctx.translate(x, gy);
      ctx.scale(k, k);
      ctx.translate(16, -3);
      ctx.rotate(yaw);
      ctx.translate(-16, 3);

      // Underglow
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(40, 0, 38, 2.6, 0, 0, TAU);
      ctx.fillStyle = glowColor || 'rgba(0,229,255,0.22)';
      ctx.shadowColor = glowColor || '#00e5ff';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();

      // Body path
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(3, -10);
      ctx.lineTo(16, -13);
      ctx.lineTo(28, -18);
      ctx.lineTo(44, -18);
      ctx.lineTo(54, -12);
      ctx.lineTo(72, -10);
      ctx.lineTo(80, -7);
      ctx.lineTo(80, -3);
      ctx.closePath();
      ctx.fillStyle = bodyColor || '#c81d1d';
      ctx.fill();
      ctx.lineWidth = 0.7;
      ctx.strokeStyle = 'rgba(0,229,255,0.55)';
      ctx.stroke();

      // Glass quad: (28,-18) (44,-18) (50,-12) (24,-12)
      ctx.beginPath();
      ctx.moveTo(28, -18);
      ctx.lineTo(44, -18);
      ctx.lineTo(50, -12);
      ctx.lineTo(24, -12);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0,229,255,0.28)';
      ctx.fill();

      // Red stripe: (6,-7) to (76,-7)
      ctx.beginPath();
      ctx.moveTo(6, -7);
      ctx.lineTo(76, -7);
      ctx.strokeStyle = 'rgba(255,77,46,0.9)';
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // Rear spoiler: rect at (2,-16), 9 x 2, #0a0c14
      ctx.fillStyle = '#0a0c14';
      ctx.fillRect(2, -16, 9, 2);

      // Wheels: at (16,-3) and (64,-3), r = 4.5
      [16, 64].forEach((wx) => {
        ctx.beginPath();
        ctx.arc(wx, -3, 4.5, 0, TAU);
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.lineWidth = 0.6;
        ctx.strokeStyle = '#222';
        ctx.stroke();

        // Rotating spokes
        const a = distance / 4.5 + wx;
        ctx.beginPath();
        ctx.moveTo(wx + 3 * Math.cos(a), -3 + 3 * Math.sin(a));
        ctx.lineTo(wx - 3 * Math.cos(a), -3 - 3 * Math.sin(a));
        ctx.strokeStyle = 'rgba(0,229,255,0.6)';
        ctx.lineWidth = 0.7;
        ctx.stroke();
      });

      // Headlight: arc radius 1.5 at (80,-6), #fff8dc, shadowBlur 8, shadowColor #ffd666
      ctx.save();
      ctx.beginPath();
      ctx.arc(80, -6, 1.5, 0, TAU);
      ctx.fillStyle = '#fff8dc';
      ctx.shadowColor = '#ffd666';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();

      // Taillight: arc radius 1.2 at (0,-8), #ff3b3b
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, -8, 1.2, 0, TAU);
      ctx.fillStyle = '#ff3b3b';
      ctx.shadowColor = '#ff3b3b';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();

      ctx.restore();
    }

    // Drawing: Police Cruiser
    function drawPoliceCruiser(x, gy, k, yaw, distance, t) {
      ctx.save();
      ctx.translate(x, gy);
      ctx.scale(k, k);
      ctx.translate(14, -3);
      ctx.rotate(yaw || 0);
      ctx.translate(-14, 3);

      // Cruiser body: (0,-4) (2,-11) (14,-14) (24,-21) (42,-21) (52,-14) (70,-12) (76,-8) (76,-3)
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(2, -11);
      ctx.lineTo(14, -14);
      ctx.lineTo(24, -21);
      ctx.lineTo(42, -21);
      ctx.lineTo(52, -14);
      ctx.lineTo(70, -12);
      ctx.lineTo(76, -8);
      ctx.lineTo(76, -3);
      ctx.closePath();
      ctx.fillStyle = '#e9edf4';
      ctx.fill();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = '#05060c';
      ctx.stroke();

      // Black stripe: rect (0,-9) 76 x 2.4
      ctx.fillStyle = '#05060c';
      ctx.fillRect(0, -9, 76, 2.4);

      // Windscreen: quad (26,-14) (40,-14) (46,-13) (24,-13)
      ctx.beginPath();
      ctx.moveTo(26, -14);
      ctx.lineTo(40, -14);
      ctx.lineTo(46, -13);
      ctx.lineTo(24, -13);
      ctx.closePath();
      ctx.fillStyle = 'rgba(10,14,24,0.85)';
      ctx.fill();

      // Light bar: red rect (29,-24) 8x3 and blue rect (38,-24) 8x3
      const isFlash = Math.floor(7 * t) % 2 === 0;
      ctx.save();
      ctx.shadowBlur = 10;
      // Red light
      ctx.fillStyle = isFlash ? '#ff2a2a' : '#5a0f0f';
      ctx.shadowColor = isFlash ? '#ff2a2a' : 'transparent';
      ctx.fillRect(29, -24, 8, 3);
      // Blue light
      ctx.fillStyle = isFlash ? '#103366' : '#2a7bff';
      ctx.shadowColor = isFlash ? 'transparent' : '#2a7bff';
      ctx.fillRect(38, -24, 8, 3);
      ctx.restore();

      // Headlight & taillight
      ctx.save();
      ctx.beginPath();
      ctx.arc(76, -6, 1.4, 0, TAU);
      ctx.fillStyle = '#fff8dc';
      ctx.shadowColor = '#ffd666';
      ctx.shadowBlur = 6;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, -7, 1.2, 0, TAU);
      ctx.fillStyle = '#ff3b3b';
      ctx.shadowColor = '#ff3b3b';
      ctx.shadowBlur = 5;
      ctx.fill();
      ctx.restore();

      // Wheels: circles r = 4.5 at (14,-3) and (62,-3)
      [14, 62].forEach((wx) => {
        ctx.beginPath();
        ctx.arc(wx, -3, 4.5, 0, TAU);
        ctx.fillStyle = '#000000';
        ctx.fill();

        const a = distance / 4.5 + wx;
        ctx.beginPath();
        ctx.moveTo(wx + 3 * Math.cos(a), -3 + 3 * Math.sin(a));
        ctx.lineTo(wx - 3 * Math.cos(a), -3 - 3 * Math.sin(a));
        ctx.strokeStyle = 'rgba(200,210,230,0.6)';
        ctx.lineWidth = 0.7;
        ctx.stroke();
      });

      ctx.restore();
    }

    // Drawing: Helicopter
    function drawHelicopter(cx, gy, t) {
      const hx = cx - 70;
      const hy = H * 0.14 + 4 * Math.sin(1.1 * t);
      const scale = 1.2;

      ctx.save();
      ctx.translate(hx, hy);
      ctx.scale(scale, scale);

      // Searchlight cone down to (cx + 52, gy - 12)
      // Transform local target coordinate:
      const targetLocalX = (cx + 52 - hx) / scale;
      const targetLocalY = (gy - 12 - hy) / scale;

      const lightGrad = ctx.createLinearGradient(0, 10, targetLocalX, targetLocalY);
      lightGrad.addColorStop(0, 'rgba(255,250,220,0.28)');
      lightGrad.addColorStop(1, 'rgba(255,250,220,0.05)');

      ctx.beginPath();
      ctx.moveTo(-2, 10);
      ctx.lineTo(2, 10);
      ctx.lineTo(targetLocalX + 20, targetLocalY);
      ctx.lineTo(targetLocalX - 20, targetLocalY);
      ctx.closePath();
      ctx.fillStyle = lightGrad;
      ctx.fill();

      // Rotor: ellipse (0,-12), radii 30*(0.55 + 0.45*|sin(28t)|)*1.6 x 1.8
      const rotorW = 30 * (0.55 + 0.45 * Math.abs(Math.sin(28 * t))) * 1.6;
      ctx.beginPath();
      ctx.ellipse(0, -12, rotorW, 1.8, 0, 0, TAU);
      ctx.fillStyle = 'rgba(200,210,225,0.3)';
      ctx.fill();

      // Mast
      ctx.strokeStyle = '#05060c';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(0, -8);
      ctx.stroke();

      // Tail boom: polygon (18,-3) (52,-5) (52,-2) (18,2)
      ctx.beginPath();
      ctx.moveTo(18, -3);
      ctx.lineTo(52, -5);
      ctx.lineTo(52, -2);
      ctx.lineTo(18, 2);
      ctx.closePath();
      ctx.fillStyle = '#0a0c14';
      ctx.fill();

      // Tail fin: polygon (50,-5) (54,-14) (56,-13) (53,-3)
      ctx.beginPath();
      ctx.moveTo(50, -5);
      ctx.lineTo(54, -14);
      ctx.lineTo(56, -13);
      ctx.lineTo(53, -3);
      ctx.closePath();
      ctx.fillStyle = '#0a0c14';
      ctx.fill();

      // Tail rotor
      ctx.beginPath();
      ctx.arc(54, -13, 3.5, 0, TAU);
      ctx.fillStyle = 'rgba(200,210,225,0.25)';
      ctx.fill();

      // Body: ellipse (0,0), radii 22 x 10, #0a0c14, stroke rgba(0,229,255,0.5), 0.6px
      ctx.beginPath();
      ctx.ellipse(0, 0, 22, 10, 0, 0, TAU);
      ctx.fillStyle = '#0a0c14';
      ctx.fill();
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = 'rgba(0,229,255,0.5)';
      ctx.stroke();

      // Cockpit: ellipse (-8,-2), radii 9 x 6, rgba(0,229,255,0.3)
      ctx.beginPath();
      ctx.ellipse(-8, -2, 9, 6, 0, 0, TAU);
      ctx.fillStyle = 'rgba(0,229,255,0.3)';
      ctx.fill();

      // Skids: line (-14,12) to (14,12); struts (-6,6)->(-8,12) and (8,6)->(8,12)
      ctx.strokeStyle = '#05060c';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-14, 12);
      ctx.lineTo(14, 12);
      ctx.moveTo(-6, 6);
      ctx.lineTo(-8, 12);
      ctx.moveTo(8, 6);
      ctx.lineTo(8, 12);
      ctx.stroke();

      // Nav light: dot r = 1.4 at (-22,0). #ff2a2a when flash is true, #3a0808 otherwise
      const flash = Math.floor(7 * t) % 2 === 0;
      ctx.save();
      ctx.beginPath();
      ctx.arc(-22, 0, 1.4, 0, TAU);
      ctx.fillStyle = flash ? '#ff2a2a' : '#3a0808';
      ctx.shadowColor = flash ? '#ff2a2a' : 'transparent';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();

      ctx.restore();
    }

    // MAIN ANIMATION LOOP
    function render(now) {
      if (!c.isConnected) return;
      const t = (now - sceneStartTime) / 1000;
      const gy = H - 5;
      const isMobile = W < 700;
      const carScaleFactor = isMobile ? 0.8 : 1.0;

      ctx.clearRect(0, 0, W, H);

      // 1. Sky Gradient: #06030c (top), #1a0a22 (65%), #3d0f1c (bottom)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, '#06030c');
      skyGrad.addColorStop(0.65, '#1a0a22');
      skyGrad.addColorStop(1, '#3d0f1c');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // 2. Stars
      stars.forEach((st) => {
        const alpha = prefersReducedMotion ? 0.5 : Math.max(0.05, 0.2 + 0.5 * Math.sin(1.4 * t + st.phase));
        ctx.beginPath();
        ctx.arc(st.fx * W, st.fy * H, st.r, 0, TAU);
        ctx.fillStyle = `rgba(220, 235, 255, ${alpha})`;
        ctx.fill();
      });

      // 3. Passing Aircraft Light (moving left at 40 px/s at height H * 0.18)
      if (!prefersReducedMotion) {
        const airX = ((W - (40 * t) % (W + 60)) + 30) % (W + 60) - 30;
        const airY = H * 0.18;
        ctx.save();
        ctx.beginPath();
        ctx.arc(airX, airY, 1.2, 0, TAU);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.restore();
      }

      // 4. Shooting Star (every 7-16s, 1.2s duration)
      if (!prefersReducedMotion) {
        if (!currentShootingStar && t > nextShootingStarTime) {
          currentShootingStar = {
            t0: t,
            x0: W * (0.4 + Math.random() * 0.5),
            y0: H * (0.02 + Math.random() * 0.12),
            dx: -(0.25 + Math.random() * 0.15) * W,
            dy: 0.35 * H,
          };
          nextShootingStarTime = t + 7 + Math.random() * 9;
        }

        if (currentShootingStar) {
          const age = t - currentShootingStar.t0;
          if (age > 1.2) {
            currentShootingStar = null;
          } else {
            const prog = age / 1.2;
            const sx = currentShootingStar.x0 + currentShootingStar.dx * prog;
            const sy = currentShootingStar.y0 + currentShootingStar.dy * prog;
            const tailLen = 32 * (1 - prog);
            const tailDx = (currentShootingStar.dx / (0.4 * W)) * tailLen;
            const tailDy = (currentShootingStar.dy / (0.35 * H)) * tailLen;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx - tailDx, sy - tailDy);
            ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - prog) * 0.8})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // 5. Rain (~110 streaks)
      if (!prefersReducedMotion) {
        ctx.strokeStyle = 'rgba(160,200,255,0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        rain.forEach((r) => {
          r.y += 0.012 * r.speed;
          r.x -= 0.002;
          if (r.y > 1) r.y = 0;
          if (r.x < 0) r.x = 1;

          const rx = r.x * W;
          const ry = r.y * H;
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 1.5, ry + 9);
        });
        ctx.stroke();
      }

      // 6. Skyline: 3 Parallax Layers with Assembly on Load
      skylineLayers.forEach((layer, layerIdx) => {
        const def = layer.def;
        const hOffset = (mx - 0.5) * -40 * def.parallax;
        const layerStart = layerIdx * 0.5;

        layer.buildings.forEach((bld) => {
          const towerStart = layerStart + bld.bi * 0.16 + bld.seed * 0.3;
          let p = 1.0;
          if (!prefersReducedMotion) {
            p = Math.max(0, Math.min(1, (t - towerStart) / 1.6));
          }

          if (p <= 0) return;

          const heightSteps = prefersReducedMotion ? 1 : Math.ceil(p * 6) / 6;
          const fullHeight = bld.heightRel * H;
          const curHeight = fullHeight * heightSteps;
          const baseAlpha = Math.min(1, p * 3);
          const winAlpha = Math.min(1, Math.max(0, (p - 0.3) / 0.4));

          const bx = bld.xRel * W + hOffset;
          const bw = bld.widthRel * W;
          const by = H - curHeight;

          // Tower base
          ctx.save();
          ctx.globalAlpha = baseAlpha;
          ctx.fillStyle = def.color;
          ctx.fillRect(bx, by, bw, curHeight);

          // Thin street band at the bottom of each layer (5px tall)
          ctx.fillRect(bx, H - 5, bw, 5);

          // Windows grid: every 9px across, 11px down, size 2.4 x 4.5px
          if (winAlpha > 0.05) {
            ctx.globalAlpha = baseAlpha * winAlpha;
            const cols = Math.floor((bw - 8) / 9);
            const rows = Math.floor((curHeight - 16) / 11);

            for (let cIdx = 0; cIdx < cols; cIdx++) {
              for (let rIdx = 0; rIdx < rows; rIdx++) {
                const wSeed = pseudoRand(bld.winSeed + cIdx * 19 + rIdx * 31);
                if (wSeed < def.winDensity) {
                  const wx = bx + 4 + cIdx * 9;
                  const wy = by + 8 + rIdx * 11;

                  let isWarm = wSeed < def.winDensity * 0.2;
                  let winColor = isWarm ? 'rgba(255,77,46,0.9)' : 'rgba(150,210,255,0.55)';

                  // Subtle flicker on some windows
                  if (!prefersReducedMotion && wSeed < def.winDensity * 0.08) {
                    if (Math.sin(t * 8 + wSeed * 100) < 0) {
                      continue;
                    }
                  }

                  ctx.fillStyle = winColor;
                  ctx.fillRect(wx, wy, 2.4, 4.5);
                }
              }
            }
          }

          // Neon Strip: 10% down tower
          if (bld.hasNeon && p >= 0.8) {
            const ny = by + fullHeight * 0.10;
            ctx.save();
            ctx.shadowColor = bld.neonColor;
            ctx.shadowBlur = 14;
            ctx.fillStyle = bld.neonColor;
            ctx.fillRect(bx + 2, ny, bw - 4, 2);
            ctx.restore();
          }

          // Red Beacon: 4px above roof pulsing
          if (bld.hasBeacon && p >= 0.9) {
            const beaconPulse = prefersReducedMotion ? 0.8 : (0.4 + 0.6 * Math.max(0, Math.sin(2.4 * t + bld.bi)));
            ctx.save();
            ctx.beginPath();
            ctx.arc(bx + bw / 2, by - 4, 1.8, 0, TAU);
            ctx.fillStyle = `rgba(255, 42, 42, ${beaconPulse})`;
            ctx.shadowColor = '#ff2a2a';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.restore();
          }

          ctx.restore();
        });
      });

      // 7. Horizon Warm Glow (radial on top of towers)
      const hGlow = ctx.createRadialGradient(W / 2, H * 1.02, 0, W / 2, H * 1.02, W * 0.6);
      hGlow.addColorStop(0, 'rgba(255,77,46,0.22)');
      hGlow.addColorStop(1, 'rgba(255,77,46,0)');
      ctx.fillStyle = hGlow;
      ctx.fillRect(0, 0, W, H);

      // 8. Neon Signs (ドリフト, 東京, 首都高)
      const signs = [
        { text: 'ドリフト', x: W * 0.12, color: '#00e5ff' },
        { text: '東京',     x: W * 0.58, color: '#ff4d2e' },
        { text: '首都高',   x: W * 0.84, color: '#00e5ff' },
      ];

      ctx.save();
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      signs.forEach((s, idx) => {
        const sy = H * 0.42 + 6 * idx;
        const signAlpha = prefersReducedMotion ? 1.0 : (Math.sin((3 + idx) * t + idx) > -0.6 ? 1.0 : 0.25);

        ctx.save();
        ctx.globalAlpha = signAlpha;
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 12;
        ctx.fillText(s.text, s.x, sy);
        ctx.restore();
      });
      ctx.restore();

      // IF REDUCED MOTION IS ENABLED: Stop here!
      // "skip every car, smoke, skid, flash, wipe, NOS and road animation"
      if (prefersReducedMotion) {
        return;
      }

      // 9. Skid Marks Rendering
      if (skidPoints.length > 1) {
        ctx.save();
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 1; i < skidPoints.length; i++) {
          const p1 = skidPoints[i - 1];
          const p2 = skidPoints[i];
          if (!p1 || !p2) continue;

          const alpha = Math.max(0, 1 - (t - p2.t) / 3) * 0.55;
          if (alpha <= 0) continue;

          ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 10. Smoke Puffs Rendering & Physics
      for (let i = smokePuffs.length - 1; i >= 0; i--) {
        const sp = smokePuffs[i];
        sp.x += sp.vx / 60;
        sp.y += sp.vy / 60;
        sp.radius += 0.25;
        sp.life -= 0.012;

        if (sp.life <= 0) {
          smokePuffs.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.radius, 0, TAU);
        ctx.fillStyle = `rgba(225, 230, 240, ${sp.life * 0.2})`;
        ctx.fill();
      }

      // 11. CAR 1: OPENING CONVOY (once per page load)
      const convoyLaneY = H - 5 - 0.25 * 34;
      const convoyScale = 1.2 * carScaleFactor;

      convoyCars.forEach((car) => {
        if (t >= car.start) {
          const age = t - car.start;
          const cx = -140 + 300 * age;

          if (cx < W + 220) {
            const yaw = 0.14 * Math.sin(6 * age + car.phase);

            // Smoke puffs while |yaw| > 0.05
            if (Math.abs(yaw) > 0.05) {
              const rwX = cx + 16 * convoyScale;
              const rwY = convoyLaneY - 3 * convoyScale;
              spawnSmoke(rwX, rwY, -(40 + Math.random() * 50), -(10 + Math.random() * 20));
              spawnSmoke(rwX, rwY, -(40 + Math.random() * 50), -(10 + Math.random() * 20));
            }

            // Speed lines behind car
            ctx.save();
            ctx.strokeStyle = car.glowColor || 'rgba(0,229,255,0.35)';
            ctx.globalAlpha = 0.35;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx - 40 * convoyScale, convoyLaneY - 8 * convoyScale);
            ctx.lineTo(cx - 160 * convoyScale, convoyLaneY - 8 * convoyScale);
            ctx.stroke();
            ctx.restore();

            if (car.type === 'sports') {
              drawSportsCar(cx, convoyLaneY, convoyScale, yaw, 300 * age, car.bodyColor, car.glowColor);
            } else {
              drawPoliceCruiser(cx, convoyLaneY, convoyScale, yaw, 300 * age, t);
            }
          }
        }
      });

      // Arrival Flash: full-canvas fill with alpha = max(0, 1 - |t - 0.35| * 5) * 0.22
      const flashAlpha = Math.max(0, 1 - Math.abs(t - 0.35) * 5) * 0.22;
      if (flashAlpha > 0.005) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 240, 225, ${flashAlpha})`;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      // 12. CAR 2: LOOPING DRIFT CAR (runs forever)
      const driftScale = 1.3 * carScaleFactor;
      const wrapSpan = W + 260;
      const cx = (((120 * t) % wrapSpan) + wrapSpan) % wrapSpan - 130;
      const driftYaw = 0.16 * Math.sin(1.3 * t) - 0.04;
      const isSliding = Math.abs(driftYaw) > 0.07;

      if (isSliding) {
        const rwX = cx + 16 * driftScale;
        const rwY = gy - 3 * driftScale;

        // Smoke puffs
        spawnSmoke(rwX + (Math.random() - 0.5) * 6, rwY, -(25 + Math.random() * 35), -(8 + Math.random() * 18));
        spawnSmoke(rwX + (Math.random() - 0.5) * 6, rwY, -(25 + Math.random() * 35), -(8 + Math.random() * 18));

        // Record skid point
        if (skidPoints.length >= MAX_SKID) {
          skidPoints.shift();
        }
        skidPoints.push({ x: rwX, y: rwY, t });
      } else {
        if (skidPoints.length > 0 && skidPoints[skidPoints.length - 1] !== null) {
          if (skidPoints.length >= MAX_SKID) {
            skidPoints.shift();
          }
          skidPoints.push(null);
        }
      }

      // Clean old skid points (> 3.2s old)
      while (skidPoints.length > 0 && skidPoints[0] && (t - skidPoints[0].t > 3.2)) {
        skidPoints.shift();
      }

      // Draw Drift Car
      drawSportsCar(cx, gy, driftScale, driftYaw, 120 * t, '#c81d1d', '#00e5ff');

      // 13. CAR 3: DRIFT CRUISER (Follows at cx - 170, hidden if W < 700)
      if (!isMobile) {
        const cruiserScale = 1.25 * carScaleFactor;
        const cruiserX = cx - 170;
        drawPoliceCruiser(cruiserX, gy, cruiserScale, driftYaw * 0.6, 120 * t, t);
      }

      // 14. CAR 4: HELICOPTER (Flies above drift chase, hidden if W < 700)
      if (!isMobile) {
        drawHelicopter(cx, gy, t);
      }

      animId = requestAnimationFrame(render);
    }

    if (prefersReducedMotion) {
      render(sceneStartTime);
    } else {
      animId = requestAnimationFrame(render);
    }
  }

  window.initScene = initScene;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScene);
  } else {
    initScene();
  }
})();

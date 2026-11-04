const http = require('http');
const fs = require('fs');
const path = require('path');

function request(path) {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:3000' + path, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function verifyTokyoDrift() {
  console.log('=== Verifying Tokyo Drift Integration ===\n');
  let passed = 0;
  let failed = 0;

  function assert(cond, msg) {
    if (cond) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
      failed++;
    }
  }

  // 1. Check public/js/scene.js
  const sceneJs = fs.readFileSync(path.join(__dirname, '../public/js/scene.js'), 'utf8');
  assert(sceneJs.includes('prefers-reduced-motion'), 'scene.js checks prefers-reduced-motion');
  assert(sceneJs.includes('MAX_SMOKE = 420'), 'scene.js caps smoke array at 420');
  assert(sceneJs.includes('MAX_SKID = 160'), 'scene.js caps skid array at 160');
  assert(sceneJs.includes('drawSportsCar'), 'scene.js implements sports car shape with body path, glass, stripe, spoiler & wheels');
  assert(sceneJs.includes('drawPoliceCruiser'), 'scene.js implements police cruiser shape with flashing lightbar');
  assert(sceneJs.includes('drawHelicopter'), 'scene.js implements helicopter with searchlight cone');
  assert(sceneJs.includes('ドリフト') && sceneJs.includes('東京') && sceneJs.includes('首都高'), 'scene.js contains Japanese neon signs');
  assert(sceneJs.includes('convoyCars'), 'scene.js includes opening convoy');
  assert(sceneJs.includes('isSliding'), 'scene.js includes drift sliding physics & skid marks');
  assert(sceneJs.includes('W < 700'), 'scene.js includes mobile responsiveness (scales cars to 0.8, hides helicopter & cruiser)');

  // 2. Check public/js/app.js
  const appJs = fs.readFileSync(path.join(__dirname, '../public/js/app.js'), 'utf8');
  assert(appJs.includes('cursorSpotlight'), 'app.js includes cursor spotlight');
  assert(appJs.includes('cursorSmokeCanvas'), 'app.js includes tyre-smoke cursor trail');
  assert(appJs.includes('MAX_CURSOR_SMOKE = 90'), 'app.js caps cursor smoke at 90');
  assert(appJs.includes('scanlines'), 'app.js includes scanlines toggle');
  assert(appJs.includes('nosBoost'), 'app.js includes NOS boost on N key');
  assert(appJs.includes('routeWipe'), 'app.js includes route change wipe');
  assert(appJs.includes('click-ripple'), 'app.js includes button click ripple');
  assert(appJs.includes('initArticleDrift'), 'app.js includes article drift header & reveal logic');
  assert(appJs.includes('fClock'), 'app.js includes footer live clock ticker');

  // 3. Check public/css/main.css
  const mainCss = fs.readFileSync(path.join(__dirname, '../public/css/main.css'), 'utf8');
  assert(mainCss.includes('--accent: #00e5ff;'), 'main.css has cyan accent variable');
  assert(mainCss.includes('--red-orange: #ff4d2e;'), 'main.css has red-orange palette variable');
  assert(mainCss.includes('--headlight: #fff8dc;'), 'main.css has headlight variable');
  assert(mainCss.includes('--taillight: #ff3b3b;'), 'main.css has taillight variable');
  assert(mainCss.includes('.article-drift-header'), 'main.css has article drift header styles');
  assert(mainCss.includes('.article-drift-road'), 'main.css has animated road styles');
  assert(mainCss.includes('.article-drift-car-wrap'), 'main.css has drifting car animation styles');
  assert(mainCss.includes('article h2::after'), 'main.css has headings underline bar');
  assert(mainCss.includes('#scanlines'), 'main.css has scanlines styles');
  assert(mainCss.includes('#nosBoost'), 'main.css has NOS boost styles');
  assert(mainCss.includes('#routeWipe'), 'main.css has route change wipe styles');
  assert(mainCss.includes('.footer-main'), 'main.css has compact footer layout');
  assert(mainCss.includes('.fbig { font-size: clamp(28px,'), 'main.css adjusted footer name size');
  assert(mainCss.includes('@media (prefers-reduced-motion: reduce)'), 'main.css has global reduced motion overrides');

  // 4. Check Live HTTP responses
  const home = await request('/');
  assert(home.status === 200, 'Home page serves 200 OK');
  assert(home.body.includes('id="scene"'), 'Home page contains scene canvas');
  assert(home.body.includes('/js/scene.js'), 'Home page loads scene.js');
  assert(home.body.includes('id="fClock"'), 'Footer contains live clock slot');
  assert(home.body.includes('f-terminal-status'), 'Footer contains terminal status badge');

  const article = await request('/writings/understanding-rest-apis-with-nodejs-and-express');
  assert(article.status === 200, 'Article page serves 200 OK');
  assert(article.body.includes('class="terminal-article-content"'), 'Article page serves article body');

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

verifyTokyoDrift().catch(err => {
  console.error('Error running verification:', err);
  process.exit(1);
});

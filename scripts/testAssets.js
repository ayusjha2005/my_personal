const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

function fetchUrl(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${urlPath}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          path: urlPath,
          statusCode: res.statusCode,
          contentType: res.headers['content-type'] || '',
          body: data,
          size: Buffer.byteLength(data),
        });
      });
    }).on('error', reject);
  });
}

async function runAssetTests() {
  console.log('=== STARTING PRODUCTION STATIC ASSET & STYLING VERIFICATION ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Test Static CSS Assets
  console.log('--- Checking CSS Assets ---');
  const mainCss = await fetchUrl('/css/main.css');
  assert(mainCss.statusCode === 200, '/css/main.css returns HTTP 200');
  assert(mainCss.contentType.includes('text/css'), `/css/main.css content-type is text/css (got: ${mainCss.contentType})`);
  assert(mainCss.size > 50000, `/css/main.css is full stylesheet (${mainCss.size} bytes > 50KB)`);
  assert(mainCss.body.includes('--neon-cyan') || mainCss.body.includes('--accent-cyan') || mainCss.body.includes('#00e5ff'), '/css/main.css contains design system tokens');
  assert(mainCss.body.includes('body'), '/css/main.css defines base body rules');
  assert(mainCss.body.includes('.brand'), '/css/main.css defines header brand rules');
  assert(mainCss.body.includes('.term-cat') || mainCss.body.includes('hero'), '/css/main.css defines hero & interactive elements');

  const adminCss = await fetchUrl('/css/admin.css');
  assert(adminCss.statusCode === 200, '/css/admin.css returns HTTP 200');
  assert(adminCss.contentType.includes('text/css'), `/css/admin.css content-type is text/css`);
  assert(adminCss.size > 3000, `/css/admin.css is non-empty (${adminCss.size} bytes)`);

  // 2. Test Static JavaScript Assets
  console.log('\n--- Checking JavaScript Assets ---');
  const scripts = [
    { path: '/js/scene.js', minSize: 10000, name: 'Night canvas scene' },
    { path: '/js/buddy.js', minSize: 10000, name: 'Animated racer guide' },
    { path: '/js/intro.js', minSize: 1000, name: 'Page intro transition' },
    { path: '/js/terminal-effects.js', minSize: 10000, name: 'Terminal command bar' },
    { path: '/js/app.js', minSize: 15000, name: 'Core interactive application' },
  ];

  for (const s of scripts) {
    const res = await fetchUrl(s.path);
    assert(res.statusCode === 200, `${s.path} returns HTTP 200`);
    assert(res.contentType.includes('javascript'), `${s.path} content-type is javascript`);
    assert(res.size >= s.minSize, `${s.name} (${s.path}) is complete (${res.size} bytes >= ${s.minSize} bytes)`);
  }

  // 3. Test Icons & Manifest
  console.log('\n--- Checking Manifest and Icons ---');
  const icon = await fetchUrl('/icon.svg');
  assert(icon.statusCode === 200, '/icon.svg returns HTTP 200');
  assert(icon.contentType.includes('svg'), '/icon.svg content-type is image/svg+xml');

  const manifest = await fetchUrl('/manifest.json');
  assert(manifest.statusCode === 200, '/manifest.json returns HTTP 200');
  assert(manifest.contentType.includes('json'), '/manifest.json content-type is json');

  const sw = await fetchUrl('/sw.js');
  assert(sw.statusCode === 200, '/sw.js returns HTTP 200');
  assert(sw.contentType.includes('javascript'), '/sw.js content-type is javascript');

  // 4. Test HTML Pages Asset References
  console.log('\n--- Checking HTML Pages For Proper Root-Relative Asset References ---');
  const pages = [
    { url: '/', name: 'Home Page' },
    { url: '/writings', name: 'Writings List' },
    { url: '/projects', name: 'Projects Page' },
    { url: '/skills', name: 'Skills Page' },
    { url: '/about', name: 'About Page' },
    { url: '/contact', name: 'Contact Page' },
  ];

  for (const p of pages) {
    const res = await fetchUrl(p.url);
    assert(res.statusCode === 200, `${p.name} (${p.url}) returns HTTP 200`);
    assert(res.body.includes('<link rel="stylesheet" href="/css/main.css'), `${p.name} includes root-relative /css/main.css`);
    assert(res.body.includes('<script src="/js/scene.js"></script>'), `${p.name} includes /js/scene.js`);
    assert(res.body.includes('<script src="/js/buddy.js"></script>'), `${p.name} includes /js/buddy.js`);
    assert(res.body.includes('<script src="/js/app.js"></script>'), `${p.name} includes /js/app.js`);
    assert(!res.body.includes('href="css/main.css"'), `${p.name} does not contain broken relative href="css/main.css"`);
  }

  // Test Blog Detail Page
  const blogsRes = await fetchUrl('/writings');
  const blogLinkMatch = blogsRes.body.match(/\/writings\/([a-z0-9-]+)/);
  if (blogLinkMatch) {
    const detailUrl = blogLinkMatch[0];
    const detail = await fetchUrl(detailUrl);
    assert(detail.statusCode === 200, `Blog detail (${detailUrl}) returns HTTP 200`);
    assert(detail.body.includes('<link rel="stylesheet" href="/css/main.css">'), `Blog detail includes root-relative /css/main.css`);
    assert(detail.body.includes('<script src="/js/app.js"></script>'), `Blog detail includes root-relative /js/app.js`);
  }

  // Test Admin Login
  const adminLogin = await fetchUrl('/admin/login');
  assert(adminLogin.statusCode === 200, 'Admin login page returns HTTP 200');
  assert(adminLogin.body.includes('<link rel="stylesheet" href="/css/admin.css">'), 'Admin login includes root-relative /css/admin.css');

  console.log(`\n=======================================================`);
  console.log(`  Asset & Styling Tests Passed: ${passed}`);
  console.log(`  Asset & Styling Tests Failed: ${failed}`);
  console.log(`=======================================================`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('ALL STATIC ASSET & STYLING CHECKS PASSED WITH 100% SUCCESS!');
    process.exit(0);
  }
}

runAssetTests().catch((err) => {
  console.error('Asset test execution error:', err);
  process.exit(1);
});

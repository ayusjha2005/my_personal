// Service Worker for offline shell caching
const CACHE_NAME = 'ayush-tech-blog-v1';
const ASSETS = [
  '/',
  '/css/main.css',
  '/js/scene.js',
  '/js/buddy.js',
  '/js/intro.js',
  '/js/app.js',
  '/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only cache GET requests, bypass API and admin routes
  if (event.request.method !== 'GET' || event.request.url.includes('/admin') || event.request.url.includes('/api')) {
    return;
  }
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

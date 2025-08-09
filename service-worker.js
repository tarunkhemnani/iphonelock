const CACHE = 'passcode-prop-v1';
const ASSETS = [
  '/', // index
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  // add your bg-blur.jpg and icons if you upload them
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  evt.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', evt => {
  // simple cache-first strategy for offline PWA
  evt.respondWith(
    caches.match(evt.request).then(cached => {
      if (cached) return cached;
      return fetch(evt.request).then(resp => {
        // don't cache POSTs and opaque requests
        if (!resp || resp.status !== 200 || resp.type === 'opaque') return resp;
        const copy = resp.clone();
        caches.open(CACHE).then(cache => cache.put(evt.request, copy));
        return resp;
      }).catch(() => caches.match('/index.html'));
    })
  );
});

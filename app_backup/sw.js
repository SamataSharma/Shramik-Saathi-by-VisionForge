const CACHE_NAME = 'mine-ar-v2.5.0';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/main.css',
  '/css/ar.css',
  '/css/dashboard.css',
  '/assets/three.min.js',
  '/assets/images/worker_avatar.svg',
  '/assets/images/hazard_thumb.svg',
  '/assets/images/lessons_banner.svg',
  '/assets/images/games_banner.svg',
  '/js/app.js',
  '/js/router.js',
  '/js/i18n.js',
  '/js/voice.js',
  '/js/db.js',
  '/js/sync.js',
  '/js/ar/ar-engine.js',
  '/js/ar/particle-fire.js',
  '/js/ar/spatial-audio.js',
  '/js/cv/object-detector.js',
  '/js/engine/telemetry.js',
  '/js/engine/validator.js',
  '/js/engine/gamification.js',
  '/js/assessment/competency.js',
  '/js/assessment/retraining.js',
  '/js/assessment/certificate.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching core app assets for offline use');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('[ServiceWorker] Partial cache install (ignoring missing during dev):', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Purging outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Pass API requests to network or offline queue response
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ offline: true, message: 'Served from offline client queue' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Network-first for static assets to ensure code changes show immediately
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(event.request);
      })
  );
});

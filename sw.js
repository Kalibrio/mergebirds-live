// Merge Birds service worker: network-first with cache fallback.
// v2: navigations fetch with cache:'no-cache' so a stale HTTP-cached HTML
// (the July 31 inliner incident) can never be resurrected; old cache
// versions are purged on activate.
const CACHE = 'mb-shell-v2';

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['icon.png', 'logo.png', 'manifest.webmanifest'])));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  const isNav = e.request.mode === 'navigate';
  e.respondWith(
    fetch(isNav ? new Request(e.request.url, { cache: 'no-cache' }) : e.request)
      .then((r) => {
        if (r.ok) {
          const copy = r.clone();
          caches.open(CACHE).then((c) => c.put(e.request.url, copy)).catch(() => { /* opaque */ });
        }
        return r;
      })
      .catch(() => caches.match(e.request.url, { ignoreSearch: true }).then((hit) => hit ?? Response.error())),
  );
});

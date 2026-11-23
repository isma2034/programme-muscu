// Service worker : tout est mis en cache à l'installation, puis servi hors ligne (cache d'abord).
// VERSION et ASSETS sont réécrits par scripts/build.py — ne pas éditer à la main.
const VERSION = '__VERSION__';
const ASSETS = __ASSETS__;
const CACHE = 'muscu-' + VERSION;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('muscu-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => req.mode === 'navigate' ? caches.match('./index.html') : Response.error())));
});

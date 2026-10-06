// One offline cache for both menus (Grandkid Games and Joe's Arcade) and every game.
// Bump VERSION whenever a file changes so phones pick up the new copy.
const VERSION = 'games-v1';
const FILES = [
  './', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'gk-save.js',
  'arcade/', 'arcade/index.html', 'arcade/manifest.json', 'arcade/icon-192.png', 'arcade/icon-512.png',
  'tube-sort/index.html', 'dragon-realms/index.html', 'wiener-dog/index.html',
  'firework-beats/index.html', 'fuzzy-feet/index.html', 'maze-kart-rally/index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Pages are opened with ?player=Name and ?hub=arcade, so cached pages are matched ignoring the query.
// Serve from the cache right away, refresh it in the background when online.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameSite = url.origin === location.origin;
  if (!sameSite && !/^(fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com)$/.test(url.hostname)) return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const hit = await cache.match(req, { ignoreSearch: sameSite });
    const fresh = fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque')) cache.put(sameSite ? url.origin + url.pathname : req, res.clone());
      return res;
    });
    if (hit) { e.waitUntil(fresh.catch(() => { })); return hit; }
    return fresh.catch(async () => (req.mode === 'navigate' && await cache.match(url.pathname.includes('/arcade/') ? 'arcade/index.html' : 'index.html')) || Response.error());
  }));
});

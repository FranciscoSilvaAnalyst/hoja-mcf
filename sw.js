// Modo sin conexión de la Hoja de Partido.
// Guarda la app en el iPad la primera vez que se abre con internet; después abre sin cobertura.
// Cuando hay internet, descarga en segundo plano la versión nueva (se ve al volver a abrir).
const CACHE = 'hoja-mcf-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icono-180.png', './icono-192.png', './icono-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const key = req.mode === 'navigate' ? './index.html' : req;
    const cached = await cache.match(key, {ignoreSearch: true});
    const fresh = fetch(req).then(res => {
      if (res && res.ok) cache.put(key, res.clone());
      return res;
    }).catch(() => cached);
    if (cached){ e.waitUntil(fresh); return cached; }
    return fresh;
  }));
});

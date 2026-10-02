/**
 * Abogao – service worker (v6).
 * - Guarda el "esqueleto" de la app para abrirla sin conexión o con mala señal.
 * - Archivos propios: se sirven desde el caché y se actualizan en segundo plano.
 * - Navegación: primero la red; si no hay, la copia guardada.
 * - No guarda nada de otros dominios (mapas, videollamadas) ni datos del caso.
 * Cambia VERSION en cada publicación para que los celulares reciban la versión nueva.
 */
const VERSION = 'abogao-6.1.0';   // build.sh la toma de js/config.js; la prueba verifica que coincidan
const SHELL = [
  './', 'index.html', 'manifest.json', 'css/styles.css',
  'js/config.js', 'js/catalog.js', 'js/lawyersData.js', 'js/voiceGuide.js', 'js/mapController.js',
  'js/googleApiTest.js', 'js/videoCall.js', 'js/app.js',
  'vendor/leaflet/leaflet.js', 'vendor/leaflet/leaflet.css',
  'icons/icon-192.png', 'icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;   // solo archivos propios
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.open(VERSION).then(async cache => {
    const cached = await cache.match(req);
    const net = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => cached);
    return cached || net;
  }));
});

const CACHE = 'taafi-v1';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon.svg'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin === location.origin) {
    e.respondWith(caches.match(request, { ignoreSearch: true }).then((hit) => hit || fetch(request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(request, copy));
      return res;
    }).catch(() => caches.match('index.html'))));
    return;
  }
  if (url.hostname.includes('fonts.g')) {
    e.respondWith(caches.open('taafi-fonts').then((c) => c.match(request).then((hit) => {
      const net = fetch(request).then((res) => { c.put(request, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })));
  }
});

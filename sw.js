// Offline support: always ask the network first (so updates arrive), fall back to the saved copy when offline.
const CACHE = "startnow-20261108165813";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // maps/search/routing go straight to the network
  if (url.pathname.endsWith("/version.json")) return;                      // update checks always hit the server
  const key = e.request.mode === "navigate" ? "./" : url.pathname;
  e.respondWith(
    fetch(e.request, { cache: "no-cache" }).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(key, copy)); }
      return r;
    }).catch(() => caches.match(key).then(r => r || caches.match("./")))
  );
});

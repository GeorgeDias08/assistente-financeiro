const cacheName = "assistente-financeiro-v1";

const urlsToCache = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/dist/index.bundle.js',
  '/dist/db.bundle.js',
  '/dist/transaction.bundle.js',
  '/manifest.webmanifest',
  '/style.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];
const RUNTIME = "runtime";
const PRECACHE = 'precache-v1';
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

// install
self.addEventListener('install', function (evt) {
  // pre cache data
  evt.waitUntil(
    // cache all static assets
    caches
    .open(CACHE_NAME)
    .then(cache => cache.addAll(FILES_TO_CACHE),
      console.log("Your file were pre-cached successfully"))
      .then(self.skipWaiting())
  );
});

// activating and will clean old caches?
self.addEventListener("activate", (evt) => {
  const currentCaches = [PRECACHE, RUNTIME]
  evt.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
      return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
     .then(() => self.clients.claim())
  );
});

// Fetch
self.addEventListener('fetch', (evt) => {
  if (evt.request.url.startsWith(self.location.origin)) {
    // console.log('fetch evt.request.url', evt.request.url)
    console.log('[Service Worker Fetch (data)', evt.request.url)
    evt.respondWith(
      caches.match(evt.request).then(cachedResponse => {
       if (cachedResponse){
         return cachedResponse;
       }

       return caches.open(RUNTIME).then((cache) => {
         return fetch(evt.request).then((response) => {
           return cache.put(evt.request, response.clone()).then(() => {
             return response;
           });
         });
       });
      })
    );
  }
});
          
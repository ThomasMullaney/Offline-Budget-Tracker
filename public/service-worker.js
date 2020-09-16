const FILES_TO_CACHE = [
  '/',
  '/index.html',
  "/index.js",
  '/favicon.ico',
  '/manifest.webmanifest',
  '/style.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

// install
self.addEventListener('install', function (evt) {
  // pre cache data
  evt.waitUntil(
    // cache all static assets
    caches.open(CACHE_NAME).then(cache => {
      console.log("Your file were pre-cached successfully");
      return cache.addAll(FILES_TO_CACHE)
    })
  );
  // tell browers to activate this service worker immediately once its finished installing
  self.skipWaiting();
});

// activating
self.addEventListener("activate", function (evt) {
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', function (evt) {
  if (evt.request.url.includes('/api/')) {
    // console.log('fetch evt.request.url', evt.request.url)
    console.log('[Service Worker Fetch (data)', evt.request.url)
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(evt.request)
          .then(response => {
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
            }
            return response;
          })
          .catch(err => {
            // this line commands service worker to look through cache for matching request if the network connection fails.
            return cache.match(evt.request);
          });
      }).catch(err => console.log(err))
    );
    return;
  }

  evt.respondWith(
    fetch(env.request).catch(function () {
      return caches.match(env.request).then(function (response) {
        if (response) {
          return response;
        } else if (evt.request.headers.get("accept").includes("text/html")) {
          // return cached home page for all requests for html pages
          return caches.match("/")
        }
      })
    })
  )
});
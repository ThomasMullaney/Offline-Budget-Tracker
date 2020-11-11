const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/index.js",
  "/db.js",
  "/style.css"
];

const CACHE_NAME = "my-site-cache-v2";
const DATA_CACHE_NAME = "site-cache-v1";



// install service worker
self.addEventListener("install", function (evt) {
  // pre cache data
  evt.waitUntil(
    // cache all static assets
    caches.open(CACHE_NAME).then(cache => {
      console.log("Your file were pre-cached successfully", cache);
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// activate service worker
self.addEventListener("activate", (evt) => {
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch
self.addEventListener("fetch", evt => {
  if (evt.request.url.includes("/api/")) {
    console.log('[Service Worker] fetch evt.request.url ------->', evt.request.url);
    
    evt.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then(cache => {
          return fetch(evt.request)
            .then(response => {
              // if response is good, clone it and store it in cache
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
              return response;
            })
            .catch(err => {
              //  if network is down check cache for matching request
              return cache.match(evt.request);
            });
        })
    );
    return;
  } 

  evt.respondWith(
    caches.open(CACHE_NAME).then( cache => {
      return cache.match(evt.request).then(response => {
        return response || fetch(evt.request);
      });
    })
  );
  });
  

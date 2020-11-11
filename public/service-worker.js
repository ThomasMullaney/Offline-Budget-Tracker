const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/index.js",
  "/db.js",
  "/style.css",
  "/favicon.ico",
  "manifest.webmanifest",
  "/assets/images/icons/icon-192x192.png",
  "/assets/images/icons/icon-512x512.png"
];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";



// install service worker
self.addEventListener("install", function (evt) {
  // pre cache data
  // console.log("--->", evt)
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
  // evt.respondWith(
  //   fetch(evt.request).catch(function (){
  //     return caches.match(evt.request).then(response => {
  //       if (response) {
  //         return response;
  //       } else if (evt.request.headers.get("accept").includes("text/html")){
  //         // return cahced homepage for all requests for html pages
  //         return caches.match("/");
  //       }
  //     });
  //   })
  // );
// });

const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';


const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.webmanifest',
  '/assets/css/style.css',
];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";
 
self.addEventListener('install', function(evt){
    // pre cache image data
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


self.addEventListener("activate", function(evt) {
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

  self.addEventListener('fetch', function (evt){
// code to handle requests go here  
  if (evt.request.url.includes('/api/')) {
    // console.log('fetch evt.request.url', evt.request.url)
    console.log('[Service Worker Fetch (data)', evt.request.url )
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
        return cache.match(evt.request);
      });
    })
  );
    return;
  }


  evt.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      console.log('static after /api');
      return cache.match(evt.request).then(response => {
        return response || fetch(evt.request);
      });
    })
  );
});

  
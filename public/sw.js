console.log('Service Worker file loaded');

const CACHE_NAME = 'offline-notes-cache-v1';

self.addEventListener('install', (event) => {
  /*
  console.log('Service Worker installed');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/']);
    })
  );
  */
});

self.addEventListener('activate', (event) => {
  /*
  console.log('Service Worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  */
});

/*
self.addEventListener('fetch', (event) => {
  console.log('Fetching:', event.request.url);
  if (event.request.method === 'POST') {
    event.respondWith(handlePostRequest(event.request));
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response; // Return the cached response if available
        }
        return fetch(event.request); // Fetch the request from the network
      })
    );
  }
});
*/

self.addEventListener('sync', (event) => {
  console.log('Syncing:', event.tag);
  if (event.tag === 'sync-notes') {
    event.waitUntil(syncNotes());
  }
});

async function handlePostRequest(request) {
  try {
    if (request.method === 'POST') {
      return await fetch(request);
    }
  } catch (error) {
    if (request.url === '/api/save-note') {
      await storeOfflineRequest(request);
    }
    throw error;
  }
}

async function syncNotes() {
  console.log('Syncing notes...');
  try {
    //refreshNotes();
  } catch (error) {
    console.error('Error syncing note:', error);
  }
}
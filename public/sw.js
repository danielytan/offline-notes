const CACHE_NAME = 'offline-notes-cache-v1';
const DATA_CACHE_NAME = 'offline-notes-data-cache-v1';
const urlsToCache = ['/', '/favicon.ico'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const { pathname } = new URL(event.request.url);
  if (pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

async function handleApiRequest(request) {
  const cache = await caches.open(DATA_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      event.waitUntil(cache.put(request, networkResponse.clone()));
      return networkResponse;
    }
  } catch (error) {
    console.error('Error fetching API data:', error);
  }

  return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
}
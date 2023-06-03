const CACHE_NAME = 'offline-notes-cache';

const fallbackResponse = new Response(JSON.stringify({ error: 'Offline mode' }), {
  status: 503,
  headers: { 'Content-Type': 'application/json' },
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/', // Add other URLs to cache as needed
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  // Check if the network is available
  if (navigator.onLine) {
    // If online, fetch the request from the server and cache the response
    try {
      const response = await fetch(request);
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
      return response;
    } catch (error) {
      // Handle fetch errors
      console.error('Fetch error:', error);
      return new Response(null, { status: 500 });
    }
  } else {
    // If offline, respond with cached data if available
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    return cachedResponse || fallbackResponse;
  }
}
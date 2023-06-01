self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Check if the request is made to your API endpoint
  if (request.url.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  }
});

async function handleApiRequest(request) {
  // Check if the network is available
  if (navigator.onLine) {
    // If online, forward the request to the server
    return fetch(request);
  } else {
    // If offline, respond with cached data if available
    const cache = await caches.open('api-cache');
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    } else {
      // If no cached response available, respond with a placeholder response
      // or handle the offline scenario as desired
      return new Response(JSON.stringify({ error: 'Offline mode' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}
import { storeOfflineRequest, getOfflineRequests, deleteOfflineRequest } from './indexeddb.js';

console.log('Service Worker file loaded');

self.addEventListener('install', (event) => {
  console.log("INSTALLING")
});

self.addEventListener('activate', (event) => {
  console.log("ACTIVATING")
});

self.addEventListener('fetch', (event) => {
  console.log("FETCHING")
  if (event.request.method === 'POST') {
    event.respondWith(handlePostRequest(event.request));
  } else {
    event.respondWith(fetch(event.request));
  }
});

self.addEventListener('sync', (event) => {
  console.log("SYNCING", event.tag)
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
    await storeOfflineRequest(request);
    throw error;
  }
}

async function syncNotes() {
  console.log('Syncing notes...');

  const offlineRequests = await getOfflineRequests();

  console.log('Offline requests:', offlineRequests);

  console.log(offlineRequests)
  for (const request of offlineRequests) {
    console.log('Processing request:', request);

    try {
      const response = await fetch(request.url, request);

      if (response.ok) {
        // Request was successfully sent to the server
        await deleteOfflineRequest(request.id);
      } else {
        console.error('Error syncing note:', response.status);
      }
    } catch (error) {
      console.error('Error syncing note:', error);
    }
  }
}
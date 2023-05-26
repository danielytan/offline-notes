self.addEventListener('install', () => {
    self.skipWaiting();
  });
  
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      self.registration.unregister().then(() => {
        self.clients.matchAll({ type: 'window' }).then((windowClients) => {
          windowClients.forEach((windowClient) => {
            if (windowClient.url === self.registration.scope && 'navigate' in windowClient) {
              windowClient.navigate(windowClient.url);
            }
          });
        });
      })
    );
  });
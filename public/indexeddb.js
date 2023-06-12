let db;

export const openDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
    } else {
      const request = indexedDB.open('offline-notes', 1);

      request.onupgradeneeded = (event) => {
        db = event.target.result;
        db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
      };

      request.onsuccess = (event) => {
        db = event.target.result;
        resolve(db);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    }
  });
};

// Store an offline request in IndexedDB
export const storeOfflineRequest = async (request) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('requests', 'readwrite');
    const store = transaction.objectStore('requests');

    const addRequest = store.add(request, request.id);

    addRequest.onsuccess = () => {
      resolve();
    };

    addRequest.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

// Retrieve all offline requests from IndexedDB
export const getOfflineRequests = async () => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('requests', 'readonly');
    const store = transaction.objectStore('requests');

    const request = store.getAll();

    request.onsuccess = () => {
      console.log('getAll request success:', request.result);
      resolve(request.result);
    };

    request.onerror = (event) => {
      console.error('getAll request error:', event.target.error);
      reject(event.target.error);
    };
  });
};

// Delete an offline request from IndexedDB
export const deleteOfflineRequest = async (id) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('requests', 'readwrite');
    const store = transaction.objectStore('requests');

    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};
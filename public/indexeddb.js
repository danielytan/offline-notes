let db;

export const openDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
    } else {
      const request = indexedDB.open('offline-notes', 3);

      request.onupgradeneeded = (event) => {
        db = event.target.result;
        //db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
        try {
          db.deleteObjectStore('local-notes');
        } catch {
        }
        db.createObjectStore('local-notes', { keyPath: 'localId' });
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

export const storeOfflineNote = async (note) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('local-notes', 'readwrite');
    const store = transaction.objectStore('local-notes');

    const request = store.add(note);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

export const deleteOfflineNote = async (localId) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('local-notes', 'readwrite');
    const store = transaction.objectStore('local-notes');

    const request = store.delete(localId);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

export const editOfflineNote = async (updatedNote) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('local-notes', 'readwrite');
    const store = transaction.objectStore('local-notes');

    const request = store.put(updatedNote);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

export const getOfflineNote = async (localId) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('local-notes', 'readonly');
    const store = transaction.objectStore('local-notes');

    const request = store.get(localId);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

export const getOfflineNotes = async () => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('local-notes', 'readwrite');
    const store = transaction.objectStore('local-notes');

    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}
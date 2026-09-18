// IndexedDB Offline Storage Manager for VISIONFORGE MINE AR

const DB_NAME = 'mine_ar_local_db';
const DB_VERSION = 1;

let dbInstance = null;

export function openLocalDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      return resolve(dbInstance);
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;

      if (!db.objectStoreNames.contains('worker')) {
        db.createObjectStore('worker', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('offline_attempts')) {
        db.createObjectStore('offline_attempts', { keyPath: 'local_id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('progress')) {
        db.createObjectStore('progress', { keyPath: 'module_id' });
      }
      if (!db.objectStoreNames.contains('badges')) {
        db.createObjectStore('badges', { keyPath: 'badge_key' });
      }
    };

    request.onsuccess = (e) => {
      dbInstance = e.target.result;
      resolve(dbInstance);
    };

    request.onerror = (e) => {
      console.error('IndexedDB open error:', e);
      reject(e);
    };
  });
}

// Worker Profile
export async function getLocalWorker(workerId = 'anik01') {
  const db = await openLocalDB();
  return new Promise((resolve) => {
    const tx = db.transaction('worker', 'readonly');
    const store = tx.objectStore('worker');
    const req = store.get(workerId);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  });
}

export async function saveLocalWorker(workerData) {
  const db = await openLocalDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('worker', 'readwrite');
    const store = tx.objectStore('worker');
    const req = store.put(workerData);
    req.onsuccess = () => resolve(true);
    req.onerror = (err) => reject(err);
  });
}

// Offline Attempts Queue
export async function queueOfflineAttempt(attemptData) {
  const db = await openLocalDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_attempts', 'readwrite');
    const store = tx.objectStore('offline_attempts');
    const req = store.add({ ...attemptData, queued_at: new Date().toISOString() });
    req.onsuccess = () => {
      console.log('[IndexedDB] Attempt queued for cloud sync');
      resolve(req.result);
    };
    req.onerror = (err) => reject(err);
  });
}

export async function getPendingOfflineAttempts() {
  const db = await openLocalDB();
  return new Promise((resolve) => {
    const tx = db.transaction('offline_attempts', 'readonly');
    const store = tx.objectStore('offline_attempts');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => resolve([]);
  });
}

export async function clearPendingOfflineAttempts() {
  const db = await openLocalDB();
  return new Promise((resolve) => {
    const tx = db.transaction('offline_attempts', 'readwrite');
    const store = tx.objectStore('offline_attempts');
    const req = store.clear();
    req.onsuccess = () => resolve(true);
    req.onerror = () => resolve(false);
  });
}

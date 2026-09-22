/**
 * IndexedDB helper for storing large user feedback videos without LocalStorage quota issues.
 */

const DB_NAME = 'KayalDentalDB';
const DB_VERSION = 1;
const STORE_NAME = 'videos';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveVideoBlob(key: string, blob: Blob): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save video blob to IndexedDB:', err);
  }
}

export async function getVideoBlob(key: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to get video blob from IndexedDB:', err);
    return null;
  }
}

export async function getVideoBlobUrl(key: string): Promise<string | null> {
  const blob = await getVideoBlob(key);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

export async function deleteVideoBlob(key: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to delete video blob from IndexedDB:', err);
  }
}

export interface PublishedVideoTestimonial {
  _id: string;
  feedbackId: string;
  patientName: string;
  location: string;
  tag: string;
  message: string;
  videoKey: string;
  videoUrl?: string;
  rating: number;
  publishedAt: string;
}

export const PUBLISHED_VIDEOS_STORAGE_KEY = 'kayal_published_video_testimonials';

export function getPublishedVideos(): PublishedVideoTestimonial[] {
  try {
    const data = localStorage.getItem(PUBLISHED_VIDEOS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function savePublishedVideos(list: PublishedVideoTestimonial[]) {
  try {
    localStorage.setItem(PUBLISHED_VIDEOS_STORAGE_KEY, JSON.stringify(list));
    // Broadcast change
    try {
      const bc = new BroadcastChannel('kayal_live_sync');
      bc.postMessage({ type: 'TESTIMONIALS_UPDATED', timestamp: Date.now() });
      bc.close();
    } catch {}
  } catch (e) {
    console.error('Failed to save published videos:', e);
  }
}

export function publishVideo(item: PublishedVideoTestimonial) {
  const current = getPublishedVideos();
  const exists = current.some(v => v._id === item._id || v.videoKey === item.videoKey);
  if (!exists) {
    savePublishedVideos([item, ...current]);
  }
}

export function unpublishVideo(idOrKey: string) {
  const current = getPublishedVideos();
  const filtered = current.filter(v => v._id !== idOrKey && v.videoKey !== idOrKey && v.feedbackId !== idOrKey);
  savePublishedVideos(filtered);
}


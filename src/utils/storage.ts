/**
 * Persistent Storage Layer for Rithu Editorial App
 * Uses browser IndexedDB for large datasets (rendered PDF pages, base64 images)
 * with automatic fallback and synchronization.
 */

import { AudioTrack, VideoItem, MagazinePage, MagazineEditionInfo } from '../types';
import { INITIAL_AUDIO_TRACKS, INITIAL_VIDEOS, DEFAULT_MAGAZINE_PAGES, INITIAL_MAGAZINE_EDITION } from '../data/initialData';

const DB_NAME = 'rithu_magazine_db';
const DB_VERSION = 1;
const STORE_AUDIO = 'audio_tracks';
const STORE_VIDEO = 'video_items';
const STORE_MAGAZINE = 'magazine_edition';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_AUDIO)) {
        db.createObjectStore(STORE_AUDIO, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORE_VIDEO)) {
        db.createObjectStore(STORE_VIDEO, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORE_MAGAZINE)) {
        db.createObjectStore(STORE_MAGAZINE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// IndexedDB Helper Functions
async function setItem<T>(storeName: string, key: string, value: T): Promise<void> {
  // Always update localStorage if small enough for instant synchronous restore
  try {
    if (storeName !== STORE_MAGAZINE) {
      localStorage.setItem(`rithu_${storeName}_${key}`, JSON.stringify(value));
    }
  } catch {
    // Ignore quota errors
  }

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const req = store.put({ key, value });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Handled via localStorage fallback above
  }
}

async function getItem<T>(storeName: string, key: string): Promise<T | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result && req.result.value !== undefined) {
          resolve(req.result.value);
        } else {
          // Check localStorage fallback
          try {
            const raw = localStorage.getItem(`rithu_${storeName}_${key}`);
            if (raw !== null) {
              resolve(JSON.parse(raw));
              return;
            }
          } catch {
            // Ignore
          }
          resolve(null);
        }
      };
      req.onerror = () => {
        try {
          const raw = localStorage.getItem(`rithu_${storeName}_${key}`);
          if (raw !== null) {
            resolve(JSON.parse(raw));
            return;
          }
        } catch {
          // Ignore
        }
        resolve(null);
      };
    });
  } catch {
    // LocalStorage fallback
    try {
      const raw = localStorage.getItem(`rithu_${storeName}_${key}`);
      if (raw !== null) return JSON.parse(raw);
    } catch {
      // Ignore
    }
    return null;
  }
}

// Public API for Permanent Data Persistence

export async function loadPersistedAudioTracks(): Promise<AudioTrack[]> {
  const data = await getItem<AudioTrack[]>(STORE_AUDIO, 'all_tracks');
  if (data !== null && Array.isArray(data)) {
    return data;
  }
  return INITIAL_AUDIO_TRACKS;
}

export async function savePersistedAudioTracks(tracks: AudioTrack[]): Promise<void> {
  await setItem(STORE_AUDIO, 'all_tracks', tracks);
}

export async function loadPersistedVideoItems(): Promise<VideoItem[]> {
  const data = await getItem<VideoItem[]>(STORE_VIDEO, 'all_videos');
  if (data !== null && Array.isArray(data)) {
    return data;
  }
  return INITIAL_VIDEOS;
}

export async function savePersistedVideoItems(videos: VideoItem[]): Promise<void> {
  await setItem(STORE_VIDEO, 'all_videos', videos);
}

export async function loadPersistedMagazine(): Promise<{
  pages: MagazinePage[];
  edition: MagazineEditionInfo;
}> {
  const pages = await getItem<MagazinePage[]>(STORE_MAGAZINE, 'pages');
  const edition = await getItem<MagazineEditionInfo>(STORE_MAGAZINE, 'edition');

  return {
    pages: pages !== null && Array.isArray(pages) ? pages : DEFAULT_MAGAZINE_PAGES,
    edition: edition !== null ? edition : INITIAL_MAGAZINE_EDITION,
  };
}

export async function savePersistedMagazine(
  pages: MagazinePage[],
  edition: MagazineEditionInfo
): Promise<void> {
  await setItem(STORE_MAGAZINE, 'pages', pages);
  await setItem(STORE_MAGAZINE, 'edition', edition);
}

export async function resetPersistedMagazine(): Promise<void> {
  await setItem(STORE_MAGAZINE, 'pages', DEFAULT_MAGAZINE_PAGES);
  await setItem(STORE_MAGAZINE, 'edition', INITIAL_MAGAZINE_EDITION);
}

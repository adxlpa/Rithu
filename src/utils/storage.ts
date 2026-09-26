/**
 * Persistent & Cloud Storage Layer for Rithu Editorial App
 * Synchronizes Audio Tracks, Video Items, Magazine Editions, and Uploaded Media Files
 * across all devices via Firebase Cloud Firestore without requiring visitor login.
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { AudioTrack, VideoItem, MagazinePage, MagazineEditionInfo } from '../types';
import {
  INITIAL_AUDIO_TRACKS,
  INITIAL_VIDEOS,
  DEFAULT_MAGAZINE_PAGES,
  INITIAL_MAGAZINE_EDITION,
} from '../data/initialData';

const DB_NAME = 'rithu_magazine_db';
const DB_VERSION = 1;
const STORE_AUDIO = 'audio_tracks';
const STORE_VIDEO = 'video_items';
const STORE_MAGAZINE = 'magazine_edition';

const EDITORIAL_KEY = 'rithu2026-cem-vault';
const DEFAULT_ADMIN_UID = 'rithu-editorial-admin';

// In-memory cache of resolved Blob URLs for firestore-media:// assets
const resolvedMediaCache = new Map<string, string>();

// Sanitize IDs to match blueprint pattern ^[a-zA-Z0-9_\-]+$ and maxLength 128
export function sanitizeDocId(rawId: string): string {
  const cleaned = rawId.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  return cleaned.length > 0 ? cleaned : `doc-${Date.now()}`;
}

function getActiveCreatorUid(): string {
  return auth.currentUser?.uid ? sanitizeDocId(auth.currentUser.uid) : DEFAULT_ADMIN_UID;
}

// Truncate strings to enforce firebase-blueprint.json maxLength constraints
function clampStr(val: string | undefined, maxLen: number, fallback = ''): string {
  const str = (val ?? fallback).trim();
  const nonEmpty = str.length > 0 ? str : fallback;
  return nonEmpty.slice(0, maxLen);
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const idb = request.result;
      if (!idb.objectStoreNames.contains(STORE_AUDIO)) {
        idb.createObjectStore(STORE_AUDIO, { keyPath: 'key' });
      }
      if (!idb.objectStoreNames.contains(STORE_VIDEO)) {
        idb.createObjectStore(STORE_VIDEO, { keyPath: 'key' });
      }
      if (!idb.objectStoreNames.contains(STORE_MAGAZINE)) {
        idb.createObjectStore(STORE_MAGAZINE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function setItem<T>(storeName: string, key: string, value: T): Promise<void> {
  try {
    if (storeName !== STORE_MAGAZINE) {
      localStorage.setItem(`rithu_${storeName}_${key}`, JSON.stringify(value));
    }
  } catch {
    // Ignore quota errors
  }

  try {
    const idb = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = idb.transaction(storeName, 'readwrite');
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
    const idb = await openDatabase();
    return new Promise((resolve) => {
      const transaction = idb.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result && req.result.value !== undefined) {
          resolve(req.result.value);
        } else {
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
    try {
      const raw = localStorage.getItem(`rithu_${storeName}_${key}`);
      if (raw !== null) return JSON.parse(raw);
    } catch {
      // Ignore
    }
    return null;
  }
}

// ============================================================================
// Local Cache Helpers
// ============================================================================

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
    pages: pages !== null && Array.isArray(pages) && pages.length > 0 ? pages : DEFAULT_MAGAZINE_PAGES,
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

const EDITORIAL_BOARD_MEDIA_ID = 'editorial-board-2026';

export async function loadPersistedEditorialBoardImage(): Promise<string | null> {
  const data = await getItem<string>(STORE_MAGAZINE, 'editorial_board_image');
  if (typeof data === 'string' && data.length > 0) {
    return data;
  }
  return null;
}

export async function savePersistedEditorialBoardImage(dataUrl: string | null): Promise<void> {
  await setItem(STORE_MAGAZINE, 'editorial_board_image', dataUrl);
}

/**
 * Uploads the Editorial Board poster image to Firebase Firestore (`media_chunks` with mediaId 'editorial-board-2026')
 * so every visitor across all devices sees the uploaded Editorial Board poster without login.
 */
export async function uploadEditorialBoardImageToFirebase(
  fileOrDataUrl: File | string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const dataUrl =
    typeof fileOrDataUrl === 'string' ? fileOrDataUrl : await fileToDataUrl(fileOrDataUrl);
  const chunkSize = 680000;
  const totalChunks = Math.ceil(dataUrl.length / chunkSize);

  if (totalChunks > 95) {
    throw new Error('Image exceeds maximum cloud size. Please use a compressed PNG/JPEG.');
  }

  const creatorUid = getActiveCreatorUid();

  // Delete any prior chunks for editorial-board-2026 first
  try {
    const existingQ = query(
      collection(db, 'media_chunks'),
      where('isPublic', '==', true),
      where('mediaId', '==', EDITORIAL_BOARD_MEDIA_ID)
    );
    const existingSnap = await getDocs(existingQ);
    if (!existingSnap.empty) {
      const delBatch = writeBatch(db);
      existingSnap.docs.forEach((d) => delBatch.delete(d.ref));
      await delBatch.commit();
    }
  } catch {
    // Ignore cleanup errors
  }

  for (let i = 0; i < totalChunks; i++) {
    const slice = dataUrl.slice(i * chunkSize, (i + 1) * chunkSize);
    const chunkDocId = sanitizeDocId(`${EDITORIAL_BOARD_MEDIA_ID}-c-${i}`);
    const payload = {
      id: chunkDocId,
      mediaId: EDITORIAL_BOARD_MEDIA_ID,
      chunkIndex: i,
      totalChunks,
      data: slice,
      isPublic: true,
      createdByUid: creatorUid,
      editorialKey: EDITORIAL_KEY,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'media_chunks', chunkDocId), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `media_chunks/${chunkDocId}`);
    }

    if (onProgress) {
      onProgress(Math.round(((i + 1) / totalChunks) * 100));
    }
  }

  await savePersistedEditorialBoardImage(dataUrl);
  return dataUrl;
}

// ============================================================================
// Chunked Binary File Storage in Firebase Firestore (/media_chunks)
// ============================================================================

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read media file'));
    reader.readAsDataURL(file);
  });
}

function dataUrlToBlobUrl(dataUrl: string): string {
  try {
    const parts = dataUrl.split(',');
    if (parts.length < 2) return dataUrl;
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    return URL.createObjectURL(blob);
  } catch {
    return dataUrl;
  }
}

/**
 * Uploads an audio or video File to Firebase Firestore by splitting its base64 Data URL
 * into 680KB chunks stored in `/media_chunks/{chunkId}` so any device can stream it without login.
 */
export async function uploadMediaFileToFirebase(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  const chunkSize = 680000;
  const totalChunks = Math.ceil(dataUrl.length / chunkSize);

  if (totalChunks > 95) {
    throw new Error('File exceeds maximum cloud vault size (~45 MB). Please compress the file.');
  }

  const mediaId = sanitizeDocId(`media-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
  const creatorUid = getActiveCreatorUid();

  for (let i = 0; i < totalChunks; i++) {
    const slice = dataUrl.slice(i * chunkSize, (i + 1) * chunkSize);
    const chunkDocId = sanitizeDocId(`${mediaId}-c-${i}`);
    const payload = {
      id: chunkDocId,
      mediaId,
      chunkIndex: i,
      totalChunks,
      data: slice,
      isPublic: true,
      createdByUid: creatorUid,
      editorialKey: EDITORIAL_KEY,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'media_chunks', chunkDocId), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `media_chunks/${chunkDocId}`);
    }

    if (onProgress) {
      onProgress(Math.round(((i + 1) / totalChunks) * 100));
    }
  }

  const refUrl = `firestore-media://${mediaId}`;
  const blobUrl = dataUrlToBlobUrl(dataUrl);
  resolvedMediaCache.set(refUrl, blobUrl);
  return refUrl;
}

/**
 * Resolves a `firestore-media://...` reference by downloading all chunks from Firestore
 * and reassembling them into a playable Blob URL.
 */
export async function resolveMediaUrlFromFirebase(urlOrRef?: string): Promise<string | null> {
  if (!urlOrRef) return null;
  if (!urlOrRef.startsWith('firestore-media://')) {
    return urlOrRef;
  }

  if (resolvedMediaCache.has(urlOrRef)) {
    return resolvedMediaCache.get(urlOrRef)!;
  }

  const mediaId = sanitizeDocId(urlOrRef.replace('firestore-media://', ''));
  try {
    const q = query(
      collection(db, 'media_chunks'),
      where('isPublic', '==', true),
      where('mediaId', '==', mediaId)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;

    const chunks = snap.docs
      .map((d) => d.data() as { chunkIndex: number; data: string })
      .sort((a, b) => a.chunkIndex - b.chunkIndex);

    const fullDataUrl = chunks.map((c) => c.data).join('');
    const blobUrl = dataUrlToBlobUrl(fullDataUrl);
    resolvedMediaCache.set(urlOrRef, blobUrl);
    return blobUrl;
  } catch (error) {
    console.error('Failed to resolve Firestore media chunks:', error);
    return null;
  }
}

async function deleteMediaChunksIfPresent(urlOrRef?: string): Promise<void> {
  if (!urlOrRef || !urlOrRef.startsWith('firestore-media://')) return;
  const mediaId = sanitizeDocId(urlOrRef.replace('firestore-media://', ''));
  try {
    const q = query(
      collection(db, 'media_chunks'),
      where('isPublic', '==', true),
      where('mediaId', '==', mediaId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  } catch {
    // Ignore cleanup errors
  }
}

// ============================================================================
// Cloud Firestore Real-Time Synchronization & CRUD
// ============================================================================

function buildAudioTrackPayload(track: AudioTrack, uid: string, isUpdate = false) {
  const docId = sanitizeDocId(track.id);
  const validCategories = ['Travelogue', 'Editorial', 'Poetry', 'Interview', 'Fiction', 'Discussion'];
  const validLanguages = ['Malayalam', 'English', 'Bilingual'];

  const payload: Record<string, unknown> = {
    title: clampStr(track.title, 200, 'Untitled Audio'),
    author: clampStr(track.author, 120, 'Editorial Contributor'),
    category: validCategories.includes(track.category) ? track.category : 'Editorial',
    language: validLanguages.includes(track.language) ? track.language : 'Malayalam',
    duration: clampStr(track.duration, 20, '4:00'),
    durationSeconds: Math.max(1, Math.min(86400, Math.round(Number(track.durationSeconds) || 240))),
    publishedDate: clampStr(track.publishedDate, 50, 'Feb 2026'),
    description: clampStr(track.description, 2000, 'Archived audio piece from the Munnar Sound Archives.'),
    isPublic: true,
    editorialKey: EDITORIAL_KEY,
    updatedAt: serverTimestamp(),
  };

  if (!isUpdate) {
    payload.id = docId;
    payload.createdByUid = sanitizeDocId(uid);
    payload.createdAt = serverTimestamp();
  }
  if (track.englishSubtitle && track.englishSubtitle.trim()) {
    payload.englishSubtitle = clampStr(track.englishSubtitle, 200);
  }
  if (track.coverImage && track.coverImage.trim() && track.coverImage.length <= 700000) {
    payload.coverImage = track.coverImage.trim();
  }
  if (track.audioUrl && track.audioUrl.trim() && track.audioUrl.length <= 700000) {
    payload.audioUrl = track.audioUrl.trim();
  }

  return { docId, payload };
}

function buildVideoItemPayload(video: VideoItem, uid: string, isUpdate = false) {
  const docId = sanitizeDocId(video.id);
  const validCategories = ['Events', 'Workshops', 'IEEE', 'Interviews'];
  const defaultPoster =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB-gJYBvMzQrXPTgT-D-NcHUXXRAfbO4h50BvYxfVaKnxISA54fnLU65JKY-M7i8O6k4NVB5GN68Ue0-RdGzI6jd3Os8YoTI5vjtfQKAq7FZOGfdVYApQxl1zk1xc0LlNtRskp5NcrWyW0IXrfMh6Nv1tr70vS8kpK2csYdYped1QYazKl8mBJq3zZ9QpgnXV-V0MGT5lF22bbgVqIGL9YMxAzJEduT5fok0v5meB7NJrXTbOh3bC2z';

  const payload: Record<string, unknown> = {
    title: clampStr(video.title, 200, 'Untitled Video'),
    dateStr: clampStr(video.dateStr, 50, 'Feb 2026'),
    category: validCategories.includes(video.category) ? video.category : 'Events',
    duration: clampStr(video.duration, 20, '5:00'),
    durationSeconds: Math.max(1, Math.min(86400, Math.round(Number(video.durationSeconds) || 300))),
    image: video.image && video.image.length <= 700000 ? video.image.trim() : defaultPoster,
    imageAlt: clampStr(video.imageAlt || video.title, 200, 'Video Poster'),
    isPublic: true,
    editorialKey: EDITORIAL_KEY,
    updatedAt: serverTimestamp(),
  };

  if (!isUpdate) {
    payload.id = docId;
    payload.createdByUid = sanitizeDocId(uid);
    payload.createdAt = serverTimestamp();
  }
  if (typeof video.isFeatured === 'boolean') {
    payload.isFeatured = video.isFeatured;
  }
  if (video.tagline && video.tagline.trim()) {
    payload.tagline = clampStr(video.tagline, 200);
  }
  if (video.description && video.description.trim()) {
    payload.description = clampStr(video.description, 2000);
  }
  if (video.videoUrl && video.videoUrl.trim() && video.videoUrl.length <= 700000) {
    payload.videoUrl = clampStr(video.videoUrl, 700000);
  }

  return { docId, payload };
}

/**
 * Subscribes to live public collections in Firestore so every visitor on every device
 * automatically receives real-time updates without needing to log in.
 */
export function subscribeToCloudArchive(callbacks: {
  onAudioTracks: (tracks: AudioTrack[]) => void;
  onVideoItems: (videos: VideoItem[]) => void;
  onMagazine: (pages: MagazinePage[], edition: MagazineEditionInfo) => void;
  onEditorialBoardImage?: (imageUrl: string | null) => void;
}): () => void {
  let latestEdition: MagazineEditionInfo | null = null;
  let latestPdfPages: MagazinePage[] = [];
  let isCloudInitialized = false;

  const emitMagazineIfReady = () => {
    if (!latestEdition) return;
    if (latestEdition.sourceType === 'curated') {
      callbacks.onMagazine(DEFAULT_MAGAZINE_PAGES, latestEdition);
      savePersistedMagazine(DEFAULT_MAGAZINE_PAGES, latestEdition);
    } else if (latestPdfPages.length > 0) {
      const sorted = [...latestPdfPages].sort((a, b) => a.pageNumber - b.pageNumber);
      callbacks.onMagazine(sorted, latestEdition);
      savePersistedMagazine(sorted, latestEdition);
    }
  };

  // Ensure cloud archive is seeded on first run
  seedInitialCloudDataIfNeeded(
    INITIAL_AUDIO_TRACKS,
    INITIAL_VIDEOS,
    INITIAL_MAGAZINE_EDITION
  )
    .then(() => {
      isCloudInitialized = true;
    })
    .catch(() => {});

  // 1. Magazine Edition Listener
  const editionQuery = query(collection(db, 'magazine_edition'), where('isPublic', '==', true));
  const unsubEdition = onSnapshot(
    editionQuery,
    (snapshot) => {
      const currentDoc = snapshot.docs.find((d) => d.id === 'current') || snapshot.docs[0];
      if (currentDoc) {
        isCloudInitialized = true;
        const d = currentDoc.data();
        latestEdition = {
          title: d.title,
          year: d.year,
          institution: d.institution,
          totalPages: d.totalPages,
          sourceType: d.sourceType,
          fileName: d.fileName,
          updatedAt: 'Synced via Cloud',
        };
        emitMagazineIfReady();
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'magazine_edition');
    }
  );

  // 2. Audio Tracks Listener
  const audioQuery = query(collection(db, 'audio_tracks'), where('isPublic', '==', true));
  const unsubAudio = onSnapshot(
    audioQuery,
    (snapshot) => {
      if (!snapshot.empty || isCloudInitialized) {
        const tracks: AudioTrack[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: d.id,
            title: d.title,
            englishSubtitle: d.englishSubtitle,
            author: d.author,
            category: d.category,
            language: d.language,
            duration: d.duration,
            durationSeconds: d.durationSeconds,
            publishedDate: d.publishedDate,
            description: d.description,
            coverImage: d.coverImage,
            audioUrl: d.audioUrl,
            createdByUid: d.createdByUid,
          };
        });
        callbacks.onAudioTracks(tracks);
        savePersistedAudioTracks(tracks);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'audio_tracks');
    }
  );

  // 3. Video Items Listener
  const videoQuery = query(collection(db, 'video_items'), where('isPublic', '==', true));
  const unsubVideo = onSnapshot(
    videoQuery,
    (snapshot) => {
      if (!snapshot.empty || isCloudInitialized) {
        const videos: VideoItem[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: d.id,
            title: d.title,
            dateStr: d.dateStr,
            category: d.category,
            duration: d.duration,
            durationSeconds: d.durationSeconds,
            image: d.image,
            imageAlt: d.imageAlt,
            isFeatured: d.isFeatured,
            tagline: d.tagline,
            description: d.description,
            videoUrl: d.videoUrl,
            createdByUid: d.createdByUid,
          };
        });
        callbacks.onVideoItems(videos);
        savePersistedVideoItems(videos);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'video_items');
    }
  );

  // 4. Magazine Pages Listener
  const pagesQuery = query(collection(db, 'magazine_pages'), where('isPublic', '==', true));
  const unsubPages = onSnapshot(
    pagesQuery,
    (snapshot) => {
      if (!snapshot.empty) {
        latestPdfPages = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: d.id,
            pageNumber: d.pageNumber,
            type: d.type,
            title: d.title,
            subtitle: d.subtitle,
            pdfImageUrl: d.pdfImageUrl,
          };
        });
        emitMagazineIfReady();
      } else {
        latestPdfPages = [];
        emitMagazineIfReady();
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'magazine_pages');
    }
  );

  // 5. Editorial Board Poster Image Listener
  const editorialBoardQuery = query(
    collection(db, 'media_chunks'),
    where('isPublic', '==', true),
    where('mediaId', '==', EDITORIAL_BOARD_MEDIA_ID)
  );
  const unsubEditorialBoard = onSnapshot(
    editorialBoardQuery,
    (snapshot) => {
      if (!snapshot.empty && callbacks.onEditorialBoardImage) {
        const chunks = snapshot.docs
          .map((d) => d.data() as { chunkIndex: number; totalChunks: number; data: string })
          .sort((a, b) => a.chunkIndex - b.chunkIndex);
        const expectedTotal = chunks[0]?.totalChunks || chunks.length;
        if (chunks.length >= expectedTotal) {
          const fullDataUrl = chunks.map((c) => c.data).join('');
          callbacks.onEditorialBoardImage(fullDataUrl);
          savePersistedEditorialBoardImage(fullDataUrl);
        }
      }
    },
    () => {
      // Ignore transient listener error
    }
  );

  return () => {
    unsubAudio();
    unsubVideo();
    unsubEdition();
    unsubPages();
    unsubEditorialBoard();
  };
}

/**
 * Seeds the cloud Firestore database with initial audio tracks, videos, and magazine edition
 * if `/magazine_edition/current` has never been created yet.
 */
export async function seedInitialCloudDataIfNeeded(
  currentAudio: AudioTrack[],
  currentVideos: VideoItem[],
  currentEdition: MagazineEditionInfo
): Promise<void> {
  if (!auth.currentUser) {
    return;
  }
  const creatorUid = getActiveCreatorUid();

  try {
    const editionSnap = await getDocs(
      query(collection(db, 'magazine_edition'), where('isPublic', '==', true))
    );

    if (!editionSnap.empty) {
      return;
    }

    const [audioSnap, videoSnap] = await Promise.all([
      getDocs(query(collection(db, 'audio_tracks'), where('isPublic', '==', true))),
      getDocs(query(collection(db, 'video_items'), where('isPublic', '==', true))),
    ]);

    const batch = writeBatch(db);

    if (audioSnap.empty) {
      for (const track of currentAudio) {
        const { docId, payload } = buildAudioTrackPayload(track, creatorUid, false);
        batch.set(doc(db, 'audio_tracks', docId), payload);
      }
    }

    if (videoSnap.empty) {
      for (const video of currentVideos) {
        const { docId, payload } = buildVideoItemPayload(video, creatorUid, false);
        batch.set(doc(db, 'video_items', docId), payload);
      }
    }

    const editionPayload: Record<string, unknown> = {
      id: 'current',
      title: clampStr(currentEdition.title, 200, INITIAL_MAGAZINE_EDITION.title),
      year: clampStr(currentEdition.year, 20, '2026'),
      institution: clampStr(currentEdition.institution, 200, 'College of Engineering Munnar'),
      totalPages: Math.max(1, Math.min(200, currentEdition.totalPages || 16)),
      sourceType: currentEdition.sourceType === 'pdf' ? 'pdf' : 'curated',
      isPublic: true,
      createdByUid: creatorUid,
      editorialKey: EDITORIAL_KEY,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (currentEdition.fileName) {
      editionPayload.fileName = clampStr(currentEdition.fileName, 255);
    }
    batch.set(doc(db, 'magazine_edition', 'current'), editionPayload);

    await batch.commit();
  } catch (error) {
    console.warn('Initial cloud archive check notice:', error);
  }
}

export async function saveCloudAudioTrack(track: AudioTrack): Promise<void> {
  const creatorUid = getActiveCreatorUid();
  const { docId, payload } = buildAudioTrackPayload(track, creatorUid, false);
  try {
    await setDoc(doc(db, 'audio_tracks', docId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `audio_tracks/${docId}`);
  }
}

export async function updateCloudAudioTrack(track: AudioTrack): Promise<void> {
  const creatorUid = getActiveCreatorUid();
  const { docId, payload } = buildAudioTrackPayload(track, creatorUid, true);
  try {
    await updateDoc(doc(db, 'audio_tracks', docId), payload);
  } catch {
    try {
      await deleteDoc(doc(db, 'audio_tracks', docId)).catch(() => {});
      const fresh = buildAudioTrackPayload({ ...track, createdByUid: creatorUid }, creatorUid, false);
      await setDoc(doc(db, 'audio_tracks', docId), fresh.payload);
    } catch (innerErr) {
      handleFirestoreError(innerErr, OperationType.UPDATE, `audio_tracks/${docId}`);
    }
  }
}

export async function deleteCloudAudioTrack(id: string, audioUrl?: string): Promise<void> {
  const docId = sanitizeDocId(id);
  try {
    await deleteDoc(doc(db, 'audio_tracks', docId));
    await deleteMediaChunksIfPresent(audioUrl);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `audio_tracks/${docId}`);
  }
}

export async function saveCloudVideoItem(video: VideoItem): Promise<void> {
  const creatorUid = getActiveCreatorUid();
  const { docId, payload } = buildVideoItemPayload(video, creatorUid, false);
  try {
    await setDoc(doc(db, 'video_items', docId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `video_items/${docId}`);
  }
}

export async function updateCloudVideoItem(video: VideoItem): Promise<void> {
  const creatorUid = getActiveCreatorUid();
  const { docId, payload } = buildVideoItemPayload(video, creatorUid, true);
  try {
    await updateDoc(doc(db, 'video_items', docId), payload);
  } catch {
    try {
      await deleteDoc(doc(db, 'video_items', docId)).catch(() => {});
      const fresh = buildVideoItemPayload({ ...video, createdByUid: creatorUid }, creatorUid, false);
      await setDoc(doc(db, 'video_items', docId), fresh.payload);
    } catch (innerErr) {
      handleFirestoreError(innerErr, OperationType.UPDATE, `video_items/${docId}`);
    }
  }
}

export async function deleteCloudVideoItem(id: string, videoUrl?: string): Promise<void> {
  const docId = sanitizeDocId(id);
  try {
    await deleteDoc(doc(db, 'video_items', docId));
    await deleteMediaChunksIfPresent(videoUrl);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `video_items/${docId}`);
  }
}

export async function saveCloudMagazineEditionAndPages(
  pages: MagazinePage[],
  edition: MagazineEditionInfo,
  onProgress?: (percent: number) => void
): Promise<void> {
  const creatorUid = getActiveCreatorUid();

  try {
    // 1. Delete existing magazine_pages first so stale pages from a longer prior PDF don't remain
    const existingPagesSnap = await getDocs(
      query(collection(db, 'magazine_pages'), where('isPublic', '==', true))
    );
    if (!existingPagesSnap.empty) {
      const delBatch = writeBatch(db);
      existingPagesSnap.docs.forEach((docSnap) => {
        delBatch.delete(docSnap.ref);
      });
      await delBatch.commit();
    }

    // 2. Write or replace magazine_edition/current so relational check exists() passes on magazine_pages creation
    const editionDocRef = doc(db, 'magazine_edition', 'current');
    await deleteDoc(editionDocRef).catch(() => {});

    const buildEditionPayload = () => {
      const p: Record<string, unknown> = {
        id: 'current',
        title: clampStr(edition.title, 200, 'Rithu 2026'),
        year: clampStr(edition.year, 20, '2026'),
        institution: clampStr(edition.institution, 200, 'College of Engineering Munnar'),
        totalPages: Math.max(1, Math.min(500, pages.length)),
        sourceType: edition.sourceType === 'pdf' ? 'pdf' : 'curated',
        isPublic: true,
        createdByUid: creatorUid,
        editorialKey: EDITORIAL_KEY,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (edition.fileName && edition.fileName.trim()) {
        p.fileName = clampStr(edition.fileName, 255);
      }
      return p;
    };

    await setDoc(editionDocRef, buildEditionPayload());

    // 3. Write each rendered PDF page as its own document in magazine_pages
    if (edition.sourceType === 'pdf') {
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const pageDocId = sanitizeDocId(`page-${i + 1}`);
        const validTypes = ['cover', 'content', 'back-cover'];
        const pagePayload = {
          id: pageDocId,
          editionId: 'current',
          pageNumber: Math.max(0, Math.min(500, i)),
          type: validTypes.includes(page.type) ? page.type : 'content',
          title: clampStr(page.title, 200, `Page ${i + 1}`),
          subtitle: clampStr(page.subtitle, 200, `PDF Page ${i + 1} of ${pages.length}`),
          pdfImageUrl: clampStr(page.pdfImageUrl, 850000, 'https://via.placeholder.com/600x800'),
          isPublic: true,
          createdByUid: creatorUid,
          editorialKey: EDITORIAL_KEY,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'magazine_pages', pageDocId), pagePayload);
        if (onProgress) {
          onProgress(Math.round(((i + 1) / pages.length) * 100));
        }
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'magazine_edition/current');
  }
}

export async function resetCloudMagazineToCurated(): Promise<void> {
  const creatorUid = getActiveCreatorUid();

  try {
    const existingPagesSnap = await getDocs(
      query(collection(db, 'magazine_pages'), where('isPublic', '==', true))
    );
    if (!existingPagesSnap.empty) {
      const delBatch = writeBatch(db);
      existingPagesSnap.docs.forEach((docSnap) => {
        delBatch.delete(docSnap.ref);
      });
      await delBatch.commit();
    }

    const editionDocRef = doc(db, 'magazine_edition', 'current');
    await deleteDoc(editionDocRef).catch(() => {});

    await setDoc(editionDocRef, {
      id: 'current',
      title: clampStr(INITIAL_MAGAZINE_EDITION.title, 200),
      year: clampStr(INITIAL_MAGAZINE_EDITION.year, 20),
      institution: clampStr(INITIAL_MAGAZINE_EDITION.institution, 200),
      totalPages: INITIAL_MAGAZINE_EDITION.totalPages,
      sourceType: 'curated',
      isPublic: true,
      createdByUid: creatorUid,
      editorialKey: EDITORIAL_KEY,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'magazine_edition/current');
  }
}

/**
 * Persistent & Cloud Storage Layer for Rithu Editorial App
 * Synchronizes Audio Tracks, Video Items, and Magazine Editions across all devices
 * via Firebase Cloud Firestore, with local IndexedDB cache fallback.
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

// Sanitize IDs to match blueprint pattern ^[a-zA-Z0-9_\-]+$ and maxLength 128
export function sanitizeDocId(rawId: string): string {
  const cleaned = rawId.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  return cleaned.length > 0 ? cleaned : `doc-${Date.now()}`;
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
  if (data !== null && Array.isArray(data) && data.length > 0) {
    return data;
  }
  return INITIAL_AUDIO_TRACKS;
}

export async function savePersistedAudioTracks(tracks: AudioTrack[]): Promise<void> {
  await setItem(STORE_AUDIO, 'all_tracks', tracks);
}

export async function loadPersistedVideoItems(): Promise<VideoItem[]> {
  const data = await getItem<VideoItem[]>(STORE_VIDEO, 'all_videos');
  if (data !== null && Array.isArray(data) && data.length > 0) {
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

// ============================================================================
// Cloud Firestore Real-Time Synchronization & CRUD
// ============================================================================

function buildAudioTrackPayload(track: AudioTrack, uid: string, isUpdate = false) {
  const docId = sanitizeDocId(track.id);
  const validCategories = ['Travelogue', 'Editorial', 'Poetry', 'Interview', 'Fiction', 'Discussion'];
  const validLanguages = ['Malayalam', 'English', 'Bilingual'];

  const payload: Record<string, unknown> = {
    id: docId,
    title: clampStr(track.title, 200, 'Untitled Audio'),
    author: clampStr(track.author, 120, 'Editorial Contributor'),
    category: validCategories.includes(track.category) ? track.category : 'Editorial',
    language: validLanguages.includes(track.language) ? track.language : 'Malayalam',
    duration: clampStr(track.duration, 20, '4:00'),
    durationSeconds: Math.max(1, Math.min(86400, Math.round(Number(track.durationSeconds) || 240))),
    publishedDate: clampStr(track.publishedDate, 50, 'Feb 2026'),
    description: clampStr(track.description, 2000, 'Archived audio piece from the Munnar Sound Archives.'),
    isPublic: true,
    createdByUid: sanitizeDocId(track.createdByUid || uid),
    updatedAt: serverTimestamp(),
  };

  if (!isUpdate) {
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
    id: docId,
    title: clampStr(video.title, 200, 'Untitled Video'),
    dateStr: clampStr(video.dateStr, 50, 'Feb 2026'),
    category: validCategories.includes(video.category) ? video.category : 'Events',
    duration: clampStr(video.duration, 20, '5:00'),
    durationSeconds: Math.max(1, Math.min(86400, Math.round(Number(video.durationSeconds) || 300))),
    image: video.image && video.image.length <= 700000 ? video.image.trim() : defaultPoster,
    imageAlt: clampStr(video.imageAlt || video.title, 200, 'Video Poster'),
    isPublic: true,
    createdByUid: sanitizeDocId(video.createdByUid || uid),
    updatedAt: serverTimestamp(),
  };

  if (!isUpdate) {
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
  if (video.videoUrl && video.videoUrl.trim()) {
    payload.videoUrl = clampStr(video.videoUrl, 2000);
  }

  return { docId, payload };
}

/**
 * Subscribes to live public collections in Firestore so every visitor on every device
 * automatically receives real-time updates when an admin adds, edits, or deletes content.
 */
export function subscribeToCloudArchive(callbacks: {
  onAudioTracks: (tracks: AudioTrack[]) => void;
  onVideoItems: (videos: VideoItem[]) => void;
  onMagazine: (pages: MagazinePage[], edition: MagazineEditionInfo) => void;
}): () => void {
  let latestEdition: MagazineEditionInfo | null = null;
  let latestPdfPages: MagazinePage[] = [];

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

  // 1. Audio Tracks Listener
  const audioQuery = query(collection(db, 'audio_tracks'), where('isPublic', '==', true));
  const unsubAudio = onSnapshot(
    audioQuery,
    (snapshot) => {
      if (!snapshot.empty) {
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

  // 2. Video Items Listener
  const videoQuery = query(collection(db, 'video_items'), where('isPublic', '==', true));
  const unsubVideo = onSnapshot(
    videoQuery,
    (snapshot) => {
      if (!snapshot.empty) {
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

  // 3. Magazine Edition Listener
  const editionQuery = query(collection(db, 'magazine_edition'), where('isPublic', '==', true));
  const unsubEdition = onSnapshot(
    editionQuery,
    (snapshot) => {
      const currentDoc = snapshot.docs.find((d) => d.id === 'current') || snapshot.docs[0];
      if (currentDoc) {
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

  return () => {
    unsubAudio();
    unsubVideo();
    unsubEdition();
    unsubPages();
  };
}

/**
 * Seeds the cloud Firestore database with initial audio tracks, videos, and magazine edition
 * if the cloud collections are currently empty when an authenticated admin logs in.
 */
export async function seedInitialCloudDataIfNeeded(
  currentAudio: AudioTrack[],
  currentVideos: VideoItem[],
  currentEdition: MagazineEditionInfo
): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const [audioSnap, videoSnap, editionSnap] = await Promise.all([
      getDocs(query(collection(db, 'audio_tracks'), where('isPublic', '==', true))),
      getDocs(query(collection(db, 'video_items'), where('isPublic', '==', true))),
      getDocs(query(collection(db, 'magazine_edition'), where('isPublic', '==', true))),
    ]);

    const batch = writeBatch(db);
    let hasWrites = false;

    if (audioSnap.empty) {
      for (const track of currentAudio) {
        const { docId, payload } = buildAudioTrackPayload(track, user.uid, false);
        batch.set(doc(db, 'audio_tracks', docId), payload);
        hasWrites = true;
      }
    }

    if (videoSnap.empty) {
      for (const video of currentVideos) {
        const { docId, payload } = buildVideoItemPayload(video, user.uid, false);
        batch.set(doc(db, 'video_items', docId), payload);
        hasWrites = true;
      }
    }

    if (editionSnap.empty) {
      const editionPayload: Record<string, unknown> = {
        id: 'current',
        title: clampStr(currentEdition.title, 200, INITIAL_MAGAZINE_EDITION.title),
        year: clampStr(currentEdition.year, 20, '2026'),
        institution: clampStr(currentEdition.institution, 200, 'College of Engineering Munnar'),
        totalPages: Math.max(1, Math.min(200, currentEdition.totalPages || 16)),
        sourceType: currentEdition.sourceType === 'pdf' ? 'pdf' : 'curated',
        isPublic: true,
        createdByUid: sanitizeDocId(user.uid),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (currentEdition.fileName) {
        editionPayload.fileName = clampStr(currentEdition.fileName, 255);
      }
      batch.set(doc(db, 'magazine_edition', 'current'), editionPayload);
      hasWrites = true;
    }

    if (hasWrites) {
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seed_initial_archive');
  }
}

export async function saveCloudAudioTrack(track: AudioTrack): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  const { docId, payload } = buildAudioTrackPayload(track, user.uid, false);
  try {
    await setDoc(doc(db, 'audio_tracks', docId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `audio_tracks/${docId}`);
  }
}

export async function updateCloudAudioTrack(track: AudioTrack): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  const { docId, payload } = buildAudioTrackPayload(track, user.uid, true);
  try {
    await updateDoc(doc(db, 'audio_tracks', docId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `audio_tracks/${docId}`);
  }
}

export async function deleteCloudAudioTrack(id: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  const docId = sanitizeDocId(id);
  try {
    await deleteDoc(doc(db, 'audio_tracks', docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `audio_tracks/${docId}`);
  }
}

export async function saveCloudVideoItem(video: VideoItem): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  const { docId, payload } = buildVideoItemPayload(video, user.uid, false);
  try {
    await setDoc(doc(db, 'video_items', docId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `video_items/${docId}`);
  }
}

export async function updateCloudVideoItem(video: VideoItem): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  const { docId, payload } = buildVideoItemPayload(video, user.uid, true);
  try {
    await updateDoc(doc(db, 'video_items', docId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `video_items/${docId}`);
  }
}

export async function deleteCloudVideoItem(id: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  const docId = sanitizeDocId(id);
  try {
    await deleteDoc(doc(db, 'video_items', docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `video_items/${docId}`);
  }
}

export async function saveCloudMagazineEditionAndPages(
  pages: MagazinePage[],
  edition: MagazineEditionInfo
): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

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

    // 2. Write or replace magazine_edition/current
    const editionDocRef = doc(db, 'magazine_edition', 'current');
    await deleteDoc(editionDocRef).catch(() => {});

    const editionPayload: Record<string, unknown> = {
      id: 'current',
      title: clampStr(edition.title, 200, 'Rithu 2026'),
      year: clampStr(edition.year, 20, '2026'),
      institution: clampStr(edition.institution, 200, 'College of Engineering Munnar'),
      totalPages: Math.max(1, Math.min(200, pages.length)),
      sourceType: edition.sourceType === 'pdf' ? 'pdf' : 'curated',
      isPublic: true,
      createdByUid: sanitizeDocId(user.uid),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (edition.fileName && edition.fileName.trim()) {
      editionPayload.fileName = clampStr(edition.fileName, 255);
    }

    await setDoc(editionDocRef, editionPayload);

    // 3. Write each rendered PDF page as its own document in magazine_pages
    if (edition.sourceType === 'pdf') {
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const pageDocId = sanitizeDocId(`page-${i + 1}`);
        const validTypes = ['cover', 'content', 'back-cover'];
        const pagePayload = {
          id: pageDocId,
          editionId: 'current',
          pageNumber: Math.max(0, Math.min(200, i)),
          type: validTypes.includes(page.type) ? page.type : 'content',
          title: clampStr(page.title, 200, `Page ${i + 1}`),
          subtitle: clampStr(page.subtitle, 200, `PDF Page ${i + 1} of ${pages.length}`),
          pdfImageUrl: clampStr(page.pdfImageUrl, 850000, 'https://via.placeholder.com/600x800'),
          isPublic: true,
          createdByUid: sanitizeDocId(user.uid),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'magazine_pages', pageDocId), pagePayload);
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'magazine_edition/current');
  }
}

export async function resetCloudMagazineToCurated(): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

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
      createdByUid: sanitizeDocId(user.uid),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'magazine_edition/current');
  }
}

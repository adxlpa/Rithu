import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  db,
  auth,
  isCloudQuotaReached,
  isQuotaExceededError,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import {
  AudioTrack,
  VideoItem,
  MagazinePage,
  MagazineEditionInfo,
} from '../types';
import {
  INITIAL_AUDIO_TRACKS,
  INITIAL_VIDEO_ITEMS,
  INITIAL_MAGAZINE_EDITION,
  DEFAULT_MAGAZINE_PAGES,
} from '../data/initialData';

const DB_NAME = 'rithu_magazine_db';
const DB_VERSION = 1;
const STORE_AUDIO = 'audio_tracks';
const STORE_VIDEO = 'video_items';
const STORE_MAGAZINE = 'magazine_edition';

const EDITORIAL_KEY = 'rithu2026-cem-vault';
const DEFAULT_ADMIN_UID = 'rithu-editorial-admin';

const mediaBlobCache = new Map<string, string>();

function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  return cleaned.length > 0 ? cleaned : `doc-${Date.now()}`;
}

function getCurrentUid(): string {
  return auth.currentUser?.uid ? sanitizeId(auth.currentUser.uid) : DEFAULT_ADMIN_UID;
}

function clampString(val: string | undefined, maxLen: number, fallback = ''): string {
  const trimmed = (val ?? fallback).trim();
  return (trimmed.length > 0 ? trimmed : fallback).slice(0, maxLen);
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const dbInstance = request.result;
      if (!dbInstance.objectStoreNames.contains(STORE_AUDIO)) {
        dbInstance.createObjectStore(STORE_AUDIO, { keyPath: 'key' });
      }
      if (!dbInstance.objectStoreNames.contains(STORE_VIDEO)) {
        dbInstance.createObjectStore(STORE_VIDEO, { keyPath: 'key' });
      }
      if (!dbInstance.objectStoreNames.contains(STORE_MAGAZINE)) {
        dbInstance.createObjectStore(STORE_MAGAZINE, { keyPath: 'key' });
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
    // Ignore localStorage quota issues
  }
  try {
    const dbInstance = await openDB();
    return new Promise((resolve, reject) => {
      const tx = dbInstance.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put({ key, value });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback already handled
  }
}

async function getItem<T>(storeName: string, key: string): Promise<T | null> {
  try {
    const dbInstance = await openDB();
    return new Promise((resolve) => {
      const tx = dbInstance.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result && req.result.value !== undefined) {
          resolve(req.result.value as T);
        } else {
          try {
            const raw = localStorage.getItem(`rithu_${storeName}_${key}`);
            if (raw !== null) {
              resolve(JSON.parse(raw) as T);
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
            resolve(JSON.parse(raw) as T);
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
      if (raw !== null) {
        return JSON.parse(raw) as T;
      }
    } catch {
      // Ignore
    }
    return null;
  }
}

export async function loadPersistedAudioTracks(): Promise<AudioTrack[]> {
  const tracks = await getItem<AudioTrack[]>(STORE_AUDIO, 'all_tracks');
  return tracks !== null && Array.isArray(tracks) ? tracks : INITIAL_AUDIO_TRACKS;
}

export async function savePersistedAudioTracks(tracks: AudioTrack[]): Promise<void> {
  await setItem(STORE_AUDIO, 'all_tracks', tracks);
}

export async function loadPersistedVideoItems(): Promise<VideoItem[]> {
  const videos = await getItem<VideoItem[]>(STORE_VIDEO, 'all_videos');
  return videos !== null && Array.isArray(videos) ? videos : INITIAL_VIDEO_ITEMS;
}

export async function savePersistedVideoItems(videos: VideoItem[]): Promise<void> {
  await setItem(STORE_VIDEO, 'all_videos', videos);
}

export async function loadPersistedMagazine(): Promise<{
  pages: MagazinePage[];
  edition: MagazineEditionInfo;
}> {
  const pages = await getItem<MagazinePage[]>(STORE_MAGAZINE, 'pages_v2_74');
  const edition = await getItem<MagazineEditionInfo>(STORE_MAGAZINE, 'edition_v2_74');
  if (
    pages !== null &&
    Array.isArray(pages) &&
    pages.length >= DEFAULT_MAGAZINE_PAGES.length &&
    edition !== null
  ) {
    return { pages, edition };
  }
  return {
    pages: DEFAULT_MAGAZINE_PAGES,
    edition: INITIAL_MAGAZINE_EDITION,
  };
}

export async function savePersistedMagazine(
  pages: MagazinePage[],
  edition: MagazineEditionInfo
): Promise<void> {
  await setItem(STORE_MAGAZINE, 'pages_v2_74', pages);
  await setItem(STORE_MAGAZINE, 'edition_v2_74', edition);
}

export async function resetPersistedMagazine(): Promise<void> {
  await setItem(STORE_MAGAZINE, 'pages_v2_74', DEFAULT_MAGAZINE_PAGES);
  await setItem(STORE_MAGAZINE, 'edition_v2_74', INITIAL_MAGAZINE_EDITION);
}

export async function loadPersistedEditorialBoardImage(): Promise<string | null> {
  const img = await getItem<string>(STORE_MAGAZINE, 'editorial_board_image');
  return typeof img === 'string' && img.length > 0 ? img : null;
}

function readFileAsDataUrl(file: File): Promise<string> {
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

export async function uploadMediaToFirestore(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const dataUrl = await readFileAsDataUrl(file);
  const mediaId = sanitizeId(`media-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
  const mediaUri = `firestore-media://${mediaId}`;
  const localBlobUrl = dataUrlToBlobUrl(dataUrl);
  mediaBlobCache.set(mediaUri, localBlobUrl);

  if (isCloudQuotaReached()) {
    if (onProgress) onProgress(100);
    return mediaUri;
  }

  const chunkSize = 680000;
  const totalChunks = Math.ceil(dataUrl.length / chunkSize);
  const uid = getCurrentUid();
  const nowIso = new Date().toISOString();

  for (let i = 0; i < totalChunks; i++) {
    if (isCloudQuotaReached()) break;
    const chunkData = dataUrl.slice(i * chunkSize, (i + 1) * chunkSize);
    const chunkId = sanitizeId(`${mediaId}_c${i}`);
    try {
      await setDoc(doc(db, 'media_chunks', chunkId), {
        id: chunkId,
        mediaId,
        chunkIndex: i,
        totalChunks,
        mimeType: clampString(file.type, 100, 'application/octet-stream'),
        data: chunkData,
        isPublic: true,
        createdByUid: uid,
        editorialKey: EDITORIAL_KEY,
        createdAt: nowIso,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `media_chunks/${chunkId}`);
      break;
    }
    if (onProgress) {
      onProgress(Math.round(((i + 1) / totalChunks) * 100));
    }
  }

  return mediaUri;
}

export async function resolveMediaUrl(url: string | undefined): Promise<string | null> {
  if (!url) return null;
  if (!url.startsWith('firestore-media://')) return url;
  if (mediaBlobCache.has(url)) {
    return mediaBlobCache.get(url)!;
  }
  if (isCloudQuotaReached()) return null;

  const mediaId = sanitizeId(url.replace('firestore-media://', ''));
  try {
    const q = query(
      collection(db, 'media_chunks'),
      where('isPublic', '==', true),
      where('mediaId', '==', mediaId)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const sorted = snap.docs
      .map((d) => d.data())
      .sort((a, b) => (a.chunkIndex || 0) - (b.chunkIndex || 0));
    const fullDataUrl = sorted.map((c) => c.data || '').join('');
    const blobUrl = dataUrlToBlobUrl(fullDataUrl);
    mediaBlobCache.set(url, blobUrl);
    return blobUrl;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `media_chunks/${mediaId}`);
    return null;
  }
}

async function deleteMediaChunks(url: string | undefined): Promise<void> {
  if (!url || !url.startsWith('firestore-media://')) return;
  const mediaId = sanitizeId(url.replace('firestore-media://', ''));
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

function buildAudioPayload(track: AudioTrack, uid: string, isUpdate = false) {
  const docId = sanitizeId(track.id);
  const nowIso = new Date().toISOString();
  const payload: Record<string, unknown> = {
    title: clampString(track.title, 200, 'Untitled Audio'),
    author: clampString(track.author, 120, 'Editorial Contributor'),
    category: ['Travelogue', 'Editorial', 'Poetry', 'Interview', 'Fiction', 'Discussion'].includes(
      track.category
    )
      ? track.category
      : 'Editorial',
    language: ['Malayalam', 'English', 'Bilingual'].includes(track.language)
      ? track.language
      : 'Malayalam',
    duration: clampString(track.duration, 20, '4:00'),
    durationSeconds: Math.max(1, Math.min(86400, Math.round(Number(track.durationSeconds) || 240))),
    publishedDate: clampString(track.publishedDate, 50, 'Feb 2026'),
    description: clampString(
      track.description,
      2000,
      'Archived audio piece from the Munnar Sound Archives.'
    ),
    isPublic: true,
    editorialKey: EDITORIAL_KEY,
    updatedAt: nowIso,
  };
  if (!isUpdate) {
    payload.id = docId;
    payload.createdByUid = sanitizeId(uid);
    payload.createdAt = nowIso;
  }
  if (track.englishSubtitle && track.englishSubtitle.trim()) {
    payload.englishSubtitle = clampString(track.englishSubtitle, 200);
  }
  if (track.coverImage && track.coverImage.trim() && track.coverImage.length <= 700000) {
    payload.coverImage = track.coverImage.trim();
  }
  if (track.audioUrl && track.audioUrl.trim() && track.audioUrl.length <= 700000) {
    payload.audioUrl = track.audioUrl.trim();
  }
  return { docId, payload };
}

function buildVideoPayload(video: VideoItem, uid: string, isUpdate = false) {
  const docId = sanitizeId(video.id);
  const nowIso = new Date().toISOString();
  const payload: Record<string, unknown> = {
    title: clampString(video.title, 200, 'Untitled Video'),
    dateStr: clampString(video.dateStr, 50, 'Feb 2026'),
    category: ['Events', 'Workshops', 'IEEE', 'Interviews'].includes(video.category)
      ? video.category
      : 'Events',
    duration: clampString(video.duration, 20, '5:00'),
    durationSeconds: Math.max(1, Math.min(86400, Math.round(Number(video.durationSeconds) || 300))),
    image:
      video.image && video.image.length <= 700000
        ? video.image.trim()
        : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    imageAlt: clampString(video.imageAlt || video.title, 200, 'Video Poster'),
    isPublic: true,
    editorialKey: EDITORIAL_KEY,
    updatedAt: nowIso,
  };
  if (!isUpdate) {
    payload.id = docId;
    payload.createdByUid = sanitizeId(uid);
    payload.createdAt = nowIso;
  }
  if (typeof video.isFeatured === 'boolean') {
    payload.isFeatured = video.isFeatured;
  }
  if (video.tagline && video.tagline.trim()) {
    payload.tagline = clampString(video.tagline, 200);
  }
  if (video.description && video.description.trim()) {
    payload.description = clampString(video.description, 2000);
  }
  if (video.videoUrl && video.videoUrl.trim() && video.videoUrl.length <= 700000) {
    payload.videoUrl = clampString(video.videoUrl, 700000);
  }
  return { docId, payload };
}

export function subscribeToCloudContent(callbacks: {
  onAudioTracks: (tracks: AudioTrack[]) => void;
  onVideoItems: (videos: VideoItem[]) => void;
  onMagazine: (pages: MagazinePage[], edition: MagazineEditionInfo) => void;
  onEditorialBoardImage?: (img: string | null) => void;
}): () => void {
  if (isCloudQuotaReached()) return () => {};

  let latestEdition: MagazineEditionInfo | null = null;
  let latestPages: MagazinePage[] = [];
  let latestAudio: AudioTrack[] | null = null;
  let latestVideo: VideoItem[] | null = null;
  let hasCloudEdition = false;

  let unsubPages: (() => void) | null = null;
  let unsubEdition: (() => void) | null = null;
  let unsubAudio: (() => void) | null = null;
  let unsubVideo: (() => void) | null = null;

  const cleanupAll = () => {
    if (unsubAudio) {
      unsubAudio();
      unsubAudio = null;
    }
    if (unsubVideo) {
      unsubVideo();
      unsubVideo = null;
    }
    if (unsubEdition) {
      unsubEdition();
      unsubEdition = null;
    }
    if (unsubPages) {
      unsubPages();
      unsubPages = null;
    }
  };

  const emitMagazineIfReady = () => {
    if (!latestEdition) return;
    if (latestEdition.sourceType === 'curated') {
      callbacks.onMagazine(DEFAULT_MAGAZINE_PAGES, INITIAL_MAGAZINE_EDITION);
      savePersistedMagazine(DEFAULT_MAGAZINE_PAGES, INITIAL_MAGAZINE_EDITION);
    } else if (
      latestPages.length > 0 &&
      latestPages.length === latestEdition.totalPages &&
      latestEdition.totalPages >= DEFAULT_MAGAZINE_PAGES.length
    ) {
      const sorted = [...latestPages].sort((a, b) => a.pageNumber - b.pageNumber);
      callbacks.onMagazine(sorted, latestEdition);
      savePersistedMagazine(sorted, latestEdition);
    } else {
      callbacks.onMagazine(DEFAULT_MAGAZINE_PAGES, INITIAL_MAGAZINE_EDITION);
    }
  };

  const ensurePagesSub = () => {
    if (unsubPages || isCloudQuotaReached()) return;
    unsubPages = onSnapshot(
      query(collection(db, 'magazine_pages'), where('isPublic', '==', true)),
      (snap) => {
        if (snap.empty) {
          latestPages = [];
          emitMagazineIfReady();
        } else {
          latestPages = snap.docs.map((d) => {
            const data = d.data();
            return {
              id: data.id,
              pageNumber: data.pageNumber,
              type: data.type,
              title: data.title,
              subtitle: data.subtitle,
              pdfImageUrl: data.pdfImageUrl,
            } as MagazinePage;
          });
          emitMagazineIfReady();
        }
      },
      (err) => {
        if (isQuotaExceededError(err)) cleanupAll();
        handleFirestoreError(err, OperationType.LIST, 'magazine_pages');
      }
    );
  };

  const emitAudio = () => {
    if (latestAudio !== null && (latestAudio.length > 0 || hasCloudEdition)) {
      callbacks.onAudioTracks(latestAudio);
      savePersistedAudioTracks(latestAudio);
    }
  };

  const emitVideo = () => {
    if (latestVideo !== null && (latestVideo.length > 0 || hasCloudEdition)) {
      callbacks.onVideoItems(latestVideo);
      savePersistedVideoItems(latestVideo);
    }
  };

  unsubEdition = onSnapshot(
    query(collection(db, 'magazine_edition'), where('isPublic', '==', true)),
    (snap) => {
      const currentDoc = snap.docs.find((d) => d.id === 'current') || snap.docs[0];
      if (currentDoc) {
        hasCloudEdition = true;
        const data = currentDoc.data();
        latestEdition = {
          title: data.title,
          year: data.year,
          institution: data.institution,
          totalPages: data.totalPages,
          sourceType: data.sourceType,
          fileName: data.fileName,
          updatedAt: 'Synced via Cloud',
        };
        if (latestEdition.sourceType === 'pdf') {
          ensurePagesSub();
        } else if (unsubPages) {
          unsubPages();
          unsubPages = null;
          latestPages = [];
        }
        emitMagazineIfReady();
        emitAudio();
        emitVideo();
      }
    },
    (err) => {
      if (isQuotaExceededError(err)) cleanupAll();
      handleFirestoreError(err, OperationType.LIST, 'magazine_edition');
    }
  );

  unsubAudio = onSnapshot(
    query(collection(db, 'audio_tracks'), where('isPublic', '==', true)),
    (snap) => {
      latestAudio = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: data.id,
          title: data.title,
          englishSubtitle: data.englishSubtitle,
          author: data.author,
          category: data.category,
          language: data.language,
          duration: data.duration,
          durationSeconds: data.durationSeconds,
          publishedDate: data.publishedDate,
          description: data.description,
          coverImage: data.coverImage,
          audioUrl: data.audioUrl,
          createdByUid: data.createdByUid,
        } as AudioTrack;
      });
      emitAudio();
    },
    (err) => {
      if (isQuotaExceededError(err)) cleanupAll();
      handleFirestoreError(err, OperationType.LIST, 'audio_tracks');
    }
  );

  unsubVideo = onSnapshot(
    query(collection(db, 'video_items'), where('isPublic', '==', true)),
    (snap) => {
      latestVideo = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: data.id,
          title: data.title,
          dateStr: data.dateStr,
          category: data.category,
          duration: data.duration,
          durationSeconds: data.durationSeconds,
          image: data.image,
          imageAlt: data.imageAlt,
          isFeatured: data.isFeatured,
          tagline: data.tagline,
          description: data.description,
          videoUrl: data.videoUrl,
          createdByUid: data.createdByUid,
        } as VideoItem;
      });
      emitVideo();
    },
    (err) => {
      if (isQuotaExceededError(err)) cleanupAll();
      handleFirestoreError(err, OperationType.LIST, 'video_items');
    }
  );

  return () => {
    cleanupAll();
  };
}

export async function ensureInitialCloudSeed(
  _tracks: AudioTrack[],
  _videos: VideoItem[],
  _edition: MagazineEditionInfo
): Promise<void> {
  // No-op to conserve quota
}

export async function createCloudAudioTrack(track: AudioTrack): Promise<void> {
  if (isCloudQuotaReached()) return;
  const { docId, payload } = buildAudioPayload(track, getCurrentUid(), false);
  try {
    await setDoc(doc(db, 'audio_tracks', docId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `audio_tracks/${docId}`);
  }
}

export async function updateCloudAudioTrack(track: AudioTrack): Promise<void> {
  if (isCloudQuotaReached()) return;
  const uid = getCurrentUid();
  const { docId, payload } = buildAudioPayload(track, uid, true);
  try {
    await updateDoc(doc(db, 'audio_tracks', docId), payload);
  } catch {
    if (isCloudQuotaReached()) return;
    try {
      await deleteDoc(doc(db, 'audio_tracks', docId)).catch(() => {});
      const fresh = buildAudioPayload({ ...track, createdByUid: uid }, uid, false);
      await setDoc(doc(db, 'audio_tracks', docId), fresh.payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `audio_tracks/${docId}`);
    }
  }
}

export async function deleteCloudAudioTrack(
  id: string,
  audioUrl?: string,
  remainingTracks?: AudioTrack[]
): Promise<void> {
  if (isCloudQuotaReached()) return;
  const docId = sanitizeId(id);
  const uid = getCurrentUid();
  try {
    if (remainingTracks) {
      const snap = await getDocs(query(collection(db, 'audio_tracks'), where('isPublic', '==', true)));
      if (snap.empty && !snap.metadata.fromCache && remainingTracks.length > 0) {
        const batch = writeBatch(db);
        for (const t of remainingTracks) {
          const { docId: tid, payload } = buildAudioPayload(t, uid, false);
          batch.set(doc(db, 'audio_tracks', tid), payload);
        }
        await batch.commit();
      }
    }
    await deleteDoc(doc(db, 'audio_tracks', docId));
    await deleteMediaChunks(audioUrl);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `audio_tracks/${docId}`);
  }
}

export async function createCloudVideoItem(video: VideoItem): Promise<void> {
  if (isCloudQuotaReached()) return;
  const { docId, payload } = buildVideoPayload(video, getCurrentUid(), false);
  try {
    await setDoc(doc(db, 'video_items', docId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `video_items/${docId}`);
  }
}

export async function updateCloudVideoItem(video: VideoItem): Promise<void> {
  if (isCloudQuotaReached()) return;
  const uid = getCurrentUid();
  const { docId, payload } = buildVideoPayload(video, uid, true);
  try {
    await updateDoc(doc(db, 'video_items', docId), payload);
  } catch {
    if (isCloudQuotaReached()) return;
    try {
      await deleteDoc(doc(db, 'video_items', docId)).catch(() => {});
      const fresh = buildVideoPayload({ ...video, createdByUid: uid }, uid, false);
      await setDoc(doc(db, 'video_items', docId), fresh.payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `video_items/${docId}`);
    }
  }
}

export async function deleteCloudVideoItem(
  id: string,
  videoUrl?: string,
  remainingVideos?: VideoItem[]
): Promise<void> {
  if (isCloudQuotaReached()) return;
  const docId = sanitizeId(id);
  const uid = getCurrentUid();
  try {
    if (remainingVideos) {
      const snap = await getDocs(query(collection(db, 'video_items'), where('isPublic', '==', true)));
      if (snap.empty && !snap.metadata.fromCache && remainingVideos.length > 0) {
        const batch = writeBatch(db);
        for (const v of remainingVideos) {
          const { docId: vid, payload } = buildVideoPayload(v, uid, false);
          batch.set(doc(db, 'video_items', vid), payload);
        }
        await batch.commit();
      }
    }
    await deleteDoc(doc(db, 'video_items', docId));
    await deleteMediaChunks(videoUrl);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `video_items/${docId}`);
  }
}

export async function syncMagazineToCloud(
  pages: MagazinePage[],
  edition: MagazineEditionInfo,
  onProgress?: (percent: number) => void
): Promise<void> {
  if (isCloudQuotaReached()) return;
  const uid = getCurrentUid();
  const nowIso = new Date().toISOString();

  try {
    const existingSnap = await getDocs(
      query(collection(db, 'magazine_pages'), where('isPublic', '==', true))
    );
    if (!existingSnap.empty) {
      const batch = writeBatch(db);
      existingSnap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    const editionRef = doc(db, 'magazine_edition', 'current');
    await deleteDoc(editionRef).catch(() => {});

    const editionPayload: Record<string, unknown> = {
      id: 'current',
      title: clampString(edition.title, 200, 'Rithu 2026'),
      year: clampString(edition.year, 20, '2026'),
      institution: clampString(edition.institution, 200, 'College of Engineering Munnar'),
      totalPages: Math.max(1, Math.min(500, pages.length)),
      sourceType: edition.sourceType === 'pdf' ? 'pdf' : 'curated',
      isPublic: true,
      createdByUid: uid,
      editorialKey: EDITORIAL_KEY,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    if (edition.fileName && edition.fileName.trim()) {
      editionPayload.fileName = clampString(edition.fileName, 255);
    }
    await setDoc(editionRef, editionPayload);

    if (edition.sourceType === 'pdf') {
      for (let i = 0; i < pages.length && !isCloudQuotaReached(); i += 4) {
        const chunk = pages.slice(i, i + 4);
        await Promise.all(
          chunk.map(async (p, idx) => {
            const pageIdx = i + idx;
            const pageId = sanitizeId(`page-${pageIdx + 1}`);
            const pagePayload = {
              id: pageId,
              editionId: 'current',
              pageNumber: Math.max(0, Math.min(500, pageIdx)),
              type: ['cover', 'content', 'back-cover'].includes(p.type) ? p.type : 'content',
              title: clampString(p.title, 200, `Page ${pageIdx + 1}`),
              subtitle: clampString(p.subtitle, 200, `PDF Page ${pageIdx + 1} of ${pages.length}`),
              pdfImageUrl: clampString(
                p.pdfImageUrl,
                850000,
                'https://via.placeholder.com/600x800'
              ),
              isPublic: true,
              createdByUid: uid,
              editorialKey: EDITORIAL_KEY,
              createdAt: nowIso,
              updatedAt: nowIso,
            };
            await setDoc(doc(db, 'magazine_pages', pageId), pagePayload);
          })
        );
        if (onProgress) {
          const completed = Math.min(pages.length, i + chunk.length);
          onProgress(Math.round((completed / pages.length) * 100));
        }
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'magazine_edition/current');
  }
}

export async function resetCloudMagazineToDefault(): Promise<void> {
  if (isCloudQuotaReached()) return;
  const uid = getCurrentUid();
  const nowIso = new Date().toISOString();
  try {
    const existingSnap = await getDocs(
      query(collection(db, 'magazine_pages'), where('isPublic', '==', true))
    );
    if (!existingSnap.empty) {
      const batch = writeBatch(db);
      existingSnap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
    const editionRef = doc(db, 'magazine_edition', 'current');
    await deleteDoc(editionRef).catch(() => {});
    await setDoc(editionRef, {
      id: 'current',
      title: clampString(INITIAL_MAGAZINE_EDITION.title, 200),
      year: clampString(INITIAL_MAGAZINE_EDITION.year, 20),
      institution: clampString(INITIAL_MAGAZINE_EDITION.institution, 200),
      totalPages: INITIAL_MAGAZINE_EDITION.totalPages,
      sourceType: 'curated',
      isPublic: true,
      createdByUid: uid,
      editorialKey: EDITORIAL_KEY,
      createdAt: nowIso,
      updatedAt: nowIso,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'magazine_edition/current');
  }
}

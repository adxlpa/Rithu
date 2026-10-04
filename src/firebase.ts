import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setLogLevel,
  disableNetwork,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Silence verbose Firestore backoff/retry errors in browser console when free quota is reached
try {
  setLogLevel('silent');
} catch {
  // Ignore
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signOut, onAuthStateChanged };
export type { User };

let cloudQuotaExhausted = false;

export function isCloudQuotaReached(): boolean {
  return cloudQuotaExhausted;
}

export function markCloudQuotaExhausted(): void {
  if (!cloudQuotaExhausted) {
    cloudQuotaExhausted = true;
    disableNetwork(db).catch(() => {});
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export function isQuotaExceededError(error: unknown): boolean {
  if (!error) return false;
  const msg = error instanceof Error ? error.message : String(error);
  const code = (error as { code?: string })?.code || '';
  return (
    code === 'resource-exhausted' ||
    code === 'unavailable' ||
    msg.includes('resource-exhausted') ||
    msg.includes('Quota exceeded') ||
    msg.includes('Quota limit exceeded') ||
    msg.includes('Free daily') ||
    msg.includes('Using maximum backoff delay') ||
    msg.includes('Could not reach Cloud Firestore backend') ||
    msg.includes('The operation could not be completed') ||
    msg.includes('client is offline')
  );
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  if (isQuotaExceededError(error)) {
    markCloudQuotaExhausted();
    console.warn(
      `[Firestore] Cloud quota or connection limit reached during ${operationType} on ${path}. Operating from local archive.`
    );
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Notice:', JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'magazine_edition', 'current'));
  } catch (error) {
    if (isQuotaExceededError(error)) {
      markCloudQuotaExhausted();
      return;
    }
  }
}
testConnection();

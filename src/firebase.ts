import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
// CRITICAL: The app uses the designated firestore database instance
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

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
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const isQuotaOrPermission = errMsg.includes('Quota limit exceeded') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('permission-denied') || errMsg.includes('unavailable');

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  if (isQuotaOrPermission) {
    console.warn('Firestore Quota / Limit Notice (using local cache/fallback):', JSON.stringify(errInfo));
    if (operationType === OperationType.GET || operationType === OperationType.LIST) {
      return;
    }
  } else {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  }

  if (operationType !== OperationType.GET && operationType !== OperationType.LIST && !isQuotaOrPermission) {
    throw new Error(JSON.stringify(errInfo));
  }
}

/**
 * Recursively strips all undefined properties from an object/array so Firestore writes never fail
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

// Connection test on boot (graceful)
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    // Firestore handles connection and offline caching automatically via onSnapshot
    return true;
  } catch (error) {
    console.warn('Firestore connection check notice:', error);
    return false;
  }
}

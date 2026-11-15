import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc 
} from 'firebase/firestore';
import { db, sanitizeForFirestore } from '../firebase';
import { CreatorRequest } from '../types';

const STORAGE_KEY = 'yui_creator_requests_local';
const CLIENT_TOKEN_KEY = 'yui_request_client_token_v1';
const MY_REQUEST_IDS_KEY = 'yui_my_request_ids_v1';

export function getClientRequestToken(): string {
  try {
    let token = localStorage.getItem(CLIENT_TOKEN_KEY);
    if (!token) {
      token = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem(CLIENT_TOKEN_KEY, token);
    }
    return token;
  } catch {
    return 'usr_guest';
  }
}

export function getMySubmittedRequestIds(): string[] {
  try {
    const raw = localStorage.getItem(MY_REQUEST_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMySubmittedRequestId(id: string) {
  try {
    const ids = getMySubmittedRequestIds();
    if (!ids.includes(id)) {
      localStorage.setItem(MY_REQUEST_IDS_KEY, JSON.stringify([id, ...ids]));
    }
  } catch {}
}

// Helper to get local requests
export function getLocalCreatorRequests(): CreatorRequest[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [];
}

// Helper to save local requests
export function saveLocalCreatorRequests(requests: CreatorRequest[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch (e) {}
}

// Subscribe to Creator Requests
export function subscribeCreatorRequests(
  callback: (requests: CreatorRequest[]) => void,
  onError?: (err: any) => void
): () => void {
  if (!db) {
    callback(getLocalCreatorRequests());
    const handleStorageChange = () => {
      callback(getLocalCreatorRequests());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }

  try {
    const q = query(collection(db, 'creatorRequests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reqs: CreatorRequest[] = [];
        snapshot.forEach((docSnap) => {
          reqs.push({ id: docSnap.id, ...docSnap.data() } as CreatorRequest);
        });
        saveLocalCreatorRequests(reqs);
        callback(reqs);
      },
      (error) => {
        console.warn('Firestore creator requests sync notice:', error);
        if (onError) onError(error);
        callback(getLocalCreatorRequests());
      }
    );
    return unsubscribe;
  } catch (e) {
    console.warn('Firestore not available for creator requests, using localStorage.');
    callback(getLocalCreatorRequests());
    return () => {};
  }
}

// Create new Creator Request
export async function createCreatorRequest(requestData: Omit<CreatorRequest, 'id'>): Promise<string> {
  const clientToken = requestData.clientToken || getClientRequestToken();
  const payload: Omit<CreatorRequest, 'id'> = {
    ...requestData,
    isPrivate: !!requestData.isPrivate,
    clientToken,
  };

  const localId = 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const newReq: CreatorRequest = {
    ...payload,
    id: localId,
  };

  const local = getLocalCreatorRequests();
  saveLocalCreatorRequests([newReq, ...local]);
  saveMySubmittedRequestId(localId);

  if (db) {
    try {
      const sanitized = sanitizeForFirestore(payload);
      const docRef = await addDoc(collection(db, 'creatorRequests'), sanitized);
      saveMySubmittedRequestId(docRef.id);
      return docRef.id;
    } catch (err) {
      console.warn('Failed to save creator request to Firestore, saved locally:', err);
    }
  }
  return localId;
}

// Update Creator Request (Admin/User action)
export async function updateCreatorRequest(id: string, updates: Partial<CreatorRequest>): Promise<void> {
  const local = getLocalCreatorRequests();
  const updated = local.map((r) => (r.id === id ? { ...r, ...updates } : r));
  saveLocalCreatorRequests(updated);

  if (db) {
    try {
      const docRef = doc(db, 'creatorRequests', id);
      await updateDoc(docRef, sanitizeForFirestore(updates));
    } catch (err) {
      console.warn('Failed to update creator request in Firestore:', err);
    }
  }
}

// Delete Creator Request
export async function deleteCreatorRequest(id: string): Promise<void> {
  const local = getLocalCreatorRequests();
  const updated = local.filter((r) => r.id !== id);
  saveLocalCreatorRequests(updated);

  if (db) {
    try {
      await deleteDoc(doc(db, 'creatorRequests', id));
    } catch (err) {
      console.warn('Failed to delete creator request from Firestore:', err);
    }
  }
}


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
import { db } from '../firebase';
import { CreatorRequest } from '../types';

const STORAGE_KEY = 'yui_creator_requests_local';

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
  // If Firestore db is not initialized or fails, fallback to local storage
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
  const newReq: CreatorRequest = {
    ...requestData,
    id: 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
  };

  const local = getLocalCreatorRequests();
  const updated = [newReq, ...local];
  saveLocalCreatorRequests(updated);

  if (db) {
    try {
      const docRef = await addDoc(collection(db, 'creatorRequests'), requestData);
      return docRef.id;
    } catch (err) {
      console.warn('Failed to save creator request to Firestore, saved locally:', err);
    }
  }
  return newReq.id;
}

// Update Creator Request (Admin/User action)
export async function updateCreatorRequest(id: string, updates: Partial<CreatorRequest>): Promise<void> {
  const local = getLocalCreatorRequests();
  const updated = local.map((r) => (r.id === id ? { ...r, ...updates } : r));
  saveLocalCreatorRequests(updated);

  if (db) {
    try {
      // Find doc by id or query
      // In Firestore, if id is doc.id
      const docRef = doc(db, 'creatorRequests', id);
      await updateDoc(docRef, updates);
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

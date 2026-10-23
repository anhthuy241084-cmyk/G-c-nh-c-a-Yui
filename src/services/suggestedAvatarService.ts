import {
  collection,
  addDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

export interface SuggestedAvatar {
  id: string;
  url: string;
  name: string;
  createdAt: string;
}

const STORAGE_KEY = 'yui_suggested_avatars';

export function getSuggestedAvatars(): SuggestedAvatar[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: SuggestedAvatar[] = JSON.parse(raw);
    const cleanList = parsed.filter(
      (item) => item && item.id && !item.id.startsWith('def_')
    );
    return cleanList;
  } catch {
    return [];
  }
}

export function saveSuggestedAvatars(avatars: SuggestedAvatar[]) {
  try {
    const cleanList = avatars.filter(
      (item) => item && item.id && !item.id.startsWith('def_')
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanList));
    window.dispatchEvent(new Event('suggested_avatars_updated'));
  } catch (e) {
    console.error('Error saving suggested avatars locally:', e);
  }
}

/**
 * Subscribe to Suggested Avatars in real time from Firestore (with local fallback)
 */
export function subscribeSuggestedAvatars(
  callback: (avatars: SuggestedAvatar[]) => void,
  onError?: (err: any) => void
): () => void {
  // Always emit cached local avatars first for instant display
  callback(getSuggestedAvatars());

  if (!db) {
    const handleStorageChange = () => {
      callback(getSuggestedAvatars());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('suggested_avatars_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('suggested_avatars_updated', handleStorageChange);
    };
  }

  try {
    const q = query(collection(db, 'suggestedAvatars'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: SuggestedAvatar[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            url: data.url || '',
            name: data.name || '',
            createdAt: data.createdAt || new Date().toISOString(),
          });
        });
        saveSuggestedAvatars(list);
        callback(list);
      },
      (error) => {
        console.warn('Firestore suggested avatars sync notice:', error);
        if (onError) onError(error);
        callback(getSuggestedAvatars());
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Firestore not available for suggested avatars, using localStorage.', err);
    callback(getSuggestedAvatars());
    return () => {};
  }
}

/**
 * Add a new Suggested Avatar (persisted in Firestore and local cache)
 */
export async function addSuggestedAvatar(avatar: Omit<SuggestedAvatar, 'id'>): Promise<string> {
  const newAvatar: SuggestedAvatar = {
    ...avatar,
    id: 'sugg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
  };

  const current = getSuggestedAvatars();
  saveSuggestedAvatars([newAvatar, ...current]);

  if (db) {
    try {
      const docRef = await addDoc(collection(db, 'suggestedAvatars'), {
        url: avatar.url,
        name: avatar.name,
        createdAt: avatar.createdAt || new Date().toISOString(),
      });
      return docRef.id;
    } catch (err) {
      console.warn('Failed to save suggested avatar to Firestore, cached locally:', err);
    }
  }

  return newAvatar.id;
}

/**
 * Delete a single Suggested Avatar by ID
 */
export async function deleteSuggestedAvatar(id: string): Promise<void> {
  const current = getSuggestedAvatars();
  const updated = current.filter((a) => a.id !== id);
  saveSuggestedAvatars(updated);

  if (db) {
    try {
      await deleteDoc(doc(db, 'suggestedAvatars', id));
    } catch (err) {
      console.warn('Failed to delete suggested avatar from Firestore:', err);
    }
  }
}

/**
 * Clear all Suggested Avatars (Admin action)
 */
export async function clearAllSuggestedAvatars(): Promise<void> {
  saveSuggestedAvatars([]);

  if (db) {
    try {
      const snapshot = await getDocs(collection(db, 'suggestedAvatars'));
      const batch = writeBatch(db);
      snapshot.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
    } catch (err) {
      console.warn('Failed to clear suggested avatars from Firestore:', err);
    }
  }
}

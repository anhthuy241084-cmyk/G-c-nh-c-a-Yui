import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, sanitizeForFirestore } from '../firebase';
import { ContactLink } from '../types';

const CONTACTS_COLLECTION = 'contacts';
const LOCAL_STORAGE_KEY = 'yui_contact_links_v1';

const DEFAULT_CONTACTS: ContactLink[] = [
  {
    id: 'contact-fb',
    label: 'Page Facebook',
    value: 'https://www.facebook.com/share/1972M3jcZv/',
    display: 'www.facebook.com/share/1972M3jcZv/',
    iconType: 'facebook',
    displayOrder: 0,
    createdAt: new Date().toISOString(),
  },
];

function isAllowedContact(c: ContactLink): boolean {
  const label = (c.label || '').toLowerCase();
  const value = (c.value || '').toLowerCase();
  return c.iconType !== 'ngl' && !label.includes('ngl') && !label.includes('ẩn danh') && !value.includes('ngl.link');
}

export function getLocalContacts(): ContactLink[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter(isAllowedContact);
        if (filtered.length > 0) return filtered;
      }
    }
  } catch (e) {
    console.warn('Could not read local contacts:', e);
  }
  return DEFAULT_CONTACTS;
}

export function saveLocalContacts(contacts: ContactLink[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(contacts.filter(isAllowedContact)));
  } catch (e) {
    console.warn('Could not save local contacts:', e);
  }
}

/**
 * Subscribe to contacts in real-time from Firestore
 */
export function subscribeContacts(
  onData: (contacts: ContactLink[]) => void,
  onError?: (error: unknown) => void
): () => void {
  try {
    const colRef = collection(db, CONTACTS_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: ContactLink[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const item: ContactLink = {
              id: docSnap.id,
              label: data.label || '',
              value: data.value || '',
              display: data.display || data.value || '',
              iconType: data.iconType || 'other',
              imageUrl: data.imageUrl || '',
              displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : 0,
              createdAt: data.createdAt || new Date().toISOString(),
            };
            if (isAllowedContact(item)) {
              list.push(item);
            }
          });

          list.sort((a, b) => (a.displayOrder - b.displayOrder) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          saveLocalContacts(list);
          onData(list.length > 0 ? list : DEFAULT_CONTACTS);
        } else {
          const localList = getLocalContacts();
          onData(localList);
        }
      },
      (error) => {
        console.warn('Firestore contacts subscription error, fallback to local:', error);
        if (onError) onError(error);
        onData(getLocalContacts());
      }
    );
  } catch (e) {
    console.warn('Error initiating contacts listener:', e);
    if (onError) onError(e);
    onData(getLocalContacts());
    return () => {};
  }
}

/**
 * Create or Update a contact in Firestore
 */
export async function saveContactToFirestore(contact: ContactLink): Promise<void> {
  const localList = getLocalContacts();
  const existingIdx = localList.findIndex((c) => c.id === contact.id);
  let updatedLocal: ContactLink[];
  if (existingIdx >= 0) {
    updatedLocal = [...localList];
    updatedLocal[existingIdx] = contact;
  } else {
    updatedLocal = [...localList, contact];
  }
  saveLocalContacts(updatedLocal);

  try {
    const docRef = doc(db, CONTACTS_COLLECTION, contact.id);
    const sanitized = sanitizeForFirestore(contact);
    await setDoc(docRef, sanitized, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `contacts/${contact.id}`);
  }
}

/**
 * Delete a contact from Firestore
 */
export async function deleteContactFromFirestore(contactId: string): Promise<void> {
  const localList = getLocalContacts().filter((c) => c.id !== contactId);
  saveLocalContacts(localList);

  try {
    const docRef = doc(db, CONTACTS_COLLECTION, contactId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `contacts/${contactId}`);
  }
}

/**
 * Batch update contacts order
 */
export async function reorderContactsInFirestore(orderedContacts: ContactLink[]): Promise<void> {
  saveLocalContacts(orderedContacts);

  try {
    const batch = writeBatch(db);
    orderedContacts.forEach((c, index) => {
      const docRef = doc(db, CONTACTS_COLLECTION, c.id);
      batch.update(docRef, { displayOrder: index });
    });
    await batch.commit();
  } catch (error) {
    console.warn('Batch order update error for contacts in Firestore:', error);
  }
}

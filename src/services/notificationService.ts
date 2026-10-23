import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, sanitizeForFirestore } from '../firebase';
import { AppNotification } from '../types';

const COLLECTION_NAME = 'notifications';

export function subscribeNotifications(
  initialFallback: AppNotification[],
  onUpdate: (notifications: AppNotification[]) => void,
  onError?: (error: unknown) => void
) {
  const notifsCol = collection(db, COLLECTION_NAME);

  return onSnapshot(
    notifsCol,
    async (snapshot) => {
      if (snapshot.empty) {
        // Auto-seed initial fallback notifications
        try {
          for (const item of initialFallback) {
            const sanitized = sanitizeForFirestore(item);
            await setDoc(doc(db, COLLECTION_NAME, item.id), sanitized, { merge: true });
          }
        } catch (err) {
          console.warn('Could not auto-seed notifications:', err);
        }
        onUpdate(initialFallback);
        return;
      }

      const list: AppNotification[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as AppNotification);
      });
      // Sort newest first
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
      if (onError) onError(error);
    }
  );
}

export async function addNotificationToFirestore(notification: AppNotification): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, notification.id);
  const sanitized = sanitizeForFirestore(notification);
  try {
    await setDoc(docRef, sanitized, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${notification.id}`);
  }
}

export async function markNotificationAsReadInFirestore(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  try {
    await setDoc(docRef, { isRead: true }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}

export async function deleteNotificationFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}

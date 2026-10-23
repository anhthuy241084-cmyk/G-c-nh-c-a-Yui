import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  increment,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, sanitizeForFirestore } from '../firebase';
import { BoardNote } from '../types';

const COLLECTION_NAME = 'boardNotes';

export function subscribeBoardNotes(
  onUpdate: (notes: BoardNote[]) => void,
  onError?: (error: unknown) => void
) {
  const notesCol = collection(db, COLLECTION_NAME);

  return onSnapshot(
    notesCol,
    (snapshot) => {
      const list: BoardNote[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as BoardNote);
      });
      // Sort by creation time descending (newest first)
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
      if (onError) onError(error);
    }
  );
}

export async function addBoardNoteToFirestore(note: BoardNote): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, note.id);
  const sanitized = sanitizeForFirestore(note);
  try {
    await setDoc(docRef, sanitized, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${note.id}`);
  }
}

export async function likeBoardNoteInFirestore(noteId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, noteId);
  try {
    await setDoc(
      docRef,
      {
        likes: increment(1),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${noteId}`);
  }
}

export async function updateBoardNoteInFirestore(
  noteId: string,
  partial: Partial<BoardNote>
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, noteId);
  const sanitized = sanitizeForFirestore(partial);
  try {
    await setDoc(docRef, sanitized, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${noteId}`);
  }
}

export async function deleteBoardNoteFromFirestore(noteId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, noteId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${noteId}`);
  }
}

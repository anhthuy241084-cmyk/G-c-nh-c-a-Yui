import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError, sanitizeForFirestore } from '../firebase';
import { MemoryGalleryPost, MemoryGalleryReply } from '../types';

const COLLECTION_NAME = 'memoryGalleryPosts';

export function subscribeMemoryGalleryPosts(
  onUpdate: (posts: MemoryGalleryPost[]) => void,
  onError?: (error: unknown) => void
) {
  return onSnapshot(
    collection(db, COLLECTION_NAME),
    (snapshot) => {
      const list = snapshot.docs.map(
        (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as MemoryGalleryPost)
      );
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
      } catch (err) {
        if (onError) onError(err);
        return;
      }
      if (onError) onError(error);
    }
  );
}

export async function saveMemoryGalleryPost(post: MemoryGalleryPost): Promise<void> {
  try {
    const sanitized = sanitizeForFirestore(post);
    await setDoc(doc(db, COLLECTION_NAME, post.id), sanitized, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${post.id}`);
  }
}

export async function deleteMemoryGalleryPost(postId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, postId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${postId}`);
  }
}

export async function likeMemoryGalleryPost(postId: string): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, postId), {
      likes: increment(1),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${postId}`);
  }
}

export async function addReplyToMemoryGalleryPost(
  postId: string,
  reply: MemoryGalleryReply
): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, postId), {
      replies: arrayUnion(sanitizeForFirestore(reply)),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${postId}/replies`);
  }
}

export async function deleteReplyFromMemoryGalleryPost(
  postId: string,
  reply: MemoryGalleryReply
): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, postId), {
      replies: arrayRemove(sanitizeForFirestore(reply)),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${postId}/replies`);
  }
}

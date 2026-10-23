import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  getDoc,
  increment,
  arrayUnion,
  arrayRemove,
  onSnapshot
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError, sanitizeForFirestore } from '../firebase';
import { Character, CharacterComment } from '../types';

const COLLECTION_NAME = 'characters';

export function subscribeCharacters(onUpdate: (chars: Character[]) => void, onError: (err: any) => void) {
  return onSnapshot(collection(db, COLLECTION_NAME), (snapshot) => {
    const chars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Character));
    onUpdate(chars);
  }, onError);
}

export async function saveCharacterToFirestore(character: Character): Promise<void> {
  try {
    const sanitizedData = sanitizeForFirestore(character);
    await setDoc(doc(db, COLLECTION_NAME, character.id), sanitizedData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${character.id}`);
  }
}

export async function deleteCharacterFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}

export async function voteCharacterInFirestore(characterId: string): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, characterId), {
      votes: increment(1)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${characterId}`);
  }
}

export async function resetAllCharacterVotesInFirestore(characters: Character[]): Promise<void> {
  try {
    for (const char of characters) {
      await updateDoc(doc(db, COLLECTION_NAME, char.id), {
        votes: 0,
        likes: 0
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, COLLECTION_NAME);
  }
}

export async function addCommentToCharacterInFirestore(characterId: string, comment: CharacterComment, existingComments: CharacterComment[]): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, characterId), {
      comments: arrayUnion(sanitizeForFirestore(comment))
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${characterId}/comments`);
  }
}

export async function deleteCommentFromCharacterInFirestore(characterId: string, commentId: string, existingComments: CharacterComment[]): Promise<void> {
  try {
    const commentToDelete = existingComments.find(c => c.id === commentId);
    if (!commentToDelete) return;
    await updateDoc(doc(db, COLLECTION_NAME, characterId), {
      comments: arrayRemove(sanitizeForFirestore(commentToDelete))
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${characterId}/comments`);
  }
}

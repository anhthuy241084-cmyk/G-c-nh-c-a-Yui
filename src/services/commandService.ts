import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, sanitizeForFirestore } from '../firebase';
import { PromptCommand } from '../types';

const COMMANDS_COLLECTION = 'commands';
const LOCAL_STORAGE_KEY = 'yui_prompt_commands_v1';

export function getLocalCommands(): PromptCommand[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read local commands:', e);
  }
  return [];
}

export function saveLocalCommands(commands: PromptCommand[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(commands));
  } catch (e) {
    console.warn('Could not save local commands:', e);
  }
}

/**
 * Subscribe to commands in real-time from Firestore
 */
export function subscribeCommands(
  onData: (commands: PromptCommand[]) => void,
  onError?: (error: unknown) => void
): () => void {
  try {
    const colRef = collection(db, COMMANDS_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: PromptCommand[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              name: data.name || '',
              description: data.description || '',
              content: data.content || '',
              category: data.category || 'Chung',
              tags: Array.isArray(data.tags) ? data.tags : [],
              color: data.color || '#FCE8F0',
              decoration: data.decoration || '♡',
              displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : 0,
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt,
            });
          });

          // Sort by displayOrder ascending, then createdAt descending
          list.sort((a, b) => (a.displayOrder - b.displayOrder) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          saveLocalCommands(list);
          onData(list);
        } else {
          // If Firestore is empty, check localStorage
          const localList = getLocalCommands();
          onData(localList);
        }
      },
      (error) => {
        console.warn('Firestore commands subscription error, fallback to local:', error);
        if (onError) onError(error);
        onData(getLocalCommands());
      }
    );
  } catch (e) {
    console.warn('Error initiating commands listener:', e);
    if (onError) onError(e);
    onData(getLocalCommands());
    return () => {};
  }
}

/**
 * Create or Update a command in Firestore
 */
export async function saveCommandToFirestore(command: PromptCommand): Promise<void> {
  const localList = getLocalCommands();
  const existingIdx = localList.findIndex((c) => c.id === command.id);
  let updatedLocal: PromptCommand[];
  if (existingIdx >= 0) {
    updatedLocal = [...localList];
    updatedLocal[existingIdx] = command;
  } else {
    updatedLocal = [...localList, command];
  }
  saveLocalCommands(updatedLocal);

  try {
    const docRef = doc(db, COMMANDS_COLLECTION, command.id);
    const sanitized = sanitizeForFirestore(command);
    await setDoc(docRef, sanitized, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `commands/${command.id}`);
  }
}

/**
 * Delete a command from Firestore
 */
export async function deleteCommandFromFirestore(commandId: string): Promise<void> {
  const localList = getLocalCommands().filter((c) => c.id !== commandId);
  saveLocalCommands(localList);

  try {
    const docRef = doc(db, COMMANDS_COLLECTION, commandId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `commands/${commandId}`);
  }
}

/**
 * Batch update commands order
 */
export async function updateCommandsOrderInFirestore(orderedCommands: PromptCommand[]): Promise<void> {
  saveLocalCommands(orderedCommands);

  try {
    const batch = writeBatch(db);
    orderedCommands.forEach((cmd, index) => {
      const docRef = doc(db, COMMANDS_COLLECTION, cmd.id);
      batch.update(docRef, { displayOrder: index });
    });
    await batch.commit();
  } catch (error) {
    console.warn('Batch order update error in Firestore:', error);
  }
}

export const reorderCommandsInFirestore = updateCommandsOrderInFirestore;

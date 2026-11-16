import {
  collection,
  doc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { SecretLetter, SecretLetterChunk, SecretLetterMood } from '../types';

const COLLECTION_NAME = 'secretLetters';
const COOLDOWN_KEY = 'yui_secret_letter_last_sent_at';
const COOLDOWN_MS = 5000; // 5-second gentle anti-double-submit guard
const CHUNK_CHAR_LIMIT = 180000; // Safe chunk size well below Firestore 1MB doc limit even for 4-byte UTF-8

export interface CreateSecretLetterInput {
  title?: string;
  penName?: string;
  mood: SecretLetterMood;
  content: string;
}

export function getSecretLetterCooldownRemainingMs(): number {
  try {
    const raw = localStorage.getItem(COOLDOWN_KEY);
    if (!raw) return 0;
    const last = parseInt(raw, 10);
    if (Number.isNaN(last)) return 0;
    const diff = Date.now() - last;
    return diff < COOLDOWN_MS ? COOLDOWN_MS - diff : 0;
  } catch {
    return 0;
  }
}

export function toSecretLetterDate(val: any): Date {
  if (!val) return new Date(0);
  if (val instanceof Timestamp) return val.toDate();
  if (typeof val?.toDate === 'function') return val.toDate();
  if (typeof val?.seconds === 'number') return new Date(val.seconds * 1000);
  const parsed = new Date(val);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

/**
 * Submit an anonymous unlimited-length secret letter (write-only for visitors; strictly admin-readable)
 */
export async function submitSecretLetter(input: CreateSecretLetterInput): Promise<string> {
  const remaining = getSecretLetterCooldownRemainingMs();
  if (remaining > 0) {
    throw new Error(`COOLDOWN:${Math.ceil(remaining / 1000)}`);
  }

  const rawContent = input.content ?? '';
  if (!rawContent.trim()) {
    throw new Error('EMPTY_CONTENT');
  }

  const title = (input.title || '').trim().slice(0, 300);
  const penName = (input.penName || '').trim().slice(0, 120) || 'Ẩn danh';
  const mood: SecretLetterMood = input.mood || 'confession';

  const totalLength = rawContent.length;
  const firstSegment = rawContent.slice(0, CHUNK_CHAR_LIMIT);
  const overflowSegments: string[] = [];

  for (let offset = CHUNK_CHAR_LIMIT; offset < rawContent.length; offset += CHUNK_CHAR_LIMIT) {
    overflowSegments.push(rawContent.slice(offset, offset + CHUNK_CHAR_LIMIT));
  }

  const letterId = `sl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const letterRef = doc(db, COLLECTION_NAME, letterId);

  const batch = writeBatch(db);
  batch.set(letterRef, {
    id: letterId,
    title,
    penName,
    mood,
    content: firstSegment,
    chunkCount: overflowSegments.length,
    totalLength,
    isRead: false,
    isStarred: false,
    adminNote: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  overflowSegments.forEach((segment, idx) => {
    const chunkId = `chunk_${String(idx).padStart(4, '0')}`;
    const chunkRef = doc(db, COLLECTION_NAME, letterId, 'chunks', chunkId);
    batch.set(chunkRef, {
      index: idx,
      text: segment,
      createdAt: serverTimestamp(),
    });
  });

  try {
    await batch.commit();
    try {
      localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
    } catch {
      // ignore storage quota
    }
    return letterId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${letterId}`);
    throw error;
  }
}

/**
 * Subscribe to all secret letters (ONLY invoke when authenticated as verified owner admin)
 */
export function subscribeSecretLetters(
  onUpdate: (letters: SecretLetter[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const letters: SecretLetter[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as SecretLetter;
        letters.push({
          ...data,
          id: docSnap.id,
        });
      });
      onUpdate(letters);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      if (onError) onError(error);
    }
  );
}

/**
 * Fetch complete content including overflow chunks if the letter exceeded one Firestore document
 */
export async function fetchSecretLetterFullContent(letter: SecretLetter): Promise<string> {
  if (!letter.chunkCount || letter.chunkCount <= 0) {
    return letter.content || '';
  }

  const chunksPath = `${COLLECTION_NAME}/${letter.id}/chunks`;
  try {
    const q = query(collection(db, COLLECTION_NAME, letter.id, 'chunks'), orderBy('index', 'asc'));
    const snap = await getDocs(q);
    const chunks: SecretLetterChunk[] = [];
    snap.forEach((d) => {
      chunks.push(d.data() as SecretLetterChunk);
    });
    chunks.sort((a, b) => a.index - b.index);
    return (letter.content || '') + chunks.map((c) => c.text).join('');
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, chunksPath);
    throw error;
  }
}

/**
 * Update read/starred state or admin note (Owner admin only)
 */
export async function updateSecretLetterAdmin(
  letterId: string,
  updates: Partial<Pick<SecretLetter, 'isRead' | 'isStarred' | 'adminNote'>>
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, letterId);
  const safeUpdates: Record<string, any> = {
    updatedAt: serverTimestamp(),
  };
  if (typeof updates.isRead === 'boolean') safeUpdates.isRead = updates.isRead;
  if (typeof updates.isStarred === 'boolean') safeUpdates.isStarred = updates.isStarred;
  if (typeof updates.adminNote === 'string') {
    safeUpdates.adminNote = updates.adminNote.slice(0, 5000);
  }

  try {
    await updateDoc(docRef, safeUpdates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${letterId}`);
    throw error;
  }
}

/**
 * Delete a secret letter and any overflow chunks (Owner admin only)
 */
export async function deleteSecretLetterAdmin(letter: SecretLetter): Promise<void> {
  const letterRef = doc(db, COLLECTION_NAME, letter.id);
  try {
    const batch = writeBatch(db);
    if (letter.chunkCount > 0) {
      const chunkSnap = await getDocs(collection(db, COLLECTION_NAME, letter.id, 'chunks'));
      chunkSnap.forEach((d) => batch.delete(d.ref));
    }
    batch.delete(letterRef);
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${letter.id}`);
    throw error;
  }
}

export function downloadSecretLetterAsTxt(letter: SecretLetter, fullContent: string): void {
  const date = toSecretLetterDate(letter.createdAt);
  const dateText = date.getTime() > 0 ? date.toLocaleString('vi-VN') : 'Không rõ thời gian';
  const header = [
    `Tiêu đề: ${letter.title || '(Không tiêu đề)'}`,
    `Bút danh: ${letter.penName || 'Ẩn danh'}`,
    `Ngày gửi: ${dateText}`,
    `Độ dài: ${(letter.totalLength || fullContent.length).toLocaleString('vi-VN')} ký tự`,
    '----------------------------------------',
    '',
  ].join('\n');

  const blob = new Blob([header + fullContent], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tam-thu-dem-tuyet-${letter.id}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportSecretLettersToCsv(letters: SecretLetter[]): void {
  const escapeCell = (val: string) => `"${String(val ?? '').replace(/"/g, '""')}"`;

  const headers = [
    'ID',
    'Ngày gửi',
    'Bút danh',
    'Chủ đề',
    'Tiêu đề',
    'Số ký tự',
    'Nội dung (phần đầu nếu quá dài)',
    'Đã đọc',
    'Đã ghim sao',
    'Ghi chú riêng của Yui',
  ];

  const rows = letters.map((l) => {
    const d = toSecretLetterDate(l.createdAt);
    const dateText = d.getTime() > 0 ? d.toLocaleString('vi-VN') : '';
    return [
      l.id,
      dateText,
      l.penName || 'Ẩn danh',
      l.mood,
      l.title || '',
      String(l.totalLength || l.content?.length || 0),
      l.content || '',
      l.isRead ? 'Đã đọc' : 'Chưa đọc',
      l.isStarred ? 'Có' : 'Không',
      l.adminNote || '',
    ]
      .map(escapeCell)
      .join(',');
  });

  const csvContent = '\uFEFF' + [headers.map(escapeCell).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tam-thu-dem-tuyet-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

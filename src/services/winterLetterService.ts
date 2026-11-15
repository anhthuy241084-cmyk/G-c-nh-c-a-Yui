import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { WinterContactMethod, WinterLetter } from '../types';

const COLLECTION_NAME = 'winterLetters';
const COOLDOWN_KEY = 'yui_winter_letter_last_sent_at';
const COOLDOWN_MS = 15000; // 15 seconds anti-spam cooldown

export interface CreateWinterLetterInput {
  senderName: string;
  preferredDisplayName?: string;
  donateNote?: string;
  contactMethod: WinterContactMethod;
  contactPlatformName?: string;
  contactValue?: string;
  message?: string;
  allowContactThanks: boolean;
  silentGift: boolean;
  hideIdentity: boolean;
  allowPublicNickname: boolean;
}

export function getWinterLetterCooldownRemainingMs(): number {
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

export function toDateFromFirestore(val: any): Date {
  if (!val) return new Date(0);
  if (val instanceof Timestamp) return val.toDate();
  if (typeof val?.toDate === 'function') return val.toDate();
  if (typeof val?.seconds === 'number') return new Date(val.seconds * 1000);
  const parsed = new Date(val);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

/**
 * Submit a new winter letter from public visitor (write-only for visitors; zero public reads)
 */
export async function submitWinterLetter(input: CreateWinterLetterInput): Promise<string> {
  const remaining = getWinterLetterCooldownRemainingMs();
  if (remaining > 0) {
    throw new Error(`COOLDOWN:${Math.ceil(remaining / 1000)}`);
  }

  const senderName = (input.senderName || '').trim().slice(0, 80);
  if (!senderName) {
    throw new Error('MISSING_SENDER_NAME');
  }

  const contactMethod: WinterContactMethod = input.contactMethod || 'none';
  const contactPlatformName =
    contactMethod === 'other' ? (input.contactPlatformName || '').trim().slice(0, 60) : '';
  const contactValue =
    contactMethod !== 'none' ? (input.contactValue || '').trim().slice(0, 200) : '';

  if (input.allowContactThanks && (contactMethod === 'none' || !contactValue)) {
    throw new Error('MISSING_CONTACT_FOR_THANKS');
  }

  const letterId = `wl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const docRef = doc(db, COLLECTION_NAME, letterId);

  const payload = {
    id: letterId,
    senderName,
    preferredDisplayName: (input.preferredDisplayName || '').trim().slice(0, 80),
    donateNote: (input.donateNote || '').trim().slice(0, 160),
    contactMethod,
    contactPlatformName,
    contactValue,
    message: (input.message || '').trim().slice(0, 10000),
    allowContactThanks: Boolean(input.allowContactThanks),
    silentGift: Boolean(input.silentGift),
    hideIdentity: Boolean(input.hideIdentity),
    allowPublicNickname: Boolean(input.allowPublicNickname),
    isRead: false,
    isThanked: false,
    internalNote: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(docRef, payload);
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
 * Subscribe to all winter letters (ONLY invoke when authenticated as verified owner admin)
 */
export function subscribeWinterLetters(
  onUpdate: (letters: WinterLetter[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const letters: WinterLetter[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as WinterLetter;
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
 * Update read/thanked status or internal note (Owner admin only)
 */
export async function updateWinterLetterAdmin(
  letterId: string,
  updates: Partial<Pick<WinterLetter, 'isRead' | 'isThanked' | 'internalNote'>>
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, letterId);
  const safeUpdates: Record<string, any> = {
    updatedAt: serverTimestamp(),
  };
  if (typeof updates.isRead === 'boolean') safeUpdates.isRead = updates.isRead;
  if (typeof updates.isThanked === 'boolean') safeUpdates.isThanked = updates.isThanked;
  if (typeof updates.internalNote === 'string') {
    safeUpdates.internalNote = updates.internalNote.slice(0, 2000);
  }

  try {
    await updateDoc(docRef, safeUpdates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${letterId}`);
    throw error;
  }
}

/**
 * Delete a winter letter (Owner admin only)
 */
export async function deleteWinterLetterAdmin(letterId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, letterId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${letterId}`);
    throw error;
  }
}

/**
 * Export letters list as UTF-8 BOM CSV for Excel compatibility
 */
export function exportWinterLettersToCsv(letters: WinterLetter[]): void {
  const escapeCell = (val: string) => {
    const safe = String(val ?? '').replace(/"/g, '""');
    return `"${safe}"`;
  };

  const headers = [
    'ID',
    'Ngày gửi',
    'Tên / Biệt danh',
    'Tên hiển thị mong muốn',
    'Thông tin donate',
    'Phương thức liên hệ',
    'Nền tảng khác',
    'Thông tin liên hệ',
    'Lời nhắn',
    'Có thể liên hệ cảm ơn',
    'Gửi âm thầm',
    'Không công khai danh tính',
    'Đồng ý nhắc biệt danh',
    'Đã đọc',
    'Đã liên hệ cảm ơn',
    'Ghi chú nội bộ',
  ];

  const rows = letters.map((l) => {
    const date = toDateFromFirestore(l.createdAt);
    const formattedDate =
      date.getTime() > 0 ? date.toLocaleString('vi-VN') : '';
    return [
      l.id,
      formattedDate,
      l.senderName,
      l.preferredDisplayName || '',
      l.donateNote || '',
      l.contactMethod,
      l.contactPlatformName || '',
      l.contactValue || '',
      l.message || '',
      l.allowContactThanks ? 'Có' : 'Không',
      l.silentGift ? 'Có' : 'Không',
      l.hideIdentity ? 'Có' : 'Không',
      l.allowPublicNickname ? 'Có' : 'Không',
      l.isRead ? 'Đã đọc' : 'Chưa đọc',
      l.isThanked ? 'Đã cảm ơn' : 'Chưa',
      l.internalNote || '',
    ]
      .map(escapeCell)
      .join(',');
  });

  const csvContent = '\uFEFF' + [headers.map(escapeCell).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `hom-thu-mua-dong-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

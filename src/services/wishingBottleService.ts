import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  increment,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, sanitizeForFirestore } from '../firebase';
import { WishingBottle } from '../types';

const WISHING_BOTTLES_COLLECTION = 'wishingBottles';

export const SEED_WISHING_BOTTLES: WishingBottle[] = [
  {
    id: 'bottle_seed_1',
    author: 'Người Giữ Đèn Hải Đăng',
    message: 'Mong rằng những ngày tháng sắp tới của bạn sẽ êm đềm như một buổi hoàng hôn trên biển, dẫu có sóng gió thì bến đỗ bình yên vẫn luôn chờ đón bạn.',
    bottleStyle: 'crystal',
    seal: 'star',
    tag: 'Chữa lành',
    hearts: 18,
    fishedCount: 42,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    senderId: 'lighthouse_keeper',
  },
  {
    id: 'bottle_seed_2',
    author: 'Hải Âu Phiêu Lãng',
    message: 'Gửi một chút can đảm đến người đang đọc được dòng này: Bạn đã làm rất tốt rồi, hãy tự thưởng cho mình một tách trà ấm và nụ cười thật tươi nhé! ♡',
    bottleStyle: 'azure',
    seal: 'heart',
    tag: 'Động viên',
    hearts: 25,
    fishedCount: 56,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    senderId: 'seagull_wanderer',
  },
  {
    id: 'bottle_seed_3',
    author: 'Ngọc Trai Biển Sâu',
    message: 'Ước nguyện cho tất cả ước mơ đang ấp ủ trong lòng bạn sẽ sớm nở hoa rực rỡ và lấp lánh như viên ngọc quý dưới ánh bình minh! ✦',
    bottleStyle: 'pearl',
    seal: 'shell',
    tag: 'Ước nguyện',
    hearts: 31,
    fishedCount: 68,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    senderId: 'deep_sea_pearl',
  },
  {
    id: 'bottle_seed_4',
    author: 'Lữ Khách Đêm Trăng',
    message: 'Mỗi khi nhìn lên bầu trời đêm hay ngắm nhìn mặt biển bao la, hãy nhớ rằng luôn có một góc nhỏ dịu êm này sẵn sàng lắng nghe bạn.',
    bottleStyle: 'luminous',
    seal: 'wave',
    tag: 'Tâm sự',
    hearts: 40,
    fishedCount: 89,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    senderId: 'moonlight_traveler',
  },
];

/**
 * 1. Subscribe to all wishing bottles in the ocean stream
 */
export function subscribeWishingBottles(
  onUpdate: (bottles: WishingBottle[]) => void,
  onError?: (error: unknown) => void
) {
  const colRef = collection(db, WISHING_BOTTLES_COLLECTION);

  return onSnapshot(
    colRef,
    async (snapshot) => {
      const list: WishingBottle[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as WishingBottle);
      });

      if (snapshot.empty) {
        // Auto-seed initial bottles
        try {
          for (const bottle of SEED_WISHING_BOTTLES) {
            const docRef = doc(db, WISHING_BOTTLES_COLLECTION, bottle.id);
            await setDoc(docRef, sanitizeForFirestore(bottle), { merge: true });
          }
        } catch (err) {
          console.warn('Could not auto-seed wishing bottles:', err);
        }
        onUpdate(SEED_WISHING_BOTTLES);
        return;
      }

      // Sort by newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, WISHING_BOTTLES_COLLECTION);
      if (onError) onError(error);
    }
  );
}

/**
 * 2. Cast a new Wishing Bottle into the ocean
 */
export async function castWishingBottle(bottle: Omit<WishingBottle, 'id' | 'hearts' | 'fishedCount' | 'createdAt'>): Promise<WishingBottle> {
  const bottleId = 'bottle_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const newBottle: WishingBottle = {
    ...bottle,
    id: bottleId,
    hearts: 0,
    fishedCount: 0,
    createdAt: new Date().toISOString(),
  };

  const docRef = doc(db, WISHING_BOTTLES_COLLECTION, bottleId);
  const sanitized = sanitizeForFirestore(newBottle);

  try {
    await setDoc(docRef, sanitized);
    return newBottle;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${WISHING_BOTTLES_COLLECTION}/${bottleId}`);
    throw error;
  }
}

/**
 * 3. Send a heart / love blessing to a bottle
 */
export async function likeWishingBottle(bottleId: string): Promise<void> {
  const docRef = doc(db, WISHING_BOTTLES_COLLECTION, bottleId);
  try {
    await updateDoc(docRef, {
      hearts: increment(1),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${WISHING_BOTTLES_COLLECTION}/${bottleId}`);
  }
}

/**
 * 4. Increment the fished count of a bottle
 */
export async function recordBottleFished(bottleId: string): Promise<void> {
  const docRef = doc(db, WISHING_BOTTLES_COLLECTION, bottleId);
  try {
    await updateDoc(docRef, {
      fishedCount: increment(1),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${WISHING_BOTTLES_COLLECTION}/${bottleId}`);
  }
}

/**
 * 5. Delete a bottle (Admin or sender)
 */
export async function deleteWishingBottle(bottleId: string): Promise<void> {
  const docRef = doc(db, WISHING_BOTTLES_COLLECTION, bottleId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${WISHING_BOTTLES_COLLECTION}/${bottleId}`);
  }
}

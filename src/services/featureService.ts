import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, sanitizeForFirestore } from '../firebase';
import { Feature, FeatureBoardConfig } from '../types';

const FEATURES_COLLECTION = 'features';
const APP_SETTINGS_COLLECTION = 'appSettings';
const FEATURE_BOARD_CONFIG_DOC = 'featureBoardConfig';

export const DEFAULT_FEATURE_BOARD_CONFIG: FeatureBoardConfig = {
  description: 'Nơi tập hợp toàn bộ các tính năng của website. Hãy khám phá và tìm cho mình một góc nhỏ yêu thích nhé! ♡',
};

export const DEFAULT_FEATURES: Feature[] = [
  {
    id: 'feat_welcome',
    name: 'Lời chào từ Góc nhỏ 🌸',
    description: 'Chào mừng bạn đã ghé thăm thế giới nhỏ xinh đẹp này! Mong bạn tìm thấy sự bình yên tại đây. ♡',
    detailedDescription: 'Xin chào bạn thương! Đây là một góc nhỏ bình yên được mình chăm chút tỉ mỉ, nơi bạn có thể trò chuyện cùng các người bạn ảo đáng yêu, lắng nghe âm thanh nhạc nền thư giãn và cùng chơi mini game ngọt ngào.\nRất vui vì có sự hiện diện của bạn! ୨୧',
    usageGuide: 'Hãy nhấp chuột vào biểu tượng Bảng tổng hợp (hình quyển sổ) trên thanh menu hoặc khám phá xung quanh màn hình để bắt đầu chuyến hành trình ngọt ngào này nhé. ♡',
    tags: ['welcome', 'chaohoi', 'introduction'],
    category: 'Chào hỏi mọi người ✿',
    status: 'new',
    displayOrder: 1,
    isPublic: true,
    decorationStyle: 'flower',
    updateInfo: '20/08/2026 - Chào mừng góc nhỏ chính thức ra mắt!'
  },
  {
    id: 'feat_chat',
    name: 'Góc Trò Chuyện Nhân Vật 💬',
    description: 'Nơi gặp gỡ, trò chuyện và tâm sự cùng người bạn nhân vật AI cực kỳ sống động và ấm áp.',
    detailedDescription: 'Hệ thống nhân vật AI được thiết kế tỉ mỉ với tính cách và tiểu sử riêng biệt. Bạn có thể trò chuyện trực tiếp, chia sẻ niềm vui nỗi buồn, tìm hiểu câu chuyện của họ, hoặc thậm chí thả tim để đánh dấu người bạn nhỏ mình yêu thích nhất.',
    usageGuide: 'Bấm chọn thẻ của nhân vật bất kỳ trên màn hình chính để mở ô cửa sổ trò chuyện và bắt đầu gửi tin nhắn tâm tình nhé. ♡',
    tags: ['chat', 'nhanvat', 'tamsu'],
    category: 'Tính năng chính ୨୧',
    status: 'active',
    displayOrder: 2,
    isPublic: true,
    decorationStyle: 'star'
  },
  {
    id: 'feat_bakery',
    name: 'Tiệm Bánh Ngọt Ngào 🧁',
    description: 'Trở thành thợ làm bánh tài ba, nướng những chiếc bánh cupcake thơm phức và nhận quà bất ngờ!',
    detailedDescription: 'Mini game tiệm bánh giúp bạn thư giãn sau giờ làm việc mệt mỏi. Nhiệm vụ của bạn là nướng chín và trang trí bánh xinh xắn đúng thời gian. Điểm số càng cao sẽ giúp bạn mở khóa các món quà cực hiếm!',
    usageGuide: 'Bấm vào lò nướng hoặc biểu tượng xe bánh trên màn hình chính, cùng nướng bánh và nhận ngay quà xinh xắn. ♡',
    tags: ['game', 'tiembanh', 'cupcake'],
    category: 'Trò chơi & Giải trí ✿',
    status: 'active',
    displayOrder: 3,
    isPublic: true,
    decorationStyle: 'flower'
  },
  {
    id: 'feat_music',
    name: 'Hộp Âm Nhạc & Chuông Gió 🎵',
    description: 'Tận hưởng không gian mộc mạc với 3 bản nhạc nền dịu êm, chuông gió lách cách và tính năng phát nhạc cá nhân.',
    detailedDescription: 'Để chuyến ghé thăm của bạn trọn vẹn nhất, Góc nhỏ mang tới giai điệu BGM nhẹ nhàng, âm thanh chuông gió chữa lành cùng khả năng dán link bài hát bạn thích từ YouTube/SoundCloud để phát trực tiếp mượt mà.',
    usageGuide: 'Tìm bảng điều khiển âm thanh trên thanh công cụ hoặc góc màn hình để tùy chỉnh âm lượng nhạc nền và tiếng chuông gió rung lách cách nhé. ✦',
    tags: ['music', 'nhacnen', 'chuonggio'],
    category: 'Thư giãn & Tiện ích ✦',
    status: 'active',
    displayOrder: 4,
    isPublic: true,
    decorationStyle: 'star'
  },
  {
    id: 'feat_board',
    name: 'Lưu Bút & Bảng Tin Tâm Sự 📝',
    description: 'Gửi gắm lời nhắn gửi đáng yêu, điều ước nhỏ nhoi lên chiếc bảng tin treo tường.',
    detailedDescription: 'Chiếc bảng lưu bút là nơi lưu giữ dấu chân của tất cả bạn thương đã ghé qua. Hãy để lại một mảnh giấy note rực rỡ sắc màu, gửi lời chúc đến mọi người, hoặc thả tim tương tác với mẩu tin nhắn dễ thương khác nha.',
    usageGuide: 'Bấm vào biểu tượng Bảng tin hoặc hòm thư trên màn hình, chọn viết ghi chú mới, chọn màu giấy note yêu thích và nhấn "Gửi đi" nhé! ♡',
    tags: ['board', 'luubut', 'tamsu'],
    category: 'Góc cộng đồng ✿',
    status: 'active',
    displayOrder: 5,
    isPublic: true,
    decorationStyle: 'ribbon'
  }
];

// 1. Subscribe to Features List
export function subscribeFeatures(
  onUpdate: (features: Feature[]) => void,
  onError?: (error: unknown) => void
) {
  const colRef = collection(db, FEATURES_COLLECTION);

  return onSnapshot(
    colRef,
    async (snapshot) => {
      const list: Feature[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Feature);
      });

      if (snapshot.empty) {
        // Auto-seed
        try {
          for (const feat of DEFAULT_FEATURES) {
            const docRef = doc(db, FEATURES_COLLECTION, feat.id);
            await setDoc(docRef, sanitizeForFirestore(feat), { merge: true });
          }
        } catch (err) {
          console.warn('Could not auto-seed default features:', err);
        }
        // Fallback update to immediate default features
        onUpdate(DEFAULT_FEATURES);
        return;
      }

      // Sort by displayOrder ascending
      list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, FEATURES_COLLECTION);
      if (onError) onError(error);
    }
  );
}

// 2. Add / Edit a Feature
export async function saveFeatureToFirestore(feature: Feature): Promise<void> {
  const docRef = doc(db, FEATURES_COLLECTION, feature.id);
  const sanitized = sanitizeForFirestore(feature);
  try {
    await setDoc(docRef, sanitized, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${FEATURES_COLLECTION}/${feature.id}`);
  }
}

// 3. Delete a Feature
export async function deleteFeatureFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, FEATURES_COLLECTION, id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${FEATURES_COLLECTION}/${id}`);
  }
}

// 4. Subscribe to Feature Board configuration description
export function subscribeFeatureBoardConfig(
  onUpdate: (config: FeatureBoardConfig) => void,
  onError?: (error: unknown) => void
) {
  const docRef = doc(db, APP_SETTINGS_COLLECTION, FEATURE_BOARD_CONFIG_DOC);

  return onSnapshot(
    docRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as FeatureBoardConfig);
      } else {
        // Auto-seed
        try {
          const sanitized = sanitizeForFirestore({
            ...DEFAULT_FEATURE_BOARD_CONFIG,
            updatedAt: new Date().toISOString(),
          });
          await setDoc(docRef, sanitized, { merge: true });
        } catch (err) {
          console.warn('Could not auto-seed feature board config:', err);
        }
        onUpdate(DEFAULT_FEATURE_BOARD_CONFIG);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${APP_SETTINGS_COLLECTION}/${FEATURE_BOARD_CONFIG_DOC}`);
      if (onError) onError(error);
    }
  );
}

// 5. Save Feature Board config description
export async function saveFeatureBoardConfigToFirestore(config: FeatureBoardConfig): Promise<void> {
  const docRef = doc(db, APP_SETTINGS_COLLECTION, FEATURE_BOARD_CONFIG_DOC);
  const sanitized = sanitizeForFirestore({
    ...config,
    updatedAt: new Date().toISOString(),
  });
  try {
    await setDoc(docRef, sanitized, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${APP_SETTINGS_COLLECTION}/${FEATURE_BOARD_CONFIG_DOC}`);
  }
}

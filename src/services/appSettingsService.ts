import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, sanitizeForFirestore } from '../firebase';
import { WelcomeLetterConfig, DEFAULT_WELCOME_LETTER, WallpaperConfig, DEFAULT_WALLPAPER_CONFIG, HeroPresentationConfig, DEFAULT_HERO_PRESENTATION } from '../types';
import { saveMediaToIndexedDB, getMediaFromIndexedDB, deleteMediaFromIndexedDB } from '../utils/mediaStore';

const SETTINGS_COLLECTION = 'appSettings';
const WELCOME_LETTER_DOC = 'welcomeLetter';
const WALLPAPER_DOC = 'wallpaperSetting';
const HERO_PRESENTATION_DOC = 'heroPresentation';
const HERO_VIDEO_INDEXEDDB_KEY = 'hero_presentation_video';

// Threshold for Firestore safe document size (500KB)
const MAX_FIRESTORE_DATA_LEN = 500 * 1024;

export function subscribeHeroPresentation(
  fallback: HeroPresentationConfig = DEFAULT_HERO_PRESENTATION,
  onUpdate: (config: HeroPresentationConfig) => void,
  onError?: (error: unknown) => void
) {
  const docRef = doc(db, SETTINGS_COLLECTION, HERO_PRESENTATION_DOC);

  return onSnapshot(
    docRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as any;
        let videoUrl = data.videoUrl ?? fallback.videoUrl;

        // If stored in IndexedDB or videoUrl is empty but videoName is set
        if (!videoUrl || data.isLocalVideo) {
          const cachedVideo = await getMediaFromIndexedDB(HERO_VIDEO_INDEXEDDB_KEY);
          if (cachedVideo) {
            videoUrl = cachedVideo;
          }
        }

        onUpdate({
          isEnabled: data.isEnabled ?? fallback.isEnabled,
          videoUrl: videoUrl,
          videoName: data.videoName ?? fallback.videoName,
          overlayOpacity: data.overlayOpacity ?? fallback.overlayOpacity,
          blendMode: data.blendMode ?? fallback.blendMode,
          blurAmount: data.blurAmount ?? fallback.blurAmount,
          updatedAt: data.updatedAt,
        });
      } else {
        // Check if there is local cached video
        const cachedVideo = await getMediaFromIndexedDB(HERO_VIDEO_INDEXEDDB_KEY);
        if (cachedVideo) {
          onUpdate({
            ...fallback,
            videoUrl: cachedVideo,
          });
        } else {
          onUpdate(fallback);
        }
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${SETTINGS_COLLECTION}/${HERO_PRESENTATION_DOC}`);
      if (onError) onError(error);
    }
  );
}

export async function saveHeroPresentationToFirestore(
  config: HeroPresentationConfig
): Promise<void> {
  const docRef = doc(db, SETTINGS_COLLECTION, HERO_PRESENTATION_DOC);
  
  let firestoreVideoUrl = config.videoUrl || '';
  let isLocalVideo = false;

  // If videoUrl is a large base64 or blob URL (> 500KB)
  if (config.videoUrl && config.videoUrl.length > MAX_FIRESTORE_DATA_LEN) {
    // Save full video data to IndexedDB
    await saveMediaToIndexedDB(HERO_VIDEO_INDEXEDDB_KEY, config.videoUrl);
    isLocalVideo = true;
    firestoreVideoUrl = ''; // Keep Firestore doc well under 1MB limit
  } else if (!config.videoUrl) {
    await deleteMediaFromIndexedDB(HERO_VIDEO_INDEXEDDB_KEY);
  } else if (config.videoUrl.startsWith('http://') || config.videoUrl.startsWith('https://')) {
    // Web URL can be saved directly
    isLocalVideo = false;
  } else if (config.videoUrl) {
    // Also backup to IndexedDB
    await saveMediaToIndexedDB(HERO_VIDEO_INDEXEDDB_KEY, config.videoUrl);
  }

  const sanitized = sanitizeForFirestore({
    isEnabled: config.isEnabled,
    videoUrl: firestoreVideoUrl,
    videoName: config.videoName || '',
    overlayOpacity: config.overlayOpacity ?? 0.4,
    blendMode: config.blendMode || 'screen',
    blurAmount: config.blurAmount ?? 0,
    isLocalVideo: isLocalVideo,
    updatedAt: new Date().toISOString(),
  });

  try {
    await setDoc(docRef, sanitized, { merge: true });
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.UPDATE,
      `${SETTINGS_COLLECTION}/${HERO_PRESENTATION_DOC}`
    );
  }
}


export function subscribeWelcomeLetter(
  fallback: WelcomeLetterConfig,
  onUpdate: (config: WelcomeLetterConfig) => void,
  onError?: (error: unknown) => void
) {
  const docRef = doc(db, SETTINGS_COLLECTION, WELCOME_LETTER_DOC);

  return onSnapshot(
    docRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as WelcomeLetterConfig;
        onUpdate({
          title: data.title || fallback.title,
          greeting: data.greeting || fallback.greeting,
          closing: data.closing || fallback.closing,
          signature: data.signature || fallback.signature,
          updatedAt: data.updatedAt,
        });
      } else {
        // Seed default config
        try {
          const sanitizedFallback = sanitizeForFirestore({
            ...fallback,
            updatedAt: new Date().toISOString(),
          });
          await setDoc(docRef, sanitizedFallback, { merge: true });
        } catch (err) {
          console.warn('Could not auto-seed welcome letter setting:', err);
        }
        onUpdate(fallback);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${SETTINGS_COLLECTION}/${WELCOME_LETTER_DOC}`);
      if (onError) onError(error);
    }
  );
}

export async function saveWelcomeLetterToFirestore(
  config: WelcomeLetterConfig
): Promise<void> {
  const docRef = doc(db, SETTINGS_COLLECTION, WELCOME_LETTER_DOC);
  const sanitized = sanitizeForFirestore({
    ...config,
    updatedAt: new Date().toISOString(),
  });
  try {
    await setDoc(docRef, sanitized, { merge: true });
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.UPDATE,
      `${SETTINGS_COLLECTION}/${WELCOME_LETTER_DOC}`
    );
  }
}

export function subscribeWallpaper(
  fallback: WallpaperConfig,
  onUpdate: (config: WallpaperConfig) => void,
  onError?: (error: unknown) => void
) {
  const docRef = doc(db, SETTINGS_COLLECTION, WALLPAPER_DOC);

  return onSnapshot(
    docRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as WallpaperConfig;
        onUpdate({
          imageUrl: data.imageUrl ?? fallback.imageUrl,
          isCustomEnabled: data.isCustomEnabled ?? fallback.isCustomEnabled,
          opacity: data.opacity ?? fallback.opacity,
          updatedAt: data.updatedAt,
        });
      } else {
        try {
          const sanitizedFallback = sanitizeForFirestore({
            ...fallback,
            updatedAt: new Date().toISOString(),
          });
          await setDoc(docRef, sanitizedFallback, { merge: true });
        } catch (err) {
          console.warn('Could not auto-seed wallpaper setting:', err);
        }
        onUpdate(fallback);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${SETTINGS_COLLECTION}/${WALLPAPER_DOC}`);
      if (onError) onError(error);
    }
  );
}

export async function saveWallpaperToFirestore(
  config: WallpaperConfig
): Promise<void> {
  const docRef = doc(db, SETTINGS_COLLECTION, WALLPAPER_DOC);
  const sanitized = sanitizeForFirestore({
    ...config,
    updatedAt: new Date().toISOString(),
  });
  try {
    await setDoc(docRef, sanitized, { merge: true });
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.UPDATE,
      `${SETTINGS_COLLECTION}/${WALLPAPER_DOC}`
    );
  }
}

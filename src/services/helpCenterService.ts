import {
  doc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, sanitizeForFirestore } from '../firebase';
import { HelpCenterConfig, DEFAULT_HELP_CENTER_CONFIG } from '../types';

const APP_SETTINGS_COLLECTION = 'appSettings';
const HELP_CENTER_CONFIG_DOC = 'helpCenterConfig';

/**
 * Subscribe to the real-time Help Center Handbook configuration.
 */
export function subscribeHelpCenterConfig(
  onUpdate: (config: HelpCenterConfig) => void,
  onError?: (error: unknown) => void
) {
  const docRef = doc(db, APP_SETTINGS_COLLECTION, HELP_CENTER_CONFIG_DOC);

  return onSnapshot(
    docRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as HelpCenterConfig;
        onUpdate({
          ...DEFAULT_HELP_CENTER_CONFIG,
          ...data,
          categories: data.categories && data.categories.length > 0 ? data.categories : DEFAULT_HELP_CENTER_CONFIG.categories,
        });
      } else {
        // Auto-seed initial default config
        try {
          const sanitized = sanitizeForFirestore({
            ...DEFAULT_HELP_CENTER_CONFIG,
            updatedAt: new Date().toISOString(),
          });
          await setDoc(docRef, sanitized, { merge: true });
        } catch (err) {
          console.warn('Could not auto-seed help center config:', err);
        }
        onUpdate(DEFAULT_HELP_CENTER_CONFIG);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${APP_SETTINGS_COLLECTION}/${HELP_CENTER_CONFIG_DOC}`);
      if (onError) onError(error);
    }
  );
}

/**
 * Save updated Help Center config to Firestore (Admin permission).
 */
export async function saveHelpCenterConfigToFirestore(config: HelpCenterConfig): Promise<void> {
  const docRef = doc(db, APP_SETTINGS_COLLECTION, HELP_CENTER_CONFIG_DOC);
  const sanitized = sanitizeForFirestore({
    ...config,
    updatedAt: new Date().toISOString(),
  });
  try {
    await setDoc(docRef, sanitized, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${APP_SETTINGS_COLLECTION}/${HELP_CENTER_CONFIG_DOC}`);
    throw error;
  }
}

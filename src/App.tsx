import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Heart, Sparkles, AlertCircle, BookOpen, MessageSquare, ExternalLink, ShieldCheck, Check, Flame } from 'lucide-react';
import { Character, GenreTag, ThemeMode, AppNotification, AudioSettings, BoardNote, CharacterBookmark, BookmarkPaperStyle, BookmarkTailDecor, MascotSettings, MascotAccessoryId, UserProfile, DEFAULT_USER_PROFILE, Feature, FeatureBoardConfig, PromptCommand, ContactLink, HeroPresentationConfig, DEFAULT_HERO_PRESENTATION, HelpCenterConfig, DEFAULT_HELP_CENTER_CONFIG, WishingBottle } from './types';
import { INITIAL_CHARACTERS } from './data/characters';
import { IntroLoadingScreen } from './components/IntroLoadingScreen';
import { SplashScreen } from './components/SplashScreen';
import { Header } from './components/Header';
import { Bookshelf } from './components/Bookshelf';
import { SearchBar } from './components/SearchBar';
import { CharacterCard } from './components/CharacterCard';
import { CharacterDetailModal } from './components/CharacterDetailModal';
import { ContactModal } from './components/ContactModal';
import { CreatorRequestModal } from './components/CreatorRequestModal';
import { VotingModal } from './components/VotingModal';
import { AdminModal } from './components/AdminModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { NotificationModal } from './components/NotificationModal';
import { PasswordPromptModal } from './components/PasswordPromptModal';
import { LittleDoor } from './components/LittleDoor';
import { CustomLoadingScreen } from './components/CustomLoadingScreen';
import { EmptyState } from './components/EmptyState';
import { StreakModal } from './components/StreakModal';
import { MessageBoardModal } from './components/MessageBoardModal';
import { RandomCharacterModal } from './components/RandomCharacterModal';
import { AudioSettingsModal } from './components/AudioSettingsModal';
import { BakeryGameModal } from './components/BakeryGameModal';
import { CommandLibraryModal } from './components/CommandLibraryModal';
import { OceanFortuneModal } from './components/OceanFortuneModal';
import { HelpCenterModal } from './components/HelpCenterModal';
import { WishingBottleModal } from './components/WishingBottleModal';
import { OceanMusicBoxModal } from './components/OceanMusicBoxModal';
import { OceanArchipelagoModal } from './components/OceanArchipelagoModal';
import { OceanAtmosphere } from './components/OceanAtmosphere';
import { AudioPlayer } from './components/AudioPlayer';
import { ProfileModal } from './components/ProfileModal';
import { BackToTop } from './components/BackToTop';
import { EasterEggParticles, Particle } from './components/EasterEggParticles';
import { StarPageTransition } from './components/StarPageTransition';
import { triggerSfx } from './utils/sfx';
import { triggerHeartConfetti } from './utils/confetti';
import { testFirestoreConnection } from './firebase';
import {
  subscribeCharacters,
  saveCharacterToFirestore,
  deleteCharacterFromFirestore,
  voteCharacterInFirestore,
  resetAllCharacterVotesInFirestore,
  addCommentToCharacterInFirestore,
  deleteCommentFromCharacterInFirestore,
} from './services/characterService';
import {
  subscribeBoardNotes,
  addBoardNoteToFirestore,
  likeBoardNoteInFirestore,
  updateBoardNoteInFirestore,
  deleteBoardNoteFromFirestore,
} from './services/boardNoteService';
import {
  subscribeNotifications,
  addNotificationToFirestore,
  markNotificationAsReadInFirestore,
  deleteNotificationFromFirestore,
} from './services/notificationService';
import {
  subscribeHeroPresentation,
  saveHeroPresentationToFirestore,
} from './services/appSettingsService';
import {
  subscribeHelpCenterConfig,
  saveHelpCenterConfigToFirestore,
} from './services/helpCenterService';
import {
  subscribeWishingBottles,
} from './services/wishingBottleService';
import {
  subscribeFeatures,
  saveFeatureToFirestore,
  deleteFeatureFromFirestore,
  subscribeFeatureBoardConfig,
  saveFeatureBoardConfigToFirestore,
} from './services/featureService';
import {
  subscribeCommands,
  saveCommandToFirestore,
  deleteCommandFromFirestore,
  reorderCommandsInFirestore,
} from './services/commandService';
import {
  subscribeContacts,
  saveContactToFirestore,
  deleteContactFromFirestore,
  reorderContactsInFirestore,
  getLocalContacts,
} from './services/contactService';

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-welcome',
    title: 'Chào mừng bạn đến với Góc nhỏ! 💖',
    content: 'Tất cả character AI đều được sáng tạo và kiểm duyệt kỹ lưỡng. Nhấn vào chuông để xem thông báo hoặc cập nhật mới nhất nhé!',
    createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN'),
    isRead: false,
    type: 'announcement',
  },
];

export default function App() {
  // First-time visitor Intro Loading screen state
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    try {
      const seen = localStorage.getItem('yui_intro_seen');
      return seen !== 'true';
    } catch (e) {
      return false;
    }
  });

  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  // Theme mode state (Light / Dark)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('yui_theme');
    return (saved as ThemeMode) === 'dark' ? 'dark' : 'light';
  });

  // Audio Settings state (BGM & SFX managed independently)
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(() => {
    const saved = localStorage.getItem('yui_audio_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return { isBgmOn: true, bgmVolume: 0.5, isSfxOn: true, sfxVolume: 0.5, currentTrackIndex: 0, customBgmType: 'default' };
  });

  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(true);

  // Update audio settings with safe state merging
  const handleUpdateAudioSettings = (newSettings: Partial<AudioSettings>) => {
    setAudioSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  // Sync Audio Settings to localStorage safely
  useEffect(() => {
    try {
      const toSave = { ...audioSettings };
      // Blob URLs are session-bound, so strip before persisting
      if (toSave.customBgmUrl && toSave.customBgmUrl.startsWith('blob:')) {
        delete toSave.customBgmUrl;
      }
      localStorage.setItem('yui_audio_settings', JSON.stringify(toSave));
    } catch (e) {
      console.warn('Could not save audio settings to localStorage:', e);
    }
  }, [audioSettings]);

  // Modals state
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isVotingOpen, setIsVotingOpen] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessageBoardOpen, setIsMessageBoardOpen] = useState(false);
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState(false);
  const [isRandomOpen, setIsRandomOpen] = useState(false);
  const [isBakeryOpen, setIsBakeryOpen] = useState(false);
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);
  const [isWishingBottleOpen, setIsWishingBottleOpen] = useState(false);
  const [isCommandLibraryOpen, setIsCommandLibraryOpen] = useState(false);
  const [isFortuneOpen, setIsFortuneOpen] = useState(false);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [isMusicBoxOpen, setIsMusicBoxOpen] = useState(false);
  const [isArchipelagoOpen, setIsArchipelagoOpen] = useState(false);

  // Wishing Bottles state (Hải Lưu & Chai Ước Nguyện)
  const [wishingBottles, setWishingBottles] = useState<WishingBottle[]>([]);

  // Help Center Handbook configuration state
  const [helpCenterConfig, setHelpCenterConfig] = useState<HelpCenterConfig>(DEFAULT_HELP_CENTER_CONFIG);

  // Commands Library states
  const [commands, setCommands] = useState<PromptCommand[]>([]);

  // Hero Presentation Video Layer state
  const [heroPresentation, setHeroPresentation] = useState<HeroPresentationConfig>(DEFAULT_HERO_PRESENTATION);

  // Contacts states
  const [contacts, setContacts] = useState<ContactLink[]>([]);

  // Features summary board states
  const [features, setFeatures] = useState<Feature[]>([]);
  const [featureBoardConfig, setFeatureBoardConfig] = useState<FeatureBoardConfig>({ description: '' });

  // Message Board Notes state
  const [boardNotes, setBoardNotes] = useState<BoardNote[]>(() => {
    const saved = localStorage.getItem('yui_message_board_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Sync Board Notes to localStorage
  useEffect(() => {
    localStorage.setItem('yui_message_board_notes', JSON.stringify(boardNotes));
  }, [boardNotes]);

  // Streak state
  const [currentStreak, setCurrentStreak] = useState<number>(() => {
    const saved = localStorage.getItem('yui_streak_count');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [longestStreak, setLongestStreak] = useState<number>(() => {
    const saved = localStorage.getItem('yui_streak_longest');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [lastVisitDate, setLastVisitDate] = useState<string>(() => {
    return localStorage.getItem('yui_streak_last_date') || '';
  });
  const [streakHistory, setStreakHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('yui_streak_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [isStreakOpen, setIsStreakOpen] = useState(false);

  // Mascot Settings & Wardrobe state
  const [mascotSettings, setMascotSettings] = useState<MascotSettings>(() => {
    const saved = localStorage.getItem('yui_mascot_settings');
    const defaultSettings: MascotSettings = {
      displayMode: 'always',
      currentSpot: 'window',
      currentAccessory: 'none',
      showInReader: true,
      unlockedAccessories: ['none', 'bow'],
      foundCount: 0,
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultSettings, ...parsed };
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Sync mascot settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('yui_mascot_settings', JSON.stringify(mascotSettings));
    } catch (e) {}
  }, [mascotSettings]);

  const handleUpdateMascotSettings = (newPartial: Partial<MascotSettings>) => {
    setMascotSettings((prev) => ({ ...prev, ...newPartial }));
  };

  // Check and unlock accessories based on streak and user activities
  useEffect(() => {
    const unlocked = new Set<MascotAccessoryId>(mascotSettings.unlockedAccessories || ['none', 'bow']);
    let updated = false;

    if (currentStreak >= 3 && !unlocked.has('beanie')) {
      unlocked.add('beanie');
      updated = true;
    }
    if (currentStreak >= 7 && !unlocked.has('scarf')) {
      unlocked.add('scarf');
      updated = true;
    }
    if (currentStreak >= 14 && !unlocked.has('crown')) {
      unlocked.add('crown');
      updated = true;
    }
    if (theme === 'dark' && !unlocked.has('nightcap')) {
      unlocked.add('nightcap');
      updated = true;
    }

    if (updated) {
      handleUpdateMascotSettings({ unlockedAccessories: Array.from(unlocked) as MascotAccessoryId[] });
    }
  }, [currentStreak, theme, mascotSettings.unlockedAccessories]);

  // User Profile State (Hồ sơ người dùng ୨୧)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('yui_user_profile');
      if (saved) {
        return { ...DEFAULT_USER_PROFILE, ...JSON.parse(saved) };
      }
    } catch (e) {}
    return DEFAULT_USER_PROFILE;
  });
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  const handleSaveUserProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    try {
      localStorage.setItem('yui_user_profile', JSON.stringify(updated));
      if (updated.name && updated.name.trim()) {
        localStorage.setItem('yui_last_author_name', updated.name.trim());
      }
    } catch (e) {}
  };

  // Easter Egg Particles state
  const [particles, setParticles] = useState<Particle[]>([]);


  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('yui_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_NOTIFICATIONS;
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Characters Data state
  const [characters, setCharacters] = useState<Character[]>(() => {
    const saved = localStorage.getItem('yui_characters');
    if (saved) {
      try {
        const parsed: Character[] = JSON.parse(saved);
        return parsed;
      } catch (e) {
        return INITIAL_CHARACTERS;
      }
    }
    return INITIAL_CHARACTERS;
  });

  // Favorites state
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('yui_favorites');
    return saved ? JSON.parse(saved) : {};
  });

  // Paper Bookmarks state
  const [bookmarks, setBookmarks] = useState<Record<string, CharacterBookmark>>(() => {
    const saved = localStorage.getItem('yui_character_bookmarks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem('yui_character_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const handleToggleBookmark = (
    characterId: string,
    paperStyle?: BookmarkPaperStyle,
    tailDecor?: BookmarkTailDecor
  ) => {
    setBookmarks((prev) => {
      const existing = prev[characterId];
      if (existing) {
        const next = { ...prev };
        delete next[characterId];
        return next;
      } else {
        const newBm: CharacterBookmark = {
          characterId,
          createdAt: new Date().toISOString(),
          paperStyle: paperStyle || 'pink',
          tailDecor: tailDecor || '୨୧',
          order: Object.keys(prev).length,
        };
        return { ...prev, [characterId]: newBm };
      }
    });
  };

  const handleUpdateBookmarkStyle = (
    characterId: string,
    paperStyle: BookmarkPaperStyle,
    tailDecor: BookmarkTailDecor
  ) => {
    setBookmarks((prev) => {
      const existing = prev[characterId];
      if (!existing) return prev;
      return {
        ...prev,
        [characterId]: {
          ...existing,
          paperStyle,
          tailDecor,
        },
      };
    });
  };

  const handleUpdateReadingProgress = (
    characterId: string,
    progress: number,
    chapterIndex: number
  ) => {
    // Unlock glasses accessory when reading story
    const unlocked = new Set<MascotAccessoryId>(mascotSettings.unlockedAccessories || ['none', 'bow']);
    if (!unlocked.has('glasses')) {
      unlocked.add('glasses');
      handleUpdateMascotSettings({ unlockedAccessories: Array.from(unlocked) as MascotAccessoryId[] });
      showToast('👓 Bạn vừa đọc một câu chuyện! Mở khóa phụ kiện: Kính tròn tri thức');
    }

    setBookmarks((prev) => {
      const existing = prev[characterId];
      if (!existing) return prev;
      return {
        ...prev,
        [characterId]: {
          ...existing,
          readingProgress: progress,
          chapterIndex,
          lastReadAt: new Date().toISOString(),
        },
      };
    });
  };

  const handleRemoveBookmark = (characterId: string) => {
    setBookmarks((prev) => {
      const next = { ...prev };
      delete next[characterId];
      return next;
    });
  };

  const handleReorderBookmarks = (orderedIds: string[]) => {
    setBookmarks((prev) => {
      const next: Record<string, CharacterBookmark> = {};
      orderedIds.forEach((id, index) => {
        if (prev[id]) {
          next[id] = { ...prev[id], order: index };
        }
      });
      return next;
    });
  };

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<GenreTag | null>(null);
  const [isStarTransitioning, setIsStarTransitioning] = useState(false);

  const triggerStarTransition = () => {
    setIsStarTransitioning(true);
    triggerSfx('chime');
    setTimeout(() => {
      setIsStarTransitioning(false);
    }, 950);
  };

  const handleSelectTag = (tag: GenreTag | null) => {
    if (tag !== selectedTag) {
      triggerStarTransition();
    }
    setSelectedTag(tag);
  };

  // Modals state
  const [notificationTab, setNotificationTab] = useState<'notifications' | 'favorites'>('notifications');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedCharacterOpenStory, setSelectedCharacterOpenStory] = useState(false);
  const [passwordPromptChar, setPasswordPromptChar] = useState<Character | null>(null);
  const [pendingChatUrl, setPendingChatUrl] = useState<string | null>(null);
  const [unlockedMap, setUnlockedMap] = useState<Record<string, boolean>>({});
  const [isCreatorRequestOpen, setIsCreatorRequestOpen] = useState(false);

  // Voted character IDs state to enforce 1 vote per account
  const [votedMap, setVotedMap] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.setItem ? localStorage.getItem('yui_voted_characters') : null;
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  // Initialize Firebase Firestore connection and Realtime Subscriptions
  useEffect(() => {
    testFirestoreConnection();

    // 1. Subscribe to Characters in Firestore
    const unsubChars = subscribeCharacters(
      (remoteChars) => {
        if (remoteChars) {
          setCharacters(remoteChars);
          try {
            localStorage.setItem('yui_characters', JSON.stringify(remoteChars));
          } catch (e) {
            console.warn('LocalStorage save character notice:', e);
          }
        }
      },
      (err) => console.warn('Firestore characters subscription notice:', err)
    );

    // 2. Subscribe to Message Board Notes in Firestore
    const unsubNotes = subscribeBoardNotes(
      (remoteNotes) => {
        setBoardNotes(remoteNotes);
      },
      (err) => console.warn('Firestore notes subscription notice:', err)
    );

    // 3. Subscribe to Notifications in Firestore
    const unsubNotifs = subscribeNotifications(
      INITIAL_NOTIFICATIONS,
      (remoteNotifs) => {
        setNotifications(remoteNotifs);
      },
      (err) => console.warn('Firestore notifications subscription notice:', err)
    );

    // 4. Subscribe to Welcome Letter Config in Firestore


    // 5. Subscribe to Wishing Bottles in Firestore
    const unsubWishingBottles = subscribeWishingBottles(
      (remoteBottles) => {
        setWishingBottles(remoteBottles);
      },
      (err) => console.warn('Firestore wishing bottles subscription notice:', err)
    );

    // 6. Subscribe to Help Center Handbook Config in Firestore
    const unsubHelpCenter = subscribeHelpCenterConfig(
       (remoteConfig) => {
         setHelpCenterConfig(remoteConfig);
       },
       (err) => console.warn('Firestore help center config subscription notice:', err)
     );

    // 7. Subscribe to Feature Board Config in Firestore (legacy)
    const unsubFeatureBoardConfig = subscribeFeatureBoardConfig(
      (remoteConfig) => {
        setFeatureBoardConfig(remoteConfig);
      },
      (err) => console.warn('Firestore feature board config subscription notice:', err)
    );

    // 7. Subscribe to Prompt Commands (Kho Lệnh) in Firestore
    const unsubCommands = subscribeCommands(
      (remoteCommands) => {
        setCommands(remoteCommands);
      },
      (err) => console.warn('Firestore commands subscription notice:', err)
    );

    // 8. Subscribe to Contact Links in Firestore
    const unsubContacts = subscribeContacts(
      (remoteContacts) => {
        setContacts(remoteContacts);
      },
      (err) => console.warn('Firestore contacts subscription notice:', err)
    );

    // 9. Subscribe to Hero Presentation Video Layer in Firestore
    const unsubHeroPres = subscribeHeroPresentation(
      DEFAULT_HERO_PRESENTATION,
      (remoteConfig) => {
        setHeroPresentation(remoteConfig);
      },
      (err) => console.warn('Firestore hero presentation subscription notice:', err)
    );

    return () => {
      unsubChars();
      unsubNotes();
      unsubNotifs();

      unsubHelpCenter();
      unsubWishingBottles();
      unsubCommands();
      unsubContacts();
      unsubHeroPres();
    };
  }, []);

  // Process Streak on App Launch
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    if (lastVisitDate === today) {
      // Already recorded today
    } else if (lastVisitDate === yesterday) {
      // Consecutive visit!
      const nextStreak = currentStreak + 1;
      const nextLongest = Math.max(nextStreak, longestStreak);
      setCurrentStreak(nextStreak);
      setLongestStreak(nextLongest);
      setLastVisitDate(today);
      const nextHistory = Array.from(new Set([...streakHistory, today]));
      setStreakHistory(nextHistory);

      localStorage.setItem('yui_streak_count', nextStreak.toString());
      localStorage.setItem('yui_streak_longest', nextLongest.toString());
      localStorage.setItem('yui_streak_last_date', today);
      localStorage.setItem('yui_streak_history', JSON.stringify(nextHistory));

      showToast(`🔥 ${nextStreak} ngày ghé góc nhỏ - Hôm nay cũng ghé rồi nè ♡`);
    } else if (lastVisitDate && lastVisitDate < yesterday) {
      // Streak broken
      setCurrentStreak(1);
      setLastVisitDate(today);
      const nextHistory = Array.from(new Set([...streakHistory, today]));
      setStreakHistory(nextHistory);

      localStorage.setItem('yui_streak_count', '1');
      localStorage.setItem('yui_streak_last_date', today);
      localStorage.setItem('yui_streak_history', JSON.stringify(nextHistory));

      showToast('Ơ, hôm qua không thấy bạn ghé... Không sao, bắt đầu lại từ hôm nay nhé ♡');
    } else {
      // First time
      setCurrentStreak(1);
      setLongestStreak(1);
      setLastVisitDate(today);
      const nextHistory = [today];
      setStreakHistory(nextHistory);

      localStorage.setItem('yui_streak_count', '1');
      localStorage.setItem('yui_streak_longest', '1');
      localStorage.setItem('yui_streak_last_date', today);
      localStorage.setItem('yui_streak_history', JSON.stringify(nextHistory));
    }
  }, []);

  // Sync Voted Map to localStorage
  useEffect(() => {
    localStorage.setItem('yui_voted_characters', JSON.stringify(votedMap));
  }, [votedMap]);

  // Sync Favorites to localStorage
  useEffect(() => {
    localStorage.setItem('yui_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // One-time automatic clean up to ensure fresh vote and favorite state
  useEffect(() => {
    const isCleanDone = localStorage.getItem('yui_votes_clean_v6');
    if (!isCleanDone) {
      // Clear stale voted map so user is not blocked incorrectly
      localStorage.removeItem('yui_voted_characters');
      setVotedMap({});
      localStorage.setItem('yui_votes_clean_v6', 'done');
    }
  }, []);

  // Hash Routing for #favorites or #notifications
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#favorites' || hash === '#yeuthich') {
        setNotificationTab('favorites');
        setIsNotificationsOpen(true);
      } else if (hash === '#notifications' || hash === '#thongbao') {
        setNotificationTab('notifications');
        setIsNotificationsOpen(true);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync Theme to HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('yui_theme', theme);
  }, [theme]);

  // Sync Characters to localStorage
  useEffect(() => {
    localStorage.setItem('yui_characters', JSON.stringify(characters));
  }, [characters]);

  // Sync Notifications to localStorage
  useEffect(() => {
    localStorage.setItem('yui_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Sync Favorites to localStorage
  useEffect(() => {
    localStorage.setItem('yui_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };


  // Trigger Easter Egg Particles (Ocean Pearls, Aqua Stars & Shells)
  const handleTriggerEasterEgg = (x: number, y: number) => {
    const symbols = ['✦', '🐚', '✧', '🌊', '🪼', '🦪', '💎', '⋆'];
    const colors = ['#65C5CE', '#3FAAB7', '#78DCE0', '#BDEBE5', '#F5F3EA', '#D8D4EE', '#6BDDE5'];
    const newParticles: Particle[] = Array.from({ length: 14 }).map((_, i) => ({
      id: `p-${Date.now()}-${i}`,
      x: x + (Math.random() - 0.5) * 60,
      y: y + (Math.random() - 0.5) * 60,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.floor(Math.random() * 14) + 16,
    }));

    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 1500);
  };

  // Notification handlers
  const handleSendNotification = (
    title: string,
    content: string,
    type: 'announcement' | 'new_character' = 'announcement',
    characterId?: string
  ) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      content,
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN'),
      isRead: false,
      type,
      characterId,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    addNotificationToFirestore(newNotif);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    markNotificationAsReadInFirestore(id);
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    notifications.forEach((n) => {
      if (!n.isRead) {
        markNotificationAsReadInFirestore(n.id);
      }
    });
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    deleteNotificationFromFirestore(id);
  };

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  // Message Board Handlers
  const handleAddBoardNote = (newNoteData: Omit<BoardNote, 'createdAt' | 'likes' | 'rotation'> & { id?: string }) => {
    const rotations = [-2.5, -1.5, -0.5, 0, 0.5, 1.5, 2.5];
    const randomRotation = rotations[Math.floor(Math.random() * rotations.length)];
    const noteId = newNoteData.id || ('note-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6));
    const newNote: BoardNote = {
      ...newNoteData,
      id: noteId,
      createdAt: new Date().toISOString(),
      likes: 0,
      rotation: randomRotation,
    };
    setBoardNotes((prev) => [newNote, ...prev]);
    addBoardNoteToFirestore(newNote);
    showToast('Đã để lại lời nhắn thành công! ♡');
  };

  const handleLikeBoardNote = (noteId: string) => {
    setBoardNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, likes: (n.likes || 0) + 1 } : n))
    );
    likeBoardNoteInFirestore(noteId);
  };

  const handlePinBoardNote = (noteId: string) => {
    const note = boardNotes.find((n) => n.id === noteId);
    const newPinned = note ? !note.isPinned : true;
    setBoardNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, isPinned: newPinned } : n))
    );
    updateBoardNoteInFirestore(noteId, { isPinned: newPinned });
    showToast('Đã cập nhật trạng thái ghim lời nhắn.');
  };

  const handleHideBoardNote = (noteId: string) => {
    const note = boardNotes.find((n) => n.id === noteId);
    const newHidden = note ? !note.isHidden : true;
    setBoardNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, isHidden: newHidden } : n))
    );
    updateBoardNoteInFirestore(noteId, { isHidden: newHidden });
    showToast('Đã cập nhật trạng thái ẩn lời nhắn.');
  };

  const handleEditBoardNote = (
    noteId: string,
    updatedData: Partial<Pick<BoardNote, 'author' | 'content' | 'paperStyle' | 'decoration'>>
  ) => {
    const updatedAt = new Date().toISOString();
    setBoardNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, ...updatedData, updatedAt } : n))
    );
    updateBoardNoteInFirestore(noteId, { ...updatedData, updatedAt });
    showToast('Đã lưu chỉnh sửa lời nhắn! ♡');
  };

  const handleDeleteBoardNote = (noteId: string) => {
    setBoardNotes((prev) => prev.filter((n) => n.id !== noteId));
    deleteBoardNoteFromFirestore(noteId);
    showToast('Đã xóa lời nhắn thành công! ♡');
  };

  // Select character handler with Password Check
  const handleSelectCharacter = (char: Character) => {
    if (char.password && char.password.trim().length > 0 && !unlockedMap[char.id]) {
      setPendingChatUrl(null);
      setPasswordPromptChar(char);
    } else {
      setSelectedCharacter(char);
    }
  };

  // Direct Go-To Ggai link handler with Password Check
  const handleGoToGgai = (char: Character, url: string) => {
    if (char.password && char.password.trim().length > 0 && !unlockedMap[char.id]) {
      setPendingChatUrl(url);
      setPasswordPromptChar(char);
    } else {
      window.open(url, '_blank');
    }
  };

  // Vote Handler - Strictly 1 vote per person / device / admin (Heart ❤️ only)
  const handleVote = (characterId: string) => {
    if (votedMap[characterId]) {
      showToast('Bạn đã thả tim cho nhân vật này rồi! Mỗi người chỉ được thả 1 tim ♡');
      return;
    }

    triggerHeartConfetti(0.5, 0.6);
    setVotedMap((prev) => ({ ...prev, [characterId]: true }));
    setCharacters((prev) =>
      prev.map((char) =>
        char.id === characterId ? { ...char, votes: (char.votes || 0) + 1 } : char
      )
    );

    voteCharacterInFirestore(characterId);

    // If currently inspecting in detail modal, update selected character
    if (selectedCharacter && selectedCharacter.id === characterId) {
      setSelectedCharacter((prev) =>
        prev ? { ...prev, votes: (prev.votes || 0) + 1 } : null
      );
    }

    showToast('Cảm ơn bạn đã thả tim cho nhân vật! ❤️');
  };

  // Reset all votes handler for Admin Yui
  const handleResetAllVotes = async () => {
    setCharacters((prev) =>
      prev.map((char) => ({ ...char, votes: 0, likes: 0 }))
    );
    setVotedMap({});
    localStorage.removeItem('yui_voted_characters');
    try {
      await resetAllCharacterVotesInFirestore(characters);
      showToast('✨ Đã đặt lại 0 tim cho toàn bộ nhân vật thành công!');
    } catch (e) {
      console.warn('Could not reset votes in Firestore:', e);
      showToast('✨ Đã đặt lại 0 tim cho tất cả nhân vật.');
    }
  };

  // Toggle Favorite / Save Handler (Star ⭐ - completely decoupled from voting)
  const handleToggleFavorite = (characterId: string) => {
    const isNowFav = !favorites[characterId];
    setFavorites((prev) => ({ ...prev, [characterId]: isNowFav }));

    setCharacters((prev) =>
      prev.map((char) =>
        char.id === characterId
          ? { ...char, isFavorite: isNowFav }
          : char
      )
    );

    if (selectedCharacter && selectedCharacter.id === characterId) {
      setSelectedCharacter((prev) =>
        prev ? { ...prev, isFavorite: isNowFav } : null
      );
    }

    if (isNowFav) {
      showToast('⭐ Đã lưu nhân vật vào mục Yêu thích!');
    } else {
      showToast('Đã bỏ lưu nhân vật khỏi mục Yêu thích.');
    }
  };

  // Add / Edit / Delete Characters for Admin Yui
  const handleAddCharacter = async (
    newCharData: Omit<Character, 'id' | 'votes' | 'likes' | 'createdAt'>
  ) => {
    const newChar: Character = {
      ...newCharData,
      id: `char-${Date.now()}`,
      votes: 0,
      likes: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setCharacters((prev) => [newChar, ...prev]);
    try {
      await saveCharacterToFirestore(newChar);
      showToast('🎉 Đã đồng bộ nhân vật lên đám mây công khai cho mọi tài khoản!');
    } catch (e) {
      console.error('Error saving character to Firestore:', e);
      showToast('⚠️ Có lỗi khi tải lên Firestore. Đã lưu tạm bộ nhớ máy.');
    }
  };

  const handleEditCharacter = async (updatedChar: Character) => {
    setCharacters((prev) =>
      prev.map((char) => (char.id === updatedChar.id ? updatedChar : char))
    );
    try {
      await saveCharacterToFirestore(updatedChar);
      showToast('✨ Đã cập nhật nhân vật lên máy chủ thành công!');
    } catch (e) {
      console.error('Error editing character on Firestore:', e);
      showToast('⚠️ Không thể cập nhật lên máy chủ, vui lòng thử lại.');
    }
  };

  const handleDeleteCharacter = async (id: string) => {
    setCharacters((prev) => {
      const updated = prev.filter((char) => char.id !== id);
      try {
        localStorage.setItem('yui_characters', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage save notice:', e);
      }
      return updated;
    });

    // Clean up favorites and bookmarks if matched
    setFavorites((prev) => {
      if (prev[id]) {
        const copy = { ...prev };
        delete copy[id];
        try {
          localStorage.setItem('yui_favorites', JSON.stringify(copy));
        } catch (e) {}
        return copy;
      }
      return prev;
    });

    try {
      await deleteCharacterFromFirestore(id);
      showToast('🗑️ Đã xóa nhân vật vĩnh viễn khỏi hệ thống!');
    } catch (e) {
      console.error('Error deleting character from Firestore:', e);
      showToast('⚠️ Lỗi khi xóa trên máy chủ, vui lòng thử lại.');
    }
  };

  const handleImportCharacters = (importedList: Character[]) => {
    setCharacters(importedList);
    importedList.forEach((char) => {
      saveCharacterToFirestore(char);
    });
  };

  // Add comment to character
  const handleAddComment = (characterId: string, author: string, content: string) => {
    const newComment = {
      id: `cmt-${Date.now()}`,
      author: author || 'Khách',
      content,
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN'),
    };

    const targetChar = characters.find((c) => c.id === characterId);
    const existingComments = targetChar?.comments || [];

    setCharacters((prev) =>
      prev.map((char) => {
        if (char.id === characterId) {
          const updatedComments = [...(char.comments || []), newComment];
          const updatedChar = { ...char, comments: updatedComments };
          if (selectedCharacter && selectedCharacter.id === characterId) {
            setSelectedCharacter(updatedChar);
          }
          return updatedChar;
        }
        return char;
      })
    );

    addCommentToCharacterInFirestore(characterId, newComment, existingComments);
  };

  // Delete comment from character (Creator/Admin)
  const handleDeleteComment = (characterId: string, commentId: string) => {
    const targetChar = characters.find((c) => c.id === characterId);
    const existingComments = targetChar?.comments || [];

    setCharacters((prev) =>
      prev.map((char) => {
        if (char.id === characterId) {
          const updatedComments = (char.comments || []).filter((c) => c.id !== commentId);
          const updatedChar = { ...char, comments: updatedComments };
          if (selectedCharacter && selectedCharacter.id === characterId) {
            setSelectedCharacter(updatedChar);
          }
          return updatedChar;
        }
        return char;
      })
    );

    deleteCommentFromCharacterInFirestore(characterId, commentId, existingComments);
  };

  // Memoized Public Published Characters (Accurate system stats)
  const publicCharacters = useMemo(() => {
    return characters.filter((c) => !c.isDraft && !c.isPrivate);
  }, [characters]);

  // Memoized user favorited characters that exist and are public
  const activeFavoriteCharacterIds = useMemo(() => {
    return characters
      .filter((c) => !c.isDraft && !c.isPrivate && (!!favorites[c.id] || !!c.isFavorite))
      .map((c) => c.id);
  }, [characters, favorites]);

  // Filtered Characters Calculation (Only published public characters are shown on main grid)
  const filteredCharacters = useMemo(() => {
    return publicCharacters.filter((char) => {
      const charTags = Array.isArray(char.tags)
        ? char.tags
        : typeof char.tags === 'string'
          ? (char.tags as string).split(',').map((s) => s.trim())
          : [];

      // Filter by Search Term
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        char.name.toLowerCase().includes(term) ||
        char.title.toLowerCase().includes(term) ||
        charTags.some((t) => typeof t === 'string' && t.toLowerCase().includes(term));

      // Filter by Selected Tag
      const matchesTag =
        !selectedTag ||
        charTags.some(
          (t) =>
            typeof t === 'string' &&
            t.trim().toLowerCase() === selectedTag.trim().toLowerCase()
        );

      return matchesSearch && matchesTag;
    });
  }, [publicCharacters, searchTerm, selectedTag]);

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans relative website-wallpaper ${
      theme === 'dark' ? 'dark' : ''
    } ${
      theme === 'light'
        ? 'text-slate-900'
        : 'text-slate-100'
    }`}>
      
      {/* Easter Egg Floating Particles Container */}
      <EasterEggParticles particles={particles} />

      {/* 0. Star Page Transition Glide */}
      <StarPageTransition isActive={isStarTransitioning} />

      {/* 1. Intro Loading Screen */}
      <AnimatePresence>
        {showIntro && (
          <IntroLoadingScreen onComplete={() => {
            setShowIntro(false);
            try {
              localStorage.setItem('yui_intro_seen', 'true');
            } catch (e) {}
            triggerStarTransition();
          }} />
        )}
      </AnimatePresence>

      {/* 2. Main Application Interface */}
      <div className="flex flex-col min-h-screen relative z-10">
        
        {/* Top Sticky Header & Toolbar */}
        <Header
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenContact={() => setIsContactOpen(true)}
          onOpenVoting={() => setIsVotingOpen(true)}
          onOpenAdmin={() => setIsAdminAuthOpen(true)}
          onOpenMessageBoard={() => setIsMessageBoardOpen(true)}
          onOpenAudioSettings={() => setIsAudioSettingsOpen(true)}
          unreadNotificationCount={unreadNotificationCount}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          noteCount={boardNotes.length}
          onOpenRandom={() => setIsRandomOpen(true)}
          onOpenWishingBottle={() => setIsWishingBottleOpen(true)}
          onOpenBakery={() => {
            setIsBakeryOpen(true);
            // Unlock hairpin accessory for mascot
            const unlocked = new Set<MascotAccessoryId>(mascotSettings.unlockedAccessories || ['none', 'bow']);
            if (!unlocked.has('hairpin')) {
              unlocked.add('hairpin');
              handleUpdateMascotSettings({ unlockedAccessories: Array.from(unlocked) as MascotAccessoryId[] });
              showToast('🌸 Bạn vừa ghé Tiệm Bánh Nhỏ! Mở khóa phụ kiện: Kẹp hoa anh đào');
            }
          }}
          onOpenMascotWardrobe={() => setIsWardrobeOpen(true)}
          onTriggerEasterEgg={handleTriggerEasterEgg}
          isSfxOn={audioSettings.isSfxOn}
          sfxVolume={audioSettings.sfxVolume}
          onToast={showToast}
          userProfile={userProfile}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenCreatorRequest={() => setIsCreatorRequestOpen(true)}
          onOpenCommandLibrary={() => setIsCommandLibraryOpen(true)}
          onOpenFortune={() => setIsFortuneOpen(true)}
          onOpenHelpCenter={() => setIsHelpCenterOpen(true)}
          onOpenMusicBox={() => setIsMusicBoxOpen(true)}
          onOpenArchipelago={() => setIsArchipelagoOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* Pearl Ocean Coastal Dreamy Sanctuary Hero Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#FFFDFC]/95 via-[#F3FAFA]/90 to-[#E8F7F6]/85 dark:from-[#0B2530]/95 dark:via-[#071C25]/90 dark:to-[#030E14]/85 border border-[#BFE7E8]/70 dark:border-[#38CAD6]/30 shadow-xl shadow-[#91CED2]/15 dark:shadow-black/50 space-y-5 relative overflow-hidden backdrop-blur-2xl transition-all">
            {/* Luminous soft pastel ambient blobs & sunlight refraction */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#D2F0F0]/40 dark:bg-[#38CAD6]/15 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#CFE8F5]/35 dark:bg-[#1B6E7D]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/3 left-10 w-64 h-64 bg-[#F3DDE1]/30 dark:bg-[#E5E1F2]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 right-1/3 w-72 h-72 bg-[#C8EAE3]/35 dark:bg-[#7DD8DE]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Sunlight beam overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent pointer-events-none" />

            {/* Top Badge & Streak Counter */}
            <div className="flex flex-wrap items-center justify-between gap-3 relative z-10 border-b border-[#BFE7E8]/50 dark:border-white/15 pb-3.5">
              <div className="inline-flex items-center gap-2 text-xs font-serif text-[#49666A] dark:text-[#CFE8F5] font-semibold tracking-wide">
                <span className="text-[#8CCFD3] dark:text-[#71BFC6] text-xs">✦</span>
                <span className="uppercase tracking-widest text-[11px] font-bold text-[#49666A] dark:text-[#E9F8F8]">
                  Hải Trình Cảm Xúc · Thư Viện Đại Dương
                </span>
                <span className="text-[#8CCFD3] dark:text-[#71BFC6] text-xs">✦</span>
                <span className="hidden sm:inline-block text-[10px] text-[#71BFC6] font-normal">· ｡ ° ｡ · ﾟ</span>
              </div>

              {/* Streak Badge Button styled as a pearl pill */}
              <button
                onClick={() => setIsStreakOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFFDFC]/80 hover:bg-[#E9F8F8] dark:bg-white/15 dark:hover:bg-white/25 border border-[#BFE7E8] dark:border-white/30 text-[#49666A] dark:text-white text-xs font-bold hover:scale-105 transition-transform cursor-pointer shadow-xs font-serif"
                title="Xem chuỗi ngày ghé góc nhỏ và mốc phần thưởng"
              >
                <Flame className="w-3.5 h-3.5 text-[#71BFC6] fill-current animate-pulse" />
                <span>🔥 {currentStreak} ngày ghé thăm</span>
              </button>
            </div>

            {/* Title & Romantic Poetic Subtitle */}
            <div className="space-y-1.5 relative z-10">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2D494C] dark:text-white font-serif leading-snug">
                  Há lo, cảm ơn cậu đã ghé bến đỗ trong veo của Yui
                </h2>
                <span className="text-[#8CCFD3] text-xl">✦</span>
              </div>
              <p className="text-xs sm:text-sm text-[#49666A] dark:text-[#CFE8F5] leading-relaxed font-serif">
                « 愿随流水寄相思，莫道沧桑失故知 » <em>(Nguyện gửi tương tư theo dòng nước, Đừng than dâu bể lạc tri âm)</em> · Chúc bồ một ngày êm đềm tựa sóng biếc sớm mai ( ˘͈ ᵕ ˘͈ ♡)
              </p>
            </div>

            {/* Quick Interactive Ocean Deck (6 Core Stations in Sea Glass Pastel Style) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1 relative z-10 font-serif">
              {/* 1. Lời Nhắn Vỏ Sò Biển 🐚 */}
              <button
                onClick={() => setIsFortuneOpen(true)}
                className="p-3 rounded-2xl bg-[#FFFDFC]/85 hover:bg-[#E9F8F8] dark:bg-white/10 dark:hover:bg-white/20 border border-[#BFE7E8]/70 dark:border-white/20 shadow-xs hover:shadow-md flex items-center gap-2.5 text-left transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer group backdrop-blur-md"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F3DDE1] to-[#CFE8F5] text-[#49666A] dark:text-white flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                  🐚
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#2D494C] dark:text-white block truncate">
                    Lời Nhắn Vỏ Sò
                  </span>
                  <span className="text-[10px] text-[#63878B] dark:text-white/80 block truncate font-sans">
                    Quẻ thơ biển cả
                  </span>
                </div>
              </button>

              {/* 2. Chai Thủy Tinh Ước Nguyện 🍾 */}
              <button
                onClick={() => setIsWishingBottleOpen(true)}
                className="p-3 rounded-2xl bg-[#FFFDFC]/85 hover:bg-[#E9F8F8] dark:bg-white/10 dark:hover:bg-white/20 border border-[#BFE7E8]/70 dark:border-white/20 shadow-xs hover:shadow-md flex items-center gap-2.5 text-left transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer group backdrop-blur-md"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#A9DDE2] to-[#71BFC6] text-white flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                  🍾
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#2D494C] dark:text-white block truncate">
                    Chai Ước Nguyện
                  </span>
                  <span className="text-[10px] text-[#63878B] dark:text-white/80 block truncate font-sans">
                    Thả & vớt hải lưu
                  </span>
                </div>
              </button>

              {/* 3. Hộp Nhạc Sóng Biển 🎶 */}
              <button
                onClick={() => setIsMusicBoxOpen(true)}
                className="p-3 rounded-2xl bg-[#FFFDFC]/85 hover:bg-[#E9F8F8] dark:bg-white/10 dark:hover:bg-white/20 border border-[#38CAD6]/40 dark:border-[#38CAD6]/30 shadow-xs hover:shadow-md flex items-center gap-2.5 text-left transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer group backdrop-blur-md ring-1 ring-[#38CAD6]/30"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#38CAD6] to-[#1B6E7D] text-white flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                  🎶
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#2D494C] dark:text-white block truncate flex items-center gap-1">
                    <span>Hộp Nhạc Biển</span>
                  </span>
                  <span className="text-[10px] text-[#1B6E7D] dark:text-[#48CCD6] block truncate font-sans font-semibold">
                    Lo-Fi & Thư giãn
                  </span>
                </div>
              </button>

              {/* 4. Hải Đồ Thám Hiểm 🗺️ */}
              <button
                onClick={() => setIsArchipelagoOpen(true)}
                className="p-3 rounded-2xl bg-[#FFFDFC]/85 hover:bg-[#E9F8F8] dark:bg-white/10 dark:hover:bg-white/20 border border-[#38CAD6]/40 dark:border-[#38CAD6]/30 shadow-xs hover:shadow-md flex items-center gap-2.5 text-left transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer group backdrop-blur-md ring-1 ring-[#38CAD6]/30"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1B6E7D] to-[#38CAD6] text-white flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                  🗺️
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#2D494C] dark:text-white block truncate">
                    Hải Đồ Kỳ Ảo
                  </span>
                  <span className="text-[10px] text-[#1B6E7D] dark:text-[#48CCD6] block truncate font-sans font-semibold">
                    Bản đồ quần đảo
                  </span>
                </div>
              </button>

              {/* 5. Hôm Nay Gặp Ai Đây? 🎲 */}
              <button
                onClick={() => setIsRandomOpen(true)}
                className="p-3 rounded-2xl bg-[#FFFDFC]/85 hover:bg-[#E9F8F8] dark:bg-white/10 dark:hover:bg-white/20 border border-[#BFE7E8]/70 dark:border-white/20 shadow-xs hover:shadow-md flex items-center gap-2.5 text-left transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer group backdrop-blur-md"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#CFE8F5] to-[#8CCFD3] text-[#2D494C] dark:text-white flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                  🎲
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#2D494C] dark:text-white block truncate">
                    Hôm Nay Gặp Ai?
                  </span>
                  <span className="text-[10px] text-[#63878B] dark:text-white/80 block truncate font-sans">
                    Gợi ý ngẫu nhiên
                  </span>
                </div>
              </button>

              {/* 6. Sổ Tay Trợ Giúp ❓ */}
              <button
                onClick={() => setIsHelpCenterOpen(true)}
                className="p-3 rounded-2xl bg-[#FFFDFC]/85 hover:bg-[#E9F8F8] dark:bg-white/10 dark:hover:bg-white/20 border border-[#BFE7E8]/70 dark:border-white/20 shadow-xs hover:shadow-md flex items-center gap-2.5 text-left transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer group backdrop-blur-md"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E0F3F5] to-[#BFE7E8] text-[#1B6E7D] dark:text-white flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                  ❓
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#2D494C] dark:text-white block truncate">
                    Sổ Tay Trợ Giúp
                  </span>
                  <span className="text-[10px] text-[#63878B] dark:text-white/80 block truncate font-sans">
                    Hướng dẫn & mẹo hay
                  </span>
                </div>
              </button>
            </div>

            {/* Subtle Ocean Whisper Footnote Bar */}
            <div className="pt-2 flex items-center justify-between text-[11px] text-[#63878B] dark:text-[#CFE8F5]/70 font-serif border-t border-[#BFE7E8]/40 dark:border-white/10">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-[#71BFC6]">🌊</span>
                <span className="italic truncate">« 沧海月明珠有泪，蓝田日暖玉生烟 » (Thương hải nguyệt minh châu hữu lệ, Lam điền nhật noãn ngọc sinh yên) · Biển biếc trăng trong ngời giọt ngọc...</span>
              </div>
              <button
                onClick={() => setIsAudioSettingsOpen(true)}
                className="shrink-0 ml-2 inline-flex items-center gap-1 hover:text-[#2D494C] dark:hover:text-white transition-colors cursor-pointer text-[10px] font-semibold bg-[#E9F8F8] dark:bg-white/10 px-2.5 py-0.5 rounded-full"
              >
                <span>🎵 Âm thanh</span>
              </button>
            </div>
          </div>

          {/* Feature: "Gõ cửa góc nhỏ" Interactive Little Door */}
          <LittleDoor isAudioPlaying={audioSettings.isBgmOn} />

          {/* Feature: "୨୧ Kệ sách của mình" Paper Bookshelf */}
          <Bookshelf
            bookmarks={bookmarks}
            characters={characters}
            onSelectCharacter={(char, openStory) => {
              setSelectedCharacter(char);
              setSelectedCharacterOpenStory(!!openStory);
            }}
            onRemoveBookmark={handleRemoveBookmark}
            onReorderBookmarks={handleReorderBookmarks}
          />

          {/* Search Bar & Preset Tag Selector */}
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedTag={selectedTag}
            onSelectTag={handleSelectTag}
            totalCount={publicCharacters.length}
            filteredCount={filteredCharacters.length}
          />

          {/* Toast Notification Popup */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-[#09222E]/95 text-white text-xs font-bold shadow-2xl backdrop-blur-xl flex items-center gap-2 border border-[#38CAD6]/40 font-serif"
              >
                <Check className="w-4 h-4 text-[#38CAD6] shrink-0" />
                <span className="text-white">{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Custom Loading Screen when loading transitions happen */}
          <CustomLoadingScreen isLoading={isGlobalLoading} />

          {/* Character Grid Cards List or Custom Empty State */}
          {filteredCharacters.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCharacters.map((char) => (
                <CharacterCard
                  key={char.id}
                  character={char}
                  onSelect={(c) => handleSelectCharacter(c)}
                  onGoToGgai={(c, url) => handleGoToGgai(c, url)}
                  onVote={handleVote}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={!!favorites[char.id] || !!char.isFavorite}
                  onTagClick={(tag) => handleSelectTag(tag)}
                />
              ))}
            </div>
          ) : (
            /* Custom Cute Empty State */
            <EmptyState
              type={searchTerm || selectedTag ? 'search' : 'store'}
              onAction={() => {
                setSearchTerm('');
                handleSelectTag(null);
              }}
            />
          )}

        </main>

        {/* Footer */}
        <footer className="mt-12 py-8 border-t border-[#65C5CE]/20 dark:border-[#143943] text-center text-xs text-[#6B858A] dark:text-[#8FB6BC]">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <p className="font-medium text-[#29464C] dark:text-[#DDF5F6]">
              Góc nhỏ (｡･ω･｡)ﾉ♡ • Thư viện Character AI Biển Cả
            </p>
            <p className="text-[11px] text-[#6B858A]">
              Chỉ hiển thị các nhân vật chính thức được đăng tải • Tôn trọng bản quyền tác giả
            </p>
            <div className="pt-2">
              <button
                id="footer-admin-btn"
                onClick={() => setIsAdminAuthOpen(true)}
                className="text-[11px] text-[#6B858A]/80 hover:text-[#247C8C] dark:hover:text-[#78DCE0] transition-colors inline-flex items-center gap-1 cursor-pointer"
                title="Quản lý & Sáng tạo"
              >
                <span>✦ Quản lý & Sáng tạo</span>
              </button>
            </div>
          </div>
        </footer>

      </div>

      {/* 3. Dialog Modals */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDeleteNotification={handleDeleteNotification}
        characters={characters}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        onSelectCharacter={(c) => handleSelectCharacter(c)}
        onGoToGgai={(c, url) => handleGoToGgai(c, url)}
        initialTab={notificationTab}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        userProfile={userProfile}
        onToast={showToast}
        isSfxOn={audioSettings.isSfxOn}
        sfxVolume={audioSettings.sfxVolume}
        triggerSfx={triggerSfx}
        contacts={contacts}
      />

      <CreatorRequestModal
        isOpen={isCreatorRequestOpen}
        onClose={() => setIsCreatorRequestOpen(false)}
        userProfile={userProfile}
        onToast={showToast}
        isSfxOn={audioSettings.isSfxOn}
        sfxVolume={audioSettings.sfxVolume}
        triggerSfx={triggerSfx}
      />

      <VotingModal
        isOpen={isVotingOpen}
        onClose={() => setIsVotingOpen(false)}
        characters={publicCharacters}
        onVote={handleVote}
        votedMap={votedMap}
      />

      <CharacterDetailModal
        character={selectedCharacter}
        onClose={() => {
          setSelectedCharacter(null);
          setSelectedCharacterOpenStory(false);
        }}
        onVote={handleVote}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={selectedCharacter ? (!!favorites[selectedCharacter.id] || !!selectedCharacter.isFavorite) : false}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        isBookmarked={selectedCharacter ? !!bookmarks[selectedCharacter.id] : false}
        bookmarkData={selectedCharacter ? bookmarks[selectedCharacter.id] : undefined}
        onToggleBookmark={handleToggleBookmark}
        onUpdateBookmarkStyle={handleUpdateBookmarkStyle}
        onUpdateReadingProgress={handleUpdateReadingProgress}
        initialOpenStory={selectedCharacterOpenStory}
      />

      <PasswordPromptModal
        character={passwordPromptChar}
        isOpen={!!passwordPromptChar}
        onClose={() => {
          setPasswordPromptChar(null);
          setPendingChatUrl(null);
        }}
        onSuccess={(char) => {
          setUnlockedMap((prev) => ({ ...prev, [char.id]: true }));
          setPasswordPromptChar(null);
          if (pendingChatUrl) {
            window.open(pendingChatUrl, '_blank');
            setPendingChatUrl(null);
          } else {
            setSelectedCharacter(char);
          }
        }}
      />

      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onSuccess={() => {
          setIsAdminLoggedIn(true);
          setIsAdminOpen(true);
        }}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        characters={characters}
        onAddCharacter={handleAddCharacter}
        onEditCharacter={handleEditCharacter}
        onDeleteCharacter={handleDeleteCharacter}
        onSendNotification={handleSendNotification}
        onSelectCharacter={(c) => handleSelectCharacter(c)}
        onToast={showToast}
        onResetAllVotes={handleResetAllVotes}
        helpCenterConfig={helpCenterConfig}
        onSaveHelpCenterConfig={saveHelpCenterConfigToFirestore}
        features={features}
        boardConfig={featureBoardConfig}
        onSaveFeature={saveFeatureToFirestore}
        onDeleteFeature={deleteFeatureFromFirestore}
        onSaveBoardConfig={saveFeatureBoardConfigToFirestore}
        onOpenCommandLibrary={() => setIsCommandLibraryOpen(true)}
        contacts={contacts}
        onSaveContact={async (c) => {
          await saveContactToFirestore(c);
          setContacts(getLocalContacts());
        }}
        onDeleteContact={async (id) => {
          await deleteContactFromFirestore(id);
          setContacts(getLocalContacts());
        }}
        onReorderContacts={async (ordered) => {
          await reorderContactsInFirestore(ordered);
          setContacts(getLocalContacts());
        }}
        heroPresentation={heroPresentation}
        onSaveHeroPresentation={saveHeroPresentationToFirestore}
      />

      {/* Feature: ✦ Kho Lệnh (Command Library) */}
      <CommandLibraryModal
        isOpen={isCommandLibraryOpen}
        onClose={() => setIsCommandLibraryOpen(false)}
        commands={commands}
        isAdmin={isAdminLoggedIn}
        onRequireAdmin={() => setIsAdminAuthOpen(true)}
        onSaveCommand={saveCommandToFirestore}
        onDeleteCommand={deleteCommandFromFirestore}
        onReorderCommands={reorderCommandsInFirestore}
        onToast={showToast}
        sfxVolume={audioSettings.sfxVolume}
        isSfxOn={audioSettings.isSfxOn}
      />

      {/* Feature: 🍾 Chai Thủy Tinh Ước Nguyện & Hải Lưu Trôi Dạt */}
      <WishingBottleModal
        isOpen={isWishingBottleOpen}
        onClose={() => setIsWishingBottleOpen(false)}
        bottles={wishingBottles}
        characters={publicCharacters}
        onSelectCharacter={(char) => setSelectedCharacter(char)}
        isSfxOn={audioSettings.isSfxOn}
        onToast={showToast}
      />

      <OceanFortuneModal
        isOpen={isFortuneOpen}
        onClose={() => setIsFortuneOpen(false)}
        characters={publicCharacters}
        onSelectCharacter={(char) => setSelectedCharacter(char)}
        isSfxOn={audioSettings.isSfxOn}
        sfxVolume={audioSettings.sfxVolume}
        onToast={showToast}
      />

      {/* Feature: 🎶 Hộp Nhạc Sóng Biển & Trạm Thư Giãn */}
      <OceanMusicBoxModal
        isOpen={isMusicBoxOpen}
        onClose={() => setIsMusicBoxOpen(false)}
        isSfxOn={audioSettings.isSfxOn}
        sfxVolume={audioSettings.sfxVolume}
      />

      {/* Feature: 🗺️ Hải Đồ Thám Hiểm Quần Đảo Nhân Vật */}
      <OceanArchipelagoModal
        isOpen={isArchipelagoOpen}
        onClose={() => setIsArchipelagoOpen(false)}
        characters={publicCharacters}
        onSelectCharacter={(char) => setSelectedCharacter(char)}
        isSfxOn={audioSettings.isSfxOn}
        sfxVolume={audioSettings.sfxVolume}
        onToast={showToast}
      />

      {/* Sổ Tay Trợ Giúp & Hướng Dẫn Hải Trình */}
      <HelpCenterModal
        isOpen={isHelpCenterOpen}
        onClose={() => setIsHelpCenterOpen(false)}
        config={helpCenterConfig}
        onOpenCreatorRequest={() => setIsCreatorRequestOpen(true)}
        onOpenMessageBoard={() => setIsMessageBoardOpen(true)}
        onOpenFortune={() => setIsFortuneOpen(true)}
        onOpenAudioSettings={() => setIsAudioSettingsOpen(true)}
      />

      <StreakModal
        isOpen={isStreakOpen}
        onClose={() => setIsStreakOpen(false)}
        currentStreak={currentStreak}
        longestStreak={longestStreak}
        lastVisitDate={lastVisitDate}
        historyDates={streakHistory}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={userProfile}
        onSaveProfile={handleSaveUserProfile}
        favoriteCharacterIds={activeFavoriteCharacterIds}
        bookmarks={Object.values(bookmarks)}
        allCharacters={publicCharacters}
        unlockedAccessories={mascotSettings.unlockedAccessories}
        isNightMode={theme === 'dark'}
        onSelectFavoriteFilter={() => {
          setNotificationTab('favorites');
          setIsNotificationsOpen(true);
        }}
        onSelectBookmarkFilter={() => {
          // Scroll smoothly to the bookshelf
          const el = document.getElementById('bookshelf-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onOpenCharacterDetail={(char) => setSelectedCharacter(char)}
        isSfxOn={audioSettings.isSfxOn}
        sfxVolume={audioSettings.sfxVolume}
        onToast={showToast}
      />

      <MessageBoardModal
        isOpen={isMessageBoardOpen}
        onClose={() => setIsMessageBoardOpen(false)}
        notes={boardNotes}
        onAddNote={handleAddBoardNote}
        onEditNote={handleEditBoardNote}
        onLikeNote={handleLikeBoardNote}
        onPinNote={handlePinBoardNote}
        onHideNote={handleHideBoardNote}
        onDeleteNote={handleDeleteBoardNote}
        isAdmin={isAdminOpen}
      />

      <RandomCharacterModal
        isOpen={isRandomOpen}
        onClose={() => setIsRandomOpen(false)}
        characters={publicCharacters}
        onSelectCharacter={(c) => handleSelectCharacter(c)}
        onVote={handleVote}
        onToggleFavorite={handleToggleFavorite}
        favoriteIds={activeFavoriteCharacterIds}
      />

      <AudioSettingsModal
        isOpen={isAudioSettingsOpen}
        onClose={() => setIsAudioSettingsOpen(false)}
        settings={audioSettings}
        onUpdateSettings={handleUpdateAudioSettings}
      />

      <BakeryGameModal
        isOpen={isBakeryOpen}
        onClose={() => setIsBakeryOpen(false)}
        isSfxOn={audioSettings.isSfxOn}
        sfxVolume={audioSettings.sfxVolume}
      />

      <OceanAtmosphere
        themeMode={theme}
      />

      <AudioPlayer
        settings={audioSettings}
      />

      {/* 4. Floating Back to Top Button */}
      <BackToTop />
    </div>
  );
}


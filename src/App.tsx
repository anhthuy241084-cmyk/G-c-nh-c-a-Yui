import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Heart, Sparkles, AlertCircle, BookOpen, MessageSquare, ExternalLink, ShieldCheck, Check, Flame } from 'lucide-react';
import { Character, GenreTag, ThemeMode, AppNotification, AudioSettings, BoardNote, CharacterBookmark, BookmarkPaperStyle, BookmarkTailDecor, UserProfile, DEFAULT_USER_PROFILE, BadgeId, ACHIEVEMENT_REWARDS, PromptCommand, ContactLink, HelpCenterConfig, DEFAULT_HELP_CENTER_CONFIG, WishingBottle, MemoryGalleryPost, WhisperPost } from './types';
import { INITIAL_CHARACTERS } from './data/characters';
import { IntroLoadingScreen } from './components/IntroLoadingScreen';
import { SplashScreen } from './components/SplashScreen';
import { Header } from './components/Header';
import { WinterAnnouncementBanner } from './components/WinterAnnouncementBanner';
import { WinterWelcomeFrame } from './components/WinterWelcomeFrame';
import { SnowBookmarkModal } from './components/SnowBookmarkModal';
import { SnowfallBackground } from './components/SnowfallBackground';
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
import { WinterMusicBoxModal } from './components/WinterMusicBoxModal';
import { SnowGameModal } from './components/SnowGameModal';
import { OceanArchipelagoModal } from './components/OceanArchipelagoModal';
import { AudioPlayer } from './components/AudioPlayer';
import { ProfileModal } from './components/ProfileModal';
import { BackToTop } from './components/BackToTop';
import { EasterEggParticles, Particle } from './components/EasterEggParticles';
import { StarPageTransition } from './components/StarPageTransition';
import { SnowCursorEffect } from './components/SnowCursorEffect';
import { DonateMailboxModal } from './components/DonateMailboxModal';
import { MemoryGalleryModal } from './components/MemoryGalleryModal';
import { WhisperQuotesModal } from './components/WhisperQuotesModal';
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
  subscribeHelpCenterConfig,
} from './services/helpCenterService';
import {
  subscribeWishingBottles,
} from './services/wishingBottleService';
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
import { subscribeMemoryGalleryPosts } from './services/memoryGalleryService';
import { subscribeWhisperPosts } from './services/whisperService';

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-welcome',
    title: 'Chào mừng bạn đến với Hộp Ký Ức Mùa Đông! ❄️',
    content: 'Tất cả character AI đều được Yui sáng tạo và chăm chút kỹ lưỡng. Hãy khám phá danh sách nhân vật, gửi request hoặc ghé Góc Cập Nhật Mới ở đầu trang để theo dõi tin mới nhất nhé!',
    createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN'),
    isRead: false,
    type: 'announcement',
  },
];

export default function App() {
  // Intro Page (Hộp Ký Ức Mùa Đông) full-screen state
  const [showIntro, setShowIntro] = useState<boolean>(true);

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
  const [isWishingBottleOpen, setIsWishingBottleOpen] = useState(false);
  const [isCommandLibraryOpen, setIsCommandLibraryOpen] = useState(false);
  const [isFortuneOpen, setIsFortuneOpen] = useState(false);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [isMusicBoxOpen, setIsMusicBoxOpen] = useState(false);
  const [isArchipelagoOpen, setIsArchipelagoOpen] = useState(false);
  const [isSnowBookmarksOpen, setIsSnowBookmarksOpen] = useState(false);
  const [isDonateMailboxOpen, setIsDonateMailboxOpen] = useState(false);
  const [isMemoryGalleryOpen, setIsMemoryGalleryOpen] = useState(false);
  const [isWhisperQuotesOpen, setIsWhisperQuotesOpen] = useState(false);
  const [adminAuthTarget, setAdminAuthTarget] = useState<'admin_panel' | 'inline_unlock'>('admin_panel');

  // Wishing Bottles state (Hải Lưu & Chai Ước Nguyện)
  const [wishingBottles, setWishingBottles] = useState<WishingBottle[]>([]);

  // Help Center Handbook configuration state
  const [helpCenterConfig, setHelpCenterConfig] = useState<HelpCenterConfig>(DEFAULT_HELP_CENTER_CONFIG);

  // Commands Library states
  const [commands, setCommands] = useState<PromptCommand[]>([]);

  // Contacts states
  const [contacts, setContacts] = useState<ContactLink[]>([]);

  // Lầu Tuyết Họa Ký & Nhặt Cánh Tuyết Rơi states
  const [memoryGalleryPosts, setMemoryGalleryPosts] = useState<MemoryGalleryPost[]>([]);
  const [whisperPosts, setWhisperPosts] = useState<WhisperPost[]>([]);

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
  const [isSnowGameOpen, setIsSnowGameOpen] = useState(false);
  const [claimedStreakRewards, setClaimedStreakRewards] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('yui_claimed_streak_rewards');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const handleClaimStreakReward = (rewardName: string) => {
    const isAlreadyClaimed = claimedStreakRewards.includes(rewardName);
    if (!isAlreadyClaimed) {
      const updated = [...claimedStreakRewards, rewardName];
      setClaimedStreakRewards(updated);
      try {
        localStorage.setItem('yui_claimed_streak_rewards', JSON.stringify(updated));
      } catch (e) {}

      // Grant real profile customizations matching the milestone or snow game reward
      let nextFrame = userProfile.avatarFrame;
      let nextDecoration = userProfile.decoration;

      if (rewardName === 'Bông Tuyết Đầu Mùa') {
        if (nextFrame === 'none') nextFrame = 'winter';
      } else if (rewardName === 'Khăn Len Mùa Đông') {
        if (nextFrame === 'none') nextFrame = 'cozy_room';
      } else if (rewardName === 'Quả Cầu Tuyết Kỷ Niệm') {
        nextDecoration = 'snow';
      } else if (rewardName === 'Quả Cầu Pha Lê Mùa Đông') {
        nextDecoration = 'sparkles';
        if (nextFrame === 'none') nextFrame = 'winter';
      }

      const updatedGifts = Array.from(new Set([...(userProfile.claimedGifts || []), rewardName]));
      handleSaveUserProfile({
        ...userProfile,
        avatarFrame: nextFrame,
        decoration: nextDecoration,
        claimedGifts: updatedGifts,
        updatedAt: new Date().toISOString(),
      });

      showToast(`🎁 Đã nhận phần thưởng "${rewardName}" vào Hồ Sơ của bạn!`);
    }
  };

  const handleClaimAchievementReward = (badgeId: BadgeId) => {
    const reward = ACHIEVEMENT_REWARDS[badgeId];
    if (!reward) return;

    const alreadyClaimed = (userProfile.claimedAchievements || []).includes(badgeId);
    if (alreadyClaimed) return;

    const updatedAchievements = Array.from(new Set([...(userProfile.claimedAchievements || []), badgeId]));
    const updatedGifts = Array.from(new Set([...(userProfile.claimedGifts || []), reward.giftName]));
    const nextFrame = reward.frameId && userProfile.avatarFrame === 'none' ? reward.frameId : userProfile.avatarFrame;
    const nextDecoration = reward.decoration && userProfile.decoration === 'none' ? reward.decoration : userProfile.decoration;

    handleSaveUserProfile({
      ...userProfile,
      avatarFrame: nextFrame,
      decoration: nextDecoration,
      claimedAchievements: updatedAchievements,
      claimedGifts: updatedGifts,
      updatedAt: new Date().toISOString(),
    });
    showToast(`🎁 Đã nhận quà thành tựu "${reward.giftName}" vào Hồ Sơ của bạn!`);
  };

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

  // List of excluded characters requested to be deleted by user
  const isExcludedCharacter = (char: Character): boolean => {
    const terms = [
      'harry potter',
      'dược sư tự sự',
      'showbiz hàn',
      'steven universe',
      '5 cánh hoa anh đào',
      'f5 conan',
      'văn hào lưu lạc',
      'mộ dạ hàn',
      'cedric von ravencrest',
    ];
    const name = (char.name || '').toLowerCase();
    const id = (char.id || '').toLowerCase();
    const title = (char.title || '').toLowerCase();
    return terms.some((t) => name.includes(t) || id.includes(t) || title.includes(t));
  };

  // Characters Data state
  const [characters, setCharacters] = useState<Character[]>(() => {
    const saved = localStorage.getItem('yui_characters');
    if (saved) {
      try {
        const parsed: Character[] = JSON.parse(saved);
        const filtered = parsed.filter((c) => !isExcludedCharacter(c));
        localStorage.setItem('yui_characters', JSON.stringify(filtered));
        return filtered;
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
  const [notificationTab, setNotificationTab] = useState<'notifications' | 'favorites'>('favorites');
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

    // 1. Subscribe to Characters in Firestore (auto-seeds INITIAL_CHARACTERS if empty & sorts newest first)
    const unsubChars = subscribeCharacters(
      (remoteChars) => {
        if (remoteChars) {
          const cleanChars = remoteChars.filter((c) => !isExcludedCharacter(c));
          setCharacters(cleanChars);
          try {
            localStorage.setItem('yui_characters', JSON.stringify(cleanChars));
          } catch (e) {
            console.warn('LocalStorage save character notice:', e);
          }
        }
      },
      (err) => console.warn('Firestore characters subscription notice:', err),
      INITIAL_CHARACTERS
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

    // 9. Subscribe to Lầu Tuyết Họa Ký (Memory Gallery Posts)
    const unsubMemoryGallery = subscribeMemoryGalleryPosts(
      (remotePosts) => {
        setMemoryGalleryPosts(remotePosts);
      },
      (err) => console.warn('Firestore memory gallery subscription notice:', err)
    );

    // 10. Subscribe to Nhặt Cánh Tuyết Rơi (Whisper Quotes)
    const unsubWhispers = subscribeWhisperPosts(
      (remoteWhispers) => {
        setWhisperPosts(remoteWhispers);
      },
      (err) => console.warn('Firestore whispers subscription notice:', err)
    );

    return () => {
      unsubChars();
      unsubNotes();
      unsubNotifs();

      unsubHelpCenter();
      unsubWishingBottles();
      unsubCommands();
      unsubContacts();
      unsubMemoryGallery();
      unsubWhispers();
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


  // Trigger Easter Egg Particles (Winter Snowflakes & Crystal Stars)
  const handleTriggerEasterEgg = (x: number, y: number) => {
    const symbols = ['❄', '✦', '✧', '˚₊‧', '୨୧', '💎', '❅', '⋆'];
    const colors = ['#91A9BC', '#526B80', '#D5E4EF', '#E8F1F8', '#F7FAFD', '#A9BDCE', '#C7D2FE'];
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

  // Persistent dismissed announcement IDs so read/acknowledged alerts never reappear on reload
  const [dismissedNotifIds, setDismissedNotifIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('yui_dismissed_notif_ids');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Notification handlers
  const handleSendNotification = async (
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
    try {
      await addNotificationToFirestore(newNotif);
    } catch (e) {
      console.error('Error syncing notification to Firestore:', e);
      showToast('⚠️ Thông báo đã hiển thị cục bộ nhưng chưa đồng bộ được lên Cloud.');
    }
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

  const handleDismissBannerNotification = (id: string) => {
    setDismissedNotifIds((prev) => {
      const updated = Array.from(new Set([...prev, id]));
      try {
        localStorage.setItem('yui_dismissed_notif_ids', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    handleMarkAsRead(id);
  };

  const unreadBannerAnnouncements = useMemo(
    () => notifications.filter((n) => !dismissedNotifIds.includes(n.id) && !n.isRead),
    [notifications, dismissedNotifIds]
  );

  const handleDismissAllBannerNotifications = () => {
    const idsToDismiss = unreadBannerAnnouncements.map((n) => n.id);
    if (idsToDismiss.length === 0) return;
    setDismissedNotifIds((prev) => {
      const updated = Array.from(new Set([...prev, ...idsToDismiss]));
      try {
        localStorage.setItem('yui_dismissed_notif_ids', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    handleMarkAllAsRead();
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    deleteNotificationFromFirestore(id);
  };

  const unreadNotificationCount = useMemo(
    () => unreadBannerAnnouncements.length,
    [unreadBannerAnnouncements]
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
      createdAt: new Date().toISOString(),
    };
    setCharacters((prev) => [newChar, ...prev]);
    try {
      await saveCharacterToFirestore(newChar);
      showToast('🎉 Đã đồng bộ nhân vật lên đám mây công khai cho mọi người!');
    } catch (e) {
      console.error('Error saving character to Firestore:', e);
      showToast('⚠️ Chưa lưu được lên Cloud Firestore (kiểm tra kích thước ảnh hoặc kết nối).');
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
      
      {/* Custom Winter Crystal Pointer & Frost Trail */}
      <SnowCursorEffect />

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

      {/* Ambient Winter Snowfall throughout Homepage */}
      <SnowfallBackground
        settings={{ isEnabled: true, density: 'medium', speed: 'slow', opacity: 'medium' }}
        themeMode={theme}
      />

      {/* 2. Main Application Interface */}
      <div className="flex flex-col min-h-screen relative z-10">
        
        {/* Top Sticky Header & Toolbar */}
        <Header
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenContact={() => setIsContactOpen(true)}
          onOpenVoting={() => setIsVotingOpen(true)}
          onOpenAdmin={() => {
            setAdminAuthTarget('admin_panel');
            if (isAdminLoggedIn) {
              setIsAdminOpen(true);
            } else {
              setIsAdminAuthOpen(true);
            }
          }}
          onOpenMessageBoard={() => setIsMessageBoardOpen(true)}
          onOpenAudioSettings={() => setIsAudioSettingsOpen(true)}
          unreadNotificationCount={unreadNotificationCount}
          onOpenNotifications={() => {
            setNotificationTab('favorites');
            setIsNotificationsOpen(true);
          }}
          noteCount={boardNotes.length}
          onOpenRandom={() => setIsRandomOpen(true)}
          onOpenBookmarks={() => setIsSnowBookmarksOpen(true)}
          onReopenIntro={() => setShowIntro(true)}
          bookmarkCount={Object.keys(bookmarks).length}
          favoriteCount={activeFavoriteCharacterIds.length}
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
          onOpenSnowGame={() => setIsSnowGameOpen(true)}
          onOpenDonateMailbox={() => setIsDonateMailboxOpen(true)}
          onOpenMemoryGallery={() => setIsMemoryGalleryOpen(true)}
          onOpenWhisperQuotes={() => setIsWhisperQuotesOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 space-y-4 sm:space-y-7">
          
          {/* 🔔 Góc Cập Nhật Mới của Yui (tự ẩn vĩnh viễn sau khi đã xem cho tới khi có tin mới) */}
          <WinterAnnouncementBanner
            unreadAnnouncements={unreadBannerAnnouncements}
            totalAnnouncementsCount={notifications.length}
            onDismissNotification={handleDismissBannerNotification}
            onDismissAll={handleDismissAllBannerNotifications}
            onSelectCharacterById={(characterId) => {
              const found = publicCharacters.find((c) => c.id === characterId);
              if (found) handleSelectCharacter(found);
            }}
            isSfxOn={audioSettings.isSfxOn}
            sfxVolume={audioSettings.sfxVolume}
          />

          {/* ❄️ Khung giới thiệu Yui — Unboxed Editorial Winter Masthead */}
          <WinterWelcomeFrame
            characters={publicCharacters}
            onSelectCharacter={(char, openStory) => {
              setSelectedCharacterOpenStory(!!openStory);
              handleSelectCharacter(char);
            }}
            onGoToGgai={(char, url) => handleGoToGgai(char, url)}
            onSelectTag={handleSelectTag}
            streakCount={currentStreak}
            onOpenStreak={() => setIsStreakOpen(true)}
            onOpenRandom={() => setIsRandomOpen(true)}
            onOpenFortune={() => setIsFortuneOpen(true)}
            onOpenDonateMailbox={() => setIsDonateMailboxOpen(true)}
            onOpenCreatorRequest={() => setIsCreatorRequestOpen(true)}
            onOpenVoting={() => setIsVotingOpen(true)}
            onOpenMessageBoard={() => setIsMessageBoardOpen(true)}
            onOpenSnowGame={() => setIsSnowGameOpen(true)}
            audioSettings={audioSettings}
            onUpdateAudioSettings={handleUpdateAudioSettings}
          />

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
                className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-24px)] px-4 sm:px-5 py-2.5 rounded-2xl bg-[#172536]/95 text-white text-xs font-bold shadow-2xl backdrop-blur-xl flex items-center gap-2 border border-[#91A9BC]/40 font-serif"
              >
                <Check className="w-4 h-4 text-[#A9BDCE] shrink-0" />
                <span className="text-white truncate">{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Custom Loading Screen when loading transitions happen */}
          <CustomLoadingScreen isLoading={isGlobalLoading} />

          {/* Character Grid Cards List or Custom Empty State */}
          {filteredCharacters.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-[368px] mx-auto sm:max-w-none">
              {filteredCharacters.map((char, idx) => (
                <CharacterCard
                  key={char.id}
                  character={char}
                  onSelect={(c) => handleSelectCharacter(c)}
                  onGoToGgai={(c, url) => handleGoToGgai(c, url)}
                  onVote={handleVote}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={!!favorites[char.id] || !!char.isFavorite}
                  isBookmarked={!!bookmarks[char.id]}
                  onToggleBookmark={(id) => handleToggleBookmark(id)}
                  onTagClick={(tag) => handleSelectTag(tag)}
                  orderIndex={idx}
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
        <footer className="mt-12 py-8 border-t border-[#DCE7EF] dark:border-[#43576B] text-center text-xs text-[#91A9BC] dark:text-[#A9BDCE]">
          <div className="max-w-7xl mx-auto px-4 space-y-2 font-serif">
            <p className="font-medium text-[#526B80] dark:text-[#E5EDF5]">
              Hộp Ký Ức Mùa Đông (Winter Memory Box) · Yui ୨୧
            </p>
            <p className="text-[11px] text-[#91A9BC]">
              Một góc nhỏ cất giữ những câu chuyện và nhân vật tưởng tượng giữa mùa đông yên bình
            </p>
            <div className="pt-2">
              <button
                id="footer-admin-btn"
                onClick={() => setIsAdminAuthOpen(true)}
                className="text-[11px] text-[#91A9BC] hover:text-[#526B80] dark:hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
                title="Quản lý & Sáng tạo"
              >
                <span>❄ Quản lý &amp; Sáng tạo</span>
              </button>
            </div>
          </div>
        </footer>

      </div>

      {/* 3. Dialog Modals */}
      <SnowBookmarkModal
        isOpen={isSnowBookmarksOpen}
        onClose={() => setIsSnowBookmarksOpen(false)}
        bookmarks={bookmarks}
        characters={characters}
        onSelectCharacter={(c) => handleSelectCharacter(c)}
        onToggleBookmark={(id) => handleToggleBookmark(id)}
        onVote={handleVote}
      />

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
        onSelectCharacter={(c) => handleSelectCharacter(c)}
        isSfxOn={audioSettings.isSfxOn}
        sfxVolume={audioSettings.sfxVolume}
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
          if (adminAuthTarget === 'admin_panel') {
            setIsAdminOpen(true);
          } else {
            showToast('✨ Đã xác thực quyền Quản trị viên (Yui)!');
          }
          setAdminAuthTarget('admin_panel');
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

      {/* Feature: 🎶 Hộp Nhạc Tuyết & Không Gian Mùa Đông */}
      <WinterMusicBoxModal
        isOpen={isMusicBoxOpen}
        onClose={() => setIsMusicBoxOpen(false)}
        isSfxOn={audioSettings.isSfxOn}
        sfxVolume={audioSettings.sfxVolume}
      />

      {/* Trò chơi: Săn Ký Ức Tuyết Rơi */}
      <SnowGameModal
        isOpen={isSnowGameOpen}
        onClose={() => setIsSnowGameOpen(false)}
        onRewardClaimed={handleClaimStreakReward}
        claimedRewards={claimedStreakRewards}
        isSfxOn={audioSettings.isSfxOn}
        sfxVolume={audioSettings.sfxVolume}
        onToast={showToast}
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
        onClaimReward={handleClaimStreakReward}
        claimedRewards={claimedStreakRewards}
        onToast={showToast}
        isSfxOn={audioSettings.isSfxOn}
        sfxVolume={audioSettings.sfxVolume}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={userProfile}
        onSaveProfile={handleSaveUserProfile}
        favoriteCharacterIds={activeFavoriteCharacterIds}
        bookmarks={Object.values(bookmarks)}
        allCharacters={publicCharacters}
        claimedRewards={claimedStreakRewards}
        streakCount={currentStreak}
        isNightMode={theme === 'dark'}
        onSelectFavoriteFilter={() => {
          setNotificationTab('favorites');
          setIsNotificationsOpen(true);
        }}
        onSelectBookmarkFilter={() => {
          const el = document.getElementById('bookshelf-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onOpenCharacterDetail={(char) => setSelectedCharacter(char)}
        onClaimAchievementReward={handleClaimAchievementReward}
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
        isAdmin={isAdminLoggedIn}
      />

      <RandomCharacterModal
        isOpen={isRandomOpen}
        onClose={() => setIsRandomOpen(false)}
        characters={publicCharacters}
        onSelectCharacter={(c) => handleSelectCharacter(c)}
        onVote={handleVote}
        onToggleFavorite={handleToggleFavorite}
        favoriteIds={activeFavoriteCharacterIds}
        isSfxOn={audioSettings.isSfxOn}
        sfxVolume={audioSettings.sfxVolume}
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

      <AudioPlayer
        settings={audioSettings}
      />

      {/* Góc Ủng Hộ Yui & Hòm Thư Mùa Đông */}
      <DonateMailboxModal
        isOpen={isDonateMailboxOpen}
        onClose={() => setIsDonateMailboxOpen(false)}
        isSfxOn={audioSettings.isSfxOn}
        sfxVolume={audioSettings.sfxVolume}
        onToast={showToast}
      />

      {/* Lầu Tuyết Họa Ký — Lưu trữ đoạn chat, fanart & phản hồi bài nhau */}
      <MemoryGalleryModal
        isOpen={isMemoryGalleryOpen}
        onClose={() => setIsMemoryGalleryOpen(false)}
        posts={memoryGalleryPosts}
        characters={publicCharacters}
        userProfile={userProfile}
        isAdmin={isAdminLoggedIn}
        isSfxOn={audioSettings.isSfxOn}
        sfxVolume={audioSettings.sfxVolume}
        onToast={showToast}
      />

      {/* Nhặt Cánh Tuyết Rơi — Quote ngẫu hứng & đoạn viết của Yui */}
      <WhisperQuotesModal
        isOpen={isWhisperQuotesOpen}
        onClose={() => setIsWhisperQuotesOpen(false)}
        posts={whisperPosts}
        userProfile={userProfile}
        isAdmin={isAdminLoggedIn}
        onRequireAdmin={() => {
          setAdminAuthTarget('inline_unlock');
          setIsAdminAuthOpen(true);
        }}
        isSfxOn={audioSettings.isSfxOn}
        sfxVolume={audioSettings.sfxVolume}
        onToast={showToast}
      />

      {/* 4. Floating Back to Top Button */}
      <BackToTop />
    </div>
  );
}


import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { subscribeSuggestedAvatars, SuggestedAvatar } from '../services/suggestedAvatarService';
import {
  X,
  Edit3,
  Camera,
  Sparkles,
  Heart,
  Bookmark,
  Gift,
  Download,
  RotateCcw,
  Trash2,
  Check,
  ZoomIn,
  Palette,
  Eye,
  EyeOff,
  Star,
  Quote,
  Award,
  Snowflake,
  Lock,
  User,
} from 'lucide-react';
import {
  UserProfile,
  DEFAULT_USER_PROFILE,
  ProfileTheme,
  ProfileDecoration,
  AvatarFrame,
  BadgeId,
  APP_BADGES,
  ACHIEVEMENT_REWARDS,
  Character,
  GenreTag,
  PRESET_TAGS,
  CharacterBookmark,
} from '../types';
import { triggerSfx } from '../utils/sfx';
import { triggerHeartConfetti } from '../utils/confetti';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  favoriteCharacterIds: string[];
  bookmarks: CharacterBookmark[];
  allCharacters: Character[];
  claimedRewards?: string[];
  streakCount?: number;
  isNightMode?: boolean;
  onSelectFavoriteFilter?: () => void;
  onSelectBookmarkFilter?: () => void;
  onOpenCharacterDetail?: (character: Character) => void;
  onClaimAchievementReward?: (badgeId: BadgeId) => void;
  isSfxOn?: boolean;
  sfxVolume?: number;
  onToast?: (msg: string) => void;
}

type ProfileTab = 'overview' | 'achievements' | 'edit';

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  favoriteCharacterIds,
  bookmarks,
  allCharacters,
  claimedRewards = [],
  streakCount = 1,
  isNightMode = false,
  onSelectFavoriteFilter,
  onSelectBookmarkFilter,
  onOpenCharacterDetail,
  onClaimAchievementReward,
  isSfxOn = true,
  sfxVolume = 0.5,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  const [suggestedAvatarsList, setSuggestedAvatarsList] = useState<SuggestedAvatar[]>([]);
  const [avatarRingPulse, setAvatarRingPulse] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSavedGlow, setIsSavedGlow] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeSuggestedAvatars((avatars) => {
      setSuggestedAvatarsList(avatars);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setEditedProfile({
        ...DEFAULT_USER_PROFILE,
        ...profile,
        claimedAchievements: profile.claimedAchievements || [],
        claimedGifts: profile.claimedGifts || [],
      });
      setActiveTab('overview');
      setIsResetConfirmOpen(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  // Dynamic achievement unlock evaluation
  const unlockedBadges: BadgeId[] = ['first_visit'];
  if (favoriteCharacterIds.length > 0 || bookmarks.length > 0) {
    unlockedBadges.push('bookmarker');
  }
  if (favoriteCharacterIds.length >= 3) {
    unlockedBadges.push('collector');
  }
  if (isNightMode || profile.profileTheme === 'night-sky' || profile.profileTheme === 'dark') {
    unlockedBadges.push('night_owl');
  }
  try {
    if (localStorage.getItem('yui_easter_egg_found') === 'true') {
      unlockedBadges.push('explorer');
    }
    if (localStorage.getItem('yui_bakery_played') === 'true') {
      unlockedBadges.push('baker');
    }
    const storedStreak = parseInt(localStorage.getItem('yui_streak_count') || '0', 10);
    if (Math.max(streakCount, storedStreak) >= 3) {
      unlockedBadges.push('streak_master');
    }
  } catch {}

  const claimedAchievements: BadgeId[] = profile.claimedAchievements || [];
  const allSouvenirGifts = Array.from(
    new Set([
      ...(profile.claimedGifts || []),
      ...claimedRewards,
      ...claimedAchievements.map((b) => ACHIEVEMENT_REWARDS[b]?.giftName).filter(Boolean),
    ])
  );

  const isEditing = activeTab === 'edit';
  const currentTheme = isEditing ? editedProfile.profileTheme : profile.profileTheme;
  const currentDecoration = isEditing ? editedProfile.decoration : profile.decoration;
  const currentFrame = isEditing ? editedProfile.avatarFrame : profile.avatarFrame;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      if (onToast) onToast('⚠️ Ảnh hơi lớn, bạn vui lòng chọn ảnh dưới 3MB nhé!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setEditedProfile((prev) => ({ ...prev, avatar: base64 }));
      setAvatarRingPulse(true);
      if (isSfxOn) triggerSfx('chime', sfxVolume);
      setTimeout(() => setAvatarRingPulse(false), 1100);
      if (onToast) onToast('✨ Đã tải avatar mới lên!');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setEditedProfile((prev) => ({ ...prev, avatar: null, avatarZoom: 1 }));
    setAvatarRingPulse(true);
    if (isSfxOn) triggerSfx('sparkle', sfxVolume);
    setTimeout(() => setAvatarRingPulse(false), 900);
    if (onToast) onToast('✦ Đã trở lại avatar bông tuyết mặc định');
  };

  const handleSave = () => {
    setIsSavedGlow(true);
    if (isSfxOn) triggerSfx('chime', sfxVolume);

    const finalized: UserProfile = {
      ...editedProfile,
      name: editedProfile.name.trim() || 'Tên của bạn',
      unlockedBadges: Array.from(new Set([...unlockedBadges, ...(editedProfile.unlockedBadges || [])])),
      updatedAt: new Date().toISOString(),
    };

    onSaveProfile(finalized);
    if (onToast) onToast('❄ Đã lưu hồ sơ mùa đông của bạn!');

    setTimeout(() => {
      setIsSavedGlow(false);
      setActiveTab('overview');
    }, 600);
  };

  const handleResetProfile = () => {
    const resetData: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      unlockedBadges,
      claimedAchievements: profile.claimedAchievements || [],
      claimedGifts: profile.claimedGifts || [],
    };
    setEditedProfile(resetData);
    onSaveProfile(resetData);
    setIsResetConfirmOpen(false);
    setActiveTab('overview');
    setAvatarRingPulse(true);
    if (isSfxOn) triggerSfx('chime', sfxVolume);
    setTimeout(() => setAvatarRingPulse(false), 900);
    if (onToast) onToast('✦ Hồ sơ đã trở về trạng thái mặc định');
  };

  const handleClaimAchievement = (badgeId: BadgeId) => {
    if (!unlockedBadges.includes(badgeId) || claimedAchievements.includes(badgeId)) return;

    const reward = ACHIEVEMENT_REWARDS[badgeId];
    if (isSfxOn) triggerSfx('sparkle', sfxVolume);
    triggerHeartConfetti();

    const nextClaimed = Array.from(new Set([...claimedAchievements, badgeId]));
    const nextGifts = Array.from(new Set([...(profile.claimedGifts || []), reward.giftName]));
    const nextSelectedBadges = Array.from(new Set([...(profile.selectedBadges || []), badgeId])).slice(0, 3);

    const updated: UserProfile = {
      ...profile,
      unlockedBadges: Array.from(new Set([...unlockedBadges, ...(profile.unlockedBadges || [])])),
      claimedAchievements: nextClaimed,
      claimedGifts: nextGifts,
      selectedBadges: nextSelectedBadges,
      avatarFrame: profile.avatarFrame === 'none' && reward.frameId ? reward.frameId : profile.avatarFrame,
      updatedAt: new Date().toISOString(),
    };

    onSaveProfile(updated);
    setEditedProfile(updated);

    if (onClaimAchievementReward) {
      onClaimAchievementReward(badgeId);
    }

    if (onToast) {
      onToast(`🎁 Đã nhận quà thành tựu "${reward.giftName}" (${reward.frameLabel || ''})!`);
    }
  };

  const handleEquipFrame = (frameId: AvatarFrame, label: string) => {
    const updated: UserProfile = {
      ...profile,
      avatarFrame: frameId,
      updatedAt: new Date().toISOString(),
    };
    onSaveProfile(updated);
    setEditedProfile(updated);
    if (isSfxOn) triggerSfx('pop', sfxVolume);
    if (onToast) onToast(`✦ Đã trang bị khung: ${label}`);
  };

  const handleDownloadMyData = () => {
    try {
      const exportObject = {
        exportedAt: new Date().toISOString(),
        profile: {
          name: profile.name,
          bio: profile.bio,
          profileTheme: profile.profileTheme,
          avatarFrame: profile.avatarFrame,
          decoration: profile.decoration,
          favoriteTags: profile.favoriteTags,
          favoriteQuote: profile.favoriteQuote,
          isPublic: profile.isPublic,
          selectedBadges: profile.selectedBadges,
          claimedAchievements,
          claimedGifts: allSouvenirGifts,
        },
        savedFavoritesCount: favoriteCharacterIds.length,
        favoriteCharacterIds,
        bookmarksCount: bookmarks.length,
        bookmarks,
        unlockedBadges,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `yui_winter_profile_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      if (isSfxOn) triggerSfx('chime', sfxVolume);
      if (onToast) onToast('📥 Đã tải xuống hồ sơ và bộ sưu tập của bạn!');
    } catch {
      if (onToast) onToast('⚠️ Không thể tải dữ liệu, vui lòng thử lại sau.');
    }
  };

  // Powder Blue Winter Palette & Theme Mapping
  const getThemeStyles = (theme: ProfileTheme) => {
    switch (theme) {
      case 'dark':
        return {
          cardBg: 'bg-[#172536] text-[#E5EDF5] border-[#43576B]',
          heroBg: 'bg-gradient-to-br from-[#202F42] via-[#1A283B] to-[#172536] border-[#43576B]',
          deskBg: 'bg-[#0E1726]/85',
          innerBg: 'bg-[#202F42]/80 border-[#43576B]',
          accent: 'text-[#A9BDCE]',
          muted: 'text-[#91A9BC]',
          statCard: 'bg-[#202F42]/90 border-[#43576B] hover:border-[#91A9BC]',
          buttonPrimary: 'bg-gradient-to-r from-[#91A9BC] to-[#526B80] hover:opacity-95 text-white',
          chipBg: 'bg-[#354A60]/70 text-[#E5EDF5] border-[#43576B]',
        };
      case 'night-sky':
        return {
          cardBg: 'bg-gradient-to-b from-[#131E2E] via-[#172536] to-[#1D2D42] text-[#E5EDF5] border-[#43576B]',
          heroBg: 'bg-gradient-to-br from-[#23334B] via-[#1A283C] to-[#131E2E] border-[#43576B]',
          deskBg: 'bg-[#0A111C]/90',
          innerBg: 'bg-[#202F42]/75 border-[#43576B]',
          accent: 'text-[#D5E4EF]',
          muted: 'text-[#A9BDCE]',
          statCard: 'bg-[#202F42]/80 border-[#43576B] hover:border-[#A9BDCE]',
          buttonPrimary: 'bg-gradient-to-r from-[#91A9BC] to-[#526B80] hover:opacity-95 text-white',
          chipBg: 'bg-[#354A60]/70 text-[#E5EDF5] border-[#43576B]',
        };
      case 'soft-paper':
        return {
          cardBg: 'bg-gradient-to-b from-[#FAF8F4] via-[#F4EFE6] to-[#EDE5D8] text-[#4B443B] border-[#DFD5C5]',
          heroBg: 'bg-gradient-to-br from-[#F7FAFD] via-[#EFEAE0] to-[#E6DEC8]/60 border-[#DFD5C5]',
          deskBg: 'bg-[#172536]/75',
          innerBg: 'bg-white/80 border-[#E5DEC9]',
          accent: 'text-[#6E6254]',
          muted: 'text-[#8C7F6E]',
          statCard: 'bg-white/90 border-[#E5DEC9] hover:border-[#91A9BC]',
          buttonPrimary: 'bg-gradient-to-r from-[#91A9BC] to-[#526B80] hover:opacity-95 text-white',
          chipBg: 'bg-[#EDE5D8] text-[#5C5144] border-[#D8CBB8]',
        };
      case 'spring':
        return {
          cardBg: 'bg-gradient-to-b from-[#FFF9FB] via-[#FDF2F6] to-[#F7FAFD] text-[#526B80] border-[#F0D5DF]',
          heroBg: 'bg-gradient-to-br from-[#FCECF2] via-[#F7FAFD] to-[#E8F1F8] border-[#EED5E0]',
          deskBg: 'bg-[#172536]/75',
          innerBg: 'bg-white/85 border-[#F0DCE4]',
          accent: 'text-[#526B80]',
          muted: 'text-[#91A9BC]',
          statCard: 'bg-white/95 border-[#F0DCE4] hover:border-[#91A9BC]',
          buttonPrimary: 'bg-gradient-to-r from-[#91A9BC] to-[#526B80] hover:opacity-95 text-white',
          chipBg: 'bg-[#FCECF2] text-[#785363] border-[#F0D5DF]',
        };
      case 'light':
        return {
          cardBg: 'bg-white text-[#526B80] border-[#DCE7EF]',
          heroBg: 'bg-gradient-to-br from-[#F7FAFD] to-[#E8F1F8] border-[#DCE7EF]',
          deskBg: 'bg-[#172536]/75',
          innerBg: 'bg-[#F7FAFD] border-[#DCE7EF]',
          accent: 'text-[#526B80]',
          muted: 'text-[#91A9BC]',
          statCard: 'bg-[#F7FAFD] border-[#DCE7EF] hover:border-[#91A9BC]',
          buttonPrimary: 'bg-gradient-to-r from-[#91A9BC] to-[#526B80] hover:opacity-95 text-white',
          chipBg: 'bg-[#E8F1F8] text-[#526B80] border-[#DCE7EF]',
        };
      case 'winter':
      default:
        return {
          cardBg: 'bg-gradient-to-b from-[#F7FAFD] via-[#EEF4FA] to-[#E8F1F8] text-[#526B80] border-[#DCE7EF]',
          heroBg: 'bg-gradient-to-br from-[#E8F1F8] via-[#F7FAFD] to-[#DCE7EF]/80 border-[#DCE7EF]',
          deskBg: 'bg-[#172536]/80',
          innerBg: 'bg-white/85 border-[#DCE7EF]',
          accent: 'text-[#526B80]',
          muted: 'text-[#91A9BC]',
          statCard: 'bg-white/90 border-[#DCE7EF] hover:border-[#91A9BC]',
          buttonPrimary: 'bg-gradient-to-r from-[#91A9BC] to-[#526B80] hover:opacity-95 text-white shadow-[#526B80]/20',
          chipBg: 'bg-[#E8F1F8] text-[#526B80] border-[#DCE7EF]',
        };
    }
  };

  const themeStyles = getThemeStyles(currentTheme);

  const renderCardAtmosphere = (dec: ProfileDecoration) => {
    if (!dec || dec === 'none') return null;
    const glyph =
      dec === 'snow'
        ? '❄'
        : dec === 'sparkles'
        ? '✨'
        : dec === 'stars'
        ? '✦'
        : dec === 'ribbons'
        ? '୨୧'
        : '🌸';

    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-45">
        {[
          { left: '8%', top: '12%', delay: 0 },
          { left: '88%', top: '16%', delay: 0.4 },
          { left: '16%', top: '72%', delay: 0.8 },
          { left: '82%', top: '76%', delay: 1.1 },
          { left: '50%', top: '8%', delay: 0.2 },
        ].map((pos, idx) => (
          <motion.span
            key={idx}
            animate={{ y: [0, 6, 0], opacity: [0.45, 0.9, 0.45] }}
            transition={{ repeat: Infinity, duration: 3 + idx * 0.4, delay: pos.delay }}
            className="absolute text-xs text-[#91A9BC] dark:text-[#D5E4EF] select-none"
            style={{ left: pos.left, top: pos.top }}
          >
            {glyph}
          </motion.span>
        ))}
      </div>
    );
  };

  // Avatar Frame Decoration Overlay
  const renderFrameDecoration = (frame: AvatarFrame) => {
    switch (frame) {
      case 'moonlit_sea':
        return (
          <div className="absolute -inset-3.5 pointer-events-none z-10 overflow-visible">
            <div className="absolute inset-0 rounded-full border-2 border-[#91A9BC]/80 shadow-[0_0_18px_rgba(145,169,188,0.65)] animate-pulse" />
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-base select-none">🌙</span>
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-sm select-none">❄</span>
            <span className="absolute top-1 -right-2 text-xs text-[#A9BDCE]">✦</span>
          </div>
        );
      case 'ancient_moon':
        return (
          <div className="absolute -inset-3.5 pointer-events-none z-10 overflow-visible">
            <div className="absolute inset-0 rounded-full border-2 border-amber-500/70 shadow-[0_0_16px_rgba(217,119,6,0.4)]" />
            <span className="absolute -top-3 left-2 text-sm select-none">🏮</span>
            <span className="absolute -top-3 right-2 text-sm select-none">🏮</span>
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-sm select-none">📿</span>
          </div>
        );
      case 'little_angel':
        return (
          <div className="absolute -inset-3.5 pointer-events-none z-10 overflow-visible">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-4 rounded-full border-2 border-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.8)] bg-amber-200/20" />
            <div className="absolute inset-0 rounded-full border-2 border-amber-200/85 shadow-[0_0_16px_rgba(251,191,36,0.45)]" />
            <span className="absolute top-1/2 -left-4 -translate-y-1/2 text-base select-none">🪽</span>
            <span className="absolute top-1/2 -right-4 -translate-y-1/2 text-base select-none scale-x-[-1]">🪽</span>
          </div>
        );
      case 'pixel_player':
        return (
          <div className="absolute -inset-3.5 pointer-events-none z-10 overflow-visible">
            <div className="absolute inset-0 rounded-2xl border-2 border-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.65)]" />
            <span className="absolute -top-3 right-1 px-1.5 py-0.5 rounded bg-indigo-500 text-white font-mono font-bold text-[9px] shadow">
              READY 🎮
            </span>
          </div>
        );
      case 'sakura_breeze':
        return (
          <div className="absolute -inset-3.5 pointer-events-none z-10 overflow-visible">
            <div className="absolute inset-0 rounded-full border-2 border-pink-300/80 shadow-[0_0_16px_rgba(244,114,182,0.5)]" />
            <span className="absolute -top-3 -left-2 text-base select-none">🌸</span>
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-sm select-none">🎀</span>
          </div>
        );
      case 'little_cosmos':
        return (
          <div className="absolute -inset-4 pointer-events-none z-10 overflow-visible">
            <div className="absolute inset-0 rounded-full border border-indigo-300/70" />
            <span className="absolute -top-3 right-2 text-sm select-none">🪐</span>
            <span className="absolute -bottom-3 left-2 text-xs select-none">⭐</span>
          </div>
        );
      case 'dear_you':
        return (
          <div className="absolute -inset-3.5 pointer-events-none z-10 overflow-visible">
            <div className="absolute inset-0 rounded-full border-2 border-rose-300/80 shadow-[0_0_15px_rgba(251,113,133,0.45)]" />
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-base select-none">💌</span>
            <span className="absolute -bottom-3 right-1 text-xs select-none">୨୧</span>
          </div>
        );
      case 'cozy_room':
        return (
          <div className="absolute -inset-3.5 pointer-events-none z-10 overflow-visible">
            <div className="absolute inset-0 rounded-full border-2 border-amber-300/75 shadow-[0_0_15px_rgba(252,211,77,0.4)]" />
            <span className="absolute -top-3 -left-2 text-base select-none">🧶</span>
            <span className="absolute -top-3 -right-2 text-base select-none">🧸</span>
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-sm select-none">☕</span>
          </div>
        );
      case 'sweet_bakery':
        return (
          <div className="absolute -inset-3.5 pointer-events-none z-10 overflow-visible">
            <div className="absolute inset-0 rounded-full border-2 border-pink-300 shadow-[0_0_15px_rgba(244,114,182,0.45)]" />
            <span className="absolute -top-3 -right-2 text-base select-none">🍰</span>
            <span className="absolute -bottom-3 -left-2 text-base select-none">🧁</span>
          </div>
        );
      case 'secret_garden':
        return (
          <div className="absolute -inset-3.5 pointer-events-none z-10 overflow-visible">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400/70 shadow-[0_0_15px_rgba(52,211,153,0.45)]" />
            <span className="absolute -top-3 left-2 text-base select-none">🌲</span>
            <span className="absolute -bottom-3 right-2 text-base select-none">❄️</span>
          </div>
        );
      case 'night_train':
        return (
          <div className="absolute -inset-3.5 pointer-events-none z-10 overflow-visible">
            <div className="absolute inset-0 rounded-full border-2 border-[#91A9BC]/80 shadow-[0_0_15px_rgba(145,169,188,0.5)]" />
            <span className="absolute -top-3 right-2 text-base select-none">🚂</span>
            <span className="absolute -bottom-3 left-2 text-xs select-none">⌚</span>
          </div>
        );
      case 'deep_ocean':
        return (
          <div className="absolute -inset-3.5 pointer-events-none z-10 overflow-visible">
            <div className="absolute inset-0 rounded-full border-2 border-[#91A9BC] shadow-[0_0_18px_rgba(145,169,188,0.65)]" />
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-base select-none">❄️</span>
            <span className="absolute -top-3 right-2 text-base select-none">💎</span>
            <span className="absolute top-1/2 -left-3 text-xs select-none">✦</span>
          </div>
        );
      case 'ancient_library':
        return (
          <div className="absolute -inset-3.5 pointer-events-none z-10 overflow-visible">
            <div className="absolute inset-0 rounded-full border-2 border-amber-600/70 shadow-[0_0_15px_rgba(217,119,6,0.4)]" />
            <span className="absolute -top-3 left-2 text-base select-none">📚</span>
            <span className="absolute -bottom-3 right-2 text-base select-none">🕯️</span>
          </div>
        );
      case 'dreamy_park':
        return (
          <div className="absolute -inset-3.5 pointer-events-none z-10 overflow-visible">
            <div className="absolute inset-0 rounded-full border-2 border-pink-300/80 shadow-[0_0_16px_rgba(244,114,182,0.5)]" />
            <span className="absolute -top-3 right-2 text-base select-none">🎡</span>
            <span className="absolute -bottom-3 left-2 text-base select-none">🎈</span>
          </div>
        );
      case 'little_witch':
        return (
          <div className="absolute -inset-3.5 pointer-events-none z-10 overflow-visible">
            <div className="absolute inset-0 rounded-full border-2 border-purple-400/80 shadow-[0_0_18px_rgba(168,85,247,0.55)]" />
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-base select-none">🔮</span>
            <span className="absolute -bottom-3 right-2 text-base select-none">🌙</span>
          </div>
        );
      case 'ribbon':
        return (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <span className="text-xl text-[#526B80] dark:text-[#E5EDF5] drop-shadow-sm select-none">୨୧</span>
          </div>
        );
      case 'star':
        return (
          <>
            <span className="absolute -top-2 -right-2 text-amber-400 text-sm font-serif pointer-events-none">✦</span>
            <span className="absolute -bottom-2 -left-2 text-amber-400 text-xs font-serif pointer-events-none">✧</span>
          </>
        );
      case 'flower':
        return (
          <>
            <span className="absolute -top-2.5 -left-2.5 text-base pointer-events-none select-none">🌸</span>
            <span className="absolute -bottom-2.5 -right-2.5 text-base pointer-events-none select-none">🌺</span>
          </>
        );
      case 'glass':
        return (
          <div className="absolute -inset-1 rounded-full border-2 border-white/75 shadow-[0_0_15px_rgba(255,255,255,0.65)] pointer-events-none" />
        );
      case 'winter':
        return (
          <>
            <div className="absolute -inset-1 rounded-full border-2 border-[#91A9BC]/80 shadow-[0_0_14px_rgba(145,169,188,0.55)] pointer-events-none" />
            <span className="absolute -top-2.5 -right-2.5 text-base pointer-events-none select-none">❄️</span>
            <span className="absolute -bottom-2 -left-2 text-xs text-[#91A9BC] pointer-events-none select-none">✦</span>
          </>
        );
      case 'paper':
        return (
          <div className="absolute -inset-1.5 rounded-full border-2 border-dashed border-[#91A9BC] pointer-events-none opacity-85" />
        );
      case 'none':
      default:
        return null;
    }
  };

  const FRAME_OPTIONS: { id: AvatarFrame; number: string; name: string; subtitle: string; icon: string }[] = [
    { id: 'none', number: '✦', name: 'Không khung', subtitle: 'Đơn giản', icon: '⚪' },
    { id: 'winter', number: '❄', name: 'Tuyết Đầu Mùa', subtitle: 'Winter Box', icon: '❄️' },
    { id: 'paper', number: '✦', name: 'Khung Giấy Tuyết', subtitle: 'Frost Paper', icon: '📜' },
    { id: 'ribbon', number: '✦', name: 'Khung Ruy Băng', subtitle: 'Winter Ribbon', icon: '୨୧' },
    { id: 'star', number: '✦', name: 'Khung Sao Tuyết', subtitle: 'Snow Star', icon: '✦' },
    { id: 'glass', number: '✦', name: 'Khung Pha Lê Băng', subtitle: 'Ice Glass', icon: '✧' },
    { id: 'moonlit_sea', number: '01', name: 'Đêm Tuyết Trăng', subtitle: 'Frost Moon', icon: '🌙' },
    { id: 'ancient_moon', number: '02', name: 'Cổ Trang', subtitle: 'Nguyệt Ảnh', icon: '🏮' },
    { id: 'little_angel', number: '03', name: 'Thiên Thần Tuyết', subtitle: 'Snow Angel', icon: '🪽' },
    { id: 'pixel_player', number: '04', name: 'Game Pixel', subtitle: 'Pixel Player', icon: '🎮' },
    { id: 'sakura_breeze', number: '05', name: 'Hoa Đào Trong Tuyết', subtitle: 'Sakura Snow', icon: '🌸' },
    { id: 'little_cosmos', number: '06', name: 'Đêm Ngân Hà', subtitle: 'Little Cosmos', icon: '🌌' },
    { id: 'dear_you', number: '07', name: 'Thư Tay Mùa Đông', subtitle: 'Dear You', icon: '💌' },
    { id: 'cozy_room', number: '08', name: 'Phòng Ấm Mùa Đông', subtitle: 'Cozy Room', icon: '🧶' },
    { id: 'sweet_bakery', number: '09', name: 'Tiệm Bánh Ấm', subtitle: 'Sweet Bakery', icon: '🍰' },
    { id: 'secret_garden', number: '10', name: 'Rừng Thông Tuyết', subtitle: 'Winter Forest', icon: '🌲' },
    { id: 'night_train', number: '11', name: 'Tàu Đêm Tuyết', subtitle: 'Night Train', icon: '🚂' },
    { id: 'deep_ocean', number: '12', name: 'Đỉnh Tuyết Pha Lê', subtitle: 'Crystal Peak', icon: '💎' },
    { id: 'ancient_library', number: '13', name: 'Thư Viện Cổ', subtitle: 'Ancient Library', icon: '📚' },
    { id: 'dreamy_park', number: '14', name: 'Lễ Hội Tuyết', subtitle: 'Winter Fair', icon: '🎡' },
    { id: 'little_witch', number: '15', name: 'Phù Thủy Băng', subtitle: 'Frost Witch', icon: '🔮' },
    { id: 'flower', number: '✦', name: 'Khung Hoa Sương', subtitle: 'Frost Flower', icon: '🌺' },
  ];

  const favoriteCharObj = profile.favoriteCharacterId
    ? allCharacters.find((c) => c.id === profile.favoriteCharacterId)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className={`fixed inset-0 ${themeStyles.deskBg} backdrop-blur-md transition-colors duration-300`}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />

      {/* Profile Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 18 }}
        transition={{ type: 'spring', damping: 26, stiffness: 310 }}
        className={`relative z-10 w-full max-w-2xl rounded-3xl ${themeStyles.cardBg} border shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]`}
      >
        {/* Top Modal Header + Segmented Navigation */}
        <div className="px-6 pt-5 pb-3 border-b border-current/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#91A9BC] to-[#526B80] text-white flex items-center justify-center shadow-sm">
                <Snowflake className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold font-serif tracking-tight">
                  Hồ Sơ Của Bạn
                </h2>
                <p className={`text-[11px] font-serif ${themeStyles.muted}`}>
                  Hộp Ký Ức Mùa Đông · Thành tựu &amp; Bộ sưu tập
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="sm:hidden p-1.5 rounded-full hover:bg-current/10 transition-colors cursor-pointer"
              title="Đóng hồ sơ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Clean Tab Navigation */}
            <div className={`inline-flex p-1 rounded-2xl border border-current/10 ${themeStyles.innerBg} text-xs font-serif`}>
              {[
                { id: 'overview' as ProfileTab, label: 'Hồ sơ', icon: <User className="w-3.5 h-3.5" /> },
                { id: 'achievements' as ProfileTab, label: 'Thành tựu & Quà', icon: <Gift className="w-3.5 h-3.5" /> },
                { id: 'edit' as ProfileTab, label: 'Tùy biến', icon: <Edit3 className="w-3.5 h-3.5" /> },
              ].map((tab) => {
                const active = activeTab === tab.id;
                const claimableCount =
                  tab.id === 'achievements'
                    ? unlockedBadges.filter((b) => !claimedAchievements.includes(b)).length
                    : 0;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (isSfxOn) triggerSfx('pop', sfxVolume);
                    }}
                    className={`relative px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
                      active
                        ? `${themeStyles.buttonPrimary} shadow-xs`
                        : 'opacity-75 hover:opacity-100'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {claimableCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-mono flex items-center justify-center">
                        {claimableCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={onClose}
              className="hidden sm:inline-flex p-2 rounded-full hover:bg-current/10 transition-colors cursor-pointer"
              title="Đóng hồ sơ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Hero Profile Identity Card */}
              <div className={`relative rounded-3xl border p-6 ${themeStyles.heroBg} overflow-hidden`}>
                {renderCardAtmosphere(currentDecoration)}

                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                  {/* Avatar + Frame */}
                  <div className="relative shrink-0 group">
                    {renderFrameDecoration(currentFrame)}
                    {avatarRingPulse && (
                      <motion.div
                        initial={{ scale: 0.85, opacity: 1 }}
                        animate={{ scale: 1.3, opacity: 0 }}
                        transition={{ duration: 0.9 }}
                        className="absolute inset-0 rounded-full border-2 border-[#91A9BC] pointer-events-none"
                      />
                    )}
                    <div
                      className={`w-24 h-24 sm:w-28 sm:h-28 ${
                        profile.avatarShape === 'circle' ? 'rounded-full' : 'rounded-3xl'
                      } border-4 border-white dark:border-[#202F42] shadow-lg overflow-hidden bg-gradient-to-br from-[#F7FAFD] to-[#DCE7EF] dark:from-[#202F42] dark:to-[#172536] flex items-center justify-center relative`}
                    >
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                          style={{ transform: `scale(${profile.avatarZoom || 1})` }}
                        />
                      ) : (
                        <span className="text-4xl font-serif text-[#526B80] dark:text-[#E5EDF5]">❄</span>
                      )}
                    </div>
                  </div>

                  {/* Identity Text */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-xl sm:text-2xl font-bold font-serif tracking-tight truncate">
                        {profile.name || 'Tên của bạn'}
                      </h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium flex items-center gap-1 ${themeStyles.chipBg}`}
                      >
                        {profile.isPublic ? (
                          <>
                            <Eye className="w-3 h-3" /> Công khai
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" /> Riêng tư
                          </>
                        )}
                      </span>
                    </div>

                    <p className={`text-xs sm:text-sm italic font-serif leading-relaxed ${themeStyles.muted}`}>
                      {profile.bio.trim()
                        ? `“${profile.bio}”`
                        : '“Góc nhỏ tuyết trắng bình yên giữa những câu chuyện dịu dàng ❄”'}
                    </p>

                    {/* Pinned Unlocked Badges */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                      {(profile.selectedBadges || ['first_visit']).slice(0, 3).map((bId) => {
                        const badge = APP_BADGES.find((b) => b.id === bId);
                        if (!badge) return null;
                        return (
                          <span
                            key={bId}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${themeStyles.chipBg}`}
                          >
                            <span>{badge.icon}</span>
                            <span>{badge.title}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    onClose();
                    if (onSelectFavoriteFilter) onSelectFavoriteFilter();
                  }}
                  className={`p-3.5 rounded-2xl ${themeStyles.statCard} border text-left transition-all cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-serif font-semibold opacity-75">Yêu thích</span>
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-xl font-bold font-mono tabular-nums">{favoriteCharacterIds.length}</div>
                  <div className={`text-[10px] ${themeStyles.muted}`}>Nhân vật đã lưu</div>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    if (onSelectBookmarkFilter) onSelectBookmarkFilter();
                  }}
                  className={`p-3.5 rounded-2xl ${themeStyles.statCard} border text-left transition-all cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-serif font-semibold opacity-75">Bookmark</span>
                    <Bookmark className="w-4 h-4 text-[#91A9BC] group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-xl font-bold font-mono tabular-nums">{bookmarks.length}</div>
                  <div className={`text-[10px] ${themeStyles.muted}`}>Kẹp trang truyện</div>
                </button>

                <button
                  onClick={() => setActiveTab('achievements')}
                  className={`p-3.5 rounded-2xl ${themeStyles.statCard} border text-left transition-all cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-serif font-semibold opacity-75">Thành tựu</span>
                    <Award className="w-4 h-4 text-[#91A9BC] group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-xl font-bold font-mono tabular-nums">
                    {unlockedBadges.length}/{APP_BADGES.length}
                  </div>
                  <div className={`text-[10px] ${themeStyles.muted}`}>Huy hiệu mở khóa</div>
                </button>

                <button
                  onClick={() => setActiveTab('achievements')}
                  className={`p-3.5 rounded-2xl ${themeStyles.statCard} border text-left transition-all cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-serif font-semibold opacity-75">Quà tặng</span>
                    <Gift className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-xl font-bold font-mono tabular-nums">{allSouvenirGifts.length}</div>
                  <div className={`text-[10px] ${themeStyles.muted}`}>Món quà đã nhận</div>
                </button>
              </div>

              {/* About Me Details */}
              <div className={`p-4 sm:p-5 rounded-2xl ${themeStyles.innerBg} border space-y-3.5`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-serif uppercase tracking-wider flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-[#91A9BC]" />
                    <span>Góc Ký Ức Cá Nhân</span>
                  </h4>
                  <button
                    onClick={() => setActiveTab('edit')}
                    className="text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer opacity-80 hover:opacity-100"
                  >
                    <Edit3 className="w-3 h-3" /> Sửa thông tin
                  </button>
                </div>

                {profile.favoriteQuote ? (
                  <div className="p-3 rounded-xl bg-current/5 border border-current/10 flex items-start gap-2 text-xs italic font-serif">
                    <Quote className="w-4 h-4 shrink-0 text-[#91A9BC]" />
                    <span>{profile.favoriteQuote}</span>
                  </div>
                ) : (
                  <p className={`text-xs font-serif italic ${themeStyles.muted}`}>
                    Chưa thêm câu trích dẫn yêu thích. Nhấn &ldquo;Tùy biến&rdquo; để viết thêm nhé!
                  </p>
                )}

                {favoriteCharObj && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-current/5 border border-current/10">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={favoriteCharObj.avatar}
                        alt={favoriteCharObj.name}
                        className="w-9 h-9 rounded-xl object-cover border border-current/15"
                      />
                      <div>
                        <div className="text-xs font-bold font-serif">{favoriteCharObj.name}</div>
                        <div className={`text-[10px] ${themeStyles.muted}`}>Nhân vật tâm đắc nhất</div>
                      </div>
                    </div>
                    {onOpenCharacterDetail && (
                      <button
                        onClick={() => onOpenCharacterDetail(favoriteCharObj)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-semibold border transition-colors cursor-pointer ${themeStyles.chipBg}`}
                      >
                        Xem ngay
                      </button>
                    )}
                  </div>
                )}

                {profile.favoriteTags && profile.favoriteTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {profile.favoriteTags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-2.5 py-0.5 rounded-lg text-[11px] border font-medium ${themeStyles.chipBg}`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-current/10">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadMyData}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-current/5 hover:bg-current/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Sao lưu dữ liệu</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Đặt lại</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-6">
              {/* Achievements with Real Claimable Gifts */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold font-serif flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#91A9BC]" />
                      <span>Thành Tựu &amp; Phần Thưởng Thực Tế</span>
                    </h4>
                    <p className={`text-[11px] font-serif ${themeStyles.muted}`}>
                      Hoàn thành cột mốc để nhận khung hồ sơ &amp; kỷ vật mùa đông
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold tabular-nums px-2.5 py-1 rounded-xl bg-current/5 border border-current/10">
                    {unlockedBadges.length}/{APP_BADGES.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {APP_BADGES.map((badge) => {
                    const isUnlocked = unlockedBadges.includes(badge.id);
                    const isClaimed = claimedAchievements.includes(badge.id);
                    const reward = ACHIEVEMENT_REWARDS[badge.id];

                    return (
                      <div
                        key={badge.id}
                        className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                          isUnlocked
                            ? `${themeStyles.innerBg} border-[#91A9BC]/50 shadow-xs`
                            : `${themeStyles.innerBg} opacity-60`
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                              isUnlocked
                                ? 'bg-gradient-to-tr from-[#91A9BC] to-[#526B80] text-white shadow-sm'
                                : 'bg-current/10 opacity-60'
                            }`}
                          >
                            {isUnlocked ? badge.icon : <Lock className="w-4 h-4" />}
                          </div>

                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold font-serif">{badge.title}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md border ${themeStyles.chipBg}`}>
                                {reward.giftIcon} {reward.giftName}
                              </span>
                            </div>
                            <p className={`text-[11px] ${themeStyles.muted}`}>{badge.requirement}</p>
                            <p className="text-[10px] font-medium opacity-80">
                              Quà tặng: {reward.frameLabel || reward.giftName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          {isUnlocked ? (
                            isClaimed ? (
                              <>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/25">
                                  <Check className="w-3 h-3" /> Đã nhận
                                </span>
                                {reward.frameId && profile.avatarFrame !== reward.frameId && (
                                  <button
                                    type="button"
                                    onClick={() => handleEquipFrame(reward.frameId!, reward.frameLabel || reward.giftName)}
                                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border cursor-pointer transition-colors ${themeStyles.chipBg}`}
                                  >
                                    Đeo khung
                                  </button>
                                )}
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleClaimAchievement(badge.id)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm cursor-pointer active:scale-95 transition-transform ${themeStyles.buttonPrimary}`}
                              >
                                Nhận quà 🎁
                              </button>
                            )
                          ) : (
                            <span className={`text-[11px] font-serif ${themeStyles.muted}`}>
                              Chưa mở khóa
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Collected Souvenir Shelf (Streak & Snow Game & Achievements) */}
              <div className={`p-4 rounded-2xl ${themeStyles.innerBg} border space-y-3`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-serif uppercase tracking-wider flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-[#91A9BC]" />
                    <span>Tủ Kỷ Vật Đã Nhận ({allSouvenirGifts.length})</span>
                  </h4>
                </div>

                {allSouvenirGifts.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {allSouvenirGifts.map((gift) => (
                      <span
                        key={gift}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif font-semibold border ${themeStyles.chipBg}`}
                      >
                        <span>❄</span>
                        <span>{gift}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className={`text-xs font-serif italic ${themeStyles.muted}`}>
                    Hãy nhấn &ldquo;Nhận quà&rdquo; ở trên hoặc ghé Streak / Săn Tuyết Rơi để sưu tầm kỷ vật đầu tiên nhé!
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'edit' && (
            <div className="space-y-6">
              {/* Avatar Editing */}
              <div className={`p-4 sm:p-5 rounded-2xl ${themeStyles.innerBg} border space-y-4`}>
                <h4 className="text-xs font-bold font-serif uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#91A9BC]" />
                  <span>Tùy Chỉnh Avatar</span>
                </h4>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative shrink-0">
                    {renderFrameDecoration(editedProfile.avatarFrame)}
                    <div
                      className={`w-24 h-24 sm:w-28 sm:h-28 ${
                        editedProfile.avatarShape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                      } border-4 border-white dark:border-[#202F42] shadow-lg overflow-hidden bg-[#E8F1F8] dark:bg-[#202F42] flex items-center justify-center relative`}
                    >
                      {editedProfile.avatar ? (
                        <img
                          src={editedProfile.avatar}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                          style={{ transform: `scale(${editedProfile.avatarZoom || 1})` }}
                        />
                      ) : (
                        <span className="text-3xl text-[#526B80] dark:text-[#E5EDF5] font-serif">❄</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer ${themeStyles.buttonPrimary}`}
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Tải ảnh từ máy</span>
                      </button>

                      {editedProfile.avatar && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="px-3 py-2 rounded-xl text-xs font-semibold bg-current/10 hover:bg-rose-500/15 text-rose-500 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Dùng ❄ mặc định</span>
                        </button>
                      )}
                    </div>

                    {editedProfile.avatar && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] opacity-75">
                          <span className="flex items-center gap-1">
                            <ZoomIn className="w-3 h-3" /> Zoom ảnh:
                          </span>
                          <span className="font-mono tabular-nums">{Math.round(editedProfile.avatarZoom * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="2"
                          step="0.05"
                          value={editedProfile.avatarZoom}
                          onChange={(e) =>
                            setEditedProfile((prev) => ({
                              ...prev,
                              avatarZoom: parseFloat(e.target.value),
                            }))
                          }
                          className="w-full accent-[#526B80] dark:accent-[#91A9BC] h-1.5 bg-current/20 rounded-lg cursor-pointer"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] opacity-70 font-serif">Kiểu dáng:</span>
                      {(['circle', 'rounded'] as const).map((shape) => (
                        <button
                          key={shape}
                          type="button"
                          onClick={() => setEditedProfile((prev) => ({ ...prev, avatarShape: shape }))}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
                            editedProfile.avatarShape === shape
                              ? `${themeStyles.chipBg} border-[#526B80] font-bold`
                              : 'border-current/20'
                          }`}
                        >
                          {shape === 'circle' ? 'Hình tròn' : 'Bo góc'}
                        </button>
                      ))}
                    </div>

                    {suggestedAvatarsList.length > 0 && (
                      <div className="pt-2 border-t border-current/10 space-y-1.5">
                        <span className="text-[11px] font-bold font-serif opacity-80">
                          ✦ Avatar gợi ý từ Yui:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {suggestedAvatarsList.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setEditedProfile((prev) => ({ ...prev, avatar: item.url }));
                                if (onToast) onToast(`✨ Đã chọn avatar: ${item.name}`);
                              }}
                              className="relative w-11 h-11 rounded-xl overflow-hidden border-2 border-current/20 hover:border-[#91A9BC] hover:scale-105 transition-all shadow-sm cursor-pointer group"
                              title={item.name}
                            >
                              <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Name & Bio */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold font-serif mb-1 opacity-85">
                    Tên Hiển Thị *
                  </label>
                  <input
                    type="text"
                    maxLength={30}
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="VD: Yui ♡ / Người Lữ Khách"
                    className="w-full px-4 py-2.5 rounded-xl bg-current/5 border border-current/20 text-xs font-semibold focus:outline-none focus:border-[#91A9BC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold font-serif mb-1 opacity-85">
                    Giới thiệu ngắn (Bio)
                  </label>
                  <textarea
                    rows={2}
                    maxLength={120}
                    value={editedProfile.bio}
                    onChange={(e) => setEditedProfile((prev) => ({ ...prev, bio: e.target.value }))}
                    placeholder="Viết một dòng ngắn về bạn..."
                    className="w-full px-4 py-2.5 rounded-xl bg-current/5 border border-current/20 text-xs font-serif leading-relaxed focus:outline-none focus:border-[#91A9BC] resize-none"
                  />
                </div>
              </div>

              {/* Frame Picker */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold font-serif flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#91A9BC]" />
                    <span>Khung Hồ Sơ Mùa Đông &amp; Concept</span>
                  </label>
                  <span className="text-[10px] opacity-60 font-serif">Xem trước trực tiếp</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1.5 rounded-2xl bg-current/5 border border-current/10 custom-scrollbar">
                  {FRAME_OPTIONS.map((frame) => {
                    const isActive = editedProfile.avatarFrame === frame.id;
                    return (
                      <button
                        key={frame.id}
                        type="button"
                        onClick={() => {
                          setEditedProfile((prev) => ({ ...prev, avatarFrame: frame.id }));
                          if (isSfxOn) triggerSfx('pop', sfxVolume);
                        }}
                        className={`p-2.5 rounded-xl text-left flex flex-col justify-between border transition-all cursor-pointer ${
                          isActive
                            ? `${themeStyles.chipBg} border-[#526B80] ring-1 ring-[#91A9BC] font-bold shadow-xs`
                            : 'bg-current/5 border-current/10 hover:bg-current/10 opacity-85 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-base">{frame.icon}</span>
                          {isActive && (
                            <span className="px-1.5 py-0.5 rounded-md bg-[#526B80] dark:bg-[#91A9BC] text-white dark:text-[#172536] text-[9px] font-bold">
                              Đang chọn
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold font-serif truncate">{frame.name}</div>
                          <div className="text-[10px] opacity-60 font-serif truncate">{frame.subtitle}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Theme & Falling Card Decoration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold font-serif flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#91A9BC]" />
                    <span>Giao diện Hồ Sơ</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'winter', label: 'Mùa Đông Phấn', color: 'bg-[#E8F1F8] text-[#526B80]' },
                      { id: 'soft-paper', label: 'Giấy Kem Ấm', color: 'bg-[#F7F2E9] text-[#4B443B]' },
                      { id: 'light', label: 'Sương Sáng', color: 'bg-white text-[#526B80]' },
                      { id: 'dark', label: 'Đêm Tuyết', color: 'bg-[#172536] text-[#E5EDF5]' },
                      { id: 'night-sky', label: 'Ngân Hà', color: 'bg-[#131E2E] text-[#D5E4EF]' },
                      { id: 'spring', label: 'Hoa Đào', color: 'bg-[#FFF5F8] text-[#785363]' },
                    ].map((themeItem) => (
                      <button
                        key={themeItem.id}
                        type="button"
                        onClick={() => {
                          setEditedProfile((prev) => ({
                            ...prev,
                            profileTheme: themeItem.id as ProfileTheme,
                          }));
                          if (isSfxOn) triggerSfx('chime', sfxVolume);
                        }}
                        className={`p-2 rounded-xl text-xs flex items-center justify-between border cursor-pointer transition-all ${
                          editedProfile.profileTheme === themeItem.id
                            ? 'border-[#526B80] ring-2 ring-[#91A9BC] font-bold'
                            : 'border-current/20 opacity-85 hover:opacity-100'
                        } ${themeItem.color}`}
                      >
                        <span className="truncate">{themeItem.label}</span>
                        {editedProfile.profileTheme === themeItem.id && <Check className="w-3 h-3 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold font-serif flex items-center gap-1.5">
                    <Snowflake className="w-3.5 h-3.5 text-[#91A9BC]" />
                    <span>Hiệu ứng rơi trên thẻ</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'snow', label: '❄ Tuyết rơi' },
                      { id: 'sparkles', label: '✨ Lấp lánh' },
                      { id: 'stars', label: '✦ Ánh sao' },
                      { id: 'ribbons', label: '୨୧ Ruy băng' },
                      { id: 'petals', label: '🌸 Cánh hoa' },
                      { id: 'none', label: '⚪ Tắt' },
                    ].map((dec) => (
                      <button
                        key={dec.id}
                        type="button"
                        onClick={() => {
                          setEditedProfile((prev) => ({
                            ...prev,
                            decoration: dec.id as ProfileDecoration,
                          }));
                          if (isSfxOn) triggerSfx('pop', sfxVolume);
                        }}
                        className={`p-2 rounded-xl text-xs border text-left cursor-pointer transition-all ${
                          editedProfile.decoration === dec.id
                            ? `${themeStyles.chipBg} border-[#526B80] font-bold`
                            : 'bg-current/5 border-current/15 opacity-80 hover:opacity-100'
                        }`}
                      >
                        {dec.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pinned Badges Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold font-serif opacity-85">
                  Huy hiệu ghim trên Hồ sơ (tối đa 3 huy hiệu đã mở khóa)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {APP_BADGES.filter((b) => unlockedBadges.includes(b.id)).map((badge) => {
                    const isPinned = editedProfile.selectedBadges?.includes(badge.id);
                    return (
                      <button
                        key={badge.id}
                        type="button"
                        onClick={() => {
                          let next = [...(editedProfile.selectedBadges || [])];
                          if (isPinned) {
                            next = next.filter((id) => id !== badge.id);
                          } else {
                            if (next.length >= 3) {
                              if (onToast) onToast('Bạn chỉ có thể ghim tối đa 3 huy hiệu lên đầu hồ sơ!');
                              return;
                            }
                            next.push(badge.id);
                          }
                          setEditedProfile((prev) => ({ ...prev, selectedBadges: next }));
                        }}
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                          isPinned
                            ? `${themeStyles.buttonPrimary} border-transparent`
                            : 'bg-current/5 border-current/15 opacity-80'
                        }`}
                      >
                        {badge.icon} {badge.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* About Me Preferences */}
              <div className={`p-4 rounded-2xl ${themeStyles.innerBg} border space-y-4`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-serif flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-[#91A9BC]" />
                    <span>Thông Tin Cá Nhân</span>
                  </span>
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <span>Hiển thị công khai</span>
                    <input
                      type="checkbox"
                      checked={editedProfile.isPublic}
                      onChange={(e) =>
                        setEditedProfile((prev) => ({ ...prev, isPublic: e.target.checked }))
                      }
                      className="accent-[#526B80] w-4 h-4 rounded cursor-pointer"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 opacity-75 font-serif">
                    Nhân vật tâm đắc nhất
                  </label>
                  <select
                    value={editedProfile.favoriteCharacterId || ''}
                    onChange={(e) =>
                      setEditedProfile((prev) => ({
                        ...prev,
                        favoriteCharacterId: e.target.value || null,
                      }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-current/5 border border-current/20 text-xs font-medium focus:outline-none focus:border-[#91A9BC] text-current"
                  >
                    <option value="" className="bg-[#172536] text-white">
                      -- Chưa chọn nhân vật --
                    </option>
                    {allCharacters.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#172536] text-white">
                        {c.name} {c.title ? `(${c.title})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 opacity-75 font-serif">
                    Một câu trích dẫn mình thích
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    value={editedProfile.favoriteQuote}
                    onChange={(e) =>
                      setEditedProfile((prev) => ({ ...prev, favoriteQuote: e.target.value }))
                    }
                    placeholder="VD: Góc nhỏ này dịu êm như một tách trà ấm giữa ngày tuyết rơi ❄"
                    className="w-full px-3.5 py-2 rounded-xl bg-current/5 border border-current/20 text-xs font-serif focus:outline-none focus:border-[#91A9BC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 opacity-75 font-serif">
                    Thể loại yêu thích (chọn tối đa 4)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_TAGS.map((tag) => {
                      const typedTag = tag as GenreTag;
                      const isSelected = editedProfile.favoriteTags?.includes(typedTag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            let updatedTags = [...(editedProfile.favoriteTags || [])];
                            if (isSelected) {
                              updatedTags = updatedTags.filter((t) => t !== typedTag);
                            } else {
                              if (updatedTags.length >= 4) {
                                if (onToast) onToast('Bạn chỉ nên chọn tối đa 4 thể loại yêu thích nhé ♡');
                                return;
                              }
                              updatedTags.push(typedTag);
                            }
                            setEditedProfile((prev) => ({ ...prev, favoriteTags: updatedTags }));
                          }}
                          className={`px-2.5 py-1 rounded-xl text-xs font-medium border cursor-pointer transition-colors ${
                            isSelected
                              ? `${themeStyles.buttonPrimary} border-transparent`
                              : 'bg-current/5 border-current/15 hover:bg-current/10'
                          }`}
                        >
                          #{tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Save / Cancel */}
              <div className="flex items-center justify-between pt-3 border-t border-current/10">
                <button
                  type="button"
                  onClick={() => {
                    setEditedProfile(profile);
                    setActiveTab('overview');
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold opacity-75 hover:bg-current/10 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className={`relative px-7 py-2.5 rounded-2xl text-xs sm:text-sm font-bold ${themeStyles.buttonPrimary} shadow-lg transition-transform active:scale-95 flex items-center gap-2 cursor-pointer font-serif`}
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu thay đổi ❄</span>
                  {isSavedGlow && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 1 }}
                      animate={{ scale: 1.35, opacity: 0 }}
                      className="absolute inset-0 rounded-2xl border-2 border-white pointer-events-none"
                    />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Reset Confirmation Overlay */}
        <AnimatePresence>
          {isResetConfirmOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-4 z-50 bg-[#172536]/95 text-[#E5EDF5] rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-2xl backdrop-blur-md space-y-4 border border-[#43576B]"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#202F42] text-[#A9BDCE] flex items-center justify-center text-xl font-serif border border-[#43576B]">
                ❄
              </div>

              <div className="space-y-1 max-w-sm">
                <h4 className="text-base font-bold font-serif">
                  Đưa hồ sơ về trạng thái mặc định?
                </h4>
                <p className="text-xs text-[#A9BDCE] font-serif leading-relaxed">
                  Avatar, khung và giao diện sẽ trở về mặc định mùa đông. <br />
                  <span className="text-[#E5EDF5] font-semibold">
                    (Thành tựu, quà đã nhận, Bookmark và phụ kiện vẫn giữ nguyên an toàn.)
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#202F42] hover:bg-[#354A60] text-[#E5EDF5] transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleResetProfile}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md transition-colors cursor-pointer"
                >
                  Xác nhận đặt lại
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

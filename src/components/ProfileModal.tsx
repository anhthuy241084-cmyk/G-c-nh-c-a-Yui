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
  BookOpen,
  Gift,
  Download,
  RotateCcw,
  Trash2,
  Check,
  ZoomIn,
  ZoomOut,
  Palette,
  Eye,
  EyeOff,
  Star,
  Quote,
  Shield,
  Layers,
  Smartphone,
} from 'lucide-react';
import {
  UserProfile,
  DEFAULT_USER_PROFILE,
  ProfileTheme,
  AvatarFrame,
  BadgeId,
  APP_BADGES,
  Character,
  GenreTag,
  PRESET_TAGS,
  CharacterBookmark,
  MascotAccessoryId,
} from '../types';
import { triggerSfx } from '../utils/sfx';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  favoriteCharacterIds: string[];
  bookmarks: CharacterBookmark[];
  allCharacters: Character[];
  unlockedAccessories?: MascotAccessoryId[];
  isNightMode?: boolean;
  onSelectFavoriteFilter?: () => void;
  onSelectBookmarkFilter?: () => void;
  onOpenWardrobe?: () => void;
  onOpenCharacterDetail?: (character: Character) => void;
  isSfxOn?: boolean;
  sfxVolume?: number;
  onToast?: (msg: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  favoriteCharacterIds,
  bookmarks,
  allCharacters,
  unlockedAccessories = [],
  isNightMode = false,
  onSelectFavoriteFilter,
  onSelectBookmarkFilter,
  onOpenWardrobe,
  onOpenCharacterDetail,
  isSfxOn = true,
  sfxVolume = 0.5,
  onToast,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  const [suggestedAvatarsList, setSuggestedAvatarsList] = useState<SuggestedAvatar[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeSuggestedAvatars((avatars) => {
      setSuggestedAvatarsList(avatars);
    });
    return () => unsubscribe();
  }, []);

  // Avatar transformation & animation states
  const [avatarRingPulse, setAvatarRingPulse] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSavedGlow, setIsSavedGlow] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync edited profile when modal opens or profile changes
  useEffect(() => {
    if (isOpen) {
      setEditedProfile(profile);
      setIsEditing(false);
      setIsResetConfirmOpen(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  // Calculate actual unlocked badges dynamically from user's real activities
  const unlockedBadges: BadgeId[] = ['first_visit'];
  if (favoriteCharacterIds.length > 0 || bookmarks.length > 0) {
    unlockedBadges.push('bookmarker');
  }
  if (unlockedAccessories.length >= 2 || favoriteCharacterIds.length >= 3) {
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
    if (localStorage.getItem('yui_streak_count') && parseInt(localStorage.getItem('yui_streak_count') || '0', 10) >= 3) {
      unlockedBadges.push('streak_master');
    }
  } catch (e) {}

  const currentTheme = isEditing ? editedProfile.profileTheme : profile.profileTheme;
  const currentFrame = isEditing ? editedProfile.avatarFrame : profile.avatarFrame;
  const currentAvatar = isEditing ? editedProfile.avatar : profile.avatar;
  const currentShape = isEditing ? editedProfile.avatarShape : profile.avatarShape;
  const currentZoom = isEditing ? editedProfile.avatarZoom : profile.avatarZoom;

  // Handle avatar upload from local device
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
      setEditedProfile((prev) => ({
        ...prev,
        avatar: base64,
      }));

      // Trigger avatar animation
      setAvatarRingPulse(true);
      if (isSfxOn) triggerSfx('chime', sfxVolume);
      setTimeout(() => setAvatarRingPulse(false), 1200);

      if (onToast) onToast('✨ Đã tải avatar mới lên!');
    };
    reader.readAsDataURL(file);
  };

  // Remove avatar -> back to default '✦'
  const handleRemoveAvatar = () => {
    setEditedProfile((prev) => ({
      ...prev,
      avatar: null,
      avatarZoom: 1,
    }));
    setAvatarRingPulse(true);
    if (isSfxOn) triggerSfx('sparkle', sfxVolume);
    setTimeout(() => setAvatarRingPulse(false), 1000);
    if (onToast) onToast('✦ Đã trở lại avatar ngôi sao mặc định');
  };

  // Save changes
  const handleSave = () => {
    setIsSavedGlow(true);
    if (isSfxOn) triggerSfx('chime', sfxVolume);

    const finalized: UserProfile = {
      ...editedProfile,
      name: editedProfile.name.trim() || 'Tên của bạn',
      unlockedBadges: Array.from(new Set([...unlockedBadges, ...editedProfile.unlockedBadges])),
      updatedAt: new Date().toISOString(),
    };

    onSaveProfile(finalized);
    if (onToast) onToast('Đã lưu rồi ୨୧');

    setTimeout(() => {
      setIsSavedGlow(false);
      setIsEditing(false);
    }, 800);
  };

  // Reset to default
  const handleResetProfile = () => {
    const resetData: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      unlockedBadges: unlockedBadges,
    };
    setEditedProfile(resetData);
    onSaveProfile(resetData);
    setIsResetConfirmOpen(false);
    setIsEditing(false);
    setAvatarRingPulse(true);
    if (isSfxOn) triggerSfx('chime', sfxVolume);
    setTimeout(() => setAvatarRingPulse(false), 1000);
    if (onToast) onToast('✦ Hồ sơ đã trở về trạng thái mặc định');
  };

  // Export / Download my data
  const handleDownloadMyData = () => {
    try {
      const exportObject = {
        exportedAt: new Date().toISOString(),
        profile: {
          name: profile.name,
          bio: profile.bio,
          profileTheme: profile.profileTheme,
          avatarFrame: profile.avatarFrame,
          favoriteTags: profile.favoriteTags,
          favoriteQuote: profile.favoriteQuote,
          isPublic: profile.isPublic,
          selectedBadges: profile.selectedBadges,
        },
        savedFavoritesCount: favoriteCharacterIds.length,
        favoriteCharacterIds: favoriteCharacterIds,
        bookmarksCount: bookmarks.length,
        bookmarks: bookmarks,
        unlockedAccessories: unlockedAccessories,
        unlockedBadges: unlockedBadges,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `yui_profile_data_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      if (isSfxOn) triggerSfx('chime', sfxVolume);
      if (onToast) onToast('📥 Đã tải xuống hồ sơ và dữ liệu cá nhân của bạn!');
    } catch (err) {
      if (onToast) onToast('⚠️ Không thể tải dữ liệu, vui lòng thử lại sau.');
    }
  };

  // Profile theme styling classes
  const getThemeStyles = (theme: ProfileTheme) => {
    switch (theme) {
      case 'dark':
        return {
          cardBg: 'bg-[#102F38] text-[#DDF5F6] border-[#65C5CE]/30',
          deskBg: 'bg-[#081B22]',
          innerBg: 'bg-[#0D2730]/90 border-[#143943]',
          accent: 'text-[#78DCE0]',
          badgeBg: 'bg-[#0D2730] text-[#DDF5F6] border-[#143943]',
          statCard: 'bg-[#0D2730]/90 border-[#143943] hover:border-[#78DCE0]/50',
          buttonPrimary: 'bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] text-white',
        };
      case 'night-sky':
        return {
          cardBg: 'bg-gradient-to-b from-[#081B22] via-[#0D2730] to-[#12343C] text-[#DDF5F6] border-[#65C5CE]/30',
          deskBg: 'bg-[#06151B]',
          innerBg: 'bg-[#102F38]/60 border-[#143943]',
          accent: 'text-[#78DCE0]',
          badgeBg: 'bg-[#0D2730]/80 text-[#DDF5F6] border-[#143943]',
          statCard: 'bg-[#102F38]/70 border-[#143943] hover:border-[#78DCE0]/50',
          buttonPrimary: 'bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] text-white shadow-[#247C8C]/30',
        };
      case 'winter':
        return {
          cardBg: 'bg-gradient-to-b from-[#F2FBFC] via-[#E5F5F7] to-[#DDF1F3] text-[#29464C] border-[#65C5CE]/40',
          deskBg: 'bg-[#0D2730]',
          innerBg: 'bg-white/80 border-[#65C5CE]/30',
          accent: 'text-[#247C8C]',
          badgeBg: 'bg-[#E5F5F7] text-[#247C8C] border-[#65C5CE]/30',
          statCard: 'bg-white/90 border-[#65C5CE]/25 hover:border-[#3FAAB7]',
          buttonPrimary: 'bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] text-white shadow-[#247C8C]/20',
        };
      case 'spring':
        return {
          cardBg: 'bg-gradient-to-b from-[#F2FBFC] via-[#E5F5F7] to-[#DDF1F3] text-[#29464C] border-[#65C5CE]/40',
          deskBg: 'bg-[#0D2730]',
          innerBg: 'bg-white/85 border-[#65C5CE]/30',
          accent: 'text-[#3FAAB7]',
          badgeBg: 'bg-[#E5F5F7] text-[#247C8C] border-[#65C5CE]/30',
          statCard: 'bg-white/90 border-[#65C5CE]/30 hover:border-[#3FAAB7]',
          buttonPrimary: 'bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] text-white shadow-[#247C8C]/20',
        };
      case 'light':
        return {
          cardBg: 'bg-white text-[#29464C] border-[#65C5CE]/30',
          deskBg: 'bg-[#E5F5F7]',
          innerBg: 'bg-[#F2FBFC] border-[#65C5CE]/25',
          accent: 'text-[#3FAAB7]',
          badgeBg: 'bg-[#E5F5F7] text-[#247C8C] border-[#65C5CE]/30',
          statCard: 'bg-[#F2FBFC]/80 border-[#65C5CE]/25 hover:border-[#3FAAB7]',
          buttonPrimary: 'bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] text-white',
        };
      case 'soft-paper':
      default:
        return {
          cardBg: 'bg-gradient-to-b from-[#FFFFFF] via-[#F2FBFC] to-[#E5F5F7] text-[#29464C] border-[#65C5CE]/40',
          deskBg: 'bg-[#081B22]',
          innerBg: 'bg-white/80 border-[#65C5CE]/30',
          accent: 'text-[#247C8C]',
          badgeBg: 'bg-[#E5F5F7] text-[#247C8C] border-[#65C5CE]/30',
          statCard: 'bg-white/90 border-[#65C5CE]/30 hover:border-[#3FAAB7]',
          buttonPrimary: 'bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] text-white shadow-[#247C8C]/20',
        };
    }
  };

  const themeStyles = getThemeStyles(currentTheme);

  // Render Avatar Frame Decoration Overlay matching 15 concepts
  const renderFrameDecoration = (frame: AvatarFrame) => {
    switch (frame) {
      case 'moonlit_sea':
        return (
          <div className="absolute -inset-4 pointer-events-none z-10 overflow-visible">
            {/* Outer glowing night sky ring */}
            <div className="absolute inset-0 rounded-full border-2 border-indigo-400/70 shadow-[0_0_20px_rgba(99,102,241,0.6)] animate-pulse" />
            {/* Crescent moon top */}
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-base select-none filter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">🌙</span>
            {/* Seashell bottom */}
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-base select-none animate-bounce">🐚</span>
            {/* Twinkling stars */}
            <span className="absolute top-1 -right-2 text-xs text-amber-200 animate-ping">✨</span>
            <span className="absolute bottom-2 -left-2 text-[10px] text-indigo-200">🌊</span>
          </div>
        );
      case 'ancient_moon':
        return (
          <div className="absolute -inset-4 pointer-events-none z-10 overflow-visible">
            {/* Wooden window / jade ring */}
            <div className="absolute inset-0 rounded-full border-2 border-amber-600/70 shadow-[0_0_18px_rgba(217,119,6,0.5)]" />
            {/* Tassels & Jade ornaments */}
            <span className="absolute -top-3 left-3 text-sm select-none animate-bounce">🏮</span>
            <span className="absolute -top-3 right-3 text-sm select-none animate-bounce" style={{ animationDelay: '0.3s' }}>🏮</span>
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-sm select-none">📿</span>
            <span className="absolute top-1/2 -left-4 text-xs select-none">🌸</span>
            <span className="absolute top-1/2 -right-4 text-xs select-none">🌸</span>
          </div>
        );
      case 'little_angel':
        return (
          <div className="absolute -inset-3 sm:-inset-4 pointer-events-none z-10 overflow-visible">
            {/* Glowing golden halo above avatar */}
            <div className="absolute -top-3 sm:-top-3.5 left-1/2 -translate-x-1/2 w-14 sm:w-16 h-4 sm:h-5 rounded-full border-2 border-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.9)] bg-amber-200/20 animate-pulse" />
            
            {/* SVG Left Angel Wing */}
            <svg
              className="absolute top-1/2 -left-6 sm:-left-8 -translate-y-1/2 w-8 sm:w-10 h-10 sm:h-12 pointer-events-none filter drop-shadow-[0_0_8px_rgba(254,240,138,0.7)]"
              viewBox="0 0 36 44"
              fill="none"
            >
              <path
                d="M 32,22 C 26,6 10,2 2,12 C -2,17 0,26 6,32 C 12,38 24,36 34,26 C 26,26 18,22 14,16 C 18,12 26,16 32,22 Z"
                fill="url(#angelWingGradLeft)"
                stroke="#fef08a"
                strokeWidth="1.2"
              />
              <path d="M 6,18 C 12,18 20,24 26,28" stroke="#ffffff" strokeWidth="0.8" opacity="0.8" />
              <path d="M 8,24 C 14,24 22,28 28,32" stroke="#ffffff" strokeWidth="0.8" opacity="0.8" />
              <defs>
                <linearGradient id="angelWingGradLeft" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="60%" stopColor="#fef08a" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#fde047" stopOpacity="0.8" />
                </linearGradient>
              </defs>
            </svg>

            {/* SVG Right Angel Wing */}
            <svg
              className="absolute top-1/2 -right-6 sm:-right-8 -translate-y-1/2 w-8 sm:w-10 h-10 sm:h-12 pointer-events-none filter drop-shadow-[0_0_8px_rgba(254,240,138,0.7)] scale-x-[-1]"
              viewBox="0 0 36 44"
              fill="none"
            >
              <path
                d="M 32,22 C 26,6 10,2 2,12 C -2,17 0,26 6,32 C 12,38 24,36 34,26 C 26,26 18,22 14,16 C 18,12 26,16 32,22 Z"
                fill="url(#angelWingGradRight)"
                stroke="#fef08a"
                strokeWidth="1.2"
              />
              <path d="M 6,18 C 12,18 20,24 26,28" stroke="#ffffff" strokeWidth="0.8" opacity="0.8" />
              <path d="M 8,24 C 14,24 22,28 28,32" stroke="#ffffff" strokeWidth="0.8" opacity="0.8" />
              <defs>
                <linearGradient id="angelWingGradRight" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="60%" stopColor="#fef08a" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#fde047" stopOpacity="0.8" />
                </linearGradient>
              </defs>
            </svg>

            {/* Radiant Angel Aura Border */}
            <div className="absolute inset-0 rounded-full border-2 border-amber-300/80 shadow-[0_0_16px_rgba(251,191,36,0.6)]" />
            <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-xs select-none filter drop-shadow">✨</span>
          </div>
        );
      case 'pixel_player':
        return (
          <div className="absolute -inset-4 pointer-events-none z-10 overflow-visible">
            {/* Neon pixel border */}
            <div className="absolute inset-0 rounded-2xl border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)] bg-purple-950/20" />
            {/* READY Badge */}
            <span className="absolute -top-3 right-1 px-2 py-0.5 rounded bg-purple-600 text-white font-mono font-bold text-[10px] shadow-md animate-pulse">
              READY 🎮
            </span>
            <span className="absolute -bottom-2 -left-2 text-xs select-none">👾</span>
            <span className="absolute -bottom-2 -right-2 text-xs select-none">🕹️</span>
          </div>
        );
      case 'sakura_breeze':
        return (
          <div className="absolute -inset-4 pointer-events-none z-10 overflow-visible">
            {/* Sakura ring */}
            <div className="absolute inset-0 rounded-full border-2 border-pink-400/80 shadow-[0_0_18px_rgba(244,114,182,0.6)]" />
            {/* Cherry blossom branches & lanterns */}
            <span className="absolute -top-3 -left-3 text-base select-none animate-bounce">🌸</span>
            <span className="absolute -top-3 -right-3 text-base select-none animate-bounce" style={{ animationDelay: '0.2s' }}>🏮</span>
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-sm select-none">🎀</span>
            <span className="absolute top-1/2 -right-4 text-xs select-none animate-pulse">🌸</span>
          </div>
        );
      case 'little_cosmos':
        return (
          <div className="absolute -inset-5 pointer-events-none z-10 overflow-visible">
            {/* Orbit ring */}
            <div className="absolute inset-0 rounded-full border border-indigo-400/60 animate-spin duration-3000" />
            <span className="absolute -top-3 right-2 text-sm select-none animate-pulse">🪐</span>
            <span className="absolute -bottom-3 left-2 text-xs select-none">⭐</span>
            <span className="absolute top-1/2 -left-4 text-xs select-none animate-ping">☄️</span>
          </div>
        );
      case 'dear_you':
        return (
          <div className="absolute -inset-4 pointer-events-none z-10 overflow-visible">
            <div className="absolute inset-0 rounded-full border-2 border-rose-300/80 shadow-[0_0_15px_rgba(251,113,133,0.5)]" />
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-base select-none">💌</span>
            <span className="absolute -bottom-3 right-1 text-xs select-none animate-bounce">୨୧</span>
            <span className="absolute top-1/2 -left-3 text-xs select-none">✒️</span>
          </div>
        );
      case 'cozy_room':
        return (
          <div className="absolute -inset-4 pointer-events-none z-10 overflow-visible">
            <div className="absolute inset-0 rounded-full border-2 border-amber-300/70 shadow-[0_0_15px_rgba(252,211,77,0.4)]" />
            <span className="absolute -top-3 -left-2 text-base select-none">🛏️</span>
            <span className="absolute -top-3 -right-2 text-base select-none animate-pulse">🧸</span>
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-sm select-none">🪞</span>
          </div>
        );
      case 'sweet_bakery':
        return (
          <div className="absolute -inset-4 pointer-events-none z-10 overflow-visible">
            <div className="absolute inset-0 rounded-full border-2 border-pink-300 shadow-[0_0_15px_rgba(244,114,182,0.5)]" />
            <span className="absolute -top-3 -right-2 text-base select-none animate-bounce">🍰</span>
            <span className="absolute -bottom-3 -left-2 text-base select-none">🧁</span>
            <span className="absolute -top-3 left-2 text-xs select-none">🎀</span>
          </div>
        );
      case 'secret_garden':
        return (
          <div className="absolute -inset-4 pointer-events-none z-10 overflow-visible">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400/80 shadow-[0_0_15px_rgba(52,211,153,0.6)]" />
            <span className="absolute -top-3 left-2 text-base select-none">🌿</span>
            <span className="absolute -bottom-3 right-2 text-base select-none animate-pulse">🦋</span>
            <span className="absolute top-1/2 -left-3 text-xs select-none">🍄</span>
          </div>
        );
      case 'night_train':
        return (
          <div className="absolute -inset-4 pointer-events-none z-10 overflow-visible">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/70 shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
            <span className="absolute -top-3 right-2 text-base select-none">🚂</span>
            <span className="absolute -bottom-3 left-2 text-xs select-none">⌚</span>
            <span className="absolute top-1/2 -left-3 text-xs select-none animate-pulse">✨</span>
          </div>
        );
      case 'deep_ocean':
        return (
          <div className="absolute -inset-4 pointer-events-none z-10 overflow-visible">
            <div className="absolute inset-0 rounded-full border-2 border-[#65C5CE]/80 shadow-[0_0_18px_rgba(101,197,206,0.6)]" />
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-base select-none animate-bounce">🐚</span>
            <span className="absolute -top-3 right-2 text-base select-none animate-pulse">🪼</span>
            <span className="absolute top-1/2 -left-3 text-xs select-none">✦</span>
          </div>
        );
      case 'ancient_library':
        return (
          <div className="absolute -inset-4 pointer-events-none z-10 overflow-visible">
            <div className="absolute inset-0 rounded-full border-2 border-amber-600/70 shadow-[0_0_15px_rgba(217,119,6,0.5)]" />
            <span className="absolute -top-3 left-2 text-base select-none">📚</span>
            <span className="absolute -bottom-3 right-2 text-base select-none">⏳</span>
            <span className="absolute top-1/2 -right-3 text-xs select-none animate-pulse">🕯️</span>
          </div>
        );
      case 'dreamy_park':
        return (
          <div className="absolute -inset-4 pointer-events-none z-10 overflow-visible">
            <div className="absolute inset-0 rounded-full border-2 border-pink-400/80 shadow-[0_0_18px_rgba(244,114,182,0.6)]" />
            <span className="absolute -top-3 right-2 text-base select-none animate-pulse">🎡</span>
            <span className="absolute -bottom-3 left-2 text-base select-none">🎈</span>
            <span className="absolute top-1/2 -left-3 text-xs select-none">🎠</span>
          </div>
        );
      case 'little_witch':
        return (
          <div className="absolute -inset-4 pointer-events-none z-10 overflow-visible">
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/80 shadow-[0_0_20px_rgba(168,85,247,0.7)]" />
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-lg select-none filter drop-shadow-[0_0_10px_rgba(168,85,247,0.9)] animate-bounce">🧙‍♀️</span>
            <span className="absolute -bottom-3 right-2 text-base select-none">🧪</span>
            <span className="absolute top-1/2 -left-3 text-xs select-none animate-pulse">🌙</span>
          </div>
        );
      case 'ribbon':
        return (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <span className="text-xl text-rose-500 drop-shadow-sm select-none animate-bounce">୨୧</span>
          </div>
        );
      case 'star':
        return (
          <>
            <span className="absolute -top-2 -right-2 text-amber-400 text-sm font-serif pointer-events-none animate-pulse">✦</span>
            <span className="absolute -bottom-2 -left-2 text-amber-400 text-xs font-serif pointer-events-none animate-pulse">✧</span>
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
          <div className="absolute inset-0 rounded-full border-2 border-white/60 shadow-[0_0_15px_rgba(255,255,255,0.7)] pointer-events-none backdrop-blur-xs" />
        );
      case 'winter':
        return (
          <>
            <span className="absolute -top-2.5 -right-2.5 text-cyan-400 text-base pointer-events-none select-none">❄️</span>
            <span className="absolute -bottom-2 -left-2 text-cyan-400 text-xs pointer-events-none select-none">✧</span>
          </>
        );
      case 'paper':
        return (
          <div className="absolute -inset-1.5 rounded-full border-2 border-dashed border-[#c8b7a0] pointer-events-none opacity-80" />
        );
      case 'none':
      default:
        return null;
    }
  };

  // Find favorite character object
  const favoriteCharObj = profile.favoriteCharacterId
    ? allCharacters.find((c) => c.id === profile.favoriteCharacterId)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      {/* Desk Background Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className={`fixed inset-0 ${themeStyles.deskBg} bg-opacity-80 backdrop-blur-md transition-colors duration-500`}
      >
        {/* Subtle wooden/table top light vignette */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black/80 pointer-events-none" />
      </motion.div>

      {/* Hidden File Input for Avatar Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />

      {/* Profile Card Placed on Desk */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 25, rotate: -0.5 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 25 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`relative z-10 w-full max-w-2xl rounded-3xl ${themeStyles.cardBg} border shadow-2xl overflow-hidden my-auto p-6 sm:p-8 flex flex-col gap-6 max-h-[92vh] overflow-y-auto`}
      >
        {/* Top Floating Paper Clip / Corner Ribbon */}
        <div className="absolute top-0 right-10 w-8 h-12 bg-gradient-to-b from-rose-400 to-pink-500 rounded-b-lg shadow-md flex items-end justify-center pb-1 text-white text-[10px] font-serif select-none pointer-events-none">
          ♡
        </div>

        {/* Header Bar */}
        <div className="flex items-center justify-between border-b pb-3 border-current/10">
          <div className="flex items-center gap-2">
            <span className="text-base select-none">୨୧</span>
            <h2 className="text-base sm:text-lg font-bold font-serif tracking-wide">
              {isEditing ? 'Chỉnh Sửa Hồ Sơ' : 'Hồ Sơ Của Bạn'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => {
                  setIsEditing(true);
                  if (isSfxOn) triggerSfx('chime', sfxVolume);
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-300 hover:bg-rose-500/20 border border-rose-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Chỉnh sửa</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              title="Đóng hồ sơ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= MAIN PROFILE CONTENT ================= */}
        {!isEditing ? (
          /* ================= VIEW MODE ================= */
          <div className="space-y-6">
            {/* Top Section: Large Avatar + Name + Bio */}
            <div className="flex flex-col items-center text-center gap-3 relative">
              {/* Avatar Box */}
              <div className="relative group">
                {/* Frame Decoration (Ribbon, Stars, Flowers, Glass, Winter...) */}
                {renderFrameDecoration(profile.avatarFrame)}

                {/* Glowing ring animation upon avatar change */}
                {avatarRingPulse && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 1 }}
                    animate={{ scale: 1.3, opacity: 0 }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full border-2 border-rose-400 pointer-events-none"
                  />
                )}

                <div
                  className={`w-28 h-28 sm:w-32 sm:h-32 ${
                    profile.avatarShape === 'circle' ? 'rounded-full' : 'rounded-3xl'
                  } border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden bg-gradient-to-br from-rose-100 via-pink-50 to-amber-50 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center relative transition-transform group-hover:scale-105 duration-300`}
                >
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                      style={{
                        transform: `scale(${profile.avatarZoom || 1})`,
                      }}
                    />
                  ) : (
                    /* Default Star Avatar ✦ */
                    <div className="flex flex-col items-center justify-center text-rose-500 dark:text-rose-400 select-none">
                      <span className="text-4xl font-serif leading-none animate-pulse">✦</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-bold font-serif tracking-tight flex items-center justify-center gap-2">
                  <span>{profile.name || 'Tên của bạn'}</span>
                  {profile.isPublic && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-sans font-normal">
                      Công khai
                    </span>
                  )}
                </h3>

                {/* Bio text */}
                <p className="text-xs sm:text-sm italic opacity-80 max-w-md mx-auto whitespace-pre-line font-serif leading-relaxed px-4">
                  {profile.bio.trim() ? `“${profile.bio}”` : '“Chưa viết gì cả ♡”'}
                </p>
              </div>

              {/* Quick Action: Edit Profile */}
              <button
                onClick={() => setIsEditing(true)}
                className={`mt-1 px-5 py-2 rounded-full text-xs font-semibold ${themeStyles.buttonPrimary} shadow-md flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Chỉnh sửa hồ sơ</span>
              </button>
            </div>

            {/* Collection Summary Section (Clickable stats blocks) */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold font-serif uppercase tracking-wider opacity-70 flex items-center gap-1.5">
                <span>✦</span>
                <span>Bộ Sưu Tập Của Bạn</span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                {/* 1. Favorite / Saved Characters */}
                <button
                  onClick={() => {
                    onClose();
                    if (onSelectFavoriteFilter) onSelectFavoriteFilter();
                  }}
                  className={`p-3.5 rounded-2xl ${themeStyles.statCard} border text-left transition-all duration-200 group cursor-pointer`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-serif text-amber-500 font-medium">⭐ Yêu thích</span>
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-serif">
                    {favoriteCharacterIds.length}
                  </div>
                  <div className="text-[10px] opacity-60">Nhân vật đã lưu (dấu sao)</div>
                </button>

                {/* 2. Bookmarks */}
                <button
                  onClick={() => {
                    onClose();
                    if (onSelectBookmarkFilter) onSelectBookmarkFilter();
                  }}
                  className={`p-3.5 rounded-2xl ${themeStyles.statCard} border text-left transition-all duration-200 group cursor-pointer`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-serif text-amber-500 font-medium">୨୧ Bookmark</span>
                    <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500/20 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-serif">
                    {bookmarks.length}
                  </div>
                  <div className="text-[10px] opacity-60">Đánh dấu trang truyện</div>
                </button>
              </div>
            </div>

            {/* "Trang giới thiệu" Section (About Me Details) */}
            <div className={`p-4 sm:p-5 rounded-2xl ${themeStyles.innerBg} border space-y-3.5`}>
              <h4 className="text-xs font-bold font-serif uppercase tracking-wider opacity-80 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>Về Mình</span>
                </span>
                {profile.isPublic ? (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-sans normal-case flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Hiển thị công khai
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500 font-sans normal-case flex items-center gap-1">
                    <EyeOff className="w-3.5 h-3.5" /> Riêng tư
                  </span>
                )}
              </h4>

              {/* Favorite Quote */}
              {profile.favoriteQuote && (
                <div className="p-3 rounded-xl bg-current/5 border border-current/10 flex items-start gap-2 text-xs italic font-serif">
                  <Quote className="w-4 h-4 shrink-0 text-rose-400 opacity-80" />
                  <span>{profile.favoriteQuote}</span>
                </div>
              )}

              {/* Favorite Character Preview */}
              {favoriteCharObj && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-current/5 border border-current/10">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={favoriteCharObj.avatar}
                      alt={favoriteCharObj.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div>
                      <div className="text-xs font-bold">{favoriteCharObj.name}</div>
                      <div className="text-[10px] opacity-60">Nhân vật yêu thích nhất</div>
                    </div>
                  </div>
                  {onOpenCharacterDetail && (
                    <button
                      onClick={() => onOpenCharacterDetail(favoriteCharObj)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                    >
                      Xem chi tiết
                    </button>
                  )}
                </div>
              )}

              {/* Favorite Tags */}
              {profile.favoriteTags && profile.favoriteTags.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-serif opacity-70">Thể loại yêu thích:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.favoriteTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-full text-[11px] bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions: Download My Data & Reset Profile */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-current/10">
              <button
                onClick={handleDownloadMyData}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-current/5 hover:bg-current/10 text-current flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Tải xuống toàn bộ hồ sơ, bookmarks và dữ liệu cá nhân"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải xuống dữ liệu của tôi</span>
              </button>

              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Đưa hồ sơ về trạng thái mặc định"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại hồ sơ</span>
              </button>
            </div>
          </div>
        ) : (
          /* ================= EDIT MODE ================= */
          <div className="space-y-6">
            {/* Avatar Editing Section */}
            <div className="p-4 sm:p-5 rounded-2xl bg-current/5 border border-current/10 space-y-4">
              <h4 className="text-xs font-bold font-serif uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-rose-500" />
                <span>Tùy Chỉnh Avatar</span>
              </h4>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Avatar Preview */}
                <div className="relative">
                  {renderFrameDecoration(editedProfile.avatarFrame)}
                  <div
                    className={`w-24 h-24 sm:w-28 sm:h-28 ${
                      editedProfile.avatarShape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                    } border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden bg-rose-50 dark:bg-slate-800 flex items-center justify-center relative`}
                  >
                    {editedProfile.avatar ? (
                      <img
                        src={editedProfile.avatar}
                        alt="Avatar preview"
                        className="w-full h-full object-cover transition-transform"
                        style={{
                          transform: `scale(${editedProfile.avatarZoom || 1})`,
                        }}
                      />
                    ) : (
                      <span className="text-3xl text-rose-500 font-serif animate-pulse">✦</span>
                    )}
                  </div>
                </div>

                {/* Avatar Controls */}
                <div className="flex-1 space-y-3 w-full">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500 text-white hover:bg-rose-600 shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Tải ảnh từ máy</span>
                    </button>

                    {editedProfile.avatar && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="px-3 py-2 rounded-xl text-xs font-semibold bg-current/10 hover:bg-rose-500/20 text-rose-500 flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Xóa ảnh hiện tại và về ngôi sao ✦"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Dùng ✦ mặc định</span>
                      </button>
                    )}
                  </div>

                  {/* Zoom Slider if image uploaded */}
                  {editedProfile.avatar && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] opacity-75">
                        <span className="flex items-center gap-1">
                          <ZoomIn className="w-3 h-3" /> Zoom ảnh:
                        </span>
                        <span>{Math.round(editedProfile.avatarZoom * 100)}%</span>
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
                        className="w-full accent-rose-500 h-1.5 bg-current/20 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Shape Switcher: Circle vs Rounded */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] opacity-70 font-serif">Kiểu dáng:</span>
                    <button
                      type="button"
                      onClick={() =>
                        setEditedProfile((prev) => ({ ...prev, avatarShape: 'circle' }))
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        editedProfile.avatarShape === 'circle'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-500 font-bold'
                          : 'border-current/20'
                      }`}
                    >
                      Hình tròn
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditedProfile((prev) => ({ ...prev, avatarShape: 'rounded' }))
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        editedProfile.avatarShape === 'rounded'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-500 font-bold'
                          : 'border-current/20'
                      }`}
                    >
                      Bo góc
                    </button>
                  </div>

                  {/* Preset Suggested Avatars from Admin */}
                  {suggestedAvatarsList.length > 0 && (
                    <div className="pt-2 border-t border-current/10 space-y-1.5">
                      <span className="text-[11px] font-bold font-serif opacity-80 flex items-center gap-1">
                        <span>✦ Avatar gợi ý từ Quản trị viên:</span>
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
                            className="relative w-11 h-11 rounded-xl overflow-hidden border-2 border-current/20 hover:border-rose-500 hover:scale-105 transition-all shadow-sm cursor-pointer group"
                            title={item.name}
                          >
                            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
                              ✓
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Name & Bio Input */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold font-serif mb-1 opacity-80">
                  Tên Hiển Thị *
                </label>
                <input
                  type="text"
                  maxLength={30}
                  value={editedProfile.name}
                  onChange={(e) =>
                    setEditedProfile((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="VD: Yui ♡ / Người Lữ Khách"
                  className="w-full px-4 py-2.5 rounded-xl bg-current/5 border border-current/20 text-xs font-semibold focus:outline-none focus:border-rose-500"
                />
                <p className="text-[10px] opacity-50 mt-1">
                  Tên này sẽ hiển thị trên hồ sơ và khi bạn gửi lời nhắn công khai.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold font-serif mb-1 opacity-80">
                  Bio (Đôi chút về bạn...)
                </label>
                <textarea
                  rows={2}
                  maxLength={120}
                  value={editedProfile.bio}
                  onChange={(e) =>
                    setEditedProfile((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="Viết một dòng ngắn về bạn... (VD: Mình chỉ ghé qua để tìm một góc nhỏ yên bình ♡)"
                  className="w-full px-4 py-2.5 rounded-xl bg-current/5 border border-current/20 text-xs font-serif leading-relaxed focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>
            </div>

            {/* Avatar Frame Selection (Khung Hồ Sơ - 15 Mẫu Concept & Cổ Điển) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold font-serif opacity-90 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  <span>Khung Hồ Sơ (15 Mẫu Concept & Cổ Điển)</span>
                </label>
                <span className="text-[10px] opacity-60 font-serif">Chọn để xem trước ngay lập tức</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto p-1.5 rounded-2xl bg-current/5 border border-current/10">
                {[
                  { id: 'none', number: '✦', name: 'Không khung', subtitle: 'Simple', icon: '⚪' },
                  { id: 'moonlit_sea', number: '01', name: 'Biển Đêm', subtitle: 'Moonlit Sea', icon: '🌊' },
                  { id: 'ancient_moon', number: '02', name: 'Cổ Trang', subtitle: 'Nguyệt Ảnh', icon: '🏮' },
                  { id: 'little_angel', number: '03', name: 'Thiên Thần', subtitle: 'Little Angel', icon: '🪽' },
                  { id: 'pixel_player', number: '04', name: 'Game Pixel', subtitle: 'Pixel Player', icon: '🎮' },
                  { id: 'sakura_breeze', number: '05', name: 'Hoa Anh Đào', subtitle: 'Sakura Breeze', icon: '🌸' },
                  { id: 'little_cosmos', number: '06', name: 'Không Gian Vũ Trụ', subtitle: 'Little Cosmos', icon: '🌌' },
                  { id: 'dear_you', number: '07', name: 'Thư Tay', subtitle: 'Dear You', icon: '💌' },
                  { id: 'cozy_room', number: '08', name: 'Phòng Ngủ Nhỏ', subtitle: 'Cozy Room', icon: '🛏️' },
                  { id: 'sweet_bakery', number: '09', name: 'Tiệm Bánh Ngọt', subtitle: 'Sweet Bakery', icon: '🍰' },
                  { id: 'secret_garden', number: '10', name: 'Rừng Bí Mật', subtitle: 'Secret Garden', icon: '🌿' },
                  { id: 'night_train', number: '11', name: 'Tàu Đêm', subtitle: 'Night Train', icon: '🚂' },
                  { id: 'deep_ocean', number: '12', name: 'Đại Dương Sâu', subtitle: 'Deep Ocean', icon: '🐚' },
                  { id: 'ancient_library', number: '13', name: 'Thư Viện Cổ', subtitle: 'Ancient Library', icon: '📚' },
                  { id: 'dreamy_park', number: '14', name: 'Công Viên Mơ Mộng', subtitle: 'Dreamy Park', icon: '🎡' },
                  { id: 'little_witch', number: '15', name: 'Phù Thủy Nhỏ', subtitle: 'Little Witch', icon: '🔮' },
                  { id: 'paper', number: '✦', name: 'Khung giấy', subtitle: 'Paper', icon: '📜' },
                  { id: 'ribbon', number: '✦', name: 'Khung nơ', subtitle: 'Ribbon', icon: '୨୧' },
                  { id: 'star', number: '✦', name: 'Khung sao', subtitle: 'Star', icon: '✦' },
                  { id: 'flower', number: '✦', name: 'Khung hoa', subtitle: 'Flower', icon: '🌸' },
                  { id: 'glass', number: '✦', name: 'Khung kính', subtitle: 'Glass', icon: '✧' },
                  { id: 'winter', number: '✦', name: 'Mùa đông', subtitle: 'Winter', icon: '❄️' },
                ].map((frame) => {
                  const isActive = editedProfile.avatarFrame === frame.id;
                  return (
                    <button
                      key={frame.id}
                      type="button"
                      onClick={() => {
                        setEditedProfile((prev) => ({
                          ...prev,
                          avatarFrame: frame.id as AvatarFrame,
                        }));
                        if (isSfxOn) triggerSfx('pop', sfxVolume);
                      }}
                      className={`p-2.5 rounded-xl text-left flex flex-col justify-between border transition-all relative group cursor-pointer ${
                        isActive
                          ? 'bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-300 shadow-sm ring-1 ring-rose-400 font-bold'
                          : 'bg-current/5 border-current/10 hover:bg-current/10 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <div className="flex items-center gap-1.5">
                          {frame.number !== '✦' && (
                            <span className="text-[10px] font-mono px-1 rounded bg-current/10 opacity-70">
                              {frame.number}
                            </span>
                          )}
                          <span className="text-base">{frame.icon}</span>
                        </div>
                        {isActive && (
                          <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold font-serif shadow-xs">
                            Đang sử dụng ♡
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

            {/* Profile Theme Selection (Theme Cá Nhân) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold font-serif opacity-80 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-rose-500" />
                <span>Theme Riêng Cho Profile Của Bạn</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'soft-paper', label: 'Soft Paper', color: 'bg-[#faf6ee] text-slate-800' },
                  { id: 'light', label: 'Light', color: 'bg-white text-slate-800' },
                  { id: 'dark', label: 'Dark', color: 'bg-slate-900 text-slate-100' },
                  { id: 'night-sky', label: 'Night Sky', color: 'bg-[#14122e] text-purple-200' },
                  { id: 'winter', label: 'Winter', color: 'bg-[#e8f4fc] text-slate-800' },
                  { id: 'spring', label: 'Spring', color: 'bg-[#fff0f5] text-slate-800' },
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
                    className={`p-2.5 rounded-xl text-xs flex items-center justify-between border transition-all ${
                      editedProfile.profileTheme === themeItem.id
                        ? 'border-rose-500 ring-2 ring-rose-400 font-bold'
                        : 'border-current/20 opacity-80 hover:opacity-100'
                    } ${themeItem.color}`}
                  >
                    <span>{themeItem.label}</span>
                    {editedProfile.profileTheme === themeItem.id && (
                      <Check className="w-3.5 h-3.5 text-rose-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* About Me Info Details (Favorite Character, Quote, Tags) */}
            <div className="p-4 rounded-2xl bg-current/5 border border-current/10 space-y-4">
              <h4 className="text-xs font-bold font-serif uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>Trang Giới Thiệu (Về Mình)</span>
                </span>

                {/* Public / Private Toggle */}
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <span>Công khai:</span>
                  <input
                    type="checkbox"
                    checked={editedProfile.isPublic}
                    onChange={(e) =>
                      setEditedProfile((prev) => ({ ...prev, isPublic: e.target.checked }))
                    }
                    className="accent-rose-500 w-4 h-4 rounded cursor-pointer"
                  />
                </label>
              </h4>

              {/* Favorite Character Picker */}
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-75 font-serif">
                  Nhân vật yêu thích nhất
                </label>
                <select
                  value={editedProfile.favoriteCharacterId || ''}
                  onChange={(e) =>
                    setEditedProfile((prev) => ({
                      ...prev,
                      favoriteCharacterId: e.target.value || null,
                    }))
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-current/5 border border-current/20 text-xs font-medium focus:outline-none focus:border-rose-500 text-current"
                >
                  <option value="" className="bg-slate-900 text-white">-- Chưa chọn nhân vật --</option>
                  {allCharacters.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.name} ({c.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Favorite Quote */}
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-75 font-serif">
                  Một câu mình thích
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={editedProfile.favoriteQuote}
                  onChange={(e) =>
                    setEditedProfile((prev) => ({ ...prev, favoriteQuote: e.target.value }))
                  }
                  placeholder="VD: Góc nhỏ này dịu êm như một tách trà ấm ♡"
                  className="w-full px-3.5 py-2 rounded-xl bg-current/5 border border-current/20 text-xs font-serif focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Favorite Tags Multiselect */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 opacity-75 font-serif">
                  Thể loại yêu thích (chọn tối đa 4)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TAGS.map((tag) => {
                    const isSelected = editedProfile.favoriteTags?.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          let updatedTags = [...(editedProfile.favoriteTags || [])];
                          if (isSelected) {
                            updatedTags = updatedTags.filter((t) => t !== tag);
                          } else {
                            if (updatedTags.length >= 4) {
                              if (onToast) onToast('Bạn chỉ nên chọn tối đa 4 thể loại yêu thích nhé ♡');
                              return;
                            }
                            updatedTags.push(tag);
                          }
                          setEditedProfile((prev) => ({ ...prev, favoriteTags: updatedTags }));
                        }}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                          isSelected
                            ? 'bg-rose-500 text-white border-rose-500'
                            : 'bg-current/5 border-current/10 hover:bg-current/10'
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Save & Cancel Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-current/10">
              <button
                type="button"
                onClick={() => {
                  setEditedProfile(profile);
                  setIsEditing(false);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-current/10 transition-colors"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleSave}
                className={`relative px-8 py-3 rounded-full text-xs sm:text-sm font-bold ${themeStyles.buttonPrimary} shadow-lg transition-transform active:scale-95 flex items-center gap-2 cursor-pointer`}
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>♡ Lưu thay đổi</span>
                {isSavedGlow && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 1 }}
                    animate={{ scale: 1.4, opacity: 0 }}
                    className="absolute inset-0 rounded-full border-2 border-white pointer-events-none"
                  />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Modal for Reset Profile */}
        <AnimatePresence>
          {isResetConfirmOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-4 z-50 bg-slate-900/95 text-white rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-2xl backdrop-blur-md space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl font-serif">
                ✦
              </div>

              <div className="space-y-1 max-w-sm">
                <h4 className="text-base font-bold font-serif">
                  Đưa hồ sơ về trạng thái mặc định?
                </h4>
                <p className="text-xs text-slate-300 font-serif leading-relaxed">
                  Avatar sẽ trở về ngôi sao ✦, khung và theme sẽ được đặt lại. <br />
                  <span className="text-rose-300 font-semibold">
                    (Character yêu thích, Bookmark và phụ kiện đã lưu vẫn giữ nguyên an toàn.)
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleResetProfile}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md transition-colors"
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

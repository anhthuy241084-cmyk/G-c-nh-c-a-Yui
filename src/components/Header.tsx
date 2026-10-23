import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sun,
  Moon,
  Heart,
  Sparkles,
  ShieldCheck,
  Bell,
  Music,
  Menu,
  X,
  Dices,
  Cake,
  Mail,
  Send,
  Trophy,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { ThemeMode, UserProfile } from '../types';

import { triggerSfx } from '../utils/sfx';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenContact: () => void;
  onOpenVoting: () => void;
  onOpenAdmin: () => void;
  onOpenMessageBoard: () => void;
  onOpenAudioSettings: () => void;
  unreadNotificationCount?: number;
  onOpenNotifications: () => void;
  noteCount?: number;
  onOpenRandom: () => void;
  onOpenBakery?: () => void;
  onOpenMascotWardrobe?: () => void;
  onTriggerEasterEgg?: (x: number, y: number) => void;
  isSfxOn?: boolean;
  sfxVolume?: number;
  onToast?: (msg: string) => void;
  userProfile?: UserProfile;
  onOpenProfile?: () => void;
  onOpenWishingBottle: () => void;
  onOpenCreatorRequest?: () => void;
  onOpenCommandLibrary?: () => void;
  onOpenFortune?: () => void;
  onOpenHelpCenter?: () => void;
  onOpenMusicBox?: () => void;
  onOpenArchipelago?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenContact,
  onOpenVoting,
  onOpenAdmin,
  onOpenMessageBoard,
  onOpenAudioSettings,
  unreadNotificationCount = 0,
  onOpenNotifications,
  noteCount = 0,
  onOpenRandom,
  onOpenBakery,
  onOpenMascotWardrobe,
  onTriggerEasterEgg,
  isSfxOn = true,
  sfxVolume = 0.5,
  onToast,
  userProfile,
  onOpenProfile,
  onOpenWishingBottle,
  onOpenCreatorRequest,
  onOpenCommandLibrary,
  onOpenFortune,
  onOpenHelpCenter,
  onOpenMusicBox,
  onOpenArchipelago,
}) => {
  const [clickCount, setClickCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleTitleClick = (e: React.MouseEvent) => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);
    if (nextCount >= 4) {
      setClickCount(0);
      if (onTriggerEasterEgg) {
        onTriggerEasterEgg(e.clientX, e.clientY);
      }
    }
  };

  const handleMenuItemClick = (action: () => void) => {
    if (isSfxOn) triggerSfx('pop', sfxVolume);
    setIsMenuOpen(false);
    action();
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#F6FBFC]/85 dark:bg-[#05131A]/85 border-b border-[#38CAD6]/25 dark:border-[#102B36] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Left Side: Brand Title & Ocean Lantern 🏮 */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Ocean Lantern 🏮 */}


          {/* Brand Title & Logo */}
          <button
            onClick={handleTitleClick}
            className="flex items-center gap-2.5 group text-left transition-transform active:scale-95 cursor-pointer"
            title="Nhấn để xem màn hình chào mừng (Nhấn nhiều lần để mở hiệu ứng ánh sáng ngọc trai ✦)"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#38CAD6] to-[#1B6E7D] text-white flex items-center justify-center shadow-md shadow-[#1B6E7D]/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>

            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-[#14303A] dark:text-[#E4F7F9] flex items-center gap-1.5 font-serif">
                <span>Góc nhỏ</span>
                <span className="text-xs text-[#38CAD6] dark:text-[#48CCD6] font-normal hidden sm:inline">(｡･ω･｡)ﾉ♡</span>
              </h1>
              <p className="text-[10px] sm:text-xs text-[#53737C] dark:text-[#88A9B3]">
                Thư viện Character AI
              </p>
            </div>
          </button>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Fortune Shell Quick Button 🐚 */}
          {onOpenFortune && (
            <button
              onClick={onOpenFortune}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#1B6E7D] dark:text-[#48CCD6] bg-[#E8F7F9] dark:bg-[#0E2732] hover:bg-[#DDF2F5] dark:hover:bg-[#143943] border border-[#38CAD6]/35 transition-all shadow-xs cursor-pointer active:scale-95 font-serif"
              title="Rút lời nhắn vỏ sò biển hôm nay"
            >
              <span className="text-sm">🐚</span>
              <span>Lời nhắn biển</span>
            </button>
          )}

          {/* Ocean Music Box Quick Button 🎶 */}
          {onOpenMusicBox && (
            <button
              onClick={onOpenMusicBox}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#1B6E7D] dark:text-[#48CCD6] bg-[#E8F7F9] dark:bg-[#0E2732] hover:bg-[#DDF2F5] dark:hover:bg-[#143943] border border-[#38CAD6]/35 transition-all shadow-xs cursor-pointer active:scale-95 font-serif"
              title="Mở Hộp Nhạc Sóng Biển (Lo-Fi & Thư giãn 🎶)"
            >
              <span className="text-sm">🎶</span>
              <span className="hidden xl:inline">Hộp nhạc biển</span>
            </button>
          )}

          {/* Sound Corner Button 🎵 */}
          <button
            onClick={onOpenAudioSettings}
            className="hidden md:inline-flex p-2 rounded-full text-[#1B6E7D] dark:text-[#48CCD6] bg-[#E8F7F9] dark:bg-[#0E2732] hover:bg-[#DDF2F5] dark:hover:bg-[#143943] border border-[#38CAD6]/35 dark:border-[#132F3D] transition-colors shadow-xs cursor-pointer"
            title="Góc âm thanh (BGM & Hiệu ứng đại dương)"
          >
            <Music className="w-4 h-4" />
          </button>

          {/* Notification Bell Button */}
          <button
            onClick={onOpenNotifications}
            className="hidden sm:inline-flex relative p-2 rounded-full text-[#14303A] dark:text-[#E4F7F9] bg-[#E8F7F9]/80 dark:bg-[#0E2732] hover:bg-[#DDF2F5] dark:hover:bg-[#143943] border border-[#38CAD6]/35 dark:border-[#132F3D] transition-colors cursor-pointer"
            title="Thông báo mới"
          >
            <Bell className="w-4 h-4 text-[#14303A] dark:text-[#E4F7F9]" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[#38CAD6] border-2 border-[#F6FBFC] dark:border-[#05131A] animate-pulse" />
            )}
          </button>

          {/* User Profile Button ୨୧ */}
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="hidden sm:inline-flex flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-full text-xs font-semibold bg-[#E8F7F9] dark:bg-[#0E2732] text-[#1B6E7D] dark:text-[#48CCD6] hover:bg-[#DDF2F5] dark:hover:bg-[#143943] border border-[#38CAD6]/35 dark:border-[#132F3D] shadow-xs transition-all active:scale-95 group cursor-pointer"
              title="Hồ sơ của bạn"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden bg-[#DDF2F5] dark:bg-[#091D26] border border-[#38CAD6]/50 dark:border-[#48CCD6]/50 flex items-center justify-center text-xs text-[#1B6E7D] dark:text-[#48CCD6] font-serif">
                {userProfile?.avatar ? (
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>✦</span>
                )}
              </div>
              <span className="hidden md:inline font-medium max-w-[85px] truncate">
                {userProfile?.name || 'Hồ sơ'}
              </span>
            </button>
          )}

          {/* Theme Mode Toggle Button: Light <-> Dark */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full text-[#14303A] dark:text-[#E4F7F9] bg-[#E8F7F9]/80 dark:bg-[#0E2732] hover:bg-[#DDF2F5] dark:hover:bg-[#143943] border border-[#38CAD6]/35 dark:border-[#132F3D] transition-all cursor-pointer"
            title={theme === 'light' ? 'Chìm vào Đáy biển ban đêm (Dark Mode)' : 'Trở về Mặt biển ban ngày (Light Mode)'}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-[#1B6E7D]" />
            ) : (
              <Sun className="w-4 h-4 text-[#38CAD6]" />
            )}
          </button>

          {/* Quản lý & Sáng tạo — Admin */}
          <button
            id="btn-admin-manage"
            onClick={onOpenAdmin}
            className="hidden sm:inline-flex p-2 rounded-full text-[#53737C] dark:text-[#88A9B3] hover:text-[#1B6E7D] dark:hover:text-[#48CCD6] hover:bg-[#E8F7F9] dark:hover:bg-[#0E2732] transition-colors cursor-pointer"
            title="Quản lý & Sáng tạo"
          >
            <ShieldCheck className="w-4 h-4 text-[#38CAD6] dark:text-[#48CCD6]" />
          </button>

          {/* ================= ☰ UNIFIED MENU BUTTON ================= */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => {
                if (isSfxOn) triggerSfx('pop', sfxVolume);
                setIsMenuOpen(!isMenuOpen);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 shadow-md cursor-pointer ${
                isMenuOpen
                  ? 'bg-[#1B6E7D] text-white ring-2 ring-[#38CAD6]'
                  : 'bg-gradient-to-r from-[#38CAD6] to-[#1B6E7D] text-white hover:opacity-95 shadow-[#1B6E7D]/25'
              }`}
              title="Menu Góc Nhỏ"
            >
              {isMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
              <span className="font-serif tracking-wide">Menu</span>
              {noteCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#38CAD6] animate-ping" />
              )}
            </button>

            {/* Menu Popover / Dropdown */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 10 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2.5 w-72 sm:w-80 max-w-[calc(100vw-24px)] rounded-3xl bg-white/95 dark:bg-[#0E232E]/95 backdrop-blur-2xl border border-[#38CAD6]/35 dark:border-[#38CAD6]/20 shadow-2xl shadow-[#1B6E7D]/15 dark:shadow-black/70 overflow-hidden z-50 p-2.5 space-y-1.5 font-sans"
                >
                  {/* Menu Top Banner */}
                  <div className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#E8F7F9] to-[#DFEFF2] dark:from-[#091D26] dark:to-[#0E2732] border border-[#38CAD6]/25 dark:border-[#132F3D] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold font-serif text-[#14303A] dark:text-[#E4F7F9] flex items-center gap-1.5">
                        <span className="text-[#38CAD6]">🌊</span>
                        <span>Menu Góc Nhỏ</span>
                      </div>
                      <p className="text-[10px] text-[#53737C] dark:text-[#88A9B3]">
                        Khám phá các góc tương tác đại dương
                      </p>
                    </div>
                    <span className="text-sm select-none">🌊</span>
                  </div>

                  {/* Mobile Quick Action Buttons */}
                  <div className="grid grid-cols-4 gap-1.5 p-1 sm:hidden border-b border-[#38CAD6]/20 dark:border-[#132F3D] pb-2">
                    {/* Audio Settings Button 🎵 */}
                    <button
                      onClick={() => handleMenuItemClick(onOpenAudioSettings)}
                      className="flex flex-col items-center justify-center p-1.5 rounded-2xl bg-[#E8F7F9] dark:bg-[#091D26] text-[#1B6E7D] dark:text-[#48CCD6] border border-[#38CAD6]/25 transition-all cursor-pointer"
                      title="Góc âm thanh"
                    >
                      <Music className="w-4 h-4 mb-1" />
                      <span className="text-[9px] font-bold">Âm thanh</span>
                    </button>

                    {/* Notifications Button 🔔 */}
                    <button
                      onClick={() => handleMenuItemClick(onOpenNotifications)}
                      className="relative flex flex-col items-center justify-center p-1.5 rounded-2xl bg-[#E8F7F9] dark:bg-[#091D26] text-[#14303A] dark:text-[#E4F7F9] border border-[#38CAD6]/25 transition-all cursor-pointer"
                      title="Thông báo mới"
                    >
                      <Bell className="w-4 h-4 mb-1" />
                      <span className="text-[9px] font-bold">Thông báo</span>
                      {unreadNotificationCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 px-1 min-w-[14px] h-3.5 rounded-full bg-[#38CAD6] text-[#05131A] text-[8px] font-extrabold flex items-center justify-center border border-white dark:border-[#0E232E]">
                          {unreadNotificationCount}
                        </span>
                      )}
                    </button>

                    {/* Profile Button 👤 */}
                    {onOpenProfile && (
                      <button
                        onClick={() => handleMenuItemClick(onOpenProfile)}
                        className="flex flex-col items-center justify-center p-1.5 rounded-2xl bg-[#E8F7F9] dark:bg-[#091D26] text-[#1B6E7D] dark:text-[#48CCD6] border border-[#38CAD6]/25 transition-all cursor-pointer"
                        title="Hồ sơ cá nhân"
                      >
                        <div className="w-4.5 h-4.5 rounded-full overflow-hidden border border-[#38CAD6] mb-0.5 flex items-center justify-center bg-white">
                          {userProfile?.avatar ? (
                            <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[9px]">✦</span>
                          )}
                        </div>
                        <span className="text-[9px] font-bold truncate max-w-full">Hồ sơ</span>
                      </button>
                    )}

                    {/* Admin Button 🛡️ */}
                    <button
                      onClick={() => handleMenuItemClick(onOpenAdmin)}
                      className="flex flex-col items-center justify-center p-1.5 rounded-2xl bg-[#E8F7F9] dark:bg-[#091D26] text-[#1B6E7D] dark:text-[#48CCD6] border border-[#38CAD6]/25 transition-all cursor-pointer"
                      title="Quản trị viên"
                    >
                      <ShieldCheck className="w-4 h-4 mb-1" />
                      <span className="text-[9px] font-bold">Quản lý</span>
                    </button>
                  </div>

                  {/* Menu Categorized List with Elegant Divider Connectors */}
                  <div className="space-y-2 pt-1 max-h-[72vh] overflow-y-auto pr-0.5 custom-scrollbar">

                    {/* ================= PHẦN 1: KHÁM PHÁ & TRẢI NGHIỆM ================= */}
                    <div>
                      <div className="px-2.5 py-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#1B6E7D] dark:text-[#7DD8DE] font-serif">
                        <span>✦ Khám Phá & Trải Nghiệm</span>
                        <div className="flex-1 h-[1px] bg-gradient-to-r from-[#38CAD6]/40 to-transparent" />
                      </div>

                      <div className="space-y-0.5 mt-1">
                        {/* 🎶 Hộp Nhạc Sóng Biển (Ocean Music Box) */}
                        {onOpenMusicBox && (
                          <button
                            onClick={() => handleMenuItemClick(onOpenMusicBox)}
                            className="w-full p-2.5 rounded-2xl hover:bg-[#E8F7F9] dark:hover:bg-[#132F3D] flex items-center gap-3 transition-colors text-left group cursor-pointer"
                          >
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#38CAD6] to-[#1B6E7D] text-white flex items-center justify-center text-base shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                              🎶
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-[#14303A] dark:text-[#E4F7F9] flex items-center gap-1.5">
                                <span>Hộp Nhạc Sóng Biển</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#38CAD6]/20 text-[#1B6E7D] dark:text-[#48CCD6] font-semibold font-sans">
                                  Mới ✦
                                </span>
                              </div>
                              <p className="text-[11px] text-[#53737C] dark:text-[#88A9B3] truncate">
                                Lo-Fi sóng biển, mưa đêm & hẹn giờ thư giãn
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#53737C] group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        )}

                        {/* 🗺️ Hải Đồ Thám Hiểm (Archipelago Map) */}
                        {onOpenArchipelago && (
                          <button
                            onClick={() => handleMenuItemClick(onOpenArchipelago)}
                            className="w-full p-2.5 rounded-2xl hover:bg-[#E8F7F9] dark:hover:bg-[#132F3D] flex items-center gap-3 transition-colors text-left group cursor-pointer"
                          >
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1B6E7D] to-[#38CAD6] text-white flex items-center justify-center text-base shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                              🗺️
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-[#14303A] dark:text-[#E4F7F9] flex items-center gap-1.5">
                                <span>Hải Đồ Thám Hiểm</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#38CAD6]/20 text-[#1B6E7D] dark:text-[#48CCD6] font-semibold font-sans">
                                  Bản đồ ✦
                                </span>
                              </div>
                              <p className="text-[11px] text-[#53737C] dark:text-[#88A9B3] truncate">
                                Bản đồ quần đảo nhân vật & rương báu bí ẩn
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#53737C] group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        )}

                        {/* 🐚 Lời nhắn vỏ sò biển (Ocean Fortune) */}
                        {onOpenFortune && (
                          <button
                            onClick={() => handleMenuItemClick(onOpenFortune)}
                            className="w-full p-2.5 rounded-2xl hover:bg-[#E8F7F9] dark:hover:bg-[#132F3D] flex items-center gap-3 transition-colors text-left group cursor-pointer"
                          >
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#38CAD6] to-[#1B6E7D] text-white flex items-center justify-center text-base shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                              🐚
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-[#14303A] dark:text-[#E4F7F9] flex items-center gap-1.5">
                                <span>Lời nhắn vỏ sò biển</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#38CAD6]/20 text-[#1B6E7D] dark:text-[#48CCD6] font-semibold font-sans">
                                  Mới
                                </span>
                              </div>
                              <p className="text-[11px] text-[#53737C] dark:text-[#88A9B3] truncate">
                                Rút thông điệp biển khơi & gợi ý hôm nay
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#53737C] group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        )}

                        {/* ✦ Kho lệnh (Command Library) ✦ */}
                        {onOpenCommandLibrary && (
                          <button
                            onClick={() => handleMenuItemClick(onOpenCommandLibrary)}
                            className="w-full p-2.5 rounded-2xl hover:bg-[#E8F7F9] dark:hover:bg-[#132F3D] flex items-center gap-3 transition-colors text-left group cursor-pointer"
                          >
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#38CAD6] to-[#1B6E7D] text-white flex items-center justify-center text-sm font-serif shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                              ✦
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-[#14303A] dark:text-[#E4F7F9] flex items-center gap-1.5">
                                <span>Kho thẻ lệnh & Prompts</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#38CAD6]/20 text-[#1B6E7D] dark:text-[#48CCD6] font-semibold font-sans">
                                  Hot ✦
                                </span>
                              </div>
                              <p className="text-[11px] text-[#53737C] dark:text-[#88A9B3] truncate">
                                Kệ thẻ lệnh & prompt mẫu sáng tạo
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#53737C] group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        )}

                        {/* 🍾 Chai Thủy Tinh Ước Nguyện */}
                        <button
                          onClick={() => handleMenuItemClick(onOpenWishingBottle)}
                          className="w-full p-2.5 rounded-2xl hover:bg-[#E8F7F9] dark:hover:bg-[#132F3D] flex items-center gap-3 transition-colors text-left group cursor-pointer"
                        >
                          <div className="w-9 h-9 rounded-xl bg-[#E0F3F5] dark:bg-[#091D26] text-[#1B6E7D] dark:text-[#48CCD6] flex items-center justify-center text-base shrink-0 group-hover:scale-110 transition-transform">
                            🍾
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-[#14303A] dark:text-[#E4F7F9] flex items-center gap-1.5">
                              <span>Chai Thủy Tinh Ước Nguyện</span>
                              <span className="text-[10px] text-[#38CAD6] font-normal">✦</span>
                            </div>
                            <p className="text-[11px] text-[#53737C] dark:text-[#88A9B3] truncate">
                              Thả & vớt bức thư trôi dạt theo dòng hải lưu
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#53737C] group-hover:translate-x-0.5 transition-transform" />
                        </button>

                        {/* 🎲 Hôm nay gặp ai đây? */}
                        <button
                          onClick={() => handleMenuItemClick(onOpenRandom)}
                          className="w-full p-2.5 rounded-2xl hover:bg-[#E8F7F9] dark:hover:bg-[#132F3D] flex items-center gap-3 transition-colors text-left group cursor-pointer"
                        >
                          <div className="w-9 h-9 rounded-xl bg-[#E0F3F5] dark:bg-[#091D26] text-[#38CAD6] dark:text-[#48CCD6] flex items-center justify-center text-base shrink-0 group-hover:scale-110 transition-transform">
                            🎲
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-[#14303A] dark:text-[#E4F7F9] flex items-center gap-1.5">
                              <span>Hôm nay gặp ai đây?</span>
                              <span className="text-[10px] font-normal text-[#38CAD6]">✦</span>
                            </div>
                            <p className="text-[11px] text-[#53737C] dark:text-[#88A9B3] truncate">
                              Gợi ý nhân vật ngẫu nhiên hôm nay
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#53737C] group-hover:translate-x-0.5 transition-transform" />
                        </button>

                        {/* 🍰 Tiệm bánh nhỏ (Bakery) */}
                        {onOpenBakery && (
                          <button
                            onClick={() => handleMenuItemClick(onOpenBakery)}
                            className="w-full p-2.5 rounded-2xl hover:bg-[#E8F7F9] dark:hover:bg-[#132F3D] flex items-center gap-3 transition-colors text-left group cursor-pointer"
                          >
                            <div className="w-9 h-9 rounded-xl bg-[#E0F3F5] dark:bg-[#091D26] text-[#1B6E7D] dark:text-[#48CCD6] flex items-center justify-center text-base shrink-0 group-hover:scale-110 transition-transform">
                              🍰
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-[#14303A] dark:text-[#E4F7F9] flex items-center gap-1.5">
                                <span>Góc chơi nhỏ (Tiệm bánh)</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#38CAD6]/20 text-[#1B6E7D] dark:text-[#48CCD6] font-semibold font-sans">
                                  Mini-game
                                </span>
                              </div>
                              <p className="text-[11px] text-[#53737C] dark:text-[#88A9B3] truncate">
                                Tiệm bánh ngọt ngào dưới biển Bakery
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#53737C] group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ————— THANH NỐI PHÂN CÁCH NHẸ NHÀNG ————— */}
                    <div className="py-1 px-2">
                      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#38CAD6]/35 dark:via-[#38CAD6]/20 to-transparent" />
                    </div>

                    {/* ================= PHẦN 2: TƯƠNG TÁC & GỬI GẮM ================= */}
                    <div>
                      <div className="px-2.5 py-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#1B6E7D] dark:text-[#7DD8DE] font-serif">
                        <span>💌 Tương Tác & Gửi Gắm</span>
                        <div className="flex-1 h-[1px] bg-gradient-to-r from-[#38CAD6]/40 to-transparent" />
                      </div>

                      <div className="space-y-0.5 mt-1">
                        {/* 💌 Khung lời nhắn */}
                        <button
                          onClick={() => handleMenuItemClick(onOpenMessageBoard)}
                          className="w-full p-2.5 rounded-2xl hover:bg-[#E8F7F9] dark:hover:bg-[#132F3D] flex items-center gap-3 transition-colors text-left group cursor-pointer"
                        >
                          <div className="w-9 h-9 rounded-xl bg-[#E0F3F5] dark:bg-[#091D26] text-[#1B6E7D] dark:text-[#48CCD6] flex items-center justify-center text-base shrink-0 group-hover:scale-110 transition-transform">
                            💌
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-[#14303A] dark:text-[#E4F7F9] flex items-center gap-1.5">
                              <span>Khung lời nhắn</span>
                              {noteCount > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full bg-[#38CAD6] text-white text-[10px] font-extrabold font-sans">
                                  {noteCount}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#53737C] dark:text-[#88A9B3] truncate">
                              Bảng lời nhắn công khai gửi gắm tâm tình
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#53737C] group-hover:translate-x-0.5 transition-transform" />
                        </button>

                        {/* 📮 Gửi đơn Creator (Request) */}
                        {onOpenCreatorRequest && (
                          <button
                            onClick={() => handleMenuItemClick(onOpenCreatorRequest)}
                            className="w-full p-2.5 rounded-2xl hover:bg-[#E8F7F9] dark:hover:bg-[#132F3D] flex items-center gap-3 transition-colors text-left group cursor-pointer"
                          >
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#38CAD6] to-[#1B6E7D] text-white flex items-center justify-center text-sm shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                              <Send className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-[#14303A] dark:text-[#E4F7F9] flex items-center gap-1.5">
                                <span>Gửi đơn Creator (Request)</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#38CAD6]/20 text-[#1B6E7D] dark:text-[#48CCD6] font-semibold font-sans">
                                  Hot
                                </span>
                              </div>
                              <p className="text-[11px] text-[#53737C] dark:text-[#88A9B3] truncate">
                                Gửi yêu cầu nhân vật & nhận phản hồi
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#53737C] group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        )}

                        {/* ❓ Sổ tay trợ giúp */}
                        {onOpenHelpCenter && (
                          <button
                            onClick={() => handleMenuItemClick(onOpenHelpCenter)}
                            className="w-full p-2.5 rounded-2xl hover:bg-[#E8F7F9] dark:hover:bg-[#132F3D] flex items-center gap-3 transition-colors text-left group cursor-pointer"
                          >
                            <div className="w-9 h-9 rounded-xl bg-[#E0F3F5] dark:bg-[#091D26] text-[#38CAD6] dark:text-[#48CCD6] flex items-center justify-center text-base shrink-0 group-hover:scale-110 transition-transform">
                              ❓
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-[#14303A] dark:text-[#E4F7F9] flex items-center gap-1.5">
                                <span>Sổ tay trợ giúp</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#38CAD6]/20 text-[#1B6E7D] dark:text-[#48CCD6] font-semibold font-sans">
                                  Guide
                                </span>
                              </div>
                              <p className="text-[11px] text-[#53737C] dark:text-[#88A9B3] truncate">
                                Hướng dẫn khám phá, mẹo nhỏ & hỏi đáp
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#53737C] group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ————— THANH NỐI PHÂN CÁCH NHẸ NHÀNG ————— */}
                    <div className="py-1 px-2">
                      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#38CAD6]/35 dark:via-[#38CAD6]/20 to-transparent" />
                    </div>

                    {/* ================= PHẦN 3: KẾT NỐI & ĐÁNH GIÁ ================= */}
                    <div>
                      <div className="px-2.5 py-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#1B6E7D] dark:text-[#7DD8DE] font-serif">
                        <span>♡ Kết Nối & Đánh Giá</span>
                        <div className="flex-1 h-[1px] bg-gradient-to-r from-[#38CAD6]/40 to-transparent" />
                      </div>

                      <div className="space-y-0.5 mt-1">
                        {/* 🐚 Liên hệ */}
                        <button
                          onClick={() => handleMenuItemClick(onOpenContact)}
                          className="w-full p-2.5 rounded-2xl hover:bg-[#E8F7F9] dark:hover:bg-[#132F3D] flex items-center gap-3 transition-colors text-left group cursor-pointer"
                        >
                          <div className="w-9 h-9 rounded-xl bg-[#E0F3F5] dark:bg-[#091D26] text-[#1B6E7D] dark:text-[#48CCD6] flex items-center justify-center text-base shrink-0 group-hover:scale-110 transition-transform">
                            🐚
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-[#14303A] dark:text-[#E4F7F9] flex items-center gap-1.5">
                              <span>Liên hệ</span>
                            </div>
                            <p className="text-[11px] text-[#53737C] dark:text-[#88A9B3] truncate">
                              Page Facebook & NGL nhắn tin ẩn danh
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#53737C] group-hover:translate-x-0.5 transition-transform" />
                        </button>

                        {/* ♡ Bình chọn */}
                        <button
                          onClick={() => handleMenuItemClick(onOpenVoting)}
                          className="w-full p-2.5 rounded-2xl hover:bg-[#E8F7F9] dark:hover:bg-[#132F3D] flex items-center gap-3 transition-colors text-left group cursor-pointer"
                        >
                          <div className="w-9 h-9 rounded-xl bg-[#38CAD6] text-white flex items-center justify-center text-sm shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                            <Heart className="w-4 h-4 fill-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-[#14303A] dark:text-[#E4F7F9] flex items-center gap-1.5">
                              <span>Bình chọn</span>
                              <span className="text-[10px] text-[#38CAD6] font-normal">♡</span>
                            </div>
                            <p className="text-[11px] text-[#53737C] dark:text-[#88A9B3] truncate">
                              Bảng xếp hạng & Thả tim Character yêu thích
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#53737C] group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </header>
  );
};

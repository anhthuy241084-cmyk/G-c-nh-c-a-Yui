import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sun,
  Moon,
  Sparkles,
  ShieldCheck,
  Bell,
  Music,
  Menu,
  X,
  Dices,
  Bookmark,
  Send,
  Heart,
  ChevronRight,
  BookOpen,
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
  onOpenBookmarks?: () => void;
  onReopenIntro?: () => void;
  onTriggerEasterEgg?: (x: number, y: number) => void;
  isSfxOn?: boolean;
  sfxVolume?: number;
  onToast?: (msg: string) => void;
  userProfile?: UserProfile;
  onOpenProfile?: () => void;
  onOpenWishingBottle?: () => void;
  onOpenCreatorRequest?: () => void;
  onOpenCommandLibrary?: () => void;
  onOpenFortune?: () => void;
  onOpenHelpCenter?: () => void;
  onOpenMusicBox?: () => void;
  onOpenArchipelago?: () => void;
  bookmarkCount?: number;
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
  onOpenBookmarks,
  onReopenIntro,
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
  bookmarkCount = 0,
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
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#F7FAFD]/85 dark:bg-[#172536]/85 border-b border-[#DCE7EF] dark:border-[#43576B] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Left Side: Brand Title & Winter Memory Box Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={(e) => {
              handleTitleClick(e);
              if (onReopenIntro) onReopenIntro();
            }}
            className="flex items-center gap-2.5 group text-left transition-transform active:scale-95 cursor-pointer"
            title="Nhấn để xem lại Intro toàn màn hình Hộp Ký Ức Mùa Đông ❄"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#91A9BC] to-[#6E899E] dark:from-[#354A60] dark:to-[#A9BDCE] text-white flex items-center justify-center shadow-md shadow-[#91A9BC]/25 group-hover:scale-105 transition-transform text-base">
              ❄
            </div>

            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-[#526B80] dark:text-[#E5EDF5] flex items-center gap-1.5 font-serif">
                <span>Hộp Ký Ức Mùa Đông</span>
                <span className="text-xs text-[#91A9BC] dark:text-[#A9BDCE] font-normal hidden sm:inline">୨୧</span>
              </h1>
              <p className="text-[10px] sm:text-xs text-[#91A9BC] dark:text-[#A9BDCE] font-serif">
                Winter Memory Box · Yui
              </p>
            </div>
          </button>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Snow Bookmark Quick Button 🔖 */}
          {onOpenBookmarks && (
            <button
              onClick={onOpenBookmarks}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#526B80] dark:text-[#E5EDF5] bg-[#E8F1F8] dark:bg-[#202F42] hover:bg-[#D5E4EF] dark:hover:bg-[#354A60] border border-[#DCE7EF] dark:border-[#43576B] transition-all shadow-xs cursor-pointer active:scale-95 font-serif"
              title="Mở Snow Bookmark — Dấu Trang Tuyết"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#91A9BC]" />
              <span className="hidden sm:inline">Dấu Trang Tuyết</span>
              {bookmarkCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-[#91A9BC] text-white text-[10px] font-sans">
                  {bookmarkCount}
                </span>
              )}
            </button>
          )}

          {/* Snow Random Quick Button 🎲 */}
          <button
            onClick={onOpenRandom}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#526B80] dark:text-[#E5EDF5] bg-[#E8F1F8] dark:bg-[#202F42] hover:bg-[#D5E4EF] dark:hover:bg-[#354A60] border border-[#DCE7EF] dark:border-[#43576B] transition-all shadow-xs cursor-pointer active:scale-95 font-serif"
            title="Mở Snow Random — Hộp Tuyết Ngẫu Nhiên"
          >
            <span className="text-xs">🎲</span>
            <span className="hidden md:inline">Snow Random</span>
          </button>

          {/* Music Corner Button 🎵 */}
          <button
            onClick={onOpenAudioSettings}
            className="hidden md:inline-flex p-2 rounded-full text-[#526B80] dark:text-[#E5EDF5] bg-[#E8F1F8] dark:bg-[#202F42] hover:bg-[#D5E4EF] dark:hover:bg-[#354A60] border border-[#DCE7EF] dark:border-[#43576B] transition-colors shadow-xs cursor-pointer"
            title="Giai điệu mùa đông (BGM & Âm thanh)"
          >
            <Music className="w-4 h-4" />
          </button>

          {/* Notification Bell Button */}
          <button
            onClick={onOpenNotifications}
            className="hidden sm:inline-flex relative p-2 rounded-full text-[#526B80] dark:text-[#E5EDF5] bg-[#E8F1F8] dark:bg-[#202F42] hover:bg-[#D5E4EF] dark:hover:bg-[#354A60] border border-[#DCE7EF] dark:border-[#43576B] transition-colors cursor-pointer"
            title="Thông báo mới"
          >
            <Bell className="w-4 h-4 text-[#526B80] dark:text-[#E5EDF5]" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[#91A9BC] border-2 border-[#F7FAFD] dark:border-[#172536] animate-pulse" />
            )}
          </button>

          {/* User Profile Button ୨୧ */}
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="hidden sm:inline-flex flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-full text-xs font-semibold bg-[#E8F1F8] dark:bg-[#202F42] text-[#526B80] dark:text-[#E5EDF5] hover:bg-[#D5E4EF] dark:hover:bg-[#354A60] border border-[#DCE7EF] dark:border-[#43576B] shadow-xs transition-all active:scale-95 group cursor-pointer"
              title="Hồ sơ của bạn"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden bg-white dark:bg-[#172536] border border-[#91A9BC] flex items-center justify-center text-xs text-[#526B80] dark:text-[#E5EDF5] font-serif">
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

          {/* ❄️ Theme Mode Toggle: ☀ Ánh sáng mùa đông <-> ☾ Đêm tuyết */}
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-serif font-semibold text-[#526B80] dark:text-[#E5EDF5] bg-[#E8F1F8] dark:bg-[#202F42] hover:bg-[#D5E4EF] dark:hover:bg-[#354A60] border border-[#DCE7EF] dark:border-[#43576B] transition-all cursor-pointer shadow-xs"
            title={theme === 'light' ? 'Chuyển sang ☾ Đêm tuyết' : 'Chuyển sang ☀ Ánh sáng mùa đông'}
          >
            {theme === 'light' ? (
              <>
                <span className="text-xs">☀</span>
                <span className="hidden md:inline text-[11px]">Ánh sáng mùa đông</span>
              </>
            ) : (
              <>
                <span className="text-xs">☾</span>
                <span className="hidden md:inline text-[11px]">Đêm tuyết</span>
              </>
            )}
          </button>

          {/* Admin Button */}
          <button
            id="btn-admin-manage"
            onClick={onOpenAdmin}
            className="hidden sm:inline-flex p-2 rounded-full text-[#91A9BC] hover:text-[#526B80] dark:text-[#A9BDCE] dark:hover:text-white hover:bg-[#E8F1F8] dark:hover:bg-[#202F42] transition-colors cursor-pointer"
            title="Quản lý & Sáng tạo"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* Menu Button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => {
                if (isSfxOn) triggerSfx('pop', sfxVolume);
                setIsMenuOpen(!isMenuOpen);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold btn-winter-primary cursor-pointer shadow-sm"
              title="Menu Hộp Ký Ức Mùa Đông"
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span className="font-serif">Menu</span>
            </button>

            {/* Menu Popover */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 10 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2.5 w-72 sm:w-80 max-w-[calc(100vw-24px)] rounded-3xl bg-white/95 dark:bg-[#172536]/95 backdrop-blur-2xl border border-[#DCE7EF] dark:border-[#43576B] shadow-2xl overflow-hidden z-50 p-3 space-y-2 font-sans"
                >
                  <div className="px-3.5 py-2 rounded-2xl bg-[#E8F1F8] dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold font-serif text-[#526B80] dark:text-[#E5EDF5] flex items-center gap-1.5">
                        <span>❄</span>
                        <span>Hộp Ký Ức Mùa Đông</span>
                      </div>
                      <p className="text-[10px] text-[#91A9BC] dark:text-[#A9BDCE]">
                        Góc nhỏ lưu giữ nhân vật và câu chuyện
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Reopen Intro */}
                    {onReopenIntro && (
                      <button
                        onClick={() => handleMenuItemClick(onReopenIntro)}
                        className="w-full p-2.5 rounded-2xl hover:bg-[#E8F1F8] dark:hover:bg-[#202F42] flex items-center gap-3 text-left group cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#91A9BC] to-[#6E899E] text-white flex items-center justify-center text-sm shrink-0">
                          ❄
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold font-serif text-[#526B80] dark:text-[#E5EDF5]">
                            Intro — Hộp Ký Ức Mùa Đông
                          </p>
                          <p className="text-[11px] text-[#91A9BC] truncate">
                            Mở lại màn hình video &amp; thông điệp ban đầu
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#91A9BC]" />
                      </button>
                    )}

                    {/* Snow Bookmark */}
                    {onOpenBookmarks && (
                      <button
                        onClick={() => handleMenuItemClick(onOpenBookmarks)}
                        className="w-full p-2.5 rounded-2xl hover:bg-[#E8F1F8] dark:hover:bg-[#202F42] flex items-center gap-3 text-left group cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#E8F1F8] dark:bg-[#202F42] text-[#526B80] dark:text-[#E5EDF5] flex items-center justify-center text-sm shrink-0">
                          🔖
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold font-serif text-[#526B80] dark:text-[#E5EDF5]">
                            Snow Bookmark — Dấu Trang Tuyết
                          </p>
                          <p className="text-[11px] text-[#91A9BC] truncate">
                            Bộ sưu tập nhân vật và thế giới bạn đã lưu
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#91A9BC]" />
                      </button>
                    )}

                    {/* Snow Random */}
                    <button
                      onClick={() => handleMenuItemClick(onOpenRandom)}
                      className="w-full p-2.5 rounded-2xl hover:bg-[#E8F1F8] dark:hover:bg-[#202F42] flex items-center gap-3 text-left group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#E8F1F8] dark:bg-[#202F42] text-[#526B80] dark:text-[#E5EDF5] flex items-center justify-center text-sm shrink-0">
                        🎲
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold font-serif text-[#526B80] dark:text-[#E5EDF5]">
                          Snow Random — Hộp Tuyết Ngẫu Nhiên
                        </p>
                        <p className="text-[11px] text-[#91A9BC] truncate">
                          Gặp một người xa lạ hoặc lạc vào thế giới mới
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#91A9BC]" />
                    </button>

                    {/* Message Board */}
                    <button
                      onClick={() => handleMenuItemClick(onOpenMessageBoard)}
                      className="w-full p-2.5 rounded-2xl hover:bg-[#E8F1F8] dark:hover:bg-[#202F42] flex items-center gap-3 text-left group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#E8F1F8] dark:bg-[#202F42] text-[#526B80] dark:text-[#E5EDF5] flex items-center justify-center text-sm shrink-0">
                        💌
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold font-serif text-[#526B80] dark:text-[#E5EDF5]">
                          Bảng Tin Mùa Đông
                        </p>
                        <p className="text-[11px] text-[#91A9BC] truncate">
                          Để lại lời nhắn và kỷ niệm cùng Yui
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#91A9BC]" />
                    </button>

                    {/* Voting */}
                    <button
                      onClick={() => handleMenuItemClick(onOpenVoting)}
                      className="w-full p-2.5 rounded-2xl hover:bg-[#E8F1F8] dark:hover:bg-[#202F42] flex items-center gap-3 text-left group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#E8F1F8] dark:bg-[#202F42] text-[#526B80] dark:text-[#E5EDF5] flex items-center justify-center text-sm shrink-0">
                        ♡
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold font-serif text-[#526B80] dark:text-[#E5EDF5]">
                          Bình Chọn Thả Tim
                        </p>
                        <p className="text-[11px] text-[#91A9BC] truncate">
                          Xếp hạng nhân vật được yêu mến nhất
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#91A9BC]" />
                    </button>

                    {/* Contact */}
                    <button
                      onClick={() => handleMenuItemClick(onOpenContact)}
                      className="w-full p-2.5 rounded-2xl hover:bg-[#E8F1F8] dark:hover:bg-[#202F42] flex items-center gap-3 text-left group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#E8F1F8] dark:bg-[#202F42] text-[#526B80] dark:text-[#E5EDF5] flex items-center justify-center text-sm shrink-0">
                        ❄
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold font-serif text-[#526B80] dark:text-[#E5EDF5]">
                          Liên Hệ &amp; Nhắn Tin
                        </p>
                        <p className="text-[11px] text-[#91A9BC] truncate">
                          Facebook Page &amp; Tin nhắn ẩn danh NGL
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#91A9BC]" />
                    </button>
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

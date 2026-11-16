import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Music,
  Menu,
  X,
  Dices,
  Bookmark,
  Heart,
  ChevronRight,
  Snowflake,
  Mail,
  HeartHandshake,
  MessageSquare,
  Send,
  Star,
  User,
  Palette,
  Feather,
  Lock,
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
  favoriteCount?: number;
  onOpenSnowGame?: () => void;
  onOpenDonateMailbox?: () => void;
  onOpenMemoryGallery?: () => void;
  onOpenWhisperQuotes?: () => void;
  onOpenSecretLetter?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenContact,
  onOpenVoting,
  onOpenAdmin,
  onOpenMessageBoard,
  onOpenAudioSettings,
  onOpenNotifications,
  onOpenRandom,
  onOpenBookmarks,
  onReopenIntro,
  onTriggerEasterEgg,
  isSfxOn = true,
  sfxVolume = 0.5,
  userProfile,
  onOpenProfile,
  onOpenCreatorRequest,
  onOpenSnowGame,
  onOpenDonateMailbox,
  onOpenMemoryGallery,
  onOpenWhisperQuotes,
  onOpenSecretLetter,
  bookmarkCount = 0,
  favoriteCount = 0,
}) => {
  const [clickCount, setClickCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#F7FAFD]/92 dark:bg-[#162436]/92 border-b border-[#D8E7F4] dark:border-[#364C66] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Zone 1: Brand Crest */}
        <div className="flex items-center min-w-0">
          <button
            onClick={(e) => {
              handleTitleClick(e);
              if (onReopenIntro) onReopenIntro();
            }}
            className="flex items-center gap-2 sm:gap-2.5 group text-left transition-transform active:scale-95 cursor-pointer min-w-0 min-h-[40px]"
            title="Nhấn để xem lại Intro Hộp Ký Ức Mùa Đông"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-[#5380AD] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
              <Snowflake className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <h1 className="text-[13px] sm:text-base font-bold tracking-tight text-[#1D3550] dark:text-[#F1F7FD] font-serif truncate whitespace-nowrap">
                Hộp Ký Ức Mùa Đông
              </h1>
            </div>
          </button>
        </div>

        {/* Zone 2 & 3: Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Request Quick Button */}
          {onOpenCreatorRequest && (
            <button
              onClick={() => {
                if (isSfxOn) triggerSfx('pop', sfxVolume);
                onOpenCreatorRequest();
              }}
              className="inline-flex items-center justify-center gap-1.5 min-h-[38px] min-w-[38px] sm:min-h-0 sm:min-w-0 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-[#36597A] dark:text-[#E5EFF9] bg-[#EAF3FC] dark:bg-[#21334A] hover:bg-[#DCEBFA] dark:hover:bg-[#2D4461] border border-[#CFE1F2] dark:border-[#3C5573] transition-all shadow-xs cursor-pointer active:scale-95 font-serif whitespace-nowrap shrink-0"
              title="Gửi Request nhân vật & xem Bảng Request công khai"
            >
              <Send className="w-3.5 h-3.5 text-[#4E7AA5] dark:text-[#9AC0E3]" />
              <span className="hidden sm:inline">Gửi Request</span>
            </button>
          )}

          {/* Snow Bookmark Quick Button */}
          {onOpenBookmarks && (
            <button
              onClick={onOpenBookmarks}
              className="inline-flex items-center justify-center gap-1 min-h-[38px] min-w-[38px] sm:min-h-0 sm:min-w-0 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-[#36597A] dark:text-[#E5EFF9] bg-[#EAF3FC] dark:bg-[#21334A] hover:bg-[#DCEBFA] dark:hover:bg-[#2D4461] border border-[#CFE1F2] dark:border-[#3C5573] transition-all shadow-xs cursor-pointer active:scale-95 font-serif whitespace-nowrap shrink-0"
              title="Mở Dấu Trang Tuyết"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#4E7AA5] dark:text-[#9AC0E3]" />
              <span className="hidden lg:inline">Dấu Trang Tuyết</span>
              {bookmarkCount > 0 && (
                <span className="text-[11px] font-sans font-bold text-[#4E7AA5] dark:text-[#9AC0E3] tabular-nums">
                  ({bookmarkCount})
                </span>
              )}
            </button>
          )}

          {/* Favorites Saved Characters Button */}
          <button
            onClick={() => {
              if (isSfxOn) triggerSfx('pop', sfxVolume);
              onOpenNotifications();
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#36597A] dark:text-[#E5EFF9] bg-[#EAF3FC] dark:bg-[#21334A] hover:bg-[#DCEBFA] dark:hover:bg-[#2D4461] border border-[#CFE1F2] dark:border-[#3C5573] transition-all shadow-xs cursor-pointer active:scale-95 font-serif whitespace-nowrap shrink-0"
            title="Nhân vật đã lưu & Lịch sử thông báo"
          >
            <Star className="w-3.5 h-3.5 text-[#4E7AA5] dark:text-[#9AC0E3]" />
            <span className="hidden xl:inline">Đã lưu</span>
            {favoriteCount > 0 && (
              <span className="text-[11px] font-sans font-bold text-[#4E7AA5] dark:text-[#9AC0E3] tabular-nums">
                ({favoriteCount})
              </span>
            )}
          </button>

          {/* Music Corner Button */}
          <button
            onClick={onOpenAudioSettings}
            className="hidden md:inline-flex p-2 rounded-xl text-[#36597A] dark:text-[#E5EFF9] bg-[#EAF3FC] dark:bg-[#21334A] hover:bg-[#DCEBFA] dark:hover:bg-[#2D4461] border border-[#CFE1F2] dark:border-[#3C5573] transition-colors shadow-xs cursor-pointer"
            title="Giai điệu mùa đông (BGM & Âm thanh)"
          >
            <Music className="w-4 h-4" />
          </button>

          {/* User Profile Button */}
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="hidden sm:inline-flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-xl text-xs font-semibold bg-[#EAF3FC] dark:bg-[#21334A] text-[#36597A] dark:text-[#E5EFF9] hover:bg-[#DCEBFA] dark:hover:bg-[#2D4461] border border-[#CFE1F2] dark:border-[#3C5573] shadow-xs transition-all active:scale-95 group cursor-pointer whitespace-nowrap shrink-0"
              title="Hồ sơ của bạn"
            >
              <div className="w-6 h-6 rounded-lg overflow-hidden bg-white dark:bg-[#162436] border border-[#7CA7CF] flex items-center justify-center text-xs font-serif shrink-0">
                {userProfile?.avatar ? (
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Snowflake className="w-3 h-3 text-[#4E7AA5]" />
                )}
              </div>
              <span className="hidden md:inline font-medium max-w-[85px] truncate">
                {userProfile?.name || 'Hồ sơ'}
              </span>
            </button>
          )}

          {/* Theme Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="flex items-center justify-center gap-1.5 min-h-[38px] min-w-[38px] sm:min-h-0 sm:min-w-0 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-serif font-semibold text-[#36597A] dark:text-[#E5EFF9] bg-[#EAF3FC] dark:bg-[#21334A] hover:bg-[#DCEBFA] dark:hover:bg-[#2D4461] border border-[#CFE1F2] dark:border-[#3C5573] transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0"
            title={theme === 'light' ? 'Chuyển sang Đêm tuyết' : 'Chuyển sang Ánh sáng mùa đông'}
          >
            {theme === 'light' ? (
              <>
                <span className="text-xs">☀</span>
                <span className="hidden md:inline text-[11px]">Ánh sáng</span>
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
            className="hidden sm:inline-flex p-2 rounded-xl text-[#6485A5] hover:text-[#1D3550] dark:text-[#A4C0DA] dark:hover:text-white hover:bg-[#EAF3FC] dark:hover:bg-[#21334A] transition-colors cursor-pointer"
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
              className="flex items-center justify-center gap-1.5 min-h-[38px] sm:min-h-0 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#5380AD] hover:bg-[#44709D] cursor-pointer shadow-xs transition-all active:scale-95 whitespace-nowrap shrink-0"
              title="Menu Hộp Ký Ức Mùa Đông"
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span className="font-serif">Menu</span>
            </button>

            {/* Menu Popover */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 8 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2 w-[min(20.5rem,calc(100vw-24px))] rounded-3xl bg-white/95 dark:bg-[#172538]/95 backdrop-blur-2xl border border-[#D4E4F2] dark:border-[#39506B] shadow-2xl overflow-hidden z-50 p-2.5 sm:p-3 space-y-2 font-sans"
                >
                  <div className="px-3.5 py-2.5 rounded-2xl bg-[#EAF3FC] dark:bg-[#203046] border border-[#D4E4F2] dark:border-[#39506B]">
                    <div className="text-xs font-bold font-serif text-[#1D3550] dark:text-[#F1F7FD] flex items-center gap-1.5">
                      <Snowflake className="w-3.5 h-3.5 text-[#4E7AA5]" />
                      <span>Hộp Ký Ức Mùa Đông</span>
                    </div>
                    <p className="text-[10px] text-[#5E7C99] dark:text-[#A4C0DA] mt-0.5">
                      Góc nhỏ lưu giữ nhân vật và câu chuyện của Yui
                    </p>
                  </div>

                  <div className="space-y-1 pt-0.5 max-h-[70dvh] overflow-y-auto custom-scrollbar">
                    {onOpenProfile && (
                      <button
                        onClick={() => handleMenuItemClick(onOpenProfile)}
                        className="w-full min-h-[44px] p-2.5 rounded-2xl hover:bg-[#EAF3FC] dark:hover:bg-[#21334A] flex items-center gap-3 text-left group cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-xl overflow-hidden bg-[#EAF3FC] dark:bg-[#21334A] border border-[#CFE1F2] dark:border-[#3C5573] text-[#4E7AA5] dark:text-[#A4C0DA] flex items-center justify-center shrink-0">
                          {userProfile?.avatar ? (
                            <img src={userProfile.avatar} alt={userProfile.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold font-serif text-[#1D3550] dark:text-[#E5EFF9] truncate">
                            Hồ Sơ Của Bạn · {userProfile?.name || 'Khách'}
                          </p>
                          <p className="text-[11px] text-[#64829E] truncate">
                            Thành tựu, quà tặng &amp; trang trí cá nhân
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#7393B3]" />
                      </button>
                    )}

                    <button
                      onClick={() => handleMenuItemClick(onOpenAudioSettings)}
                      className="w-full min-h-[44px] p-2.5 rounded-2xl hover:bg-[#EAF3FC] dark:hover:bg-[#21334A] flex items-center gap-3 text-left group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#EAF3FC] dark:bg-[#21334A] text-[#4E7AA5] dark:text-[#A4C0DA] flex items-center justify-center shrink-0">
                        <Music className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold font-serif text-[#1D3550] dark:text-[#E5EFF9]">
                          Hộp Nhạc &amp; Giai Điệu Mùa Đông
                        </p>
                        <p className="text-[11px] text-[#64829E] truncate">
                          Chọn nhạc nền BGM &amp; âm thanh hiệu ứng
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#7393B3]" />
                    </button>

                    {onReopenIntro && (
                      <button
                        onClick={() => handleMenuItemClick(onReopenIntro)}
                        className="w-full min-h-[44px] p-2.5 rounded-2xl hover:bg-[#EAF3FC] dark:hover:bg-[#21334A] flex items-center gap-3 text-left group cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#5380AD] text-white flex items-center justify-center shrink-0">
                          <Snowflake className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold font-serif text-[#1D3550] dark:text-[#E5EFF9]">
                            Intro — Hộp Ký Ức Mùa Đông
                          </p>
                          <p className="text-[11px] text-[#64829E] truncate">
                            Mở lại màn hình mở đầu mùa đông
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#7393B3]" />
                      </button>
                    )}

                    {onOpenCreatorRequest && (
                      <button
                        onClick={() => handleMenuItemClick(onOpenCreatorRequest)}
                        className="w-full min-h-[44px] p-2.5 rounded-2xl bg-[#EAF3FC]/70 dark:bg-[#21334A]/70 hover:bg-[#DCEBFA] dark:hover:bg-[#2E4563] border border-[#CFE1F2] dark:border-[#3B5470] flex items-center gap-3 text-left group cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#5380AD] text-white flex items-center justify-center shrink-0">
                          <Send className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold font-serif text-[#16273B] dark:text-[#F8FBFF]">
                            Bảng Request &amp; Gửi Yêu Cầu
                          </p>
                          <p className="text-[11px] text-[#5E7C99] dark:text-[#A4C0DA] truncate">
                            Xem request công khai hoặc gửi đơn riêng
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#7393B3]" />
                      </button>
                    )}

                    {onOpenDonateMailbox && (
                      <button
                        onClick={() => handleMenuItemClick(onOpenDonateMailbox)}
                        className="w-full min-h-[44px] p-2.5 rounded-2xl hover:bg-[#EAF3FC] dark:hover:bg-[#21334A] flex items-center gap-3 text-left group cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center shrink-0">
                          <HeartHandshake className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold font-serif text-[#16273B] dark:text-[#F8FBFF]">
                            Góc Ủng Hộ Yui · Hòm Thư
                          </p>
                          <p className="text-[11px] text-[#5E7C99] dark:text-[#A4C0DA] truncate">
                            Ủng hộ Yui &amp; gửi lá thư mùa đông
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#7393B3]" />
                      </button>
                    )}

                    <button
                      onClick={() => handleMenuItemClick(onOpenNotifications)}
                      className="w-full min-h-[44px] p-2.5 rounded-2xl hover:bg-[#EAF3FC] dark:hover:bg-[#21334A] flex items-center gap-3 text-left group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#EAF3FC] dark:bg-[#21334A] text-[#4E7AA5] dark:text-[#A4C0DA] flex items-center justify-center shrink-0">
                        <Star className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold font-serif text-[#1D3550] dark:text-[#E5EFF9]">
                          Nhân Vật Đã Lưu &amp; Tin Yui
                        </p>
                        <p className="text-[11px] text-[#64829E] truncate">
                          Xem bộ sưu tập yêu thích và lưu trữ tin
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#7393B3]" />
                    </button>

                    {onOpenBookmarks && (
                      <button
                        onClick={() => handleMenuItemClick(onOpenBookmarks)}
                        className="w-full min-h-[44px] p-2.5 rounded-2xl hover:bg-[#EAF3FC] dark:hover:bg-[#21334A] flex items-center gap-3 text-left group cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#EAF3FC] dark:bg-[#21334A] text-[#4E7AA5] dark:text-[#A4C0DA] flex items-center justify-center shrink-0">
                          <Bookmark className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold font-serif text-[#1D3550] dark:text-[#E5EFF9]">
                            Dấu Trang Tuyết
                          </p>
                          <p className="text-[11px] text-[#64829E] truncate">
                            Kệ sách &amp; thẻ đánh dấu của bạn
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#7393B3]" />
                      </button>
                    )}

                    <button
                      onClick={() => handleMenuItemClick(onOpenRandom)}
                      className="w-full min-h-[44px] p-2.5 rounded-2xl hover:bg-[#EAF3FC] dark:hover:bg-[#21334A] flex items-center gap-3 text-left group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#EAF3FC] dark:bg-[#21334A] text-[#4E7AA5] dark:text-[#A4C0DA] flex items-center justify-center shrink-0">
                        <Dices className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold font-serif text-[#1D3550] dark:text-[#E5EFF9]">
                          Snow Random — Gặp Gỡ Định Mệnh
                        </p>
                        <p className="text-[11px] text-[#64829E] truncate">
                          Thẻ nhảy liên hoàn &amp; Lật lá bí ẩn
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#7393B3]" />
                    </button>

                    {onOpenSnowGame && (
                      <button
                        onClick={() => handleMenuItemClick(onOpenSnowGame)}
                        className="w-full min-h-[44px] p-2.5 rounded-2xl hover:bg-[#EAF3FC] dark:hover:bg-[#21334A] flex items-center gap-3 text-left group cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#EAF3FC] dark:bg-[#21334A] text-[#4E7AA5] dark:text-[#A4C0DA] flex items-center justify-center shrink-0">
                          <Snowflake className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold font-serif text-[#1D3550] dark:text-[#E5EFF9]">
                            Săn Ký Ức Tuyết Rơi (Trò chơi)
                          </p>
                          <p className="text-[11px] text-[#64829E] truncate">
                            Bắt bông tuyết may mắn nhận phần thưởng
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#7393B3]" />
                      </button>
                    )}

                    <button
                      onClick={() => handleMenuItemClick(onOpenMessageBoard)}
                      className="w-full min-h-[44px] p-2.5 rounded-2xl hover:bg-[#EAF3FC] dark:hover:bg-[#21334A] flex items-center gap-3 text-left group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#EAF3FC] dark:bg-[#21334A] text-[#4E7AA5] dark:text-[#A4C0DA] flex items-center justify-center shrink-0">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold font-serif text-[#1D3550] dark:text-[#E5EFF9]">
                          Bảng Tin Mùa Đông
                        </p>
                        <p className="text-[11px] text-[#64829E] truncate">
                          Để lại lời nhắn và kỷ niệm cùng Yui
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#7393B3]" />
                    </button>

                    {onOpenMemoryGallery && (
                      <button
                        onClick={() => handleMenuItemClick(onOpenMemoryGallery)}
                        className="w-full min-h-[44px] p-2.5 rounded-2xl hover:bg-[#EAF3FC] dark:hover:bg-[#21334A] flex items-center gap-3 text-left group cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#EAF3FC] dark:bg-[#21334A] text-[#4E7AA5] dark:text-[#A4C0DA] flex items-center justify-center shrink-0">
                          <Palette className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold font-serif text-[#1D3550] dark:text-[#E5EFF9]">
                            Lầu Tuyết Họa Ký
                          </p>
                          <p className="text-[11px] text-[#64829E] truncate">
                            Lưu đoạn chat, fanart &amp; phản hồi cùng nhau
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#7393B3]" />
                      </button>
                    )}

                    {onOpenWhisperQuotes && (
                      <button
                        onClick={() => handleMenuItemClick(onOpenWhisperQuotes)}
                        className="w-full min-h-[44px] p-2.5 rounded-2xl hover:bg-[#EAF3FC] dark:hover:bg-[#21334A] flex items-center gap-3 text-left group cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#EAF3FC] dark:bg-[#21334A] text-[#4E7AA5] dark:text-[#A4C0DA] flex items-center justify-center shrink-0">
                          <Feather className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold font-serif text-[#1D3550] dark:text-[#E5EFF9]">
                            Nhặt Cánh Tuyết Rơi
                          </p>
                          <p className="text-[11px] text-[#64829E] truncate">
                            Quote ngẫu hứng, đoạn viết &amp; ảnh của Yui
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#7393B3]" />
                      </button>
                    )}

                    {onOpenSecretLetter && (
                      <button
                        onClick={() => handleMenuItemClick(onOpenSecretLetter)}
                        className="w-full min-h-[44px] p-2.5 rounded-2xl hover:bg-[#EAF3FC] dark:hover:bg-[#21334A] flex items-center gap-3 text-left group cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#EAF3FC] dark:bg-[#21334A] text-[#4E7AA5] dark:text-[#A4C0DA] flex items-center justify-center shrink-0">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold font-serif text-[#1D3550] dark:text-[#E5EFF9]">
                            Tâm Thư Đêm Tuyết
                          </p>
                          <p className="text-[11px] text-[#64829E] truncate">
                            Gửi thư ẩn danh không giới hạn chữ (chỉ Yui đọc)
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#7393B3]" />
                      </button>
                    )}

                    <button
                      onClick={() => handleMenuItemClick(onOpenVoting)}
                      className="w-full min-h-[44px] p-2.5 rounded-2xl hover:bg-[#EAF3FC] dark:hover:bg-[#21334A] flex items-center gap-3 text-left group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center shrink-0">
                        <Heart className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold font-serif text-[#1D3550] dark:text-[#E5EFF9]">
                          Đêm Sao Bình Chọn
                        </p>
                        <p className="text-[11px] text-[#64829E] truncate">
                          Bình chọn nhân vật được yêu mến nhất
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#7393B3]" />
                    </button>

                    <button
                      onClick={() => handleMenuItemClick(onOpenContact)}
                      className="w-full min-h-[44px] p-2.5 rounded-2xl hover:bg-[#EAF3FC] dark:hover:bg-[#21334A] flex items-center gap-3 text-left group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#EAF3FC] dark:bg-[#21334A] text-[#4E7AA5] dark:text-[#A4C0DA] flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold font-serif text-[#1D3550] dark:text-[#E5EFF9]">
                          Liên Hệ &amp; Nhắn Tin
                        </p>
                        <p className="text-[11px] text-[#64829E] truncate">
                          Kênh kết nối chính thức của Yui
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#7393B3]" />
                    </button>

                    <button
                      onClick={() => handleMenuItemClick(onOpenAdmin)}
                      className="w-full min-h-[44px] p-2.5 rounded-2xl hover:bg-[#EAF3FC] dark:hover:bg-[#21334A] flex items-center gap-3 text-left group cursor-pointer border-t border-[#E6F0FA] dark:border-[#2C4058] mt-1 pt-3"
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#EAF3FC] dark:bg-[#21334A] text-[#4E7AA5] dark:text-[#A4C0DA] flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold font-serif text-[#1D3550] dark:text-[#E5EFF9]">
                          Quản Lý &amp; Sáng Tạo
                        </p>
                        <p className="text-[11px] text-[#64829E] truncate">
                          Khu vực dành riêng cho Yui
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#7393B3]" />
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

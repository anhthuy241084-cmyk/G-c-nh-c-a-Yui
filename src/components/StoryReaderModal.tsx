import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Share2, Settings, ChevronLeft, ChevronRight, BookOpen, Check, Bookmark, ArrowDown } from 'lucide-react';
import { Character, CharacterBookmark, BookmarkPaperStyle, BookmarkTailDecor } from '../types';
import { PaperBookmark } from './PaperBookmark';
import { triggerHeartConfetti } from '../utils/confetti';
import { AutoLinkText } from './AutoLinkText';

interface StoryReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  onVote: (characterId: string) => void;
  isBookmarked?: boolean;
  bookmarkData?: CharacterBookmark;
  onToggleBookmark?: (characterId: string, paperStyle?: BookmarkPaperStyle, tailDecor?: BookmarkTailDecor) => void;
  onUpdateBookmarkStyle?: (characterId: string, paperStyle: BookmarkPaperStyle, tailDecor: BookmarkTailDecor) => void;
  onUpdateReadingProgress?: (characterId: string, progress: number, chapterIndex: number) => void;
}

export type ReaderFont = 'serif' | 'soft' | 'classic';
export type ReaderSize = 'small' | 'medium' | 'large' | 'xlarge';
export type ReaderLineHeight = 'compact' | 'normal' | 'spacious';
export type ReaderTheme = 'paper' | 'cream' | 'night' | 'dark';

export const StoryReaderModal: React.FC<StoryReaderModalProps> = ({
  isOpen,
  onClose,
  character,
  onVote,
  isBookmarked = false,
  bookmarkData,
  onToggleBookmark,
  onUpdateBookmarkStyle,
  onUpdateReadingProgress,
}) => {
  // Reading preference states with local storage persistence
  const [fontFamily, setFontFamily] = useState<ReaderFont>(() => {
    return (localStorage.getItem('yui_reader_font') as ReaderFont) || 'serif';
  });
  const [fontSize, setFontSize] = useState<ReaderSize>(() => {
    return (localStorage.getItem('yui_reader_size') as ReaderSize) || 'medium';
  });
  const [lineHeight, setLineHeight] = useState<ReaderLineHeight>(() => {
    return (localStorage.getItem('yui_reader_line') as ReaderLineHeight) || 'normal';
  });
  const [theme, setTheme] = useState<ReaderTheme>(() => {
    return (localStorage.getItem('yui_reader_theme') as ReaderTheme) || 'paper';
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [justVoted, setJustVoted] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [showResumePrompt, setShowResumePrompt] = useState(false);

  // Sync settings to localStorage
  useEffect(() => {
    localStorage.setItem('yui_reader_font', fontFamily);
    localStorage.setItem('yui_reader_size', fontSize);
    localStorage.setItem('yui_reader_line', lineHeight);
    localStorage.setItem('yui_reader_theme', theme);
  }, [fontFamily, fontSize, lineHeight, theme]);

  // Check if saved reading progress exists
  useEffect(() => {
    if (isOpen && isBookmarked && bookmarkData?.readingProgress && bookmarkData.readingProgress > 5) {
      setShowResumePrompt(true);
    } else {
      setShowResumePrompt(false);
    }
  }, [isOpen, character.id, isBookmarked, bookmarkData?.readingProgress]);

  // Parse story into chapters
  const rawStory = character.story || '';
  const chapters = React.useMemo(() => {
    if (!rawStory.trim()) return [];
    
    // Split by explicit chapter markers or 3+ consecutive line breaks
    const splits = rawStory.split(/\n\s*(?:---+|===+|Chương \d+:?|Chapter \d+:?)\s*\n|\n{3,}/i).map(c => c.trim()).filter(Boolean);
    return splits.length > 0 ? splits : [rawStory.trim()];
  }, [rawStory]);

  // Reset chapter index when character changes
  useEffect(() => {
    setCurrentChapterIndex(0);
    setScrollProgress(0);
  }, [character.id]);

  // Handle scroll progress
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    if (scrollHeight <= clientHeight) {
      setScrollProgress(100);
      return;
    }
    const percent = Math.min(100, Math.max(0, Math.round((scrollTop / (scrollHeight - clientHeight)) * 100)));
    setScrollProgress(percent);

    if (isBookmarked && onUpdateReadingProgress) {
      onUpdateReadingProgress(character.id, percent, currentChapterIndex);
    }
  };

  const handleJumpToBookmark = () => {
    if (!scrollContainerRef.current) return;
    const targetPercent = bookmarkData?.readingProgress || 0;
    const { scrollHeight, clientHeight } = scrollContainerRef.current;
    const targetScrollTop = ((scrollHeight - clientHeight) * targetPercent) / 100;
    scrollContainerRef.current.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    setShowResumePrompt(false);
  };

  const handleVoteClick = () => {
    triggerHeartConfetti(0.5, 0.4);
    onVote(character.id);
    setJustVoted(true);
    setToastMsg(`Thả tim cho ${character.name} thành công ♥`);
    setTimeout(() => {
      setJustVoted(false);
      setToastMsg('');
    }, 2000);
  };

  const handleShareClick = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    setToastMsg('Đã sao chép liên kết câu chuyện ♡');
    setTimeout(() => setToastMsg(''), 2500);
  };

  if (!isOpen) return null;

  const decItem = character.decorativeItemSet || '♡ ୨୧ ♡';

  // Theme styling definitions
  const themeStyles = {
    paper: {
      bg: 'bg-[#fbf9f5]',
      text: 'text-[#2d2b2a]',
      subText: 'text-[#736d67]',
      border: 'border-[#e8e2d5]',
      cardBg: 'bg-[#f4efe4]/70',
      accent: 'text-rose-600',
      tagBg: 'bg-[#f1ebd9]',
    },
    cream: {
      bg: 'bg-[#f7f2e7]',
      text: 'text-[#38332a]',
      subText: 'text-[#786c5a]',
      border: 'border-[#e3d8c3]',
      cardBg: 'bg-[#ece4d0]/70',
      accent: 'text-amber-700',
      tagBg: 'bg-[#e5d9c2]',
    },
    night: {
      bg: 'bg-[#181d28]',
      text: 'text-[#e2e8f0]',
      subText: 'text-[#94a3b8]',
      border: 'border-[#2a3245]',
      cardBg: 'bg-[#212736]',
      accent: 'text-rose-400',
      tagBg: 'bg-[#293144]',
    },
    dark: {
      bg: 'bg-[#0a0c10]',
      text: 'text-[#cbd5e1]',
      subText: 'text-[#64748b]',
      border: 'border-[#1e2330]',
      cardBg: 'bg-[#131722]',
      accent: 'text-pink-400',
      tagBg: 'bg-[#1a202c]',
    },
  }[theme];

  // Font family classes
  const fontClasses = {
    serif: 'font-serif tracking-wide',
    soft: 'font-sans font-normal tracking-normal',
    classic: 'font-serif font-light tracking-tight',
  }[fontFamily];

  // Font size classes
  const sizeClasses = {
    small: 'text-xs sm:text-sm',
    medium: 'text-sm sm:text-base',
    large: 'text-base sm:text-lg',
    xlarge: 'text-lg sm:text-xl',
  }[fontSize];

  // Line height classes
  const lineHeightClasses = {
    compact: 'leading-relaxed', // ~ 1.625
    normal: 'leading-[1.95]', // ~ 1.95
    spacious: 'leading-[2.3]', // ~ 2.3
  }[lineHeight];

  const currentChapterText = chapters[currentChapterIndex] || '';

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-50 flex flex-col ${themeStyles.bg} ${themeStyles.text} transition-colors duration-300 overflow-hidden select-text`}>
        {/* Top Header Bar */}
        <header className={`shrink-0 px-4 py-3 border-b ${themeStyles.border} flex items-center justify-between gap-3 backdrop-blur-md`}>
          {/* Left: Exit button & Character Title */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onClose}
              className={`p-2 rounded-full ${themeStyles.tagBg} ${themeStyles.subText} hover:${themeStyles.text} transition-colors`}
              title="Thoát chế độ đọc"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold truncate">
                {character.name}
              </h2>
              <p className={`text-[10px] ${themeStyles.subText} truncate font-serif italic`}>
                {character.title}
              </p>
            </div>
          </div>

          {/* Center: Reading Progress Bar Indicator */}
          {chapters.length > 0 && (
            <div className="hidden md:flex items-center gap-2 text-[11px] font-mono opacity-80">
              <span className="font-bold tracking-widest uppercase">STORY</span>
              <div className="w-28 h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden relative">
                <div
                  className="h-full bg-[#3FAAB7] rounded-full transition-all duration-150"
                  style={{ width: `${scrollProgress}%` }}
                />
              </div>
              <span>{scrollProgress}%</span>
            </div>
          )}

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Reading Settings Toggle */}
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`p-2 rounded-xl ${isSettingsOpen ? 'bg-[#3FAAB7] text-white' : `${themeStyles.tagBg} ${themeStyles.subText}`} transition-colors`}
              title="Cài đặt đọc (Font, cỡ chữ, nền)"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Favorite Heart Button */}
            <button
              onClick={handleVoteClick}
              className={`p-2 rounded-xl ${themeStyles.tagBg} transition-transform active:scale-90`}
              title="Thả tim cho câu chuyện"
            >
              <Heart
                className={`w-4 h-4 ${
                  justVoted ? 'fill-[#3FAAB7] text-[#3FAAB7] scale-125' : `${themeStyles.subText} hover:text-[#3FAAB7]`
                } transition-all duration-300`}
              />
            </button>

            {/* Share Button */}
            <button
              onClick={handleShareClick}
              className={`p-2 rounded-xl ${themeStyles.tagBg} ${themeStyles.subText} hover:${themeStyles.text} transition-colors`}
              title="Chia sẻ câu chuyện"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Paper Bookmark Tab on top-right edge */}
        {onToggleBookmark && (
          <PaperBookmark
            isBookmarked={isBookmarked}
            bookmarkData={bookmarkData}
            onToggleBookmark={(style, dec) => onToggleBookmark(character.id, style, dec)}
            onUpdateStyle={(style, dec) => onUpdateBookmarkStyle?.(character.id, style, dec)}
            readingProgress={scrollProgress}
          />
        )}

        {/* Resume Reading Bookmark Prompt Banner */}
        <AnimatePresence>
          {showResumePrompt && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] text-white text-xs font-bold shadow-xl flex items-center gap-3 border border-[#65C5CE]/40"
            >
              <div className="flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 fill-white" />
                <span>Tiếp tục đọc từ vị trí đã kẹp bookmark ({bookmarkData?.readingProgress}%)?</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleJumpToBookmark}
                  className="px-3 py-1 rounded-xl bg-white text-[#247C8C] font-extrabold hover:bg-[#E5F5F7] transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span>Đến đây</span>
                </button>
                <button
                  onClick={() => setShowResumePrompt(false)}
                  className="p-1 text-white/80 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast Notification Floating Banner */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-slate-900/90 text-white text-xs font-semibold shadow-lg backdrop-blur-md border border-slate-700/50 flex items-center gap-2"
            >
              <span>{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Settings Popover Drawer */}
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`absolute top-16 right-4 z-40 w-80 p-4 rounded-3xl ${themeStyles.cardBg} border ${themeStyles.border} shadow-2xl backdrop-blur-xl space-y-4`}
            >
              <div className="flex items-center justify-between border-b pb-2 border-black/10 dark:border-white/10">
                <span className="text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#3FAAB7]" />
                  <span>Cài đặt chế độ đọc</span>
                </span>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Font Choice */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold opacity-80 block">Kiểu font chữ</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'serif' as const, name: 'Elegant', desc: 'Thanh lịch' },
                    { id: 'soft' as const, name: 'Soft', desc: 'Mềm mại' },
                    { id: 'classic' as const, name: 'Classic', desc: 'Cổ điển' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFontFamily(f.id)}
                      className={`p-2 rounded-xl text-xs border text-center transition-all ${
                        fontFamily === f.id
                          ? 'bg-[#3FAAB7] text-white border-[#247C8C] font-bold shadow-xs'
                          : `${themeStyles.tagBg} ${themeStyles.border} opacity-80 hover:opacity-100`
                      }`}
                    >
                      <div>{f.name}</div>
                      <div className="text-[9px] opacity-80 mt-0.5">{f.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold opacity-80">
                  <span>Cỡ chữ</span>
                  <span className="capitalize">{fontSize}</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: 'small' as const, label: 'Nhỏ' },
                    { id: 'medium' as const, label: 'Vừa' },
                    { id: 'large' as const, label: 'Lớn' },
                    { id: 'xlarge' as const, label: 'Rất lớn' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setFontSize(s.id)}
                      className={`py-1.5 px-1 rounded-xl text-xs border text-center transition-all ${
                        fontSize === s.id
                          ? 'bg-[#3FAAB7] text-white border-[#247C8C] font-bold'
                          : `${themeStyles.tagBg} ${themeStyles.border} opacity-80`
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Height */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold opacity-80 block">Khoảng cách dòng</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'compact' as const, label: 'Gọn' },
                    { id: 'normal' as const, label: 'Vừa' },
                    { id: 'spacious' as const, label: 'Thoáng' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLineHeight(l.id)}
                      className={`py-1.5 rounded-xl text-xs border text-center transition-all ${
                        lineHeight === l.id
                          ? 'bg-[#3FAAB7] text-white border-[#247C8C] font-bold'
                          : `${themeStyles.tagBg} ${themeStyles.border} opacity-80`
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Theme */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold opacity-80 block">Màu nền trang</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'paper' as const, name: 'Giấy sáng', color: 'bg-[#fbf9f5] text-[#2d2b2a]' },
                    { id: 'cream' as const, name: 'Kem dịu mắt', color: 'bg-[#f7f2e7] text-[#38332a]' },
                    { id: 'night' as const, name: 'Đêm', color: 'bg-[#181d28] text-[#e2e8f0]' },
                    { id: 'dark' as const, name: 'Đen sâu', color: 'bg-[#0a0c10] text-[#cbd5e1]' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`p-2 rounded-xl text-xs border flex items-center justify-between transition-all ${t.color} ${
                        theme === t.id ? 'ring-2 ring-[#3FAAB7] font-bold' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      <span>{t.name}</span>
                      {theme === t.id && <Check className="w-3.5 h-3.5 text-[#3FAAB7]" />}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Scrollable Book Canvas */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-8 sm:py-12 custom-reader-scrollbar"
        >
          <div className="max-w-xl mx-auto space-y-10">
            {/* Story Header Title */}
            <div className="text-center space-y-3">
              <div className="text-xs text-[#247C8C] dark:text-[#78DCE0] tracking-widest font-serif">
                {decItem}
              </div>
              <h1 className={`text-2xl sm:text-3xl font-bold font-serif ${themeStyles.text}`}>
                {character.name}
              </h1>
              <div className="text-xs opacity-75 font-serif italic">
                Của tác giả: {character.creator || 'Admin'}
              </div>
              <div className="text-xs opacity-60 tracking-widest pt-1">
                ──────── ✦ ────────
              </div>
            </div>

            {/* Story Content Section with Real Book Page Flipping Motion */}
            {chapters.length > 0 && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`chapter-${currentChapterIndex}`}
                  initial={{ opacity: 0, rotateY: -8, x: 20 }}
                  animate={{ opacity: 1, rotateY: 0, x: 0 }}
                  exit={{ opacity: 0, rotateY: 8, x: -20 }}
                  transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                  style={{ transformPerspective: 1200, transformOrigin: 'left center' }}
                  className={`space-y-6 ${fontClasses} ${sizeClasses} ${lineHeightClasses}`}
                >
                  {/* Chapter Subheading if Multi-Chapter */}
                  {chapters.length > 1 && (
                    <div className="text-center text-xs font-bold font-serif uppercase tracking-wider opacity-70 border-b border-black/10 dark:border-white/10 pb-2">
                      ✦ CHƯƠNG {currentChapterIndex + 1} / {chapters.length} ✦
                    </div>
                  )}

                  {/* Paragraph rendering */}
                  {currentChapterText.split('\n\n').map((paragraph, idx) => {
                    const cleanP = paragraph.trim();
                    if (!cleanP) return null;

                    return (
                      <div
                        key={idx}
                        className="text-justify whitespace-pre-wrap break-words opacity-95 first-letter:text-xl first-letter:font-bold first-letter:mr-0.5"
                      >
                        <AutoLinkText text={cleanP} />
                      </div>
                    );
                  })}

                  {/* Chapter Navigation controls if multiple chapters */}
                  {chapters.length > 1 && (
                    <div className="pt-8 pb-4 flex items-center justify-between border-t border-black/10 dark:border-white/10">
                      <button
                        disabled={currentChapterIndex === 0}
                        onClick={() => {
                          setCurrentChapterIndex((prev) => Math.max(0, prev - 1));
                          scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 btn-soft ${
                          currentChapterIndex === 0
                            ? 'opacity-30 cursor-not-allowed'
                            : `${themeStyles.tagBg} hover:opacity-100`
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>〈 Lật trang trước</span>
                      </button>

                      <span className="text-xs opacity-70 font-serif">
                        {decItem}
                      </span>

                      <button
                        disabled={currentChapterIndex === chapters.length - 1}
                        onClick={() => {
                          setCurrentChapterIndex((prev) => Math.min(chapters.length - 1, prev + 1));
                          scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 btn-soft ${
                          currentChapterIndex === chapters.length - 1
                            ? 'opacity-30 cursor-not-allowed'
                            : `${themeStyles.tagBg} hover:opacity-100`
                        }`}
                      >
                        <span>Trang tiếp theo 〉</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* End of Story Marker */}
                  <div className="text-center pt-6 pb-2 text-xs font-serif opacity-70">
                    ♡ Hết câu chuyện ♡
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {/* FIRST MESSAGE Section (Falling Paper Stationery Feel) */}
            {character.firstMessage && (
              <div className="pt-6 border-t border-black/10 dark:border-white/10 space-y-4">
                <div className="text-center space-y-1">
                  <span className="text-xs font-bold tracking-widest font-serif uppercase text-[#247C8C] dark:text-[#78DCE0]">
                    FIRST MESSAGE
                  </span>
                  <div className="text-xs opacity-60">
                    ──────── ✦ ────────
                  </div>
                </div>

                <div className={`p-6 sm:p-8 rounded-3xl ${themeStyles.cardBg} border ${themeStyles.border} space-y-3 shadow-sm animate-paper-drift`}>
                  <p className="text-[11px] font-serif italic text-[#247C8C] dark:text-[#78DCE0] font-semibold text-center">
                    “Câu chuyện bắt đầu từ đây...”
                  </p>
                  <p className={`${fontClasses} ${sizeClasses} ${lineHeightClasses} whitespace-pre-wrap leading-relaxed text-justify opacity-95`}>
                    {character.firstMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Footer Spacing */}
            <div className="text-center pt-8 text-[11px] opacity-50 font-serif pb-12">
              {decItem} • Góc nhỏ sáng tác của {character.creator || 'Admin'}
            </div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};

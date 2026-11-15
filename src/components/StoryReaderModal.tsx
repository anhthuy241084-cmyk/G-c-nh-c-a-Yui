import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Heart,
  Share2,
  Type,
  ChevronLeft,
  ChevronRight,
  Check,
  Bookmark,
  ArrowDown,
  ExternalLink,
  X,
  Snowflake,
  Feather,
  BookOpen,
} from 'lucide-react';
import { Character, CharacterBookmark, BookmarkPaperStyle, BookmarkTailDecor } from '../types';
import { PaperBookmark } from './PaperBookmark';
import { SnowfallBackground } from './SnowfallBackground';
import { triggerHeartConfetti } from '../utils/confetti';
import { AutoLinkText } from './AutoLinkText';
import { triggerSfx } from '../utils/sfx';

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

/* Delicate Winter Ribbon & Snowflake Book Crest SVG */
const ChapterCrestSVG: React.FC = () => (
  <svg viewBox="0 0 180 24" fill="none" className="w-40 h-6 mx-auto opacity-80" aria-hidden="true">
    <path d="M8 12H68M112 12H172" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" />
    <path d="M52 12L58 8M52 12L58 16M128 12L122 8M128 12L122 16" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" strokeLinecap="round" />
    <path d="M90 4V20M83 8L97 16M97 8L83 16" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    <circle cx="90" cy="12" r="2.2" fill="currentColor" />
  </svg>
);

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
  const [showSnowInReader, setShowSnowInReader] = useState<boolean>(true);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [justVoted, setJustVoted] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const creatorName = character.creator && character.creator.trim() !== 'Admin' ? character.creator : 'Yui';

  useEffect(() => {
    localStorage.setItem('yui_reader_font', fontFamily);
    localStorage.setItem('yui_reader_size', fontSize);
    localStorage.setItem('yui_reader_line', lineHeight);
    localStorage.setItem('yui_reader_theme', theme);
  }, [fontFamily, fontSize, lineHeight, theme]);

  useEffect(() => {
    if (isOpen && isBookmarked && bookmarkData?.readingProgress && bookmarkData.readingProgress > 5) {
      setShowResumePrompt(true);
    } else {
      setShowResumePrompt(false);
    }
  }, [isOpen, character.id, isBookmarked, bookmarkData?.readingProgress]);

  const rawStory = character.story || '';
  const chapters = React.useMemo(() => {
    if (!rawStory.trim()) return [];
    const splits = rawStory
      .split(/\n\s*(?:---+|===+|Chương \d+:?|Chapter \d+:?)\s*\n|\n{3,}/i)
      .map((c) => c.trim())
      .filter(Boolean);
    return splits.length > 0 ? splits : [rawStory.trim()];
  }, [rawStory]);

  useEffect(() => {
    setCurrentChapterIndex(0);
    setScrollProgress(0);
  }, [character.id]);

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
    triggerSfx('heart', 0.45);
    onVote(character.id);
    setJustVoted(true);
    setToastMsg(`Đã thả tim cho ${character.name}`);
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
    setToastMsg('Đã sao chép liên kết câu chuyện');
    setTimeout(() => setToastMsg(''), 2200);
  };

  if (!isOpen) return null;

  const isDarkTheme = theme === 'night' || theme === 'dark';

  const themeStyles = {
    paper: {
      deskBg: 'bg-[#E9F3FC]',
      sheetBg: 'bg-[#FCFDFE]',
      headerBg: 'bg-[#F5FAFF]/95',
      popoverBg: 'bg-white',
      letterBg: 'bg-[#F5FAFF]',
      text: 'text-[#223952]',
      subText: 'text-[#5E80A1]',
      border: 'border-[#D4E6F6]',
      controlBg: 'bg-[#EAF3FC]',
      accent: 'text-[#5380AD]',
    },
    cream: {
      deskBg: 'bg-[#EFE6D6]',
      sheetBg: 'bg-[#FDFBF5]',
      headerBg: 'bg-[#F9F4E8]/95',
      popoverBg: 'bg-[#FFFDF8]',
      letterBg: 'bg-[#F7F1E4]',
      text: 'text-[#2D251C]',
      subText: 'text-[#7C6D5B]',
      border: 'border-[#E2D8C3]',
      controlBg: 'bg-[#ECE3CE]',
      accent: 'text-[#7A664C]',
    },
    night: {
      deskBg: 'bg-[#101A29]',
      sheetBg: 'bg-[#182638]',
      headerBg: 'bg-[#152132]/95',
      popoverBg: 'bg-[#1D2D42]',
      letterBg: 'bg-[#1E2E44]',
      text: 'text-[#E7F0FA]',
      subText: 'text-[#96B0CC]',
      border: 'border-[#2D415A]',
      controlBg: 'bg-[#22344B]',
      accent: 'text-[#9EC4E8]',
    },
    dark: {
      deskBg: 'bg-[#090E16]',
      sheetBg: 'bg-[#111925]',
      headerBg: 'bg-[#0D141F]/95',
      popoverBg: 'bg-[#16202E]',
      letterBg: 'bg-[#172231]',
      text: 'text-[#DCE5F0]',
      subText: 'text-[#8196AE]',
      border: 'border-[#212E40]',
      controlBg: 'bg-[#1A2636]',
      accent: 'text-[#93B9DF]',
    },
  }[theme];

  const fontClasses = {
    serif: 'font-serif',
    soft: 'font-sans',
    classic: 'font-display',
  }[fontFamily];

  const sizeClasses = {
    small: 'text-[15px]',
    medium: 'text-[17px]',
    large: 'text-[19px]',
    xlarge: 'text-[21px]',
  }[fontSize];

  const lineHeightClasses = {
    compact: 'leading-[1.82]',
    normal: 'leading-[1.98]',
    spacious: 'leading-[2.16]',
  }[lineHeight];

  const currentChapterText = chapters[currentChapterIndex] || '';
  const paragraphs = currentChapterText.split('\n\n').map((p) => p.trim()).filter(Boolean);

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-50 flex flex-col ${themeStyles.deskBg} ${themeStyles.text} transition-colors duration-250 overflow-hidden select-text`}>
        {showSnowInReader && (
          <SnowfallBackground
            settings={{ isEnabled: true, density: 'low', speed: 'slow', opacity: 'subtle' }}
            themeMode={isDarkTheme ? 'dark' : 'light'}
          />
        )}

        {/* Top Literary Toolbar */}
        <header className={`relative shrink-0 px-4 sm:px-7 h-14 ${themeStyles.headerBg} backdrop-blur-md border-b ${themeStyles.border} flex items-center justify-between gap-3 z-20`}>
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif font-semibold ${themeStyles.controlBg} ${themeStyles.subText} hover:opacity-85 transition-opacity cursor-pointer shrink-0`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Thoát trang sách</span>
            </button>

            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold font-display truncate">
                {character.name}
              </h2>
              <p className={`text-[10px] sm:text-[11px] font-serif ${themeStyles.subText} truncate`}>
                Chấp bút: {creatorName}
                {chapters.length > 0 && ` · Đã đọc ${scrollProgress}%`}
              </p>
            </div>
          </div>

          {chapters.length > 1 && (
            <div className="hidden md:flex items-center gap-1">
              {chapters.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCurrentChapterIndex(idx);
                    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-serif transition-colors cursor-pointer ${
                    currentChapterIndex === idx
                      ? 'bg-[#5380AD] text-white font-semibold'
                      : `${themeStyles.controlBg} ${themeStyles.subText} hover:opacity-85`
                  }`}
                >
                  Chương {idx + 1}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif font-semibold transition-colors cursor-pointer ${
                isSettingsOpen ? 'bg-[#5380AD] text-white' : `${themeStyles.controlBg} ${themeStyles.subText}`
              }`}
              title="Tùy chỉnh chữ và màu giấy"
            >
              <Type className="w-3.5 h-3.5" />
              <span>Chữ &amp; Giấy</span>
            </button>

            <button
              onClick={handleVoteClick}
              className={`p-2 rounded-xl ${themeStyles.controlBg} transition-transform active:scale-90 cursor-pointer`}
              title="Thả tim cho câu chuyện"
            >
              <Heart
                className={`w-4 h-4 ${
                  justVoted ? 'fill-rose-400 text-rose-400' : themeStyles.subText
                }`}
              />
            </button>

            <button
              onClick={handleShareClick}
              className={`p-2 rounded-xl ${themeStyles.controlBg} ${themeStyles.subText} hover:opacity-80 transition-opacity cursor-pointer`}
              title="Sao chép liên kết"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Reading Progress Hairline */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/5 dark:bg-white/5">
            <div
              className="h-full bg-[#5380AD] transition-all duration-150"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </header>

        {/* Customizable Paper Bookmark Ribbon */}
        {onToggleBookmark && (
          <PaperBookmark
            isBookmarked={isBookmarked}
            bookmarkData={bookmarkData}
            onToggleBookmark={(style, dec) => onToggleBookmark(character.id, style, dec)}
            onUpdateStyle={(style, dec) => onUpdateBookmarkStyle?.(character.id, style, dec)}
            readingProgress={scrollProgress}
          />
        )}

        {/* Resume Prompt */}
        <AnimatePresence>
          {showResumePrompt && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl bg-[#274361] text-white text-xs font-serif shadow-lg flex items-center gap-3"
            >
              <Bookmark className="w-3.5 h-3.5 fill-current text-[#B5D3EE]" />
              <span>Đọc tiếp từ vị trí đã lưu ({bookmarkData?.readingProgress}%)?</span>
              <button
                onClick={handleJumpToBookmark}
                className="px-2.5 py-1 rounded-lg bg-white text-[#274361] font-semibold cursor-pointer inline-flex items-center gap-1"
              >
                <ArrowDown className="w-3 h-3" />
                <span>Đến ngay</span>
              </button>
              <button
                onClick={() => setShowResumePrompt(false)}
                className="text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-[#274361] text-white text-xs font-serif shadow-lg"
            >
              {toastMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Typography Settings Popover */}
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`absolute top-16 right-4 z-40 w-76 p-4 rounded-2xl ${themeStyles.popoverBg} border ${themeStyles.border} shadow-2xl space-y-4`}
            >
              <div className="space-y-1.5">
                <span className={`text-xs font-serif font-semibold ${themeStyles.subText} block`}>Kiểu chữ</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'serif' as const, name: 'Trang sách' },
                    { id: 'soft' as const, name: 'Hiện đại' },
                    { id: 'classic' as const, name: 'Cổ điển' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFontFamily(f.id)}
                      className={`py-1.5 rounded-xl text-xs border text-center transition-colors cursor-pointer ${
                        fontFamily === f.id
                          ? 'bg-[#5380AD] text-white border-[#5380AD] font-semibold'
                          : `${themeStyles.controlBg} ${themeStyles.border}`
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className={`text-xs font-serif font-semibold ${themeStyles.subText} block`}>Cỡ chữ</span>
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
                      className={`py-1.5 rounded-xl text-xs border text-center transition-colors cursor-pointer ${
                        fontSize === s.id
                          ? 'bg-[#5380AD] text-white border-[#5380AD] font-semibold'
                          : `${themeStyles.controlBg} ${themeStyles.border}`
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className={`text-xs font-serif font-semibold ${themeStyles.subText} block`}>Giãn dòng</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'compact' as const, label: 'Gọn' },
                    { id: 'normal' as const, label: 'Vừa' },
                    { id: 'spacious' as const, label: 'Thoáng' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLineHeight(l.id)}
                      className={`py-1.5 rounded-xl text-xs border text-center transition-colors cursor-pointer ${
                        lineHeight === l.id
                          ? 'bg-[#5380AD] text-white border-[#5380AD] font-semibold'
                          : `${themeStyles.controlBg} ${themeStyles.border}`
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className={`text-xs font-serif font-semibold ${themeStyles.subText} block`}>Màu giấy đọc</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'paper' as const, name: 'Tuyết Sớm', color: 'bg-[#FCFDFE] text-[#223952]' },
                    { id: 'cream' as const, name: 'Giấy Kem', color: 'bg-[#FDFBF5] text-[#2D251C]' },
                    { id: 'night' as const, name: 'Đêm Đông', color: 'bg-[#182638] text-[#E7F0FA]' },
                    { id: 'dark' as const, name: 'Mực Đêm', color: 'bg-[#111925] text-[#DCE5F0]' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`p-2 rounded-xl text-xs border flex items-center justify-between cursor-pointer ${t.color} ${
                        theme === t.id ? 'ring-2 ring-[#5380AD] font-semibold' : ''
                      }`}
                    >
                      <span>{t.name}</span>
                      {theme === t.id && <Check className="w-3.5 h-3.5 text-[#5380AD]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`pt-2 border-t ${themeStyles.border} flex items-center justify-between text-xs`}>
                <span className={themeStyles.subText}>Tuyết rơi ngoài lề</span>
                <button
                  type="button"
                  onClick={() => setShowSnowInReader(!showSnowInReader)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                    showSnowInReader ? 'bg-[#5380AD] text-white' : themeStyles.controlBg
                  }`}
                >
                  {showSnowInReader ? 'Bật' : 'Tắt'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable Book Sanctuary */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="relative z-10 flex-1 overflow-y-auto px-3 sm:px-6 py-6 sm:py-10 custom-scrollbar"
        >
          <article className={`relative max-w-[740px] mx-auto ${themeStyles.sheetBg} border ${themeStyles.border} rounded-[26px] px-6 sm:px-14 py-10 sm:py-14 space-y-9 shadow-[0_18px_50px_-14px_rgba(32,58,88,0.16)]`}>
            {/* Book-Page Title Masthead */}
            <header className="text-center space-y-3.5 pb-7 border-b border-dashed border-current/15">
              <div className={themeStyles.accent}>
                <ChapterCrestSVG />
              </div>

              <div className="flex items-center justify-center gap-2 text-xs font-serif">
                <BookOpen className={`w-3.5 h-3.5 ${themeStyles.accent}`} />
                <span className={themeStyles.subText}>
                  Tập Ký Ức Nhân Vật · Chấp bút: {creatorName}
                </span>
              </div>

              <h1 className="text-3xl sm:text-[2.5rem] font-bold font-display tracking-tight leading-[1.16] [text-wrap:balance]">
                {character.name}
              </h1>

              {character.title && (
                <p className={`text-xs sm:text-sm ${themeStyles.subText} font-serif italic max-w-lg mx-auto leading-relaxed`}>
                  &ldquo;{character.title}&rdquo;
                </p>
              )}
            </header>

            {/* Story Prose */}
            {paragraphs.length > 0 && (
              <div className={`space-y-6 max-w-[62ch] mx-auto ${fontClasses} ${sizeClasses} ${lineHeightClasses}`}>
                {chapters.length > 1 && (
                  <div className="flex items-center justify-center gap-3 pb-2">
                    <span className="h-[1px] w-8 bg-current opacity-25" />
                    <p className={`text-xs font-serif font-semibold tracking-[0.18em] uppercase ${themeStyles.subText}`}>
                      Chương {currentChapterIndex + 1} / {chapters.length}
                    </p>
                    <span className="h-[1px] w-8 bg-current opacity-25" />
                  </div>
                )}

                {paragraphs.map((cleanP, idx) => (
                  <p
                    key={idx}
                    className={`text-left whitespace-pre-wrap break-words ${
                      idx === 0 && fontFamily !== 'soft' ? 'winter-dropcap' : ''
                    }`}
                  >
                    <AutoLinkText text={cleanP} />
                  </p>
                ))}

                {chapters.length > 1 && (
                  <div className={`pt-8 flex items-center justify-between border-t ${themeStyles.border}`}>
                    <button
                      disabled={currentChapterIndex === 0}
                      onClick={() => {
                        setCurrentChapterIndex((prev) => Math.max(0, prev - 1));
                        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-serif font-semibold inline-flex items-center gap-1 cursor-pointer ${
                        currentChapterIndex === 0
                          ? 'opacity-30 cursor-not-allowed'
                          : `${themeStyles.controlBg}`
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Chương trước</span>
                    </button>

                    <span className={`text-xs font-serif tabular-nums ${themeStyles.subText}`}>
                      Trang {currentChapterIndex + 1} / {chapters.length}
                    </span>

                    <button
                      disabled={currentChapterIndex === chapters.length - 1}
                      onClick={() => {
                        setCurrentChapterIndex((prev) => Math.min(chapters.length - 1, prev + 1));
                        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-serif font-semibold inline-flex items-center gap-1 cursor-pointer ${
                        currentChapterIndex === chapters.length - 1
                          ? 'opacity-30 cursor-not-allowed'
                          : `${themeStyles.controlBg}`
                      }`}
                    >
                      <span>Chương sau</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className={`text-center pt-4 flex items-center justify-center gap-2 text-xs font-serif italic ${themeStyles.subText}`}>
                  <Snowflake className="w-3.5 h-3.5 opacity-60" />
                  <span>Khép lại trang chuyện</span>
                  <Snowflake className="w-3.5 h-3.5 opacity-60" />
                </div>
              </div>
            )}

            {/* Sealed First Message Letter */}
            {character.firstMessage && (
              <section className={`pt-8 border-t ${themeStyles.border} space-y-4 max-w-[62ch] mx-auto`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-serif font-bold">
                    <Feather className={`w-4 h-4 ${themeStyles.accent}`} />
                    <span>Lời mở đầu cuộc gặp gỡ</span>
                  </div>

                  <a
                    href={character.chatUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#5380AD] hover:bg-[#44709D] text-white text-xs font-serif font-semibold transition-colors"
                  >
                    <span>Trò chuyện cùng {character.name}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className={`p-5 sm:p-7 rounded-2xl ${themeStyles.letterBg} border border-dashed ${themeStyles.border} space-y-3`}>
                  <p className={`${fontClasses} ${sizeClasses} ${lineHeightClasses} whitespace-pre-wrap text-left italic`}>
                    {character.firstMessage}
                  </p>
                </div>
              </section>
            )}

            <footer className={`text-center pt-4 text-xs ${themeStyles.subText} font-serif`}>
              Hộp Ký Ức Mùa Đông · {creatorName}
            </footer>
          </article>
        </div>
      </div>
    </AnimatePresence>
  );
};

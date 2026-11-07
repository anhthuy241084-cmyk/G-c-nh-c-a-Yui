import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Check } from 'lucide-react';
import { BookmarkPaperStyle, BookmarkTailDecor, CharacterBookmark } from '../types';

interface PaperBookmarkProps {
  isBookmarked: boolean;
  bookmarkData?: CharacterBookmark;
  onToggleBookmark: (paperStyle?: BookmarkPaperStyle, tailDecor?: BookmarkTailDecor) => void;
  onUpdateStyle?: (paperStyle: BookmarkPaperStyle, tailDecor: BookmarkTailDecor) => void;
  readingProgress?: number; // 0-100 percentage if in story mode
}

export const PAPER_STYLE_CONFIGS: Record<
  BookmarkPaperStyle,
  { name: string; isSpecial?: boolean; bgClass: string; textClass: string; borderClass: string; shadowClass: string }
> = {
  cream: {
    name: 'Giấy tuyết mịn',
    bgClass: 'bg-[#F7FAFD] dark:bg-[#172536]',
    textClass: 'text-[#526B80] dark:text-[#E5EDF5]',
    borderClass: 'border-[#DCE7EF] dark:border-[#43576B]',
    shadowClass: 'shadow-[#91A9BC]/15 dark:shadow-slate-950/50',
  },
  pink: {
    name: 'Bụi tuyết phớt hồng',
    bgClass: 'bg-[#FFF5F7] dark:bg-[#2A1D25]',
    textClass: 'text-[#8C5D6F] dark:text-[#F3D5E0]',
    borderClass: 'border-[#F0D5DF] dark:border-[#5C3A48]',
    shadowClass: 'shadow-[#8C5D6F]/15 dark:shadow-slate-950/50',
  },
  lavender: {
    name: 'Sương lam chiều đông',
    bgClass: 'bg-[#F0F4FA] dark:bg-[#1A2638]',
    textClass: 'text-[#4F6885] dark:text-[#D0E0F2]',
    borderClass: 'border-[#D0E0F2] dark:border-[#384C66]',
    shadowClass: 'shadow-[#4F6885]/15 dark:shadow-slate-950/50',
  },
  blue: {
    name: 'Băng lam tuyết trắng',
    bgClass: 'bg-[#E8F1F8] dark:bg-[#202F42]',
    textClass: 'text-[#526B80] dark:text-[#E5EDF5]',
    borderClass: 'border-[#DCE7EF] dark:border-[#43576B]',
    shadowClass: 'shadow-[#91A9BC]/20 dark:shadow-slate-950/50',
  },
  gingham: {
    name: 'Khăn len caro',
    bgClass: 'bg-[#F0F5FA] bg-[radial-gradient(#91a9bc_1px,transparent_1px)] [background-size:8px_8px] dark:bg-[#172536]',
    textClass: 'text-[#526B80] dark:text-[#E5EDF5]',
    borderClass: 'border-[#DCE7EF] dark:border-[#43576B]',
    shadowClass: 'shadow-[#91A9BC]/20 dark:shadow-slate-950/50',
  },
  floral: {
    name: 'Hoa tuyết rơi nhẹ',
    bgClass: 'bg-[#F7FAFD] bg-[radial-gradient(#91a9bc_1.5px,transparent_1.5px)] [background-size:10px_10px] dark:bg-[#172536]',
    textClass: 'text-[#526B80] dark:text-[#E5EDF5]',
    borderClass: 'border-[#DCE7EF] dark:border-[#43576B]',
    shadowClass: 'shadow-[#91A9BC]/20 dark:shadow-slate-950/50',
  },
  lace: {
    name: 'Ren tuyết pha lê ✦',
    isSpecial: true,
    bgClass: 'bg-white/95 dark:bg-[#172536]/95 backdrop-blur-md border-dashed',
    textClass: 'text-[#526B80] dark:text-[#E5EDF5]',
    borderClass: 'border-[#91A9BC] dark:border-[#A9BDCE]/50',
    shadowClass: 'shadow-[#91A9BC]/20 dark:shadow-slate-950/60',
  },
  star: {
    name: 'Ánh sao đêm tuyết ✦',
    isSpecial: true,
    bgClass: 'bg-[#E8F1F8] bg-[radial-gradient(#91a9bc_1px,transparent_1px)] [background-size:12px_12px] dark:bg-[#172536]',
    textClass: 'text-[#526B80] dark:text-[#E5EDF5]',
    borderClass: 'border-[#91A9BC]/60 dark:border-[#A9BDCE]/60',
    shadowClass: 'shadow-[#91A9BC]/25 dark:shadow-slate-950/60',
  },
  ribbon: {
    name: 'Dải ruy băng đông ✦',
    isSpecial: true,
    bgClass: 'bg-gradient-to-b from-[#E8F1F8] via-[#D5E4EF] to-[#E8F1F8] dark:from-[#202F42] dark:via-[#172536] dark:to-[#202F42]',
    textClass: 'text-[#526B80] dark:text-[#E5EDF5]',
    borderClass: 'border-[#DCE7EF] dark:border-[#43576B]',
    shadowClass: 'shadow-[#91A9BC]/20 dark:shadow-slate-950/60',
  },
  vintage: {
    name: 'Bản thư mùa đông ✦',
    isSpecial: true,
    bgClass: 'bg-[#ECEFF3] dark:bg-[#1C2735]',
    textClass: 'text-[#485D70] dark:text-[#D5E0EA]',
    borderClass: 'border-[#C8D3DE] dark:border-[#3A4B5C]',
    shadowClass: 'shadow-[#485D70]/20 dark:shadow-slate-950/70',
  },
};

export const TAIL_DECOR_OPTIONS: BookmarkTailDecor[] = ['❄', '✦', '୨୧', '˚₊‧', '♡', '꒰ა ໒꒱'];

export const PaperBookmark: React.FC<PaperBookmarkProps> = ({
  isBookmarked,
  bookmarkData,
  onToggleBookmark,
  onUpdateStyle,
  readingProgress,
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; symbol: string }[]>([]);

  const paperStyle: BookmarkPaperStyle = bookmarkData?.paperStyle || 'blue';
  const tailDecor: BookmarkTailDecor = bookmarkData?.tailDecor || '❄';

  const config = PAPER_STYLE_CONFIGS[paperStyle] || PAPER_STYLE_CONFIGS.blue;

  // Effective progress to display
  const effectiveProgress =
    readingProgress !== undefined ? readingProgress : bookmarkData?.readingProgress;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isBookmarked) {
      const newSparkles = [
        { id: Date.now() + 1, x: -10, y: -20, symbol: '❄' },
        { id: Date.now() + 2, x: 10, y: -35, symbol: '✦' },
        { id: Date.now() + 3, x: 0, y: -50, symbol: '୨୧' },
        { id: Date.now() + 4, x: -15, y: -65, symbol: '˚' },
        { id: Date.now() + 5, x: 12, y: -80, symbol: '❄' },
      ];
      setSparkles(newSparkles);

      setTimeout(() => {
        setSparkles([]);
      }, 1200);
    }

    onToggleBookmark(paperStyle, tailDecor);
  };

  return (
    <div className="absolute right-0 top-12 z-30 flex items-start gap-1 select-none pointer-events-auto">
      {/* Floating Sparkles Animation */}
      <AnimatePresence>
        {sparkles.map((s) => (
          <motion.span
            key={s.id}
            initial={{ opacity: 1, y: 0, x: s.x, scale: 0.8 }}
            animate={{ opacity: 0, y: s.y - 30, x: s.x + (Math.random() * 10 - 5), scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute top-0 right-6 text-[#91A9BC] dark:text-[#A9BDCE] font-serif font-bold text-xs pointer-events-none z-50 drop-shadow-xs"
          >
            {s.symbol}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Style Picker Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsPickerOpen(!isPickerOpen);
        }}
        className="p-1.5 rounded-l-xl bg-white/90 dark:bg-[#172536]/90 border border-r-0 border-[#DCE7EF] dark:border-[#43576B] shadow-xs text-[#91A9BC] hover:text-[#526B80] dark:text-[#A9BDCE] transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="Tùy chỉnh kiểu giấy & trang trí bookmark mùa đông"
      >
        <Settings className="w-3.5 h-3.5" />
      </button>

      {/* Style Picker Drawer Popover */}
      <AnimatePresence>
        {isPickerOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-14 top-0 z-50 w-64 p-3.5 bg-white/95 dark:bg-[#172536]/95 backdrop-blur-xl border border-[#DCE7EF] dark:border-[#43576B] rounded-2xl shadow-xl space-y-3 text-xs text-[#526B80] dark:text-[#E5EDF5]"
          >
            <div className="flex items-center justify-between border-b pb-2 border-[#DCE7EF] dark:border-[#43576B]">
              <span className="font-extrabold text-[#526B80] dark:text-[#E5EDF5] flex items-center gap-1 font-serif">
                <span>❄</span> Kiểu giấy Bookmark
              </span>
              <button
                onClick={() => setIsPickerOpen(false)}
                className="text-[#91A9BC] hover:text-[#526B80] text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Paper Style Selector */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-[#91A9BC] dark:text-[#A9BDCE] uppercase tracking-wider block font-sans">
                Chọn họa tiết giấy mùa đông
              </span>
              <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto custom-scrollbar p-0.5">
                {(Object.keys(PAPER_STYLE_CONFIGS) as BookmarkPaperStyle[]).map((styleKey) => {
                  const cfg = PAPER_STYLE_CONFIGS[styleKey];
                  const isSelected = paperStyle === styleKey;
                  return (
                    <button
                      key={styleKey}
                      onClick={() => {
                        if (onUpdateStyle) {
                          onUpdateStyle(styleKey, tailDecor);
                        } else if (isBookmarked) {
                          onToggleBookmark(styleKey, tailDecor);
                        }
                      }}
                      className={`px-2 py-1.5 rounded-xl border text-left text-[11px] transition-all flex items-center justify-between cursor-pointer ${cfg.bgClass} ${cfg.textClass} ${cfg.borderClass} ${
                        isSelected ? 'ring-2 ring-[#91A9BC] font-extrabold scale-[1.02]' : 'opacity-85 hover:opacity-100'
                      }`}
                    >
                      <span className="truncate">{cfg.name}</span>
                      {isSelected && <Check className="w-3 h-3 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tail Decor Selector */}
            <div className="space-y-1.5 pt-1 border-t border-[#DCE7EF] dark:border-[#43576B]">
              <span className="text-[10px] font-bold text-[#91A9BC] dark:text-[#A9BDCE] uppercase tracking-wider block font-sans">
                Chi tiết trang trí
              </span>
              <div className="flex items-center justify-between gap-1">
                {TAIL_DECOR_OPTIONS.map((dec) => (
                  <button
                    key={dec}
                    onClick={() => {
                      if (onUpdateStyle) {
                        onUpdateStyle(paperStyle, dec);
                      } else if (isBookmarked) {
                        onToggleBookmark(paperStyle, dec);
                      }
                    }}
                    className={`px-2 py-1 rounded-lg border text-xs transition-all cursor-pointer ${
                      tailDecor === dec
                        ? 'bg-[#91A9BC] text-white border-[#6E899E] font-extrabold shadow-xs'
                        : 'bg-[#E8F1F8] dark:bg-[#202F42] border-[#DCE7EF] dark:border-[#43576B] text-[#526B80] dark:text-[#E5EDF5] hover:border-[#91A9BC]'
                    }`}
                  >
                    {dec}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Paper Ribbon Bookmark */}
      <motion.div
        onClick={handleClick}
        initial={false}
        animate={{
          y: isBookmarked ? 18 : 0,
          opacity: isBookmarked ? 1 : 0.75,
          rotate: isBookmarked ? [ -3, 3, -1.5, 1.5, 0 ] : 0,
        }}
        transition={{
          y: { duration: 0.35, ease: 'easeOut' },
          rotate: { duration: 0.5, ease: 'easeInOut' },
          opacity: { duration: 0.2 },
        }}
        whileHover={{
          scale: 1.05,
          opacity: 1,
        }}
        whileTap={{ scale: 0.96 }}
        className={`relative w-9 sm:w-10 cursor-pointer pt-3 pb-4 px-1 rounded-b-xl border-2 border-t-0 ${config.bgClass} ${config.textClass} ${config.borderClass} ${config.shadowClass} flex flex-col items-center justify-between gap-1.5 shadow-md transition-shadow font-serif`}
        title={isBookmarked ? 'Nhấn để bỏ đánh dấu' : 'Nhấn để kẹp bookmark tuyết vào trang'}
      >
        {/* Top Paper Cutline Indicator */}
        <div className="w-5 h-1 border-b border-dashed border-current opacity-40 mb-0.5" />

        {/* Special Twinkle effect icon if special */}
        {config.isSpecial && (
          <span className="text-[9px] animate-pulse opacity-80 -mb-1">❄</span>
        )}

        {/* Bookmark Main Symbol */}
        <span className="text-xs font-bold leading-none">{tailDecor}</span>

        {/* Vertical Writing Text */}
        <span className="text-[10px] font-extrabold tracking-widest [writing-mode:vertical-rl] rotate-180 py-1 opacity-90">
          {isBookmarked ? 'Đã lưu' : 'Đánh dấu'}
        </span>

        {/* Story Reading Progress Info */}
        {isBookmarked && effectiveProgress !== undefined && effectiveProgress > 0 && (
          <span className="text-[8px] font-mono font-bold px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 opacity-80 whitespace-nowrap">
            {Math.round(effectiveProgress)}%
          </span>
        )}

        {/* Tail Notch Cut at bottom */}
        <div className="text-[9px] leading-none opacity-80 pt-0.5">{tailDecor}</div>
      </motion.div>
    </div>
  );
};

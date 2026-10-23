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
    name: 'Giấy ngọc trai',
    bgClass: 'bg-[#F5F3EA] dark:bg-[#122b33]',
    textClass: 'text-[#29464C] dark:text-[#DDF5F6]',
    borderClass: 'border-[#d4e6ea] dark:border-[#246B7A]',
    shadowClass: 'shadow-[#247C8C]/10 dark:shadow-slate-950/50',
  },
  pink: {
    name: 'Bọt biển san hô',
    bgClass: 'bg-[#E5F5F7] dark:bg-[#102F38]',
    textClass: 'text-[#247C8C] dark:text-[#78DCE0]',
    borderClass: 'border-[#65C5CE]/50 dark:border-[#3FAAB7]/40',
    shadowClass: 'shadow-[#3FAAB7]/15 dark:shadow-slate-950/50',
  },
  lavender: {
    name: 'Sương biển tím',
    bgClass: 'bg-[#EDF2FC] dark:bg-[#162536]',
    textClass: 'text-[#2E476B] dark:text-[#CBE0F7]',
    borderClass: 'border-[#CADBF8] dark:border-[#2D4566]',
    shadowClass: 'shadow-[#247C8C]/15 dark:shadow-slate-950/50',
  },
  blue: {
    name: 'Làn sóng xanh',
    bgClass: 'bg-[#E5F7F8] dark:bg-[#0E2730]',
    textClass: 'text-[#247C8C] dark:text-[#78DCE0]',
    borderClass: 'border-[#65C5CE]/40 dark:border-[#246B7A]',
    shadowClass: 'shadow-[#247C8C]/15 dark:shadow-slate-950/50',
  },
  gingham: {
    name: 'Sóng biển caro',
    bgClass: 'bg-[#F2FBFC] bg-[radial-gradient(#65c5ce_1px,transparent_1px)] [background-size:8px_8px] dark:bg-[#0D2730]',
    textClass: 'text-[#247C8C] dark:text-[#DDF5F6]',
    borderClass: 'border-[#65C5CE]/50 dark:border-[#246B7A]',
    shadowClass: 'shadow-[#247C8C]/15 dark:shadow-slate-950/50',
  },
  floral: {
    name: 'Hoa cát trắng',
    bgClass: 'bg-[#F8FCFD] bg-[radial-gradient(#3faab7_1.5px,transparent_1.5px)] [background-size:10px_10px] dark:bg-[#081B22]',
    textClass: 'text-[#29464C] dark:text-[#DDF5F6]',
    borderClass: 'border-[#65C5CE]/40 dark:border-[#143943]',
    shadowClass: 'shadow-[#247C8C]/15 dark:shadow-slate-950/50',
  },
  lace: {
    name: 'Mảnh kính biển ✦',
    isSpecial: true,
    bgClass: 'bg-white/90 dark:bg-[#102F38]/90 backdrop-blur-md border-dashed',
    textClass: 'text-[#247C8C] dark:text-[#78DCE0]',
    borderClass: 'border-[#65C5CE] dark:border-[#78DCE0]/50',
    shadowClass: 'shadow-[#65C5CE]/20 dark:shadow-slate-950/60',
  },
  star: {
    name: 'Ánh sao đáy biển ✦',
    isSpecial: true,
    bgClass: 'bg-[#F0F9FA] bg-[radial-gradient(#78dce0_1px,transparent_1px)] [background-size:12px_12px] dark:bg-[#0A222B]',
    textClass: 'text-[#247C8C] dark:text-[#78DCE0]',
    borderClass: 'border-[#78DCE0]/60 dark:border-[#3FAAB7]/60',
    shadowClass: 'shadow-[#78DCE0]/20 dark:shadow-slate-950/60',
  },
  ribbon: {
    name: 'Dải ruy băng biển ✦',
    isSpecial: true,
    bgClass: 'bg-gradient-to-b from-[#E5F5F7] via-[#DDF1F3] to-[#E5F5F7] dark:from-[#143943] dark:via-[#102F38] dark:to-[#143943]',
    textClass: 'text-[#247C8C] dark:text-[#78DCE0]',
    borderClass: 'border-[#65C5CE] dark:border-[#78DCE0]',
    shadowClass: 'shadow-[#247C8C]/20 dark:shadow-slate-950/60',
  },
  vintage: {
    name: 'Bản đồ biển cổ ✦',
    isSpecial: true,
    bgClass: 'bg-[#EAEFF0] dark:bg-[#132A32]',
    textClass: 'text-[#29464C] dark:text-[#DDF5F6]',
    borderClass: 'border-[#BAC9CC] dark:border-[#246B7A]',
    shadowClass: 'shadow-[#247C8C]/25 dark:shadow-slate-950/70',
  },
};

export const TAIL_DECOR_OPTIONS: BookmarkTailDecor[] = ['✦', '〜', '˚₊‧', '♡', '꒰ა ໒꒱'];

export const PaperBookmark: React.FC<PaperBookmarkProps> = ({
  isBookmarked,
  bookmarkData,
  onToggleBookmark,
  onUpdateStyle,
  readingProgress,
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; symbol: string }[]>([]);

  const paperStyle: BookmarkPaperStyle = bookmarkData?.paperStyle || 'pink';
  const tailDecor: BookmarkTailDecor = bookmarkData?.tailDecor || '✦';

  const config = PAPER_STYLE_CONFIGS[paperStyle] || PAPER_STYLE_CONFIGS.pink;

  // Effective progress to display
  const effectiveProgress =
    readingProgress !== undefined ? readingProgress : bookmarkData?.readingProgress;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isBookmarked) {
      const newSparkles = [
        { id: Date.now() + 1, x: -10, y: -20, symbol: '✦' },
        { id: Date.now() + 2, x: 10, y: -35, symbol: '˚' },
        { id: Date.now() + 3, x: 0, y: -50, symbol: '〜' },
        { id: Date.now() + 4, x: -15, y: -65, symbol: '˚' },
        { id: Date.now() + 5, x: 12, y: -80, symbol: '✦' },
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
            className="absolute top-0 right-6 text-[#3FAAB7] dark:text-[#78DCE0] font-serif font-bold text-xs pointer-events-none z-50 drop-shadow-xs"
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
        className="p-1.5 rounded-l-xl bg-white/90 dark:bg-[#102F38]/90 border border-r-0 border-[#65C5CE]/50 dark:border-[#78DCE0]/30 shadow-xs text-[#247C8C] hover:text-[#3FAAB7] dark:text-[#78DCE0] transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="Tùy chỉnh kiểu giấy & trang trí bookmark"
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
            className="absolute right-14 top-0 z-50 w-64 p-3.5 bg-white/95 dark:bg-[#102F38]/95 backdrop-blur-xl border border-[#65C5CE]/40 dark:border-[#78DCE0]/30 rounded-2xl shadow-xl space-y-3 text-xs text-[#29464C] dark:text-[#DDF5F6]"
          >
            <div className="flex items-center justify-between border-b pb-2 border-[#65C5CE]/20 dark:border-[#143943]">
              <span className="font-extrabold text-[#247C8C] dark:text-[#78DCE0] flex items-center gap-1 font-serif">
                <span>✦</span> Kiểu giấy Bookmark
              </span>
              <button
                onClick={() => setIsPickerOpen(false)}
                className="text-[#6B858A] hover:text-[#29464C] text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Paper Style Selector */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-[#6B858A] dark:text-[#8FB6BC] uppercase tracking-wider block">
                Chọn họa tiết giấy
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
                        isSelected ? 'ring-2 ring-[#3FAAB7] font-extrabold scale-[1.02]' : 'opacity-80 hover:opacity-100'
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
            <div className="space-y-1.5 pt-1 border-t border-[#65C5CE]/20 dark:border-[#143943]">
              <span className="text-[10px] font-bold text-[#6B858A] dark:text-[#8FB6BC] uppercase tracking-wider block">
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
                        ? 'bg-[#3FAAB7] text-white border-[#247C8C] font-extrabold shadow-xs'
                        : 'bg-[#E5F5F7] dark:bg-[#0D2730] border-[#65C5CE]/30 dark:border-[#143943] text-[#29464C] dark:text-[#DDF5F6] hover:border-[#3FAAB7]'
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
        title={isBookmarked ? 'Nhấn để bỏ đánh dấu' : 'Nhấn để kẹp bookmark biển vào trang'}
      >
        {/* Top Paper Cutline Indicator */}
        <div className="w-5 h-1 border-b border-dashed border-current opacity-40 mb-0.5" />

        {/* Special Twinkle effect icon if special */}
        {config.isSpecial && (
          <span className="text-[9px] animate-pulse opacity-80 -mb-1">✦</span>
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

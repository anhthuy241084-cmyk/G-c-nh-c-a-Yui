import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Megaphone, Check, Sparkles, ChevronDown, ChevronUp, Snowflake, X } from 'lucide-react';
import { AppNotification } from '../types';
import { triggerSfx } from '../utils/sfx';

interface WinterAnnouncementBannerProps {
  unreadAnnouncements: AppNotification[];
  totalAnnouncementsCount: number;
  onDismissNotification: (id: string) => void;
  onDismissAll: () => void;
  onSelectCharacterById?: (characterId: string) => void;
  isSfxOn?: boolean;
  sfxVolume?: number;
}

export const WinterAnnouncementBanner: React.FC<WinterAnnouncementBannerProps> = ({
  unreadAnnouncements,
  totalAnnouncementsCount,
  onDismissNotification,
  onDismissAll,
  onSelectCharacterById,
  isSfxOn = true,
  sfxVolume = 0.5,
}) => {
  const [expanded, setExpanded] = useState(false);

  if (unreadAnnouncements.length === 0) {
    return null;
  }

  const latest = unreadAnnouncements[0];
  const remaining = unreadAnnouncements.slice(1);

  const handleAcknowledge = (id: string) => {
    if (isSfxOn) triggerSfx('pop', sfxVolume);
    onDismissNotification(id);
  };

  const handleAcknowledgeAll = () => {
    if (isSfxOn) triggerSfx('chime', sfxVolume);
    onDismissAll();
  };

  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        aria-label="Thông báo mới từ Yui"
        className="w-full max-w-6xl mx-auto px-0 sm:px-6"
      >
        <div className="relative overflow-hidden rounded-2xl sm:rounded-[20px] bg-[#FAFBFD]/95 dark:bg-[#182536]/95 border border-[#C7DCF0] dark:border-[#374F6B] shadow-[0_8px_24px_-8px_rgba(36,64,92,0.14)] backdrop-blur-md">
          <div className="p-3.5 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
            {/* Left: Yui Avatar & Latest Announcement Content */}
            <div className="flex items-start gap-3 sm:gap-3.5 min-w-0 flex-1">
              <div className="relative shrink-0">
                <img
                  src="/yui_avatar.jpg"
                  alt="Yui"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl object-cover border border-[#BFD8EE] dark:border-[#49678A] shadow-xs"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#5380AD] text-white flex items-center justify-center shadow-xs">
                  {latest.type === 'new_character' ? (
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  ) : (
                    <Megaphone className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  )}
                </span>
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-serif text-[#4E7AA5] dark:text-[#9AC0E3]">
                  <span className="font-bold flex items-center gap-1">
                    <Snowflake className="w-3 h-3" />
                    <span>Tin mới từ Yui</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{latest.createdAt}</span>
                  {unreadAnnouncements.length > 1 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-[#36597A] dark:text-[#CBE3FA]">
                        {unreadAnnouncements.length} tin chưa xem
                      </span>
                    </>
                  )}
                  {totalAnnouncementsCount > 0 && unreadAnnouncements.length === 1 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Tin mới nhất</span>
                    </>
                  )}
                </div>

                <h3 className="text-sm sm:text-[15px] font-bold font-display text-[#203850] dark:text-[#F8FBFF] leading-snug">
                  {latest.title}
                </h3>

                <p className="text-xs sm:text-[13px] text-[#3B556E] dark:text-[#D5E4F3] leading-relaxed whitespace-pre-line break-words">
                  {latest.content}
                </p>
              </div>
            </div>

            {/* Right: Clean Actions */}
            <div className="flex items-center flex-wrap gap-2 shrink-0 self-end sm:self-center">
              {latest.characterId && onSelectCharacterById && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectCharacterById(latest.characterId!);
                    handleAcknowledge(latest.id);
                  }}
                  className="min-h-[38px] sm:min-h-0 px-3.5 py-2 rounded-xl text-xs font-serif font-semibold bg-[#EAF3FC] dark:bg-[#283F5C] text-[#315475] dark:text-[#E5EFF9] hover:bg-[#DCEBFA] border border-[#CFE1F2] dark:border-[#415C7C] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Xem nhân vật
                </button>
              )}

              {remaining.length > 0 && (
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className="min-h-[38px] sm:min-h-0 px-3 py-2 rounded-xl text-xs font-serif font-semibold text-[#5380AD] dark:text-[#A4C6E6] hover:bg-[#EAF3FC] dark:hover:bg-[#283F5C] transition-colors cursor-pointer inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  <span>+{remaining.length} tin</span>
                  {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}

              <button
                type="button"
                onClick={() => handleAcknowledge(latest.id)}
                className="min-h-[38px] sm:min-h-0 px-3.5 py-2 rounded-xl text-xs font-serif font-semibold bg-[#5380AD] hover:bg-[#44709D] text-white shadow-xs transition-colors active:scale-95 cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                title="Đánh dấu đã đọc — lần sau sẽ không hiện lại thông báo này nữa"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Đã xem</span>
              </button>
            </div>
          </div>

          {/* Expandable remaining unread notices */}
          <AnimatePresence>
            {expanded && remaining.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-[#D6E5F3] dark:border-[#354E6A] bg-[#F6FAFE]/80 dark:bg-[#172538]/80 px-4 sm:px-6 py-3 space-y-2.5 overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-serif font-semibold text-[#5E7C99] dark:text-[#A4C0DA]">
                    Các thông báo khác chưa đọc ({remaining.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAcknowledgeAll}
                    className="text-[11px] font-serif font-semibold text-[#4E7AA5] dark:text-[#9AC0E3] hover:underline cursor-pointer"
                  >
                    Đánh dấu đã xem tất cả
                  </button>
                </div>

                {remaining.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 py-2 border-t border-dashed border-[#D6E5F3] dark:border-[#324963]"
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 text-[11px] text-[#5E7C99] dark:text-[#A4C0DA]">
                        <span className="font-bold font-serif text-[#16273B] dark:text-[#F1F7FD] truncate">
                          {item.title}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="shrink-0">{item.createdAt}</span>
                      </div>
                      <p className="text-xs text-[#435B73] dark:text-[#CFE1F3] whitespace-pre-line break-words">
                        {item.content}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAcknowledge(item.id)}
                      className="p-1.5 rounded-lg text-[#64829E] hover:text-[#16273B] dark:hover:text-white hover:bg-[#EAF3FC] dark:hover:bg-[#243750] transition-colors cursor-pointer shrink-0"
                      title="Đã xem tin này"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>
    </AnimatePresence>
  );
};

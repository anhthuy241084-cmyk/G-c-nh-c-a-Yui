import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark, ExternalLink, Heart, Lock, Snowflake, BookOpen, Feather } from 'lucide-react';
import { Character } from '../types';
import { triggerHeartConfetti } from '../utils/confetti';
import { AutoLinkText } from './AutoLinkText';
import { triggerSfx } from '../utils/sfx';

interface CharacterCardProps {
  character: Character;
  onSelect?: (character: Character) => void;
  onGoToGgai?: (character: Character, url: string) => void;
  onVote: (characterId: string) => void;
  onToggleFavorite?: (characterId: string) => void;
  isFavorite?: boolean;
  onTagClick?: (tag: string) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (characterId: string) => void;
  orderIndex?: number;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onSelect,
  onGoToGgai,
  onVote,
  onTagClick,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const [justVoted, setJustVoted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [snowToast, setSnowToast] = useState<string | null>(null);

  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation();
    const originX = e.clientX ? e.clientX / window.innerWidth : 0.5;
    const originY = e.clientY ? e.clientY / window.innerHeight : 0.5;
    triggerHeartConfetti(originX, originY);
    triggerSfx('heart', 0.45);
    onVote(character.id);
    setJustVoted(true);
    setTimeout(() => setJustVoted(false), 1200);
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleBookmark) {
      triggerSfx('pop', 0.35);
      onToggleBookmark(character.id);
      const msg = !isBookmarked ? 'Đã cất vào dấu trang tuyết' : 'Đã bỏ khỏi dấu trang';
      setSnowToast(msg);
      setTimeout(() => setSnowToast(null), 1600);
    }
  };

  const tags = Array.isArray(character.tags) ? character.tags : [];
  const hasPassword = !!(character.password && character.password.trim().length > 0);
  const hasStory = !!(character.story && character.story.trim().length > 0);
  const creatorName = character.creator && character.creator.trim() !== 'Admin' ? character.creator : 'Yui';

  return (
    <div className="w-full relative h-full">
      <AnimatePresence>
        {snowToast && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-xl bg-[#294868] dark:bg-[#F4F8FC] text-white dark:text-[#1C2D42] text-[10px] font-serif shadow-md whitespace-nowrap flex items-center gap-1.5 pointer-events-none"
          >
            <Snowflake className="w-3 h-3" />
            <span>{snowToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact Mobile-Optimized Pastel Winter Card (~420px on mobile -> 1 full card per screen swipe) */}
      <motion.article
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        onClick={() => onSelect && onSelect(character)}
        className="group relative h-full flex flex-col justify-between rounded-[22px] sm:rounded-[24px] overflow-hidden cursor-pointer select-none bg-white/95 dark:bg-[#192638]/95 border border-[#D4E6F6] dark:border-[#314660] shadow-[0_6px_20px_-8px_rgba(74,116,162,0.14)] hover:shadow-[0_16px_34px_-10px_rgba(74,116,162,0.24)] hover:border-[#99C0E4] dark:hover:border-[#658DB5] hover:-translate-y-1 transition-all duration-250 text-[#263E57] dark:text-[#E7F0FA]"
      >
        {/* Top Clean Portrait: 4:3 compact crop on mobile, 4:5 editorial portrait on tablet/desktop */}
        <div className="p-2.5 pb-0 sm:p-3 sm:pb-0">
          <div className="relative w-full aspect-[4/3] sm:aspect-[4/5] rounded-[16px] sm:rounded-[18px] overflow-hidden bg-[#EAF3FC] dark:bg-[#223349]">
            {!imgError && character.avatar ? (
              <img
                src={character.avatar}
                alt={character.name}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover object-[50%_18%] transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#6D96BF] dark:text-[#A9C7E4]">
                <Snowflake className="w-8 h-8 opacity-75" />
                <span className="font-display text-2xl font-bold">{character.name.slice(0, 1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Middle Stationery Prose Body */}
        <div className="px-3.5 pt-2.5 pb-2.5 sm:px-4.5 sm:pt-3.5 sm:pb-3.5 flex-1 flex flex-col justify-between gap-2 sm:gap-3">
          <div className="space-y-1 sm:space-y-1.5">
            {/* Title Row + Bookmark Toggle */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0 pt-0.5">
                <h3 className="text-[16px] sm:text-[18px] font-bold font-display text-[#203850] dark:text-white group-hover:text-[#5380AD] dark:group-hover:text-[#B5D6F5] transition-colors line-clamp-1 leading-snug">
                  {character.name}
                </h3>
                {hasPassword && (
                  <Lock
                    className="w-3.5 h-3.5 text-[#7596B5] dark:text-[#8FB0CE] shrink-0"
                    aria-label="Nhân vật có mật khẩu"
                  />
                )}
              </div>

              {onToggleBookmark && (
                <button
                  type="button"
                  onClick={handleBookmarkClick}
                  title={isBookmarked ? 'Bỏ khỏi dấu trang tuyết' : 'Cất vào dấu trang tuyết'}
                  className={`min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 flex items-center justify-center p-1.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                    isBookmarked
                      ? 'bg-[#5380AD] text-white border-[#5380AD]'
                      : 'bg-[#F3F8FD] dark:bg-[#223348] text-[#6B8BA8] dark:text-[#9CBAD6] border-[#DCE8F4] dark:border-[#344A64] hover:text-[#203850] dark:hover:text-white'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>

            {/* Clean Typographic Byline */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] font-serif text-[#6484A3] dark:text-[#9CB8D4]">
              <span>Chấp bút: {creatorName}</span>
              {hasStory && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 text-[#5380AD] dark:text-[#A4C6E6] font-medium">
                    <Feather className="w-3 h-3" />
                    <span>Có truyện</span>
                  </span>
                </>
              )}
            </div>

            {/* Summary */}
            <div className="text-xs sm:text-[13px] text-[#435E78] dark:text-[#CEDEEB] leading-snug sm:leading-relaxed line-clamp-2 font-sans pt-0.5 min-h-[2.1rem] sm:min-h-[2.45rem]">
              <AutoLinkText text={character.title} />
            </div>
          </div>

          {/* Interactive Clean Hashtag Links */}
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1.5 sm:pt-2 border-t border-dashed border-[#E1ECF7] dark:border-[#2C4058]">
              {tags.slice(0, 4).map((tag, index) => (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => {
                    if (onTagClick) {
                      e.stopPropagation();
                      onTagClick(tag);
                    }
                  }}
                  className={`text-[11px] font-serif font-medium text-[#5380AD] dark:text-[#9EC1E3] hover:text-[#244363] dark:hover:text-white hover:underline transition-colors cursor-pointer ${
                    index >= 3 ? 'hidden sm:inline-block' : ''
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Light Airy Action Strip with Comfortable Touch Targets */}
        <div className="px-3 py-2 sm:px-4 sm:py-3 border-t border-[#E6F0FA] dark:border-[#293E55] bg-[#F7FAFE] dark:bg-[#142030] flex items-center justify-between gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleVote}
            className={`inline-flex items-center gap-1 min-h-[38px] sm:min-h-0 px-2.5 py-1.5 rounded-xl text-xs font-semibold tabular-nums transition-colors cursor-pointer shrink-0 ${
              justVoted
                ? 'bg-rose-400 text-white'
                : 'bg-[#FFF3F6] dark:bg-rose-950/35 text-[#D25E82] dark:text-rose-300 border border-[#F3D2DC] dark:border-rose-800/40 hover:bg-[#FFE9EF]'
            }`}
            title="Thả tim bình chọn"
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                justVoted ? 'fill-current' : 'fill-rose-400/45 text-[#D25E82] dark:text-rose-300'
              }`}
            />
            <span>{character.votes || 0}</span>
          </button>

          <div className="flex items-center gap-1.5 flex-wrap justify-end min-w-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onSelect) onSelect(character);
              }}
              className="inline-flex items-center gap-1 min-h-[38px] sm:min-h-0 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium text-[#375A7D] dark:text-[#DCEAF7] bg-white dark:bg-[#1E2E42] hover:bg-[#EAF3FC] dark:hover:bg-[#283C55] border border-[#D4E6F6] dark:border-[#344A63] cursor-pointer transition-colors font-serif whitespace-nowrap"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#5380AD] dark:text-[#9AC0E3]" />
              <span>Hồ sơ</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onGoToGgai) {
                  onGoToGgai(character, character.chatUrl);
                } else {
                  window.open(character.chatUrl, '_blank');
                }
              }}
              className="inline-flex items-center gap-1 min-h-[38px] sm:min-h-0 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#5380AD] hover:bg-[#44709D] cursor-pointer transition-colors font-serif whitespace-nowrap shadow-xs max-w-[140px] sm:max-w-none truncate"
              title={character.chatUrl}
            >
              <span className="truncate">{character.chatUrlLabel || 'Tiến tới Ggai'}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </button>

            {character.chatUrl2 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onGoToGgai) {
                    onGoToGgai(character, character.chatUrl2!);
                  } else {
                    window.open(character.chatUrl2, '_blank');
                  }
                }}
                className="inline-flex items-center gap-1 min-h-[38px] sm:min-h-0 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#375A7D] dark:text-[#DCEAF7] bg-white dark:bg-[#1E2E42] hover:bg-[#EAF3FC] border border-[#D4E6F6] dark:border-[#344A63] cursor-pointer transition-colors font-serif whitespace-nowrap"
                title={character.chatUrl2}
              >
                <span>{character.chatUrl2Label || 'Link 2'}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </button>
            )}
          </div>
        </div>
      </motion.article>
    </div>
  );
};

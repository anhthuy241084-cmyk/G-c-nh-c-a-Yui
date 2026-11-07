import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark, Star, ExternalLink, Heart, Sparkles } from 'lucide-react';
import { Character } from '../types';
import { triggerHeartConfetti } from '../utils/confetti';
import { AutoLinkText } from './AutoLinkText';

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
  onToggleFavorite,
  isFavorite = false,
  onTagClick,
  isBookmarked = false,
  onToggleBookmark,
  orderIndex,
}) => {
  const [justVoted, setJustVoted] = useState(false);
  const [snowToast, setSnowToast] = useState<string | null>(null);

  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation();
    const originX = e.clientX ? e.clientX / window.innerWidth : 0.5;
    const originY = e.clientY ? e.clientY / window.innerHeight : 0.5;
    triggerHeartConfetti(originX, originY);
    onVote(character.id);
    setJustVoted(true);
    setTimeout(() => setJustVoted(false), 1200);
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleBookmark) {
      onToggleBookmark(character.id);
      const msg = !isBookmarked ? 'Đã cất vào dấu trang tuyết ♡' : 'Đã bỏ khỏi dấu trang.';
      setSnowToast(msg);
      setTimeout(() => setSnowToast(null), 2000);
    }
  };

  return (
    <div className="w-full relative">
      {/* Snow Bookmark feedback toast */}
      <AnimatePresence>
        {snowToast && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.9 }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full bg-[#172536] dark:bg-[#F7FAFD] text-white dark:text-[#172536] text-[10px] font-serif shadow-md border border-white/20 whitespace-nowrap flex items-center gap-1 pointer-events-none"
          >
            <span>❄</span>
            <span>{snowToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ❄️ Powder Blue Winter Character Card */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        onClick={() => onSelect && onSelect(character)}
        className="group winter-card rounded-3xl flex flex-col justify-between cursor-pointer select-none text-[#526B80] dark:text-[#E5EDF5]"
      >
        <div className="p-5 space-y-3.5 relative z-10">
          {/* Header: Avatar, Name, Creator and Snow Bookmark button */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar with subtle silver-blue glow ring */}
              <div className="shrink-0 relative overflow-hidden rounded-2xl p-0.5 bg-gradient-to-br from-[#D5E4EF] via-[#E8F1F8] to-[#91A9BC] dark:from-[#354A60] dark:to-[#43576B] shadow-xs">
                <img
                  src={character.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                  alt={character.name}
                  className="w-16 h-16 rounded-[14px] object-cover border border-white dark:border-[#202F42] shadow-xs transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>

              <div className="space-y-0.5 min-w-0">
                <h3 className="text-base font-bold text-[#526B80] dark:text-[#E5EDF5] group-hover:text-[#3B5264] dark:group-hover:text-[#A9BDCE] transition-colors line-clamp-1 flex items-center gap-1.5 font-serif">
                  {character.decorativeItemSet && <span className="text-xs opacity-70">{character.decorativeItemSet.split(' ')[0]}</span>}
                  <span>{character.name}</span>
                  {character.decorativeItemSet && <span className="text-xs opacity-70">{character.decorativeItemSet.split(' ').slice(-1)[0]}</span>}
                </h3>
                
                <p className="text-xs text-[#91A9BC] dark:text-[#A9BDCE] font-medium flex items-center gap-1 font-serif truncate">
                  <span className="text-[10px] text-[#91A9BC]">❄</span>
                  <span>Tác giả: {character.creator || 'Admin'}</span>
                  {orderIndex !== undefined && (
                    <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-[#E8F1F8] dark:bg-[#202F42] text-[#526B80] dark:text-[#E5EDF5]">
                      #{orderIndex + 1}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Top Right Action: Snow Bookmark Button 🔖 */}
            <div className="flex items-center gap-1 shrink-0 z-10">
              <button
                onClick={handleBookmarkClick}
                title={isBookmarked ? 'Đã cất vào dấu trang tuyết (Nhấn để bỏ)' : 'Cất vào Dấu Trang Tuyết ❄'}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isBookmarked
                    ? 'text-[#6E899E] bg-[#D5E4EF] dark:bg-[#354A60] dark:text-[#E5EDF5] border border-[#91A9BC]/50 shadow-xs scale-105'
                    : 'text-[#91A9BC] dark:text-[#A9BDCE] hover:text-[#526B80] hover:bg-[#E8F1F8] dark:hover:bg-[#202F42]'
                }`}
              >
                <Bookmark className={`w-4 h-4 transition-transform ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Tagline / Mô tả ngắn */}
          <div className="text-xs text-[#526B80]/85 dark:text-[#E5EDF5]/85 font-normal leading-relaxed line-clamp-2">
            <AutoLinkText text={character.title} />
          </div>

          {/* Tag List */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {character.tags.map((tag) => (
              <span
                key={tag}
                onClick={(e) => {
                  if (onTagClick) {
                    e.stopPropagation();
                    onTagClick(tag);
                  }
                }}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#E8F1F8] dark:bg-[#202F42] text-[#526B80] dark:text-[#E5EDF5] border border-[#DCE7EF] dark:border-[#43576B] hover:bg-[#D5E4EF] dark:hover:bg-[#354A60] transition-all hover:scale-105 cursor-pointer select-none font-serif"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Actions: Tim/Bình chọn, Xem chi tiết & 'Tiến tới Ggai' button */}
        <div className="px-5 py-3 border-t border-[#DCE7EF] dark:border-[#43576B] bg-[#F7FAFD]/70 dark:bg-[#172536]/70 flex items-center justify-between gap-2 relative z-10">
          {/* Heart / Vote Button */}
          <button
            onClick={handleVote}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              justVoted
                ? 'bg-[#91A9BC] text-white shadow-xs'
                : 'bg-[#E8F1F8] dark:bg-[#202F42] text-[#526B80] dark:text-[#E5EDF5] hover:bg-[#D5E4EF] dark:hover:bg-[#354A60]'
            }`}
            title="Thả tim bình chọn cho nhân vật"
          >
            <Heart className={`w-3.5 h-3.5 ${justVoted ? 'fill-current animate-pulse' : 'fill-[#91A9BC]/30 text-[#91A9BC] dark:fill-[#A9BDCE]/30 dark:text-[#A9BDCE]'}`} />
            <span>{character.votes || 0}</span>
          </button>

          {/* Action Links Container */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {/* View Detail button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onSelect) onSelect(character);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-[#526B80] dark:text-[#E5EDF5] bg-white dark:bg-[#202F42] hover:bg-[#E8F1F8] dark:hover:bg-[#354A60] border border-[#DCE7EF] dark:border-[#43576B] shadow-xs cursor-pointer transition-transform active:scale-95 font-serif"
            >
              Chi tiết
            </button>

            {/* Link 1 (Primary / Tiến tới Ggai) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onGoToGgai) {
                  onGoToGgai(character, character.chatUrl);
                } else {
                  window.open(character.chatUrl, '_blank');
                }
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white btn-winter-primary shadow-xs flex items-center gap-1 cursor-pointer transition-transform active:scale-95 font-serif"
              title={character.chatUrl}
            >
              <span>{character.chatUrlLabel || 'Tiến tới Ggai'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {/* Link 2 (Optional Secondary link) */}
            {character.chatUrl2 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onGoToGgai) {
                    onGoToGgai(character, character.chatUrl2!);
                  } else {
                    window.open(character.chatUrl2, '_blank');
                  }
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#526B80] dark:text-[#E5EDF5] bg-white dark:bg-[#202F42] hover:bg-[#E8F1F8] dark:hover:bg-[#354A60] border border-[#DCE7EF] dark:border-[#43576B] shadow-xs flex items-center gap-1 cursor-pointer transition-transform active:scale-95 font-serif"
                title={character.chatUrl2}
              >
                <span>{character.chatUrl2Label || 'Link 2'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Star, ExternalLink, Sparkles } from 'lucide-react';
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
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onSelect,
  onGoToGgai,
  onVote,
  onToggleFavorite,
  isFavorite = false,
  onTagClick,
}) => {
  const [justVoted, setJustVoted] = useState(false);
  const [bubbleParticles, setBubbleParticles] = useState<Array<{ id: number; x: number; y: number; symbol: string }>>([]);

  const triggerBubbleBurst = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const symbols = ['✦', '✧', '⋆', '♡'];
    const newParticles = Array.from({ length: 3 }).map((_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() * 14 - 7),
      y: y + (Math.random() * 10 - 5),
      symbol: symbols[i % symbols.length],
    }));

    setBubbleParticles((prev) => [...prev.slice(-6), ...newParticles]);
    setTimeout(() => {
      setBubbleParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 900);
  };

  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerBubbleBurst(e);
    const originX = e.clientX ? e.clientX / window.innerWidth : 0.5;
    const originY = e.clientY ? e.clientY / window.innerHeight : 0.5;
    triggerHeartConfetti(originX, originY);
    onVote(character.id);
    setJustVoted(true);
    setTimeout(() => setJustVoted(false), 1200);
  };

  return (
    <div className="w-full">
      {/* 🌊 "Mảnh kính nằm dưới nước" Card */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        onClick={() => onSelect && onSelect(character)}
        className="group ocean-card rounded-3xl flex flex-col justify-between cursor-pointer select-none text-[#14303A] dark:text-[#E4F7F9]"
      >
        {/* Floating Sparkle Glint Ascending Effect */}
        <AnimatePresence>
          {bubbleParticles.map((p) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 1, scale: 0.7, x: p.x, y: p.y }}
              animate={{
                opacity: [1, 0.9, 0],
                scale: [0.8, 1.25, 0.9],
                y: p.y - 55,
                x: [p.x, p.x + 6, p.x - 6, p.x + 2],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.0, ease: 'easeOut' }}
              className="absolute pointer-events-none text-[#38CAD6] dark:text-[#48CCD6] z-40 text-sm font-bold drop-shadow-xs"
            >
              {p.symbol}
            </motion.span>
          ))}
        </AnimatePresence>

        <div className="p-5 space-y-4 relative z-10">
          {/* Header Avatar & Action Controls */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar with subtle glow ring */}
              <div className="shrink-0 relative overflow-hidden rounded-2xl p-0.5 bg-gradient-to-br from-[#38CAD6]/40 via-transparent to-[#1B6E7D]/30 dark:from-[#38CAD6]/40 dark:to-[#0F4C5C]/40 shadow-xs">
                <img
                  src={character.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                  alt={character.name}
                  className="w-16 h-16 rounded-[14px] object-cover border border-white/70 dark:border-[#0E232E] shadow-xs transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>

              <div className="space-y-0.5 min-w-0">
                <h3 className="text-base font-bold text-[#14303A] dark:text-[#E4F7F9] group-hover:text-[#1B6E7D] dark:group-hover:text-[#48CCD6] transition-colors line-clamp-1 flex items-center gap-1.5 font-serif">
                  <span>{character.name}</span>
                </h3>
                <p className="text-xs text-[#1B6E7D] dark:text-[#48CCD6] font-semibold flex items-center gap-1 font-serif truncate">
                  <span className="text-[10px] text-[#38CAD6]">✦</span>
                  <span>Tác giả: {character.creator || 'Admin'}</span>
                </p>
              </div>
            </div>

            {/* Star (Save to Favorites) Button */}
            <div className="flex items-center gap-1 shrink-0 z-10">
              {onToggleFavorite && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(character.id);
                  }}
                  title={isFavorite || character.isFavorite ? "Đã lưu vào mục Yêu thích ⭐ (Nhấn để bỏ lưu)" : "Lưu vào mục Yêu thích ⭐"}
                  className={`p-2 rounded-xl transition-all ${
                    isFavorite || character.isFavorite
                      ? 'text-[#1B6E7D] bg-[#E0F3F5] dark:bg-[#143943] border border-[#38CAD6]/60 dark:border-[#38CAD6]/50 shadow-xs'
                      : 'text-[#53737C] dark:text-[#88A9B3] hover:text-[#38CAD6] hover:bg-[#E8F7F9] dark:hover:bg-[#143943]'
                  }`}
                >
                  <Star className={`w-4 h-4 transition-transform ${isFavorite || character.isFavorite ? 'fill-[#38CAD6] text-[#1B6E7D] dark:fill-[#48CCD6] dark:text-[#48CCD6] scale-110' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {/* Tagline / Mô tả ngắn */}
          <div className="text-xs text-[#53737C] dark:text-[#88A9B3] font-normal leading-relaxed line-clamp-2">
            <AutoLinkText text={character.title} />
          </div>

          {/* Tag List */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {character.tags.map((tag) => (
              <span
                key={tag}
                onClick={(e) => {
                  if (onTagClick) {
                    e.stopPropagation();
                    onTagClick(tag);
                  }
                }}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#E8F7F9] dark:bg-[#143943]/80 text-[#1B6E7D] dark:text-[#48CCD6] border border-[#38CAD6]/30 dark:border-[#38CAD6]/30 hover:bg-[#DDF2F5] hover:border-[#38CAD6] transition-all hover:scale-105 cursor-pointer select-none"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Actions: Heart/Vote and 'Tiến tới Ggai' button */}
        <div className="px-5 py-3 border-t border-[#38CAD6]/15 dark:border-[#132F3D] bg-[#E8F7F9]/40 dark:bg-[#091D26]/60 flex items-center justify-between gap-2 relative z-10">
          {/* Heart / Vote Button */}
          <button
            onClick={handleVote}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              justVoted
                ? 'bg-[#38CAD6] text-white shadow-xs'
                : 'bg-[#E0F3F5] dark:bg-[#143943] text-[#1B6E7D] dark:text-[#48CCD6] hover:bg-[#38CAD6]/20'
            }`}
            title="Thả tim bình chọn"
          >
            <Heart className={`w-4 h-4 ${justVoted ? 'fill-current animate-pulse' : 'fill-[#38CAD6]/30 text-[#38CAD6] dark:fill-[#48CCD6]/30 dark:text-[#48CCD6]'}`} />
            <span>{character.votes}</span>
          </button>

          {/* Action Links Container (Supports 1 or 2 links) */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
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
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#38CAD6] to-[#1B6E7D] hover:from-[#48CCD6] hover:to-[#38CAD6] dark:from-[#1B6E7D] dark:to-[#38CAD6] shadow-md shadow-[#1B6E7D]/20 flex items-center gap-1 cursor-pointer transition-transform active:scale-95 font-serif"
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
                className="px-3 py-2 rounded-xl text-xs font-semibold text-[#1B6E7D] dark:text-[#48CCD6] bg-white dark:bg-[#0E232E] hover:bg-[#E8F7F9] dark:hover:bg-[#143943] border border-[#38CAD6]/40 dark:border-[#38CAD6]/30 shadow-xs flex items-center gap-1 cursor-pointer transition-transform active:scale-95 font-serif"
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

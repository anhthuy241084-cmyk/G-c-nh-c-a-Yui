import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Dices, RefreshCw, Heart, Sparkles, ExternalLink, Filter, Tag, Compass, Waves } from 'lucide-react';
import { Character, PRESET_TAGS } from '../types';
import { CharacterCard } from './CharacterCard';
import { playPopSfx, triggerSfx } from '../utils/sfx';

interface RandomCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  onSelectCharacter: (character: Character) => void;
  onVote: (characterId: string) => void;
  onToggleFavorite?: (characterId: string) => void;
  favoriteIds?: string[];
  onSetTodayCharacter?: (character: Character) => void;
  isSfxOn?: boolean;
  sfxVolume?: number;
}

export const RandomCharacterModal: React.FC<RandomCharacterModalProps> = ({
  isOpen,
  onClose,
  characters,
  onSelectCharacter,
  onVote,
  onToggleFavorite,
  favoriteIds = [],
  onSetTodayCharacter,
  isSfxOn = true,
  sfxVolume = 0.5,
}) => {
  const [isRolling, setIsRolling] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');
  const [mascotQuote, setMascotQuote] = useState<string>('Tadaa! ✦');
  const [lastPickedId, setLastPickedId] = useState<string | null>(null);

  const mascotQuotesList = [
    'Tadaa! Dòng hải lưu đã đưa bạn này tới nè ✦',
    'Lần này gặp ai đây ta...? Làn sóng gợi ý nè ♡',
    'Gợi ý ngẫu nhiên từ biển khơi cho bạn nè ✦',
    'Duyên số đưa lối dưới làn nước trong veo ✨',
    'Một sự kết hợp tuyệt vời hôm nay ♡',
  ];

  // Tag options for filtering random pick
  const availableTags = ['all', ...PRESET_TAGS];

  // Perform random roll
  const performRoll = () => {
    if (characters.length === 0) return;

    setIsRolling(true);
    setSelectedCharacter(null);
    if (isSfxOn) triggerSfx('chime', sfxVolume);

    // Filter candidate list
    const candidates = characters.filter((c) => {
      if (selectedTagFilter === 'all') return true;
      return c.tags.some((t) => t.toLowerCase() === selectedTagFilter.toLowerCase());
    });

    setTimeout(() => {
      if (candidates.length === 0) {
        setIsRolling(false);
        return;
      }

      // Avoid immediate repeat if candidate size > 1
      let pool = candidates;
      if (candidates.length > 1 && lastPickedId) {
        const filtered = candidates.filter((c) => c.id !== lastPickedId);
        if (filtered.length > 0) pool = filtered;
      }

      const picked = pool[Math.floor(Math.random() * pool.length)];
      setSelectedCharacter(picked);
      setLastPickedId(picked.id);
      setIsRolling(false);

      if (onSetTodayCharacter) {
        onSetTodayCharacter(picked);
      }

      const quote = mascotQuotesList[Math.floor(Math.random() * mascotQuotesList.length)];
      setMascotQuote(quote);

      if (isSfxOn) playPopSfx(sfxVolume);
    }, 1000);
  };

  useEffect(() => {
    if (isOpen) {
      performRoll();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCandidates = characters.filter((c) => {
    if (selectedTagFilter === 'all') return true;
    return c.tags.some((t) => t.toLowerCase() === selectedTagFilter.toLowerCase());
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030D12]/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white/95 dark:bg-[#0E232E]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-[#38CAD6]/30 dark:border-[#38CAD6]/20 overflow-hidden text-[#14303A] dark:text-[#E4F7F9]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#38CAD6]/15 dark:border-[#132F3D] bg-gradient-to-r from-[#F0F9FB] via-[#E8F5F8] to-[#E0F2F5] dark:from-[#091C24] dark:via-[#0E232E] dark:to-[#132F3D] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#38CAD6] to-[#1B6E7D] text-white flex items-center justify-center shadow-md shadow-[#1B6E7D]/20 text-xl font-serif">
                🎲
              </div>
              <div>
                <h2 className="text-base font-bold font-serif text-[#14303A] dark:text-[#E4F7F9] flex items-center gap-1.5">
                  <span>Hôm nay gặp ai đây?</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#38CAD6]/15 text-[#1B6E7D] dark:text-[#48CCD6] font-medium font-sans">
                    Random Character
                  </span>
                </h2>
                <p className="text-xs text-[#53737C] dark:text-[#88A9B3] font-serif">
                  Để dòng hải lưu đại dương chọn một bạn cho hôm nay nhé ♡
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-[#53737C] hover:text-[#14303A] dark:text-[#88A9B3] dark:hover:text-white rounded-full hover:bg-[#38CAD6]/10 dark:hover:bg-[#132F3D] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tag Filter Selector */}
          <div className="px-5 py-3 border-b border-[#38CAD6]/15 dark:border-[#132F3D] bg-[#F2FBFC]/60 dark:bg-[#07171F]/50 shrink-0 space-y-2">
            <div className="text-[11px] font-bold text-[#1B6E7D] dark:text-[#48CCD6] flex items-center gap-1.5 font-serif">
              <Tag className="w-3.5 h-3.5 text-[#38CAD6]" />
              <span>Chọn chủ đề / Mood ngẫu nhiên:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTagFilter(tag);
                    setIsRolling(true);
                    setTimeout(() => performRoll(), 80);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedTagFilter === tag
                      ? 'bg-gradient-to-r from-[#38CAD6] to-[#1B6E7D] text-white shadow-sm'
                      : 'bg-white/80 dark:bg-[#0B1E26] text-[#53737C] dark:text-[#88A9B3] border border-[#38CAD6]/25 dark:border-[#132F3D] hover:bg-[#E8F7F9] dark:hover:bg-[#132F3D]'
                  }`}
                >
                  {tag === 'all' ? '🎲 Tất cả' : `#${tag}`}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Body: Rolling Animation or Selected Card */}
          <div className="p-5 overflow-y-auto custom-scrollbar flex-1 flex flex-col items-center justify-center min-h-[300px]">
            {isRolling ? (
              /* Rolling Dice Oceanic Animation */
              <div className="py-12 text-center space-y-4">
                <motion.div
                  animate={{ rotate: [0, 90, 180, 270, 360], scale: [1, 1.25, 1] }}
                  transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
                  className="text-6xl inline-block filter drop-shadow-md select-none"
                >
                  🌊
                </motion.div>
                <div className="space-y-1">
                  <p className="text-sm font-bold font-serif text-[#1B6E7D] dark:text-[#48CCD6] animate-pulse">
                    Đang cuộn sóng tìm nhân vật tương thích...
                  </p>
                  <p className="text-xs text-[#53737C] dark:text-[#88A9B3] font-serif">
                    ✦ Dòng hải lưu đang kết nối tâm hồn ✦
                  </p>
                </div>
              </div>
            ) : filteredCandidates.length === 0 ? (
              /* Empty state */
              <div className="py-12 text-center space-y-3">
                <div className="text-5xl">🐚</div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#14303A] dark:text-[#E4F7F9] font-serif">
                    Góc này chưa có nhân vật phù hợp (｡•́︿•̀｡)
                  </h3>
                  <p className="text-xs text-[#53737C] dark:text-[#88A9B3]">
                    Hãy thử chọn chủ đề khác nhé!
                  </p>
                </div>
              </div>
            ) : selectedCharacter ? (
              /* Selected Character Display */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="w-full space-y-3"
              >
                {/* Mascot Banner Dialogue */}
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#E0F3F5]/80 dark:bg-[#0B1E26] border border-[#38CAD6]/30 dark:border-[#38CAD6]/20">
                  <span className="text-3xl shrink-0">🐾</span>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold font-serif text-[#1B6E7D] dark:text-[#48CCD6]">
                      {mascotQuote}
                    </p>
                    <p className="text-[11px] text-[#53737C] dark:text-[#88A9B3]">
                      Hôm nay gợi ý bạn này cho bạn nè ♡
                    </p>
                  </div>
                </div>

                {/* Character Card Render */}
                <CharacterCard
                  character={selectedCharacter}
                  onSelect={() => {
                    onSelectCharacter(selectedCharacter);
                    onClose();
                  }}
                  onVote={onVote}
                  onToggleFavorite={onToggleFavorite}
                  isFavorite={favoriteIds.includes(selectedCharacter.id)}
                />
              </motion.div>
            ) : null}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-[#F2FBFC]/60 dark:bg-[#07171F] border-t border-[#38CAD6]/15 dark:border-[#132F3D] flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={performRoll}
              disabled={isRolling}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#0E232E] hover:bg-[#E8F7F9] dark:hover:bg-[#132F3D] border border-[#38CAD6]/30 text-[#1B6E7D] dark:text-[#48CCD6] font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 font-serif"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRolling ? 'animate-spin' : ''}`} />
              <span>🎲 Thử lại</span>
            </button>

            {selectedCharacter && (
              <button
                onClick={() => {
                  onSelectCharacter(selectedCharacter);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#38CAD6] to-[#1B6E7D] hover:from-[#48CCD6] hover:to-[#38CAD6] text-white font-bold text-xs shadow-md shadow-[#1B6E7D]/20 flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95 cursor-pointer font-serif"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>♡ Xem Character</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

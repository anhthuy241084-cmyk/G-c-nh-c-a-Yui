import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RefreshCw, Heart, Sparkles, ExternalLink, Tag, Compass, History, Trash2 } from 'lucide-react';
import { Character, PRESET_TAGS } from '../types';
import { CharacterCard } from './CharacterCard';
import { triggerSfx } from '../utils/sfx';

interface RandomHistoryItem {
  id: string;
  characterId: string;
  characterName: string;
  characterAvatar: string;
  mode: string;
  timestamp: string;
}

interface RandomCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  onSelectCharacter: (character: Character) => void;
  onVote: (characterId: string) => void;
  onToggleFavorite?: (characterId: string) => void;
  favoriteIds?: string[];
  isSfxOn?: boolean;
  sfxVolume?: number;
}

export type RandomMode = 'character' | 'world' | 'category' | 'memory';

export const RandomCharacterModal: React.FC<RandomCharacterModalProps> = ({
  isOpen,
  onClose,
  characters,
  onSelectCharacter,
  onVote,
  onToggleFavorite,
  favoriteIds = [],
  isSfxOn = true,
  sfxVolume = 0.5,
}) => {
  const [activeMode, setActiveMode] = useState<RandomMode>('character');
  const [selectedCategory, setSelectedCategory] = useState<string>('open world');
  const [isOpeningBox, setIsOpeningBox] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [lastPickedId, setLastPickedId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [saveHistoryEnabled, setSaveHistoryEnabled] = useState(true);

  const [history, setHistory] = useState<RandomHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('yui_snow_random_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const categories = ['BL', 'BG', 'TXVT', 'Showbiz', 'Hiện đại', 'Cổ trang', 'Fantasy', 'Open World'];

  const performRoll = () => {
    if (characters.length === 0) return;

    setIsOpeningBox(true);
    setSelectedCharacter(null);
    if (isSfxOn) triggerSfx('chime', sfxVolume);

    setTimeout(() => {
      let pool = characters.filter((c) => !c.isDraft && !c.isPrivate);

      if (activeMode === 'world') {
        pool = pool.filter((c) => c.tags.some((t) => t.toLowerCase().includes('open world')));
      } else if (activeMode === 'category') {
        const catLow = selectedCategory.toLowerCase();
        pool = pool.filter((c) => c.tags.some((t) => t.toLowerCase().includes(catLow)));
      }

      if (pool.length === 0) {
        setIsOpeningBox(false);
        return;
      }

      // Avoid immediate repeat if pool > 1
      let filteredPool = pool;
      if (pool.length > 1 && lastPickedId) {
        filteredPool = pool.filter((c) => c.id !== lastPickedId);
        if (filteredPool.length === 0) filteredPool = pool;
      }

      const picked = filteredPool[Math.floor(Math.random() * filteredPool.length)];
      setSelectedCharacter(picked);
      setLastPickedId(picked.id);
      setIsOpeningBox(false);

      // Save to history if enabled
      if (saveHistoryEnabled) {
        const newItem: RandomHistoryItem = {
          id: `hist-${Date.now()}`,
          characterId: picked.id,
          characterName: picked.name,
          characterAvatar: picked.avatar,
          mode:
            activeMode === 'character'
              ? 'Gặp một người xa lạ'
              : activeMode === 'world'
              ? 'Lạc vào một thế giới'
              : activeMode === 'category'
              ? `Chủ đề: ${selectedCategory}`
              : 'Ký ức bất chợt',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN'),
        };
        const updated = [newItem, ...history.slice(0, 19)];
        setHistory(updated);
        localStorage.setItem('yui_snow_random_history', JSON.stringify(updated));
      }
    }, 850);
  };

  useEffect(() => {
    if (isOpen) {
      performRoll();
    }
  }, [isOpen, activeMode, selectedCategory]);

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('yui_snow_random_history');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#172536]/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-[#F7FAFD] dark:bg-[#172536] rounded-3xl shadow-2xl border border-[#DCE7EF] dark:border-[#43576B] overflow-hidden text-[#526B80] dark:text-[#E5EDF5]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#DCE7EF] dark:border-[#43576B] bg-gradient-to-r from-white via-[#F7FAFD] to-[#E8F1F8] dark:from-[#202F42] dark:to-[#172536] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#91A9BC] to-[#6E899E] text-white flex items-center justify-center shadow-md text-lg font-serif">
                ❄
              </div>
              <div>
                <h2 className="text-base font-bold font-serif text-[#526B80] dark:text-[#E5EDF5] flex items-center gap-1.5">
                  <span>Snow Random — Hộp Tuyết Ngẫu Nhiên</span>
                  <span className="text-[10px] text-[#91A9BC]">୨୧</span>
                </h2>
                <p className="text-xs text-[#91A9BC] dark:text-[#A9BDCE] font-serif italic">
                  &ldquo;Đôi khi, một cuộc gặp gỡ thú vị lại bắt đầu từ sự tình cờ.&rdquo;
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-[#91A9BC] hover:text-[#526B80] dark:hover:text-white rounded-full hover:bg-[#E8F1F8] dark:hover:bg-[#202F42] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 4 Mode Navigation Tabs */}
          <div className="grid grid-cols-4 gap-1 p-2 bg-[#E8F1F8]/80 dark:bg-[#202F42]/80 border-b border-[#DCE7EF] dark:border-[#43576B] text-[11px] font-serif shrink-0">
            <button
              onClick={() => setActiveMode('character')}
              className={`p-1.5 rounded-xl text-center transition-all cursor-pointer ${
                activeMode === 'character'
                  ? 'bg-white dark:bg-[#172536] font-bold text-[#526B80] dark:text-[#E5EDF5] shadow-xs'
                  : 'text-[#91A9BC] hover:text-[#526B80]'
              }`}
            >
              Người xa lạ
            </button>
            <button
              onClick={() => setActiveMode('world')}
              className={`p-1.5 rounded-xl text-center transition-all cursor-pointer ${
                activeMode === 'world'
                  ? 'bg-white dark:bg-[#172536] font-bold text-[#526B80] dark:text-[#E5EDF5] shadow-xs'
                  : 'text-[#91A9BC] hover:text-[#526B80]'
              }`}
            >
              Một thế giới
            </button>
            <button
              onClick={() => setActiveMode('category')}
              className={`p-1.5 rounded-xl text-center transition-all cursor-pointer ${
                activeMode === 'category'
                  ? 'bg-white dark:bg-[#172536] font-bold text-[#526B80] dark:text-[#E5EDF5] shadow-xs'
                  : 'text-[#91A9BC] hover:text-[#526B80]'
              }`}
            >
              Theo chủ đề
            </button>
            <button
              onClick={() => setActiveMode('memory')}
              className={`p-1.5 rounded-xl text-center transition-all cursor-pointer ${
                activeMode === 'memory'
                  ? 'bg-white dark:bg-[#172536] font-bold text-[#526B80] dark:text-[#E5EDF5] shadow-xs'
                  : 'text-[#91A9BC] hover:text-[#526B80]'
              }`}
            >
              Ký ức
            </button>
          </div>

          {/* Category Selector if in category mode */}
          {activeMode === 'category' && (
            <div className="px-4 py-2.5 bg-white/60 dark:bg-[#172536]/60 border-b border-[#DCE7EF] dark:border-[#43576B] flex items-center gap-1.5 overflow-x-auto text-xs shrink-0 custom-scrollbar">
              <span className="text-[10px] text-[#91A9BC] font-serif shrink-0">Chủ đề:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-serif shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#91A9BC] text-white shadow-xs'
                      : 'bg-[#E8F1F8] dark:bg-[#202F42] text-[#526B80] dark:text-[#E5EDF5]'
                  }`}
                >
                  #{cat}
                </button>
              ))}
            </div>
          )}

          {/* Modal Body: Snow Box Animation or Revealed Card */}
          <div className="p-5 overflow-y-auto custom-scrollbar flex-1 flex flex-col items-center justify-center min-h-[320px]">
            {isOpeningBox ? (
              /* Opening Snow Box Animation */
              <div className="py-12 text-center space-y-4">
                <motion.div
                  animate={{ scale: [0.95, 1.15, 0.98, 1.1, 1], rotate: [0, -5, 5, -2, 0] }}
                  transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
                  className="text-6xl inline-block select-none"
                >
                  🎁
                </motion.div>
                <div className="space-y-1">
                  <p className="text-sm font-bold font-serif text-[#526B80] dark:text-[#E5EDF5] animate-pulse">
                    Đang mở hộp tuyết ký ức...
                  </p>
                  <p className="text-xs text-[#91A9BC] dark:text-[#A9BDCE] font-serif">
                    ✦ Một bông tuyết đang dẫn lối bạn gặp một câu chuyện ✦
                  </p>
                </div>
              </div>
            ) : !selectedCharacter ? (
              /* Empty state */
              <div className="py-12 text-center space-y-2">
                <div className="text-4xl">❄</div>
                <h3 className="text-sm font-bold font-serif text-[#526B80] dark:text-[#E5EDF5]">
                  Chưa có nhân vật phù hợp trong danh mục này.
                </h3>
                <p className="text-xs text-[#91A9BC]">Hãy thử chọn một chủ đề khác nhé!</p>
              </div>
            ) : showHistory ? (
              /* Snow Encounters History View */
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between border-b border-[#DCE7EF] dark:border-[#43576B] pb-2 text-xs font-serif">
                  <span className="font-bold">Snow Encounters — Những cuộc gặp gỡ</span>
                  <button
                    onClick={handleClearHistory}
                    className="text-[10px] text-red-400 hover:text-red-500 underline cursor-pointer"
                  >
                    Xóa lịch sử
                  </button>
                </div>
                {history.length === 0 ? (
                  <p className="text-xs text-center text-[#91A9BC] py-6">Lịch sử trống.</p>
                ) : (
                  <div className="space-y-2 max-h-[260px] overflow-y-auto custom-scrollbar">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          const char = characters.find((c) => c.id === item.characterId);
                          if (char) {
                            onSelectCharacter(char);
                            onClose();
                          }
                        }}
                        className="p-2.5 rounded-xl bg-white dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] flex items-center justify-between text-xs cursor-pointer hover:border-[#91A9BC]"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <img src={item.characterAvatar} alt={item.characterName} className="w-8 h-8 rounded-lg object-cover" />
                          <div className="truncate">
                            <p className="font-bold truncate">{item.characterName}</p>
                            <p className="text-[10px] text-[#91A9BC]">{item.mode}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-[#91A9BC] shrink-0">{item.timestamp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Revealed Character Card */
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full space-y-3"
              >
                {/* Mode intro quote */}
                <div className="p-3 rounded-2xl bg-[#E8F1F8] dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] flex items-center gap-2.5 text-xs">
                  <span className="text-xl">❄</span>
                  <div className="leading-tight">
                    <p className="font-serif font-bold text-[#526B80] dark:text-[#E5EDF5]">
                      {activeMode === 'world'
                        ? 'Khám phá thế giới mở'
                        : activeMode === 'memory'
                        ? 'Một ký ức bất chợt'
                        : 'Hôm nay chiếc hộp tuyết gọi tên bạn này nè ♡'}
                    </p>
                    <p className="text-[11px] text-[#91A9BC] dark:text-[#A9BDCE] italic font-serif">
                      {selectedCharacter.title}
                    </p>
                  </div>
                </div>

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
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-4 bg-white/70 dark:bg-[#172536] border-t border-[#DCE7EF] dark:border-[#43576B] flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={performRoll}
                disabled={isOpeningBox}
                className="px-3.5 py-1.5 rounded-xl text-xs font-serif font-semibold border border-[#DCE7EF] dark:border-[#43576B] bg-white dark:bg-[#202F42] hover:bg-[#E8F1F8] text-[#526B80] dark:text-[#E5EDF5] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isOpeningBox ? 'animate-spin' : ''}`} />
                <span>Bốc thêm lần nữa</span>
              </button>

              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`p-1.5 rounded-xl border border-[#DCE7EF] dark:border-[#43576B] cursor-pointer text-xs ${
                  showHistory ? 'bg-[#91A9BC] text-white' : 'text-[#91A9BC] hover:bg-[#E8F1F8]'
                }`}
                title="Xem lịch sử bốc ngẫu nhiên"
              >
                <History className="w-4 h-4" />
              </button>
            </div>

            {selectedCharacter && !showHistory && (
              <button
                onClick={() => {
                  onSelectCharacter(selectedCharacter);
                  onClose();
                }}
                className="px-4 py-1.5 rounded-xl btn-winter-primary text-xs font-serif font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Ghé thăm hồ sơ</span>
                <span className="text-xs">→</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

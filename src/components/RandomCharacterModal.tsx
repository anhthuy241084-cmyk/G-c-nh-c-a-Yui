import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  RefreshCw,
  Heart,
  Sparkles,
  History,
  Volume2,
  VolumeX,
  Snowflake,
  Shuffle,
  Layers,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { Character } from '../types';
import { playRouletteTickSfx, playRandomRevealSfx, playCardFlipSfx } from '../utils/sfx';
import { triggerHeartConfetti } from '../utils/confetti';

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
export type RandomStyle = 'roulette' | 'mystery_cards';

export const RandomCharacterModal: React.FC<RandomCharacterModalProps> = ({
  isOpen,
  onClose,
  characters,
  onSelectCharacter,
  onVote,
  isSfxOn = true,
  sfxVolume = 0.5,
}) => {
  const [activeMode, setActiveMode] = useState<RandomMode>('character');
  const [playStyle, setPlayStyle] = useState<RandomStyle>('roulette');
  const [selectedCategory, setSelectedCategory] = useState<string>('open world');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(isSfxOn);

  const [isRolling, setIsRolling] = useState(false);
  const [hopIndex, setHopIndex] = useState(0);
  const [hopTrail, setHopTrail] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [lastPickedId, setLastPickedId] = useState<string | null>(null);

  // Mystery 3-card state
  const [mysteryDeck, setMysteryDeck] = useState<Character[]>([]);
  const [pickedCardIdx, setPickedCardIdx] = useState<number | null>(null);

  const [showHistory, setShowHistory] = useState(false);
  const [justVoted, setJustVoted] = useState(false);

  const rollTimerRef = useRef<number | null>(null);

  const [history, setHistory] = useState<RandomHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('yui_snow_random_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const categories = ['BL', 'BG', 'TXVT', 'Showbiz', 'Hiện đại', 'Cổ trang', 'Fantasy', 'Open World'];

  useEffect(() => {
    setSoundEnabled(isSfxOn);
  }, [isSfxOn]);

  const clearRollTimer = () => {
    if (rollTimerRef.current !== null) {
      window.clearTimeout(rollTimerRef.current);
      rollTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearRollTimer();
  }, []);

  const currentPool = useMemo(() => {
    let pool = characters.filter((c) => !c.isDraft && !c.isPrivate);
    if (activeMode === 'world') {
      pool = pool.filter((c) => c.tags.some((t) => t.toLowerCase().includes('open world')));
    } else if (activeMode === 'category') {
      const catLow = selectedCategory.toLowerCase();
      pool = pool.filter((c) => c.tags.some((t) => t.toLowerCase().includes(catLow)));
    }
    return pool;
  }, [characters, activeMode, selectedCategory]);

  const recordHistory = (picked: Character) => {
    const newItem: RandomHistoryItem = {
      id: `hist-${Date.now()}`,
      characterId: picked.id,
      characterName: picked.name,
      characterAvatar: picked.avatar,
      mode:
        activeMode === 'character'
          ? 'Ngẫu nhiên toàn bộ'
          : activeMode === 'world'
          ? 'Open World'
          : activeMode === 'category'
          ? `Chủ đề: ${selectedCategory}`
          : 'Ký ức bất chợt',
      timestamp:
        new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
        ' ' +
        new Date().toLocaleDateString('vi-VN'),
    };
    setHistory((prev) => {
      const updated = [newItem, ...prev.slice(0, 19)];
      try {
        localStorage.setItem('yui_snow_random_history', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const dealMysteryDeck = () => {
    clearRollTimer();
    setIsRolling(false);
    setSelectedCharacter(null);
    setPickedCardIdx(null);
    setJustVoted(false);

    if (currentPool.length === 0) {
      setMysteryDeck([]);
      return;
    }

    const shuffled = [...currentPool].sort(() => Math.random() - 0.5);
    const cards: Character[] = [0, 1, 2].map((i) => shuffled[i % shuffled.length]);
    setMysteryDeck(cards);
    if (soundEnabled) {
      playCardFlipSfx(sfxVolume * 0.8);
    }
  };

  const performRouletteRoll = () => {
    clearRollTimer();
    setShowHistory(false);
    setJustVoted(false);

    if (currentPool.length === 0) {
      setSelectedCharacter(null);
      setIsRolling(false);
      return;
    }

    if (playStyle === 'mystery_cards') {
      dealMysteryDeck();
      return;
    }

    // Choose final winner avoiding immediate repeat if possible
    let winnerPool = currentPool;
    if (currentPool.length > 1 && lastPickedId) {
      const filtered = currentPool.filter((c) => c.id !== lastPickedId);
      if (filtered.length > 0) winnerPool = filtered;
    }
    const winner = winnerPool[Math.floor(Math.random() * winnerPool.length)];

    // Build kinetic trail of hopping cards ending on winner
    const totalSteps = currentPool.length === 1 ? 6 : 16;
    const trail: Character[] = [];
    for (let i = 0; i < totalSteps - 1; i++) {
      let candidate = currentPool[Math.floor(Math.random() * currentPool.length)];
      if (currentPool.length > 1 && i > 0 && candidate.id === trail[i - 1].id) {
        const others = currentPool.filter((c) => c.id !== trail[i - 1].id);
        candidate = others[Math.floor(Math.random() * others.length)] || candidate;
      }
      trail.push(candidate);
    }
    trail.push(winner);

    setHopTrail(trail);
    setHopIndex(0);
    setSelectedCharacter(null);
    setIsRolling(true);

    const runStep = (step: number) => {
      setHopIndex(step);
      if (soundEnabled) {
        playRouletteTickSfx(step, totalSteps, sfxVolume);
      }

      if (step >= totalSteps - 1) {
        // Reveal lock-in!
        rollTimerRef.current = window.setTimeout(() => {
          setIsRolling(false);
          setSelectedCharacter(winner);
          setLastPickedId(winner.id);
          recordHistory(winner);
          if (soundEnabled) {
            playRandomRevealSfx(sfxVolume);
          }
          triggerHeartConfetti(0.5, 0.45);
        }, 280);
        return;
      }

      // Smooth deceleration curve: rapid 68ms hops easing to 240ms
      const progress = step / (totalSteps - 1);
      const delay = Math.round(68 + Math.pow(progress, 2.2) * 185);
      rollTimerRef.current = window.setTimeout(() => runStep(step + 1), delay);
    };

    runStep(0);
  };

  useEffect(() => {
    if (isOpen) {
      performRouletteRoll();
    } else {
      clearRollTimer();
      setIsRolling(false);
    }
  }, [isOpen, activeMode, selectedCategory, playStyle]);

  const handlePickMysteryCard = (idx: number) => {
    if (pickedCardIdx !== null || !mysteryDeck[idx]) return;
    const chosen = mysteryDeck[idx];
    setPickedCardIdx(idx);
    if (soundEnabled) {
      playCardFlipSfx(sfxVolume);
    }
    rollTimerRef.current = window.setTimeout(() => {
      setSelectedCharacter(chosen);
      setLastPickedId(chosen.id);
      recordHistory(chosen);
      if (soundEnabled) {
        playRandomRevealSfx(sfxVolume);
      }
      triggerHeartConfetti(0.5, 0.45);
    }, 420);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('yui_snow_random_history');
  };

  if (!isOpen) return null;

  const activeHopChar = hopTrail[hopIndex] || currentPool[0];
  const prevHopChar = hopTrail[Math.max(0, hopIndex - 1)] || activeHopChar;
  const nextHopChar = hopTrail[Math.min(hopTrail.length - 1, hopIndex + 1)] || activeHopChar;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-[#121F32]/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-2xl max-h-[92dvh] flex flex-col bg-[#F5F9FE] dark:bg-[#172538] rounded-2xl sm:rounded-[30px] shadow-2xl border border-[#D4E4F2] dark:border-[#39506B] overflow-hidden text-[#334A60] dark:text-[#E5EFF9]"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#DCE9F5] dark:border-[#334963] bg-gradient-to-r from-white via-[#F6FAFE] to-[#EAF3FC] dark:from-[#203046] dark:to-[#172538] shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#6392BE] to-[#436D96] text-white flex items-center justify-center shadow-md shadow-[#436D96]/25 shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-lg font-bold font-serif text-[#16273B] dark:text-[#F8FBFF] truncate">
                  Snow Random — Gặp Gỡ Định Mệnh
                </h2>
                <p className="text-[11px] text-[#5E7C99] dark:text-[#A4C0DA] font-serif italic truncate">
                  &ldquo;Thẻ nhảy nhịp nhàng, xem hôm nay tuyết đưa bạn đến bên ai nhé.&rdquo;
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-full border transition-colors cursor-pointer ${
                  soundEnabled
                    ? 'bg-[#EAF3FC] dark:bg-[#22354D] text-[#3F6B96] dark:text-[#A8CDF0] border-[#CFE1F2] dark:border-[#3B5470]'
                    : 'bg-white/60 dark:bg-[#142233] text-[#8AA4BD] border-[#DCE9F5] dark:border-[#334963]'
                }`}
                title={soundEnabled ? 'Tắt âm thanh quay số' : 'Bật âm thanh quay số'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="p-2 text-[#64829E] hover:text-[#16273B] dark:hover:text-white rounded-full hover:bg-[#EAF3FC] dark:hover:bg-[#243750] transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Style Switcher + Pool Filter Bar */}
          <div className="px-4 sm:px-6 py-2.5 bg-[#EDF5FD]/80 dark:bg-[#1C2C41]/90 border-b border-[#DCE9F5] dark:border-[#334963] space-y-2 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Play Style Toggle: Card Hop Roulette vs 3 Mystery Cards */}
              <div className="flex items-center gap-1 bg-white/85 dark:bg-[#142233] p-1 rounded-xl border border-[#D4E4F2] dark:border-[#39506B] text-xs font-serif">
                <button
                  onClick={() => setPlayStyle('roulette')}
                  className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    playStyle === 'roulette'
                      ? 'bg-gradient-to-r from-[#5D8AB5] to-[#436D96] text-white font-semibold shadow-xs'
                      : 'text-[#5E7C99] dark:text-[#A4C0DA] hover:text-[#16273B]'
                  }`}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Thẻ nhảy liên hoàn</span>
                </button>
                <button
                  onClick={() => setPlayStyle('mystery_cards')}
                  className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    playStyle === 'mystery_cards'
                      ? 'bg-gradient-to-r from-[#5D8AB5] to-[#436D96] text-white font-semibold shadow-xs'
                      : 'text-[#5E7C99] dark:text-[#A4C0DA] hover:text-[#16273B]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Lật 3 lá bí ẩn</span>
                </button>
              </div>

              {/* 4 Mode Filter Pills */}
              <div className="flex items-center gap-1 text-[11px] font-serif">
                {(
                  [
                    { id: 'character', label: 'Tất cả' },
                    { id: 'world', label: 'Open World' },
                    { id: 'category', label: 'Chủ đề' },
                    { id: 'memory', label: 'Ký ức' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setActiveMode(m.id)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      activeMode === m.id
                        ? 'bg-white dark:bg-[#243750] text-[#16273B] dark:text-white font-bold shadow-xs border border-[#CFE1F2] dark:border-[#496485]'
                        : 'text-[#64829E] dark:text-[#9AB7D4] hover:text-[#16273B]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {activeMode === 'category' && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs custom-scrollbar">
                <span className="text-[11px] text-[#64829E] font-serif shrink-0">Chủ đề:</span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-serif shrink-0 cursor-pointer transition-colors ${
                      selectedCategory === cat
                        ? 'bg-[#4E7AA5] text-white shadow-xs'
                        : 'bg-white dark:bg-[#142233] text-[#4B6884] dark:text-[#B9D3EC] border border-[#D4E4F2] dark:border-[#39506B]'
                    }`}
                  >
                    #{cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Stage */}
          <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col items-center justify-center min-h-[360px]">
            {showHistory ? (
              /* History Drawer */
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between border-b border-[#DCE9F5] dark:border-[#334963] pb-2 text-xs font-serif">
                  <span className="font-bold">Những cuộc gặp gỡ gần đây</span>
                  {history.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                    >
                      Xóa lịch sử
                    </button>
                  )}
                </div>
                {history.length === 0 ? (
                  <p className="text-xs text-center text-[#7393B3] py-10 font-serif">Chưa có lịch sử quay số.</p>
                ) : (
                  <div className="space-y-2 max-h-[290px] overflow-y-auto custom-scrollbar pr-1">
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
                        className="p-2.5 rounded-2xl bg-white dark:bg-[#1E2F44] border border-[#DCE9F5] dark:border-[#344B66] flex items-center justify-between text-xs cursor-pointer hover:border-[#6A97C2] transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.characterAvatar}
                            alt={item.characterName}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-xl object-cover object-[center_20%]"
                          />
                          <div className="min-w-0">
                            <p className="font-bold font-serif truncate text-[#16273B] dark:text-white">
                              {item.characterName}
                            </p>
                            <p className="text-[10px] text-[#64829E] dark:text-[#A4C0DA]">{item.mode}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-[#7393B3] shrink-0">{item.timestamp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : currentPool.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Snowflake className="w-9 h-9 mx-auto text-[#7CA7CF]" />
                <h3 className="text-sm font-bold font-serif text-[#16273B] dark:text-[#F8FBFF]">
                  Chưa có nhân vật phù hợp trong mục này.
                </h3>
                <p className="text-xs text-[#64829E]">Hãy thử chuyển sang mục Tất cả hoặc chủ đề khác nhé!</p>
              </div>
            ) : isRolling && activeHopChar ? (
              /* MODE 1 SPINNING: Kinetic Hopping Cards Carousel */
              <div className="w-full flex flex-col items-center justify-center py-4 space-y-6 select-none">
                <div className="relative flex items-center justify-center gap-3 sm:gap-5 w-full max-w-lg py-3">
                  {/* Left Blurred Ghost Card */}
                  <div className="hidden sm:flex w-32 h-44 rounded-2xl overflow-hidden border border-[#CFE1F2] dark:border-[#3B5470] bg-white/75 dark:bg-[#1D2D42]/80 opacity-45 scale-90 -rotate-6 flex-col shrink-0 transition-transform">
                    <img
                      src={prevHopChar.avatar}
                      alt={prevHopChar.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-32 object-cover object-[center_20%]"
                    />
                    <div className="p-2 text-center text-[11px] font-serif font-bold truncate">
                      {prevHopChar.name}
                    </div>
                  </div>

                  {/* Active Hopping Center Card ("card nhảy liên tục") */}
                  <motion.div
                    key={`${hopIndex}-${activeHopChar.id}`}
                    initial={{ y: 18, scale: 0.88, rotate: hopIndex % 2 === 0 ? -4 : 4 }}
                    animate={{ y: -8, scale: 1.06, rotate: 0 }}
                    transition={{ duration: 0.14, ease: 'easeOut' }}
                    className="relative z-10 w-48 sm:w-56 h-68 rounded-[24px] overflow-hidden border-2 border-[#7EB0DE] dark:border-[#92C0EA] bg-white dark:bg-[#1B2B3F] shadow-[0_18px_40px_-8px_rgba(40,68,96,0.35)] flex flex-col shrink-0"
                  >
                    <div className="p-2 pb-0 flex-1 min-h-0">
                      <div className="w-full h-full rounded-[16px] overflow-hidden bg-[#E9F2FB] dark:bg-[#23354C]">
                        <img
                          src={activeHopChar.avatar}
                          alt={activeHopChar.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    </div>
                    <div className="px-4 py-3 text-center">
                      <h4 className="text-base font-bold font-display text-[#203850] dark:text-white truncate">
                        {activeHopChar.name}
                      </h4>
                      <p className="text-[11px] text-[#5E7C99] dark:text-[#A4C0DA] truncate font-serif">
                        {activeHopChar.title}
                      </p>
                    </div>
                  </motion.div>

                  {/* Right Blurred Ghost Card */}
                  <div className="hidden sm:flex w-32 h-44 rounded-2xl overflow-hidden border border-[#CFE1F2] dark:border-[#3B5470] bg-white/75 dark:bg-[#1D2D42]/80 opacity-45 scale-90 rotate-6 flex-col shrink-0 transition-transform">
                    <img
                      src={nextHopChar.avatar}
                      alt={nextHopChar.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-32 object-cover object-top"
                    />
                    <div className="p-2 text-center text-[11px] font-serif font-bold truncate">
                      {nextHopChar.name}
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <p className="text-sm font-bold font-serif text-[#365D85] dark:text-[#B9DBFA]">
                    Các lá bài ký ức đang nhảy múa...
                  </p>
                  <p className="text-[11px] text-[#64829E] dark:text-[#A4C0DA] font-serif">
                    Chờ một nhịp xem định mệnh gọi tên ai nhé
                  </p>
                </div>
              </div>
            ) : playStyle === 'mystery_cards' && !selectedCharacter ? (
              /* MODE 2: Pick 1 of 3 Mystery Winter Cards */
              <div className="w-full space-y-5 text-center">
                <div className="space-y-1">
                  <h3 className="text-base font-bold font-display text-[#203850] dark:text-[#F8FBFF]">
                    Chọn 1 trong 3 lá bài tuyết bí ẩn
                  </h3>
                  <p className="text-xs text-[#5E7C99] dark:text-[#A4C0DA] font-serif">
                    Mỗi lá bài giấu một nhân vật khác nhau — chạm để lật mở nhé
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-5 max-w-lg mx-auto py-2">
                  {mysteryDeck.map((cardChar, idx) => {
                    const isPicked = pickedCardIdx === idx;
                    const roman = idx === 0 ? 'I' : idx === 1 ? 'II' : 'III';
                    return (
                      <motion.button
                        key={`${cardChar.id}-${idx}`}
                        type="button"
                        onClick={() => handlePickMysteryCard(idx)}
                        whileHover={{ y: -8, scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        animate={
                          isPicked
                            ? { rotateY: 180, scale: 1.08 }
                            : pickedCardIdx !== null
                            ? { opacity: 0.45, scale: 0.94 }
                            : { rotateY: 0, opacity: 1 }
                        }
                        transition={{ duration: 0.42, ease: 'easeOut' }}
                        className="relative aspect-[3/4.2] rounded-[22px] bg-[#EFF6FD] dark:bg-[#1E2E44] border-2 border-[#B3CEE8] dark:border-[#4C6A8C] shadow-lg hover:shadow-xl hover:border-[#5380AD] flex flex-col items-center justify-center gap-3 p-3 cursor-pointer select-none overflow-hidden"
                      >
                        <div className="absolute inset-2 rounded-2xl border border-dashed border-[#8DB5DA]/75 dark:border-[#5D80A6]/60 pointer-events-none" />
                        <div className="w-11 h-11 rounded-full bg-white dark:bg-[#172538] border border-[#C6DCF0] dark:border-[#496485] flex items-center justify-center shadow-xs">
                          <Snowflake className="w-5 h-5 text-[#5380AD] dark:text-[#A8CDF0]" />
                        </div>
                        <span className="font-display text-xl font-bold text-[#2F557B] dark:text-[#E5EFF9]">
                          {roman}
                        </span>
                        <span className="text-[10px] font-serif text-[#64829E] dark:text-[#9AB7D4]">
                          Chạm để lật
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ) : selectedCharacter ? (
              /* REVEALED KEEPSAKE CARD — Unobstructed Artwork + Clean Below Info */
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                className="w-full max-w-md space-y-4"
              >
                <div className="rounded-[26px] overflow-hidden bg-white dark:bg-[#1C2B3F] border border-[#CFE1F2] dark:border-[#3D5673] shadow-xl">
                  <div className="p-3 pb-0">
                    <div className="w-full aspect-[4/4.2] rounded-[18px] overflow-hidden bg-[#EAF3FC] dark:bg-[#142233] border border-[#DCE9F5] dark:border-[#2E4259]">
                      <img
                        src={selectedCharacter.avatar}
                        alt={selectedCharacter.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3.5 space-y-3">
                    <div className="space-y-1">
                      <p className="text-[11px] font-serif text-[#5380AD] dark:text-[#9AC0E3] font-semibold">
                        ✦ Hôm nay tuyết gọi tên ✦
                      </p>
                      <h3 className="text-2xl font-bold font-display text-[#203850] dark:text-white truncate">
                        {selectedCharacter.name}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-[#435B73] dark:text-[#D5E4F3] leading-relaxed line-clamp-3 font-sans">
                      {selectedCharacter.title}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          onVote(selectedCharacter.id);
                          setJustVoted(true);
                          setTimeout(() => setJustVoted(false), 1200);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-serif font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                          justVoted
                            ? 'bg-rose-500 text-white'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 hover:bg-rose-100'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        <span>Thả tim ({selectedCharacter.votes || 0})</span>
                      </button>

                      <button
                        onClick={() => {
                          onSelectCharacter(selectedCharacter);
                          onClose();
                        }}
                        className="flex-1 px-4 py-2 rounded-xl text-xs font-serif font-bold text-white bg-[#5380AD] hover:bg-[#44709D] shadow-sm inline-flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-colors"
                      >
                        <span>Ghé thăm hồ sơ</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {selectedCharacter.chatUrl && (
                        <button
                          onClick={() => window.open(selectedCharacter.chatUrl, '_blank')}
                          className="px-3 py-2 rounded-xl text-xs font-serif font-semibold bg-[#EAF3FC] dark:bg-[#243750] text-[#365D85] dark:text-[#D5E4F3] hover:bg-[#DCEBFA] transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title="Mở link nhân vật"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </div>

          {/* Footer Controls */}
          <div className="px-5 py-3.5 bg-white/85 dark:bg-[#1B2B40] border-t border-[#DCE9F5] dark:border-[#334963] flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={performRouletteRoll}
                disabled={isRolling || currentPool.length === 0}
                className="px-4 py-2 rounded-xl text-xs font-serif font-bold text-white bg-gradient-to-r from-[#5D8AB5] to-[#436D96] hover:brightness-105 shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRolling ? 'animate-spin' : ''}`} />
                <span>
                  {isRolling
                    ? 'Đang nhảy thẻ...'
                    : playStyle === 'mystery_cards'
                    ? 'Chia 3 lá mới'
                    : 'Quay lại lần nữa'}
                </span>
              </button>

              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 rounded-xl border border-[#D4E4F2] dark:border-[#39506B] cursor-pointer text-xs transition-colors ${
                  showHistory
                    ? 'bg-[#4E7AA5] text-white'
                    : 'bg-white dark:bg-[#142233] text-[#5E7C99] dark:text-[#A4C0DA] hover:bg-[#EAF3FC]'
                }`}
                title="Xem lịch sử gặp gỡ"
              >
                <History className="w-4 h-4" />
              </button>
            </div>

            {selectedCharacter && !showHistory && (
              <span className="text-[11px] font-serif text-[#64829E] dark:text-[#A4C0DA] hidden sm:inline">
                Kho có {currentPool.length} nhân vật
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

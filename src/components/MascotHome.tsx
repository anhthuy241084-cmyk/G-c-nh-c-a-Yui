import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Shirt, Eye, Moon, Sun, Heart, Flame, Music } from 'lucide-react';
import {
  MascotSettings,
  MascotMood,
  MascotSpot,
  MascotAccessoryId,
  ThemeMode,
} from '../types';
import { MascotCharacter } from './MascotCharacter';
import { playSparkleSfx, playChimeSfx, playWindChimeSfx } from '../utils/sfx';

interface MascotHomeProps {
  settings: MascotSettings;
  onUpdateSettings: (newSettings: Partial<MascotSettings>) => void;
  onOpenWardrobe: () => void;
  theme: ThemeMode;
  searchTerm?: string;
  isSearching?: boolean;
  isEmptyResult?: boolean;
  isAudioPlaying?: boolean;
  onToast?: (msg: string) => void;
  onTriggerEasterEgg?: (x: number, y: number) => void;
}

export const MascotHome: React.FC<MascotHomeProps> = ({
  settings,
  onUpdateSettings,
  onOpenWardrobe,
  theme,
  searchTerm = '',
  isSearching = false,
  isEmptyResult = false,
  isAudioPlaying = false,
  onToast,
  onTriggerEasterEgg,
}) => {
  // Current active mood
  const [mood, setMood] = useState<MascotMood>('normal');
  const [activeSpot, setActiveSpot] = useState<MascotSpot>(settings.currentSpot || 'window');

  // Object interactions states
  const [isLampOn, setIsLampOn] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [isPlantRustling, setIsPlantRustling] = useState(false);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);

  // Consecutive click counter for Easter Eggs
  const [clickCount, setClickCount] = useState(0);
  const clickResetTimerRef = useRef<any>(null);

  // AFK Detection
  const [isAfk, setIsAfk] = useState(false);
  const afkTimerRef = useRef<any>(null);

  // Hide and Seek State
  const [isHiding, setIsHiding] = useState(false);
  const [hideSpot, setHideSpot] = useState<'books' | 'window' | 'plant' | 'chimes' | 'board'>('books');
  const [foundCelebration, setFoundCelebration] = useState(false);

  // Sync with prop spot
  useEffect(() => {
    setActiveSpot(settings.currentSpot || 'window');
  }, [settings.currentSpot]);

  // AFK Timer Setup (40s idle -> sleep)
  const resetAfkTimer = useCallback(() => {
    if (isAfk) {
      setIsAfk(false);
      // Wake up with brief surprise
      setMood('happy');
      setTimeout(() => setMood('normal'), 1800);
    }

    if (afkTimerRef.current) clearTimeout(afkTimerRef.current);
    afkTimerRef.current = setTimeout(() => {
      setIsAfk(true);
    }, 40000);
  }, [isAfk]);

  useEffect(() => {
    window.addEventListener('mousemove', resetAfkTimer);
    window.addEventListener('keydown', resetAfkTimer);
    window.addEventListener('touchstart', resetAfkTimer);

    afkTimerRef.current = setTimeout(() => {
      setIsAfk(true);
    }, 40000);

    return () => {
      window.removeEventListener('mousemove', resetAfkTimer);
      window.removeEventListener('keydown', resetAfkTimer);
      window.removeEventListener('touchstart', resetAfkTimer);
      if (afkTimerRef.current) clearTimeout(afkTimerRef.current);
    };
  }, [resetAfkTimer]);

  // Update mood based on global context (Searching, Empty, Night, AFK, etc.)
  useEffect(() => {
    if (isHiding) {
      setMood('peeking');
      return;
    }

    if (isAfk) {
      setMood('sleeping');
      return;
    }

    if (searchTerm.trim().length > 0) {
      if (isEmptyResult) {
        setMood('empty');
      } else {
        setMood('searching');
      }
      return;
    }

    if (theme === 'dark') {
      setMood('night');
      return;
    }

    if (isBookOpen) {
      setMood('reading');
      return;
    }

    if (isLampOn || isWindowOpen || isPlantRustling) {
      setMood('happy');
      return;
    }

    setMood('normal');
  }, [isAfk, searchTerm, isEmptyResult, theme, isBookOpen, isLampOn, isWindowOpen, isPlantRustling, isHiding]);

  // Handle Free Roam & Random Spot Shifting (if in 'free' mode)
  useEffect(() => {
    if (settings.displayMode !== 'free') return;

    const shiftInterval = setInterval(() => {
      if (isAfk || isHiding) return;
      const spots: MascotSpot[] = ['window', 'books', 'table', 'plant'];
      const randomSpot = spots[Math.floor(Math.random() * spots.length)];
      setActiveSpot(randomSpot);

      // 20% chance to start hide and seek spontaneously
      if (Math.random() < 0.2) {
        startHideAndSeek();
      }
    }, 35000);

    return () => clearInterval(shiftInterval);
  }, [settings.displayMode, isAfk, isHiding]);

  // Start Hide & Seek
  const startHideAndSeek = () => {
    const hidingSpots: Array<'books' | 'window' | 'plant' | 'chimes' | 'board'> = [
      'books',
      'window',
      'plant',
      'chimes',
      'board',
    ];
    const target = hidingSpots[Math.floor(Math.random() * hidingSpots.length)];
    setHideSpot(target);
    setIsHiding(true);
    if (onToast) {
      onToast('Bé đang trốn ở đâu đó quanh đây nè... Bạn tìm thử xem! 🐾');
    }
  };

  // Found in Hide and Seek
  const handleFoundMascot = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHiding(false);
    setFoundCelebration(true);
    playSparkleSfx(0.6);

    const newFoundCount = (settings.foundCount || 0) + 1;
    const newUnlocked = [...(settings.unlockedAccessories || [])];

    // Milestone: Unlock Cat Ears at 3 founds
    if (newFoundCount >= 3 && !newUnlocked.includes('cat_ears')) {
      newUnlocked.push('cat_ears');
      if (onToast) {
        onToast('🐾 Đã tìm thấy bé 3 lần! Mở khóa phụ kiện: Tai mèo tinh nghịch 🐱');
      }
    } else {
      if (onToast) {
        onToast(`Tìm thấy bé rồi nè! (｡･ω･｡)ﾉ♡ (Đã tìm ${newFoundCount} lần)`);
      }
    }

    onUpdateSettings({
      foundCount: newFoundCount,
      unlockedAccessories: newUnlocked,
    });

    if (onTriggerEasterEgg) {
      onTriggerEasterEgg(e.clientX, e.clientY);
    }

    setTimeout(() => {
      setFoundCelebration(false);
    }, 2800);
  };

  // Mascot Click Interactions & Easter Egg Ladder
  const handleMascotClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Reset AFK if clicked
    resetAfkTimer();

    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (clickResetTimerRef.current) clearTimeout(clickResetTimerRef.current);
    clickResetTimerRef.current = setTimeout(() => {
      setClickCount(0);
    }, 4500);

    playChimeSfx(0.4);

    if (nextCount === 1) {
      setMood('happy');
      setSpeechBubble('(⌒‿⌒) ♡');
      setTimeout(() => setSpeechBubble(null), 2000);
    } else if (nextCount === 3) {
      setMood('cheering');
      setSpeechBubble('(｡･ω･｡)ﾉ♡');
      setTimeout(() => setSpeechBubble(null), 2500);
      if (onToast) onToast('Bé vẫy tay chào bạn nè 🎀');
    } else if (nextCount === 5) {
      setMood('reading');
      setSpeechBubble('(⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄) ♡');
      setTimeout(() => setSpeechBubble(null), 2500);
      if (onToast) onToast('Bé ngượng ngùng lấy sách che mặt rồi...');
    } else if (nextCount >= 7) {
      setClickCount(0);
      setMood('cheering');
      setSpeechBubble('( ˘ ³˘)♥ ✦ ˚ ♡');
      setTimeout(() => setSpeechBubble(null), 3000);

      // Unlock Angel Wings accessory!
      const newUnlocked = [...(settings.unlockedAccessories || [])];
      if (!newUnlocked.includes('angel_wings')) {
        newUnlocked.push('angel_wings');
        onUpdateSettings({ unlockedAccessories: newUnlocked });
        if (onToast) {
          onToast('✨ Tuyệt vời! Bạn đã mở khóa: Đôi cánh thiên thần 🪽');
        }
      }

      if (onTriggerEasterEgg) {
        onTriggerEasterEgg(e.clientX, e.clientY);
      }
    }
  };

  // Item Click handlers
  const handleToggleLamp = () => {
    setIsLampOn((prev) => !prev);
    playChimeSfx(0.3);
    setSpeechBubble(isLampOn ? 'Tắt đèn êm ái...' : 'Ánh đèn ấm áp quá 💡');
    setTimeout(() => setSpeechBubble(null), 2200);
  };

  const handleToggleBook = () => {
    setIsBookOpen((prev) => !prev);
    playSparkleSfx(0.4);
    setSpeechBubble(isBookOpen ? 'Gấp sách lại...' : 'Cùng đọc truyện nhé 📖');
    setTimeout(() => setSpeechBubble(null), 2200);
  };

  const handleToggleWindow = () => {
    setIsWindowOpen((prev) => !prev);
    playWindChimeSfx(0.4);
    setSpeechBubble(isWindowOpen ? 'Đóng cửa sổ 🪟' : 'Gió mát thổi qua... 🍃');
    setTimeout(() => setSpeechBubble(null), 2200);
  };

  const handleTouchPlant = () => {
    setIsPlantRustling(true);
    playChimeSfx(0.3);
    setSpeechBubble('Chạm nhẹ một chiếc lá xanh 🌱');
    setTimeout(() => {
      setIsPlantRustling(false);
      setSpeechBubble(null);
    }, 2200);
  };

  // If in 'quiet' mode and not interacted/hiding, render minimal
  if (settings.displayMode === 'quiet' && !isHiding) {
    return (
      <div className="flex justify-end my-2">
        <button
          onClick={onOpenWardrobe}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3FAAB7]/10 hover:bg-[#3FAAB7]/20 text-[#247C8C] dark:text-[#78DCE0] text-xs font-semibold transition-colors cursor-pointer border border-[#65C5CE]/30"
          title="Mở Tủ đồ & Cài đặt Bé nhỏ"
        >
          <MascotCharacter mood="normal" accessory={settings.currentAccessory} size="sm" />
          <span>✦ Bé nhỏ đại dương</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative my-4 select-none">
      {/* Found celebration overlay */}
      <AnimatePresence>
        {foundCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] text-white text-xs font-bold shadow-xl flex items-center gap-2"
          >
            <span>🎉 (｡･ω･｡)ﾉ✦ Đã tìm thấy bé!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hide-and-seek active banner (if hiding) */}
      {isHiding && (
        <div className="p-3 mb-3 rounded-2xl bg-[#E5F5F7] dark:bg-[#0D2730] border border-[#65C5CE]/40 text-[#247C8C] dark:text-[#78DCE0] text-xs flex items-center justify-between gap-2 shadow-sm animate-pulse">
          <div className="flex items-center gap-1.5 font-bold">
            <span>🐾 Trò chơi trốn tìm đang diễn ra:</span>
            <span className="font-normal">Bé đang nấp ở góc nào đó trong trang chủ... Chạm để tìm bé nhé!</span>
          </div>
          <button
            onClick={() => setIsHiding(false)}
            className="px-2.5 py-1 rounded-xl bg-[#3FAAB7]/20 hover:bg-[#3FAAB7]/30 font-bold transition-colors shrink-0"
          >
            Dừng trốn
          </button>
        </div>
      )}

      {/* Main Peaceful Home Corner Container */}
      <div className="relative w-full rounded-3xl bg-gradient-to-br from-[#E5F5F7]/90 via-[#DDF1F3]/60 to-[#F2FBFC]/80 dark:from-[#081B22] dark:via-[#0D2730] dark:to-[#102F38] border border-[#65C5CE]/40 dark:border-[#78DCE0]/20 p-4 sm:p-5 shadow-sm overflow-hidden transition-all">
        
        {/* Background Atmosphere & Ambient elements */}
        <div className="absolute top-2 left-6 text-[#3FAAB7] dark:text-[#78DCE0] opacity-40 text-xs">✦</div>
        <div className="absolute bottom-3 right-8 text-[#65C5CE] dark:text-[#57C8D1] opacity-30 text-xs">〜</div>
        <div className="absolute top-4 right-1/4 text-[#247C8C] dark:text-[#78DCE0] opacity-30 text-[10px]">˚₊‧</div>

        {/* Top Mini Toolbar: Spot Name & Wardrobe Launcher */}
        <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-[#65C5CE]/30 dark:border-[#143943]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3FAAB7] animate-pulse" />
            <span className="text-xs font-bold font-serif text-[#29464C] dark:text-[#DDF5F6]">
              Góc của bé: {
                activeSpot === 'window' ? '🪟 Mép cửa sổ ngắm sóng biển' :
                activeSpot === 'books' ? '📚 Chồng sách đại dương' :
                activeSpot === 'table' ? '🪵 Bàn trà biển ấm cúng' :
                '🌱 Cạnh rạn san hô / chậu cây xanh'
              }
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick spot selector chips */}
            <div className="hidden sm:flex items-center gap-1 bg-white/70 dark:bg-[#102F38] p-1 rounded-xl border border-[#65C5CE]/40 dark:border-[#143943]">
              {[
                { id: 'window' as MascotSpot, icon: '🪟' },
                { id: 'books' as MascotSpot, icon: '📚' },
                { id: 'table' as MascotSpot, icon: '🪵' },
                { id: 'plant' as MascotSpot, icon: '🌱' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveSpot(s.id);
                    onUpdateSettings({ currentSpot: s.id });
                  }}
                  className={`px-2 py-0.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    activeSpot === s.id
                      ? 'bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] text-white shadow-xs'
                      : 'text-[#6B858A] dark:text-[#8FB6BC] hover:bg-[#E5F5F7] dark:hover:bg-[#143943]'
                  }`}
                  title={`Đổi vị trí sang ${s.id}`}
                >
                  {s.icon}
                </button>
              ))}
            </div>

            {/* Wardrobe Modal Button */}
            <button
              onClick={onOpenWardrobe}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white/80 dark:bg-[#102F38] hover:bg-[#E5F5F7] dark:hover:bg-[#143943] border border-[#65C5CE]/50 dark:border-[#78DCE0]/30 text-[#29464C] dark:text-[#DDF5F6] text-xs font-bold shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer font-serif"
              title="Mở Tủ đồ & Phụ kiện của bé"
            >
              <Shirt className="w-3.5 h-3.5 text-[#3FAAB7] dark:text-[#78DCE0]" />
              <span>Tủ đồ</span>
            </button>
          </div>
        </div>

        {/* Dynamic Spot Stage Area */}
        <div className="relative min-h-[120px] sm:min-h-[140px] flex items-end justify-between gap-4 px-2 sm:px-6">
          
          {/* Left Decorative Interactive Items */}
          <div className="flex items-end gap-3 sm:gap-5 pb-1">
            
            {/* 1. Interactive Window 🪟 */}
            <button
              onClick={handleToggleWindow}
              className="relative flex flex-col items-center group cursor-pointer focus:outline-none"
              title="Cửa sổ nhỏ (Chạm để mở/đóng 🪟)"
            >
              <div className="w-14 sm:w-16 h-20 sm:h-24 rounded-t-full bg-[#E5F5F7] dark:bg-[#0D2730] border-2 border-[#65C5CE]/70 dark:border-[#78DCE0]/40 shadow-sm overflow-hidden relative flex items-center justify-center transition-all group-hover:scale-105">
                {/* Sky / Ocean inside */}
                {theme === 'dark' ? (
                  <div className="absolute inset-0 bg-[#081B22] flex flex-col items-center justify-center text-[8px] text-[#78DCE0]">
                    <Moon className="w-3 h-3 text-[#78DCE0] mb-1" />
                    <span>✦ ˚</span>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-b from-[#DDF1F3] to-[#F2FBFC] flex flex-col items-center justify-center text-xs text-[#247C8C]">
                    <Sun className="w-3.5 h-3.5 text-amber-400 mb-1" />
                    <span className="text-[8px] text-[#3FAAB7]">☁ ☁</span>
                  </div>
                )}

                {/* Window Panes Grid */}
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 border border-[#65C5CE]/30 dark:border-[#143943] pointer-events-none">
                  <div className="border-r border-b border-[#65C5CE]/50 dark:border-[#78DCE0]/30" />
                  <div className="border-b border-[#65C5CE]/50 dark:border-[#78DCE0]/30" />
                  <div className="border-r border-[#65C5CE]/50 dark:border-[#78DCE0]/30" />
                  <div />
                </div>
              </div>
              <span className="text-[10px] text-[#6B858A] dark:text-[#8FB6BC] font-medium mt-1">
                Cửa sổ
              </span>

              {/* Peek mascot if hiding here */}
              {isHiding && hideSpot === 'window' && (
                <div
                  onClick={handleFoundMascot}
                  className="absolute -top-3 -right-3 z-30 cursor-pointer animate-bounce"
                  title="Tìm thấy bé rồi!"
                >
                  <MascotCharacter mood="peeking" accessory={settings.currentAccessory} size="sm" />
                  <span className="absolute -top-2 left-0 text-[10px] bg-[#3FAAB7] text-white font-bold px-1 rounded-full">
                    🐾
                  </span>
                </div>
              )}
            </button>

            {/* 2. Interactive Plant 🌱 */}
            <button
              onClick={handleTouchPlant}
              className={`relative flex flex-col items-center group cursor-pointer focus:outline-none transition-transform ${
                isPlantRustling ? 'animate-wiggle' : 'hover:scale-105'
              }`}
              title="Chậu cây nhỏ (Chạm để lá rung rinh 🌱)"
            >
              <div className="relative flex flex-col items-center">
                {/* Leaves */}
                <motion.div
                  animate={isPlantRustling ? { rotate: [-8, 8, -4, 4, 0] } : { rotate: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-2xl sm:text-3xl text-emerald-500 mb-[-6px] filter drop-shadow-xs"
                >
                  🌿
                </motion.div>
                {/* Pot */}
                <div className="w-9 h-7 rounded-b-xl bg-gradient-to-b from-[#DDF1F3] to-[#E5F5F7] dark:from-[#143943] dark:to-[#0D2730] border border-[#65C5CE]/50 dark:border-[#78DCE0]/30 shadow-xs flex items-center justify-center text-[9px] font-bold text-[#247C8C] dark:text-[#78DCE0]">
                  ✦
                </div>
              </div>
              <span className="text-[10px] text-[#6B858A] dark:text-[#8FB6BC] font-medium mt-1">
                Chậu cây
              </span>

              {/* Peek mascot if hiding here */}
              {isHiding && hideSpot === 'plant' && (
                <div
                  onClick={handleFoundMascot}
                  className="absolute -top-4 -left-3 z-30 cursor-pointer animate-bounce"
                  title="Tìm thấy bé rồi!"
                >
                  <MascotCharacter mood="peeking" accessory={settings.currentAccessory} size="sm" />
                  <span className="absolute -top-2 left-0 text-[10px] bg-[#3FAAB7] text-white font-bold px-1 rounded-full">
                    🐾
                  </span>
                </div>
              )}
            </button>

            {/* 3. Interactive Book Stack 📚 */}
            <button
              onClick={handleToggleBook}
              className="relative flex flex-col items-center group cursor-pointer focus:outline-none hover:scale-105 transition-transform"
              title="Chồng sách đại dương (Chạm để mở truyện 📚)"
            >
              <div className="relative flex flex-col items-center space-y-[-4px]">
                <div className="w-12 h-3.5 rounded-sm bg-[#3FAAB7] dark:bg-[#143943] border border-[#65C5CE] shadow-xs" />
                <div className="w-14 h-4 rounded-sm bg-[#DDF1F3] dark:bg-[#0D2730] border border-[#65C5CE]/60 shadow-xs flex items-center justify-center text-[8px] text-[#247C8C] dark:text-[#78DCE0] font-bold font-serif">
                  ✦
                </div>
                <div className="w-16 h-4.5 rounded-sm bg-[#E5F5F7] dark:bg-[#102F38] border border-[#65C5CE]/50 shadow-xs flex items-center justify-center text-[8px] text-[#247C8C] dark:text-[#78DCE0] font-serif">
                  Ocean ✦
                </div>
              </div>
              <span className="text-[10px] text-[#6B858A] dark:text-[#8FB6BC] font-medium mt-1">
                Sách hay
              </span>

              {/* Peek mascot if hiding here */}
              {isHiding && hideSpot === 'books' && (
                <div
                  onClick={handleFoundMascot}
                  className="absolute -top-5 -right-3 z-30 cursor-pointer animate-bounce"
                  title="Tìm thấy bé rồi!"
                >
                  <MascotCharacter mood="peeking" accessory={settings.currentAccessory} size="sm" />
                  <span className="absolute -top-2 left-0 text-[10px] bg-[#3FAAB7] text-white font-bold px-1 rounded-full">
                    🐾
                  </span>
                </div>
              )}
            </button>

            {/* 4. Interactive Desk Lamp & Tea Cup 🪵 */}
            <button
              onClick={handleToggleLamp}
              className="relative flex flex-col items-center group cursor-pointer focus:outline-none hover:scale-105 transition-transform"
              title="Bàn trà & Đèn nhỏ (Chạm để bật/tắt đèn 💡)"
            >
              <div className="relative flex items-end gap-1">
                {/* Desk Lamp */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-6 h-5 rounded-t-full border transition-all ${
                      isLampOn
                        ? 'bg-[#78DCE0] border-[#3FAAB7] shadow-md shadow-[#78DCE0]/50'
                        : 'bg-slate-200 dark:bg-slate-700 border-slate-300'
                    }`}
                  />
                  <div className="w-1 h-5 bg-slate-400 dark:bg-slate-600" />
                  <div className="w-6 h-1.5 bg-slate-500 rounded-full" />
                </div>
                {/* Steaming Tea Cup */}
                <div className="relative flex flex-col items-center">
                  <div className="text-[10px] animate-pulse mb-[-2px]">♨</div>
                  <div className="w-5 h-4 rounded-b-md bg-white dark:bg-[#0D2730] border border-[#65C5CE]/40 shadow-xs flex items-center justify-center text-[7px] text-[#3FAAB7] dark:text-[#78DCE0]">
                    ✦
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-[#6B858A] dark:text-[#8FB6BC] font-medium mt-1">
                Bàn trà
              </span>
            </button>

          </div>

          {/* Right Stage: Mascot Sitting on the chosen spot */}
          <div className="relative flex flex-col items-center pb-1">
            
            {/* Speech Bubble popup if active */}
            <AnimatePresence>
              {speechBubble && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.9 }}
                  className="absolute -top-8 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap px-2.5 py-1 rounded-xl bg-white dark:bg-[#102F38] border border-[#65C5CE]/40 dark:border-[#78DCE0]/30 text-[#247C8C] dark:text-[#78DCE0] text-xs font-bold shadow-md pointer-events-none font-serif"
                >
                  {speechBubble}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white dark:bg-[#102F38] border-b border-r border-[#65C5CE]/40 dark:border-[#78DCE0]/30 rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mascot Character itself (if not hiding in hide & seek) */}
            {!isHiding ? (
              <div className="relative">
                {/* Glowing light effect when lamp is on */}
                {isLampOn && (
                  <motion.div
                    animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.95, 1.1, 0.95] }}
                    transition={{ repeat: Infinity, duration: 2.2 }}
                    className="absolute inset-0 rounded-full bg-[#78DCE0]/25 blur-xl pointer-events-none"
                  />
                )}

                <MascotCharacter
                  mood={mood}
                  accessory={settings.currentAccessory}
                  size="md"
                  onClick={handleMascotClick}
                />
              </div>
            ) : (
              <div className="w-20 h-24 flex items-center justify-center text-xs text-[#6B858A] dark:text-[#8FB6BC] font-bold border border-dashed border-[#65C5CE]/40 dark:border-[#78DCE0]/30 rounded-2xl p-2 text-center font-serif">
                <span>Bé đang trốn nè... 🐾</span>
              </div>
            )}

            {/* Resting Pedestal / Rug */}
            <div className="w-24 h-2.5 rounded-full bg-[#DDF1F3] dark:bg-[#143943] border border-[#65C5CE]/50 dark:border-[#78DCE0]/30 mt-[-4px] shadow-xs" />
          </div>

        </div>

      </div>
    </div>
  );
};

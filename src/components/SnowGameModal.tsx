import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Trophy, Snowflake, RefreshCw, Clock, Gauge, Gift, Check } from 'lucide-react';
import { triggerSfx } from '../utils/sfx';
import { triggerHeartConfetti } from '../utils/confetti';

export type SnowDifficulty = 'easy' | 'medium' | 'hard';

interface SnowGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed?: (rewardName: string) => void;
  claimedRewards?: string[];
  isSfxOn?: boolean;
  sfxVolume?: number;
  onToast?: (msg: string) => void;
}

interface SnowflakeItem {
  id: number;
  x: number;      // 8..92 %
  y: number;      // -8..105 %
  size: number;   // px icon size
  speed: number;  // % per 16ms frame
  drift: number;  // horizontal sway
  symbol: string;
  points: number;
  isSpecial?: boolean;
  isStar?: boolean;
}

interface FloatingScore {
  id: number;
  x: number;
  y: number;
  text: string;
  isSpecial?: boolean;
}

const DIFFICULTY_CONFIG: Record<
  SnowDifficulty,
  {
    label: string;
    desc: string;
    spawnMs: number;
    minSpeed: number;
    maxSpeed: number;
    multiplier: number;
    maxActive: number;
  }
> = {
  easy: {
    label: 'Dễ',
    desc: 'Tuyết rơi êm dịu, dễ chạm (x1 điểm)',
    spawnMs: 760,
    minSpeed: 0.24,
    maxSpeed: 0.42,
    multiplier: 1,
    maxActive: 10,
  },
  medium: {
    label: 'Vừa',
    desc: 'Gió đông vừa phải, có quà thưởng (x1.5 điểm)',
    spawnMs: 520,
    minSpeed: 0.42,
    maxSpeed: 0.68,
    multiplier: 1.5,
    maxActive: 13,
  },
  hard: {
    label: 'Khó',
    desc: 'Bão tuyết nhanh, săn sao pha lê (x2 điểm)',
    spawnMs: 350,
    minSpeed: 0.65,
    maxSpeed: 0.98,
    multiplier: 2,
    maxActive: 16,
  },
};

const DURATION_OPTIONS = [15, 30, 60, 90];

export const SnowGameModal: React.FC<SnowGameModalProps> = ({
  isOpen,
  onClose,
  onRewardClaimed,
  claimedRewards = [],
  isSfxOn = true,
  sfxVolume = 0.5,
  onToast,
}) => {
  const [difficulty, setDifficulty] = useState<SnowDifficulty>('easy');
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [score, setScore] = useState(0);
  const [caughtCount, setCaughtCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [snowflakes, setSnowflakes] = useState<SnowflakeItem[]>([]);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [unlockedThisRun, setUnlockedThisRun] = useState<string[]>([]);
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem('yui_snow_game_high');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Refs to keep animation loop and scoring accurate without clobbering clicks
  const flakesRef = useRef<SnowflakeItem[]>([]);
  const scoreRef = useRef(0);
  const idCounterRef = useRef(1);
  const diffRef = useRef<SnowDifficulty>(difficulty);
  diffRef.current = difficulty;

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
    }
  }, [isOpen]);

  // Finish game handler
  const finishGame = useCallback(() => {
    setIsPlaying(false);
    setGameOver(true);
    const finalScore = scoreRef.current;

    if (finalScore > highScore) {
      setHighScore(finalScore);
      try {
        localStorage.setItem('yui_snow_game_high', finalScore.toString());
      } catch {}
    }

    const newlyGranted: string[] = [];
    if (finalScore >= 15) {
      triggerHeartConfetti();
      if (onRewardClaimed) {
        onRewardClaimed('Bông Tuyết Pha Lê May Mắn');
      }
      if (!claimedRewards.includes('Bông Tuyết Pha Lê May Mắn')) {
        newlyGranted.push('Bông Tuyết Pha Lê May Mắn');
      }
    }
    if (finalScore >= 40) {
      if (onRewardClaimed) {
        onRewardClaimed('Quả Cầu Pha Lê Mùa Đông');
      }
      if (!claimedRewards.includes('Quả Cầu Pha Lê Mùa Đông')) {
        newlyGranted.push('Quả Cầu Pha Lê Mùa Đông');
      }
    }
    setUnlockedThisRun(newlyGranted);

    if (finalScore >= 15 && onToast) {
      onToast(`❄️ Tuyệt vời! Đạt ${finalScore} điểm và mở khóa quà mùa đông!`);
    }
    if (isSfxOn) triggerSfx('sparkle', sfxVolume);
  }, [highScore, claimedRewards, onRewardClaimed, onToast, isSfxOn, sfxVolume]);

  // Countdown Timer
  useEffect(() => {
    if (!isPlaying) return;
    if (timeLeft <= 0) {
      finishGame();
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isPlaying, timeLeft, finishGame]);

  // Spawn snowflakes
  useEffect(() => {
    if (!isPlaying) return;
    const cfg = DIFFICULTY_CONFIG[difficulty];

    const spawnOne = () => {
      if (flakesRef.current.length >= cfg.maxActive) return;
      const roll = Math.random();
      const isSpecial = roll < 0.16;
      const isStar = !isSpecial && roll < 0.34;
      const normalSymbols = ['❄', '❅', '❆', '✧', '୨୧'];
      const basePoints = isSpecial ? 5 : isStar ? 2 : 1;
      const points = Math.max(1, Math.round(basePoints * cfg.multiplier));

      const nextFlake: SnowflakeItem = {
        id: idCounterRef.current++,
        x: Math.random() * 82 + 9,
        y: -6,
        size: isSpecial ? 32 : isStar ? 28 : Math.random() * 8 + 24,
        speed:
          cfg.minSpeed +
          Math.random() * (cfg.maxSpeed - cfg.minSpeed) * (isSpecial ? 1.12 : 1),
        drift: (Math.random() - 0.5) * 0.14,
        symbol: isSpecial
          ? '🎁'
          : isStar
          ? '✦'
          : normalSymbols[Math.floor(Math.random() * normalSymbols.length)],
        points,
        isSpecial,
        isStar,
      };

      flakesRef.current = [...flakesRef.current, nextFlake];
      setSnowflakes([...flakesRef.current]);
    };

    // Immediate first batch so arena feels alive right away
    spawnOne();
    const spawnInterval = setInterval(spawnOne, cfg.spawnMs);
    return () => clearInterval(spawnInterval);
  }, [isPlaying, difficulty]);

  // Smooth physics tick via requestAnimationFrame (~30fps React sync with dt normalization)
  useEffect(() => {
    if (!isPlaying) return;
    let animFrame: number;
    let lastTime = performance.now();
    let lastSync = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.67, 3);
      lastTime = now;

      flakesRef.current = flakesRef.current
        .map((f) => ({
          ...f,
          y: f.y + f.speed * dt,
          x: Math.max(6, Math.min(94, f.x + f.drift * dt)),
        }))
        .filter((f) => f.y < 104);

      // Sync React DOM smoothly at ~30fps so buttons remain rock-solid clickable while gliding smoothly
      if (now - lastSync >= 32) {
        setSnowflakes([...flakesRef.current]);
        lastSync = now;
      }

      animFrame = requestAnimationFrame(tick);
    };

    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying]);

  const startGame = () => {
    flakesRef.current = [];
    scoreRef.current = 0;
    setScore(0);
    setCaughtCount(0);
    setTimeLeft(selectedDuration);
    setSnowflakes([]);
    setFloatingScores([]);
    setUnlockedThisRun([]);
    setGameOver(false);
    setIsPlaying(true);
    if (isSfxOn) triggerSfx('pop', sfxVolume);
  };

  // Use onPointerDown so rapid mouse clicks and mobile taps register on contact immediately!
  const handleCatchFlake = (flake: SnowflakeItem, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isPlaying) return;

    // Guard against duplicate pointer events on the same flake ID
    const exists = flakesRef.current.some((f) => f.id === flake.id);
    if (!exists) return;

    flakesRef.current = flakesRef.current.filter((f) => f.id !== flake.id);
    setSnowflakes([...flakesRef.current]);

    const nextScore = scoreRef.current + flake.points;
    scoreRef.current = nextScore;
    setScore(nextScore);
    setCaughtCount((c) => c + 1);

    const popupId = Date.now() + Math.random();
    setFloatingScores((prev) => [
      ...prev.slice(-8),
      {
        id: popupId,
        x: flake.x,
        y: Math.max(10, flake.y),
        text: `+${flake.points}`,
        isSpecial: flake.isSpecial || flake.isStar,
      },
    ]);
    setTimeout(() => {
      setFloatingScores((prev) => prev.filter((p) => p.id !== popupId));
    }, 650);

    if (isSfxOn) triggerSfx(flake.isSpecial ? 'sparkle' : 'pop', sfxVolume);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#172536]/80 backdrop-blur-md transition-opacity"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative w-full max-w-lg max-h-[92dvh] overflow-y-auto bg-gradient-to-b from-[#F7FAFD] via-[#E8F1F8] to-[#DCE7EF] dark:from-[#172536] dark:via-[#202F42] dark:to-[#121C28] rounded-2xl sm:rounded-3xl border border-[#91A9BC]/40 dark:border-[#43576B] shadow-2xl my-auto flex flex-col z-10 text-[#526B80] dark:text-[#E5EDF5]"
        >
          {/* Header */}
          <div className="p-5 pb-3 border-b border-[#DCE7EF] dark:border-[#354A60] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-gradient-to-tr from-[#91A9BC] to-[#526B80] text-white shadow-md">
                <Snowflake className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold font-serif text-[#526B80] dark:text-white">
                  Săn Ký Ức Tuyết Rơi ❄
                </h3>
                <p className="text-[11px] text-[#91A9BC] dark:text-[#A9BDCE] font-serif">
                  Chạm nhanh vào bông tuyết, sao pha lê &amp; hộp quà rơi xuống!
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#91A9BC] hover:text-[#526B80] dark:hover:text-white hover:bg-white/80 dark:hover:bg-[#202F42] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Game Arena */}
          <div className="relative h-88 sm:h-[400px] bg-gradient-to-b from-[#E8F1F8]/90 to-[#DCE7EF]/80 dark:from-[#121C28]/95 dark:to-[#172536]/95 overflow-hidden border-b border-[#DCE7EF] dark:border-[#354A60] select-none flex flex-col items-center justify-center">
            {/* Top HUD */}
            <div className="absolute top-3 inset-x-4 flex items-center justify-between z-20 text-xs font-bold font-serif pointer-events-none">
              <div className="px-3 py-1.5 rounded-xl bg-white/85 dark:bg-[#202F42]/90 border border-[#DCE7EF] dark:border-[#43576B] shadow-xs flex items-center gap-1.5 tabular-nums">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Điểm: {score}</span>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-white/75 dark:bg-[#202F42]/75 border border-[#DCE7EF] dark:border-[#43576B] text-[11px] text-[#91A9BC] dark:text-[#A9BDCE]">
                {DIFFICULTY_CONFIG[difficulty].label} · x{DIFFICULTY_CONFIG[difficulty].multiplier}
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/85 dark:bg-[#202F42]/90 border border-[#DCE7EF] dark:border-[#43576B] shadow-xs flex items-center gap-1.5 tabular-nums">
                <Clock className="w-3.5 h-3.5 text-[#526B80] dark:text-[#A9BDCE]" />
                <span>{timeLeft}s</span>
              </div>
            </div>

            {/* Start Screen with Difficulty & Duration Controls */}
            {!isPlaying && !gameOver && (
              <div className="text-center p-5 space-y-4 z-20 font-serif w-full max-w-md pt-12">
                <div className="space-y-1">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-[#91A9BC] to-[#526B80] text-white flex items-center justify-center text-2xl shadow-md">
                    ❄
                  </div>
                  <h4 className="text-base font-bold text-[#526B80] dark:text-white pt-1">
                    Chọn chế độ &amp; thời gian chơi
                  </h4>
                  <p className="text-[11px] text-[#91A9BC] dark:text-[#A9BDCE]">
                    Đạt từ 15 điểm để mở khóa <strong>Bông Tuyết Pha Lê May Mắn</strong>!
                  </p>
                </div>

                {/* Difficulty Selector */}
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#526B80] dark:text-[#E5EDF5]">
                    <Gauge className="w-3.5 h-3.5 text-[#91A9BC]" />
                    <span>Độ khó</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 font-sans">
                    {(['easy', 'medium', 'hard'] as SnowDifficulty[]).map((level) => {
                      const active = difficulty === level;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => {
                            setDifficulty(level);
                            if (isSfxOn) triggerSfx('pop', sfxVolume);
                          }}
                          className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            active
                              ? 'bg-[#526B80] dark:bg-[#91A9BC] text-white dark:text-[#172536] border-[#526B80] shadow-sm'
                              : 'bg-white/80 dark:bg-[#202F42]/80 text-[#526B80] dark:text-[#E5EDF5] border-[#DCE7EF] dark:border-[#43576B] hover:border-[#91A9BC]'
                          }`}
                        >
                          {DIFFICULTY_CONFIG[level].label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-[#91A9BC] dark:text-[#A9BDCE] text-center">
                    {DIFFICULTY_CONFIG[difficulty].desc}
                  </p>
                </div>

                {/* Duration Selector */}
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#526B80] dark:text-[#E5EDF5]">
                    <Clock className="w-3.5 h-3.5 text-[#91A9BC]" />
                    <span>Thời gian chơi</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 font-sans">
                    {DURATION_OPTIONS.map((sec) => {
                      const active = selectedDuration === sec;
                      return (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => {
                            setSelectedDuration(sec);
                            setTimeLeft(sec);
                            if (isSfxOn) triggerSfx('pop', sfxVolume);
                          }}
                          className={`py-1.5 rounded-xl border text-xs font-bold tabular-nums transition-all cursor-pointer ${
                            active
                              ? 'bg-[#526B80] dark:bg-[#91A9BC] text-white dark:text-[#172536] border-[#526B80] shadow-sm'
                              : 'bg-white/80 dark:bg-[#202F42]/80 text-[#526B80] dark:text-[#E5EDF5] border-[#DCE7EF] dark:border-[#43576B] hover:border-[#91A9BC]'
                          }`}
                        >
                          {sec}s
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={startGame}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#91A9BC] to-[#526B80] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-[#526B80]/25 transition-all cursor-pointer font-serif"
                >
                  Bắt đầu săn tuyết ✦
                </button>
              </div>
            )}

            {/* Game Over Screen */}
            {gameOver && (
              <div className="text-center p-5 space-y-3 z-20 font-serif w-full max-w-md pt-10">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#91A9BC] to-[#526B80] text-white flex items-center justify-center text-2xl shadow-lg">
                  {score >= 15 ? '🎁' : '❄'}
                </div>
                <h4 className="text-lg font-bold text-[#526B80] dark:text-white">
                  {score >= 15 ? 'Tuyệt vời! Bạn đã mở khóa quà mùa đông!' : 'Hoàn thành lượt săn tuyết!'}
                </h4>
                <div className="text-xs text-[#91A9BC] dark:text-[#A9BDCE] space-y-0.5 tabular-nums">
                  <p>
                    Điểm đạt được: <strong className="text-[#526B80] dark:text-white text-sm">{score}</strong> điểm · Đã bắt <strong>{caughtCount}</strong> bông tuyết
                  </p>
                  <p>Kỷ lục cao nhất: {highScore} điểm</p>
                </div>

                {score >= 15 && (
                  <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 py-1.5 px-3 rounded-xl border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5" />
                    <span>
                      {unlockedThisRun.length > 0
                        ? `Đã nhận: ${unlockedThisRun.join(', ')}`
                        : 'Quà Bông Tuyết Pha Lê May Mắn đã có trong Hồ Sơ!'}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setGameOver(false);
                      setTimeLeft(selectedDuration);
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] text-[#526B80] dark:text-[#E5EDF5] text-xs font-bold transition-all cursor-pointer"
                  >
                    Đổi chế độ
                  </button>
                  <button
                    onClick={startGame}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#91A9BC] to-[#526B80] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-[#526B80]/25 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Chơi lại ngay</span>
                  </button>
                </div>
              </div>
            )}

            {/* Falling Snowflakes (onPointerDown with generous 52x52 hitbox) */}
            {isPlaying &&
              snowflakes.map((flake) => (
                <button
                  key={flake.id}
                  type="button"
                  onPointerDown={(e) => handleCatchFlake(flake, e)}
                  className="absolute z-10 min-w-[52px] min-h-[52px] -translate-x-1/2 -translate-y-1/2 cursor-pointer select-none flex items-center justify-center rounded-full hover:bg-white/25 active:scale-90 touch-none"
                  style={{
                    left: `${flake.x}%`,
                    top: `${flake.y}%`,
                    fontSize: `${flake.size}px`,
                  }}
                >
                  <span
                    className={`pointer-events-none drop-shadow-[0_2px_6px_rgba(82,107,128,0.35)] ${
                      flake.isStar
                        ? 'text-amber-400'
                        : flake.isSpecial
                        ? ''
                        : 'text-[#526B80] dark:text-[#F7FAFD]'
                    }`}
                  >
                    {flake.symbol}
                  </span>
                </button>
              ))}

            {/* Floating +Points Feedback Popups */}
            {floatingScores.map((popup) => (
              <motion.div
                key={popup.id}
                initial={{ opacity: 1, y: 0, scale: 0.8 }}
                animate={{ opacity: 0, y: -32, scale: 1.15 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none font-mono font-extrabold text-sm drop-shadow ${
                  popup.isSpecial
                    ? 'text-amber-500 dark:text-amber-300'
                    : 'text-[#526B80] dark:text-white'
                }`}
                style={{ left: `${popup.x}%`, top: `${popup.y}%` }}
              >
                {popup.text}
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 bg-white/90 dark:bg-[#172536]/90 flex items-center justify-between text-xs font-serif">
            <span className="text-[#91A9BC] dark:text-[#A9BDCE] tabular-nums">
              Kỷ lục cao nhất: <strong className="text-[#526B80] dark:text-white">{highScore}</strong> điểm
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#91A9BC] to-[#526B80] hover:opacity-95 text-white font-bold transition-all cursor-pointer"
            >
              Đóng trò chơi ✦
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

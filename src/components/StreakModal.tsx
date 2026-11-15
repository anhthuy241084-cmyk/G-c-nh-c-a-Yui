import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Flame, Trophy, Calendar as CalendarIcon, Gift, Check } from 'lucide-react';
import { triggerSfx } from '../utils/sfx';
import { triggerHeartConfetti } from '../utils/confetti';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreak: number;
  longestStreak: number;
  lastVisitDate: string; // YYYY-MM-DD
  historyDates: string[]; // List of YYYY-MM-DD dates visited
  onClaimReward?: (rewardName: string) => void;
  claimedRewards?: string[];
  onToast?: (msg: string) => void;
  isSfxOn?: boolean;
  sfxVolume?: number;
}

export const STREAK_MILESTONES = [
  {
    days: 1,
    icon: '❄️',
    title: 'Khởi đầu',
    desc: 'Chào mừng bạn đến với Hộp Ký Ức Mùa Đông!',
    reward: 'Bông Tuyết Đầu Mùa',
    unlockDetail: 'Khung hồ sơ Tuyết Đầu Mùa',
  },
  {
    days: 3,
    icon: '🧶',
    title: 'Thân quen',
    desc: 'Tuyết lại rơi khi bạn ghé thăm chiếc hộp!',
    reward: 'Khăn Len Mùa Đông',
    unlockDetail: 'Khung hồ sơ Phòng Ấm Mùa Đông',
  },
  {
    days: 7,
    icon: '☕',
    title: 'Khách quý',
    desc: 'Một tuần ấm êm giữa những câu chuyện mùa đông!',
    reward: 'Tách Trà Ấm Áp',
    unlockDetail: 'Huy hiệu Trà Ấm & Kỷ vật Hồ sơ',
  },
  {
    days: 14,
    icon: '🔮',
    title: 'Tri kỷ',
    desc: 'Chiếc hộp mùa đông luôn giữ một góc dịu dàng cho bạn.',
    reward: 'Quả Cầu Tuyết Kỷ Niệm',
    unlockDetail: 'Hiệu ứng Tuyết rơi trên Hồ sơ + Quà lưu niệm',
  },
  {
    days: 30,
    icon: '👑',
    title: 'Huyền thoại',
    desc: 'Người thắp sáng ký ức qua muôn trùng tuyết trắng!',
    reward: 'Vương Miện Pha Lê Băng',
    unlockDetail: 'Khung Pha Lê Băng & Kỷ vật Huyền thoại',
  },
];

export const StreakModal: React.FC<StreakModalProps> = ({
  isOpen,
  onClose,
  currentStreak,
  longestStreak,
  lastVisitDate,
  historyDates,
  onClaimReward,
  claimedRewards = [],
  onToast,
  isSfxOn = true,
  sfxVolume = 0.5,
}) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthName = today.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  const getDayStatus = (dayNum: number) => {
    const formattedDay = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
      dayNum
    ).padStart(2, '0')}`;
    const isToday = dayNum === today.getDate();
    const isVisited = historyDates.includes(formattedDay);

    return { formattedDay, isToday, isVisited };
  };

  const handleClaim = (rewardName: string) => {
    if (isSfxOn) triggerSfx('sparkle', sfxVolume);
    triggerHeartConfetti();
    if (onClaimReward) {
      onClaimReward(rewardName);
    } else if (onToast) {
      onToast(`🎁 Đã nhận thành công phần thưởng: "${rewardName}" vào bộ sưu tập!`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172536]/75 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#F7FAFD]/98 dark:bg-[#172536]/98 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#DCE7EF] dark:border-[#43576B] p-6 text-[#526B80] dark:text-[#E5EDF5] space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar font-sans"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-[#91A9BC] hover:text-[#526B80] dark:hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Streak Hero Stats */}
            <div className="text-center space-y-2 pt-2 font-serif">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 2.8 }}
                className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-[#91A9BC] to-[#526B80] text-white shadow-lg shadow-[#526B80]/30 flex items-center justify-center"
              >
                <Flame className="w-8 h-8 fill-current text-[#E8F1F8]" />
              </motion.div>

              <div>
                <h2 className="text-2xl font-extrabold text-[#526B80] dark:text-white tracking-tight flex items-center justify-center gap-1.5 tabular-nums">
                  <span>❄️ {currentStreak} ngày liên tiếp</span>
                </h2>
                <p className="text-xs text-[#91A9BC] dark:text-[#A9BDCE] font-semibold mt-0.5">
                  Hôm nay cũng ghé vùng tuyết trắng ký ức rồi nè ✦
                </p>
              </div>

              {/* Stats summary */}
              <div className="flex items-center justify-center gap-4 pt-2 font-sans">
                <div className="px-4 py-2 bg-[#E8F1F8] dark:bg-[#202F42] rounded-2xl border border-[#DCE7EF] dark:border-[#43576B] text-center">
                  <span className="text-[10px] text-[#91A9BC] dark:text-[#A9BDCE] font-medium block">Kỷ lục dài nhất</span>
                  <span className="text-xs font-bold text-[#526B80] dark:text-[#E5EDF5] flex items-center justify-center gap-1 font-mono tabular-nums">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    {longestStreak} ngày
                  </span>
                </div>

                <div className="px-4 py-2 bg-[#E8F1F8] dark:bg-[#202F42] rounded-2xl border border-[#DCE7EF] dark:border-[#43576B] text-center">
                  <span className="text-[10px] text-[#91A9BC] dark:text-[#A9BDCE] font-medium block">Ghé gần nhất</span>
                  <span className="text-xs font-bold text-[#526B80] dark:text-[#E5EDF5] font-mono tabular-nums">
                    {lastVisitDate || 'Hôm nay'}
                  </span>
                </div>
              </div>
            </div>

            {/* Mini Calendar Overview */}
            <div className="p-4 rounded-2xl bg-[#E8F1F8]/70 dark:bg-[#202F42]/70 border border-[#DCE7EF] dark:border-[#43576B] space-y-3 font-serif">
              <div className="flex items-center justify-between text-xs font-bold text-[#526B80] dark:text-[#E5EDF5]">
                <span className="flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-[#91A9BC]" />
                  <span>Lịch tuyết tháng này</span>
                </span>
                <span className="text-[11px] text-[#91A9BC] dark:text-[#A9BDCE] font-normal capitalize">{monthName}</span>
              </div>

              <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-sans">
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                  <span key={day} className="font-bold text-[#91A9BC] dark:text-[#A9BDCE] py-0.5">
                    {day}
                  </span>
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const { isToday, isVisited } = getDayStatus(dayNum);

                  return (
                    <div
                      key={dayNum}
                      className={`h-8 rounded-xl flex items-center justify-center font-bold text-xs tabular-nums transition-all ${
                        isVisited
                          ? 'bg-gradient-to-r from-[#91A9BC] to-[#526B80] text-white shadow-sm shadow-[#526B80]/30'
                          : isToday
                          ? 'border-2 border-[#91A9BC] text-[#526B80] dark:text-white bg-white dark:bg-[#172536]'
                          : 'bg-white/60 dark:bg-[#172536]/40 text-[#91A9BC] dark:text-[#A9BDCE]'
                      }`}
                    >
                      {isVisited ? '❄' : dayNum}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Milestones & Unlocked Rewards */}
            <div className="space-y-2.5 font-serif">
              <h3 className="text-xs font-bold text-[#526B80] dark:text-[#E5EDF5] flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-[#91A9BC]" />
                <span>Mốc phần thưởng Streak</span>
              </h3>

              <div className="space-y-2">
                {STREAK_MILESTONES.map((m) => {
                  const isUnlocked = currentStreak >= m.days;
                  const isClaimed = claimedRewards.includes(m.reward);

                  return (
                    <div
                      key={m.days}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition-all ${
                        isUnlocked
                          ? 'bg-gradient-to-r from-[#E8F1F8] via-[#DCE7EF]/50 to-transparent dark:from-[#202F42] dark:via-[#1A283B] border-[#91A9BC]/50 dark:border-[#526B80]'
                          : 'bg-white/40 dark:bg-[#172536]/40 border-[#DCE7EF] dark:border-[#354A60] opacity-65'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold shadow-sm shrink-0 ${
                            isUnlocked
                              ? 'bg-gradient-to-r from-[#91A9BC] to-[#526B80] text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                          }`}
                        >
                          {m.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-[#526B80] dark:text-white">
                              {m.days} ngày: {m.title}
                            </span>
                            {isUnlocked && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#91A9BC] text-white font-extrabold">
                                {isClaimed ? 'Đã nhận' : 'Đạt mốc'}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#526B80] dark:text-[#E5EDF5] font-semibold mt-0.5">
                            {m.reward}
                          </p>
                          <p className="text-[10px] text-[#91A9BC] dark:text-[#A9BDCE] leading-tight">
                            Mở khóa: {m.unlockDetail}
                          </p>
                        </div>
                      </div>

                      {isUnlocked ? (
                        isClaimed ? (
                          <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 font-serif px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            <Check className="w-3 h-3" />
                            Đã nhận
                          </span>
                        ) : (
                          <button
                            onClick={() => handleClaim(m.reward)}
                            className="shrink-0 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#91A9BC] to-[#526B80] hover:opacity-95 text-white text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                          >
                            Nhận quà
                          </button>
                        )
                      ) : (
                        <span className="shrink-0 text-[10px] text-[#91A9BC] dark:text-[#A9BDCE] font-semibold font-mono tabular-nums">
                          Còn {m.days - currentStreak} ngày
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl font-bold font-serif text-xs bg-gradient-to-r from-[#91A9BC] to-[#526B80] hover:opacity-95 text-white shadow-md shadow-[#526B80]/25 transition-all cursor-pointer active:scale-95"
            >
              Tiếp tục dạo góc ký ức mùa đông ✦
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

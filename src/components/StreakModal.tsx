import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Flame, Trophy, Calendar as CalendarIcon, Sparkles, Gift, Award } from 'lucide-react';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreak: number;
  longestStreak: number;
  lastVisitDate: string; // YYYY-MM-DD
  historyDates: string[]; // List of YYYY-MM-DD dates visited
}

const STREAK_MILESTONES = [
  { days: 1, icon: '🌊', title: 'Khởi đầu', desc: 'Chào mừng đến với vùng biển của Yui!', reward: 'Huy hiệu Khởi Hành' },
  { days: 3, icon: '✦', title: 'Thân quen', desc: 'Bạn quay lại biển rồi nè!', reward: 'Huy hiệu Sao Biển' },
  { days: 7, icon: '🐚', title: 'Khách quý', desc: 'Một tuần êm đềm trôi qua!', reward: 'Khăn choàng biển' },
  { days: 14, icon: '🪼', title: 'Tri kỷ', desc: 'Góc biển luôn nhớ bạn.', reward: 'Vương miện san hô' },
  { days: 30, icon: '🏆', title: 'Huyền thoại', desc: 'Nhà thám hiểm đại dương kỳ cựu!', reward: 'Danh hiệu VIP Đại Dương' },
];

export const StreakModal: React.FC<StreakModalProps> = ({
  isOpen,
  onClose,
  currentStreak,
  longestStreak,
  lastVisitDate,
  historyDates,
}) => {
  // Generate current month days
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081B22]/75 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white/95 dark:bg-[#102F38]/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#65C5CE]/40 dark:border-[#78DCE0]/25 p-6 text-[#29464C] dark:text-[#DDF5F6] space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar font-sans"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-[#6B858A] hover:text-[#247C8C] dark:text-[#8FB6BC] dark:hover:text-[#78DCE0] rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Streak Hero Stats */}
            <div className="text-center space-y-2 pt-2 font-serif">
              <motion.div
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-[#3FAAB7] to-[#247C8C] text-white shadow-lg shadow-[#247C8C]/30 flex items-center justify-center"
              >
                <Flame className="w-9 h-9 fill-current text-[#78DCE0]" />
              </motion.div>

              <div>
                <h2 className="text-2xl font-extrabold text-[#29464C] dark:text-[#DDF5F6] tracking-tight flex items-center justify-center gap-1.5">
                  <span>🔥 {currentStreak} ngày liên tiếp</span>
                </h2>
                <p className="text-xs text-[#247C8C] dark:text-[#78DCE0] font-semibold mt-0.5">
                  Hôm nay cũng ghé vùng biển rồi nè ✦
                </p>
              </div>

              {/* Stats pill counter */}
              <div className="flex items-center justify-center gap-4 pt-2 font-sans">
                <div className="px-4 py-2 bg-[#E5F5F7]/80 dark:bg-[#0D2730]/80 rounded-2xl border border-[#65C5CE]/30 dark:border-[#143943] text-center">
                  <span className="text-[10px] text-[#6B858A] dark:text-[#8FB6BC] font-medium block">Kỷ lục dài nhất</span>
                  <span className="text-xs font-bold text-[#247C8C] dark:text-[#78DCE0] flex items-center justify-center gap-1 font-mono">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    {longestStreak} ngày
                  </span>
                </div>

                <div className="px-4 py-2 bg-[#E5F5F7]/80 dark:bg-[#0D2730]/80 rounded-2xl border border-[#65C5CE]/30 dark:border-[#143943] text-center">
                  <span className="text-[10px] text-[#6B858A] dark:text-[#8FB6BC] font-medium block">Ghé gần nhất</span>
                  <span className="text-xs font-bold text-[#29464C] dark:text-[#DDF5F6] font-mono">
                    {lastVisitDate || 'Hôm nay'}
                  </span>
                </div>
              </div>
            </div>

            {/* Mini Calendar Overview */}
            <div className="p-4 rounded-2xl bg-[#E5F5F7]/50 dark:bg-[#0D2730]/60 border border-[#65C5CE]/30 dark:border-[#143943] space-y-3 font-serif">
              <div className="flex items-center justify-between text-xs font-bold text-[#29464C] dark:text-[#DDF5F6]">
                <span className="flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-[#3FAAB7] dark:text-[#78DCE0]" />
                  <span>Lịch ghé tháng này</span>
                </span>
                <span className="text-[11px] text-[#6B858A] dark:text-[#8FB6BC] font-normal capitalize">{monthName}</span>
              </div>

              <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-sans">
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                  <span key={day} className="font-bold text-[#6B858A] dark:text-[#8FB6BC] py-0.5">
                    {day}
                  </span>
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const { isToday, isVisited } = getDayStatus(dayNum);

                  return (
                    <div
                      key={dayNum}
                      className={`h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                        isVisited
                          ? 'bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] text-white shadow-sm shadow-[#247C8C]/30'
                          : isToday
                          ? 'border-2 border-[#3FAAB7] text-[#247C8C] dark:text-[#78DCE0] bg-white dark:bg-[#081B22]'
                          : 'bg-[#F2FBFC] dark:bg-[#143943]/40 text-[#6B858A] dark:text-[#8FB6BC]'
                      }`}
                    >
                      {isVisited ? '✦' : dayNum}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Milestones & Unlocked Rewards */}
            <div className="space-y-2.5 font-serif">
              <h3 className="text-xs font-bold text-[#29464C] dark:text-[#DDF5F6] flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-amber-500" />
                <span>Mốc phần thưởng Streak</span>
              </h3>

              <div className="space-y-2">
                {STREAK_MILESTONES.map((m) => {
                  const isUnlocked = currentStreak >= m.days;

                  return (
                    <div
                      key={m.days}
                      className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                        isUnlocked
                          ? 'bg-gradient-to-r from-[#65C5CE]/15 via-[#3FAAB7]/10 to-transparent border-[#65C5CE]/50 dark:border-[#78DCE0]/30'
                          : 'bg-[#F2FBFC]/50 dark:bg-[#0D2730]/40 border-[#65C5CE]/20 dark:border-[#143943] opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold shadow-sm ${
                            isUnlocked
                              ? 'bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                          }`}
                        >
                          {m.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#29464C] dark:text-[#DDF5F6]">
                              {m.days} ngày: {m.title}
                            </span>
                            {isUnlocked && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#3FAAB7] text-white font-extrabold">
                                Đã mở
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#6B858A] dark:text-[#8FB6BC] leading-tight">
                            {m.desc} ({m.reward})
                          </p>
                        </div>
                      </div>

                      {isUnlocked ? (
                        <Award className="w-5 h-5 text-[#3FAAB7] dark:text-[#78DCE0] shrink-0" />
                      ) : (
                        <span className="text-[10px] text-[#6B858A] dark:text-[#8FB6BC] font-semibold font-mono">
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
              className="w-full py-3 rounded-2xl font-bold font-serif text-xs bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] text-white shadow-md shadow-[#247C8C]/20 transition-all cursor-pointer active:scale-95"
            >
              Tiếp tục dạo góc biển ✦
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

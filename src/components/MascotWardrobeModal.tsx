import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Heart, Check, Lock, Eye, Compass, BookOpen, Search } from 'lucide-react';
import {
  MascotSettings,
  MascotAccessoryId,
  MascotDisplayMode,
  MascotSpot,
} from '../types';
import { MascotCharacter } from './MascotCharacter';

interface MascotWardrobeModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: MascotSettings;
  onUpdateSettings: (newSettings: Partial<MascotSettings>) => void;
  onStartHideAndSeek?: () => void;
  currentStreak?: number;
  onToast?: (msg: string) => void;
}

interface AccessoryDef {
  id: MascotAccessoryId;
  name: string;
  icon: string;
  desc: string;
  unlockHint: string;
}

export const ACCESSORIES_LIST: AccessoryDef[] = [
  {
    id: 'none',
    name: 'Không đeo',
    icon: '✨',
    desc: 'Bé nguyên bản tự nhiên, nhẹ nhàng',
    unlockHint: 'Mặc định có sẵn',
  },
  {
    id: 'bow',
    name: 'Nơ biển xanh',
    icon: '🎀',
    desc: 'Chiếc nơ ruy băng turquoise xinh xắn',
    unlockHint: 'Mặc định có sẵn',
  },
  {
    id: 'beanie',
    name: 'Mũ len ấm áp',
    icon: '🧶',
    desc: 'Mũ len quả bông ấm áp cho những ngày se lạnh',
    unlockHint: 'Đạt chuỗi 3 ngày ghé góc nhỏ 🔥',
  },
  {
    id: 'hairpin',
    name: 'Kẹp ngọc trai biển',
    icon: '🐚',
    desc: 'Hạt ngọc trai nhỏ cài bên tai dịu dàng',
    unlockHint: 'Ghé thăm Tiệm Bánh Nhỏ 🥐',
  },
  {
    id: 'scarf',
    name: 'Khăn choàng biển',
    icon: '🧣',
    desc: 'Khăn len xanh mềm mại giữ ấm',
    unlockHint: 'Đạt chuỗi 7 ngày ghé góc nhỏ ✦',
  },
  {
    id: 'cat_ears',
    name: 'Tai mèo tinh nghịch',
    icon: '🐱',
    desc: 'Đôi tai mèo mềm mại rung rinh',
    unlockHint: 'Tìm thấy bé 3 lần trong trò Trốn tìm 🐾',
  },
  {
    id: 'nightcap',
    name: 'Mũ ngủ ngắm sao',
    icon: '🌙',
    desc: 'Mũ ngủ chấm sao êm dịu cho ban đêm',
    unlockHint: 'Bật Night Mode và ngắm sao rơi ✦',
  },
  {
    id: 'glasses',
    name: 'Kính tròn tri thức',
    icon: '👓',
    desc: 'Cặp kính tròn đáng yêu khi đọc truyện',
    unlockHint: 'Đọc một câu chuyện bất kỳ 📖',
  },
  {
    id: 'crown',
    name: 'Vương miện san hô',
    icon: '👑',
    desc: 'Chiếc vương miện lấp lánh cho khách quý',
    unlockHint: 'Đạt chuỗi 14 ngày ghé góc nhỏ ✦',
  },
  {
    id: 'angel_wings',
    name: 'Đôi cánh thiên thần',
    icon: '🪽',
    desc: 'Đôi cánh và vầng hào quang lấp lánh',
    unlockHint: 'Easter Egg: Chạm bé 7 lần liên tục ✨',
  },
];

export const MascotWardrobeModal: React.FC<MascotWardrobeModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onStartHideAndSeek,
  currentStreak = 1,
  onToast,
}) => {
  const isUnlocked = (id: MascotAccessoryId) => {
    if (id === 'none' || id === 'bow') return true;
    return settings.unlockedAccessories?.includes(id);
  };

  const handleSelectAccessory = (id: MascotAccessoryId) => {
    if (!isUnlocked(id)) {
      if (onToast) {
        const item = ACCESSORIES_LIST.find((a) => a.id === id);
        onToast(`Chưa mở khóa: ${item?.unlockHint || 'Hãy tiếp tục khám phá nhé!'}`);
      }
      return;
    }
    onUpdateSettings({ currentAccessory: id });
    if (onToast) {
      const item = ACCESSORIES_LIST.find((a) => a.id === id);
      onToast(`Đã đeo: ${item?.name || ''} ✦`);
    }
  };

  const unlockedCount = ACCESSORIES_LIST.filter((a) => isUnlocked(a.id)).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081B22]/75 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white/95 dark:bg-[#102F38]/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#65C5CE]/40 dark:border-[#78DCE0]/25 p-6 text-[#29464C] dark:text-[#DDF5F6] space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar font-sans"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-[#6B858A] hover:text-[#247C8C] dark:text-[#8FB6BC] dark:hover:text-[#78DCE0] hover:bg-[#65C5CE]/10 dark:hover:bg-[#143943] rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header / Preview of Mascot */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-[#E5F5F7] via-[#DDF1F3] to-[#F2FBFC] dark:from-[#0D2730] dark:via-[#102F38] dark:to-[#143943] p-4 rounded-3xl border border-[#65C5CE]/40 dark:border-[#143943]">
              <div className="flex flex-col items-center justify-center bg-white/90 dark:bg-[#081B22]/90 p-3 rounded-2xl border border-[#65C5CE]/30 dark:border-[#143943] shadow-sm shrink-0">
                <MascotCharacter
                  mood="happy"
                  accessory={settings.currentAccessory}
                  size="md"
                />
                <span className="text-[10px] font-bold font-serif text-[#247C8C] dark:text-[#78DCE0] mt-1">
                  Bé nhỏ đại dương
                </span>
              </div>

              <div className="space-y-1 text-center sm:text-left flex-1">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#65C5CE]/20 text-[#247C8C] dark:text-[#78DCE0] text-xs font-bold font-serif">
                  <Sparkles className="w-3 h-3" />
                  <span>✦ Tủ đồ của bé</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold font-serif text-[#29464C] dark:text-[#DDF5F6] tracking-tight">
                  Phụ kiện & Trạng thái
                </h2>
                <p className="text-xs text-[#6B858A] dark:text-[#8FB6BC] leading-relaxed font-serif">
                  Thay đổi phụ kiện đã mở khóa, chọn vị trí ngồi và chế độ hoạt động cho bé nhé!
                </p>

                {/* Stats badge */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 font-serif">
                  <span className="text-[11px] px-2 py-0.5 rounded-lg bg-[#65C5CE]/20 text-[#247C8C] dark:text-[#78DCE0] font-semibold">
                    ✦ Phụ kiện: {unlockedCount}/{ACCESSORIES_LIST.length}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-lg bg-amber-100/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold">
                    🐾 Đã tìm thấy: {settings.foundCount || 0} lần
                  </span>
                </div>
              </div>
            </div>

            {/* Section 1: Accessories Selection */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold font-serif text-[#29464C] dark:text-[#DDF5F6] uppercase tracking-wider flex items-center gap-1.5">
                  <span>✦ Phụ kiện đeo trên người</span>
                </h3>
                <span className="text-[11px] text-[#6B858A] dark:text-[#8FB6BC]">
                  Chạm để trang bị
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ACCESSORIES_LIST.map((acc) => {
                  const unlocked = isUnlocked(acc.id);
                  const isSelected = settings.currentAccessory === acc.id;

                  return (
                    <button
                      key={acc.id}
                      onClick={() => handleSelectAccessory(acc.id)}
                      className={`relative flex flex-col items-start p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E5F5F7] dark:bg-[#143943] border-[#3FAAB7] dark:border-[#78DCE0] shadow-sm ring-1 ring-[#3FAAB7]'
                          : unlocked
                          ? 'bg-[#F2FBFC]/80 dark:bg-[#0D2730]/80 border-[#65C5CE]/30 dark:border-[#143943] hover:border-[#3FAAB7]'
                          : 'bg-slate-100/50 dark:bg-slate-800/40 border-dashed border-slate-300 dark:border-slate-700 opacity-60'
                      }`}
                    >
                      {/* Top icon and status */}
                      <div className="w-full flex items-center justify-between mb-1.5">
                        <span className="text-xl">{acc.icon}</span>
                        {isSelected ? (
                          <span className="p-1 rounded-full bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] text-white">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        ) : !unlocked ? (
                          <span className="text-slate-400">
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        ) : null}
                      </div>

                      <span className="text-xs font-bold font-serif text-[#29464C] dark:text-[#DDF5F6] line-clamp-1">
                        {acc.name}
                      </span>
                      <span className="text-[10px] text-[#6B858A] dark:text-[#8FB6BC] line-clamp-1 mt-0.5">
                        {unlocked ? acc.desc : acc.unlockHint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Display Mode (3 modes) */}
            <div className="space-y-2.5 pt-2 border-t border-[#65C5CE]/20 dark:border-[#143943]">
              <h3 className="text-xs font-bold font-serif text-[#29464C] dark:text-[#DDF5F6] uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#3FAAB7] dark:text-[#78DCE0]" />
                <span>3 Chế độ hiển thị của bé</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  {
                    id: 'always' as MascotDisplayMode,
                    title: '✦ Luôn hiện',
                    desc: 'Mascot luôn ở Home tại vị trí cố định',
                  },
                  {
                    id: 'free' as MascotDisplayMode,
                    title: '✧ Tự do',
                    desc: 'Thỉnh thoảng đổi vị trí hoặc trốn tìm quanh nhà',
                  },
                  {
                    id: 'quiet' as MascotDisplayMode,
                    title: '˚₊‧ Yên tĩnh',
                    desc: 'Chỉ xuất hiện khi chạm vào, cực kỳ tối giản',
                  },
                ].map((mode) => {
                  const isSelected = settings.displayMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => onUpdateSettings({ displayMode: mode.id })}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E5F5F7] dark:bg-[#143943] border-[#3FAAB7] dark:border-[#78DCE0] shadow-sm'
                          : 'bg-[#F2FBFC]/70 dark:bg-[#0D2730]/70 border-[#65C5CE]/30 dark:border-[#143943] hover:border-[#3FAAB7]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold font-serif text-[#29464C] dark:text-[#DDF5F6]">
                          {mode.title}
                        </span>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-[#3FAAB7]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#6B858A] dark:text-[#8FB6BC] leading-snug">
                        {mode.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Preferred Spot on Home (4 spots) */}
            <div className="space-y-2.5 pt-2 border-t border-[#65C5CE]/20 dark:border-[#143943]">
              <h3 className="text-xs font-bold font-serif text-[#29464C] dark:text-[#DDF5F6] uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#3FAAB7] dark:text-[#78DCE0]" />
                <span>Vị trí ngồi ưa thích trên Home</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-serif">
                {[
                  { id: 'window' as MascotSpot, icon: '🪟', name: 'Mép cửa sổ' },
                  { id: 'books' as MascotSpot, icon: '📚', name: 'Chồng sách' },
                  { id: 'table' as MascotSpot, icon: '🪵', name: 'Chiếc bàn nhỏ' },
                  { id: 'plant' as MascotSpot, icon: '🌱', name: 'Cạnh rạn/cây' },
                ].map((spot) => {
                  const isSelected = settings.currentSpot === spot.id;
                  return (
                    <button
                      key={spot.id}
                      onClick={() => onUpdateSettings({ currentSpot: spot.id })}
                      className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E5F5F7] dark:bg-[#143943] border-[#3FAAB7] dark:border-[#78DCE0] shadow-sm font-bold'
                          : 'bg-[#F2FBFC]/70 dark:bg-[#0D2730]/70 border-[#65C5CE]/30 dark:border-[#143943] hover:border-[#3FAAB7]'
                      }`}
                    >
                      <span className="text-xl block mb-1">{spot.icon}</span>
                      <span className="text-xs text-[#29464C] dark:text-[#DDF5F6]">
                        {spot.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Reading Mode Toggle & Hide-and-Seek Button */}
            <div className="pt-2 border-t border-[#65C5CE]/20 dark:border-[#143943] flex flex-col sm:flex-row items-center justify-between gap-3 font-serif">
              {/* Reading Mode Mascot Toggle */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.showInReader}
                  onChange={(e) => onUpdateSettings({ showInReader: e.target.checked })}
                  className="w-4 h-4 text-[#3FAAB7] rounded border-[#65C5CE] focus:ring-[#3FAAB7] accent-[#3FAAB7]"
                />
                <span className="text-xs font-semibold text-[#29464C] dark:text-[#DDF5F6] flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-[#3FAAB7] dark:text-[#78DCE0]" />
                  <span>Hiện bé trong chế độ đọc truyện</span>
                </span>
              </label>

              {/* Quick Hide-and-Seek Trigger */}
              {onStartHideAndSeek && (
                <button
                  onClick={() => {
                    onClose();
                    onStartHideAndSeek();
                  }}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] text-white text-xs font-bold shadow-md shadow-[#247C8C]/20 hover:scale-105 active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>🐾 Chơi trốn tìm với bé</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

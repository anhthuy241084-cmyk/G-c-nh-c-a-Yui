import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface WinterWelcomeFrameProps {
  onOpenRandom?: () => void;
  onOpenFortune?: () => void;
  streakCount?: number;
  onOpenStreak?: () => void;
}

export const WinterWelcomeFrame: React.FC<WinterWelcomeFrameProps> = ({
  streakCount = 1,
  onOpenStreak,
}) => {
  // Exact Pinterest Avatar link provided by user: https://pin.it/4D10n4qkf
  const avatarUrl = '/yui_avatar.jpg';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="relative w-full max-w-3xl mx-auto winter-welcome-frame rounded-3xl p-6 sm:p-9 text-center my-6 overflow-hidden select-none transition-all duration-300"
    >
      {/* 4 Corner Winter Ornaments */}
      <div className="absolute top-3 left-4 text-xs text-[#91A9BC] dark:text-[#A9BDCE] opacity-60">❄</div>
      <div className="absolute top-3 right-4 text-xs text-[#91A9BC] dark:text-[#A9BDCE] opacity-60">❄</div>
      <div className="absolute bottom-3 left-4 text-xs text-[#91A9BC] dark:text-[#A9BDCE] opacity-60">✦</div>
      <div className="absolute bottom-3 right-4 text-xs text-[#91A9BC] dark:text-[#A9BDCE] opacity-60">✦</div>

      {/* Subtle background ambient glow */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#D5E4EF]/40 dark:bg-[#354A60]/20 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Avatar with Silver-Blue Ring, Delicate curves and Hover Glow */}
      <div className="relative inline-block mb-3 group">
        {/* Soft background glow */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[#E8F1F8] via-[#D5E4EF] to-[#91A9BC] dark:from-[#354A60] dark:to-[#A9BDCE] blur-sm opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-b from-white via-[#E8F1F8] to-[#D5E4EF] dark:from-[#354A60] dark:via-[#202F42] dark:to-[#172536] shadow-md border border-[#DCE7EF] dark:border-[#43576B] overflow-hidden">
          <img
            src={avatarUrl}
            alt="Yui Avatar"
            className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Small floating snowflake badge */}
        <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#E8F1F8] dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] text-[11px] flex items-center justify-center text-[#526B80] dark:text-[#E5EDF5] shadow-xs">
          ❄
        </span>
      </div>

      {/* 2. Top Header Small Text */}
      <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-[#91A9BC] dark:text-[#A9BDCE] font-sans font-semibold mb-1">
        WELCOME TO MY LITTLE WINTER WORLD
      </p>

      {/* 3. Tên hiển thị: Yui */}
      <h2 className="text-2xl sm:text-3xl font-normal font-serif text-[#526B80] dark:text-[#E5EDF5] tracking-wide mb-1">
        Yui
      </h2>

      {/* 4. Tagline: "Một chút tuyết rơi, một đời thương nhớ." */}
      <p className="text-sm italic font-serif text-[#91A9BC] dark:text-[#A9BDCE] mb-4">
        &ldquo;Một chút tuyết rơi, một đời thương nhớ.&rdquo;
      </p>

      {/* 5. Lời chào */}
      <div className="max-w-xl mx-auto text-xs sm:text-sm font-sans font-normal leading-relaxed text-[#526B80]/90 dark:text-[#E5EDF5]/90 space-y-2.5 px-2">
        <p>Cảm ơn bạn đã ghé thăm khoảng trời tuyết nhỏ này.</p>
        <p>
          Giữa những ngày đông lặng lẽ, Yui đã dành riêng một góc nhỏ để cất giữ những nhân vật, những câu chuyện và những thế giới được tạo nên từ trí tưởng tượng.
        </p>
        <p>
          Mong rằng khi ghé qua nơi đây, bạn sẽ tìm thấy một câu chuyện khiến mình muốn dừng chân lâu hơn một chút.
        </p>
        <p className="text-[11px] sm:text-xs text-[#91A9BC] dark:text-[#A9BDCE] italic font-serif pt-1">
          Cứ thong thả dạo chơi nhé, chiếc hộp này luôn có chỗ dành cho những câu chuyện mới.
        </p>
      </div>

      {/* 6. Dòng kết trang trí */}
      <div className="mt-5 pt-3 border-t border-[#DCE7EF]/70 dark:border-[#43576B]/50 flex items-center justify-center gap-2 text-xs font-serif text-[#91A9BC] dark:text-[#A9BDCE]">
        <span>୨୧</span>
        <span>Thank you for being here</span>
        <span>୨୧</span>
      </div>

      {/* Streak pill indicator if user clicked streak */}
      {onOpenStreak && (
        <div className="mt-3 flex justify-center">
          <button
            onClick={onOpenStreak}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F1F8] dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] text-[11px] font-semibold text-[#526B80] dark:text-[#E5EDF5] hover:scale-105 transition-transform cursor-pointer"
            title="Xem chuỗi ghé thăm của bạn"
          >
            <span>❄ {streakCount} ngày ghé thăm</span>
          </button>
        </div>
      )}
    </motion.div>
  );
};

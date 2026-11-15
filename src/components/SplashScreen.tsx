import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Compass } from 'lucide-react';

interface SplashScreenProps {
  onEnter: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter }) => {
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    if (countdown <= 0) {
      onEnter();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, onEnter]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
      onClick={onEnter}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden bg-[#172536] text-[#E5EDF5]"
    >
      {/* Winter Twilight Frost Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#172536] via-[#202F42] to-[#27384D]" />

      {/* Glowing Ambient Frost Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#91A9BC]/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#526B80]/25 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Main Content Card */}
      <div className="relative z-10 max-w-lg px-8 py-10 mx-4 text-center rounded-3xl bg-[#202F42]/85 border border-[#43576B] backdrop-blur-xl shadow-2xl space-y-6">
        
        {/* Decorative Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#354A60]/50 border border-[#91A9BC]/35 text-[#E5EDF5] text-xs font-medium tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-[#A9BDCE]" />
          <span>Hộp Ký Ức Mùa Đông ❄️</span>
        </div>

        {/* Main Title */}
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-2xl sm:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#F7FAFD] via-[#DCE7EF] to-[#91A9BC] leading-relaxed drop-shadow-xs font-serif"
        >
          Ghé góc nhỏ mùa đông (｡･ω･｡)ﾉ♡
        </motion.h1>

        {/* Subtitle & Welcome Text */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-sm sm:text-base text-[#A9BDCE] font-light leading-relaxed font-serif"
        >
          Nơi tổng hợp và lưu trữ các nhân vật AI được sáng tạo & chăm chút tỉ mỉ. Hãy chọn một nhân vật để bắt đầu hành trình trò chuyện của riêng bạn.
        </motion.p>

        {/* Action Button & Timer Prompt */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="pt-4 flex flex-col items-center gap-3"
        >
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEnter();
            }}
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#526B80] to-[#354A60] hover:from-[#647F96] hover:to-[#43576B] text-white font-medium text-sm shadow-lg shadow-[#172536]/40 border border-[#91A9BC]/30 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Compass className="w-4 h-4 transition-transform group-hover:rotate-45" />
            <span>Mở hộp ký ức ❄️</span>
          </button>

          <p className="text-xs text-[#A9BDCE] font-normal">
            Chạm bất kỳ đâu hoặc tự động chuyển sau <span className="text-[#E5EDF5] font-semibold">{countdown}s</span>...
          </p>
        </motion.div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-[#A9BDCE]">
          <span>❄️</span>
          <span>Chào mừng bạn ghé thăm góc nhỏ (✿◠‿◠)</span>
        </div>

      </div>
    </motion.div>
  );
};

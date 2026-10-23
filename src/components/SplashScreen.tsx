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
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden bg-[#081B22] text-white"
    >
      {/* Deep Ocean Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#081B22] via-[#0D2730] to-[#12343C]" />

      {/* Glowing Ambient Cyan Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#65C5CE]/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#3FAAB7]/20 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Main Content Card */}
      <div className="relative z-10 max-w-lg px-8 py-10 mx-4 text-center rounded-3xl bg-[#102F38]/85 border border-[#65C5CE]/30 backdrop-blur-xl shadow-2xl space-y-6">
        
        {/* Decorative Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3FAAB7]/15 border border-[#65C5CE]/30 text-[#78DCE0] text-xs font-medium tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Thư viện Character AI đại dương</span>
        </div>

        {/* Main Title */}
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-2xl sm:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#DDF5F6] via-[#BDEBE5] to-[#78DCE0] leading-relaxed drop-shadow-xs font-serif"
        >
          Ghé góc nhỏ (｡･ω･｡)ﾉ♡
        </motion.h1>

        {/* Subtitle & Welcome Text */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-sm sm:text-base text-[#8FB6BC] font-light leading-relaxed font-serif"
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
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] text-white font-medium text-sm shadow-lg shadow-[#247C8C]/30 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Compass className="w-4 h-4 transition-transform group-hover:rotate-45" />
            <span>Khám phá ngay</span>
          </button>

          <p className="text-xs text-[#8FB6BC] font-normal">
            Chạm bất kỳ đâu hoặc tự động chuyển sau <span className="text-[#78DCE0] font-semibold">{countdown}s</span>...
          </p>
        </motion.div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-[#8FB6BC]">
          <span>✦</span>
          <span>Chào mừng bạn ghé thăm (✿◠‿◠)</span>
        </div>

      </div>
    </motion.div>
  );
};

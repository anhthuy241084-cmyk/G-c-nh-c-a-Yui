import React from 'react';
import { motion } from 'motion/react';

interface IntroLoadingScreenProps {
  onComplete: () => void;
}

export const IntroLoadingScreen: React.FC<IntroLoadingScreenProps> = ({ onComplete }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030D12] text-white p-6 font-serif">
      <div className="text-2xl sm:text-4xl mb-8 animate-pulse tracking-widest text-[#7DD8DE]">𓆝 𓆟 𓆞 𓆝 𓆟</div>
      
      <div className="w-64 sm:w-80 h-1.5 bg-[#1B6E7D]/30 rounded-full overflow-hidden border border-[#38CAD6]/20">
        <motion.div
          className="h-full bg-gradient-to-r from-[#38CAD6] to-[#1B6E7D] rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 4, ease: 'linear' }}
          onAnimationComplete={onComplete}
        />
      </div>
      <p className="mt-4 text-xs text-[#88A9B3] tracking-widest uppercase">Đang hòa mình vào đại dương...</p>
    </div>
  );
};

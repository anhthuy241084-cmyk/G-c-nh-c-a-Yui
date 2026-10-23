import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Compass, ChevronRight, Volume2, VolumeX, Heart, Waves } from 'lucide-react';
import { WelcomeLetterConfig, DEFAULT_WELCOME_LETTER } from '../types';
import { triggerSfx } from '../utils/sfx';

interface WelcomeLetterScreenProps {
  config?: WelcomeLetterConfig;
  onEnter: () => void;
  isPreview?: boolean;
  isSfxOn?: boolean;
  sfxVolume?: number;
}

export const WelcomeLetterScreen: React.FC<WelcomeLetterScreenProps> = ({
  onEnter,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onEnter();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onEnter]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-[#030D12] font-sans"
    >
      <div className="text-4xl mb-8 animate-pulse">𓆝 𓆟 𓆞 𓆝 𓆟</div>
      
      <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#38CAD6]"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 4, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
};

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface StarPageTransitionProps {
  isActive: boolean;
}

export const StarPageTransition: React.FC<StarPageTransitionProps> = ({ isActive }) => {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="ocean-page-transition"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 pointer-events-none z-[999] flex items-center justify-center overflow-hidden"
        >
          {/* 🌊 10. Diving Water Veil with soft blur and turquoise diffusion */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(5px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0 bg-[#65C5CE]/15 dark:bg-[#081B22]/50"
          />

          {/* Underwater Caustic Light Ripple */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1.8, opacity: [0, 0.7, 0] }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="absolute w-72 h-72 rounded-full border-2 border-[#65C5CE]/50 dark:border-[#78DCE0]/50 bg-radial from-[#65C5CE]/20 to-transparent"
          />

          {/* Flurry of Rising Diving Bubbles */}
          <div className="absolute inset-0 flex items-center justify-around pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: 80, opacity: 0, scale: 0.5 }}
                animate={{
                  y: -120,
                  opacity: [0, 0.85, 0],
                  scale: [0.6, 1.2, 0.8],
                  x: (i % 2 === 0 ? 1 : -1) * (15 + i * 8),
                }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                className="w-3 h-3 rounded-full border border-white/80 bg-white/40 dark:border-[#78DCE0]/80 dark:bg-[#57C8D1]/30 shadow-[0_0_8px_rgba(101,197,206,0.6)]"
              />
            ))}
          </div>

          {/* Oceanic Current Glyphs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 1, 0], y: -10 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 flex items-center gap-2 text-xs font-serif tracking-widest text-[#247C8C] dark:text-[#78DCE0] uppercase"
          >
            <span>〜</span>
            <span>✦</span>
            <span>〜</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

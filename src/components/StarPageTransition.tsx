import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface StarPageTransitionProps {
  isActive: boolean;
}

const SNOW_MOTES = [
  { x: -175, y: -90, delay: 0.02, size: 15, rot: 45 },
  { x: 160, y: -78, delay: 0.05, size: 13, rot: -60 },
  { x: -115, y: 105, delay: 0.08, size: 17, rot: 90 },
  { x: 130, y: 92, delay: 0.04, size: 14, rot: -45 },
  { x: -215, y: 16, delay: 0.1, size: 12, rot: 120 },
  { x: 215, y: 14, delay: 0.07, size: 12, rot: -110 },
  { x: 0, y: -135, delay: 0.03, size: 16, rot: 60 },
  { x: 0, y: 135, delay: 0.09, size: 14, rot: -80 },
];

export const StarPageTransition: React.FC<StarPageTransitionProps> = ({ isActive }) => {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="winter-curtain-transition"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.38, ease: 'easeInOut' }}
          className="fixed inset-0 pointer-events-none z-[999] flex items-center justify-center overflow-hidden"
          aria-hidden="true"
        >
          {/* Airy Soft Frost Mist Veil (Zero Glare Streaks, Zero Clunky Text) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.85, 0] }}
            transition={{ duration: 0.82, ease: 'easeInOut' }}
            className="absolute inset-0 bg-[#F0F7FE]/78 dark:bg-[#131F30]/80 backdrop-blur-md"
          />

          {/* Soft Blooming Ice Crystal Ring */}
          <motion.div
            initial={{ scale: 0.55, opacity: 0 }}
            animate={{ scale: 1.9, opacity: [0, 0.55, 0] }}
            transition={{ duration: 0.78, ease: 'easeOut' }}
            className="absolute w-64 h-64 rounded-full border border-[#A6C8E8]/55 dark:border-[#9EC1E3]/35 bg-[#FFFFFF]/40 dark:bg-[#23354C]/25"
          />

          {/* Central Delicate Six-Point SVG Snow Crystal & Drifting Snowflakes */}
          <div className="relative z-10 flex items-center justify-center">
            <motion.svg
              width="62"
              height="62"
              viewBox="0 0 64 64"
              fill="none"
              initial={{ scale: 0.7, opacity: 0, rotate: -25 }}
              animate={{ scale: [0.75, 1.08, 1.28], opacity: [0, 0.92, 0], rotate: 45 }}
              transition={{ duration: 0.78, ease: 'easeOut' }}
              className="text-[#5380AD] dark:text-[#D5E8FA]"
            >
              <path
                d="M32 6V58M9.5 19L54.5 45M54.5 19L9.5 45"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M27 12L32 17L37 12M27 52L32 47L37 52M13 26L19 25L18 19M46 45L45 39L51 38M51 26L45 25L46 19M18 45L19 39L13 38"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="32" cy="32" r="4.2" stroke="currentColor" strokeWidth="1.5" />
            </motion.svg>

            {SNOW_MOTES.map((p, idx) => (
              <motion.svg
                key={idx}
                width={p.size}
                height={p.size}
                viewBox="0 0 24 24"
                fill="none"
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.5, rotate: 0 }}
                animate={{
                  x: p.x,
                  y: p.y + 18,
                  opacity: [0, 0.85, 0],
                  scale: [0.5, 1.05, 0.7],
                  rotate: p.rot,
                }}
                transition={{ duration: 0.76, delay: p.delay, ease: 'easeOut' }}
                className="absolute text-[#7BA4CC] dark:text-[#D4E7FA]"
              >
                <path
                  d="M12 2V22M3.34 7L20.66 17M20.66 7L3.34 17"
                  stroke="currentColor"
                  strokeWidth="1.65"
                  strokeLinecap="round"
                />
              </motion.svg>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

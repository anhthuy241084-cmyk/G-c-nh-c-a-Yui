import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MascotCharacter } from './MascotCharacter';

interface CustomLoadingScreenProps {
  isLoading: boolean;
  message?: string;
  isFullPage?: boolean;
}

export const CustomLoadingScreen: React.FC<CustomLoadingScreenProps> = ({
  isLoading,
  message = 'Ghé góc nhỏ của Yui ♡ Đang mở cửa...',
  isFullPage = true,
}) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`${
            isFullPage ? 'fixed inset-0 z-50' : 'relative w-full py-12'
          } flex flex-col items-center justify-center p-6 bg-rose-50/90 dark:bg-slate-950/95 backdrop-blur-md text-slate-800 dark:text-slate-100 select-none`}
        >
          <div className="relative flex flex-col items-center justify-center mb-4">
            {/* Soft pulsing glow ring */}
            <motion.div
              animate={{ scale: [0.9, 1.25, 0.9], opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="absolute w-28 h-28 rounded-full bg-rose-400/20 dark:bg-purple-500/20 blur-xl"
            />

            {/* Mascot Waiting & Swining legs */}
            <div className="relative flex flex-col items-center">
              <MascotCharacter mood="cheering" size="lg" />
              {/* Floating stars around mascot */}
              <motion.span
                animate={{ opacity: [0.2, 1, 0.2], y: [-4, 4, -4] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute -top-2 -right-3 text-rose-400 dark:text-purple-300 text-sm font-bold"
              >
                ✦
              </motion.span>
              <motion.span
                animate={{ opacity: [0.2, 1, 0.2], y: [4, -4, 4] }}
                transition={{ repeat: Infinity, duration: 1.8, delay: 0.3 }}
                className="absolute -bottom-1 -left-3 text-pink-400 dark:text-pink-300 text-sm font-bold"
              >
                ♡
              </motion.span>
            </div>
          </div>

          {/* Subtitle text */}
          <motion.p
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-200 tracking-wide text-center"
          >
            {message}
          </motion.p>

          <span className="text-[11px] text-rose-500 dark:text-rose-400 mt-1.5 font-medium flex items-center gap-1">
            <span>(｡･ω･｡)ﾉ♡ Chờ một chút nhé...</span>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


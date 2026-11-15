import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Snowflake } from 'lucide-react';

interface CustomLoadingScreenProps {
  isLoading: boolean;
  message?: string;
  isFullPage?: boolean;
}

export const CustomLoadingScreen: React.FC<CustomLoadingScreenProps> = ({
  isLoading,
  message = 'Ghé góc nhỏ của Yui · Đang mở hộp ký ức...',
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
          } flex flex-col items-center justify-center p-6 bg-[#F4F9FF]/92 dark:bg-[#121F32]/95 backdrop-blur-md text-[#16273B] dark:text-[#E5EDF5] select-none`}
        >
          <div className="relative flex flex-col items-center justify-center mb-4">
            <motion.div
              animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.35, 0.75, 0.35] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              className="absolute w-24 h-24 rounded-full bg-[#7EAAD4]/30 blur-xl"
            />

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 9, ease: 'linear' }}
              className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-[#DCEBF9] dark:from-[#20334A] dark:to-[#172536] border border-[#BFD8EE] dark:border-[#49698C] shadow-lg flex items-center justify-center text-[#4E7AA5] dark:text-[#A8CDF0]"
            >
              <Snowflake className="w-8 h-8" />
            </motion.div>
          </div>

          <motion.p
            animate={{ opacity: [0.75, 1, 0.75] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="text-xs md:text-sm font-bold font-serif text-[#16273B] dark:text-white tracking-wide text-center"
          >
            {message}
          </motion.p>

          <span className="text-[11px] text-[#5E7C99] dark:text-[#A4C0DA] mt-1.5 font-serif">
            Hẹn nhau ở cuối mùa đông, nơi tuyết chưa tan ❄
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

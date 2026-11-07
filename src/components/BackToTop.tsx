import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || window.pageYOffset;
          if (scrollY > 250) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 z-40"
        >
          <button
            onClick={scrollToTop}
            className="group relative p-3 rounded-full bg-gradient-to-tr from-[#91A9BC] to-[#6E899E] hover:from-[#A2B9CB] hover:to-[#7E99AD] text-white shadow-lg hover:shadow-xl shadow-[#91A9BC]/30 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center border border-[#DCE7EF] dark:border-[#43576B]"
            title="Lên đầu trang"
            aria-label="Lên đầu trang"
          >
            <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />

            {/* Hover Tooltip */}
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-[#172536]/90 dark:bg-white text-white dark:text-[#172536] text-xs font-serif font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-md border border-[#DCE7EF]/30">
              Lên đầu trang ❄
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

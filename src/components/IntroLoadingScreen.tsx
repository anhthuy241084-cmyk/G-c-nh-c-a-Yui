import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Snowflake, Sparkles } from 'lucide-react';
import { SnowfallBackground } from './SnowfallBackground';
import { triggerSfx } from '../utils/sfx';

interface IntroLoadingScreenProps {
  onComplete: () => void;
}

const FLOATING_STARS = [
  { id: 's1', top: '14%', left: '12%', size: 15, delay: 0, duration: 5.4 },
  { id: 's2', top: '21%', left: '84%', size: 18, delay: 0.8, duration: 6.2 },
  { id: 's3', top: '36%', left: '19%', size: 11, delay: 1.5, duration: 4.8 },
  { id: 's4', top: '42%', left: '78%', size: 13, delay: 0.4, duration: 5.9 },
  { id: 's5', top: '58%', left: '10%', size: 16, delay: 2.1, duration: 6.5 },
  { id: 's6', top: '60%', left: '88%', size: 14, delay: 1.1, duration: 5.1 },
];

export const IntroLoadingScreen: React.FC<IntroLoadingScreenProps> = ({ onComplete }) => {
  const [isOpening, setIsOpening] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const bgVideoRef = useRef<HTMLVideoElement | null>(null);
  const mainVideoRef = useRef<HTMLVideoElement | null>(null);

  const videoUrl = '/winter_intro_video.mp4';
  const fallbackPoster = '/winter_homepage_bg.jpg';

  useEffect(() => {
    if (mainVideoRef.current) {
      mainVideoRef.current.play().catch(() => {});
    }
    if (bgVideoRef.current) {
      bgVideoRef.current.play().catch(() => {});
    }
  }, []);

  const handleOpenBox = () => {
    if (isOpening) return;
    setIsOpening(true);
    triggerSfx('reveal', 0.45);
    setTimeout(() => {
      onComplete();
    }, 780);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isOpening ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex flex-col justify-between overflow-hidden select-none bg-[#152236]"
    >
      {/* Video Layer */}
      {!videoError ? (
        <>
          {/* Mobile ambient blurred backdrop so 16:9 blossoms never crop awkwardly on portrait phones */}
          <video
            ref={bgVideoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            className="sm:hidden absolute inset-0 w-full h-full object-cover scale-125 blur-2xl opacity-60 pointer-events-none"
            src={videoUrl}
          />

          {/* Mobile feathered luminous cinema centerpiece + Desktop full-bleed luminous video */}
          <div className="sm:hidden absolute inset-x-0 top-[12%] flex items-center justify-center pointer-events-none">
            <div
              className="w-full aspect-video overflow-hidden"
              style={{
                WebkitMaskImage:
                  'linear-gradient(180deg, transparent 0%, black 14%, black 84%, transparent 100%)',
                maskImage:
                  'linear-gradient(180deg, transparent 0%, black 14%, black 84%, transparent 100%)',
              }}
            >
              <video
                ref={mainVideoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                onError={() => setVideoError(true)}
                className={`w-full h-full object-cover transition-transform duration-1000 ${
                  isOpening ? 'scale-105 opacity-75' : 'scale-100 opacity-100'
                }`}
                src={videoUrl}
              />
            </div>
          </div>

          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onError={() => setVideoError(true)}
            className={`hidden sm:block absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${
              isOpening ? 'scale-105 opacity-75 blur-[2px]' : 'scale-100 opacity-100'
            }`}
            src={videoUrl}
          />
        </>
      ) : (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url('${fallbackPoster}')` }}
        />
      )}

      {/* Feather-light twilight atmospheric vignette + dreamy aurora glow (zero hard frame edges) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(16,28,48,0.44) 0%, rgba(16,28,48,0.06) 28%, rgba(16,28,48,0.12) 52%, rgba(14,25,44,0.86) 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-[-12%] h-[58%] pointer-events-none opacity-75"
        style={{
          background:
            'radial-gradient(ellipse 75% 60% at 50% 82%, rgba(154,205,255,0.22) 0%, rgba(196,181,253,0.12) 42%, transparent 76%)',
        }}
      />

      {/* Quiet drifting snow + unboxed luminous four-point ice stars */}
      <SnowfallBackground
        settings={{ isEnabled: true, density: 'medium', speed: 'slow', opacity: 'medium' }}
        themeMode="dark"
      />

      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
        {FLOATING_STARS.map((star) => (
          <motion.svg
            key={star.id}
            viewBox="0 0 24 24"
            fill="none"
            style={{ top: star.top, left: star.left, width: star.size, height: star.size }}
            className="absolute text-[#E3F1FF]/80 drop-shadow-[0_0_8px_rgba(186,230,253,0.75)]"
            animate={{
              opacity: [0.22, 0.85, 0.28],
              scale: [0.85, 1.12, 0.88],
              rotate: [0, 12, -8, 0],
            }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <path
              d="M12 1.5L14.1 9.9L22.5 12L14.1 14.1L12 22.5L9.9 14.1L1.5 12L9.9 9.9L12 1.5Z"
              fill="currentColor"
            />
          </motion.svg>
        ))}
      </div>

      {/* Smooth Two-Wing Frosted Mist Reveal (No clunky transition text) */}
      <AnimatePresence>
        {isOpening && (
          <>
            <motion.div
              initial={{ x: '-100%', opacity: 0.4 }}
              animate={{ x: '0%', opacity: 0.96 }}
              transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 w-1/2 z-40 pointer-events-none bg-[#EAF3FD]/95 dark:bg-[#162336]/95 backdrop-blur-md border-r border-white/50"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0.4 }}
              animate={{ x: '0%', opacity: 0.96 }}
              transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 right-0 w-1/2 z-40 pointer-events-none bg-[#EAF3FD]/95 dark:bg-[#162336]/95 backdrop-blur-md border-l border-white/50"
            />
          </>
        )}
      </AnimatePresence>

      {/* Clean Unboxed Top Strip */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-10 pt-4 sm:pt-7">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-serif text-white/90 drop-shadow-[0_1px_8px_rgba(12,24,46,0.75)]"
        >
          <Snowflake className="w-3.5 h-3.5 text-[#D8ECFF] animate-[spin_14s_linear_infinite]" />
          <span className="italic tracking-wide">Góc nhỏ của Yui</span>
        </motion.div>

        <button
          type="button"
          onClick={onComplete}
          className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-serif font-medium text-white/95 bg-white/12 hover:bg-white/24 backdrop-blur-sm transition-colors cursor-pointer"
          title="Vào thẳng trang chủ"
        >
          <span>Bỏ qua</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Unobstructed Window for the Blooming Winter Scene */}
      <div className="flex-1 pointer-events-none" />

      {/* Strictly Unboxed Atmospheric Title & Action Over Twilight Mist */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: isOpening ? 0 : 1, y: isOpening ? -10 : 0 }}
        transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 w-full max-w-2xl mx-auto px-5 sm:px-8 pb-8 sm:pb-12 text-center space-y-3.5 sm:space-y-4"
      >
        {/* Open Calligraphic Winter Crest (Zero box / zero enclosing rectangle) */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] font-serif text-[#DCEEFF]/85 drop-shadow-[0_1px_8px_rgba(10,20,38,0.85)]">
            Khu Vườn Ký Ức Tuyết Trắng
          </span>

          <div className="flex items-center justify-center gap-3 w-full max-w-[260px] text-[#E6F3FF]/80">
            <svg viewBox="0 0 90 14" fill="none" className="w-20 h-3.5 opacity-80">
              <path
                d="M88 7C68 7 56 2 38 4.5C22 6.7 12 10 2 7"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeOpacity="0.6"
              />
              <circle cx="44" cy="4.2" r="1.5" fill="currentColor" fillOpacity="0.85" />
            </svg>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              className="shrink-0 text-[#EBF6FF] drop-shadow-[0_0_10px_rgba(186,230,253,0.9)]"
            >
              <Snowflake className="w-4 h-4" />
            </motion.div>
            <svg viewBox="0 0 90 14" fill="none" className="w-20 h-3.5 opacity-80 scale-x-[-1]">
              <path
                d="M88 7C68 7 56 2 38 4.5C22 6.7 12 10 2 7"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeOpacity="0.6"
              />
              <circle cx="44" cy="4.2" r="1.5" fill="currentColor" fillOpacity="0.85" />
            </svg>
          </div>
        </div>

        {/* Floating Poetic Headline + Tagline (Zero background card, zero box border) */}
        <div className="space-y-2.5">
          <h1 className="text-[2rem] sm:text-[3.15rem] font-semibold font-display tracking-tight leading-[1.12] text-white drop-shadow-[0_4px_22px_rgba(12,24,46,0.85)] [text-wrap:balance]">
            Hộp Ký Ức{' '}
            <span className="bg-gradient-to-r from-[#FFFFFF] via-[#DCEFFF] to-[#C8DEFF] bg-clip-text text-transparent drop-shadow-[0_2px_18px_rgba(147,197,253,0.45)]">
              Mùa Đông
            </span>
          </h1>

          <div className="flex items-center justify-center gap-2.5 text-[#D8ECFF]/75">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#DCEEFF]/60" />
            <Sparkles className="w-3 h-3 text-[#E5F2FF]" />
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#DCEEFF]/60" />
          </div>

          <p className="text-sm sm:text-lg italic font-serif text-[#EEF6FF] leading-relaxed drop-shadow-[0_2px_12px_rgba(10,20,38,0.88)] max-w-xl mx-auto">
            &ldquo;Hẹn nhau ở cuối mùa đông, nơi tuyết chưa tan.&rdquo;
          </p>
        </div>

        {/* Breathing Luminous Halo CTA + Gentle Sub-cue */}
        <div className="pt-2 flex flex-col items-center gap-2.5">
          <div className="relative inline-flex items-center justify-center">
            <motion.span
              aria-hidden="true"
              animate={{ scale: [1, 1.09, 1], opacity: [0.35, 0.62, 0.35] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -inset-2 rounded-full bg-gradient-to-r from-[#A5D4FF]/45 via-[#E8F4FF]/55 to-[#C7D2FE]/45 blur-md pointer-events-none"
            />

            <button
              type="button"
              onClick={handleOpenBox}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              disabled={isOpening}
              className="relative group inline-flex items-center gap-3 min-h-[48px] pl-2.5 pr-6 py-2 rounded-full bg-white/95 hover:bg-white text-[#223C59] shadow-[0_12px_34px_-6px_rgba(14,28,54,0.62)] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <span
                className={`w-8 h-8 rounded-full bg-[#EAF3FD] flex items-center justify-center transition-transform duration-500 ${
                  isOpening ? 'rotate-180 scale-110' : isHovered ? 'rotate-45' : 'rotate-0'
                }`}
              >
                <Snowflake className="w-4 h-4 text-[#5380AD]" />
              </span>

              <span className="text-sm font-serif font-bold tracking-wide whitespace-nowrap">
                {isOpening ? 'Đang hé mở mùa đông...' : 'Mở chiếc hộp ký ức'}
              </span>

              <ArrowRight className="w-4 h-4 text-[#5380AD] transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>

          <span className="text-[11px] font-serif italic text-[#D9ECFF]/75 tracking-wide drop-shadow-[0_1px_6px_rgba(10,20,38,0.85)]">
            Chạm nhẹ để bước vào thế giới nhân vật
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

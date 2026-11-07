import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SnowfallBackground } from './SnowfallBackground';

interface IntroLoadingScreenProps {
  onComplete: () => void;
}

export const IntroLoadingScreen: React.FC<IntroLoadingScreenProps> = ({ onComplete }) => {
  const [isOpening, setIsOpening] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Video provided by user from Pinterest: https://pin.it/6JKZ0tIZI
  const [videoUrl] = useState<string>('/winter_intro_video.mp4');
  const [fallbackPoster] = useState<string>('https://i.pinimg.com/736x/a0/57/18/a057180bef75f78c1b87e0c06af719a2.jpg');

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy or video decoding handled gracefully
      });
    }
  }, []);

  const handleOpenBox = () => {
    setIsOpening(true);
    setTimeout(() => {
      onComplete();
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isOpening ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden select-none"
    >
      {/* 1. Full-screen Video Background with fallback */}
      {!videoError ? (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onError={() => setVideoError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${
            isOpening ? 'scale-105 blur-sm' : 'scale-100 blur-0'
          }`}
          src={videoUrl}
        />
      ) : null}

      {/* Fallback image with same winter aesthetic if video fails or blocked */}
      <div
        className={`absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-1000 ${
          videoError ? 'opacity-100' : 'opacity-0'
        } ${isOpening ? 'scale-105 blur-sm' : 'scale-100'}`}
        style={{
          backgroundImage: `url('${fallbackPoster}')`,
        }}
      />

      {/* 2. Soft translucent white-blue / ice-blue overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#172536]/35 via-[#202F42]/20 to-[#172536]/50 pointer-events-none" />
      <div className="absolute inset-0 bg-[#E8F1F8]/15 backdrop-blur-[1px] pointer-events-none" />

      {/* 3. Foreground gentle snowfall */}
      <SnowfallBackground
        settings={{ isEnabled: true, density: 'medium', speed: 'slow', opacity: 'medium' }}
        themeMode="dark"
      />

      {/* 4. Top-right "Bỏ qua" (Skip) button */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={onComplete}
          className="text-xs tracking-wider text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/25 transition-all active:scale-95 cursor-pointer font-serif"
          title="Bỏ qua intro và vào thẳng trang chủ"
        >
          Bỏ qua
        </button>
      </div>

      {/* 5. Central Content Layout */}
      <div className="relative z-10 max-w-2xl w-full mx-4 px-6 py-10 text-center flex flex-col items-center justify-center space-y-6">
        
        {/* Dòng chữ nhỏ phía trên */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xs sm:text-sm tracking-[0.3em] uppercase text-[#D5E4EF] font-medium"
        >
          WINTER MEMORY BOX
        </motion.p>

        {/* Tên website */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="text-3xl sm:text-5xl md:text-6xl font-normal text-[#F7FAFD] font-serif tracking-tight drop-shadow-md"
        >
          Hộp Ký Ức Mùa Đông
        </motion.h1>

        {/* Tagline chính */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-base sm:text-lg italic text-[#E8F1F8] font-serif max-w-lg leading-relaxed drop-shadow"
        >
          &ldquo;Tuyết năm ấy phủ kín trời đất, chôn theo mối tình khắc cốt ghi tâm&rdquo;
        </motion.p>

        {/* Decorative divider ✦ ୨୧ ❄ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex items-center gap-3 text-sm text-[#A9BDCE]"
        >
          <span className="w-8 h-[1px] bg-white/30" />
          <span>✦ ୨୧ ❄</span>
          <span className="w-8 h-[1px] bg-white/30" />
        </motion.div>

        {/* Đoạn giới thiệu */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.8 }}
          className="text-xs sm:text-sm text-white/90 font-sans font-light leading-relaxed max-w-md drop-shadow-sm px-2"
        >
          Chào mừng đến với chiếc hộp nhỏ giữa mùa đông. Nơi những nhân vật, những câu chuyện và cả những thế giới tưởng tượng được cất giữ cẩn thận. Mỗi người đều có một câu chuyện riêng, và mỗi câu chuyện đều xứng đáng có một nơi để ở lại.
        </motion.p>

        {/* Nút truy cập: [Mở chiếc hộp] */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="pt-2"
        >
          <button
            onClick={handleOpenBox}
            disabled={isOpening}
            className="group relative px-8 py-3 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 text-[#F7FAFD] hover:text-white border border-white/40 hover:border-white/70 shadow-lg hover:shadow-white/20 backdrop-blur-md transition-all duration-300 font-serif text-sm tracking-wide flex items-center gap-2.5 cursor-pointer"
          >
            <span className="text-base">❄</span>
            <span className="font-medium">Mở chiếc hộp</span>
            <span className="text-base transition-transform group-hover:translate-x-1">→</span>
          </button>
        </motion.div>

        {/* Dòng chữ trang trí phía dưới */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-[#A9BDCE] font-sans pt-4"
        >
          A LITTLE BOX OF STORIES, CHARACTERS &amp; MEMORIES
        </motion.p>

      </div>
    </motion.div>
  );
};

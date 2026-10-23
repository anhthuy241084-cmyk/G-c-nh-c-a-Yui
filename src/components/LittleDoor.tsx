import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface LittleDoorProps {
  isAudioPlaying?: boolean;
}

const DOOR_GREETINGS = [
  'Đã thấy bạn rồi đó ♡',
  'Ghé chơi một chút nhé (｡･ω･｡)ﾉ♡',
  'Góc nhỏ luôn chào đón bạn ✦',
  'Hôm nay bạn thế nào? Lời nhắn ở đây nè',
  'Cảm ơn bạn đã ghé thăm hôm nay (｡♥‿♥｡)',
  'Chúc bạn một ngày thật dịu dàng và bình yên',
  'Bạn đã uống nước chưa? Nghỉ ngơi xíu nhé ☕',
];

export const LittleDoor: React.FC<LittleDoorProps> = ({ isAudioPlaying }) => {
  const [doorState, setDoorState] = useState<'closed' | 'knocking' | 'open'>('closed');
  const [greeting, setGreeting] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const handleDoorClick = () => {
    if (doorState !== 'closed') return;

    if (isAudioPlaying) {
      playKnockSound();
    }

    setDoorState('knocking');

    const randomMsg = DOOR_GREETINGS[Math.floor(Math.random() * DOOR_GREETINGS.length)];
    setGreeting(randomMsg);

    setTimeout(() => {
      setDoorState('open');

      setTimeout(() => {
        setDoorState('closed');
      }, 4000);
    }, 450);
  };

  const playKnockSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') ctx.resume();

      const knock = (timeDelay: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, ctx.currentTime + timeDelay);
        osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + timeDelay + 0.08);

        gain.gain.setValueAtTime(0.25, ctx.currentTime + timeDelay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + timeDelay + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + timeDelay);
        osc.stop(ctx.currentTime + timeDelay + 0.09);
      };

      knock(0);
      knock(0.12);
      knock(0.24);
    } catch (e) {
      // Audio context fallbacks ignored safely
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-5 my-4 bg-gradient-to-br from-[#E5F5F7]/90 via-[#DDF1F3]/60 to-[#F2FBFC]/80 dark:from-[#081B22] dark:via-[#0D2730] dark:to-[#102F38] rounded-3xl border border-[#65C5CE]/40 dark:border-[#78DCE0]/20 shadow-xs dark:shadow-[0_4px_24px_rgba(107,221,229,0.06)] overflow-hidden select-none transition-all duration-300">
      {/* Decorative ambient sparkles */}
      <div className="absolute top-3 left-5 text-[#3FAAB7] dark:text-[#78DCE0]/60 opacity-60 animate-pulse text-xs">✦</div>
      <div className="absolute top-6 right-6 text-[#65C5CE] dark:text-[#57C8D1]/60 opacity-60 animate-pulse text-xs">✧</div>
      <div className="absolute bottom-3 left-7 text-[#3FAAB7] dark:text-[#78DCE0]/60 opacity-50 animate-pulse text-xs">〜</div>
      <div className="absolute bottom-4 right-8 text-[#247C8C] dark:text-[#78DCE0]/60 opacity-50 animate-pulse text-xs">✦</div>

      {/* Header Info */}
      <div className="text-center mb-2.5 space-y-0.5 z-10 font-serif">
        <div className="flex items-center justify-center gap-1.5 text-xs font-black tracking-wide text-[#247C8C] dark:text-[#78DCE0]">
          <span>✦ Gõ cửa đại dương</span>
        </div>
        <p className="text-[11px] font-medium text-[#6B858A] dark:text-[#8FB6BC]">
          Chạm vào chiếc cửa nhỏ để nhận lời chào nhé!
        </p>
      </div>

      {/* Door Frame Stage */}
      <div className="relative w-36 h-48 my-1 flex items-center justify-center">
        {/* Door Frame Arched Surround */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#DDF1F3] via-[#E5F5F7] to-[#F2FBFC] dark:from-[#143943] dark:via-[#102F38] dark:to-[#081B22] rounded-t-full border-[5px] border-[#65C5CE]/60 dark:border-[#78DCE0]/30 shadow-inner overflow-hidden flex items-end justify-center">
          
          {/* Inside Room when Door Opens */}
          <AnimatePresence>
            {doorState === 'open' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 bg-gradient-to-b from-[#F2FBFC] via-[#E5F5F7] to-[#DDF1F3] dark:from-[#0D2730] dark:via-[#102F38] dark:to-[#143943] flex flex-col items-center justify-center p-3 text-center shadow-[0_0_24px_rgba(101,197,206,0.5)] z-0"
              >
                <motion.div
                  animate={{ y: [-2, -6, -2], scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 1.6 }}
                  className="flex items-center gap-1.5 text-[#3FAAB7] dark:text-[#78DCE0] text-xs mb-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span className="text-sm">🐚</span>
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                </motion.div>

                {/* Cozy Message inside */}
                <p className="text-[11px] font-bold text-[#29464C] dark:text-[#DDF5F6] leading-snug break-words px-1 font-serif">
                  {greeting}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wooden / Sea Glass Door Panel */}
          <motion.div
            onClick={handleDoorClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            animate={
              doorState === 'open'
                ? { rotateY: -105, x: -14, opacity: 0.15 }
                : doorState === 'knocking'
                ? { x: [-3, 3, -3, 3, 0], scale: [1, 1.02, 1] }
                : isHovered
                ? { rotateY: -14, scale: 1.01 }
                : { rotateY: 0, scale: 1 }
            }
            transition={{ duration: doorState === 'open' ? 0.6 : 0.2 }}
            style={{ transformOrigin: 'left center' }}
            className="relative w-full h-full bg-gradient-to-br from-[#E5F5F7] via-[#DDF1F3] to-[#C7E3F0] dark:from-[#143943] dark:via-[#102F38] dark:to-[#0D2730] rounded-t-full border-r-[3px] border-[#65C5CE]/60 dark:border-[#78DCE0]/40 shadow-md cursor-pointer flex flex-col items-center justify-between p-3 select-none z-10 transition-colors"
          >
            {/* Sea Pearl Crest on Door Top */}
            <motion.div
              animate={isHovered || doorState === 'knocking' ? { rotate: [-8, 8, -8] } : { rotate: 0 }}
              transition={{ repeat: Infinity, duration: 0.7 }}
              className="text-lg mt-0.5 filter drop-shadow-xs select-none"
            >
              🐚
            </motion.div>

            {/* Inset */}
            <div className="w-18 h-14 border-2 border-[#65C5CE]/60 dark:border-[#78DCE0]/30 rounded-xl bg-white/50 dark:bg-black/20 my-auto flex flex-col items-center justify-center gap-0.5 shadow-inner">
              <span className="text-[10px] tracking-widest text-[#247C8C] dark:text-[#78DCE0] font-bold">✦ ✧ ✦</span>
              <span className="text-[9px] text-[#3FAAB7] dark:text-[#57C8D1] font-serif italic">ocean cove</span>
            </div>

            {/* Cyan / Pearl Door Knob with glow */}
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
              <div
                className={`w-3.5 h-3.5 rounded-full border border-[#65C5CE] shadow-md transition-all duration-200 ${
                  isHovered
                    ? 'bg-gradient-to-br from-[#78DCE0] to-[#3FAAB7] ring-4 ring-[#78DCE0]/40 scale-125 shadow-[0_0_12px_rgba(107,221,229,0.8)]'
                    : 'bg-gradient-to-br from-[#65C5CE] to-[#247C8C] shadow-[0_0_6px_rgba(101,197,206,0.4)]'
                }`}
              />
            </div>

            {/* Bottom Wood Threshold Detail */}
            <div className="w-full h-1.5 bg-[#65C5CE]/60 dark:bg-[#12343C] rounded-full" />
          </motion.div>
        </div>
      </div>

      {/* Knock status message below */}
      <div className="h-5 flex items-center justify-center text-center mt-1 font-serif">
        {doorState === 'knocking' && (
          <motion.span
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-bold text-[#247C8C] dark:text-[#78DCE0] animate-bounce"
          >
            Cốc cốc... ai đó?
          </motion.span>
        )}
        {doorState === 'open' && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[11px] font-bold text-[#3FAAB7] dark:text-[#78DCE0]"
          >
            Cánh cửa mở ra rồi nè (｡♥‿♥｡) ✦
          </motion.span>
        )}
        {doorState === 'closed' && (
          <span className="text-[10px] font-medium text-[#6B858A] dark:text-[#8FB6BC]">
            *Nhấn vào cửa để gõ*
          </span>
        )}
      </div>
    </div>
  );
};

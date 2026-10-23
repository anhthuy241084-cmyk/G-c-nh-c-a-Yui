import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MascotMood, MascotAccessoryId } from '../types';

interface MascotCharacterProps {
  mood?: MascotMood;
  accessory?: MascotAccessoryId;
  size?: 'sm' | 'md' | 'lg';
  isNightMode?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  isPeeking?: boolean;
  peekingDirection?: 'left' | 'right' | 'top' | 'bottom';
}

export const MascotCharacter: React.FC<MascotCharacterProps> = ({
  mood = 'normal',
  accessory = 'none',
  size = 'md',
  isNightMode = false,
  onClick,
  className = '',
  isPeeking = false,
  peekingDirection = 'bottom',
}) => {
  // Idle cycle states (blinking, leg swing, look around, yawning)
  const [isBlinking, setIsBlinking] = useState(false);
  const [idleLook, setIdleLook] = useState<'center' | 'left' | 'right' | 'up'>('center');
  const [isYawning, setIsYawning] = useState(false);
  const [isSwayingLegs, setIsSwayingLegs] = useState(false);

  // Automatic gentle idle loop
  useEffect(() => {
    // 1. Natural Blinking interval (every 3.5 - 6s)
    const blinkInterval = setInterval(() => {
      if (mood === 'sleeping' || mood === 'sleepy') return;
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 4200 + Math.random() * 2000);

    // 2. Gentle Look Around (every 7 - 12s)
    const lookInterval = setInterval(() => {
      if (mood === 'sleeping' || mood === 'reading') return;
      const directions: Array<'center' | 'left' | 'right' | 'up'> = ['center', 'left', 'right', 'up', 'center'];
      const nextDir = directions[Math.floor(Math.random() * directions.length)];
      setIdleLook(nextDir);
      setTimeout(() => setIdleLook('center'), 2200);
    }, 8500);

    // 3. Occasional Yawn (every 25 - 35s)
    const yawnInterval = setInterval(() => {
      if (mood === 'sleeping' || mood === 'happy' || mood === 'cheering') return;
      setIsYawning(true);
      setTimeout(() => setIsYawning(false), 2800);
    }, 28000);

    // 4. Occasional leg swing
    const legInterval = setInterval(() => {
      if (mood === 'sleeping') return;
      setIsSwayingLegs(true);
      setTimeout(() => setIsSwayingLegs(false), 3500);
    }, 14000);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(lookInterval);
      clearInterval(yawnInterval);
      clearInterval(legInterval);
    };
  }, [mood]);

  // Dimensions based on size
  const scale = size === 'sm' ? 0.7 : size === 'lg' ? 1.3 : 1.0;
  const width = size === 'sm' ? 64 : size === 'lg' ? 120 : 90;
  const height = size === 'sm' ? 68 : size === 'lg' ? 128 : 96;

  // Render accessories
  const renderAccessory = () => {
    switch (accessory) {
      case 'bow':
        return (
          <g transform="translate(45, 16) scale(0.9)">
            {/* Center knot */}
            <ellipse cx="0" cy="0" rx="3.5" ry="3.5" fill="#f43f5e" />
            <circle cx="0" cy="0" r="1.5" fill="#ffe4e6" />
            {/* Left wing */}
            <path
              d="M -2,0 C -12,-8 -14,6 -2,2 Z"
              fill="#fb7185"
              stroke="#e11d48"
              strokeWidth="0.8"
            />
            {/* Right wing */}
            <path
              d="M 2,0 C 12,-8 14,6 2,2 Z"
              fill="#fb7185"
              stroke="#e11d48"
              strokeWidth="0.8"
            />
            {/* Ribbons hanging down */}
            <path d="M -2,2 Q -6,12 -8,14" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M 2,2 Q 6,12 8,14" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </g>
        );

      case 'beanie':
        return (
          <g transform="translate(45, 12)">
            {/* Pom-pom */}
            <circle cx="0" cy="-14" r="5" fill="#fed7aa" stroke="#f97316" strokeWidth="0.8" />
            <circle cx="0" cy="-14" r="2.5" fill="#fff" opacity="0.6" />
            {/* Beanie dome */}
            <path
              d="M -16,4 C -16,-12 16,-12 16,4 Z"
              fill="#fb923c"
              stroke="#ea580c"
              strokeWidth="1"
            />
            {/* Folded rim */}
            <rect x="-18" y="2" width="36" height="5" rx="2.5" fill="#fdba74" stroke="#ea580c" strokeWidth="0.8" />
            {/* Texture stripes */}
            <line x1="-8" y1="-4" x2="-8" y2="2" stroke="#fff" strokeWidth="0.8" opacity="0.4" />
            <line x1="0" y1="-8" x2="0" y2="2" stroke="#fff" strokeWidth="0.8" opacity="0.4" />
            <line x1="8" y1="-4" x2="8" y2="2" stroke="#fff" strokeWidth="0.8" opacity="0.4" />
          </g>
        );

      case 'hairpin':
        return (
          <g transform="translate(56, 18)">
            {/* Small sakura flower */}
            <circle cx="0" cy="-4" r="2.5" fill="#fda4af" />
            <circle cx="4" cy="-1" r="2.5" fill="#fda4af" />
            <circle cx="2.5" cy="3.5" r="2.5" fill="#fda4af" />
            <circle cx="-2.5" cy="3.5" r="2.5" fill="#fda4af" />
            <circle cx="-4" cy="-1" r="2.5" fill="#fda4af" />
            <circle cx="0" cy="0" r="2" fill="#fef08a" />
            <circle cx="0" cy="0" r="0.8" fill="#f59e0b" />
          </g>
        );

      case 'scarf':
        return (
          <g transform="translate(45, 52)">
            {/* Scarf wrap around neck */}
            <rect x="-17" y="-3" width="34" height="9" rx="4.5" fill="#f472b6" stroke="#db2777" strokeWidth="0.8" />
            {/* Hanging tail */}
            <path
              d="M 6,3 L 8,18 L 16,17 L 13,3 Z"
              fill="#f472b6"
              stroke="#db2777"
              strokeWidth="0.8"
            />
            {/* Fringe details */}
            <line x1="9" y1="18" x2="9" y2="21" stroke="#db2777" strokeWidth="0.8" />
            <line x1="12" y1="18" x2="12" y2="21" stroke="#db2777" strokeWidth="0.8" />
            <line x1="15" y1="17" x2="15" y2="20" stroke="#db2777" strokeWidth="0.8" />
          </g>
        );

      case 'cat_ears':
        return (
          <g transform="translate(45, 14)">
            {/* Left ear */}
            <path
              d="M -16,4 L -22,-12 L -6,-2 Z"
              fill="#fbcfe8"
              stroke="#f472b6"
              strokeWidth="1"
            />
            <path d="M -18,1 L -21,-8 L -10,-2 Z" fill="#f43f5e" opacity="0.6" />
            {/* Right ear */}
            <path
              d="M 16,4 L 22,-12 L 6,-2 Z"
              fill="#fbcfe8"
              stroke="#f472b6"
              strokeWidth="1"
            />
            <path d="M 18,1 L 21,-8 L 10,-2 Z" fill="#f43f5e" opacity="0.6" />
          </g>
        );

      case 'nightcap':
        return (
          <g transform="translate(45, 12)">
            {/* Curving nightcap dome */}
            <path
              d="M -16,4 C -16,-10 0,-18 18,-12 C 28,-7 34,2 32,10"
              fill="none"
              stroke="#818cf8"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M -16,4 C -16,-8 0,-14 16,-10 C 24,-6 28,2 26,8"
              fill="none"
              stroke="#c7d2fe"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Star tassel at tip */}
            <g transform="translate(32, 10)">
              <circle cx="0" cy="0" r="4" fill="#fef08a" stroke="#eab308" strokeWidth="0.8" />
              <text x="0" y="2.5" fontSize="6" textAnchor="middle" fill="#ca8a04">✦</text>
            </g>
            {/* Fluffy white rim */}
            <rect x="-18" y="2" width="36" height="5" rx="2.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
          </g>
        );

      case 'glasses':
        return (
          <g transform="translate(45, 34)">
            {/* Left rim */}
            <circle cx="-8" cy="0" r="5" fill="none" stroke="#d97706" strokeWidth="1.2" />
            <circle cx="-8" cy="0" r="4.2" fill="#fff" opacity="0.2" />
            {/* Right rim */}
            <circle cx="8" cy="0" r="5" fill="none" stroke="#d97706" strokeWidth="1.2" />
            <circle cx="8" cy="0" r="4.2" fill="#fff" opacity="0.2" />
            {/* Bridge */}
            <path d="M -3,-1 Q 0,-3 3,-1" fill="none" stroke="#d97706" strokeWidth="1.2" />
            {/* Temples */}
            <line x1="-13" y1="-1" x2="-18" y2="-2" stroke="#d97706" strokeWidth="1" />
            <line x1="13" y1="-1" x2="18" y2="-2" stroke="#d97706" strokeWidth="1" />
          </g>
        );

      case 'crown':
        return (
          <g transform="translate(45, 12)">
            {/* Golden crown */}
            <path
              d="M -10,3 L -12,-8 L -5,-3 L 0,-10 L 5,-3 L 12,-8 L 10,3 Z"
              fill="#fbbf24"
              stroke="#d97706"
              strokeWidth="0.8"
            />
            {/* Crown jewels */}
            <circle cx="-12" cy="-8" r="1.5" fill="#f43f5e" />
            <circle cx="0" cy="-10" r="1.8" fill="#38bdf8" />
            <circle cx="12" cy="-8" r="1.5" fill="#f43f5e" />
            <rect x="-9" y="1" width="18" height="2" rx="1" fill="#f59e0b" />
          </g>
        );

      case 'angel_wings':
        return (
          <>
            {/* Halo floating over head */}
            <ellipse
              cx="45"
              cy="6"
              rx="14"
              ry="3.5"
              fill="none"
              stroke="#facc15"
              strokeWidth="1.5"
              className="animate-pulse"
            />
            {/* Left wing (placed behind in separate layer if needed, here on sides) */}
            <g transform="translate(18, 44)">
              <path
                d="M 0,0 C -12,-10 -16,8 -2,12 C -8,6 -4,2 0,0 Z"
                fill="#ffffff"
                stroke="#e2e8f0"
                strokeWidth="1"
                opacity="0.95"
              />
              <path d="M -4,-2 C -10,-6 -12,4 -2,6" fill="none" stroke="#fed7aa" strokeWidth="0.6" opacity="0.6" />
            </g>
            {/* Right wing */}
            <g transform="translate(72, 44)">
              <path
                d="M 0,0 C 12,-10 16,8 2,12 C 8,6 4,2 0,0 Z"
                fill="#ffffff"
                stroke="#e2e8f0"
                strokeWidth="1"
                opacity="0.95"
              />
              <path d="M 4,-2 C 10,-6 12,4 2,6" fill="none" stroke="#fed7aa" strokeWidth="0.6" opacity="0.6" />
            </g>
          </>
        );

      default:
        return null;
    }
  };

  // Eyes offset calculation based on look direction
  let eyeOffsetX = 0;
  let eyeOffsetY = 0;
  if (idleLook === 'left') eyeOffsetX = -2;
  if (idleLook === 'right') eyeOffsetX = 2;
  if (idleLook === 'up' || mood === 'night') eyeOffsetY = -2.5;

  // Determine eyes rendering based on mood & blinking
  const renderEyes = () => {
    if (mood === 'sleeping') {
      return (
        <g stroke="#475569" strokeWidth="1.5" strokeLinecap="round" fill="none">
          {/* Closed peaceful sleeping eyes (- -) */}
          <path d="M 33,35 Q 37,39 41,35" />
          <path d="M 49,35 Q 53,39 57,35" />
          {/* Tiny eyelashes */}
          <line x1="37" y1="38" x2="37" y2="40" strokeWidth="1" />
          <line x1="53" y1="38" x2="53" y2="40" strokeWidth="1" />
        </g>
      );
    }

    if (mood === 'sleepy' || isYawning) {
      return (
        <g stroke="#475569" strokeWidth="1.5" strokeLinecap="round" fill="none">
          {/* Half-lidded drooping eyes */}
          <path d="M 33,33 Q 37,35 41,35" />
          <path d="M 49,35 Q 53,35 57,33" />
          <ellipse cx="37" cy="36" rx="2" ry="1.5" fill="#334155" />
          <ellipse cx="53" cy="36" rx="2" ry="1.5" fill="#334155" />
        </g>
      );
    }

    if (mood === 'happy' || mood === 'cheering' || mood === 'peeking') {
      return (
        <g stroke="#334155" strokeWidth="1.8" strokeLinecap="round" fill="none">
          {/* Happy upward curved eyes (⌒ ⌒) */}
          <path d="M 33,36 Q 37,30 41,36" />
          <path d="M 49,36 Q 53,30 57,36" />
        </g>
      );
    }

    if (mood === 'empty') {
      return (
        <g fill="#475569">
          {/* Looking down sadly / dot eyes */}
          <ellipse cx="37" cy="38" rx="2.5" ry="3" />
          <ellipse cx="53" cy="38" rx="2.5" ry="3" />
          <circle cx="36" cy="37" r="0.8" fill="#fff" />
          <circle cx="52" cy="37" r="0.8" fill="#fff" />
        </g>
      );
    }

    if (isBlinking) {
      return (
        <g stroke="#334155" strokeWidth="1.6" strokeLinecap="round">
          {/* Blinking flat lines */}
          <line x1="33" y1="35" x2="41" y2="35" />
          <line x1="49" y1="35" x2="57" y2="35" />
        </g>
      );
    }

    // Default Big Cute Shiny Eyes
    return (
      <g transform={`translate(${eyeOffsetX}, ${eyeOffsetY})`}>
        {/* Left eye */}
        <ellipse cx="37" cy="34" rx="3.5" ry="4.5" fill="#1e293b" />
        <circle cx="35.5" cy="32" r="1.6" fill="#ffffff" />
        <circle cx="38.5" cy="36" r="0.8" fill="#ffffff" />
        {/* Right eye */}
        <ellipse cx="53" cy="34" rx="3.5" ry="4.5" fill="#1e293b" />
        <circle cx="51.5" cy="32" r="1.6" fill="#ffffff" />
        <circle cx="54.5" cy="36" r="0.8" fill="#ffffff" />
        {/* Gentle eyebrows */}
        <path d="M 33,27 Q 37,25 40,27" fill="none" stroke="#64748b" strokeWidth="1" strokeLinecap="round" />
        <path d="M 50,27 Q 53,25 57,27" fill="none" stroke="#64748b" strokeWidth="1" strokeLinecap="round" />
      </g>
    );
  };

  // Mouth rendering
  const renderMouth = () => {
    if (mood === 'sleeping') {
      return (
        <ellipse cx="45" cy="41" rx="1.2" ry="1.2" fill="#fda4af" />
      );
    }

    if (isYawning) {
      return (
        <g>
          {/* Yawn circle mouth :o */}
          <ellipse cx="45" cy="42" rx="3" ry="4.5" fill="#f43f5e" />
          <ellipse cx="45" cy="40" rx="1.5" ry="1.5" fill="#fda4af" opacity="0.7" />
          {/* Little sleepy teardrop */}
          <path d="M 59,37 C 61,37 62,40 60,42 C 59,40 59,38 59,37 Z" fill="#60a5fa" />
        </g>
      );
    }

    if (mood === 'happy' || mood === 'cheering' || mood === 'peeking') {
      return (
        <path
          d="M 42,39 Q 45,43 48,39"
          fill="#f43f5e"
          stroke="#e11d48"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
      );
    }

    if (mood === 'empty') {
      return (
        <path
          d="M 43,42 Q 45,39 47,42"
          fill="none"
          stroke="#64748b"
          strokeWidth="1"
          strokeLinecap="round"
        />
      );
    }

    // Default cute kitty mouth (ω)
    return (
      <path
        d="M 42,39 Q 43.5,41 45,39.5 Q 46.5,41 48,39"
        fill="none"
        stroke="#475569"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    );
  };

  // Item held in hands based on mood
  const renderHeldItem = () => {
    if (mood === 'reading') {
      return (
        <g transform="translate(45, 54)">
          {/* Open Mini Book */}
          <path
            d="M 0,4 Q -12,0 -16,-6 L -16,6 Q -12,12 0,16 L 0,4 Z"
            fill="#fce7f3"
            stroke="#f472b6"
            strokeWidth="0.8"
          />
          <path
            d="M 0,4 Q 12,0 16,-6 L 16,6 Q 12,12 0,16 L 0,4 Z"
            fill="#fce7f3"
            stroke="#f472b6"
            strokeWidth="0.8"
          />
          {/* Page text lines */}
          <line x1="-12" y1="-1" x2="-4" y2="2" stroke="#f472b6" strokeWidth="0.6" strokeLinecap="round" />
          <line x1="-12" y1="3" x2="-4" y2="6" stroke="#f472b6" strokeWidth="0.6" strokeLinecap="round" />
          <line x1="4" y1="2" x2="12" y2="-1" stroke="#f472b6" strokeWidth="0.6" strokeLinecap="round" />
          <line x1="4" y1="6" x2="12" y2="3" stroke="#f472b6" strokeWidth="0.6" strokeLinecap="round" />
          <text x="0" y="10" fontSize="5" textAnchor="middle" fill="#e11d48">♡</text>
        </g>
      );
    }

    if (mood === 'searching') {
      return (
        <g transform="translate(56, 46) rotate(-20)">
          {/* Magnifying glass */}
          <circle cx="0" cy="0" r="6" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.2" opacity="0.9" />
          <line x1="4" y1="4" x2="11" y2="11" stroke="#0369a1" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="-1.5" cy="-1.5" r="2" fill="#fff" opacity="0.6" />
        </g>
      );
    }

    if (mood === 'night') {
      return (
        <g transform="translate(45, 52)">
          {/* Hugging a star pillow */}
          <rect x="-12" y="-5" width="24" height="14" rx="6" fill="#e0e7ff" stroke="#a5b4fc" strokeWidth="0.8" />
          <text x="0" y="4" fontSize="7" textAnchor="middle" fill="#6366f1">✦</text>
        </g>
      );
    }

    return null;
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-block select-none cursor-pointer group ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {/* Floating ZZZ bubbles when sleeping */}
      <AnimatePresence>
        {mood === 'sleeping' && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: [-2, -22], x: [0, 6, 12] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: 'easeOut' }}
            className="absolute -top-3 right-0 text-indigo-400 dark:text-indigo-300 font-bold text-xs pointer-events-none"
          >
            zᶻᶻ...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Sparkles when Happy or Cheering */}
      <AnimatePresence>
        {(mood === 'happy' || mood === 'cheering') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.2, 0.9], y: [-1, -4, -1] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 text-rose-400 text-xs font-bold pointer-events-none flex gap-3"
          >
            <span>✦</span>
            <span>♡</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Mascot SVG */}
      <motion.svg
        viewBox="0 0 90 96"
        width={width}
        height={height}
        animate={
          mood === 'sleeping'
            ? { y: [0, 1.5, 0] }
            : isSwayingLegs
            ? { rotate: [-2, 2, -2] }
            : mood === 'cheering'
            ? { y: [0, -6, 0] }
            : mood === 'happy'
            ? { y: [0, -3, 0], scale: [1, 1.04, 1] }
            : { y: [0, -1.2, 0] }
        }
        transition={
          mood === 'sleeping'
            ? { repeat: Infinity, duration: 3.2, ease: 'easeInOut' }
            : mood === 'cheering'
            ? { repeat: Infinity, duration: 0.6, ease: 'easeInOut' }
            : mood === 'happy'
            ? { repeat: Infinity, duration: 1.2, ease: 'easeInOut' }
            : { repeat: Infinity, duration: 2.6, ease: 'easeInOut' }
        }
        className="overflow-visible filter drop-shadow-sm group-hover:drop-shadow-md transition-all"
      >
        <defs>
          <radialGradient id="mascotBodyGradient" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#fff1f2" />
            <stop offset="100%" stopColor="#ffe4e6" />
          </radialGradient>
          <radialGradient id="mascotEarGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fda4af" />
            <stop offset="100%" stopColor="#f43f5e" />
          </radialGradient>
        </defs>

        {/* 1. Fluffy Bunny/Fairy Ears */}
        <g id="ears">
          {/* Left Ear */}
          <motion.g
            animate={
              mood === 'cheering'
                ? { rotate: [-10, 5, -10] }
                : isSwayingLegs
                ? { rotate: [-4, 4, -4] }
                : { rotate: [0, -2, 0] }
            }
            style={{ originX: '28px', originY: '20px' }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          >
            <ellipse
              cx="26"
              cy="12"
              rx="6"
              ry="14"
              transform="rotate(-15 26 12)"
              fill="url(#mascotBodyGradient)"
              stroke="#fecdd3"
              strokeWidth="1.2"
            />
            {/* Inner Ear Pink */}
            <ellipse
              cx="26"
              cy="12"
              rx="3"
              ry="9"
              transform="rotate(-15 26 12)"
              fill="url(#mascotEarGradient)"
              opacity="0.6"
            />
          </motion.g>

          {/* Right Ear */}
          <motion.g
            animate={
              mood === 'cheering'
                ? { rotate: [10, -5, 10] }
                : isSwayingLegs
                ? { rotate: [4, -4, 4] }
                : { rotate: [0, 2, 0] }
            }
            style={{ originX: '62px', originY: '20px' }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          >
            <ellipse
              cx="64"
              cy="12"
              rx="6"
              ry="14"
              transform="rotate(15 64 12)"
              fill="url(#mascotBodyGradient)"
              stroke="#fecdd3"
              strokeWidth="1.2"
            />
            {/* Inner Ear Pink */}
            <ellipse
              cx="64"
              cy="12"
              rx="3"
              ry="9"
              transform="rotate(15 64 12)"
              fill="url(#mascotEarGradient)"
              opacity="0.6"
            />
          </motion.g>
        </g>

        {/* 2. Chubby Soft Body */}
        <g id="body">
          {/* Main Round Body */}
          <ellipse
            cx="45"
            cy="52"
            rx="25"
            ry="24"
            fill="url(#mascotBodyGradient)"
            stroke="#fecdd3"
            strokeWidth="1.4"
          />

          {/* Cute Little Feet */}
          <motion.ellipse
            cx="34"
            cy="74"
            rx="5.5"
            ry="4"
            fill="#ffe4e6"
            stroke="#fecdd3"
            strokeWidth="1"
            animate={
              isSwayingLegs || mood === 'cheering'
                ? { y: [0, -3, 0] }
                : {}
            }
            transition={{ repeat: Infinity, duration: 0.8 }}
          />
          <motion.ellipse
            cx="56"
            cy="74"
            rx="5.5"
            ry="4"
            fill="#ffe4e6"
            stroke="#fecdd3"
            strokeWidth="1"
            animate={
              isSwayingLegs || mood === 'cheering'
                ? { y: [-3, 0, -3] }
                : {}
            }
            transition={{ repeat: Infinity, duration: 0.8 }}
          />

          {/* Little Hands / Paws */}
          {mood === 'cheering' ? (
            <>
              {/* Hands raised high */}
              <ellipse cx="23" cy="38" rx="4" ry="4" fill="#fff" stroke="#fecdd3" strokeWidth="1" />
              <ellipse cx="67" cy="38" rx="4" ry="4" fill="#fff" stroke="#fecdd3" strokeWidth="1" />
            </>
          ) : mood === 'reading' || mood === 'searching' || mood === 'night' ? (
            <>
              {/* Hands resting on item */}
              <ellipse cx="36" cy="52" rx="3.5" ry="3.5" fill="#fff" stroke="#fecdd3" strokeWidth="1" />
              <ellipse cx="54" cy="52" rx="3.5" ry="3.5" fill="#fff" stroke="#fecdd3" strokeWidth="1" />
            </>
          ) : (
            <>
              {/* Hands resting comfortably on tummy */}
              <ellipse cx="30" cy="52" rx="4" ry="3.5" fill="#fff" stroke="#fecdd3" strokeWidth="1" />
              <ellipse cx="60" cy="52" rx="4" ry="3.5" fill="#fff" stroke="#fecdd3" strokeWidth="1" />
            </>
          )}

          {/* Soft Glowing Rosy Cheeks */}
          <ellipse cx="29" cy="38" rx="4.5" ry="2.5" fill="#f43f5e" opacity="0.25" />
          <ellipse cx="61" cy="38" rx="4.5" ry="2.5" fill="#f43f5e" opacity="0.25" />
        </g>

        {/* 3. Facial Features */}
        <g id="face">
          {renderEyes()}
          {renderMouth()}
        </g>

        {/* 4. Held item if any */}
        {renderHeldItem()}

        {/* 5. Custom Equipped Accessory */}
        {renderAccessory()}
      </motion.svg>
    </div>
  );
};

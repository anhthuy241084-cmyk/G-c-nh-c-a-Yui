import React, { useEffect, useState, useRef, useCallback } from 'react';
import { StarEffectSettings } from '../types';
import { playSparkleSfx } from '../utils/sfx';

interface FallingStarsProps {
  settings?: StarEffectSettings;
  themeMode?: 'light' | 'dark';
  isSfxOn?: boolean;
  sfxVolume?: number;
  isMiniGameOpen?: boolean;
  onTriggerEasterEgg?: (x: number, y: number) => void;
}

interface StarParticle {
  id: string;
  x: number; // 0 - 100%
  size: number; // in px
  char: string;
  duration: number; // in seconds
  delay: number; // in seconds
  sway: number; // horizontal drift in px
  maxOpacity: number;
  isSpecial?: boolean;
  isClicked?: boolean;
  clickedChar?: string;
}

const DEFAULT_SETTINGS: StarEffectSettings = {
  isEnabled: true,
  density: 'medium',
  speed: 'medium',
  brightness: 'medium',
};

const STAR_CHARS = ['✦', '✧', '⋆', '·'];

export const FallingStars: React.FC<FallingStarsProps> = ({
  settings = DEFAULT_SETTINGS,
  themeMode = 'light',
  isSfxOn = true,
  sfxVolume = 0.5,
  isMiniGameOpen = false,
  onTriggerEasterEgg,
}) => {
  const [stars, setStars] = useState<StarParticle[]>([]);
  const [specialToast, setSpecialToast] = useState<{ x: number; y: number; msg: string } | null>(null);
  const toastTimerRef = useRef<any>(null);

  const { isEnabled = true, density = 'medium', speed = 'medium', brightness = 'medium' } =
    settings || DEFAULT_SETTINGS;

  // Determine number of stars based on density setting
  const getStarCount = useCallback(() => {
    let count = 20;
    if (density === 'low') count = 10;
    if (density === 'high') count = 35;
    if (isMiniGameOpen) count = Math.floor(count * 0.4); // reduce during mini-game
    return count;
  }, [density, isMiniGameOpen]);

  // Determine fall duration range based on speed setting
  const getSpeedRange = useCallback(() => {
    if (speed === 'slow') return { min: 14, max: 24 };
    if (speed === 'fast') return { min: 5, max: 10 };
    return { min: 9, max: 16 }; // medium
  }, [speed]);

  // Determine max opacity based on brightness & theme
  const getMaxOpacity = useCallback(() => {
    const isDark = themeMode === 'dark';
    if (brightness === 'dim') return isDark ? 0.4 : 0.25;
    if (brightness === 'bright') return isDark ? 0.95 : 0.75;
    return isDark ? 0.7 : 0.45; // medium
  }, [brightness, themeMode]);

  // Generate a random star particle
  const createStar = useCallback(
    (isInitial = false): StarParticle => {
      const charIndex = Math.floor(Math.random() * STAR_CHARS.length);
      const char = STAR_CHARS[charIndex];
      const isSpecial = Math.random() < 0.08 && char === '✦'; // 8% chance for rare special star

      const { min: minSpeed, max: maxSpeed } = getSpeedRange();
      const duration = isSpecial
        ? maxSpeed + 4 // special star falls slower
        : minSpeed + Math.random() * (maxSpeed - minSpeed);

      const sizeBase = char === '·' ? 8 : char === '⋆' ? 12 : 16;
      const size = isSpecial ? 22 : sizeBase + Math.random() * 6;

      const opacity = isSpecial ? 1.0 : getMaxOpacity() * (0.6 + Math.random() * 0.4);

      return {
        id: `star_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        x: Math.random() * 96 + 2, // 2% to 98%
        size,
        char,
        duration,
        delay: isInitial ? Math.random() * duration : Math.random() * 2,
        sway: (Math.random() - 0.5) * 40, // -20px to +20px
        maxOpacity: opacity,
        isSpecial,
      };
    },
    [getSpeedRange, getMaxOpacity]
  );

  // Initialize and recreate stars when settings change
  useEffect(() => {
    if (!isEnabled) {
      setStars([]);
      return;
    }

    const count = getStarCount();
    const initialStars = Array.from({ length: count }, () => createStar(true));
    setStars(initialStars);
  }, [isEnabled, density, speed, brightness, isMiniGameOpen, createStar, getStarCount]);

  // Handle click on an individual star (Easter Egg)
  const handleStarClick = (e: React.MouseEvent, starId: string, isSpecial?: boolean) => {
    e.stopPropagation();
    const clickX = e.clientX;
    const clickY = e.clientY;

    if (isSfxOn && sfxVolume > 0) {
      playSparkleSfx(sfxVolume);
    }

    if (onTriggerEasterEgg) {
      onTriggerEasterEgg(clickX, clickY);
    }

    // Trigger visual transformation ✦ → ✨ → ♡
    setStars((prev) =>
      prev.map((s) => {
        if (s.id === starId) {
          return {
            ...s,
            isClicked: true,
            clickedChar: isSpecial ? '✦' : '♡',
          };
        }
        return s;
      })
    );

    // If special star clicked, show cute popup toast
    if (isSpecial) {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setSpecialToast({
        x: Math.min(window.innerWidth - 180, Math.max(20, clickX - 80)),
        y: Math.max(20, clickY - 50),
        msg: '✦ Bắt được Ngôi Sao May Mắn! ✦',
      });
      toastTimerRef.current = setTimeout(() => {
        setSpecialToast(null);
      }, 2500);
    }

    // Remove star after click animation
    setTimeout(() => {
      setStars((prev) => prev.filter((s) => s.id !== starId));
      // Respawn new star after 1.5s
      setTimeout(() => {
        if (isEnabled) {
          setStars((prev) => [...prev, createStar(false)]);
        }
      }, 1500);
    }, 600);
  };

  if (!isEnabled) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Custom Keyframe Styles */}
      <style>{`
        @keyframes starFall {
          0% {
            transform: translateY(-5vh) translateX(0) scale(0.8);
            opacity: 0;
          }
          15% {
            opacity: var(--star-max-opacity);
            transform: translateY(15vh) translateX(var(--star-sway)) scale(1);
          }
          50% {
            transform: translateY(50vh) translateX(calc(var(--star-sway) * -1)) scale(1.1);
          }
          85% {
            opacity: var(--star-max-opacity);
            transform: translateY(85vh) translateX(var(--star-sway)) scale(0.95);
          }
          100% {
            transform: translateY(105vh) translateX(0) scale(0.7);
            opacity: 0;
          }
        }

        .falling-star-item {
          position: absolute;
          top: 0;
          will-change: transform, opacity;
          animation-name: starFall;
          animation-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);
          animation-iteration-count: infinite;
          cursor: pointer;
        }

        .special-star-glow {
          filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.9)) drop-shadow(0 0 16px rgba(244, 114, 182, 0.6));
        }
      `}</style>

      {stars.map((star) => {
        const isDark = themeMode === 'dark';
        const colorClass = star.isSpecial
          ? 'text-amber-300 dark:text-amber-200 special-star-glow font-extrabold'
          : isDark
          ? 'text-indigo-200/90 dark:text-pink-200/80'
          : 'text-amber-700/60 dark:text-rose-300/70';

        return (
          <div
            key={star.id}
            onClick={(e) => handleStarClick(e, star.id, star.isSpecial)}
            className={`falling-star-item pointer-events-auto transition-transform active:scale-150 ${colorClass}`}
            style={
              {
                left: `${star.x}%`,
                fontSize: `${star.size}px`,
                animationDuration: `${star.duration}s`,
                animationDelay: `${star.delay}s`,
                '--star-sway': `${star.sway}px`,
                '--star-max-opacity': star.maxOpacity,
              } as React.CSSProperties
            }
            title={star.isSpecial ? '✦ Ngôi sao may mắn (Nhấn để bắt!)' : '✦ Ngôi sao nhỏ'}
          >
            {star.isClicked ? (
              <span className="inline-block animate-ping text-pink-500">{star.clickedChar}</span>
            ) : (
              <span>{star.char}</span>
            )}
          </div>
        );
      })}

      {/* Special Star Click Toast Popup */}
      {specialToast && (
        <div
          className="fixed z-50 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-rose-500 text-white font-extrabold text-xs shadow-lg animate-bounce pointer-events-none"
          style={{ left: `${specialToast.x}px`, top: `${specialToast.y}px` }}
        >
          {specialToast.msg}
        </div>
      )}
    </div>
  );
};

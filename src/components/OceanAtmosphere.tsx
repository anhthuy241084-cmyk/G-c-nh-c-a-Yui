import React, { useEffect, useRef } from 'react';
import { ThemeMode } from '../types';

interface OceanAtmosphereProps {
  themeMode?: ThemeMode;
}

interface Bubble {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  wobbleSpeed: number;
  wobbleAngle: number;
  opacity: number;
  layer: 1 | 2 | 3; // 1: close/large, 2: mid, 3: distant/tiny
}

interface Plankton {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  pulseSpeed: number;
  pulseAngle: number;
  baseOpacity: number;
}

export const OceanAtmosphere: React.FC<OceanAtmosphereProps> = ({
  themeMode = 'light',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const planktonRef = useRef<Plankton[]>([]);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Initialize Marine Starlight & Bioluminescent Dust
    const planktons: Plankton[] = [];
    const planktonCount = 28;
    for (let i = 0; i < planktonCount; i++) {
      planktons.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.4 + 0.6,
        speedX: (Math.random() * 0.2 - 0.1),
        speedY: (Math.random() * 0.1 - 0.05),
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseAngle: Math.random() * Math.PI * 2,
        baseOpacity: Math.random() * 0.25 + 0.1,
      });
    }
    planktonRef.current = planktons;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      timeRef.current += 0.012;
      const t = timeRef.current;
      ctx.clearRect(0, 0, width, height);
      const isDark = themeMode === 'dark';

      // 1. Draw subtle caustic light shimmer across upper background
      const causticGradient = ctx.createRadialGradient(
        width * 0.5 + Math.sin(t * 0.3) * 50,
        height * 0.15 + Math.cos(t * 0.2) * 20,
        10,
        width * 0.5,
        height * 0.2,
        Math.max(width, height) * 0.8
      );

      if (isDark) {
        causticGradient.addColorStop(0, 'rgba(107, 221, 229, 0.05)');
        causticGradient.addColorStop(0.5, 'rgba(87, 200, 209, 0.02)');
        causticGradient.addColorStop(1, 'transparent');
      } else {
        causticGradient.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
        causticGradient.addColorStop(0.4, 'rgba(101, 197, 206, 0.08)');
        causticGradient.addColorStop(1, 'transparent');
      }
      ctx.fillStyle = causticGradient;
      ctx.fillRect(0, 0, width, height * 0.7);

      // 2. Draw Marine Starlight & Dust particles (No bubbles)
      for (let i = 0; i < planktons.length; i++) {
        const p = planktons[i];
        p.pulseAngle += p.pulseSpeed;
        const currentOpacity = p.baseOpacity + Math.sin(p.pulseAngle) * 0.08;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        if (isDark) {
          ctx.fillStyle = `rgba(120, 220, 224, ${Math.max(0.04, currentOpacity + 0.08)})`;
          ctx.shadowBlur = 4;
          ctx.shadowColor = 'rgba(107, 221, 229, 0.4)';
        } else {
          ctx.fillStyle = `rgba(101, 197, 206, ${Math.max(0.04, currentOpacity)})`;
          ctx.shadowBlur = 0;
        }
        ctx.fill();

        // Drift motion
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x > width + 10) p.x = -10;
        if (p.x < -10) p.x = width + 10;
        if (p.y > height + 10) p.y = -10;
        if (p.y < -10) p.y = height + 10;
      }

      ctx.shadowBlur = 0;
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [themeMode]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full gpu-layer"
      />

      {/* 🌿 14. Subtle restrained seaweed silhouettes at bottom corners */}
      <div className="absolute bottom-0 left-2 sm:left-6 w-16 sm:w-24 h-48 sm:h-64 pointer-events-none opacity-25 dark:opacity-20 animate-seaweed-left origin-bottom">
        <svg viewBox="0 0 100 240" fill="none" className="w-full h-full text-[#3FAAB7] dark:text-[#57C8D1]">
          <path
            d="M 50 240 Q 30 180 60 130 Q 80 80 40 20 Q 35 10 50 0 Q 65 20 50 80 Q 35 140 55 190 Z"
            fill="currentColor"
          />
          <path
            d="M 30 240 Q 15 190 40 140 Q 60 100 30 50 Q 25 40 35 30 Q 48 50 35 100 Q 20 150 35 200 Z"
            fill="currentColor"
            opacity="0.6"
          />
        </svg>
      </div>

      <div className="absolute bottom-0 right-2 sm:right-6 w-20 sm:w-28 h-56 sm:h-72 pointer-events-none opacity-20 dark:opacity-25 animate-seaweed-right origin-bottom">
        <svg viewBox="0 0 120 280" fill="none" className="w-full h-full text-[#247C8C] dark:text-[#78DCE0]">
          <path
            d="M 60 280 Q 90 210 50 150 Q 20 90 70 20 Q 75 10 60 0 Q 45 20 60 90 Q 75 160 50 220 Z"
            fill="currentColor"
          />
          <path
            d="M 85 280 Q 100 220 70 160 Q 50 110 80 60 Q 85 50 75 40 Q 60 60 75 120 Q 90 170 80 230 Z"
            fill="currentColor"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* 🪼 15. Ethereal slow drifting bioluminescent jellyfish silhouette in deep background */}
      <div className="absolute top-1/4 right-[12%] w-12 sm:w-16 h-20 sm:h-24 pointer-events-none opacity-20 dark:opacity-35 animate-jellyfish">
        <svg viewBox="0 0 100 140" fill="none" className="w-full h-full text-[#65C5CE] dark:text-[#6BDDE5]">
          <path
            d="M 20 60 C 20 20, 80 20, 80 60 C 70 65, 30 65, 20 60 Z"
            fill="currentColor"
            opacity="0.7"
          />
          <path d="M 30 65 Q 25 95 32 130" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <path d="M 44 65 Q 40 105 46 135" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
          <path d="M 56 65 Q 60 105 54 135" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
          <path d="M 70 65 Q 75 95 68 130" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        </svg>
      </div>
    </div>
  );
};

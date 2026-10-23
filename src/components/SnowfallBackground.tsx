import React, { useEffect, useRef } from 'react';
import { SnowEffectSettings, ThemeMode } from '../types';

interface SnowfallBackgroundProps {
  settings?: SnowEffectSettings;
  themeMode?: ThemeMode;
}

interface Flake {
  x: number;
  y: number;
  radius: number;
  density: number;
  speedY: number;
  speedX: number;
  swingAngle: number;
  swingSpeed: number;
  opacity: number;
}

const DEFAULT_SNOW_SETTINGS: SnowEffectSettings = {
  isEnabled: true,
  density: 'medium',
  speed: 'medium',
  opacity: 'medium',
};

export const SnowfallBackground: React.FC<SnowfallBackgroundProps> = ({
  settings = DEFAULT_SNOW_SETTINGS,
  themeMode = 'light',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const flakesRef = useRef<Flake[]>([]);

  const isEnabled = settings?.isEnabled ?? true;
  const density = settings?.density ?? 'medium';
  const speed = settings?.speed ?? 'medium';

  useEffect(() => {
    if (!isEnabled) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Calculate count based on density
    let count = 45;
    if (density === 'low') count = 22;
    if (density === 'high') count = 85;

    // Speed multiplier
    let speedMult = 1;
    if (speed === 'slow') speedMult = 0.55;
    if (speed === 'fast') speedMult = 1.6;

    // Initialize flakes
    const flakes: Flake[] = [];
    for (let i = 0; i < count; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.6 + 1.2, // 1.2px - 3.8px
        density: Math.random() * count,
        speedY: (Math.random() * 0.8 + 0.4) * speedMult,
        speedX: (Math.random() * 0.3 - 0.15) * speedMult,
        swingAngle: Math.random() * Math.PI * 2,
        swingSpeed: Math.random() * 0.02 + 0.008,
        opacity: Math.random() * 0.45 + (themeMode === 'dark' ? 0.35 : 0.45),
      });
    }
    flakesRef.current = flakes;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const isDark = themeMode === 'dark';

      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];

        // Soft gentle glow & pale white color
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2, false);

        if (isDark) {
          ctx.fillStyle = `rgba(235, 245, 255, ${f.opacity})`;
          ctx.shadowBlur = f.radius > 2.5 ? 4 : 0;
          ctx.shadowColor = 'rgba(215, 235, 255, 0.6)';
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity + 0.15})`;
          ctx.shadowBlur = 3;
          ctx.shadowColor = 'rgba(244, 63, 94, 0.15)';
        }

        ctx.fill();

        // Update positions with graceful downward drift and sine horizontal sway
        f.swingAngle += f.swingSpeed;
        f.x += Math.sin(f.swingAngle) * 0.6 + f.speedX;
        f.y += f.speedY;

        // Wrap around boundaries
        if (f.y > height + 10) {
          f.y = -10;
          f.x = Math.random() * width;
        }
        if (f.x > width + 10) {
          f.x = -10;
        } else if (f.x < -10) {
          f.x = width + 10;
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isEnabled, density, speed, themeMode]);

  if (!isEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 gpu-layer transition-opacity duration-700"
      style={{
        width: '100vw',
        height: '100vh',
      }}
      aria-hidden="true"
    />
  );
};

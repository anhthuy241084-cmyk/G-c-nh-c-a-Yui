import React, { useEffect, useRef, useState } from 'react';

interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  rotation: number;
  rotSpeed: number;
  kind: 'crystal' | 'dot' | 'diamond';
}

export const SnowCursorEffect: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHoverInteractive, setIsHoverInteractive] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const cursorRef = useRef<HTMLDivElement | null>(null);
  const haloRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const targetPos = useRef({ x: -100, y: -100 });
  const smoothPos = useRef({ x: -100, y: -100 });
  const lastSpawnPos = useRef({ x: -100, y: -100 });
  const sparklesRef = useRef<SparkleParticle[]>([]);
  const nextIdRef = useRef(1);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateAvailability = () => {
      setEnabled(finePointer.matches && !reducedMotion.matches);
    };

    updateAvailability();
    finePointer.addEventListener('change', updateAvailability);
    reducedMotion.addEventListener('change', updateAvailability);

    return () => {
      finePointer.removeEventListener('change', updateAvailability);
      reducedMotion.removeEventListener('change', updateAvailability);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add('winter-cursor-active');

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d') || null;

    const resizeCanvas = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const spawnSparkle = (x: number, y: number, burst = false) => {
      const count = burst ? 7 : 1;
      const kinds: SparkleParticle['kind'][] = ['crystal', 'dot', 'diamond'];
      for (let i = 0; i < count; i++) {
        const angle = burst ? (Math.PI * 2 * i) / count + Math.random() * 0.4 : Math.random() * Math.PI * 2;
        const speed = burst ? 0.8 + Math.random() * 1.4 : 0.15 + Math.random() * 0.45;
        sparklesRef.current.push({
          id: nextIdRef.current++,
          x: x + (Math.random() - 0.5) * (burst ? 6 : 8),
          y: y + (Math.random() - 0.5) * (burst ? 6 : 8),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed + (burst ? 0.25 : 0.45),
          size: burst ? 4.5 + Math.random() * 3.5 : 2.5 + Math.random() * 3.5,
          alpha: burst ? 0.95 : 0.72,
          rotation: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 0.08,
          kind: kinds[Math.floor(Math.random() * kinds.length)],
        });
      }
      if (sparklesRef.current.length > 48) {
        sparklesRef.current = sparklesRef.current.slice(-48);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      targetPos.current.x = e.clientX;
      targetPos.current.y = e.clientY;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      setIsVisible(true);

      const el = e.target as HTMLElement | null;
      const interactive = Boolean(
        el?.closest('button, a, input, textarea, select, label, [role="button"]')
      );
      setIsHoverInteractive(interactive);

      const dx = e.clientX - lastSpawnPos.current.x;
      const dy = e.clientY - lastSpawnPos.current.y;
      if (dx * dx + dy * dy > 260) {
        lastSpawnPos.current.x = e.clientX;
        lastSpawnPos.current.y = e.clientY;
        spawnSparkle(e.clientX, e.clientY, false);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      setIsClicking(true);
      spawnSparkle(e.clientX, e.clientY, true);
    };

    const handlePointerUp = () => setIsClicking(false);
    const handlePointerLeave = () => setIsVisible(false);

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);

    let rafId = 0;

    const drawCrystal = (c: CanvasRenderingContext2D, size: number) => {
      c.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI) / 3;
        const dx = Math.cos(a) * size;
        const dy = Math.sin(a) * size;
        c.moveTo(-dx, -dy);
        c.lineTo(dx, dy);
      }
      c.stroke();
    };

    const drawDiamond = (c: CanvasRenderingContext2D, size: number) => {
      c.beginPath();
      c.moveTo(0, -size);
      c.lineTo(size * 0.6, 0);
      c.lineTo(0, size);
      c.lineTo(-size * 0.6, 0);
      c.closePath();
      c.fill();
    };

    const loop = () => {
      // Smooth spring-like follower
      smoothPos.current.x += (targetPos.current.x - smoothPos.current.x) * 0.28;
      smoothPos.current.y += (targetPos.current.y - smoothPos.current.y) * 0.28;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${targetPos.current.x}px, ${targetPos.current.y}px, 0)`;
      }
      if (haloRef.current) {
        haloRef.current.style.transform = `translate3d(${smoothPos.current.x}px, ${smoothPos.current.y}px, 0)`;
      }

      if (ctx && canvas) {
        const isDark = document.documentElement.classList.contains('dark');
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        const nextSparkles: SparkleParticle[] = [];
        for (const p of sparklesRef.current) {
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= 0.022;
          p.rotation += p.rotSpeed;

          if (p.alpha <= 0.02) continue;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = Math.max(0, p.alpha);

          const strokeColor = isDark ? 'rgba(213, 228, 239, 0.9)' : 'rgba(110, 137, 158, 0.85)';
          const fillColor = isDark ? 'rgba(247, 250, 253, 0.92)' : 'rgba(145, 169, 188, 0.88)';
          ctx.strokeStyle = strokeColor;
          ctx.fillStyle = fillColor;
          ctx.lineWidth = 1.1;

          if (p.kind === 'crystal') {
            drawCrystal(ctx, p.size);
          } else if (p.kind === 'diamond') {
            drawDiamond(ctx, p.size * 0.85);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.38, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
          nextSparkles.push(p);
        }
        sparklesRef.current = nextSparkles;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      document.documentElement.classList.remove('winter-cursor-active');
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9998]"
        aria-hidden="true"
      />

      {/* Soft lagging Frost Halo Ring */}
      <div
        ref={haloRef}
        aria-hidden="true"
        className={`fixed top-0 left-0 pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className={`-translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-200 ${
            isClicking
              ? 'w-9 h-9 border-[#6E899E] dark:border-[#E8F1F8] bg-[#D5E4EF]/30 scale-90'
              : isHoverInteractive
              ? 'w-8 h-8 border-[#6E899E]/80 dark:border-[#D5E4EF]/85 bg-[#E8F1F8]/25 scale-110'
              : 'w-6 h-6 border-[#91A9BC]/55 dark:border-[#A9BDCE]/50 bg-transparent'
          }`}
        />
      </div>

      {/* Crisp Crystal Snowflake Pointer */}
      <div
        ref={cursorRef}
        aria-hidden="true"
        className={`fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-150 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <svg
          width={isHoverInteractive ? 22 : 18}
          height={isHoverInteractive ? 22 : 18}
          viewBox="0 0 24 24"
          className={`-translate-x-1/2 -translate-y-1/2 transition-transform duration-200 drop-shadow-[0_1px_4px_rgba(82,107,128,0.45)] ${
            isClicking ? 'scale-75 rotate-45' : isHoverInteractive ? 'scale-110 rotate-15' : 'rotate-0'
          }`}
          fill="none"
        >
          <path
            d="M12 2V22M3.34 7L20.66 17M20.66 7L3.34 17"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
            className="text-[#526B80] dark:text-[#E8F1F8]"
          />
          <circle
            cx="12"
            cy="12"
            r="2.4"
            className="fill-[#F7FAFD] dark:fill-[#172536] stroke-[#526B80] dark:stroke-[#D5E4EF]"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </>
  );
};

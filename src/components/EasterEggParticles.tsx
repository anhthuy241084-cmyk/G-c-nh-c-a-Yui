import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface Particle {
  id: string;
  x: number;
  y: number;
  symbol: string;
  color: string;
  size: number;
}

interface EasterEggParticlesProps {
  particles: Particle[];
}

export const EasterEggParticles: React.FC<EasterEggParticlesProps> = ({ particles }) => {
  // Cap visible particles for low-end hardware efficiency
  const visibleParticles = particles.slice(-12);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {visibleParticles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 0.6, x: p.x - 10, y: p.y - 10 }}
            animate={{
              opacity: [1, 0.9, 0],
              scale: [0.8, 1.3, 0.8],
              y: p.y - 90,
              x: p.x + (Math.sin(p.y) * 40),
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="absolute font-extrabold select-none filter drop-shadow-sm transform-gpu"
            style={{ color: p.color, fontSize: `${p.size}px` }}
          >
            {p.symbol}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

import confetti from 'canvas-confetti';

/**
 * Trigger celebratory confetti fireworks & ocean pearls when liking / voting for a character
 */
export const triggerHeartConfetti = (originX = 0.5, originY = 0.6) => {
  const count = 45;
  const defaults = {
    origin: { x: originX, y: originY },
    disableForReducedMotion: true,
  };

  // 1. Oceanic cheerful confetti blast
  confetti({
    ...defaults,
    particleCount: count,
    spread: 70,
    startVelocity: 35,
    colors: ['#65C5CE', '#3FAAB7', '#78DCE0', '#247C8C', '#BDEBE5', '#F5F3EA', '#D8D4EE'],
    scalar: 1.1,
    ticks: 160,
  });

  // 2. Secondary delicate sea sparkle shower
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 25,
      angle: 60,
      spread: 55,
      startVelocity: 28,
      colors: ['#F2FBFC', '#65C5CE', '#3FAAB7', '#78DCE0'],
      scalar: 0.9,
      ticks: 120,
    });
  }, 100);

  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 25,
      angle: 120,
      spread: 55,
      startVelocity: 28,
      colors: ['#3FAAB7', '#BDEBE5', '#6BDDE5', '#ffffff'],
      scalar: 0.9,
      ticks: 120,
    });
  }, 180);
};

/**
 * Trigger full screen mini-fireworks for big milestones or extra fun
 */
export const triggerFireworkSpread = () => {
  const duration = 1.2 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 70, zIndex: 9999 };

  const interval: ReturnType<typeof setInterval> = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 40 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: Math.random() * 0.4 + 0.1, y: Math.random() * 0.4 + 0.3 },
      colors: ['#65C5CE', '#3FAAB7', '#78DCE0', '#247C8C', '#BDEBE5'],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: Math.random() * 0.4 + 0.5, y: Math.random() * 0.4 + 0.3 },
      colors: ['#3FAAB7', '#65C5CE', '#BDEBE5', '#78DCE0', '#F5F3EA'],
    });
  }, 250);
};

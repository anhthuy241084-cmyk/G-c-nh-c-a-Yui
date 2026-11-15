import confetti from 'canvas-confetti';

/**
 * Trigger celebratory confetti fireworks & winter snow sparkles when liking / voting or claiming gifts
 */
export const triggerHeartConfetti = (originX = 0.5, originY = 0.6) => {
  const count = 45;
  const defaults = {
    origin: { x: originX, y: originY },
    disableForReducedMotion: true,
  };

  // 1. Winter Memory Box confetti blast
  confetti({
    ...defaults,
    particleCount: count,
    spread: 70,
    startVelocity: 35,
    colors: ['#91A9BC', '#526B80', '#D5E4EF', '#E8F1F8', '#F7FAFD', '#F472B6', '#C7D2FE'],
    scalar: 1.1,
    ticks: 160,
  });

  // 2. Secondary delicate winter sparkle shower
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 25,
      angle: 60,
      spread: 55,
      startVelocity: 28,
      colors: ['#F7FAFD', '#D5E4EF', '#91A9BC', '#E5EDF5'],
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
      colors: ['#91A9BC', '#DCE7EF', '#A9BDCE', '#ffffff'],
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
      colors: ['#91A9BC', '#526B80', '#D5E4EF', '#E8F1F8', '#F7FAFD'],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: Math.random() * 0.4 + 0.5, y: Math.random() * 0.4 + 0.3 },
      colors: ['#91A9BC', '#A9BDCE', '#DCE7EF', '#F472B6', '#F7FAFD'],
    });
  }, 250);
};

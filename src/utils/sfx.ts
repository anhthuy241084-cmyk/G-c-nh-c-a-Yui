// Sound Effects utility using Web Audio API

let sfxCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!sfxCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        sfxCtx = new AudioCtxClass();
      }
    }
    if (sfxCtx && sfxCtx.state === 'suspended') {
      sfxCtx.resume().catch(() => {});
    }
    return sfxCtx;
  } catch (e) {
    console.warn('AudioContext failed:', e);
    return null;
  }
}

/**
 * Play Wind Chime tinkling sound (clear, soft, glassy pentatonic chime)
 */
export function playWindChimeSfx(volume: number = 0.5) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const frequencies = [1174.66, 1318.51, 1567.98, 1760.00, 2093.00, 2349.32]; // D6, E6, G6, A6, C7, D7
  
  // Pick 4-5 quick staggered glass chime notes
  const notesCount = 4 + Math.floor(Math.random() * 2);
  for (let i = 0; i < notesCount; i++) {
    const freq = frequencies[Math.floor(Math.random() * frequencies.length)];
    const noteTime = now + i * 0.08 + Math.random() * 0.03;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, noteTime);

    // Glassy chime envelope
    gain.gain.setValueAtTime(0.0001, noteTime);
    gain.gain.linearRampToValueAtTime(0.12 * volume, noteTime + 0.015);
    gain.gain.linearRampToValueAtTime(0.0001, noteTime + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 0.85);
  }
}

export function playChimeSfx(volume: number = 0.5) {
  playWindChimeSfx(volume);
}

/**
 * Play Mailbox / Feedback Letter Send sound
 */
export function playMailSendSfx(volume: number = 0.5) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(523.25, now); // C5
  osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.25); // C6

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.15 * volume, now + 0.05);
  gain.gain.linearRampToValueAtTime(0.0001, now + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.32);
}

/**
 * Play Door Knock sound
 */
export function playKnockSfx(volume: number = 0.5) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  [0, 0.12].forEach((offset) => {
    const now = ctx.currentTime + offset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.2 * volume, now + 0.01);
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  });
}

/**
 * Play Pop sound (Ingredient added)
 */
export function playPopSfx(volume: number = 0.5) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(700, now + 0.06);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.2 * volume, now + 0.01);
  gain.gain.linearRampToValueAtTime(0.0001, now + 0.07);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.08);
}

/**
 * Play Swish sound (Mixing batter)
 */
export function playSwishSfx(volume: number = 0.5) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.linearRampToValueAtTime(350, now + 0.12);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.12 * volume, now + 0.04);
  gain.gain.linearRampToValueAtTime(0.0001, now + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.16);
}

/**
 * Play Plop sound (Pouring into mold)
 */
export function playPlopSfx(volume: number = 0.5) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(450, now);
  osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.25 * volume, now + 0.02);
  gain.gain.linearRampToValueAtTime(0.0001, now + 0.16);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.18);
}

/**
 * Play Ting sound (Oven timer finished)
 */
export function playTingSfx(volume: number = 0.5) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1760, now); // A6

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.3 * volume, now + 0.01);
  gain.gain.linearRampToValueAtTime(0.0001, now + 0.6);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.65);
}

/**
 * Play Sparkle sound (Topping placed / Completion)
 */
export function playSparkleSfx(volume: number = 0.5) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const freqs = [1046.5, 1318.5, 1567.98, 2093]; // C6, E6, G6, C7
  freqs.forEach((freq, idx) => {
    const noteTime = now + idx * 0.05;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, noteTime);

    gain.gain.setValueAtTime(0.0001, noteTime);
    gain.gain.linearRampToValueAtTime(0.12 * volume, noteTime + 0.01);
    gain.gain.linearRampToValueAtTime(0.0001, noteTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 0.28);
  });
}

/**
 * Play Lantern Glow sound (warm, resonant maritime bell tone with crystal shimmer)
 */
export function playLanternGlowSfx(volume: number = 0.5) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Warm harmonic chime chords: F5, A5, C6, E6
  const chords = [698.46, 880.00, 1046.50, 1318.51];
  chords.forEach((freq, idx) => {
    const noteTime = now + idx * 0.04;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, noteTime);

    gain.gain.setValueAtTime(0.0001, noteTime);
    gain.gain.linearRampToValueAtTime(0.12 * volume, noteTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 1.25);
  });
}

/**
 * Trigger generic named SFX
 */
export function triggerSfx(type: 'pop' | 'sparkle' | 'mail' | 'heart' | 'chime' | 'lantern', volume: number = 0.5) {
  switch (type) {
    case 'pop':
      playPopSfx(volume);
      break;
    case 'sparkle':
      playSparkleSfx(volume);
      break;
    case 'mail':
      playMailSendSfx(volume);
      break;
    case 'heart':
      playSparkleSfx(volume * 0.8);
      break;
    case 'chime':
      playWindChimeSfx(volume);
      break;
    case 'lantern':
      playLanternGlowSfx(volume);
      break;
    default:
      playPopSfx(volume);
  }
}


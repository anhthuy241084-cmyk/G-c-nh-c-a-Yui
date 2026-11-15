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
 * Play Cheerful Roulette Tick (marimba / kalimba / music-box hop as cards jump)
 */
export function playRouletteTickSfx(step: number = 0, totalSteps: number = 16, volume: number = 0.5) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Bright major pentatonic scale ascending gently with excitement
  const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51];
  const progress = Math.min(1, Math.max(0, step / Math.max(1, totalSteps - 1)));
  const noteIdx = step % scale.length;
  const baseFreq = scale[noteIdx] * (1 + progress * 0.12);

  // Main bright woodblock/music-box pluck
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.03, now + 0.045);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.18 * volume, now + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.095);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.11);

  // Subtle crystalline overtone
  const over = ctx.createOscillator();
  const overGain = ctx.createGain();
  over.type = 'sine';
  over.frequency.setValueAtTime(baseFreq * 2, now);
  overGain.gain.setValueAtTime(0.0001, now);
  overGain.gain.linearRampToValueAtTime(0.06 * volume, now + 0.005);
  overGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
  over.connect(overGain);
  overGain.connect(ctx.destination);
  over.start(now);
  over.stop(now + 0.08);
}

/**
 * Play Joyful Random Reveal Fanfare (sparkling winter music-box arpeggio)
 */
export function playRandomRevealSfx(volume: number = 0.5) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]; // C5 E5 G5 C6 E6 G6
  notes.forEach((freq, idx) => {
    const start = now + idx * 0.055;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime((idx === notes.length - 1 ? 0.2 : 0.14) * volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + (idx === notes.length - 1 ? 0.75 : 0.38));

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.8);
  });
}

/**
 * Play Crisp Card Flip Sound
 */
export function playCardFlipSfx(volume: number = 0.5) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(660, now);
  osc.frequency.exponentialRampToValueAtTime(1180, now + 0.09);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.16 * volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.18);
}

/**
 * Play Winter Sleigh Bell Chime (for notification bell)
 */
export function playSleighBellSfx(volume: number = 0.5) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const bellNotes = [1567.98, 1975.53, 2349.32]; // G6, B6, D7
  bellNotes.forEach((freq, i) => {
    const t = now + i * 0.065;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.13 * volume, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.48);
  });
}

/**
 * Play Warm Heart Pop Sound (for voting / liking)
 */
export function playHeartPopSfx(volume: number = 0.5) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  [659.25, 987.77].forEach((freq, i) => {
    const t = now + i * 0.055;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.08, t + 0.08);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.15 * volume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  });
}

/**
 * Trigger generic named SFX
 */
export function triggerSfx(
  type: 'pop' | 'sparkle' | 'mail' | 'heart' | 'chime' | 'lantern' | 'bell' | 'flip' | 'reveal',
  volume: number = 0.5
) {
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
      playHeartPopSfx(volume);
      break;
    case 'chime':
      playWindChimeSfx(volume);
      break;
    case 'lantern':
      playLanternGlowSfx(volume);
      break;
    case 'bell':
      playSleighBellSfx(volume);
      break;
    case 'flip':
      playCardFlipSfx(volume);
      break;
    case 'reveal':
      playRandomRevealSfx(volume);
      break;
    default:
      playPopSfx(volume);
  }
}



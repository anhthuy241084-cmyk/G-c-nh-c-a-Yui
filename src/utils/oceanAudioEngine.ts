// Ocean Ambient Soundscape & Lo-Fi Synthesis Engine
// 100% Web Audio API - Zero external asset dependencies, zero network latency

export interface SoundChannelState {
  id: string;
  name: string;
  icon: string;
  volume: number; // 0 to 1
  enabled: boolean;
  color: string;
  hanzi: string;
  pinyin: string;
  translation: string;
}

export const DEFAULT_CHANNELS: SoundChannelState[] = [
  {
    id: 'waves',
    name: 'Sóng Biển Bình Yên',
    icon: '🌊',
    volume: 0.7,
    enabled: true,
    color: '#38CAD6',
    hanzi: '海晏河清',
    pinyin: 'Hải Yến Hà Thanh',
    translation: 'Biển lặng trời trong, muôn trùng sóng vỗ xoa dịu tâm hồn',
  },
  {
    id: 'rain',
    name: 'Mưa Đêm Trên Vịnh Ngọc',
    icon: '🌧️',
    volume: 0.5,
    enabled: true,
    color: '#7DD8DE',
    hanzi: '夜雨潇潇',
    pinyin: 'Dạ Vũ Tiêu Tiêu',
    translation: 'Hạt mưa tí tách buông rơi bên khung cửa sổ thủy tinh',
  },
  {
    id: 'whale',
    name: 'Khúc Ca Cá Voi Biển Sâu',
    icon: '🐋',
    volume: 0.4,
    enabled: false,
    color: '#1B6E7D',
    hanzi: '沧海龙吟',
    pinyin: 'Thương Hải Long Ngâm',
    translation: 'Tiếng ngân vọng huyền bí từ đáy đại dương bao la',
  },
  {
    id: 'piano',
    name: 'Dương Cầm Sóng Vỗ (Lo-Fi)',
    icon: '🎹',
    volume: 0.55,
    enabled: true,
    color: '#F472B6',
    hanzi: '云水禅心',
    pinyin: 'Vân Thủy Thiền Tâm',
    translation: 'Giai điệu phím đàn êm ái như áng mây trôi giữa biển trời',
  },
  {
    id: 'chimes',
    name: 'Chuông Gió Thủy Tinh',
    icon: '🎐',
    volume: 0.35,
    enabled: false,
    color: '#FBBF24',
    hanzi: '玉磬清音',
    pinyin: 'Ngọc Khánh Thanh Âm',
    translation: 'Tiếng chuông pha lê trong trẻo khẽ rung trong làn gió hạ',
  },
  {
    id: 'fire',
    name: 'Ngọn Lửa Bến Cảng Ấm Áp',
    icon: '🪵',
    volume: 0.3,
    enabled: false,
    color: '#FB923C',
    hanzi: '渔火阑珊',
    pinyin: 'Ngư Hỏa Lan San',
    translation: 'Ánh lửa hồng sưởi ấm người lữ khách nơi bến cảng đêm',
  },
];

class OceanAudioEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private masterGain: GainNode | null = null;
  private masterVolume: number = 0.8;
  private channels: Map<string, { gain: GainNode; nodes: any[] }> = new Map();
  private channelConfigs: SoundChannelState[] = [...DEFAULT_CHANNELS];
  private timerId: any = null;
  private listeners: Set<() => void> = new Set();
  private timerMinutes: number = 0;
  private timerRemainingSeconds: number = 0;
  private timerInterval: any = null;

  constructor() {
    // Try restore channel preferences from localStorage
    try {
      const saved = localStorage.getItem('yui_ocean_soundscape');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.channels)) {
          this.channelConfigs = this.channelConfigs.map((ch) => {
            const found = parsed.channels.find((p: any) => p.id === ch.id);
            return found ? { ...ch, volume: found.volume, enabled: found.enabled } : ch;
          });
        }
        if (typeof parsed.masterVolume === 'number') {
          this.masterVolume = parsed.masterVolume;
        }
      }
    } catch (e) {}
  }

  private savePreferences() {
    try {
      localStorage.setItem(
        'yui_ocean_soundscape',
        JSON.stringify({
          channels: this.channelConfigs.map((c) => ({ id: c.id, volume: c.volume, enabled: c.enabled })),
          masterVolume: this.masterVolume,
        })
      );
    } catch (e) {}
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private initContext(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getIsPlaying(): boolean {
    return this.isRunning;
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  public getChannels(): SoundChannelState[] {
    return [...this.channelConfigs];
  }

  public getTimerSeconds(): number {
    return this.timerRemainingSeconds;
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
    this.savePreferences();
    this.notify();
  }

  public toggleChannel(channelId: string) {
    this.channelConfigs = this.channelConfigs.map((c) =>
      c.id === channelId ? { ...c, enabled: !c.enabled } : c
    );
    this.applyChannelSettings(channelId);
    this.savePreferences();
    this.notify();
  }

  public setChannelVolume(channelId: string, vol: number) {
    this.channelConfigs = this.channelConfigs.map((c) =>
      c.id === channelId ? { ...c, volume: Math.max(0, Math.min(1, vol)) } : c
    );
    this.applyChannelSettings(channelId);
    this.savePreferences();
    this.notify();
  }

  private applyChannelSettings(channelId: string) {
    const ch = this.channelConfigs.find((c) => c.id === channelId);
    if (!ch) return;
    const active = this.channels.get(channelId);
    if (active && this.ctx) {
      const targetGain = ch.enabled ? ch.volume : 0;
      active.gain.gain.setValueAtTime(active.gain.gain.value, this.ctx.currentTime);
      active.gain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.3);
    }
  }

  public setPreset(presetName: 'reading' | 'sleep' | 'focus' | 'sunset') {
    switch (presetName) {
      case 'reading':
        // Waves + Piano + Rain
        this.channelConfigs = this.channelConfigs.map((c) => {
          if (c.id === 'waves') return { ...c, enabled: true, volume: 0.6 };
          if (c.id === 'piano') return { ...c, enabled: true, volume: 0.65 };
          if (c.id === 'rain') return { ...c, enabled: true, volume: 0.35 };
          if (c.id === 'chimes') return { ...c, enabled: true, volume: 0.3 };
          return { ...c, enabled: false };
        });
        break;
      case 'sleep':
        // Waves + Rain + Whale
        this.channelConfigs = this.channelConfigs.map((c) => {
          if (c.id === 'waves') return { ...c, enabled: true, volume: 0.7 };
          if (c.id === 'rain') return { ...c, enabled: true, volume: 0.5 };
          if (c.id === 'whale') return { ...c, enabled: true, volume: 0.45 };
          return { ...c, enabled: false };
        });
        break;
      case 'focus':
        // Rain + Fireplace + Piano
        this.channelConfigs = this.channelConfigs.map((c) => {
          if (c.id === 'rain') return { ...c, enabled: true, volume: 0.65 };
          if (c.id === 'fire') return { ...c, enabled: true, volume: 0.4 };
          if (c.id === 'piano') return { ...c, enabled: true, volume: 0.45 };
          return { ...c, enabled: false };
        });
        break;
      case 'sunset':
        // Waves + Chimes + Piano
        this.channelConfigs = this.channelConfigs.map((c) => {
          if (c.id === 'waves') return { ...c, enabled: true, volume: 0.65 };
          if (c.id === 'chimes') return { ...c, enabled: true, volume: 0.45 };
          if (c.id === 'piano') return { ...c, enabled: true, volume: 0.5 };
          if (c.id === 'whale') return { ...c, enabled: true, volume: 0.3 };
          return { ...c, enabled: false };
        });
        break;
    }
    this.channelConfigs.forEach((c) => this.applyChannelSettings(c.id));
    this.savePreferences();
    this.notify();
  }

  public setTimer(minutes: number) {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.timerMinutes = minutes;
    this.timerRemainingSeconds = minutes * 60;

    if (minutes > 0) {
      this.timerInterval = setInterval(() => {
        this.timerRemainingSeconds -= 1;
        if (this.timerRemainingSeconds <= 0) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
          this.stop();
        }
        this.notify();
      }, 1000);
    }
    this.notify();
  }

  public async start() {
    const ctx = this.initContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    if (this.isRunning) return;

    // Master Gain
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.masterVolume, ctx.currentTime);
    this.masterGain.connect(ctx.destination);

    // Initialize all 6 sound layers
    this.channelConfigs.forEach((ch) => {
      const channelGain = ctx.createGain();
      const initialVol = ch.enabled ? ch.volume : 0;
      channelGain.gain.setValueAtTime(initialVol, ctx.currentTime);
      channelGain.connect(this.masterGain!);

      const nodes = this.spawnLayer(ch.id, channelGain);
      this.channels.set(ch.id, { gain: channelGain, nodes });
    });

    this.isRunning = true;
    this.notify();
  }

  public stop() {
    if (!this.isRunning) return;

    // Gracefully clean up all audio nodes
    this.channels.forEach(({ nodes, gain }) => {
      try {
        nodes.forEach((n) => {
          if (n.stop) n.stop();
          if (n.disconnect) n.disconnect();
          if (typeof n.timerId === 'number') clearInterval(n.timerId);
        });
        gain.disconnect();
      } catch (e) {}
    });
    this.channels.clear();

    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch (e) {}
      this.masterGain = null;
    }

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.timerRemainingSeconds = 0;

    this.isRunning = false;
    this.notify();
  }

  public togglePlay() {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
  }

  private spawnLayer(type: string, destination: GainNode): any[] {
    if (!this.ctx) return [];
    const ctx = this.ctx;
    const spawned: any[] = [];

    switch (type) {
      case 'waves': {
        // Ocean Waves pink noise with slow oscillating surf
        const bufferSize = ctx.sampleRate * 4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          data[i] = (b0 + b1 + b2) * 0.12;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 350;

        // LFO for surf wave rhythm
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.12; // ~8 seconds wave cycle

        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 260; // Filter sweep

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        noise.connect(filter);
        filter.connect(destination);

        noise.start();
        lfo.start();

        spawned.push(noise, lfo, lfoGain, filter);
        break;
      }

      case 'rain': {
        // Night rain: white noise through bandpass filter
        const bufferSize = ctx.sampleRate * 3;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.08;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1800;
        filter.Q.value = 0.7;

        noise.connect(filter);
        filter.connect(destination);
        noise.start();

        spawned.push(noise, filter);
        break;
      }

      case 'whale': {
        // Deep whale singing periodically
        let isWhaleActive = true;
        const playWhaleCall = () => {
          if (!isWhaleActive || !this.isRunning || !this.ctx) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          osc.type = 'sine';
          const startFreq = 120 + Math.random() * 60;
          const endFreq = 220 + Math.random() * 80;

          osc.frequency.setValueAtTime(startFreq, now);
          osc.frequency.exponentialRampToValueAtTime(endFreq, now + 2.5);
          osc.frequency.exponentialRampToValueAtTime(startFreq * 0.8, now + 4.5);

          filter.type = 'lowpass';
          filter.frequency.value = 400;

          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.18, now + 1.2);
          gain.gain.linearRampToValueAtTime(0.0001, now + 5.0);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(destination);

          osc.start(now);
          osc.stop(now + 5.2);
        };

        const interval = setInterval(() => {
          if (Math.random() > 0.3) {
            playWhaleCall();
          }
        }, 8500);

        spawned.push({
          stop: () => {
            isWhaleActive = false;
            clearInterval(interval);
          },
        });
        break;
      }

      case 'piano': {
        // Lo-Fi Gentle Sea Piano Chords: Cmaj7, Am7, Fmaj7, G6
        const chordProgressions = [
          [261.63, 329.63, 392.00, 493.88], // Cmaj7
          [220.00, 261.63, 329.63, 392.00], // Am7
          [174.61, 261.63, 329.63, 440.00], // Fmaj7
          [196.00, 246.94, 293.66, 392.00], // G6
        ];
        let chordIndex = 0;
        let isPianoActive = true;

        const playChord = () => {
          if (!isPianoActive || !this.isRunning || !this.ctx) return;
          const now = this.ctx.currentTime;
          const chord = chordProgressions[chordIndex % chordProgressions.length];
          chordIndex++;

          chord.forEach((freq, idx) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            const filter = this.ctx!.createBiquadFilter();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.05);

            filter.type = 'lowpass';
            filter.frequency.value = 900;

            const noteTime = now + idx * 0.05;
            gain.gain.setValueAtTime(0.0001, noteTime);
            gain.gain.linearRampToValueAtTime(0.09, noteTime + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 3.8);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(destination);

            osc.start(noteTime);
            osc.stop(noteTime + 3.9);
          });
        };

        playChord();
        const interval = setInterval(playChord, 4500);

        spawned.push({
          stop: () => {
            isPianoActive = false;
            clearInterval(interval);
          },
        });
        break;
      }

      case 'chimes': {
        // Crystal glass bells
        let isChimeActive = true;
        const chimesFreqs = [1318.51, 1567.98, 1760.00, 2093.00, 2637.02];
        const playChimeNote = () => {
          if (!isChimeActive || !this.isRunning || !this.ctx) return;
          const now = this.ctx.currentTime;
          const freq = chimesFreqs[Math.floor(Math.random() * chimesFreqs.length)];

          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.08, now + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

          osc.connect(gain);
          gain.connect(destination);

          osc.start(now);
          osc.stop(now + 1.85);
        };

        const interval = setInterval(() => {
          if (Math.random() > 0.35) {
            playChimeNote();
          }
        }, 3200);

        spawned.push({
          stop: () => {
            isChimeActive = false;
            clearInterval(interval);
          },
        });
        break;
      }

      case 'fire': {
        // Crackling campfire / warm harbor fireplace
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          // Low rumble + occasional sharp crackle
          const isCrackle = Math.random() > 0.9985;
          data[i] = isCrackle ? (Math.random() * 2 - 1) * 0.45 : (Math.random() * 2 - 1) * 0.02;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 550;

        noise.connect(filter);
        filter.connect(destination);
        noise.start();

        spawned.push(noise, filter);
        break;
      }
    }

    return spawned;
  }
}

export const oceanAudio = new OceanAudioEngine();

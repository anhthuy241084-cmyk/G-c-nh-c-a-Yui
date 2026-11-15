// Winter Snow Ambient Soundscape & Lo-Fi Synthesis Engine
// 100% Web Audio API - Zero external asset dependencies

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

export const DEFAULT_WINTER_CHANNELS: SoundChannelState[] = [
  {
    id: 'snow_wind',
    name: 'Gió Tuyết Rì Rào',
    icon: '❄️',
    volume: 0.7,
    enabled: true,
    color: '#91A9BC',
    hanzi: '风雪 Soso',
    pinyin: 'Phong Tuyết Tiêu Tiêu',
    translation: 'Tiếng gió lạnh lùng thổi qua những rặng thông và lớp tuyết mềm',
  },
  {
    id: 'chimes',
    name: 'Chuông Gió Pha Lê',
    icon: '🎐',
    volume: 0.5,
    enabled: true,
    color: '#D5E4EF',
    hanzi: '冰铃清音',
    pinyin: 'Băng Linh Thanh Âm',
    translation: 'Tiếng chuông băng trong trẻo ngân vang trong không gian tĩnh lặng',
  },
  {
    id: 'fireplace',
    name: 'Hơi Ấm Lò Sưởi',
    icon: '🪵',
    volume: 0.4,
    enabled: false,
    color: '#F472B6',
    hanzi: '炉火融融',
    pinyin: 'Lô Hỏa Dung Dung',
    translation: 'Tiếng củi khô tí tách sưởi ấm căn phòng nhỏ giữa mùa đông',
  },
  {
    id: 'piano',
    name: 'Dương Cầm Sương Giá (Lo-Fi)',
    icon: '🎹',
    volume: 0.55,
    enabled: true,
    color: '#526B80',
    hanzi: '冬日琴声',
    pinyin: 'Đông Nhật Tầm Thanh',
    translation: 'Giai điệu piano dịu êm tựa bông tuyết rơi bên khung cửa',
  },
  {
    id: 'snow_fall',
    name: 'Hạt Tuyết Rơi Tý Tách',
    icon: '🌨️',
    volume: 0.35,
    enabled: false,
    color: '#A9BDCE',
    hanzi: '琼玉霏霏',
    pinyin: 'Quỳnh Ngọc Phi Phi',
    translation: 'Tiếng tuyết nhẹ rơi chạm vào mái hiên và ô cửa sổ kính',
  },
  {
    id: 'tea',
    name: 'Tách Trà Ấm Đêm Đông',
    icon: '☕',
    volume: 0.3,
    enabled: false,
    color: '#E2E8F0',
    hanzi: '寒夜温茶',
    pinyin: 'Hàn Dạ Ôn Trà',
    translation: 'Hơi ấm bốc lên từ tách trà thơm giữa tiết trời băng giá',
  },
];

class WinterAudioEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private masterGain: GainNode | null = null;
  private masterVolume: number = 0.8;
  private channels: Map<string, { gain: GainNode; nodes: any[] }> = new Map();
  private channelConfigs: SoundChannelState[] = [...DEFAULT_WINTER_CHANNELS];
  private listeners: Set<() => void> = new Set();
  private timerMinutes: number = 0;
  private timerRemainingSeconds: number = 0;
  private timerInterval: any = null;

  constructor() {
    try {
      const saved = localStorage.getItem('yui_winter_soundscape');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          this.channelConfigs = this.channelConfigs.map((c) => {
            const found = parsed.find((p: any) => p.id === c.id);
            return found ? { ...c, volume: found.volume ?? c.volume, enabled: found.enabled ?? c.enabled } : c;
          });
        }
      }
      const savedMaster = localStorage.getItem('yui_winter_master_vol');
      if (savedMaster !== null) {
        this.masterVolume = parseFloat(savedMaster);
      }
    } catch (e) {
      // ignore
    }
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

  private saveState() {
    try {
      localStorage.setItem('yui_winter_soundscape', JSON.stringify(
        this.channelConfigs.map((c) => ({ id: c.id, volume: c.volume, enabled: c.enabled }))
      ));
      localStorage.setItem('yui_winter_master_vol', this.masterVolume.toString());
    } catch (e) {
      // ignore
    }
  }

  public getIsPlaying() {
    return this.isRunning;
  }

  public getChannels() {
    return this.channelConfigs;
  }

  public getMasterVolume() {
    return this.masterVolume;
  }

  public getTimerSeconds() {
    return this.timerRemainingSeconds;
  }

  public togglePlay() {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
  }

  public start() {
    if (this.isRunning) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.channelConfigs.forEach((config) => {
        if (config.enabled) {
          this.initChannel(config.id, config.volume);
        }
      });

      this.isRunning = true;
      this.notify();
    } catch (e) {
      console.error('Failed to start winter audio engine:', e);
    }
  }

  public stop() {
    if (!this.isRunning) return;
    this.channels.forEach((ch) => {
      ch.nodes.forEach((n) => {
        try {
          if (n.stop) n.stop();
          if (n.disconnect) n.disconnect();
        } catch (e) {}
      });
    });
    this.channels.clear();
    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch (e) {}
      this.masterGain = null;
    }
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend();
    }
    this.isRunning = false;
    this.notify();
  }

  public toggleChannel(id: string) {
    const config = this.channelConfigs.find((c) => c.id === id);
    if (!config) return;
    config.enabled = !config.enabled;
    this.saveState();

    if (this.isRunning) {
      if (config.enabled) {
        this.initChannel(id, config.volume);
      } else {
        this.stopChannel(id);
      }
    }
    this.notify();
  }

  public setChannelVolume(id: string, vol: number) {
    const config = this.channelConfigs.find((c) => c.id === id);
    if (!config) return;
    config.volume = Math.max(0, Math.min(1, vol));
    this.saveState();

    const ch = this.channels.get(id);
    if (ch && this.ctx && this.masterGain) {
      ch.gain.gain.setValueAtTime(config.volume, this.ctx.currentTime);
    }
    this.notify();
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    this.saveState();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
    this.notify();
  }

  public setPreset(preset: 'reading' | 'sleep' | 'focus' | 'holiday') {
    const presets: Record<string, { [key: string]: boolean }> = {
      reading: { snow_wind: true, chimes: true, fireplace: false, piano: true, snow_fall: false, tea: false },
      sleep: { snow_wind: true, chimes: false, fireplace: true, piano: false, snow_fall: true, tea: false },
      focus: { snow_wind: true, chimes: true, fireplace: false, piano: true, snow_fall: false, tea: true },
      holiday: { snow_wind: true, chimes: true, fireplace: true, piano: true, snow_fall: true, tea: true },
    };

    const setting = presets[preset] || presets.reading;
    this.channelConfigs = this.channelConfigs.map((c) => ({
      ...c,
      enabled: setting[c.id] ?? c.enabled,
    }));
    this.saveState();

    if (this.isRunning) {
      this.channelConfigs.forEach((c) => {
        if (c.enabled) {
          if (!this.channels.has(c.id)) {
            this.initChannel(c.id, c.volume);
          }
        } else {
          this.stopChannel(c.id);
        }
      });
    }
    this.notify();
  }

  public setTimer(minutes: number) {
    this.timerMinutes = minutes;
    this.timerRemainingSeconds = minutes * 60;
    if (this.timerInterval) clearInterval(this.timerInterval);

    if (minutes <= 0) {
      this.timerRemainingSeconds = 0;
      this.notify();
      return;
    }

    this.timerInterval = setInterval(() => {
      if (this.timerRemainingSeconds > 0) {
        this.timerRemainingSeconds--;
        this.notify();
      } else {
        clearInterval(this.timerInterval);
        this.stop();
      }
    }, 1000);
    this.notify();
  }

  private stopChannel(id: string) {
    const ch = this.channels.get(id);
    if (ch) {
      ch.nodes.forEach((n) => {
        try {
          if (n.stop) n.stop();
          if (n.disconnect) n.disconnect();
        } catch (e) {}
      });
      this.channels.delete(id);
    }
  }

  private initChannel(id: string, volume: number) {
    if (!this.ctx || !this.masterGain) return;
    this.stopChannel(id);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
    gainNode.connect(this.masterGain);

    const nodes: any[] = [];

    if (id === 'snow_wind') {
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.05;
        b6 = white * 0.115926;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(180, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      noise.connect(filter);
      filter.connect(gainNode);
      noise.start();
      nodes.push(noise, filter, lfo, lfoGain);
    } else if (id === 'chimes') {
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      const timer = setInterval(() => {
        if (!this.ctx || !this.isRunning) return;
        if (Math.random() > 0.4) {
          const freq = notes[Math.floor(Math.random() * notes.length)];
          const osc = this.ctx.createOscillator();
          const noteGain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          noteGain.gain.setValueAtTime(0, this.ctx.currentTime);
          noteGain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.05);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.0);

          osc.connect(noteGain);
          noteGain.connect(gainNode);
          osc.start();
          osc.stop(this.ctx.currentTime + 3.2);
        }
      }, 1200);
      nodes.push({ stop: () => clearInterval(timer) });
    } else if (id === 'fireplace') {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() < 0.001 ? (Math.random() * 2 - 1) * 0.8 : (Math.random() * 2 - 1) * 0.02;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(gainNode);
      noise.start();
      nodes.push(noise, filter);
    } else if (id === 'piano') {
      const chords = [
        [261.63, 329.63, 392.00],
        [220.00, 261.63, 329.63],
        [174.61, 220.00, 261.63],
        [196.00, 246.94, 293.66],
      ];
      let chordIdx = 0;
      const timer = setInterval(() => {
        if (!this.ctx || !this.isRunning) return;
        const chord = chords[chordIdx];
        chordIdx = (chordIdx + 1) % chords.length;

        chord.forEach((freq, idx) => {
          setTimeout(() => {
            if (!this.ctx || !this.isRunning) return;
            const osc = this.ctx.createOscillator();
            const noteGain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            noteGain.gain.setValueAtTime(0, this.ctx.currentTime);
            noteGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.1);
            noteGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 4.0);

            osc.connect(noteGain);
            noteGain.connect(gainNode);
            osc.start();
            osc.stop(this.ctx.currentTime + 4.2);
          }, idx * 150);
        });
      }, 4500);
      nodes.push({ stop: () => clearInterval(timer) });
    } else if (id === 'snow_fall') {
      const timer = setInterval(() => {
        if (!this.ctx || !this.isRunning) return;
        if (Math.random() > 0.3) {
          const osc = this.ctx.createOscillator();
          const noteGain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800 + Math.random() * 400, this.ctx.currentTime);

          noteGain.gain.setValueAtTime(0, this.ctx.currentTime);
          noteGain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 0.02);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);

          osc.connect(noteGain);
          noteGain.connect(gainNode);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.35);
        }
      }, 400);
      nodes.push({ stop: () => clearInterval(timer) });
    } else if (id === 'tea') {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() < 0.005 ? (Math.random() * 2 - 1) * 0.3 : (Math.random() * 2 - 1) * 0.01;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(gainNode);
      noise.start();
      nodes.push(noise, filter);
    }

    this.channels.set(id, { gain: gainNode, nodes });
  }
}

export const winterAudio = new WinterAudioEngine();

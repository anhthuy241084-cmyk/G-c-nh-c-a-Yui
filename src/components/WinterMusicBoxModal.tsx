import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  Music,
  Disc,
} from 'lucide-react';
import { winterAudio, SoundChannelState } from '../utils/winterAudioEngine';
import { triggerSfx } from '../utils/sfx';

interface WinterMusicBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSfxOn?: boolean;
  sfxVolume?: number;
}

export const WinterMusicBoxModal: React.FC<WinterMusicBoxModalProps> = ({
  isOpen,
  onClose,
  isSfxOn = true,
  sfxVolume = 0.5,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(winterAudio.getIsPlaying());
  const [channels, setChannels] = useState<SoundChannelState[]>(winterAudio.getChannels());
  const [masterVolume, setMasterVolume] = useState<number>(winterAudio.getMasterVolume());
  const [timerSeconds, setTimerSeconds] = useState<number>(winterAudio.getTimerSeconds());
  const [activePreset, setActivePreset] = useState<string>('reading');

  useEffect(() => {
    const unsubscribe = winterAudio.subscribe(() => {
      setIsPlaying(winterAudio.getIsPlaying());
      setChannels(winterAudio.getChannels());
      setMasterVolume(winterAudio.getMasterVolume());
      setTimerSeconds(winterAudio.getTimerSeconds());
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleTogglePlay = () => {
    if (isSfxOn) triggerSfx('pop', sfxVolume);
    winterAudio.togglePlay();
  };

  const handleToggleChannel = (id: string) => {
    if (isSfxOn) triggerSfx('pop', sfxVolume);
    winterAudio.toggleChannel(id);
  };

  const handleChannelVolumeChange = (id: string, vol: number) => {
    winterAudio.setChannelVolume(id, vol);
  };

  const handleMasterVolumeChange = (vol: number) => {
    winterAudio.setMasterVolume(vol);
  };

  const handleSelectPreset = (preset: 'reading' | 'sleep' | 'focus' | 'holiday') => {
    if (isSfxOn) triggerSfx('sparkle', sfxVolume);
    setActivePreset(preset);
    winterAudio.setPreset(preset);
    if (!isPlaying) {
      winterAudio.start();
    }
  };

  const handleSetTimer = (minutes: number) => {
    if (isSfxOn) triggerSfx('pop', sfxVolume);
    winterAudio.setTimer(minutes);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0E1726]/80 backdrop-blur-md transition-opacity"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative w-full max-w-2xl bg-gradient-to-b from-[#F7FAFD] via-[#E8F1F8] to-[#DDEBFA] dark:from-[#172536] dark:via-[#1E2E42] dark:to-[#121C28] rounded-3xl border border-[#91A9BC]/40 dark:border-[#43576B] shadow-2xl shadow-[#526B80]/20 dark:shadow-black/70 overflow-hidden my-auto max-h-[92vh] flex flex-col z-10 text-[#526B80] dark:text-[#E5EDF5]"
        >
          {/* Header Glow Elements */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#91A9BC]/15 dark:bg-[#91A9BC]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-300/15 dark:bg-pink-900/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          {/* Modal Header */}
          <div className="p-5 sm:p-6 pb-4 border-b border-[#DCE7EF] dark:border-[#354A60] flex items-start justify-between gap-3 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-2xl bg-gradient-to-tr from-[#91A9BC] to-[#526B80] text-white shadow-md shadow-[#526B80]/20">
                  <Music className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold font-serif text-[#526B80] dark:text-[#E5EDF5] flex items-center gap-1.5">
                    <span>Hộp Nhạc Tuyết &amp; Không Gian Mùa Đông</span>
                    <span className="text-xs">❄</span>
                  </h2>
                  <p className="text-xs text-[#91A9BC] dark:text-[#A9BDCE] font-serif">
                    &ldquo;Lắng nghe tiếng gió tuyết và giai điệu pha lê xoa dịu tâm hồn ✧&rdquo;
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#91A9BC] hover:text-[#526B80] dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 relative z-10 custom-scrollbar">
            
            {/* Master Control Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-[#1C2C3F]/90 border border-[#DCE7EF] dark:border-[#43576B] shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleTogglePlay}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md transition-all cursor-pointer ${
                    isPlaying
                      ? 'bg-gradient-to-tr from-[#91A9BC] to-[#526B80] shadow-[#526B80]/30 animate-pulse'
                      : 'bg-slate-400 hover:bg-[#526B80]'
                  }`}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </motion.button>
                <div>
                  <h3 className="text-sm font-bold font-serif text-[#526B80] dark:text-[#E5EDF5]">
                    {isPlaying ? 'Hộp nhạc tuyết đang phát...' : 'Hộp nhạc đang dừng'}
                  </h3>
                  <p className="text-[11px] text-[#91A9BC] dark:text-[#A9BDCE] font-serif">
                    {isPlaying ? 'Bật/tắt các lớp âm thanh bên dưới tùy ý' : 'Nhấn nút phát để hòa mình vào không gian tuyết'}
                  </p>
                </div>
              </div>

              {/* Master Volume Slider */}
              <div className="flex items-center gap-2 min-w-[180px]">
                <button
                  onClick={() => handleMasterVolumeChange(masterVolume === 0 ? 0.8 : 0)}
                  className="text-[#91A9BC] hover:text-[#526B80] dark:hover:text-white cursor-pointer"
                >
                  {masterVolume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={masterVolume}
                  onChange={(e) => handleMasterVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-[#91A9BC] cursor-pointer"
                />
                <span className="text-xs font-mono w-8 text-right text-[#91A9BC]">
                  {Math.round(masterVolume * 100)}%
                </span>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#526B80] dark:text-[#E5EDF5] flex items-center gap-1.5 font-serif">
                <Sparkles className="w-3.5 h-3.5 text-[#91A9BC]" />
                <span>Gợi ý không gian mùa đông</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'reading', label: '📖 Đọc Sách Bên Lò', icon: '☕' },
                  { id: 'sleep', label: '🌙 Ngủ Ngon Đêm Tuyết', icon: '❄️' },
                  { id: 'focus', label: '🎧 Tập Trung Học Tập', icon: '📚' },
                  { id: 'holiday', label: '🎄 Dạ Hội Mùa Đông', icon: '✨' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id as any)}
                    className={`p-2.5 rounded-2xl border text-xs font-serif font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                      activePreset === preset.id
                        ? 'bg-[#91A9BC] text-white border-[#91A9BC] shadow-sm shadow-[#91A9BC]/30'
                        : 'bg-white/70 dark:bg-[#1C2C3F]/70 border-[#DCE7EF] dark:border-[#43576B] text-[#526B80] dark:text-[#E5EDF5] hover:bg-white dark:hover:bg-[#202F42]'
                    }`}
                  >
                    <span className="text-base">{preset.icon}</span>
                    <span className="truncate">{preset.label.replace(/^[^\s]+\s/, '')}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sound Channels Grid */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#526B80] dark:text-[#E5EDF5] flex items-center gap-1.5 font-serif">
                <Disc className="w-3.5 h-3.5 text-[#91A9BC]" />
                <span>Thành phần âm thanh (Kênh trộn)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {channels.map((ch) => (
                  <div
                    key={ch.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      ch.enabled
                        ? 'bg-white dark:bg-[#1C2C3F] border-[#91A9BC]/50 dark:border-[#526B80] shadow-sm'
                        : 'bg-white/40 dark:bg-[#172536]/40 border-[#DCE7EF] dark:border-[#354A60] opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={() => handleToggleChannel(ch.id)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-2xs transition-transform active:scale-95 cursor-pointer ${
                            ch.enabled
                              ? 'bg-[#91A9BC] text-white shadow-sm'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                          }`}
                        >
                          {ch.icon}
                        </button>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold font-serif text-[#526B80] dark:text-[#E5EDF5] truncate">
                            {ch.name}
                          </h4>
                          <p className="text-[10px] text-[#91A9BC] dark:text-[#A9BDCE] truncate font-serif italic">
                            {ch.translation}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#E8F1F8] dark:bg-[#202F42] text-[#526B80] dark:text-[#E5EDF5]">
                        {Math.round(ch.volume * 100)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={ch.volume}
                        disabled={!ch.enabled}
                        onChange={(e) => handleChannelVolumeChange(ch.id, parseFloat(e.target.value))}
                        className="w-full accent-[#91A9BC] cursor-pointer disabled:opacity-40"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timer Section */}
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#1C2C3F]/70 border border-[#DCE7EF] dark:border-[#43576B] flex flex-wrap items-center justify-between gap-3 font-serif">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#91A9BC]" />
                <span className="text-xs font-bold text-[#526B80] dark:text-[#E5EDF5]">Hẹn giờ tắt âm thanh:</span>
                {timerSeconds > 0 && (
                  <span className="text-xs font-mono font-bold text-pink-500 animate-pulse">
                    ({formatTimer(timerSeconds)})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {[0, 15, 30, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handleSetTimer(mins)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      (mins === 0 && timerSeconds === 0) || (timerSeconds > 0 && Math.round(timerSeconds / 60) === mins)
                        ? 'bg-[#91A9BC] text-white shadow-xs'
                        : 'bg-white dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] text-[#526B80] dark:text-[#E5EDF5] hover:bg-[#E8F1F8]'
                    }`}
                  >
                    {mins === 0 ? 'Tắt hẹn giờ' : `${mins} phút`}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-5 bg-white/90 dark:bg-[#172536]/90 border-t border-[#DCE7EF] dark:border-[#354A60] flex items-center justify-between shrink-0">
            <p className="text-[11px] text-[#91A9BC] dark:text-[#A9BDCE] font-serif italic">
              ✧ Không gian âm thanh sẽ tiếp tục chạy ngầm khi bạn duyệt web.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-2xl bg-[#91A9BC] hover:bg-[#526B80] text-white text-xs font-bold shadow-md shadow-[#91A9BC]/20 transition-all cursor-pointer font-serif"
            >
              Đóng hộp nhạc ✦
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WinterMusicBoxModal;

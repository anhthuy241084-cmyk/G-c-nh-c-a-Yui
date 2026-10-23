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
  Compass,
  Check,
  Disc,
} from 'lucide-react';
import { oceanAudio, SoundChannelState } from '../utils/oceanAudioEngine';
import { triggerSfx } from '../utils/sfx';

interface OceanMusicBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSfxOn?: boolean;
  sfxVolume?: number;
}

export const OceanMusicBoxModal: React.FC<OceanMusicBoxModalProps> = ({
  isOpen,
  onClose,
  isSfxOn = true,
  sfxVolume = 0.5,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(oceanAudio.getIsPlaying());
  const [channels, setChannels] = useState<SoundChannelState[]>(oceanAudio.getChannels());
  const [masterVolume, setMasterVolume] = useState<number>(oceanAudio.getMasterVolume());
  const [timerSeconds, setTimerSeconds] = useState<number>(oceanAudio.getTimerSeconds());
  const [activePreset, setActivePreset] = useState<string>('reading');

  // Sync state from audio engine
  useEffect(() => {
    const unsubscribe = oceanAudio.subscribe(() => {
      setIsPlaying(oceanAudio.getIsPlaying());
      setChannels(oceanAudio.getChannels());
      setMasterVolume(oceanAudio.getMasterVolume());
      setTimerSeconds(oceanAudio.getTimerSeconds());
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleTogglePlay = () => {
    if (isSfxOn) triggerSfx('pop', sfxVolume);
    oceanAudio.togglePlay();
  };

  const handleToggleChannel = (id: string) => {
    if (isSfxOn) triggerSfx('pop', sfxVolume);
    oceanAudio.toggleChannel(id);
  };

  const handleChannelVolumeChange = (id: string, vol: number) => {
    oceanAudio.setChannelVolume(id, vol);
  };

  const handleMasterVolumeChange = (vol: number) => {
    oceanAudio.setMasterVolume(vol);
  };

  const handleSelectPreset = (preset: 'reading' | 'sleep' | 'focus' | 'sunset') => {
    if (isSfxOn) triggerSfx('sparkle', sfxVolume);
    setActivePreset(preset);
    oceanAudio.setPreset(preset);
    if (!isPlaying) {
      oceanAudio.start();
    }
  };

  const handleSetTimer = (minutes: number) => {
    if (isSfxOn) triggerSfx('pop', sfxVolume);
    oceanAudio.setTimer(minutes);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#04121A]/75 backdrop-blur-md transition-opacity"
        />

        {/* Modal Dialog Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative w-full max-w-2xl bg-gradient-to-b from-[#FFFDFD] via-[#F4FBFC] to-[#E9F8FA] dark:from-[#061821] dark:via-[#09222E] dark:to-[#04131A] rounded-3xl border border-[#38CAD6]/35 dark:border-[#38CAD6]/30 shadow-2xl shadow-[#1B6E7D]/25 dark:shadow-black/70 overflow-hidden my-auto max-h-[92vh] flex flex-col z-10"
        >
          {/* Header Glow Elements */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#38CAD6]/20 dark:bg-[#38CAD6]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F472B6]/15 dark:bg-[#F472B6]/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          {/* Modal Header */}
          <div className="p-5 sm:p-6 pb-4 border-b border-[#38CAD6]/20 dark:border-[#102B36] flex items-start justify-between gap-3 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-2xl bg-gradient-to-tr from-[#38CAD6] to-[#1B6E7D] text-white shadow-md shadow-[#1B6E7D]/20">
                  <Music className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#14303A] dark:text-[#E4F7F9] font-serif flex items-center gap-2">
                    <span>Hộp Nhạc Sóng Biển</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#38CAD6]/20 text-[#1B6E7D] dark:text-[#48CCD6] font-sans font-semibold">
                      Thư giãn & Lo-Fi ✦
                    </span>
                  </h3>
                  <p className="text-xs text-[#53737C] dark:text-[#88A9B3] font-serif">
                    Hòa âm biển cả, mưa đêm & phím đàn ru êm tâm hồn
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#53737C] hover:text-[#14303A] dark:text-[#88A9B3] dark:hover:text-white hover:bg-[#E0F3F5] dark:hover:bg-[#132F3D] transition-colors cursor-pointer"
              title="Đóng hộp nhạc (nhạc vẫn tiếp tục phát trong nền)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body - Scrollable */}
          <div className="p-5 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 relative z-10">
            
            {/* Visualizer & Master Control Center */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-[#E8F7F9]/90 to-[#D2F0F0]/70 dark:from-[#0B2530]/90 dark:to-[#071C25]/85 border border-[#38CAD6]/30 shadow-inner flex flex-col sm:flex-row items-center gap-5">
              
              {/* Spinning Music Vinyl Disc / Music Box Rotor */}
              <div className="relative shrink-0 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{
                    repeat: isPlaying ? Infinity : 0,
                    duration: 12,
                    ease: 'linear',
                  }}
                  className={`w-24 h-24 rounded-full bg-gradient-to-tr from-[#1B6E7D] via-[#0E353D] to-[#38CAD6] border-2 border-white/60 dark:border-white/20 shadow-lg flex items-center justify-center relative overflow-hidden ${
                    isPlaying ? 'shadow-[#38CAD6]/40' : ''
                  }`}
                >
                  {/* Vinyl Grooves */}
                  <div className="absolute inset-2 rounded-full border border-white/20 pointer-events-none" />
                  <div className="absolute inset-4 rounded-full border border-white/15 pointer-events-none" />
                  <div className="absolute inset-6 rounded-full border border-white/20 pointer-events-none" />
                  
                  {/* Center Label */}
                  <div className="w-9 h-9 rounded-full bg-[#FFFDFC] dark:bg-[#061821] border border-[#38CAD6] flex items-center justify-center">
                    <span className="text-xs">🐚</span>
                  </div>
                </motion.div>

                {/* Tone Needle Arm Indicator */}
                <div
                  className={`absolute -top-1 -right-2 w-6 h-10 border-t-2 border-r-2 border-[#F59E0B] rounded-tr-lg transform origin-top-right transition-transform duration-500 pointer-events-none ${
                    isPlaying ? 'rotate-12' : '-rotate-12'
                  }`}
                />
              </div>

              {/* Master Play Button & Master Slider */}
              <div className="flex-1 w-full space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={handleTogglePlay}
                    className={`flex-1 py-3 px-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer active:scale-98 ${
                      isPlaying
                        ? 'bg-gradient-to-r from-[#1B6E7D] to-[#38CAD6] text-white shadow-[#38CAD6]/30 ring-2 ring-[#38CAD6]/40'
                        : 'bg-[#FFFDFC] dark:bg-[#102B36] text-[#1B6E7D] dark:text-[#48CCD6] border border-[#38CAD6]/40 hover:bg-[#E8F7F9]'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5 fill-current" />
                        <span>Tạm Dừng Thanh Âm</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 fill-current" />
                        <span>Lắng Nghe Hộp Nhạc</span>
                      </>
                    )}
                  </button>

                  {/* Timer Badge if active */}
                  {timerSeconds > 0 && (
                    <div className="px-3 py-2 rounded-2xl bg-[#FFFDFC] dark:bg-[#071C25] border border-[#38CAD6]/30 text-xs font-mono font-bold text-[#1B6E7D] dark:text-[#48CCD6] flex items-center gap-1.5 shrink-0">
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                      <span>{formatTimer(timerSeconds)}</span>
                    </div>
                  )}
                </div>

                {/* Master Volume Slider */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => handleMasterVolumeChange(masterVolume > 0 ? 0 : 0.8)}
                    className="text-[#53737C] hover:text-[#1B6E7D] dark:text-[#88A9B3] dark:hover:text-white"
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
                    className="flex-1 h-1.5 bg-[#BFE7E8] dark:bg-[#102B36] rounded-lg appearance-none cursor-pointer accent-[#1B6E7D] dark:accent-[#38CAD6]"
                  />
                  <span className="text-[11px] font-mono font-bold text-[#53737C] dark:text-[#88A9B3] w-9 text-right">
                    {Math.round(masterVolume * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Mood Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#1B6E7D] dark:text-[#7DD8DE] font-serif uppercase tracking-wider">
                <span>✦ Tâm Trạng & Không Gian (Presets)</span>
                <span className="text-[10px] font-normal text-[#53737C] dark:text-[#88A9B3]">
                  Chọn để tự động phối âm
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'reading', label: 'Đọc Truyện & RP', icon: '📖', desc: 'Dương cầm + sóng dịu' },
                  { id: 'sleep', label: 'Ngủ Ngon Giấc', icon: '🌙', desc: 'Sóng đêm + tiếng cá voi' },
                  { id: 'focus', label: 'Tập Trung Cao', icon: '☕', desc: 'Mưa rào + lò sưởi ấm' },
                  { id: 'sunset', label: 'Hoàng Hôn Biển', icon: '🌅', desc: 'Chuông gió + sóng chiều' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id as any)}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      activePreset === preset.id
                        ? 'bg-[#38CAD6]/20 border-[#38CAD6] shadow-xs text-[#14303A] dark:text-white'
                        : 'bg-[#FFFDFC]/80 dark:bg-[#0A1F29]/60 border-[#38CAD6]/20 hover:bg-[#E8F7F9] dark:hover:bg-[#102B36] text-[#53737C] dark:text-[#88A9B3]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{preset.icon}</span>
                      {activePreset === preset.id && <Check className="w-3.5 h-3.5 text-[#1B6E7D] dark:text-[#38CAD6]" />}
                    </div>
                    <div className="text-xs font-bold mt-1 text-[#14303A] dark:text-[#E4F7F9]">{preset.label}</div>
                    <div className="text-[10px] text-[#53737C] dark:text-[#88A9B3] truncate">{preset.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Individual Sound Channels (6 Tracks) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#1B6E7D] dark:text-[#7DD8DE] font-serif uppercase tracking-wider">
                <span>🌊 6 Tầng Âm Sắc Thiên Nhiên</span>
                <span className="text-[10px] font-normal text-[#53737C] dark:text-[#88A9B3]">
                  Tùy chỉnh riêng từng âm thanh
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {channels.map((ch) => (
                  <div
                    key={ch.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      ch.enabled
                        ? 'bg-[#FFFDFC] dark:bg-[#0C2430] border-[#38CAD6]/50 shadow-xs'
                        : 'bg-[#FFFDFC]/50 dark:bg-[#061821]/50 border-gray-200/50 dark:border-gray-800/50 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <button
                        onClick={() => handleToggleChannel(ch.id)}
                        className="flex items-center gap-2 group cursor-pointer text-left flex-1 min-w-0"
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform">{ch.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-[#14303A] dark:text-[#E4F7F9] truncate">
                            {ch.name}
                          </div>
                          <div className="text-[10px] text-[#53737C] dark:text-[#88A9B3] truncate font-serif">
                            {ch.hanzi} · {ch.pinyin}
                          </div>
                        </div>
                      </button>

                      {/* On/Off Switch Button */}
                      <button
                        onClick={() => handleToggleChannel(ch.id)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                          ch.enabled ? 'bg-[#38CAD6]' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 left-0.5 shadow-xs ${
                            ch.enabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Channel Volume Slider */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.02"
                        disabled={!ch.enabled}
                        value={ch.volume}
                        onChange={(e) => handleChannelVolumeChange(ch.id, parseFloat(e.target.value))}
                        className="flex-1 h-1.5 bg-[#BFE7E8] dark:bg-[#102B36] rounded-lg appearance-none cursor-pointer accent-[#38CAD6] disabled:opacity-30"
                      />
                      <span className="text-[10px] font-mono text-[#53737C] dark:text-[#88A9B3] w-7 text-right">
                        {ch.enabled ? `${Math.round(ch.volume * 100)}%` : 'Tắt'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pomodoro & Relaxation Timer Section */}
            <div className="p-4 rounded-2xl bg-[#FFFDFC]/80 dark:bg-[#071C25]/80 border border-[#38CAD6]/25 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#14303A] dark:text-[#E4F7F9] font-serif">
                <Clock className="w-4 h-4 text-[#38CAD6]" />
                <span>Hẹn Giờ Thư Giãn / Pomodoro:</span>
              </div>

              <div className="flex items-center gap-1.5">
                {[
                  { label: 'Tắt', mins: 0 },
                  { label: '15p', mins: 15 },
                  { label: '25p', mins: 25 },
                  { label: '45p', mins: 45 },
                  { label: '60p', mins: 60 },
                ].map((item) => (
                  <button
                    key={item.mins}
                    onClick={() => handleSetTimer(item.mins)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      (item.mins === 0 && timerSeconds === 0) ||
                      (item.mins > 0 && Math.ceil(timerSeconds / 60) === item.mins)
                        ? 'bg-[#38CAD6] text-white shadow-xs'
                        : 'bg-[#E8F7F9] dark:bg-[#0E2732] text-[#1B6E7D] dark:text-[#7DD8DE] hover:bg-[#38CAD6]/20'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Play Note */}
            <div className="p-3.5 rounded-2xl bg-[#38CAD6]/10 border border-[#38CAD6]/20 flex items-center gap-2.5 text-xs text-[#1B6E7D] dark:text-[#7DD8DE]">
              <Sparkles className="w-4 h-4 shrink-0 text-[#38CAD6]" />
              <p className="font-serif">
                Âm thanh được phát mượt mà trực tiếp bằng công nghệ Web Audio. Cậu có thể đóng cửa sổ này, nhạc vẫn tiếp tục du dương trong lúc trò chuyện cùng nhân vật!
              </p>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-[#38CAD6]/20 dark:border-[#102B36] bg-[#F6FBFC]/80 dark:bg-[#05131A]/80 flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2 text-xs text-[#53737C] dark:text-[#88A9B3] font-serif">
              <Disc className={`w-4 h-4 ${isPlaying ? 'animate-spin text-[#38CAD6]' : ''}`} />
              <span>{isPlaying ? 'Đang phát âm thanh đại dương' : 'Hộp nhạc đang dừng'}</span>
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-2xl bg-[#38CAD6] hover:bg-[#2EB8C4] text-white text-xs font-bold transition-all shadow-md shadow-[#38CAD6]/20 cursor-pointer active:scale-95 font-serif"
            >
              Tiếp tục khám phá
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OceanMusicBoxModal;

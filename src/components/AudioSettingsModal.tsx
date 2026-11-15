import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Music,
  Upload,
  Check,
  ExternalLink,
  Volume2,
  Play,
  Pause,
  Snowflake,
  Sparkles,
} from 'lucide-react';
import { AudioSettings, DEFAULT_BGM_TRACKS } from '../types';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AudioSettings;
  onUpdateSettings: (newSettings: Partial<AudioSettings>) => void;
  isPlayingBgm?: boolean;
  onTogglePlayBgm?: () => void;
}

/* Custom Illustrated SVG Pastel Winter Porcelain Music Box */
const WinterMusicBoxSVG: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => (
  <svg
    viewBox="0 0 120 120"
    fill="none"
    className="w-24 h-24 sm:w-28 sm:h-28 shrink-0"
    aria-hidden="true"
  >
    <rect
      x="8"
      y="8"
      width="104"
      height="104"
      rx="26"
      className="fill-[#EEF6FD] dark:fill-[#1B2B3F] stroke-[#C7DDF2] dark:stroke-[#3D5775]"
      strokeWidth="1.5"
    />
    <rect
      x="14"
      y="14"
      width="92"
      height="92"
      rx="20"
      className="stroke-[#DCEBFA] dark:stroke-[#2F4661]"
      strokeWidth="1"
      strokeDasharray="3 3"
    />

    <g className="stroke-[#789DC2] dark:stroke-[#89ABD0]" strokeWidth="1.4" strokeLinecap="round">
      <line x1="80" y1="86" x2="96" y2="86" />
      <line x1="82" y1="90" x2="96" y2="90" />
      <line x1="85" y1="94" x2="96" y2="94" />
      <line x1="88" y1="98" x2="96" y2="98" />
    </g>

    <g
      style={{
        transformOrigin: '60px 60px',
        animation: isPlaying ? 'spin 12s linear infinite' : 'none',
      }}
    >
      <circle
        cx="60"
        cy="60"
        r="34"
        className="fill-[#FFFFFF] dark:fill-[#22354D] stroke-[#94B8DC] dark:stroke-[#688EB5]"
        strokeWidth="1.5"
      />
      <circle
        cx="60"
        cy="60"
        r="27"
        className="stroke-[#DCEBFA] dark:stroke-[#3D5878]"
        strokeWidth="1"
        strokeDasharray="2 3"
      />
      <path
        d="M60 35V85M38.3 47.5L81.7 72.5M81.7 47.5L38.3 72.5"
        className="stroke-[#6D96BF] dark:stroke-[#9CC1E6]"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="60" cy="43" r="1.5" className="fill-[#5380AD] dark:fill-[#B8D7F5]" />
      <circle cx="60" cy="77" r="1.5" className="fill-[#5380AD] dark:fill-[#B8D7F5]" />
      <circle cx="45" cy="51.5" r="1.5" className="fill-[#5380AD] dark:fill-[#B8D7F5]" />
      <circle cx="75" cy="68.5" r="1.5" className="fill-[#5380AD] dark:fill-[#B8D7F5]" />
      <circle cx="75" cy="51.5" r="1.5" className="fill-[#5380AD] dark:fill-[#B8D7F5]" />
      <circle cx="45" cy="68.5" r="1.5" className="fill-[#5380AD] dark:fill-[#B8D7F5]" />
      <circle
        cx="60"
        cy="60"
        r="7.5"
        className="fill-[#5380AD] dark:fill-[#8FB8E0] stroke-white dark:stroke-[#162334]"
        strokeWidth="2"
      />
      <circle cx="60" cy="60" r="2.2" className="fill-[#FBE8EF] dark:fill-[#162334]" />
    </g>
  </svg>
);

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onTogglePlayBgm,
}) => {
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  if (!isOpen) return null;

  const currentTrackIndex = settings.currentTrackIndex ?? 0;
  const isDefaultType = settings.customBgmType !== 'file' || !settings.customBgmUrl;
  const activeTrack = isDefaultType
    ? DEFAULT_BGM_TRACKS[currentTrackIndex % DEFAULT_BGM_TRACKS.length]
    : null;
  const activeTitle = isDefaultType
    ? activeTrack?.title || 'Giai điệu mùa đông'
    : settings.customBgmName || 'Bản nhạc cá nhân';
  const activeSubtitle = isDefaultType
    ? activeTrack?.subtitle || 'Hộp Ký Ức Mùa Đông'
    : 'Tệp nhạc từ máy của bạn';

  const handleSelectDefaultTrack = (index: number) => {
    onUpdateSettings({
      customBgmType: 'default',
      currentTrackIndex: index,
      customBgmUrl: undefined,
      customBgmName: undefined,
      isBgmOn: true,
    });
    setUploadSuccessMsg(`Đang phát: ${DEFAULT_BGM_TRACKS[index].title} ♫`);
    setUploadError('');
    setTimeout(() => setUploadSuccessMsg(''), 2500);
  };

  const processAudioFile = (file: File) => {
    if (!file.type.startsWith('audio/') && !/\.(mp3|wav|m4a|ogg|flac|aac)$/i.test(file.name)) {
      setUploadError('Vui lòng chọn tệp âm thanh hợp lệ (MP3, WAV, M4A, OGG, AAC...).');
      return;
    }

    try {
      const objectUrl = URL.createObjectURL(file);
      const safeVolume =
        typeof settings.bgmVolume === 'number' && settings.bgmVolume >= 0.3 ? settings.bgmVolume : 0.7;
      onUpdateSettings({
        customBgmUrl: objectUrl,
        customBgmType: 'file',
        customBgmName: file.name,
        isBgmOn: true,
        bgmVolume: safeVolume,
      });
      setUploadSuccessMsg(`Đã nạp bản nhạc "${file.name}" vào hộp nhạc ♫`);
      setUploadError('');
      setTimeout(() => setUploadSuccessMsg(''), 3500);
    } catch {
      setUploadError('Không thể đọc tệp âm thanh. Vui lòng thử lại.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processAudioFile(file);
    e.target.value = '';
  };

  const handleResetDefaultBgm = () => {
    onUpdateSettings({
      customBgmUrl: undefined,
      customBgmType: 'default',
      customBgmName: undefined,
      currentTrackIndex: 0,
      isBgmOn: true,
    });
    setUploadSuccessMsg('Đã chuyển về 3 đĩa nhạc mùa đông.');
    setUploadError('');
    setTimeout(() => setUploadSuccessMsg(''), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#142336]/65 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.22 }}
          className="relative w-full max-w-xl max-h-[92dvh] flex flex-col bg-[#FAFDFE] dark:bg-[#172334] rounded-2xl sm:rounded-[28px] shadow-2xl border border-[#D4E6F6] dark:border-[#32465E] overflow-hidden text-[#263E57] dark:text-[#E7F0FA]"
        >
          {/* Pastel Porcelain Music Box Masthead */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#E3EFFA] dark:border-[#2C3F56] bg-gradient-to-r from-[#F5FAFF] via-[#EFF6FD] to-[#FDF5F8] dark:from-[#1B293C] dark:to-[#1E2B3E] shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#5380AD] text-white flex items-center justify-center shrink-0">
                <Music className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-lg font-bold font-display text-[#203850] dark:text-white flex items-center gap-1.5 truncate">
                  <span className="truncate">Hộp Nhạc Dây Cót Mùa Đông</span>
                  <Snowflake className="w-3.5 h-3.5 text-[#6D96BF] shrink-0" />
                </h3>
                <p className="text-[11px] sm:text-xs text-[#6484A3] dark:text-[#9CBAD6] font-serif truncate">
                  Đĩa nhạc êm dịu &amp; tiếng chuông tương tác
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center p-2 text-[#6B8BA8] hover:text-[#203850] dark:text-[#A4C0DA] dark:hover:text-white rounded-full hover:bg-white/80 dark:hover:bg-[#283B52] transition-colors cursor-pointer shrink-0"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
            {/* Tactile Music Box Cylinder Stage */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1D2B3D] border border-[#DCEBFA] dark:border-[#32465E] space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
                <WinterMusicBoxSVG isPlaying={settings.isBgmOn} />

                <div className="flex-1 min-w-0 text-center sm:text-left space-y-2 w-full">
                  <p className="text-[11px] font-serif font-semibold text-[#5380AD] dark:text-[#9AC0E3]">
                    {settings.isBgmOn ? '♫ Hộp nhạc đang xoay...' : 'Hộp nhạc đang nghỉ'}
                  </p>
                  <h4 className="text-base sm:text-lg font-bold font-display text-[#203850] dark:text-white truncate">
                    {activeTitle}
                  </h4>
                  <p className="text-xs font-serif text-[#6484A3] dark:text-[#98B4D0] truncate">
                    {activeSubtitle}
                  </p>

                  <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateSettings({ isBgmOn: !settings.isBgmOn });
                        if (onTogglePlayBgm) onTogglePlayBgm();
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-serif font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                        settings.isBgmOn
                          ? 'bg-[#5380AD] hover:bg-[#44709D] text-white'
                          : 'bg-[#EEF6FD] dark:bg-[#263950] text-[#355A7E] dark:text-[#E5EFF9] hover:bg-[#E0EEFA]'
                      }`}
                    >
                      {settings.isBgmOn ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{settings.isBgmOn ? 'Tạm dừng dây cót' : 'Lên dây cót phát nhạc'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EDF4FC] dark:border-[#2B3E54] space-y-1.5">
                <div className="flex justify-between text-xs text-[#6484A3] dark:text-[#A4C0DA] font-serif">
                  <span className="inline-flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-[#5380AD] dark:text-[#9AC0E3]" />
                    <span>Âm lượng hộp nhạc</span>
                  </span>
                  <span className="font-mono tabular-nums font-semibold text-[#203850] dark:text-white">
                    {Math.round((settings.bgmVolume ?? 0.6) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={settings.bgmVolume ?? 0.6}
                  onChange={(e) => onUpdateSettings({ bgmVolume: parseFloat(e.target.value) })}
                  className="w-full accent-[#5380AD] dark:accent-[#8FB8E0] cursor-pointer h-1.5 bg-[#DCE9F6] dark:bg-[#2F4157] rounded-lg"
                />
              </div>

              {uploadSuccessMsg && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>{uploadSuccessMsg}</span>
                </div>
              )}
            </div>

            {/* Engraved Melody Plates */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-serif font-semibold text-[#42668A] dark:text-[#C7DCEF] px-0.5">
                <span>Đĩa nhạc cài sẵn</span>
                {isDefaultType && (
                  <span className="text-[11px] font-mono tabular-nums text-[#6484A3]">
                    0{(currentTrackIndex % 3) + 1} / 03
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {DEFAULT_BGM_TRACKS.map((track, idx) => {
                  const isThisSelected = isDefaultType && currentTrackIndex === idx;
                  const isThisPlaying = isThisSelected && settings.isBgmOn;

                  return (
                    <div
                      key={track.id}
                      onClick={() => handleSelectDefaultTrack(idx)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-colors cursor-pointer ${
                        isThisSelected
                          ? 'bg-[#EEF6FD] dark:bg-[#23354C] border-[#9AC0E4] dark:border-[#51749A]'
                          : 'bg-white dark:bg-[#1D2B3D] hover:bg-[#F5FAFF] dark:hover:bg-[#233348] border-[#DCEBFA] dark:border-[#32465E]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-serif font-bold tabular-nums ${
                            isThisPlaying
                              ? 'bg-[#5380AD] text-white'
                              : isThisSelected
                              ? 'bg-[#D7E8F9] dark:bg-[#354E6B] text-[#32587D] dark:text-white'
                              : 'bg-[#F2F7FD] dark:bg-[#172230] text-[#7292B0]'
                          }`}
                        >
                          {isThisPlaying ? '♫' : `0${idx + 1}`}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-bold font-serif text-[#203850] dark:text-white truncate">
                            {track.title}
                          </p>
                          <p className="text-[11px] font-serif text-[#6484A3] dark:text-[#98B4D0] truncate">
                            {track.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleSelectDefaultTrack(idx)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-serif font-semibold cursor-pointer transition-colors ${
                            isThisPlaying
                              ? 'bg-[#5380AD] text-white'
                              : 'bg-[#EEF6FD] dark:bg-[#293E58] text-[#355A7E] dark:text-[#E5EFF9] hover:bg-[#E0EEFA]'
                          }`}
                        >
                          {isThisPlaying ? 'Đang xoay' : 'Chọn đĩa'}
                        </button>
                        <a
                          href={track.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-[#7A96B2] hover:text-[#203850] dark:text-[#98B4D0] dark:hover:text-white rounded-lg transition-colors"
                          title="Mở liên kết gốc"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Personal Melody Upload */}
              <div className="pt-1 space-y-2">
                <label className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-serif font-semibold bg-white dark:bg-[#1D2B3D] hover:bg-[#F3F8FE] dark:hover:bg-[#24354B] text-[#355A7E] dark:text-[#E5EFF9] border border-dashed border-[#BBD4EC] dark:border-[#3F5978] cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-[#5380AD] dark:text-[#9AC0E3]" />
                  <span>Nạp bản nhạc riêng từ máy (.mp3, .wav, .m4a...)</span>
                  <input
                    type="file"
                    accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac,.aac"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {settings.customBgmType === 'file' && settings.customBgmUrl && (
                  <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#EEF6FD] dark:bg-[#24374E] border border-[#CFE1F2] dark:border-[#3E5875] text-xs">
                    <span className="truncate font-serif font-medium text-[#203850] dark:text-white">
                      ♫ {settings.customBgmName || 'Nhạc tải lên'}
                    </span>
                    <button
                      type="button"
                      onClick={handleResetDefaultBgm}
                      className="text-xs font-serif font-semibold text-[#5380AD] dark:text-[#9AC0E3] hover:underline ml-2 shrink-0 cursor-pointer"
                    >
                      Dùng lại mặc định
                    </button>
                  </div>
                )}

                {uploadError && <p className="text-[11px] text-rose-500">{uploadError}</p>}
              </div>
            </div>

            {/* Sound Effects (SFX) Card */}
            <div className="p-4 rounded-2xl bg-[#F2F8FE] dark:bg-[#1D2B3D] border border-[#DCEBFA] dark:border-[#32465E] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#5380AD] dark:text-[#A8CDF0]" />
                  <span className="text-sm font-bold font-serif text-[#203850] dark:text-white">
                    Chuông &amp; Âm thanh tương tác
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onUpdateSettings({ isSfxOn: !settings.isSfxOn })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-serif font-semibold transition-colors cursor-pointer ${
                    settings.isSfxOn
                      ? 'bg-[#5380AD] text-white'
                      : 'bg-white dark:bg-[#283B52] text-[#6484A3] dark:text-[#98B4D0] border border-[#DCEBFA] dark:border-[#3A506B]'
                  }`}
                >
                  {settings.isSfxOn ? 'Đang bật' : 'Đã tắt'}
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-[#6484A3] dark:text-[#A4C0DA] font-serif">
                  <span>Tiếng chuông tuyết, thả tim, lật trang...</span>
                  <span className="font-mono tabular-nums font-semibold text-[#203850] dark:text-white">
                    {Math.round((settings.sfxVolume ?? 0.5) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={settings.sfxVolume ?? 0.5}
                  onChange={(e) => onUpdateSettings({ sfxVolume: parseFloat(e.target.value) })}
                  className="w-full accent-[#5380AD] dark:accent-[#8FB8E0] cursor-pointer h-1.5 bg-[#DCE9F6] dark:bg-[#2F4157] rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 border-t border-[#E3EFFA] dark:border-[#2C3F56] bg-white dark:bg-[#192536] flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#5380AD] hover:bg-[#44709D] text-white text-xs font-serif font-semibold transition-colors cursor-pointer"
            >
              Đóng hộp nhạc ❄
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

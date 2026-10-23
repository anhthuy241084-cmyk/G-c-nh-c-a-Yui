import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, VolumeX, Music, Sparkles, Upload, Check, Play, Pause, ExternalLink, Radio, Waves, Droplets } from 'lucide-react';
import { AudioSettings, DEFAULT_BGM_TRACKS } from '../types';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AudioSettings;
  onUpdateSettings: (newSettings: Partial<AudioSettings>) => void;
  isPlayingBgm?: boolean;
  onTogglePlayBgm?: () => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  isPlayingBgm = true,
  onTogglePlayBgm,
}) => {
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  if (!isOpen) return null;

  const currentTrackIndex = settings.currentTrackIndex ?? 0;
  const isDefaultType = settings.customBgmType !== 'file' || !settings.customBgmUrl;

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
    setTimeout(() => setUploadSuccessMsg(''), 3000);
  };

  const processAudioFile = (file: File) => {
    if (!file.type.startsWith('audio/') && !/\.(mp3|wav|m4a|ogg|flac|aac)$/i.test(file.name)) {
      setUploadError('Vui lòng chọn tệp âm thanh hợp lệ (MP3, WAV, M4A, OGG, AAC...).');
      return;
    }

    try {
      const objectUrl = URL.createObjectURL(file);
      const safeVolume = typeof settings.bgmVolume === 'number' && settings.bgmVolume >= 0.3 ? settings.bgmVolume : 0.7;
      onUpdateSettings({
        customBgmUrl: objectUrl,
        customBgmType: 'file',
        customBgmName: file.name,
        isBgmOn: true,
        bgmVolume: safeVolume,
      });
      setUploadSuccessMsg(`Đã tải lên và phát bài "${file.name}" ♫`);
      setUploadError('');
      setTimeout(() => setUploadSuccessMsg(''), 4000);
    } catch (err) {
      setUploadError('Không thể đọc tệp âm thanh. Vui lòng thử lại.');
    }
  };

  // Handle local audio file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processAudioFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAudioFile(file);
    }
  };

  const handleResetDefaultBgm = () => {
    onUpdateSettings({
      customBgmUrl: undefined,
      customBgmType: 'default',
      customBgmName: undefined,
      currentTrackIndex: 0,
      isBgmOn: true,
    });
    setUploadSuccessMsg('Đã khôi phục danh sách nhạc đại dương trực tiếp.');
    setUploadError('');
    setTimeout(() => setUploadSuccessMsg(''), 3000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081B22]/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white/95 dark:bg-[#102F38]/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#65C5CE]/30 dark:border-[#78DCE0]/20 overflow-hidden text-[#29464C] dark:text-[#DDF5F6]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4 border-b border-[#65C5CE]/20 dark:border-[#143943] bg-gradient-to-r from-[#F2FBFC] via-[#E5F5F7] to-[#DDF1F3] dark:from-[#0D2730] dark:via-[#102F38] dark:to-[#143943] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3FAAB7] to-[#247C8C] dark:from-[#57C8D1] dark:to-[#3FAAB7] text-white flex items-center justify-center shadow-md shadow-[#247C8C]/20">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif text-[#29464C] dark:text-[#DDF5F6] flex items-center gap-2">
                  <span>Không Gian Âm Thanh Biển Khơi</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#65C5CE]/20 dark:bg-[#78DCE0]/20 text-[#247C8C] dark:text-[#78DCE0] font-medium font-sans">
                    Nhạc trực tiếp
                  </span>
                </h3>
                <p className="text-xs text-[#6B858A] dark:text-[#8FB6BC] font-serif">
                  Nhạc nền êm dịu & tùy chỉnh âm thanh thư giãn đại dương
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-[#6B858A] hover:text-[#29464C] dark:text-[#8FB6BC] dark:hover:text-white rounded-full hover:bg-[#65C5CE]/10 dark:hover:bg-[#143943] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
            {/* System 1: Background Music (BGM) & Volume */}
            <div className="space-y-4 bg-[#E5F5F7]/50 dark:bg-[#0D2730]/60 p-4 rounded-2xl border border-[#65C5CE]/25 dark:border-[#143943]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Waves className="w-4 h-4 text-[#3FAAB7] dark:text-[#78DCE0]" />
                  <span className="text-sm font-bold font-serif text-[#29464C] dark:text-[#DDF5F6]">
                    ♫ Nhạc nền không gian
                  </span>
                </div>

                <button
                  onClick={() => {
                    onUpdateSettings({ isBgmOn: !settings.isBgmOn });
                    if (onTogglePlayBgm) onTogglePlayBgm();
                  }}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    settings.isBgmOn
                      ? 'bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] text-white shadow-sm shadow-[#247C8C]/25'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {settings.isBgmOn ? 'ĐANG BẬT' : 'ĐÃ TẮT'}
                </button>
              </div>

              {/* Volume Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-[#6B858A] dark:text-[#8FB6BC]">
                  <span>Âm lượng nhạc nền</span>
                  <span className="font-mono text-[#247C8C] dark:text-[#78DCE0]">{Math.round((settings.bgmVolume ?? 0.6) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={settings.bgmVolume ?? 0.6}
                  onChange={(e) =>
                    onUpdateSettings({ bgmVolume: parseFloat(e.target.value) })
                  }
                  className="w-full accent-[#3FAAB7] cursor-pointer h-1.5 bg-[#65C5CE]/30 dark:bg-[#143943] rounded-lg"
                />
              </div>

              {uploadSuccessMsg && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 font-medium bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{uploadSuccessMsg}</span>
                </div>
              )}
            </div>

            {/* System 2: 3 Nhạc Mặc Định Trực Tiếp */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#3FAAB7] dark:text-[#78DCE0]" />
                  <span className="text-xs font-bold font-serif text-[#29464C] dark:text-[#DDF5F6] uppercase tracking-wider">
                    Danh sách giai điệu trực tiếp (3 bản nhạc)
                  </span>
                </div>
                {isDefaultType && (
                  <span className="text-[11px] text-[#247C8C] dark:text-[#78DCE0] font-semibold">
                    Bản {(currentTrackIndex % 3) + 1}/3
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {DEFAULT_BGM_TRACKS.map((track, idx) => {
                  const isThisActive = isDefaultType && currentTrackIndex === idx && settings.isBgmOn;
                  const isThisSelected = isDefaultType && currentTrackIndex === idx;

                  return (
                    <div
                      key={track.id}
                      onClick={() => handleSelectDefaultTrack(idx)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                        isThisSelected
                          ? 'bg-[#E5F5F7] dark:bg-[#143943]/80 border-[#65C5CE] dark:border-[#78DCE0]/60 shadow-sm'
                          : 'bg-white dark:bg-[#0D2730]/60 hover:bg-[#F2FBFC] dark:hover:bg-[#143943]/40 border-[#65C5CE]/20 dark:border-[#143943]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold transition-transform ${
                            isThisActive
                              ? 'bg-gradient-to-tr from-[#3FAAB7] to-[#247C8C] text-white shadow-md shadow-[#247C8C]/25 scale-105'
                              : isThisSelected
                              ? 'bg-[#65C5CE]/20 dark:bg-[#78DCE0]/20 text-[#247C8C] dark:text-[#78DCE0]'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {isThisActive ? '♫' : idx + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold font-serif text-[#29464C] dark:text-[#DDF5F6] truncate">
                              {track.title}
                            </h4>
                            {isThisSelected && (
                              <span className="px-1.5 py-0.2 rounded-md bg-[#3FAAB7] text-white text-[9px] font-semibold">
                                {settings.isBgmOn ? 'Đang phát' : 'Đã chọn'}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#6B858A] dark:text-[#8FB6BC] truncate font-serif">
                            {track.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleSelectDefaultTrack(idx)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isThisSelected && settings.isBgmOn
                              ? 'bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] text-white shadow-xs'
                              : 'bg-[#65C5CE]/15 dark:bg-[#78DCE0]/15 text-[#247C8C] dark:text-[#78DCE0] hover:bg-[#65C5CE]/25'
                          }`}
                        >
                          {isThisSelected && settings.isBgmOn ? 'Phát lại' : 'Chọn phát'}
                        </button>

                        <a
                          href={track.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-[#6B858A] hover:text-[#3FAAB7] dark:text-[#8FB6BC] dark:hover:text-[#78DCE0] rounded-lg hover:bg-[#65C5CE]/10 dark:hover:bg-[#143943] transition-colors"
                          title="Mở liên kết YouTube"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Music Upload Section */}
            <div className="space-y-3 bg-white dark:bg-[#0D2730]/40 p-4 rounded-2xl border border-dashed border-[#65C5CE]/40 dark:border-[#78DCE0]/30">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold font-serif text-[#247C8C] dark:text-[#78DCE0] flex items-center gap-1.5">
                  <Upload className="w-4 h-4" />
                  <span>Hoặc tải nhạc từ máy của bạn</span>
                </div>
                {settings.customBgmType === 'file' && settings.customBgmUrl && (
                  <button
                    onClick={handleResetDefaultBgm}
                    className="text-[10px] text-[#3FAAB7] dark:text-[#78DCE0] hover:underline cursor-pointer"
                  >
                    Dùng lại 3 bài mặc định
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#6B858A] dark:text-[#8FB6BC] leading-relaxed font-serif">
                Tùy chọn tải lên tệp âm thanh (MP3, WAV, M4A, OGG...) từ máy để phát bài riêng khi cần.
              </p>

              {/* Upload Dropzone */}
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="flex flex-col items-center justify-center gap-2 p-3.5 bg-[#E5F5F7]/40 dark:bg-[#102F38] border-2 border-dashed border-[#65C5CE]/50 dark:border-[#78DCE0]/40 rounded-2xl text-xs font-semibold text-[#247C8C] dark:text-[#78DCE0] hover:bg-[#E5F5F7] dark:hover:bg-[#143943] cursor-pointer transition-colors shadow-xs text-center group"
              >
                <div className="w-8 h-8 rounded-full bg-[#65C5CE]/20 dark:bg-[#78DCE0]/20 text-[#247C8C] dark:text-[#78DCE0] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[#247C8C] dark:text-[#78DCE0] font-bold block text-xs font-serif">
                    Bấm chọn tệp hoặc kéo thả vào đây
                  </span>
                  <span className="text-[10px] text-[#6B858A] dark:text-[#8FB6BC] font-normal mt-0.5 block">
                    MP3, WAV, M4A, OGG, AAC, FLAC
                  </span>
                </div>
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac,.aac"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Current Active File Banner */}
              {settings.customBgmType === 'file' && settings.customBgmUrl && (
                <div className="flex items-center justify-between p-2.5 bg-[#E5F5F7] dark:bg-[#102F38] rounded-xl border border-[#65C5CE]/40 dark:border-[#78DCE0]/30 text-xs">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-[#65C5CE]/20 dark:bg-[#78DCE0]/20 text-[#247C8C] dark:text-[#78DCE0] flex items-center justify-center shrink-0 font-bold">
                      ♫
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-[#247C8C] dark:text-[#78DCE0] truncate font-serif">
                        {settings.customBgmName || 'Tệp nhạc đã tải lên'}
                      </p>
                      <p className="text-[10px] text-[#6B858A] dark:text-[#8FB6BC]">
                        {settings.isBgmOn ? '♫ Đang phát bài riêng' : '🔇 Đang tắt'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ isBgmOn: !settings.isBgmOn })}
                      className="px-2.5 py-1 bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
                    >
                      {settings.isBgmOn ? 'Tắt' : 'Bật ngay'}
                    </button>
                    <button
                      type="button"
                      onClick={handleResetDefaultBgm}
                      className="p-1 text-[#6B858A] hover:text-[#247C8C] dark:text-[#8FB6BC] dark:hover:text-[#78DCE0] rounded-lg hover:bg-[#65C5CE]/15 transition-colors cursor-pointer"
                      title="Bỏ bài hát này và dùng 3 bài mặc định"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {uploadError && (
                <p className="text-[11px] text-red-500 font-medium">{uploadError}</p>
              )}
            </div>

            {/* System 3: Sound Effects (SFX) */}
            <div className="space-y-3 bg-[#E5F5F7]/40 dark:bg-[#0D2730]/60 p-4 rounded-2xl border border-[#65C5CE]/20 dark:border-[#143943]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#3FAAB7] dark:text-[#78DCE0]" />
                  <span className="text-sm font-bold font-serif text-[#29464C] dark:text-[#DDF5F6]">
                    ✦ Hiệu ứng âm thanh (SFX)
                  </span>
                </div>

                <button
                  onClick={() =>
                    onUpdateSettings({ isSfxOn: !settings.isSfxOn })
                  }
                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    settings.isSfxOn
                      ? 'bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] text-white shadow-sm shadow-[#247C8C]/25'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {settings.isSfxOn ? 'BẬT' : 'TẮT'}
                </button>
              </div>

              {/* Volume Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-[#6B858A] dark:text-[#8FB6BC]">
                  <span>Âm lượng hiệu ứng (Chuông gió biển, tiếng lặn nước, nút bấm...)</span>
                  <span className="font-mono text-[#247C8C] dark:text-[#78DCE0]">{Math.round((settings.sfxVolume ?? 0.5) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={settings.sfxVolume ?? 0.5}
                  onChange={(e) =>
                    onUpdateSettings({ sfxVolume: parseFloat(e.target.value) })
                  }
                  className="w-full accent-[#3FAAB7] cursor-pointer h-1.5 bg-[#65C5CE]/30 dark:bg-[#143943] rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#65C5CE]/20 dark:border-[#143943] bg-[#F2FBFC]/60 dark:bg-[#081B22]/60 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-2xl bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] text-white text-xs font-bold shadow-md shadow-[#247C8C]/20 active:scale-95 transition-all cursor-pointer font-serif"
            >
              Đóng & Thưởng thức
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

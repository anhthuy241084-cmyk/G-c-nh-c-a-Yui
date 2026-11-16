import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Feather,
  Lock,
  Send,
  Snowflake,
  Sparkles,
  Check,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Eraser,
} from 'lucide-react';
import { SecretLetterMood } from '../types';
import {
  submitSecretLetter,
  getSecretLetterCooldownRemainingMs,
} from '../services/secretLetterService';
import { SnowfallBackground } from './SnowfallBackground';
import { triggerSfx } from '../utils/sfx';

interface SecretLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminInbox?: () => void;
  isSfxOn?: boolean;
  sfxVolume?: number;
  onToast?: (msg: string) => void;
}

const DRAFT_STORAGE_KEY = 'yui_secret_letter_draft_v1';

const MOOD_OPTIONS: {
  id: SecretLetterMood;
  label: string;
}[] = [
  { id: 'confession', label: 'Tâm sự' },
  { id: 'wish', label: 'Lời chúc' },
  { id: 'feedback', label: 'Góp ý' },
  { id: 'memory', label: 'Kỷ niệm' },
  { id: 'secret', label: 'Bí mật' },
];

export const SecretLetterModal: React.FC<SecretLetterModalProps> = ({
  isOpen,
  onClose,
  onOpenAdminInbox,
  isSfxOn = true,
  sfxVolume = 0.5,
  onToast,
}) => {
  const [title, setTitle] = useState('');
  const [penName, setPenName] = useState('');
  const [mood, setMood] = useState<SecretLetterMood>('confession');
  const [content, setContent] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSentSuccess, setIsSentSuccess] = useState(false);
  const [sentLength, setSentLength] = useState(0);

  // Restore saved draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.title === 'string') setTitle(parsed.title);
        if (typeof parsed.penName === 'string') setPenName(parsed.penName);
        if (typeof parsed.content === 'string') setContent(parsed.content);
        if (parsed.mood) setMood(parsed.mood);
      }
    } catch {
      // ignore invalid draft
    }
  }, []);

  // Persist draft gently while typing
  useEffect(() => {
    if (isSentSuccess) return;
    const timer = setTimeout(() => {
      try {
        if (title || penName || content) {
          localStorage.setItem(
            DRAFT_STORAGE_KEY,
            JSON.stringify({ title, penName, mood, content })
          );
        } else {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
      } catch {
        // ignore quota limits for huge drafts
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [title, penName, mood, content, isSentSuccess]);

  useEffect(() => {
    if (!isOpen) {
      setErrorMsg(null);
    }
  }, [isOpen]);

  const stats = useMemo(() => {
    const chars = content.length;
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    return { chars, words };
  }, [content]);

  const clearDraft = () => {
    setTitle('');
    setPenName('');
    setMood('confession');
    setContent('');
    setErrorMsg(null);
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (honeypot.trim().length > 0) {
      setIsSentSuccess(true);
      return;
    }

    if (!content.trim()) {
      setErrorMsg('Hãy viết đôi dòng trước khi niêm phong lá thư nhé.');
      return;
    }

    const remainingMs = getSecretLetterCooldownRemainingMs();
    if (remainingMs > 0) {
      setErrorMsg(`Bạn vừa gửi một lá thư rồi, vui lòng đợi ${Math.ceil(remainingMs / 1000)} giây rồi gửi tiếp nhé.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const lengthSnapshot = content.length;
      await submitSecretLetter({
        title,
        penName,
        mood,
        content,
      });

      if (isSfxOn) triggerSfx('chime', sfxVolume);
      setSentLength(lengthSnapshot);
      setIsSentSuccess(true);
      clearDraft();
      onToast?.('Lá thư ẩn danh đã được niêm phong gửi riêng tới Yui');
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.startsWith('COOLDOWN:')) {
        const secs = msg.split(':')[1] || '5';
        setErrorMsg(`Vui lòng đợi ${secs} giây trước khi gửi lá thư tiếp theo nhé.`);
      } else if (msg === 'EMPTY_CONTENT') {
        setErrorMsg('Nội dung lá thư không thể để trống.');
      } else {
        setErrorMsg('Chưa thể gửi lá thư ngay lúc này. Bạn thử lại sau ít phút nhé.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-[#111C2B]/80 backdrop-blur-md">
        <SnowfallBackground
          settings={{ isEnabled: true, density: 'low', speed: 'slow', opacity: 'medium' }}
          themeMode="dark"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-3xl max-h-[92dvh] flex flex-col bg-[#F7FAFD] dark:bg-[#172536] text-[#2B4055] dark:text-[#E5EDF5] rounded-2xl sm:rounded-[28px] shadow-2xl border border-[#DCE7EF] dark:border-[#354A60] overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 sm:px-7 py-3.5 sm:py-4 border-b border-[#DCE7EF] dark:border-[#354A60] bg-white/90 dark:bg-[#202F42]/95 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#EAF3FC] dark:bg-[#172536] border border-[#CFE1F2] dark:border-[#43576B] flex items-center justify-center text-[#4E7AA5] dark:text-[#A8CDF0] shrink-0">
                <Feather className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold font-serif text-[#172536] dark:text-[#F7FAFD] truncate">
                  Tâm Thư Đêm Tuyết
                </h2>
                <p className="text-[11px] text-[#5E7C99] dark:text-[#A4C0DA] font-serif truncate">
                  Thư ẩn danh không giới hạn chữ · Chỉ riêng Yui đọc được
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onOpenAdminInbox && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAdminInbox();
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-serif font-semibold bg-[#EAF3FC] dark:bg-[#172536] text-[#4E7AA5] dark:text-[#A8CDF0] border border-[#CFE1F2] dark:border-[#3C5573] hover:bg-[#DCEBFA] dark:hover:bg-[#2A3F59] transition-colors cursor-pointer whitespace-nowrap"
                  title="Dành cho Quản trị viên mở đọc thư"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Yui đọc thư</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-[#E8F1F8] dark:hover:bg-[#354A60] text-[#7A96B0] hover:text-[#172536] dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-8 py-6 sm:py-7">
            <AnimatePresence mode="wait">
              {!isSentSuccess ? (
                <motion.form
                  key="secret-letter-form"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-6"
                >
                  {/* Quiet Privacy Notice (Unboxed Editorial Strip) */}
                  <div className="flex items-start gap-3 pb-5 border-b border-dashed border-[#DCE7EF] dark:border-[#354A60]">
                    <Lock className="w-4 h-4 text-[#4E7AA5] dark:text-[#A8CDF0] shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs leading-relaxed text-[#43576B] dark:text-[#C5D8EB]">
                      <p className="font-serif text-[#172536] dark:text-[#F7FAFD] font-semibold">
                        Niêm phong hoàn toàn riêng tư &amp; ẩn danh
                      </p>
                      <p>
                        Bạn có thể viết bao nhiêu tùy thích — không giới hạn ký tự. Không cần đăng nhập, không công khai trên bảng tin, và hệ thống khóa quyền đọc để chỉ duy nhất tài khoản Quản trị viên của Yui mới mở xem được.
                      </p>
                    </div>
                  </div>

                  {/* Honeypot field */}
                  <div className="hidden" aria-hidden="true">
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  {/* Mood Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold font-serif text-[#36597A] dark:text-[#D5E4EF]">
                      Sắc thái lá thư
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {MOOD_OPTIONS.map((opt) => {
                        const active = mood === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setMood(opt.id)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-serif font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                              active
                                ? 'bg-[#5380AD] text-white border-[#5380AD] shadow-xs'
                                : 'bg-white dark:bg-[#202F42] text-[#4E6982] dark:text-[#C5D8EB] border-[#DCE7EF] dark:border-[#3C5573] hover:border-[#8EB3D6]'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Optional Title & Pen Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold font-serif text-[#36597A] dark:text-[#D5E4EF]">
                        Tiêu đề lá thư <span className="font-normal text-[#7A96B0]">(không bắt buộc)</span>
                      </label>
                      <input
                        type="text"
                        maxLength={300}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ví dụ: Gửi Yui một đêm tuyết rơi..."
                        className="w-full px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm bg-white dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#3C5573] text-[#172536] dark:text-[#F7FAFD] placeholder:text-[#8FA8BF] focus:outline-none focus:border-[#5380AD]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold font-serif text-[#36597A] dark:text-[#D5E4EF]">
                        Bút danh <span className="font-normal text-[#7A96B0]">(để trống là Ẩn danh)</span>
                      </label>
                      <input
                        type="text"
                        maxLength={120}
                        value={penName}
                        onChange={(e) => setPenName(e.target.value)}
                        placeholder="Ẩn danh"
                        className="w-full px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm bg-white dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#3C5573] text-[#172536] dark:text-[#F7FAFD] placeholder:text-[#8FA8BF] focus:outline-none focus:border-[#5380AD]"
                      />
                    </div>
                  </div>

                  {/* Unlimited-Length Paper Textarea */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="block text-xs font-semibold font-serif text-[#36597A] dark:text-[#D5E4EF]">
                        Nội dung tâm thư <span className="text-rose-500">*</span>
                      </label>
                      {(title || penName || content) && (
                        <button
                          type="button"
                          onClick={clearDraft}
                          className="inline-flex items-center gap-1 text-[11px] font-serif text-[#7A96B0] hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          <Eraser className="w-3 h-3" />
                          <span>Xóa nháp</span>
                        </button>
                      )}
                    </div>

                    <textarea
                      rows={11}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Hãy viết tất cả những điều bạn muốn gửi gắm — một đoạn ngắn hay một trang thư thật dài đều được nâng niu trọn vẹn, không giới hạn số chữ..."
                      className="w-full min-h-[240px] px-4 sm:px-5 py-4 rounded-2xl text-sm leading-relaxed bg-white dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#3C5573] text-[#172536] dark:text-[#F7FAFD] placeholder:text-[#8FA8BF] focus:outline-none focus:border-[#5380AD] focus:ring-2 focus:ring-[#5380AD]/20 transition-all resize-y font-serif"
                    />

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6E899E] dark:text-[#A4C0DA] px-1">
                      <span className="tabular-nums">
                        {stats.chars.toLocaleString('vi-VN')} ký tự · {stats.words.toLocaleString('vi-VN')} từ
                      </span>
                      <span>Không giới hạn ký tự · Tự động lưu nháp trên máy bạn</span>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-200 text-xs flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Footer CTA */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    {onOpenAdminInbox ? (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenAdminInbox();
                        }}
                        className="sm:hidden text-xs font-serif text-[#4E7AA5] dark:text-[#A8CDF0] underline underline-offset-4 cursor-pointer"
                      >
                        Quản trị viên mở đọc tâm thư
                      </button>
                    ) : <span />}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-7 py-3 rounded-2xl btn-winter-primary text-xs sm:text-sm font-serif font-semibold inline-flex items-center justify-center gap-2.5 shadow-lg disabled:opacity-60 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang niêm phong lá thư...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Gửi thư ẩn danh đến Yui</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              ) : (
                /* Sealed Success State */
                <motion.div
                  key="secret-letter-success"
                  initial={{ opacity: 0, scale: 0.96, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="py-10 px-4 max-w-md mx-auto text-center space-y-5"
                >
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-[#EAF3FC] dark:bg-[#202F42] border border-[#CFE1F2] dark:border-[#43576B] flex items-center justify-center text-[#4E7AA5] dark:text-[#A8CDF0]">
                    <Sparkles className="w-7 h-7" />
                  </div>

                  <div className="space-y-2.5 font-serif">
                    <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      <Check className="w-4 h-4" />
                      <span>Đã niêm phong an toàn</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#172536] dark:text-[#F7FAFD]">
                      Tâm thư đã gửi đến Yui rồi!
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-[#4E6982] dark:text-[#C5D8EB]">
                      Toàn bộ{' '}
                      <span className="font-semibold tabular-nums">
                        {sentLength.toLocaleString('vi-VN')}
                      </span>{' '}
                      ký tự của bạn đã được cất giữ riêng tư tuyệt đối. Chỉ quản trị viên của Yui mới có thể mở đọc lá thư này.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSentSuccess(false);
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-2xl btn-winter-primary text-xs font-serif font-semibold cursor-pointer inline-flex items-center justify-center gap-1.5"
                    >
                      <Snowflake className="w-3.5 h-3.5" />
                      <span>Viết thêm tâm thư khác</span>
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-white dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] text-xs font-serif font-semibold text-[#526B80] dark:text-[#E5EDF5] cursor-pointer"
                    >
                      Đóng lại
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

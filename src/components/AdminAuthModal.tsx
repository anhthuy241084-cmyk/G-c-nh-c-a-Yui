import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Unlock, KeyRound, Sparkles, Eye, EyeOff } from 'lucide-react';
import { playSparkleSfx } from '../utils/sfx';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<{ title: string; subtitle: string } | null>(null);
  const [isSuccessState, setIsSuccessState] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setErrorMessage(null);
      setIsSuccessState(false);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const validatePassword = (input: string): boolean => {
    const trimmed = input.trim();
    if (!trimmed) return false;

    // The required correct password for Admin is Yuicreator
    const customPass = localStorage.getItem('yui_admin_password');
    const validPasswords = customPass
      ? [customPass, 'Yuicreator', 'yuicreator']
      : ['Yuicreator', 'yuicreator'];

    return validPasswords.includes(trimmed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage({
        title: 'Mật khẩu không chính xác.',
        subtitle: 'Vui lòng thử lại.',
      });
      setShakeKey((prev) => prev + 1);
      return;
    }

    if (validatePassword(password)) {
      setErrorMessage(null);
      setIsSuccessState(true);
      playSparkleSfx(0.4);

      // Fade Out -> unlock -> Fade In: Chào mừng trở lại ✦ -> Đang mở khu vực quản trị... -> Open Admin
      setTimeout(() => {
        onSuccess();
        onClose();
        setIsSuccessState(false);
        setPassword('');
      }, 1100);
    } else {
      setErrorMessage({
        title: 'Mật khẩu không chính xác.',
        subtitle: 'Vui lòng thử lại.',
      });
      setShakeKey((prev) => prev + 1);
      setPassword('');
      inputRef.current?.focus();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="admin-auth-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081B22]/70 backdrop-blur-md"
        >
          {/* Backdrop click to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          {/* Minimalist Admin Auth Card */}
          <motion.div
            id="admin-auth-card"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="relative z-10 w-full max-w-sm bg-white/95 dark:bg-[#102F38]/95 backdrop-blur-xl rounded-3xl p-7 border border-[#65C5CE]/40 dark:border-[#78DCE0]/30 shadow-2xl text-[#29464C] dark:text-[#DDF5F6] overflow-hidden"
          >
            {/* Close Button */}
            {!isSuccessState && (
              <button
                id="admin-auth-close-btn"
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-[#6B858A] hover:text-[#247C8C] dark:text-[#8FB6BC] dark:hover:text-[#78DCE0] hover:bg-[#65C5CE]/10 dark:hover:bg-[#143943] rounded-full transition-colors cursor-pointer"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <AnimatePresence mode="wait">
              {!isSuccessState ? (
                /* Stage 1: Minimalist Password Entry Form */
                <motion.div
                  key="auth-form"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 text-center"
                >
                  {/* Subtle Lock Icon */}
                  <div className="flex flex-col items-center justify-center pt-2">
                    <div className="w-12 h-12 rounded-2xl bg-[#E5F5F7] dark:bg-[#0D2730] text-[#3FAAB7] dark:text-[#78DCE0] border border-[#65C5CE]/40 dark:border-[#143943] flex items-center justify-center shadow-xs">
                      <Lock className="w-5 h-5 stroke-[2.2]" />
                    </div>
                  </div>

                  {/* Header Titles */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold font-serif text-[#29464C] dark:text-[#DDF5F6] tracking-tight flex items-center justify-center gap-1.5">
                      <span className="text-[#3FAAB7] dark:text-[#78DCE0] text-sm">✧</span>
                      <span>Khu vực quản trị</span>
                      <span className="text-[#3FAAB7] dark:text-[#78DCE0] text-sm">✧</span>
                    </h3>
                    <p className="text-xs text-[#6B858A] dark:text-[#8FB6BC] italic font-serif">
                      Chỉ dành cho Admin
                    </p>
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#29464C] dark:text-[#DDF5F6] font-serif">
                        Mật khẩu quản trị
                      </label>
                      
                      {/* Subtle Animated Shaking Container on Error */}
                      <motion.div
                        key={shakeKey}
                        animate={
                          shakeKey > 0
                            ? { x: [0, -5, 5, -3, 3, 0] }
                            : { x: 0 }
                        }
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                        className="relative"
                      >
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B858A] dark:text-[#8FB6BC]">
                          <KeyRound className="w-4 h-4 text-[#3FAAB7] dark:text-[#78DCE0]" />
                        </div>
                        <input
                          id="admin-password-input"
                          ref={inputRef}
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (errorMessage) setErrorMessage(null);
                          }}
                          placeholder="Nhập mật khẩu..."
                          className="w-full pl-10 pr-10 py-2.5 bg-[#F2FBFC] dark:bg-[#0D2730] border border-[#65C5CE]/40 dark:border-[#143943] rounded-2xl text-xs text-[#29464C] dark:text-[#DDF5F6] placeholder:text-[#6B858A]/60 dark:placeholder:text-[#8FB6BC]/60 focus:outline-none focus:border-[#3FAAB7] focus:ring-2 focus:ring-[#3FAAB7]/20 transition-all font-serif"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6B858A] hover:text-[#3FAAB7] dark:text-[#8FB6BC] dark:hover:text-[#78DCE0] transition-colors cursor-pointer"
                          title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </motion.div>
                    </div>

                    {/* Minimal Error Message */}
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-1 space-y-0.5"
                      >
                        <p className="text-xs font-bold text-red-500 dark:text-red-400">
                          {errorMessage.title}
                        </p>
                        <p className="text-[11px] text-[#6B858A] dark:text-[#8FB6BC] italic font-serif">
                          {errorMessage.subtitle}
                        </p>
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <button
                      id="admin-auth-submit-btn"
                      type="submit"
                      className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-[#247C8C]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-serif"
                    >
                      <span>✦ Xác nhận</span>
                    </button>
                  </form>
                </motion.div>
              ) : (
                /* Stage 2: Fade in Success Welcome Screen */
                <motion.div
                  key="auth-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="py-6 space-y-4 text-center font-serif"
                >
                  <div className="w-14 h-14 mx-auto rounded-3xl bg-[#E5F5F7] dark:bg-[#0D2730] text-[#3FAAB7] dark:text-[#78DCE0] border border-[#65C5CE]/50 dark:border-[#78DCE0]/40 flex items-center justify-center shadow-lg shadow-[#247C8C]/10 animate-bounce">
                    <Unlock className="w-6 h-6 stroke-[2.2]" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-[#29464C] dark:text-[#DDF5F6] flex items-center justify-center gap-1.5">
                      <span>Chào mừng trở lại ✦</span>
                      <Sparkles className="w-4 h-4 text-[#3FAAB7] dark:text-[#78DCE0] animate-spin" />
                    </h3>
                    <p className="text-xs text-[#6B858A] dark:text-[#8FB6BC] italic">
                      Đang mở khu vực quản trị...
                    </p>
                  </div>

                  <div className="flex justify-center items-center gap-1.5 pt-2">
                    <div className="w-2 h-2 rounded-full bg-[#65C5CE] animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-[#3FAAB7] animate-pulse delay-100" />
                    <div className="w-2 h-2 rounded-full bg-[#247C8C] animate-pulse delay-200" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

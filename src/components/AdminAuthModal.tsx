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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172536]/75 backdrop-blur-md"
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
            className="relative z-10 w-full max-w-sm bg-[#F7FAFD]/98 dark:bg-[#172536]/98 backdrop-blur-xl rounded-3xl p-7 border border-[#DCE7EF] dark:border-[#43576B] shadow-2xl text-[#526B80] dark:text-[#E5EDF5] overflow-hidden"
          >
            {/* Close Button */}
            {!isSuccessState && (
              <button
                id="admin-auth-close-btn"
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-[#91A9BC] hover:text-[#526B80] dark:text-[#A9BDCE] dark:hover:text-white hover:bg-[#E8F1F8] dark:hover:bg-[#202F42] rounded-full transition-colors cursor-pointer"
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
                    <div className="w-12 h-12 rounded-2xl bg-[#E8F1F8] dark:bg-[#202F42] text-[#526B80] dark:text-[#E5EDF5] border border-[#DCE7EF] dark:border-[#43576B] flex items-center justify-center shadow-xs">
                      <Lock className="w-5 h-5 stroke-[2.2]" />
                    </div>
                  </div>

                  {/* Header Titles */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold font-serif text-[#526B80] dark:text-white tracking-tight flex items-center justify-center gap-1.5">
                      <span className="text-[#91A9BC] text-sm">❄</span>
                      <span>Khu vực quản trị</span>
                      <span className="text-[#91A9BC] text-sm">❄</span>
                    </h3>
                    <p className="text-xs text-[#91A9BC] dark:text-[#A9BDCE] italic font-serif">
                      Chỉ dành cho Admin
                    </p>
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#526B80] dark:text-[#E5EDF5] font-serif">
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
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#91A9BC]">
                          <KeyRound className="w-4 h-4 text-[#91A9BC]" />
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
                          className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] rounded-2xl text-xs text-[#526B80] dark:text-[#E5EDF5] placeholder:text-[#91A9BC]/70 focus:outline-none focus:border-[#91A9BC] focus:ring-2 focus:ring-[#91A9BC]/20 transition-all font-serif"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#91A9BC] hover:text-[#526B80] dark:hover:text-white transition-colors cursor-pointer"
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
                        <p className="text-[11px] text-[#91A9BC] dark:text-[#A9BDCE] italic font-serif">
                          {errorMessage.subtitle}
                        </p>
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <button
                      id="admin-auth-submit-btn"
                      type="submit"
                      className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#91A9BC] to-[#526B80] hover:opacity-95 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-[#526B80]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-serif"
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
                  <div className="w-14 h-14 mx-auto rounded-3xl bg-[#E8F1F8] dark:bg-[#202F42] text-[#526B80] dark:text-[#E5EDF5] border border-[#DCE7EF] dark:border-[#43576B] flex items-center justify-center shadow-lg animate-bounce">
                    <Unlock className="w-6 h-6 stroke-[2.2]" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-[#526B80] dark:text-white flex items-center justify-center gap-1.5">
                      <span>Chào mừng trở lại ✦</span>
                      <Sparkles className="w-4 h-4 text-[#91A9BC] animate-spin" />
                    </h3>
                    <p className="text-xs text-[#91A9BC] dark:text-[#A9BDCE] italic">
                      Đang mở khu vực quản trị...
                    </p>
                  </div>

                  <div className="flex justify-center items-center gap-1.5 pt-2">
                    <div className="w-2 h-2 rounded-full bg-[#DCE7EF] animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-[#91A9BC] animate-pulse delay-100" />
                    <div className="w-2 h-2 rounded-full bg-[#526B80] animate-pulse delay-200" />
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

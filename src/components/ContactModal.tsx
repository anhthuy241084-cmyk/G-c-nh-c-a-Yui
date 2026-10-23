import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Copy, Check, MessageCircle, Facebook, Instagram, MessageSquare, Video, Mail, Globe, Send, Image as ImageIcon } from 'lucide-react';
import { ContactLink, UserProfile } from '../types';
import { CreatorRequestModal } from './CreatorRequestModal';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onToast: (msg: string) => void;
  isSfxOn?: boolean;
  sfxVolume?: number;
  triggerSfx?: (name: string, vol: number) => void;
  contacts: ContactLink[];
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onToast,
  isSfxOn,
  sfxVolume,
  triggerSfx,
  contacts,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isCreatorRequestOpen, setIsCreatorRequestOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const getContactIcon = (iconType: string) => {
    switch (iconType) {
      case 'facebook': return Facebook;
      case 'ngl': return MessageCircle;
      case 'instagram': return Instagram;
      case 'discord': return MessageSquare;
      case 'tiktok': return Video;
      case 'email': return Mail;
      case 'web': return Globe;
      default: return ExternalLink;
    }
  };

  const getContactColor = (iconType: string) => {
    switch (iconType) {
      case 'facebook': return 'bg-[#3FAAB7]/15 text-[#247C8C] dark:text-[#78DCE0] border-[#3FAAB7]/30';
      case 'ngl': return 'bg-[#65C5CE]/20 text-[#247C8C] dark:text-[#78DCE0] border-[#65C5CE]/30';
      case 'instagram': return 'bg-[#57C8D1]/15 text-[#247C8C] dark:text-[#57C8D1] border-[#57C8D1]/30';
      case 'discord': return 'bg-[#246B7A]/20 text-[#247C8C] dark:text-[#78DCE0] border-[#246B7A]/30';
      case 'tiktok': return 'bg-[#0D2730] text-[#DDF5F6] border-[#78DCE0]/25';
      case 'email': return 'bg-[#3FAAB7]/15 text-[#247C8C] dark:text-[#78DCE0] border-[#3FAAB7]/30';
      default: return 'bg-[#65C5CE]/20 text-[#247C8C] dark:text-[#78DCE0] border-[#65C5CE]/30';
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onToast('📋 Đã sao chép liên kết vào bộ nhớ tạm!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081B22]/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md max-h-[90vh] flex flex-col p-6 bg-white/95 dark:bg-[#102F38]/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#65C5CE]/40 dark:border-[#78DCE0]/25 text-[#29464C] dark:text-[#DDF5F6] overflow-hidden"
            >
              {/* Top Title */}
              <div className="flex items-center justify-between pb-4 border-b border-[#65C5CE]/20 dark:border-[#143943] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#E5F5F7] dark:bg-[#0D2730] text-[#3FAAB7] dark:text-[#78DCE0] border border-[#65C5CE]/30">
                    <span className="text-xl">🐚</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-[#29464C] dark:text-[#DDF5F6] font-serif">
                      Thông tin liên hệ
                    </h3>
                    <p className="text-xs text-[#6B858A] dark:text-[#8FB6BC]">
                      Kênh truyền thông & gửi lời nhắn đại dương
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 text-[#6B858A] hover:text-[#29464C] dark:hover:text-white rounded-full hover:bg-[#E5F5F7] dark:hover:bg-[#143943] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content List */}
              <div className="mt-5 space-y-4 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                {contacts.length === 0 ? (
                  <div className="py-8 text-center text-sm text-[#6B858A]">
                    Chưa có liên kết nào được thiết lập.
                  </div>
                ) : (
                  contacts.map((c) => {
                    const IconComponent = getContactIcon(c.iconType);
                    const colorStyle = getContactColor(c.iconType);
                    return (
                      <div
                        key={c.id}
                        className="p-4 rounded-2xl bg-[#E5F5F7]/70 dark:bg-[#0D2730]/70 border border-[#65C5CE]/30 dark:border-[#143943] space-y-3 hover:border-[#3FAAB7] dark:hover:border-[#78DCE0]/50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-xs font-semibold text-[#29464C] dark:text-[#DDF5F6]">
                            <span className={`p-1.5 rounded-lg border ${colorStyle}`}>
                              <IconComponent className="w-4 h-4" />
                            </span>
                            {c.label}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleCopy(c.value, c.id)}
                              title="Sao chép liên kết"
                              className="px-2.5 py-1 text-xs font-medium text-[#29464C] dark:text-[#DDF5F6] hover:text-[#247C8C] dark:hover:text-[#78DCE0] bg-white dark:bg-[#143943] rounded-lg border border-[#65C5CE]/30 dark:border-[#78DCE0]/20 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              {copiedKey === c.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-500" />
                                  <span className="text-emerald-600 dark:text-emerald-400">Đã chép</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Sao chép</span>
                                </>
                              )}
                            </button>

                            <a
                              href={c.value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 text-xs font-medium text-white bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] rounded-lg flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                            >
                              <span>Truy cập</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>

                        <div className="p-2.5 bg-white dark:bg-[#102F38] rounded-xl border border-[#65C5CE]/20 dark:border-[#143943] font-mono text-xs text-[#247C8C] dark:text-[#78DCE0] break-all select-all">
                          {c.display || c.value}
                        </div>

                        {/* Attached Image if any */}
                        {c.imageUrl && (
                          <div className="mt-2 relative group rounded-xl overflow-hidden border border-[#65C5CE]/30 dark:border-[#143943] max-h-48 bg-white dark:bg-[#102F38] flex items-center justify-center">
                            <img
                              src={c.imageUrl}
                              alt={c.label}
                              className="w-full h-auto object-cover max-h-48 cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => setPreviewImage(c.imageUrl || null)}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <span className="text-xs text-white font-medium bg-black/60 px-2 py-1 rounded-lg">Nhấn để phóng to ảnh</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Gửi đơn đến Creator Button */}
              <div className="mt-4 pt-4 border-t border-[#65C5CE]/20 dark:border-[#143943] shrink-0">
                <button
                  onClick={() => setIsCreatorRequestOpen(true)}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] text-white text-xs font-bold font-serif flex items-center justify-center gap-2 shadow-lg shadow-[#247C8C]/20 transition-transform active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>♡ Gửi đơn đến Creator</span>
                </button>
              </div>

              {/* Note Footer */}
              <div className="mt-3 p-3 rounded-2xl bg-[#E5F5F7] dark:bg-[#0D2730] border border-[#65C5CE]/30 dark:border-[#78DCE0]/20 text-center shrink-0">
                <p className="text-xs text-[#247C8C] dark:text-[#78DCE0] font-medium">
                  🐚 Mọi thắc mắc, yêu cầu Character hoặc góp ý xin hãy nhắn về Page, NGL hoặc gửi đơn nhé!
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setPreviewImage(null)}>
            <div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute -top-4 -right-4 z-10 p-2 bg-white dark:bg-[#102F38] text-[#29464C] dark:text-white rounded-full shadow-lg hover:bg-[#E5F5F7] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <img src={previewImage} alt="Preview" className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain" />
            </div>
          </div>
        )}
      </AnimatePresence>

      <CreatorRequestModal
        isOpen={isCreatorRequestOpen}
        onClose={() => setIsCreatorRequestOpen(false)}
        userProfile={userProfile}
        onToast={onToast}
        isSfxOn={isSfxOn}
        sfxVolume={sfxVolume}
        triggerSfx={triggerSfx}
      />
    </>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Copy, Check, MessageCircle, Facebook, Instagram, MessageSquare, Video, Mail, Globe, Send } from 'lucide-react';
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
      case 'facebook': return 'bg-[#91A9BC]/20 text-[#526B80] dark:text-[#E5EDF5] border-[#91A9BC]/40';
      case 'ngl': return 'bg-[#D5E4EF]/40 text-[#526B80] dark:text-[#E5EDF5] border-[#DCE7EF]';
      case 'instagram': return 'bg-[#E8F1F8] text-[#526B80] dark:text-[#E5EDF5] border-[#DCE7EF]';
      case 'discord': return 'bg-[#91A9BC]/25 text-[#526B80] dark:text-[#E5EDF5] border-[#91A9BC]/40';
      case 'tiktok': return 'bg-[#202F42] text-[#E5EDF5] border-[#43576B]';
      case 'email': return 'bg-[#E8F1F8] text-[#526B80] dark:text-[#E5EDF5] border-[#DCE7EF]';
      default: return 'bg-[#E8F1F8] text-[#526B80] dark:text-[#E5EDF5] border-[#DCE7EF]';
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onToast('📋 Đã sao chép liên kết vào bộ nhớ tạm!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const visibleContacts = contacts.filter((c) => {
    const label = (c.label || '').toLowerCase();
    const val = (c.value || '').toLowerCase();
    return c.iconType !== 'ngl' && !label.includes('ngl') && !label.includes('ẩn danh') && !val.includes('ngl.link');
  });

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172536]/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md max-h-[90vh] flex flex-col p-6 bg-[#F7FAFD]/98 dark:bg-[#172536]/98 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#DCE7EF] dark:border-[#43576B] text-[#526B80] dark:text-[#E5EDF5] overflow-hidden"
            >
              {/* Top Title */}
              <div className="flex items-center justify-between pb-4 border-b border-[#DCE7EF] dark:border-[#43576B] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#E8F1F8] dark:bg-[#202F42] text-[#4E7AA5] dark:text-[#A8CDF0] border border-[#DCE7EF] dark:border-[#43576B]">
                    <span className="text-xl">❄</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-[#16273B] dark:text-[#E5EDF5] font-serif">
                      Thông tin liên hệ
                    </h3>
                    <p className="text-xs text-[#64829E] dark:text-[#A9BDCE] font-serif">
                      Kết nối cùng Yui &amp; góc nhỏ mùa đông
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 text-[#91A9BC] hover:text-[#526B80] dark:hover:text-white rounded-full hover:bg-[#E8F1F8] dark:hover:bg-[#202F42] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content List */}
              <div className="mt-5 space-y-4 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                {visibleContacts.length === 0 ? (
                  <div className="py-8 text-center text-sm text-[#64829E] dark:text-[#A9BDCE] font-serif">
                    Chưa có liên kết nào được thiết lập.
                  </div>
                ) : (
                  visibleContacts.map((c) => {
                    const IconComponent = getContactIcon(c.iconType);
                    const colorStyle = getContactColor(c.iconType);
                    return (
                      <div
                        key={c.id}
                        className="p-4 rounded-2xl bg-[#E8F1F8]/70 dark:bg-[#202F42]/70 border border-[#DCE7EF] dark:border-[#43576B] space-y-3 hover:border-[#91A9BC] dark:hover:border-[#A9BDCE]/50 transition-all shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-xs font-semibold text-[#526B80] dark:text-[#E5EDF5]">
                            <span className={`p-1.5 rounded-lg border ${colorStyle}`}>
                              <IconComponent className="w-4 h-4" />
                            </span>
                            {c.label}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleCopy(c.value, c.id)}
                              title="Sao chép liên kết"
                              className="px-2.5 py-1 text-xs font-medium text-[#526B80] dark:text-[#E5EDF5] hover:text-[#3B5264] bg-white dark:bg-[#172536] rounded-lg border border-[#DCE7EF] dark:border-[#43576B] flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
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
                              className="px-2.5 py-1 text-xs font-medium text-white btn-winter-primary rounded-lg flex items-center gap-1 shadow-xs transition-colors cursor-pointer font-serif"
                            >
                              <span>Truy cập</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>

                        <div className="p-2.5 bg-white dark:bg-[#172536] rounded-xl border border-[#DCE7EF] dark:border-[#43576B] font-mono text-xs text-[#526B80] dark:text-[#E5EDF5] break-all select-all">
                          {c.display || c.value}
                        </div>

                        {/* Attached Image if any */}
                        {c.imageUrl && (
                          <div className="mt-2 relative group rounded-xl overflow-hidden border border-[#DCE7EF] dark:border-[#43576B] max-h-48 bg-white dark:bg-[#172536] flex items-center justify-center">
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
              <div className="mt-4 pt-4 border-t border-[#DCE7EF] dark:border-[#43576B] shrink-0">
                <button
                  onClick={() => setIsCreatorRequestOpen(true)}
                  className="w-full py-3 px-4 rounded-2xl btn-winter-primary text-white text-xs font-bold font-serif flex items-center justify-center gap-2 shadow-md shadow-[#91A9BC]/25 transition-transform active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi Request đến Yui</span>
                </button>
              </div>

              {/* Note Footer */}
              <div className="mt-3 p-3 rounded-2xl bg-[#E8F1F8] dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] text-center shrink-0">
                <p className="text-xs text-[#526B80] dark:text-[#E5EDF5] font-serif italic">
                  &ldquo;Hẹn nhau ở cuối mùa đông, nơi tuyết chưa tan.&rdquo; ❄
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
                className="absolute -top-4 -right-4 z-10 p-2 bg-white dark:bg-[#172536] text-[#526B80] dark:text-white rounded-full shadow-lg hover:bg-[#E8F1F8] cursor-pointer"
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

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, Compass, BookOpen, Sparkles, Heart, MessageSquare, Music, Star, Send, ShieldCheck, ChevronRight, Search, Info } from 'lucide-react';
import { HelpCenterConfig, DEFAULT_HELP_CENTER_CONFIG } from '../types';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: HelpCenterConfig;
  onOpenCreatorRequest?: () => void;
  onOpenMessageBoard?: () => void;
  onOpenFortune?: () => void;
  onOpenAudioSettings?: () => void;
}

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({
  isOpen,
  onClose,
  config = DEFAULT_HELP_CENTER_CONFIG,
  onOpenCreatorRequest,
  onOpenMessageBoard,
  onOpenFortune,
  onOpenAudioSettings,
}) => {
  const currentConfig = config || DEFAULT_HELP_CENTER_CONFIG;
  const categories = currentConfig.categories && currentConfig.categories.length > 0 
    ? currentConfig.categories 
    : DEFAULT_HELP_CENTER_CONFIG.categories;

  const [activeTabKey, setActiveTabKey] = useState<string>(categories[0]?.key || 'explore');
  const [searchQuery, setSearchQuery] = useState('');

  const activeCategory = categories.find((c) => c.key === activeTabKey) || categories[0];

  // Filter items if search query is entered
  const filteredItems = searchQuery.trim()
    ? categories.flatMap((c) =>
        c.items
          .filter(
            (item) =>
              item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.desc.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((item) => ({ ...item, categoryName: c.name }))
      )
    : activeCategory?.items || [];

  const handleActionClick = (action?: string) => {
    onClose();
    if (action === 'creatorRequest' && onOpenCreatorRequest) {
      onOpenCreatorRequest();
    } else if (action === 'messageBoard' && onOpenMessageBoard) {
      onOpenMessageBoard();
    } else if (action === 'fortune' && onOpenFortune) {
      onOpenFortune();
    } else if (action === 'bgm' && onOpenAudioSettings) {
      onOpenAudioSettings();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030D12]/75 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 15 }}
            className="relative w-full max-w-2xl max-h-[90vh] bg-white/95 dark:bg-[#0E232E]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-[#38CAD6]/30 dark:border-[#38CAD6]/20 overflow-hidden flex flex-col font-sans text-[#14303A] dark:text-[#E4F7F9]"
          >
            {/* Header */}
            <div className="p-5 border-b border-[#38CAD6]/15 dark:border-[#132F3D] bg-gradient-to-r from-[#F0F9FB] via-[#E8F5F8] to-[#E0F2F5] dark:from-[#091C24] dark:via-[#0E232E] dark:to-[#132F3D] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#38CAD6] to-[#1B6E7D] text-white flex items-center justify-center shadow-md shadow-[#1B6E7D]/20 shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif text-[#14303A] dark:text-[#E4F7F9] flex items-center gap-1.5">
                    <span>{currentConfig.mainTitle || 'Sổ Tay Trợ Giúp & Hướng Dẫn Hải Trình'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#38CAD6]/15 text-[#1B6E7D] dark:text-[#48CCD6] font-medium font-sans">
                      {currentConfig.badgeText || 'Guide & Tips'}
                    </span>
                  </h3>
                  <p className="text-xs text-[#53737C] dark:text-[#88A9B3] font-serif">
                    {currentConfig.subTitle || 'Khám phá trọn vẹn các tính năng thú vị tại góc nhỏ của Yui'}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-[#53737C] hover:text-[#14303A] dark:text-[#88A9B3] dark:hover:text-white rounded-full hover:bg-[#38CAD6]/10 dark:hover:bg-[#132F3D] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Announcement Note if present */}
            {currentConfig.announcementNote && (
              <div className="px-5 py-2.5 bg-[#38CAD6]/10 border-b border-[#38CAD6]/20 flex items-center gap-2 text-xs text-[#1B6E7D] dark:text-[#7DD8DE] font-medium font-serif">
                <Info className="w-4 h-4 shrink-0 text-[#38CAD6]" />
                <span className="flex-1">{currentConfig.announcementNote}</span>
              </div>
            )}

            {/* Quick Search */}
            <div className="px-5 pt-3 pb-2 border-b border-[#38CAD6]/15 dark:border-[#132F3D] flex items-center gap-2 bg-[#F6FBFC]/80 dark:bg-[#07171F]/60">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#53737C] dark:text-[#88A9B3]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm hướng dẫn, mẹo, cách kẹp bookmark, rút vỏ sò..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#0E232E] border border-[#38CAD6]/25 dark:border-[#132F3D] text-[#14303A] dark:text-[#E4F7F9] placeholder:text-[#53737C]/60 dark:placeholder:text-[#88A9B3]/60 focus:outline-hidden focus:border-[#38CAD6]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#53737C] hover:text-[#14303A]"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Navigation Tabs (if not searching) */}
            {!searchQuery && (
              <div className="px-5 pt-3 border-b border-[#38CAD6]/15 dark:border-[#132F3D] flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0 bg-[#F2FBFC]/50 dark:bg-[#07171F]/40 font-serif">
                {categories.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTabKey(tab.key)}
                    className={`pb-2.5 px-2.5 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
                      activeTabKey === tab.key
                        ? 'border-[#38CAD6] text-[#1B6E7D] dark:text-[#48CCD6]'
                        : 'border-transparent text-[#53737C] dark:text-[#88A9B3] hover:text-[#1B6E7D]'
                    }`}
                  >
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Content Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
              {!searchQuery && activeCategory && (
                <div className="space-y-1">
                  <h4 className="text-sm font-bold font-serif text-[#14303A] dark:text-[#E4F7F9] flex items-center gap-1.5">
                    <span>{activeCategory.title}</span>
                  </h4>
                  <p className="text-xs text-[#53737C] dark:text-[#88A9B3]">
                    {activeCategory.description || 'Các mẹo nhỏ và thao tác dễ dàng:'}
                  </p>
                </div>
              )}

              {searchQuery && (
                <div className="text-xs text-[#53737C] dark:text-[#88A9B3] font-serif">
                  Kết quả tìm kiếm cho "{searchQuery}" ({filteredItems.length}):
                </div>
              )}

              <div className="space-y-3 pt-1">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#53737C] dark:text-[#88A9B3] font-serif">
                    Không tìm thấy mục hướng dẫn nào phù hợp với từ khóa này.
                  </div>
                ) : (
                  filteredItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-4 rounded-2xl bg-[#F2FBFC]/70 dark:bg-[#0B1E26]/80 border border-[#38CAD6]/25 dark:border-[#132F3D] space-y-1.5 shadow-xs transition-all hover:border-[#38CAD6]/50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#38CAD6]/20 text-[#1B6E7D] dark:text-[#48CCD6] text-[10px] font-bold flex items-center justify-center font-mono shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-[#14303A] dark:text-[#E4F7F9] font-serif">
                            {item.title}
                          </span>
                        </div>
                        {(item as any).categoryName && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#38CAD6]/15 text-[#1B6E7D] dark:text-[#48CCD6]">
                            {(item as any).categoryName}
                          </span>
                        )}
                        {item.badge && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#38CAD6]/20 text-[#1B6E7D] dark:text-[#7DD8DE] font-semibold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#53737C] dark:text-[#B2CFD7] leading-relaxed pl-7 font-serif">
                        {item.desc}
                      </p>
                      {item.linkAction && (
                        <div className="pl-7 pt-1">
                          <button
                            onClick={() => handleActionClick(item.linkAction)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1B6E7D] dark:text-[#48CCD6] hover:underline cursor-pointer"
                          >
                            <span>Thử ngay</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer quick action */}
            <div className="p-4 border-t border-[#38CAD6]/15 dark:border-[#132F3D] bg-[#F0F9FB]/60 dark:bg-[#091C24]/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-xs text-[#53737C] dark:text-[#88A9B3] font-serif">
                <span>✦ Cần thêm trợ giúp hoặc yêu cầu tính năng?</span>
              </div>
              <div className="flex items-center gap-2">
                {onOpenCreatorRequest && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCreatorRequest();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#38CAD6]/15 hover:bg-[#38CAD6]/25 text-[#1B6E7D] dark:text-[#48CCD6] text-xs font-bold font-serif transition-colors cursor-pointer"
                  >
                    💌 Gửi đơn cho Creator
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#38CAD6] to-[#1B6E7D] text-white text-xs font-bold hover:shadow-md transition-all cursor-pointer font-serif"
                >
                  Đã hiểu ♡
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

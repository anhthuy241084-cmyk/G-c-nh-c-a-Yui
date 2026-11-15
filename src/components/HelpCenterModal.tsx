import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, ChevronRight, Search, Info } from 'lucide-react';
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
  const categories =
    currentConfig.categories && currentConfig.categories.length > 0
      ? currentConfig.categories
      : DEFAULT_HELP_CENTER_CONFIG.categories;

  const [activeTabKey, setActiveTabKey] = useState<string>(categories[0]?.key || 'explore');
  const [searchQuery, setSearchQuery] = useState('');

  const activeCategory = categories.find((c) => c.key === activeTabKey) || categories[0];

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172536]/75 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 15 }}
            className="relative w-full max-w-2xl max-h-[90vh] bg-[#F7FAFD]/95 dark:bg-[#172536]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-[#DCE7EF] dark:border-[#354A60] overflow-hidden flex flex-col font-sans text-[#172536] dark:text-[#E5EDF5]"
          >
            {/* Header */}
            <div className="p-5 border-b border-[#DCE7EF] dark:border-[#354A60] bg-gradient-to-r from-[#F7FAFD] via-[#E8F1F8] to-[#D5E4EF] dark:from-[#172536] dark:via-[#202F42] dark:to-[#27384D] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#91A9BC] to-[#526B80] text-white flex items-center justify-center shadow-md shadow-[#526B80]/20 shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif text-[#172536] dark:text-[#E5EDF5] flex items-center gap-1.5">
                    <span>{currentConfig.mainTitle || 'Sổ Tay Trợ Giúp & Hướng Dẫn Mùa Đông'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D5E4EF] dark:bg-[#354A60] text-[#526B80] dark:text-[#A9BDCE] font-medium font-sans">
                      {currentConfig.badgeText || 'Guide & Tips'}
                    </span>
                  </h3>
                  <p className="text-xs text-[#43576B] dark:text-[#A9BDCE] font-serif">
                    {currentConfig.subTitle || 'Khám phá trọn vẹn các tính năng thú vị tại Hộp Ký Ức Mùa Đông'}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-[#43576B] hover:text-[#172536] dark:text-[#A9BDCE] dark:hover:text-white rounded-full hover:bg-[#D5E4EF]/60 dark:hover:bg-[#354A60] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Announcement Note if present */}
            {currentConfig.announcementNote && (
              <div className="px-5 py-2.5 bg-[#E8F1F8] dark:bg-[#202F42] border-b border-[#DCE7EF] dark:border-[#354A60] flex items-center gap-2 text-xs text-[#526B80] dark:text-[#A9BDCE] font-medium font-serif">
                <Info className="w-4 h-4 shrink-0 text-[#526B80] dark:text-[#91A9BC]" />
                <span className="flex-1">{currentConfig.announcementNote}</span>
              </div>
            )}

            {/* Quick Search */}
            <div className="px-5 pt-3 pb-2 border-b border-[#DCE7EF] dark:border-[#354A60] flex items-center gap-2 bg-[#E8F1F8]/60 dark:bg-[#202F42]/60">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#526B80] dark:text-[#A9BDCE]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm hướng dẫn, mẹo, cách kẹp bookmark, rút quẻ tuyết..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#354A60] text-[#172536] dark:text-[#E5EDF5] placeholder:text-[#526B80]/60 dark:placeholder:text-[#A9BDCE]/60 focus:outline-hidden focus:border-[#526B80] dark:focus:border-[#91A9BC]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#526B80] hover:text-[#172536] dark:text-[#A9BDCE] dark:hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Navigation Tabs (if not searching) */}
            {!searchQuery && (
              <div className="px-5 pt-3 border-b border-[#DCE7EF] dark:border-[#354A60] flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0 bg-[#E8F1F8]/40 dark:bg-[#202F42]/40 font-serif">
                {categories.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTabKey(tab.key)}
                    className={`pb-2.5 px-2.5 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
                      activeTabKey === tab.key
                        ? 'border-[#526B80] dark:border-[#91A9BC] text-[#172536] dark:text-[#E5EDF5]'
                        : 'border-transparent text-[#526B80] dark:text-[#A9BDCE] hover:text-[#172536] dark:hover:text-white'
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
                  <h4 className="text-sm font-bold font-serif text-[#172536] dark:text-[#E5EDF5] flex items-center gap-1.5">
                    <span>{activeCategory.title}</span>
                  </h4>
                  <p className="text-xs text-[#43576B] dark:text-[#A9BDCE]">
                    {activeCategory.description || 'Các mẹo nhỏ và thao tác dễ dàng:'}
                  </p>
                </div>
              )}

              {searchQuery && (
                <div className="text-xs text-[#43576B] dark:text-[#A9BDCE] font-serif">
                  Kết quả tìm kiếm cho "{searchQuery}" ({filteredItems.length}):
                </div>
              )}

              <div className="space-y-3 pt-1">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#526B80] dark:text-[#A9BDCE] font-serif">
                    Không tìm thấy mục hướng dẫn nào phù hợp với từ khóa này.
                  </div>
                ) : (
                  filteredItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-4 rounded-2xl bg-white dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#354A60] space-y-1.5 shadow-xs transition-all hover:border-[#91A9BC]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#D5E4EF] dark:bg-[#354A60] text-[#526B80] dark:text-[#E5EDF5] text-[10px] font-bold flex items-center justify-center font-mono shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-[#172536] dark:text-[#E5EDF5] font-serif">
                            {item.title}
                          </span>
                        </div>
                        {(item as any).categoryName && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#E8F1F8] dark:bg-[#354A60] text-[#526B80] dark:text-[#A9BDCE]">
                            {(item as any).categoryName}
                          </span>
                        )}
                        {item.badge && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#D5E4EF] dark:bg-[#354A60] text-[#172536] dark:text-[#E5EDF5] font-semibold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#43576B] dark:text-[#A9BDCE] leading-relaxed pl-7 font-serif">
                        {item.desc}
                      </p>
                      {item.linkAction && (
                        <div className="pl-7 pt-1">
                          <button
                            onClick={() => handleActionClick(item.linkAction)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#526B80] dark:text-[#91A9BC] hover:underline cursor-pointer"
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
            <div className="p-4 border-t border-[#DCE7EF] dark:border-[#354A60] bg-[#E8F1F8]/70 dark:bg-[#202F42]/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-xs text-[#43576B] dark:text-[#A9BDCE] font-serif">
                <span>✦ Cần thêm trợ giúp hoặc yêu cầu tính năng?</span>
              </div>
              <div className="flex items-center gap-2">
                {onOpenCreatorRequest && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCreatorRequest();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#D5E4EF] hover:bg-[#91A9BC]/40 dark:bg-[#354A60] dark:hover:bg-[#43576B] text-[#172536] dark:text-[#E5EDF5] text-xs font-bold font-serif transition-colors cursor-pointer"
                  >
                    💌 Gửi đơn cho Creator
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#91A9BC] to-[#526B80] text-white text-xs font-bold hover:shadow-md transition-all cursor-pointer font-serif"
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

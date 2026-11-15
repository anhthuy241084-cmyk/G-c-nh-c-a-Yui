import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BellRing, CheckCheck, Sparkles, Megaphone, Trash2, Heart, Star, StarOff, ExternalLink, Eye } from 'lucide-react';
import { AppNotification, Character } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification?: (id: string) => void;
  characters?: Character[];
  favorites?: Record<string, boolean>;
  onToggleFavorite?: (id: string) => void;
  onSelectCharacter?: (char: Character) => void;
  onGoToGgai?: (char: Character, url: string) => void;
  initialTab?: 'notifications' | 'favorites';
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  characters = [],
  favorites = {},
  onToggleFavorite,
  onSelectCharacter,
  onGoToGgai,
  initialTab = 'favorites',
}) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'favorites'>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const favoritedCharacters = characters.filter((c) => {
    if (c.isDraft || c.isPrivate) return false;
    return !!favorites[c.id] || !!c.isFavorite;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121F32]/75 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-[#F5F9FE] dark:bg-[#172538] rounded-[28px] shadow-2xl border border-[#D4E4F2] dark:border-[#39506B] text-[#334A60] dark:text-[#E5EFF9] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-[#DCE9F5] dark:border-[#334963] flex items-center justify-between bg-gradient-to-r from-white via-[#F6FAFE] to-[#EAF3FC] dark:from-[#203046] dark:to-[#172538]">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6392BE] to-[#436D96] text-white shadow-sm flex items-center justify-center">
                  {activeTab === 'notifications' ? (
                    <Megaphone className="w-5 h-5" />
                  ) : (
                    <Star className="w-5 h-5 fill-current" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif text-[#16273B] dark:text-white">
                    {activeTab === 'notifications' ? 'Lưu Trữ Tin Từ Yui' : 'Nhân vật đã lưu'}
                  </h3>
                  <p className="text-xs text-[#5E7C99] dark:text-[#A4C0DA] font-serif">
                    {activeTab === 'notifications'
                      ? 'Tổng hợp các bản tin & lời nhắn đã phát ở đầu trang'
                      : 'Những gương mặt bạn đã bấm dấu sao lưu lại'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {activeTab === 'notifications' && unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="p-2 text-[#5E7C99] hover:text-[#3B6893] dark:hover:text-white rounded-xl hover:bg-[#EAF3FC] dark:hover:bg-[#243750] transition-colors cursor-pointer"
                    title="Đánh dấu tất cả đã đọc"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-[#64829E] hover:text-[#16273B] dark:hover:text-white rounded-full hover:bg-[#EAF3FC] dark:hover:bg-[#243750] transition-colors cursor-pointer"
                  aria-label="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Header Tabs switcher */}
            <div className="flex items-center gap-2 px-5 py-2.5 bg-[#EDF5FD] dark:bg-[#1C2C41] border-b border-[#DCE9F5] dark:border-[#334963] font-serif">
              <button
                onClick={() => setActiveTab('favorites')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'favorites'
                    ? 'bg-white dark:bg-[#243750] text-[#35638F] dark:text-white shadow-xs border border-[#CFE1F2] dark:border-[#496485]'
                    : 'text-[#64829E] dark:text-[#A4C0DA] hover:text-[#16273B]'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${activeTab === 'favorites' ? 'fill-amber-400 text-amber-500' : ''}`} />
                <span>Đã lưu</span>
                {favoritedCharacters.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-[#4E7AA5] text-white tabular-nums">
                    {favoritedCharacters.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'notifications'
                    ? 'bg-white dark:bg-[#243750] text-[#35638F] dark:text-white shadow-xs border border-[#CFE1F2] dark:border-[#496485]'
                    : 'text-[#64829E] dark:text-[#A4C0DA] hover:text-[#16273B]'
                }`}
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Tin từ Yui</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-[#4E7AA5] text-white tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {activeTab === 'notifications' ? (
                notifications.length === 0 ? (
                  <div className="py-12 text-center text-[#64829E] dark:text-[#A4C0DA] font-serif text-xs">
                    Chưa có bản tin nào được lưu từ Yui.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => onMarkAsRead(notif.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                        notif.isRead
                          ? 'bg-white/65 dark:bg-[#1C2C41]/60 border-[#DCE9F5] dark:border-[#334963] text-[#5E7C99] dark:text-[#A4C0DA]'
                          : 'bg-white dark:bg-[#22354D] border-[#9EC3E6] dark:border-[#5D87B0] text-[#16273B] dark:text-[#F8FBFF] shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl shrink-0 mt-0.5 bg-[#EAF3FC] dark:bg-[#172538] text-[#4E7AA5] dark:text-[#A8CDF0]">
                          {notif.type === 'new_character' ? (
                            <Sparkles className="w-4 h-4" />
                          ) : (
                            <Megaphone className="w-4 h-4" />
                          )}
                        </div>

                        <div className="space-y-1 min-w-0 flex-1 pr-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold font-serif truncate">{notif.title}</h4>
                            {!notif.isRead && (
                              <span className="text-[10px] font-bold text-[#4E7AA5] dark:text-[#9EC5EC] shrink-0">
                                Mới
                              </span>
                            )}
                          </div>
                          <p className="text-xs leading-relaxed whitespace-pre-line break-words">
                            {notif.content}
                          </p>
                          <p className="text-[10px] text-[#7393B3] pt-0.5">{notif.createdAt}</p>
                        </div>

                        {onDeleteNotification && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteNotification(notif.id);
                            }}
                            className="p-1 text-[#8AA4BD] hover:text-rose-500 rounded-lg transition-colors shrink-0 cursor-pointer"
                            title="Xóa thông báo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )
              ) : favoritedCharacters.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#EAF3FC] dark:bg-[#22354D] text-[#4E7AA5] border border-[#CFE1F2] dark:border-[#3C5573] flex items-center justify-center mx-auto">
                    <StarOff className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold font-serif text-[#16273B] dark:text-white">
                      Chưa có nhân vật nào được lưu
                    </h4>
                    <p className="text-xs text-[#64829E] dark:text-[#A4C0DA] max-w-xs mx-auto mt-1 leading-relaxed">
                      Nhấn biểu tượng ngôi sao trong hồ sơ nhân vật để lưu lại những gương mặt bạn yêu mến nhất nhé.
                    </p>
                  </div>
                </div>
              ) : (
                favoritedCharacters.map((char) => (
                  <div
                    key={char.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#1E2F44] border border-[#DCE9F5] dark:border-[#344B66] flex items-center justify-between gap-3 transition-all hover:border-[#7EB0DE]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={char.avatar}
                        alt={char.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover object-[center_20%] border border-[#D4E4F2] dark:border-[#3D5470] shrink-0"
                      />
                      <div className="min-w-0 space-y-0.5">
                        <h4 className="text-xs font-bold font-serif text-[#16273B] dark:text-white truncate">
                          {char.name}
                        </h4>
                        <p className="text-[11px] text-[#5E7C99] dark:text-[#A4C0DA] truncate">
                          {char.title}
                        </p>
                        <div className="flex items-center gap-1.5 pt-0.5 text-[10px] text-[#64829E]">
                          <span>by {char.creator || 'Yui'}</span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-0.5 text-rose-500">
                            <Heart className="w-2.5 h-2.5 fill-current" />
                            {char.votes}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onToggleFavorite && (
                        <button
                          onClick={() => onToggleFavorite(char.id)}
                          className="p-2 rounded-xl text-amber-500 hover:bg-amber-50 dark:hover:bg-[#2B3F59] transition-colors cursor-pointer"
                          title="Bỏ lưu khỏi Yêu thích"
                        >
                          <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                        </button>
                      )}

                      {onSelectCharacter && (
                        <button
                          onClick={() => {
                            onClose();
                            onSelectCharacter(char);
                          }}
                          className="p-2 rounded-xl text-[#4E7AA5] dark:text-[#A8CDF0] hover:bg-[#EAF3FC] dark:hover:bg-[#2B3F59] transition-colors cursor-pointer"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (onGoToGgai) {
                            onGoToGgai(char, char.chatUrl);
                          } else {
                            window.open(char.chatUrl, '_blank');
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#5D8AB5] to-[#436D96] hover:brightness-105 text-white shadow-xs flex items-center gap-1 transition-all cursor-pointer font-serif"
                        title={char.chatUrl}
                      >
                        <span>{char.chatUrlLabel || 'Ggai'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-[#DCE9F5] dark:border-[#334963] bg-white/85 dark:bg-[#1B2B40] text-center">
              <button
                onClick={onClose}
                className="w-full py-2 rounded-xl text-xs font-serif font-semibold bg-[#EAF3FC] dark:bg-[#243750] text-[#36597A] dark:text-[#E5EFF9] hover:bg-[#DCEBFA] dark:hover:bg-[#314864] transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

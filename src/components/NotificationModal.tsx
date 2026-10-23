import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, CheckCheck, Sparkles, Megaphone, Trash2, Heart, Star, StarOff, ExternalLink, Eye } from 'lucide-react';
import { AppNotification, Character } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification?: (id: string) => void;
  // Favorites props
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
  initialTab = 'notifications',
}) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'favorites'>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Filter favorited characters
  const favoritedCharacters = characters.filter((c) => {
    if (c.isDraft || c.isPrivate) return false;
    return !!favorites[c.id] || !!c.isFavorite;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
              <div className="flex items-center gap-2.5">
                <div className="relative p-2 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  {activeTab === 'notifications' ? (
                    <Bell className="w-5 h-5" />
                  ) : (
                    <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                  )}
                  {activeTab === 'notifications' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-white dark:border-slate-900" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{activeTab === 'notifications' ? 'Thông báo' : 'Nhân vật đã lưu (Yêu thích ⭐)'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activeTab === 'notifications'
                      ? 'Cập nhật chính thức & tin tức mới nhất'
                      : 'Danh sách nhân vật bạn đã bấm dấu sao ⭐ lưu lại'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {activeTab === 'notifications' && unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="p-2 text-slate-400 hover:text-amber-500 rounded-xl transition-colors"
                    title="Đánh dấu tất cả đã đọc"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Header Tabs switcher */}
            <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-100/60 dark:bg-slate-800/50 border-b border-slate-200/60 dark:border-slate-800">
              <button
                onClick={() => {
                  setActiveTab('notifications');
                  window.location.hash = 'thongbao';
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'notifications'
                    ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Thông báo</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab('favorites');
                  window.location.hash = 'yeuthich';
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'favorites'
                    ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${activeTab === 'favorites' ? 'fill-amber-400 text-amber-500' : ''}`} />
                <span>Đã lưu (Yêu thích)</span>
                {favoritedCharacters.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-500 text-white">
                    {favoritedCharacters.length}
                  </span>
                )}
              </button>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {activeTab === 'notifications' ? (
                /* Tab 1: Notifications */
                notifications.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium text-xs">
                    Ơ, chưa có thông báo mới nào rồi.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => onMarkAsRead(notif.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                        notif.isRead
                          ? 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/50 text-slate-900 dark:text-slate-100 shadow-sm'
                      }`}
                    >
                      {!notif.isRead && (
                        <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                      )}

                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                            notif.type === 'new_character'
                              ? 'bg-[#65C5CE]/20 text-[#247C8C] dark:text-[#78DCE0]'
                              : 'bg-amber-500/10 text-amber-500'
                          }`}
                        >
                          {notif.type === 'new_character' ? (
                            <Sparkles className="w-4 h-4" />
                          ) : (
                            <Megaphone className="w-4 h-4" />
                          )}
                        </div>

                        <div className="space-y-1 min-w-0 flex-1 pr-4">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-bold truncate">{notif.title}</h4>
                          </div>
                          <p className="text-xs leading-relaxed whitespace-pre-line break-words">
                            {notif.content}
                          </p>
                          <p className="text-[10px] text-slate-400 pt-1">{notif.createdAt}</p>
                        </div>

                        {onDeleteNotification && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteNotification(notif.id);
                            }}
                            className="p-1 text-slate-400 hover:text-red-500 rounded-lg transition-colors shrink-0"
                            title="Xóa thông báo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )
              ) : (
                /* Tab 2: Favorites List */
                favoritedCharacters.length === 0 ? (
                  <div className="py-12 px-4 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto">
                      <StarOff className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Chưa có character nào được lưu
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                        Hãy nhấn biểu tượng ngôi sao ⭐ ở góc thẻ nhân vật để lưu lại những character bạn yêu thích nhất vào đây nhé! ✨
                      </p>
                    </div>
                  </div>
                ) : (
                  favoritedCharacters.map((char) => (
                    <div
                      key={char.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 transition-all hover:border-amber-300 dark:hover:border-amber-500/50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={char.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                          alt={char.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {char.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {char.title}
                          </p>
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <span className="text-[10px] font-semibold text-[#247C8C] dark:text-[#78DCE0]">
                              By {char.creator || 'Admin'}
                            </span>
                            <span className="text-[10px] text-slate-400">• {char.votes} tim ❤️</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Unfavorite / Star button */}
                        {onToggleFavorite && (
                          <button
                            onClick={() => onToggleFavorite(char.id)}
                            className="p-2 rounded-xl text-amber-500 hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors"
                            title="Bỏ lưu khỏi danh sách Yêu thích"
                          >
                            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                          </button>
                        )}

                        {/* View detail modal */}
                        {onSelectCharacter && (
                          <button
                            onClick={() => {
                              onClose();
                              onSelectCharacter(char);
                            }}
                            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        {/* Chat URL 1 */}
                        <button
                          onClick={() => {
                            if (onGoToGgai) {
                              onGoToGgai(char, char.chatUrl);
                            } else {
                              window.open(char.chatUrl, '_blank');
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] text-white shadow-sm flex items-center gap-1 transition-colors cursor-pointer"
                          title={char.chatUrl}
                        >
                          <span>{char.chatUrlLabel || 'Ggai'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>

                        {/* Chat URL 2 if present */}
                        {char.chatUrl2 && (
                          <button
                            onClick={() => {
                              if (onGoToGgai) {
                                onGoToGgai(char, char.chatUrl2!);
                              } else {
                                window.open(char.chatUrl2, '_blank');
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-700 text-[#247C8C] dark:text-[#78DCE0] hover:bg-[#E5F5F7] dark:hover:bg-slate-600 border border-[#65C5CE]/40 shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                            title={char.chatUrl2}
                          >
                            <span>{char.chatUrl2Label || 'Link 2'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center">
              <button
                onClick={onClose}
                className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
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

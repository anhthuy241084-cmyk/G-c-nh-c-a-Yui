import React from 'react';
import { motion } from 'motion/react';
import { Search, Heart, Sparkles, RefreshCw, Bookmark, History, Trophy, Box } from 'lucide-react';

export type EmptyStateType =
  | 'search'
  | 'favorites'
  | 'saved'
  | 'history'
  | 'voting'
  | 'random'
  | 'store'
  | 'error';

interface EmptyStateProps {
  type: EmptyStateType;
  onAction?: () => void;
  customTitle?: string;
  customSubtitle?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  onAction,
  customTitle,
  customSubtitle,
}) => {
  const getEmptyStateConfig = () => {
    switch (type) {
      case 'search':
        return {
          icon: <Search className="w-7 h-7 text-rose-500" />,
          emoji: '(｡•́︿•̀｡)',
          title: customTitle || 'Hmm... góc này chưa có ai cả (｡•́︿•̀｡)',
          subtitle: customSubtitle || 'Thử tìm một từ khóa khác hoặc đổi thẻ tag nhé?',
          actionLabel: '⌕ Tìm lại',
          actionIcon: <Search className="w-3.5 h-3.5" />,
        };
      case 'favorites':
        return {
          icon: <Heart className="w-7 h-7 text-rose-500 fill-rose-500/20" />,
          emoji: '♡',
          title: customTitle || 'Góc yêu thích vẫn còn trống ♡',
          subtitle: customSubtitle || 'Thử ghé xem vài Character rồi mang một bạn về đây nhé.',
          actionLabel: '✦ Khám phá Character',
          actionIcon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />,
        };
      case 'saved':
        return {
          icon: <Bookmark className="w-7 h-7 text-purple-500" />,
          emoji: '🔖',
          title: customTitle || 'Chưa có gì được để dành cả...',
          subtitle: customSubtitle || 'Character nào muốn xem sau thì nhớ đánh dấu lại nhé ♡',
          actionLabel: 'Khám phá ngay',
          actionIcon: <Sparkles className="w-3.5 h-3.5" />,
        };
      case 'history':
        return {
          icon: <History className="w-7 h-7 text-indigo-500" />,
          emoji: '🕐',
          title: customTitle || 'Hình như bạn chưa ghé qua Character nào thì phải?',
          subtitle: customSubtitle || 'Đi xem thử một vòng nào ✦',
          actionLabel: 'Xem Character',
          actionIcon: <Sparkles className="w-3.5 h-3.5" />,
        };
      case 'voting':
        return {
          icon: <Trophy className="w-7 h-7 text-amber-500" />,
          emoji: '🏆',
          title: customTitle || 'Bảng xếp hạng đang chờ những lượt vote đầu tiên...',
          subtitle: customSubtitle || 'Hãy là người đầu tiên bình chọn cho nhân vật bạn thích nhé ♡',
          actionLabel: 'Bình chọn ngay',
          actionIcon: <Heart className="w-3.5 h-3.5" />,
        };
      case 'random':
        return {
          icon: <Box className="w-7 h-7 text-pink-500" />,
          emoji: '(´• ω •`)',
          title: customTitle || 'Ơ... hôm nay chưa có ai để chọn mất rồi (´• ω •`)',
          subtitle: customSubtitle || 'Khi có Character, hệ thống sẽ gợi ý cho bạn nhé.',
          actionLabel: 'Trở về trang chủ',
          actionIcon: <Sparkles className="w-3.5 h-3.5" />,
        };
      case 'error':
        return {
          icon: <RefreshCw className="w-7 h-7 text-red-500" />,
          emoji: '(｡•́︿•̀｡)',
          title: customTitle || 'Ơ... hình như góc nhỏ đang gặp chút trục trặc (｡•́︿•̀｡)',
          subtitle: customSubtitle || 'Thử bấm nút bên dưới để tải lại dữ liệu nhé?',
          actionLabel: '↻ Thử lại',
          actionIcon: <RefreshCw className="w-3.5 h-3.5" />,
        };
      case 'store':
      default:
        return {
          icon: <Box className="w-7 h-7 text-rose-400" />,
          emoji: '📦',
          title: customTitle || 'Góc nhỏ này vẫn đang trống...',
          subtitle: customSubtitle || 'Chưa có Character nào được lưu ở đây.',
          actionLabel: 'Tải lại',
          actionIcon: <RefreshCw className="w-3.5 h-3.5" />,
        };
    }
  };

  const config = getEmptyStateConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center p-8 my-6 text-center bg-white/70 dark:bg-slate-900/70 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm max-w-md mx-auto space-y-4 select-none"
    >
      {/* Animated Icon Illustration */}
      <motion.div
        animate={{ y: [-4, 4, -4], rotate: [-2, 2, -2] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="relative w-16 h-16 rounded-2xl bg-rose-50 dark:bg-slate-800 border border-rose-100 dark:border-slate-700 flex items-center justify-center shadow-md"
      >
        {config.icon}
        <motion.span
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-2 -right-2 text-xs"
        >
          ✦
        </motion.span>
      </motion.div>

      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h3 className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 leading-snug">
          {config.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
          {config.subtitle}
        </p>
      </div>

      {/* Action Button */}
      {onAction && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {config.actionIcon}
          <span>{config.actionLabel}</span>
        </motion.button>
      )}
    </motion.div>
  );
};

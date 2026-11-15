import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ExternalLink,
  Heart,
  Star,
  Bookmark,
  Send,
  Trash2,
  ZoomIn,
  BookOpen,
  Snowflake,
  Feather,
  MessageSquare,
} from 'lucide-react';
import { Character, CharacterComment, CharacterBookmark, BookmarkPaperStyle, BookmarkTailDecor } from '../types';
import { ImageViewerModal } from './ImageViewerModal';
import { StoryReaderModal } from './StoryReaderModal';
import { triggerHeartConfetti } from '../utils/confetti';
import { AutoLinkText } from './AutoLinkText';
import { triggerSfx } from '../utils/sfx';

interface CharacterDetailModalProps {
  character: Character | null;
  onClose: () => void;
  onVote: (characterId: string) => void;
  onToggleFavorite?: (characterId: string) => void;
  isFavorite?: boolean;
  onAddComment: (characterId: string, author: string, content: string) => void;
  onDeleteComment: (characterId: string, commentId: string) => void;
  isBookmarked?: boolean;
  bookmarkData?: CharacterBookmark;
  onToggleBookmark?: (characterId: string, paperStyle?: BookmarkPaperStyle, tailDecor?: BookmarkTailDecor) => void;
  onUpdateBookmarkStyle?: (characterId: string, paperStyle: BookmarkPaperStyle, tailDecor: BookmarkTailDecor) => void;
  onUpdateReadingProgress?: (characterId: string, progress: number, chapterIndex: number) => void;
  initialOpenStory?: boolean;
}

export const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({
  character,
  onClose,
  onVote,
  onToggleFavorite,
  isFavorite = false,
  onAddComment,
  onDeleteComment,
  isBookmarked = false,
  bookmarkData,
  onToggleBookmark,
  onUpdateBookmarkStyle,
  onUpdateReadingProgress,
  initialOpenStory = false,
}) => {
  const [justVoted, setJustVoted] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [isReaderOpen, setIsReaderOpen] = useState(initialOpenStory);
  const [activeTab, setActiveTab] = useState<'story' | 'first' | 'comments'>('story');

  useEffect(() => {
    if (initialOpenStory) {
      setIsReaderOpen(true);
    }
  }, [initialOpenStory]);

  useEffect(() => {
    if (character) {
      if (character.story?.trim()) {
        setActiveTab('story');
      } else if (character.firstMessage?.trim()) {
        setActiveTab('first');
      } else {
        setActiveTab('comments');
      }
    }
  }, [character?.id]);

  if (!character) return null;

  const creatorName = character.creator && character.creator.trim() !== 'Admin' ? character.creator : 'Yui';
  const commentsList: CharacterComment[] = character.comments || [];
  const hasStory = !!(character.story && character.story.trim());
  const hasFirstMessage = !!(character.firstMessage && character.firstMessage.trim());

  const handleVote = () => {
    triggerHeartConfetti(0.5, 0.7);
    triggerSfx('heart', 0.45);
    onVote(character.id);
    setJustVoted(true);
    setTimeout(() => setJustVoted(false), 1200);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const finalAuthor = authorName.trim() || 'Khách';
    onAddComment(character.id, finalAuthor, commentText.trim());
    setCommentText('');
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-[#142336]/65 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-4xl max-h-[92dvh] flex flex-col bg-[#FCFEFF] dark:bg-[#172334] rounded-2xl sm:rounded-[28px] shadow-[0_24px_60px_-15px_rgba(24,45,74,0.42)] border border-[#D4E6F6] dark:border-[#32465E] text-[#263E57] dark:text-[#E7F0FA] overflow-hidden"
          >
            {/* Dreamy Pastel Header */}
            <div className="flex items-center justify-between px-4 sm:px-7 py-3 sm:py-3.5 border-b border-[#E3EFFA] dark:border-[#2C3F56] bg-gradient-to-r from-[#F5FAFF] via-[#EFF6FD] to-[#FDF5F8] dark:from-[#1B293C] dark:to-[#1E2B3E] shrink-0">
              <div className="flex items-center gap-2.5 text-xs font-serif font-semibold text-[#42698E] dark:text-[#B9D6F0] min-w-0">
                <span className="w-7 h-7 rounded-xl bg-white dark:bg-[#23344A] border border-[#D4E6F6] dark:border-[#3A516E] flex items-center justify-center shrink-0">
                  <Snowflake className="w-3.5 h-3.5 text-[#5380AD] dark:text-[#9AC0E3]" />
                </span>
                <span className="truncate">Hồ Sơ Ký Ức · Chấp bút: {creatorName}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onToggleBookmark && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerSfx('pop', 0.35);
                      onToggleBookmark(character.id);
                    }}
                    className={`inline-flex items-center gap-1.5 min-h-[38px] sm:min-h-0 px-3 py-1.5 rounded-xl text-xs font-serif font-semibold transition-colors cursor-pointer border ${
                      isBookmarked
                        ? 'bg-[#5380AD] text-white border-[#5380AD]'
                        : 'bg-white dark:bg-[#223246] text-[#456789] dark:text-[#B5D3EE] border-[#D4E6F6] dark:border-[#384F6B] hover:bg-[#EDF5FD]'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                    <span className="hidden sm:inline">{isBookmarked ? 'Đã cất dấu trang' : 'Cất dấu trang'}</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="min-w-[38px] min-h-[38px] sm:min-w-0 sm:min-h-0 flex items-center justify-center p-1.5 rounded-full text-[#6B8BA8] dark:text-[#A4C0DA] hover:text-[#203850] dark:hover:text-white hover:bg-white/80 dark:hover:bg-[#283B52] transition-colors cursor-pointer"
                  title="Đóng hồ sơ"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Upper Keepsake Spread */}
              <div className="p-4 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-7 items-start">
                {/* Left Clean Portrait */}
                <div className="md:col-span-5 space-y-2 max-w-[260px] mx-auto w-full md:max-w-none">
                  <div
                    onClick={() => setIsImageViewerOpen(true)}
                    className="relative rounded-[20px] sm:rounded-[22px] overflow-hidden bg-[#EAF3FC] dark:bg-[#223349] border border-[#D4E6F6] dark:border-[#344A63] shadow-sm cursor-pointer group aspect-[4/3] sm:aspect-[3/4]"
                    title="Nhấn để phóng to ảnh"
                  >
                    <img
                      src={character.avatar}
                      alt={character.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-[50%_18%] group-hover:scale-[1.03] transition-transform duration-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsImageViewerOpen(true)}
                    className="w-full py-1 text-[11px] font-serif text-[#5F809F] dark:text-[#98B4D0] hover:text-[#203850] dark:hover:text-white inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Phóng to chân dung</span>
                  </button>
                </div>

                {/* Right Character Dossier */}
                <div className="md:col-span-7 space-y-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-serif text-[#5F809F] dark:text-[#98B4D0]">
                      <span className="inline-flex items-center gap-1">
                        <Feather className="w-3.5 h-3.5 text-[#5380AD] dark:text-[#9AC0E3]" />
                        <span>Chấp bút: {creatorName}</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums text-[#D25E82] dark:text-rose-300 font-medium">
                        ♥ {character.votes || 0} tim yêu thích
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-[2.1rem] font-bold font-display text-[#203850] dark:text-white tracking-tight leading-tight">
                      {character.name}
                    </h2>

                    <div className="text-sm text-[#3E5872] dark:text-[#D5E4F3] leading-relaxed whitespace-pre-wrap break-words pt-1">
                      <AutoLinkText text={character.title} />
                    </div>
                  </div>

                  {/* Clean Inline Hashtags */}
                  {character.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-serif text-[#5380AD] dark:text-[#A9C9E8]">
                      {character.tags.map((tag) => (
                        <span key={tag}>#{tag}</span>
                      ))}
                    </div>
                  )}

                  {/* Yui's Soft Pastel Stationery Note */}
                  {character.notes && (
                    <div className="p-4 rounded-2xl bg-[#F5FAFF] dark:bg-[#1D2C3E] border border-[#DCEBFA] dark:border-[#31465F] space-y-1.5">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-serif font-bold text-[#466E96] dark:text-[#BFD7EE]">
                        <Snowflake className="w-3.5 h-3.5 text-[#5380AD] dark:text-[#9AC0E3]" />
                        <span>Lời nhắn gửi từ Yui</span>
                      </span>
                      <div className="text-xs sm:text-[13px] text-[#45607A] dark:text-[#C5D8EC] leading-relaxed whitespace-pre-wrap break-words">
                        <AutoLinkText text={character.notes} />
                      </div>
                    </div>
                  )}

                  {/* Primary Story Book CTA */}
                  {(hasStory || hasFirstMessage) && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setIsReaderOpen(true)}
                        className="group inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs sm:text-sm font-serif font-bold bg-[#5380AD] hover:bg-[#44709D] text-white transition-all cursor-pointer shadow-[0_8px_20px_-6px_rgba(74,116,162,0.42)]"
                      >
                        <BookOpen className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                        <span>Mở Trang Sách Đọc Truyện</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Clean Underlined Literary Tabs & Content */}
              <div className="border-t border-[#E6F0FA] dark:border-[#2B3F56]">
                <div className="px-5 sm:px-8 flex items-center gap-6 border-b border-[#E6F0FA] dark:border-[#2B3F56] bg-[#F8FBFF] dark:bg-[#1A2738] overflow-x-auto">
                  {hasStory && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('story')}
                      className={`py-3 text-xs sm:text-sm font-serif font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 -mb-[1px] ${
                        activeTab === 'story'
                          ? 'border-[#5380AD] text-[#203850] dark:text-white'
                          : 'border-transparent text-[#6A88A5] dark:text-[#98B4D0] hover:text-[#203850]'
                      }`}
                    >
                      <Feather className="w-3.5 h-3.5" />
                      <span>Cốt truyện</span>
                    </button>
                  )}

                  {hasFirstMessage && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('first')}
                      className={`py-3 text-xs sm:text-sm font-serif font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 -mb-[1px] ${
                        activeTab === 'first'
                          ? 'border-[#5380AD] text-[#203850] dark:text-white'
                          : 'border-transparent text-[#6A88A5] dark:text-[#98B4D0] hover:text-[#203850]'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Lời mở đầu</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveTab('comments')}
                    className={`py-3 text-xs sm:text-sm font-serif font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap tabular-nums border-b-2 -mb-[1px] ${
                      activeTab === 'comments'
                        ? 'border-[#5380AD] text-[#203850] dark:text-white'
                        : 'border-transparent text-[#6A88A5] dark:text-[#98B4D0] hover:text-[#203850]'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Cảm nhận ({commentsList.length})</span>
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-5 sm:p-8">
                  {activeTab === 'story' && hasStory && (
                    <div className="space-y-5 max-w-[66ch] mx-auto">
                      <p className="text-sm sm:text-[15.5px] font-serif leading-[1.94] text-[#263E57] dark:text-[#E2EDF7] whitespace-pre-wrap text-left">
                        {character.story}
                      </p>
                      <div className="pt-4 border-t border-dashed border-[#DDEAF7] dark:border-[#2C3F56] flex justify-end">
                        <button
                          type="button"
                          onClick={() => setIsReaderOpen(true)}
                          className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-[#5380AD] dark:text-[#9AC0E3] hover:underline cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Đọc toàn màn hình trong trang sách →</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'first' && hasFirstMessage && (
                    <div className="max-w-[66ch] mx-auto p-5 sm:p-7 rounded-2xl bg-[#F6FAFF] dark:bg-[#1C2A3C] border border-dashed border-[#C7DEF3] dark:border-[#364F6C] space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-serif text-[#5F809F] dark:text-[#9AC0E3] pb-2 border-b border-[#E1ECF7] dark:border-[#2E4259]">
                        <span className="font-semibold">✉ Thư mở đầu cuộc gặp gỡ</span>
                        <span className="text-[#D48BA2]">୨୧ ❄ ୨୧</span>
                      </div>
                      <p className="text-sm sm:text-[15.5px] font-serif leading-[1.94] text-[#263E57] dark:text-[#E2EDF7] whitespace-pre-wrap text-left italic">
                        {character.firstMessage}
                      </p>
                    </div>
                  )}

                  {activeTab === 'comments' && (
                    <div className="space-y-5 max-w-2xl mx-auto">
                      <form onSubmit={handleCommentSubmit} className="space-y-2.5">
                        <input
                          type="text"
                          value={authorName || ''}
                          onChange={(e) => setAuthorName(e.target.value)}
                          placeholder="Tên của bạn (Mặc định: Khách)"
                          className="w-full sm:w-64 px-3.5 py-2 bg-white dark:bg-[#1E2B3D] rounded-xl border border-[#D4E6F6] dark:border-[#32465F] text-xs text-[#203850] dark:text-[#E5EFF9] focus:outline-none focus:border-[#5380AD]"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            required
                            value={commentText || ''}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Viết đôi dòng cảm nhận gửi đến nhân vật..."
                            className="flex-1 px-3.5 py-2.5 bg-white dark:bg-[#1E2B3D] rounded-xl border border-[#D4E6F6] dark:border-[#32465F] text-xs text-[#203850] dark:text-[#E5EFF9] focus:outline-none focus:border-[#5380AD]"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2.5 bg-[#5380AD] hover:bg-[#44709D] text-white rounded-xl transition-colors shrink-0 cursor-pointer inline-flex items-center gap-1.5 text-xs font-serif font-semibold"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Gửi</span>
                          </button>
                        </div>
                      </form>

                      <div className="space-y-2.5">
                        {commentsList.length === 0 ? (
                          <div className="py-8 text-center text-[#6B8BA8] dark:text-[#98B4D0] text-xs font-serif">
                            Chưa có bình luận nào. Hãy để lại đôi dòng cảm nhận nhé ❄
                          </div>
                        ) : (
                          commentsList.map((cmt) => (
                            <div
                              key={cmt.id}
                              className="p-4 rounded-2xl bg-white dark:bg-[#1C2A3C] border border-[#DCEBFA] dark:border-[#30445C] flex items-start justify-between gap-3"
                            >
                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="font-bold text-[#203850] dark:text-white font-serif">
                                    {cmt.author}
                                  </span>
                                  <span aria-hidden="true" className="text-[#8CA6BF]">·</span>
                                  <span className="text-[11px] text-[#6B8BA8] dark:text-[#98B4D0]">
                                    {cmt.createdAt}
                                  </span>
                                </div>
                                <p className="text-xs sm:text-[13px] text-[#3B556E] dark:text-[#D5E4F3] break-words whitespace-pre-wrap leading-relaxed">
                                  {cmt.content}
                                </p>
                              </div>

                              <button
                                onClick={() => onDeleteComment(character.id, cmt.id)}
                                className="p-1.5 text-[#8CA6BF] hover:text-rose-500 rounded-lg transition-colors shrink-0 cursor-pointer"
                                title="Xóa bình luận"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Action Strip */}
            <div className="px-5 sm:px-7 py-3.5 border-t border-[#E3EFFA] dark:border-[#2C3F56] bg-[#F5FAFF] dark:bg-[#1C2A3C] flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleVote}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer font-serif tabular-nums ${
                    justVoted
                      ? 'bg-rose-400 text-white'
                      : 'bg-[#FFF3F6] dark:bg-rose-950/35 text-[#D25E82] dark:text-rose-300 border border-[#F3D2DC] dark:border-rose-800/40 hover:bg-[#FFE9EF]'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${justVoted ? 'fill-current' : 'fill-rose-400/50'}`} />
                  <span>Thả tim ({character.votes || 0})</span>
                </button>

                {onToggleFavorite && (
                  <button
                    onClick={() => onToggleFavorite(character.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer font-serif ${
                      isFavorite || character.isFavorite
                        ? 'bg-white dark:bg-[#25374D] text-[#375A7D] dark:text-[#E5EFF9] border border-[#9CC0E2]'
                        : 'bg-white dark:bg-[#1E2B3D] text-[#5E7C99] dark:text-[#A4C0DA] hover:bg-[#F3F8FD] border border-[#D4E6F6] dark:border-[#344A63]'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${isFavorite || character.isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
                    <span>{isFavorite || character.isFavorite ? 'Đã lưu' : 'Yêu thích'}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                <a
                  href={character.chatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#5380AD] hover:bg-[#44709D] text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer font-serif whitespace-nowrap shadow-xs"
                >
                  <span>{character.chatUrlLabel || 'Tiến tới Ggai'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {character.chatUrl2 && (
                  <a
                    href={character.chatUrl2}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E2B3D] text-[#375A7D] dark:text-[#E5EFF9] hover:bg-[#F3F8FD] border border-[#D4E6F6] dark:border-[#344A63] font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer font-serif whitespace-nowrap"
                  >
                    <span>{character.chatUrl2Label || 'Link 2'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      <ImageViewerModal
        isOpen={isImageViewerOpen}
        images={[character.avatar]}
        onClose={() => setIsImageViewerOpen(false)}
        characterName={character.name}
      />

      <StoryReaderModal
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
        character={character}
        onVote={onVote}
        isBookmarked={isBookmarked}
        bookmarkData={bookmarkData}
        onToggleBookmark={onToggleBookmark}
        onUpdateBookmarkStyle={onUpdateBookmarkStyle}
        onUpdateReadingProgress={onUpdateReadingProgress}
      />
    </>
  );
};

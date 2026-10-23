import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Heart, Star, User, MessageSquare, Send, Trash2, FileText, ZoomIn, BookOpen } from 'lucide-react';
import { Character, CharacterComment, CharacterBookmark, BookmarkPaperStyle, BookmarkTailDecor } from '../types';
import { ImageViewerModal } from './ImageViewerModal';
import { StoryReaderModal } from './StoryReaderModal';
import { PaperBookmark } from './PaperBookmark';
import { triggerHeartConfetti } from '../utils/confetti';
import { AutoLinkText } from './AutoLinkText';

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

  useEffect(() => {
    if (initialOpenStory) {
      setIsReaderOpen(true);
    }
  }, [initialOpenStory]);

  if (!character) return null;

  const handleVote = () => {
    triggerHeartConfetti(0.5, 0.7);
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

  const commentsList: CharacterComment[] = character.comments || [];

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#081B22]/70 backdrop-blur-md transition-all duration-300">
          {/* 🌊 11. Modal Opening: Deep Descent (Lặn sâu xuống biển) animation */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 15 }}
            transition={{
              type: 'spring',
              damping: 24,
              stiffness: 200,
            }}
            className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white/95 dark:bg-[#102F38]/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#65C5CE]/40 dark:border-[#78DCE0]/25 text-[#29464C] dark:text-[#DDF5F6] overflow-hidden"
          >
            {/* Ambient Caustic Water Shimmer behind header */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-80 h-40 bg-radial from-[#65C5CE]/25 dark:from-[#57C8D1]/20 to-transparent pointer-events-none rounded-full blur-2xl" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-[#E5F5F7] dark:bg-[#0D2730] text-[#6B858A] dark:text-[#8FB6BC] hover:text-[#29464C] dark:hover:text-white transition-colors btn-ocean cursor-pointer"
              title="Đóng hồ sơ"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Paper Bookmark Tab on top-right edge */}
            {onToggleBookmark && (
              <PaperBookmark
                isBookmarked={isBookmarked}
                bookmarkData={bookmarkData}
                onToggleBookmark={(style, dec) => onToggleBookmark(character.id, style, dec)}
                onUpdateStyle={(style, dec) => onUpdateBookmarkStyle?.(character.id, style, dec)}
              />
            )}

            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
              {/* Character Main Header Info */}
              <div className="p-6 text-center space-y-4">
                {/* Avatar with subtle glow ring and floating bubbles */}
                <div
                  onClick={() => setIsImageViewerOpen(true)}
                  className="relative group inline-block cursor-pointer mx-auto"
                  title="Nhấn để phóng to ảnh toàn màn hình ✨"
                >
                  <div className="p-1 rounded-3xl bg-gradient-to-tr from-[#65C5CE]/50 via-[#3FAAB7]/30 to-[#78DCE0]/50 shadow-[0_0_20px_rgba(101,197,206,0.35)] dark:shadow-[0_0_25px_rgba(107,221,229,0.3)]">
                    <img
                      src={character.avatar}
                      alt={character.name}
                      className="w-28 h-28 mx-auto rounded-[22px] object-cover border-2 border-white dark:border-[#102F38] shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <ZoomIn className="w-6 h-6" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-[#29464C] dark:text-[#DDF5F6] flex items-center justify-center gap-1.5 font-serif">
                    <span>{character.name}</span>
                    <span className="text-xs text-[#3FAAB7] dark:text-[#78DCE0]">✦</span>
                  </h2>
                  <p className="text-xs text-[#3FAAB7] dark:text-[#78DCE0] font-semibold flex items-center justify-center gap-1 font-serif">
                    <User className="w-3.5 h-3.5" />
                    <span>Tác giả: {character.creator || 'Admin'}</span>
                  </p>
                </div>

                <div className="text-xs text-[#6B858A] dark:text-[#8FB6BC] leading-relaxed max-w-sm mx-auto whitespace-pre-wrap break-words">
                  <AutoLinkText text={character.title} />
                </div>

                {/* Character Notes */}
                {character.notes && (
                  <div className="p-3.5 rounded-2xl bg-[#E5F5F7]/80 dark:bg-[#0D2730]/80 border border-[#65C5CE]/40 dark:border-[#78DCE0]/25 text-left space-y-1">
                    <div className="text-[11px] font-bold text-[#247C8C] dark:text-[#78DCE0] uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Ghi chú từ tác giả</span>
                    </div>
                    <div className="text-xs text-[#29464C] dark:text-[#DDF5F6] leading-relaxed whitespace-pre-wrap break-words">
                      <AutoLinkText text={character.notes} linkClassName="text-[#247C8C] dark:text-[#78DCE0] underline font-medium hover:opacity-90 inline-flex items-center gap-0.5 break-all transition-colors" />
                    </div>
                  </div>
                )}

                {/* STORY & FIRST MESSAGE Section */}
                {(character.story || character.firstMessage) && (
                  <div className="p-4 rounded-3xl bg-[#E5F5F7]/60 dark:bg-[#0D2730]/60 border border-[#65C5CE]/30 dark:border-[#143943] text-left space-y-3.5 shadow-xs">
                    {/* Section Title & Reader Mode Toggle */}
                    <div className="flex items-center justify-between pb-2 border-b border-[#65C5CE]/20 dark:border-[#143943]">
                      <span className="text-xs font-bold font-serif text-[#247C8C] dark:text-[#78DCE0] flex items-center gap-1">
                        <span className="text-[11px]">{character.decorativeItemSet || '〜 ✦ 〜'}</span>
                        <span>TRUYỆN & LỜI MỞ ĐẦU</span>
                      </span>

                      <button
                        onClick={() => setIsReaderOpen(true)}
                        className="px-3 py-1 rounded-full text-xs font-bold bg-[#3FAAB7] hover:bg-[#65C5CE] text-white shadow-xs flex items-center gap-1.5 btn-ocean cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Chế độ đọc</span>
                      </button>
                    </div>

                    {/* STORY Preview */}
                    {character.story && (
                      <div className="space-y-1.5">
                        <div className="text-center">
                          <span className="text-[11px] font-bold font-serif uppercase tracking-widest text-[#247C8C] dark:text-[#78DCE0]">
                            STORY
                          </span>
                          <div className="text-[10px] text-[#65C5CE] font-serif">
                            ──────── ✦ ────────
                          </div>
                        </div>
                        <p className="text-xs font-serif leading-relaxed text-[#29464C] dark:text-[#DDF5F6] line-clamp-5 text-justify italic opacity-90">
                          {character.story}
                        </p>
                      </div>
                    )}

                    {/* FIRST MESSAGE Preview */}
                    {character.firstMessage && (
                      <div className="pt-2 border-t border-[#65C5CE]/20 dark:border-[#143943] space-y-1.5">
                        <div className="text-center">
                          <span className="text-[11px] font-bold font-serif uppercase tracking-widest text-[#247C8C] dark:text-[#78DCE0]">
                            FIRST MESSAGE
                          </span>
                          <div className="text-[10px] text-[#65C5CE] font-serif">
                            ──────── ✦ ────────
                          </div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#102F38]/90 border border-[#65C5CE]/30 dark:border-[#78DCE0]/20 space-y-1 shadow-xs">
                          <p className="text-[10px] font-serif italic text-[#3FAAB7] dark:text-[#78DCE0] font-semibold text-center">
                            “Câu chuyện bắt đầu từ đây...”
                          </p>
                          <p className="text-xs font-serif leading-relaxed text-[#29464C] dark:text-[#DDF5F6] line-clamp-4 text-justify opacity-90">
                            {character.firstMessage}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tag Pills */}
                <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                  {character.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E5F5F7] dark:bg-[#0D2730] text-[#247C8C] dark:text-[#78DCE0] border border-[#65C5CE]/30 dark:border-[#78DCE0]/20"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Comments Section */}
              <div className="px-6 py-4 border-t border-[#65C5CE]/20 dark:border-[#143943] space-y-4 bg-[#E5F5F7]/40 dark:bg-[#0D2730]/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#29464C] dark:text-[#DDF5F6] flex items-center gap-1.5 font-serif">
                    <MessageSquare className="w-4 h-4 text-[#3FAAB7] dark:text-[#78DCE0]" />
                    <span>Bình luận ({commentsList.length})</span>
                  </h3>
                </div>

                {/* Comment Input Form */}
                <form onSubmit={handleCommentSubmit} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={authorName || ''}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Tên của bạn (Mặc định: Khách)"
                      className="w-1/2 px-3 py-1.5 bg-white dark:bg-[#102F38] rounded-xl border border-[#65C5CE]/40 dark:border-[#78DCE0]/25 text-xs text-[#29464C] dark:text-[#DDF5F6] focus:outline-none focus:border-[#3FAAB7]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={commentText || ''}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Viết bình luận của bạn..."
                      className="flex-1 px-3.5 py-2 bg-white dark:bg-[#102F38] rounded-xl border border-[#65C5CE]/40 dark:border-[#78DCE0]/25 text-xs text-[#29464C] dark:text-[#DDF5F6] focus:outline-none focus:border-[#3FAAB7]"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-[#3FAAB7] hover:bg-[#247C8C] text-white rounded-xl shadow-md transition-colors shrink-0 cursor-pointer"
                      title="Gửi bình luận"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {/* Comment List */}
                <div className="space-y-2.5 pt-1">
                  {commentsList.length === 0 ? (
                    <div className="py-6 text-center text-[#6B858A] dark:text-[#8FB6BC] font-medium text-xs">
                      Ơ, không có rồi.
                    </div>
                  ) : (
                    commentsList.map((cmt) => (
                      <div
                        key={cmt.id}
                        className="p-3 rounded-2xl bg-white dark:bg-[#102F38] border border-[#65C5CE]/30 dark:border-[#78DCE0]/20 flex items-start justify-between gap-2 shadow-xs"
                      >
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#29464C] dark:text-[#DDF5F6] truncate font-serif">
                              {cmt.author}
                            </span>
                            <span className="text-[10px] text-[#6B858A] dark:text-[#8FB6BC]">
                              {cmt.createdAt}
                            </span>
                          </div>
                          <p className="text-xs text-[#29464C] dark:text-[#DDF5F6] break-words whitespace-pre-wrap leading-relaxed">
                            {cmt.content}
                          </p>
                        </div>

                        {/* Creator Delete Comment Button */}
                        <button
                          onClick={() => onDeleteComment(character.id, cmt.id)}
                          className="p-1 text-[#6B858A] hover:text-red-500 hover:bg-red-50 dark:hover:bg-[#0D2730] rounded-lg transition-colors shrink-0 cursor-pointer"
                          title="Xóa bình luận"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-[#65C5CE]/20 dark:border-[#143943] bg-[#E5F5F7]/80 dark:bg-[#081B22]/80 flex items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-2">
                {/* Heart / Vote Button */}
                <button
                  onClick={handleVote}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all btn-ocean cursor-pointer ${
                    justVoted
                      ? 'bg-[#3FAAB7] text-white scale-105 shadow-xs'
                      : 'bg-[#DDF1F3] dark:bg-[#143943] text-[#247C8C] dark:text-[#78DCE0] hover:bg-[#65C5CE]/30 border border-[#65C5CE]/40 dark:border-[#78DCE0]/30'
                  }`}
                  title="Thả tim cho nhân vật"
                >
                  <Heart className={`w-4 h-4 ${justVoted ? 'fill-current animate-ping' : 'fill-[#3FAAB7] text-[#3FAAB7] dark:fill-[#78DCE0] dark:text-[#78DCE0]'}`} />
                  <span>Thả tim ({character.votes})</span>
                </button>

                {/* Star / Save to Favorites Button */}
                {onToggleFavorite && (
                  <button
                    onClick={() => onToggleFavorite(character.id)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all btn-ocean cursor-pointer ${
                      isFavorite || character.isFavorite
                        ? 'bg-[#DDF1F3] dark:bg-[#143943] text-[#247C8C] dark:text-[#78DCE0] border border-[#65C5CE] dark:border-[#78DCE0]/60 shadow-xs'
                        : 'bg-white dark:bg-[#102F38] text-[#6B858A] dark:text-[#8FB6BC] hover:bg-[#E5F5F7] hover:text-[#247C8C] border border-[#65C5CE]/30 dark:border-[#143943]'
                    }`}
                    title={isFavorite || character.isFavorite ? 'Đã lưu vào mục Yêu thích ⭐ (Bấm để bỏ lưu)' : 'Lưu vào mục Yêu thích ⭐'}
                  >
                    <Star className={`w-4 h-4 ${isFavorite || character.isFavorite ? 'fill-[#3FAAB7] text-[#247C8C] dark:fill-[#78DCE0] dark:text-[#78DCE0]' : 'text-[#6B858A]'}`} />
                    <span>{isFavorite || character.isFavorite ? 'Đã lưu ⭐' : 'Lưu ⭐'}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                <a
                  href={character.chatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 sm:px-5 py-2 rounded-2xl bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#247C8C]/25 flex items-center gap-1.5 sm:gap-2 transition-all transform hover:scale-105 active:scale-95 cursor-pointer font-serif"
                >
                  <span>{character.chatUrlLabel || 'Tiến tới Ggai'}</span>
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </a>

                {character.chatUrl2 && (
                  <a
                    href={character.chatUrl2}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 sm:px-4 py-2 rounded-2xl bg-white/90 dark:bg-[#102F38] text-[#247C8C] dark:text-[#78DCE0] hover:bg-[#E5F5F7] dark:hover:bg-[#143943] border border-[#65C5CE]/50 dark:border-[#78DCE0]/40 font-bold text-xs sm:text-sm shadow-md flex items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer font-serif"
                  >
                    <span>{character.chatUrl2Label || 'Link 2'}</span>
                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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

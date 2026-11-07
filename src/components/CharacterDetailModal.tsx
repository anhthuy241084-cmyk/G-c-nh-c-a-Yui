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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#172536]/75 backdrop-blur-md transition-all duration-300">
          {/* ❄️ Modal Opening: Winter Memory Box Card Animation */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 12 }}
            transition={{
              type: 'spring',
              damping: 24,
              stiffness: 220,
            }}
            className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-[#F7FAFD]/98 dark:bg-[#172536]/98 backdrop-blur-2xl rounded-3xl shadow-2xl border border-[#DCE7EF] dark:border-[#43576B] text-[#526B80] dark:text-[#E5EDF5] overflow-hidden"
          >
            {/* Ambient Winter Glow behind header */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-80 h-40 bg-radial from-[#D5E4EF]/50 dark:from-[#354A60]/30 to-transparent pointer-events-none rounded-full blur-2xl" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-[#E8F1F8] dark:bg-[#202F42] text-[#91A9BC] dark:text-[#A9BDCE] hover:text-[#526B80] dark:hover:text-white border border-[#DCE7EF] dark:border-[#43576B] transition-colors cursor-pointer shadow-xs active:scale-95"
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
                {/* Avatar with subtle glow ring and winter frame */}
                <div
                  onClick={() => setIsImageViewerOpen(true)}
                  className="relative group inline-block cursor-pointer mx-auto"
                  title="Nhấn để phóng to ảnh toàn màn hình ✨"
                >
                  <div className="p-1 rounded-3xl bg-gradient-to-tr from-[#D5E4EF] via-[#E8F1F8] to-[#91A9BC] dark:from-[#354A60] dark:via-[#202F42] dark:to-[#A9BDCE] shadow-[0_0_20px_rgba(145,169,188,0.35)] dark:shadow-[0_0_25px_rgba(169,189,206,0.2)]">
                    <img
                      src={character.avatar}
                      alt={character.name}
                      className="w-28 h-28 mx-auto rounded-[22px] object-cover border-2 border-white dark:border-[#202F42] shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/25 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <ZoomIn className="w-6 h-6" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-[#526B80] dark:text-[#E5EDF5] flex items-center justify-center gap-1.5 font-serif">
                    <span>{character.name}</span>
                    <span className="text-xs text-[#91A9BC] dark:text-[#A9BDCE]">❄</span>
                  </h2>
                  <p className="text-xs text-[#91A9BC] dark:text-[#A9BDCE] font-semibold flex items-center justify-center gap-1 font-serif">
                    <User className="w-3.5 h-3.5" />
                    <span>Tác giả: {character.creator || 'Admin'}</span>
                  </p>
                </div>

                <div className="text-xs text-[#526B80]/90 dark:text-[#E5EDF5]/90 leading-relaxed max-w-sm mx-auto whitespace-pre-wrap break-words">
                  <AutoLinkText text={character.title} />
                </div>

                {/* Character Notes */}
                {character.notes && (
                  <div className="p-3.5 rounded-2xl bg-[#E8F1F8]/80 dark:bg-[#202F42]/80 border border-[#DCE7EF] dark:border-[#43576B] text-left space-y-1">
                    <div className="text-[11px] font-bold text-[#526B80] dark:text-[#E5EDF5] uppercase tracking-wider flex items-center gap-1.5 font-serif">
                      <FileText className="w-3.5 h-3.5 text-[#91A9BC]" />
                      <span>Ghi chú từ tác giả</span>
                    </div>
                    <div className="text-xs text-[#526B80]/90 dark:text-[#E5EDF5]/90 leading-relaxed whitespace-pre-wrap break-words">
                      <AutoLinkText text={character.notes} linkClassName="text-[#91A9BC] dark:text-[#A9BDCE] underline font-medium hover:opacity-90 inline-flex items-center gap-0.5 break-all transition-colors" />
                    </div>
                  </div>
                )}

                {/* STORY & FIRST MESSAGE Section */}
                {(character.story || character.firstMessage) && (
                  <div className="p-4 rounded-3xl bg-[#E8F1F8]/60 dark:bg-[#202F42]/60 border border-[#DCE7EF] dark:border-[#43576B] text-left space-y-3.5 shadow-xs">
                    {/* Section Title & Reader Mode Toggle */}
                    <div className="flex items-center justify-between pb-2 border-b border-[#DCE7EF] dark:border-[#43576B]">
                      <span className="text-xs font-bold font-serif text-[#526B80] dark:text-[#E5EDF5] flex items-center gap-1">
                        <span className="text-[11px] text-[#91A9BC]">❄</span>
                        <span>TRUYỆN &amp; LỜI MỞ ĐẦU</span>
                      </span>

                      <button
                        onClick={() => setIsReaderOpen(true)}
                        className="px-3 py-1 rounded-full text-xs font-bold btn-winter-primary shadow-xs flex items-center gap-1.5 cursor-pointer font-serif"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Chế độ đọc</span>
                      </button>
                    </div>

                    {/* STORY Preview */}
                    {character.story && (
                      <div className="space-y-1.5">
                        <div className="text-center">
                          <span className="text-[11px] font-bold font-serif uppercase tracking-widest text-[#91A9BC] dark:text-[#A9BDCE]">
                            STORY
                          </span>
                          <div className="text-[10px] text-[#91A9BC]/60 font-serif">
                            ──────── ❄ ────────
                          </div>
                        </div>
                        <p className="text-xs font-serif leading-relaxed text-[#526B80] dark:text-[#E5EDF5] line-clamp-5 text-justify italic opacity-95">
                          {character.story}
                        </p>
                      </div>
                    )}

                    {/* FIRST MESSAGE Preview */}
                    {character.firstMessage && (
                      <div className="pt-2 border-t border-[#DCE7EF] dark:border-[#43576B] space-y-1.5">
                        <div className="text-center">
                          <span className="text-[11px] font-bold font-serif uppercase tracking-widest text-[#91A9BC] dark:text-[#A9BDCE]">
                            FIRST MESSAGE
                          </span>
                          <div className="text-[10px] text-[#91A9BC]/60 font-serif">
                            ──────── ❄ ────────
                          </div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#172536]/90 border border-[#DCE7EF] dark:border-[#43576B] space-y-1 shadow-xs">
                          <p className="text-[10px] font-serif italic text-[#91A9BC] dark:text-[#A9BDCE] font-semibold text-center">
                            &ldquo;Câu chuyện bắt đầu từ đây...&rdquo;
                          </p>
                          <p className="text-xs font-serif leading-relaxed text-[#526B80] dark:text-[#E5EDF5] line-clamp-4 text-justify opacity-95">
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
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F1F8] dark:bg-[#202F42] text-[#526B80] dark:text-[#E5EDF5] border border-[#DCE7EF] dark:border-[#43576B]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Comments Section */}
              <div className="px-6 py-4 border-t border-[#DCE7EF] dark:border-[#43576B] space-y-4 bg-[#E8F1F8]/40 dark:bg-[#202F42]/40">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#526B80] dark:text-[#E5EDF5] flex items-center gap-1.5 font-serif">
                    <MessageSquare className="w-4 h-4 text-[#91A9BC]" />
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
                      className="w-1/2 px-3 py-1.5 bg-white dark:bg-[#172536] rounded-xl border border-[#DCE7EF] dark:border-[#43576B] text-xs text-[#526B80] dark:text-[#E5EDF5] focus:outline-none focus:border-[#91A9BC]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={commentText || ''}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Viết bình luận của bạn..."
                      className="flex-1 px-3.5 py-2 bg-white dark:bg-[#172536] rounded-xl border border-[#DCE7EF] dark:border-[#43576B] text-xs text-[#526B80] dark:text-[#E5EDF5] focus:outline-none focus:border-[#91A9BC]"
                    />
                    <button
                      type="submit"
                      className="p-2 btn-winter-primary rounded-xl shadow-md transition-colors shrink-0 cursor-pointer"
                      title="Gửi bình luận"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {/* Comment List */}
                <div className="space-y-2.5 pt-1">
                  {commentsList.length === 0 ? (
                    <div className="py-6 text-center text-[#91A9BC] dark:text-[#A9BDCE] font-medium text-xs font-serif">
                      Chưa có bình luận nào. Hãy là người đầu tiên để lại lời nhắn nhé ❄
                    </div>
                  ) : (
                    commentsList.map((cmt) => (
                      <div
                        key={cmt.id}
                        className="p-3 rounded-2xl bg-white dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B] flex items-start justify-between gap-2 shadow-xs"
                      >
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#526B80] dark:text-[#E5EDF5] truncate font-serif">
                              {cmt.author}
                            </span>
                            <span className="text-[10px] text-[#91A9BC] dark:text-[#A9BDCE]">
                              {cmt.createdAt}
                            </span>
                          </div>
                          <p className="text-xs text-[#526B80] dark:text-[#E5EDF5] break-words whitespace-pre-wrap leading-relaxed">
                            {cmt.content}
                          </p>
                        </div>

                        {/* Delete Comment Button */}
                        <button
                          onClick={() => onDeleteComment(character.id, cmt.id)}
                          className="p-1 text-[#91A9BC] hover:text-red-500 hover:bg-red-50 dark:hover:bg-[#202F42] rounded-lg transition-colors shrink-0 cursor-pointer"
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
            <div className="p-4 border-t border-[#DCE7EF] dark:border-[#43576B] bg-[#E8F1F8]/80 dark:bg-[#172536]/90 flex items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-2">
                {/* Heart / Vote Button */}
                <button
                  onClick={handleVote}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer font-serif ${
                    justVoted
                      ? 'bg-[#91A9BC] text-white scale-105 shadow-xs'
                      : 'bg-[#E8F1F8] dark:bg-[#202F42] text-[#526B80] dark:text-[#E5EDF5] hover:bg-[#D5E4EF] dark:hover:bg-[#354A60] border border-[#DCE7EF] dark:border-[#43576B]'
                  }`}
                  title="Thả tim cho nhân vật"
                >
                  <Heart className={`w-4 h-4 ${justVoted ? 'fill-current animate-ping' : 'fill-[#91A9BC] text-[#91A9BC] dark:fill-[#A9BDCE] dark:text-[#A9BDCE]'}`} />
                  <span>Thả tim ({character.votes})</span>
                </button>

                {/* Star / Save to Favorites Button */}
                {onToggleFavorite && (
                  <button
                    onClick={() => onToggleFavorite(character.id)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer font-serif ${
                      isFavorite || character.isFavorite
                        ? 'bg-[#E8F1F8] dark:bg-[#202F42] text-[#526B80] dark:text-[#E5EDF5] border border-[#91A9BC] dark:border-[#A9BDCE] shadow-xs'
                        : 'bg-white dark:bg-[#172536] text-[#91A9BC] dark:text-[#A9BDCE] hover:bg-[#E8F1F8] hover:text-[#526B80] border border-[#DCE7EF] dark:border-[#43576B]'
                    }`}
                    title={isFavorite || character.isFavorite ? 'Đã lưu vào mục Yêu thích ⭐ (Bấm để bỏ lưu)' : 'Lưu vào mục Yêu thích ⭐'}
                  >
                    <Star className={`w-4 h-4 ${isFavorite || character.isFavorite ? 'fill-[#91A9BC] text-[#91A9BC] dark:fill-[#A9BDCE] dark:text-[#A9BDCE]' : 'text-[#91A9BC]'}`} />
                    <span>{isFavorite || character.isFavorite ? 'Đã lưu ⭐' : 'Lưu ⭐'}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                <a
                  href={character.chatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 sm:px-5 py-2 rounded-2xl bg-gradient-to-r from-[#91A9BC] to-[#6E899E] hover:from-[#6E899E] hover:to-[#526B80] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#91A9BC]/25 flex items-center gap-1.5 sm:gap-2 transition-all transform hover:scale-105 active:scale-95 cursor-pointer font-serif"
                >
                  <span>{character.chatUrlLabel || 'Tiến tới Ggai'}</span>
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </a>

                {character.chatUrl2 && (
                  <a
                    href={character.chatUrl2}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 sm:px-4 py-2 rounded-2xl bg-white/90 dark:bg-[#202F42] text-[#526B80] dark:text-[#E5EDF5] hover:bg-[#E8F1F8] dark:hover:bg-[#354A60] border border-[#DCE7EF] dark:border-[#43576B] font-bold text-xs sm:text-sm shadow-xs flex items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer font-serif"
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

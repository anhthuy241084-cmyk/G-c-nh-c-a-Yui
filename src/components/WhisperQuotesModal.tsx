import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Heart,
  MessageCircle,
  Send,
  Trash2,
  Edit2,
  Upload,
  EyeOff,
  Lock,
  Copy,
  Check,
  ZoomIn,
  CornerDownRight,
  Feather,
  Quote,
  Sparkles,
} from 'lucide-react';
import { UserProfile, WhisperCategory, WhisperComment, WhisperPost } from '../types';
import { compressImageFile } from '../utils/imageCompressor';
import { triggerSfx } from '../utils/sfx';
import { triggerHeartConfetti } from '../utils/confetti';
import {
  saveWhisperPost,
  deleteWhisperPost,
  likeWhisperPost,
  addCommentToWhisperPost,
  deleteCommentFromWhisperPost,
} from '../services/whisperService';

interface WhisperQuotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: WhisperPost[];
  userProfile?: UserProfile;
  isAdmin: boolean;
  onRequireAdmin: () => void;
  isSfxOn?: boolean;
  sfxVolume?: number;
  onToast?: (msg: string) => void;
}

const WHISPER_CATEGORY_LABELS: Record<WhisperCategory, string> = {
  quote: 'Quote ngẫu hứng',
  excerpt: 'Đoạn viết ngắn',
  snapshot: 'Góc ảnh & Tâm sự',
};

function formatDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export const WhisperQuotesModal: React.FC<WhisperQuotesModalProps> = ({
  isOpen,
  onClose,
  posts,
  userProfile,
  isAdmin,
  onRequireAdmin,
  isSfxOn = true,
  sfxVolume = 0.5,
  onToast,
}) => {
  const [deviceToken] = useState<string>(() => {
    try {
      let id = localStorage.getItem('yui_device_author_id');
      if (!id) {
        id = 'dev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('yui_device_author_id', id);
      }
      return id;
    } catch {
      return 'dev_default';
    }
  });

  const [likedIds, setLikedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('yui_liked_whisper_posts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [filterCategory, setFilterCategory] = useState<'all' | WhisperCategory>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

  // Admin Composer State
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<WhisperPost | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<WhisperCategory>('quote');
  const [formMood, setFormMood] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formAuthor, setFormAuthor] = useState('Yui');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comment State per post
  const [openCommentsMap, setOpenCommentsMap] = useState<Record<string, boolean>>({});
  const [commentTextMap, setCommentTextMap] = useState<Record<string, string>>({});
  const [commentAuthorMap, setCommentAuthorMap] = useState<Record<string, string>>({});
  const [commentAnonMap, setCommentAnonMap] = useState<Record<string, boolean>>({});
  const [commentReplyToMap, setCommentReplyToMap] = useState<Record<string, string | undefined>>({});
  const [submittingCommentId, setSubmittingCommentId] = useState<string | null>(null);

  const [postToDelete, setPostToDelete] = useState<WhisperPost | null>(null);

  const filteredPosts = useMemo(() => {
    if (filterCategory === 'all') return posts;
    return posts.filter((p) => p.category === filterCategory);
  }, [posts, filterCategory]);

  const resetComposer = () => {
    setEditingPost(null);
    setFormTitle('');
    setFormCategory('quote');
    setFormMood('');
    setFormContent('');
    setFormImageUrl('');
    setFormAuthor('Yui');
  };

  const handleOpenCreate = () => {
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }
    resetComposer();
    setIsComposerOpen((v) => !v);
  };

  const handleStartEdit = (post: WhisperPost) => {
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }
    setEditingPost(post);
    setFormTitle(post.title);
    setFormCategory(post.category);
    setFormMood(post.subtitleOrMood || '');
    setFormContent(post.content);
    setFormImageUrl(post.imageUrl || '');
    setFormAuthor(post.author || 'Yui');
    setIsComposerOpen(true);
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingImage(true);
      let compressed = await compressImageFile(file, 1024, 1024, 0.85);
      if (compressed.length > 680000) {
        compressed = await compressImageFile(file, 760, 760, 0.72);
      }
      if (compressed.length > 850000) {
        onToast?.('⚠️ Ảnh vượt giới hạn Cloud, vui lòng chọn ảnh nhẹ hơn hoặc dùng URL.');
        return;
      }
      setFormImageUrl(compressed);
      onToast?.('✨ Đã tải ảnh lên thành công!');
    } catch (err) {
      console.warn('Whisper image compression failed:', err);
      onToast?.('⚠️ Không thể xử lý ảnh này.');
    } finally {
      setIsUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }
    if (!formTitle.trim() || !formContent.trim()) {
      onToast?.('⚠️ Vui lòng nhập Tiêu đề và Nội dung quote / đoạn viết!');
      return;
    }

    const now = new Date().toISOString();
    const payload: WhisperPost = editingPost
      ? {
          ...editingPost,
          title: formTitle.trim(),
          category: formCategory,
          subtitleOrMood: formMood.trim(),
          content: formContent.trim(),
          imageUrl: formImageUrl.trim(),
          author: formAuthor.trim() || 'Yui',
          updatedAt: now,
        }
      : {
          id: `whisp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: formTitle.trim(),
          category: formCategory,
          subtitleOrMood: formMood.trim(),
          content: formContent.trim(),
          imageUrl: formImageUrl.trim(),
          author: formAuthor.trim() || 'Yui',
          likes: 0,
          comments: [],
          createdAt: now,
        };

    try {
      setIsSaving(true);
      await saveWhisperPost(payload);
      if (isSfxOn) triggerSfx('sparkle', sfxVolume);
      resetComposer();
      setIsComposerOpen(false);
      onToast?.(editingPost ? '✨ Đã cập nhật bài viết!' : '❄️ Đã đăng lên Nhặt Cánh Tuyết Rơi!');
    } catch (err) {
      console.error('Failed to save WhisperPost:', err);
      onToast?.('⚠️ Không thể lưu bài lên Cloud lúc này.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (likedIds.includes(postId)) {
      onToast?.('Bạn đã thả tim bài này rồi ♡');
      return;
    }
    const updated = [...likedIds, postId];
    setLikedIds(updated);
    try {
      localStorage.setItem('yui_liked_whisper_posts', JSON.stringify(updated));
    } catch {}
    triggerHeartConfetti(0.5, 0.55);
    if (isSfxOn) triggerSfx('pop', sfxVolume);
    try {
      await likeWhisperPost(postId);
    } catch (err) {
      console.warn('Whisper like error:', err);
    }
  };

  const handleCopyContent = async (post: WhisperPost) => {
    try {
      await navigator.clipboard.writeText(`${post.title}\n\n${post.content}`);
      setCopiedId(post.id);
      setTimeout(() => setCopiedId((curr) => (curr === post.id ? null : curr)), 1800);
      onToast?.('📋 Đã sao chép đoạn viết!');
    } catch {
      onToast?.('⚠️ Không thể sao chép tự động trên trình duyệt này.');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent, post: WhisperPost) => {
    e.preventDefault();
    const content = (commentTextMap[post.id] || '').trim();
    if (!content) return;

    const isAnon = !!commentAnonMap[post.id];
    const rawAuthor =
      commentAuthorMap[post.id]?.trim() ||
      (userProfile?.name && userProfile.name !== 'Tên của bạn' ? userProfile.name : '') ||
      (() => {
        try {
          return localStorage.getItem('yui_last_author_name') || '';
        } catch {
          return '';
        }
      })();

    const finalAuthor = isAnon ? 'Ẩn danh' : rawAuthor || 'Khách ghé thăm';
    const replyToAuthor = commentReplyToMap[post.id];

    const newComment: WhisperComment = {
      id: `wc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      author: finalAuthor,
      isAnonymous: isAnon,
      content,
      ...(replyToAuthor ? { replyToAuthor } : {}),
      createdAt: new Date().toISOString(),
      creatorToken: deviceToken,
    };

    try {
      setSubmittingCommentId(post.id);
      await addCommentToWhisperPost(post.id, newComment);
      setCommentTextMap((prev) => ({ ...prev, [post.id]: '' }));
      setCommentReplyToMap((prev) => ({ ...prev, [post.id]: undefined }));
      setOpenCommentsMap((prev) => ({ ...prev, [post.id]: true }));
      if (isSfxOn) triggerSfx('pop', sfxVolume);
      onToast?.('💬 Đã gửi bình luận của bạn!');
    } catch (err) {
      console.error('Failed to comment on WhisperPost:', err);
      onToast?.('⚠️ Không thể gửi bình luận lúc này.');
    } finally {
      setSubmittingCommentId(null);
    }
  };

  const handleDeleteComment = async (postId: string, comment: WhisperComment) => {
    try {
      await deleteCommentFromWhisperPost(postId, comment);
      onToast?.('🗑️ Đã xóa bình luận.');
    } catch (err) {
      console.error('Failed to delete comment:', err);
      onToast?.('⚠️ Không thể xóa bình luận.');
    }
  };

  const handleConfirmDeletePost = async () => {
    if (!postToDelete || !isAdmin) return;
    const id = postToDelete.id;
    setPostToDelete(null);
    try {
      await deleteWhisperPost(id);
      onToast?.('🗑️ Đã gỡ bài viết.');
    } catch (err) {
      console.error('Failed to delete WhisperPost:', err);
      onToast?.('⚠️ Không thể gỡ bài lúc này.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-[#122033]/75 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-4xl max-h-[92dvh] flex flex-col bg-[#F7FAFE] dark:bg-[#162336] rounded-[26px] border border-[#CFE1F2] dark:border-[#39506B] shadow-2xl text-[#1D3550] dark:text-[#EAF2FB] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start sm:items-center justify-between gap-3 px-5 sm:px-7 py-4 sm:py-5 border-b border-[#DCE9F5] dark:border-[#314660] bg-white/80 dark:bg-[#1A293D]/85">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#EAF3FC] dark:bg-[#23374F] text-[#4E7AA5] dark:text-[#A6CBF0] flex items-center justify-center shrink-0">
                    <Feather className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold font-display tracking-tight text-[#16273B] dark:text-white truncate">
                    Nhặt Cánh Tuyết Rơi
                  </h2>
                </div>
                <p className="text-xs sm:text-[13px] font-serif text-[#5E7C99] dark:text-[#A4C0DA] leading-relaxed">
                  Góc quote ngẫu hứng, những đoạn viết rời &amp; khung ảnh riêng do Yui đăng tải · Mọi người đều có thể thả tim và bình luận bên dưới
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-[#64829E] hover:text-[#16273B] dark:hover:text-white hover:bg-[#EAF3FC] dark:hover:bg-[#243750] transition-colors cursor-pointer shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Đóng Nhặt Cánh Tuyết Rơi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Admin-only Trigger */}
            <div className="px-5 sm:px-7 py-3 border-b border-[#E3EEF8] dark:border-[#2C4058] bg-[#F1F7FD]/75 dark:bg-[#19283C]/75 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-1 p-1 bg-white dark:bg-[#203146] rounded-xl border border-[#DCE9F5] dark:border-[#364D68]">
                {(
                  [
                    { id: 'all', label: `Tất cả (${posts.length})` },
                    { id: 'quote', label: 'Quote ngẫu hứng' },
                    { id: 'excerpt', label: 'Đoạn viết ngắn' },
                    { id: 'snapshot', label: 'Góc ảnh & Tâm sự' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterCategory(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      filterCategory === tab.id
                        ? 'bg-[#5380AD] text-white shadow-xs'
                        : 'text-[#4D6B88] dark:text-[#A4C0DA] hover:text-[#1D3550] dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {isAdmin ? (
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-1.5 min-h-[38px] px-4 py-2 rounded-xl text-xs font-semibold bg-[#5380AD] hover:bg-[#44709D] text-white shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  {isComposerOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isComposerOpen ? 'Đóng khung soạn' : 'Đăng quote / tải ảnh mới'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onRequireAdmin}
                  className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-[#203146] text-[#4C6B8A] dark:text-[#A4C0DA] border border-[#DCE9F5] dark:border-[#364D68] hover:border-[#8BB5DC] transition-colors cursor-pointer whitespace-nowrap"
                  title="Chỉ Quản trị viên (Yui) mới có thể đăng bài và tải ảnh lên mục này"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Chỉ Yui tải ảnh &amp; đăng bài</span>
                </button>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-6 custom-scrollbar">
              {/* Admin Composer Drawer */}
              <AnimatePresence>
                {isAdmin && isComposerOpen && (
                  <motion.form
                    onSubmit={handleSubmitPost}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#1D2D42] border border-[#CFE1F2] dark:border-[#39506B] shadow-sm space-y-4"
                  >
                    <h3 className="text-sm font-bold font-serif text-[#16273B] dark:text-white border-b border-[#EAF2FA] dark:border-[#2C4058] pb-2.5">
                      {editingPost ? `Chỉnh sửa bài: ${editingPost.title}` : 'Viết quote ngẫu hứng hoặc đoạn tản văn mới'}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#4C6B8A] dark:text-[#A4C0DA] mb-1">
                          Tiêu đề *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={180}
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          placeholder="VD: Ghi chú lúc 2 giờ sáng giữa mùa tuyết..."
                          className="w-full px-3.5 py-2 rounded-xl text-xs bg-[#F7FAFE] dark:bg-[#162336] border border-[#DCE9F5] dark:border-[#364D68]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#4C6B8A] dark:text-[#A4C0DA] mb-1">
                          Thể loại
                        </label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value as WhisperCategory)}
                          className="w-full px-3 py-2 rounded-xl text-xs bg-[#F7FAFE] dark:bg-[#162336] border border-[#DCE9F5] dark:border-[#364D68]"
                        >
                          <option value="quote">Quote ngẫu hứng</option>
                          <option value="excerpt">Đoạn viết ngắn</option>
                          <option value="snapshot">Góc ảnh &amp; Tâm sự</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#4C6B8A] dark:text-[#A4C0DA] mb-1">
                          Chú thích phụ / Tâm trạng (tùy chọn)
                        </label>
                        <input
                          type="text"
                          maxLength={150}
                          value={formMood}
                          onChange={(e) => setFormMood(e.target.value)}
                          placeholder="VD: Ngẫu hứng · Bản nháp số 03..."
                          className="w-full px-3.5 py-2 rounded-xl text-xs bg-[#F7FAFE] dark:bg-[#162336] border border-[#DCE9F5] dark:border-[#364D68]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#4C6B8A] dark:text-[#A4C0DA] mb-1">
                          Người viết
                        </label>
                        <input
                          type="text"
                          maxLength={60}
                          value={formAuthor}
                          onChange={(e) => setFormAuthor(e.target.value)}
                          placeholder="Yui"
                          className="w-full px-3.5 py-2 rounded-xl text-xs bg-[#F7FAFE] dark:bg-[#162336] border border-[#DCE9F5] dark:border-[#364D68]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#4C6B8A] dark:text-[#A4C0DA] mb-1">
                        Nội dung quote / đoạn viết *
                      </label>
                      <textarea
                        rows={5}
                        required
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        placeholder="Viết những câu chữ ngẫu hứng, lời thoại, hoặc đoạn tản văn bạn muốn chia sẻ..."
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F7FAFE] dark:bg-[#162336] border border-[#DCE9F5] dark:border-[#364D68] leading-relaxed resize-y"
                      />
                    </div>

                    {/* Admin-Only Image Upload */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-[#4C6B8A] dark:text-[#A4C0DA]">
                        Tải ảnh minh họa (chỉ Quản trị viên)
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleUploadImage}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#EAF3FC] dark:bg-[#23374F] hover:bg-[#DCEBFA] text-[#36597A] dark:text-[#CBE0F5] border border-[#CFE1F2] dark:border-[#39506B] cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploadingImage ? 'Đang tải ảnh...' : 'Tải ảnh từ máy'}</span>
                        </button>

                        <input
                          type="url"
                          value={formImageUrl.startsWith('data:') ? '' : formImageUrl}
                          onChange={(e) => setFormImageUrl(e.target.value)}
                          placeholder="Hoặc dán link ảnh (https://...)..."
                          className="flex-1 min-w-[200px] px-3 py-2 rounded-xl text-xs bg-[#F7FAFE] dark:bg-[#162336] border border-[#DCE9F5] dark:border-[#364D68]"
                        />

                        {formImageUrl && (
                          <button
                            type="button"
                            onClick={() => setFormImageUrl('')}
                            className="px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                          >
                            Gỡ ảnh
                          </button>
                        )}
                      </div>

                      {formImageUrl && (
                        <div className="mt-2 relative inline-block rounded-xl overflow-hidden border border-[#DCE9F5] dark:border-[#364D68]">
                          <img
                            src={formImageUrl}
                            alt="Xem trước"
                            referrerPolicy="no-referrer"
                            className="max-h-48 w-auto object-contain"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          resetComposer();
                          setIsComposerOpen(false);
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#EFF5FB] dark:bg-[#23374F] text-[#4C6B8A] dark:text-[#A4C0DA] cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-[#5380AD] hover:bg-[#44709D] text-white shadow-xs disabled:opacity-60 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSaving ? 'Đang đăng...' : editingPost ? 'Lưu thay đổi' : 'Đăng bài lên'}</span>
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Editorial Feed */}
              {filteredPosts.length === 0 ? (
                <div className="py-16 px-4 text-center space-y-3 rounded-2xl bg-white/65 dark:bg-[#1D2D42]/60 border border-dashed border-[#CFE1F2] dark:border-[#364D68]">
                  <Quote className="w-9 h-9 mx-auto text-[#7CA7CF]" />
                  <div className="space-y-1">
                    <p className="text-base font-serif font-semibold text-[#1D3550] dark:text-white">
                      Trang giấy đang chờ nét chữ đầu tiên của Yui
                    </p>
                    <p className="text-xs text-[#5E7C99] dark:text-[#A4C0DA]">
                      Khi Yui chia sẻ quote ngẫu hứng hay đoạn viết mới, bài viết sẽ hiện lên ngay tại đây.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {filteredPosts.map((post) => {
                    const isLiked = likedIds.includes(post.id);
                    const comments = Array.isArray(post.comments) ? post.comments : [];
                    const isCommentsOpen = !!openCommentsMap[post.id];

                    return (
                      <article
                        key={post.id}
                        className="rounded-2xl bg-white dark:bg-[#1D2D42] border border-[#D4E6F6] dark:border-[#334A64] p-5 sm:p-6 space-y-4 shadow-[0_6px_22px_-8px_rgba(68,108,148,0.12)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <h3 className="text-lg sm:text-xl font-bold font-display text-[#16273B] dark:text-white leading-snug [text-wrap:balance]">
                              {post.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#5E7C99] dark:text-[#A4C0DA]">
                              <span className="font-semibold text-[#36597A] dark:text-[#CBE0F5]">
                                {post.author || 'Yui'}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{WHISPER_CATEGORY_LABELS[post.category] || post.category}</span>
                              {post.subtitleOrMood && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="italic">{post.subtitleOrMood}</span>
                                </>
                              )}
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">{formatDateTime(post.createdAt)}</span>
                            </div>
                          </div>

                          {isAdmin && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(post)}
                                className="p-2 rounded-lg text-[#6485A5] hover:text-[#36597A] hover:bg-[#EAF3FC] dark:hover:bg-[#243750] cursor-pointer"
                                title="Sửa bài"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setPostToDelete(post)}
                                className="p-2 rounded-lg text-[#6485A5] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                                title="Xóa bài"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Optional Image uploaded by Admin */}
                        {post.imageUrl && (
                          <button
                            type="button"
                            onClick={() => setZoomedImageUrl(post.imageUrl!)}
                            className="group relative block w-full overflow-hidden rounded-xl border border-[#E2EEF9] dark:border-[#2E435C] bg-[#EDF5FD] dark:bg-[#142030] cursor-zoom-in"
                          >
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              referrerPolicy="no-referrer"
                              className="w-full max-h-96 object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                            />
                            <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#122033]/70 text-white text-[11px] opacity-0 group-hover:opacity-100 transition-opacity">
                              <ZoomIn className="w-3 h-3" />
                              <span>Phóng to</span>
                            </span>
                          </button>
                        )}

                        {/* Quote / Prose Content */}
                        <div className="relative px-4 sm:px-5 py-3.5 rounded-xl bg-[#F6FAFE] dark:bg-[#172538] border border-[#E5EFF9] dark:border-[#2C4159]">
                          <p className="text-sm sm:text-[15px] font-serif text-[#243D56] dark:text-[#E5EFFB] leading-[1.75] whitespace-pre-wrap break-words">
                            {post.content}
                          </p>
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleLikePost(post.id)}
                              className={`inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                                isLiked
                                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300'
                                  : 'bg-[#F3F8FE] dark:bg-[#23374F] text-[#4C6B8A] dark:text-[#A4C0DA] hover:bg-[#E7F0FB]'
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                              <span className="tabular-nums">{post.likes || 0}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setOpenCommentsMap((prev) => ({ ...prev, [post.id]: !prev[post.id] }))
                              }
                              className={`inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                                isCommentsOpen
                                  ? 'bg-[#5380AD] text-white'
                                  : 'bg-[#F3F8FE] dark:bg-[#23374F] text-[#4C6B8A] dark:text-[#A4C0DA] hover:bg-[#E7F0FB]'
                              }`}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span className="tabular-nums">Bình luận ({comments.length})</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopyContent(post)}
                            className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-medium bg-[#F3F8FE] dark:bg-[#23374F] text-[#4C6B8A] dark:text-[#A4C0DA] hover:bg-[#E7F0FB] cursor-pointer"
                          >
                            {copiedId === post.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Đã chép</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Sao chép</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Public Comments Drawer */}
                        <AnimatePresence>
                          {isCommentsOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden pt-2 border-t border-[#EDF4FB] dark:border-[#2D4159] space-y-3"
                            >
                              {comments.length === 0 ? (
                                <p className="text-xs italic text-[#6D8AA6] dark:text-[#96B5D4] py-1">
                                  Chưa có bình luận nào. Để lại cảm nhận của bạn cho đoạn viết này nhé!
                                </p>
                              ) : (
                                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                                  {comments.map((cmt) => {
                                    const canDeleteCmt =
                                      isAdmin || (!!cmt.creatorToken && cmt.creatorToken === deviceToken);
                                    return (
                                      <div
                                        key={cmt.id}
                                        className="p-3 rounded-xl bg-[#F6FAFE] dark:bg-[#172538] border border-[#E5EFF9] dark:border-[#2C4159] space-y-1"
                                      >
                                        <div className="flex items-center justify-between gap-2 text-[11px] text-[#5E7C99] dark:text-[#9AB8D6]">
                                          <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="font-semibold text-[#233D58] dark:text-[#E2EFFB] truncate">
                                              {cmt.isAnonymous ? 'Ẩn danh' : cmt.author}
                                            </span>
                                            {cmt.replyToAuthor && (
                                              <span className="inline-flex items-center gap-0.5 text-[#5380AD] dark:text-[#8FBCE8]">
                                                <CornerDownRight className="w-3 h-3" />
                                                <span>@{cmt.replyToAuthor}</span>
                                              </span>
                                            )}
                                            <span aria-hidden="true">·</span>
                                            <span className="tabular-nums shrink-0">
                                              {formatDateTime(cmt.createdAt)}
                                            </span>
                                          </div>

                                          <div className="flex items-center gap-2 shrink-0">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setCommentReplyToMap((prev) => ({
                                                  ...prev,
                                                  [post.id]: cmt.isAnonymous ? 'Ẩn danh' : cmt.author,
                                                }))
                                              }
                                              className="text-[11px] font-medium text-[#5380AD] dark:text-[#9AC6F0] hover:underline cursor-pointer"
                                            >
                                              Trả lời
                                            </button>
                                            {canDeleteCmt && (
                                              <button
                                                type="button"
                                                onClick={() => handleDeleteComment(post.id, cmt)}
                                                className="text-slate-400 hover:text-rose-500 cursor-pointer"
                                                title="Xóa bình luận"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </button>
                                            )}
                                          </div>
                                        </div>

                                        <p className="text-xs text-[#2B435B] dark:text-[#DFECF8] leading-relaxed whitespace-pre-wrap break-words">
                                          {cmt.content}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Comment Input */}
                              <form
                                onSubmit={(e) => handleSubmitComment(e, post)}
                                className="p-3 rounded-xl bg-[#F2F7FD] dark:bg-[#152234] border border-[#DCE9F5] dark:border-[#2C4159] space-y-2"
                              >
                                {commentReplyToMap[post.id] && (
                                  <div className="flex items-center justify-between text-[11px] text-[#5380AD] dark:text-[#9AC6F0]">
                                    <span>Đang trả lời @{commentReplyToMap[post.id]}</span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setCommentReplyToMap((prev) => ({ ...prev, [post.id]: undefined }))
                                      }
                                      className="hover:underline cursor-pointer"
                                    >
                                      Hủy tag
                                    </button>
                                  </div>
                                )}

                                <div className="flex flex-wrap items-center gap-2">
                                  <input
                                    type="text"
                                    disabled={!!commentAnonMap[post.id]}
                                    maxLength={50}
                                    value={
                                      commentAnonMap[post.id]
                                        ? 'Ẩn danh'
                                        : commentAuthorMap[post.id] ?? ''
                                    }
                                    onChange={(e) =>
                                      setCommentAuthorMap((prev) => ({
                                        ...prev,
                                        [post.id]: e.target.value,
                                      }))
                                    }
                                    placeholder={
                                      userProfile?.name && userProfile.name !== 'Tên của bạn'
                                        ? userProfile.name
                                        : 'Tên của bạn (tùy chọn)...'
                                    }
                                    className="flex-1 min-w-[140px] px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-[#1D2D42] border border-[#DCE9F5] dark:border-[#364D68] disabled:opacity-60"
                                  />

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCommentAnonMap((prev) => ({
                                        ...prev,
                                        [post.id]: !prev[post.id],
                                      }))
                                    }
                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border cursor-pointer ${
                                      commentAnonMap[post.id]
                                        ? 'bg-[#263F5C] text-white border-[#263F5C]'
                                        : 'bg-white dark:bg-[#1D2D42] text-[#4C6B8A] dark:text-[#A4C0DA] border-[#DCE9F5] dark:border-[#364D68]'
                                    }`}
                                  >
                                    <EyeOff className="w-3 h-3" />
                                    <span>Ẩn danh</span>
                                  </button>
                                </div>

                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    required
                                    maxLength={1000}
                                    value={commentTextMap[post.id] || ''}
                                    onChange={(e) =>
                                      setCommentTextMap((prev) => ({
                                        ...prev,
                                        [post.id]: e.target.value,
                                      }))
                                    }
                                    placeholder="Viết bình luận của bạn..."
                                    className="flex-1 px-3 py-2 rounded-lg text-xs bg-white dark:bg-[#1D2D42] border border-[#DCE9F5] dark:border-[#364D68] focus:outline-none focus:ring-2 focus:ring-[#7BA7D2]/40"
                                  />
                                  <button
                                    type="submit"
                                    disabled={submittingCommentId === post.id}
                                    className="inline-flex items-center gap-1 min-h-[34px] px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#5380AD] hover:bg-[#44709D] text-white cursor-pointer disabled:opacity-60"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Gửi</span>
                                  </button>
                                </div>
                              </form>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* Image Lightbox */}
          <AnimatePresence>
            {zoomedImageUrl && (
              <div
                onClick={() => setZoomedImageUrl(null)}
                className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#0D1826]/90 backdrop-blur-md cursor-zoom-out"
              >
                <button
                  type="button"
                  onClick={() => setZoomedImageUrl(null)}
                  className="absolute top-4 right-4 p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white cursor-pointer"
                  aria-label="Đóng ảnh"
                >
                  <X className="w-5 h-5" />
                </button>
                <img
                  src={zoomedImageUrl}
                  alt="Xem ảnh lớn"
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-[88dvh] rounded-2xl shadow-2xl object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </AnimatePresence>

          {/* Delete Confirm */}
          <AnimatePresence>
            {postToDelete && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                <motion.div
                  initial={{ scale: 0.94, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.94, opacity: 0 }}
                  className="bg-white dark:bg-[#172536] rounded-3xl p-6 max-w-sm w-full border border-[#CFE1F2] dark:border-[#39506B] shadow-2xl text-center space-y-4"
                >
                  <Sparkles className="w-7 h-7 mx-auto text-[#5380AD]" />
                  <div className="space-y-1">
                    <h4 className="text-base font-bold font-serif text-[#16273B] dark:text-white">
                      Gỡ bài khỏi Nhặt Cánh Tuyết Rơi?
                    </h4>
                    <p className="text-xs text-[#5E7C99] dark:text-[#A4C0DA]">
                      Bài &ldquo;{postToDelete.title}&rdquo; và các bình luận kèm theo sẽ bị xóa.
                    </p>
                  </div>
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPostToDelete(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#EFF5FB] dark:bg-[#23374F] text-[#4C6B8A] dark:text-[#A4C0DA] cursor-pointer"
                    >
                      Giữ lại
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDeletePost}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#36597A] text-white cursor-pointer"
                    >
                      Xác nhận gỡ
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};

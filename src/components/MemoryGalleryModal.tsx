import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Heart,
  MessageCircle,
  Image as ImageIcon,
  Send,
  Trash2,
  Search,
  Upload,
  EyeOff,
  CornerDownRight,
  ZoomIn,
  Feather,
  Palette,
  Sparkles,
} from 'lucide-react';
import {
  Character,
  MemoryGalleryCategory,
  MemoryGalleryPost,
  MemoryGalleryReply,
  UserProfile,
} from '../types';
import { compressImageFile } from '../utils/imageCompressor';
import { triggerSfx } from '../utils/sfx';
import { triggerHeartConfetti } from '../utils/confetti';
import {
  saveMemoryGalleryPost,
  deleteMemoryGalleryPost,
  likeMemoryGalleryPost,
  addReplyToMemoryGalleryPost,
  deleteReplyFromMemoryGalleryPost,
} from '../services/memoryGalleryService';

interface MemoryGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: MemoryGalleryPost[];
  characters: Character[];
  userProfile?: UserProfile;
  isAdmin?: boolean;
  isSfxOn?: boolean;
  sfxVolume?: number;
  onToast?: (msg: string) => void;
}

const CATEGORY_LABELS: Record<MemoryGalleryCategory, string> = {
  chat: 'Đoạn chat',
  fanart: 'Fanart',
  moment: 'Khoảnh khắc & Ảnh',
};

function formatRelativeTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diffSec < 15) return 'Vừa xong';
    if (diffSec < 60) return `${diffSec}s trước`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}p trước`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h trước`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay} ngày trước`;
    return d.toLocaleDateString('vi-VN');
  } catch {
    return dateStr;
  }
}

export const MemoryGalleryModal: React.FC<MemoryGalleryModalProps> = ({
  isOpen,
  onClose,
  posts,
  characters,
  userProfile,
  isAdmin = false,
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

  const [likedPostIds, setLikedPostIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('yui_liked_gallery_posts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [filterCategory, setFilterCategory] = useState<'all' | MemoryGalleryCategory>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  // Post Composer State
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState<MemoryGalleryCategory>('chat');
  const [postAuthor, setPostAuthor] = useState(() => {
    if (userProfile?.name && userProfile.name !== 'Tên của bạn') return userProfile.name;
    try {
      return localStorage.getItem('yui_last_author_name') || '';
    } catch {
      return '';
    }
  });
  const [isAnonymousPost, setIsAnonymousPost] = useState(false);
  const [postCharacterName, setPostCharacterName] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [postSourceCredit, setPostSourceCredit] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Replies UI State per post
  const [expandedPostIds, setExpandedPostIds] = useState<Record<string, boolean>>({});
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyAuthorDrafts, setReplyAuthorDrafts] = useState<Record<string, string>>({});
  const [replyAnonymousMap, setReplyAnonymousMap] = useState<Record<string, boolean>>({});
  const [replyToTargetMap, setReplyToTargetMap] = useState<Record<string, string | undefined>>({});
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);

  // Lightbox / Confirm Delete State
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<MemoryGalleryPost | null>(null);

  const filteredPosts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return posts.filter((p) => {
      if (filterCategory !== 'all' && p.category !== filterCategory) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        (p.characterName || '').toLowerCase().includes(q)
      );
    });
  }, [posts, filterCategory, searchTerm]);

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingImage(true);
      let compressed = await compressImageFile(file, 960, 960, 0.84);
      if (compressed.length > 680000) {
        compressed = await compressImageFile(file, 720, 720, 0.72);
      }
      if (compressed.length > 850000) {
        onToast?.('⚠️ Ảnh quá nặng để lưu trữ, vui lòng chọn ảnh nhẹ hơn hoặc dán URL.');
        return;
      }
      setPostImageUrl(compressed);
      onToast?.('✨ Đã tải ảnh lên khung xem trước!');
    } catch (err) {
      console.warn('Gallery image upload error:', err);
      onToast?.('⚠️ Không thể đọc tệp ảnh này, hãy thử ảnh khác.');
    } finally {
      setIsUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) {
      onToast?.('⚠️ Hãy đặt một chiếc tên thật xinh cho bài lưu trữ nhé!');
      return;
    }
    if (!postContent.trim() && !postImageUrl.trim()) {
      onToast?.('⚠️ Hãy viết đoạn chat/cảm nhận hoặc đính kèm ít nhất 1 tấm ảnh.');
      return;
    }

    const displayAuthor = isAnonymousPost
      ? 'Khách ghé thăm ẩn danh'
      : postAuthor.trim() || 'Người ghé góc nhỏ';

    if (!isAnonymousPost && postAuthor.trim()) {
      try {
        localStorage.setItem('yui_last_author_name', postAuthor.trim());
      } catch {}
    }

    const newPost: MemoryGalleryPost = {
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: postTitle.trim(),
      category: postCategory,
      author: displayAuthor,
      isAnonymous: isAnonymousPost,
      characterName: postCharacterName.trim(),
      content: postContent.trim(),
      imageUrl: postImageUrl.trim(),
      sourceCredit: postSourceCredit.trim(),
      likes: 0,
      replies: [],
      createdAt: new Date().toISOString(),
      creatorToken: deviceToken,
    };

    try {
      setIsSubmitting(true);
      await saveMemoryGalleryPost(newPost);
      if (isSfxOn) triggerSfx('sparkle', sfxVolume);
      setPostTitle('');
      setPostContent('');
      setPostImageUrl('');
      setPostCharacterName('');
      setPostSourceCredit('');
      setIsComposerOpen(false);
      onToast?.('❄️ Đã lưu kỷ niệm vào Lầu Tuyết Họa Ký!');
    } catch (err) {
      console.error('Failed to save MemoryGalleryPost:', err);
      onToast?.('⚠️ Chưa thể đăng bài lúc này (kiểm tra kích thước ảnh hoặc kết nối).');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (likedPostIds.includes(postId)) {
      onToast?.('Bạn đã thả tim kỷ niệm này rồi ♡');
      return;
    }
    const nextLiked = [...likedPostIds, postId];
    setLikedPostIds(nextLiked);
    try {
      localStorage.setItem('yui_liked_gallery_posts', JSON.stringify(nextLiked));
    } catch {}
    triggerHeartConfetti(0.5, 0.55);
    if (isSfxOn) triggerSfx('pop', sfxVolume);
    try {
      await likeMemoryGalleryPost(postId);
    } catch (err) {
      console.warn('Could not increment gallery like:', err);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent, post: MemoryGalleryPost) => {
    e.preventDefault();
    const content = (replyDrafts[post.id] || '').trim();
    if (!content) return;

    const isAnon = !!replyAnonymousMap[post.id];
    const rawAuthor =
      replyAuthorDrafts[post.id]?.trim() ||
      (userProfile?.name && userProfile.name !== 'Tên của bạn' ? userProfile.name : '') ||
      (() => {
        try {
          return localStorage.getItem('yui_last_author_name') || '';
        } catch {
          return '';
        }
      })();

    const finalAuthor = isAnon ? 'Ẩn danh' : rawAuthor || 'Người ghé thăm';
    const replyToAuthor = replyToTargetMap[post.id];

    const newReply: MemoryGalleryReply = {
      id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      author: finalAuthor,
      isAnonymous: isAnon,
      content,
      ...(replyToAuthor ? { replyToAuthor } : {}),
      createdAt: new Date().toISOString(),
      creatorToken: deviceToken,
    };

    try {
      setSubmittingReplyId(post.id);
      await addReplyToMemoryGalleryPost(post.id, newReply);
      setReplyDrafts((prev) => ({ ...prev, [post.id]: '' }));
      setReplyToTargetMap((prev) => ({ ...prev, [post.id]: undefined }));
      setExpandedPostIds((prev) => ({ ...prev, [post.id]: true }));
      if (isSfxOn) triggerSfx('pop', sfxVolume);
      onToast?.('💬 Đã gửi phản hồi!');
    } catch (err) {
      console.error('Failed to add reply:', err);
      onToast?.('⚠️ Không thể gửi phản hồi lúc này.');
    } finally {
      setSubmittingReplyId(null);
    }
  };

  const handleDeleteReply = async (postId: string, reply: MemoryGalleryReply) => {
    try {
      await deleteReplyFromMemoryGalleryPost(postId, reply);
      onToast?.('🗑️ Đã gỡ phản hồi.');
    } catch (err) {
      console.error('Failed to delete reply:', err);
      onToast?.('⚠️ Không thể xóa phản hồi.');
    }
  };

  const handleConfirmDeletePost = async () => {
    if (!postToDelete) return;
    const id = postToDelete.id;
    setPostToDelete(null);
    try {
      await deleteMemoryGalleryPost(id);
      onToast?.('🗑️ Đã gỡ bài khỏi Lầu Tuyết Họa Ký.');
    } catch (err) {
      console.error('Failed to delete post:', err);
      onToast?.('⚠️ Không thể xóa bài lúc này.');
    }
  };

  const toggleExpandReplies = (postId: string) => {
    setExpandedPostIds((prev) => ({ ...prev, [postId]: !prev[postId] }));
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
            className="relative w-full max-w-5xl max-h-[92dvh] flex flex-col bg-[#F7FAFE] dark:bg-[#162336] rounded-[26px] border border-[#CFE1F2] dark:border-[#39506B] shadow-2xl text-[#1D3550] dark:text-[#EAF2FB] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start sm:items-center justify-between gap-3 px-5 sm:px-7 py-4 sm:py-5 border-b border-[#DCE9F5] dark:border-[#314660] bg-white/80 dark:bg-[#1A293D]/85">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#EAF3FC] dark:bg-[#23374F] text-[#4E7AA5] dark:text-[#A6CBF0] flex items-center justify-center shrink-0">
                    <Palette className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold font-display tracking-tight text-[#16273B] dark:text-white truncate">
                    Lầu Tuyết Họa Ký
                  </h2>
                </div>
                <p className="text-xs sm:text-[13px] font-serif text-[#5E7C99] dark:text-[#A4C0DA] leading-relaxed">
                  Nơi cất giữ đoạn chat đáng nhớ, fanart &amp; khoảnh khắc bạn muốn chia sẻ cùng mọi người (có thể gửi ẩn danh)
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-[#64829E] hover:text-[#16273B] dark:hover:text-white hover:bg-[#EAF3FC] dark:hover:bg-[#243750] transition-colors cursor-pointer shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Đóng Lầu Tuyết Họa Ký"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toolbar: Filter Tabs + Search + Add CTA */}
            <div className="px-5 sm:px-7 py-3 border-b border-[#E3EEF8] dark:border-[#2C4058] bg-[#F1F7FD]/75 dark:bg-[#19283C]/75 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-1 p-1 bg-white dark:bg-[#203146] rounded-xl border border-[#DCE9F5] dark:border-[#364D68]">
                {(
                  [
                    { id: 'all', label: `Tất cả (${posts.length})` },
                    { id: 'chat', label: 'Đoạn chat' },
                    { id: 'fanart', label: 'Fanart' },
                    { id: 'moment', label: 'Khoảnh khắc & Ảnh' },
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

              <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end min-w-[210px]">
                <div className="relative flex-1 sm:w-52">
                  <Search className="w-3.5 h-3.5 text-[#7A97B3] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm tên bài, nhân vật..."
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#203146] border border-[#DCE9F5] dark:border-[#364D68] text-[#1D3550] dark:text-white placeholder-[#89A4BE] focus:outline-none focus:ring-2 focus:ring-[#7BA7D2]/40"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsComposerOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 min-h-[38px] px-4 py-2 rounded-xl text-xs font-semibold bg-[#5380AD] hover:bg-[#44709D] text-white shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {isComposerOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isComposerOpen ? 'Đóng khung viết' : 'Lưu kỷ niệm mới'}</span>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-6 custom-scrollbar">
              {/* Composer Drawer */}
              <AnimatePresence>
                {isComposerOpen && (
                  <motion.form
                    onSubmit={handleSubmitPost}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#1D2D42] border border-[#CFE1F2] dark:border-[#39506B] shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-[#EAF2FA] dark:border-[#2C4058] pb-3">
                      <h3 className="text-sm font-bold font-serif text-[#16273B] dark:text-white flex items-center gap-2">
                        <Feather className="w-4 h-4 text-[#5380AD]" />
                        <span>Gửi đoạn chat, tranh vẽ fanart hoặc ảnh kỷ niệm</span>
                      </h3>

                      <button
                        type="button"
                        onClick={() => setIsAnonymousPost((v) => !v)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                          isAnonymousPost
                            ? 'bg-[#263F5C] text-white border-[#263F5C]'
                            : 'bg-[#F3F8FE] dark:bg-[#23374F] text-[#4C6B8A] dark:text-[#A8CDF0] border-[#D4E4F4] dark:border-[#39506B]'
                        }`}
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>{isAnonymousPost ? 'Đang bật: Ẩn danh' : 'Đăng ẩn danh'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#4C6B8A] dark:text-[#A4C0DA] mb-1">
                          Đặt tên / Tiêu đề bài *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={160}
                          value={postTitle}
                          onChange={(e) => setPostTitle(e.target.value)}
                          placeholder="VD: Đoạn chat đêm tuyết rơi cùng Takashi..."
                          className="w-full px-3.5 py-2 rounded-xl text-xs bg-[#F7FAFE] dark:bg-[#162336] border border-[#DCE9F5] dark:border-[#364D68] focus:outline-none focus:ring-2 focus:ring-[#7BA7D2]/40"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#4C6B8A] dark:text-[#A4C0DA] mb-1">
                          Phân loại
                        </label>
                        <select
                          value={postCategory}
                          onChange={(e) => setPostCategory(e.target.value as MemoryGalleryCategory)}
                          className="w-full px-3 py-2 rounded-xl text-xs bg-[#F7FAFE] dark:bg-[#162336] border border-[#DCE9F5] dark:border-[#364D68] focus:outline-none"
                        >
                          <option value="chat">Đoạn chat / Hội thoại</option>
                          <option value="fanart">Fanart / Tranh vẽ</option>
                          <option value="moment">Khoảnh khắc &amp; Ảnh</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#4C6B8A] dark:text-[#A4C0DA] mb-1">
                          Tên của bạn {isAnonymousPost ? '(Sẽ ẩn)' : ''}
                        </label>
                        <input
                          type="text"
                          disabled={isAnonymousPost}
                          maxLength={60}
                          value={isAnonymousPost ? 'Khách ghé thăm ẩn danh' : postAuthor}
                          onChange={(e) => setPostAuthor(e.target.value)}
                          placeholder="Tên hoặc biệt danh..."
                          className="w-full px-3.5 py-2 rounded-xl text-xs bg-[#F7FAFE] dark:bg-[#162336] border border-[#DCE9F5] dark:border-[#364D68] disabled:opacity-60"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#4C6B8A] dark:text-[#A4C0DA] mb-1">
                          Nhân vật liên quan (tùy chọn)
                        </label>
                        <input
                          type="text"
                          list="gallery-character-suggestions"
                          maxLength={100}
                          value={postCharacterName}
                          onChange={(e) => setPostCharacterName(e.target.value)}
                          placeholder="VD: Natsume Takashi..."
                          className="w-full px-3.5 py-2 rounded-xl text-xs bg-[#F7FAFE] dark:bg-[#162336] border border-[#DCE9F5] dark:border-[#364D68]"
                        />
                        <datalist id="gallery-character-suggestions">
                          {characters.map((c) => (
                            <option key={c.id} value={c.name} />
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#4C6B8A] dark:text-[#A4C0DA] mb-1">
                          Nguồn / Artist (nếu có)
                        </label>
                        <input
                          type="text"
                          maxLength={140}
                          value={postSourceCredit}
                          onChange={(e) => setPostSourceCredit(e.target.value)}
                          placeholder="Credit tranh hoặc ghi chú ngắn..."
                          className="w-full px-3.5 py-2 rounded-xl text-xs bg-[#F7FAFE] dark:bg-[#162336] border border-[#DCE9F5] dark:border-[#364D68]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#4C6B8A] dark:text-[#A4C0DA] mb-1">
                        Nội dung đoạn chat / lời nhắn
                      </label>
                      <textarea
                        rows={4}
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="Dán đoạn hội thoại thú vị, cảm nhận hoặc đôi lời chia sẻ..."
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F7FAFE] dark:bg-[#162336] border border-[#DCE9F5] dark:border-[#364D68] leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-[#7BA7D2]/40"
                      />
                    </div>

                    {/* Image uploader */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-[#4C6B8A] dark:text-[#A4C0DA]">
                        Đính kèm ảnh / Fanart (từ máy hoặc URL)
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
                          <span>{isUploadingImage ? 'Đang xử lý ảnh...' : 'Tải ảnh từ máy'}</span>
                        </button>

                        <input
                          type="url"
                          value={postImageUrl.startsWith('data:') ? '' : postImageUrl}
                          onChange={(e) => setPostImageUrl(e.target.value)}
                          placeholder="Hoặc dán đường link ảnh (https://...)..."
                          className="flex-1 min-w-[200px] px-3 py-2 rounded-xl text-xs bg-[#F7FAFE] dark:bg-[#162336] border border-[#DCE9F5] dark:border-[#364D68]"
                        />

                        {postImageUrl && (
                          <button
                            type="button"
                            onClick={() => setPostImageUrl('')}
                            className="px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                          >
                            Gỡ ảnh
                          </button>
                        )}
                      </div>

                      {postImageUrl && (
                        <div className="mt-2 relative inline-block rounded-xl overflow-hidden border border-[#DCE9F5] dark:border-[#364D68] bg-slate-100 dark:bg-slate-900">
                          <img
                            src={postImageUrl}
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
                        onClick={() => setIsComposerOpen(false)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#EFF5FB] dark:bg-[#23374F] text-[#4C6B8A] dark:text-[#A4C0DA] cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-[#5380AD] hover:bg-[#44709D] text-white shadow-xs disabled:opacity-60 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmitting ? 'Đang lưu...' : 'Đăng lên Lầu Tuyết'}</span>
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Feed List */}
              {filteredPosts.length === 0 ? (
                <div className="py-16 px-4 text-center space-y-3 rounded-2xl bg-white/65 dark:bg-[#1D2D42]/60 border border-dashed border-[#CFE1F2] dark:border-[#364D68]">
                  <ImageIcon className="w-9 h-9 mx-auto text-[#7CA7CF]" />
                  <div className="space-y-1">
                    <p className="text-base font-serif font-semibold text-[#1D3550] dark:text-white">
                      Chưa có kỷ niệm nào được lưu lại ở đây
                    </p>
                    <p className="text-xs text-[#5E7C99] dark:text-[#A4C0DA]">
                      Hãy là người đầu tiên cất giữ một đoạn chat thú vị hoặc bức fanart yêu thích nhé!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                  {filteredPosts.map((post) => {
                    const isLiked = likedPostIds.includes(post.id);
                    const canDeletePost = isAdmin || (!!post.creatorToken && post.creatorToken === deviceToken);
                    const replies = Array.isArray(post.replies) ? post.replies : [];
                    const isRepliesOpen = !!expandedPostIds[post.id];

                    return (
                      <article
                        key={post.id}
                        className="rounded-2xl bg-white dark:bg-[#1D2D42] border border-[#D4E6F6] dark:border-[#334A64] p-5 space-y-4 shadow-[0_6px_20px_-8px_rgba(68,108,148,0.12)]"
                      >
                        {/* Title & Quiet Unboxed Metadata */}
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-base sm:text-lg font-bold font-display text-[#16273B] dark:text-white leading-snug">
                              {post.title}
                            </h3>
                            {canDeletePost && (
                              <button
                                type="button"
                                onClick={() => setPostToDelete(post)}
                                className="p-1.5 rounded-lg text-[#7A97B3] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
                                title="Gỡ bài viết"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#5E7C99] dark:text-[#A4C0DA]">
                            <span className="font-medium text-[#36597A] dark:text-[#CBE0F5]">
                              {post.isAnonymous ? 'Ẩn danh' : post.author}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{CATEGORY_LABELS[post.category] || post.category}</span>
                            {post.characterName && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-[#4E7AA5] dark:text-[#9AC6F0] font-medium">
                                  {post.characterName}
                                </span>
                              </>
                            )}
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">{formatRelativeTime(post.createdAt)}</span>
                          </div>
                        </div>

                        {/* Media */}
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
                              className="w-full max-h-80 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            />
                            <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#122033]/70 text-white text-[11px] opacity-0 group-hover:opacity-100 transition-opacity">
                              <ZoomIn className="w-3 h-3" />
                              <span>Phóng to</span>
                            </span>
                          </button>
                        )}

                        {/* Content */}
                        {post.content && (
                          <div className="text-[13px] sm:text-sm font-serif text-[#2B435B] dark:text-[#DFECF8] leading-relaxed whitespace-pre-wrap break-words">
                            {post.content}
                          </div>
                        )}

                        {post.sourceCredit && (
                          <p className="text-[11px] italic text-[#6B88A4] dark:text-[#96B5D4]">
                            Nguồn / Ghi chú: {post.sourceCredit}
                          </p>
                        )}

                        {/* Interactive Footer */}
                        <div className="pt-3 border-t border-[#EDF4FB] dark:border-[#2D4159] flex items-center justify-between gap-2">
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
                              onClick={() => toggleExpandReplies(post.id)}
                              className={`inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                                isRepliesOpen
                                  ? 'bg-[#5380AD] text-white'
                                  : 'bg-[#F3F8FE] dark:bg-[#23374F] text-[#4C6B8A] dark:text-[#A4C0DA] hover:bg-[#E7F0FB]'
                              }`}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span className="tabular-nums">Phản hồi ({replies.length})</span>
                            </button>
                          </div>
                        </div>

                        {/* Replies Drawer */}
                        <AnimatePresence>
                          {isRepliesOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden pt-2 space-y-3"
                            >
                              {replies.length === 0 ? (
                                <p className="text-xs italic text-[#6D8AA6] dark:text-[#96B5D4] py-2">
                                  Chưa có phản hồi nào. Hãy viết vài lời trò chuyện cùng tác giả bài này nhé!
                                </p>
                              ) : (
                                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                  {replies.map((rep) => {
                                    const canDeleteReply =
                                      isAdmin || (!!rep.creatorToken && rep.creatorToken === deviceToken);
                                    return (
                                      <div
                                        key={rep.id}
                                        className="p-3 rounded-xl bg-[#F6FAFE] dark:bg-[#172538] border border-[#E5EFF9] dark:border-[#2C4159] space-y-1"
                                      >
                                        <div className="flex items-center justify-between gap-2 text-[11px] text-[#5E7C99] dark:text-[#9AB8D6]">
                                          <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="font-semibold text-[#233D58] dark:text-[#E2EFFB] truncate">
                                              {rep.isAnonymous ? 'Ẩn danh' : rep.author}
                                            </span>
                                            {rep.replyToAuthor && (
                                              <span className="inline-flex items-center gap-0.5 text-[#5380AD] dark:text-[#8FBCE8]">
                                                <CornerDownRight className="w-3 h-3" />
                                                <span>@{rep.replyToAuthor}</span>
                                              </span>
                                            )}
                                            <span aria-hidden="true">·</span>
                                            <span className="tabular-nums shrink-0">
                                              {formatRelativeTime(rep.createdAt)}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setReplyToTargetMap((prev) => ({
                                                  ...prev,
                                                  [post.id]: rep.isAnonymous ? 'Ẩn danh' : rep.author,
                                                }))
                                              }
                                              className="text-[11px] font-medium text-[#5380AD] dark:text-[#9AC6F0] hover:underline cursor-pointer"
                                            >
                                              Trả lời
                                            </button>
                                            {canDeleteReply && (
                                              <button
                                                type="button"
                                                onClick={() => handleDeleteReply(post.id, rep)}
                                                className="text-slate-400 hover:text-rose-500 cursor-pointer"
                                                title="Xóa phản hồi"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                        <p className="text-xs text-[#2B435B] dark:text-[#DFECF8] leading-relaxed whitespace-pre-wrap break-words">
                                          {rep.content}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Reply Composer */}
                              <form
                                onSubmit={(e) => handleSubmitReply(e, post)}
                                className="p-3 rounded-xl bg-[#F2F7FD] dark:bg-[#152234] border border-[#DCE9F5] dark:border-[#2C4159] space-y-2"
                              >
                                {replyToTargetMap[post.id] && (
                                  <div className="flex items-center justify-between text-[11px] text-[#5380AD] dark:text-[#9AC6F0]">
                                    <span>Đang trả lời @{replyToTargetMap[post.id]}</span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setReplyToTargetMap((prev) => ({ ...prev, [post.id]: undefined }))
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
                                    disabled={!!replyAnonymousMap[post.id]}
                                    maxLength={50}
                                    value={
                                      replyAnonymousMap[post.id]
                                        ? 'Ẩn danh'
                                        : replyAuthorDrafts[post.id] ?? ''
                                    }
                                    onChange={(e) =>
                                      setReplyAuthorDrafts((prev) => ({
                                        ...prev,
                                        [post.id]: e.target.value,
                                      }))
                                    }
                                    placeholder={
                                      userProfile?.name && userProfile.name !== 'Tên của bạn'
                                        ? userProfile.name
                                        : 'Tên bạn (tùy chọn)...'
                                    }
                                    className="flex-1 min-w-[140px] px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-[#1D2D42] border border-[#DCE9F5] dark:border-[#364D68] disabled:opacity-60"
                                  />

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setReplyAnonymousMap((prev) => ({
                                        ...prev,
                                        [post.id]: !prev[post.id],
                                      }))
                                    }
                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border cursor-pointer ${
                                      replyAnonymousMap[post.id]
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
                                    value={replyDrafts[post.id] || ''}
                                    onChange={(e) =>
                                      setReplyDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))
                                    }
                                    placeholder="Viết phản hồi của bạn..."
                                    className="flex-1 px-3 py-2 rounded-lg text-xs bg-white dark:bg-[#1D2D42] border border-[#DCE9F5] dark:border-[#364D68] focus:outline-none focus:ring-2 focus:ring-[#7BA7D2]/40"
                                  />
                                  <button
                                    type="submit"
                                    disabled={submittingReplyId === post.id}
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

          {/* Delete Confirm Modal */}
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
                      Gỡ bài khỏi Lầu Tuyết Họa Ký?
                    </h4>
                    <p className="text-xs text-[#5E7C99] dark:text-[#A4C0DA]">
                      Bài &ldquo;{postToDelete.title}&rdquo; sẽ bị xóa vĩnh viễn.
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

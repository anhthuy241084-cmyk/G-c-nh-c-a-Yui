import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Feather,
  Search,
  Star,
  Download,
  Trash2,
  Lock,
  LogIn,
  LogOut,
  Copy,
  Snowflake,
  X,
  Save,
  Loader2,
  AlertCircle,
  FileText,
  Mail,
  MailOpen,
} from 'lucide-react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider, OWNER_ADMIN_EMAIL } from '../firebase';
import { SecretLetter, SecretLetterMood } from '../types';
import {
  subscribeSecretLetters,
  fetchSecretLetterFullContent,
  updateSecretLetterAdmin,
  deleteSecretLetterAdmin,
  downloadSecretLetterAsTxt,
  exportSecretLettersToCsv,
  toSecretLetterDate,
} from '../services/secretLetterService';

interface SecretLettersAdminProps {
  onToast?: (msg: string) => void;
}

const MOOD_LABELS: Record<SecretLetterMood, string> = {
  confession: 'Tâm sự',
  wish: 'Lời chúc',
  feedback: 'Góp ý',
  memory: 'Kỷ niệm',
  secret: 'Bí mật',
};

export const SecretLettersAdmin: React.FC<SecretLettersAdminProps> = ({ onToast }) => {
  const [authUser, setAuthUser] = useState<User | null>(auth.currentUser);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [letters, setLetters] = useState<SecretLetter[]>([]);
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);
  const [fullContent, setFullContent] = useState<string>('');
  const [isLoadingFullContent, setIsLoadingFullContent] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'starred'>('all');
  const [moodFilter, setMoodFilter] = useState<'all' | SecretLetterMood>('all');

  // Reader actions
  const [noteDraft, setNoteDraft] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [letterToDelete, setLetterToDelete] = useState<SecretLetter | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isVerifiedOwner =
    Boolean(authUser) &&
    authUser?.email?.toLowerCase() === OWNER_ADMIN_EMAIL.toLowerCase() &&
    authUser?.emailVerified === true;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authReady || !isVerifiedOwner) {
      setLetters([]);
      return;
    }

    const unsub = subscribeSecretLetters(
      (list) => setLetters(list),
      (err) => {
        console.warn('Secret letters subscription warning:', err);
      }
    );
    return () => unsub();
  }, [authReady, isVerifiedOwner]);

  const selectedLetter = useMemo(
    () => letters.find((l) => l.id === selectedLetterId) || null,
    [letters, selectedLetterId]
  );

  useEffect(() => {
    let active = true;
    if (!selectedLetter) {
      setFullContent('');
      setNoteDraft('');
      return;
    }

    setNoteDraft(selectedLetter.adminNote || '');
    if (!selectedLetter.chunkCount || selectedLetter.chunkCount <= 0) {
      setFullContent(selectedLetter.content || '');
      setIsLoadingFullContent(false);
    } else {
      setIsLoadingFullContent(true);
      setFullContent(selectedLetter.content || '');
      fetchSecretLetterFullContent(selectedLetter)
        .then((text) => {
          if (active) setFullContent(text);
        })
        .catch(() => {
          onToast?.('Không thể tải phần nội dung mở rộng của tâm thư');
        })
        .finally(() => {
          if (active) setIsLoadingFullContent(false);
        });
    }

    return () => {
      active = false;
    };
  }, [selectedLetter?.id]);

  const unreadCount = useMemo(
    () => letters.filter((l) => !l.isRead).length,
    [letters]
  );

  const starredCount = useMemo(
    () => letters.filter((l) => l.isStarred).length,
    [letters]
  );

  const filteredLetters = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return letters.filter((l) => {
      if (statusFilter === 'unread' && l.isRead) return false;
      if (statusFilter === 'starred' && !l.isStarred) return false;
      if (moodFilter !== 'all' && l.mood !== moodFilter) return false;

      if (q) {
        const hay = `${l.title || ''} ${l.penName || ''} ${l.content || ''} ${l.adminNote || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [letters, searchTerm, statusFilter, moodFilter]);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsSigningIn(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email?.toLowerCase() !== OWNER_ADMIN_EMAIL.toLowerCase()) {
        setAuthError(`Tài khoản ${result.user.email} không phải chủ sở hữu (${OWNER_ADMIN_EMAIL}).`);
      } else {
        onToast?.('Đã mở khóa Tâm Thư Đêm Tuyết của Yui');
      }
    } catch {
      setAuthError('Không thể hoàn tất đăng nhập Google. Vui lòng thử lại.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setSelectedLetterId(null);
  };

  const handleOpenLetter = async (letter: SecretLetter) => {
    setSelectedLetterId(letter.id);
    if (!letter.isRead) {
      try {
        await updateSecretLetterAdmin(letter.id, { isRead: true });
      } catch {
        // silent
      }
    }
  };

  const handleToggleRead = async (letter: SecretLetter) => {
    try {
      await updateSecretLetterAdmin(letter.id, { isRead: !letter.isRead });
    } catch {
      onToast?.('Không thể cập nhật trạng thái đọc');
    }
  };

  const handleToggleStar = async (letter: SecretLetter, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await updateSecretLetterAdmin(letter.id, { isStarred: !letter.isStarred });
    } catch {
      onToast?.('Không thể cập nhật đánh dấu sao');
    }
  };

  const handleSaveAdminNote = async () => {
    if (!selectedLetter) return;
    setIsSavingNote(true);
    try {
      await updateSecretLetterAdmin(selectedLetter.id, { adminNote: noteDraft.trim() });
      onToast?.('Đã lưu ghi chú riêng');
    } catch {
      onToast?.('Lỗi khi lưu ghi chú');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!letterToDelete) return;
    setIsDeleting(true);
    try {
      await deleteSecretLetterAdmin(letterToDelete);
      if (selectedLetterId === letterToDelete.id) setSelectedLetterId(null);
      onToast?.('Đã xóa tâm thư');
    } catch {
      onToast?.('Không thể xóa tâm thư');
    } finally {
      setIsDeleting(false);
      setLetterToDelete(null);
    }
  };

  const handleCopyContent = (text: string) => {
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        onToast?.('Đã sao chép toàn bộ nội dung tâm thư');
      })
      .catch(() => {});
  };

  if (!authReady) {
    return (
      <div className="py-12 flex items-center justify-center text-xs text-[#6E899E] gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Đang kiểm tra phiên xác thực...</span>
      </div>
    );
  }

  if (!isVerifiedOwner) {
    return (
      <div className="py-10 px-4 max-w-md mx-auto text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-3xl bg-[#E8F1F8] dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] flex items-center justify-center text-[#526B80] dark:text-[#D5E4EF]">
          <Lock className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h4 className="text-base font-bold font-serif text-[#172536] dark:text-[#F7FAFD]">
            Tâm Thư Đêm Tuyết — Chỉ Admin Đọc Được
          </h4>
          <p className="text-xs text-[#6E899E] dark:text-[#A9BDCE] leading-relaxed">
            Để bảo vệ tuyệt đối mọi tâm thư ẩn danh gửi đến Yui, hệ thống yêu cầu xác thực Google của chủ sở hữu ({OWNER_ADMIN_EMAIL}).
          </p>
        </div>

        {authUser && !isVerifiedOwner && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-200 space-y-2">
            <p>
              Bạn đang đăng nhập bằng <strong>{authUser.email}</strong> (không có quyền đọc tâm thư).
            </p>
            <button
              onClick={handleSignOut}
              className="px-3 py-1 rounded-xl bg-white dark:bg-[#172536] border border-rose-300 text-rose-600 text-[11px] font-semibold cursor-pointer"
            >
              Đăng xuất tài khoản này
            </button>
          </div>
        )}

        {authError && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={isSigningIn}
          className="px-6 py-3 rounded-2xl btn-winter-primary text-xs font-serif font-semibold inline-flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
        >
          {isSigningIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
          <span>Xác thực Google của Yui</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#E8F1F8]/70 dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B] flex items-center justify-center text-[#4E7AA5] dark:text-[#A8CDF0]">
            <Feather className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-serif text-[#172536] dark:text-[#F7FAFD]">
              Tâm Thư Đêm Tuyết ({letters.length})
            </h4>
            <p className="text-[11px] text-[#6E899E] dark:text-[#A9BDCE] tabular-nums">
              {unreadCount} thư chưa đọc · {starredCount} đã ghim sao
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportSecretLettersToCsv(filteredLetters)}
            disabled={filteredLetters.length === 0}
            className="px-3 py-1.5 rounded-xl text-xs font-serif font-semibold bg-white dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B] text-[#526B80] dark:text-[#E5EDF5] hover:bg-[#F7FAFD] flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất CSV</span>
          </button>

          <button
            onClick={handleSignOut}
            className="p-2 rounded-xl bg-white dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B] text-[#6E899E] hover:text-rose-500 cursor-pointer"
            title="Đăng xuất phiên Google Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A9BC]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tiêu đề, nội dung..."
            className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-[#F7FAFD] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B] focus:outline-none focus:border-[#91A9BC]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="w-full px-2.5 py-2 rounded-xl text-xs bg-[#F7FAFD] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B] focus:outline-none"
        >
          <option value="all">Tất cả thư ({letters.length})</option>
          <option value="unread">Chưa đọc ({unreadCount})</option>
          <option value="starred">Đã ghim sao ({starredCount})</option>
        </select>

        <select
          value={moodFilter}
          onChange={(e) => setMoodFilter(e.target.value as any)}
          className="w-full px-2.5 py-2 rounded-xl text-xs bg-[#F7FAFD] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B] focus:outline-none"
        >
          <option value="all">Mọi sắc thái</option>
          {(Object.keys(MOOD_LABELS) as SecretLetterMood[]).map((m) => (
            <option key={m} value={m}>
              {MOOD_LABELS[m]}
            </option>
          ))}
        </select>
      </div>

      {/* Letters Grid */}
      {filteredLetters.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#6E899E] dark:text-[#A9BDCE] font-serif space-y-2">
          <Snowflake className="w-6 h-6 mx-auto opacity-60" />
          <p>Chưa có lá tâm thư nào trong hộp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredLetters.map((letter) => {
            const sentDate = toSecretLetterDate(letter.createdAt);
            const dateLabel =
              sentDate.getTime() > 0
                ? sentDate.toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                : 'Vừa gửi';

            const charTotal = letter.totalLength || letter.content?.length || 0;

            return (
              <div
                key={letter.id}
                onClick={() => handleOpenLetter(letter)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenLetter(letter);
                  }
                }}
                className={`group text-left p-4 rounded-2xl border transition-colors cursor-pointer space-y-2 ${
                  !letter.isRead
                    ? 'bg-gradient-to-br from-[#F7FAFD] to-[#E8F1F8] dark:from-[#23344A] dark:to-[#1B2A3C] border-[#8EB3D6]'
                    : 'bg-white dark:bg-[#202F42] border-[#DCE7EF] dark:border-[#43576B] hover:border-[#8EB3D6]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        !letter.isRead
                          ? 'bg-[#5380AD] text-white'
                          : 'bg-[#E8F1F8] dark:bg-[#172536] text-[#6E899E]'
                      }`}
                    >
                      {!letter.isRead ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold font-serif text-[#172536] dark:text-[#F7FAFD] truncate">
                        {letter.title || `Thư từ ${letter.penName || 'Ẩn danh'}`}
                      </p>
                      <p className="text-[11px] text-[#6E899E] dark:text-[#A9BDCE] truncate tabular-nums">
                        {letter.penName || 'Ẩn danh'} · {MOOD_LABELS[letter.mood] || 'Tâm sự'} · {dateLabel}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleToggleStar(letter, e)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                      letter.isStarred
                        ? 'text-amber-500'
                        : 'text-[#91A9BC] hover:text-amber-500'
                    }`}
                    title={letter.isStarred ? 'Bỏ ghim sao' : 'Ghim sao lưu giữ'}
                  >
                    <Star className={`w-4 h-4 ${letter.isStarred ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>

                <p className="text-xs text-[#43576B] dark:text-[#C5D8EB] line-clamp-3 font-serif leading-relaxed">
                  {letter.content}
                </p>

                <div className="flex items-center justify-between text-[10px] text-[#7A96B0] pt-1 border-t border-dashed border-[#DCE7EF] dark:border-[#354A60] tabular-nums">
                  <span>{charTotal.toLocaleString('vi-VN')} ký tự</span>
                  <span>{!letter.isRead ? 'Chưa đọc' : 'Đã đọc'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Reader Modal */}
      <AnimatePresence>
        {selectedLetter && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-2.5 sm:p-5 bg-[#111C2B]/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="w-full max-w-2xl max-h-[90dvh] flex flex-col bg-[#F7FAFD] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B] rounded-3xl shadow-2xl overflow-hidden text-[#2B4055] dark:text-[#E5EDF5]"
            >
              {/* Reader Header */}
              <div className="px-5 py-4 border-b border-[#DCE7EF] dark:border-[#43576B] bg-white dark:bg-[#202F42] flex items-start justify-between gap-3 shrink-0">
                <div className="min-w-0 space-y-0.5">
                  <h4 className="text-sm sm:text-base font-bold font-serif text-[#172536] dark:text-[#F7FAFD]">
                    {selectedLetter.title || 'Tâm thư không tiêu đề'}
                  </h4>
                  <p className="text-[11px] text-[#6E899E] dark:text-[#A9BDCE] tabular-nums">
                    {selectedLetter.penName || 'Ẩn danh'} · {MOOD_LABELS[selectedLetter.mood] || 'Tâm sự'} ·{' '}
                    {toSecretLetterDate(selectedLetter.createdAt).toLocaleString('vi-VN')} ·{' '}
                    {(selectedLetter.totalLength || fullContent.length).toLocaleString('vi-VN')} ký tự
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedLetterId(null)}
                  className="p-1.5 rounded-full hover:bg-[#E8F1F8] dark:hover:bg-[#354A60] cursor-pointer shrink-0"
                  aria-label="Đóng"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Reader Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">
                <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B]">
                  {isLoadingFullContent ? (
                    <div className="py-6 flex items-center justify-center gap-2 text-xs text-[#6E899E]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang ghép đầy đủ nội dung tâm thư dài...</span>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed font-serif whitespace-pre-wrap break-words text-[#172536] dark:text-[#F7FAFD]">
                      {fullContent}
                    </p>
                  )}
                </div>

                {/* Private Admin Note */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] space-y-2">
                  <label className="block text-[11px] font-semibold font-serif text-[#5E7C99] dark:text-[#A4C0DA]">
                    Ghi chú riêng của Yui (chỉ mình bạn thấy)
                  </label>
                  <textarea
                    rows={2}
                    maxLength={5000}
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="Viết cảm nghĩ hoặc ghi chú nhỏ về lá thư này..."
                    className="w-full p-2.5 rounded-xl bg-[#F7FAFD] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B] text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveAdminNote}
                    disabled={isSavingNote}
                    className="px-3.5 py-1.5 rounded-xl btn-winter-primary text-xs font-serif font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingNote ? 'Đang lưu...' : 'Lưu ghi chú'}</span>
                  </button>
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-5 py-3.5 border-t border-[#DCE7EF] dark:border-[#43576B] bg-white dark:bg-[#202F42] flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleRead(selectedLetter)}
                    className="px-3 py-1.5 rounded-xl text-xs font-serif bg-[#E8F1F8] dark:bg-[#172536] text-[#526B80] dark:text-[#E5EDF5] cursor-pointer"
                  >
                    {selectedLetter.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleStar(selectedLetter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-serif inline-flex items-center gap-1 cursor-pointer border ${
                      selectedLetter.isStarred
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                        : 'bg-[#E8F1F8] dark:bg-[#172536] border-transparent text-[#526B80] dark:text-[#E5EDF5]'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${selectedLetter.isStarred ? 'fill-amber-400' : ''}`} />
                    <span>{selectedLetter.isStarred ? 'Đã ghim sao' : 'Ghim sao'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyContent(fullContent)}
                    className="px-3 py-1.5 rounded-xl text-xs font-serif bg-[#E8F1F8] dark:bg-[#172536] text-[#526B80] dark:text-[#E5EDF5] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadSecretLetterAsTxt(selectedLetter, fullContent)}
                    className="px-3 py-1.5 rounded-xl text-xs font-serif bg-[#E8F1F8] dark:bg-[#172536] text-[#526B80] dark:text-[#E5EDF5] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Tải .txt</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setLetterToDelete(selectedLetter)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  title="Xóa tâm thư"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {letterToDelete && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
              <h4 className="text-sm font-bold font-serif text-[#172536] dark:text-[#F7FAFD]">
                Xóa lá tâm thư này?
              </h4>
              <p className="text-xs text-[#6E899E] dark:text-[#A9BDCE]">
                Lá thư &ldquo;{letterToDelete.title || letterToDelete.penName || 'Ẩn danh'}&rdquo; sẽ bị xóa vĩnh viễn khỏi hộp thư.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLetterToDelete(null)}
                  disabled={isDeleting}
                  className="px-3.5 py-1.5 rounded-xl text-xs border border-[#DCE7EF] dark:border-[#43576B] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-3.5 py-1.5 rounded-xl text-xs bg-rose-600 text-white font-semibold cursor-pointer"
                >
                  {isDeleting ? 'Đang xóa...' : 'Xóa thư'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  MailOpen,
  Search,
  Download,
  Trash2,
  Check,
  Heart,
  Calendar,
  LogIn,
  LogOut,
  Lock,
  Copy,
  Snowflake,
  X,
  Save,
  UserCheck,
  EyeOff,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider, OWNER_ADMIN_EMAIL } from '../firebase';
import { WinterLetter } from '../types';
import {
  subscribeWinterLetters,
  updateWinterLetterAdmin,
  deleteWinterLetterAdmin,
  exportWinterLettersToCsv,
  toDateFromFirestore,
} from '../services/winterLetterService';

interface WinterMailboxAdminProps {
  onToast?: (msg: string) => void;
}

export const WinterMailboxAdmin: React.FC<WinterMailboxAdminProps> = ({ onToast }) => {
  const [authUser, setAuthUser] = useState<User | null>(auth.currentUser);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [letters, setLetters] = useState<WinterLetter[]>([]);
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days' | 'custom'>('all');
  const [customDate, setCustomDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'unthanked' | 'thanked'>('all');

  // Detail states
  const [noteDraft, setNoteDraft] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [letterToDelete, setLetterToDelete] = useState<WinterLetter | null>(null);

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

    const unsub = subscribeWinterLetters(
      (list) => setLetters(list),
      (err) => {
        console.warn('Winter letters subscription warning:', err);
      }
    );
    return () => unsub();
  }, [authReady, isVerifiedOwner]);

  const selectedLetter = useMemo(
    () => letters.find((l) => l.id === selectedLetterId) || null,
    [letters, selectedLetterId]
  );

  useEffect(() => {
    if (selectedLetter) {
      setNoteDraft(selectedLetter.internalNote || '');
    }
  }, [selectedLetter?.id]);

  const unreadCount = useMemo(
    () => letters.filter((l) => !l.isRead).length,
    [letters]
  );

  const thankedCount = useMemo(
    () => letters.filter((l) => l.isThanked).length,
    [letters]
  );

  const filteredLetters = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    return letters.filter((l) => {
      // Name / text search
      if (q) {
        const hay = `${l.senderName} ${l.preferredDisplayName || ''} ${l.donateNote || ''} ${l.contactValue || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      // Status filter
      if (statusFilter === 'unread' && l.isRead) return false;
      if (statusFilter === 'unthanked' && l.isThanked) return false;
      if (statusFilter === 'thanked' && !l.isThanked) return false;

      // Date filter
      if (dateFilter !== 'all') {
        const d = toDateFromFirestore(l.createdAt);
        if (d.getTime() === 0) return false;
        const dStr = d.toISOString().slice(0, 10);
        if (dateFilter === 'today' && dStr !== todayStr) return false;
        if (dateFilter === '7days' && now.getTime() - d.getTime() > 7 * 86400000) return false;
        if (dateFilter === '30days' && now.getTime() - d.getTime() > 30 * 86400000) return false;
        if (dateFilter === 'custom' && customDate && dStr !== customDate) return false;
      }

      return true;
    });
  }, [letters, searchTerm, statusFilter, dateFilter, customDate]);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsSigningIn(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email?.toLowerCase() !== OWNER_ADMIN_EMAIL.toLowerCase()) {
        setAuthError(`Tài khoản ${result.user.email} không phải chủ sở hữu (${OWNER_ADMIN_EMAIL}).`);
      } else if (onToast) {
        onToast('Đã mở khóa Hòm Thư Mùa Đông riêng tư của Yui');
      }
    } catch (err: any) {
      setAuthError('Không thể hoàn tất đăng nhập Google. Vui lòng thử lại.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setSelectedLetterId(null);
  };

  const handleOpenEnvelope = async (letter: WinterLetter) => {
    setSelectedLetterId(letter.id);
    if (!letter.isRead) {
      try {
        await updateWinterLetterAdmin(letter.id, { isRead: true });
      } catch {
        // silent
      }
    }
  };

  const handleToggleRead = async (letter: WinterLetter) => {
    try {
      await updateWinterLetterAdmin(letter.id, { isRead: !letter.isRead });
    } catch {
      onToast?.('Không thể cập nhật trạng thái đọc');
    }
  };

  const handleToggleThanked = async (letter: WinterLetter) => {
    try {
      await updateWinterLetterAdmin(letter.id, { isThanked: !letter.isThanked });
      onToast?.(!letter.isThanked ? 'Đã đánh dấu đã liên hệ cảm ơn' : 'Đã bỏ đánh dấu cảm ơn');
    } catch {
      onToast?.('Không thể cập nhật trạng thái cảm ơn');
    }
  };

  const handleSaveInternalNote = async () => {
    if (!selectedLetter) return;
    setIsSavingNote(true);
    try {
      await updateWinterLetterAdmin(selectedLetter.id, { internalNote: noteDraft.trim() });
      onToast?.('Đã lưu ghi chú nội bộ');
    } catch {
      onToast?.('Lỗi khi lưu ghi chú nội bộ');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!letterToDelete) return;
    try {
      await deleteWinterLetterAdmin(letterToDelete.id);
      if (selectedLetterId === letterToDelete.id) setSelectedLetterId(null);
      onToast?.('Đã xóa lá thư khỏi hòm thư');
    } catch {
      onToast?.('Không thể xóa lá thư');
    } finally {
      setLetterToDelete(null);
    }
  };

  const handleCopyContact = (text: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      onToast?.('Đã sao chép thông tin liên hệ');
    }).catch(() => {});
  };

  if (!authReady) {
    return (
      <div className="py-12 flex items-center justify-center text-xs text-[#6E899E] gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Đang kiểm tra phiên xác thực...</span>
      </div>
    );
  }

  // Gate: Require verified Google Sign-In as Owner (anhthuy241084@gmail.com)
  if (!isVerifiedOwner) {
    return (
      <div className="py-10 px-4 max-w-md mx-auto text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-3xl bg-[#E8F1F8] dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] flex items-center justify-center text-[#526B80] dark:text-[#D5E4EF]">
          <Lock className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h4 className="text-base font-bold font-serif text-[#172536] dark:text-[#F7FAFD]">
            Hòm Thư Mùa Đông Riêng Tư
          </h4>
          <p className="text-xs text-[#6E899E] dark:text-[#A9BDCE] leading-relaxed">
            Để bảo vệ thông tin liên hệ và lời nhắn của người gửi, khu vực này chỉ mở cho tài khoản chủ sở hữu của Yui ({OWNER_ADMIN_EMAIL}).
          </p>
        </div>

        {authUser && !isVerifiedOwner && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-200 space-y-2">
            <p>Bạn đang đăng nhập bằng <strong>{authUser.email}</strong> (không có quyền truy cập).</p>
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
      {/* Admin Summary Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#E8F1F8]/70 dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B] flex items-center justify-center text-[#526B80] dark:text-[#D5E4EF]">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold font-serif text-[#172536] dark:text-[#F7FAFD]">
                Hòm Thư Mùa Đông của Yui
              </h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#526B80] text-white text-[10px] font-bold">
                  {unreadCount} thư mới
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#6E899E] dark:text-[#A9BDCE]">
              Tổng {letters.length} lá thư · Đã cảm ơn {thankedCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportWinterLettersToCsv(filteredLetters)}
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

      {/* Search & Date/Status Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A9BC]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên người gửi..."
            className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-[#F7FAFD] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B] focus:outline-none focus:border-[#91A9BC]"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#91A9BC] shrink-0" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="w-full px-2.5 py-2 rounded-xl text-xs bg-[#F7FAFD] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B] focus:outline-none"
          >
            <option value="all">Tất cả ngày</option>
            <option value="today">Hôm nay</option>
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="custom">Chọn ngày cụ thể</option>
          </select>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="w-full px-2.5 py-2 rounded-xl text-xs bg-[#F7FAFD] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B] focus:outline-none"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="unread">Chưa đọc ({unreadCount})</option>
          <option value="unthanked">Chưa liên hệ cảm ơn</option>
          <option value="thanked">Đã liên hệ cảm ơn ({thankedCount})</option>
        </select>
      </div>

      {dateFilter === 'custom' && (
        <input
          type="date"
          value={customDate}
          onChange={(e) => setCustomDate(e.target.value)}
          className="px-3 py-1.5 rounded-xl text-xs bg-[#F7FAFD] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B]"
        />
      )}

      {/* Envelope Grid */}
      {filteredLetters.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#6E899E] dark:text-[#A9BDCE] font-serif space-y-2">
          <Snowflake className="w-6 h-6 mx-auto opacity-60" />
          <p>Chưa có lá thư nào khớp với bộ lọc.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredLetters.map((letter) => {
            const sentDate = toDateFromFirestore(letter.createdAt);
            const dateLabel =
              sentDate.getTime() > 0
                ? sentDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                : 'Vừa gửi';

            return (
              <button
                key={letter.id}
                type="button"
                onClick={() => handleOpenEnvelope(letter)}
                className={`group relative text-left p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 overflow-hidden ${
                  !letter.isRead
                    ? 'bg-gradient-to-br from-[#F7FAFD] to-[#E8F1F8] dark:from-[#23344A] dark:to-[#1B2A3C] border-[#91A9BC] shadow-sm'
                    : 'bg-white dark:bg-[#202F42] border-[#DCE7EF] dark:border-[#43576B] hover:border-[#91A9BC]'
                }`}
              >
                {/* Decorative envelope flap hairline */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 200 24"
                  className="absolute top-0 left-0 right-0 w-full h-5 opacity-35 pointer-events-none"
                  preserveAspectRatio="none"
                >
                  <path d="M0 0 L100 22 L200 0" stroke="#91A9BC" strokeWidth="1.2" fill="none" />
                </svg>

                <div className="flex items-start justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      !letter.isRead
                        ? 'bg-[#526B80] text-white'
                        : 'bg-[#E8F1F8] dark:bg-[#172536] text-[#6E899E]'
                    }`}>
                      {!letter.isRead ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold font-serif text-[#172536] dark:text-[#F7FAFD] truncate">
                        {letter.senderName}
                      </p>
                      <p className="text-[10px] text-[#6E899E] dark:text-[#A9BDCE]">
                        {dateLabel} · {letter.contactMethod !== 'none' ? letter.contactMethod : 'Ẩn danh liên hệ'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!letter.isRead && (
                      <span className="px-1.5 py-0.5 rounded-md bg-[#526B80] text-white text-[9px] font-bold">
                        Mới
                      </span>
                    )}
                    {letter.isThanked && (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold">
                        Đã cảm ơn
                      </span>
                    )}
                  </div>
                </div>

                {letter.donateNote && (
                  <p className="text-[11px] font-serif text-[#526B80] dark:text-[#D5E4EF] truncate">
                    Quà: {letter.donateNote}
                  </p>
                )}

                <p className="text-xs text-[#43576B] dark:text-[#A9BDCE] line-clamp-2 italic font-serif">
                  {letter.message ? `"${letter.message}"` : '(Không có lời nhắn kèm theo)'}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Envelope Reading Modal */}
      <AnimatePresence>
        {selectedLetter && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-[#172536]/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="w-full max-w-xl max-h-[88vh] flex flex-col bg-[#F7FAFD] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B] rounded-3xl shadow-2xl overflow-hidden text-[#43576B] dark:text-[#E5EDF5]"
            >
              <div className="px-5 py-4 border-b border-[#DCE7EF] dark:border-[#43576B] bg-white dark:bg-[#202F42] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <MailOpen className="w-5 h-5 text-[#526B80] dark:text-[#D5E4EF] shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold font-serif text-[#172536] dark:text-[#F7FAFD] truncate">
                      Thư từ {selectedLetter.senderName}
                    </h4>
                    <p className="text-[11px] text-[#6E899E] dark:text-[#A9BDCE]">
                      {toDateFromFirestore(selectedLetter.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLetterId(null)}
                  className="p-1.5 rounded-full hover:bg-[#E8F1F8] dark:hover:bg-[#354A60] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs">
                {/* Sender & Donate Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B]">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#91A9BC]">Tên / Biệt danh</span>
                    <p className="font-bold text-[#172536] dark:text-[#F7FAFD] mt-0.5">{selectedLetter.senderName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#91A9BC]">Tên hiển thị mong muốn</span>
                    <p className="font-medium mt-0.5">{selectedLetter.preferredDisplayName || '—'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] uppercase tracking-wider text-[#91A9BC]">Thông tin donate</span>
                    <p className="font-medium mt-0.5">{selectedLetter.donateNote || '—'}</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-[#91A9BC]">
                      Liên hệ ({selectedLetter.contactMethod === 'other' ? selectedLetter.contactPlatformName || 'Khác' : selectedLetter.contactMethod})
                    </span>
                    <p className="font-semibold text-[#172536] dark:text-[#F7FAFD] mt-0.5 break-all">
                      {selectedLetter.contactValue || 'Không để lại thông tin liên hệ'}
                    </p>
                  </div>
                  {selectedLetter.contactValue && (
                    <button
                      onClick={() => handleCopyContact(selectedLetter.contactValue)}
                      className="p-2 rounded-xl bg-[#E8F1F8] dark:bg-[#172536] hover:bg-[#D5E4EF] text-[#526B80] dark:text-[#D5E4EF] shrink-0 cursor-pointer"
                      title="Sao chép liên hệ"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Message Body */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-[#91A9BC]">Lời nhắn gửi Yui</span>
                  <p className="text-xs sm:text-sm leading-relaxed font-serif whitespace-pre-wrap text-[#172536] dark:text-[#F7FAFD]">
                    {selectedLetter.message || '(Người gửi không viết lời nhắn)'}
                  </p>
                </div>

                {/* Sender Wishes */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-[#91A9BC]">Mong muốn của người gửi</span>
                  <ul className="space-y-1 text-xs">
                    {selectedLetter.allowContactThanks && (
                      <li className="flex items-center gap-1.5 text-[#172536] dark:text-[#E5EDF5]">
                        <UserCheck className="w-3.5 h-3.5 text-[#526B80]" />
                        <span>Yui có thể liên hệ để gửi lời cảm ơn.</span>
                      </li>
                    )}
                    {selectedLetter.silentGift && (
                      <li className="flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-[#91A9BC]" />
                        <span>Chỉ muốn gửi tặng âm thầm, không cần phản hồi.</span>
                      </li>
                    )}
                    {selectedLetter.hideIdentity && (
                      <li className="flex items-center gap-1.5">
                        <EyeOff className="w-3.5 h-3.5 text-[#91A9BC]" />
                        <span>Không muốn công khai danh tính.</span>
                      </li>
                    )}
                    {selectedLetter.allowPublicNickname && (
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#526B80]" />
                        <span>Đồng ý để Yui nhắc đến biệt danh khi cảm ơn công khai.</span>
                      </li>
                    )}
                    {!selectedLetter.allowContactThanks &&
                      !selectedLetter.silentGift &&
                      !selectedLetter.hideIdentity &&
                      !selectedLetter.allowPublicNickname && (
                        <li className="text-[#91A9BC] italic">Không chọn tùy chọn nào.</li>
                      )}
                  </ul>
                </div>

                {/* Internal Note */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] space-y-2">
                  <label className="block text-[10px] uppercase tracking-wider text-[#91A9BC]">
                    Ghi chú nội bộ của Yui
                  </label>
                  <textarea
                    rows={2}
                    maxLength={2000}
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="Ghi chú riêng cho lá thư này..."
                    className="w-full p-2.5 rounded-xl bg-[#F7FAFD] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B] text-xs focus:outline-none"
                  />
                  <button
                    onClick={handleSaveInternalNote}
                    disabled={isSavingNote}
                    className="px-3.5 py-1.5 rounded-xl btn-winter-primary text-xs font-serif font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingNote ? 'Đang lưu...' : 'Lưu ghi chú'}</span>
                  </button>
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-5 py-3.5 border-t border-[#DCE7EF] dark:border-[#43576B] bg-white dark:bg-[#202F42] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleRead(selectedLetter)}
                    className="px-3 py-1.5 rounded-xl text-xs font-serif bg-[#E8F1F8] dark:bg-[#172536] text-[#526B80] dark:text-[#E5EDF5] cursor-pointer"
                  >
                    {selectedLetter.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
                  </button>

                  <button
                    onClick={() => handleToggleThanked(selectedLetter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-serif font-semibold inline-flex items-center gap-1 cursor-pointer ${
                      selectedLetter.isThanked
                        ? 'bg-emerald-600 text-white'
                        : 'btn-winter-primary'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{selectedLetter.isThanked ? 'Đã liên hệ cảm ơn' : 'Đánh dấu đã cảm ơn'}</span>
                  </button>
                </div>

                <button
                  onClick={() => setLetterToDelete(selectedLetter)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  title="Xóa lá thư"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal (No window.confirm) */}
      <AnimatePresence>
        {letterToDelete && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
              <h4 className="text-sm font-bold font-serif text-[#172536] dark:text-[#F7FAFD]">
                Xóa lá thư này?
              </h4>
              <p className="text-xs text-[#6E899E] dark:text-[#A9BDCE]">
                Lá thư từ <strong>{letterToDelete.senderName}</strong> sẽ bị xóa vĩnh viễn khỏi Hòm Thư Mùa Đông.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setLetterToDelete(null)}
                  className="px-3.5 py-1.5 rounded-xl text-xs border border-[#DCE7EF] dark:border-[#43576B] cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-3.5 py-1.5 rounded-xl text-xs bg-rose-600 text-white font-semibold cursor-pointer"
                >
                  Xóa thư
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

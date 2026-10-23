import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Heart,
  Pin,
  Eye,
  EyeOff,
  Trash2,
  Sparkles,
  Shuffle,
  Send,
  MessageSquare,
  Lock,
  KeyRound,
  Unlock,
  Edit3,
  User,
  Check,
  AlertCircle,
} from 'lucide-react';
import { BoardNote, PaperStyle } from '../types';
import { playWindChimeSfx, playSparkleSfx, triggerSfx } from '../utils/sfx';
import { triggerHeartConfetti } from '../utils/confetti';
import { AutoLinkText } from './AutoLinkText';

interface MessageBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: BoardNote[];
  onAddNote: (newNote: Omit<BoardNote, 'id' | 'createdAt' | 'likes' | 'rotation'> & { id?: string; creatorToken?: string }) => void;
  onEditNote?: (noteId: string, updatedData: Partial<Pick<BoardNote, 'author' | 'content' | 'paperStyle' | 'decoration'>>) => void;
  onLikeNote: (noteId: string) => void;
  onPinNote?: (noteId: string) => void;
  onHideNote?: (noteId: string) => void;
  onDeleteNote?: (noteId: string) => void;
  isAdmin?: boolean;
}

const PAPER_STYLES: {
  id: PaperStyle;
  name: string;
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  textLight: string;
  textDark: string;
  tapeBg: string;
}[] = [
  {
    id: 'pink',
    name: 'Giấy hồng nhạt',
    bgLight: 'bg-pink-50/95',
    bgDark: 'dark:bg-pink-950/40',
    borderLight: 'border-pink-200',
    borderDark: 'dark:border-pink-800/60',
    textLight: 'text-pink-950',
    textDark: 'dark:text-pink-100',
    tapeBg: 'bg-pink-200/80 dark:bg-pink-900/50',
  },
  {
    id: 'cream',
    name: 'Giấy kem',
    bgLight: 'bg-amber-50/95',
    bgDark: 'dark:bg-amber-950/40',
    borderLight: 'border-pink-200/80',
    borderDark: 'dark:border-pink-800/60',
    textLight: 'text-amber-950',
    textDark: 'dark:text-amber-100',
    tapeBg: 'bg-pink-200/60 dark:bg-pink-900/40',
  },
  {
    id: 'lavender',
    name: 'Giấy tím nhạt',
    bgLight: 'bg-purple-50/95',
    bgDark: 'dark:bg-purple-950/40',
    borderLight: 'border-pink-200/80',
    borderDark: 'dark:border-pink-800/60',
    textLight: 'text-purple-950',
    textDark: 'dark:text-purple-100',
    tapeBg: 'bg-pink-200/60 dark:bg-pink-900/40',
  },
  {
    id: 'blue',
    name: 'Giấy xanh nhạt',
    bgLight: 'bg-sky-50/95',
    bgDark: 'dark:bg-sky-950/40',
    borderLight: 'border-pink-200/80',
    borderDark: 'dark:border-pink-800/60',
    textLight: 'text-sky-950',
    textDark: 'dark:text-sky-100',
    tapeBg: 'bg-pink-200/60 dark:bg-pink-900/40',
  },
  {
    id: 'white',
    name: 'Giấy trắng mềm',
    bgLight: 'bg-white/95',
    bgDark: 'dark:bg-slate-800/90',
    borderLight: 'border-pink-200/80',
    borderDark: 'dark:border-pink-800/60',
    textLight: 'text-slate-800',
    textDark: 'dark:text-slate-100',
    tapeBg: 'bg-pink-200/60 dark:bg-pink-900/40',
  },
];

function formatRelativeTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 10) return 'Vừa xong';
    if (diffSec < 60) return `${diffSec}s trước`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}p trước`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h trước`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay} ngày trước`;
    return d.toLocaleDateString('vi-VN');
  } catch (e) {
    return dateStr;
  }
}

export const MessageBoardModal: React.FC<MessageBoardModalProps> = ({
  isOpen,
  onClose,
  notes,
  onAddNote,
  onEditNote,
  onLikeNote,
  onPinNote,
  onHideNote,
  onDeleteNote,
  isAdmin = false,
}) => {
  // Sorting and view filter mode
  const [sortMode, setSortMode] = useState<'newest' | 'oldest' | 'random'>('newest');
  const [filterView, setFilterView] = useState<'all' | 'mine'>('all');
  const [randomSeed, setRandomSeed] = useState(0);

  // Device / Author Identifier for ownership
  const [deviceId] = useState<string>(() => {
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

  // Local storage of note IDs created on this browser
  const [myNoteIds, setMyNoteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('yui_my_board_notes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('yui_my_board_notes', JSON.stringify(myNoteIds));
    } catch (e) {}
  }, [myNoteIds]);

  // Check if current user is owner of a note (Only the author who created the note on this device/token owns it, NOT admin)
  const isMyNote = (note: BoardNote): boolean => {
    if (myNoteIds.includes(note.id)) return true;
    if (note.creatorToken && note.creatorToken === deviceId) return true;
    return false;
  };

  // Create Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [authorInput, setAuthorInput] = useState(() => {
    try {
      return localStorage.getItem('yui_last_author_name') || '';
    } catch {
      return '';
    }
  });
  const [contentInput, setContentInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPaper, setSelectedPaper] = useState<PaperStyle>('pink');
  const [selectedDecoration, setSelectedDecoration] = useState<'pin' | 'tape' | 'ribbon'>('tape');
  const [formError, setFormError] = useState('');

  // Edit Note Modal State
  const [editingNote, setEditingNote] = useState<BoardNote | null>(null);
  const [editAuthor, setEditAuthor] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editPaper, setEditPaper] = useState<PaperStyle>('pink');
  const [editDecoration, setEditDecoration] = useState<'pin' | 'tape' | 'ribbon'>('tape');
  const [editError, setEditError] = useState('');

  // Delete Confirmation Modal State
  const [deleteConfirmNote, setDeleteConfirmNote] = useState<BoardNote | null>(null);

  // Admin Verification state for Pinning / Moderating Notes
  const [isAdminVerified, setIsAdminVerified] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('yui_admin_verified') === 'true';
    } catch {
      return false;
    }
  });
  const [adminAuthPrompt, setAdminAuthPrompt] = useState<{
    isOpen: boolean;
    noteId: string | null;
    action: 'pin';
  }>({
    isOpen: false,
    noteId: null,
    action: 'pin',
  });
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Floating banner & particle FX state
  const [newNoteBanner, setNewNoteBanner] = useState(false);
  const [particles, setParticles] = useState<{ id: number; symbol: string; x: number; y: number }[]>([]);

  // Local state for user liked notes
  const [likedNoteIds, setLikedNoteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('yui_liked_board_notes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('yui_liked_board_notes', JSON.stringify(likedNoteIds));
    } catch (e) {}
  }, [likedNoteIds]);

  // Focus password input when prompt opens
  useEffect(() => {
    if (adminAuthPrompt.isOpen) {
      setAdminPasswordInput('');
      setAdminAuthError('');
      const t = setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(t);
    }
  }, [adminAuthPrompt.isOpen]);

  const effectiveIsAdmin = isAdmin || isAdminVerified;

  // Filter visible notes
  const visibleNotes = useMemo(() => {
    let list = notes.filter((n) => effectiveIsAdmin || !n.isHidden);
    if (filterView === 'mine') {
      list = list.filter((n) => isMyNote(n));
    }
    return list;
  }, [notes, effectiveIsAdmin, filterView, myNoteIds, deviceId]);

  const myNotesCount = useMemo(() => {
    return notes.filter((n) => isMyNote(n)).length;
  }, [notes, myNoteIds, deviceId, effectiveIsAdmin]);

  // Separate pinned and unpinned notes
  const pinnedNotes = useMemo(() => {
    return visibleNotes.filter((n) => n.isPinned);
  }, [visibleNotes]);

  const unpinnedNotes = useMemo(() => {
    const list = visibleNotes.filter((n) => !n.isPinned);
    if (sortMode === 'oldest') {
      return [...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortMode === 'random') {
      const shuffled = [...list];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = (i * 3 + randomSeed + 7) % shuffled.length;
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    } else {
      // Newest
      return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [visibleNotes, sortMode, randomSeed]);

  const handleShuffleRandom = () => {
    setSortMode('random');
    setRandomSeed((prev) => prev + 1);
    triggerSfx('pop');
  };

  const handleToggleLike = (noteId: string) => {
    onLikeNote(noteId);
    triggerSfx('heart');
    triggerHeartConfetti(0.5, 0.5);
    setLikedNoteIds((prev) =>
      prev.includes(noteId) ? prev.filter((id) => id !== noteId) : [...prev, noteId]
    );
  };

  // Open Edit Modal for a Note
  const handleOpenEdit = (note: BoardNote) => {
    setEditingNote(note);
    setEditAuthor(note.author);
    setEditContent(note.content);
    setEditPaper(note.paperStyle);
    setEditDecoration(note.decoration || 'tape');
    setEditError('');
    triggerSfx('pop');
  };

  // Submit Edit Form
  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;

    const trimmedAuthor = editAuthor.trim();
    const trimmedContent = editContent.trim();

    if (!trimmedAuthor) {
      setEditError('Vui lòng nhập tên của bạn ♡');
      return;
    }
    if (!trimmedContent) {
      setEditError('Vui lòng viết nội dung lời nhắn ♡');
      return;
    }

    if (onEditNote) {
      onEditNote(editingNote.id, {
        author: trimmedAuthor,
        content: trimmedContent,
        paperStyle: editPaper,
        decoration: editDecoration,
      });
    }

    playSparkleSfx(0.5);
    triggerSfx('sparkle');
    setEditingNote(null);
  };

  // Request Delete Note (Opens friendly confirmation dialog)
  const handleRequestDelete = (note: BoardNote) => {
    setDeleteConfirmNote(note);
    triggerSfx('pop');
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deleteConfirmNote) return;
    const targetId = deleteConfirmNote.id;

    if (onDeleteNote) {
      onDeleteNote(targetId);
    }

    // Remove from local note IDs tracking
    setMyNoteIds((prev) => prev.filter((id) => id !== targetId));
    setDeleteConfirmNote(null);
    triggerSfx('pop');
  };

  // Secure Action Interceptor: Require Admin password for Pinning / Admin Moderation
  const handleRequestPin = (noteId: string) => {
    if (effectiveIsAdmin) {
      if (onPinNote) onPinNote(noteId);
      triggerSfx('pop');
    } else {
      setAdminAuthPrompt({
        isOpen: true,
        noteId,
        action: 'pin',
      });
    }
  };

  const handleRequestHide = (noteId: string) => {
    if (effectiveIsAdmin) {
      if (onHideNote) onHideNote(noteId);
    } else {
      setAdminAuthPrompt({
        isOpen: true,
        noteId,
        action: 'hide',
      });
    }
  };

  const handleVerifyAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = adminPasswordInput.trim();
    const customPass = localStorage.getItem('yui_admin_password');
    const validPasswords = customPass
      ? [customPass, 'Yuicreator', 'yuicreator']
      : ['Yuicreator', 'yuicreator'];

    if (validPasswords.includes(entered)) {
      setIsAdminVerified(true);
      try {
        sessionStorage.setItem('yui_admin_verified', 'true');
      } catch (err) {}
      playSparkleSfx(0.4);

      const targetNoteId = adminAuthPrompt.noteId;
      if (targetNoteId && onPinNote) {
        onPinNote(targetNoteId);
      }

      setAdminAuthPrompt({ isOpen: false, noteId: null, action: 'pin' });
      setAdminPasswordInput('');
      setAdminAuthError('');
    } else {
      setAdminAuthError('Mật khẩu không chính xác. Vui lòng thử lại ♡');
      setShakeKey((prev) => prev + 1);
      setAdminPasswordInput('');
      passwordInputRef.current?.focus();
    }
  };

  const handleSubmitNewNote = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedAuthor = authorInput.trim();
    const trimmedContent = contentInput.trim();

    if (!trimmedAuthor) {
      setFormError('Vui lòng nhập tên của bạn ♡');
      return;
    }
    if (!trimmedContent) {
      setFormError('Vui lòng viết nội dung lời nhắn ♡');
      return;
    }

    try {
      localStorage.setItem('yui_last_author_name', trimmedAuthor);
    } catch (e) {}

    const newNoteId = 'note-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

    onAddNote({
      id: newNoteId,
      author: trimmedAuthor,
      content: trimmedContent,
      imageUrl: imagePreview || undefined,
      paperStyle: selectedPaper,
      decoration: selectedDecoration,
      creatorToken: deviceId,
    });

    // Automatically register this note ID to user's device ownership
    setMyNoteIds((prev) => [...prev, newNoteId]);

    setContentInput('');
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setFormError('');
    setIsFormOpen(false);

    playWindChimeSfx(0.6);
    triggerSfx('sparkle');

    const symbols = ['♡', '✦', '୨୧', '·', '🎀', '✨'];
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 60,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1800);

    setNewNoteBanner(true);
    setTimeout(() => setNewNoteBanner(false), 4500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl h-[92vh] max-h-[850px] bg-pink-50/95 dark:bg-slate-900/95 border-2 border-pink-200 dark:border-pink-800/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 ring-4 ring-pink-100/70 dark:ring-pink-950/40"
        >
          {/* Subtle Twinkling Stars in Dark Mode */}
          <div className="absolute inset-0 pointer-events-none hidden dark:block opacity-30 overflow-hidden">
            <span className="absolute top-6 left-12 text-xs text-pink-300 animate-pulse">✦</span>
            <span className="absolute top-16 right-20 text-xs text-pink-200 animate-ping">˚</span>
            <span className="absolute bottom-20 left-1/4 text-xs text-pink-300 animate-pulse">✦</span>
            <span className="absolute bottom-10 right-12 text-xs text-pink-200">✦</span>
            <span className="absolute top-1/3 right-1/3 text-xs text-pink-200 animate-pulse">˚</span>
          </div>

          {/* Particle Explosions on Submit */}
          <AnimatePresence>
            {particles.map((p) => (
              <motion.span
                key={p.id}
                initial={{ opacity: 1, scale: 0.5, y: 0 }}
                animate={{ opacity: 0, scale: 1.6, y: -40 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                className="absolute z-40 text-pink-400 font-bold text-lg pointer-events-none select-none drop-shadow-md"
              >
                {p.symbol}
              </motion.span>
            ))}
          </AnimatePresence>

          {/* Modal Header */}
          <div className="relative px-5 py-4 sm:px-8 sm:py-5 border-b border-pink-200/80 dark:border-pink-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between gap-3 shrink-0 z-20">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-pink-400">♡</span>
                <span>Một chút lời để lại</span>
                <span className="text-pink-400">♡</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                “Có điều gì muốn để lại cho góc nhỏ này không? Bạn có thể chỉnh sửa & xóa lời nhắn của mình bất cứ lúc nào ♡”
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Add Note Button */}
              <button
                onClick={() => {
                  setIsFormOpen(true);
                  triggerSfx('pop');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-pink-400 hover:bg-pink-500 text-white text-xs font-bold shadow-md shadow-pink-200/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Để lại một lời nhắn</span>
                <span className="sm:hidden">Viết nhắn</span>
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-pink-100/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Đóng modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Newly Added Floating Banner Notice */}
          <AnimatePresence>
            {newNoteBanner && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-5 mt-3 sm:mx-8 px-4 py-2 bg-pink-400 text-white rounded-2xl text-xs font-bold shadow-md flex items-center justify-between gap-2 z-20"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>♡ Một lời nhắn mới vừa được để lại trên bảng. Bạn có thể sửa hoặc xóa bất cứ lúc nào!</span>
                </div>
                <span className="text-[10px] opacity-90 font-normal">vừa xong</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subheader Toolbar: Filter Tabs & Sorting */}
          <div className="px-5 py-2.5 sm:px-8 bg-pink-100/60 dark:bg-slate-900/60 border-b border-pink-200/60 dark:border-pink-900/40 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs z-10">
            {/* Filter Tabs: All vs Mine */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 bg-white/90 dark:bg-slate-800/80 p-0.5 rounded-full border border-pink-200 dark:border-slate-700">
                <button
                  onClick={() => {
                    setFilterView('all');
                    triggerSfx('pop');
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    filterView === 'all'
                      ? 'bg-pink-400 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Tất cả ({notes.filter((n) => effectiveIsAdmin || !n.isHidden).length})
                </button>
                <button
                  onClick={() => {
                    setFilterView('mine');
                    triggerSfx('pop');
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                    filterView === 'mine'
                      ? 'bg-pink-400 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>Lời nhắn của tôi</span>
                  {myNotesCount > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        filterView === 'mine' ? 'bg-white text-pink-500' : 'bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-300'
                      }`}
                    >
                      {myNotesCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Sorting Tabs */}
            <div className="flex items-center gap-1 bg-white/90 dark:bg-slate-800/80 p-0.5 rounded-full border border-pink-200 dark:border-slate-700">
              <button
                onClick={() => setSortMode('newest')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  sortMode === 'newest'
                    ? 'bg-pink-400 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Mới nhất
              </button>
              <button
                onClick={() => setSortMode('oldest')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  sortMode === 'oldest'
                    ? 'bg-pink-400 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Cũ nhất
              </button>
              <button
                onClick={handleShuffleRandom}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                  sortMode === 'random'
                    ? 'bg-pink-400 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Xáo trộn thứ tự ngẫu nhiên các lời nhắn đã có"
              >
                <Shuffle className="w-3 h-3" />
                <span>Ngẫu nhiên</span>
              </button>
            </div>
          </div>

          {/* Board Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 relative custom-scrollbar bg-gradient-to-b from-pink-50/50 via-pink-100/30 to-pink-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Soft Board Texture Lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#ec4899_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-10 dark:opacity-15 pointer-events-none" />

            {visibleNotes.length === 0 ? (
              /* Empty State */
              <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-center p-6 my-auto relative z-10">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-20 h-20 rounded-full bg-pink-100 dark:bg-pink-950/60 border-2 border-dashed border-pink-300 dark:border-pink-800 flex items-center justify-center text-3xl mb-4 shadow-sm"
                >
                  ✉️
                </motion.div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
                  {filterView === 'mine' ? 'Bạn chưa để lại lời nhắn nào...' : 'Bảng vẫn còn trống... ♡'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-5">
                  {filterView === 'mine'
                    ? 'Hãy viết một lời nhắn để gửi vào góc nhỏ xinh xắn này nhé!'
                    : 'Ai sẽ là người để lại lời nhắn đầu tiên cho góc nhỏ nhỉ?'}
                </p>
                <button
                  onClick={() => {
                    setIsFormOpen(true);
                    triggerSfx('pop');
                  }}
                  className="px-5 py-2.5 rounded-full bg-pink-400 hover:bg-pink-500 text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>＋ Để lại một lời nhắn</span>
                </button>
              </div>
            ) : (
              <div className="space-y-8 relative z-10 pb-8">
                {/* Pinned Notes Section */}
                {pinnedNotes.length > 0 && filterView === 'all' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-pink-600 dark:text-pink-300 border-b border-pink-200/80 dark:border-pink-900/60 pb-1.5">
                      <span className="text-base">୨୧</span>
                      <span>Lời nhắn được ghim lên đầu bảng</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {pinnedNotes.map((note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          isOwner={isMyNote(note)}
                          isLiked={likedNoteIds.includes(note.id)}
                          onLike={() => handleToggleLike(note.id)}
                          onEdit={() => handleOpenEdit(note)}
                          onDelete={() => handleRequestDelete(note)}
                          onPin={() => handleRequestPin(note.id)}
                          onHide={() => handleRequestHide(note.id)}
                          isAdmin={effectiveIsAdmin}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Notes Grid */}
                <div className="space-y-3">
                  {pinnedNotes.length > 0 && filterView === 'all' && (
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 border-b border-pink-200/60 dark:border-slate-800 pb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                      <span>Các lời nhắn từ bạn bè</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 auto-rows-max">
                    {(filterView === 'all' ? unpinnedNotes : visibleNotes).map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        isOwner={isMyNote(note)}
                        isLiked={likedNoteIds.includes(note.id)}
                        onLike={() => handleToggleLike(note.id)}
                        onEdit={() => handleOpenEdit(note)}
                        onDelete={() => handleRequestDelete(note)}
                        onPin={() => handleRequestPin(note.id)}
                        onHide={() => handleRequestHide(note.id)}
                        isAdmin={effectiveIsAdmin}
                        onZoomImage={(url) => setZoomedImageUrl(url)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Form Modal: Create New Message */}
        <AnimatePresence>
          {isFormOpen && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-md bg-white dark:bg-slate-900 border border-pink-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-900 dark:text-slate-100"
              >
                <div className="flex items-center justify-between border-b border-pink-100 dark:border-slate-800 pb-3 mb-4">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="text-pink-400">♡</span>
                    <span>Tạo lời nhắn mới</span>
                    <span className="text-pink-400">♡</span>
                  </h3>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmitNewNote} className="space-y-4">
                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tên người nhắn <span className="text-pink-400">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={30}
                      value={authorInput}
                      onChange={(e) => {
                        setAuthorInput(e.target.value);
                        setFormError('');
                      }}
                      placeholder="Nhập tên của bạn..."
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-pink-200/80 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-pink-300 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Content Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nội dung lời nhắn <span className="text-pink-400">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={contentInput}
                      onChange={(e) => {
                        setContentInput(e.target.value);
                        setFormError('');
                      }}
                      placeholder="Viết một điều gì đó ở đây..."
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-pink-200/80 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-pink-300 text-slate-900 dark:text-white leading-relaxed resize-none"
                    />
                    <p className="text-[10px] text-right text-slate-400 mt-1">
                      {contentInput.length} ký tự (không giới hạn)
                    </p>
                  </div>

                  {/* Image Attachment Section */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Ảnh đính kèm (không bắt buộc)
                    </label>
                    
                    {imagePreview ? (
                      <div className="relative rounded-2xl overflow-hidden border border-pink-200 bg-pink-50/50 p-2 flex items-center gap-3">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded-xl border border-pink-200 shadow-xs cursor-pointer hover:opacity-95 transition-opacity"
                          onClick={() => setZoomedImageUrl(imagePreview)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                            Đã đính kèm ảnh ♡
                          </p>
                          <p className="text-[10px] text-slate-400">Nhấn vào ảnh để xem lớn</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="p-1.5 rounded-xl bg-[#E0F3F5] text-[#1B6E7D] dark:text-[#48CCD6] hover:bg-[#D0EBF0] text-xs font-bold transition-colors cursor-pointer"
                          title="Gỡ ảnh"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (uploadEvent) => {
                                const result = uploadEvent.target?.result as string;
                                if (result) {
                                  setImagePreview(result);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2.5 rounded-2xl bg-pink-100/70 hover:bg-pink-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-pink-600 dark:text-pink-300 border border-pink-200 dark:border-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                          <span>＋ Thêm ảnh</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Paper Style Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Màu giấy dán
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {PAPER_STYLES.map((paper) => (
                        <button
                          key={paper.id}
                          type="button"
                          onClick={() => setSelectedPaper(paper.id)}
                          className={`p-2 rounded-xl text-[11px] font-semibold border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                            paper.bgLight
                          } ${paper.borderLight} ${
                            selectedPaper === paper.id
                              ? 'ring-2 ring-pink-400 scale-105 shadow-xs'
                              : 'opacity-80 hover:opacity-100'
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs" />
                          <span className="text-[9px] truncate w-full text-slate-700 dark:text-slate-200">
                            {paper.name.replace('Giấy ', '')}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Error Message */}
                  {formError && (
                    <p className="text-xs text-pink-500 font-medium bg-pink-50 dark:bg-pink-950/50 p-2 rounded-xl border border-pink-200 text-center">
                      {formError}
                    </p>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-2xl bg-pink-400 hover:bg-pink-500 text-white text-xs font-extrabold shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>♡ Để lại lời nhắn</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Edit Existing Note */}
        <AnimatePresence>
          {editingNote && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 15 }}
                className="w-full max-w-md bg-white dark:bg-slate-900 border border-pink-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-900 dark:text-slate-100"
              >
                <div className="flex items-center justify-between border-b border-pink-100 dark:border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-500 flex items-center justify-center">
                      <Edit3 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        Chỉnh sửa lời nhắn
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Cập nhật nội dung hoặc màu giấy dán
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingNote(null)}
                    className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmitEdit} className="space-y-4">
                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tên người nhắn <span className="text-pink-400">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={30}
                      value={editAuthor}
                      onChange={(e) => {
                        setEditAuthor(e.target.value);
                        setEditError('');
                      }}
                      placeholder="Nhập tên..."
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-pink-200/80 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-pink-300 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Content Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nội dung lời nhắn <span className="text-pink-400">*</span>
                    </label>
                    <textarea
                      rows={4}
                      maxLength={280}
                      value={editContent}
                      onChange={(e) => {
                        setEditContent(e.target.value);
                        setEditError('');
                      }}
                      placeholder="Nội dung lời nhắn..."
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-pink-200/80 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-pink-300 text-slate-900 dark:text-white leading-relaxed resize-none"
                    />
                    <p className="text-[10px] text-right text-slate-400 mt-1">
                      {editContent.length}/280 ký tự
                    </p>
                  </div>

                  {/* Paper Style Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Màu giấy dán
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {PAPER_STYLES.map((paper) => (
                        <button
                          key={paper.id}
                          type="button"
                          onClick={() => setEditPaper(paper.id)}
                          className={`p-2 rounded-xl text-[11px] font-semibold border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                            paper.bgLight
                          } ${paper.borderLight} ${
                            editPaper === paper.id
                              ? 'ring-2 ring-pink-400 scale-105 shadow-xs'
                              : 'opacity-80 hover:opacity-100'
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs" />
                          <span className="text-[9px] truncate w-full text-slate-700 dark:text-slate-200">
                            {paper.name.replace('Giấy ', '')}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Error Message */}
                  {editError && (
                    <p className="text-xs text-pink-500 font-medium bg-pink-50 dark:bg-pink-950/50 p-2 rounded-xl border border-pink-200 text-center">
                      {editError}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingNote(null)}
                      className="flex-1 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-2xl bg-pink-400 hover:bg-pink-500 text-white text-xs font-extrabold shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Lưu thay đổi ♡</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Delete Confirmation */}
        <AnimatePresence>
          {deleteConfirmNote && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 15 }}
                className="w-full max-w-sm bg-white dark:bg-[#0E232E] border border-[#38CAD6]/30 dark:border-[#38CAD6]/20 rounded-3xl p-6 shadow-2xl relative text-[#14303A] dark:text-[#E4F7F9] text-center"
              >
                <div className="w-12 h-12 rounded-full bg-[#E0F3F5] dark:bg-[#091D26] text-[#1B6E7D] dark:text-[#48CCD6] mx-auto flex items-center justify-center mb-3">
                  <Trash2 className="w-6 h-6 stroke-[2]" />
                </div>

                <h3 className="text-base font-extrabold text-[#14303A] dark:text-white mb-1 font-serif">
                  Xóa lời nhắn của bạn?
                </h3>
                <p className="text-xs text-[#53737C] dark:text-[#88A9B3] mb-4 leading-relaxed font-serif">
                  Bạn có chắc muốn xóa lời nhắn của “<strong className="text-[#14303A] dark:text-[#E4F7F9]">{deleteConfirmNote.author}</strong>” không? Hành động này sẽ gỡ lời nhắn khỏi bảng tin ♡
                </p>

                {/* Preview Snippet */}
                <div className="p-3 rounded-2xl bg-[#F2FBFC] dark:bg-[#07171F] border border-[#38CAD6]/20 dark:border-[#132F3D] text-left mb-4 text-xs font-serif italic text-[#53737C] dark:text-[#88A9B3] line-clamp-3">
                  “{deleteConfirmNote.content}”
                </div>

                <div className="flex items-center gap-2 font-serif">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmNote(null)}
                    className="flex-1 py-2.5 rounded-2xl bg-[#E8F7F9] hover:bg-[#DDF2F5] dark:bg-[#132F3D] dark:hover:bg-[#1A3D4D] text-[#14303A] dark:text-[#E4F7F9] text-xs font-bold transition-all cursor-pointer"
                  >
                    Hủy giữ lại
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-[#38CAD6] to-[#1B6E7D] hover:from-[#48CCD6] hover:to-[#38CAD6] text-white text-xs font-extrabold shadow-md shadow-[#1B6E7D]/20 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xác nhận xóa</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Admin Password Verification Modal for Pinning/Actions */}
        <AnimatePresence>
          {adminAuthPrompt.isOpen && (
            <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 15 }}
                className="w-full max-w-sm bg-white dark:bg-slate-900 border border-pink-200 dark:border-pink-900/60 rounded-3xl p-6 shadow-2xl relative text-slate-900 dark:text-slate-100 overflow-hidden"
              >
                {/* Close button */}
                <button
                  onClick={() => setAdminAuthPrompt({ isOpen: false, noteId: null, action: 'pin' })}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-4 text-center">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-pink-50 dark:bg-pink-950/60 text-pink-500 border border-pink-200 dark:border-pink-800 flex items-center justify-center shadow-xs">
                    <Lock className="w-5 h-5 stroke-[2.2]" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                      <span className="text-pink-400 text-xs">୨୧</span>
                      <span>Xác nhận Quản trị viên</span>
                      <span className="text-pink-400 text-xs">୨୧</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                      Vui lòng nhập mật khẩu quản trị để ghim lời nhắn lên bảng ♡
                    </p>
                  </div>

                  <form onSubmit={handleVerifyAdminPassword} className="space-y-3.5 text-left">
                    <div>
                      <motion.div
                        key={shakeKey}
                        animate={shakeKey > 0 ? { x: [0, -5, 5, -3, 3, 0] } : { x: 0 }}
                        transition={{ duration: 0.35 }}
                        className="relative"
                      >
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <KeyRound className="w-4 h-4 text-pink-400" />
                        </div>
                        <input
                          ref={passwordInputRef}
                          type={showAdminPassword ? 'text' : 'password'}
                          value={adminPasswordInput}
                          onChange={(e) => {
                            setAdminPasswordInput(e.target.value);
                            if (adminAuthError) setAdminAuthError('');
                          }}
                          placeholder="Nhập mật khẩu..."
                          className="w-full pl-10 pr-10 py-2.5 bg-pink-50/40 dark:bg-slate-800/80 border border-pink-200/80 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-400/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminPassword(!showAdminPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-pink-500 transition-colors cursor-pointer"
                          title={showAdminPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showAdminPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </motion.div>
                    </div>

                    {adminAuthError && (
                      <p className="text-xs text-pink-500 font-bold bg-pink-50 dark:bg-pink-950/60 p-2 rounded-xl border border-pink-200 text-center">
                        {adminAuthError}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-2xl bg-pink-400 hover:bg-pink-500 active:scale-[0.98] text-white text-xs font-extrabold shadow-md shadow-pink-200/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Xác nhận & Ghim</span>
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Zoomed Image Modal */}
        <AnimatePresence>
          {zoomedImageUrl && (
            <div
              className="fixed inset-0 z-80 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md cursor-zoom-out"
              onClick={() => setZoomedImageUrl(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={zoomedImageUrl}
                  alt="Zoomed full"
                  className="w-full h-auto max-h-[85vh] object-contain rounded-2xl border border-white/20 shadow-2xl"
                />
                <button
                  onClick={() => setZoomedImageUrl(null)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white shadow-lg transition-colors cursor-pointer"
                  title="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};

/* Individual Note Card Component */
interface NoteCardProps {
  note: BoardNote;
  isOwner: boolean;
  isLiked: boolean;
  onLike: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPin: () => void;
  onHide: () => void;
  isAdmin: boolean;
  onZoomImage: (url: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isOwner,
  isLiked,
  onLike,
  onEdit,
  onDelete,
  onPin,
  onHide,
  isAdmin,
  onZoomImage,
}) => {
  const paper =
    PAPER_STYLES.find((p) => p.id === note.paperStyle) || PAPER_STYLES[0];
  const rot = note.rotation || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -35, scale: 0.9, rotate: rot }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        rotate: [rot - 5, rot + 5, rot - 2.5, rot + 2.5, rot],
      }}
      whileHover={{
        y: -6,
        scale: 1.02,
        rotate: 0,
        boxShadow:
          '0 20px 25px -5px rgba(244, 114, 182, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }}
      whileTap={{ y: -2, scale: 1.01 }}
      transition={{
        y: { duration: 0.45, ease: 'easeOut' },
        opacity: { duration: 0.35 },
        scale: { duration: 0.45 },
        rotate: { duration: 0.65, ease: 'easeInOut', delay: 0.2 },
      }}
      className={`relative p-5 rounded-2xl border ${paper.bgLight} ${paper.bgDark} ${paper.borderLight} ${paper.borderDark} ${paper.textLight} ${paper.textDark} shadow-sm transition-all flex flex-col justify-between min-h-[180px] select-none ${
        note.isHidden ? 'opacity-50 ring-2 ring-pink-300' : ''
      }`}
    >
      {/* Top Decoration: Tape / Push Pin / Ribbon */}
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        {note.decoration === 'pin' ? (
          <div className="w-5 h-5 rounded-full bg-pink-400 shadow-md border-2 border-white flex items-center justify-center text-[10px] text-white font-extrabold">
            📌
          </div>
        ) : note.decoration === 'ribbon' || note.isPinned ? (
          <div className="px-2.5 py-0.5 rounded-full bg-pink-400 text-white text-[10px] font-bold shadow-xs flex items-center gap-1 border border-white">
            <span>୨୧</span>
          </div>
        ) : (
          <div
            className={`w-12 h-3.5 ${paper.tapeBg} border border-white/60 dark:border-black/30 backdrop-blur-xs rounded-xs shadow-2xs rotate-1`}
          />
        )}
      </div>

      {/* Admin Hidden Badge */}
      {note.isHidden && (
        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-pink-400 text-white text-[9px] font-bold">
          [Đã ẩn]
        </div>
      )}

      {/* Card Header & Author */}
      <div className="pt-1">
        <div className="flex items-center justify-between gap-2 border-b border-pink-200/50 dark:border-white/10 pb-2 mb-2.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-extrabold text-sm tracking-tight flex items-center gap-1 truncate">
              {note.isPinned && <span className="text-pink-400 text-xs shrink-0">୨୧</span>}
              <span className="truncate">{note.author}</span>
            </span>

            {/* "My Note" Badge */}
            {isOwner && (
              <span className="shrink-0 text-[9px] font-bold text-pink-600 dark:text-pink-300 bg-pink-100/90 dark:bg-pink-950/80 px-1.5 py-0.5 rounded-full border border-pink-200/80 dark:border-pink-800/80 flex items-center gap-0.5">
                <span>♡ Của bạn</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] opacity-60 font-mono">
              {formatRelativeTime(note.createdAt)}
            </span>
            {note.updatedAt && (
              <span className="text-[9px] text-pink-400 opacity-80" title="Đã chỉnh sửa">
                (đã sửa)
              </span>
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className="text-xs leading-relaxed font-serif italic opacity-90 break-words whitespace-pre-wrap">
          “<AutoLinkText text={note.content} />”
        </div>

        {/* Attached Image inside Note */}
        {note.imageUrl && (
          <div className="mt-3">
            <img
              src={note.imageUrl}
              alt="Attached note visual"
              onClick={() => onZoomImage(note.imageUrl!)}
              className="w-full max-h-48 object-cover rounded-xl border border-pink-200/80 shadow-xs cursor-pointer hover:opacity-95 hover:scale-[1.01] transition-all"
              title="Nhấn để phóng to ảnh"
            />
          </div>
        )}
      </div>

      {/* Card Footer: Likes & Action Tools (Edit & Delete for Owner & Admin) */}
      <div className="pt-4 border-t border-pink-200/50 dark:border-white/10 flex items-center justify-between gap-2 mt-2">
        {/* Like Button */}
        <button
          onClick={onLike}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all active:scale-90 cursor-pointer ${
            isLiked
              ? 'bg-pink-400 text-white shadow-xs'
              : 'bg-black/5 dark:bg-white/10 hover:bg-pink-100 dark:hover:bg-pink-950/60 text-slate-700 dark:text-slate-200'
          }`}
          title="Thả tim cho lời nhắn này"
        >
          <motion.span
            animate={isLiked ? { scale: [1, 1.4, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {isLiked ? '♥' : '♡'}
          </motion.span>
          <span className="text-[11px]">{note.likes || 0}</span>
        </button>

        {/* Action Buttons: Edit, Delete (Owner only), Pin (Admin) */}
        <div className="flex items-center gap-1">
          {/* Owner-only Edit Button */}
          {isOwner && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#E0F3F5] dark:bg-[#132F3D] hover:bg-[#D0EBF0] text-[#1B6E7D] dark:text-[#48CCD6] text-[11px] font-bold transition-colors cursor-pointer border border-[#38CAD6]/40 active:scale-95"
              title="Chỉnh sửa lời nhắn của bạn"
            >
              <Edit3 className="w-3 h-3" />
              <span>Sửa</span>
            </button>
          )}

          {/* Owner-only Delete Button */}
          {isOwner && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-[#1B6E7D] hover:text-white text-[#1B6E7D] dark:text-[#48CCD6] opacity-80 hover:opacity-100 text-xs transition-colors cursor-pointer active:scale-95"
              title="Xóa lời nhắn của bạn"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Pin Button (with Admin check / Prompt) */}
          <button
            onClick={onPin}
            className={`p-1.5 rounded-lg text-xs transition-all active:scale-90 cursor-pointer ${
              note.isPinned
                ? 'bg-[#38CAD6] text-white shadow-xs'
                : 'hover:bg-[#E0F3F5] dark:hover:bg-white/10 opacity-70 hover:opacity-100 text-slate-600 dark:text-slate-300'
            }`}
            title={note.isPinned ? 'Bỏ ghim lời nhắn (Admin)' : 'Ghim lời nhắn lên đầu (Admin)'}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>

          {/* Admin Hide Toggle */}
          {isAdmin && (
            <button
              onClick={onHide}
              className="p-1.5 rounded-lg hover:bg-pink-100 dark:hover:bg-white/10 opacity-70 hover:opacity-100 text-xs transition-colors cursor-pointer"
              title={note.isHidden ? 'Hiện lời nhắn' : 'Ẩn lời nhắn'}
            >
              {note.isHidden ? (
                <Eye className="w-3.5 h-3.5 text-pink-500" />
              ) : (
                <EyeOff className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bookmark,
  X,
  Search,
  Trash2,
  Grid,
  List,
  BookOpen,
  Snowflake,
  Tag,
  Globe,
} from 'lucide-react';
import { Character, CharacterBookmark } from '../types';
import { CharacterCard } from './CharacterCard';

interface SnowBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: Record<string, CharacterBookmark>;
  characters: Character[];
  onSelectCharacter: (char: Character) => void;
  onToggleBookmark: (characterId: string) => void;
  onVote: (characterId: string) => void;
}

export type BookmarkViewMode = 'grid' | 'list' | 'journal';
export type BookmarkCategoryTab = 'all' | 'by_tag' | 'open_world';

export const SnowBookmarkModal: React.FC<SnowBookmarkModalProps> = ({
  isOpen,
  onClose,
  bookmarks,
  characters,
  onSelectCharacter,
  onToggleBookmark,
  onVote,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryTab, setCategoryTab] = useState<BookmarkCategoryTab>('all');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<BookmarkViewMode>('grid');

  // Personal bookmark notes
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('yui_snow_bookmark_notes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  const handleSaveNote = (characterId: string) => {
    const updated = { ...notes, [characterId]: noteDraft };
    setNotes(updated);
    localStorage.setItem('yui_snow_bookmark_notes', JSON.stringify(updated));
    setEditingNoteId(null);
  };

  const characterMap = useMemo(() => {
    const map = new Map<string, Character>();
    characters.forEach((c) => map.set(c.id, c));
    return map;
  }, [characters]);

  // All valid public bookmarked entries
  const allBookmarked = useMemo(() => {
    const list: { char: Character; bm: CharacterBookmark }[] = [];
    (Object.values(bookmarks) as CharacterBookmark[]).forEach((bm) => {
      if (bm && bm.characterId) {
        const c = characterMap.get(bm.characterId);
        if (c && !c.isDraft && !c.isPrivate) {
          list.push({ char: c, bm });
        }
      }
    });
    list.sort((a, b) => new Date(b.bm.createdAt).getTime() - new Date(a.bm.createdAt).getTime());
    return list;
  }, [bookmarks, characterMap]);

  // Available tags among bookmarked items (for "Theo tag" tab)
  const availableBookmarkTags = useMemo(() => {
    const tagSet = new Set<string>();
    allBookmarked.forEach(({ char }) => {
      (char.tags || []).forEach((t) => {
        if (t && t.trim()) tagSet.add(t.trim());
      });
    });
    return Array.from(tagSet);
  }, [allBookmarked]);

  // Filtered list based strictly on 3 categories: Tất cả, Theo tag, Open world
  const bookmarkedCharacters = useMemo(() => {
    return allBookmarked.filter(({ char }) => {
      const tags = (char.tags || []).map((t) => t.toLowerCase().trim());

      const matchSearch =
        !searchTerm ||
        char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        char.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tags.some((t) => t.includes(searchTerm.toLowerCase()));

      if (!matchSearch) return false;

      if (categoryTab === 'open_world') {
        return tags.some((t) => t === 'open world' || t.includes('open world'));
      }

      if (categoryTab === 'by_tag') {
        if (!selectedTagFilter) return tags.length > 0;
        return tags.includes(selectedTagFilter.toLowerCase().trim());
      }

      return true;
    });
  }, [allBookmarked, searchTerm, categoryTab, selectedTagFilter]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-[#172536]/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-4xl max-h-[92dvh] flex flex-col bg-[#F7FAFD] dark:bg-[#172536] text-[#526B80] dark:text-[#E5EDF5] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#DCE7EF] dark:border-[#43576B] overflow-hidden"
        >
          {/* Minimalist Header */}
          <div className="px-5 sm:px-6 py-4 border-b border-[#DCE7EF] dark:border-[#43576B] bg-white/80 dark:bg-[#202F42]/90 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#E8F1F8] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B] flex items-center justify-center text-[#526B80] dark:text-[#D5E4EF] shrink-0">
                <Bookmark className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-[#172536] dark:text-[#F7FAFD] truncate">
                  Dấu Trang Tuyết
                </h2>
                <p className="text-xs text-[#6E899E] dark:text-[#A9BDCE] font-serif">
                  {allBookmarked.length} nhân vật đã lưu
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#E8F1F8] dark:hover:bg-[#354A60] text-[#91A9BC] hover:text-[#172536] dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Simplified Toolbar: Search + 3 View Modes + Strictly 3 Category Tabs */}
          <div className="px-5 py-3.5 border-b border-[#DCE7EF] dark:border-[#43576B] bg-white/50 dark:bg-[#202F42]/45 shrink-0 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Simple Search */}
              <div className="relative flex-1 min-w-[190px] max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A9BC]" />
                <input
                  type="text"
                  placeholder="Tìm trong dấu trang..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B] text-[#172536] dark:text-[#E5EDF5] focus:outline-none focus:border-[#91A9BC]"
                />
              </div>

              {/* 3 Preserved View Modes */}
              <div className="flex items-center gap-1 bg-[#E8F1F8] dark:bg-[#172536] p-1 rounded-xl border border-[#DCE7EF] dark:border-[#43576B] text-xs">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-serif font-medium transition-all cursor-pointer flex items-center gap-1 ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-[#202F42] text-[#172536] dark:text-[#F7FAFD] shadow-xs'
                      : 'text-[#6E899E] dark:text-[#A9BDCE]'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Lưới</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-serif font-medium transition-all cursor-pointer flex items-center gap-1 ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-[#202F42] text-[#172536] dark:text-[#F7FAFD] shadow-xs'
                      : 'text-[#6E899E] dark:text-[#A9BDCE]'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Danh sách</span>
                </button>
                <button
                  onClick={() => setViewMode('journal')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-serif font-medium transition-all cursor-pointer flex items-center gap-1 ${
                    viewMode === 'journal'
                      ? 'bg-white dark:bg-[#202F42] text-[#172536] dark:text-[#F7FAFD] shadow-xs'
                      : 'text-[#6E899E] dark:text-[#A9BDCE]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Nhật ký</span>
                </button>
              </div>
            </div>

            {/* Strictly 3 Simple Category Tabs: Tất cả · Theo tag · Open world */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCategoryTab('all');
                  setSelectedTagFilter(null);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  categoryTab === 'all'
                    ? 'btn-winter-primary shadow-xs'
                    : 'bg-white dark:bg-[#172536] text-[#526B80] dark:text-[#E5EDF5] border border-[#DCE7EF] dark:border-[#43576B] hover:bg-[#E8F1F8]'
                }`}
              >
                <Snowflake className="w-3.5 h-3.5" />
                <span>Tất cả</span>
              </button>

              <button
                onClick={() => setCategoryTab('by_tag')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  categoryTab === 'by_tag'
                    ? 'btn-winter-primary shadow-xs'
                    : 'bg-white dark:bg-[#172536] text-[#526B80] dark:text-[#E5EDF5] border border-[#DCE7EF] dark:border-[#43576B] hover:bg-[#E8F1F8]'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Theo tag</span>
              </button>

              <button
                onClick={() => {
                  setCategoryTab('open_world');
                  setSelectedTagFilter(null);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  categoryTab === 'open_world'
                    ? 'btn-winter-primary shadow-xs'
                    : 'bg-white dark:bg-[#172536] text-[#526B80] dark:text-[#E5EDF5] border border-[#DCE7EF] dark:border-[#43576B] hover:bg-[#E8F1F8]'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Open world</span>
              </button>
            </div>

            {/* Clean inline tag selector when "Theo tag" is active */}
            {categoryTab === 'by_tag' && availableBookmarkTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <button
                  onClick={() => setSelectedTagFilter(null)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-serif transition-colors cursor-pointer ${
                    selectedTagFilter === null
                      ? 'bg-[#526B80] text-white'
                      : 'bg-[#E8F1F8] dark:bg-[#172536] text-[#526B80] dark:text-[#A9BDCE]'
                  }`}
                >
                  Tất cả tag
                </button>
                {availableBookmarkTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTagFilter(selectedTagFilter === tag ? null : tag)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-serif transition-colors cursor-pointer ${
                      selectedTagFilter === tag
                        ? 'bg-[#526B80] text-white'
                        : 'bg-[#E8F1F8] dark:bg-[#172536] text-[#526B80] dark:text-[#A9BDCE] hover:bg-[#D5E4EF]'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
            {bookmarkedCharacters.length === 0 ? (
              <div className="py-16 text-center space-y-3 max-w-sm mx-auto">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E8F1F8] dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] flex items-center justify-center text-[#91A9BC]">
                  <Bookmark className="w-6 h-6" />
                </div>
                <h3 className="text-base font-serif font-bold text-[#172536] dark:text-[#E5EDF5]">
                  Chưa có dấu trang nào ở mục này
                </h3>
                <p className="text-xs text-[#6E899E] dark:text-[#A9BDCE] font-serif leading-relaxed">
                  Nhấn biểu tượng dấu trang trên thẻ nhân vật để cất giữ lại nhé.
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {bookmarkedCharacters.map(({ char }) => (
                  <div key={char.id} className="space-y-1.5">
                    <CharacterCard
                      character={char}
                      onSelect={() => {
                        onSelectCharacter(char);
                        onClose();
                      }}
                      onVote={onVote}
                      isBookmarked={true}
                      onToggleBookmark={onToggleBookmark}
                    />
                  </div>
                ))}
              </div>
            ) : viewMode === 'list' ? (
              <div className="space-y-2.5">
                {bookmarkedCharacters.map(({ char }) => (
                  <div
                    key={char.id}
                    onClick={() => {
                      onSelectCharacter(char);
                      onClose();
                    }}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] hover:border-[#91A9BC] transition-all flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={char.avatar}
                        alt={char.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#DCE7EF] dark:border-[#43576B] shrink-0"
                      />
                      <div className="min-w-0 space-y-0.5">
                        <h4 className="text-sm font-bold font-serif text-[#172536] dark:text-[#F7FAFD] truncate">
                          {char.name}
                        </h4>
                        <p className="text-xs text-[#6E899E] dark:text-[#A9BDCE] truncate">
                          {char.title}
                        </p>
                        <p className="text-[11px] font-serif text-[#91A9BC] truncate">
                          {(char.tags || []).slice(0, 4).map((t) => `#${t}`).join('  ')}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(char.id);
                      }}
                      className="p-2 rounded-xl text-[#91A9BC] hover:text-rose-500 cursor-pointer shrink-0"
                      title="Bỏ dấu trang"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookmarkedCharacters.map(({ char, bm }) => (
                  <div
                    key={char.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={char.avatar}
                          alt={char.name}
                          className="w-11 h-11 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold font-serif text-[#172536] dark:text-[#F7FAFD] truncate">
                            {char.name}
                          </h4>
                          <p className="text-[11px] text-[#91A9BC] dark:text-[#A9BDCE]">
                            Lưu ngày {new Date(bm.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onToggleBookmark(char.id)}
                        className="text-xs text-[#91A9BC] hover:text-rose-500 cursor-pointer"
                        title="Bỏ lưu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F7FAFD] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B] text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-[#6E899E]">
                        <span className="font-serif">Ghi chú cá nhân</span>
                        <button
                          onClick={() => {
                            setEditingNoteId(char.id);
                            setNoteDraft(notes[char.id] || '');
                          }}
                          className="underline hover:text-[#172536] dark:hover:text-white cursor-pointer"
                        >
                          Sửa
                        </button>
                      </div>
                      <p className="text-xs text-[#43576B] dark:text-[#E5EDF5] italic font-serif">
                        {notes[char.id] ? `"${notes[char.id]}"` : 'Chưa có ghi chú...'}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onSelectCharacter(char);
                        onClose();
                      }}
                      className="text-xs font-serif font-semibold text-[#526B80] dark:text-[#D5E4EF] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Mở câu chuyện</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Note Edit Modal */}
          {editingNoteId && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
              <div className="bg-white dark:bg-[#202F42] p-5 rounded-2xl max-w-sm w-full border border-[#DCE7EF] dark:border-[#43576B] space-y-3 shadow-xl">
                <h4 className="text-sm font-bold font-serif text-[#172536] dark:text-[#F7FAFD]">
                  Ghi chú cho nhân vật
                </h4>
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  maxLength={150}
                  rows={3}
                  placeholder="Viết vài dòng ghi nhớ nhỏ..."
                  className="w-full p-2.5 rounded-xl border border-[#DCE7EF] dark:border-[#43576B] text-xs bg-[#F7FAFD] dark:bg-[#172536] focus:outline-none"
                />
                <div className="flex items-center justify-between text-[11px] text-[#91A9BC]">
                  <span>{noteDraft.length}/150</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingNoteId(null)}
                      className="px-3 py-1 rounded-lg text-xs border border-[#DCE7EF] dark:border-[#43576B] cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => handleSaveNote(editingNoteId)}
                      className="px-3 py-1 rounded-lg text-xs btn-winter-primary cursor-pointer"
                    >
                      Lưu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

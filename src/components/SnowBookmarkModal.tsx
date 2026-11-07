import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark, X, Search, Plus, Trash2, Edit3, Grid, List, BookOpen, ExternalLink, Tag } from 'lucide-react';
import { Character, CharacterBookmark } from '../types';
import { CharacterCard } from './CharacterCard';

export interface BookmarkCollection {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export const DEFAULT_COLLECTIONS: BookmarkCollection[] = [
  { id: 'loved', name: 'Những người mình thương', color: '#D5E4EF', icon: '୨୧' },
  { id: 'revisit', name: 'Muốn gặp lại', color: '#E8F1F8', icon: '❄' },
  { id: 'worlds', name: 'Những thế giới chưa khám phá', color: '#C5D8E8', icon: '✦' },
  { id: 'readlater', name: 'Để dành đọc sau', color: '#E2EAF0', icon: '📖' },
  { id: 'special', name: 'Ký ức đặc biệt', color: '#D0DFEE', icon: '♡' },
];

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
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [viewMode, setViewMode] = useState<BookmarkViewMode>('grid');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'az'>('newest');
  
  // Custom personal notes stored per bookmark
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('yui_snow_bookmark_notes');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [collections, setCollections] = useState<BookmarkCollection[]>(() => {
    try {
      const saved = localStorage.getItem('yui_snow_bookmark_collections');
      return saved ? JSON.parse(saved) : DEFAULT_COLLECTIONS;
    } catch (e) {
      return DEFAULT_COLLECTIONS;
    }
  });

  // Map of characterId -> collectionId
  const [characterCollectionMap, setCharacterCollectionMap] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('yui_snow_bookmark_mapping');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [isAddingCollection, setIsAddingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const handleSaveNote = (characterId: string) => {
    const updated = { ...notes, [characterId]: noteDraft };
    setNotes(updated);
    localStorage.setItem('yui_snow_bookmark_notes', JSON.stringify(updated));
    setEditingNoteId(null);
  };

  const handleAddCollection = () => {
    if (!newCollectionName.trim()) return;
    const newCol: BookmarkCollection = {
      id: `col-${Date.now()}`,
      name: newCollectionName.trim(),
      color: '#D5E4EF',
      icon: '୨୧',
    };
    const updated = [...collections, newCol];
    setCollections(updated);
    localStorage.setItem('yui_snow_bookmark_collections', JSON.stringify(updated));
    setNewCollectionName('');
    setIsAddingCollection(false);
  };

  const handleAssignCollection = (characterId: string, colId: string) => {
    const updated = { ...characterCollectionMap, [characterId]: colId };
    setCharacterCollectionMap(updated);
    localStorage.setItem('yui_snow_bookmark_mapping', JSON.stringify(updated));
  };

  // Lookup map
  const characterMap = useMemo(() => {
    const map = new Map<string, Character>();
    characters.forEach((c) => map.set(c.id, c));
    return map;
  }, [characters]);

  // Bookmarked items resolved
  const bookmarkedCharacters = useMemo(() => {
    const list: { char: Character; bm: CharacterBookmark }[] = [];
    (Object.values(bookmarks) as CharacterBookmark[]).forEach((bm) => {
      if (bm && bm.characterId) {
        const c = characterMap.get(bm.characterId);
        if (c && !c.isDraft && !c.isPrivate) {
          list.push({ char: c, bm });
        }
      }
    });

    // Filter by search
    let filtered = list.filter(({ char }) => {
      const matchSearch =
        !searchTerm ||
        char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        char.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        char.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCol =
        selectedCollection === 'all' ||
        characterCollectionMap[char.id] === selectedCollection;

      return matchSearch && matchCol;
    });

    // Sorting
    if (sortOption === 'newest') {
      filtered.sort((a, b) => new Date(b.bm.createdAt).getTime() - new Date(a.bm.createdAt).getTime());
    } else if (sortOption === 'oldest') {
      filtered.sort((a, b) => new Date(a.bm.createdAt).getTime() - new Date(b.bm.createdAt).getTime());
    } else if (sortOption === 'az') {
      filtered.sort((a, b) => a.char.name.localeCompare(b.char.name, 'vi'));
    }

    return filtered;
  }, [bookmarks, characterMap, searchTerm, selectedCollection, sortOption, characterCollectionMap]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#172536]/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#F7FAFD] dark:bg-[#172536] text-[#526B80] dark:text-[#E5EDF5] rounded-3xl shadow-2xl border border-[#DCE7EF] dark:border-[#43576B] overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[#DCE7EF] dark:border-[#43576B] bg-gradient-to-r from-white via-[#F7FAFD] to-[#E8F1F8] dark:from-[#202F42] dark:to-[#172536] flex items-start justify-between gap-4 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl text-[#91A9BC]">❄</span>
                <h2 className="text-xl sm:text-2xl font-serif text-[#526B80] dark:text-[#E5EDF5]">
                  Snow Bookmark — Dấu Trang Tuyết
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E8F1F8] dark:bg-[#202F42] text-[#526B80] dark:text-[#E5EDF5] font-semibold">
                  {bookmarkedCharacters.length} đã cất giữ
                </span>
              </div>
              <p className="text-xs font-serif italic text-[#91A9BC] dark:text-[#A9BDCE] mt-1">
                &ldquo;Có những câu chuyện ta chẳng muốn đọc qua một lần, nên đã nhẹ nhàng đánh dấu để ngày sau còn tìm lại.&rdquo;
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#E8F1F8] dark:hover:bg-[#202F42] text-[#91A9BC] hover:text-[#526B80] dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Toolbar: Collections Pill Bar, Search & View Modes */}
          <div className="p-4 border-b border-[#DCE7EF] dark:border-[#43576B] bg-white/70 dark:bg-[#202F42]/60 shrink-0 space-y-3">
            {/* Search and Layout Switches */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A9BC]" />
                <input
                  type="text"
                  placeholder="Tìm trong dấu trang tuyết..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-[#F7FAFD] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B] text-[#526B80] dark:text-[#E5EDF5] focus:outline-none focus:border-[#91A9BC]"
                />
              </div>

              {/* View Modes (Snow Grid, Winter List, Memory Journal) */}
              <div className="flex items-center gap-1 bg-[#E8F1F8] dark:bg-[#172536] p-1 rounded-xl border border-[#DCE7EF] dark:border-[#43576B] text-xs">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-serif font-medium transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-[#202F42] text-[#526B80] dark:text-[#E5EDF5] shadow-xs'
                      : 'text-[#91A9BC] hover:text-[#526B80]'
                  }`}
                  title="Snow Grid: Dạng lưới"
                >
                  <Grid className="w-3.5 h-3.5 inline mr-1" />
                  <span>Lưới</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-serif font-medium transition-all ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-[#202F42] text-[#526B80] dark:text-[#E5EDF5] shadow-xs'
                      : 'text-[#91A9BC] hover:text-[#526B80]'
                  }`}
                  title="Winter List: Dạng danh sách"
                >
                  <List className="w-3.5 h-3.5 inline mr-1" />
                  <span>Danh sách</span>
                </button>
                <button
                  onClick={() => setViewMode('journal')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-serif font-medium transition-all ${
                    viewMode === 'journal'
                      ? 'bg-white dark:bg-[#202F42] text-[#526B80] dark:text-[#E5EDF5] shadow-xs'
                      : 'text-[#91A9BC] hover:text-[#526B80]'
                  }`}
                  title="Memory Journal: Dạng nhật ký ghi chú"
                >
                  <BookOpen className="w-3.5 h-3.5 inline mr-1" />
                  <span>Nhật ký</span>
                </button>
              </div>
            </div>

            {/* Collection Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs custom-scrollbar">
              <button
                onClick={() => setSelectedCollection('all')}
                className={`px-3 py-1 rounded-xl text-xs font-serif shrink-0 transition-all ${
                  selectedCollection === 'all'
                    ? 'btn-winter-primary shadow-xs'
                    : 'bg-[#E8F1F8] dark:bg-[#172536] text-[#526B80] dark:text-[#E5EDF5] hover:bg-[#D5E4EF]'
                }`}
              >
                ❄ Tất cả ({Object.keys(bookmarks).length})
              </button>

              {collections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => setSelectedCollection(col.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-serif shrink-0 transition-all flex items-center gap-1 ${
                    selectedCollection === col.id
                      ? 'btn-winter-primary shadow-xs'
                      : 'bg-[#E8F1F8] dark:bg-[#172536] text-[#526B80] dark:text-[#E5EDF5] hover:bg-[#D5E4EF]'
                  }`}
                >
                  <span>{col.icon || '୨୧'}</span>
                  <span>{col.name}</span>
                </button>
              ))}

              {isAddingCollection ? (
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="Tên bộ sưu tập..."
                    className="px-2 py-0.5 text-xs rounded-lg border border-[#91A9BC] bg-white dark:bg-[#172536]"
                  />
                  <button
                    onClick={handleAddCollection}
                    className="px-2 py-0.5 rounded-lg text-xs bg-[#91A9BC] text-white"
                  >
                    Lưu
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingCollection(true)}
                  className="px-2.5 py-1 rounded-xl text-xs font-serif text-[#91A9BC] hover:text-[#526B80] border border-dashed border-[#91A9BC]/50 shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Bộ sưu tập mới</span>
                </button>
              )}
            </div>
          </div>

          {/* Main List Display */}
          <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
            {bookmarkedCharacters.length === 0 ? (
              /* Empty State */
              <div className="py-16 text-center space-y-3 max-w-sm mx-auto">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-[#E8F1F8] dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] flex items-center justify-center text-3xl">
                  📖
                </div>
                <h3 className="text-base font-serif font-bold text-[#526B80] dark:text-[#E5EDF5]">
                  Chiếc hộp dấu trang vẫn còn trống.
                </h3>
                <p className="text-xs text-[#91A9BC] dark:text-[#A9BDCE] font-serif leading-relaxed">
                  Hãy đánh dấu một câu chuyện mà bạn muốn giữ lại nhé ♡
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              /* Snow Grid View */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {bookmarkedCharacters.map(({ char, bm }) => (
                  <div key={char.id} className="relative group">
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
                    {/* Collection tag indicator & Note snippet */}
                    <div className="mt-1.5 flex items-center justify-between text-[11px] px-2 text-[#91A9BC] dark:text-[#A9BDCE] font-serif">
                      <span className="flex items-center gap-1">
                        <span>୨୧</span>
                        <span>{notes[char.id] ? `Ghi chú: "${notes[char.id].slice(0, 20)}..."` : 'Thêm ghi chú cá nhân'}</span>
                      </span>
                      <button
                        onClick={() => {
                          setEditingNoteId(char.id);
                          setNoteDraft(notes[char.id] || '');
                        }}
                        className="text-[10px] underline hover:text-[#526B80] cursor-pointer"
                      >
                        Sửa ghi chú
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : viewMode === 'list' ? (
              /* Winter List View */
              <div className="space-y-3">
                {bookmarkedCharacters.map(({ char, bm }) => (
                  <div
                    key={char.id}
                    onClick={() => {
                      onSelectCharacter(char);
                      onClose();
                    }}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] hover:border-[#91A9BC] transition-all flex items-center justify-between gap-4 cursor-pointer group shadow-xs"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={char.avatar}
                        alt={char.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-[#DCE7EF] shrink-0"
                      />
                      <div className="min-w-0 space-y-0.5">
                        <h4 className="text-sm font-bold font-serif text-[#526B80] dark:text-[#E5EDF5] truncate group-hover:text-[#91A9BC]">
                          {char.name}
                        </h4>
                        <p className="text-xs text-[#91A9BC] dark:text-[#A9BDCE] truncate max-w-md">
                          {char.title}
                        </p>
                        <div className="flex items-center gap-1 pt-0.5">
                          {char.tags.slice(0, 3).map((t) => (
                            <span key={t} className="text-[10px] px-2 py-0.2 rounded-full bg-[#E8F1F8] dark:bg-[#172536] text-[#526B80] dark:text-[#E5EDF5]">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(char.id);
                        }}
                        className="p-2 rounded-xl text-[#91A9BC] hover:text-red-500 cursor-pointer"
                        title="Bỏ dấu trang"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Memory Journal View */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookmarkedCharacters.map(({ char, bm }) => (
                  <div
                    key={char.id}
                    className="p-5 rounded-3xl bg-white dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] space-y-3 shadow-xs relative"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={char.avatar}
                        alt={char.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold font-serif text-[#526B80] dark:text-[#E5EDF5]">
                          {char.name}
                        </h4>
                        <p className="text-[11px] text-[#91A9BC] dark:text-[#A9BDCE]">
                          Lưu ngày: {new Date(bm.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>

                    {/* Note Box */}
                    <div className="p-3 rounded-2xl bg-[#F7FAFD] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B] text-xs">
                      <div className="flex items-center justify-between text-[11px] text-[#91A9BC] pb-1 border-b border-[#DCE7EF]/50 mb-1.5">
                        <span className="font-serif">📝 Ghi chú cá nhân</span>
                        <button
                          onClick={() => {
                            setEditingNoteId(char.id);
                            setNoteDraft(notes[char.id] || '');
                          }}
                          className="text-[10px] underline hover:text-[#526B80] cursor-pointer"
                        >
                          Chỉnh sửa
                        </button>
                      </div>
                      <p className="text-xs text-[#526B80] dark:text-[#E5EDF5] italic font-serif">
                        {notes[char.id] ? `"${notes[char.id]}"` : 'Chưa có ghi chú nào...'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => {
                          onSelectCharacter(char);
                          onClose();
                        }}
                        className="text-xs font-serif font-bold text-[#6E899E] dark:text-[#A9BDCE] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Mở lại câu chuyện</span>
                      </button>

                      <button
                        onClick={() => onToggleBookmark(char.id)}
                        className="text-xs text-[#91A9BC] hover:text-red-500 cursor-pointer"
                      >
                        Bỏ lưu
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit Note Modal Prompt */}
          {editingNoteId && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
              <div className="bg-white dark:bg-[#202F42] p-5 rounded-2xl max-w-sm w-full border border-[#DCE7EF] dark:border-[#43576B] space-y-3">
                <h4 className="text-sm font-bold font-serif text-[#526B80] dark:text-[#E5EDF5]">
                  Ghi chú riêng cho nhân vật
                </h4>
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  maxLength={150}
                  rows={3}
                  placeholder="Ví dụ: Muốn quay lại đọc kỹ phần tiểu sử..."
                  className="w-full p-2.5 rounded-xl border border-[#DCE7EF] dark:border-[#43576B] text-xs bg-[#F7FAFD] dark:bg-[#172536] focus:outline-none"
                />
                <div className="flex items-center justify-between text-[11px] text-[#91A9BC]">
                  <span>{noteDraft.length}/150 ký tự</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingNoteId(null)}
                      className="px-3 py-1 rounded-lg text-xs border border-[#DCE7EF] cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => handleSaveNote(editingNoteId)}
                      className="px-3 py-1 rounded-lg text-xs btn-winter-primary cursor-pointer"
                    >
                      Lưu ghi chú
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

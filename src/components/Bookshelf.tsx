import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Bookmark, ArrowLeft, ArrowRight, Trash2, Clock, SortAsc, BookMarked } from 'lucide-react';
import { Character, CharacterBookmark, BookmarkPaperStyle, BookmarkTailDecor } from '../types';
import { PAPER_STYLE_CONFIGS } from './PaperBookmark';

interface BookshelfProps {
  bookmarks: Record<string, CharacterBookmark>;
  characters: Character[];
  onSelectCharacter: (character: Character, openStoryDirectly?: boolean) => void;
  onRemoveBookmark: (characterId: string) => void;
  onReorderBookmarks?: (newOrderedIds: string[]) => void;
}

export type BookshelfSortOption = 'newest' | 'oldest' | 'az' | 'reading';

export const Bookshelf: React.FC<BookshelfProps> = ({
  bookmarks,
  characters,
  onSelectCharacter,
  onRemoveBookmark,
  onReorderBookmarks,
}) => {
  const [sortOption, setSortOption] = useState<BookshelfSortOption>('newest');

  // Map character lookup
  const characterMap = React.useMemo(() => {
    const map = new Map<string, Character>();
    characters.forEach((c) => map.set(c.id, c));
    return map;
  }, [characters]);

  // Valid bookmarks list with character references
  const validBookmarks = React.useMemo(() => {
    const list: { bookmark: CharacterBookmark; character: Character }[] = [];
    (Object.values(bookmarks) as CharacterBookmark[]).forEach((bm) => {
      if (!bm || !bm.characterId) return;
      const char = characterMap.get(bm.characterId);
      if (char && !char.isDraft && !char.isPrivate) {
        list.push({ bookmark: bm, character: char });
      }
    });

    // Apply sorting
    if (sortOption === 'newest') {
      list.sort((a, b) => new Date(b.bookmark.createdAt).getTime() - new Date(a.bookmark.createdAt).getTime());
    } else if (sortOption === 'oldest') {
      list.sort((a, b) => new Date(a.bookmark.createdAt).getTime() - new Date(b.bookmark.createdAt).getTime());
    } else if (sortOption === 'az') {
      list.sort((a, b) => a.character.name.localeCompare(b.character.name, 'vi'));
    } else if (sortOption === 'reading') {
      list.sort((a, b) => {
        const progA = a.bookmark.readingProgress || 0;
        const progB = b.bookmark.readingProgress || 0;
        if (progA !== progB) return progB - progA;
        return new Date(b.bookmark.createdAt).getTime() - new Date(a.bookmark.createdAt).getTime();
      });
    }

    return list;
  }, [bookmarks, characterMap, sortOption]);

  const handleMove = (index: number, direction: 'left' | 'right') => {
    if (!onReorderBookmarks) return;
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= validBookmarks.length) return;

    const ids = validBookmarks.map((item) => item.bookmark.characterId);
    const temp = ids[index];
    ids[index] = ids[targetIndex];
    ids[targetIndex] = temp;

    onReorderBookmarks(ids);
  };

  return (
    <div id="bookshelf-section" className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/88 dark:bg-[#192638]/88 backdrop-blur-md border border-[#D4E6F6] dark:border-[#314660] shadow-[0_6px_20px_-6px_rgba(74,116,162,0.1)] space-y-3.5 sm:space-y-5 relative overflow-hidden text-[#263E57] dark:text-[#E7F0FA]">
      {/* Shelf Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 border-b border-[#E3EFFA] dark:border-[#2C3F56] pb-3 sm:pb-4">
        <div>
          <h3 className="text-base sm:text-xl font-bold tracking-tight text-[#203850] dark:text-[#F5FAFF] flex items-center gap-2 font-display">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#5380AD] dark:text-[#9AC0E3]" />
            <span>Kệ sách của mình</span>
            <span className="text-xs font-sans font-semibold text-[#5380AD] dark:text-[#9AC0E3] tabular-nums">
              ({validBookmarks.length})
            </span>
          </h3>
          <p className="text-[11px] sm:text-xs text-[#6484A3] dark:text-[#A4C0DA] mt-0.5 sm:mt-1 font-serif italic">
            &ldquo;Nơi cất giữ những dấu trang kỷ niệm giữa mùa đông yên bình ♡&rdquo;
          </p>
        </div>

        {/* Sorting Controls */}
        <div className="flex items-center gap-1 max-w-full overflow-x-auto bg-[#F2F8FE] dark:bg-[#142030] p-1 rounded-2xl border border-[#D4E6F6] dark:border-[#314660] text-xs font-serif">
          <button
            onClick={() => setSortOption('newest')}
            className={`px-2.5 py-1.5 sm:py-1 rounded-xl text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 ${
              sortOption === 'newest'
                ? 'btn-winter-primary shadow-xs'
                : 'text-[#6484A3] hover:text-[#203850] dark:hover:text-white'
            }`}
            title="Mới đánh dấu"
          >
            <Clock className="w-3 h-3" />
            <span>Mới nhất</span>
          </button>

          <button
            onClick={() => setSortOption('oldest')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
              sortOption === 'oldest'
                ? 'btn-winter-primary shadow-xs'
                : 'text-[#6484A3] hover:text-[#203850] dark:hover:text-white'
            }`}
            title="Cũ nhất"
          >
            Cũ nhất
          </button>

          <button
            onClick={() => setSortOption('az')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              sortOption === 'az'
                ? 'btn-winter-primary shadow-xs'
                : 'text-[#6484A3] hover:text-[#203850] dark:hover:text-white'
            }`}
            title="A–Z"
          >
            <SortAsc className="w-3 h-3" />
            <span>A–Z</span>
          </button>

          <button
            onClick={() => setSortOption('reading')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              sortOption === 'reading'
                ? 'btn-winter-primary shadow-xs'
                : 'text-[#6484A3] hover:text-[#203850] dark:hover:text-white'
            }`}
            title="Đang đọc (Ưu tiên character có tiến độ Story)"
          >
            <BookMarked className="w-3 h-3" />
            <span>Đang đọc</span>
          </button>
        </div>
      </div>

      {/* Bookshelf Container Display */}
      {validBookmarks.length === 0 ? (
        /* Empty Shelf State */
        <div className="py-5 sm:py-10 text-center space-y-2">
          <div className="w-11 h-11 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-[#EEF6FD] dark:bg-[#1E2E42] border border-dashed border-[#A6C8E8] flex items-center justify-center text-[#5380AD] dark:text-[#9AC0E3]">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <p className="text-xs sm:text-sm font-bold font-serif text-[#203850] dark:text-[#E5EDF5] pt-0.5">
            Kệ sách vẫn còn trống...
          </p>
          <p className="text-[11px] sm:text-xs text-[#6484A3] dark:text-[#A4C0DA] font-serif italic">
            &ldquo;Nhấn biểu tượng dấu trang ở mỗi nhân vật để cất vào đây nhé ♡&rdquo;
          </p>
        </div>
      ) : (
        /* Bookshelf Rack Grid */
        <div className="relative pt-2 pb-6">
          {/* Silver Blue Winter Shelf Base Line */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#D5E4EF] via-[#91A9BC] to-[#D5E4EF] dark:from-[#354A60] dark:via-[#43576B] dark:to-[#354A60] rounded-full shadow-inner opacity-70" />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 relative z-10 pb-2">
            <AnimatePresence>
              {validBookmarks.map(({ bookmark: bm, character: char }, idx) => {
                const config = PAPER_STYLE_CONFIGS[bm.paperStyle] || PAPER_STYLE_CONFIGS.pink;
                const hasStory = !!char.story;
                const progress = bm.readingProgress || 0;

                return (
                  <motion.div
                    key={char.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 15 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="group relative p-3.5 rounded-2xl bg-[#F7FAFD]/95 dark:bg-[#172536]/95 border border-[#DCE7EF] dark:border-[#43576B] shadow-sm flex flex-col justify-between h-36 select-none cursor-pointer hover:border-[#91A9BC] transition-colors"
                    onClick={() => onSelectCharacter(char, false)}
                  >
                    {/* Top Bookmark Ribbon Tab */}
                    <div className="flex items-center justify-between gap-1 border-b border-[#DCE7EF] dark:border-[#43576B] pb-1.5">
                      <span className="text-xs font-bold font-serif flex items-center gap-1 truncate text-[#526B80] dark:text-[#E5EDF5]">
                        <span>{bm.tailDecor || '❄'}</span>
                        <span className="truncate">{char.name}</span>
                      </span>

                      {/* Remove Bookmark Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveBookmark(char.id);
                        }}
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1 text-[#91A9BC] hover:text-red-500 transition-opacity cursor-pointer"
                        title="Bỏ kẹp bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Middle Info / Avatar Preview */}
                    <div className="flex items-center gap-2 py-1">
                      <img
                        src={char.avatar}
                        alt={char.name}
                        className="w-9 h-9 rounded-xl object-cover border border-[#DCE7EF] dark:border-[#43576B] shadow-xs shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-[#91A9BC] dark:text-[#A9BDCE] truncate line-clamp-2 leading-tight">
                          {char.title}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Progress or Story Action */}
                    <div className="pt-1 border-t border-[#DCE7EF] dark:border-[#43576B] flex items-center justify-between text-[10px] font-semibold">
                      {hasStory ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCharacter(char, true);
                          }}
                          className="text-[#526B80] dark:text-[#A9BDCE] hover:underline flex items-center gap-1 font-serif font-bold cursor-pointer"
                          title={progress > 0 ? `Tiếp tục đọc (${progress}%)` : 'Đọc Story'}
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>
                            {progress > 0 ? `Story — ${progress}%` : 'Đọc Story'}
                          </span>
                        </button>
                      ) : (
                        <span className="opacity-65 text-[9px] font-serif text-[#91A9BC] dark:text-[#A9BDCE]">
                          ❄ Character
                        </span>
                      )}

                      {/* Manual Reorder Buttons */}
                      {validBookmarks.length > 1 && (
                        <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                          <button
                            disabled={idx === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMove(idx, 'left');
                            }}
                            className="p-0.5 rounded hover:bg-[#E8F1F8] dark:hover:bg-[#202F42] disabled:opacity-20 cursor-pointer"
                            title="Chuyển sang trái"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                          <button
                            disabled={idx === validBookmarks.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMove(idx, 'right');
                            }}
                            className="p-0.5 rounded hover:bg-[#E8F1F8] dark:hover:bg-[#202F42] disabled:opacity-20 cursor-pointer"
                            title="Chuyển sang phải"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

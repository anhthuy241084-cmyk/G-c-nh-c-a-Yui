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
    <div id="bookshelf-section" className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-[#202F42]/80 backdrop-blur-md border border-[#DCE7EF] dark:border-[#43576B] shadow-sm space-y-5 relative overflow-hidden text-[#526B80] dark:text-[#E5EDF5]">
      {/* Shelf Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCE7EF] dark:border-[#43576B] pb-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#526B80] dark:text-[#E5EDF5] flex items-center gap-2 font-serif">
            <span className="text-[#91A9BC]">❄</span>
            <span>Kệ sách của mình</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E8F1F8] dark:bg-[#172536] text-[#526B80] dark:text-[#E5EDF5] font-semibold ml-1">
              {validBookmarks.length}
            </span>
          </h3>
          <p className="text-xs text-[#91A9BC] dark:text-[#A9BDCE] mt-1 font-serif italic">
            &ldquo;Nơi cất giữ những dấu trang kỷ niệm giữa mùa đông yên bình ♡&rdquo;
          </p>
        </div>

        {/* Sorting Controls */}
        <div className="flex items-center gap-1.5 bg-[#F7FAFD] dark:bg-[#172536] p-1 rounded-2xl border border-[#DCE7EF] dark:border-[#43576B] text-xs font-serif">
          <button
            onClick={() => setSortOption('newest')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              sortOption === 'newest'
                ? 'btn-winter-primary shadow-xs'
                : 'text-[#91A9BC] hover:text-[#526B80]'
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
                : 'text-[#91A9BC] hover:text-[#526B80]'
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
                : 'text-[#91A9BC] hover:text-[#526B80]'
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
                : 'text-[#91A9BC] hover:text-[#526B80]'
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
        <div className="py-10 text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#E8F1F8] dark:bg-[#172536] border-2 border-dashed border-[#91A9BC]/40 flex items-center justify-center text-2xl text-[#91A9BC]">
            📖
          </div>
          <p className="text-xs sm:text-sm font-bold font-serif text-[#526B80] dark:text-[#E5EDF5] pt-1">
            Kệ sách vẫn còn trống...
          </p>
          <p className="text-xs text-[#91A9BC] dark:text-[#A9BDCE] font-serif italic">
            &ldquo;Đặt một chiếc bookmark vào đây nhé ♡&rdquo;
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
                    className="group relative p-3.5 rounded-2xl ocean-card shadow-sm flex flex-col justify-between h-36 select-none cursor-pointer"
                    onClick={() => onSelectCharacter(char, false)}
                  >
                    {/* Top Bookmark Ribbon Tab */}
                    <div className="flex items-center justify-between gap-1 border-b border-[#65C5CE]/20 dark:border-[#12343C] pb-1.5">
                      <span className="text-xs font-bold font-serif flex items-center gap-1 truncate text-[#247C8C] dark:text-[#78DCE0]">
                        <span>{bm.tailDecor || '✦'}</span>
                        <span className="truncate">{char.name}</span>
                      </span>

                      {/* Remove Bookmark Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveBookmark(char.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#6B858A] hover:text-red-500 transition-opacity cursor-pointer"
                        title="Bỏ kẹp bookmark"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Middle Info / Avatar Preview */}
                    <div className="flex items-center gap-2 py-1">
                      <img
                        src={char.avatar}
                        alt={char.name}
                        className="w-9 h-9 rounded-xl object-cover border border-white/60 dark:border-[#102F38] shadow-xs shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-[#6B858A] dark:text-[#8FB6BC] truncate line-clamp-2 leading-tight">
                          {char.title}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Progress or Story Action */}
                    <div className="pt-1 border-t border-[#65C5CE]/20 dark:border-[#12343C] flex items-center justify-between text-[10px] font-semibold">
                      {hasStory ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCharacter(char, true);
                          }}
                          className="text-[#3FAAB7] dark:text-[#78DCE0] hover:underline flex items-center gap-1 font-serif font-bold cursor-pointer"
                          title={progress > 0 ? `Tiếp tục đọc (${progress}%)` : 'Đọc Story'}
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>
                            {progress > 0 ? `Story — ${progress}%` : 'Đọc Story'}
                          </span>
                        </button>
                      ) : (
                        <span className="opacity-60 text-[9px] font-serif text-[#6B858A] dark:text-[#8FB6BC]">
                          ♡ Character
                        </span>
                      )}

                      {/* Manual Reorder Buttons */}
                      {validBookmarks.length > 1 && (
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                          <button
                            disabled={idx === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMove(idx, 'left');
                            }}
                            className="p-0.5 rounded hover:bg-[#DDF1F3] dark:hover:bg-[#143943] disabled:opacity-20 cursor-pointer"
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
                            className="p-0.5 rounded hover:bg-[#DDF1F3] dark:hover:bg-[#143943] disabled:opacity-20 cursor-pointer"
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

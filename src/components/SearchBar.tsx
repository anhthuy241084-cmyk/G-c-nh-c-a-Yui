import React from 'react';
import { Search, X, Tag, Sparkles } from 'lucide-react';
import { PRESET_TAGS } from '../types';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  totalCount: number;
  filteredCount: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedTag,
  onSelectTag,
  totalCount,
  filteredCount,
}) => {
  return (
    <div id="search-section" className="w-full space-y-3 scroll-mt-20 select-none">
      {/* Search Input Box */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#91A9BC] dark:text-[#A9BDCE]">
          <Search className="w-4 h-4" />
        </div>

        <input
          id="search-input"
          type="text"
          value={searchTerm || ''}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo tên nhân vật, tag hoặc từ khóa..."
          className="w-full min-h-[44px] pl-11 pr-10 py-2.5 sm:py-3 bg-white/90 dark:bg-[#202F42]/90 text-[#526B80] dark:text-[#E5EDF5] placeholder-[#91A9BC] dark:placeholder-[#A9BDCE] rounded-2xl border border-[#DCE7EF] dark:border-[#43576B] shadow-xs focus:outline-none focus:border-[#91A9BC] transition-all text-sm font-serif"
        />

        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#91A9BC] hover:text-[#526B80] dark:hover:text-[#E5EDF5] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Preset Suggestion Tags */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-[#5E7C99] dark:text-[#A4C0DA] px-1 font-serif">
          <span>Chủ đề / Thẻ gợi ý</span>

          <span className="font-normal tabular-nums">
            Hiển thị <strong className="text-[#16273B] dark:text-[#F8FBFF]">{filteredCount}</strong> / {totalCount} nhân vật
          </span>
        </div>

        {/* Active Filter Bar & Clear Filter Button */}
        {(selectedTag || searchTerm) && (
          <div className="flex items-center justify-between bg-[#EAF3FC] dark:bg-[#1E2F44] px-3.5 py-1.5 rounded-2xl border border-[#D4E4F2] dark:border-[#39506B] text-xs font-medium text-[#334A60] dark:text-[#E5EFF9]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span>Đang lọc:</span>
              {selectedTag && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl bg-[#4E7AA5] text-white text-[11px] font-bold shadow-xs">
                  #{selectedTag}
                  <button
                    onClick={() => onSelectTag(null)}
                    className="hover:opacity-80 p-0.5 cursor-pointer"
                    title="Bỏ tag này"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl bg-white dark:bg-[#142233] text-[#334A60] dark:text-[#E5EFF9] text-[11px] font-bold border border-[#D4E4F2] dark:border-[#39506B]">
                  &ldquo;{searchTerm}&rdquo;
                  <button
                    onClick={() => onSearchChange('')}
                    className="hover:opacity-80 p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={() => {
                onSelectTag(null);
                onSearchChange('');
              }}
              className="text-xs font-bold text-[#46729C] dark:text-[#9AC0E3] hover:underline flex items-center gap-1 shrink-0 ml-2 cursor-pointer font-serif"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}

        {/* Horizontal Scrollable Tag Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar font-serif">
          <button
            onClick={() => onSelectTag(null)}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
              selectedTag === null
                ? 'bg-[#5380AD] text-white shadow-xs'
                : 'bg-white/90 dark:bg-[#1E2F44] text-[#36597A] dark:text-[#E5EFF9] hover:bg-[#EAF3FC] border border-[#D4E4F2] dark:border-[#39506B]'
            }`}
          >
            Tất cả
          </button>

          {PRESET_TAGS.map((tag) => {
            const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                onClick={() => onSelectTag(isSelected ? null : tag)}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#5380AD] text-white shadow-xs'
                    : 'bg-white/90 dark:bg-[#1E2F44] text-[#36597A] dark:text-[#E5EFF9] hover:bg-[#EAF3FC] border border-[#D4E4F2] dark:border-[#39506B]'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

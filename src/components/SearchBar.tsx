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
    <div id="search-section" className="w-full space-y-3.5 scroll-mt-24 select-none">
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
          className="w-full pl-11 pr-10 py-3 bg-white/90 dark:bg-[#202F42]/90 text-[#526B80] dark:text-[#E5EDF5] placeholder-[#91A9BC] dark:placeholder-[#A9BDCE] rounded-2xl border border-[#DCE7EF] dark:border-[#43576B] shadow-xs focus:outline-none focus:border-[#91A9BC] transition-all text-sm font-serif"
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
        <div className="flex items-center justify-between text-xs font-semibold text-[#91A9BC] dark:text-[#A9BDCE] px-1 font-serif">
          <span className="flex items-center gap-1.5">
            <span>❄</span>
            <span>Chủ đề / Thẻ gợi ý:</span>
          </span>

          <span className="font-normal">
            Hiển thị <strong className="text-[#526B80] dark:text-[#E5EDF5]">{filteredCount}</strong> / {totalCount} nhân vật
          </span>
        </div>

        {/* Active Filter Bar & Clear Filter Button */}
        {(selectedTag || searchTerm) && (
          <div className="flex items-center justify-between bg-[#E8F1F8] dark:bg-[#202F42] px-3.5 py-1.5 rounded-2xl border border-[#DCE7EF] dark:border-[#43576B] text-xs font-medium text-[#526B80] dark:text-[#E5EDF5]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span>Đang lọc:</span>
              {selectedTag && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl bg-[#91A9BC] text-white text-[11px] font-bold shadow-xs">
                  ❄ {selectedTag}
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
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl bg-white dark:bg-[#172536] text-[#526B80] dark:text-[#E5EDF5] text-[11px] font-bold border border-[#DCE7EF] dark:border-[#43576B]">
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
              className="text-xs font-bold text-[#6E899E] dark:text-[#A9BDCE] hover:underline flex items-center gap-1 shrink-0 ml-2 cursor-pointer font-serif"
            >
              ↻ Xóa bộ lọc
            </button>
          </div>
        )}

        {/* Horizontal Scrollable Tag Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar font-serif">
          {/* 'Tất cả' Tag button */}
          <button
            onClick={() => onSelectTag(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all active:scale-95 cursor-pointer ${
              selectedTag === null
                ? 'btn-winter-primary shadow-xs'
                : 'bg-white/80 dark:bg-[#202F42] text-[#526B80] dark:text-[#E5EDF5] hover:bg-[#E8F1F8] border border-[#DCE7EF] dark:border-[#43576B]'
            }`}
          >
            Tất cả
          </button>

          {/* Preset Tags */}
          {PRESET_TAGS.map((tag) => {
            const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                onClick={() => onSelectTag(isSelected ? null : tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all flex items-center gap-1 active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'btn-winter-primary shadow-xs scale-105'
                    : 'bg-white/80 dark:bg-[#202F42] text-[#526B80] dark:text-[#E5EDF5] hover:bg-[#E8F1F8] border border-[#DCE7EF] dark:border-[#43576B]'
                }`}
              >
                <span>❄ #{tag}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

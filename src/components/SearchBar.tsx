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
    <div id="search-section" className="w-full space-y-4 scroll-mt-24">
      {/* Search Input Box */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#6B858A] dark:text-[#8FB6BC]">
          <Search className="w-5 h-5" />
        </div>

        <input
          id="search-input"
          type="text"
          value={searchTerm || ''}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo tên nhân vật, tag hoặc từ khóa liên quan..."
          className="w-full pl-11 pr-10 py-3.5 bg-white/90 dark:bg-[#102F38]/90 text-[#29464C] dark:text-[#DDF5F6] placeholder-[#6B858A] dark:placeholder-[#8FB6BC] rounded-2xl border border-[#65C5CE]/40 dark:border-[#78DCE0]/25 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#3FAAB7]/40 focus:border-[#3FAAB7] transition-all text-sm sm:text-base font-serif"
        />

        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6B858A] hover:text-[#29464C] dark:hover:text-[#DDF5F6] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Preset Suggestion Tags */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-[#6B858A] dark:text-[#8FB6BC] px-1">
          <span className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[#3FAAB7] dark:text-[#78DCE0]" />
            <span>Chủ đề / Thẻ gợi ý:</span>
          </span>

          <span className="text-[#6B858A] dark:text-[#8FB6BC] font-normal">
            Hiển thị <strong className="text-[#247C8C] dark:text-[#78DCE0]">{filteredCount}</strong> / {totalCount} nhân vật
          </span>
        </div>

        {/* Active Filter Bar & Clear Filter Button */}
        {(selectedTag || searchTerm) && (
          <div className="flex items-center justify-between bg-[#E5F5F7] dark:bg-[#102F38] px-3.5 py-2 rounded-2xl border border-[#65C5CE]/30 dark:border-[#78DCE0]/20 text-xs font-semibold text-[#247C8C] dark:text-[#78DCE0]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span>Đang lọc:</span>
              {selectedTag && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#3FAAB7] text-white font-bold shadow-xs">
                  ✦ {selectedTag} ✧
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
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#DDF1F3] dark:bg-[#143943] text-[#29464C] dark:text-[#DDF5F6] font-bold">
                  "{searchTerm}"
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
              className="text-xs font-bold text-[#247C8C] dark:text-[#78DCE0] hover:underline flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
            >
              ↻ Xóa bộ lọc
            </button>
          </div>
        )}

        {/* Horizontal Scrollable Tag Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {/* 'Tất cả' Tag button */}
          <button
            onClick={() => onSelectTag(null)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all active:scale-95 hover:scale-105 cursor-pointer ${
              selectedTag === null
                ? 'bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] text-white shadow-md shadow-[#247C8C]/20'
                : 'bg-white/80 dark:bg-[#102F38] text-[#29464C] dark:text-[#DDF5F6] hover:bg-[#E5F5F7] dark:hover:bg-[#143943] border border-[#65C5CE]/30 dark:border-[#78DCE0]/20'
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1 hover:scale-105 active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] text-white shadow-md shadow-[#247C8C]/20 scale-105 border border-[#65C5CE]'
                    : 'bg-white/80 dark:bg-[#102F38] text-[#29464C] dark:text-[#DDF5F6] hover:bg-[#E5F5F7] dark:hover:bg-[#143943] border border-[#65C5CE]/30 dark:border-[#78DCE0]/20'
                }`}
              >
                <span>✦ {tag}</span>
                {isSelected && <Sparkles className="w-3 h-3 text-white" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

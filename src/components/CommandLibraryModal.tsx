import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  Copy,
  Check,
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  Eye,
  Tag,
  FolderPlus,
  Layers,
  Terminal,
} from 'lucide-react';
import {
  PromptCommand,
  COMMAND_COLOR_OPTIONS,
  COMMAND_DECORATIONS,
  CommandDecoration,
} from '../types';
import { triggerSfx } from '../utils/sfx';

interface CommandLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  commands: PromptCommand[];
  isAdmin: boolean;
  onSaveCommand: (command: PromptCommand) => Promise<void>;
  onDeleteCommand: (id: string) => Promise<void>;
  onUpdateOrder: (commands: PromptCommand[]) => Promise<void>;
  onOpenAdminAuth?: () => void;
  onToast?: (msg: string) => void;
  isSfxOn?: boolean;
  sfxVolume?: number;
}

type SortOption = 'custom' | 'newest' | 'oldest' | 'az' | 'za';

export const CommandLibraryModal: React.FC<CommandLibraryModalProps> = ({
  isOpen,
  onClose,
  commands,
  isAdmin,
  onSaveCommand,
  onDeleteCommand,
  onUpdateOrder,
  onOpenAdminAuth,
  onToast,
  isSfxOn = true,
  sfxVolume = 0.5,
}) => {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('custom');

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Detail Modal state
  const [detailCommand, setDetailCommand] = useState<PromptCommand | null>(null);

  // Admin Create/Edit Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCommand, setEditingCommand] = useState<PromptCommand | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formNewCategoryInput, setFormNewCategoryInput] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [formColor, setFormColor] = useState<string>(COMMAND_COLOR_OPTIONS[0].hex);
  const [formDecoration, setFormDecoration] = useState<CommandDecoration>('♡');
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirmation state
  const [commandToDelete, setCommandToDelete] = useState<PromptCommand | null>(null);

  // Derive unique categories from existing commands
  const categories = useMemo(() => {
    const set = new Set<string>();
    commands.forEach((c) => {
      if (c.category && c.category.trim()) {
        set.add(c.category.trim());
      }
    });
    return Array.from(set);
  }, [commands]);

  // Filtered & Sorted commands
  const filteredCommands = useMemo(() => {
    let list = [...commands];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.content.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter((c) => c.category === selectedCategory);
    }

    // Sorting
    if (sortOption === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOption === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortOption === 'az') {
      list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    } else if (sortOption === 'za') {
      list.sort((a, b) => b.name.localeCompare(a.name, 'vi'));
    } else {
      // custom order
      list.sort((a, b) => (a.displayOrder - b.displayOrder) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [commands, searchQuery, selectedCategory, sortOption]);

  // Copy handler
  const handleCopy = (cmd: PromptCommand) => {
    if (!cmd.content) return;
    navigator.clipboard.writeText(cmd.content);
    setCopiedId(cmd.id);
    if (isSfxOn) triggerSfx('chime', sfxVolume);
    if (onToast) onToast('Đã sao chép lệnh ♡');

    setTimeout(() => {
      setCopiedId((curr) => (curr === cmd.id ? null : curr));
    }, 2000);
  };

  // Open Form for Create
  const handleOpenCreate = () => {
    setEditingCommand(null);
    setFormName('');
    setFormDescription('');
    setFormContent('');
    setFormCategory(categories[0] || 'Character');
    setFormNewCategoryInput('');
    setFormTags([]);
    setTagInput('');
    setFormColor(COMMAND_COLOR_OPTIONS[0].hex);
    setFormDecoration('♡');
    setIsFormOpen(true);
    if (isSfxOn) triggerSfx('pop', sfxVolume);
  };

  // Open Form for Edit
  const handleOpenEdit = (cmd: PromptCommand) => {
    setEditingCommand(cmd);
    setFormName(cmd.name);
    setFormDescription(cmd.description);
    setFormContent(cmd.content);
    setFormCategory(cmd.category || 'Chung');
    setFormNewCategoryInput('');
    setFormTags(cmd.tags || []);
    setTagInput('');
    setFormColor(cmd.color || COMMAND_COLOR_OPTIONS[0].hex);
    setFormDecoration(cmd.decoration || '♡');
    setIsFormOpen(true);
    if (isSfxOn) triggerSfx('pop', sfxVolume);
  };

  // Add Tag to Form
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const clean = tagInput.trim();
    if (!formTags.includes(clean)) {
      setFormTags([...formTags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormTags(formTags.filter((t) => t !== tagToRemove));
  };

  // Save Command
  const handleSaveForm = async () => {
    if (!formName.trim()) {
      if (onToast) onToast('⚠️ Vui lòng nhập Tên lệnh');
      return;
    }
    if (!formContent.trim()) {
      if (onToast) onToast('⚠️ Vui lòng nhập Nội dung lệnh');
      return;
    }

    const finalCategory = formNewCategoryInput.trim() || formCategory.trim() || 'Chung';

    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const payload: PromptCommand = {
        id: editingCommand ? editingCommand.id : `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: formName.trim(),
        description: formDescription.trim(),
        content: formContent.trim(),
        category: finalCategory,
        tags: formTags,
        color: formColor,
        decoration: formDecoration,
        displayOrder: editingCommand ? editingCommand.displayOrder : commands.length,
        createdAt: editingCommand ? editingCommand.createdAt : now,
        updatedAt: now,
      };

      await onSaveCommand(payload);
      if (onToast) onToast(editingCommand ? 'Đã cập nhật lệnh ♡' : 'Đã đăng lệnh thành công ♡');
      setIsFormOpen(false);
      setEditingCommand(null);
    } catch (e) {
      console.error('Error saving command:', e);
      if (onToast) onToast('❌ Lỗi khi lưu lệnh, vui lòng thử lại');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!commandToDelete) return;
    const targetId = commandToDelete.id;
    setCommandToDelete(null);
    try {
      await onDeleteCommand(targetId);
      if (onToast) onToast('🗑️ Đã xóa lệnh khỏi Kho lệnh.');
    } catch (e) {
      console.error('Error deleting command:', e);
      if (onToast) onToast('❌ Lỗi khi xóa lệnh.');
    }
  };

  // Move command up/down in custom order
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (sortOption !== 'custom') return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredCommands.length) return;

    const reordered = [...filteredCommands];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const updated = reordered.map((c, i) => ({ ...c, displayOrder: i }));
    await onUpdateOrder(updated);
    if (isSfxOn) triggerSfx('pop', sfxVolume);
  };

  // Helper for color config
  const getColorConfig = (colorHex: string) => {
    return (
      COMMAND_COLOR_OPTIONS.find((c) => c.hex.toLowerCase() === colorHex.toLowerCase()) ||
      COMMAND_COLOR_OPTIONS[0]
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-900/60 backdrop-blur-xs font-sans">
        
        {/* Main Modal Shelf Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-5xl bg-white dark:bg-[#0B2530] rounded-3xl sm:rounded-4xl shadow-2xl border border-[#BFE7E8] dark:border-[#38CAD6]/30 flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Top Decorative Header */}
          <div className="px-5 sm:px-8 py-5 border-b border-[#38CAD6]/20 dark:border-[#132F3D] bg-gradient-to-r from-[#F0F9FB] via-[#E8F5F8] to-[#E0F2F5] dark:from-[#091C24] dark:via-[#0E232E] dark:to-[#132F3D] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#38CAD6] to-[#1B6E7D] text-white flex items-center justify-center shadow-md shadow-[#1B6E7D]/20 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold font-serif text-[#14303A] dark:text-[#E4F7F9] flex items-center gap-1.5">
                    <span>✦ Kho lệnh</span>
                    <span className="text-xs text-[#1B6E7D] dark:text-[#48CCD6] font-sans font-normal hidden sm:inline">✦ Command Library</span>
                  </h2>
                  {isAdmin && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#38CAD6]/15 text-[#1B6E7D] dark:text-[#48CCD6] border border-[#38CAD6]/40">
                      Admin Mode
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#53737C] dark:text-[#88A9B3] font-serif">
                  Kệ thẻ lệnh & prompt mẫu được sắp xếp gọn gàng (｡･ω･｡)ﾉ♡
                </p>
              </div>
            </div>

            {/* Top Right Action Buttons */}
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#38CAD6] to-[#1B6E7D] hover:from-[#48CCD6] hover:to-[#38CAD6] text-white text-xs font-bold shadow-md shadow-[#1B6E7D]/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer font-serif"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Thêm lệnh</span>
                </button>
              ) : onOpenAdminAuth ? (
                <button
                  type="button"
                  onClick={onOpenAdminAuth}
                  className="px-3 py-1.5 rounded-full bg-[#E0F3F5] dark:bg-[#132F3D] hover:bg-[#D0EBF0] text-[#1B6E7D] dark:text-[#48CCD6] text-xs font-medium border border-[#38CAD6]/30 transition-colors cursor-pointer hidden sm:flex items-center gap-1 font-serif"
                  title="Đăng nhập Admin để tạo hoặc sửa lệnh"
                >
                  <span>🔐 Đăng lệnh</span>
                </button>
              ) : null}

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-[#53737C] hover:text-[#14303A] dark:text-[#88A9B3] dark:hover:text-white hover:bg-[#38CAD6]/10 dark:hover:bg-[#132F3D] transition-colors cursor-pointer"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Bar & Category Filter Bar */}
          <div className="px-5 sm:px-8 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#53737C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm lệnh (tên, nội dung, category, tag)..."
                  className="w-full pl-9 pr-8 py-2 rounded-2xl text-xs bg-white dark:bg-[#0E232E] border border-[#38CAD6]/30 text-[#14303A] dark:text-[#E4F7F9] placeholder-[#88A9B3] focus:outline-hidden focus:ring-2 focus:ring-[#38CAD6] transition-all font-sans"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#53737C] hover:text-[#14303A]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto font-serif">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#38CAD6]" />
                <span className="text-[11px] text-[#53737C] dark:text-[#88A9B3] font-medium">Sắp xếp:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="text-xs bg-white dark:bg-[#0E232E] border border-[#38CAD6]/30 text-[#14303A] dark:text-[#E4F7F9] rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-[#38CAD6] cursor-pointer"
                >
                  <option value="custom">Thứ tự tùy chỉnh</option>
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="az">Tên A → Z</option>
                  <option value="za">Tên Z → A</option>
                </select>
              </div>
            </div>

            {/* Category Pills (Only non-empty categories created by Admin) */}
            {categories.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-serif">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-gradient-to-r from-[#38CAD6] to-[#1B6E7D] text-white shadow-xs'
                      : 'bg-[#E0F3F5] dark:bg-[#0E232E] text-[#1B6E7D] dark:text-[#48CCD6] hover:bg-[#D0EBF0]'
                  }`}
                >
                  Tất cả ({commands.length})
                </button>
                {categories.map((cat) => {
                  const count = commands.filter((c) => c.category === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-gradient-to-r from-[#38CAD6] to-[#1B6E7D] text-white shadow-xs'
                          : 'bg-[#E0F3F5] dark:bg-[#0E232E] text-[#1B6E7D] dark:text-[#48CCD6] hover:bg-[#D0EBF0]'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cards Grid Content Container (Kệ thẻ giấy nhỏ) */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-slate-50/50 dark:bg-slate-950/40">
            {filteredCommands.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredCommands.map((cmd, index) => {
                  const colorConfig = getColorConfig(cmd.color);
                  const isCopied = copiedId === cmd.id;

                  return (
                    <motion.div
                      key={cmd.id}
                      layout
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      whileHover={{ y: -3, transition: { duration: 0.15 } }}
                      style={{
                        backgroundColor: colorConfig.hex,
                        borderColor: colorConfig.borderHex,
                      }}
                      className="group relative rounded-3xl p-4 sm:p-5 border shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden text-slate-800"
                    >
                      {/* Corner Decoration chosen by Admin */}
                      <div className="absolute top-3 right-3.5 text-sm select-none opacity-70 group-hover:opacity-100 group-hover:scale-125 transition-transform text-slate-700">
                        {cmd.decoration || '♡'}
                      </div>

                      {/* Card Header & Info */}
                      <div className="space-y-2.5">
                        {/* Category & Tags Header */}
                        <div className="flex flex-wrap items-center gap-1.5 pr-6">
                          <span
                            style={{ backgroundColor: colorConfig.tagBg, color: colorConfig.tagText }}
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase"
                          >
                            {cmd.category || 'Chung'}
                          </span>
                          {cmd.tags &&
                            cmd.tags.slice(0, 2).map((t) => (
                              <span
                                key={t}
                                className="px-1.5 py-0.5 rounded-md text-[10px] bg-white/60 text-slate-600 font-medium"
                              >
                                #{t}
                              </span>
                            ))}
                        </div>

                        {/* Command Name */}
                        <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug line-clamp-2">
                          {cmd.name}
                        </h3>

                        {/* Short Description */}
                        {cmd.description && (
                          <p className="text-xs text-slate-700/85 leading-relaxed line-clamp-2">
                            {cmd.description}
                          </p>
                        )}
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="pt-4 mt-3 border-t border-black/5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {/* ✦ Nút Sao chép */}
                          <button
                            type="button"
                            onClick={() => handleCopy(cmd)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                              isCopied
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white/90 hover:bg-white text-slate-800 hover:text-rose-600 border border-black/5'
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>✓ Đã sao chép</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>Sao chép</span>
                              </>
                            )}
                          </button>

                          {/* ୨୧ Nút Xem chi tiết */}
                          <button
                            type="button"
                            onClick={() => {
                              setDetailCommand(cmd);
                              if (isSfxOn) triggerSfx('pop', sfxVolume);
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/50 hover:bg-white/90 text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 opacity-70" />
                            <span>Xem chi tiết</span>
                          </button>
                        </div>

                        {/* Admin Inline Edit/Delete/Reorder Tools */}
                        {isAdmin && (
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            {sortOption === 'custom' && (
                              <div className="flex items-center gap-0.5 mr-1">
                                <button
                                  type="button"
                                  onClick={() => handleMove(index, 'up')}
                                  disabled={index === 0}
                                  className="p-1 rounded-lg bg-white/70 hover:bg-white text-slate-600 disabled:opacity-30 cursor-pointer"
                                  title="Di chuyển lên"
                                >
                                  <MoveUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMove(index, 'down')}
                                  disabled={index === filteredCommands.length - 1}
                                  className="p-1 rounded-lg bg-white/70 hover:bg-white text-slate-600 disabled:opacity-30 cursor-pointer"
                                  title="Di chuyển xuống"
                                >
                                  <MoveDown className="w-3 h-3" />
                                </button>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => handleOpenEdit(cmd)}
                              className="p-1.5 rounded-xl bg-white/70 hover:bg-white text-slate-700 hover:text-[#1B6E7D] transition-colors cursor-pointer"
                              title="Chỉnh sửa lệnh"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setCommandToDelete(cmd)}
                              className="p-1.5 rounded-xl bg-white/70 hover:bg-white text-slate-700 hover:text-[#E07A7A] transition-colors cursor-pointer"
                              title="Xóa lệnh"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* Empty Search / Empty Library State */
              <div className="py-16 text-center space-y-3">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-16 h-16 rounded-3xl bg-[#71BFC6]/15 text-[#1B6E7D] dark:text-[#7DD8DE] mx-auto flex items-center justify-center border border-[#71BFC6]/30"
                >
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </motion.div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    Chưa tìm thấy lệnh phù hợp ♡
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    {searchQuery
                      ? 'Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác nhé!'
                      : 'Hiện chưa có lệnh nào trong kho. Admin có thể thêm lệnh mới bất cứ lúc nào.'}
                  </p>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#8CCFD3] to-[#71BFC6] hover:brightness-105 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Thêm lệnh đầu tiên</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span>୨୧</span>
              <span>Tổng số: <strong className="text-slate-700 dark:text-slate-200">{filteredCommands.length}</strong> lệnh</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </motion.div>

        {/* ======================================================== */}
        {/* ୨୧ 1. MODAL XEM CHI TIẾT LỆNH (ZOOM / EXPANDED DETAIL)     */}
        {/* ======================================================== */}
        <AnimatePresence>
          {detailCommand && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: 20 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{
                  backgroundColor: getColorConfig(detailCommand.color).hex,
                  borderColor: getColorConfig(detailCommand.color).borderHex,
                }}
                className="relative w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border-2 flex flex-col max-h-[85vh] text-slate-900 overflow-hidden"
              >
                {/* Close Button Top Right */}
                <button
                  type="button"
                  onClick={() => setDetailCommand(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/5 hover:bg-black/10 text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header Information */}
                <div className="space-y-2 pr-8">
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        backgroundColor: getColorConfig(detailCommand.color).tagBg,
                        color: getColorConfig(detailCommand.color).tagText,
                      }}
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
                    >
                      {detailCommand.category}
                    </span>
                    <span className="text-base select-none">{detailCommand.decoration || '♡'}</span>
                    {detailCommand.tags &&
                      detailCommand.tags.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-md text-xs bg-white/70 text-slate-700 font-medium">
                          #{t}
                        </span>
                      ))}
                  </div>

                  {/* Tên lệnh */}
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                    {detailCommand.name}
                  </h2>

                  {/* Mô tả */}
                  {detailCommand.description && (
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                      {detailCommand.description}
                    </p>
                  )}
                </div>

                {/* Nội dung lệnh Box */}
                <div className="my-4 flex-1 flex flex-col min-h-0 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-slate-600" />
                      <span>Nội dung lệnh (Prompt)</span>
                    </span>
                    <span className="text-[11px] font-normal text-slate-600">Hỗ trợ xuống dòng & ký tự đầy đủ</span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-white/95 border border-black/10 shadow-inner font-mono text-xs sm:text-sm text-slate-900 leading-relaxed whitespace-pre-wrap select-all">
                    {detailCommand.content}
                  </div>
                </div>

                {/* Detail Bottom Action Buttons */}
                <div className="pt-2 flex items-center justify-between gap-3 border-t border-black/10">
                  <button
                    type="button"
                    onClick={() => setDetailCommand(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/70 hover:bg-white text-slate-700 transition-colors cursor-pointer"
                  >
                    Đóng
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(detailCommand)}
                    className="px-6 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#8CCFD3] to-[#71BFC6] hover:brightness-105 text-white shadow-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    {copiedId === detailCommand.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>✓ Đã sao chép lệnh ♡</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Sao chép lệnh</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ======================================================== */}
        {/* 🎀 2. ADMIN FORM TẠO & SỬA LỆNH (TỜ GIẤY GHI CHÚ)         */}
        {/* ======================================================== */}
        <AnimatePresence>
          {isFormOpen && (
            <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/75 backdrop-blur-xs font-sans">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                className="relative w-full max-w-4xl bg-white dark:bg-[#0E232E] rounded-3xl sm:rounded-4xl shadow-2xl border-2 border-[#38CAD6]/40 dark:border-[#38CAD6]/30 p-5 sm:p-7 flex flex-col max-h-[92vh] overflow-y-auto space-y-5 text-[#14303A] dark:text-[#E4F7F9]"
              >
                {/* Form Top Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#38CAD6]/20 dark:border-[#132F3D]">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">📝</span>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold font-serif text-[#14303A] dark:text-white">
                        {editingCommand ? 'Chỉnh sửa lệnh' : 'Đăng lệnh mới vào Kho lệnh'}
                      </h3>
                      <p className="text-xs text-[#53737C] dark:text-[#88A9B3]">
                        Nội dung do Admin tự thiết lập, lưu trữ trực tiếp trên hệ thống
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="p-2 rounded-full text-[#53737C] hover:text-[#14303A] dark:text-[#88A9B3] dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Form Inputs (Tờ giấy ghi chú) */}
                  <div className="lg:col-span-7 space-y-4 font-serif">
                    {/* Tên lệnh */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#14303A] dark:text-slate-200">
                        Tên lệnh <span className="text-[#38CAD6]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Nhập tên lệnh..."
                        className="w-full px-3.5 py-2 rounded-xl text-xs bg-[#F2FBFC] dark:bg-[#07171F] border border-[#38CAD6]/30 text-[#14303A] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#38CAD6] font-sans"
                      />
                    </div>

                    {/* Mô tả ngắn */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#14303A] dark:text-slate-200">
                        Mô tả ngắn
                      </label>
                      <input
                        type="text"
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Mô tả ngắn về lệnh..."
                        className="w-full px-3.5 py-2 rounded-xl text-xs bg-[#F2FBFC] dark:bg-[#07171F] border border-[#38CAD6]/30 text-[#14303A] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#38CAD6] font-sans"
                      />
                    </div>

                    {/* Nội dung lệnh */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#14303A] dark:text-slate-200">
                        Nội dung lệnh (Prompt) <span className="text-[#38CAD6]">*</span>
                      </label>
                      <textarea
                        rows={6}
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        placeholder="Nhập nội dung lệnh..."
                        className="w-full px-3.5 py-2.5 rounded-xl font-mono text-xs bg-[#F2FBFC] dark:bg-[#07171F] border border-[#38CAD6]/30 text-[#14303A] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#38CAD6] leading-relaxed"
                      />
                    </div>

                    {/* Category Selection / Creation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#14303A] dark:text-slate-200">
                          Danh mục (Category)
                        </label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl text-xs bg-[#F2FBFC] dark:bg-[#07171F] border border-[#38CAD6]/30 text-[#14303A] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#38CAD6]"
                        >
                          <option value="Character">Character</option>
                          <option value="Story">Story</option>
                          <option value="Roleplay">Roleplay</option>
                          <option value="Website">Website</option>
                          <option value="Khác">Khác</option>
                          {categories
                            .filter((c) => !['Character', 'Story', 'Roleplay', 'Website', 'Khác'].includes(c))
                            .map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#14303A] dark:text-slate-200 flex items-center gap-1">
                          <FolderPlus className="w-3 h-3 text-[#38CAD6]" />
                          <span>Hoặc tạo Category mới</span>
                        </label>
                        <input
                          type="text"
                          value={formNewCategoryInput}
                          onChange={(e) => setFormNewCategoryInput(e.target.value)}
                          placeholder="Nhập tên category mới..."
                          className="w-full px-3 py-2 rounded-xl text-xs bg-[#F2FBFC] dark:bg-[#07171F] border border-[#38CAD6]/30 text-[#14303A] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#38CAD6] font-sans"
                        />
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#14303A] dark:text-slate-200 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-[#38CAD6]" />
                        <span>Tag</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          placeholder="Nhập tag và bấm Thêm..."
                          className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-[#F2FBFC] dark:bg-[#07171F] border border-[#38CAD6]/30 text-[#14303A] dark:text-white font-sans"
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="px-3 py-1.5 rounded-xl bg-[#E0F3F5] hover:bg-[#D0EBF0] text-[#1B6E7D] dark:text-[#48CCD6] text-xs font-semibold transition-colors cursor-pointer"
                        >
                          + Thêm
                        </button>
                      </div>
                      {formTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {formTags.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-full text-[11px] bg-[#38CAD6]/15 text-[#1B6E7D] dark:text-[#48CCD6] flex items-center gap-1 font-sans"
                            >
                              <span>#{t}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(t)}
                                className="hover:text-[#1B6E7D] font-bold"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Màu Card */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#14303A] dark:text-slate-200 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-[#38CAD6]" />
                        <span>Màu Card</span>
                      </label>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                        {COMMAND_COLOR_OPTIONS.map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() => setFormColor(c.hex)}
                            style={{ backgroundColor: c.hex, borderColor: c.borderHex }}
                            className={`h-9 rounded-xl border flex flex-col items-center justify-center text-[10px] font-bold text-slate-800 transition-all cursor-pointer ${
                              formColor.toLowerCase() === c.hex.toLowerCase()
                                ? 'ring-2 ring-[#38CAD6] scale-105 shadow-sm'
                                : 'hover:scale-102 opacity-85 hover:opacity-100'
                            }`}
                            title={c.name}
                          >
                            {formColor.toLowerCase() === c.hex.toLowerCase() && <span>✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Decoration */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#14303A] dark:text-slate-200">
                        Decoration góc thẻ
                      </label>
                      <div className="flex items-center gap-2">
                        {COMMAND_DECORATIONS.map((decor) => (
                          <button
                            key={decor}
                            type="button"
                            onClick={() => setFormDecoration(decor)}
                            className={`w-10 h-10 rounded-xl text-sm font-serif transition-all cursor-pointer ${
                              formDecoration === decor
                                ? 'bg-[#38CAD6] text-white font-bold shadow-md shadow-[#38CAD6]/25 scale-105'
                                : 'bg-[#E0F3F5] dark:bg-[#07171F] text-[#14303A] dark:text-slate-300 hover:bg-[#D0EBF0]'
                            }`}
                          >
                            {decor}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Preview */}
                  <div className="lg:col-span-5 space-y-3 font-serif">
                    <div className="text-xs font-bold text-[#14303A] dark:text-slate-200 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#38CAD6]" />
                      <span>Xem trước Card thực tế (Live Preview)</span>
                    </div>

                    {/* Preview Card */}
                    {(() => {
                      const prevColor = getColorConfig(formColor);
                      const displayCat = formNewCategoryInput.trim() || formCategory.trim() || 'Chung';

                      return (
                        <div
                          style={{
                            backgroundColor: prevColor.hex,
                            borderColor: prevColor.borderHex,
                          }}
                          className="relative rounded-3xl p-5 border shadow-sm flex flex-col justify-between min-h-[220px] text-slate-900"
                        >
                          <div className="absolute top-3.5 right-4 text-base select-none text-slate-700">
                            {formDecoration}
                          </div>

                          <div className="space-y-2.5">
                            <div className="flex flex-wrap items-center gap-1.5 pr-6">
                              <span
                                style={{ backgroundColor: prevColor.tagBg, color: prevColor.tagText }}
                                className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase"
                              >
                                {displayCat}
                              </span>
                              {formTags.slice(0, 2).map((t) => (
                                <span key={t} className="px-1.5 py-0.5 rounded-md text-[10px] bg-white/70 text-slate-700">
                                  #{t}
                                </span>
                              ))}
                            </div>

                            <h4 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                              {formName.trim() || 'Tên lệnh mẫu...'}
                            </h4>

                            <p className="text-xs text-slate-700/85 leading-relaxed line-clamp-3">
                              {formDescription.trim() || 'Mô tả ngắn về lệnh hiển thị tại đây...'}
                            </p>
                          </div>

                          <div className="pt-4 mt-3 border-t border-black/5 flex items-center justify-between gap-2 font-sans">
                            <div className="flex items-center gap-1.5">
                              <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/90 text-slate-800 border border-black/5 flex items-center gap-1">
                                <Copy className="w-3 h-3 text-slate-500" />
                                <span>Sao chép</span>
                              </span>
                              <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/50 text-slate-700">
                                Xem chi tiết
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="p-3.5 rounded-2xl bg-[#38CAD6]/10 border border-[#38CAD6]/30 text-[11px] text-[#1B6E7D] dark:text-[#48CCD6] leading-relaxed">
                      💡 <strong>Quy chuẩn nội dung:</strong> Toàn bộ câu lệnh và bối cảnh do Admin biên soạn. Khi người dùng bấm <em>Sao chép</em>, toàn bộ nội dung trong ô <em>Nội dung lệnh</em> sẽ được copy chuẩn xác 100%.
                    </div>
                  </div>
                </div>

                {/* Form Action Footer */}
                <div className="pt-3 border-t border-[#38CAD6]/20 dark:border-[#132F3D] flex items-center justify-end gap-2.5 font-serif">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#E8F7F9] hover:bg-[#DDF2F5] dark:bg-[#132F3D] dark:hover:bg-[#1A3D4D] text-[#14303A] dark:text-[#E4F7F9] transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSaveForm}
                    className="px-6 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#38CAD6] to-[#1B6E7D] hover:from-[#48CCD6] hover:to-[#38CAD6] text-white shadow-md shadow-[#1B6E7D]/25 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <span>{editingCommand ? '✦ Cập nhật lệnh' : '✦ Đăng lệnh'}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ======================================================== */}
        {/* 🗑️ 3. HỘP XÁC NHẬN XÓA LỆNH (CONFIRMATION DIALOG)          */}
        {/* ======================================================== */}
        <AnimatePresence>
          {commandToDelete && (
            <div className="fixed inset-0 z-80 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-sans">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 10 }}
                className="bg-white dark:bg-[#0E232E] rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#38CAD6]/30 dark:border-[#38CAD6]/20 text-center space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#E0F3F5] dark:bg-[#091D26] text-[#1B6E7D] dark:text-[#48CCD6] mx-auto flex items-center justify-center border border-[#38CAD6]/30">
                  <Trash2 className="w-6 h-6" />
                </div>

                <div className="space-y-1.5 font-serif">
                  <h4 className="text-base font-bold text-[#14303A] dark:text-white">
                    Xóa lệnh này?
                  </h4>
                  <p className="text-xs text-[#53737C] dark:text-[#88A9B3]">
                    Lệnh <span className="font-bold text-[#1B6E7D] dark:text-[#48CCD6]">"{commandToDelete.name}"</span> sẽ không còn xuất hiện trong Kho lệnh.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 pt-2 font-serif">
                  <button
                    type="button"
                    onClick={() => setCommandToDelete(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#E8F7F9] hover:bg-[#DDF2F5] dark:bg-[#132F3D] dark:hover:bg-[#1A3D4D] text-[#14303A] dark:text-[#E4F7F9] transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#38CAD6] to-[#1B6E7D] hover:from-[#48CCD6] hover:to-[#38CAD6] text-white shadow-md shadow-[#1B6E7D]/20 transition-colors cursor-pointer"
                  >
                    Xóa
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </AnimatePresence>
  );
};

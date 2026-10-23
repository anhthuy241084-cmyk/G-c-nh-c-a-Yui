import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Compass,
  MapPin,
  Sparkles,
  ChevronRight,
  Gift,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { Character } from '../types';
import { triggerSfx } from '../utils/sfx';

interface OceanArchipelagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  onSelectCharacter?: (character: Character) => void;
  isSfxOn?: boolean;
  sfxVolume?: number;
  onToast?: (msg: string) => void;
}

interface IslandInfo {
  id: string;
  name: string;
  hanzi: string;
  pinyin: string;
  tags: string[];
  icon: string;
  themeColor: string;
  bgGradient: string;
  borderColor: string;
  description: string;
  treasureQuote: string;
}

const ISLANDS: IslandInfo[] = [
  {
    id: 'sakura',
    name: 'Đảo Hoa Anh Đào & Tình Thơ',
    hanzi: '桃源仙境',
    pinyin: 'Đào Nguyên Tiên Cảnh',
    tags: ['ngọt', 'lãng mạn', 'tình cảm', 'school'],
    icon: '🌸',
    themeColor: '#F472B6',
    bgGradient: 'from-[#FDF2F8] to-[#FCE7F3] dark:from-[#371B28] dark:to-[#1F0E16]',
    borderColor: 'border-[#F472B6]/40',
    description: 'Bờ cát phủ đầy cánh hoa anh đào, nơi cất giữ những mối tình ngọt ngào và rung động đầu đời.',
    treasureQuote: '« Hữu tình nhân chung thành quyến thuộc » · Chúc cậu tìm thấy nhân vật khiến trái tim khẽ loạn nhịp.',
  },
  {
    id: 'ancient',
    name: 'Quần Đảo Vương Triều Cổ Phong',
    hanzi: '秦楼月夜',
    pinyin: 'Tần Lâu Nguyệt Dạ',
    tags: ['cổ trang', 'tiên hiệp', 'kiếm hiệp', 'hoàng cung'],
    icon: '🏮',
    themeColor: '#F59E0B',
    bgGradient: 'from-[#FFFBEB] to-[#FEF3C7] dark:from-[#352309] dark:to-[#1C1204]',
    borderColor: 'border-[#F59E0B]/40',
    description: 'Thành quách uy nghiêm giữa làn sương mờ, chốn lưu dấu ân oán giang hồ và tình duyên tiền kiếp.',
    treasureQuote: '« Nhất kiến chung tình, vạn kiếp bất vong » · Nâng chén rượu đào cùng bậc hào kiệt tri âm.',
  },
  {
    id: 'cosmic',
    name: 'Vịnh Ngân Hà & Kỳ Ảo',
    hanzi: '星海微茫',
    pinyin: 'Tinh Hải Vi Mang',
    tags: ['open world', 'viễn tưởng', 'siêu nhiên', 'magic'],
    icon: '🌌',
    themeColor: '#818CF8',
    bgGradient: 'from-[#EEF2FF] to-[#E0E7FF] dark:from-[#171A38] dark:to-[#0B0D1F]',
    borderColor: 'border-[#818CF8]/40',
    description: 'Vùng biển phản chiếu ánh sao băng vô tận, mở ra những thế giới rộng lớn kỳ bí.',
    treasureQuote: '« Bất tri thiên thượng cung khuyết » · Tự do thám hiểm vũ trụ không giới hạn cùng bạn đồng hành.',
  },
  {
    id: 'urban',
    name: 'Bến Cảng Đô Thị Mưa',
    hanzi: '烟雨江南',
    pinyin: 'Yên Vũ Giang Nam',
    tags: ['hiện đại', 'txvt', 'học đường', 'đô thị'],
    icon: '☕',
    themeColor: '#38CAD6',
    bgGradient: 'from-[#F0FDFA] to-[#CCFBF1] dark:from-[#06292E] dark:to-[#031518]',
    borderColor: 'border-[#38CAD6]/40',
    description: 'Quán cà phê ấm áp bên góc phố lên đèn, nơi những câu chuyện hiện đại đời thường lắng đọng.',
    treasureQuote: '« Nhược chỉ như sơ kiến » · Giữa muôn vàn vội vã, luôn có một bóng hình đợi cậu trở về.',
  },
  {
    id: 'thrill',
    name: 'Vực Biển Thách Thức & Đấu Trí',
    hanzi: '惊涛骇浪',
    pinyin: 'Kinh Đào Hãi Lãng',
    tags: ['ngược', 'drama', 'thần bí', 'hành động'],
    icon: '⚔️',
    themeColor: '#EC4899',
    bgGradient: 'from-[#FDF2F8] to-[#FCE7F3] dark:from-[#2B0E1B] dark:to-[#17060D]',
    borderColor: 'border-[#EC4899]/40',
    description: 'Vùng sóng gầm bí ẩn dành cho những tâm hồn thích thử thách cảm xúc, đấu trí và cao trào kịch tính.',
    treasureQuote: '« Phong vũ đồng chu » · Dù phong ba trắc trở, chân tình sau cùng vẫn rực sáng kiên cường.',
  },
  {
    id: 'healing',
    name: 'Rạn San Hô Chữa Lành',
    hanzi: '春暖花开',
    pinyin: 'Xuân Noãn Hoa Khai',
    tags: ['chữa lành', 'ấm áp', 'cozy', 'fluff'],
    icon: '🧸',
    themeColor: '#34D399',
    bgGradient: 'from-[#ECFDF5] to-[#D1FAE5] dark:from-[#062D1F] dark:to-[#031710]',
    borderColor: 'border-[#34D399]/40',
    description: 'Khu vịnh êm ả với cát trắng và rạn san hô rực rỡ, nơi mọi mệt mỏi được xoa dịu dịu dàng.',
    treasureQuote: '« Tuế nguyệt tĩnh hảo » · Chúc cậu luôn tìm thấy chốn bình yên ấm áp nơi góc nhỏ này.',
  },
];

export const OceanArchipelagoModal: React.FC<OceanArchipelagoModalProps> = ({
  isOpen,
  onClose,
  characters,
  onSelectCharacter,
  isSfxOn = true,
  sfxVolume = 0.5,
  onToast,
}) => {
  const [selectedIsland, setSelectedIsland] = useState<IslandInfo>(ISLANDS[0]);
  const [openedTreasures, setOpenedTreasures] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  // Filter characters matching current island
  const matchedCharacters = characters.filter((c) => {
    if (c.isDraft || c.isPrivate) return false;
    const charTags = (c.tags || []).map((t) => t.toLowerCase());
    return selectedIsland.tags.some((t) => charTags.includes(t.toLowerCase()));
  });

  const handleIslandClick = (island: IslandInfo) => {
    if (isSfxOn) triggerSfx('pop', sfxVolume);
    setSelectedIsland(island);
  };

  const handleOpenTreasure = (islandId: string) => {
    if (isSfxOn) triggerSfx('sparkle', sfxVolume);
    setOpenedTreasures((prev) => ({ ...prev, [islandId]: true }));
    if (onToast) {
      onToast(`🎁 ${selectedIsland.treasureQuote}`);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#04121A]/75 backdrop-blur-md transition-opacity"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative w-full max-w-4xl bg-gradient-to-b from-[#FFFDFD] via-[#F4FBFC] to-[#E9F8FA] dark:from-[#061821] dark:via-[#09222E] dark:to-[#04131A] rounded-3xl border border-[#38CAD6]/35 dark:border-[#38CAD6]/30 shadow-2xl shadow-[#1B6E7D]/25 dark:shadow-black/70 overflow-hidden my-auto max-h-[92vh] flex flex-col z-10"
        >
          {/* Header Glow Elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#38CAD6]/20 dark:bg-[#38CAD6]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          {/* Modal Header */}
          <div className="p-5 sm:p-6 pb-4 border-b border-[#38CAD6]/20 dark:border-[#102B36] flex items-start justify-between gap-3 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-2xl bg-gradient-to-tr from-[#38CAD6] to-[#1B6E7D] text-white shadow-md shadow-[#1B6E7D]/20">
                  <Compass className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#14303A] dark:text-[#E4F7F9] font-serif flex items-center gap-2">
                    <span>Hải Đồ Thám Hiểm · Quần Đảo Nhân Vật</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#38CAD6]/20 text-[#1B6E7D] dark:text-[#48CCD6] font-sans font-semibold">
                      Bản đồ kỳ ảo ✦
                    </span>
                  </h3>
                  <p className="text-xs text-[#53737C] dark:text-[#88A9B3] font-serif">
                    Khám phá các miền đất diệu kỳ và tìm kiếm nhân vật định mệnh của cậu
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#53737C] hover:text-[#14303A] dark:text-[#88A9B3] dark:hover:text-white hover:bg-[#E0F3F5] dark:hover:bg-[#132F3D] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body - 2 Columns Layout */}
          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 overflow-y-auto custom-scrollbar flex-1 relative z-10">
            
            {/* Left Column: Interactive Map of 6 Islands (5 cols on md) */}
            <div className="md:col-span-5 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#1B6E7D] dark:text-[#7DD8DE] font-serif uppercase tracking-wider mb-1">
                <span>🗺️ Chọn Quần Đảo Khám Phá</span>
                <span className="text-[10px] font-normal text-[#53737C] dark:text-[#88A9B3]">
                  6 Vùng đất
                </span>
              </div>

              <div className="space-y-2">
                {ISLANDS.map((island) => {
                  const isSelected = selectedIsland.id === island.id;
                  const isTreasureClaimed = openedTreasures[island.id];
                  const islandChars = characters.filter((c) => {
                    if (c.isDraft || c.isPrivate) return false;
                    const cTags = (c.tags || []).map((t) => t.toLowerCase());
                    return island.tags.some((t) => cTags.includes(t.toLowerCase()));
                  });

                  return (
                    <button
                      key={island.id}
                      onClick={() => handleIslandClick(island)}
                      className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? `bg-gradient-to-r ${island.bgGradient} ${island.borderColor} shadow-sm ring-2 ring-[#38CAD6]/40 scale-[1.01]`
                          : 'bg-[#FFFDFC]/80 dark:bg-[#081E27]/60 border-[#38CAD6]/15 hover:bg-[#E8F7F9] dark:hover:bg-[#0E2732]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#05131A] shadow-xs flex items-center justify-center text-xl shrink-0">
                          {island.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#14303A] dark:text-[#E4F7F9] truncate font-serif">
                            {island.name}
                          </div>
                          <div className="text-[10px] text-[#53737C] dark:text-[#88A9B3] truncate">
                            {island.hanzi} · {island.pinyin}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2 py-0.5 rounded-full bg-[#38CAD6]/20 text-[#1B6E7D] dark:text-[#48CCD6] text-[10px] font-bold">
                          {islandChars.length} nhân vật
                        </span>
                        {isTreasureClaimed && <span title="Đã mở rương báu">✨</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Selected Island Details & Characters list (7 cols on md) */}
            <div className="md:col-span-7 space-y-4">
              
              {/* Active Island Banner */}
              <div
                className={`p-5 rounded-3xl bg-gradient-to-br ${selectedIsland.bgGradient} border ${selectedIsland.borderColor} shadow-sm relative overflow-hidden space-y-3`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-2xl bg-white/80 dark:bg-black/40 shadow-xs">
                      {selectedIsland.icon}
                    </span>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-[#14303A] dark:text-[#E4F7F9] font-serif">
                        {selectedIsland.name}
                      </h4>
                      <div className="text-xs text-[#1B6E7D] dark:text-[#7DD8DE] font-serif">
                        « {selectedIsland.hanzi} » · {selectedIsland.pinyin}
                      </div>
                    </div>
                  </div>

                  {/* Treasure Chest Button */}
                  <button
                    onClick={() => handleOpenTreasure(selectedIsland.id)}
                    className="px-3 py-1.5 rounded-2xl bg-white/90 dark:bg-[#071C25]/90 border border-[#F59E0B]/50 hover:border-[#F59E0B] shadow-xs text-xs font-bold text-[#B45309] dark:text-[#FBBF24] flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                    title="Mở rương báu bí mật của vùng biển này"
                  >
                    <Gift className="w-4 h-4 text-[#F59E0B]" />
                    <span>{openedTreasures[selectedIsland.id] ? 'Xem Lại Rương' : 'Mở Rương Báu'}</span>
                  </button>
                </div>

                <p className="text-xs text-[#53737C] dark:text-[#88A9B3] leading-relaxed font-serif">
                  {selectedIsland.description}
                </p>

                {/* Opened Treasure Verse Display */}
                {openedTreasures[selectedIsland.id] && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-2xl bg-white/80 dark:bg-black/30 border border-[#F59E0B]/30 text-xs text-[#B45309] dark:text-[#FBBF24] font-serif italic"
                  >
                    🎁 {selectedIsland.treasureQuote}
                  </motion.div>
                )}
              </div>

              {/* Character List from This Island */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#1B6E7D] dark:text-[#7DD8DE] font-serif uppercase tracking-wider">
                  <span>✦ Nhân Vật Thuộc Vùng Biển Này ({matchedCharacters.length})</span>
                </div>

                {matchedCharacters.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#FFFDFC]/60 dark:bg-[#091D26]/40 border border-dashed border-[#38CAD6]/30 text-center space-y-2">
                    <span className="text-3xl">⛵</span>
                    <p className="text-xs text-[#53737C] dark:text-[#88A9B3] font-serif">
                      Chưa có nhân vật nào cập bến hòn đảo này. Bạn có thể gửi yêu cầu tạo nhân vật ở mục "Gửi đơn Creator"!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[42vh] overflow-y-auto pr-1 custom-scrollbar">
                    {matchedCharacters.map((char) => (
                      <div
                        key={char.id}
                        onClick={() => {
                          if (onSelectCharacter) {
                            if (isSfxOn) triggerSfx('pop', sfxVolume);
                            onSelectCharacter(char);
                            onClose();
                          }
                        }}
                        className="p-3 rounded-2xl bg-[#FFFDFC] dark:bg-[#0B232E] border border-[#38CAD6]/25 hover:border-[#38CAD6] shadow-xs flex items-center gap-3 transition-all cursor-pointer group hover:scale-[1.02]"
                      >
                        <img
                          src={char.avatar || '/placeholder.png'}
                          alt={char.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#38CAD6]/30 group-hover:shadow-md transition-shadow"
                          onError={(e) => {
                            (e.target as any).src =
                              'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-[#14303A] dark:text-[#E4F7F9] truncate group-hover:text-[#38CAD6] transition-colors">
                            {char.name}
                          </div>
                          <p className="text-[10px] text-[#53737C] dark:text-[#88A9B3] truncate">
                            {char.title || 'Nhân vật Character AI'}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#38CAD6]/15 text-[#1B6E7D] dark:text-[#48CCD6] font-semibold">
                              {char.tags?.[0] || 'AI'}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#53737C] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-[#38CAD6]/20 dark:border-[#102B36] bg-[#F6FBFC]/80 dark:bg-[#05131A]/80 flex items-center justify-between gap-3 relative z-10">
            <div className="text-xs text-[#53737C] dark:text-[#88A9B3] font-serif">
              ✦ Khám phá tất cả các quần đảo để nhận phước lành từ biển cả
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-2xl bg-[#38CAD6] hover:bg-[#2EB8C4] text-white text-xs font-bold transition-all shadow-md shadow-[#38CAD6]/20 cursor-pointer active:scale-95 font-serif"
            >
              Đóng hải đồ
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OceanArchipelagoModal;

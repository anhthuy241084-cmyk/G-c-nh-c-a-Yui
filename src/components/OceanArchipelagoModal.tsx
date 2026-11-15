import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Compass,
  ChevronRight,
  Gift,
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

interface RegionInfo {
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

const WINTER_REGIONS: RegionInfo[] = [
  {
    id: 'sakura',
    name: 'Vườn Anh Đào Phủ Tuyết',
    hanzi: '桃源仙境',
    pinyin: 'Đào Nguyên Tiên Cảnh',
    tags: ['ngọt', 'lãng mạn', 'tình cảm', 'school'],
    icon: '🌸',
    themeColor: '#F472B6',
    bgGradient: 'from-[#FDF2F8] to-[#FCE7F3] dark:from-[#371B28] dark:to-[#1F0E16]',
    borderColor: 'border-[#F472B6]/40',
    description: 'Khu vườn phủ đầy tuyết mỏng và cánh hoa anh đào, nơi cất giữ những mối tình ngọt ngào và rung động đầu đời.',
    treasureQuote: '« Hữu tình nhân chung thành quyến thuộc » · Chúc cậu tìm thấy nhân vật khiến trái tim khẽ loạn nhịp.',
  },
  {
    id: 'ancient',
    name: 'Cố Đô Đêm Tuyết Cổ Phong',
    hanzi: '秦楼月夜',
    pinyin: 'Tần Lâu Nguyệt Dạ',
    tags: ['cổ trang', 'tiên hiệp', 'kiếm hiệp', 'hoàng cung'],
    icon: '🏮',
    themeColor: '#F59E0B',
    bgGradient: 'from-[#FFFBEB] to-[#FEF3C7] dark:from-[#352309] dark:to-[#1C1204]',
    borderColor: 'border-[#F59E0B]/40',
    description: 'Thành quách uy nghiêm dưới ánh đèn lồng và màn tuyết nhẹ, chốn lưu dấu ân oán giang hồ và tình duyên tiền kiếp.',
    treasureQuote: '« Nhất kiến chung tình, vạn kiếp bất vong » · Nâng chén trà ấm cùng bậc hào kiệt tri âm.',
  },
  {
    id: 'cosmic',
    name: 'Thung Lũng Tinh Hà Kỳ Ảo',
    hanzi: '星海微茫',
    pinyin: 'Tinh Hải Vi Mang',
    tags: ['open world', 'viễn tưởng', 'siêu nhiên', 'magic'],
    icon: '🌌',
    themeColor: '#818CF8',
    bgGradient: 'from-[#EEF2FF] to-[#E0E7FF] dark:from-[#171A38] dark:to-[#0B0D1F]',
    borderColor: 'border-[#818CF8]/40',
    description: 'Đỉnh núi băng phản chiếu ánh sao băng vô tận, mở ra những thế giới rộng lớn kỳ bí.',
    treasureQuote: '« Bất tri thiên thượng cung khuyết » · Tự do thám hiểm vũ trụ không giới hạn cùng bạn đồng hành.',
  },
  {
    id: 'urban',
    name: 'Góc Phố Cà Phê Ngày Đông',
    hanzi: '烟雨江南',
    pinyin: 'Yên Vũ Giang Nam',
    tags: ['hiện đại', 'txvt', 'học đường', 'đô thị'],
    icon: '☕',
    themeColor: '#526B80',
    bgGradient: 'from-[#F7FAFD] to-[#E8F1F8] dark:from-[#202F42] dark:to-[#172536]',
    borderColor: 'border-[#91A9BC]/50',
    description: 'Quán cà phê ấm áp bên góc phố lên đèn giữa ngày đông, nơi những câu chuyện hiện đại đời thường lắng đọng.',
    treasureQuote: '« Nhược chỉ như sơ kiến » · Giữa muôn vàn vội vã, luôn có một bóng hình đợi cậu trở về.',
  },
  {
    id: 'thrill',
    name: 'Đỉnh Tuyết Thách Thức & Đấu Trí',
    hanzi: '惊涛骇浪',
    pinyin: 'Kinh Đào Hãi Lãng',
    tags: ['ngược', 'drama', 'thần bí', 'hành động'],
    icon: '⚔️',
    themeColor: '#EC4899',
    bgGradient: 'from-[#FDF2F8] to-[#FCE7F3] dark:from-[#2B0E1B] dark:to-[#17060D]',
    borderColor: 'border-[#EC4899]/40',
    description: 'Vùng núi tuyết bí ẩn dành cho những tâm hồn thích thử thách cảm xúc, đấu trí và cao trào kịch tính.',
    treasureQuote: '« Phong vũ đồng chu » · Dù phong ba trắc trở, chân tình sau cùng vẫn rực sáng kiên cường.',
  },
  {
    id: 'healing',
    name: 'Nhà Gỗ Ấm Áp Chữa Lành',
    hanzi: '春暖花开',
    pinyin: 'Xuân Noãn Hoa Khai',
    tags: ['chữa lành', 'ấm áp', 'cozy', 'fluff'],
    icon: '🧸',
    themeColor: '#34D399',
    bgGradient: 'from-[#ECFDF5] to-[#D1FAE5] dark:from-[#062D1F] dark:to-[#031710]',
    borderColor: 'border-[#34D399]/40',
    description: 'Căn nhà gỗ bên thung lũng tuyết trắng êm đềm với lò sưởi ấm áp, nơi mọi mệt mỏi được xoa dịu dịu dàng.',
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
  const [selectedRegion, setSelectedRegion] = useState<RegionInfo>(WINTER_REGIONS[0]);
  const [openedTreasures, setOpenedTreasures] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const matchedCharacters = characters.filter((c) => {
    if (c.isDraft || c.isPrivate) return false;
    const charTags = (c.tags || []).map((t) => t.toLowerCase());
    return selectedRegion.tags.some((t) => charTags.includes(t.toLowerCase()));
  });

  const handleRegionClick = (region: RegionInfo) => {
    if (isSfxOn) triggerSfx('pop', sfxVolume);
    setSelectedRegion(region);
  };

  const handleOpenTreasure = (regionId: string) => {
    if (isSfxOn) triggerSfx('sparkle', sfxVolume);
    setOpenedTreasures((prev) => ({ ...prev, [regionId]: true }));
    if (onToast) {
      onToast(`🎁 ${selectedRegion.treasureQuote}`);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#172536]/75 backdrop-blur-md transition-opacity"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative w-full max-w-4xl bg-gradient-to-b from-[#F7FAFD] via-[#F1F6FA] to-[#E8F1F8] dark:from-[#172536] dark:via-[#1C2C3E] dark:to-[#142030] rounded-3xl border border-[#DCE7EF] dark:border-[#354A60] shadow-2xl shadow-[#526B80]/25 dark:shadow-black/70 overflow-hidden my-auto max-h-[92vh] flex flex-col z-10"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#91A9BC]/20 dark:bg-[#91A9BC]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          {/* Modal Header */}
          <div className="p-5 sm:p-6 pb-4 border-b border-[#DCE7EF] dark:border-[#354A60] flex items-start justify-between gap-3 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-2xl bg-gradient-to-tr from-[#91A9BC] to-[#526B80] text-white shadow-md shadow-[#526B80]/20">
                  <Compass className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#172536] dark:text-[#E5EDF5] font-serif flex items-center gap-2">
                    <span>Bản Đồ Ký Ức · Các Miền Đất Mùa Đông</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D5E4EF] dark:bg-[#354A60] text-[#526B80] dark:text-[#A9BDCE] font-sans font-semibold">
                      Bản đồ kỳ ảo ✦
                    </span>
                  </h3>
                  <p className="text-xs text-[#43576B] dark:text-[#A9BDCE] font-serif">
                    Khám phá các miền ký ức diệu kỳ và tìm kiếm nhân vật định mệnh của cậu
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#43576B] hover:text-[#172536] dark:text-[#A9BDCE] dark:hover:text-white hover:bg-[#D5E4EF] dark:hover:bg-[#354A60] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body - 2 Columns Layout */}
          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 overflow-y-auto custom-scrollbar flex-1 relative z-10">
            <div className="md:col-span-5 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#526B80] dark:text-[#A9BDCE] font-serif uppercase tracking-wider mb-1">
                <span>🗺️ Chọn Vùng Ký Ức Khám Phá</span>
                <span className="text-[10px] font-normal text-[#43576B] dark:text-[#A9BDCE]">
                  6 Vùng đất
                </span>
              </div>

              <div className="space-y-2">
                {WINTER_REGIONS.map((region) => {
                  const isSelected = selectedRegion.id === region.id;
                  const isTreasureClaimed = openedTreasures[region.id];
                  const regionChars = characters.filter((c) => {
                    if (c.isDraft || c.isPrivate) return false;
                    const cTags = (c.tags || []).map((t) => t.toLowerCase());
                    return region.tags.some((t) => cTags.includes(t.toLowerCase()));
                  });

                  return (
                    <button
                      key={region.id}
                      onClick={() => handleRegionClick(region)}
                      className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? `bg-gradient-to-r ${region.bgGradient} ${region.borderColor} shadow-sm ring-2 ring-[#91A9BC]/50 scale-[1.01]`
                          : 'bg-white/80 dark:bg-[#202F42]/70 border-[#DCE7EF] dark:border-[#354A60] hover:bg-[#E8F1F8] dark:hover:bg-[#27384D]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#172536] shadow-xs flex items-center justify-center text-xl shrink-0">
                          {region.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#172536] dark:text-[#E5EDF5] truncate font-serif">
                            {region.name}
                          </div>
                          <div className="text-[10px] text-[#43576B] dark:text-[#A9BDCE] truncate">
                            {region.hanzi} · {region.pinyin}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2 py-0.5 rounded-full bg-[#D5E4EF] dark:bg-[#354A60] text-[#526B80] dark:text-[#E5EDF5] text-[10px] font-bold">
                          {regionChars.length} nhân vật
                        </span>
                        {isTreasureClaimed && <span title="Đã mở hộp quà">✨</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-7 space-y-4">
              <div
                className={`p-5 rounded-3xl bg-gradient-to-br ${selectedRegion.bgGradient} border ${selectedRegion.borderColor} shadow-sm relative overflow-hidden space-y-3`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-2xl bg-white/80 dark:bg-black/40 shadow-xs">
                      {selectedRegion.icon}
                    </span>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-[#172536] dark:text-[#E5EDF5] font-serif">
                        {selectedRegion.name}
                      </h4>
                      <div className="text-xs text-[#526B80] dark:text-[#A9BDCE] font-serif">
                        « {selectedRegion.hanzi} » · {selectedRegion.pinyin}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenTreasure(selectedRegion.id)}
                    className="px-3 py-1.5 rounded-2xl bg-white/90 dark:bg-[#172536]/90 border border-[#F59E0B]/50 hover:border-[#F59E0B] shadow-xs text-xs font-bold text-[#B45309] dark:text-[#FBBF24] flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                    title="Mở hộp quà bí mật của miền đất này"
                  >
                    <Gift className="w-4 h-4 text-[#F59E0B]" />
                    <span>{openedTreasures[selectedRegion.id] ? 'Xem Lại Quà' : 'Mở Hộp Quà'}</span>
                  </button>
                </div>

                <p className="text-xs text-[#43576B] dark:text-[#A9BDCE] leading-relaxed font-serif">
                  {selectedRegion.description}
                </p>

                {openedTreasures[selectedRegion.id] && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-2xl bg-white/80 dark:bg-black/30 border border-[#F59E0B]/30 text-xs text-[#B45309] dark:text-[#FBBF24] font-serif italic"
                  >
                    🎁 {selectedRegion.treasureQuote}
                  </motion.div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#526B80] dark:text-[#A9BDCE] font-serif uppercase tracking-wider">
                  <span>✦ Nhân Vật Thuộc Miền Đất Này ({matchedCharacters.length})</span>
                </div>

                {matchedCharacters.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-white/70 dark:bg-[#202F42]/50 border border-dashed border-[#91A9BC]/40 dark:border-[#354A60] text-center space-y-2">
                    <span className="text-3xl">❄️</span>
                    <p className="text-xs text-[#43576B] dark:text-[#A9BDCE] font-serif">
                      Chưa có nhân vật nào ghé thăm vùng đất này. Bạn có thể gửi yêu cầu tạo nhân vật ở mục "Gửi đơn Creator"!
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
                        className="p-3 rounded-2xl bg-white dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#354A60] hover:border-[#91A9BC] shadow-xs flex items-center gap-3 transition-all cursor-pointer group hover:scale-[1.02]"
                      >
                        <img
                          src={char.avatar || '/placeholder.png'}
                          alt={char.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#DCE7EF] dark:border-[#354A60] group-hover:shadow-md transition-shadow"
                          onError={(e) => {
                            (e.target as any).src =
                              'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-[#172536] dark:text-[#E5EDF5] truncate group-hover:text-[#526B80] dark:group-hover:text-[#A9BDCE] transition-colors">
                            {char.name}
                          </div>
                          <p className="text-[10px] text-[#43576B] dark:text-[#A9BDCE] truncate">
                            {char.title || 'Nhân vật Character AI'}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#E8F1F8] dark:bg-[#354A60] text-[#526B80] dark:text-[#A9BDCE] font-semibold">
                              {char.tags?.[0] || 'AI'}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#526B80] dark:text-[#A9BDCE] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-[#DCE7EF] dark:border-[#354A60] bg-[#E8F1F8]/80 dark:bg-[#202F42]/80 flex items-center justify-between gap-3 relative z-10">
            <div className="text-xs text-[#43576B] dark:text-[#A9BDCE] font-serif">
              ✦ Khám phá tất cả các miền ký ức để nhận lời chúc mùa đông
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-2xl bg-gradient-to-r from-[#91A9BC] to-[#526B80] hover:brightness-105 text-white text-xs font-bold transition-all shadow-md shadow-[#526B80]/20 cursor-pointer active:scale-95 font-serif"
            >
              Đóng bản đồ
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OceanArchipelagoModal;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Heart,
  Send,
  RefreshCw,
  Check,
  Plus,
  Loader2,
} from 'lucide-react';
import { WishingBottle, BottleStyle, BottleSeal, Character } from '../types';
import {
  castWishingBottle,
  likeWishingBottle,
  recordBottleFished,
} from '../services/wishingBottleService';
import { triggerHeartConfetti } from '../utils/confetti';
import { playPopSfx, playSparkleSfx } from '../utils/sfx';

interface WishingBottleModalProps {
  isOpen: boolean;
  onClose: () => void;
  bottles: WishingBottle[];
  characters: Character[];
  onSelectCharacter?: (char: Character) => void;
  isSfxOn?: boolean;
  onToast?: (msg: string) => void;
}

export interface BottleStyleConfig {
  id: BottleStyle;
  name: string;
  icon: string;
  subtitle: string;
  accentColor: string;
  cardBg: string;
  cardBorder: string;
  cardGlow: string;
  badge: string;
  letterBg: string;
  letterBorder: string;
  letterText: string;
  activeBtn: string;
  itemBg: string;
  itemBorder: string;
}

const BOTTLE_STYLES: BottleStyleConfig[] = [
  {
    id: 'pearl',
    name: 'Lọ Ngọc Tuyết Tinh Khôi',
    icon: '💎',
    subtitle: 'Thuần khiết & lấp lánh',
    accentColor: '#91A9BC',
    cardBg: 'bg-gradient-to-br from-[#172536]/95 via-[#202F42]/90 to-[#142030]/95',
    cardBorder: 'border-[#91A9BC]/45',
    cardGlow: 'shadow-[0_0_30px_rgba(145,169,188,0.22)]',
    badge: 'bg-[#91A9BC]/20 text-[#E5EDF5] border-[#91A9BC]/40',
    letterBg: 'bg-[#91A9BC]/10',
    letterBorder: 'border-[#91A9BC]/25',
    letterText: 'text-[#F7FAFD]',
    activeBtn: 'bg-gradient-to-br from-[#D5E4EF]/60 to-[#91A9BC]/35 border-[#526B80] text-[#172536] dark:text-[#E5EDF5] shadow-md shadow-[#526B80]/20',
    itemBg: 'bg-white dark:bg-[#202F42]',
    itemBorder: 'border-[#DCE7EF] dark:border-[#354A60]',
  },
  {
    id: 'crystal',
    name: 'Pha Lê Ánh Sao Đông',
    icon: '❄️',
    subtitle: 'Trong trẻo & ấm áp',
    accentColor: '#A9BDCE',
    cardBg: 'bg-gradient-to-br from-[#1A283A]/95 via-[#243448]/90 to-[#142030]/95',
    cardBorder: 'border-[#A9BDCE]/40',
    cardGlow: 'shadow-[0_0_30px_rgba(169,189,206,0.22)]',
    badge: 'bg-[#A9BDCE]/20 text-[#E5EDF5] border-[#A9BDCE]/40',
    letterBg: 'bg-[#A9BDCE]/10',
    letterBorder: 'border-[#A9BDCE]/25',
    letterText: 'text-white/95',
    activeBtn: 'bg-gradient-to-br from-[#E8F1F8] to-[#D5E4EF] dark:from-[#354A60] dark:to-[#202F42] border-[#526B80] text-[#172536] dark:text-[#E5EDF5] shadow-md shadow-[#526B80]/20',
    itemBg: 'bg-[#F7FAFD] dark:bg-[#202F42]',
    itemBorder: 'border-[#DCE7EF] dark:border-[#354A60]',
  },
  {
    id: 'azure',
    name: 'Bình Băng Giá Xanh Phấn',
    icon: '🏺',
    subtitle: 'Sâu lắng & trầm tĩnh',
    accentColor: '#526B80',
    cardBg: 'bg-gradient-to-br from-[#162333]/95 via-[#1F3044]/90 to-[#111B28]/95',
    cardBorder: 'border-[#91A9BC]/50',
    cardGlow: 'shadow-[0_0_30px_rgba(82,107,128,0.25)]',
    badge: 'bg-[#526B80]/30 text-[#E5EDF5] border-[#91A9BC]/50',
    letterBg: 'bg-[#91A9BC]/15',
    letterBorder: 'border-[#91A9BC]/30',
    letterText: 'text-white/95',
    activeBtn: 'bg-gradient-to-br from-[#D5E4EF] to-[#91A9BC]/40 dark:from-[#354A60] dark:to-[#202F42] border-[#526B80] text-[#172536] dark:text-[#E5EDF5] shadow-md shadow-[#526B80]/20',
    itemBg: 'bg-[#E8F1F8] dark:bg-[#202F42]',
    itemBorder: 'border-[#91A9BC]/40 dark:border-[#354A60]',
  },
  {
    id: 'luminous',
    name: 'Lọ Đom Đóm Đêm Tuyết',
    icon: '✨',
    subtitle: 'Bừng sáng màn đêm',
    accentColor: '#A9BDCE',
    cardBg: 'bg-gradient-to-br from-[#1C2C3F]/95 via-[#26384E]/90 to-[#142030]/95',
    cardBorder: 'border-[#A9BDCE]/50',
    cardGlow: 'shadow-[0_0_30px_rgba(169,189,206,0.25)]',
    badge: 'bg-[#A9BDCE]/20 text-[#E5EDF5] border-[#A9BDCE]/40',
    letterBg: 'bg-[#A9BDCE]/10',
    letterBorder: 'border-[#A9BDCE]/25',
    letterText: 'text-white/95',
    activeBtn: 'bg-gradient-to-br from-[#E8F1F8] to-[#D5E4EF] dark:from-[#354A60] dark:to-[#202F42] border-[#526B80] text-[#172536] dark:text-[#E5EDF5] shadow-md shadow-[#526B80]/20',
    itemBg: 'bg-[#F7FAFD] dark:bg-[#202F42]',
    itemBorder: 'border-[#DCE7EF] dark:border-[#354A60]',
  },
];

const getBottleStyle = (styleId?: string): BottleStyleConfig => {
  if (!styleId) return BOTTLE_STYLES[0];
  const found = BOTTLE_STYLES.find((s) => s.id === styleId);
  if (found) return found;
  if (styleId === 'coral') {
    return BOTTLE_STYLES.find((s) => s.id === 'pearl') || BOTTLE_STYLES[0];
  }
  return BOTTLE_STYLES[0];
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'Vừa mới đây';
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'Vừa mới đây' : d.toLocaleDateString('vi-VN');
  } catch {
    return 'Vừa mới đây';
  }
};

const SEALS: { id: BottleSeal; name: string; icon: string }[] = [
  { id: 'star', name: 'Ánh Sao Đông', icon: '✦' },
  { id: 'heart', name: 'Trái Tim Ấm', icon: '💖' },
  { id: 'shell', name: 'Bông Tuyết', icon: '❄️' },
  { id: 'wave', name: 'Cây Thông', icon: '🎄' },
];

const WISH_INTENTS = [
  { id: 'peace', name: 'Bình An & Thư Thái', icon: '🕊️', blessing: 'Mong tâm hồn bạn luôn phẳng lặng và dịu êm như mặt hồ tuyết phủ mùa đông.', charTag: 'Chữa lành' },
  { id: 'luck', name: 'May Mắn Bất Ngờ', icon: '🍀', blessing: 'Những cơ duyên ngọt ngào và điều may lành đang trên đường tìm đến bạn.', charTag: 'Ngọt ngào' },
  { id: 'love', name: 'Tri Kỷ & Thấu Hiểu', icon: '💞', blessing: 'Bạn sẽ sớm gặp được người lắng nghe và thấu hiểu mọi suy tư trong lòng.', charTag: 'Fantasy' },
  { id: 'creativity', name: 'Cảm Hứng Sáng Tạo', icon: '✨', blessing: 'Trực giác và trí tưởng tượng của bạn đang tỏa sáng rực rỡ giữa trời đông.', charTag: 'Hiện đại' },
  { id: 'courage', name: 'Can Đảm & Vững Vàng', icon: '⚡', blessing: 'Bạn sở hữu sức mạnh nội tâm ấm áp vượt qua mọi ngày gió rét.', charTag: 'Hành động' },
];

export const WishingBottleModal: React.FC<WishingBottleModalProps> = ({
  isOpen,
  onClose,
  bottles,
  characters,
  onSelectCharacter,
  isSfxOn = true,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<'fish' | 'cast' | 'pond' | 'my_bottles'>('fish');

  const [fishedBottle, setFishedBottle] = useState<WishingBottle | null>(null);
  const [isFishing, setIsFishing] = useState(false);
  const [likedBottles, setLikedBottles] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('yui_liked_bottles');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [formAuthor, setFormAuthor] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formStyle, setFormStyle] = useState<BottleStyle>('crystal');
  const [formSeal, setFormSeal] = useState<BottleSeal>('star');
  const [formTag, setFormTag] = useState('Chữa lành');
  const [isCasting, setIsCasting] = useState(false);
  const [castSuccess, setCastSuccess] = useState(false);

  const [myBottleIds, setMyBottleIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('yui_my_bottles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedIntentId, setSelectedIntentId] = useState<string>('peace');
  const [isTossingPearl, setIsTossingPearl] = useState(false);
  const [pondBlessingRevealed, setPondBlessingRevealed] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === 'fish' && !fishedBottle && bottles.length > 0) {
      const random = bottles[Math.floor(Math.random() * bottles.length)];
      setFishedBottle(random);
      recordBottleFished(random.id).catch(() => {});
    }
  }, [isOpen, activeTab, bottles]);

  const handleFishRandomBottle = () => {
    if (bottles.length === 0) return;
    setIsFishing(true);
    if (isSfxOn) playSparkleSfx(0.4);

    setTimeout(() => {
      const available = bottles.filter((b) => b.id !== fishedBottle?.id);
      const chosen =
        available.length > 0
          ? available[Math.floor(Math.random() * available.length)]
          : bottles[0];

      setFishedBottle(chosen);
      setIsFishing(false);
      if (isSfxOn) playPopSfx(0.5);
      recordBottleFished(chosen.id).catch(() => {});
    }, 700);
  };

  const handleLikeBottle = async (bottleId: string) => {
    if (likedBottles.has(bottleId)) return;
    const newLiked = new Set(likedBottles).add(bottleId);
    setLikedBottles(newLiked);
    localStorage.setItem('yui_liked_bottles', JSON.stringify(Array.from(newLiked)));

    try {
      await likeWishingBottle(bottleId);
      triggerHeartConfetti();
      if (isSfxOn) playPopSfx(0.6);
      if (onToast) onToast('💖 Đã gửi một trái tim ấm áp vào lọ ước nguyện!');
    } catch (err) {
      console.warn('Like bottle notice:', err);
    }
  };

  const handleCastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMessage.trim()) {
      if (onToast) onToast('⚠️ Vui lòng viết thông điệp hoặc lời chúc ước nguyện!');
      return;
    }

    try {
      setIsCasting(true);
      const mySenderId = localStorage.getItem('yui_user_unique_id') || 'user_' + Date.now();
      localStorage.setItem('yui_user_unique_id', mySenderId);

      const created = await castWishingBottle({
        author: formAuthor.trim() || 'Lữ khách phương xa',
        message: formMessage.trim(),
        bottleStyle: formStyle,
        seal: formSeal,
        tag: formTag,
        senderId: mySenderId,
      });

      const updatedMyIds = [...myBottleIds, created.id];
      setMyBottleIds(updatedMyIds);
      localStorage.setItem('yui_my_bottles', JSON.stringify(updatedMyIds));

      setIsCasting(false);
      setCastSuccess(true);
      triggerHeartConfetti();
      if (isSfxOn) playSparkleSfx(0.5);

      setTimeout(() => {
        setCastSuccess(false);
        setFormMessage('');
        setActiveTab('fish');
        setFishedBottle(created);
        if (onToast) onToast('❄️ Chiếc lọ ước nguyện của bạn đã được cất vào hộp ký ức!');
      }, 1500);
    } catch (err) {
      console.error(err);
      setIsCasting(false);
      if (onToast) onToast('❌ Không thể gửi lọ lúc này. Vui lòng thử lại!');
    }
  };

  const handleTossPearl = () => {
    setIsTossingPearl(true);
    setPondBlessingRevealed(false);
    if (isSfxOn) playSparkleSfx(0.5);

    setTimeout(() => {
      setIsTossingPearl(false);
      setPondBlessingRevealed(true);
      triggerHeartConfetti();
    }, 900);
  };

  const currentIntent = WISH_INTENTS.find((i) => i.id === selectedIntentId) || WISH_INTENTS[0];
  const pondMatchingChar =
    characters.find((c) =>
      c.tags.some((t) => t.toLowerCase().includes(currentIntent.charTag.toLowerCase()))
    ) || characters[0];

  const myBottlesList = bottles.filter((b) => myBottleIds.includes(b.id));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172536]/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 15 }}
            className="relative w-full max-w-2xl max-h-[90vh] bg-[#F7FAFD]/95 dark:bg-[#172536]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-[#DCE7EF] dark:border-[#354A60] overflow-hidden flex flex-col font-sans text-[#172536] dark:text-[#E5EDF5]"
          >
            {/* Header */}
            <div className="p-5 border-b border-[#354A60] bg-gradient-to-r from-[#202F42] via-[#1B2A3B] to-[#172536] text-white flex items-center justify-between shrink-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#91A9BC]/15 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#91A9BC] to-[#526B80] text-white flex items-center justify-center shadow-lg shadow-black/25 shrink-0 text-xl">
                  ❄️
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif text-white flex items-center gap-2">
                    <span>Lọ Thủy Tinh Ước Nguyện Mùa Đông</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium font-sans">
                      {bottles.length} bức thư ký ức
                    </span>
                  </h3>
                  <p className="text-xs text-[#D5E4EF] font-serif">
                    Gửi gắm tâm tình vào tuyết trắng và mở ra những thông điệp chữa lành
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="px-5 pt-3 border-b border-[#DCE7EF] dark:border-[#354A60] flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0 bg-[#E8F1F8]/60 dark:bg-[#202F42]/50 font-serif">
              {[
                { id: 'fish', label: '✨ Mở Lọ Ký Ức', key: 'fish' },
                { id: 'cast', label: '🫙 Gửi Lọ Ước Nguyện', key: 'cast' },
                { id: 'pond', label: '❄️ Quả Cầu Ước Nguyện', key: 'pond' },
                { id: 'my_bottles', label: `🗃️ Lọ Của Tôi (${myBottlesList.length})`, key: 'my_bottles' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
                    activeTab === tab.key
                      ? 'border-[#526B80] dark:border-[#91A9BC] text-[#172536] dark:text-[#E5EDF5]'
                      : 'border-transparent text-[#43576B] dark:text-[#A9BDCE] hover:text-[#172536]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
              {activeTab === 'fish' && (
                <div className="space-y-4">
                  <div className="p-5 rounded-3xl bg-gradient-to-br from-[#202F42] via-[#1B2A3B] to-[#172536] text-white border border-[#354A60] shadow-xl space-y-4 relative overflow-hidden text-center">
                    <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#A9BDCE_1px,transparent_1px)] [background-size:16px_16px]" />

                    <div className="relative z-10 space-y-1">
                      <span className="text-[11px] font-bold text-[#A9BDCE] uppercase tracking-widest font-mono">
                        ✦ Hộp Ký Ức Tuyết Trắng ✦
                      </span>
                      <h4 className="text-base font-bold font-serif text-white">
                        Mở ngẫu nhiên một chiếc lọ ước nguyện giữa trời đông
                      </h4>
                    </div>

                    <AnimatePresence mode="wait">
                      {isFishing ? (
                        <motion.div
                          key="fishing-loader"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="py-12 flex flex-col items-center justify-center gap-3"
                        >
                          <div className="w-16 h-16 rounded-full bg-[#91A9BC]/20 border border-[#91A9BC]/40 flex items-center justify-center text-3xl animate-bounce">
                            ❄️
                          </div>
                          <p className="text-xs text-[#D5E4EF] font-serif animate-pulse">
                            Đang chọn một bức thư từ hộp ký ức mùa đông...
                          </p>
                        </motion.div>
                      ) : fishedBottle ? (() => {
                        const currentStyle = getBottleStyle(fishedBottle.bottleStyle);
                        return (
                          <motion.div
                            key={fishedBottle.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-5 rounded-2xl ${currentStyle.cardBg} ${currentStyle.cardBorder} border ${currentStyle.cardGlow} backdrop-blur-md text-left space-y-3.5 font-serif relative overflow-hidden`}
                          >
                            <div className="flex items-center justify-between border-b border-white/10 pb-3 gap-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                                  {currentStyle.icon}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h5 className="text-xs font-bold text-white truncate">
                                      {fishedBottle.author || 'Lữ khách phương xa'}
                                    </h5>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-semibold border flex items-center gap-1 shrink-0 ${currentStyle.badge}`}>
                                      <span>{currentStyle.icon}</span>
                                      <span>{currentStyle.name}</span>
                                    </span>
                                    {fishedBottle.tag && (
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white/90 font-sans font-medium">
                                        #{fishedBottle.tag}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-[#A9BDCE] font-sans block mt-0.5">
                                    Gửi ngày {formatDate(fishedBottle.createdAt)} • Đã mở {fishedBottle.fishedCount || 1} lần
                                  </span>
                                </div>
                              </div>

                              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-sm shadow-xs shrink-0" title={`Con dấu sáp: ${SEALS.find((s) => s.id === fishedBottle.seal)?.name || 'Mùa đông'}`}>
                                {SEALS.find((s) => s.id === fishedBottle.seal)?.icon || '✦'}
                              </div>
                            </div>

                            <div className={`p-4 rounded-xl ${currentStyle.letterBg} ${currentStyle.letterBorder} border ${currentStyle.letterText} text-xs sm:text-sm leading-relaxed italic whitespace-pre-line shadow-inner break-words`}>
                              "{fishedBottle.message}"
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <button
                                onClick={() => handleLikeBottle(fishedBottle.id)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                  likedBottles.has(fishedBottle.id)
                                    ? 'bg-rose-500 text-white shadow-md'
                                    : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                                }`}
                              >
                                <Heart className={`w-3.5 h-3.5 ${likedBottles.has(fishedBottle.id) ? 'fill-current' : ''}`} />
                                <span>{fishedBottle.hearts + (likedBottles.has(fishedBottle.id) ? 1 : 0)} Yêu thích</span>
                              </button>

                              <button
                                onClick={handleFishRandomBottle}
                                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#91A9BC] to-[#526B80] text-white text-xs font-bold hover:shadow-md flex items-center gap-1.5 transition-all cursor-pointer font-sans"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Mở lọ khác</span>
                              </button>
                            </div>
                          </motion.div>
                        );
                      })() : (
                        <div className="py-8 text-xs text-[#D5E4EF]">
                          Chưa có lọ thủy tinh nào trong tầm mắt. Hãy thử mở một chiếc nhé!
                        </div>
                      )}
                    </AnimatePresence>

                    {!fishedBottle && !isFishing && (
                      <button
                        onClick={handleFishRandomBottle}
                        className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#91A9BC] to-[#526B80] text-white text-xs font-bold hover:shadow-lg transition-all cursor-pointer font-serif"
                      >
                        ✨ Mở một chiếc lọ ký ức
                      </button>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'cast' && (
                <form onSubmit={handleCastSubmit} className="space-y-4 font-serif">
                  <div className="p-4 rounded-2xl bg-[#E8F1F8] dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#354A60] space-y-1">
                    <h4 className="text-sm font-bold text-[#172536] dark:text-[#E5EDF5] flex items-center gap-1.5">
                      <span>🫙 Gửi Một Lọ Ước Nguyện Vào Hộp Ký Ức</span>
                    </h4>
                    <p className="text-xs text-[#43576B] dark:text-[#A9BDCE] font-sans">
                      Những dòng tâm sự, lời chúc hay ước nguyện của bạn sẽ được niêm phong trong lọ pha lê và gửi tới những người bạn ghé thăm.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#172536] dark:text-[#E5EDF5] mb-1">
                      Nội dung thông điệp / Lời chúc ước nguyện *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formMessage}
                      onChange={(e) => setFormMessage(e.target.value)}
                      placeholder="Viết đôi dòng chữa lành, một ước nguyện nhỏ, hoặc câu chuyện bạn muốn gửi gắm giữa mùa đông..."
                      className="w-full px-4 py-3 bg-white dark:bg-[#202F42] rounded-2xl border border-[#DCE7EF] dark:border-[#354A60] text-xs text-[#172536] dark:text-[#E5EDF5] placeholder:text-[#526B80]/60 leading-relaxed resize-none focus:outline-hidden focus:border-[#526B80]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#172536] dark:text-[#E5EDF5] mb-1">
                        Tên / Bút danh người gửi (Tùy chọn)
                      </label>
                      <input
                        type="text"
                        value={formAuthor}
                        onChange={(e) => setFormAuthor(e.target.value)}
                        placeholder="VD: Bông Tuyết Nhỏ, Lữ Khách Đêm Trăng..."
                        className="w-full px-3.5 py-2 bg-white dark:bg-[#202F42] rounded-xl border border-[#DCE7EF] dark:border-[#354A60] text-xs text-[#172536] dark:text-[#E5EDF5] focus:outline-hidden focus:border-[#526B80]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#172536] dark:text-[#E5EDF5] mb-1">
                        Chủ đề thông điệp
                      </label>
                      <select
                        value={formTag}
                        onChange={(e) => setFormTag(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white dark:bg-[#202F42] rounded-xl border border-[#DCE7EF] dark:border-[#354A60] text-xs text-[#172536] dark:text-[#E5EDF5] focus:outline-hidden focus:border-[#526B80]"
                      >
                        <option value="Chữa lành">Chữa lành</option>
                        <option value="Ước nguyện">Ước nguyện</option>
                        <option value="Động viên">Động viên</option>
                        <option value="Tâm sự">Tâm sự</option>
                        <option value="Thơ mộng">Thơ mộng</option>
                        <option value="Lời chúc">Lời chúc ngọt ngào</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#172536] dark:text-[#E5EDF5]">
                      Chọn kiểu dáng lọ thủy tinh:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {BOTTLE_STYLES.map((st) => {
                        const isSelected = formStyle === st.id;
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setFormStyle(st.id)}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                              isSelected
                                ? st.activeBtn
                                : 'bg-white dark:bg-[#202F42] border-[#DCE7EF] dark:border-[#354A60] hover:border-[#91A9BC] text-[#172536] dark:text-[#E5EDF5]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xl shrink-0">{st.icon}</span>
                              <span className="text-xs font-bold leading-tight break-words line-clamp-1">{st.name}</span>
                            </div>
                            <span className="text-[10px] text-[#43576B] dark:text-[#A9BDCE] line-clamp-1">
                              {st.subtitle}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#172536] dark:text-[#E5EDF5]">
                      Con dấu sáp niêm phong nắp lọ:
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {SEALS.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setFormSeal(s.id)}
                          className={`px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                            formSeal === s.id
                              ? 'bg-[#526B80] text-white border-[#526B80] shadow-sm font-bold'
                              : 'bg-white dark:bg-[#202F42] text-[#43576B] dark:text-[#A9BDCE] border-[#DCE7EF] dark:border-[#354A60]'
                          }`}
                        >
                          <span>{s.icon}</span>
                          <span>{s.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isCasting || castSuccess}
                      className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#91A9BC] to-[#526B80] text-white text-xs font-bold flex items-center gap-2 hover:shadow-lg transition-all cursor-pointer"
                    >
                      {isCasting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang niêm phong lọ...</span>
                        </>
                      ) : castSuccess ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>Đã gửi thành công! ❄️</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Gửi vào Hộp Ký Ức ♡</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'pond' && (
                <div className="space-y-4 font-serif">
                  <div className="text-center space-y-1">
                    <span className="text-[11px] font-bold text-[#526B80] dark:text-[#A9BDCE] uppercase tracking-widest font-mono">
                      ✦ Winter Crystal Sanctuary ✦
                    </span>
                    <h4 className="text-base font-bold text-[#172536] dark:text-[#E5EDF5]">
                      Gửi một tinh thể ước nguyện vào quả cầu tuyết
                    </h4>
                    <p className="text-xs text-[#43576B] dark:text-[#A9BDCE]">
                      Chọn một nguyện vọng chân thành trong lòng bạn:
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {WISH_INTENTS.map((intent) => (
                      <button
                        key={intent.id}
                        type="button"
                        onClick={() => {
                          setSelectedIntentId(intent.id);
                          setPondBlessingRevealed(false);
                        }}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          selectedIntentId === intent.id
                            ? 'bg-gradient-to-b from-[#E8F1F8] to-[#D5E4EF] dark:from-[#354A60] dark:to-[#202F42] border-[#526B80] shadow-sm font-bold scale-102'
                            : 'bg-white dark:bg-[#202F42] border-[#DCE7EF] dark:border-[#354A60]'
                        }`}
                      >
                        <span className="text-2xl">{intent.icon}</span>
                        <span className="text-xs text-[#172536] dark:text-[#E5EDF5] leading-tight">
                          {intent.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="p-6 rounded-3xl bg-gradient-to-br from-[#202F42] via-[#1B2A3B] to-[#172536] text-white border border-[#354A60] shadow-xl text-center space-y-4 relative overflow-hidden">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-[#91A9BC] to-[#D5E4EF] p-1 shadow-lg shadow-[#91A9BC]/25 flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-[#172536] flex items-center justify-center text-3xl animate-pulse">
                        🔮
                      </div>
                    </div>

                    {!pondBlessingRevealed && !isTossingPearl && (
                      <div className="space-y-2">
                        <p className="text-xs text-[#D5E4EF]">
                          Tâm nguyện: <strong className="text-white">{currentIntent.name}</strong>
                        </p>
                        <button
                          onClick={handleTossPearl}
                          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#91A9BC] to-[#526B80] text-white text-xs font-bold hover:shadow-lg transition-all cursor-pointer"
                        >
                          ✨ Lắc quả cầu tuyết ước nguyện
                        </button>
                      </div>
                    )}

                    {isTossingPearl && (
                      <div className="py-4 space-y-2">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-xs text-[#D5E4EF] animate-pulse">
                          Những bông tuyết đang xoay nhẹ trong quả cầu pha lê...
                        </p>
                      </div>
                    )}

                    {pondBlessingRevealed && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3 text-left font-serif"
                      >
                        <div className="flex items-center justify-between border-b border-white/15 pb-2">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{currentIntent.icon}</span>
                            <span>Lời Chúc Mùa Đông Dành Cho Bạn:</span>
                          </span>
                          <span className="text-[10px] text-[#A9BDCE] font-sans">✦ Phép Màu Tuyết Trắng ✦</span>
                        </div>

                        <p className="text-xs sm:text-sm text-white italic leading-relaxed">
                          "{currentIntent.blessing}"
                        </p>

                        {pondMatchingChar && (
                          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3 font-sans">
                            <div className="flex items-center gap-2">
                              <img
                                src={pondMatchingChar.avatar}
                                alt={pondMatchingChar.name}
                                className="w-8 h-8 rounded-lg object-cover border border-white/20"
                              />
                              <div>
                                <span className="text-[11px] font-bold text-white block">
                                  {pondMatchingChar.name}
                                </span>
                                <span className="text-[10px] text-white/70 block truncate">
                                  Người bạn mang năng lượng tương đồng
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                if (onSelectCharacter) {
                                  onClose();
                                  onSelectCharacter(pondMatchingChar);
                                }
                              }}
                              className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold cursor-pointer transition-colors"
                            >
                              Gặp gỡ ➔
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'my_bottles' && (
                <div className="space-y-3 font-serif">
                  <div className="p-4 rounded-2xl bg-[#E8F1F8] dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#354A60] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#172536] dark:text-[#E5EDF5]">
                        Bộ Sưu Tập Lọ Của Bạn
                      </h4>
                      <p className="text-[11px] text-[#43576B] dark:text-[#A9BDCE]">
                        Theo dõi những bức thư bạn đã gửi vào hộp ký ức
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('cast')}
                      className="px-3 py-1.5 rounded-xl bg-[#526B80] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Gửi lọ mới</span>
                    </button>
                  </div>

                  {myBottlesList.length === 0 ? (
                    <div className="text-center py-12 text-xs text-[#43576B] dark:text-[#A9BDCE] space-y-2">
                      <p>Bạn chưa gửi bức thư lọ thủy tinh nào vào hộp ký ức.</p>
                      <button
                        onClick={() => setActiveTab('cast')}
                        className="px-4 py-2 rounded-xl bg-[#526B80] text-white font-bold cursor-pointer"
                      >
                        Gửi chiếc lọ đầu tiên ngay ♡
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1 custom-scrollbar">
                      {myBottlesList.map((bottle) => {
                        const bStyle = getBottleStyle(bottle.bottleStyle);
                        return (
                          <div
                            key={bottle.id}
                            className={`p-4 rounded-2xl ${bStyle.itemBg} ${bStyle.itemBorder} border space-y-2 transition-all`}
                          >
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-lg">{bStyle.icon}</span>
                                <span className="text-xs font-bold text-[#172536] dark:text-[#E5EDF5]">
                                  {bottle.author}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-semibold border ${bStyle.badge}`}>
                                  {bStyle.name}
                                </span>
                                {bottle.tag && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#E8F1F8] dark:bg-[#354A60] text-[#526B80] dark:text-[#A9BDCE] font-sans">
                                    #{bottle.tag}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#43576B] dark:text-[#A9BDCE] font-sans">
                                {formatDate(bottle.createdAt)}
                              </span>
                            </div>

                            <p className="text-xs text-[#43576B] dark:text-[#A9BDCE] leading-relaxed italic whitespace-pre-line break-words">
                              "{bottle.message}"
                            </p>

                            <div className="flex items-center justify-between pt-1 text-[11px] font-sans text-[#526B80] dark:text-[#A9BDCE]">
                              <span className="flex items-center gap-1 font-bold">
                                <Heart className="w-3.5 h-3.5 fill-current text-rose-500" />
                                <span>{bottle.hearts} lượt yêu thích</span>
                              </span>
                              <span>Đã được mở: {bottle.fishedCount || 0} lần</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#DCE7EF] dark:border-[#354A60] bg-[#E8F1F8]/70 dark:bg-[#202F42]/70 flex items-center justify-between shrink-0 font-serif">
              <span className="text-xs text-[#43576B] dark:text-[#A9BDCE]">
                ✦ Lắng nghe mùa đông trong từng lời ước nguyện
              </span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#91A9BC] to-[#526B80] text-white text-xs font-bold hover:shadow-md transition-all cursor-pointer"
              >
                Khép lại ♡
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

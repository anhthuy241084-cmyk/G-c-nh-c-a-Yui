import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Heart,
  Send,
  RefreshCw,
  Anchor,
  Compass,
  Check,
  Share2,
  Waves,
  Feather,
  Plus,
  Loader2,
  Flame,
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
  bg: string;
  border: string;
  glow: string;
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
    name: 'Lọ Ngọc Trai Biển Sâu',
    icon: '💎',
    subtitle: 'Thuần khiết & lấp lánh',
    accentColor: '#93C5FD',
    bg: 'from-[#93C5FD]/20 to-[#60A5FA]/25',
    border: 'border-[#93C5FD]/40',
    glow: 'shadow-[#93C5FD]/30',
    cardBg: 'bg-gradient-to-br from-[#0F172A]/95 via-[#1E293B]/90 to-[#0A161E]/95',
    cardBorder: 'border-[#93C5FD]/45',
    cardGlow: 'shadow-[0_0_30px_rgba(147,197,253,0.22)]',
    badge: 'bg-[#93C5FD]/20 text-[#BFDBFE] border-[#93C5FD]/40',
    letterBg: 'bg-[#93C5FD]/10',
    letterBorder: 'border-[#93C5FD]/25',
    letterText: 'text-[#F1F5F9]',
    activeBtn: 'bg-gradient-to-br from-[#93C5FD]/25 via-[#60A5FA]/20 to-[#3B82F6]/25 border-[#93C5FD] text-[#3B82F6] dark:text-[#BFDBFE] shadow-md shadow-[#93C5FD]/25',
    itemBg: 'bg-[#F1F5F9] dark:bg-[#0F172A]/70',
    itemBorder: 'border-[#93C5FD]/35',
  },
  {
    id: 'crystal',
    name: 'Pha Lê Ánh Sao',
    icon: '🍾',
    subtitle: 'Thanh khiết & lấp lánh',
    accentColor: '#38CAD6',
    bg: 'from-[#38CAD6]/20 to-[#1B6E7D]/30',
    border: 'border-[#38CAD6]/40',
    glow: 'shadow-[#38CAD6]/30',
    cardBg: 'bg-gradient-to-br from-[#091F28]/95 via-[#0C2A35]/90 to-[#061820]/95',
    cardBorder: 'border-[#38CAD6]/40',
    cardGlow: 'shadow-[0_0_30px_rgba(56,202,214,0.22)]',
    badge: 'bg-[#38CAD6]/20 text-[#7DD8DE] border-[#38CAD6]/40',
    letterBg: 'bg-[#38CAD6]/10',
    letterBorder: 'border-[#38CAD6]/20',
    letterText: 'text-white/95',
    activeBtn: 'bg-gradient-to-br from-[#38CAD6]/25 to-[#1B6E7D]/25 border-[#38CAD6] text-[#1B6E7D] dark:text-[#48CCD6] shadow-md shadow-[#38CAD6]/25',
    itemBg: 'bg-[#F2FBFC]/70 dark:bg-[#0B1E26]',
    itemBorder: 'border-[#38CAD6]/25',
  },
  {
    id: 'azure',
    name: 'Bình Hải Lưu Xanh Biếc',
    icon: '🏺',
    subtitle: 'Sâu thẳm & trầm tĩnh',
    accentColor: '#0EA5E9',
    bg: 'from-[#0EA5E9]/30 to-[#0369A1]/40',
    border: 'border-[#0EA5E9]/50',
    glow: 'shadow-[#0EA5E9]/30',
    cardBg: 'bg-gradient-to-br from-[#071E28]/95 via-[#0C4A6E]/90 to-[#031018]/95',
    cardBorder: 'border-[#0EA5E9]/55',
    cardGlow: 'shadow-[0_0_30px_rgba(14,165,233,0.25)]',
    badge: 'bg-[#0EA5E9]/30 text-[#BAE6FD] border-[#0EA5E9]/50',
    letterBg: 'bg-[#0EA5E9]/15',
    letterBorder: 'border-[#0EA5E9]/30',
    letterText: 'text-white/95',
    activeBtn: 'bg-gradient-to-br from-[#0EA5E9]/30 to-[#0369A1]/40 border-[#38BDF8] text-[#0369A1] dark:text-[#7DD3FC] shadow-md shadow-[#0EA5E9]/25',
    itemBg: 'bg-[#F0F9FF] dark:bg-[#082F49]',
    itemBorder: 'border-[#0EA5E9]/30',
  },
  {
    id: 'luminous',
    name: 'Chai Dạ Quang Huyền Bí',
    icon: '✨',
    subtitle: 'Bừng sáng màn đêm',
    accentColor: '#7DD3FC',
    bg: 'from-[#7DD3FC]/20 to-[#0369A1]/40',
    border: 'border-[#7DD3FC]/40',
    glow: 'shadow-[#7DD3FC]/30',
    cardBg: 'bg-gradient-to-br from-[#0C4A6E]/95 via-[#075985]/90 to-[#031518]/95',
    cardBorder: 'border-[#7DD3FC]/50',
    cardGlow: 'shadow-[0_0_30px_rgba(125,211,252,0.25)]',
    badge: 'bg-[#7DD3FC]/20 text-[#E0F2FE] border-[#7DD3FC]/40',
    letterBg: 'bg-[#7DD3FC]/10',
    letterBorder: 'border-[#7DD3FC]/25',
    letterText: 'text-white/95',
    activeBtn: 'bg-gradient-to-br from-[#7DD3FC]/25 to-[#0369A1]/30 border-[#7DD3FC] text-[#0369A1] dark:text-[#7DD3FC] shadow-md shadow-[#7DD3FC]/25',
    itemBg: 'bg-[#F0F9FF] dark:bg-[#0C4A6E]',
    itemBorder: 'border-[#7DD3FC]/30',
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
  { id: 'star', name: 'Sao Biển', icon: '✦' },
  { id: 'heart', name: 'Trái Tim Biển', icon: '💖' },
  { id: 'shell', name: 'Vỏ Sò Ngọc', icon: '🐚' },
  { id: 'wave', name: 'Sóng Biển', icon: '🌊' },
];

const WISH_INTENTS = [
  { id: 'peace', name: 'Bình An & Thư Thái', icon: '🕊️', blessing: 'Mong tâm hồn bạn luôn phẳng lặng và dịu êm như mặt hồ mùa thu.', charTag: 'Chữa lành' },
  { id: 'luck', name: 'May Mắn Bất Ngờ', icon: '🍀', blessing: 'Những cơ duyên ngọt ngào và điều may lành đang trên đường tìm đến bạn.', charTag: 'Ngọt ngào' },
  { id: 'love', name: 'Tri Kỷ & Thấu Hiểu', icon: '💞', blessing: 'Bạn sẽ sớm gặp được người lắng nghe và thấu hiểu mọi suy tư trong lòng.', charTag: 'Fantasy' },
  { id: 'creativity', name: 'Cảm Hứng Sáng Tạo', icon: '✨', blessing: 'Trực giác và trí tưởng tượng của bạn đang dâng trào như sóng triều.', charTag: 'Hiện đại' },
  { id: 'courage', name: 'Can Đảm & Vững Vàng', icon: '⚡', blessing: 'Bạn sở hữu sức mạnh nội tâm lớn hơn bất kỳ cơn bão nào ngoài khơi.', charTag: 'Hành động' },
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

  // Fish bottle state
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

  // Cast form state
  const [formAuthor, setFormAuthor] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formStyle, setFormStyle] = useState<BottleStyle>('crystal');
  const [formSeal, setFormSeal] = useState<BottleSeal>('star');
  const [formTag, setFormTag] = useState('Chữa lành');
  const [isCasting, setIsCasting] = useState(false);
  const [castSuccess, setCastSuccess] = useState(false);

  // My casted bottle IDs
  const [myBottleIds, setMyBottleIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('yui_my_bottles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishing pond state
  const [selectedIntentId, setSelectedIntentId] = useState<string>('peace');
  const [isTossingPearl, setIsTossingPearl] = useState(false);
  const [pondBlessingRevealed, setPondBlessingRevealed] = useState(false);

  // Pick an initial random bottle if in fish tab
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
      // Pick a random bottle different from current if possible
      const available = bottles.filter((b) => b.id !== fishedBottle?.id);
      const chosen = available.length > 0 
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
      if (onToast) onToast('💖 Đã gửi một trái tim ngọc trai vào chai thủy tinh!');
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
      const mySenderId = localStorage.getItem('yui_user_unique_id') || ('user_' + Date.now());
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
        if (onToast) onToast('🌊 Chiếc chai thủy tinh của bạn đã bắt đầu trôi theo hải lưu!');
      }, 1500);
    } catch (err) {
      console.error(err);
      setIsCasting(false);
      if (onToast) onToast('❌ Không thể thả chai lúc này. Vui lòng thử lại!');
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
  const pondMatchingChar = characters.find((c) =>
    c.tags.some((t) => t.toLowerCase().includes(currentIntent.charTag.toLowerCase()))
  ) || characters[0];

  const myBottlesList = bottles.filter((b) => myBottleIds.includes(b.id));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030D12]/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 15 }}
            className="relative w-full max-w-2xl max-h-[90vh] bg-white/95 dark:bg-[#0E232E]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-[#38CAD6]/30 dark:border-[#38CAD6]/25 overflow-hidden flex flex-col font-sans text-[#14303A] dark:text-[#E4F7F9]"
          >
            {/* Header */}
            <div className="p-5 border-b border-[#38CAD6]/15 dark:border-[#132F3D] bg-gradient-to-r from-[#0F3543] via-[#0C2A35] to-[#071921] text-white flex items-center justify-between shrink-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#38CAD6]/15 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#38CAD6] to-[#1B6E7D] text-white flex items-center justify-center shadow-lg shadow-[#38CAD6]/25 shrink-0 text-xl">
                  🍾
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif text-white flex items-center gap-2">
                    <span>Chai Thủy Tinh Ước Nguyện & Hải Lưu</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium font-sans">
                      {bottles.length} bức thư trôi dạt
                    </span>
                  </h3>
                  <p className="text-xs text-[#B2E4EC] font-serif">
                    Gửi gắm tâm tình vào đại dương và vớt lên những thông điệp chữa lành
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
            <div className="px-5 pt-3 border-b border-[#38CAD6]/15 dark:border-[#132F3D] flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0 bg-[#F2FBFC]/50 dark:bg-[#07171F]/40 font-serif">
              {[
                { id: 'fish', label: '🎣 Vớt Chai Trôi Dạt', key: 'fish' },
                { id: 'cast', label: '🍾 Thả Chai Xuống Biển', key: 'cast' },
                { id: 'pond', label: '✨ Hồ Ngọc Ước Nguyện', key: 'pond' },
                { id: 'my_bottles', label: `🗃️ Chai Của Tôi (${myBottlesList.length})`, key: 'my_bottles' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
                    activeTab === tab.key
                      ? 'border-[#38CAD6] text-[#1B6E7D] dark:text-[#48CCD6]'
                      : 'border-transparent text-[#53737C] dark:text-[#88A9B3] hover:text-[#1B6E7D]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
              {/* TAB 1: VỚT CHAI TRÔI DẠT */}
              {activeTab === 'fish' && (
                <div className="space-y-4">
                  {/* Oceanic Water Waves Animation Canvas */}
                  <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0F3543] via-[#0B2530] to-[#061820] text-white border border-[#38CAD6]/30 shadow-xl space-y-4 relative overflow-hidden text-center">
                    <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38CAD6_1px,transparent_1px)] [background-size:16px_16px]" />

                    <div className="relative z-10 space-y-1">
                      <span className="text-[11px] font-bold text-[#7DD8DE] uppercase tracking-widest font-mono">
                        ✦ Dòng Hải Lưu Ký Ức ✦
                      </span>
                      <h4 className="text-base font-bold font-serif text-white">
                        Vớt một chiếc chai thủy tinh trôi dạt từ ngoài khơi xa
                      </h4>
                    </div>

                    {/* Fished Bottle Display */}
                    <AnimatePresence mode="wait">
                      {isFishing ? (
                        <motion.div
                          key="fishing-loader"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="py-12 flex flex-col items-center justify-center gap-3"
                        >
                          <div className="w-16 h-16 rounded-full bg-[#38CAD6]/20 border border-[#38CAD6]/40 flex items-center justify-center text-3xl animate-bounce">
                            🌊
                          </div>
                          <p className="text-xs text-[#B2E4EC] font-serif animate-pulse">
                            Đang vớt một bức thư trôi dạt từ dòng hải lưu...
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
                            {/* Bottle Tag, Style & Seal */}
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
                                  <span className="text-[10px] text-[#A6C9D1] font-sans block mt-0.5">
                                    Thả trôi {formatDate(fishedBottle.createdAt)} • Đã được vớt {fishedBottle.fishedCount || 1} lần
                                  </span>
                                </div>
                              </div>

                              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-sm shadow-xs shrink-0" title={`Con dấu sáp: ${SEALS.find((s) => s.id === fishedBottle.seal)?.name || 'Hải lưu'}`}>
                                {SEALS.find((s) => s.id === fishedBottle.seal)?.icon || '✦'}
                              </div>
                            </div>

                            {/* Letter Scroll Content */}
                            <div className={`p-4 rounded-xl ${currentStyle.letterBg} ${currentStyle.letterBorder} border ${currentStyle.letterText} text-xs sm:text-sm leading-relaxed italic whitespace-pre-line shadow-inner break-words`}>
                              "{fishedBottle.message}"
                            </div>

                            {/* Action Row */}
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
                                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#38CAD6] to-[#1B6E7D] text-white text-xs font-bold hover:shadow-md flex items-center gap-1.5 transition-all cursor-pointer font-sans"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Vớt chai khác</span>
                              </button>
                            </div>
                          </motion.div>
                        );
                      })() : (
                        <div className="py-8 text-xs text-[#B2E4EC]">
                          Chưa có chai thủy tinh nào trong tầm mắt. Hãy thử vớt một chiếc nhé!
                        </div>
                      )}
                    </AnimatePresence>

                    {!fishedBottle && !isFishing && (
                      <button
                        onClick={handleFishRandomBottle}
                        className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#38CAD6] to-[#1B6E7D] text-white text-xs font-bold hover:shadow-lg transition-all cursor-pointer font-serif"
                      >
                        🎣 Vớt một chiếc chai từ hải lưu
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: THẢ CHAI XUỐNG BIỂN */}
              {activeTab === 'cast' && (
                <form onSubmit={handleCastSubmit} className="space-y-4 font-serif">
                  <div className="p-4 rounded-2xl bg-[#F0F9FB] dark:bg-[#091C24] border border-[#38CAD6]/25 space-y-1">
                    <h4 className="text-sm font-bold text-[#14303A] dark:text-[#E4F7F9] flex items-center gap-1.5">
                      <span>🍾 Gửi Một Chiếc Chai Trôi Vào Dòng Hải Lưu</span>
                    </h4>
                    <p className="text-xs text-[#53737C] dark:text-[#88A9B3] font-sans">
                      Những dòng tâm sự, lời chúc hay ước nguyện của bạn sẽ được niêm phong trong chai thủy tinh và trôi dạt đến những lữ khách khác.
                    </p>
                  </div>

                  {/* Message Input */}
                  <div>
                    <label className="block text-xs font-bold text-[#14303A] dark:text-[#E4F7F9] mb-1">
                      Nội dung thông điệp / Lời chúc ước nguyện *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formMessage}
                      onChange={(e) => setFormMessage(e.target.value)}
                      placeholder="Viết đôi dòng chữa lành, một ước nguyện nhỏ, hoặc câu chuyện bạn muốn gửi vào sóng biển..."
                      className="w-full px-4 py-3 bg-white dark:bg-[#0B1E26] rounded-2xl border border-[#38CAD6]/30 text-xs text-[#14303A] dark:text-[#E4F7F9] placeholder:text-[#53737C]/60 leading-relaxed resize-none focus:outline-hidden focus:border-[#38CAD6]"
                    />
                  </div>

                  {/* Author & Tag */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#14303A] dark:text-[#E4F7F9] mb-1">
                        Tên / Bút danh người gửi (Tùy chọn)
                      </label>
                      <input
                        type="text"
                        value={formAuthor}
                        onChange={(e) => setFormAuthor(e.target.value)}
                        placeholder="VD: Hải Âu Nhỏ, Lữ Khách Đêm Trăng..."
                        className="w-full px-3.5 py-2 bg-white dark:bg-[#0B1E26] rounded-xl border border-[#38CAD6]/30 text-xs text-[#14303A] dark:text-[#E4F7F9] focus:outline-hidden focus:border-[#38CAD6]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14303A] dark:text-[#E4F7F9] mb-1">
                        Chủ đề thông điệp
                      </label>
                      <select
                        value={formTag}
                        onChange={(e) => setFormTag(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white dark:bg-[#0B1E26] rounded-xl border border-[#38CAD6]/30 text-xs text-[#14303A] dark:text-[#E4F7F9] focus:outline-hidden focus:border-[#38CAD6]"
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

                  {/* Bottle Style Picker */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#14303A] dark:text-[#E4F7F9]">
                      Chọn kiểu dáng chai thủy tinh:
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
                                : 'bg-white dark:bg-[#0B1E26] border-[#38CAD6]/20 hover:border-[#38CAD6]/40 text-[#14303A] dark:text-[#E4F7F9]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xl shrink-0">{st.icon}</span>
                              <span className="text-xs font-bold leading-tight break-words line-clamp-1">{st.name}</span>
                            </div>
                            <span className="text-[10px] text-[#53737C] dark:text-[#88A9B3] line-clamp-1">
                              {st.subtitle}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Seal Picker */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#14303A] dark:text-[#E4F7F9]">
                      Con dấu sáp niêm phong nắp chai:
                    </label>
                    <div className="flex items-center gap-2">
                      {SEALS.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setFormSeal(s.id)}
                          className={`px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                            formSeal === s.id
                              ? 'bg-[#1B6E7D] text-white border-[#1B6E7D] shadow-sm font-bold'
                              : 'bg-white dark:bg-[#0B1E26] text-[#53737C] dark:text-[#88A9B3] border-[#38CAD6]/20'
                          }`}
                        >
                          <span>{s.icon}</span>
                          <span>{s.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isCasting || castSuccess}
                      className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#38CAD6] to-[#1B6E7D] text-white text-xs font-bold flex items-center gap-2 hover:shadow-lg transition-all cursor-pointer"
                    >
                      {isCasting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang niêm phong chai...</span>
                        </>
                      ) : castSuccess ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>Đã thả trôi thành công! 🌊</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Thả chai vào dòng hải lưu ♡</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: HỒ NGỌC ƯỚC NGUYỆN */}
              {activeTab === 'pond' && (
                <div className="space-y-4 font-serif">
                  <div className="text-center space-y-1">
                    <span className="text-[11px] font-bold text-[#1B6E7D] dark:text-[#48CCD6] uppercase tracking-widest font-mono">
                      ✦ Wishing Pearl Sanctuary ✦
                    </span>
                    <h4 className="text-base font-bold text-[#14303A] dark:text-[#E4F7F9]">
                      Thả một viên ngọc ước nguyện xuống hồ nước biển sâu
                    </h4>
                    <p className="text-xs text-[#53737C] dark:text-[#88A9B3]">
                      Chọn một nguyện vọng chân thành trong lòng bạn:
                    </p>
                  </div>

                  {/* Intent Selection */}
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
                            ? 'bg-gradient-to-b from-[#38CAD6]/20 to-[#1B6E7D]/25 border-[#38CAD6] shadow-sm font-bold scale-102'
                            : 'bg-[#F2FBFC]/60 dark:bg-[#0B1E26] border-[#38CAD6]/20'
                        }`}
                      >
                        <span className="text-2xl">{intent.icon}</span>
                        <span className="text-xs text-[#14303A] dark:text-[#E4F7F9] leading-tight">
                          {intent.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Pond Interactive Area */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0F3543] via-[#0C2A35] to-[#071921] text-white border border-[#38CAD6]/40 shadow-xl text-center space-y-4 relative overflow-hidden">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-[#38CAD6] to-[#7DD8DE] p-1 shadow-lg shadow-[#38CAD6]/30 flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-[#091D26] flex items-center justify-center text-3xl animate-pulse">
                        🦪
                      </div>
                    </div>

                    {!pondBlessingRevealed && !isTossingPearl && (
                      <div className="space-y-2">
                        <p className="text-xs text-[#B2E4EC]">
                          Tâm nguyện: <strong className="text-white">{currentIntent.name}</strong>
                        </p>
                        <button
                          onClick={handleTossPearl}
                          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#38CAD6] to-[#1B6E7D] text-white text-xs font-bold hover:shadow-lg transition-all cursor-pointer"
                        >
                          ✨ Thả viên ngọc ước nguyện
                        </button>
                      </div>
                    )}

                    {isTossingPearl && (
                      <div className="py-4 space-y-2">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-xs text-[#B2E4EC] animate-pulse">
                          Viên ngọc đang chìm dần vào hồ nước thiêng...
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
                            <span>Lời Chúc Biển Cả Cho Bạn:</span>
                          </span>
                          <span className="text-[10px] text-[#7DD8DE] font-sans">✦ Diệu Kỷ Đại Dương ✦</span>
                        </div>

                        <p className="text-xs sm:text-sm text-white italic leading-relaxed">
                          "{currentIntent.blessing}"
                        </p>

                        {/* Matching character */}
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

              {/* TAB 4: CHAI CỦA TÔI */}
              {activeTab === 'my_bottles' && (
                <div className="space-y-3 font-serif">
                  <div className="p-4 rounded-2xl bg-[#F0F9FB] dark:bg-[#091C24] border border-[#38CAD6]/25 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#14303A] dark:text-[#E4F7F9]">
                        Bộ Sưu Tập Chai Của Bạn
                      </h4>
                      <p className="text-[11px] text-[#53737C] dark:text-[#88A9B3]">
                        Theo dõi những bức thư bạn đã thả trôi ngoài khơi xa
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('cast')}
                      className="px-3 py-1.5 rounded-xl bg-[#38CAD6] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thả chai mới</span>
                    </button>
                  </div>

                  {myBottlesList.length === 0 ? (
                    <div className="text-center py-12 text-xs text-[#53737C] dark:text-[#88A9B3] space-y-2">
                      <p>Bạn chưa thả bức thư chai thủy tinh nào xuống biển.</p>
                      <button
                        onClick={() => setActiveTab('cast')}
                        className="px-4 py-2 rounded-xl bg-[#1B6E7D] text-white font-bold cursor-pointer"
                      >
                        Thả chiếc chai đầu tiên ngay ♡
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
                                <span className="text-xs font-bold text-[#14303A] dark:text-[#E4F7F9]">
                                  {bottle.author}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-semibold border ${bStyle.badge}`}>
                                  {bStyle.name}
                                </span>
                                {bottle.tag && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#38CAD6]/15 text-[#1B6E7D] dark:text-[#48CCD6] font-sans">
                                    #{bottle.tag}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#53737C] dark:text-[#88A9B3] font-sans">
                                {formatDate(bottle.createdAt)}
                              </span>
                            </div>

                            <p className="text-xs text-[#53737C] dark:text-[#B2CFD7] leading-relaxed italic whitespace-pre-line break-words">
                              "{bottle.message}"
                            </p>

                            <div className="flex items-center justify-between pt-1 text-[11px] font-sans text-[#1B6E7D] dark:text-[#7DD8DE]">
                              <span className="flex items-center gap-1 font-bold">
                                <Heart className="w-3.5 h-3.5 fill-current text-rose-500" />
                                <span>{bottle.hearts} lượt yêu thích</span>
                              </span>
                              <span>Đã được vớt: {bottle.fishedCount || 0} lần</span>
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
            <div className="p-4 border-t border-[#38CAD6]/15 dark:border-[#132F3D] bg-[#F0F9FB]/60 dark:bg-[#091C24]/60 flex items-center justify-between shrink-0 font-serif">
              <span className="text-xs text-[#53737C] dark:text-[#88A9B3]">
                ✦ Lắng nghe đại dương trong từng lời ước nguyện
              </span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#38CAD6] to-[#1B6E7D] text-white text-xs font-bold hover:shadow-md transition-all cursor-pointer"
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

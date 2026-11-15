import React, { useState } from 'react';
import { X, Sparkles, Trophy, RefreshCw, Bookmark, Moon, Sun, Award } from 'lucide-react';
import { SavedCake, SavedCakeTopping } from '../types';
import { playPopSfx, playSwishSfx, playPlopSfx, playTingSfx, playSparkleSfx } from '../utils/sfx';

interface BakeryGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSfxOn?: boolean;
  sfxVolume?: number;
}

const INGREDIENTS = [
  { id: 'flour', name: 'Bột mì', icon: '🌾', color: 'bg-[#F7FAFD] dark:bg-[#172536] text-[#526B80] dark:text-[#A9BDCE] border-[#91A9BC]/50' },
  { id: 'egg', name: 'Trứng tươi', icon: '🥚', color: 'bg-[#E8F1F8] dark:bg-[#202F42] text-[#526B80] dark:text-[#A9BDCE] border-[#91A9BC]/40' },
  { id: 'milk', name: 'Sữa tươi', icon: '🥛', color: 'bg-[#D5E4EF] dark:bg-[#27384D] text-[#526B80] dark:text-[#A9BDCE] border-[#91A9BC]/40' },
  { id: 'butter', name: 'Bơ thơm', icon: '🧈', color: 'bg-[#F7FAFD] dark:bg-[#172536] text-[#526B80] dark:text-[#A9BDCE] border-[#91A9BC]/40' },
  { id: 'strawberry', name: 'Dâu tuyết', icon: '🍓', color: 'bg-[#E8F1F8] dark:bg-[#202F42] text-[#526B80] dark:text-[#A9BDCE] border-[#91A9BC]/40' },
  { id: 'chocolate', name: 'Chocolate', icon: '🍫', color: 'bg-[#D5E4EF] dark:bg-[#27384D] text-[#526B80] dark:text-[#A9BDCE] border-[#91A9BC]/40' },
  { id: 'sugar', name: 'Đường cát', icon: '🍬', color: 'bg-[#F7FAFD] dark:bg-[#172536] text-[#526B80] dark:text-[#A9BDCE] border-[#91A9BC]/40' },
  { id: 'vanilla', name: 'Hương vanilla', icon: '✨', color: 'bg-[#E8F1F8] dark:bg-[#202F42] text-[#526B80] dark:text-[#A9BDCE] border-[#91A9BC]/40' },
];

const TOPPINGS = [
  { id: 'strawberries', name: 'Dâu tây', icon: '🍓' },
  { id: 'choco', name: 'Chocolate', icon: '🍫' },
  { id: 'cookie', name: 'Bánh quy', icon: '🍪' },
  { id: 'blueberry', name: 'Việt quất', icon: '🫐' },
  { id: 'cherry', name: 'Trái Cherry', icon: '🍒' },
  { id: 'candy', name: 'Kẹo dẻo', icon: '🍬' },
  { id: 'sprinkles', name: 'Hạt ngọc', icon: '✨' },
  { id: 'bow', name: 'Nơ xanh', icon: '🎀' },
  { id: 'snowflake', name: 'Bông tuyết', icon: '❄️' },
  { id: 'candle', name: 'Cây nến', icon: '🕯️' },
];

const PRESET_RECIPES = [
  { name: '🍓 Bánh Dâu Tây Tuyết Trắng', required: ['flour', 'egg', 'milk', 'butter', 'strawberry'] },
  { name: '🍫 Bánh Chocolate Đậm Vị', required: ['flour', 'egg', 'milk', 'butter', 'chocolate'] },
  { name: '🧁 Bánh Kem Vanilla Ngọt Ngào', required: ['flour', 'egg', 'milk', 'butter', 'sugar'] },
  { name: '🍰 Bánh Mousse Mùa Đông', required: ['flour', 'milk', 'strawberry', 'chocolate', 'vanilla'] },
];

const BADGES = [
  { id: 'first_cake', title: '🍰 Thợ Bánh Tập Sự', desc: 'Hoàn thành chiếc bánh đầu tiên' },
  { id: 'strawberry_fan', title: '🍓 Tín Đồ Dâu Tây', desc: 'Trang trí bánh bằng Dâu tươi' },
  { id: 'choco_master', title: '🍫 Fan Chocolate', desc: 'Sử dụng Chocolate làm bánh' },
  { id: 'cute_cake', title: '🎀 Bánh Đáng Yêu', desc: 'Thêm hơn 5 loại Toppings lên bánh' },
  { id: 'bakery_pro', title: '👑 Thợ Bánh Chăm Chỉ', desc: 'Lưu 3+ chiếc bánh vào bộ sưu tập' },
];

type Step = 'opening' | 'step1' | 'step2' | 'step3' | 'step4' | 'step5' | 'step6' | 'collection';

export const BakeryGameModal: React.FC<BakeryGameModalProps> = ({
  isOpen,
  onClose,
  isSfxOn = true,
  sfxVolume = 0.5,
}) => {
  const [step, setStep] = useState<Step>('opening');
  const [isNightMode, setIsNightMode] = useState(false);

  const [currentRecipe, setCurrentRecipe] = useState(PRESET_RECIPES[0]);
  const [bowlIngredients, setBowlIngredients] = useState<string[]>([]);
  const [incorrectFeedback, setIncorrectFeedback] = useState<string | null>(null);

  const [mixProgress, setMixProgress] = useState<number>(0);
  const [isPoured, setIsPoured] = useState(false);

  const [bakeTimer, setBakeTimer] = useState<number>(5);
  const [isBaking, setIsBaking] = useState(false);
  const [isBakedDone, setIsBakedDone] = useState(false);

  const [placedToppings, setPlacedToppings] = useState<SavedCakeTopping[]>([]);
  const [selectedTopping, setSelectedTopping] = useState<typeof TOPPINGS[0] | null>(null);

  const [cakeTitle, setCakeTitle] = useState<string>('Bánh Kem Mùa Đông');
  const [earnedReward, setEarnedReward] = useState<string | null>(null);

  const [savedCakes, setSavedCakes] = useState<SavedCake[]>(() => {
    try {
      const saved = localStorage.getItem('yui_saved_cakes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('yui_bakery_badges');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [yuiDialogue, setYuiDialogue] = useState<string>(
    'Chào mừng bạn đến với Tiệm Bánh Nhỏ Mùa Đông! Cùng làm một chiếc bánh thật thơm nhé ✦'
  );

  const triggerSfx = (type: 'pop' | 'swish' | 'plop' | 'ting' | 'sparkle') => {
    if (!isSfxOn) return;
    switch (type) {
      case 'pop':
        playPopSfx(sfxVolume);
        break;
      case 'swish':
        playSwishSfx(sfxVolume);
        break;
      case 'plop':
        playPlopSfx(sfxVolume);
        break;
      case 'ting':
        playTingSfx(sfxVolume);
        break;
      case 'sparkle':
        playSparkleSfx(sfxVolume);
        break;
    }
  };

  const handleStartGame = () => {
    setStep('step1');
    setBowlIngredients([]);
    setMixProgress(0);
    setIsPoured(false);
    setBakeTimer(5);
    setIsBaking(false);
    setIsBakedDone(false);
    setPlacedToppings([]);
    setEarnedReward(null);
    setIncorrectFeedback(null);
    setCakeTitle(currentRecipe.name);
    triggerSfx('pop');
    setYuiDialogue(`Đầu tiên, hãy chọn nguyên liệu theo công thức "${currentRecipe.name}" nha!`);
  };

  const handleRandomRecipe = () => {
    const nextIdx = (PRESET_RECIPES.indexOf(currentRecipe) + 1) % PRESET_RECIPES.length;
    setCurrentRecipe(PRESET_RECIPES[nextIdx]);
    triggerSfx('swish');
    setYuiDialogue(`Đổi công thức thành: "${PRESET_RECIPES[nextIdx].name}" ✨`);
  };

  const handleAddIngredient = (id: string) => {
    if (bowlIngredients.includes(id)) return;
    const next = [...bowlIngredients, id];
    setBowlIngredients(next);
    triggerSfx('plop');

    const isIngredientInRecipe = currentRecipe.required.includes(id);
    if (!isIngredientInRecipe) {
      setIncorrectFeedback('Ủa, nguyên liệu này hơi lạ nha, nhưng bạn cứ thử sáng tạo xem sao! 🌾');
    } else {
      setIncorrectFeedback(null);
    }

    setYuiDialogue(`Đã thêm ${INGREDIENTS.find((i) => i.id === id)?.name} vào tô! 🥣`);
  };

  const handleMix = () => {
    if (mixProgress >= 100) return;
    const next = Math.min(100, mixProgress + 25);
    setMixProgress(next);
    triggerSfx('swish');

    if (next >= 100) {
      triggerSfx('sparkle');
      setYuiDialogue('Tuyệt vời! Bột đã mịn quánh đều rồi! Sẵn sàng đổ vào khuôn nha! 🧁✨');
    } else {
      setYuiDialogue(`Khuấy đều... ${next}% mịn màng rồi nè! 🥄`);
    }
  };

  const handlePourToMold = () => {
    if (isPoured) return;
    setIsPoured(true);
    triggerSfx('plop');
    setYuiDialogue('Bột đã vào khuôn gọn gàng! Mau đem đi nướng thôi! 🔥');
  };

  const handleStartBake = () => {
    if (isBaking || isBakedDone) return;
    setIsBaking(true);
    setBakeTimer(5);
    triggerSfx('pop');
    setYuiDialogue('Lò nướng ấm áp đang hoạt động... Chờ 5 giây nhé! 🔥');

    let timer = 5;
    const interval = setInterval(() => {
      timer -= 1;
      setBakeTimer(timer);
      if (timer <= 0) {
        clearInterval(interval);
        setIsBaking(false);
        setIsBakedDone(true);
        triggerSfx('ting');
        setYuiDialogue('TING! Bánh đã chín thơm phức rồi! 🍰✨');
      }
    }, 1000);
  };

  const handleCakeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedTopping) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(10, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(10, Math.min(90, ((e.clientY - rect.top) / rect.height) * 100));

    const newTopping: SavedCakeTopping = {
      id: `${selectedTopping.id}_${Date.now()}_${Math.random()}`,
      icon: selectedTopping.icon,
      name: selectedTopping.name,
      x,
      y,
    };

    setPlacedToppings((prev) => [...prev, newTopping]);
    triggerSfx('sparkle');
    setYuiDialogue(`Đã thêm ${selectedTopping.name} xinh xắn! ✦`);
  };

  const handleFinishCake = () => {
    setStep('step6');
    triggerSfx('sparkle');
    setYuiDialogue('Tadaa! Bánh của bạn đây! Trông ngon tuyệt! 🍰✦');

    const rewards = [
      '✦ Sticker Bánh Mùa Đông',
      '❄️ Bông Tuyết Trang Trí Tiệm Bánh',
      '🍰 Huy Chương Thợ Bánh Tí Hon',
      '✦ Hiệu Ứng Tuyết Lấp Lánh Khai Trương',
    ];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    setEarnedReward(reward);

    const newBadges = [...unlockedBadges];
    if (!newBadges.includes('first_cake')) newBadges.push('first_cake');
    if (placedToppings.some((t) => t.icon === '🍓') && !newBadges.includes('strawberry_fan')) {
      newBadges.push('strawberry_fan');
    }
    if (bowlIngredients.includes('chocolate') && !newBadges.includes('choco_master')) {
      newBadges.push('choco_master');
    }
    if (placedToppings.length >= 5 && !newBadges.includes('cute_cake')) {
      newBadges.push('cute_cake');
    }

    setUnlockedBadges(newBadges);
    localStorage.setItem('yui_bakery_badges', JSON.stringify(newBadges));
  };

  const handleSaveCake = () => {
    const newCake: SavedCake = {
      id: `cake_${Date.now()}`,
      name: cakeTitle || currentRecipe.name,
      createdAt: new Date().toLocaleDateString('vi-VN'),
      recipeName: currentRecipe.name,
      ingredientsUsed: bowlIngredients,
      toppings: placedToppings,
      rewardGiven: earnedReward || undefined,
    };

    const updated = [newCake, ...savedCakes];
    setSavedCakes(updated);
    localStorage.setItem('yui_saved_cakes', JSON.stringify(updated));

    if (updated.length >= 3 && !unlockedBadges.includes('bakery_pro')) {
      const b = [...unlockedBadges, 'bakery_pro'];
      setUnlockedBadges(b);
      localStorage.setItem('yui_bakery_badges', JSON.stringify(b));
    }

    triggerSfx('sparkle');
    setYuiDialogue('Đã lưu bánh vào Bộ sưu tập bánh rồi nà! 📸🍰');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#172536]/70 backdrop-blur-md animate-fade-in font-sans">
      <div
        className={`relative w-full max-w-2xl rounded-3xl shadow-2xl border transition-all duration-300 overflow-hidden ${
          isNightMode
            ? 'bg-[#172536] text-[#E5EDF5] border-[#354A60]'
            : 'bg-[#F7FAFD]/95 text-[#172536] border-[#DCE7EF]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#DCE7EF] dark:border-[#354A60] bg-[#E8F1F8]/90 dark:bg-[#202F42]/90 backdrop-blur-sm">
          <div className="flex items-center gap-2 font-serif">
            <span className="text-2xl animate-bounce">🍰</span>
            <div>
              <h2 className="text-base font-extrabold bg-gradient-to-r from-[#526B80] to-[#172536] dark:from-[#E5EDF5] dark:to-[#A9BDCE] bg-clip-text text-transparent">
                Tiệm bánh nhỏ mùa đông
              </h2>
              <p className="text-[11px] text-[#43576B] dark:text-[#A9BDCE] font-medium">
                Góc làm bánh ấm áp & thư giãn ngày tuyết rơi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNightMode(!isNightMode)}
              className="p-1.5 rounded-full bg-white dark:bg-[#172536] text-[#526B80] dark:text-[#A9BDCE] border border-[#DCE7EF] dark:border-[#354A60] hover:scale-105 transition-transform cursor-pointer"
              title={isNightMode ? 'Chuyển sang Ban ngày' : 'Chuyển sang Ban đêm'}
            >
              {isNightMode ? <Moon className="w-4 h-4 text-[#A9BDCE]" /> : <Sun className="w-4 h-4 text-[#526B80]" />}
            </button>

            <button
              onClick={() => setStep(step === 'collection' ? 'opening' : 'collection')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-[#172536] text-[#526B80] dark:text-[#A9BDCE] hover:bg-[#D5E4EF]/50 transition-colors border border-[#DCE7EF] dark:border-[#354A60] cursor-pointer font-serif"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bộ sưu tập ({savedCakes.length})</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#43576B] hover:text-[#172536] dark:text-[#A9BDCE] dark:hover:text-white hover:bg-[#D5E4EF]/60 dark:hover:bg-[#354A60] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mascot Speech Bubble Header */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#E8F1F8]/80 dark:bg-[#202F42]/80 border border-[#DCE7EF] dark:border-[#354A60] shadow-xs">
            <div className="relative">
              <span className="text-3xl">❄️</span>
              <span className="absolute -bottom-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#91A9BC] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#526B80]"></span>
              </span>
            </div>
            <div className="flex-1 font-serif">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#526B80] dark:text-[#A9BDCE]">
                Hướng dẫn
              </span>
              <p className="text-xs sm:text-sm font-semibold text-[#172536] dark:text-[#E5EDF5]">
                “{yuiDialogue}”
              </p>
            </div>
          </div>
        </div>

        {/* Modal Main Stage */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {step === 'opening' && (
            <div className="flex flex-col items-center text-center py-4 space-y-6">
              <div
                className={`relative w-full max-w-md h-48 sm:h-56 rounded-3xl p-4 flex flex-col justify-end items-center overflow-hidden border shadow-inner transition-colors ${
                  isNightMode
                    ? 'bg-gradient-to-b from-[#172536] via-[#202F42] to-[#27384D] border-[#354A60]'
                    : 'bg-gradient-to-b from-[#F7FAFD] via-[#E8F1F8] to-[#D5E4EF] border-[#DCE7EF]'
                }`}
              >
                <div className="absolute top-3 right-6 text-2xl">
                  {isNightMode ? '🌙 ❄️ ✧' : '☀️ ❄️'}
                </div>

                <div className="flex items-center justify-center gap-2 mb-2 z-10 text-2xl sm:text-3xl">
                  <span className="animate-bounce delay-75">🥣</span>
                  <span>🥚</span>
                  <span>🥛</span>
                  <span className="text-4xl animate-pulse">🍰</span>
                  <span>🍓</span>
                  <span>🍫</span>
                  <span>🧈</span>
                </div>

                <div className="w-full h-12 rounded-t-xl bg-[#D5E4EF] dark:bg-[#354A60] border-t-2 border-[#91A9BC] dark:border-[#91A9BC]/40 flex items-center justify-center text-xs font-bold font-serif text-[#172536] dark:text-[#E5EDF5]">
                  Bàn Làm Bánh Mùa Đông
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md font-serif">
                <button
                  onClick={handleStartGame}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#91A9BC] to-[#526B80] hover:brightness-105 text-white font-extrabold text-sm shadow-lg shadow-[#526B80]/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>🍰 Bắt đầu làm bánh</span>
                </button>

                <button
                  onClick={handleRandomRecipe}
                  className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-white dark:bg-[#202F42] text-[#526B80] dark:text-[#E5EDF5] border border-[#DCE7EF] dark:border-[#354A60] font-bold text-xs shadow-xs hover:bg-[#E8F1F8] dark:hover:bg-[#354A60] transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-[#526B80] dark:text-[#91A9BC]" />
                  <span>🎲 Chọn công thức</span>
                </button>
              </div>
            </div>
          )}

          {step === 'step1' && (
            <div className="space-y-5 font-serif">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#172536] dark:text-[#E5EDF5]">
                    Bước 1 — Chọn Nguyên Liệu vào Tô 🥣
                  </h3>
                  <p className="text-xs text-[#43576B] dark:text-[#A9BDCE]">
                    Chọn ít nhất 3–4 nguyên liệu từ bàn bếp bên dưới
                  </p>
                </div>
                <div className="text-xs font-bold text-[#526B80] dark:text-[#A9BDCE] bg-[#E8F1F8] dark:bg-[#202F42] px-3 py-1 rounded-full border border-[#DCE7EF] dark:border-[#354A60]">
                  Công thức: {currentRecipe.name}
                </div>
              </div>

              <div className="relative mx-auto w-40 h-32 rounded-b-full bg-[#E8F1F8] dark:bg-[#202F42] border-4 border-[#91A9BC]/60 dark:border-[#354A60] shadow-md flex flex-col items-center justify-center p-2">
                <span className="text-4xl mb-1">🥣</span>
                <div className="flex items-center gap-1 flex-wrap justify-center max-w-[80%]">
                  {bowlIngredients.map((ingId) => {
                    const ing = INGREDIENTS.find((i) => i.id === ingId);
                    return (
                      <span key={ingId} className="text-lg animate-pop">
                        {ing?.icon}
                      </span>
                    );
                  })}
                </div>
              </div>

              {incorrectFeedback && (
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-center text-xs font-bold text-amber-700 dark:text-amber-300 animate-fade-in">
                  {incorrectFeedback}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {INGREDIENTS.map((ing) => {
                  const isAdded = bowlIngredients.includes(ing.id);
                  return (
                    <button
                      key={ing.id}
                      onClick={() => handleAddIngredient(ing.id)}
                      disabled={isAdded}
                      className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${ing.color} ${
                        isAdded
                          ? 'opacity-40 cursor-not-allowed scale-95'
                          : 'hover:scale-105 active:scale-95 shadow-xs'
                      }`}
                    >
                      <span className="text-2xl mb-1">{ing.icon}</span>
                      <span className="text-xs font-bold">{ing.name}</span>
                    </button>
                  );
                })}
              </div>

              {bowlIngredients.length >= 3 && (
                <button
                  onClick={() => setStep('step2')}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#91A9BC] to-[#526B80] hover:brightness-105 text-white font-extrabold text-sm shadow-md transition-all animate-bounce cursor-pointer"
                >
                  Sẵn sàng sang Bước 2 — Trộn Bột! 🥄 →
                </button>
              )}
            </div>
          )}

          {step === 'step2' && (
            <div className="space-y-6 text-center py-2 font-serif">
              <div>
                <h3 className="text-sm font-extrabold text-[#172536] dark:text-[#E5EDF5]">
                  Bước 2 — Trộn Bột 🥄
                </h3>
                <p className="text-xs text-[#43576B] dark:text-[#A9BDCE]">
                  Nhấn "Trộn nào!" liên tục để làm quánh mịn tô bột!
                </p>
              </div>

              <div className="relative mx-auto w-44 h-36 rounded-b-full bg-[#E8F1F8] dark:bg-[#202F42] border-4 border-[#91A9BC]/70 dark:border-[#354A60] shadow-xl flex flex-col items-center justify-center p-3">
                <span
                  className={`text-5xl transition-transform duration-300 ${
                    mixProgress > 0 && mixProgress < 100 ? 'animate-spin' : ''
                  }`}
                >
                  🥣
                </span>
                <span className="text-2xl absolute top-3 right-8 animate-bounce">🥄</span>
              </div>

              <div className="w-full max-w-md mx-auto space-y-1.5 font-sans">
                <div className="flex justify-between text-xs font-bold">
                  <span>Mức độ đều bột</span>
                  <span className="text-[#526B80] dark:text-[#A9BDCE] font-mono">{mixProgress}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#DCE7EF] dark:bg-[#354A60] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#91A9BC] to-[#526B80] transition-all duration-300"
                    style={{ width: `${mixProgress}%` }}
                  />
                </div>
              </div>

              {mixProgress < 100 ? (
                <button
                  onClick={handleMix}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#91A9BC] to-[#526B80] hover:brightness-105 text-white font-extrabold text-sm shadow-lg active:scale-90 transition-all cursor-pointer font-serif"
                >
                  🥄 Trộn nào! (↻ ↻ ↻)
                </button>
              ) : (
                <div className="space-y-3 font-serif">
                  <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 animate-pulse">
                    ✦ Perfect! Bột dẻo mịn tuyệt vời!
                  </div>
                  <button
                    onClick={() => setStep('step3')}
                    className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#91A9BC] to-[#526B80] text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
                  >
                    Cho vào khuôn bánh 🧁 →
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 'step3' && (
            <div className="space-y-6 text-center py-2 font-serif">
              <div>
                <h3 className="text-sm font-extrabold text-[#172536] dark:text-[#E5EDF5]">
                  Bước 3 — Cho vào Khuôn Bánh 🧁
                </h3>
                <p className="text-xs text-[#43576B] dark:text-[#A9BDCE]">
                  Nhấn vào tô bột để rót bột vào khuôn nhé!
                </p>
              </div>

              <div className="flex items-center justify-center gap-8 py-4">
                <button
                  onClick={handlePourToMold}
                  disabled={isPoured}
                  className={`p-4 rounded-3xl bg-[#E8F1F8] dark:bg-[#202F42] border-2 border-[#91A9BC]/60 dark:border-[#354A60] flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    isPoured ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 shadow-md'
                  }`}
                >
                  <span className="text-5xl">🥣</span>
                  <span className="text-xs font-bold text-[#526B80] dark:text-[#A9BDCE]">
                    {isPoured ? 'Đã rót xong' : 'Nhấn để rót 🥣 →'}
                  </span>
                </button>

                <span className="text-2xl text-[#526B80] dark:text-[#91A9BC] font-extrabold">➔</span>

                <div className="p-4 rounded-3xl bg-[#D5E4EF] dark:bg-[#27384D] border-2 border-[#91A9BC]/70 dark:border-[#91A9BC]/40 flex flex-col items-center gap-1">
                  <span className={`text-5xl ${isPoured ? 'animate-bounce' : ''}`}>
                    {isPoured ? '🧁' : '🥮'}
                  </span>
                  <span className="text-xs font-bold text-[#526B80] dark:text-[#E5EDF5]">
                    {isPoured ? 'Khuôn bột tràn đầy ✦' : 'Khuôn trống'}
                  </span>
                </div>
              </div>

              {isPoured && (
                <button
                  onClick={() => setStep('step4')}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#91A9BC] to-[#526B80] hover:brightness-105 text-white font-extrabold text-sm shadow-md transition-all animate-bounce cursor-pointer font-serif"
                >
                  Đem đi nướng thôi! 🔥 →
                </button>
              )}
            </div>
          )}

          {step === 'step4' && (
            <div className="space-y-6 text-center py-2 font-serif">
              <div>
                <h3 className="text-sm font-extrabold text-[#172536] dark:text-[#E5EDF5]">
                  Bước 4 — Nướng Bánh Lò Ấm 🔥
                </h3>
                <p className="text-xs text-[#43576B] dark:text-[#A9BDCE]">
                  Nướng bánh trong 5 giây cho bánh chín phồng thơm phức!
                </p>
              </div>

              <div className="relative mx-auto w-56 h-40 rounded-3xl bg-[#172536] text-[#E5EDF5] border-4 border-[#354A60] shadow-2xl flex flex-col items-center justify-center p-3 overflow-hidden font-sans">
                <div className="absolute top-2 right-3 text-[10px] font-mono text-amber-400 font-bold">
                  00:0{bakeTimer}
                </div>

                <div
                  className={`w-40 h-24 rounded-2xl border-2 border-[#91A9BC]/40 flex items-center justify-center transition-colors duration-500 ${
                    isBaking ? 'bg-gradient-to-r from-amber-600/60 to-[#526B80]/60 animate-pulse' : 'bg-[#202F42]'
                  }`}
                >
                  {isBakedDone ? (
                    <span className="text-6xl animate-bounce">🍰</span>
                  ) : (
                    <span className={`text-5xl transition-all duration-1000 ${isBaking ? 'scale-125' : 'scale-100'}`}>
                      🧁
                    </span>
                  )}
                </div>
              </div>

              {!isBaking && !isBakedDone && (
                <button
                  onClick={handleStartBake}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#91A9BC] to-[#526B80] hover:brightness-105 text-white font-extrabold text-sm shadow-lg active:scale-95 transition-all cursor-pointer font-serif"
                >
                  🔥 Nướng bánh ngay
                </button>
              )}

              {isBaking && (
                <div className="text-xs font-bold text-[#526B80] dark:text-[#A9BDCE] animate-pulse font-mono">
                  Đang nướng... Bánh đang phồng phồng phồng! 00:0{bakeTimer}
                </div>
              )}

              {isBakedDone && (
                <div className="space-y-3 font-serif">
                  <div className="text-sm font-extrabold text-[#526B80] dark:text-[#A9BDCE]">
                    “TING!” Bánh chín nở đều đẹp mắt! 🍰✦
                  </div>
                  <button
                    onClick={() => setStep('step5')}
                    className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#91A9BC] to-[#526B80] hover:brightness-105 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
                  >
                    Trang trí bánh tự do 🍓 →
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 'step5' && (
            <div className="space-y-5 font-serif">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#172536] dark:text-[#E5EDF5]">
                    Bước 5 — Trang Trí Bánh 🍓
                  </h3>
                  <p className="text-xs text-[#43576B] dark:text-[#A9BDCE]">
                    Chọn Topping bên dưới rồi chạm lên mặt bánh để đặt vào!
                  </p>
                </div>
                <button
                  onClick={() => setPlacedToppings([])}
                  className="text-xs font-bold text-[#43576B] hover:text-red-500 underline cursor-pointer"
                >
                  Xóa hết topping
                </button>
              </div>

              <div
                onClick={handleCakeClick}
                className="relative mx-auto w-64 h-56 rounded-3xl bg-gradient-to-b from-[#E8F1F8] to-[#D5E4EF] dark:from-[#202F42] dark:to-[#172536] border-4 border-[#91A9BC]/60 dark:border-[#354A60] shadow-xl flex items-center justify-center cursor-pointer select-none overflow-hidden group"
              >
                <div className="relative w-44 h-36 rounded-2xl bg-white dark:bg-[#27384D] border-2 border-[#DCE7EF] dark:border-[#354A60] shadow-md flex flex-col items-center justify-center">
                  <div className="w-full h-12 bg-[#E8F1F8] dark:bg-[#202F42] rounded-t-2xl border-b border-[#DCE7EF] dark:border-[#354A60] flex items-center justify-center">
                    <span className="text-xs font-extrabold text-[#526B80] dark:text-[#A9BDCE]">
                      Lớp kem tuyết trắng
                    </span>
                  </div>
                  <span className="text-4xl my-auto">🍰</span>
                </div>

                {placedToppings.map((tp) => (
                  <span
                    key={tp.id}
                    className="absolute text-2xl -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125 animate-pop pointer-events-none"
                    style={{ left: `${tp.x}%`, top: `${tp.y}%` }}
                  >
                    {tp.icon}
                  </span>
                ))}

                <div className="absolute bottom-2 text-[10px] font-extrabold text-[#526B80] dark:text-[#E5EDF5] bg-white/90 dark:bg-[#172536]/90 px-2 py-0.5 rounded-full border border-[#DCE7EF] dark:border-[#354A60]">
                  Chạm lên bánh để gắn Topping ✦
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {TOPPINGS.map((tp) => {
                  const isSelected = selectedTopping?.id === tp.id;
                  return (
                    <button
                      key={tp.id}
                      onClick={() => setSelectedTopping(tp)}
                      className={`p-2 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#91A9BC] to-[#526B80] text-white border-[#526B80] scale-105 shadow-md'
                          : 'bg-white dark:bg-[#202F42] border-[#DCE7EF] dark:border-[#354A60] hover:scale-105'
                      }`}
                    >
                      <span className="text-xl">{tp.icon}</span>
                      <span className="text-[10px] font-bold truncate max-w-full">{tp.name}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleFinishCake}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#91A9BC] to-[#526B80] hover:brightness-105 text-white font-extrabold text-sm shadow-lg active:scale-95 transition-all cursor-pointer font-serif"
              >
                Hoàn thành & Xem Thành Phẩm! 🍰✦
              </button>
            </div>
          )}

          {step === 'step6' && (
            <div className="space-y-6 text-center py-2 font-serif">
              <div>
                <span className="text-xs font-extrabold text-[#526B80] dark:text-[#A9BDCE] tracking-wider uppercase">
                  ✦ · Khoảnh Khắc Thành Phẩm · ✦
                </span>
                <h3 className="text-lg font-extrabold text-[#172536] dark:text-[#E5EDF5] mt-1">
                  “Tadaa! Bánh của bạn đây! 🍰”
                </h3>
              </div>

              <div className="relative mx-auto w-full max-w-sm rounded-3xl bg-gradient-to-b from-white via-[#F7FAFD] to-[#E8F1F8] dark:from-[#202F42] dark:to-[#172536] border-2 border-[#DCE7EF] dark:border-[#354A60] p-6 shadow-xl space-y-4">
                <div className="relative mx-auto w-48 h-40 rounded-2xl bg-[#E8F1F8] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#354A60] flex items-center justify-center overflow-hidden">
                  <span className="text-6xl">🍰</span>
                  {placedToppings.map((tp) => (
                    <span
                      key={tp.id}
                      className="absolute text-xl -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${tp.x}%`, top: `${tp.y}%` }}
                    >
                      {tp.icon}
                    </span>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#43576B] dark:text-[#A9BDCE] uppercase">Tên chiếc bánh</label>
                  <input
                    type="text"
                    value={cakeTitle}
                    onChange={(e) => setCakeTitle(e.target.value)}
                    className="w-full text-center font-extrabold text-base text-[#526B80] dark:text-[#E5EDF5] bg-white/90 dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#354A60] rounded-xl py-1.5 focus:outline-none focus:ring-2 focus:ring-[#91A9BC]"
                  />
                </div>

                {earnedReward && (
                  <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-xs font-bold text-amber-800 dark:text-amber-200 flex items-center justify-center gap-1.5 animate-fade-in">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Phần thưởng: {earnedReward}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm mx-auto">
                <button
                  onClick={handleSaveCake}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#91A9BC] to-[#526B80] hover:brightness-105 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>📸 Lưu bánh vào Bộ sưu tập</span>
                </button>

                <button
                  onClick={handleStartGame}
                  className="w-full py-3.5 rounded-2xl bg-white dark:bg-[#202F42] text-[#172536] dark:text-[#E5EDF5] border border-[#DCE7EF] dark:border-[#354A60] font-bold text-xs hover:bg-[#E8F1F8] dark:hover:bg-[#354A60] transition-colors cursor-pointer"
                >
                  Làm chiếc bánh mới 🍰
                </button>
              </div>
            </div>
          )}

          {step === 'collection' && (
            <div className="space-y-6 font-serif">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#172536] dark:text-[#E5EDF5]">
                    🍰 Bộ Sưu Tập Bánh & Thành Tích
                  </h3>
                  <p className="text-xs text-[#43576B] dark:text-[#A9BDCE]">
                    Những chiếc bánh dễ thương do chính tay bạn tạo nên
                  </p>
                </div>
                <button
                  onClick={() => setStep('opening')}
                  className="text-xs font-bold text-[#526B80] dark:text-[#A9BDCE] hover:underline cursor-pointer"
                >
                  ← Về Tiệm bánh
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#E8F1F8]/70 dark:bg-[#202F42]/70 border border-[#DCE7EF] dark:border-[#354A60] space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#172536] dark:text-[#E5EDF5]">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Huy Chương Thợ Bánh ({unlockedBadges.length}/{BADGES.length})</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-sans">
                  {BADGES.map((bg) => {
                    const isUnlocked = unlockedBadges.includes(bg.id);
                    return (
                      <div
                        key={bg.id}
                        className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                          isUnlocked
                            ? 'bg-white dark:bg-[#172536] border-[#91A9BC]/60 text-[#526B80] dark:text-[#E5EDF5]'
                            : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-50 grayscale'
                        }`}
                      >
                        <Award className="w-5 h-5 mb-1 text-amber-500" />
                        <span className="text-xs font-bold font-serif">{bg.title}</span>
                        <span className="text-[10px] text-[#43576B] dark:text-[#A9BDCE] font-medium mt-0.5">
                          {bg.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 font-serif">
                <h4 className="text-xs font-extrabold text-[#172536] dark:text-[#E5EDF5] uppercase tracking-wider">
                  Những chiếc bánh đã làm ({savedCakes.length})
                </h4>

                {savedCakes.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-[#E8F1F8]/50 dark:bg-[#202F42]/50 border border-dashed border-[#91A9BC]/40 dark:border-[#354A60] space-y-2">
                    <span className="text-3xl">🧁</span>
                    <p className="text-xs font-semibold text-[#43576B] dark:text-[#A9BDCE]">
                      Chưa có chiếc bánh nào được lưu. Hãy mở lò nướng và tự tay làm một chiếc bánh ngay nhé!
                    </p>
                    <button
                      onClick={handleStartGame}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#91A9BC] to-[#526B80] text-white font-bold text-xs shadow-sm hover:brightness-105 transition-colors cursor-pointer"
                    >
                      Bắt đầu làm bánh
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedCakes.map((cake) => (
                      <div
                        key={cake.id}
                        className="p-3.5 rounded-2xl bg-white dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#354A60] shadow-xs flex items-start gap-3"
                      >
                        <div className="relative w-16 h-16 rounded-xl bg-[#E8F1F8] dark:bg-[#172536] flex items-center justify-center shrink-0 text-2xl border border-[#DCE7EF] dark:border-[#354A60]">
                          🍰
                          {cake.toppings.slice(0, 3).map((tp, idx) => (
                            <span key={idx} className="absolute text-xs" style={{ left: `${20 + idx * 25}%`, top: '20%' }}>
                              {tp.icon}
                            </span>
                          ))}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-extrabold text-[#526B80] dark:text-[#E5EDF5] truncate font-serif">
                            {cake.name}
                          </h5>
                          <p className="text-[10px] text-[#43576B] dark:text-[#A9BDCE] font-medium">
                            Ngày làm: {cake.createdAt}
                          </p>
                          <p className="text-[10px] text-[#43576B] dark:text-[#A9BDCE] font-medium truncate mt-0.5">
                            Công thức: {cake.recipeName}
                          </p>
                          {cake.rewardGiven && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#E8F1F8] dark:bg-[#354A60] text-[#526B80] dark:text-[#A9BDCE] text-[9px] font-bold">
                              {cake.rewardGiven}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Trophy, Heart, RefreshCw, Bookmark, Volume2, VolumeX, Moon, Sun, Award } from 'lucide-react';
import { SavedCake, SavedCakeTopping } from '../types';
import { playPopSfx, playSwishSfx, playPlopSfx, playTingSfx, playSparkleSfx } from '../utils/sfx';

interface BakeryGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSfxOn?: boolean;
  sfxVolume?: number;
}

// Available Ingredients
const INGREDIENTS = [
  { id: 'flour', name: 'Bột mì', icon: '🌾', color: 'bg-[#F2FBFC] dark:bg-[#0D2730] text-[#247C8C] dark:text-[#78DCE0] border-[#65C5CE]/50' },
  { id: 'egg', name: 'Trứng tươi', icon: '🥚', color: 'bg-[#E5F5F7] dark:bg-[#102F38] text-[#247C8C] dark:text-[#78DCE0] border-[#65C5CE]/40' },
  { id: 'milk', name: 'Sữa tươi', icon: '🥛', color: 'bg-[#DDF1F3] dark:bg-[#143943] text-[#247C8C] dark:text-[#78DCE0] border-[#65C5CE]/40' },
  { id: 'butter', name: 'Bơ thơm', icon: '🧈', color: 'bg-[#F2FBFC] dark:bg-[#0D2730] text-[#247C8C] dark:text-[#78DCE0] border-[#65C5CE]/40' },
  { id: 'strawberry', name: 'Dâu biển', icon: '🍓', color: 'bg-[#E5F5F7] dark:bg-[#102F38] text-[#247C8C] dark:text-[#78DCE0] border-[#65C5CE]/40' },
  { id: 'chocolate', name: 'Chocolate', icon: '🍫', color: 'bg-[#DDF1F3] dark:bg-[#143943] text-[#247C8C] dark:text-[#78DCE0] border-[#65C5CE]/40' },
  { id: 'sugar', name: 'Đường cát', icon: '🍬', color: 'bg-[#F2FBFC] dark:bg-[#0D2730] text-[#247C8C] dark:text-[#78DCE0] border-[#65C5CE]/40' },
  { id: 'vanilla', name: 'Hương vanilla', icon: '✨', color: 'bg-[#E5F5F7] dark:bg-[#102F38] text-[#247C8C] dark:text-[#78DCE0] border-[#65C5CE]/40' },
];

// Available Toppings
const TOPPINGS = [
  { id: 'strawberries', name: 'Dâu tây', icon: '🍓' },
  { id: 'choco', name: 'Chocolate', icon: '🍫' },
  { id: 'cookie', name: 'Bánh quy', icon: '🍪' },
  { id: 'blueberry', name: 'Việt quất', icon: '🫐' },
  { id: 'cherry', name: 'Trái Cherry', icon: '🍒' },
  { id: 'candy', name: 'Kẹo dẻo', icon: '🍬' },
  { id: 'sprinkles', name: 'Hạt ngọc', icon: '✨' },
  { id: 'bow', name: 'Nơ xanh', icon: '🎀' },
  { id: 'shell', name: 'Vỏ sò', icon: '🐚' },
  { id: 'candle', name: 'Cây nến', icon: '🕯️' },
];

// Preset Recipes
const PRESET_RECIPES = [
  { name: '🍓 Bánh Dâu Tây Biển Khơi', required: ['flour', 'egg', 'milk', 'butter', 'strawberry'] },
  { name: '🍫 Bánh Chocolate Đậm Vị', required: ['flour', 'egg', 'milk', 'butter', 'chocolate'] },
  { name: '🧁 Bánh Kem Vanilla Ngọt Ngào', required: ['flour', 'egg', 'milk', 'butter', 'sugar'] },
  { name: '🍰 Bánh Mousse Đại Dương', required: ['flour', 'milk', 'strawberry', 'chocolate', 'vanilla'] },
];

// Badges definitions
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
  
  // Recipe & Ingredients state
  const [currentRecipe, setCurrentRecipe] = useState(PRESET_RECIPES[0]);
  const [bowlIngredients, setBowlIngredients] = useState<string[]>([]);
  const [incorrectFeedback, setIncorrectFeedback] = useState<string | null>(null);

  // Step 2: Mixing
  const [mixProgress, setMixProgress] = useState<number>(0);
  const [isMixing, setIsMixing] = useState(false);

  // Step 3: Pouring
  const [isPoured, setIsPoured] = useState(false);

  // Step 4: Baking
  const [bakeTimer, setBakeTimer] = useState<number>(5);
  const [isBaking, setIsBaking] = useState(false);
  const [isBakedDone, setIsBakedDone] = useState(false);

  // Step 5: Decorating
  const [placedToppings, setPlacedToppings] = useState<SavedCakeTopping[]>([]);
  const [selectedTopping, setSelectedTopping] = useState<typeof TOPPINGS[0] | null>(null);

  // Step 6: Finished
  const [cakeTitle, setCakeTitle] = useState<string>('Bánh Kem Tự Tay Làm');
  const [earnedReward, setEarnedReward] = useState<string | null>(null);

  // Collection & Achievements
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
    'Chào mừng bạn đến với Tiệm Bánh Nhỏ! Cùng làm một chiếc bánh thật thơm nhé ✦'
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

  // Start game / reset
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

  // Random Recipe Picker
  const handleRandomRecipe = () => {
    const nextIdx = (PRESET_RECIPES.indexOf(currentRecipe) + 1) % PRESET_RECIPES.length;
    setCurrentRecipe(PRESET_RECIPES[nextIdx]);
    triggerSfx('swish');
    setYuiDialogue(`Đổi công thức thành: "${PRESET_RECIPES[nextIdx].name}" ✨`);
  };

  // Step 1: Add ingredient to bowl
  const handleAddIngredient = (id: string) => {
    if (bowlIngredients.includes(id)) return;
    const next = [...bowlIngredients, id];
    setBowlIngredients(next);
    triggerSfx('plop');

    // Check recipe compliance
    const isIngredientInRecipe = currentRecipe.required.includes(id);
    if (!isIngredientInRecipe) {
      setIncorrectFeedback(`Ủa, nguyên liệu này hơi lạ nha, nhưng bạn cứ thử sáng tạo xem sao! 🌾`);
    } else {
      setIncorrectFeedback(null);
    }

    setYuiDialogue(`Đã thêm ${INGREDIENTS.find((i) => i.id === id)?.name} vào tô! 🥣`);
  };

  // Step 2: Mixing
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

  // Step 3: Pour into Mold
  const handlePourToMold = () => {
    if (isPoured) return;
    setIsPoured(true);
    triggerSfx('plop');
    setYuiDialogue('Bột đã vào khuôn gọn gàng! Mau đem đi nướng thôi! 🔥');
  };

  // Step 4: Baking in Oven
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

  // Step 5: Place Topping on Cake
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

  // Finish cake
  const handleFinishCake = () => {
    setStep('step6');
    triggerSfx('sparkle');
    setYuiDialogue('Tadaa! Bánh của bạn đây! Trông ngon tuyệt! 🍰✦');

    // Give a random reward
    const rewards = [
      '✦ Sticker Bánh Đại Dương',
      '🐚 Ngọc Trai Trang Trí Tiệm Bánh',
      '🍰 Huy Chương Thợ Bánh Tí Hon',
      '✦ Hiệu Ứng Sóng Lấp Lánh Khai Trương',
    ];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    setEarnedReward(reward);

    // Check Badge Unlock
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

  // Save cake to collection
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#081B22]/70 backdrop-blur-md animate-fade-in font-sans">
      <div
        className={`relative w-full max-w-2xl rounded-3xl shadow-2xl border transition-all duration-300 overflow-hidden ${
          isNightMode
            ? 'bg-[#102F38] text-[#DDF5F6] border-[#65C5CE]/30'
            : 'bg-white/95 text-[#29464C] border-[#65C5CE]/40'
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#65C5CE]/25 dark:border-[#143943] bg-[#F2FBFC]/80 dark:bg-[#0D2730]/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 font-serif">
            <span className="text-2xl animate-bounce">🍰</span>
            <div>
              <h2 className="text-base font-extrabold bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] dark:from-[#57C8D1] dark:to-[#78DCE0] bg-clip-text text-transparent">
                Tiệm bánh nhỏ đại dương
              </h2>
              <p className="text-[11px] text-[#6B858A] dark:text-[#8FB6BC] font-medium">
                Góc làm bánh tự do & thư giãn
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Night mode toggle */}
            <button
              onClick={() => setIsNightMode(!isNightMode)}
              className="p-1.5 rounded-full bg-[#E5F5F7] dark:bg-[#0D2730] text-[#247C8C] dark:text-[#78DCE0] border border-[#65C5CE]/30 dark:border-[#143943] hover:scale-105 transition-transform cursor-pointer"
              title={isNightMode ? 'Chuyển sang Ban ngày' : 'Chuyển sang Ban đêm'}
            >
              {isNightMode ? <Moon className="w-4 h-4 text-[#78DCE0]" /> : <Sun className="w-4 h-4 text-[#247C8C]" />}
            </button>

            {/* Collection Button */}
            <button
              onClick={() => setStep(step === 'collection' ? 'opening' : 'collection')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-[#E5F5F7] dark:bg-[#0D2730] text-[#247C8C] dark:text-[#78DCE0] hover:bg-[#DDF1F3] transition-colors border border-[#65C5CE]/40 dark:border-[#143943] cursor-pointer font-serif"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bộ sưu tập ({savedCakes.length})</span>
            </button>

            {/* Close modal */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#6B858A] hover:text-[#29464C] dark:hover:text-white hover:bg-[#65C5CE]/10 dark:hover:bg-[#143943] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mascot Speech Bubble Header */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#E5F5F7]/70 dark:bg-[#0D2730]/70 border border-[#65C5CE]/30 dark:border-[#143943] shadow-xs">
            <div className="relative">
              <span className="text-3xl">🐚</span>
              <span className="absolute -bottom-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#65C5CE] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#3FAAB7]"></span>
              </span>
            </div>
            <div className="flex-1 font-serif">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3FAAB7] dark:text-[#78DCE0]">
                Hướng dẫn
              </span>
              <p className="text-xs sm:text-sm font-semibold text-[#29464C] dark:text-[#DDF5F6]">
                “{yuiDialogue}”
              </p>
            </div>
          </div>
        </div>

        {/* Modal Main Stage */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* ================= OPENING SCREEN ================= */}
          {step === 'opening' && (
            <div className="flex flex-col items-center text-center py-4 space-y-6">
              {/* Cozy Kitchen Scene Illustration */}
              <div
                className={`relative w-full max-w-md h-48 sm:h-56 rounded-3xl p-4 flex flex-col justify-end items-center overflow-hidden border shadow-inner transition-colors ${
                  isNightMode
                    ? 'bg-gradient-to-b from-[#081B22] via-[#0D2730] to-[#12343C] border-[#143943]'
                    : 'bg-gradient-to-b from-[#F2FBFC] via-[#E5F5F7] to-[#DDF1F3] border-[#65C5CE]/40'
                }`}
              >
                {/* Window background with Moon/Sun */}
                <div className="absolute top-3 right-6 text-2xl">
                  {isNightMode ? '🌙 ✦ ✧' : '☀️ ☁️'}
                </div>

                {/* Kitchen Table Items */}
                <div className="flex items-center justify-center gap-2 mb-2 z-10 text-2xl sm:text-3xl">
                  <span className="animate-bounce delay-75">🥣</span>
                  <span>🥚</span>
                  <span>🥛</span>
                  <span className="text-4xl animate-pulse">🍰</span>
                  <span>🍓</span>
                  <span>🍫</span>
                  <span>🧈</span>
                </div>

                {/* Kitchen Counter Table */}
                <div className="w-full h-12 rounded-t-xl bg-[#DDF1F3] dark:bg-[#143943] border-t-2 border-[#65C5CE]/60 dark:border-[#78DCE0]/30 flex items-center justify-center text-xs font-bold font-serif text-[#247C8C] dark:text-[#78DCE0]">
                  Bàn Làm Bánh Biển
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md font-serif">
                <button
                  onClick={handleStartGame}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] text-white font-extrabold text-sm shadow-lg shadow-[#247C8C]/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>🍰 Bắt đầu làm bánh</span>
                </button>

                <button
                  onClick={handleRandomRecipe}
                  className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-white dark:bg-[#0D2730] text-[#247C8C] dark:text-[#78DCE0] border border-[#65C5CE]/40 dark:border-[#143943] font-bold text-xs shadow-xs hover:bg-[#E5F5F7] dark:hover:bg-[#143943] transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-[#3FAAB7]" />
                  <span>🎲 Chọn công thức</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 1: CHỌN NGUYÊN LIỆU ================= */}
          {step === 'step1' && (
            <div className="space-y-5 font-serif">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#29464C] dark:text-[#DDF5F6]">
                    Bước 1 — Chọn Nguyên Liệu vào Tô 🥣
                  </h3>
                  <p className="text-xs text-[#6B858A] dark:text-[#8FB6BC]">
                    Chọn ít nhất 3–4 nguyên liệu từ bàn bếp bên dưới
                  </p>
                </div>
                <div className="text-xs font-bold text-[#247C8C] dark:text-[#78DCE0] bg-[#E5F5F7] dark:bg-[#0D2730] px-3 py-1 rounded-full border border-[#65C5CE]/40 dark:border-[#143943]">
                  Công thức: {currentRecipe.name}
                </div>
              </div>

              {/* Mixing Bowl Center Visual */}
              <div className="relative mx-auto w-40 h-32 rounded-b-full bg-[#E5F5F7] dark:bg-[#0D2730] border-4 border-[#65C5CE]/50 dark:border-[#143943] shadow-md flex flex-col items-center justify-center p-2">
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

              {/* Ingredient List Selection */}
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

              {/* Next Button */}
              {bowlIngredients.length >= 3 && (
                <button
                  onClick={() => setStep('step2')}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] text-white font-extrabold text-sm shadow-md transition-all animate-bounce cursor-pointer"
                >
                  Sẵn sàng sang Bước 2 — Trộn Bột! 🥄 →
                </button>
              )}
            </div>
          )}

          {/* ================= STEP 2: TRỘN BỘT ================= */}
          {step === 'step2' && (
            <div className="space-y-6 text-center py-2 font-serif">
              <div>
                <h3 className="text-sm font-extrabold text-[#29464C] dark:text-[#DDF5F6]">
                  Bước 2 — Trộn Bột 🥄
                </h3>
                <p className="text-xs text-[#6B858A] dark:text-[#8FB6BC]">
                  Nhấn "Trộn nào!" liên tục để làm quánh mịn tô bột!
                </p>
              </div>

              {/* Mixing Bowl Motion */}
              <div className="relative mx-auto w-44 h-36 rounded-b-full bg-[#E5F5F7] dark:bg-[#0D2730] border-4 border-[#65C5CE]/60 dark:border-[#143943] shadow-xl flex flex-col items-center justify-center p-3">
                <span
                  className={`text-5xl transition-transform duration-300 ${
                    mixProgress > 0 && mixProgress < 100 ? 'animate-spin' : ''
                  }`}
                >
                  🥣
                </span>
                <span className="text-2xl absolute top-3 right-8 animate-bounce">🥄</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md mx-auto space-y-1.5 font-sans">
                <div className="flex justify-between text-xs font-bold">
                  <span>Mức độ đều bột</span>
                  <span className="text-[#3FAAB7] dark:text-[#78DCE0] font-mono">{mixProgress}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#65C5CE] to-[#247C8C] transition-all duration-300"
                    style={{ width: `${mixProgress}%` }}
                  />
                </div>
              </div>

              {/* Mix Action Button */}
              {mixProgress < 100 ? (
                <button
                  onClick={handleMix}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] text-white font-extrabold text-sm shadow-lg hover:opacity-95 active:scale-90 transition-all cursor-pointer font-serif"
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
                    className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
                  >
                    Cho vào khuôn bánh 🧁 →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 3: CHO VÀO KHUÔN ================= */}
          {step === 'step3' && (
            <div className="space-y-6 text-center py-2 font-serif">
              <div>
                <h3 className="text-sm font-extrabold text-[#29464C] dark:text-[#DDF5F6]">
                  Bước 3 — Cho vào Khuôn Bánh 🧁
                </h3>
                <p className="text-xs text-[#6B858A] dark:text-[#8FB6BC]">
                  Nhấn vào tô bột để rót bột vào khuôn nhé!
                </p>
              </div>

              <div className="flex items-center justify-center gap-8 py-4">
                {/* Bowl */}
                <button
                  onClick={handlePourToMold}
                  disabled={isPoured}
                  className={`p-4 rounded-3xl bg-[#E5F5F7] dark:bg-[#0D2730] border-2 border-[#65C5CE]/50 dark:border-[#143943] flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    isPoured ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 shadow-md'
                  }`}
                >
                  <span className="text-5xl">🥣</span>
                  <span className="text-xs font-bold text-[#247C8C] dark:text-[#78DCE0]">
                    {isPoured ? 'Đã rót xong' : 'Nhấn để rót 🥣 →'}
                  </span>
                </button>

                <span className="text-2xl text-[#3FAAB7] font-extrabold">➔</span>

                {/* Cake Mold */}
                <div className="p-4 rounded-3xl bg-[#DDF1F3] dark:bg-[#102F38] border-2 border-[#65C5CE]/60 dark:border-[#78DCE0]/30 flex flex-col items-center gap-1">
                  <span className={`text-5xl ${isPoured ? 'animate-bounce' : ''}`}>
                    {isPoured ? '🧁' : '🥮'}
                  </span>
                  <span className="text-xs font-bold text-[#247C8C] dark:text-[#78DCE0]">
                    {isPoured ? 'Khuôn bột tràn đầy ✦' : 'Khuôn trống'}
                  </span>
                </div>
              </div>

              {isPoured && (
                <button
                  onClick={() => setStep('step4')}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] text-white font-extrabold text-sm shadow-md transition-all animate-bounce cursor-pointer font-serif"
                >
                  Đem đi nướng thôi! 🔥 →
                </button>
              )}
            </div>
          )}

          {/* ================= STEP 4: NƯỚNG BÁNH ================= */}
          {step === 'step4' && (
            <div className="space-y-6 text-center py-2 font-serif">
              <div>
                <h3 className="text-sm font-extrabold text-[#29464C] dark:text-[#DDF5F6]">
                  Bước 4 — Nướng Bánh Lò Ấm 🔥
                </h3>
                <p className="text-xs text-[#6B858A] dark:text-[#8FB6BC]">
                  Nướng bánh trong 5 giây cho bánh chín phồng thơm phức!
                </p>
              </div>

              {/* Oven Illustration */}
              <div className="relative mx-auto w-56 h-40 rounded-3xl bg-[#081B22] text-[#DDF5F6] border-4 border-[#143943] shadow-2xl flex flex-col items-center justify-center p-3 overflow-hidden font-sans">
                <div className="absolute top-2 right-3 text-[10px] font-mono text-amber-400 font-bold">
                  00:0{bakeTimer}
                </div>

                {/* Oven Window */}
                <div
                  className={`w-40 h-24 rounded-2xl border-2 border-[#65C5CE]/30 flex items-center justify-center transition-colors duration-500 ${
                    isBaking ? 'bg-gradient-to-r from-amber-600/60 to-[#247C8C]/60 animate-pulse' : 'bg-[#0D2730]'
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
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] text-white font-extrabold text-sm shadow-lg hover:opacity-95 active:scale-95 transition-all cursor-pointer font-serif"
                >
                  🔥 Nướng bánh ngay
                </button>
              )}

              {isBaking && (
                <div className="text-xs font-bold text-[#3FAAB7] dark:text-[#78DCE0] animate-pulse font-mono">
                  Đang nướng... Bánh đang phồng phồng phồng! 00:0{bakeTimer}
                </div>
              )}

              {isBakedDone && (
                <div className="space-y-3 font-serif">
                  <div className="text-sm font-extrabold text-[#247C8C] dark:text-[#78DCE0]">
                    “TING!” Bánh chín nở đều đẹp mắt! 🍰✦
                  </div>
                  <button
                    onClick={() => setStep('step5')}
                    className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
                  >
                    Trang trí bánh tự do 🍓 →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 5: TRANG TRÍ ================= */}
          {step === 'step5' && (
            <div className="space-y-5 font-serif">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#29464C] dark:text-[#DDF5F6]">
                    Bước 5 — Trang Trí Bánh 🍓
                  </h3>
                  <p className="text-xs text-[#6B858A] dark:text-[#8FB6BC]">
                    Chọn Topping bên dưới rồi chạm lên mặt bánh để đặt vào!
                  </p>
                </div>
                <button
                  onClick={() => setPlacedToppings([])}
                  className="text-xs font-bold text-[#6B858A] hover:text-red-500 underline cursor-pointer"
                >
                  Xóa hết topping
                </button>
              </div>

              {/* Interactive Cake Screen */}
              <div
                onClick={handleCakeClick}
                className="relative mx-auto w-64 h-56 rounded-3xl bg-gradient-to-b from-[#E5F5F7] to-[#DDF1F3] dark:from-[#0D2730] dark:to-[#102F38] border-4 border-[#65C5CE]/50 dark:border-[#78DCE0]/30 shadow-xl flex items-center justify-center cursor-pointer select-none overflow-hidden group"
              >
                {/* Cake Base */}
                <div className="relative w-44 h-36 rounded-2xl bg-white dark:bg-[#143943] border-2 border-[#65C5CE]/40 shadow-md flex flex-col items-center justify-center">
                  <div className="w-full h-12 bg-[#DDF1F3] dark:bg-[#0D2730] rounded-t-2xl border-b border-[#65C5CE]/30 flex items-center justify-center">
                    <span className="text-xs font-extrabold text-[#247C8C] dark:text-[#78DCE0]">
                      Lớp kem đại dương
                    </span>
                  </div>
                  <span className="text-4xl my-auto">🍰</span>
                </div>

                {/* Placed Toppings Render */}
                {placedToppings.map((tp) => (
                  <span
                    key={tp.id}
                    className="absolute text-2xl -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125 animate-pop pointer-events-none"
                    style={{ left: `${tp.x}%`, top: `${tp.y}%` }}
                  >
                    {tp.icon}
                  </span>
                ))}

                <div className="absolute bottom-2 text-[10px] font-extrabold text-[#247C8C] dark:text-[#78DCE0] bg-white/90 dark:bg-[#081B22]/90 px-2 py-0.5 rounded-full border border-[#65C5CE]/40">
                  Chạm lên bánh để gắn Topping ✦
                </div>
              </div>

              {/* Toppings Picker */}
              <div className="grid grid-cols-5 gap-2">
                {TOPPINGS.map((tp) => {
                  const isSelected = selectedTopping?.id === tp.id;
                  return (
                    <button
                      key={tp.id}
                      onClick={() => setSelectedTopping(tp)}
                      className={`p-2 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] text-white border-[#3FAAB7] scale-105 shadow-md'
                          : 'bg-white dark:bg-[#0D2730] border-[#65C5CE]/30 dark:border-[#143943] hover:scale-105'
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
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] text-white font-extrabold text-sm shadow-lg hover:opacity-95 active:scale-95 transition-all cursor-pointer font-serif"
              >
                Hoàn thành & Xem Thành Phẩm! 🍰✦
              </button>
            </div>
          )}

          {/* ================= STEP 6: KHOẢNH KHẮC THÀNH PHẨM ================= */}
          {step === 'step6' && (
            <div className="space-y-6 text-center py-2 font-serif">
              <div>
                <span className="text-xs font-extrabold text-[#3FAAB7] dark:text-[#78DCE0] tracking-wider uppercase">
                  ✦ · Khoảnh Khắc Thành Phẩm · ✦
                </span>
                <h3 className="text-lg font-extrabold text-[#29464C] dark:text-[#DDF5F6] mt-1">
                  “Tadaa! Bánh của bạn đây! 🍰”
                </h3>
              </div>

              {/* Finished Cake Card */}
              <div className="relative mx-auto w-full max-w-sm rounded-3xl bg-gradient-to-b from-white via-[#F2FBFC] to-[#E5F5F7] dark:from-[#0D2730] dark:to-[#102F38] border-2 border-[#65C5CE]/40 dark:border-[#78DCE0]/30 p-6 shadow-xl space-y-4">
                <div className="relative mx-auto w-48 h-40 rounded-2xl bg-[#E5F5F7] dark:bg-[#081B22] border border-[#65C5CE]/40 flex items-center justify-center overflow-hidden">
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

                {/* Cake Name Editor */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#6B858A] dark:text-[#8FB6BC] uppercase">Tên chiếc bánh</label>
                  <input
                    type="text"
                    value={cakeTitle}
                    onChange={(e) => setCakeTitle(e.target.value)}
                    className="w-full text-center font-extrabold text-base text-[#247C8C] dark:text-[#78DCE0] bg-white/80 dark:bg-[#081B22] border border-[#65C5CE]/40 dark:border-[#143943] rounded-xl py-1.5 focus:outline-none focus:ring-2 focus:ring-[#3FAAB7]"
                  />
                </div>

                {/* Reward Received */}
                {earnedReward && (
                  <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-xs font-bold text-amber-800 dark:text-amber-200 flex items-center justify-center gap-1.5 animate-fade-in">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Phần thưởng: {earnedReward}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm mx-auto">
                <button
                  onClick={handleSaveCake}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] text-white font-extrabold text-xs shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>📸 Lưu bánh vào Bộ sưu tập</span>
                </button>

                <button
                  onClick={handleStartGame}
                  className="w-full py-3.5 rounded-2xl bg-white dark:bg-[#0D2730] text-[#29464C] dark:text-[#DDF5F6] border border-[#65C5CE]/30 dark:border-[#143943] font-bold text-xs hover:bg-[#E5F5F7] dark:hover:bg-[#143943] transition-colors cursor-pointer"
                >
                  Làm chiếc bánh mới 🍰
                </button>
              </div>
            </div>
          )}

          {/* ================= BỘ SƯU TẬP BÁNH & THÀNH TÍCH ================= */}
          {step === 'collection' && (
            <div className="space-y-6 font-serif">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#29464C] dark:text-[#DDF5F6]">
                    🍰 Bộ Sưu Tập Bánh & Thành Tích
                  </h3>
                  <p className="text-xs text-[#6B858A] dark:text-[#8FB6BC]">
                    Những chiếc bánh dễ thương do chính tay bạn tạo nên
                  </p>
                </div>
                <button
                  onClick={() => setStep('opening')}
                  className="text-xs font-bold text-[#247C8C] dark:text-[#78DCE0] hover:underline cursor-pointer"
                >
                  ← Về Tiệm bánh
                </button>
              </div>

              {/* Badges System */}
              <div className="p-4 rounded-2xl bg-[#E5F5F7]/70 dark:bg-[#0D2730]/70 border border-[#65C5CE]/30 dark:border-[#143943] space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#29464C] dark:text-[#DDF5F6]">
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
                            ? 'bg-white dark:bg-[#102F38] border-[#65C5CE]/50 text-[#247C8C] dark:text-[#78DCE0]'
                            : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-50 grayscale'
                        }`}
                      >
                        <Award className="w-5 h-5 mb-1 text-amber-500" />
                        <span className="text-xs font-bold font-serif">{bg.title}</span>
                        <span className="text-[10px] text-[#6B858A] dark:text-[#8FB6BC] font-medium mt-0.5">
                          {bg.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Saved Cakes List */}
              <div className="space-y-3 font-serif">
                <h4 className="text-xs font-extrabold text-[#29464C] dark:text-[#DDF5F6] uppercase tracking-wider">
                  Những chiếc bánh đã làm ({savedCakes.length})
                </h4>

                {savedCakes.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-[#E5F5F7]/40 dark:bg-[#0D2730]/40 border border-dashed border-[#65C5CE]/40 dark:border-[#143943] space-y-2">
                    <span className="text-3xl">🧁</span>
                    <p className="text-xs font-semibold text-[#6B858A] dark:text-[#8FB6BC]">
                      Chưa có chiếc bánh nào được lưu. Hãy mở lò nướng và tự tay làm một chiếc bánh ngay nhé!
                    </p>
                    <button
                      onClick={handleStartGame}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] text-white font-bold text-xs shadow-sm hover:from-[#65C5CE] hover:to-[#3FAAB7] transition-colors cursor-pointer"
                    >
                      Bắt đầu làm bánh
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedCakes.map((cake) => (
                      <div
                        key={cake.id}
                        className="p-3.5 rounded-2xl bg-white dark:bg-[#0D2730] border border-[#65C5CE]/30 dark:border-[#143943] shadow-xs flex items-start gap-3"
                      >
                        <div className="relative w-16 h-16 rounded-xl bg-[#E5F5F7] dark:bg-[#102F38] flex items-center justify-center shrink-0 text-2xl border border-[#65C5CE]/30">
                          🍰
                          {cake.toppings.slice(0, 3).map((tp, idx) => (
                            <span key={idx} className="absolute text-xs" style={{ left: `${20 + idx * 25}%`, top: '20%' }}>
                              {tp.icon}
                            </span>
                          ))}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-extrabold text-[#247C8C] dark:text-[#78DCE0] truncate font-serif">
                            {cake.name}
                          </h5>
                          <p className="text-[10px] text-[#6B858A] dark:text-[#8FB6BC] font-medium">
                            Ngày làm: {cake.createdAt}
                          </p>
                          <p className="text-[10px] text-[#6B858A] dark:text-[#8FB6BC] font-medium truncate mt-0.5">
                            Công thức: {cake.recipeName}
                          </p>
                          {cake.rewardGiven && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#E5F5F7] dark:bg-[#143943] text-[#247C8C] dark:text-[#78DCE0] text-[9px] font-bold">
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

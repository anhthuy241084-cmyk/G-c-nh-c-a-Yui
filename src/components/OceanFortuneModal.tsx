import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, RefreshCw, Share2, Check, BookOpen } from 'lucide-react';
import { Character } from '../types';
import { playPopSfx, triggerSfx } from '../utils/sfx';

interface OceanFortuneModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  onSelectCharacter: (char: Character) => void;
  isSfxOn?: boolean;
  sfxVolume?: number;
  onToast: (msg: string) => void;
}

interface FortuneCard {
  hanzi: string;
  pinyinViet: string;
  translation: string;
  quote: string;
  theme: string;
  blessing: string;
  luckyColor: string;
  luckyColorHex: string;
  winterElement: string;
  omen: string;
}

const FORTUNE_LIST: FortuneCard[] = [
  {
    hanzi: '晚来天欲雪，能饮一杯无？',
    pinyinViet: 'Vãn lai thiên dục tuyết, năng ẩm nhất bôi vô?',
    translation: 'Chiều muộn trời sắp đổ tuyết, có thể cùng uống một chén trà ấm không?',
    quote: 'Giữa tiết trời se lạnh, một lời hỏi thăm dịu dàng hay tách trà nóng sẻ chia sẽ làm ấm cả một mùa đông dài.',
    theme: 'Trà Ấm Đêm Tuyết · Tri Âm',
    blessing: 'Tâm hồn cậu hôm nay sẽ được sưởi ấm bởi những kết nối chân thành và một câu chuyện thật dịu êm.',
    luckyColor: 'Trắng Tuyết Sương (Frost White)',
    luckyColorHex: '#F7FAFD',
    winterElement: 'Chén Trà Tuyết Cổ Điển',
    omen: 'Thượng Cát (Ấm Áp An Yên)',
  },
  {
    hanzi: '孤舟蓑笠翁，独钓寒江雪。',
    pinyinViet: 'Cô chu thoa lạp ông, độc điếu hàn giang tuyết.',
    translation: 'Thuyền côi ông lão áo tơi nón lá, một mình câu cá giữa dòng sông tuyết lạnh.',
    quote: 'Sự tĩnh lặng bên trong giúp tâm trí ta vững vàng như mặt hồ đóng băng trong veo, nhìn thấu mọi điều nhẹ nhõm.',
    theme: 'Tuyết Giang Tĩnh Lặng · Tịnh Tâm',
    blessing: 'Mọi vướng bận đều lắng xuống nhường chỗ cho sự sáng suốt, giúp cậu tìm lại nhịp điệu thư thái của riêng mình.',
    luckyColor: 'Lam Băng Phấn (Powder Blue)',
    luckyColorHex: '#91A9BC',
    winterElement: 'Pha Lê Sông Băng Trong',
    omen: 'Cát Tường (Tự Tại Thư Thái)',
  },
  {
    hanzi: '醉后不知天在水，满船清梦压星河。',
    pinyinViet: 'Túy hậu bất tri thiên tại thủy, Mãn thuyền thanh mộng áp tinh hà.',
    translation: 'Say rồi chẳng biết trời soi đáy nước, Chở đầy một thuyền mộng đẹp ngập dải ngân hà.',
    quote: 'Giữa thực và mộng, những khát khao lãng mạn nhất sẽ thắp sáng tâm hồn cậu tựa ngàn ánh sao đêm đông.',
    theme: 'Mộng Đẹp Tinh Hà · Lãng Mạn',
    blessing: 'Một ngày đong đầy cảm xúc ngọt ngào, những giấc mơ ấp ủ bấy lâu sẽ tìm được sự đồng điệu từ một nhân vật tri âm.',
    luckyColor: 'Xanh Bầu Trời Đông (Winter Mist)',
    luckyColorHex: '#D5E4EF',
    winterElement: 'Hộp Nhạc Pha Lê Tinh Tú',
    omen: 'Đại Cát (Duyên Tình & Ý Thơ)',
  },
  {
    hanzi: '墙角数枝梅，凌寒独自开。',
    pinyinViet: 'Tường giác sổ chi mai, lăng hàn độc tự khai.',
    translation: 'Góc tường mấy cành mai trắng, vượt gió rét một mình nở hoa.',
    quote: 'Vẻ đẹp rạng ngời nhất thường nảy mầm từ sự kiên nhẫn lặng thầm qua những ngày đông lạnh giá.',
    theme: 'Hương Mai Trong Tuyết · Kiên Định',
    blessing: 'Những nỗ lực âm thầm của cậu sắp đến ngày đơm hoa thơm ngát, mang theo niềm vui bất ngờ.',
    luckyColor: 'Hồng Phấn Mùa Đông (Winter Rose)',
    luckyColorHex: '#F3DDE1',
    winterElement: 'Cành Mai Tuyết Lưu Hương',
    omen: 'Bình An Cát Tường',
  },
  {
    hanzi: '忽如一夜春风来，千树万树梨花开。',
    pinyinViet: 'Hốt như nhất dạ xuân phong lai, thiên thụ vạn thụ lê hoa khai.',
    translation: 'Chợt như một đêm gió xuân thổi tới, ngàn cây vạn cây hoa lê trắng nở bừng.',
    quote: 'Phép màu thường gõ cửa vào lúc bất ngờ nhất, biến cả khung trời xám bạc thành bức tranh tuyết trắng diệu kỳ.',
    theme: 'Hoa Lê Tuyết Trắng · Khởi Sắc',
    blessing: 'Tin vui và nguồn cảm hứng mới sẽ bất chợt ùa về, khiến cả ngày của cậu rực rỡ và tràn đầy sức sống.',
    luckyColor: 'Tím Oải Hương Đông (Lavender Frost)',
    luckyColorHex: '#E5E1F2',
    winterElement: 'Quả Cầu Tuyết Hoa Lê',
    omen: 'Hỷ Lạc (Cảm Hứng Bừng Sáng)',
  },
  {
    hanzi: '梅须逊雪三分白，雪却输梅一段香。',
    pinyinViet: 'Mai tu tốn tuyết tam phần bạch, tuyết khước thâu mai nhất đoạn hương.',
    translation: 'Hoa mai nhường tuyết ba phần trắng, tuyết lại thua mai một đoạn hương.',
    quote: 'Mỗi cá thể đều mang một vẻ đẹp độc bản không thể thay thế; trân trọng nét riêng của mình chính là hạnh phúc.',
    theme: 'Mai Tuyết Giao Hòa · Độc Bản',
    blessing: 'Hôm nay cậu sẽ nhận ra giá trị dịu dàng của bản thân và gặp được những điều thật hợp gu trong Hộp Ký Ức.',
    luckyColor: 'Xanh Khói Đá (Slate Mist)',
    luckyColorHex: '#526B80',
    winterElement: 'Kẹp Sách Băng Tuyết Cổ',
    omen: 'Vạn Sự Hanh Thông',
  },
  {
    hanzi: '柴门闻犬吠，风雪夜归人。',
    pinyinViet: 'Sài môn văn khuyển phệ, phong tuyết dạ quy nhân.',
    translation: 'Cửa sài nghe tiếng chó sủa, đêm gió tuyết đón người trở về.',
    quote: 'Dù đi qua bao nhiêu con đường xa xôi, luôn có một ngọn đèn ấm sáng đợi cậu quay về nghỉ ngơi.',
    theme: 'Ngọn Đèn Đêm Tuyết · Sum Vầy',
    blessing: 'Hôm nay cậu sẽ tìm thấy một câu chuyện chạm tới đáy tim, hoặc một góc nhỏ bình yên để gửi gắm tâm tình.',
    luckyColor: 'Vàng Nến Ấm (Warm Candle)',
    luckyColorHex: '#FDF3D7',
    winterElement: 'Đèn Lồng Tuyết Ấm Áp',
    omen: 'Phúc Duyên Giao Hòa',
  },
  {
    hanzi: '水光潋滟晴方好，山色空蒙雨亦奇。',
    pinyinViet: 'Thủy quang liễm diễm tình phương hảo, Sơn sắc không mông vũ diệc kỳ.',
    translation: 'Nắng ấm mặt hồ ngời ánh sáng, Sương giăng núi thẫm vẻ huyền kỳ.',
    quote: 'Ngày nắng hay ngày tuyết rơi, niềm vui hay nốt trầm, mỗi khoảnh khắc của cuộc đời đều mang một nét đẹp thi vị riêng.',
    theme: 'Sương Mờ Đỉnh Tuyết · Thuận Tiết',
    blessing: 'Tâm thái thư thái, đón nhận mọi sự việc bằng cái nhìn dịu dàng và yêu đời, vạn sự đều hóa ngọt lành.',
    luckyColor: 'Trắng Pha Lê (Crystal White)',
    luckyColorHex: '#E8F1F8',
    winterElement: 'Giọt Sương Băng Pha Lê',
    omen: 'Thanh Thản Vô Vi',
  },
];

export const OceanFortuneModal: React.FC<OceanFortuneModalProps> = ({
  isOpen,
  onClose,
  characters,
  onSelectCharacter,
  isSfxOn = true,
  sfxVolume = 0.5,
  onToast,
}) => {
  const [selectedCrystalIndex, setSelectedCrystalIndex] = useState<number | null>(null);
  const [fortune, setFortune] = useState<FortuneCard | null>(null);
  const [matchedCharacter, setMatchedCharacter] = useState<Character | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [copied, setCopied] = useState(false);

  const crystals = [
    { name: 'Bông Tuyết Ánh Trăng', icon: '❄️', desc: 'An yên & Tĩnh tại' },
    { name: 'Pha Lê Sương Sớm', icon: '💎', desc: 'Khơi mở tuệ giác' },
    { name: 'Ánh Sao Đêm Đông', icon: '✦', desc: 'Phước lành & Hân hoan' },
  ];

  const handlePickCrystal = (index: number) => {
    if (isOpening) return;
    setSelectedCrystalIndex(index);
    setIsOpening(true);

    if (isSfxOn) {
      triggerSfx('chime', sfxVolume);
      playPopSfx(sfxVolume);
    }

    setTimeout(() => {
      const randomFortune = FORTUNE_LIST[Math.floor(Math.random() * FORTUNE_LIST.length)];
      setFortune(randomFortune);

      if (characters.length > 0) {
        const randomChar = characters[Math.floor(Math.random() * characters.length)];
        setMatchedCharacter(randomChar);
      }

      setIsOpening(false);
    }, 850);
  };

  const handleReset = () => {
    setSelectedCrystalIndex(null);
    setFortune(null);
    setMatchedCharacter(null);
    setIsOpening(false);
    if (isSfxOn) playPopSfx(sfxVolume);
  };

  const handleShare = async () => {
    if (!fortune) return;
    const shareText = `❄️ QUẺ TUYẾT MÙA ĐÔNG HÔM NAY:\n« ${fortune.hanzi} »\n(${fortune.pinyinViet})\n*Dịch thơ: ${fortune.translation}*\n✦ Lời bình: ${fortune.quote}\n✦ Quẻ: ${fortune.omen} · ${fortune.theme}\n✦ Màu may mắn: ${fortune.luckyColor}\n✦ Ghé Hộp Ký Ức Mùa Đông để gieo quẻ tuyết nhé! ✦`;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      onToast('✨ Đã sao chép câu thơ & quẻ lành vào bộ nhớ tạm!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onToast('⚠️ Không thể sao chép lời nhắn');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#172536]/65 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 15 }}
            className="relative w-full max-w-lg bg-[#F7FAFD] dark:bg-[#172536] backdrop-blur-2xl rounded-3xl shadow-2xl border border-[#DCE7EF] dark:border-[#354A60] overflow-hidden flex flex-col font-serif text-[#43576B] dark:text-[#E5EDF5]"
          >
            {/* Ambient Background Light Blobs */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#D5E4EF]/55 dark:bg-[#91A9BC]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#E8F1F8]/60 dark:bg-[#526B80]/15 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="p-5 border-b border-[#DCE7EF] dark:border-[#354A60] bg-[#E8F1F8]/90 dark:bg-[#202F42]/90 flex items-center justify-between shrink-0 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#91A9BC] to-[#526B80] text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-[#526B80] dark:text-[#A9BDCE] uppercase">
                    <span>✦ QUẺ TUYẾT MÙA ĐÔNG ✦</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#172536] dark:text-[#E5EDF5] leading-tight">
                    Quẻ Tuyết May Mắn & Thông Điệp Đông
                  </h3>
                </div>
              </div>

              <button
                onClick={() => {
                  if (isSfxOn) playPopSfx(sfxVolume);
                  onClose();
                }}
                className="w-8 h-8 rounded-full bg-[#F7FAFD] dark:bg-[#354A60]/60 hover:bg-[#D5E4EF] dark:hover:bg-[#354A60] text-[#43576B] dark:text-[#E5EDF5] flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 overflow-y-auto max-h-[75vh] custom-scrollbar relative z-10">
              {!fortune ? (
                /* Step 1: Pick Crystal */
                <div className="text-center space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-[#172536] dark:text-[#E5EDF5] leading-relaxed">
                      Hãy nhắm mắt trong giây lát, lắng nghe tiếng tuyết rơi êm đềm và chọn một tinh thể hữu duyên với bạn:
                    </p>
                    <p className="text-[11px] text-[#526B80] dark:text-[#A9BDCE]">
                      Mỗi bông tuyết cất giữ một câu thơ tuyệt mỹ và một nhân vật đồng điệu
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    {crystals.map((crystal, idx) => {
                      const isChosen = selectedCrystalIndex === idx;
                      return (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.04, y: -4 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handlePickCrystal(idx)}
                          disabled={isOpening}
                          className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-between text-center relative group cursor-pointer ${
                            isChosen
                              ? 'border-[#526B80] bg-[#E8F1F8] dark:bg-[#202F42] shadow-md'
                              : 'border-[#DCE7EF] dark:border-[#354A60] bg-white dark:bg-[#202F42]/70 hover:border-[#91A9BC] hover:bg-[#E8F1F8]/60 dark:hover:bg-[#202F42]'
                          }`}
                        >
                          <motion.div
                            animate={isChosen && isOpening ? { rotate: [0, -12, 12, -6, 6, 0], scale: [1, 1.25, 1] } : {}}
                            transition={{ duration: 0.8 }}
                            className="text-4xl my-2 filter drop-shadow-xs select-none group-hover:scale-110 transition-transform"
                          >
                            {crystal.icon}
                          </motion.div>

                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-[#172536] dark:text-[#E5EDF5]">
                              {crystal.name}
                            </h4>
                            <p className="text-[10px] text-[#526B80] dark:text-[#A9BDCE] font-sans">
                              {crystal.desc}
                            </p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {isOpening && (
                    <div className="flex items-center justify-center gap-2 text-xs text-[#526B80] dark:text-[#A9BDCE] animate-pulse pt-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Đang mở hộp ký ức và lắng nghe lời nhắn của mùa đông...</span>
                    </div>
                  )}
                </div>
              ) : (
                /* Step 2: Fortune Result Revealed */
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  {/* Fortune Card with Classical Calligraphy Border */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-white via-[#F7FAFD] to-[#E8F1F8] dark:from-[#202F42] dark:via-[#1B2A3B] dark:to-[#172536] border border-[#DCE7EF] dark:border-[#354A60] shadow-sm space-y-4 text-center">
                    {/* Omen & Theme Tag */}
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#D5E4EF]/70 dark:bg-[#354A60]/70 text-[#172536] dark:text-[#E5EDF5] text-xs font-bold border border-[#91A9BC]/40">
                        <span>✦ {fortune.omen} ✦</span>
                      </span>
                      <span className="text-xs font-bold text-[#172536] dark:text-[#E5EDF5]">
                        {fortune.theme}
                      </span>
                    </div>

                    {/* Classical Poem Presentation Box */}
                    <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#172536]/80 border border-[#DCE7EF] dark:border-[#354A60] space-y-2.5 text-left">
                      <div className="text-center font-serif text-base sm:text-lg font-bold tracking-widest text-[#172536] dark:text-[#E5EDF5] py-1 border-b border-[#DCE7EF] dark:border-[#354A60]">
                        « {fortune.hanzi} »
                      </div>

                      <div className="text-xs text-[#526B80] dark:text-[#A9BDCE] font-semibold italic text-center">
                        ({fortune.pinyinViet})
                      </div>

                      <div className="text-xs sm:text-sm text-[#172536] dark:text-[#E5EDF5] font-medium leading-relaxed bg-[#E8F1F8]/70 dark:bg-[#202F42]/80 p-2.5 rounded-xl border-l-2 border-[#526B80] dark:border-[#91A9BC]">
                        <span className="font-bold text-[#526B80] dark:text-[#A9BDCE]">Dịch thơ: </span>
                        <span>{fortune.translation}</span>
                      </div>
                    </div>

                    {/* Philosophical Commentary */}
                    <div className="text-xs sm:text-sm italic text-[#43576B] dark:text-[#E5EDF5]/90 leading-relaxed px-1">
                      “{fortune.quote}”
                    </div>

                    {/* Blessing */}
                    <div className="pt-2 border-t border-[#DCE7EF] dark:border-[#354A60] text-xs text-[#526B80] dark:text-[#A9BDCE] leading-relaxed">
                      💡 <strong>Vận trình:</strong> {fortune.blessing}
                    </div>

                    {/* Lucky items row */}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-left">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#202F42]/70 border border-[#DCE7EF] dark:border-[#354A60]">
                        <span className="text-[10px] uppercase text-[#526B80] dark:text-[#A9BDCE] block font-sans">
                          Sắc màu may mắn
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="w-3 h-3 rounded-full border border-black/15 shrink-0"
                            style={{ backgroundColor: fortune.luckyColorHex }}
                          />
                          <span className="text-xs font-bold text-[#172536] dark:text-[#E5EDF5] truncate">
                            {fortune.luckyColor}
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#202F42]/70 border border-[#DCE7EF] dark:border-[#354A60]">
                        <span className="text-[10px] uppercase text-[#526B80] dark:text-[#A9BDCE] block font-sans">
                          Kỷ vật mùa đông
                        </span>
                        <span className="text-xs font-bold text-[#172536] dark:text-[#E5EDF5] truncate block mt-0.5">
                          {fortune.winterElement}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Character Suggestion */}
                  {matchedCharacter && (
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#354A60] flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={matchedCharacter.avatar}
                          alt={matchedCharacter.name}
                          className="w-11 h-11 rounded-xl object-cover border border-[#DCE7EF] dark:border-[#354A60] shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-[#526B80] dark:text-[#A9BDCE] block uppercase tracking-wider">
                            Nhân vật đồng điệu:
                          </span>
                          <h4 className="text-xs font-bold text-[#172536] dark:text-[#E5EDF5] truncate">
                            {matchedCharacter.name}
                          </h4>
                          <p className="text-[10px] text-[#43576B] dark:text-[#A9BDCE] truncate font-sans">
                            {matchedCharacter.title}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onSelectCharacter(matchedCharacter);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#91A9BC] to-[#526B80] hover:brightness-105 text-white text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs cursor-pointer transition-transform active:scale-95"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Xem</span>
                      </button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 rounded-2xl border border-[#DCE7EF] dark:border-[#354A60] hover:bg-[#E8F1F8] dark:hover:bg-[#202F42] text-[#43576B] dark:text-[#E5EDF5] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Rút quẻ tuyết khác</span>
                    </button>

                    <button
                      onClick={handleShare}
                      className="px-5 py-2 rounded-2xl bg-gradient-to-r from-[#91A9BC] to-[#526B80] hover:brightness-105 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-transform active:scale-95"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Đã sao chép thơ' : 'Chia sẻ quẻ thơ'}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

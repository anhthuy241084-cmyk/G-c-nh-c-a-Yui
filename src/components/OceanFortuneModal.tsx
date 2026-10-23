import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, RefreshCw, Compass, Heart, Share2, Check, BookOpen, Feather, ScrollText } from 'lucide-react';
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
  seaElement: string;
  omen: string;
}

const FORTUNE_LIST: FortuneCard[] = [
  {
    hanzi: '沧海月明珠有泪，蓝田日暖玉生烟。',
    pinyinViet: 'Thương hải nguyệt minh châu hữu lệ, Lam điền nhật noãn ngọc sinh yên.',
    translation: 'Biển biếc trăng trong ngời giọt ngọc, Lam điền nắng ấm khói trầm bay.',
    quote: 'Mỗi giọt lệ hay nỗi niềm trôi qua trên đại dương đời người đều sẽ hóa thành viên ngọc quý sáng ngời, sưởi ấm những ngày mai.',
    theme: 'Ngọc Sáng Trùng Dương · Tịnh Tâm',
    blessing: 'Tâm hồn cậu hôm nay sẽ lắng đọng như mặt nước phẳng lặng, đón nhận những món quà dịu dàng và duyên lành bất ngờ.',
    luckyColor: 'Ngọc Trai Sáng (Pearl Sheen)',
    luckyColorHex: '#FFFDFC',
    seaElement: 'Dạ Minh Châu Biển Đông',
    omen: 'Thượng Cát (Đại Cát Đại Lợi)',
  },
  {
    hanzi: '落霞与孤鹜齐飞，秋水共长天一色。',
    pinyinViet: 'Lạc hà dữ cô vụ tề phi, Thu thủy cộng trường thiên nhất sắc.',
    translation: 'Ráng chiều cùng cánh cò lẻ loi bay lượn, Làn nước mùa thu cùng bầu trời xa tắp một màu.',
    quote: 'Khi tâm hồn rộng mở tựa chân trời, muôn trùng cảnh sắc nhân gian đều trở thành nguồn cảm hứng vô tận.',
    theme: 'Ráng Chiều Thu Thủy · Khoáng Đạt',
    blessing: 'Mọi vướng bận trong lòng đều tan biến theo làn gió mát, nhường chỗ cho niềm an yên tự tại và tầm nhìn khoáng đạt.',
    luckyColor: 'Hồng San Hô & Vàng Nắng (Sunset Coral)',
    luckyColorHex: '#F3DDE1',
    seaElement: 'Vỏ Ốc Hát Khúc Hoàng Hôn',
    omen: 'Cát Tường (Thư Thái Tự Tại)',
  },
  {
    hanzi: '醉后不知天在水，满船清梦压星河。',
    pinyinViet: 'Túy hậu bất tri thiên tại thủy, Mãn thuyền thanh mộng áp tinh hà.',
    translation: 'Say rồi chẳng biết trời dìm đáy nước, Chở đầy một thuyền mộng đẹp đè nặng dải ngân hà.',
    quote: 'Giữa thực và mộng, những khát khao lãng mạn nhất sẽ thắp sáng tâm hồn cậu tựa ngàn vì sao rơi trên mặt biển.',
    theme: 'Thuyền Mộng Tinh Hà · Lãng Mạn',
    blessing: 'Một ngày đong đầy cảm xúc ngọt ngào, những giấc mơ ấp ủ bấy lâu sẽ tìm được sự đồng điệu từ một người bạn tri âm.',
    luckyColor: 'Lam Sương Mộng Ảo (Mist Baby Blue)',
    luckyColorHex: '#CFE8F5',
    seaElement: 'Thủy Tinh Lân Tinh Dạ Quang',
    omen: 'Đại Cát (Duyên Tình & Ý Thơ)',
  },
  {
    hanzi: '清风徐来，水波不兴。',
    pinyinViet: 'Thanh phong từ lai, thủy ba bất hưng.',
    translation: 'Gió mát nhẹ nhàng thổi tới, Mặt nước phẳng lặng chẳng gợn sóng.',
    quote: 'Sức mạnh lớn nhất của nước không phải ở lúc cuộn trào sóng dữ, mà là sự tĩnh lặng bao dung ôm trọn cả đất trời.',
    theme: 'Gió Mát Sóng Êm · Bình Yên',
    blessing: 'Không gian xung quanh sẽ ngập tràn sự hài hòa, công việc trôi chảy êm đềm như thuyền xuôi theo con nước biếc.',
    luckyColor: 'Xanh Nước Biển Nhạt (Aqua Pastel)',
    luckyColorHex: '#D2F0F0',
    seaElement: 'Đá Bọt Biển Thanh Lọc',
    omen: 'Bình An Cát Tường',
  },
  {
    hanzi: '愿随流水寄相思，莫道沧桑失故知。',
    pinyinViet: 'Nguyện tùy lưu thủy ký tương tư, mạc đạo thương tang thất cố tri.',
    translation: 'Nguyện gửi tương tư theo dòng nước, Đừng than dâu bể lạc tri âm.',
    quote: 'Khoảng cách không gian và thời gian chẳng thể ngăn cách những trái tim cùng chung nhịp đập chân thành.',
    theme: 'Dòng Chảy Tương Tư · Gắn Kết',
    blessing: 'Những lời nhắn gửi chân thành của cậu sẽ được đón nhận bằng tất cả sự trân trọng và hồi đáp ấm áp.',
    luckyColor: 'Tím Sương Khói (Lavender Mist)',
    luckyColorHex: '#E5E1F2',
    seaElement: 'Chai Ước Nguyện Xuyên Đại Dương',
    omen: 'Hỷ Lạc (Kết Nối Tri Âm)',
  },
  {
    hanzi: '长风破浪会有时，直挂云帆济沧海。',
    pinyinViet: 'Trường phong phá lãng hội hữu thời, Trực quái vân phàm tế thương hải.',
    translation: 'Gió lớn cưỡi sóng ắt có lúc, Dong thẳng buồm mây vượt biển khơi.',
    quote: 'Mọi thử thách chỉ là khúc dạo đầu tôi luyện ý chí; niềm hy vọng luôn soi đường cho người không ngừng tiến bước.',
    theme: 'Dong Buồm Vượt Biển · Khát Vọng',
    blessing: 'Cậu sẽ có được nguồn cảm hứng dạt dào và sức mạnh kiên định để hiện thực hóa những dự định ấp ủ.',
    luckyColor: 'Xanh Ngọc Lục Biển (Turquoise Accent)',
    luckyColorHex: '#71BFC6',
    seaElement: 'La Bàn Hải Trình Cổ',
    omen: 'Vạn Sự Hanh Thông',
  },
  {
    hanzi: '海内存知己，天涯若比邻。',
    pinyinViet: 'Hải nội tồn tri kỷ, Thiên nhai nhược bỉ lân.',
    translation: 'Bốn biển còn tri kỷ, Chân trời hóa láng giềng.',
    quote: 'Chỉ cần trong tim có nhau, dù ở góc biển chân trời xa xôi, cảm giác gần gũi vẫn vẹn nguyên như thở ban đầu.',
    theme: 'Bốn Biển Đồng Tri · Duyên Lành',
    blessing: 'Hôm nay cậu sẽ tìm thấy một câu chuyện chạm tới đáy tim, hoặc gặp gỡ một nhân vật khiến cậu mỉm cười xao xuyến.',
    luckyColor: 'Xanh Bọt Sóng (Seafoam Mint)',
    luckyColorHex: '#C8EAE3',
    seaElement: 'Vỏ Sò Điệp Ngân Vang',
    omen: 'Phúc Duyên Giao Hòa',
  },
  {
    hanzi: '水光潋滟晴方好，山色空蒙雨亦奇。',
    pinyinViet: 'Thủy quang liễm diễm tình phương hảo, Sơn sắc không mông vũ diệc kỳ.',
    translation: 'Nắng ấm nước trong ngời ánh sáng, Mưa giăng núi thẫm vẻ huyền kỳ.',
    quote: 'Ngày nắng hay ngày mưa, niềm vui hay nỗi buồn, mỗi trạng thái của cuộc đời đều mang một nét đẹp thi vị riêng biệt.',
    theme: 'Nắng Ấm Mưa Giăng · Thuận Tiết',
    blessing: 'Tâm thái thư thái, đón nhận mọi sự việc bằng cái nhìn dung dị và yêu đời, vạn sự đều hóa ngọt lành.',
    luckyColor: 'Trắng Băng Thanh (Crystal White)',
    luckyColorHex: '#F6FCFC',
    seaElement: 'Pha Lê Giọt Sương Biển',
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
  const [selectedShellIndex, setSelectedShellIndex] = useState<number | null>(null);
  const [fortune, setFortune] = useState<FortuneCard | null>(null);
  const [matchedCharacter, setMatchedCharacter] = useState<Character | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [copied, setCopied] = useState(false);

  const shells = [
    { name: 'Vỏ Sò Ánh Trăng', icon: '🐚', tone: 'from-[#CFE8F5] to-[#8CCFD3]', desc: 'An yên & Tĩnh tại' },
    { name: 'Ngọc Trai Biển Sớm', icon: '🦪', tone: 'from-[#FFFDFC] to-[#D2F0F0]', desc: 'Khơi mở tuệ giác' },
    { name: 'Hải Lưu May Mắn', icon: '🌊', tone: 'from-[#C8EAE3] to-[#71BFC6]', desc: 'Phước lành & Hân hoan' },
  ];

  const handlePickShell = (index: number) => {
    if (isOpening) return;
    setSelectedShellIndex(index);
    setIsOpening(true);

    if (isSfxOn) {
      triggerSfx('chime', sfxVolume);
      playPopSfx(sfxVolume);
    }

    setTimeout(() => {
      // Pick random fortune
      const randomFortune = FORTUNE_LIST[Math.floor(Math.random() * FORTUNE_LIST.length)];
      setFortune(randomFortune);

      // Match a random character if available
      if (characters.length > 0) {
        const randomChar = characters[Math.floor(Math.random() * characters.length)];
        setMatchedCharacter(randomChar);
      }

      setIsOpening(false);
    }, 850);
  };

  const handleReset = () => {
    setSelectedShellIndex(null);
    setFortune(null);
    setMatchedCharacter(null);
    setIsOpening(false);
    if (isSfxOn) playPopSfx(sfxVolume);
  };

  const handleShare = async () => {
    if (!fortune) return;
    const shareText = `🐚 LỜI TIÊN TRI BIỂN CẢ HÔM NAY:\n« ${fortune.hanzi} »\n(${fortune.pinyinViet})\n*Dịch thơ: ${fortune.translation}*\n✦ Lời bình: ${fortune.quote}\n✦ Quẻ: ${fortune.omen} · ${fortune.theme}\n✦ Màu may mắn: ${fortune.luckyColor}\n✦ Ghé Góc Nhỏ Của Yui để gieo quẻ biển nhé! ✦`;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      onToast('✨ Đã sao chép câu thơ & quẻ lành vào bộ nhớ tạm!');
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      onToast('⚠️ Không thể sao chép lời nhắn');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#09222E]/60 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 15 }}
            className="relative w-full max-w-lg bg-[#FFFDFC] dark:bg-[#0B2530] backdrop-blur-2xl rounded-3xl shadow-2xl border border-[#BFE7E8] dark:border-[#38CAD6]/30 overflow-hidden flex flex-col font-serif text-[#49666A] dark:text-[#E9F8F8]"
          >
            {/* Ambient Background Light Blobs */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#D2F0F0]/50 dark:bg-[#38CAD6]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F3DDE1]/40 dark:bg-[#E5E1F2]/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="p-5 border-b border-[#BFE7E8]/60 dark:border-white/10 bg-[#F5FCFC]/90 dark:bg-black/20 flex items-center justify-between shrink-0 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#CFE8F5] to-[#8CCFD3] dark:from-[#38CAD6] dark:to-[#1B6E7D] text-[#2D494C] dark:text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-[#71BFC6] uppercase">
                    <span>✦ QUẺ SÒ TIÊN TRI ✦</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#2D494C] dark:text-white leading-tight">
                    Vỏ Sò May Mắn & Thông Điệp Biển
                  </h3>
                </div>
              </div>

              <button
                onClick={() => {
                  if (isSfxOn) playPopSfx(sfxVolume);
                  onClose();
                }}
                className="w-8 h-8 rounded-full bg-[#E9F8F8] dark:bg-white/10 hover:bg-[#D2F0F0] dark:hover:bg-white/20 text-[#49666A] dark:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 overflow-y-auto max-h-[75vh] custom-scrollbar relative z-10">
              {!fortune ? (
                /* Step 1: Pick Shell */
                <div className="text-center space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-[#2D494C] dark:text-white leading-relaxed">
                      Hãy nhắm mắt lại trong giây lát, lắng nghe tiếng sóng vỗ và chọn chiếc vỏ sò hữu duyên với bạn:
                    </p>
                    <p className="text-[11px] text-[#63878B] dark:text-white/60">
                      Mỗi vỏ sò ngậm một câu thơ tuyệt mĩ và một nhân vật có tần số đồng điệu
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    {shells.map((shell, idx) => {
                      const isChosen = selectedShellIndex === idx;
                      return (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.04, y: -4 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handlePickShell(idx)}
                          disabled={isOpening}
                          className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-between text-center relative group cursor-pointer ${
                            isChosen
                              ? 'border-[#71BFC6] bg-[#E9F8F8] dark:bg-white/15 shadow-md'
                              : 'border-[#BFE7E8]/70 dark:border-white/10 bg-[#FFFDFC] dark:bg-white/5 hover:border-[#71BFC6] hover:bg-[#F5FCFC]'
                          }`}
                        >
                          <motion.div
                            animate={isChosen && isOpening ? { rotate: [0, -12, 12, -6, 6, 0], scale: [1, 1.25, 1] } : {}}
                            transition={{ duration: 0.8 }}
                            className="text-4xl my-2 filter drop-shadow-xs select-none group-hover:scale-110 transition-transform"
                          >
                            {shell.icon}
                          </motion.div>

                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-[#2D494C] dark:text-white">
                              {shell.name}
                            </h4>
                            <p className="text-[10px] text-[#63878B] dark:text-white/60 font-sans">
                              {shell.desc}
                            </p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {isOpening && (
                    <div className="flex items-center justify-center gap-2 text-xs text-[#71BFC6] animate-pulse pt-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Đang mở lớp sóng biếc và lắng nghe lời thì thầm của biển...</span>
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
                  <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-[#FFFDFC] via-[#F5FCFC] to-[#E9F8F8] dark:from-white/5 dark:via-white/10 dark:to-white/5 border border-[#BFE7E8] dark:border-white/10 shadow-sm space-y-4 text-center">
                    {/* Omen & Theme Tag */}
                    <div className="flex items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#71BFC6]/15 text-[#1B6E7D] dark:text-[#7DD8DE] text-xs font-bold border border-[#71BFC6]/30">
                        <span>✦ {fortune.omen} ✦</span>
                      </span>
                      <span className="text-xs font-bold text-[#2D494C] dark:text-white">
                        {fortune.theme}
                      </span>
                    </div>

                    {/* Classical Poem Presentation Box */}
                    <div className="p-4 rounded-2xl bg-[#FFFDFC]/90 dark:bg-black/20 border border-[#BFE7E8]/70 dark:border-white/10 space-y-2.5 text-left">
                      {/* Hanzi */}
                      <div className="text-center font-serif text-base sm:text-lg font-bold tracking-widest text-[#2D494C] dark:text-white py-1 border-b border-[#BFE7E8]/40 dark:border-white/10">
                        « {fortune.hanzi} »
                      </div>

                      {/* Sino-Vietnamese reading */}
                      <div className="text-xs text-[#71BFC6] font-semibold italic text-center">
                        ({fortune.pinyinViet})
                      </div>

                      {/* Poetic translation */}
                      <div className="text-xs sm:text-sm text-[#2D494C] dark:text-[#E9F8F8] font-medium leading-relaxed bg-[#E9F8F8]/60 dark:bg-white/5 p-2.5 rounded-xl border-l-2 border-[#71BFC6]">
                        <span className="font-bold text-[#1B6E7D] dark:text-[#7DD8DE]">Dịch thơ: </span>
                        <span>{fortune.translation}</span>
                      </div>
                    </div>

                    {/* Philosophical Commentary */}
                    <div className="text-xs sm:text-sm italic text-[#49666A] dark:text-[#E9F8F8]/90 leading-relaxed px-1">
                      “{fortune.quote}”
                    </div>

                    {/* Blessing */}
                    <div className="pt-2 border-t border-[#BFE7E8]/40 dark:border-white/10 text-xs text-[#63878B] dark:text-white/70 leading-relaxed">
                      💡 <strong>Vận trình:</strong> {fortune.blessing}
                    </div>

                    {/* Lucky items row */}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-left">
                      <div className="p-2.5 rounded-xl bg-[#FFFDFC] dark:bg-white/5 border border-[#BFE7E8]/60 dark:border-white/10">
                        <span className="text-[10px] uppercase text-[#63878B] dark:text-white/60 block font-sans">
                          Sắc màu may mắn
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: fortune.luckyColorHex }}
                          />
                          <span className="text-xs font-bold text-[#2D494C] dark:text-white truncate">
                            {fortune.luckyColor}
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#FFFDFC] dark:bg-white/5 border border-[#BFE7E8]/60 dark:border-white/10">
                        <span className="text-[10px] uppercase text-[#63878B] dark:text-white/60 block font-sans">
                          Bảo vật đại dương
                        </span>
                        <span className="text-xs font-bold text-[#2D494C] dark:text-white truncate block mt-0.5">
                          {fortune.seaElement}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Character Suggestion */}
                  {matchedCharacter && (
                    <div className="p-3.5 rounded-2xl bg-[#FFFDFC] dark:bg-white/5 border border-[#BFE7E8]/70 dark:border-white/10 flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={matchedCharacter.avatarUrl || matchedCharacter.avatar}
                          alt={matchedCharacter.name}
                          className="w-11 h-11 rounded-xl object-cover border border-[#BFE7E8] shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-[#71BFC6] block uppercase tracking-wider">
                            Nhân vật đồng điệu:
                          </span>
                          <h4 className="text-xs font-bold text-[#2D494C] dark:text-white truncate">
                            {matchedCharacter.name}
                          </h4>
                          <p className="text-[10px] text-[#63878B] dark:text-white/60 truncate font-sans">
                            {matchedCharacter.title}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onSelectCharacter(matchedCharacter);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#8CCFD3] to-[#71BFC6] hover:brightness-105 text-white text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs cursor-pointer transition-transform active:scale-95"
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
                      className="px-4 py-2 rounded-2xl border border-[#BFE7E8] hover:bg-[#E9F8F8] dark:hover:bg-white/10 text-[#49666A] dark:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Rút vỏ sò khác</span>
                    </button>

                    <button
                      onClick={handleShare}
                      className="px-5 py-2 rounded-2xl bg-gradient-to-r from-[#8CCFD3] to-[#71BFC6] hover:brightness-105 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-transform active:scale-95"
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

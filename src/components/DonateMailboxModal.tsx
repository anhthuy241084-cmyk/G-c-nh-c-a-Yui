import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Snowflake,
  Heart,
  Mail,
  User,
  MessageSquare,
  Check,
  AlertCircle,
  Sparkles,
  Loader2,
  Home,
  ZoomIn,
  Download,
  ShieldCheck,
} from 'lucide-react';
import { WinterContactMethod } from '../types';
import {
  submitWinterLetter,
  getWinterLetterCooldownRemainingMs,
} from '../services/winterLetterService';
import { SnowfallBackground } from './SnowfallBackground';
import { triggerSfx } from '../utils/sfx';

interface DonateMailboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSfxOn?: boolean;
  sfxVolume?: number;
  onToast?: (msg: string) => void;
}

const QR_CARD_SRC = '/assets/aistudio/Thi_p_QR_m_a___ng_pastel_d__th__ng_0fc61f10.png';

const CONTACT_METHODS: {
  id: Exclude<WinterContactMethod, 'none'>;
  label: string;
  placeholder: string;
  fieldLabel: string;
}[] = [
  {
    id: 'facebook',
    label: 'Facebook',
    fieldLabel: 'Link trang cá nhân hoặc username',
    placeholder: 'Ví dụ: https://facebook.com/... hoặc @username',
  },
  {
    id: 'discord',
    label: 'Discord',
    fieldLabel: 'Username Discord',
    placeholder: 'Ví dụ: yui_winter hoặc username#0000',
  },
  {
    id: 'email',
    label: 'Email',
    fieldLabel: 'Địa chỉ email',
    placeholder: 'Ví dụ: tenban@example.com',
  },
  {
    id: 'other',
    label: 'Khác',
    fieldLabel: 'Thông tin liên hệ',
    placeholder: 'Nhập ID, link hoặc cách liên hệ...',
  },
];

/* Custom SVG Envelope that gently opens on button hover */
const InteractiveEnvelopeIcon: React.FC<{ isHovered: boolean }> = ({ isHovered }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    className="shrink-0 overflow-visible"
    aria-hidden="true"
  >
    {/* Envelope body */}
    <rect
      x="2.5"
      y="6.5"
      width="19"
      height="13"
      rx="2.2"
      stroke="currentColor"
      strokeWidth="1.7"
      fill="rgba(255,255,255,0.14)"
    />
    {/* Inner letter peeking up on hover */}
    <path
      d="M6.5 9.5H17.5V14.5H6.5V9.5Z"
      fill="rgba(255,255,255,0.85)"
      style={{
        transform: isHovered ? 'translateY(-3.5px)' : 'translateY(1px)',
        opacity: isHovered ? 1 : 0,
        transition: 'transform 260ms ease, opacity 220ms ease',
      }}
    />
    {/* Envelope flap */}
    <path
      d={isHovered ? 'M3 7.5L12 2.2L21 7.5' : 'M3 7.5L12 13.8L21 7.5'}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transition: 'all 260ms ease' }}
    />
  </svg>
);

/* Custom SVG Illustration: Snow-Covered Mailbox, Light-Blue Envelopes & Falling Snowflakes */
const SnowyMailboxIllustration: React.FC = () => (
  <svg
    viewBox="0 0 280 150"
    className="w-56 sm:w-64 h-auto mx-auto drop-shadow-[0_10px_20px_rgba(82,107,128,0.16)]"
    fill="none"
    aria-hidden="true"
  >
    {/* Falling snowflakes */}
    <g className="text-[#91A9BC] dark:text-[#A9BDCE]" opacity="0.85">
      <path d="M44 26V36M39 31H49M40.5 27.5L47.5 34.5M47.5 27.5L40.5 34.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M236 22V32M231 27H241M232.5 23.5L239.5 30.5M239.5 23.5L232.5 30.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="88" cy="20" r="2.2" fill="currentColor" />
      <circle cx="204" cy="40" r="1.8" fill="currentColor" />
      <circle cx="58" cy="64" r="1.6" fill="currentColor" />
      <circle cx="246" cy="70" r="2" fill="currentColor" />
    </g>

    {/* Ground snow drift */}
    <ellipse cx="140" cy="134" rx="92" ry="11" className="fill-[#E8F1F8] dark:fill-[#202F42]" />
    <ellipse cx="140" cy="132" rx="74" ry="7" className="fill-white/80 dark:fill-[#2E4158]" />

    {/* Wooden / Frost Post */}
    <rect x="134" y="86" width="12" height="46" rx="3" className="fill-[#91A9BC] dark:fill-[#43576B]" />

    {/* Mailbox Body */}
    <path
      d="M92 64C92 48.5 104.5 36 120 36H172C185.2 36 196 46.8 196 60V88C196 90.2 194.2 92 192 92H96C93.8 92 92 90.2 92 88V64Z"
      className="fill-[#D5E4EF] dark:fill-[#354A60] stroke-[#6E899E] dark:stroke-[#A9BDCE]"
      strokeWidth="2"
    />
    {/* Mailbox Front Door */}
    <rect
      x="92"
      y="50"
      width="44"
      height="42"
      rx="16"
      className="fill-[#F7FAFD] dark:fill-[#202F42] stroke-[#6E899E] dark:stroke-[#A9BDCE]"
      strokeWidth="2"
    />

    {/* Snow cap on top of mailbox */}
    <path
      d="M98 46C106 33 122 31 142 32C162 33 184 34 194 46C197 50 190 54 184 52C176 49 169 54 161 52C152 49 144 55 135 51C126 48 118 54 109 51C102 49 95 50 98 46Z"
      className="fill-white dark:fill-[#E8F1F8]"
    />

    {/* Little Flag */}
    <path d="M180 56V32" className="stroke-[#526B80] dark:stroke-[#D5E4EF]" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M180 32H194L190 37L194 42H180V32Z" className="fill-[#91A9BC] dark:fill-[#A9BDCE]" />

    {/* Pastel Light-Blue Envelopes peeking out */}
    <g transform="translate(80 62) rotate(-14)">
      <rect width="34" height="23" rx="3" className="fill-[#E8F1F8] stroke-[#6E899E]" strokeWidth="1.6" />
      <path d="M1 2L17 14L33 2" className="stroke-[#6E899E]" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="17" cy="13" r="2.4" className="fill-[#91A9BC]" />
    </g>
    <g transform="translate(106 67) rotate(6)">
      <rect width="32" height="21" rx="3" className="fill-white dark:fill-[#E8F1F8] stroke-[#526B80]" strokeWidth="1.6" />
      <path d="M1 2L16 13L31 2" className="stroke-[#526B80]" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="16" cy="12" r="2.2" className="fill-[#6E899E]" />
    </g>
  </svg>
);

export const DonateMailboxModal: React.FC<DonateMailboxModalProps> = ({
  isOpen,
  onClose,
  isSfxOn = true,
  sfxVolume = 0.5,
  onToast,
}) => {
  // Section I: Người gửi thư
  const [senderName, setSenderName] = useState('');
  const [preferredDisplayName, setPreferredDisplayName] = useState('');
  const [donateNote, setDonateNote] = useState('');

  // Section II: Phương thức liên hệ
  const [contactMethod, setContactMethod] = useState<WinterContactMethod>('none');
  const [contactPlatformName, setContactPlatformName] = useState('');
  const [contactValue, setContactValue] = useState('');

  // Section III: Lời nhắn gửi Yui
  const [message, setMessage] = useState('');

  // Section IV: Mong muốn của bạn (ALL unchecked by default)
  const [allowContactThanks, setAllowContactThanks] = useState(false);
  const [silentGift, setSilentGift] = useState(false);
  const [hideIdentity, setHideIdentity] = useState(false);
  const [allowPublicNickname, setAllowPublicNickname] = useState(false);

  // Anti-spam honeypot & states
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSentSuccess, setIsSentSuccess] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const [isQrZoomed, setIsQrZoomed] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setErrorMsg(null);
      setIsQrZoomed(false);
    }
  }, [isOpen]);

  const resetForm = () => {
    setSenderName('');
    setPreferredDisplayName('');
    setDonateNote('');
    setContactMethod('none');
    setContactPlatformName('');
    setContactValue('');
    setMessage('');
    setAllowContactThanks(false);
    setSilentGift(false);
    setHideIdentity(false);
    setAllowPublicNickname(false);
    setHoneypot('');
    setErrorMsg(null);
  };

  const handleCloseAndReturnHome = () => {
    setIsSentSuccess(false);
    resetForm();
    onClose();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Honeypot check (silent ignore)
    if (honeypot.trim().length > 0) {
      setIsSentSuccess(true);
      return;
    }

    const trimmedSender = senderName.trim();
    if (!trimmedSender) {
      setErrorMsg('Vui lòng nhập Tên hoặc Biệt danh để Yui biết lá thư này đến từ ai nhé.');
      return;
    }

    const trimmedContact = contactValue.trim();
    if (allowContactThanks) {
      if (contactMethod === 'none') {
        setErrorMsg('Bạn đã chọn nhận lời cảm ơn từ Yui, vui lòng chọn một phương thức liên hệ nhé.');
        return;
      }
      if (!trimmedContact) {
        setErrorMsg('Vui lòng nhập thông tin liên hệ để Yui có thể tìm và cảm ơn bạn nhé.');
        return;
      }
      if (contactMethod === 'other' && !contactPlatformName.trim()) {
        setErrorMsg('Vui lòng nhập tên nền tảng liên hệ của bạn.');
        return;
      }
    }

    if (contactMethod === 'email' && trimmedContact) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedContact)) {
        setErrorMsg('Địa chỉ email có vẻ chưa đúng định dạng, bạn kiểm tra lại giúp Yui nhé.');
        return;
      }
    }

    const remainingMs = getWinterLetterCooldownRemainingMs();
    if (remainingMs > 0) {
      setErrorMsg(`Bạn vừa gửi một lá thư rồi, vui lòng đợi ${Math.ceil(remainingMs / 1000)} giây trước khi gửi lá thư tiếp theo nhé.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await submitWinterLetter({
        senderName: trimmedSender,
        preferredDisplayName: preferredDisplayName.trim(),
        donateNote: donateNote.trim(),
        contactMethod,
        contactPlatformName: contactPlatformName.trim(),
        contactValue: trimmedContact,
        message: message.trim(),
        allowContactThanks,
        silentGift,
        hideIdentity,
        allowPublicNickname,
      });

      if (isSfxOn) triggerSfx('chime', sfxVolume);
      setIsSentSuccess(true);
      if (onToast) onToast('Đã gửi lá thư đến Hòm Thư Mùa Đông của Yui');
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.startsWith('COOLDOWN:')) {
        const secs = msg.split(':')[1] || '15';
        setErrorMsg(`Vui lòng đợi ${secs} giây rồi hãy gửi lá thư tiếp theo nhé.`);
      } else if (msg === 'MISSING_CONTACT_FOR_THANKS') {
        setErrorMsg('Vui lòng điền thông tin liên hệ vì bạn đã chọn cho phép Yui liên hệ cảm ơn.');
      } else {
        setErrorMsg('Chưa thể gửi lá thư ngay lúc này. Bạn thử lại sau ít phút nhé.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-[#172536]/75 backdrop-blur-md">
        <SnowfallBackground
          settings={{ isEnabled: true, density: 'low', speed: 'slow', opacity: 'medium' }}
          themeMode="dark"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-3xl max-h-[92dvh] flex flex-col bg-[#F7FAFD] dark:bg-[#172536] text-[#43576B] dark:text-[#E5EDF5] rounded-2xl sm:rounded-[28px] shadow-2xl border border-[#DCE7EF] dark:border-[#354A60] overflow-hidden"
        >
          {/* Top Modal Header */}
          <div className="px-4 sm:px-7 py-3.5 sm:py-4 border-b border-[#DCE7EF] dark:border-[#354A60] bg-white/85 dark:bg-[#202F42]/90 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#E8F1F8] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B] flex items-center justify-center text-[#526B80] dark:text-[#D5E4EF] shrink-0">
                <Snowflake className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold font-serif text-[#172536] dark:text-[#F7FAFD] truncate">
                  Ủng Hộ Yui · Hòm Thư Mùa Đông
                </h2>
                <p className="text-[11px] text-[#6E899E] dark:text-[#A9BDCE] font-serif truncate">
                  Góc gửi trao yêu thương giữa những ngày tuyết rơi
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#E8F1F8] dark:hover:bg-[#354A60] text-[#91A9BC] hover:text-[#172536] dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-8 py-7 space-y-10">
            {/* SECTION 1: QR DONATE & THANK-YOU MESSAGE */}
            <section className="space-y-6">
              <div className="mx-auto max-w-sm space-y-3">
                <button
                  type="button"
                  onClick={() => setIsQrZoomed(true)}
                  className="block w-full overflow-hidden rounded-xl border border-[#DCE7EF] dark:border-[#43576B] shadow-[0_14px_40px_-10px_rgba(82,107,128,0.22)] cursor-zoom-in focus:outline-none"
                  title="Nhấn để phóng to mã QR"
                >
                  <img
                    src={QR_CARD_SRC}
                    alt="Thiệp QR ủng hộ Yui mùa đông pastel"
                    className="w-full h-auto object-contain block"
                  />
                </button>

                <div className="flex items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsQrZoomed(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] text-[11px] sm:text-xs font-serif font-semibold text-[#526B80] dark:text-[#D5E4EF] hover:border-[#91A9BC] transition-colors cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Phóng to QR</span>
                  </button>
                  <a
                    href={QR_CARD_SRC}
                    download="QR_Ung_Ho_Yui.png"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] text-[11px] sm:text-xs font-serif font-semibold text-[#526B80] dark:text-[#D5E4EF] hover:border-[#91A9BC] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải ảnh QR gốc</span>
                  </a>
                </div>
              </div>

              {/* Exact Thank-You Message Below QR */}
              <div className="max-w-xl mx-auto rounded-3xl bg-white/85 dark:bg-[#202F42]/80 border border-[#DCE7EF] dark:border-[#354A60] p-6 sm:p-7 shadow-xs space-y-3 text-center">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#E8F1F8] dark:bg-[#172536] text-[#526B80] dark:text-[#D5E4EF]">
                  <Heart className="w-4 h-4 fill-[#91A9BC]/40" />
                </div>

                <p className="text-xs sm:text-sm leading-relaxed text-[#202F42] dark:text-[#E5EDF5] font-serif">
                  Yui xin gửi lời cảm ơn thật nhiều đến mọi người đã donate và ủng hộ Yui nhé ㅠㅠ ♡ Dù ít hay nhiều thì Yui đều rất trân trọng tấm lòng của mọi người. Cảm ơn vì đã yêu thương, tin tưởng và tiếp thêm động lực để Yui tiếp tục làm những điều mình thích. Thương mọi người nhiều lắm, mong rằng chúng ta sẽ còn đồng hành cùng nhau thật lâu nữa nha.
                </p>

                <p className="text-[11px] sm:text-xs italic font-serif text-[#6E899E] dark:text-[#A9BDCE] pt-2 border-t border-dashed border-[#DCE7EF] dark:border-[#43576B]">
                  Cũng tiện nói luôn đây không ép buộc, mọi người muốn thì ủng hộ thôi nhé — chỉ cần bạn ghé thăm và yêu thích những câu chuyện ở đây đã là niềm vui rất lớn rồi.
                </p>
              </div>
            </section>

            {/* Decorative Winter Divider */}
            <div className="flex items-center justify-center gap-3 text-[#91A9BC] dark:text-[#A9BDCE]">
              <span className="h-[1px] flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-[#91A9BC]/50" />
              <Snowflake className="w-4 h-4" />
              <span className="text-[11px] uppercase tracking-[0.25em] font-serif">
                Hòm Thư Mùa Đông
              </span>
              <Snowflake className="w-4 h-4" />
              <span className="h-[1px] flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-[#91A9BC]/50" />
            </div>

            {/* SECTION 2: HÒM THƯ MÙA ĐÔNG */}
            <section className="space-y-6">
              <AnimatePresence mode="wait">
                {!isSentSuccess ? (
                  <motion.div
                    key="winter-letter-form-view"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Intro Header */}
                    <div className="text-center max-w-xl mx-auto space-y-3">
                      <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#172536] dark:text-[#F7FAFD]">
                        Một lá thư gửi giữa mùa đông
                      </h3>
                      <div className="text-xs sm:text-sm leading-relaxed text-[#43576B] dark:text-[#D5E4EF] space-y-2.5 font-sans">
                        <p>
                          Cảm ơn bạn vì đã dành một chút yêu thương và sự ủng hộ cho Yui. Nếu bạn vừa gửi một món quà nhỏ đến Yui, đừng quên để lại đôi dòng tại đây nhé!
                        </p>
                        <p>
                          Yui muốn biết ai đã gửi tặng mình, để có thể gửi lời cảm ơn đến bạn một cách trọn vẹn nhất. Bạn có thể để lại tên, phương thức liên hệ hoặc một lời nhắn nhỏ. Mọi thông tin đều được trân trọng.
                        </p>
                      </div>
                      <p className="text-[11px] italic font-serif text-[#6E899E] dark:text-[#A9BDCE]">
                        Việc điền thông tin là không bắt buộc, nhưng sẽ giúp Yui có thể tìm và liên hệ cảm ơn bạn dễ dàng hơn.
                      </p>
                    </div>

                    {/* "Tờ thư mùa đông" Form Card */}
                    <form
                      onSubmit={handleSubmit}
                      noValidate
                      className="relative rounded-[28px] bg-white/95 dark:bg-[#202F42]/90 border border-[#DCE7EF] dark:border-[#43576B] shadow-[0_18px_45px_-14px_rgba(82,107,128,0.16)] p-5 sm:p-8 space-y-7 overflow-hidden"
                    >
                      {/* Top Wax-Seal & Letter Strip */}
                      <div className="flex items-center justify-between border-b border-dashed border-[#DCE7EF] dark:border-[#43576B] pb-4">
                        <div className="flex items-center gap-2 text-xs font-serif text-[#6E899E] dark:text-[#A9BDCE]">
                          <Mail className="w-4 h-4" />
                          <span>Tờ thư mùa đông gửi Yui</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-serif text-[#6E899E] dark:text-[#A9BDCE]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Chỉ riêng Yui đọc được</span>
                        </span>
                      </div>

                      {/* Hidden Honeypot against automated bots */}
                      <div className="hidden" aria-hidden="true">
                        <label>
                          Website
                          <input
                            type="text"
                            tabIndex={-1}
                            autoComplete="off"
                            value={honeypot}
                            onChange={(e) => setHoneypot(e.target.value)}
                          />
                        </label>
                      </div>

                      {/* I. Người gửi thư */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-bold font-serif text-[#172536] dark:text-[#F7FAFD]">
                          <User className="w-4 h-4 text-[#6E899E]" />
                          <h4>I. Người gửi thư</h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-[#43576B] dark:text-[#D5E4EF] font-serif">
                              Tên / Biệt danh <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              maxLength={80}
                              required
                              value={senderName}
                              onChange={(e) => setSenderName(e.target.value)}
                              placeholder="Tên hoặc biệt danh của bạn..."
                              className="w-full px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm bg-[#F7FAFD] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B] text-[#172536] dark:text-[#F7FAFD] placeholder:text-[#91A9BC] focus:outline-none focus:border-[#6E899E] focus:ring-2 focus:ring-[#91A9BC]/25 transition-all"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-[#43576B] dark:text-[#D5E4EF] font-serif">
                              Tên hiển thị mong muốn <span className="text-[#91A9BC] font-normal">(không bắt buộc)</span>
                            </label>
                            <input
                              type="text"
                              maxLength={80}
                              value={preferredDisplayName}
                              onChange={(e) => setPreferredDisplayName(e.target.value)}
                              placeholder="Tên bạn muốn Yui gọi hoặc ghi nhớ..."
                              className="w-full px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm bg-[#F7FAFD] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B] text-[#172536] dark:text-[#F7FAFD] placeholder:text-[#91A9BC] focus:outline-none focus:border-[#6E899E] focus:ring-2 focus:ring-[#91A9BC]/25 transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-[#43576B] dark:text-[#D5E4EF] font-serif">
                            Thông tin món quà / Lời nhắn ủng hộ <span className="text-[#91A9BC] font-normal">(không bắt buộc)</span>
                          </label>
                          <input
                            type="text"
                            maxLength={160}
                            value={donateNote}
                            onChange={(e) => setDonateNote(e.target.value)}
                            placeholder="Ví dụ: Gửi tặng Yui một tách trà nóng (không cần nhập số tài khoản hay mật khẩu)"
                            className="w-full px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm bg-[#F7FAFD] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B] text-[#172536] dark:text-[#F7FAFD] placeholder:text-[#91A9BC] focus:outline-none focus:border-[#6E899E] focus:ring-2 focus:ring-[#91A9BC]/25 transition-all"
                          />
                        </div>
                      </div>

                      {/* II. Phương thức liên hệ */}
                      <div className="space-y-3.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-sm font-bold font-serif text-[#172536] dark:text-[#F7FAFD]">
                            <Mail className="w-4 h-4 text-[#6E899E]" />
                            <h4>II. Phương thức liên hệ</h4>
                          </div>
                          {allowContactThanks && (
                            <span className="text-[11px] font-serif text-[#526B80] dark:text-[#D5E4EF] italic">
                              Bắt buộc nhập vì bạn đã chọn nhận lời cảm ơn
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {CONTACT_METHODS.map((m) => {
                            const active = contactMethod === m.id;
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() =>
                                  setContactMethod((prev) => (prev === m.id ? 'none' : m.id))
                                }
                                className={`py-2.5 px-3 rounded-2xl text-xs font-serif font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                  active
                                    ? 'btn-winter-primary border-transparent shadow-sm'
                                    : 'bg-[#F7FAFD] dark:bg-[#172536] text-[#526B80] dark:text-[#D5E4EF] border-[#DCE7EF] dark:border-[#43576B] hover:border-[#91A9BC]'
                                }`}
                              >
                                {active && <Check className="w-3.5 h-3.5" />}
                                <span>{m.label}</span>
                              </button>
                            );
                          })}
                        </div>

                        <AnimatePresence>
                          {contactMethod !== 'none' && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden pt-1 space-y-3"
                            >
                              {contactMethod === 'other' && (
                                <div className="space-y-1.5">
                                  <label className="block text-xs font-semibold text-[#43576B] dark:text-[#D5E4EF] font-serif">
                                    Tên nền tảng {allowContactThanks && <span className="text-rose-500">*</span>}
                                  </label>
                                  <input
                                    type="text"
                                    maxLength={60}
                                    value={contactPlatformName}
                                    onChange={(e) => setContactPlatformName(e.target.value)}
                                    placeholder="Ví dụ: Instagram, Threads, TikTok, X..."
                                    className="w-full px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm bg-[#F7FAFD] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B] text-[#172536] dark:text-[#F7FAFD] placeholder:text-[#91A9BC] focus:outline-none focus:border-[#6E899E]"
                                  />
                                </div>
                              )}

                              <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-[#43576B] dark:text-[#D5E4EF] font-serif">
                                  {CONTACT_METHODS.find((m) => m.id === contactMethod)?.fieldLabel}
                                  {allowContactThanks && <span className="text-rose-500"> *</span>}
                                </label>
                                <input
                                  type={contactMethod === 'email' ? 'email' : 'text'}
                                  maxLength={200}
                                  value={contactValue}
                                  onChange={(e) => setContactValue(e.target.value)}
                                  placeholder={CONTACT_METHODS.find((m) => m.id === contactMethod)?.placeholder}
                                  className="w-full px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm bg-[#F7FAFD] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B] text-[#172536] dark:text-[#F7FAFD] placeholder:text-[#91A9BC] focus:outline-none focus:border-[#6E899E]"
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* III. Lời nhắn gửi Yui */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-sm font-bold font-serif text-[#172536] dark:text-[#F7FAFD]">
                          <MessageSquare className="w-4 h-4 text-[#6E899E]" />
                          <h4>III. Lời nhắn gửi Yui</h4>
                        </div>
                        <textarea
                          rows={5}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Có điều gì muốn nhắn gửi đến Yui không? Một lời chúc, đôi dòng tâm sự hay đơn giản chỉ là một chiếc ôm tinh thần bằng con chữ..."
                          className="w-full px-4 py-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed bg-[#F7FAFD] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#43576B] text-[#172536] dark:text-[#F7FAFD] placeholder:text-[#91A9BC] focus:outline-none focus:border-[#6E899E] focus:ring-2 focus:ring-[#91A9BC]/25 transition-all resize-y font-serif"
                        />
                      </div>

                      {/* IV. Mong muốn của bạn (4 independent checkboxes, ALL unchecked by default) */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-bold font-serif text-[#172536] dark:text-[#F7FAFD]">
                          <Sparkles className="w-4 h-4 text-[#6E899E]" />
                          <h4>IV. Mong muốn của bạn</h4>
                        </div>

                        <div className="space-y-2.5">
                          {[
                            {
                              checked: allowContactThanks,
                              onChange: setAllowContactThanks,
                              label: 'Yui có thể liên hệ để gửi lời cảm ơn.',
                            },
                            {
                              checked: silentGift,
                              onChange: setSilentGift,
                              label: 'Chỉ muốn gửi tặng âm thầm, không cần phản hồi.',
                            },
                            {
                              checked: hideIdentity,
                              onChange: setHideIdentity,
                              label: 'Không muốn công khai danh tính.',
                            },
                            {
                              checked: allowPublicNickname,
                              onChange: setAllowPublicNickname,
                              label: 'Đồng ý để Yui nhắc đến biệt danh khi cảm ơn công khai.',
                            },
                          ].map((opt, i) => (
                            <label
                              key={i}
                              className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                                opt.checked
                                  ? 'bg-[#E8F1F8]/75 dark:bg-[#172536] border-[#91A9BC]'
                                  : 'bg-[#F7FAFD]/80 dark:bg-[#172536]/60 border-[#DCE7EF] dark:border-[#43576B] hover:border-[#91A9BC]/70'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={opt.checked}
                                onChange={(e) => opt.onChange(e.target.checked)}
                                className="mt-0.5 w-4 h-4 rounded accent-[#526B80] cursor-pointer shrink-0"
                              />
                              <span className="text-xs sm:text-sm text-[#202F42] dark:text-[#E5EDF5] font-sans leading-snug">
                                {opt.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Error Alert */}
                      {errorMsg && (
                        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-200 text-xs flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{errorMsg}</span>
                        </div>
                      )}

                      {/* Submit CTA Button with Opening Envelope Hover Effect */}
                      <div className="pt-2 flex justify-center">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          onMouseEnter={() => setIsBtnHovered(true)}
                          onMouseLeave={() => setIsBtnHovered(false)}
                          className="group relative w-full sm:w-auto px-8 py-3.5 rounded-2xl btn-winter-primary text-sm font-serif font-semibold tracking-wide flex items-center justify-center gap-3 shadow-lg hover:shadow-[0_0_26px_rgba(145,169,188,0.55)] disabled:opacity-60 cursor-pointer"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Đang gửi lá thư...</span>
                            </>
                          ) : (
                            <>
                              <InteractiveEnvelopeIcon isHovered={isBtnHovered} />
                              <span>Gửi lá thư đến Yui</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  /* Success State: Snow Envelope Screen */
                  <motion.div
                    key="winter-letter-success-view"
                    initial={{ opacity: 0, scale: 0.94, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="max-w-lg mx-auto rounded-[28px] bg-white dark:bg-[#202F42] border border-[#DCE7EF] dark:border-[#43576B] p-7 sm:p-10 text-center shadow-2xl space-y-5"
                  >
                    <div className="w-16 h-16 mx-auto rounded-3xl bg-[#E8F1F8] dark:bg-[#172536] border border-[#91A9BC]/50 flex items-center justify-center text-[#526B80] dark:text-[#D5E4EF] shadow-inner">
                      <Mail className="w-8 h-8" />
                    </div>

                    <div className="space-y-3 font-serif">
                      <h3 className="text-xl sm:text-2xl font-bold text-[#172536] dark:text-[#F7FAFD]">
                        Thư của bạn đã được gửi đến nơi rồi!
                      </h3>
                      <p className="text-xs sm:text-sm leading-relaxed text-[#43576B] dark:text-[#E5EDF5]">
                        Cảm ơn vì đã ghé qua và để lại một chút yêu thương cho Yui. Yui sẽ đọc được lá thư này và liên hệ với bạn nếu bạn đã đăng ký nhận lời cảm ơn nhé.
                      </p>
                      <p className="text-xs sm:text-sm italic text-[#6E899E] dark:text-[#A9BDCE]">
                        Hẹn gặp lại bạn dưới những bông tuyết!
                      </p>
                    </div>

                    <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleCloseAndReturnHome}
                        className="w-full sm:w-auto px-6 py-3 rounded-2xl btn-winter-primary text-xs sm:text-sm font-serif font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Home className="w-4 h-4" />
                        <span>Trở về trang chủ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsSentSuccess(false);
                          resetForm();
                        }}
                        className="w-full sm:w-auto px-5 py-3 rounded-2xl btn-winter-secondary text-xs font-serif font-semibold cursor-pointer"
                      >
                        Viết thêm thư khác
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Footer Decoration of Winter Mailbox */}
            <footer className="pt-4 pb-2 text-center space-y-3 border-t border-dashed border-[#DCE7EF] dark:border-[#43576B]">
              <SnowyMailboxIllustration />
              <p className="text-xs sm:text-sm font-serif italic text-[#526B80] dark:text-[#A9BDCE] max-w-md mx-auto">
                &ldquo;Giữa mùa đông lạnh giá, cảm ơn bạn vì đã để lại một chút ấm áp cho Yui.&rdquo;
              </p>
            </footer>
          </div>
        </motion.div>

        {/* Full QR Zoom Lightbox */}
        <AnimatePresence>
          {isQrZoomed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQrZoomed(false)}
              className="fixed inset-0 z-[70] bg-[#0B131F]/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="relative max-w-lg w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setIsQrZoomed(false)}
                  aria-label="Đóng ảnh QR"
                  className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#172536] text-white flex items-center justify-center shadow-lg cursor-pointer z-10"
                >
                  <X className="w-4 h-4" />
                </button>
                <img
                  src={QR_CARD_SRC}
                  alt="Thiệp QR ủng hộ Yui"
                  className="w-full h-auto object-contain rounded-xl block"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};

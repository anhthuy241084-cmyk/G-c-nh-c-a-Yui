import React from 'react';
import { motion } from 'motion/react';
import { Send, Dices, Mail, Trophy, Flame, Snowflake, MessageSquare, Feather } from 'lucide-react';
import { AudioSettings, Character, GenreTag } from '../types';

interface WinterWelcomeFrameProps {
  characters?: Character[];
  onSelectCharacter?: (character: Character, openStory?: boolean) => void;
  onGoToGgai?: (character: Character, url: string) => void;
  onSelectTag?: (tag: GenreTag | null) => void;
  onOpenRandom?: () => void;
  onOpenFortune?: () => void;
  onOpenDonateMailbox?: () => void;
  onOpenCreatorRequest?: () => void;
  onOpenVoting?: () => void;
  onOpenMessageBoard?: () => void;
  onOpenSnowGame?: () => void;
  onOpenSecretLetter?: () => void;
  streakCount?: number;
  onOpenStreak?: () => void;
  audioSettings?: AudioSettings;
  onUpdateAudioSettings?: (newSettings: Partial<AudioSettings>) => void;
}

/* Delicate Pastel Ribbon & Frost Garland SVG around Yui's portrait (No Heavy Borders) */
const PastelWinterGarland: React.FC = () => (
  <svg
    viewBox="0 0 180 180"
    fill="none"
    className="pointer-events-none absolute -inset-2.5 sm:-inset-4 w-[calc(100%+1.25rem)] sm:w-[calc(100%+2rem)] h-[calc(100%+1.25rem)] sm:h-[calc(100%+2rem)] text-[#7CA8D3] dark:text-[#9AC0E3]"
    aria-hidden="true"
  >
    <circle cx="90" cy="90" r="81" stroke="currentColor" strokeOpacity="0.32" strokeWidth="1" strokeDasharray="3 4" />
    <circle cx="90" cy="90" r="74" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.2" />
    {/* Delicate top crystal & pastel ribbon loops */}
    <path
      d="M84 14C78 7 69 7 69 14C69 20 79 20 84 14ZM96 14C102 7 111 7 111 14C111 20 101 20 96 14Z"
      fill="#FBE8EF"
      fillOpacity="0.85"
      stroke="currentColor"
      strokeWidth="1.15"
    />
    <circle cx="90" cy="14" r="3.4" fill="#FFFFFF" stroke="currentColor" strokeWidth="1.2" />
    {/* Side Snowflake Petals */}
    <circle cx="15" cy="90" r="2.2" fill="currentColor" fillOpacity="0.65" />
    <circle cx="165" cy="90" r="2.2" fill="currentColor" fillOpacity="0.65" />
    <circle cx="32" cy="38" r="1.6" fill="#F4AFC4" />
    <circle cx="148" cy="38" r="1.6" fill="#F4AFC4" />
  </svg>
);

export const WinterWelcomeFrame: React.FC<WinterWelcomeFrameProps> = ({
  characters = [],
  onOpenRandom,
  onOpenDonateMailbox,
  onOpenCreatorRequest,
  onOpenVoting,
  onOpenMessageBoard,
  onOpenSnowGame,
  onOpenSecretLetter,
  streakCount = 1,
  onOpenStreak,
}) => {
  const avatarUrl = '/yui_avatar.jpg';

  const charms = [
    onOpenCreatorRequest
      ? {
          id: 'request',
          label: 'Gửi Request',
          sub: 'Bảng công khai & riêng',
          icon: <Send className="w-4 h-4" />,
          tone: 'primary' as const,
          onClick: onOpenCreatorRequest,
        }
      : null,
    onOpenRandom
      ? {
          id: 'random',
          label: 'Snow Random',
          sub: 'Lật thẻ định mệnh',
          icon: <Dices className="w-4 h-4" />,
          tone: 'sky' as const,
          onClick: onOpenRandom,
        }
      : null,
    onOpenVoting
      ? {
          id: 'voting',
          label: 'Bình Chọn',
          sub: 'Đêm sao thả tim',
          icon: <Trophy className="w-4 h-4" />,
          tone: 'blush' as const,
          onClick: onOpenVoting,
        }
      : null,
    onOpenSnowGame
      ? {
          id: 'snowgame',
          label: 'Săn Tuyết Rơi',
          sub: 'Trò chơi nhận quà',
          icon: <Snowflake className="w-4 h-4" />,
          tone: 'sky' as const,
          onClick: onOpenSnowGame,
        }
      : null,
    onOpenMessageBoard
      ? {
          id: 'board',
          label: 'Bảng Tin',
          sub: 'Gửi ghi chú mùa đông',
          icon: <MessageSquare className="w-4 h-4" />,
          tone: 'sky' as const,
          onClick: onOpenMessageBoard,
        }
      : null,
    onOpenDonateMailbox
      ? {
          id: 'donate',
          label: 'Ủng Hộ Yui',
          sub: 'Hòm thư & QR cảm ơn',
          icon: <Mail className="w-4 h-4" />,
          tone: 'blush' as const,
          onClick: onOpenDonateMailbox,
        }
      : null,
    onOpenSecretLetter
      ? {
          id: 'secretLetter',
          label: 'Tâm Thư Đêm Tuyết',
          sub: 'Thư ẩn danh không giới hạn',
          icon: <Feather className="w-4 h-4" />,
          tone: 'sky' as const,
          onClick: onOpenSecretLetter,
        }
      : null,
  ].filter(Boolean) as Array<{
    id: string;
    label: string;
    sub: string;
    icon: React.ReactNode;
    tone: 'primary' | 'sky' | 'blush';
    onClick: () => void;
  }>;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-6xl mx-auto pt-1 sm:pt-3 pb-1 sm:pb-3 select-none"
    >
      {/* Airy Unboxed Atmospheric Cloud Backdrop — Compact on Mobile */}
      <div className="relative px-1 sm:px-6 pt-2 sm:pt-4 pb-1 sm:pb-2 space-y-5 sm:space-y-8">
        <div
          className="pointer-events-none absolute -inset-x-4 sm:-inset-x-6 -inset-y-3 sm:-inset-y-4 bg-[#F5FAFF]/72 dark:bg-[#131F30]/72 backdrop-blur-[5px]"
          style={{
            WebkitMaskImage:
              'radial-gradient(ellipse 92% 90% at 50% 45%, rgba(0,0,0,1) 52%, rgba(0,0,0,0) 100%)',
            maskImage:
              'radial-gradient(ellipse 92% 90% at 50% 45%, rgba(0,0,0,1) 52%, rgba(0,0,0,0) 100%)',
          }}
        />

        {/* Centered Poetic Yui Greeting Floating Directly Over Snowy Backdrop */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-3.5 sm:gap-7 md:gap-10 max-w-4xl mx-auto text-center md:text-left">
          {/* Yui Portrait Medallion with Pastel Ribbon Garland */}
          <div className="relative shrink-0 flex flex-col items-center">
            <div className="relative w-20 h-20 sm:w-32 sm:h-32">
              <PastelWinterGarland />
              <div className="w-full h-full rounded-full p-1 sm:p-1.5 bg-white/95 dark:bg-[#1C2C40] border border-[#CFE2F4] dark:border-[#3D5775] shadow-[0_10px_28px_-8px_rgba(74,116,160,0.24)]">
                <img
                  src={avatarUrl}
                  alt="Yui"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>

            {onOpenStreak && (
              <button
                type="button"
                onClick={onOpenStreak}
                className="mt-2 sm:mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/92 dark:bg-[#1E2E43]/92 border border-[#D4E6F6] dark:border-[#3B536E] text-[11px] font-serif font-semibold text-[#3C6287] dark:text-[#CBE3FA] hover:border-[#8DB6DD] transition-colors shadow-xs cursor-pointer"
                title="Xem lịch sử ghé thăm mùa đông"
              >
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span className="tabular-nums">{streakCount} ngày đồng hành</span>
              </button>
            )}
          </div>

          {/* Open Editorial Masthead Typography */}
          <div className="space-y-1.5 sm:space-y-2.5 min-w-0 max-w-xl">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-[11px] sm:text-xs font-serif text-[#567EA6] dark:text-[#A4C4E4]">
              <span className="inline-flex items-center gap-1 font-semibold">
                <Snowflake className="w-3.5 h-3.5" />
                <span>Góc nhỏ của Yui</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{characters.length} ký ức nhân vật</span>
            </div>

            <h2 className="text-2xl sm:text-[2.7rem] font-semibold font-display text-[#203850] dark:text-[#F6FAFF] tracking-tight leading-[1.12] [text-wrap:balance]">
              Hộp Ký Ức Mùa Đông
            </h2>

            <p className="text-sm sm:text-lg italic font-serif text-[#4C77A1] dark:text-[#C0DAF4]">
              &ldquo;Hẹn nhau ở cuối mùa đông, nơi tuyết chưa tan.&rdquo;
            </p>

            {/* Delicate Hairline Ornament */}
            <div className="hidden sm:flex items-center justify-center md:justify-start gap-2.5 py-0.5 text-[#8EB3D6] dark:text-[#5B7C9E]">
              <span className="h-[1px] w-12 bg-current opacity-50" />
              <span className="text-xs font-serif text-[#D48BA2] dark:text-[#E6A7BC]">୨୧ ❄ ୨୧</span>
              <span className="h-[1px] w-20 bg-current opacity-30" />
            </div>

            <p className="text-xs sm:text-sm text-[#435E79] dark:text-[#D3E3F4] leading-relaxed font-sans line-clamp-2 sm:line-clamp-none">
              Nơi Yui nâng niu lưu giữ từng nhân vật, trang chuyện dịu êm và những lá thư ấm áp gửi qua mùa tuyết rơi.
            </p>
          </div>
        </div>

        {/* Mobile: Single Horizontal Swipeable Charm Strip | Tablet: Centered wrap | Desktop: 7-col Grid */}
        <div className="relative z-10 flex sm:flex-wrap sm:justify-center lg:grid lg:grid-cols-7 gap-2.5 sm:gap-3 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-1.5 sm:pb-0 -mx-1 px-1 sm:mx-0 sm:px-0 custom-scrollbar">
          {charms.map((item) => {
            const isPrimary = item.tone === 'primary';
            const isBlush = item.tone === 'blush';

            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className={`group flex flex-col items-center text-center min-w-[114px] sm:min-w-0 sm:w-[calc(25%-0.6rem)] lg:w-auto shrink-0 snap-start px-3 py-2.5 sm:py-3.5 rounded-[18px] sm:rounded-[20px] transition-all duration-200 hover:-translate-y-1 cursor-pointer ${
                  isPrimary
                    ? 'bg-[#5380AD] hover:bg-[#44709D] text-white border border-[#6E9AC4] shadow-[0_8px_20px_-6px_rgba(74,116,162,0.38)]'
                    : isBlush
                    ? 'bg-[#FFF7F9]/92 dark:bg-[#282233]/92 hover:bg-[#FFF0F4] dark:hover:bg-[#31283D] text-[#354E68] dark:text-[#F4E3EB] border border-[#F0D3DD] dark:border-[#533D52] shadow-[0_6px_16px_-6px_rgba(160,96,120,0.14)]'
                    : 'bg-white/90 dark:bg-[#1B2B3E]/90 hover:bg-white dark:hover:bg-[#22354C] text-[#28425C] dark:text-[#E7F0FA] border border-[#D4E6F6] dark:border-[#344B66] hover:border-[#99C0E4] shadow-[0_6px_16px_-6px_rgba(74,116,162,0.12)]'
                }`}
              >
                <span
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl flex items-center justify-center mb-1.5 sm:mb-2 transition-transform duration-200 group-hover:scale-105 ${
                    isPrimary
                      ? 'bg-white/20 text-white'
                      : isBlush
                      ? 'bg-[#FCEBF0] dark:bg-[#3A2B3D] text-[#D26386] dark:text-[#F09EB7]'
                      : 'bg-[#EEF6FD] dark:bg-[#253952] text-[#5380AD] dark:text-[#A4C8EB]'
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`text-[11px] sm:text-xs font-serif font-bold truncate max-w-full ${
                    isPrimary ? 'text-white' : 'text-[#203850] dark:text-[#F5FAFF]'
                  }`}
                >
                  {item.label}
                </span>
                <span
                  className={`hidden sm:block text-[10px] truncate max-w-full mt-0.5 ${
                    isPrimary
                      ? 'text-[#E3F0FC]'
                      : isBlush
                      ? 'text-[#96687A] dark:text-[#D5B0BF]'
                      : 'text-[#62819E] dark:text-[#9DBAD6]'
                  }`}
                >
                  {item.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};

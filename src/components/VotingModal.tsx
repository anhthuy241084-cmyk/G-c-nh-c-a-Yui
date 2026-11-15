import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Crown, Snowflake, Search, CheckCircle, Eye, Sparkles } from 'lucide-react';
import { Character } from '../types';
import { triggerHeartConfetti } from '../utils/confetti';
import { triggerSfx } from '../utils/sfx';

interface VotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  onVote: (characterId: string) => void;
  votedMap?: Record<string, boolean>;
  onSelectCharacter?: (character: Character) => void;
  isSfxOn?: boolean;
  sfxVolume?: number;
}

export const VotingModal: React.FC<VotingModalProps> = ({
  isOpen,
  onClose,
  characters,
  onVote,
  votedMap = {},
  onSelectCharacter,
  isSfxOn = true,
  sfxVolume = 0.5,
}) => {
  const [justVotedId, setJustVotedId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'unvoted'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const publishedCharacters = useMemo(
    () => characters.filter((c) => !c.isDraft && !c.isPrivate),
    [characters]
  );

  const sortedAll = useMemo(
    () => [...publishedCharacters].sort((a, b) => (b.votes || 0) - (a.votes || 0)),
    [publishedCharacters]
  );

  const totalVotes = useMemo(
    () => publishedCharacters.reduce((sum, c) => sum + (c.votes || 0), 0),
    [publishedCharacters]
  );

  const topVotes = Math.max(1, sortedAll[0]?.votes || 1);

  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sortedAll.filter((c) => {
      if (filterMode === 'unvoted' && votedMap[c.id]) return false;
      if (q && !c.name.toLowerCase().includes(q) && !c.title.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [sortedAll, filterMode, searchQuery, votedMap]);

  const handleVoteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (votedMap[id]) return;
    const originX = e.clientX ? e.clientX / window.innerWidth : 0.5;
    const originY = e.clientY ? e.clientY / window.innerHeight : 0.5;
    triggerHeartConfetti(originX, originY);
    if (isSfxOn) triggerSfx('heart', sfxVolume);
    onVote(id);
    setJustVotedId(id);
    setTimeout(() => setJustVotedId(null), 1500);
  };

  // Spotlight podium order: #2 (left), #1 (elevated center), #3 (right)
  const podiumOrder =
    sortedAll.length >= 3
      ? [
          { char: sortedAll[1], rank: 2, heightClass: 'sm:mt-6' },
          { char: sortedAll[0], rank: 1, heightClass: 'sm:mt-0' },
          { char: sortedAll[2], rank: 3, heightClass: 'sm:mt-8' },
        ]
      : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-[#121F32]/75 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 14 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 14 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl max-h-[92dvh] flex flex-col bg-[#F5F9FE] dark:bg-[#172538] rounded-2xl sm:rounded-[30px] shadow-2xl border border-[#D4E4F2] dark:border-[#39506B] text-[#334A60] dark:text-[#E5EFF9] overflow-hidden"
          >
            {/* Festive Starlight Header */}
            <div className="relative flex items-center justify-between px-4 sm:px-7 py-3.5 sm:py-4 border-b border-[#DCE9F5] dark:border-[#334963] bg-gradient-to-r from-[#FFF7FA] via-[#F7FBFF] to-[#EAF3FC] dark:from-[#213148] dark:via-[#1C2C41] dark:to-[#172538]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-rose-400 to-rose-500 text-white shadow-md shadow-rose-400/25 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-xl font-bold font-serif text-[#16273B] dark:text-[#F8FBFF] truncate">
                    Đêm Sao Bình Chọn Mùa Đông
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#5E7C99] dark:text-[#A4C0DA] font-serif truncate">
                    Đã gửi trao <strong className="text-rose-600 dark:text-rose-300 tabular-nums">{totalVotes}</strong> trái tim yêu mến
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center p-2 text-[#64829E] hover:text-[#16273B] dark:text-[#A4C0DA] dark:hover:text-white rounded-full hover:bg-white/80 dark:hover:bg-[#2B3E57] transition-colors cursor-pointer shrink-0"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Filter Strip */}
            <div className="px-5 sm:px-7 py-3 border-b border-[#E2ECF5] dark:border-[#334963] bg-white/70 dark:bg-[#1B2B40]/80 flex flex-wrap items-center justify-between gap-2.5">
              <div className="relative flex-1 min-w-[190px] max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7393B3]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm nhân vật để thả tim..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-[#142233] border border-[#D4E4F2] dark:border-[#3D5470] focus:outline-none focus:border-[#6A97C2]"
                />
              </div>

              <div className="flex items-center gap-1 bg-[#E9F2FB] dark:bg-[#142233] p-1 rounded-xl border border-[#D4E4F2] dark:border-[#39506B] text-xs font-serif">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterMode === 'all'
                      ? 'bg-white dark:bg-[#243750] text-[#16273B] dark:text-white font-semibold shadow-xs'
                      : 'text-[#5E7C99] dark:text-[#A4C0DA]'
                  }`}
                >
                  Bảng xếp hạng
                </button>
                <button
                  onClick={() => setFilterMode('unvoted')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterMode === 'unvoted'
                      ? 'bg-white dark:bg-[#243750] text-[#16273B] dark:text-white font-semibold shadow-xs'
                      : 'text-[#5E7C99] dark:text-[#A4C0DA]'
                  }`}
                >
                  Chưa thả tim
                </button>
              </div>
            </div>

            {/* Scrollable Stage */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-8 custom-scrollbar">
              {sortedAll.length === 0 ? (
                <div className="py-16 text-center text-[#64829E] dark:text-[#A4C0DA] font-serif">
                  Chưa có nhân vật nào trong danh sách bình chọn.
                </div>
              ) : (
                <>
                  {/* Top 3 Winter Starlight Spotlight Podium */}
                  {podiumOrder.length === 3 && filterMode === 'all' && !searchQuery && (
                    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start pt-1">
                      {podiumOrder.map(({ char, rank, heightClass }) => {
                        const isFirst = rank === 1;
                        const isSecond = rank === 2;
                        const isVoted = !!votedMap[char.id];
                        const isJustVoted = justVotedId === char.id;
                        const sharePct = totalVotes > 0 ? Math.round(((char.votes || 0) / totalVotes) * 100) : 0;

                        return (
                          <motion.div
                            key={char.id}
                            whileHover={{ y: -4 }}
                            onClick={() => {
                              if (onSelectCharacter) {
                                onClose();
                                onSelectCharacter(char);
                              }
                            }}
                            className={`relative rounded-[24px] p-5 text-center flex flex-col items-center gap-3 border transition-all cursor-pointer overflow-hidden ${heightClass} ${
                              isFirst
                                ? 'bg-[#FFFDF8] dark:bg-[#223146] border-amber-300/80 dark:border-amber-400/45 shadow-[0_12px_28px_-8px_rgba(210,158,84,0.22)]'
                                : isSecond
                                ? 'bg-[#F8FBFF] dark:bg-[#1E2E42] border-[#B6CFE6] dark:border-[#4B688A] shadow-sm'
                                : 'bg-[#FFF9FA] dark:bg-[#212D40] border-rose-200/80 dark:border-rose-400/30 shadow-sm'
                            }`}
                          >
                            {/* Rank Header */}
                            <div
                              className={`inline-flex items-center gap-1.5 text-xs font-serif font-bold ${
                                isFirst
                                  ? 'text-amber-600 dark:text-amber-300'
                                  : isSecond
                                  ? 'text-[#5380AD] dark:text-[#AED0F0]'
                                  : 'text-rose-500 dark:text-rose-300'
                              }`}
                            >
                              {isFirst ? (
                                <Crown className="w-4 h-4 fill-amber-400/35" />
                              ) : (
                                <Snowflake className="w-3.5 h-3.5" />
                              )}
                              <span>Hạng {rank}</span>
                            </div>

                            {/* Framed Portrait */}
                            <div
                              className={`relative rounded-full p-1 ${
                                isFirst
                                  ? 'bg-amber-100 dark:bg-amber-900/40 border border-amber-300/80'
                                  : isSecond
                                  ? 'bg-[#E5F0FA] dark:bg-[#293F59] border border-[#AFCBE5]'
                                  : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200'
                              }`}
                            >
                              <img
                                src={char.avatar}
                                alt={char.name}
                                referrerPolicy="no-referrer"
                                className={`${
                                  isFirst ? 'w-20 h-20' : 'w-16 h-16'
                                } rounded-full object-cover object-top border-2 border-white dark:border-[#18273A]`}
                              />
                            </div>

                            {/* Name & Count */}
                            <div className="w-full space-y-0.5">
                              <h4 className="text-base font-bold font-display text-[#203850] dark:text-[#F8FBFF] truncate">
                                {char.name}
                              </h4>
                              <p className="text-xs text-[#5E7C99] dark:text-[#A4C0DA] tabular-nums">
                                <strong className="text-rose-600 dark:text-rose-300">{char.votes || 0}</strong> tim · {sharePct}%
                              </p>
                            </div>

                            {/* Floating +1 animation */}
                            <AnimatePresence>
                              {isJustVoted && (
                                <motion.span
                                  initial={{ opacity: 1, y: 0, scale: 0.9 }}
                                  animate={{ opacity: 0, y: -32, scale: 1.25 }}
                                  exit={{ opacity: 0 }}
                                  className="absolute top-12 right-5 text-sm font-bold text-rose-500 pointer-events-none"
                                >
                                  +1 ♥
                                </motion.span>
                              )}
                            </AnimatePresence>

                            {/* Warm Vote Button */}
                            <button
                              onClick={(e) => handleVoteClick(char.id, e)}
                              disabled={isVoted}
                              className={`w-full py-2 px-3 rounded-xl text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                                isVoted
                                  ? 'bg-[#EAF2FA] dark:bg-[#172538] text-[#6B87A3] dark:text-[#8CA9C7] cursor-default'
                                  : 'bg-rose-500 hover:bg-rose-600 text-white shadow-xs'
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isVoted ? 'fill-rose-300/60' : 'fill-current'}`} />
                              <span>{isVoted ? 'Đã thả tim' : 'Thả tim ngay'}</span>
                            </button>
                          </motion.div>
                        );
                      })}
                    </section>
                  )}

                  {/* Full Visual 2-Column Ballot Gallery */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-serif font-semibold text-[#5E7C99] dark:text-[#A4C0DA] px-1">
                      <span>Tất cả gương mặt ({filteredList.length})</span>
                      <span>1 trái tim / mỗi nhân vật</span>
                    </div>

                    {filteredList.length === 0 ? (
                      <div className="py-10 text-center text-xs text-[#7393B3] font-serif">
                        Không tìm thấy nhân vật phù hợp.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {filteredList.map((char) => {
                          const globalRank = sortedAll.findIndex((c) => c.id === char.id) + 1;
                          const progressPct = Math.round(((char.votes || 0) / topVotes) * 100);
                          const isVoted = !!votedMap[char.id];
                          const isJustVoted = justVotedId === char.id;

                          return (
                            <div
                              key={char.id}
                              className="group relative p-3.5 rounded-2xl bg-white dark:bg-[#1E2F44] border border-[#DCE9F5] dark:border-[#344B66] hover:border-[#8AB3D6] dark:hover:border-[#6A97C2] shadow-xs hover:shadow-md transition-all flex items-center gap-3.5"
                            >
                              {/* Portrait Thumbnail (Unobstructed) */}
                              <div className="shrink-0 flex flex-col items-center gap-1">
                                <img
                                  src={char.avatar}
                                  alt={char.name}
                                  referrerPolicy="no-referrer"
                                  className="w-16 h-16 rounded-2xl object-cover object-top border border-[#D4E4F2] dark:border-[#3D5470]"
                                />
                              </div>

                              {/* Character Details + Ratio Bar */}
                              <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className={`text-[11px] font-mono tabular-nums font-bold shrink-0 ${
                                          globalRank === 1
                                            ? 'text-amber-600 dark:text-amber-300'
                                            : globalRank === 2
                                            ? 'text-[#5380AD] dark:text-[#9AC0E3]'
                                            : globalRank === 3
                                            ? 'text-rose-500 dark:text-rose-300'
                                            : 'text-[#6A8BA8]'
                                        }`}
                                      >
                                        #{globalRank}
                                      </span>
                                      <h5 className="text-sm font-bold font-display text-[#203850] dark:text-[#F8FBFF] truncate">
                                        {char.name}
                                      </h5>
                                    </div>
                                    <p className="text-[11px] text-[#5E7C99] dark:text-[#A4C0DA] truncate">
                                      {char.title}
                                    </p>
                                  </div>
                                  {onSelectCharacter && (
                                    <button
                                      onClick={() => {
                                        onClose();
                                        onSelectCharacter(char);
                                      }}
                                      title="Xem hồ sơ nhân vật"
                                      className="p-1.5 rounded-lg text-[#6A8BA8] hover:text-[#16273B] dark:hover:text-white hover:bg-[#EAF2FA] dark:hover:bg-[#2B3F59] transition-colors shrink-0 cursor-pointer"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>

                                {/* Rose-Sky Progress Bar */}
                                <div className="h-1.5 w-full rounded-full bg-[#EDF4FC] dark:bg-[#142233] overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-rose-300 via-rose-400 to-[#6A97C2] transition-all duration-500"
                                    style={{ width: `${Math.max(4, progressPct)}%` }}
                                  />
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-0.5">
                                  <span className="text-xs font-bold tabular-nums text-rose-600 dark:text-rose-300 inline-flex items-center gap-1">
                                    <Heart className="w-3.5 h-3.5 fill-rose-400/50" />
                                    {char.votes || 0} tim
                                  </span>

                                  <button
                                    onClick={(e) => handleVoteClick(char.id, e)}
                                    disabled={isVoted}
                                    className={`px-3 py-1 rounded-xl text-xs font-serif font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                                      isJustVoted
                                        ? 'bg-emerald-500 text-white'
                                        : isVoted
                                        ? 'bg-[#EAF2FA] dark:bg-[#142233] text-[#6B87A3] dark:text-[#8CA9C7] cursor-default'
                                        : 'bg-rose-500 hover:bg-rose-600 text-white shadow-xs'
                                    }`}
                                  >
                                    {isJustVoted ? (
                                      <>
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        <span>Đã gửi!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Heart className={`w-3.5 h-3.5 ${isVoted ? 'fill-rose-300/60' : 'fill-current'}`} />
                                        <span>{isVoted ? 'Đã thả tim' : 'Thả tim'}</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 border-t border-[#DCE9F5] dark:border-[#334963] bg-white/85 dark:bg-[#1B2B40]/90 text-center">
              <p className="text-xs text-[#5E7C99] dark:text-[#A4C0DA] font-serif flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>Cập nhật trực tiếp · Mỗi lượt thả tim là một ngọn nến ấm giữa mùa đông</span>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

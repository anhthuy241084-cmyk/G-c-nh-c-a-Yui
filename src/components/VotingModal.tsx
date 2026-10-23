import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Trophy, Medal, Flame, CheckCircle, Sparkles } from 'lucide-react';
import { Character } from '../types';
import { triggerHeartConfetti } from '../utils/confetti';

interface VotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  onVote: (characterId: string) => void;
  votedMap?: Record<string, boolean>;
}

export const VotingModal: React.FC<VotingModalProps> = ({
  isOpen,
  onClose,
  characters,
  onVote,
  votedMap = {},
}) => {
  const [justVotedId, setJustVotedId] = useState<string | null>(null);

  // Sort published characters by vote count descending
  const publishedCharacters = characters.filter((c) => !c.isDraft && !c.isPrivate);
  const sortedCharacters = [...publishedCharacters].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  const totalVotes = publishedCharacters.reduce((sum, c) => sum + (c.votes || 0), 0);

  const handleVoteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (votedMap[id]) {
      // Already voted
      return;
    }
    const originX = e.clientX ? e.clientX / window.innerWidth : 0.5;
    const originY = e.clientY ? e.clientY / window.innerHeight : 0.5;
    triggerHeartConfetti(originX, originY);
    onVote(id);
    setJustVotedId(id);
    setTimeout(() => {
      setJustVotedId(null);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-[#FFFDFC] dark:bg-[#0B2530] rounded-3xl shadow-2xl border border-[#BFE7E8] dark:border-[#38CAD6]/30 text-[#49666A] dark:text-[#E9F8F8] overflow-hidden font-serif"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#BFE7E8]/60 dark:border-white/10 bg-[#F5FCFC]/90 dark:bg-black/20">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-[#71BFC6]/15 text-[#1B6E7D] dark:text-[#7DD8DE] border border-[#71BFC6]/30 shadow-xs">
                  <Heart className="w-6 h-6 fill-[#71BFC6]/25" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold tracking-tight text-[#2D494C] dark:text-white">
                      Bảng xếp hạng & Bình chọn
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase text-[#1B6E7D] dark:text-[#7DD8DE] bg-[#E9F8F8] dark:bg-white/10 rounded-full border border-[#BFE7E8] dark:border-white/10">
                      Real-time
                    </span>
                  </div>
                  <p className="text-xs text-[#63878B] dark:text-white/70">
                    Thống kê tổng số <span className="font-bold text-[#1B6E7D] dark:text-[#7DD8DE]">{totalVotes}</span> lượt bình chọn cho các Character AI
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-[#63878B] hover:text-[#2D494C] dark:hover:text-white rounded-full hover:bg-[#E9F8F8] dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Leaderboard List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {sortedCharacters.length === 0 ? (
                <div className="py-16 text-center text-[#63878B] dark:text-white/60 font-medium text-lg">
                  Ơ, không có rồi.
                </div>
              ) : (
                <>
                  {/* Top 3 Podium Highlights */}
                  {sortedCharacters.length >= 3 && (
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {sortedCharacters.slice(0, 3).map((char, index) => {
                        const ranks = [
                          { title: '#1 Quán quân', bg: 'from-amber-400/20 to-amber-100/10 border-amber-400/30 text-amber-700 dark:text-amber-300', icon: Trophy },
                          { title: '#2 Á quân 1', bg: 'from-[#CFE8F5]/50 to-[#E9F8F8]/30 border-[#8CCFD3]/40 text-[#2D494C] dark:text-[#E9F8F8]', icon: Medal },
                          { title: '#3 Á quân 2', bg: 'from-[#F3DDE1]/40 to-[#FAF8FC]/20 border-[#F3DDE1] text-[#6B4B53] dark:text-[#F3DDE1]', icon: Medal }
                        ];
                        const RankIcon = ranks[index].icon;

                        return (
                          <div
                            key={char.id}
                            className={`relative p-3 rounded-2xl bg-gradient-to-b ${ranks[index].bg} border text-center flex flex-col items-center justify-between shadow-xs`}
                          >
                            <div className="absolute -top-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFFDFC] dark:bg-[#0B2530] shadow-xs border border-[#BFE7E8] dark:border-white/10 flex items-center gap-1">
                              <RankIcon className="w-3 h-3 text-[#71BFC6]" />
                              <span>#{index + 1}</span>
                            </div>

                            <img
                              src={char.avatar}
                              alt={char.name}
                              className="w-14 h-14 mt-2 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-xs"
                            />

                            <div className="mt-2 text-center w-full">
                              <p className="text-xs font-bold text-[#2D494C] dark:text-white truncate">
                                {char.name}
                              </p>
                              <p className="text-[11px] font-semibold text-[#1B6E7D] dark:text-[#7DD8DE] mt-0.5 flex items-center justify-center gap-1">
                                <Heart className="w-3 h-3 fill-[#71BFC6] text-[#71BFC6]" />
                                {char.votes} lượt
                              </p>
                            </div>

                            <button
                              onClick={(e) => handleVoteClick(char.id, e)}
                              disabled={votedMap[char.id]}
                              className={`mt-2 w-full py-1 px-2 rounded-xl text-[11px] font-medium shadow-xs transition-transform flex items-center justify-center gap-1 cursor-pointer ${
                                votedMap[char.id]
                                  ? 'bg-[#E9F8F8] dark:bg-white/10 text-[#63878B] dark:text-white/60 border border-[#BFE7E8] cursor-default'
                                  : 'bg-gradient-to-r from-[#8CCFD3] to-[#71BFC6] hover:brightness-105 text-white active:scale-95'
                              }`}
                            >
                              <Heart className={`w-3 h-3 ${votedMap[char.id] ? 'fill-[#71BFC6] text-[#71BFC6]' : 'fill-current'}`} />
                              <span>{votedMap[char.id] ? 'Đã thả tim ♡' : 'Thả tim'}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Full Ranked Table */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#63878B] dark:text-white/60 px-2 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-[#71BFC6]" />
                      <span>Toàn bộ danh sách xếp hạng</span>
                    </h4>

                    {sortedCharacters.map((char, index) => (
                      <div
                        key={char.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F5FCFC] dark:bg-white/5 border border-[#BFE7E8]/60 dark:border-white/10 hover:border-[#71BFC6] transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`w-6 text-center font-extrabold text-sm ${
                            index === 0 ? 'text-amber-500' : index === 1 ? 'text-[#71BFC6]' : index === 2 ? 'text-[#6B4B53]' : 'text-[#63878B]'
                          }`}>
                            #{index + 1}
                          </span>

                          <img
                            src={char.avatar}
                            alt={char.name}
                            className="w-10 h-10 rounded-xl object-cover border border-[#BFE7E8] dark:border-white/10"
                          />

                          <div className="min-w-0">
                            <h5 className="text-sm font-bold text-[#2D494C] dark:text-white truncate">
                              {char.name}
                            </h5>
                            <p className="text-xs text-[#63878B] dark:text-white/60 truncate font-sans">
                              {char.title}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-sm font-bold text-[#1B6E7D] dark:text-[#7DD8DE] flex items-center gap-1 justify-end">
                              <Heart className="w-3.5 h-3.5 fill-[#71BFC6] text-[#71BFC6]" />
                              {char.votes}
                            </span>
                            <span className="text-[10px] text-[#63878B] dark:text-white/60">lượt bình chọn</span>
                          </div>

                          <button
                            onClick={(e) => handleVoteClick(char.id, e)}
                            disabled={votedMap[char.id]}
                            className={`relative px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                              justVotedId === char.id
                                ? 'bg-emerald-500 text-white shadow-xs'
                                : votedMap[char.id]
                                ? 'bg-[#E9F8F8] dark:bg-white/10 text-[#63878B] dark:text-white/60 border border-[#BFE7E8] cursor-default'
                                : 'bg-gradient-to-r from-[#8CCFD3] to-[#71BFC6] hover:brightness-105 text-white shadow-xs active:scale-95'
                            }`}
                          >
                            {justVotedId === char.id ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Đã cộng vote!</span>
                              </>
                            ) : votedMap[char.id] ? (
                              <>
                                <Heart className="w-3.5 h-3.5 fill-[#71BFC6] text-[#71BFC6]" />
                                <span>Đã thả tim</span>
                              </>
                            ) : (
                              <>
                                <Heart className="w-3.5 h-3.5 fill-current" />
                                <span>Thả tim</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer Note */}
            <div className="p-4 border-t border-[#BFE7E8]/60 dark:border-white/10 bg-[#F5FCFC]/90 dark:bg-black/20 text-center">
              <p className="text-xs text-[#63878B] dark:text-white/70 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#71BFC6]" />
                <span>Số lượt bình chọn được cập nhật tức thì theo thời gian thực. Cảm ơn bạn đã bình chọn!</span>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

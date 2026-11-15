import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MessageSquare,
  RefreshCw,
  Paperclip,
  Globe,
  Lock,
  Sparkles,
  Inbox,
  FileEdit,
} from 'lucide-react';
import { CreatorRequest, RequestType, UserProfile } from '../types';
import {
  subscribeCreatorRequests,
  createCreatorRequest,
  updateCreatorRequest,
  getClientRequestToken,
  getMySubmittedRequestIds,
} from '../services/creatorRequestService';
import { compressImageFile } from '../utils/imageCompressor';

interface CreatorRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile;
  onToast: (msg: string) => void;
  isSfxOn?: boolean;
  sfxVolume?: number;
  triggerSfx?: (name: string, vol: number) => void;
  initialTab?: 'public' | 'form' | 'my_requests';
}

export const CreatorRequestModal: React.FC<CreatorRequestModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onToast,
  isSfxOn,
  sfxVolume = 0.5,
  triggerSfx,
  initialTab = 'public',
}) => {
  const [activeTab, setActiveTab] = useState<'public' | 'form' | 'my_requests'>(initialTab);
  const [requests, setRequests] = useState<CreatorRequest[]>([]);

  // Form state (Public by default)
  const [reqName, setReqName] = useState(userProfile?.name || '');
  const [reqType, setReqType] = useState<RequestType>('Request Character');
  const [reqContent, setReqContent] = useState('');
  const [reqImage, setReqImage] = useState('');
  const [reqLink1, setReqLink1] = useState('');
  const [reqLink2, setReqLink2] = useState('');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);

  // Filter on public tab
  const [publicTypeFilter, setPublicTypeFilter] = useState<string>('all');

  // Animation state for submitting
  const [submittingState, setSubmittingState] = useState<'idle' | 'folding' | 'bow' | 'drawer' | 'success'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (userProfile?.name && !reqName) {
      setReqName(userProfile.name);
    }
  }, [userProfile?.name, reqName]);

  useEffect(() => {
    const unsubscribe = subscribeCreatorRequests((data) => {
      setRequests(data);
    });
    return () => unsubscribe();
  }, []);

  const clientToken = useMemo(() => getClientRequestToken(), []);
  const myRequestIds = useMemo(() => getMySubmittedRequestIds(), [requests]);

  // Public board: any request NOT marked isPrivate
  const publicRequests = useMemo(() => {
    return requests.filter((r) => !r.isPrivate);
  }, [requests]);

  const filteredPublicRequests = useMemo(() => {
    if (publicTypeFilter === 'all') return publicRequests;
    return publicRequests.filter((r) => r.requestType === publicTypeFilter);
  }, [publicRequests, publicTypeFilter]);

  // Personal submissions (both public & private created from this browser)
  const myRequests = useMemo(() => {
    return requests.filter(
      (r) => (r.clientToken && r.clientToken === clientToken) || myRequestIds.includes(r.id)
    );
  }, [requests, clientToken, myRequestIds]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressing(true);
        const compressed = await compressImageFile(file, 1200, 1200, 0.85);
        setReqImage(compressed);
        if (onToast) onToast('✨ Ảnh đính kèm đã được tối ưu hóa!');
      } catch (err) {
        console.warn('Compression failed, using reader:', err);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setReqImage(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqContent.trim()) {
      if (onToast) onToast('⚠️ Vui lòng nhập nội dung đơn gửi đến Yui!');
      return;
    }

    if (isSfxOn && triggerSfx) triggerSfx('chime', sfxVolume);

    setSubmittingState('folding');
    setTimeout(() => setSubmittingState('bow'), 650);
    setTimeout(() => setSubmittingState('drawer'), 1300);
    setTimeout(async () => {
      try {
        if (editingRequestId) {
          await updateCreatorRequest(editingRequestId, {
            senderName: reqName.trim() || 'Người ghé thăm ẩn danh',
            requestType: reqType,
            content: reqContent.trim(),
            link1: reqLink1.trim(),
            link2: reqLink2.trim(),
            imageUrl: reqImage || null,
            isPrivate,
            status: 'pending_approval',
            createdAt: new Date().toISOString(),
          });
          setEditingRequestId(null);
          if (onToast) onToast('✨ Đã cập nhật và gửi lại request!');
        } else {
          await createCreatorRequest({
            senderName: reqName.trim() || 'Người ghé thăm ẩn danh',
            requestType: reqType,
            content: reqContent.trim(),
            link1: reqLink1.trim(),
            link2: reqLink2.trim(),
            imageUrl: reqImage || null,
            isPrivate,
            clientToken,
            status: 'pending_approval',
            createdAt: new Date().toISOString(),
          });
          if (onToast) {
            onToast(
              isPrivate
                ? '🔒 Đã gửi request riêng tư đến Yui!'
                : '🌐 Request của bạn đã lên bảng công khai & gửi tới Yui!'
            );
          }
        }

        const wasPrivate = isPrivate;
        setReqContent('');
        setReqLink1('');
        setReqLink2('');
        setReqImage('');
        setIsPrivate(false);
        setSubmittingState('success');
        setTimeout(() => {
          setSubmittingState('idle');
          setActiveTab(wasPrivate ? 'my_requests' : 'public');
        }, 1050);
      } catch (err) {
        console.error(err);
        setSubmittingState('idle');
        if (onToast) onToast('⚠️ Gửi đơn thất bại. Vui lòng thử lại sau!');
      }
    }, 1900);
  };

  const handleEditRevision = (req: CreatorRequest) => {
    setEditingRequestId(req.id);
    setReqName(req.senderName);
    setReqType(req.requestType);
    setReqContent(req.content);
    setReqLink1(req.link1 || '');
    setReqLink2(req.link2 || '');
    setReqImage(req.imageUrl || '');
    setIsPrivate(!!req.isPrivate);
    setActiveTab('form');
  };

  const renderStatusBadge = (status: CreatorRequest['status']) => {
    if (status === 'pending_approval') {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-[#EAF3FC] dark:bg-[#23374F] text-[#4E7AA5] dark:text-[#A8CDF0] border border-[#CFE1F2] dark:border-[#39506B] text-[11px] font-semibold inline-flex items-center gap-1 font-sans">
          <Clock className="w-3 h-3" />
          <span>Chờ Yui xem</span>
        </span>
      );
    }
    if (status === 'approved') {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold inline-flex items-center gap-1 font-sans">
          <CheckCircle2 className="w-3 h-3" />
          <span>Đã nhận đơn</span>
        </span>
      );
    }
    if (status === 'needs_revision') {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-[11px] font-semibold inline-flex items-center gap-1 font-sans">
          <AlertCircle className="w-3 h-3" />
          <span>Cần bổ sung</span>
        </span>
      );
    }
    if (status === 'responded') {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-[#4E7AA5] text-white text-[11px] font-semibold inline-flex items-center gap-1 font-sans">
          <MessageSquare className="w-3 h-3" />
          <span>Yui đã phản hồi</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold inline-flex items-center gap-1 font-sans">
        <XCircle className="w-3 h-3" />
        <span>Chưa phù hợp</span>
      </span>
    );
  };

  const renderRequestCard = (req: CreatorRequest, allowEditRevision: boolean) => (
    <div
      key={req.id}
      className="p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-[#1E2E43]/95 border border-[#D4E4F2] dark:border-[#39506B] space-y-3 shadow-xs hover:border-[#7EAAD4] transition-all"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-[#EAF3FC] dark:bg-[#273C56] text-[#36597A] dark:text-[#CBE0F5] text-[11px] font-bold font-serif border border-[#CFE1F2] dark:border-[#3E5877]">
            {req.requestType}
          </span>

          {req.isPrivate ? (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold inline-flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              Riêng tư
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-[#F2F8FE] dark:bg-[#23374F] text-[#4E7AA5] dark:text-[#A8CDF0] text-[10px] font-semibold inline-flex items-center gap-1 border border-[#DCEAF6] dark:border-[#39506B]">
              <Globe className="w-2.5 h-2.5" />
              Công khai
            </span>
          )}

          <span className="text-[11px] text-[#64829E] dark:text-[#A4C0DA] font-mono tabular-nums">
            {new Date(req.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>

        {renderStatusBadge(req.status)}
      </div>

      <div className="space-y-1.5 font-serif">
        <p className="text-xs font-bold text-[#1D3550] dark:text-[#F0F7FF]">
          Người gửi: <span className="text-[#4E7AA5] dark:text-[#9EC5EC]">{req.senderName}</span>
        </p>
        <p className="text-xs sm:text-[13px] text-[#334A60] dark:text-[#D9E7F5] whitespace-pre-wrap leading-relaxed">
          {req.content}
        </p>
        {(req.link1 || req.link2) && (
          <div className="flex flex-wrap gap-2 pt-1 font-sans">
            {req.link1 && (
              <a
                href={req.link1}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#4E7AA5] dark:text-[#A8CDF0] hover:underline break-all"
              >
                🔗 {req.link1}
              </a>
            )}
            {req.link2 && (
              <a
                href={req.link2}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#4E7AA5] dark:text-[#A8CDF0] hover:underline break-all"
              >
                🔗 {req.link2}
              </a>
            )}
          </div>
        )}
      </div>

      {req.imageUrl && (
        <div className="rounded-xl overflow-hidden max-h-44 border border-[#DCE9F5] dark:border-[#39506B]">
          <img src={req.imageUrl} alt="Đính kèm request" className="w-full h-40 object-cover" />
        </div>
      )}

      {req.adminNote && (
        <div className="p-3 rounded-xl bg-[#F4F9FF] dark:bg-[#172536] border border-[#CFE1F2] dark:border-[#39506B] text-xs text-[#36597A] dark:text-[#BFD7EE] space-y-1 font-serif">
          <p className="font-bold">Ghi chú bổ sung từ Yui:</p>
          <p>{req.adminNote}</p>
        </div>
      )}

      {req.creatorResponse && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#EAF3FC] to-[#F4F9FF] dark:from-[#263B54] dark:to-[#1F3147] border border-[#BFD8EE] dark:border-[#49698C] text-xs text-[#16273B] dark:text-[#F0F7FF] space-y-1.5 font-serif">
          <div className="flex items-center gap-1.5 font-bold text-[#3B6893] dark:text-[#A8CDF0]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phản hồi từ Yui:</span>
          </div>
          <p className="whitespace-pre-wrap leading-relaxed">{req.creatorResponse}</p>
        </div>
      )}

      {allowEditRevision && req.status === 'needs_revision' && (
        <div className="flex justify-end pt-1 font-serif">
          <button
            onClick={() => handleEditRevision(req)}
            className="px-4 py-2 bg-gradient-to-r from-[#6392BE] to-[#4E7AA5] hover:brightness-105 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Bổ sung &amp; Gửi lại đơn</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#122033]/70 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="relative w-full max-w-3xl max-h-[92dvh] bg-[#F5FAFF]/98 dark:bg-[#172536]/98 backdrop-blur-xl rounded-2xl sm:rounded-[28px] shadow-2xl border border-[#CFE1F2] dark:border-[#39506B] overflow-hidden flex flex-col font-sans text-[#172536] dark:text-[#E5EDF5]"
          >
            {/* Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-5 border-b border-[#DCE9F5] dark:border-[#354A60] bg-gradient-to-r from-white via-[#F4F9FF] to-[#E6F1FC] dark:from-[#1A2A3F] dark:via-[#203249] dark:to-[#172536] flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#6392BE] to-[#4E7AA5] text-white flex items-center justify-center shadow-md shadow-[#4E7AA5]/20 shrink-0">
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-lg font-bold font-serif text-[#16273B] dark:text-white flex items-center gap-2 flex-wrap">
                    <span className="truncate">Bảng Request &amp; Hòm Thư Yui</span>
                    <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-md bg-[#EAF3FC] dark:bg-[#273C56] text-[#4E7AA5] dark:text-[#A8CDF0] border border-[#CFE1F2] dark:border-[#3E5877] font-semibold font-sans">
                      Công khai mặc định · Có chế độ riêng tư
                    </span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#5E7C99] dark:text-[#A9BDCE] font-serif truncate">
                    Gửi yêu cầu nhân vật, ý tưởng kịch bản hoặc xem phản hồi từ Yui
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center p-2 text-[#5E7C99] hover:text-[#16273B] dark:text-[#A9BDCE] dark:hover:text-white rounded-full hover:bg-[#EAF3FC] dark:hover:bg-[#273C56] transition-colors cursor-pointer shrink-0"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="px-5 py-2.5 border-b border-[#DCE9F5] dark:border-[#354A60] flex flex-wrap items-center justify-between gap-2 shrink-0 bg-[#EDF5FD]/80 dark:bg-[#1C2C41]/90 font-serif">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => {
                    setActiveTab('public');
                    setEditingRequestId(null);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    activeTab === 'public'
                      ? 'bg-white dark:bg-[#273C56] text-[#35638F] dark:text-white shadow-xs border border-[#CFE1F2] dark:border-[#49698C]'
                      : 'text-[#5E7C99] dark:text-[#A9BDCE] hover:text-[#16273B]'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Bảng Request Công Khai ({publicRequests.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('form')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    activeTab === 'form'
                      ? 'bg-white dark:bg-[#273C56] text-[#35638F] dark:text-white shadow-xs border border-[#CFE1F2] dark:border-[#49698C]'
                      : 'text-[#5E7C99] dark:text-[#A9BDCE] hover:text-[#16273B]'
                  }`}
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>{editingRequestId ? 'Chỉnh sửa đơn' : 'Viết Request Mới'}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('my_requests');
                    setEditingRequestId(null);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    activeTab === 'my_requests'
                      ? 'bg-white dark:bg-[#273C56] text-[#35638F] dark:text-white shadow-xs border border-[#CFE1F2] dark:border-[#49698C]'
                      : 'text-[#5E7C99] dark:text-[#A9BDCE] hover:text-[#16273B]'
                  }`}
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>Đơn của tôi ({myRequests.length})</span>
                </button>
              </div>

              {activeTab !== 'form' && (
                <button
                  onClick={() => setActiveTab('form')}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#6392BE] to-[#4E7AA5] hover:brightness-105 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  + Gửi Request
                </button>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 relative custom-scrollbar">
              {submittingState !== 'idle' && (
                <div className="absolute inset-0 bg-[#F5FAFF]/95 dark:bg-[#172536]/95 z-20 flex flex-col items-center justify-center text-center p-6 space-y-4 font-serif">
                  <motion.div
                    animate={
                      submittingState === 'folding'
                        ? { rotateX: [0, 45, 90], scale: [1, 0.9, 0.8] }
                        : submittingState === 'bow'
                        ? { scale: [0.8, 1.15, 1], rotate: [0, 8, -8, 0] }
                        : submittingState === 'drawer'
                        ? { y: [0, 40, 80], opacity: [1, 0.7, 0] }
                        : { scale: [0.6, 1.08, 1], opacity: [0, 1, 1] }
                    }
                    transition={{ duration: 0.55 }}
                    className="w-24 h-24 rounded-2xl bg-[#EAF3FC] dark:bg-[#202F42] border-2 border-[#7EAAD4] flex items-center justify-center text-4xl shadow-lg"
                  >
                    {submittingState === 'folding' && '📄'}
                    {submittingState === 'bow' && '❄️'}
                    {submittingState === 'drawer' && '📮'}
                    {submittingState === 'success' && '💌'}
                  </motion.div>

                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-[#16273B] dark:text-[#E5EDF5]">
                      {submittingState === 'folding' && 'Đang gấp tờ đơn tuyết trắng...'}
                      {submittingState === 'bow' && 'Đóng dấu bông tuyết...'}
                      {submittingState === 'drawer' &&
                        (isPrivate ? 'Niêm phong gửi riêng tới Yui...' : 'Đăng lên Bảng Request & gửi Yui...')}
                      {submittingState === 'success' && 'Đã gửi thành công đến Yui ✦'}
                    </h4>
                    <p className="text-xs text-[#5E7C99] dark:text-[#A9BDCE]">
                      {submittingState === 'success'
                        ? 'Cảm ơn bạn đã gửi gắm ý tưởng cho góc nhỏ mùa đông!'
                        : 'Vui lòng chờ một nhịp...'}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 1: PUBLIC REQUEST BOARD */}
              {activeTab === 'public' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {['all', 'Request Character', 'Request chỉnh sửa', 'Góp ý website', 'Đề xuất tính năng'].map(
                        (cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setPublicTypeFilter(cat)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                              publicTypeFilter === cat
                                ? 'bg-[#4E7AA5] text-white shadow-xs'
                                : 'bg-white dark:bg-[#202F42] text-[#5E7C99] dark:text-[#A9BDCE] border border-[#DCE9F5] dark:border-[#39506B] hover:border-[#7EAAD4]'
                            }`}
                          >
                            {cat === 'all' ? 'Tất cả' : cat}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {filteredPublicRequests.length === 0 ? (
                    <div className="text-center py-12 space-y-3 bg-white/70 dark:bg-[#202F42]/50 rounded-2xl border border-dashed border-[#CFE1F2] dark:border-[#39506B] p-6">
                      <div className="text-3xl">❄️</div>
                      <p className="text-xs font-serif text-[#43576B] dark:text-[#A9BDCE]">
                        Chưa có request công khai nào ở mục này. Hãy là người đầu tiên gửi ý tưởng cho Yui nhé!
                      </p>
                      <button
                        onClick={() => setActiveTab('form')}
                        className="px-4 py-2 bg-gradient-to-r from-[#6392BE] to-[#4E7AA5] text-white rounded-xl text-xs font-bold font-serif cursor-pointer"
                      >
                        Viết Request đầu tiên
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredPublicRequests.map((req) => renderRequestCard(req, false))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: WRITE REQUEST FORM */}
              {activeTab === 'form' && (
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#202F42] border border-[#DCE9F5] dark:border-[#354A60] shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#DCE9F5] dark:border-[#354A60] pb-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#4E7AA5] dark:text-[#A8CDF0] font-serif">
                        {editingRequestId ? 'Chỉnh sửa & Bổ sung đơn' : 'Tờ đơn Request gửi Yui'}
                      </h4>
                      <span className="text-[11px] font-serif text-[#64829E] dark:text-[#A4C0DA]">✦ ❄️ ✧</span>
                    </div>

                    {/* Visibility Switch: Public by default vs Private toggle */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold font-serif text-[#172536] dark:text-[#E5EDF5]">
                        Chế độ hiển thị:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setIsPrivate(false)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                            !isPrivate
                              ? 'bg-[#EAF3FC] dark:bg-[#273C56] border-[#4E7AA5] text-[#16273B] dark:text-white shadow-xs'
                              : 'bg-[#F7FAFD] dark:bg-[#172536] border-[#DCE9F5] dark:border-[#354A60] text-[#5E7C99] dark:text-[#A9BDCE]'
                          }`}
                        >
                          <Globe className={`w-4 h-4 mt-0.5 shrink-0 ${!isPrivate ? 'text-[#4E7AA5]' : ''}`} />
                          <div>
                            <p className="text-xs font-bold font-serif">Công khai (Mặc định)</p>
                            <p className="text-[10px] opacity-85 leading-snug mt-0.5">
                              Hiển thị trên Bảng Request Công Khai để mọi người cùng xem và theo dõi phản hồi của Yui.
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsPrivate(true)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                            isPrivate
                              ? 'bg-[#EAF3FC] dark:bg-[#273C56] border-[#4E7AA5] text-[#16273B] dark:text-white shadow-xs'
                              : 'bg-[#F7FAFD] dark:bg-[#172536] border-[#DCE9F5] dark:border-[#354A60] text-[#5E7C99] dark:text-[#A9BDCE]'
                          }`}
                        >
                          <Lock className={`w-4 h-4 mt-0.5 shrink-0 ${isPrivate ? 'text-[#4E7AA5]' : ''}`} />
                          <div>
                            <p className="text-xs font-bold font-serif">Riêng tư</p>
                            <p className="text-[10px] opacity-85 leading-snug mt-0.5">
                              Chỉ Yui và mục &ldquo;Đơn của tôi&rdquo; trên trình duyệt này mới xem được.
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Tên & Loại */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-serif">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[#172536] dark:text-[#E5EDF5]">
                          Tên của bạn:
                        </label>
                        <input
                          type="text"
                          value={reqName}
                          onChange={(e) => setReqName(e.target.value)}
                          placeholder="Nhập tên hoặc biệt danh..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7FAFD] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#354A60] text-xs font-medium text-[#172536] dark:text-[#E5EDF5] focus:outline-none focus:ring-2 focus:ring-[#6392BE]/30"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[#172536] dark:text-[#E5EDF5]">
                          Loại yêu cầu:
                        </label>
                        <select
                          value={reqType}
                          onChange={(e) => setReqType(e.target.value as RequestType)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7FAFD] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#354A60] text-xs font-medium text-[#172536] dark:text-[#E5EDF5] focus:outline-none focus:ring-2 focus:ring-[#6392BE]/30 cursor-pointer"
                        >
                          <option value="Request Character">Request Character</option>
                          <option value="Request chỉnh sửa">Request chỉnh sửa</option>
                          <option value="Góp ý website">Góp ý website</option>
                          <option value="Báo lỗi">Báo lỗi</option>
                          <option value="Đề xuất tính năng">Đề xuất tính năng</option>
                          <option value="Hợp tác">Hợp tác</option>
                          <option value="Khác">Khác</option>
                        </select>
                      </div>
                    </div>

                    {/* Nội dung */}
                    <div className="space-y-1.5 font-serif">
                      <label className="block text-xs font-semibold text-[#172536] dark:text-[#E5EDF5]">
                        Nội dung Request:
                      </label>
                      <textarea
                        value={reqContent}
                        onChange={(e) => setReqContent(e.target.value)}
                        placeholder="Mô tả nhân vật bạn muốn Yui tạo, cốt truyện, tính cách hoặc lời nhắn góp ý..."
                        rows={4}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7FAFD] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#354A60] text-xs font-medium text-[#172536] dark:text-[#E5EDF5] focus:outline-none focus:ring-2 focus:ring-[#6392BE]/30 resize-none"
                        required
                      />
                    </div>

                    {/* Links */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-serif">
                      <input
                        type="url"
                        value={reqLink1}
                        onChange={(e) => setReqLink1(e.target.value)}
                        placeholder="Link tham khảo 1 (tùy chọn)..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7FAFD] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#354A60] text-xs font-medium text-[#172536] dark:text-[#E5EDF5] focus:outline-none focus:ring-2 focus:ring-[#6392BE]/30"
                      />
                      <input
                        type="url"
                        value={reqLink2}
                        onChange={(e) => setReqLink2(e.target.value)}
                        placeholder="Link tham khảo 2 (tùy chọn)..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7FAFD] dark:bg-[#172536] border border-[#DCE7EF] dark:border-[#354A60] text-xs font-medium text-[#172536] dark:text-[#E5EDF5] focus:outline-none focus:ring-2 focus:ring-[#6392BE]/30"
                      />
                    </div>

                    {/* Đính kèm ảnh */}
                    <div className="space-y-2 font-serif">
                      <label className="block text-xs font-semibold text-[#172536] dark:text-[#E5EDF5]">
                        Đính kèm ảnh minh họa (Tùy chọn):
                      </label>
                      {reqImage ? (
                        <div className="relative rounded-xl overflow-hidden border border-[#DCE7EF] bg-[#F7FAFD] dark:bg-[#172536] max-h-48">
                          <img src={reqImage} alt="Preview" className="w-full h-40 object-cover" />
                          <button
                            type="button"
                            onClick={() => setReqImage('')}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 text-xs cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isCompressing}
                            className="w-full py-3 rounded-xl border-2 border-dashed border-[#91A9BC]/50 hover:border-[#4E7AA5] bg-[#F7FAFD] dark:bg-[#172536]/60 text-[#4E7AA5] dark:text-[#A9BDCE] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer font-serif"
                          >
                            <Paperclip className="w-4 h-4" />
                            <span>{isCompressing ? 'Đang tải ảnh lên...' : 'Tải lên ảnh minh họa'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-serif text-[#5E7C99] dark:text-[#A9BDCE] flex items-center gap-1">
                      {isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                      {isPrivate ? 'Đơn sẽ được gửi riêng tư' : 'Đơn sẽ hiển thị công khai trên bảng'}
                    </span>

                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-[#6392BE] to-[#4E7AA5] hover:brightness-105 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-[#4E7AA5]/20 transition-transform active:scale-95 cursor-pointer font-serif"
                    >
                      <Send className="w-4 h-4" />
                      <span>{editingRequestId ? 'Gửi lại Request' : 'Gửi Request đến Yui'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: MY SUBMISSIONS */}
              {activeTab === 'my_requests' && (
                <div className="space-y-4">
                  {myRequests.length === 0 ? (
                    <div className="text-center py-12 space-y-3 bg-white/70 dark:bg-[#202F42]/50 rounded-2xl border border-dashed border-[#CFE1F2] dark:border-[#39506B] p-6">
                      <div className="text-3xl">💌</div>
                      <p className="text-xs font-serif text-[#43576B] dark:text-[#A9BDCE]">
                        Bạn chưa gửi request nào từ thiết bị này. Hãy viết lời nhắn đầu tiên cho Yui nhé!
                      </p>
                      <button
                        onClick={() => setActiveTab('form')}
                        className="px-4 py-2 bg-gradient-to-r from-[#6392BE] to-[#4E7AA5] text-white rounded-xl text-xs font-bold font-serif cursor-pointer"
                      >
                        Viết Request ngay
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myRequests.map((req) => renderRequestCard(req, true))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

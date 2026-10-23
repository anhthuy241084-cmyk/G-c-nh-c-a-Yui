import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Image as ImageIcon, Sparkles, Clock, CheckCircle2, AlertCircle, XCircle, MessageSquare, ArrowLeft, RefreshCw, Paperclip } from 'lucide-react';
import { CreatorRequest, RequestType, UserProfile } from '../types';
import { subscribeCreatorRequests, createCreatorRequest, updateCreatorRequest } from '../services/creatorRequestService';
import { compressImageFile } from '../utils/imageCompressor';

interface CreatorRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile;
  onToast: (msg: string) => void;
  isSfxOn?: boolean;
  sfxVolume?: number;
  triggerSfx?: (name: string, vol: number) => void;
}

export const CreatorRequestModal: React.FC<CreatorRequestModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onToast,
  isSfxOn,
  sfxVolume = 0.5,
  triggerSfx,
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'my_requests'>('form');
  const [requests, setRequests] = useState<CreatorRequest[]>([]);
  
  // Form state
  const [reqName, setReqName] = useState(userProfile?.name || '');
  const [reqType, setReqType] = useState<RequestType>('Request Character');
  const [reqContent, setReqContent] = useState('');
  const [reqImage, setReqImage] = useState('');
  const [reqLink1, setReqLink1] = useState('');
  const [reqLink2, setReqLink2] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);

  // Animation state for submitting
  const [submittingState, setSubmittingState] = useState<'idle' | 'folding' | 'bow' | 'drawer' | 'success'>('idle');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userProfile?.name && !reqName) {
      setReqName(userProfile.name);
    }
  }, [userProfile?.name]);

  useEffect(() => {
    const unsubscribe = subscribeCreatorRequests((data) => {
      setRequests(data);
    });
    return () => unsubscribe();
  }, []);

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
      if (onToast) onToast('⚠️ Vui lòng nhập nội dung đơn gửi đến Creator!');
      return;
    }

    if (isSfxOn && triggerSfx) triggerSfx('chime', sfxVolume);

    // Trigger folding & ribbon animation sequence
    setSubmittingState('folding');
    setTimeout(() => {
      setSubmittingState('bow');
    }, 800);
    setTimeout(() => {
      setSubmittingState('drawer');
    }, 1600);
    setTimeout(async () => {
      try {
        if (editingRequestId) {
          // Resubmitting revised request
          await updateCreatorRequest(editingRequestId, {
            senderName: reqName.trim() || 'Người dùng ẩn danh',
            requestType: reqType,
            content: reqContent.trim(),
            link1: reqLink1.trim(),
            link2: reqLink2.trim(),
            imageUrl: reqImage || null,
            status: 'pending_approval',
            createdAt: new Date().toISOString(),
          });
          setEditingRequestId(null);
          if (onToast) onToast('✨ Đã cập nhật và gửi lại đơn thành công!');
        } else {
          // New request
          await createCreatorRequest({
            senderName: reqName.trim() || 'Người dùng ẩn danh',
            requestType: reqType,
            content: reqContent.trim(),
            link1: reqLink1.trim(),
            link2: reqLink2.trim(),
            imageUrl: reqImage || null,
            status: 'pending_approval',
            createdAt: new Date().toISOString(),
          });
          if (onToast) onToast('✨ Đơn của bạn đã được gửi thành công đến Creator!');
        }

        setReqContent('');
        setReqLink1('');
        setReqLink2('');
        setReqImage('');
        setSubmittingState('success');
        setTimeout(() => {
          setSubmittingState('idle');
          setActiveTab('my_requests');
        }, 1200);
      } catch (err) {
        console.error(err);
        setSubmittingState('idle');
        if (onToast) onToast('⚠️ Gửi đơn thất bại. Vui lòng thử lại sau!');
      }
    }, 2400);
  };

  const handleEditRevision = (req: CreatorRequest) => {
    setEditingRequestId(req.id);
    setReqName(req.senderName);
    setReqType(req.requestType);
    setReqContent(req.content);
    setReqLink1(req.link1 || '');
    setReqLink2(req.link2 || '');
    setReqImage(req.imageUrl || '');
    setActiveTab('form');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081B22]/70 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="relative w-full max-w-2xl max-h-[90vh] bg-white/95 dark:bg-[#102F38]/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#65C5CE]/40 dark:border-[#78DCE0]/25 overflow-hidden flex flex-col font-sans text-[#29464C] dark:text-[#DDF5F6]"
          >
            {/* Header */}
            <div className="p-5 border-b border-[#65C5CE]/20 dark:border-[#143943] bg-gradient-to-r from-[#F2FBFC] via-[#E5F5F7] to-[#DDF1F3] dark:from-[#0D2730] dark:via-[#102F38] dark:to-[#143943] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3FAAB7] to-[#247C8C] text-white flex items-center justify-center shadow-md shadow-[#247C8C]/20">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif text-[#29464C] dark:text-[#DDF5F6] flex items-center gap-1.5">
                    <span>Hòm Thư Creator Đại Dương</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#65C5CE]/20 text-[#247C8C] dark:text-[#78DCE0] font-medium font-sans">
                      Tương tác trực tiếp
                    </span>
                  </h3>
                  <p className="text-xs text-[#6B858A] dark:text-[#8FB6BC] font-serif">
                    Gửi yêu cầu nhân vật, góp ý, báo lỗi hoặc đề xuất tính năng
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="p-2 text-[#6B858A] hover:text-[#29464C] dark:text-[#8FB6BC] dark:hover:text-white rounded-full hover:bg-[#65C5CE]/10 dark:hover:bg-[#143943] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 pt-3 border-b border-[#65C5CE]/20 dark:border-[#143943] flex items-center justify-between shrink-0 bg-[#F2FBFC]/40 dark:bg-[#0D2730]/40 font-serif">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('form')}
                  className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'form'
                      ? 'border-[#3FAAB7] text-[#247C8C] dark:text-[#78DCE0]'
                      : 'border-transparent text-[#6B858A] dark:text-[#8FB6BC] hover:text-[#247C8C]'
                  }`}
                >
                  {editingRequestId ? '✏️ Chỉnh sửa đơn' : '📝 Viết đơn yêu cầu mới'}
                </button>

                <button
                  onClick={() => {
                    setActiveTab('my_requests');
                    setEditingRequestId(null);
                  }}
                  className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'my_requests'
                      ? 'border-[#3FAAB7] text-[#247C8C] dark:text-[#78DCE0]'
                      : 'border-transparent text-[#6B858A] dark:text-[#8FB6BC] hover:text-[#247C8C]'
                  }`}
                >
                  <span>📬 Đơn của tôi ({requests.length})</span>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 relative custom-scrollbar">
              {submittingState !== 'idle' ? (
                <div className="absolute inset-0 bg-[#F2FBFC]/95 dark:bg-[#081B22]/95 z-20 flex flex-col items-center justify-center text-center p-6 space-y-4 font-serif">
                  <motion.div
                    animate={
                      submittingState === 'folding'
                        ? { rotateX: [0, 45, 90], scale: [1, 0.9, 0.8] }
                        : submittingState === 'bow'
                        ? { scale: [0.8, 1.2, 1], rotate: [0, 10, -10, 0] }
                        : submittingState === 'drawer'
                        ? { y: [0, 50, 100], opacity: [1, 0.8, 0] }
                        : { scale: [0.5, 1.1, 1], opacity: [0, 1, 1] }
                    }
                    transition={{ duration: 0.6 }}
                    className="w-24 h-24 rounded-2xl bg-[#E5F5F7] dark:bg-[#102F38] border-2 border-[#65C5CE] dark:border-[#78DCE0]/40 flex items-center justify-center text-4xl shadow-lg"
                  >
                    {submittingState === 'folding' && '📄'}
                    {submittingState === 'bow' && '🐚'}
                    {submittingState === 'drawer' && '🗄️'}
                    {submittingState === 'success' && '💌'}
                  </motion.div>

                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-[#29464C] dark:text-[#DDF5F6]">
                      {submittingState === 'folding' && 'Đang gấp tờ đơn giấy...'}
                      {submittingState === 'bow' && 'Đóng dấu ngọc trai biển xinh xắn...'}
                      {submittingState === 'drawer' && 'Trượt vào ngăn kéo quản trị...'}
                      {submittingState === 'success' && 'Đơn đã được gửi đến góc quản trị ✦'}
                    </h4>
                    <p className="text-xs text-[#6B858A] dark:text-[#8FB6BC]">
                      {submittingState === 'success' ? 'Cảm ơn bạn đã đóng góp ý kiến!' : 'Vui lòng đợi giây lát...'}
                    </p>
                  </div>
                </div>
              ) : null}

              {activeTab === 'form' ? (
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  {/* Paper-styled form card */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#0D2730]/80 border border-[#65C5CE]/30 dark:border-[#143943] shadow-xs space-y-4 relative">
                    <div className="absolute top-3 right-3 text-[#3FAAB7] dark:text-[#78DCE0] text-sm font-serif select-none pointer-events-none">
                      ✦ 〜 ✧
                    </div>

                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#247C8C] dark:text-[#78DCE0] font-serif border-b border-[#65C5CE]/20 dark:border-[#143943] pb-2">
                      {editingRequestId ? '✦ Chỉnh sửa & Bổ sung đơn' : '📝 Tờ đơn yêu cầu & góp ý'}
                    </h4>

                    {/* Tên */}
                    <div className="space-y-1.5 font-serif">
                      <label className="block text-xs font-semibold text-[#29464C] dark:text-[#DDF5F6]">
                        Tên của bạn:
                      </label>
                      <input
                        type="text"
                        value={reqName}
                        onChange={(e) => setReqName(e.target.value)}
                        placeholder="Nhập tên của bạn..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2FBFC] dark:bg-[#081B22] border border-[#65C5CE]/40 dark:border-[#143943] text-xs font-medium text-[#29464C] dark:text-[#DDF5F6] focus:outline-none focus:ring-2 focus:ring-[#3FAAB7]/20"
                        required
                      />
                    </div>

                    {/* Loại yêu cầu */}
                    <div className="space-y-1.5 font-serif">
                      <label className="block text-xs font-semibold text-[#29464C] dark:text-[#DDF5F6]">
                        Loại yêu cầu:
                      </label>
                      <select
                        value={reqType}
                        onChange={(e) => setReqType(e.target.value as RequestType)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2FBFC] dark:bg-[#081B22] border border-[#65C5CE]/40 dark:border-[#143943] text-xs font-medium text-[#29464C] dark:text-[#DDF5F6] focus:outline-none focus:ring-2 focus:ring-[#3FAAB7]/20 cursor-pointer"
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

                    {/* Nội dung */}
                    <div className="space-y-1.5 font-serif">
                      <label className="block text-xs font-semibold text-[#29464C] dark:text-[#DDF5F6]">
                        Nội dung:
                      </label>
                      <textarea
                        value={reqContent}
                        onChange={(e) => setReqContent(e.target.value)}
                        placeholder="Viết nội dung muốn gửi đến Creator..."
                        rows={4}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2FBFC] dark:bg-[#081B22] border border-[#65C5CE]/40 dark:border-[#143943] text-xs font-medium text-[#29464C] dark:text-[#DDF5F6] focus:outline-none focus:ring-2 focus:ring-[#3FAAB7]/20 resize-none"
                        required
                      />
                    </div>

                    {/* Links */}
                    <div className="space-y-3 font-serif">
                      <label className="block text-xs font-semibold text-[#29464C] dark:text-[#DDF5F6]">
                        Link đính kèm (Tùy chọn):
                      </label>
                      <input
                        type="url"
                        value={reqLink1}
                        onChange={(e) => setReqLink1(e.target.value)}
                        placeholder="Link 1..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2FBFC] dark:bg-[#081B22] border border-[#65C5CE]/40 dark:border-[#143943] text-xs font-medium text-[#29464C] dark:text-[#DDF5F6] focus:outline-none focus:ring-2 focus:ring-[#3FAAB7]/20"
                      />
                      <input
                        type="url"
                        value={reqLink2}
                        onChange={(e) => setReqLink2(e.target.value)}
                        placeholder="Link 2..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2FBFC] dark:bg-[#081B22] border border-[#65C5CE]/40 dark:border-[#143943] text-xs font-medium text-[#29464C] dark:text-[#DDF5F6] focus:outline-none focus:ring-2 focus:ring-[#3FAAB7]/20"
                      />
                    </div>

                    {/* Đính kèm ảnh */}
                    <div className="space-y-2 font-serif">
                      <label className="block text-xs font-semibold text-[#29464C] dark:text-[#DDF5F6]">
                        Đính kèm ảnh minh họa (Tùy chọn):
                      </label>
                      
                      {reqImage ? (
                        <div className="relative rounded-xl overflow-hidden border border-[#65C5CE]/40 bg-[#F2FBFC] dark:bg-[#081B22] max-h-48">
                          <img src={reqImage} alt="Attachment preview" className="w-full h-40 object-cover" />
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
                            className="w-full py-3 rounded-xl border-2 border-dashed border-[#65C5CE]/50 hover:border-[#3FAAB7] bg-[#F2FBFC] dark:bg-[#081B22]/60 text-[#247C8C] dark:text-[#78DCE0] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer font-serif"
                          >
                            <Paperclip className="w-4 h-4" />
                            <span>{isCompressing ? 'Đang tải ảnh lên...' : '＋ Tải lên ảnh minh họa'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-[#247C8C]/20 transition-transform active:scale-95 cursor-pointer font-serif"
                    >
                      <Send className="w-4 h-4" />
                      <span>✦ Gửi đơn</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 font-serif">
                  {requests.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                      <div className="text-3xl">💌</div>
                      <p className="text-xs text-[#6B858A] dark:text-[#8FB6BC]">Bạn chưa gửi đơn nào. Hãy viết đơn cho Creator nhé!</p>
                      <button
                        onClick={() => setActiveTab('form')}
                        className="px-4 py-2 bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Viết đơn ngay
                      </button>
                    </div>
                  ) : (
                    requests.map((req) => {
                      let statusBadge = null;
                      if (req.status === 'pending_approval') {
                        statusBadge = (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[11px] font-bold flex items-center gap-1 font-sans">
                            <Clock className="w-3 h-3" />
                            <span>✦ Chờ duyệt</span>
                          </span>
                        );
                      } else if (req.status === 'approved') {
                        statusBadge = (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1 font-sans">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>✦ Đã được xác nhận</span>
                          </span>
                        );
                      } else if (req.status === 'needs_revision') {
                        statusBadge = (
                          <span className="px-2.5 py-1 rounded-full bg-[#E5F5F7] dark:bg-[#143943] text-[#247C8C] dark:text-[#78DCE0] text-[11px] font-bold flex items-center gap-1 font-sans">
                            <AlertCircle className="w-3 h-3" />
                            <span>✦ Cần bổ sung thông tin</span>
                          </span>
                        );
                      } else if (req.status === 'responded') {
                        statusBadge = (
                          <span className="px-2.5 py-1 rounded-full bg-[#E5F5F7] dark:bg-[#143943] text-[#247C8C] dark:text-[#78DCE0] text-[11px] font-bold flex items-center gap-1 font-sans">
                            <MessageSquare className="w-3 h-3" />
                            <span>✓ Đã phản hồi từ Creator</span>
                          </span>
                        );
                      } else if (req.status === 'rejected') {
                        statusBadge = (
                          <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1 font-sans">
                            <XCircle className="w-3 h-3" />
                            <span>× Từ chối</span>
                          </span>
                        );
                      }

                      return (
                        <div
                          key={req.id}
                          className="p-4 rounded-2xl bg-white dark:bg-[#0D2730] border border-[#65C5CE]/30 dark:border-[#143943] space-y-3 shadow-xs relative overflow-hidden"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-lg bg-[#E5F5F7] dark:bg-[#102F38] text-[#247C8C] dark:text-[#78DCE0] text-xs font-bold font-serif">
                                {req.requestType}
                              </span>
                              <span className="text-[11px] text-[#6B858A] dark:text-[#8FB6BC] font-mono">
                                {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            {statusBadge}
                          </div>

                          <div className="space-y-1 font-serif">
                            <p className="text-xs font-bold text-[#29464C] dark:text-[#DDF5F6]">Gửi bởi: {req.senderName}</p>
                            <p className="text-xs text-[#6B858A] dark:text-[#8FB6BC] whitespace-pre-wrap leading-relaxed">
                              {req.content}
                            </p>
                            {(req.link1 || req.link2) && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {req.link1 && <a href={req.link1} target="_blank" rel="noopener noreferrer" className="text-xs text-[#3FAAB7] hover:underline break-all">🔗 {req.link1}</a>}
                                {req.link2 && <a href={req.link2} target="_blank" rel="noopener noreferrer" className="text-xs text-[#3FAAB7] hover:underline break-all">🔗 {req.link2}</a>}
                              </div>
                            )}
                          </div>

                          {req.imageUrl && (
                            <div className="rounded-xl overflow-hidden max-h-36 border border-[#65C5CE]/30 dark:border-[#143943]">
                              <img src={req.imageUrl} alt="Request attachment" className="w-full h-32 object-cover" />
                            </div>
                          )}

                          {/* Admin Revision Note */}
                          {req.adminNote && (
                            <div className="p-3 rounded-xl bg-[#E5F5F7] dark:bg-[#102F38] border border-[#65C5CE]/40 dark:border-[#143943] text-xs text-[#247C8C] dark:text-[#78DCE0] space-y-1 font-serif">
                              <p className="font-bold">Yêu cầu bổ sung từ Quản trị viên:</p>
                              <p>{req.adminNote}</p>
                            </div>
                          )}

                          {/* Creator Response */}
                          {req.creatorResponse && (
                            <div className="p-3.5 rounded-xl bg-[#E5F5F7]/80 dark:bg-[#143943]/60 border border-[#65C5CE]/40 dark:border-[#78DCE0]/25 text-xs text-[#29464C] dark:text-[#DDF5F6] space-y-1.5 shadow-inner font-serif">
                              <div className="flex items-center gap-1 font-bold text-[#247C8C] dark:text-[#78DCE0]">
                                <span>✦ Phản hồi từ Creator:</span>
                              </div>
                              <p className="whitespace-pre-wrap leading-relaxed">{req.creatorResponse}</p>
                            </div>
                          )}

                          {/* Action if needs revision */}
                          {req.status === 'needs_revision' && (
                            <div className="flex justify-end pt-2 font-serif">
                              <button
                                onClick={() => handleEditRevision(req)}
                                className="px-4 py-1.5 bg-gradient-to-r from-[#3FAAB7] to-[#247C8C] hover:from-[#65C5CE] hover:to-[#3FAAB7] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Bổ sung & Gửi lại đơn</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
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

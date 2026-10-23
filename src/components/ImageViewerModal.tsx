import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImageViewerModalProps {
  isOpen: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
  characterName?: string;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  isOpen,
  images,
  initialIndex = 0,
  onClose,
  characterName,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoomLevel(1);
  }, [initialIndex, isOpen]);

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        handlePrev();
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handlePrev = () => {
    setZoomLevel(1);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setZoomLevel(1);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.5, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg select-none p-4"
      >
        {/* Top Control Bar */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between text-white"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
              {characterName ? `${characterName}` : 'Ảnh Character'}
            </span>
            {images.length > 1 && (
              <span className="text-xs font-semibold bg-[#71BFC6]/90 px-2.5 py-1 rounded-full">
                {currentIndex + 1} / {images.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
              title="Đặt lại kích thước"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
              title="Phóng to"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#71BFC6] hover:bg-[#5AA9B0] transition-colors text-white ml-2 shadow-lg cursor-pointer"
              title="Đóng chế độ xem toàn màn hình (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gallery Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 z-20 p-3 rounded-full bg-white/10 hover:bg-white/30 text-white transition-all transform hover:scale-110 active:scale-95 border border-white/20"
              title="Ảnh trước"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 z-20 p-3 rounded-full bg-white/10 hover:bg-white/30 text-white transition-all transform hover:scale-110 active:scale-95 border border-white/20"
              title="Ảnh tiếp theo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Center Image Container */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-full max-h-full flex items-center justify-center p-2"
        >
          <motion.img
            key={currentImage}
            src={currentImage}
            alt="Character Fullscreen"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: zoomLevel }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              maxHeight: '85vh',
              maxWidth: '90vw',
              objectFit: 'contain',
            }}
            className="rounded-2xl shadow-2xl border border-white/10 cursor-grab active:cursor-grabbing"
          />
        </div>

        {/* Bottom Thumbnails if multiple images */}
        {images.length > 1 && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-2 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10"
          >
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setZoomLevel(1);
                  setCurrentIndex(idx);
                }}
                className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  idx === currentIndex ? 'border-[#71BFC6] scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

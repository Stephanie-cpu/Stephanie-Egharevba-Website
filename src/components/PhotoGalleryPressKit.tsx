import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Grid,
  Pause,
  Play,
  Sparkles,
  X
} from 'lucide-react';
import {
  ALL_KINETIC_PHOTOS,
  KINETIC_ADVISORY_PHOTOS,
  KINETIC_STAGE_PHOTOS,
  KineticGalleryItem
} from '../data/portfolioData';

interface PhotoGalleryPressKitProps {
  onNavigateToCV?: () => void;
  onNavigateToContact?: () => void;
  reduceMotion?: boolean;
}

const EASE_EDITORIAL: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const PhotoGalleryPressKit: React.FC<PhotoGalleryPressKitProps> = ({
  reduceMotion = false
}) => {
  const [isAnimationPaused, setIsAnimationPaused] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem('stephanie_gallery_paused_v1');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [viewMode, setViewMode] = useState<'kinetic' | 'grid'>('kinetic');
  const [selectedPhoto, setSelectedPhoto] = useState<KineticGalleryItem | null>(null);

  const allPhotos: KineticGalleryItem[] = ALL_KINETIC_PHOTOS;

  const toggleAnimationPlayPause = () => {
    setIsAnimationPaused((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('stephanie_gallery_paused_v1', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  useEffect(() => {
    if (!selectedPhoto) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPhoto(null);
      if (e.key === 'ArrowRight') {
        const currentIndex = allPhotos.findIndex((p) => p.id === selectedPhoto.id);
        const nextIndex = (currentIndex + 1) % allPhotos.length;
        setSelectedPhoto(allPhotos[nextIndex]);
      }
      if (e.key === 'ArrowLeft') {
        const currentIndex = allPhotos.findIndex((p) => p.id === selectedPhoto.id);
        const prevIndex = (currentIndex - 1 + allPhotos.length) % allPhotos.length;
        setSelectedPhoto(allPhotos[prevIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, allPhotos]);

  const track1Items = [...KINETIC_STAGE_PHOTOS, ...KINETIC_STAGE_PHOTOS];
  const track2Items = [...KINETIC_ADVISORY_PHOTOS, ...KINETIC_ADVISORY_PHOTOS];

  const shouldPauseMotion = isAnimationPaused || reduceMotion;

  return (
    <div className="space-y-8">
      {/* Minimalist Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-[#141413]">
          Gallery
        </h1>

        <div className="flex items-center gap-2">
          {viewMode === 'kinetic' && (
            <button
              type="button"
              onClick={toggleAnimationPlayPause}
              aria-pressed={isAnimationPaused}
              aria-label={isAnimationPaused ? 'Play animation' : 'Pause animation'}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                isAnimationPaused
                  ? 'bg-[#1D4ED8] text-white border-[#1D4ED8]'
                  : 'bg-white text-[#141413] border-[#E6E4DD] hover:border-[#1D4ED8]'
              }`}
            >
              {isAnimationPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              )}
            </button>
          )}

          <div className="flex items-center p-1 bg-[#F2EFE9] border border-[#E6E4DD] rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('kinetic')}
              aria-label="Kinetic motion view"
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'kinetic'
                  ? 'bg-white text-[#141413] font-semibold shadow-xs'
                  : 'text-[#575652]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Motion</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-white text-[#141413] font-semibold shadow-xs'
                  : 'text-[#575652]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pure Photo Gallery (No Text Overlays, Badges, or Captions) */}
      {viewMode === 'kinetic' ? (
        <div className="space-y-6 overflow-hidden">
          {/* Track 1: Glides Left */}
          <div
            className="relative overflow-x-auto sm:overflow-hidden select-none"
            tabIndex={0}
            role="region"
            aria-label="Gallery Track 1"
          >
            <div
              className={`flex gap-4 sm:gap-5 items-stretch ${
                shouldPauseMotion ? 'marquee-paused' : 'animate-marquee'
              }`}
            >
              {track1Items.map((photo, idx) => (
                <div
                  key={`${photo.id}-${idx}`}
                  onClick={() => setSelectedPhoto(photo)}
                  role="button"
                  tabIndex={0}
                  aria-label={photo.title}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPhoto(photo);
                    }
                  }}
                  className="group relative w-[290px] sm:w-[370px] lg:w-[430px] h-[250px] sm:h-[290px] rounded-2xl overflow-hidden bg-[#141413] border border-[#E6E4DD] shrink-0 cursor-pointer"
                >
                  <img
                    src={photo.src}
                    alt={photo.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Track 2: Glides Right */}
          <div
            className="relative overflow-x-auto sm:overflow-hidden select-none"
            tabIndex={0}
            role="region"
            aria-label="Gallery Track 2"
          >
            <div
              className={`flex gap-4 sm:gap-5 items-stretch ${
                shouldPauseMotion ? 'marquee-paused' : 'animate-marquee-reverse'
              }`}
            >
              {track2Items.map((photo, idx) => (
                <div
                  key={`${photo.id}-${idx}`}
                  onClick={() => setSelectedPhoto(photo)}
                  role="button"
                  tabIndex={0}
                  aria-label={photo.title}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPhoto(photo);
                    }
                  }}
                  className="group relative w-[290px] sm:w-[370px] lg:w-[430px] h-[250px] sm:h-[290px] rounded-2xl overflow-hidden bg-[#141413] border border-[#E6E4DD] shrink-0 cursor-pointer"
                >
                  <img
                    src={photo.src}
                    alt={photo.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Static Grid View: Pure Photos Only */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {allPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.03, ease: EASE_EDITORIAL }}
              onClick={() => setSelectedPhoto(photo)}
              role="button"
              tabIndex={0}
              aria-label={photo.title}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedPhoto(photo);
                }
              }}
              className="group relative w-full h-[280px] sm:h-[310px] rounded-2xl overflow-hidden bg-[#141413] border border-[#E6E4DD] cursor-pointer"
            >
              <img
                src={photo.src}
                alt={photo.title}
                loading="lazy"
                className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Clean Photo Lightbox Modal (Photo Only) */}
      <AnimatePresence>
        {selectedPhoto && (
          <div
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label="Full size photo"
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              aria-label="Close photo"
              className="fixed top-5 right-5 z-50 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const currentIndex = allPhotos.findIndex((p) => p.id === selectedPhoto.id);
                const prevIndex = (currentIndex - 1 + allPhotos.length) % allPhotos.length;
                setSelectedPhoto(allPhotos[prevIndex]);
              }}
              aria-label="Previous photo"
              className="fixed left-4 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const currentIndex = allPhotos.findIndex((p) => p.id === selectedPhoto.id);
                const nextIndex = (currentIndex + 1) % allPhotos.length;
                setSelectedPhoto(allPhotos[nextIndex]);
              }}
              aria-label="Next photo"
              className="fixed right-4 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ArrowRight className="w-5 h-5" />
            </button>

            <motion.img
              key={selectedPhoto.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: EASE_EDITORIAL }}
              onClick={(e) => e.stopPropagation()}
              src={selectedPhoto.src}
              alt={selectedPhoto.title}
              className="max-h-[88vh] max-w-[92vw] object-contain rounded-xl shadow-2xl"
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

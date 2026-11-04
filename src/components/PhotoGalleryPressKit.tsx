import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Download,
  Expand,
  Upload,
  X
} from 'lucide-react';
import { CV_PDF_URL, PortraitAsset, STEPHANIE_PORTRAITS } from '../data/portfolioData';

interface PhotoGalleryPressKitProps {
  onNavigateToCV: () => void;
  onNavigateToContact: () => void;
}

const PRESS_BIOS = {
  short: {
    label: 'Short Bio (Stage Intro)',
    text: `Stephanie Osasumwen Egharevba is a Nigerian Diversity & Inclusion Lead, Disability Inclusion Specialist, and Tech Strategist. Ranked in the Top 3% of Global Speakers (Sessionize) and ALX Nigeria’s Top 100 Women in Tech (2025), she drives WCAG accessibility and inclusion across the Mastercard Foundation, Jobberman, Microsoft, and Google ecosystems.`
  },
  standard: {
    label: 'Official Speaker Bio',
    text: `Stephanie Osasumwen Egharevba is a Diversity & Inclusion Leader and Disability Inclusion Specialist based in Lagos, Nigeria. She serves as Associate Engagement Officer at Jobberman Nigeria and Talent Corp Ambassador for the Mastercard Foundation Project Initiative. Previously Diversity & Inclusion Lead for the Mastercard Foundation Youth Advisory Council Nigeria—where she founded the 200+ member Alumni Disability Community—she also audits platforms against WCAG standards for the African Disability Forum and Rushbox.`
  }
};

const EASE_EDITORIAL: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const PhotoGalleryPressKit: React.FC<PhotoGalleryPressKitProps> = ({
  onNavigateToCV
}) => {
  const [customPortraits, setCustomPortraits] = useState<PortraitAsset[]>(() => {
    try {
      const saved = localStorage.getItem('stephanie_custom_gallery_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const allPortraits = [...STEPHANIE_PORTRAITS, ...customPortraits];
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeBioTab, setActiveBioTab] = useState<'short' | 'standard'>('short');
  const [copiedBio, setCopiedBio] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % allPortraits.length : null));
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev !== null ? (prev - 1 + allPortraits.length) % allPortraits.length : null
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, allPortraits.length]);

  const handleUploadNewPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const added: PortraitAsset = {
          id: `custom-photo-${Date.now()}`,
          src: reader.result,
          title: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
          caption: 'Official press portrait.',
          attireAndMood: 'Studio Portrait',
          orientation: 'portrait',
          resolutionLabel: 'Press Asset',
          usageRecommendation: 'Media & Speaking'
        };
        const updated = [added, ...customPortraits];
        setCustomPortraits(updated);
        try {
          localStorage.setItem('stephanie_custom_gallery_v1', JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyBio = () => {
    navigator.clipboard.writeText(PRESS_BIOS[activeBioTab].text);
    setCopiedBio(true);
    setTimeout(() => setCopiedBio(false), 2000);
  };

  const currentLightboxItem =
    lightboxIndex !== null && allPortraits[lightboxIndex] ? allPortraits[lightboxIndex] : null;

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Compact Header */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_EDITORIAL }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E6E4DD] pb-6"
      >
        <div className="space-y-1.5">
          <div className="text-xs font-mono text-[#575652]">OFFICIAL MEDIA & PRESS KIT</div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-[#141413]">
            Portrait Gallery
          </h1>
          <p className="text-sm text-[#575652]">
            High-resolution studio photography approved for press and event promotion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <a
            href={CV_PDF_URL}
            download="Stephanie_Egharevba_CV.pdf"
            className="px-4 py-2.5 text-xs font-semibold text-white bg-[#111111] hover:bg-[#1D4ED8] rounded-full inline-flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Executive CV</span>
          </a>
        </div>
      </motion.section>

      {/* Clean Asymmetric Portrait Grid */}
      <section aria-label="Portrait Gallery" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5">
        {allPortraits.map((portrait, index) => {
          const spanClass =
            index === 0
              ? 'lg:col-span-7 lg:row-span-2'
              : index === 1 || index === 2
                ? 'lg:col-span-5'
                : 'lg:col-span-6';

          const heightClass =
            index === 0
              ? 'h-[380px] sm:h-[460px] lg:h-full lg:min-h-[540px]'
              : index === 1 || index === 2
                ? 'h-[320px] sm:h-[260px]'
                : 'h-[360px] sm:h-[420px]';

          return (
            <motion.figure
              key={portrait.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: EASE_EDITORIAL }}
              whileHover={{ y: -4 }}
              className={`group relative rounded-2xl overflow-hidden bg-[#141413] border border-[#E6E4DD] ${spanClass}`}
            >
              <div
                onClick={() => setLightboxIndex(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setLightboxIndex(index);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View ${portrait.title}`}
                className={`relative w-full ${heightClass} overflow-hidden cursor-pointer`}
              >
                <img
                  src={portrait.src}
                  alt={portrait.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between text-white">
                  <span className="font-mono text-[11px] bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-md">
                    0{index + 1}
                  </span>
                  <span className="w-8 h-8 rounded-lg bg-black/50 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-[#1D4ED8] transition-colors">
                    <Expand className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 text-white flex items-end justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-mono text-white/70">
                      {portrait.usageRecommendation}
                    </div>
                    <figcaption className="text-base sm:text-lg font-display font-bold text-white">
                      {portrait.title}
                    </figcaption>
                  </div>

                  <a
                    href={portrait.src}
                    download={`Stephanie_Egharevba_${portrait.id}.jpg`}
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-1.5 text-xs font-medium bg-white text-[#141413] hover:bg-[#1D4ED8] hover:text-white rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </a>
                </div>
              </div>
            </motion.figure>
          );
        })}
      </section>

      {/* Compact Speaker Bio Copy Box */}
      <section className="bg-white border border-[#E6E4DD] rounded-2xl p-5 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E4DD] pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-[#141413]">
              Approved Speaker Bio
            </h2>
            <p className="text-xs text-[#575652]">Ready to copy for event introductions and press.</p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#F2EFE9] rounded-lg border border-[#E6E4DD] w-fit">
            {(['short', 'standard'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveBioTab(key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  activeBioTab === key ? 'bg-white text-[#141413] font-semibold' : 'text-[#575652]'
                }`}
              >
                {key === 'short' ? 'Short (55w)' : 'Standard (90w)'}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm sm:text-base text-[#272725] leading-relaxed max-w-[70ch]">
          {PRESS_BIOS[activeBioTab].text}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleCopyBio}
            className="px-4 py-2 text-xs font-medium text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
          >
            {copiedBio ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedBio ? 'Copied Bio' : 'Copy Bio'}
          </button>

          <button
            type="button"
            onClick={onNavigateToCV}
            className="px-4 py-2 text-xs font-medium text-[#141413] bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg cursor-pointer"
          >
            View Full CV →
          </button>
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {currentLightboxItem && lightboxIndex !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setLightboxIndex(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-[#141413] text-white rounded-2xl overflow-hidden border border-white/15 p-4 sm:p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-white/70">
                  0{lightboxIndex + 1} / 0{allPortraits.length} · {currentLightboxItem.title}
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxIndex(null)}
                  className="w-9 h-9 rounded-lg border border-white/20 flex items-center justify-center text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-black rounded-xl overflow-hidden flex items-center justify-center max-h-[65vh]">
                <img
                  src={currentLightboxItem.src}
                  alt={currentLightboxItem.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain max-h-[65vh]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex((lightboxIndex - 1 + allPortraits.length) % allPortraits.length)
                    }
                    className="px-3 py-2 text-xs border border-white/20 rounded-lg inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightboxIndex((lightboxIndex + 1) % allPortraits.length)}
                    className="px-3 py-2 text-xs border border-white/20 rounded-lg inline-flex items-center gap-1 cursor-pointer"
                  >
                    Next
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <a
                  href={currentLightboxItem.src}
                  download={`Stephanie_Egharevba_${currentLightboxItem.id}.jpg`}
                  className="px-4 py-2 text-xs font-medium bg-[#1D4ED8] text-white rounded-lg inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download High-Res
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

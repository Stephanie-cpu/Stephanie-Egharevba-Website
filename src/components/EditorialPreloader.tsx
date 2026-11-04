import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface EditorialPreloaderProps {
  onComplete: () => void;
  reduceMotion: boolean;
}

const GREETINGS: { text: string; lang: string }[] = [
  { text: 'Hello', lang: 'English' },
  { text: 'Káàbọ̀', lang: 'Yoruba' },
  { text: 'Sannu', lang: 'Hausa' },
  { text: 'Nnọọ', lang: 'Igbo' },
  { text: 'Bonjour', lang: 'French' },
  { text: 'Hola', lang: 'Spanish' },
];

const CURTAIN_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

export const EditorialPreloader: React.FC<EditorialPreloaderProps> = ({
  onComplete,
  reduceMotion,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (reduceMotion) {
      onComplete();
      return;
    }

    let timer: ReturnType<typeof setTimeout>;

    if (currentIndex < GREETINGS.length - 1) {
      // Each greeting stays on screen for 480ms so diacritics & words are readable
      timer = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 480);
    } else {
      // Final greeting ('Hola') holds for 700ms before split reveal
      timer = setTimeout(() => {
        setIsExiting(true);
        // Coordinated 850ms split curtain slide to top/bottom
        const exitTimer = setTimeout(() => {
          onComplete();
        }, 850);
        return () => clearTimeout(exitTimer);
      }, 700);
    }

    return () => clearTimeout(timer);
  }, [currentIndex, reduceMotion, onComplete]);

  if (reduceMotion) return null;

  return (
    <aside
      className="fixed inset-0 z-[9999] pointer-events-auto select-none overflow-hidden"
      aria-label="Editorial language welcome"
      role="status"
      aria-live="polite"
    >
      {/* Top Slab: 50vh, slides up to y: -100% */}
      <motion.div
        initial={{ y: 0 }}
        animate={isExiting ? { y: '-100%' } : { y: 0 }}
        transition={{ duration: 0.85, ease: CURTAIN_EASE }}
        className="absolute top-0 left-0 right-0 h-1/2 bg-[#0B0B0B] border-b border-white/[0.04] will-change-transform"
      />

      {/* Bottom Slab: 50vh, slides down to y: 100% */}
      <motion.div
        initial={{ y: 0 }}
        animate={isExiting ? { y: '100%' } : { y: 0 }}
        transition={{ duration: 0.85, ease: CURTAIN_EASE }}
        className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#0B0B0B] border-t border-white/[0.04] will-change-transform"
      />

      {/* Center Greeting Text Layer: Straddles the horizontal cut line, gently fades out as curtains part */}
      <motion.div
        animate={isExiting ? { opacity: 0, scale: 0.97 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            className="flex items-center gap-3 sm:gap-4 px-6 text-white"
          >
            {/* Subtle Royal Blue Indicator Dot */}
            <span
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#1D4ED8] shrink-0 shadow-[0_0_12px_rgba(29,78,216,0.6)]"
              aria-hidden="true"
            />
            <span className="text-3xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight text-white leading-none">
              {GREETINGS[currentIndex].text}
            </span>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </aside>
  );
};

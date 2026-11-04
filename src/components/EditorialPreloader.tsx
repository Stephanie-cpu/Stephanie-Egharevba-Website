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

export const EditorialPreloader: React.FC<EditorialPreloaderProps> = ({
  onComplete,
  reduceMotion,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [textVisible, setTextVisible] = useState(true);

  useEffect(() => {
    if (reduceMotion) {
      onComplete();
      return;
    }

    // Step through each greeting (230ms per language)
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev < GREETINGS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          // Rapid text fade out, then curtain slide-up
          setTimeout(() => {
            setTextVisible(false);
            setTimeout(() => {
              setIsExiting(true);
              setTimeout(() => {
                onComplete();
              }, 600); // 600ms curtain slide duration
            }, 120);
          }, 200);
          return prev;
        }
      });
    }, 230);

    return () => clearInterval(interval);
  }, [reduceMotion, onComplete]);

  if (reduceMotion) return null;

  return (
    <motion.aside
      initial={{ y: 0 }}
      animate={isExiting ? { y: '-100%' } : { y: 0 }}
      transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B0B0B] text-white select-none pointer-events-auto"
      aria-label="Editorial language welcome"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        {textVisible && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="flex items-center gap-3 sm:gap-4 px-6"
          >
            {/* Subtle Royal Blue Indicator Dot */}
            <span
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#1D4ED8] shrink-0"
              aria-hidden="true"
            />
            <span className="text-3xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight text-white leading-none">
              {GREETINGS[currentIndex].text}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};

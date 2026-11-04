import React, { useState, useEffect } from 'react';
import {
  Accessibility,
  Sun,
  Moon,
  Contrast,
  Type,
  Eye,
  Sparkles,
  RotateCcw,
  X,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type ThemeMode = 'light' | 'dark' | 'contrast';
export type FontScaleMode = 'normal' | 'lg' | 'xl';

export interface AccessibilityPreferences {
  theme: ThemeMode;
  fontScale: FontScaleMode;
  readableFont: boolean;
  highlightLinks: boolean;
  reduceMotion: boolean;
}

interface FloatingAccessibilityWidgetProps {
  preferences: AccessibilityPreferences;
  onUpdatePreferences: (next: AccessibilityPreferences) => void;
  onResetPreferences: () => void;
  onNavigateToContrastLab?: () => void;
}

export const FloatingAccessibilityWidget: React.FC<FloatingAccessibilityWidgetProps> = ({
  preferences,
  onUpdatePreferences,
  onResetPreferences,
  onNavigateToContrastLab,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const activeFeaturesCount = [
    preferences.theme !== 'light',
    preferences.fontScale !== 'normal',
    preferences.readableFont,
    preferences.highlightLinks,
    preferences.reduceMotion,
  ].filter(Boolean).length;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-label="Accessibility and Display Preferences"
            className="mb-3 w-[320px] sm:w-[360px] rounded-2xl border border-[#E5E4DF] bg-white p-5 shadow-2xl text-[#111111]"
          >
            <div className="flex items-center justify-between border-b border-[#E5E4DF] pb-3.5 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1D4ED8] text-white">
                  <Accessibility className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-display text-sm font-bold tracking-tight text-[#111111]">
                    Accessibility & Theme
                  </h2>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#737373]">
                    WCAG 2.2 AA/AAA Controls
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close accessibility menu"
                className="rounded-lg p-1.5 text-[#737373] hover:bg-[#F2F0EB] hover:text-[#111111] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 1. Theme Mode: Light / Dark / High Contrast */}
            <div className="mb-4">
              <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#737373] mb-2">
                Display Mode
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onUpdatePreferences({ ...preferences, theme: 'light' })
                  }
                  aria-pressed={preferences.theme === 'light'}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition-all cursor-pointer ${
                    preferences.theme === 'light'
                      ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                      : 'border-[#E5E4DF] bg-[#FAFAF8] text-[#111111] hover:border-[#111111]'
                  }`}
                >
                  <Sun className="h-4 w-4" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdatePreferences({ ...preferences, theme: 'dark' })
                  }
                  aria-pressed={preferences.theme === 'dark'}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition-all cursor-pointer ${
                    preferences.theme === 'dark'
                      ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                      : 'border-[#E5E4DF] bg-[#FAFAF8] text-[#111111] hover:border-[#111111]'
                  }`}
                >
                  <Moon className="h-4 w-4" />
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdatePreferences({ ...preferences, theme: 'contrast' })
                  }
                  aria-pressed={preferences.theme === 'contrast'}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition-all cursor-pointer ${
                    preferences.theme === 'contrast'
                      ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                      : 'border-[#E5E4DF] bg-[#FAFAF8] text-[#111111] hover:border-[#111111]'
                  }`}
                >
                  <Contrast className="h-4 w-4" />
                  <span>Contrast</span>
                </button>
              </div>
            </div>

            {/* 2. Text Size Scaling */}
            <div className="mb-4">
              <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#737373] mb-2">
                Text Scaling
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'normal', label: '100% Default' },
                    { id: 'lg', label: '110% Large' },
                    { id: 'xl', label: '120% XL' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      onUpdatePreferences({ ...preferences, fontScale: item.id })
                    }
                    aria-pressed={preferences.fontScale === item.id}
                    className={`rounded-xl border py-2 px-2 text-xs font-semibold transition-all cursor-pointer ${
                      preferences.fontScale === item.id
                        ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                        : 'border-[#E5E4DF] bg-[#FAFAF8] text-[#111111] hover:border-[#111111]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Toggle Switches */}
            <div className="space-y-2 mb-4">
              <button
                type="button"
                onClick={() =>
                  onUpdatePreferences({
                    ...preferences,
                    readableFont: !preferences.readableFont,
                  })
                }
                aria-pressed={preferences.readableFont}
                className="w-full flex items-center justify-between rounded-xl border border-[#E5E4DF] bg-[#FAFAF8] px-3.5 py-2.5 text-left hover:border-[#111111] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5 text-xs font-semibold text-[#111111]">
                  <Type className="h-4 w-4 text-[#1D4ED8]" />
                  <span>Dyslexia-Friendly & Wide Spacing</span>
                </span>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-md border text-[10px] ${
                    preferences.readableFont
                      ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                      : 'border-[#D4D2CC] bg-white'
                  }`}
                >
                  {preferences.readableFont && <Check className="h-3 w-3" />}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdatePreferences({
                    ...preferences,
                    highlightLinks: !preferences.highlightLinks,
                  })
                }
                aria-pressed={preferences.highlightLinks}
                className="w-full flex items-center justify-between rounded-xl border border-[#E5E4DF] bg-[#FAFAF8] px-3.5 py-2.5 text-left hover:border-[#111111] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5 text-xs font-semibold text-[#111111]">
                  <Eye className="h-4 w-4 text-[#1D4ED8]" />
                  <span>Highlight Links & Focus Rings</span>
                </span>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-md border text-[10px] ${
                    preferences.highlightLinks
                      ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                      : 'border-[#D4D2CC] bg-white'
                  }`}
                >
                  {preferences.highlightLinks && <Check className="h-3 w-3" />}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdatePreferences({
                    ...preferences,
                    reduceMotion: !preferences.reduceMotion,
                  })
                }
                aria-pressed={preferences.reduceMotion}
                className="w-full flex items-center justify-between rounded-xl border border-[#E5E4DF] bg-[#FAFAF8] px-3.5 py-2.5 text-left hover:border-[#111111] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5 text-xs font-semibold text-[#111111]">
                  <Sparkles className="h-4 w-4 text-[#1D4ED8]" />
                  <span>Pause Animations & Marquee</span>
                </span>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-md border text-[10px] ${
                    preferences.reduceMotion
                      ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                      : 'border-[#D4D2CC] bg-white'
                  }`}
                >
                  {preferences.reduceMotion && <Check className="h-3 w-3" />}
                </span>
              </button>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#E5E4DF]">
              <button
                type="button"
                onClick={onResetPreferences}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#525252] hover:text-[#111111] transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Defaults
              </button>

              {onNavigateToContrastLab && (
                <button
                  type="button"
                  onClick={() => {
                    onNavigateToContrastLab();
                    setIsOpen(false);
                  }}
                  className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[#1D4ED8] hover:underline cursor-pointer"
                >
                  Open Contrast Lab →
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Circular Button on All Pages */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open Accessibility and Theme Controls"
        aria-expanded={isOpen}
        title="Accessibility & Display Controls (Light/Dark Mode, Text Size, Contrast)"
        className="group relative flex h-13 w-13 items-center justify-center rounded-full bg-[#1D4ED8] text-white shadow-xl ring-2 ring-white/80 hover:bg-[#1E40AF] hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#60A5FA] transition-all cursor-pointer"
      >
        <Accessibility className="h-6 w-6" />
        {activeFeaturesCount > 0 && (
          <span
            aria-label={`${activeFeaturesCount} accessibility settings active`}
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#10B981] font-mono text-[10px] font-bold text-white shadow"
          >
            {activeFeaturesCount}
          </span>
        )}
      </button>
    </div>
  );
};

import React, { useState } from 'react';
import { Check, AlertTriangle, Copy, RotateCcw } from 'lucide-react';

interface PresetPair {
  name: string;
  fg: string;
  bg: string;
}

const PRESETS: PresetPair[] = [
  { name: 'Editorial Ink', fg: '#141413', bg: '#FAF9F6' },
  { name: 'Cobalt CTA', fg: '#FFFFFF', bg: '#1D4ED8' },
  { name: 'Stark Dark', fg: '#FAF9F6', bg: '#0B0B0B' },
  { name: 'Low Contrast (Fail)', fg: '#9CA3AF', bg: '#F3F4F6' }
];

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.padEnd(6, '0').slice(0, 6);
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const transform = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const [R, G, B] = [transform(r), transform(g), transform(b)];
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function calculateContrastRatio(fgHex: string, bgHex: string): number {
  try {
    const l1 = relativeLuminance(hexToRgb(fgHex));
    const l2 = relativeLuminance(hexToRgb(bgHex));
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  } catch {
    return 1;
  }
}

export const AccessibilitySandbox: React.FC = () => {
  const [fgColor, setFgColor] = useState('#141413');
  const [bgColor, setBgColor] = useState('#FAF9F6');
  const [copiedSpec, setCopiedSpec] = useState(false);

  const ratio = calculateContrastRatio(fgColor, bgColor);
  const passBodyAA = ratio >= 4.5;
  const passBodyAAA = ratio >= 7.0;
  const passLargeAA = ratio >= 3.0;

  const handleCopyTokens = () => {
    const snippet = `--surface-bg: ${bgColor};\n--text-fg: ${fgColor};\n/* WCAG 2.2 Ratio: ${ratio.toFixed(2)}:1 (${passBodyAAA ? 'AAA' : passBodyAA ? 'AA' : 'Fail'}) */`;
    navigator.clipboard.writeText(snippet);
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 2000);
  };

  return (
    <section
      aria-labelledby="sandbox-heading"
      className="border border-[#E6E4DD] bg-white rounded-2xl p-5 sm:p-8 space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E6E4DD] pb-5">
        <div className="space-y-1">
          <div className="text-xs font-mono text-[#575652]">WCAG 2.2 LIVE DIAGNOSTIC</div>
          <h2
            id="sandbox-heading"
            className="text-xl sm:text-2xl font-display font-bold tracking-tight text-[#141413]"
          >
            Accessibility Contrast Lab
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setFgColor('#141413');
              setBgColor('#FAF9F6');
            }}
            className="px-3 py-2 text-xs font-medium text-[#575652] hover:text-[#141413] border border-[#E6E4DD] rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={handleCopyTokens}
            className="px-3.5 py-2 text-xs font-medium text-white bg-[#141413] hover:bg-[#1D4ED8] rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            {copiedSpec ? 'Copied CSS' : 'Copy CSS'}
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((preset) => {
          const isSelected =
            preset.fg.toLowerCase() === fgColor.toLowerCase() &&
            preset.bg.toLowerCase() === bgColor.toLowerCase();
          return (
            <button
              key={preset.name}
              type="button"
              onClick={() => {
                setFgColor(preset.fg);
                setBgColor(preset.bg);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[#141413] text-white border-[#141413]'
                  : 'bg-[#FAF9F6] text-[#141413] border-[#E6E4DD] hover:border-[#141413]'
              }`}
            >
              {preset.name}
            </button>
          );
        })}
      </div>

      {/* Controls & Live Surface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 flex flex-col justify-between space-y-5 bg-[#FAF9F6] p-5 rounded-xl border border-[#E6E4DD]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <div>
              <label htmlFor="fg-color-input" className="block text-xs font-medium text-[#141413] mb-1.5">
                Text Color
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  id="fg-color-picker"
                  type="color"
                  aria-label="Pick text color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-9 h-9 rounded cursor-pointer border border-[#E6E4DD] bg-white p-0.5 shrink-0"
                />
                <input
                  id="fg-color-input"
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm font-mono bg-white border border-[#E6E4DD] rounded-lg"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bg-color-input" className="block text-xs font-medium text-[#141413] mb-1.5">
                Background Color
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  id="bg-color-picker"
                  type="color"
                  aria-label="Pick background color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-9 h-9 rounded cursor-pointer border border-[#E6E4DD] bg-white p-0.5 shrink-0"
                />
                <input
                  id="bg-color-input"
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm font-mono bg-white border border-[#E6E4DD] rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E6E4DD] space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-mono text-[#575652]">CONTRAST RATIO</span>
              <span className="text-2xl sm:text-3xl font-display font-bold tabular-nums text-[#141413]">
                {ratio.toFixed(2)} : 1
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-white border border-[#E6E4DD] text-center space-y-1">
                <div className="text-[10px] font-mono text-[#575652]">AA BODY</div>
                <div className="font-mono font-semibold inline-flex items-center gap-1">
                  {passBodyAA ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#15803D]" />
                      <span className="text-[#15803D]">Pass</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-[#B91C1C]" />
                      <span className="text-[#B91C1C]">Fail</span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-[#E6E4DD] text-center space-y-1">
                <div className="text-[10px] font-mono text-[#575652]">AAA BODY</div>
                <div className="font-mono font-semibold inline-flex items-center gap-1">
                  {passBodyAAA ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#15803D]" />
                      <span className="text-[#15803D]">Pass</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-[#B45309]" />
                      <span className="text-[#B45309]">Low</span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-[#E6E4DD] text-center space-y-1">
                <div className="text-[10px] font-mono text-[#575652]">LARGE AA</div>
                <div className="font-mono font-semibold inline-flex items-center gap-1">
                  {passLargeAA ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#15803D]" />
                      <span className="text-[#15803D]">Pass</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-[#B91C1C]" />
                      <span className="text-[#B91C1C]">Fail</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div
          className="lg:col-span-7 rounded-xl p-6 sm:p-8 flex flex-col justify-between border border-[#E6E4DD] transition-colors"
          style={{ backgroundColor: bgColor, color: fgColor }}
        >
          <div className="flex items-center justify-between text-xs font-mono opacity-80 border-b border-current/20 pb-3">
            <span>LIVE PREVIEW</span>
            <span className="tabular-nums">
              {fgColor.toUpperCase()} / {bgColor.toUpperCase()}
            </span>
          </div>

          <div className="my-6 space-y-2.5">
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              “Disability is not the problem—design is the problem.”
            </h3>
            <p className="text-sm sm:text-base leading-relaxed max-w-[56ch]">
              Testing foreground and surface pairings against WCAG 2.2 AA (4.5:1) and AAA (7.0:1) legibility standards.
            </p>
          </div>

          <div className="pt-3 border-t border-current/20 flex items-center justify-between text-xs font-mono">
            <span>STEPHANIE EGHAREVBA</span>
            <span>{passBodyAA ? 'WCAG AA VERIFIED' : 'NEEDS HIGHER CONTRAST'}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

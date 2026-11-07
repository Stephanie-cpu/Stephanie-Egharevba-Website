import React, { useState } from 'react';

interface PresetPair {
  name: string;
  fg: string;
  bg: string;
}

const PRESETS: PresetPair[] = [
  { name: 'Editorial Ink', fg: '#0F172A', bg: '#F8FAFC' },
  { name: 'Warm Stone', fg: '#141413', bg: '#FAF9F6' },
  { name: 'Stark Dark', fg: '#F8FAFC', bg: '#0B0B0B' },
  { name: 'Low Contrast', fg: '#94A3B8', bg: '#F1F5F9' },
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
    const snippet = `--surface-bg: ${bgColor};\n--text-fg: ${fgColor};\n/* WCAG 2.2 Ratio: ${ratio.toFixed(2)}:1 */`;
    navigator.clipboard.writeText(snippet);
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 2000);
  };

  return (
    <section aria-labelledby="sandbox-heading" className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="font-mono text-xs uppercase tracking-wider text-[#575652]">
            LIVE TOOL
          </div>
          <h2
            id="sandbox-heading"
            className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-[#141413]"
          >
            WCAG Contrast Tester
          </h2>
        </div>

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
                    : 'bg-white text-[#575652] border-[#E6E4DD] hover:border-[#141413]'
                }`}
              >
                {preset.name}
              </button>
            );
          })}
          <button
            type="button"
            onClick={handleCopyTokens}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#141413] hover:bg-[#3F3E3A] rounded-lg transition-colors cursor-pointer"
          >
            {copiedSpec ? 'Copied' : 'Copy CSS'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Controls & Score */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-[#E6E4DD] flex flex-col justify-between gap-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="fg-color-input"
                className="block text-[11px] font-mono uppercase tracking-wider text-[#575652] mb-1.5"
              >
                Text
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="fg-color-picker"
                  type="color"
                  aria-label="Pick text color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-[#E6E4DD] bg-white p-0.5 shrink-0"
                />
                <input
                  id="fg-color-input"
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-full min-w-0 px-2.5 py-1.5 text-xs font-mono bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg text-[#141413]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="bg-color-input"
                className="block text-[11px] font-mono uppercase tracking-wider text-[#575652] mb-1.5"
              >
                Background
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="bg-color-picker"
                  type="color"
                  aria-label="Pick background color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-[#E6E4DD] bg-white p-0.5 shrink-0"
                />
                <input
                  id="bg-color-input"
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full min-w-0 px-2.5 py-1.5 text-xs font-mono bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg text-[#141413]"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E6E4DD] flex items-end justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#575652]">
                Ratio
              </div>
              <div className="text-3xl font-display font-bold tabular-nums text-[#141413]">
                {ratio.toFixed(2)}:1
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span
                className={`px-2.5 py-1 rounded border ${
                  passLargeAA
                    ? 'bg-[#141413] text-white border-[#141413]'
                    : 'bg-[#FAF9F6] text-[#575652] border-[#E6E4DD]'
                }`}
              >
                AA Large: {passLargeAA ? 'PASS' : 'FAIL'}
              </span>
              <span
                className={`px-2.5 py-1 rounded border ${
                  passBodyAA
                    ? 'bg-[#141413] text-white border-[#141413]'
                    : 'bg-[#FAF9F6] text-[#575652] border-[#E6E4DD]'
                }`}
              >
                AA: {passBodyAA ? 'PASS' : 'FAIL'}
              </span>
              <span
                className={`px-2.5 py-1 rounded border ${
                  passBodyAAA
                    ? 'bg-[#141413] text-white border-[#141413]'
                    : 'bg-[#FAF9F6] text-[#575652] border-[#E6E4DD]'
                }`}
              >
                AAA: {passBodyAAA ? 'PASS' : 'FAIL'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Preview Surface */}
        <div
          className="lg:col-span-7 rounded-2xl p-6 sm:p-8 flex flex-col justify-between border border-[#E6E4DD] transition-colors"
          style={{ backgroundColor: bgColor, color: fgColor }}
        >
          <div className="flex items-center justify-between text-xs font-mono opacity-75">
            <span>PREVIEW</span>
            <span className="tabular-nums">
              {fgColor.toUpperCase()} / {bgColor.toUpperCase()}
            </span>
          </div>

          <div className="my-4 space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
              Disability is not the problem—design is the problem.
            </h3>
            <p className="text-xs sm:text-sm opacity-90">
              Live WCAG 2.2 contrast check for body text (4.5:1) and large headings (3.0:1).
            </p>
          </div>

          <div className="text-[11px] font-mono uppercase tracking-wider opacity-75">
            {passBodyAA ? 'WCAG 2.2 AA COMPLIANT' : 'BELOW 4.5:1 THRESHOLD'}
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { Check, AlertTriangle, Copy, RotateCcw } from 'lucide-react';

interface PresetPair {
  name: string;
  fg: string;
  bg: string;
}

const PRESETS: PresetPair[] = [
  { name: 'Editorial Ink', fg: '#0F172A', bg: '#F8FAFC' },
  { name: 'Cobalt CTA', fg: '#FFFFFF', bg: '#1D4ED8' },
  { name: 'Stark Dark', fg: '#F8FAFC', bg: '#0B0B0B' },
  { name: 'Low Contrast (Fail)', fg: '#94A3B8', bg: '#F1F5F9' },
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
  const [fgColor, setFgColor] = useState('#0F172A');
  const [bgColor, setBgColor] = useState('#F8FAFC');
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
    <section aria-labelledby="sandbox-heading" className="space-y-6 pt-6 border-t border-[#E2E8F0]">
      {/* Narrative Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-[#1D4ED8]">
            INTERACTIVE ACCESSIBILITY LAB
          </div>
          <h2
            id="sandbox-heading"
            className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-[#0F172A]"
          >
            How I Test Color Systems in Practice
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setFgColor('#0F172A');
              setBgColor('#F8FAFC');
            }}
            className="px-3.5 py-2 text-xs font-semibold text-[#475569] hover:text-[#0F172A] bg-white border border-[#E2E8F0] hover:border-[#0F172A] rounded-full inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={handleCopyTokens}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#111111] hover:bg-[#1D4ED8] rounded-full inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedSpec ? 'Copied CSS Tokens' : 'Copy CSS Tokens'}</span>
          </button>
        </div>
      </div>

      {/* Diagnostic Engine Card */}
      <div className="border border-[#E2E8F0] bg-white rounded-3xl p-5 sm:p-8 space-y-6 overflow-hidden">
        {/* Preset Token Pairings */}
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
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F172A] text-white border-[#0F172A]'
                    : 'bg-[#F8FAFC] text-[#334155] border-[#E2E8F0] hover:border-[#0F172A]'
                }`}
              >
                {preset.name}
              </button>
            );
          })}
        </div>

        {/* Mobile-Responsive 2-Column Stack (Stacks into 1 vertical column on phones) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Color Inputs & Live WCAG Pass/Fail Matrix */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5 bg-[#F8FAFC] p-5 rounded-2xl border border-[#E2E8F0] min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="min-w-0">
                <label
                  htmlFor="fg-color-input"
                  className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                >
                  Foreground / Text Token
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    id="fg-color-picker"
                    type="color"
                    aria-label="Pick text color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-[#E2E8F0] bg-white p-0.5 shrink-0"
                  />
                  <input
                    id="fg-color-input"
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-full min-w-0 px-3 py-1.5 text-sm font-mono bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                  />
                </div>
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="bg-color-input"
                  className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                >
                  Surface / Background Token
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    id="bg-color-picker"
                    type="color"
                    aria-label="Pick background color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-[#E2E8F0] bg-white p-0.5 shrink-0"
                  />
                  <input
                    id="bg-color-input"
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full min-w-0 px-3 py-1.5 text-sm font-mono bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] space-y-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-mono text-[#64748B]">CONTRAST RATIO</span>
                <span className="text-2xl sm:text-3xl font-display font-bold tabular-nums text-[#0F172A]">
                  {ratio.toFixed(2)} : 1
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-white border border-[#E2E8F0] text-center space-y-1">
                  <div className="text-[10px] font-mono text-[#64748B]">AA BODY</div>
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

                <div className="p-2.5 rounded-xl bg-white border border-[#E2E8F0] text-center space-y-1">
                  <div className="text-[10px] font-mono text-[#64748B]">AAA BODY</div>
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

                <div className="p-2.5 rounded-xl bg-white border border-[#E2E8F0] text-center space-y-1">
                  <div className="text-[10px] font-mono text-[#64748B]">LARGE AA</div>
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

          {/* Right Column: Live Surface Preview + Clear One-Line Takeaway Caption */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-3 min-w-0">
            <div
              className="flex-1 rounded-2xl p-6 sm:p-8 flex flex-col justify-between border border-[#E2E8F0] transition-colors overflow-hidden break-words"
              style={{ backgroundColor: bgColor, color: fgColor }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono opacity-80 border-b border-current/20 pb-3">
                <span>LIVE COMPONENT SURFACE</span>
                <span className="tabular-nums">
                  {fgColor.toUpperCase()} / {bgColor.toUpperCase()}
                </span>
              </div>

              <div className="my-6 space-y-2.5">
                <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight leading-snug">
                  “Disability is not the problem—design is the problem.”
                </h3>
                <p className="text-sm sm:text-base leading-relaxed max-w-[54ch]">
                  Testing foreground and surface pairings against WCAG 2.2 AA (4.5:1) and AAA
                  (7.0:1) legibility standards before tokens ship to production.
                </p>
              </div>

              <div className="pt-3 border-t border-current/20 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <span>STEPHANIE EGHAREVBA · WCAG LAB</span>
                <span>{passBodyAA ? 'WCAG 2.2 AA VERIFIED' : 'CONTRAST REMEDIATION REQUIRED'}</span>
              </div>
            </div>

            {/* One-Line Takeaway Caption Under Preview */}
            <p className="text-xs sm:text-[13px] text-[#64748B] px-1 leading-relaxed">
              A live diagnostic tool demonstrating real-time contrast calculations, token
              compliance, and WCAG 2.2 pass/fail standards.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

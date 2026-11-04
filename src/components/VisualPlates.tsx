import React from 'react';
import { ProjectItem } from '../data/portfolioData';

interface VisualPlateProps {
  theme: ProjectItem['visualTheme'] | 'hero';
  customImageUrl?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const EditorialVisualPlate: React.FC<VisualPlateProps> = ({
  theme,
  customImageUrl,
  title,
  className = ''
}) => {
  if (customImageUrl) {
    return (
      <div className={`relative overflow-hidden bg-[#141413] ${className}`}>
        <img
          src={customImageUrl}
          alt={title || 'Stephanie Egharevba portfolio visual'}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  if (theme === 'hero') {
    return (
      <div
        className={`relative overflow-hidden bg-[#141413] text-[#FAF9F6] p-8 lg:p-10 flex flex-col justify-between select-none ${className}`}
        aria-label="Architectural visual plate illustrating Stephanie Egharevba's Inclusive Systems Blueprint"
      >
        {/* Subtle Architectural Grid SVG */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
          viewBox="0 0 600 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FAF9F6" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="600" height="500" fill="url(#hero-grid)" />
          <circle cx="420" cy="240" r="155" stroke="#FAF9F6" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="420" cy="240" r="95" stroke="#3B82F6" strokeWidth="1.5" />
          <line x1="0" y1="240" x2="600" y2="240" stroke="#FAF9F6" strokeWidth="0.75" />
          <line x1="420" y1="0" x2="420" y2="500" stroke="#FAF9F6" strokeWidth="0.75" />
          <rect x="60" y="90" width="220" height="150" stroke="#FAF9F6" strokeWidth="1" />
          <path d="M 60 240 L 280 90" stroke="#3B82F6" strokeWidth="1.2" />
        </svg>

        {/* Top Header of Monograph Plate */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-4 text-xs font-mono tracking-tight text-[#A3A19A]">
          <span>MONOGRAPH PLATE 01 · LAGOS, NG</span>
          <span className="tabular-nums">WCAG 2.2 AA / AAA</span>
        </div>

        {/* Center Architectural Diagram & Portrait Monogram */}
        <div className="relative z-10 my-auto py-8 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
          <div className="sm:col-span-7 space-y-4">
            <p className="font-serif italic text-xl lg:text-2xl text-[#E6E4DD] leading-snug">
              “When we build environments without accessibility, we are not neutral—we are actively designing exclusion.”
            </p>
            <p className="text-xs font-mono text-[#A3A19A]">
              — STEPHANIE OSASUMWEN EGHAREVBA
            </p>
          </div>

          <div className="sm:col-span-5 border border-white/20 bg-white/[0.03] p-5 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#A3A19A]">
              <span>SYSTEM PARITY</span>
              <span className="text-[#60A5FA] tabular-nums">21.0:1</span>
            </div>
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs border-b border-white/10 pb-1.5">
                <span className="text-white/80">01. Semantic DOM</span>
                <span className="font-mono text-[11px] text-[#93C5FD]">Verified</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-white/10 pb-1.5">
                <span className="text-white/80">02. Assistive Flow</span>
                <span className="font-mono text-[11px] text-[#93C5FD]">Parity</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-white/10 pb-1.5">
                <span className="text-white/80">03. Policy Mandate</span>
                <span className="font-mono text-[11px] text-[#93C5FD]">Enforced</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/80">04. Tactile & Spatial</span>
                <span className="font-mono text-[11px] text-[#93C5FD]">Universal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Architectural Footer */}
        <div className="relative z-10 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs text-[#A3A19A]">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">CLENT Africa</span>
            <span aria-hidden="true">·</span>
            <span>Mastercard Foundation YAC</span>
            <span aria-hidden="true">·</span>
            <span>Inclusive Tech</span>
          </div>
          <span className="font-mono text-[11px] text-white/70">ARCHITECTURE OF INCLUSION</span>
        </div>
      </div>
    );
  }

  if (theme === 'toolkit') {
    return (
      <div className={`relative overflow-hidden bg-[#18181B] text-[#FAF9F6] p-7 flex flex-col justify-between ${className}`}>
        <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" viewBox="0 0 800 450" fill="none">
          <rect x="40" y="40" width="720" height="370" stroke="#FAF9F6" strokeWidth="1" />
          <line x1="280" y1="40" x2="280" y2="410" stroke="#FAF9F6" strokeWidth="1" />
          <line x1="280" y1="220" x2="760" y2="220" stroke="#FAF9F6" strokeWidth="1" />
          <circle cx="160" cy="160" r="70" stroke="#60A5FA" strokeWidth="1.5" />
          {/* Tactile Braille-inspired geometric grid */}
          <circle cx="520" cy="110" r="6" fill="#60A5FA" />
          <circle cx="545" cy="110" r="6" fill="#FAF9F6" />
          <circle cx="520" cy="135" r="6" fill="#FAF9F6" />
          <circle cx="545" cy="135" r="6" fill="#60A5FA" />
          <circle cx="520" cy="160" r="6" fill="#FAF9F6" opacity="0.3" />
          <circle cx="545" cy="160" r="6" fill="#FAF9F6" />
        </svg>
        <div className="relative z-10 flex items-center justify-between text-xs font-mono text-[#A1A1AA]">
          <span>EDITION 01 · TOOLKIT SPECIFICATION</span>
          <span className="tabular-nums">CONTRAST ≥ 4.5:1</span>
        </div>
        <div className="relative z-10 my-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
            <div className="text-[11px] font-mono text-[#93C5FD] mb-1">A. VISUAL CONTRAST</div>
            <div className="text-xl font-display font-semibold tabular-nums">Aa 14.8:1</div>
            <div className="text-xs text-[#A1A1AA] mt-1">WCAG 2.2 AAA Verified</div>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
            <div className="text-[11px] font-mono text-[#93C5FD] mb-1">B. KEYBOARD TREE</div>
            <div className="text-xl font-display font-semibold">Tab → Focus</div>
            <div className="text-xs text-[#A1A1AA] mt-1">Zero Focus Traps</div>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
            <div className="text-[11px] font-mono text-[#93C5FD] mb-1">C. SCREEN READER</div>
            <div className="text-xl font-display font-semibold">ARIA + Landmarks</div>
            <div className="text-xs text-[#A1A1AA] mt-1">Semantic Parity</div>
          </div>
        </div>
        <div className="relative z-10 flex items-center justify-between text-xs font-mono text-[#D4D4D8] border-t border-white/10 pt-3">
          <span>ACCESSIBILITY MADE EASY TOOLKIT</span>
          <span>4,200+ ADOPTERS</span>
        </div>
      </div>
    );
  }

  if (theme === 'clent') {
    return (
      <div className={`relative overflow-hidden bg-[#0F172A] text-[#F8FAFC] p-6 flex flex-col justify-between ${className}`}>
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 400 300" fill="none">
          <path d="M 30 250 L 140 90 L 250 190 L 370 60" stroke="#60A5FA" strokeWidth="2" />
          <circle cx="140" cy="90" r="5" fill="#F8FAFC" />
          <circle cx="250" cy="190" r="5" fill="#F8FAFC" />
          <circle cx="370" cy="60" r="5" fill="#60A5FA" />
          <rect x="30" y="40" width="340" height="220" stroke="#94A3B8" strokeWidth="0.75" strokeDasharray="3 3" />
        </svg>
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
          <span>CLENT AFRICA</span>
          <span>OPEN-SOURCE GOVERNANCE</span>
        </div>
        <div className="relative z-10 my-4">
          <div className="font-mono text-xs text-[#60A5FA] mb-1">inclusive-pr-gate.yml</div>
          <div className="font-display text-lg font-semibold leading-snug">
            Semantic HTML5 & Assistive Parity Across African Civic Tech
          </div>
        </div>
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#CBD5E1] border-t border-white/10 pt-3">
          <span>320+ CONTRIBUTORS</span>
          <span>100% KEYBOARD PARITY</span>
        </div>
      </div>
    );
  }

  if (theme === 'council') {
    return (
      <div className={`relative overflow-hidden bg-[#1C1917] text-[#FAF9F6] p-6 flex flex-col justify-between ${className}`}>
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 400 300" fill="none">
          <circle cx="200" cy="150" r="110" stroke="#D6D3D1" strokeWidth="0.8" />
          <circle cx="200" cy="150" r="70" stroke="#F59E0B" strokeWidth="1.2" />
          <circle cx="200" cy="150" r="30" stroke="#D6D3D1" strokeWidth="0.8" />
        </svg>
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#A8A29E]">
          <span>MASTERCARD FOUNDATION YAC</span>
          <span>PAN-AFRICAN MANDATE</span>
        </div>
        <div className="relative z-10 my-4">
          <p className="font-serif italic text-xl text-[#F5F5F4] leading-snug">
            Co-designing dignified work pathways and accommodation policy with youth leaders.
          </p>
        </div>
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#D6D3D1] border-t border-white/10 pt-3">
          <span>POLICY & GOVERNANCE</span>
          <span>10+ ECOSYSTEMS</span>
        </div>
      </div>
    );
  }

  if (theme === 'policy') {
    return (
      <div className={`relative overflow-hidden bg-[#27272A] text-[#FAFAFA] p-6 flex flex-col justify-between ${className}`}>
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 400 300" fill="none">
          {/* Architectural Ramp Geometry */}
          <path d="M 30 240 L 370 240 L 370 90 Z" stroke="#FAFAFA" strokeWidth="1.2" />
          <line x1="120" y1="240" x2="120" y2="200" stroke="#60A5FA" strokeWidth="1" />
          <line x1="210" y1="240" x2="210" y2="160" stroke="#60A5FA" strokeWidth="1" />
          <line x1="300" y1="240" x2="300" y2="120" stroke="#60A5FA" strokeWidth="1" />
        </svg>
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#A1A1AA]">
          <span>HIGHER EDUCATION REFORM</span>
          <span>STATUTORY PARITY</span>
        </div>
        <div className="relative z-10 my-4">
          <div className="font-display text-lg font-semibold leading-snug">
            Mandatory Admissions Disability-Needs Declaration Blueprint
          </div>
        </div>
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#D4D4D8] border-t border-white/10 pt-3">
          <span>CAMPUS INFRASTRUCTURE</span>
          <span>8 COALITIONS</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#1E293B] text-[#F8FAFC] p-6 flex flex-col justify-between ${className}`}>
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 400 300" fill="none">
        <rect x="45" y="45" width="310" height="210" rx="8" stroke="#93C5FD" strokeWidth="1.2" />
        <line x1="45" y1="95" x2="355" y2="95" stroke="#93C5FD" strokeWidth="0.8" />
        <rect x="70" y="120" width="120" height="35" stroke="#F8FAFC" strokeWidth="1" />
        <rect x="210" y="120" width="120" height="35" stroke="#60A5FA" strokeWidth="1" />
      </svg>
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
        <span>FINTECH & CIVIC AUDITS</span>
        <span>NVDA · VOICEOVER · TALKBACK</span>
      </div>
      <div className="relative z-10 my-4">
        <div className="font-display text-lg font-semibold leading-snug">
          Assistive Technology Remediation & Inclusive Design Tokens
        </div>
      </div>
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#CBD5E1] border-t border-white/10 pt-3">
        <span>WCAG 2.2 AA</span>
        <span className="tabular-nums">96% COMPLIANCE</span>
      </div>
    </div>
  );
};

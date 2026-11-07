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
  className = '',
}) => {
  if (customImageUrl) {
    return (
      <div className={`relative overflow-hidden bg-[#0F172A] ${className}`}>
        <img
          src={customImageUrl}
          alt={title || 'Stephanie Egharevba portfolio visual'}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  // CARD 1: Mastercard Foundation — Community Growth Metrics (0 to 200+ Members) & Policy Framework Tokens
  if (theme === 'council') {
    return (
      <div
        className={`relative overflow-hidden bg-[#0F141C] text-[#F8FAFC] p-6 flex flex-col justify-between select-none ${className}`}
      >
        <svg
          className="absolute inset-0 w-full h-full opacity-15 pointer-events-none"
          viewBox="0 0 600 320"
          fill="none"
        >
          <path
            d="M 40 250 C 160 245, 240 160, 360 120 C 440 90, 500 65, 560 50"
            stroke="#F59E0B"
            strokeWidth="2"
          />
          <circle cx="40" cy="250" r="4" fill="#94A3B8" />
          <circle cx="360" cy="120" r="4" fill="#F59E0B" />
          <circle cx="560" cy="50" r="5" fill="#34D399" />
        </svg>

        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
          <span>MASTERCARD FOUNDATION · YAC</span>
          <span className="text-[#FBBF24]">POLICY &amp; NETWORK SPEC</span>
        </div>

        <div className="relative z-10 my-auto py-3 grid grid-cols-12 gap-3 items-center">
          <div className="col-span-5 bg-white/[0.04] border border-white/10 rounded-xl p-3.5">
            <div className="text-[10px] font-mono text-[#94A3B8] uppercase">COMMUNITY SCALE</div>
            <div className="text-xl sm:text-2xl font-display font-bold text-white tabular-nums mt-0.5">
              0 → 200+
            </div>
            <div className="text-[11px] text-[#34D399] font-mono mt-0.5">Active Alumni Members</div>
          </div>

          <div className="col-span-7 bg-white/[0.04] border border-white/10 rounded-xl p-3.5 space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between text-[#CBD5E1]">
              <span>token.event_a11y</span>
              <span className="text-[#F8FAFC]">enforced</span>
            </div>
            <div className="flex items-center justify-between text-[#CBD5E1]">
              <span>broadcast.idpd_2024</span>
              <span className="text-[#FBBF24]">global_mod</span>
            </div>
            <div className="flex items-center justify-between text-[#CBD5E1]">
              <span>infra.ogun_lab</span>
              <span className="text-[#34D399]">deployed</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#94A3B8] border-t border-white/10 pt-2.5">
          <span>ALUMNI DISABILITY COMMUNITY</span>
          <span>NIGERIA ECOSYSTEM</span>
        </div>
      </div>
    );
  }

  // CARD 2: Rushbox — Visual UI Component Teardown with Focus Ring Indicator & Contrast Score
  if (theme === 'audit') {
    return (
      <div
        className={`relative overflow-hidden bg-[#0B0B0B] text-[#F8FAFC] p-6 flex flex-col justify-between select-none ${className}`}
      >
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
          <span>RUSHBOX · UI COMPONENT TEARDOWN</span>
          <span className="text-[#F8FAFC]">WCAG 2.2 AA / AAA</span>
        </div>

        {/* Inspected Component Frame with Active Focus Ring & Contrast Badge */}
        <div className="relative z-10 my-auto py-2">
          <div className="p-3.5 rounded-xl bg-[#141413] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#CBD5E1]">
                <span className="px-1.5 py-0.5 rounded bg-white/10 border border-white/25">
                  :focus-visible
                </span>
                <span>tabIndex=0 · role=&quot;button&quot;</span>
              </div>

              {/* Simulated Inspected UI Button with 3px Focus Ring */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white text-[#0B0B0B] text-xs font-display font-bold ring-[3px] ring-white/60 ring-offset-2 ring-offset-[#141413]">
                <span>Confirm Shipment</span>
                <span className="font-mono text-[10px] text-[#575652]">↵ Enter</span>
              </div>
            </div>

            <div className="sm:text-right bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 shrink-0">
              <div className="text-[10px] font-mono text-[#94A3B8]">CONTRAST SCORE</div>
              <div className="text-lg font-display font-bold text-[#34D399] tabular-nums">
                15.4 : 1 · AAA
              </div>
              <div className="text-[10px] font-mono text-[#CBD5E1]">Focus Ring: 3px Solid</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#94A3B8] border-t border-white/10 pt-2.5">
          <span>DOM &amp; KEYBOARD REMEDIATION</span>
          <span>100% SCREEN-READER PARITY</span>
        </div>
      </div>
    );
  }

  // CARD 3: African Disability Forum — WCAG Spec Sheet (Contrast, Keyboard Tree, Screen Reader)
  if (theme === 'toolkit') {
    return (
      <div
        className={`relative overflow-hidden bg-[#18181B] text-[#FAF9F6] p-6 flex flex-col justify-between select-none ${className}`}
      >
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#A1A1AA]">
          <span>AFRICAN DISABILITY FORUM · SPEC</span>
          <span className="text-[#E4E4E7] tabular-nums">CONTRAST ≥ 4.5:1</span>
        </div>

        <div className="relative z-10 my-auto py-2 grid grid-cols-3 gap-2.5">
          <div className="bg-white/[0.04] border border-white/10 p-3 rounded-xl">
            <div className="text-[10px] font-mono text-[#D4D4D8] mb-0.5">A. CONTRAST</div>
            <div className="text-base sm:text-lg font-display font-bold tabular-nums">Aa 14.8:1</div>
            <div className="text-[11px] text-[#A1A1AA] mt-0.5">WCAG 2.2 AAA</div>
          </div>
          <div className="bg-white/[0.04] border border-white/10 p-3 rounded-xl">
            <div className="text-[10px] font-mono text-[#D4D4D8] mb-0.5">B. KEYBOARD</div>
            <div className="text-base sm:text-lg font-display font-bold">Tab → Focus</div>
            <div className="text-[11px] text-[#A1A1AA] mt-0.5">Zero Focus Traps</div>
          </div>
          <div className="bg-white/[0.04] border border-white/10 p-3 rounded-xl">
            <div className="text-[10px] font-mono text-[#D4D4D8] mb-0.5">C. ASSISTIVE</div>
            <div className="text-base sm:text-lg font-display font-bold">ARIA Tree</div>
            <div className="text-[11px] text-[#A1A1AA] mt-0.5">Semantic Parity</div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#A1A1AA] border-t border-white/10 pt-2.5">
          <span>CONTINENTAL WEB AUDIT</span>
          <span>EXECUTIVE REMEDIATION</span>
        </div>
      </div>
    );
  }

  // CARD 4: Jobberman Pipeline — 3-Step Workforce Workflow Diagram (Intake -> Audit -> Placement)
  if (theme === 'fintech') {
    return (
      <div
        className={`relative overflow-hidden bg-[#111827] text-[#F8FAFC] p-6 flex flex-col justify-between select-none ${className}`}
      >
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
          <span>JOBBERMAN · MASTERCARD FOUNDATION</span>
          <span className="text-[#34D399]">WORKFORCE PIPELINE</span>
        </div>

        {/* 3-Node Workflow Diagram */}
        <div className="relative z-10 my-auto py-2 grid grid-cols-3 gap-2 items-center">
          <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
            <div className="font-mono text-[10px] text-[#CBD5E1]">01 / INTAKE</div>
            <div className="font-display text-xs sm:text-sm font-bold text-white">
              Accessible Training
            </div>
            <div className="text-[10px] text-[#94A3B8]">WCAG Curricula</div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.04] border border-white/25 space-y-1">
            <div className="font-mono text-[10px] text-[#F8FAFC]">02 / AUDIT</div>
            <div className="font-display text-xs sm:text-sm font-bold text-white">
              Talent Readiness
            </div>
            <div className="text-[10px] text-[#94A3B8]">Barrier-Free Eval</div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.04] border border-[#34D399]/40 space-y-1">
            <div className="font-mono text-[10px] text-[#34D399]">03 / PLACEMENT</div>
            <div className="font-display text-xs sm:text-sm font-bold text-white">
              Employer Match
            </div>
            <div className="text-[10px] text-[#94A3B8]">Inclusive Roles</div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#94A3B8] border-t border-white/10 pt-2.5">
          <span>WEST AFRICA TALENT PIPELINE</span>
          <span>PWD EMPLOYER PLACEMENT</span>
        </div>
      </div>
    );
  }

  // CARD 5: Client Africa — GitHub Workflow Snippet (inclusive-pr-gate.yml)
  if (theme === 'clent') {
    return (
      <div
        className={`relative overflow-hidden bg-[#0F172A] text-[#F8FAFC] p-6 flex flex-col justify-between select-none ${className}`}
      >
        <svg
          className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
          viewBox="0 0 400 300"
          fill="none"
        >
          <path d="M 30 250 L 140 90 L 250 190 L 370 60" stroke="#94A3B8" strokeWidth="2" />
          <circle cx="140" cy="90" r="5" fill="#F8FAFC" />
          <circle cx="250" cy="190" r="5" fill="#F8FAFC" />
          <circle cx="370" cy="60" r="5" fill="#94A3B8" />
          <rect
            x="30"
            y="40"
            width="340"
            height="220"
            stroke="#94A3B8"
            strokeWidth="0.75"
            strokeDasharray="3 3"
          />
        </svg>

        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
          <span>CLIENT AFRICA</span>
          <span>INCLUSIVE GOVERNANCE</span>
        </div>

        <div className="relative z-10 my-4">
          <div className="font-mono text-xs text-[#CBD5E1] mb-1">inclusive-pr-gate.yml</div>
          <div className="font-display text-base sm:text-lg font-semibold leading-snug">
            Disability Rights &amp; Gender Equity Governance Across Regional Programs
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#CBD5E1] border-t border-white/10 pt-2.5">
          <span>CORE GOVERNANCE MANDATE</span>
          <span>REGIONAL PARITY</span>
        </div>
      </div>
    );
  }

  // CARD 6: Campus Blueprint — Structured Policy Checklist Card (Google · Microsoft · Yabatech)
  return (
    <div
      className={`relative overflow-hidden bg-[#18181B] text-[#FAFAFA] p-6 flex flex-col justify-between select-none ${className}`}
    >
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#A1A1AA]">
        <span>GOOGLE · MICROSOFT · YABATECH</span>
        <span className="text-[#E4E4E7]">CAMPUS POLICY BLUEPRINT</span>
      </div>

      <div className="relative z-10 my-auto py-2 space-y-1.5 font-mono text-xs">
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10">
          <span className="text-[#E4E4E7]">[✓] Google GDSC Developer Track</span>
          <span className="text-[#34D399]">200+ Builders</span>
        </div>
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10">
          <span className="text-[#E4E4E7]">[✓] Microsoft Student Ambassadors</span>
          <span className="text-[#E4E4E7]">100+ Members</span>
        </div>
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10">
          <span className="text-[#E4E4E7]">[✓] Student Union Disability Policy</span>
          <span className="text-[#FBBF24]">Enacted</span>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#A1A1AA] border-t border-white/10 pt-2.5">
        <span>300+ STUDENT DEVELOPERS</span>
        <span>SPECIAL ADVISER MANDATE</span>
      </div>
    </div>
  );
};

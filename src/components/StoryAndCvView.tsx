import React, { useState, useEffect, useRef } from 'react';
import {
  AnimatePresence,
  motion,
  useInView,
  useScroll,
  useSpring,
} from 'motion/react';
import {
  ArrowRight,
  Award,
  Check,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import {
  CV_PDF_URL,
  EDUCATION_HISTORY,
  HONORS_AND_RECOGNITION,
  PROFESSIONAL_EXPERIENCE,
  STEPHANIE_PORTRAITS,
} from '../data/portfolioData';

interface StoryAndCvViewProps {
  onNavigateToContact: () => void;
  onNavigateToWork: () => void;
}

const EASE_EDITORIAL: [number, number, number, number] = [0.16, 1, 0.3, 1];

const SIGNATURE_QUOTE =
  'When we build environments without accessibility, we are actively designing exclusion.';

// Exact skills & tools mapped to each role for Interactive Timeline Hover
const ROLE_SKILLS_MAP: Record<string, string[]> = {
  'exp-jobberman': [
    'Inclusive Workforce Placement',
    'Strategic Partnerships',
    'D&I Strategy',
    'Candidate Journey Auditing',
  ],
  'exp-talent-corp': [
    'Disability Policy',
    'Inclusive Workforce Placement',
    'WCAG Auditing',
    'Corporate Readiness',
  ],
  'exp-adf': [
    'WCAG Auditing',
    'WCAG 2.2 AA / AAA',
    'Screen-Reader Parity',
    'DOM & ARIA Architecture',
  ],
  'exp-hakeela': [
    'Strategic Partnerships',
    'D&I Strategy',
    'Stakeholder Governance',
  ],
  'exp-rushbox': [
    'WCAG Auditing',
    'Keyboard Navigation Trees',
    'Contrast & Sensory Parity',
    'Inclusive UX Playbooks',
  ],
  'exp-mcf-yac': [
    'D&I Strategy',
    'Community Mobilization',
    'Disability Policy',
    'Keynote Speaking',
  ],
  'exp-client-africa': [
    'Disability Policy',
    'D&I Strategy',
    'Gender Equity Governance',
  ],
  'exp-microsoft': [
    'Community Mobilization',
    'Disability Policy',
    'Technical Bootcamps',
  ],
  'exp-yabatech-cm': [
    'Disability Policy',
    'Community Mobilization',
    'Academic Accommodations',
  ],
  'exp-google-gdsc': [
    'Community Mobilization',
    'Keynote Speaking',
    'Data Literacy & Web Engineering',
  ],
};

interface AnimatedStatCounterProps {
  target: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
}

const AnimatedStatCounter: React.FC<AnimatedStatCounterProps> = ({
  target,
  prefix = '',
  suffix = '',
  durationMs = 1300,
}) => {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (!isInView) return;
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / durationMs, 1);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [isInView, target, durationMs]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

export const StoryAndCvView: React.FC<StoryAndCvViewProps> = ({
  onNavigateToContact,
  onNavigateToWork,
}) => {
  const [activeMode, setActiveMode] = useState<'story' | 'cv'>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.toLowerCase() === '/cv') {
      return 'cv';
    }
    return 'story';
  });
  const [copiedQuote, setCopiedQuote] = useState<boolean>(false);

  useEffect(() => {
    const handleRouteSync = (e: Event) => {
      const customEvt = e as CustomEvent<{ mode?: 'story' | 'cv' }>;
      if (customEvt.detail?.mode) {
        setActiveMode(customEvt.detail.mode);
        return;
      }
      if (window.location.pathname.toLowerCase() === '/cv') {
        setActiveMode('cv');
      } else if (window.location.pathname.toLowerCase() === '/story') {
        setActiveMode('story');
      }
    };
    window.addEventListener('popstate', handleRouteSync);
    window.addEventListener('stephanie-story-cv-mode', handleRouteSync);
    return () => {
      window.removeEventListener('popstate', handleRouteSync);
      window.removeEventListener('stephanie-story-cv-mode', handleRouteSync);
    };
  }, []);

  // Interactive Timeline Hover & Accordion State
  const [hoveredRoleId, setHoveredRoleId] = useState<string | null>(null);
  const [expandedRoleIds, setExpandedRoleIds] = useState<string[]>([
    PROFESSIONAL_EXPERIENCE[0]?.id || 'exp-jobberman',
    PROFESSIONAL_EXPERIENCE[5]?.id || 'exp-mcf-yac',
  ]);

  // 1. Top 2px Browser Reading Progress Line (Window-level, no target ref required)
  const { scrollYProgress: pageScrollProgress } = useScroll();
  const topReadingBarScaleX = useSpring(pageScrollProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  // 2. Hydration-Safe Vertical Timeline Spine Progress
  const timelineContainerRef = useRef<HTMLDivElement | null>(null);
  const [timelineProgress, setTimelineProgress] = useState<number>(0.15);

  useEffect(() => {
    if (activeMode !== 'cv') return;

    const updateTimelineProgress = () => {
      const el = timelineContainerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 800;
      const startTrigger = viewportHeight * 0.75;
      const totalDistance = rect.height;
      if (totalDistance <= 0) return;
      const scrolled = startTrigger - rect.top;
      const ratio = Math.max(0.08, Math.min(1, scrolled / totalDistance));
      setTimelineProgress(ratio);
    };

    updateTimelineProgress();
    window.addEventListener('scroll', updateTimelineProgress, { passive: true });
    window.addEventListener('resize', updateTimelineProgress);
    return () => {
      window.removeEventListener('scroll', updateTimelineProgress);
      window.removeEventListener('resize', updateTimelineProgress);
    };
  }, [activeMode, expandedRoleIds]);

  const handleCopySignatureQuote = () => {
    navigator.clipboard?.writeText(`“${SIGNATURE_QUOTE}” - Stephanie Egharevba`);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2400);
  };

  const toggleRoleAccordion = (id: string) => {
    setExpandedRoleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const expandOrCollapseAllRoles = () => {
    if (expandedRoleIds.length === PROFESSIONAL_EXPERIENCE.length) {
      setExpandedRoleIds([]);
    } else {
      setExpandedRoleIds(PROFESSIONAL_EXPERIENCE.map((r) => r.id));
    }
  };

  const activeHoveredSkills = hoveredRoleId ? ROLE_SKILLS_MAP[hoveredRoleId] || [] : [];

  return (
    <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-[120px] space-y-12">
      {/* ===================================================================== */}
      {/* 2PX READING PROGRESS LINE AT VERY TOP OF BROWSER WINDOW               */}
      {/* ===================================================================== */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: topReadingBarScaleX, transformOrigin: '0% 50%' }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#0F172A] z-50 pointer-events-none"
      />

      {/* ===================================================================== */}
      {/* 1. EXECUTIVE PROFILE & DOSSIER HEADER                                 */}
      {/* ===================================================================== */}
      <section className="border-b border-[#E2E8F0] pb-9 space-y-7">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0, ease: EASE_EDITORIAL }}
              className="font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-[#64748B]"
            >
              EDITORIAL PROFILE &amp; CAREER DOSSIER · LAGOS, NIGERIA
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05, ease: EASE_EDITORIAL }}
              className="space-y-1.5"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h1
                  className="font-display font-bold tracking-[-0.03em] text-[#0F172A] leading-[1.05]"
                  style={{ fontSize: 'clamp(2.35rem, 4.6vw, 3.6rem)' }}
                >
                  Stephanie Egharevba
                </h1>
                <span className="font-sans text-base sm:text-xl font-normal text-[#64748B] tracking-tight">
                  Osasumwen
                </span>
              </div>
              <p className="text-sm sm:text-base font-semibold text-[#334155]">
                Diversity &amp; Inclusion Lead · Disability Inclusion Specialist · Author &amp;
                Global Speaker
              </p>
            </motion.div>
          </div>

          {/* Clean Top Action Bar: Preview PDF, Download CV (PDF), Book Advisory */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15, ease: EASE_EDITORIAL }}
            className="flex flex-wrap items-center gap-2.5 shrink-0"
          >
            <a
              href={CV_PDF_URL}
              download="Stephanie_Egharevba_CV.pdf"
              className="px-5 py-2.5 text-xs font-semibold text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0F172A] rounded-full transition-colors inline-flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-[#0F172A]" />
              <span>Download CV (PDF)</span>
            </a>

            <button
              type="button"
              onClick={onNavigateToContact}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#111111] hover:bg-[#334155] rounded-full transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Book Advisory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        </div>

        {/* ================================================================= */}
        {/* 2. TOP MODE SWITCHER: [ Editorial Story ] vs [ Complete CV / Timeline ] */}
        {/* ================================================================= */}
        <div className="pt-2">
          <div
            role="tablist"
            aria-label="Profile mode switcher"
            className="inline-flex flex-wrap sm:flex-nowrap p-1.5 rounded-2xl bg-[#F1F5F9] border border-[#E2E8F0] gap-1 w-full sm:w-auto"
          >
            {[
              { id: 'story' as const, label: 'Editorial Story' },
              { id: 'cv' as const, label: 'Complete CV / Timeline' },
            ].map((tab) => {
              const isSelected = activeMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveMode(tab.id)}
                  className={`relative flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs sm:text-sm font-display font-bold transition-colors cursor-pointer ${
                    isSelected ? 'text-[#0F172A]' : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="editorial-dossier-mode-pill"
                      transition={{ duration: 0.2, ease: EASE_EDITORIAL }}
                      className="absolute inset-0 rounded-xl bg-white border border-[#E2E8F0] shadow-xs"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 200MS CROSS-FADE CONTENT AREA                                         */}
      {/* ===================================================================== */}
      <AnimatePresence mode="wait">
        {activeMode === 'story' ? (
          /* ================================================================= */
          /* MODE 1: EDITORIAL STORY (3 PUNCHY VISUAL BEATS)                   */
          /* ================================================================= */
          <motion.div
            key="mode-editorial-story"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: EASE_EDITORIAL }}
            className="space-y-14"
          >
            {/* BEAT 01: "Architectures of Exclusion." */}
            <motion.article
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, ease: EASE_EDITORIAL }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center bg-white border border-[#E2E8F0] rounded-3xl p-7 sm:p-12"
            >
              <div className="lg:col-span-7 space-y-5">
                <h2
                  className="font-display font-bold tracking-[-0.03em] text-[#0F172A] leading-[1.08]"
                  style={{ fontSize: 'clamp(2rem, 3.6vw, 2.75rem)' }}
                >
                  Architectures of Exclusion.
                </h2>

                <div className="space-y-4 text-base sm:text-[17px] text-[#334155] leading-[1.75]">
                  <p>
                    Growing up in Lagos with Osteogenesis Imperfecta meant navigating physical
                    spaces that were never built with my body in mind, including lecture halls
                    without ramps, inaccessible public transit, and buildings that treated mobility
                    as a privilege.
                  </p>
                  <p>
                    When I entered Computer Science, I discovered that software engineers were
                    building the exact same staircases in code that physical buildings had.
                    Unlabeled buttons, broken keyboard focus traps, and low-contrast interfaces were
                    quietly locking out millions of capable users. That realization anchored my
                    life’s work:{' '}
                    <strong className="font-semibold text-[#0F172A]">
                      disability is not the problem, unexamined design is the problem.
                    </strong>
                  </p>
                </div>
              </div>

              {/* Visual: Framed Studio Portrait in Teal Blazer with Generous Breathing Room */}
              <div className="lg:col-span-5">
                <figure className="p-3 sm:p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                  <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-[#1E293B]">
                    <img
                      src={STEPHANIE_PORTRAITS[0].src}
                      alt={STEPHANIE_PORTRAITS[0].caption}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <figcaption className="px-1 flex items-center justify-between text-xs text-[#64748B]">
                    <span className="font-medium text-[#0F172A]">
                      Stephanie Egharevba · Executive Studio Portrait
                    </span>
                    <span className="font-mono text-[11px]">LAGOS, NG</span>
                  </figcaption>
                </figure>
              </div>
            </motion.article>

            {/* BEAT 02: "From Campus Policy to Continental Scale." */}
            <motion.article
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, ease: EASE_EDITORIAL }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center bg-white border border-[#E2E8F0] rounded-3xl p-7 sm:p-12"
            >
              {/* Visual: Clean Off-White 4-Stat Metric Box with Scroll-Triggered Counters */}
              <div className="lg:col-span-5 order-2 lg:order-1">
                <div className="p-6 sm:p-8 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-6">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3.5">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                      VERIFIED IMPACT METRICS
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-[#0F172A]">
                      2023 - 2026
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#E2E8F0] space-y-1">
                      <div className="text-2xl sm:text-3xl font-display font-bold text-[#0F172A]">
                        <AnimatedStatCounter target={300} suffix="+" />
                      </div>
                      <div className="text-xs font-semibold text-[#0F172A]">Builders Mobilized</div>
                      <div className="text-[11px] text-[#64748B]">
                        Google GDSC &amp; Microsoft Chapters
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#E2E8F0] space-y-1">
                      <div className="text-2xl sm:text-3xl font-display font-bold text-[#0F172A]">
                        <AnimatedStatCounter target={200} suffix="+" />
                      </div>
                      <div className="text-xs font-semibold text-[#0F172A]">Alumni Network</div>
                      <div className="text-[11px] text-[#64748B]">
                        Mastercard Foundation Community
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#E2E8F0] space-y-1">
                      <div className="text-2xl sm:text-3xl font-display font-bold text-[#0F172A]">
                        <AnimatedStatCounter target={3000} suffix="+" />
                      </div>
                      <div className="text-xs font-semibold text-[#0F172A]">Audience Reached</div>
                      <div className="text-[11px] text-[#64748B]">
                        Keynotes &amp; Technical Summits
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#E2E8F0] space-y-1">
                      <div className="text-2xl sm:text-3xl font-display font-bold text-[#0F172A]">
                        <AnimatedStatCounter target={3} prefix="Top " suffix="%" />
                      </div>
                      <div className="text-xs font-semibold text-[#0F172A]">Global Speaker</div>
                      <div className="text-[11px] text-[#64748B]">Sessionize Worldwide Ranking</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 order-1 lg:order-2 space-y-5">
                <h2
                  className="font-display font-bold tracking-[-0.03em] text-[#0F172A] leading-[1.08]"
                  style={{ fontSize: 'clamp(2rem, 3.6vw, 2.75rem)' }}
                >
                  From Campus Policy to Continental Scale.
                </h2>

                <div className="space-y-4 text-base sm:text-[17px] text-[#334155] leading-[1.75]">
                  <p>
                    What started as organizing student developers at Yaba College of Technology, leading{' '}
                    <strong className="font-semibold text-[#0F172A]">
                      200+ members in the Google Developer Student Club
                    </strong>{' '}
                    and{' '}
                    <strong className="font-semibold text-[#0F172A]">
                      100+ Microsoft Student Ambassadors
                    </strong>{' '}
                    while advising the Student Union President on campus accommodations, rapidly
                    evolved into a continental mandate.
                  </p>
                  <p>
                    As Diversity &amp; Inclusion Lead for the{' '}
                    <strong className="font-semibold text-[#0F172A]">
                      Mastercard Foundation Youth Advisory Council Nigeria
                    </strong>
                    , I founded the 200+ member Alumni Disability Community from scratch. Today,
                    across <strong className="font-semibold text-[#0F172A]">Jobberman Nigeria</strong>{' '}
                    and the{' '}
                    <strong className="font-semibold text-[#0F172A]">
                      Mastercard Foundation Project Initiative
                    </strong>
                    , I design inclusive workforce pipelines that connect young talents with
                    disabilities to long-term corporate roles across West Africa.
                  </p>
                </div>
              </div>
            </motion.article>

            {/* BEAT 03: "Disability Is Not the Edge Case." */}
            <motion.article
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, ease: EASE_EDITORIAL }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center bg-white border border-[#E2E8F0] rounded-3xl p-7 sm:p-12"
            >
              <div className="lg:col-span-7 space-y-5">
                <h2
                  className="font-display font-bold tracking-[-0.03em] text-[#0F172A] leading-[1.08]"
                  style={{ fontSize: 'clamp(2rem, 3.6vw, 2.75rem)' }}
                >
                  Disability Is Not the Edge Case.
                </h2>

                <div className="space-y-4 text-base sm:text-[17px] text-[#334155] leading-[1.75]">
                  <p>
                    I do not do soft charity work. When over 30 million Nigerians (more than 15% of
                    the population) live with a disability, treating accessibility as an optional CSR
                    gesture is both an engineering failure and a massive commercial blind spot.
                  </p>
                  <p>
                    Whether I am conducting technical WCAG 2.2 audits for{' '}
                    <strong className="font-semibold text-[#0F172A]">Rushbox</strong> and enterprise
                    platforms, authoring developer guides like <em>Code for Every Body</em>, or
                    addressing leaders at <em>TechCabal Moonshot</em> and <em>InAble</em>, my focus
                    is structural: semantic code, enforceable recruitment policy, and digital
                    products engineered for every human body.
                  </p>
                </div>

                <div className="pt-3 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveMode('cv')}
                    className="group px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-[#111111] hover:bg-[#334155] rounded-full transition-colors inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>Switch to Complete CV / Timeline</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  <button
                    type="button"
                    onClick={onNavigateToWork}
                    className="px-5 py-3 text-xs sm:text-sm font-semibold text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0F172A] rounded-full transition-colors inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>Explore WCAG Case Studies &amp; Contrast Lab</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Visual: Interactive Signature Pull-Quote Card */}
              <div className="lg:col-span-5">
                <div className="p-7 sm:p-9 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0F172A] transition-colors flex flex-col justify-between space-y-6">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3.5">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                      SIGNATURE THESIS
                    </span>
                    <button
                      type="button"
                      onClick={handleCopySignatureQuote}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F172A] hover:text-[#64748B] transition-colors cursor-pointer"
                    >
                      {copiedQuote ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#64748B]" />
                          <span>Copy Quote</span>
                        </>
                      )}
                    </button>
                  </div>

                  <blockquote className="font-display text-xl sm:text-2xl font-bold tracking-[-0.02em] text-[#0F172A] leading-[1.3]">
                    “{SIGNATURE_QUOTE}”
                  </blockquote>

                  <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
                    <span className="font-semibold text-[#0F172A]">Stephanie Egharevba</span>
                    <span className="font-mono text-[11px]">WCAG 2.2 AA / AAA</span>
                  </div>
                </div>
              </div>
            </motion.article>
          </motion.div>
        ) : (
          /* ================================================================= */
          /* MODE 2: COMPLETE CV / TIMELINE (INTERACTIVE DOSSIER)              */
          /* ================================================================= */
          <motion.div
            key="mode-complete-cv"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: EASE_EDITORIAL }}
            className="space-y-16"
          >
            {/* Interactive Vertical Timeline Spine + Hover Skill Highlighting + Expandable Roles */}
            <section className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                    CHRONOLOGICAL DOSSIER · HOVER TO HIGHLIGHT SKILLS · CLICK TO EXPAND METRICS
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-[#0F172A]">
                    Career Experience &amp; Scope
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={expandOrCollapseAllRoles}
                  className="text-xs font-semibold text-[#0F172A] hover:underline cursor-pointer self-start sm:self-auto"
                >
                  {expandedRoleIds.length === PROFESSIONAL_EXPERIENCE.length
                    ? 'Collapse All Roles'
                    : `Expand All Roles (${PROFESSIONAL_EXPERIENCE.length})`}
                </button>
              </div>

              <div ref={timelineContainerRef} className="relative pl-6 sm:pl-10">
                {/* Background Spine Track */}
                <div
                  aria-hidden="true"
                  className="absolute left-[11px] sm:left-[19px] top-3 bottom-3 w-[2px] bg-[#E2E8F0] rounded-full"
                />
                {/* Scroll-Linked Progress Line */}
                <motion.div
                  aria-hidden="true"
                  initial={{ scaleY: 0.15 }}
                  animate={{ scaleY: timelineProgress }}
                  transition={{ type: 'spring', stiffness: 120, damping: 28 }}
                  style={{ transformOrigin: 'top' }}
                  className="absolute left-[11px] sm:left-[19px] top-3 bottom-3 w-[2px] bg-[#0F172A] rounded-full"
                />

                <div className="space-y-4">
                  {PROFESSIONAL_EXPERIENCE.map((exp, idx) => {
                    const isExpanded = expandedRoleIds.includes(exp.id);
                    const isHovered = hoveredRoleId === exp.id;
                    const roleSkills = ROLE_SKILLS_MAP[exp.id] || [];

                    return (
                      <motion.div
                        key={exp.id}
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{
                          duration: 0.35,
                          delay: Math.min(idx * 0.04, 0.25),
                          ease: EASE_EDITORIAL,
                        }}
                        onMouseEnter={() => setHoveredRoleId(exp.id)}
                        onMouseLeave={() => setHoveredRoleId(null)}
                        onFocus={() => setHoveredRoleId(exp.id)}
                        onBlur={() => setHoveredRoleId(null)}
                        className="relative"
                      >
                        {/* Timeline Node Dot */}
                        <div
                          className={`absolute -left-[21px] sm:-left-[29px] top-6 w-4 h-4 rounded-full border-[3px] border-[#FAF9F6] transition-all duration-200 ${
                            isExpanded || isHovered
                              ? 'bg-[#0F172A] ring-4 ring-[#0F172A]/15 scale-110'
                              : 'bg-[#64748B]'
                          }`}
                        />

                        {/* Role Card */}
                        <div
                          onClick={() => toggleRoleAccordion(exp.id)}
                          role="button"
                          tabIndex={0}
                          aria-expanded={isExpanded}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              toggleRoleAccordion(exp.id);
                            }
                          }}
                          className={`group rounded-2xl bg-white border transition-all duration-200 p-6 sm:p-7 cursor-pointer ${
                            isExpanded || isHovered
                              ? 'border-[#0F172A] shadow-[0_12px_32px_-12px_rgba(15,23,42,0.08)]'
                              : 'border-[#E2E8F0] hover:border-[#0F172A]'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-6">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#0F172A] tabular-nums">
                                <span>{exp.period}</span>
                                <span className="text-[#CBD5E1]">·</span>
                                <span className="font-sans font-semibold text-[#64748B]">
                                  {exp.organization} ({exp.location})
                                </span>
                              </div>
                              <h3 className="text-lg sm:text-xl font-display font-bold text-[#0F172A]">
                                {exp.role}
                              </h3>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">
                                {isExpanded ? 'Hide Scope' : 'Expand Scope'}
                              </span>
                              <div
                                className={`w-7 h-7 rounded-full border border-[#E2E8F0] flex items-center justify-center transition-transform duration-200 ${
                                  isExpanded
                                    ? 'rotate-180 bg-[#0F172A] text-white border-[#0F172A]'
                                    : 'text-[#0F172A]'
                                }`}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-[#475569] leading-relaxed mt-2.5">
                            {exp.summary}
                          </p>

                          {/* Interactive Role Skills & Tools Chips */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-4">
                            {roleSkills.map((skill) => (
                              <span
                                key={skill}
                                className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium border transition-colors duration-200 ${
                                  isHovered
                                    ? 'bg-[#0F172A] text-white border-[#0F172A]'
                                    : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
                                }`}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>

                          {/* Expandable Impact Bullets */}
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.22, ease: EASE_EDITORIAL }}
                                className="overflow-hidden"
                              >
                                <ul className="mt-5 pt-4 border-t border-[#F1F5F9] space-y-2.5">
                                  {exp.highlights.map((bullet, bIdx) => (
                                    <li
                                      key={bIdx}
                                      className="text-xs sm:text-sm text-[#334155] flex items-start gap-3 leading-relaxed"
                                    >
                                      <span className="font-mono text-[11px] font-bold text-[#0F172A] mt-0.5 shrink-0">
                                        0{bIdx + 1}
                                      </span>
                                      <span>{bullet}</span>
                                    </li>
                                  ))}
                                </ul>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* =============================================================== */}
            {/* ELEVATED HONORS & EDUCATION LAYOUT                              */}
            {/* =============================================================== */}
            <section className="space-y-12 pt-4 border-t border-[#E2E8F0]">
              {/* Honors & Global Recognition Badge Cards */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                      DISTINCTIONS &amp; GLOBAL STANDING
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-[#0F172A]">
                      Honors &amp; Recognition
                    </h2>
                  </div>
                  <Award className="w-6 h-6 text-[#0F172A] hidden sm:block" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {HONORS_AND_RECOGNITION.map((honor) => (
                    <div
                      key={honor.id}
                      className="group p-6 sm:p-7 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0F172A] transition-all duration-300 flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-[0.06em] text-[#0F172A]">
                            <Sparkles className="w-3 h-3" />
                            <span>{honor.issuer}</span>
                          </span>
                          <span className="font-mono text-xs font-semibold text-[#64748B] tabular-nums">
                            {honor.year}
                          </span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-display font-bold text-[#0F172A]">
                          {honor.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                          {honor.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Academic Credentials with Research & Campus Leadership Context */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                      ACADEMIC FOUNDATION · COMPUTER SCIENCE
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-[#0F172A]">
                      Education
                    </h2>
                  </div>
                  <GraduationCap className="w-6 h-6 text-[#0F172A] hidden sm:block" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {EDUCATION_HISTORY.map((edu) => (
                    <div
                      key={edu.degree}
                      className="p-6 sm:p-7 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0F172A] transition-colors flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 text-xs font-mono text-[#64748B]">
                          <span>{edu.institution}</span>
                          <span className="tabular-nums font-semibold">{edu.period}</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-display font-bold text-[#0F172A]">
                          {edu.degree}
                        </h3>
                      </div>

                      <p className="text-xs sm:text-sm text-[#475569] leading-relaxed pt-3 border-t border-[#F1F5F9]">
                        {edu.highlight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

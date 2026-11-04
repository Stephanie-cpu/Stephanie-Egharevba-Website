import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Check,
  Copy,
  Download,
  ExternalLink,
  Eye,
  GraduationCap,
  Mail,
  MapPin,
  Menu,
  Mic,
  Phone,
  Play,
  Plus,
  Send,
  X
} from 'lucide-react';
import {
  CORE_COMPETENCIES,
  CV_PDF_URL,
  EDUCATION_HISTORY,
  HONORS_AND_RECOGNITION,
  INITIAL_PROJECTS,
  PageId,
  PROFESSIONAL_EXPERIENCE,
  ProjectCategory,
  ProjectItem,
  PUBLICATIONS_AND_FEATURES,
  SPEAKING_AND_WRITING,
  SPEAKING_VIDEOS,
  SpeakingEngagement,
  STEPHANIE_BOOKS,
  STEPHANIE_PORTRAITS
} from './data/portfolioData';
import { EditorialVisualPlate } from './components/VisualPlates';
import { AccessibilitySandbox } from './components/AccessibilitySandbox';
import { AddProjectModal, ProjectLightboxModal, SpeakingReaderModal } from './components/ProjectModals';
import { PhotoGalleryPressKit } from './components/PhotoGalleryPressKit';

interface SavedInquiry {
  id: string;
  name: string;
  email: string;
  organization: string;
  engagementType: string;
  timeline: string;
  message: string;
  submittedAt: string;
}

const EASE_EDITORIAL: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Persisted projects
  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    try {
      const saved = localStorage.getItem('stephanie_portfolio_projects_v3');
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [heroPortraitIdx, setHeroPortraitIdx] = useState<number>(0);
  const [hoveredGalleryIdx, setHoveredGalleryIdx] = useState<number>(0);
  const [showEmbeddedPdf, setShowEmbeddedPdf] = useState<boolean>(false);

  // Work page filter
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>('All');

  // Speaking page filter
  const [selectedSpeakingFormat, setSelectedSpeakingFormat] = useState<
    'All' | SpeakingEngagement['format']
  >('All');

  // Modals state
  const [activeLightboxProject, setActiveLightboxProject] = useState<ProjectItem | null>(null);
  const [activeSpeakingItem, setActiveSpeakingItem] = useState<SpeakingEngagement | null>(null);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactOrg, setContactOrg] = useState('');
  const [engagementType, setEngagementType] = useState('Keynote Speaking & Panels');
  const [timeline, setTimeline] = useState('2026');
  const [contactMessage, setContactMessage] = useState('');
  const [submittedInquiry, setSubmittedInquiry] = useState<SavedInquiry | null>(null);
  const [copiedEmailBrief, setCopiedEmailBrief] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('stephanie_portfolio_projects_v3', JSON.stringify(projects));
    } catch {
      // ignore
    }
  }, [projects]);

  const navigateTo = (page: PageId) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInquireWithContext = (subjectTitle: string, type: string) => {
    setEngagementType(type);
    setContactMessage(`Hi Stephanie, I'd love to discuss "${subjectTitle}".`);
    setSubmittedInquiry(null);
    navigateTo('contact');
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;

    const newInquiry: SavedInquiry = {
      id: `inq-${Date.now()}`,
      name: contactName.trim(),
      email: contactEmail.trim(),
      organization: contactOrg.trim() || 'Independent',
      engagementType,
      timeline,
      message: contactMessage.trim(),
      submittedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    };

    setSubmittedInquiry(newInquiry);
  };

  const filteredProjects =
    selectedCategory === 'All'
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

  const filteredSpeaking =
    selectedSpeakingFormat === 'All'
      ? SPEAKING_AND_WRITING
      : SPEAKING_AND_WRITING.filter((s) => s.format === selectedSpeakingFormat);

  const navItems: { id: PageId; label: string }[] = [
    { id: 'overview', label: 'Home' },
    { id: 'cv', label: 'Story & CV' },
    { id: 'work', label: 'Work' },
    { id: 'speaking', label: 'Speaking' },
    { id: 'books', label: 'Books' },
    { id: 'gallery', label: 'Gallery' }
  ];

  const activeHeroPortrait = STEPHANIE_PORTRAITS[heroPortraitIdx] || STEPHANIE_PORTRAITS[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#141413] font-sans overflow-x-hidden">
      {/* Skip to Main Content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#1D4ED8] focus:text-white focus:rounded-lg text-xs font-medium"
      >
        Skip to main content
      </a>

      {/* Strict 3-Zone Top Bar Contract + Clean Mobile Nav Drawer */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E6E4DD]">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-6 px-4 sm:px-6 py-3.5 sm:py-4">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => navigateTo('overview')}
            className="text-base sm:text-lg font-display font-bold tracking-tight text-[#141413] whitespace-nowrap shrink-0 cursor-pointer text-left"
          >
            Stephanie Egharevba
          </button>

          {/* Zone 2: Desktop Navigation Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 lg:gap-7 text-sm font-medium text-[#575652]"
          >
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive ? 'text-[#141413] font-semibold' : 'hover:text-[#141413]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-underline"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      className="absolute bottom-0 inset-x-0 h-[2px] bg-[#1D4ED8]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary CTA & Mobile Menu Toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => navigateTo('contact')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activePage === 'contact'
                  ? 'bg-[#1D4ED8] text-white'
                  : 'bg-[#141413] text-white hover:bg-[#1D4ED8]'
              }`}
            >
              Enquiries
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden w-10 h-10 rounded-lg border border-[#E6E4DD] bg-white flex items-center justify-center text-[#141413] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              aria-label="Mobile navigation"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-[#E6E4DD] bg-white px-4 py-3 space-y-1 overflow-hidden"
            >
              {navItems.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateTo(item.id)}
                    className={`w-full text-left px-3.5 py-3 rounded-lg text-sm font-medium flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-[#FAF9F6] text-[#1D4ED8] font-semibold'
                        : 'text-[#141413] hover:bg-[#FAF9F6]'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="w-4 h-4 opacity-50" />
                  </button>
                );
              })}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1">
        <AnimatePresence mode="wait">
          {/* ================================================================= */}
          {/* PAGE 1: HOME (STEVENBARTLETT.COM INSPIRED)                        */}
          {/* ================================================================= */}
          {activePage === 'overview' && (
            <motion.div
              key="page-overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
            >
              {/* HERO */}
              <section className="bg-[#0B0B0B] text-white">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-16 lg:py-20">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
                    {/* Left Column */}
                    <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
                      <div className="space-y-4 sm:space-y-5">
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.45, ease: EASE_EDITORIAL }}
                          className="text-[11px] sm:text-xs font-mono text-[#60A5FA] tracking-wider"
                        >
                          DIVERSITY & INCLUSION LEAD · SPEAKER · AUTHOR
                        </motion.div>

                        <motion.h1
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.55, delay: 0.08, ease: EASE_EDITORIAL }}
                          className="font-display font-bold tracking-tight text-white leading-[1.03]"
                          style={{
                            fontSize: 'clamp(2.35rem, 5vw, 4.4rem)',
                            textWrap: 'balance'
                          }}
                        >
                          Stephanie{' '}
                          <span className="font-serif italic font-normal text-[#E6E4DD]">
                            Egharevba.
                          </span>
                        </motion.h1>

                        <motion.p
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.55, delay: 0.15, ease: EASE_EDITORIAL }}
                          className="text-base sm:text-lg text-white/80 leading-relaxed max-w-[46ch]"
                        >
                          Scaling disability inclusion, WCAG accessibility, and inclusive talent pipelines across
                          Africa.
                        </motion.p>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.22, ease: EASE_EDITORIAL }}
                        className="space-y-6"
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => navigateTo('cv')}
                            className="group px-5 py-3 text-xs sm:text-sm font-semibold text-[#0B0B0B] bg-white hover:bg-[#E6E4DD] rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
                          >
                            <span>Stephanie’s Story</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </button>

                          <button
                            type="button"
                            onClick={() => navigateTo('books')}
                            className="px-5 py-3 text-xs sm:text-sm font-semibold text-white border border-white/25 hover:border-white rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <BookOpen className="w-4 h-4" />
                            <span>Books & Toolkits</span>
                          </button>
                        </div>

                        <div className="pt-5 border-t border-white/15 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-mono text-white/55">
                          <span>MASTERCARD FOUNDATION</span>
                          <span>·</span>
                          <span>JOBBERMAN</span>
                          <span>·</span>
                          <span>MICROSOFT</span>
                          <span>·</span>
                          <span>GOOGLE</span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Right Column: Portrait */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.1, ease: EASE_EDITORIAL }}
                      className="lg:col-span-5"
                    >
                      <div className="relative h-[380px] sm:h-[460px] lg:h-full rounded-2xl overflow-hidden bg-[#141413] border border-white/15 flex flex-col justify-between">
                        <AnimatePresence mode="wait">
                          <motion.img
                            key={activeHeroPortrait.src}
                            src={activeHeroPortrait.src}
                            alt={activeHeroPortrait.caption}
                            referrerPolicy="no-referrer"
                            initial={{ opacity: 0, scale: 1.04 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: EASE_EDITORIAL }}
                            className="absolute inset-0 w-full h-full object-cover object-top"
                          />
                        </AnimatePresence>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                        <div className="relative z-10 p-4 flex items-center justify-between">
                          <span className="font-mono text-[11px] text-white/80 bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-md">
                            0{heroPortraitIdx + 1} / 0{STEPHANIE_PORTRAITS.length}
                          </span>
                          <button
                            type="button"
                            onClick={() => navigateTo('gallery')}
                            className="text-[11px] font-mono text-white/85 bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-md cursor-pointer"
                          >
                            Gallery ↗
                          </button>
                        </div>

                        <div className="relative z-10 p-4 flex items-end justify-between gap-3">
                          <div className="text-xs font-display font-semibold text-white truncate">
                            {activeHeroPortrait.title}
                          </div>

                          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-lg border border-white/15 shrink-0">
                            {STEPHANIE_PORTRAITS.map((p, idx) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => setHeroPortraitIdx(idx)}
                                aria-label={`Switch portrait ${idx + 1}`}
                                className={`w-7 h-7 rounded overflow-hidden border transition-all cursor-pointer ${
                                  heroPortraitIdx === idx
                                    ? 'border-[#60A5FA] scale-105'
                                    : 'border-white/20 opacity-55 hover:opacity-100'
                                }`}
                              >
                                <img
                                  src={p.src}
                                  alt={p.title}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover object-top"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* 4 Key Stats */}
                  <div className="mt-10 sm:mt-14 pt-8 border-t border-white/15 grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { stat: 'Top 3%', label: 'Global Speaker (Sessionize)' },
                      { stat: 'Top 100', label: 'Women in Tech (ALX 2025)' },
                      { stat: '200+', label: 'Alumni Community Founded' },
                      { stat: '3,000+', label: 'Students & Builders Reached' }
                    ].map((item) => (
                      <div key={item.stat}>
                        <div className="text-2xl sm:text-3xl font-display font-bold text-white tabular-nums">
                          {item.stat}
                        </div>
                        <div className="text-xs text-white/65 mt-0.5">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Marquee Ticker */}
              <div
                aria-hidden="true"
                className="border-b border-[#E6E4DD] bg-[#F2EFE9] py-3 overflow-hidden select-none"
              >
                <div className="animate-marquee flex items-center gap-8 text-xs font-mono text-[#575652]">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <React.Fragment key={idx}>
                      <span className="text-[#141413] font-semibold">TOP 3% GLOBAL SPEAKER</span>
                      <span>·</span>
                      <span>TOP 100 WOMEN IN TECH</span>
                      <span>·</span>
                      <span>MASTERCARD FOUNDATION</span>
                      <span>·</span>
                      <span>JOBBERMAN NIGERIA</span>
                      <span>·</span>
                      <span>AUTHOR OF 3 ACCESSIBILITY BOOKS</span>
                      <span>·</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* SECTION 2: Stephanie's Story */}
              <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-14 sm:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                  <div className="lg:col-span-5">
                    <div
                      onClick={() => navigateTo('cv')}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigateTo('cv');
                        }
                      }}
                      className="group relative h-[340px] sm:h-[440px] rounded-2xl overflow-hidden bg-[#141413] border border-[#E6E4DD] cursor-pointer"
                    >
                      <img
                        src={STEPHANIE_PORTRAITS[3].src}
                        alt={STEPHANIE_PORTRAITS[3].caption}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-7 space-y-5">
                    <div className="text-xs font-mono text-[#1D4ED8] font-medium">STEPHANIE’S STORY</div>
                    <h2 className="text-2xl sm:text-4xl font-display font-bold tracking-tight text-[#141413] leading-tight">
                      “Disability is not the problem—design is the problem.”
                    </h2>
                    <p className="text-base sm:text-lg text-[#3F3E3A] leading-relaxed max-w-[54ch]">
                      Born with Osteogenesis Imperfecta in Lagos, Stephanie leads disability inclusion, WCAG platform
                      auditing, and workforce programs across the Mastercard Foundation, Jobberman, Google, and
                      Microsoft ecosystems.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => navigateTo('cv')}
                        className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#141413] hover:bg-[#1D4ED8] rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
                      >
                        <span>Read Full Story & CV</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <a
                        href={CV_PDF_URL}
                        download="Stephanie_Egharevba_CV.pdf"
                        className="px-4 py-2.5 text-xs sm:text-sm font-medium text-[#575652] hover:text-[#141413] inline-flex items-center gap-1.5"
                      >
                        <Download className="w-4 h-4" />
                        CV PDF
                      </a>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 3: 4 Core Focus Cards */}
              <section className="border-t border-[#E6E4DD] bg-white py-14 sm:py-24">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <div className="text-xs font-mono text-[#575652]">THE ECOSYSTEM</div>
                      <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-[#141413]">
                        What Stephanie Does
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigateTo('work')}
                      className="text-xs sm:text-sm font-semibold text-[#1D4ED8] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Work & Contrast Lab</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {[
                      {
                        num: '01',
                        tag: 'ADF · RUSHBOX',
                        title: 'WCAG & Digital Accessibility',
                        desc: 'Auditing web platforms against international WCAG usability standards.',
                        target: 'work' as PageId
                      },
                      {
                        num: '02',
                        tag: 'MASTERCARD FOUNDATION · CLENT',
                        title: 'D&I Strategy & Policy',
                        desc: 'Scaling disability inclusion frameworks and 200+ member peer networks.',
                        target: 'work' as PageId
                      },
                      {
                        num: '03',
                        tag: 'TOP 3% GLOBAL SPEAKER',
                        title: 'Keynote Speaking & Videos',
                        desc: 'Speaking at InAble, InnovateAI, TechCabal Moonshot, and AISEN.',
                        target: 'speaking' as PageId
                      },
                      {
                        num: '04',
                        tag: '3 PUBLISHED RESOURCES ON SELAR',
                        title: 'Books & Accessibility Toolkits',
                        desc: 'Practical books and WCAG starter kits for founders, designers, and developers.',
                        target: 'books' as PageId
                      }
                    ].map((card) => (
                      <motion.div
                        key={card.num}
                        whileHover={{ y: -4 }}
                        onClick={() => navigateTo(card.target)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigateTo(card.target);
                          }
                        }}
                        className="group p-6 sm:p-8 rounded-2xl bg-[#FAF9F6] border border-[#E6E4DD] hover:border-[#141413] hover:bg-white flex flex-col justify-between space-y-5 transition-colors cursor-pointer"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono text-[#575652]">
                            <span>{card.tag}</span>
                            <span className="font-serif italic text-lg text-[#1D4ED8]">{card.num}</span>
                          </div>
                          <h3 className="text-xl font-display font-bold text-[#141413] group-hover:text-[#1D4ED8] transition-colors">
                            {card.title}
                          </h3>
                          <p className="text-sm text-[#575652]">{card.desc}</p>
                        </div>

                        <div className="flex items-center justify-between text-xs font-semibold text-[#141413] group-hover:text-[#1D4ED8] pt-3 border-t border-[#E6E4DD]">
                          <span>Explore</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* SECTION 4: Books & Toolkits Teaser (Like Steven Bartlett's Books Strip) */}
              <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-14 sm:py-24 space-y-8 border-t border-[#E6E4DD]">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-xs font-mono text-[#575652]">AUTHOR & CREATOR</div>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-[#141413]">
                      Books & Toolkits
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateTo('books')}
                    className="text-xs sm:text-sm font-semibold text-[#1D4ED8] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Explore All Books</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {STEPHANIE_BOOKS.map((book) => (
                    <motion.a
                      key={book.id}
                      href={book.selarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -5 }}
                      className="group bg-white border border-[#E6E4DD] hover:border-[#141413] rounded-2xl overflow-hidden flex flex-col justify-between transition-colors"
                    >
                      <div
                        className="p-6 h-48 flex flex-col justify-between text-white"
                        style={{ backgroundColor: book.coverBg }}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono text-white/65">
                          <span>{book.tag}</span>
                          <span style={{ color: book.accentColor }}>SELAR EDITION ↗</span>
                        </div>
                        <div className="space-y-1">
                          <div className="text-lg font-display font-bold leading-snug text-white">
                            {book.title}
                          </div>
                          <div className="text-xs text-white/70 font-serif italic">{book.subtitle}</div>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <p className="text-xs sm:text-sm text-[#575652] line-clamp-2 leading-relaxed">
                          {book.description}
                        </p>
                        <div className="pt-3 border-t border-[#E6E4DD] flex items-center justify-between text-xs font-semibold text-[#141413] group-hover:text-[#1D4ED8]">
                          <span>Get on Selar</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </section>

              {/* SECTION 5: Portrait Lookbook */}
              <section className="border-t border-[#E6E4DD] bg-white py-14 sm:py-24">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <div className="text-xs font-mono text-[#575652]">PRESS & MEDIA KIT</div>
                      <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-[#141413]">
                        Portraits
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigateTo('gallery')}
                      className="text-xs sm:text-sm font-semibold text-[#1D4ED8] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>All Photos</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-row gap-3 sm:gap-4 lg:h-[400px]">
                    {STEPHANIE_PORTRAITS.map((portrait, idx) => {
                      const isExpanded = hoveredGalleryIdx === idx;
                      return (
                        <div
                          key={portrait.id}
                          onMouseEnter={() => setHoveredGalleryIdx(idx)}
                          onClick={() => navigateTo('gallery')}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              navigateTo('gallery');
                            }
                          }}
                          className={`group relative h-56 sm:h-72 lg:h-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#141413] border border-[#E6E4DD] cursor-pointer transition-all duration-500 ${
                            idx === 0 ? 'col-span-2 sm:col-span-1' : ''
                          } ${isExpanded ? 'lg:flex-[2]' : 'lg:flex-1'}`}
                        >
                          <img
                            src={portrait.src}
                            alt={portrait.caption}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <div className="font-mono text-[10px] text-white/70">0{idx + 1}</div>
                            <div className="text-xs sm:text-sm font-display font-bold truncate">
                              {portrait.title}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {/* ================================================================= */}
          {/* PAGE 2: WORK (CLEAN CARDS + ACCESSIBILITY CONTRAST LAB)           */}
          {/* ================================================================= */}
          {activePage === 'work' && (
            <motion.div
              key="page-work"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
              className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12"
            >
              {/* Compact Header & Filter Bar */}
              <div className="space-y-6 border-b border-[#E6E4DD] pb-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-mono text-[#575652]">SELECTED WORK & AUDITS</div>
                    <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-[#141413]">
                      Projects & Case Studies
                    </h1>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddProjectOpen(true)}
                    className="px-3.5 py-2 text-xs font-medium text-[#141413] bg-white border border-[#E6E4DD] hover:border-[#141413] rounded-lg inline-flex items-center gap-1.5 w-fit cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Project
                  </button>
                </div>

                {/* Clean Filter Tabs */}
                <div
                  role="group"
                  aria-label="Filter projects"
                  className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F2EFE9] rounded-xl w-fit border border-[#E6E4DD]"
                >
                  {(['All', 'WCAG & Accessibility', 'D&I Strategy', 'Workforce & Tech'] as const).map(
                    (cat) => {
                      const isActive = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                            isActive
                              ? 'bg-white text-[#141413] shadow-xs font-semibold'
                              : 'text-[#575652] hover:text-[#141413]'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Clean, Uncluttered 2-Column Project Cards */}
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredProjects.map((project, idx) => (
                    <motion.article
                      layout
                      key={project.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.35, delay: idx * 0.04, ease: EASE_EDITORIAL }}
                      whileHover={{ y: -4 }}
                      onClick={() => setActiveLightboxProject(project)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setActiveLightboxProject(project);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`Inspect ${project.title}`}
                      className="group bg-white border border-[#E6E4DD] hover:border-[#141413] rounded-2xl overflow-hidden flex flex-col justify-between transition-colors cursor-pointer"
                    >
                      <EditorialVisualPlate
                        theme={project.visualTheme}
                        customImageUrl={project.customImageUrl}
                        title={project.title}
                        className="h-48 sm:h-56 w-full"
                      />

                      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2 text-xs text-[#575652] font-mono">
                            <span className="truncate">{project.organization}</span>
                            <span className="tabular-nums shrink-0">{project.year}</span>
                          </div>

                          <h2 className="text-lg sm:text-xl font-display font-bold tracking-tight text-[#141413] group-hover:text-[#1D4ED8] transition-colors">
                            {project.title}
                          </h2>

                          <p className="text-xs sm:text-sm text-[#575652] line-clamp-2 leading-relaxed">
                            {project.summary}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-[#E6E4DD] flex items-center justify-between text-xs font-medium text-[#141413] group-hover:text-[#1D4ED8]">
                          <span className="text-[#575652] font-normal truncate">{project.role}</span>
                          <span className="inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                            Case Study
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Restored Interactive WCAG Contrast Lab */}
              <AccessibilitySandbox />
            </motion.div>
          )}

          {/* ================================================================= */}
          {/* PAGE 3: SPEAKING (EMBEDDED YOUTUBE VIDEOS + TALKS ARCHIVE)        */}
          {/* ================================================================= */}
          {activePage === 'speaking' && (
            <motion.div
              key="page-speaking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
              className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E6E4DD] pb-6">
                <div className="space-y-1">
                  <div className="text-xs font-mono text-[#575652]">
                    TOP 3% GLOBAL SPEAKER · SESSIONIZE
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-[#141413]">
                    Speaking & Featured Videos
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={() => navigateTo('contact')}
                  className="px-4 py-2.5 text-xs font-medium text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg inline-flex items-center gap-1.5 w-fit cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5" />
                  Book Stephanie
                </button>
              </div>

              {/* Embedded YouTube Speaking Videos Showcase */}
              <section aria-label="Featured Speaking Videos" className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-[#575652]">
                  <Play className="w-3.5 h-3.5 text-[#1D4ED8]" />
                  <span>WATCH STEPHANIE ON STAGE & IN CONVERSATION</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {SPEAKING_VIDEOS.map((video) => (
                    <div
                      key={video.id}
                      className="bg-white border border-[#E6E4DD] rounded-2xl overflow-hidden flex flex-col"
                    >
                      <div className="relative w-full aspect-video bg-[#0B0B0B]">
                        <iframe
                          src={video.embedUrl}
                          title={video.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        />
                      </div>
                      <div className="p-4 sm:p-5 space-y-1">
                        <div className="text-[11px] font-mono text-[#1D4ED8]">{video.tag}</div>
                        <h2 className="text-base sm:text-lg font-display font-bold text-[#141413]">
                          {video.title}
                        </h2>
                        <p className="text-xs text-[#575652]">{video.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Speaking Archive List */}
              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E4DD] pb-4">
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-[#141413]">
                    Key Speaking Engagements
                  </h2>

                  <div
                    role="group"
                    aria-label="Filter speaking engagements"
                    className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F2EFE9] rounded-xl w-fit border border-[#E6E4DD]"
                  >
                    {(['All', 'Keynote', 'Fireside Chat', 'Panel', 'Broadcast'] as const).map(
                      (fmt) => {
                        const isActive = selectedSpeakingFormat === fmt;
                        return (
                          <button
                            key={fmt}
                            type="button"
                            onClick={() => setSelectedSpeakingFormat(fmt)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                              isActive
                                ? 'bg-white text-[#141413] shadow-xs font-semibold'
                                : 'text-[#575652] hover:text-[#141413]'
                            }`}
                          >
                            {fmt}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                <div className="divide-y divide-[#E6E4DD] border-b border-[#E6E4DD]">
                  {filteredSpeaking.map((item) => (
                    <article
                      key={item.id}
                      onClick={() => setActiveSpeakingItem(item)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setActiveSpeakingItem(item);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      className="group py-5 first:pt-0 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center cursor-pointer"
                    >
                      <div className="sm:col-span-3 flex sm:flex-col items-center sm:items-start gap-2 sm:gap-0.5 text-xs text-[#575652] font-mono">
                        <span className="text-[#141413] font-medium">{item.year}</span>
                        <span className="sm:hidden">·</span>
                        <span>{item.format}</span>
                      </div>

                      <div className="sm:col-span-7 space-y-0.5">
                        <div className="text-xs text-[#1D4ED8] font-medium">{item.event}</div>
                        <h3 className="text-base sm:text-lg font-display font-bold text-[#141413] group-hover:text-[#1D4ED8] transition-colors">
                          {item.title}
                        </h3>
                      </div>

                      <div className="sm:col-span-2 flex sm:justify-end">
                        <span className="text-xs font-medium text-[#575652] group-hover:text-[#1D4ED8] inline-flex items-center gap-1">
                          Details
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              {/* Publications Grid */}
              <section className="space-y-5">
                <h2 className="text-xl sm:text-2xl font-display font-bold text-[#141413]">
                  Publications & Press Features
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {PUBLICATIONS_AND_FEATURES.map((pub) => (
                    <div
                      key={pub.id}
                      className="bg-white border border-[#E6E4DD] rounded-xl p-5 space-y-1.5"
                    >
                      <div className="text-xs text-[#575652] font-mono">
                        {pub.publisher} · {pub.year}
                      </div>
                      <h3 className="text-base font-display font-bold text-[#141413]">
                        “{pub.title}”
                      </h3>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {/* ================================================================= */}
          {/* PAGE 4: BOOKS & TOOLKITS (SELAR PUBLICATIONS PAGE)                */}
          {/* ================================================================= */}
          {activePage === 'books' && (
            <motion.div
              key="page-books"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
              className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12"
            >
              {/* Header */}
              <div className="space-y-2 border-b border-[#E6E4DD] pb-6">
                <div className="text-xs font-mono text-[#575652]">
                  PUBLISHED BOOKS & PRACTICAL TOOLKITS · SELAR
                </div>
                <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-[#141413]">
                  Books by Stephanie Egharevba
                </h1>
                <p className="text-sm sm:text-base text-[#3F3E3A] max-w-[58ch]">
                  Practical guides, blueprints, and WCAG starter kits helping founders, engineers, and designers build
                  accessible products.
                </p>
              </div>

              {/* 3 Featured Books Showcase */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {STEPHANIE_BOOKS.map((book, idx) => (
                  <motion.article
                    key={book.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.08, ease: EASE_EDITORIAL }}
                    whileHover={{ y: -6 }}
                    className="bg-white border border-[#E6E4DD] hover:border-[#141413] rounded-2xl overflow-hidden flex flex-col justify-between transition-colors"
                  >
                    {/* Editorial Book Cover Visual */}
                    <div
                      className="p-7 sm:p-8 min-h-[260px] flex flex-col justify-between text-white relative overflow-hidden"
                      style={{ backgroundColor: book.coverBg }}
                    >
                      <div className="relative z-10 flex items-center justify-between text-xs font-mono text-white/70 border-b border-white/15 pb-3">
                        <span>{book.tag}</span>
                        <span style={{ color: book.accentColor }}>STEPHANIE EGHAREVBA</span>
                      </div>

                      <div className="relative z-10 my-6 space-y-2">
                        <h2 className="text-2xl font-display font-bold leading-snug text-white">
                          {book.title}
                        </h2>
                        <p className="font-serif italic text-base text-white/80">
                          {book.subtitle}
                        </p>
                      </div>

                      <div className="relative z-10 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] font-mono text-white/60">
                        <span>DIGITAL EDITION</span>
                        <span>SELAR.COM</span>
                      </div>
                    </div>

                    {/* Book Details & Direct Selar Link */}
                    <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                      <div className="space-y-4">
                        <p className="text-sm text-[#3F3E3A] leading-relaxed">
                          {book.description}
                        </p>

                        <ul className="space-y-2 pt-2 border-t border-[#E6E4DD]">
                          {book.highlights.map((hl, i) => (
                            <li key={i} className="text-xs text-[#575652] flex items-start gap-2">
                              <span className="font-mono text-[#1D4ED8] font-semibold">0{i + 1}</span>
                              <span>{hl}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <a
                        href={book.selarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 px-4 text-xs font-semibold text-white bg-[#141413] hover:bg-[#1D4ED8] rounded-xl transition-colors inline-flex items-center justify-center gap-2"
                      >
                        <span>Get This Book on Selar</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          )}

          {/* ================================================================= */}
          {/* PAGE 5: GALLERY & PRESS KIT                                       */}
          {/* ================================================================= */}
          {activePage === 'gallery' && (
            <motion.div
              key="page-gallery"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
              className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-16"
            >
              <PhotoGalleryPressKit
                onNavigateToCV={() => navigateTo('cv')}
                onNavigateToContact={() => navigateTo('contact')}
              />
            </motion.div>
          )}

          {/* ================================================================= */}
          {/* PAGE 6: STORY & CV (SCANNABLE, COMPACT & MOBILE-READY)            */}
          {/* ================================================================= */}
          {activePage === 'cv' && (
            <motion.div
              key="page-cv"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
              className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12"
            >
              {/* Compact Header */}
              <section className="border-b border-[#E6E4DD] pb-8 space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
                  <div className="space-y-2 max-w-2xl">
                    <div className="text-xs font-mono text-[#575652]">
                      CURRICULUM VITAE · LAGOS, NIGERIA
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-[#141413]">
                      Stephanie Osasumwen Egharevba
                    </h1>
                    <p className="text-sm font-medium text-[#1D4ED8]">
                      Diversity & Inclusion Lead · Disability Inclusion Specialist · Tech Strategist
                    </p>
                    <p className="text-sm sm:text-base text-[#3F3E3A] leading-relaxed pt-1">
                      Designing and scaling disability inclusion frameworks, WCAG platform audits, and technical
                      communities across the Mastercard Foundation, Jobberman, Microsoft, and Google ecosystems.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowEmbeddedPdf((prev) => !prev)}
                      className="px-3.5 py-2.5 text-xs font-medium text-[#141413] bg-white border border-[#E6E4DD] rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {showEmbeddedPdf ? 'Hide PDF' : 'Preview PDF'}
                    </button>

                    <a
                      href={CV_PDF_URL}
                      download="EGHAREVBA_STEPHANIE_CV.pdf"
                      className="px-4 py-2.5 text-xs font-medium text-white bg-[#1D4ED8] rounded-lg inline-flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download CV
                    </a>
                  </div>
                </div>

                {/* Embedded PDF Viewer */}
                <AnimatePresence>
                  {showEmbeddedPdf && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-white border border-[#E6E4DD] rounded-2xl overflow-hidden"
                    >
                      <div className="px-4 py-2.5 bg-[#F2EFE9] border-b border-[#E6E4DD] flex items-center justify-between text-xs font-mono text-[#575652]">
                        <span>EGHAREVBA_STEPHANIE_CV.PDF</span>
                        <a
                          href={CV_PDF_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1D4ED8] inline-flex items-center gap-1"
                        >
                          Open Fullscreen
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <iframe
                        src={CV_PDF_URL}
                        title="Official CV PDF"
                        className="w-full h-[520px] sm:h-[680px] border-0"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Core Competencies */}
                <div className="text-xs text-[#575652] font-mono pt-1">
                  {CORE_COMPETENCIES.join(' · ')}
                </div>
              </section>

              {/* Scannable Experience List */}
              <section className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-display font-bold text-[#141413]">
                  Experience
                </h2>

                <div className="divide-y divide-[#E6E4DD] border-y border-[#E6E4DD]">
                  {PROFESSIONAL_EXPERIENCE.map((exp) => (
                    <div
                      key={exp.id}
                      className="py-5 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-baseline"
                    >
                      <div className="sm:col-span-3 text-xs font-mono text-[#1D4ED8] tabular-nums">
                        {exp.period}
                      </div>

                      <div className="sm:col-span-9 space-y-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="text-base sm:text-lg font-display font-bold text-[#141413]">
                            {exp.role}
                          </h3>
                          <span className="text-xs font-medium text-[#575652]">
                            {exp.organization}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#3F3E3A] leading-relaxed">
                          {exp.summary}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Compact Education & Honors Grid */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-[#E6E4DD] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E6E4DD] pb-3">
                    <h2 className="text-lg font-display font-bold text-[#141413]">Education</h2>
                    <GraduationCap className="w-4 h-4 text-[#1D4ED8]" />
                  </div>
                  <div className="divide-y divide-[#E6E4DD]">
                    {EDUCATION_HISTORY.map((edu, idx) => (
                      <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-baseline justify-between gap-3">
                        <div>
                          <div className="text-sm font-display font-bold text-[#141413]">{edu.degree}</div>
                          <div className="text-xs text-[#575652]">{edu.institution}</div>
                        </div>
                        <span className="text-xs font-mono text-[#1D4ED8] shrink-0">{edu.period}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-[#E6E4DD] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E6E4DD] pb-3">
                    <h2 className="text-lg font-display font-bold text-[#141413]">Honors & Awards</h2>
                    <Award className="w-4 h-4 text-[#1D4ED8]" />
                  </div>
                  <div className="divide-y divide-[#E6E4DD]">
                    {HONORS_AND_RECOGNITION.map((honor) => (
                      <div key={honor.id} className="py-3 first:pt-0 last:pb-0 flex items-baseline justify-between gap-3">
                        <div>
                          <div className="text-sm font-display font-bold text-[#141413]">{honor.title}</div>
                          <div className="text-xs text-[#575652]">{honor.issuer}</div>
                        </div>
                        <span className="text-xs font-mono text-[#1D4ED8] shrink-0">{honor.year}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {/* ================================================================= */}
          {/* PAGE 7: ENQUIRIES / CONTACT                                       */}
          {/* ================================================================= */}
          {activePage === 'contact' && (
            <motion.div
              key="page-contact"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
              className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-16"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* Left Column */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-[#575652]">GET IN TOUCH</div>
                    <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-[#141413]">
                      Enquiries
                    </h1>
                    <p className="text-sm sm:text-base text-[#3F3E3A]">
                      Speaking engagements, WCAG platform audits, and D&I strategy.
                    </p>
                  </div>

                  <div className="bg-white border border-[#E6E4DD] rounded-2xl p-5 sm:p-6 space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                      <a
                        href="mailto:stephanieegharevba83@gmail.com"
                        className="font-medium text-[#141413] hover:text-[#1D4ED8] break-all"
                      >
                        stephanieegharevba83@gmail.com
                      </a>
                    </div>

                    <div className="flex items-center gap-3 border-t border-[#E6E4DD] pt-3.5 text-sm">
                      <Phone className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                      <a
                        href="tel:+2348162447467"
                        className="font-mono font-medium text-[#141413] hover:text-[#1D4ED8]"
                      >
                        +234 816 244 7467
                      </a>
                    </div>

                    <div className="flex items-center gap-3 border-t border-[#E6E4DD] pt-3.5 text-sm">
                      <MapPin className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                      <span className="text-[#575652]">Lagos, Nigeria · Global Remote</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Clean Form */}
                <div className="lg:col-span-7 bg-white border border-[#E6E4DD] rounded-2xl p-5 sm:p-8">
                  {submittedInquiry ? (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between border-b border-[#E6E4DD] pb-4">
                        <h2 className="text-xl font-display font-bold text-[#141413]">
                          Brief Ready, {submittedInquiry.name}
                        </h2>
                        <button
                          type="button"
                          onClick={() => setSubmittedInquiry(null)}
                          className="text-xs font-medium text-[#1D4ED8] cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>

                      <div className="bg-[#FAF9F6] border border-[#E6E4DD] rounded-xl p-4 font-mono text-xs text-[#272725] whitespace-pre-wrap">
                        {`TO: stephanieegharevba83@gmail.com\nSUBJECT: ${submittedInquiry.engagementType} — ${submittedInquiry.organization}\nFROM: ${submittedInquiry.name} (${submittedInquiry.email})\n\n${submittedInquiry.message}`}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const body = `TO: stephanieegharevba83@gmail.com\nSUBJECT: ${submittedInquiry.engagementType}\nFROM: ${submittedInquiry.name}\n\n${submittedInquiry.message}`;
                            navigator.clipboard.writeText(body);
                            setCopiedEmailBrief(true);
                            setTimeout(() => setCopiedEmailBrief(false), 2000);
                          }}
                          className="px-4 py-2.5 text-xs font-medium text-white bg-[#1D4ED8] rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedEmailBrief ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedEmailBrief ? 'Copied' : 'Copy Brief'}
                        </button>

                        <a
                          href={`mailto:stephanieegharevba83@gmail.com?subject=${encodeURIComponent(
                            `${submittedInquiry.engagementType} — ${submittedInquiry.organization}`
                          )}&body=${encodeURIComponent(submittedInquiry.message)}`}
                          className="px-4 py-2.5 text-xs font-medium text-[#141413] bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg inline-flex items-center gap-1.5"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Send in Mail App
                        </a>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="c-name" className="block text-xs font-medium text-[#141413] mb-1">
                            Name *
                          </label>
                          <input
                            id="c-name"
                            type="text"
                            required
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="Your name"
                            className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg"
                          />
                        </div>

                        <div>
                          <label htmlFor="c-email" className="block text-xs font-medium text-[#141413] mb-1">
                            Email *
                          </label>
                          <input
                            id="c-email"
                            type="email"
                            required
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="you@organization.com"
                            className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="c-org" className="block text-xs font-medium text-[#141413] mb-1">
                            Organization
                          </label>
                          <input
                            id="c-org"
                            type="text"
                            value={contactOrg}
                            onChange={(e) => setContactOrg(e.target.value)}
                            placeholder="Company or Event"
                            className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg"
                          />
                        </div>

                        <div>
                          <label htmlFor="c-type" className="block text-xs font-medium text-[#141413] mb-1">
                            Inquiry Type
                          </label>
                          <select
                            id="c-type"
                            value={engagementType}
                            onChange={(e) => setEngagementType(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg"
                          >
                            <option value="Keynote Speaking & Panels">Keynote Speaking & Panels</option>
                            <option value="WCAG Accessibility Audit">WCAG Accessibility Audit</option>
                            <option value="D&I Strategy & Advisory">D&I Strategy & Advisory</option>
                            <option value="Workforce & Partnerships">Workforce & Partnerships</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="c-msg" className="block text-xs font-medium text-[#141413] mb-1">
                          Message *
                        </label>
                        <textarea
                          id="c-msg"
                          required
                          rows={4}
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder="How can Stephanie help?"
                          className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-3 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg inline-flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Send Enquiry
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-[#E6E4DD] bg-[#0B0B0B] text-white mt-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-white/60">
          <div className="font-display font-bold text-sm text-white">
            Stephanie Egharevba
          </div>

          <div className="flex flex-wrap items-center gap-5">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateTo(item.id)}
                className="hover:text-white transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => navigateTo('contact')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Enquiries
            </button>
          </div>

          <div className="font-mono text-[11px] text-white/45">
            © {new Date().getFullYear()} Stephanie Egharevba
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProjectLightboxModal
        project={activeLightboxProject}
        onClose={() => setActiveLightboxProject(null)}
        onInquireAboutProject={(projectTitle) =>
          handleInquireWithContext(projectTitle, 'WCAG Accessibility Audit')
        }
      />

      <SpeakingReaderModal
        item={activeSpeakingItem}
        onClose={() => setActiveSpeakingItem(null)}
        onBookTopic={(topicTitle) =>
          handleInquireWithContext(topicTitle, 'Keynote Speaking & Panels')
        }
      />

      <AddProjectModal
        isOpen={isAddProjectOpen}
        onClose={() => setIsAddProjectOpen(false)}
        onAddProject={(newProj) => setProjects((prev) => [newProj, ...prev])}
      />
    </div>
  );
}

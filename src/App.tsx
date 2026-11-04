import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Calendar,
  Check,
  Copy,
  Download,
  ExternalLink,
  Eye,
  GraduationCap,
  Instagram,
  Linkedin,
  Lock,
  Mail,
  MapPin,
  Menu,
  Mic,
  Moon,
  Phone,
  Play,
  Plus,
  Send,
  ShieldCheck,
  Sun,
  X,
} from 'lucide-react';
import {
  collection,
  doc,
  addDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
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
  STEPHANIE_PORTRAITS,
} from './data/portfolioData';
import { EditorialVisualPlate } from './components/VisualPlates';
import { BookMockup } from './components/BookMockup';
import { AccessibilitySandbox } from './components/AccessibilitySandbox';
import {
  AddProjectModal,
  ProjectLightboxModal,
  SpeakingReaderModal,
} from './components/ProjectModals';
import { PhotoGalleryPressKit } from './components/PhotoGalleryPressKit';
import { StoryAndCvView } from './components/StoryAndCvView';
import {
  FloatingAccessibilityWidget,
  AccessibilityPreferences,
} from './components/FloatingAccessibilityWidget';
import {
  CmsAdminModal,
  CmsSiteSettings,
  CmsProjectRecord,
  CmsArticleRecord,
} from './components/CmsAdminModal';
import { db, handleFirestoreError, OperationType } from './lib/firebase';

const DEFAULT_LINKEDIN_URL =
  'https://www.linkedin.com/in/egharevbastephanie?utm_source=share_via&utm_content=profile&utm_medium=member_android';
const DEFAULT_INSTAGRAM_URL =
  'https://www.instagram.com/egharevba_stephanie?psln=ODI1cDZpbHk2MjNz';

const DEFAULT_SITE_SETTINGS: CmsSiteSettings = {
  heroTagline: 'DIVERSITY & INCLUSION LEAD · SPEAKER · AUTHOR',
  heroQuote: 'Disability is not the problem—design is the problem.',
  heroSubtext:
    'Scaling digital accessibility, inclusive systems, and global talent pipelines.',
  seoTitle: 'Stephanie Egharevba — Portfolio',
  seoDescription:
    'Minimalist editorial portfolio of Stephanie Egharevba: Disability Inclusion Strategist, Digital Accessibility Advocate, Author, and Public Speaker.',
  linkedinUrl: DEFAULT_LINKEDIN_URL,
  instagramUrl: DEFAULT_INSTAGRAM_URL,
  bookingCalendarUrl: '',
};

const APPROVED_100_WORD_BIO =
  'Stephanie Osasumwen Egharevba is a Nigerian Diversity & Inclusion Leader, Disability Inclusion Specialist, and Public Speaker based in Lagos. Ranked in the Top 3% of Global Speakers on Sessionize and named among ALX Nigeria’s Top 100 Women in Tech (2025), she serves as Associate Engagement Officer at Jobberman Nigeria and Talent Corp Ambassador for the Mastercard Foundation Project Initiative. Previously Diversity & Inclusion Lead for the Mastercard Foundation Youth Advisory Council Nigeria—where she founded the 200+ member Alumni Disability Community—she audits digital platforms against WCAG usability standards for the African Disability Forum and Rushbox.';

const DEFAULT_A11Y_PREFS: AccessibilityPreferences = {
  theme: 'light',
  fontScale: 'normal',
  readableFont: false,
  highlightLinks: false,
  reduceMotion: false,
};

interface SavedInquiry {
  id: string;
  referenceId: string;
  name: string;
  email: string;
  organization: string;
  engagementType: string;
  timeline: string;
  budgetRange?: string;
  message: string;
  confirmationMessage: string;
  submittedAt: string;
}

const EASE_EDITORIAL: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Accessibility & Theme Preferences (Light / Dark / Contrast + Font Scale + Motion)
  const [a11yPrefs, setA11yPrefs] = useState<AccessibilityPreferences>(() => {
    try {
      const saved = localStorage.getItem('stephanie_a11y_prefs_v1');
      return saved ? { ...DEFAULT_A11Y_PREFS, ...JSON.parse(saved) } : DEFAULT_A11Y_PREFS;
    } catch {
      return DEFAULT_A11Y_PREFS;
    }
  });

  // WCAG AA Motion Sensitivity: OS prefers-reduced-motion hook + in-app toggle
  const systemPrefersReducedMotion = useReducedMotion();
  const prefersReduced = Boolean(systemPrefersReducedMotion || a11yPrefs.reduceMotion);

  // Apply Accessibility & Theme Preferences to <html> attributes
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-theme', a11yPrefs.theme);
    html.setAttribute('data-font-scale', a11yPrefs.fontScale);
    html.setAttribute('data-readable-font', String(a11yPrefs.readableFont));
    html.setAttribute('data-highlight-links', String(a11yPrefs.highlightLinks));
    html.setAttribute('data-reduce-motion', String(a11yPrefs.reduceMotion));
    try {
      localStorage.setItem('stephanie_a11y_prefs_v1', JSON.stringify(a11yPrefs));
    } catch {
      // ignore
    }
  }, [a11yPrefs]);

  // Real-time CMS State from Firestore
  const [siteSettings, setSiteSettings] = useState<CmsSiteSettings>(DEFAULT_SITE_SETTINGS);
  const [cmsProjects, setCmsProjects] = useState<CmsProjectRecord[]>([]);
  const [cmsArticles, setCmsArticles] = useState<CmsArticleRecord[]>([]);
  const [isCmsModalOpen, setIsCmsModalOpen] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);

  // NDPA / GDPR Cookie & Privacy Consent Banner
  const [cookieConsent, setCookieConsent] = useState<'accepted' | 'essential' | null>(() => {
    try {
      return (localStorage.getItem('stephanie_ndpa_consent_v1') as 'accepted' | 'essential') || null;
    } catch {
      return null;
    }
  });

  // Local + CMS Combined Projects (v5 ensures fresh schematic thumbnails & Client Africa spelling)
  const [localProjects, setLocalProjects] = useState<ProjectItem[]>(() => {
    try {
      const saved = localStorage.getItem('stephanie_portfolio_projects_v5');
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

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

  // Accessible Enquiries & Speaker-Fee Request Form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactOrg, setContactOrg] = useState('');
  const [engagementType, setEngagementType] = useState<
    | 'Keynote Speaking'
    | 'WCAG Accessibility Audit'
    | 'D&I Strategy Advisory'
    | 'Speaking Fee & Availability Request'
    | 'Media & Press'
  >('Keynote Speaking');
  const [timeline, setTimeline] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [ndpaConsent, setNdpaConsent] = useState(true);
  const [honeypotWebsite, setHoneypotWebsite] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [submittedInquiry, setSubmittedInquiry] = useState<SavedInquiry | null>(null);
  const [copiedEmailBrief, setCopiedEmailBrief] = useState(false);

  // Newsletter Sign-up state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterConsent, setNewsletterConsent] = useState(true);
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);

  // Sync Firestore CMS Data
  useEffect(() => {
    const settingsUnsub = onSnapshot(
      doc(db, 'cms_settings', 'global'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<CmsSiteSettings>;
          setSiteSettings((prev) => ({
            ...prev,
            ...data,
            linkedinUrl: data.linkedinUrl || DEFAULT_LINKEDIN_URL,
            instagramUrl: data.instagramUrl || DEFAULT_INSTAGRAM_URL,
          }));
        }
      },
      (err) => {
        console.warn('CMS settings read note:', err.message);
      }
    );

    const projUnsub = onSnapshot(
      query(collection(db, 'cms_projects'), where('status', '==', 'published')),
      (snap) => {
        const list: CmsProjectRecord[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CmsProjectRecord, 'id'>),
        }));
        setCmsProjects(list);
      },
      (err) => {
        console.warn('CMS projects read note:', err.message);
      }
    );

    const artUnsub = onSnapshot(
      query(collection(db, 'cms_articles'), where('status', '==', 'published')),
      (snap) => {
        const list: CmsArticleRecord[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CmsArticleRecord, 'id'>),
        }));
        setCmsArticles(list);
      },
      (err) => {
        console.warn('CMS articles read note:', err.message);
      }
    );

    return () => {
      settingsUnsub();
      projUnsub();
      artUnsub();
    };
  }, []);

  // Dynamically update document <title> & meta description for SEO
  useEffect(() => {
    const pageLabels: Record<PageId, string> = {
      overview: siteSettings.seoTitle,
      cv: 'Story & CV — Stephanie Egharevba',
      work: 'Projects & WCAG Contrast Lab — Stephanie Egharevba',
      speaking: 'Keynote Speaking & Videos — Stephanie Egharevba',
      books: 'Books & Accessibility Toolkits — Stephanie Egharevba',
      gallery: 'Press Portraits & Media Kit — Stephanie Egharevba',
      contact: 'Speaker & Consulting Enquiries — Stephanie Egharevba',
    };
    document.title = pageLabels[activePage] || siteSettings.seoTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', siteSettings.seoDescription);
    }
  }, [activePage, siteSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('stephanie_portfolio_projects_v5', JSON.stringify(localProjects));
    } catch {
      // ignore
    }
  }, [localProjects]);

  // Discrete admin shortcut (Ctrl+Shift+A or Meta+Shift+A) to access CMS without public UI artifacts
  useEffect(() => {
    const handleAdminKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsCmsModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleAdminKey);
    return () => window.removeEventListener('keydown', handleAdminKey);
  }, []);

  const navigateTo = (page: PageId) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: a11yPrefs.reduceMotion ? 'auto' : 'smooth' });
  };

  const handleInquireWithContext = (
    subjectTitle: string,
    type:
      | 'Keynote Speaking'
      | 'WCAG Accessibility Audit'
      | 'D&I Strategy Advisory'
      | 'Speaking Fee & Availability Request'
      | 'Media & Press'
  ) => {
    setEngagementType(type);
    setContactMessage(`Hi Stephanie, I'd love to discuss "${subjectTitle}".`);
    setSubmittedInquiry(null);
    navigateTo('contact');
  };

  // Submit Enquiry via Express Backend Validation + Firestore Persistence
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmittingEnquiry(true);

    try {
      const response = await fetch('/api/enquiries/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          organization: contactOrg,
          inquiryType: engagementType,
          eventDateOrTimeline: timeline,
          budgetRange,
          message: contactMessage,
          ndpaConsent,
          honeypotWebsite,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setFormErrors(
          data.errors || { general: data.error || 'Please check the form fields and try again.' }
        );
        setIsSubmittingEnquiry(false);
        return;
      }

      // If not a honeypot bot, persist to Firestore `enquiries` collection
      if (!data.spamFiltered && data.sanitizedPayload) {
        const p = data.sanitizedPayload;
        const path = 'enquiries';
        try {
          await addDoc(collection(db, 'enquiries'), {
            name: p.name,
            email: p.email,
            organization: p.organization,
            inquiryType: p.inquiryType,
            ...(p.eventDateOrTimeline ? { eventDateOrTimeline: p.eventDateOrTimeline } : {}),
            ...(p.budgetRange ? { budgetRange: p.budgetRange } : {}),
            message: p.message,
            ndpaConsent: true,
            status: 'new',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (firestoreErr) {
          try {
            handleFirestoreError(firestoreErr, OperationType.CREATE, path);
          } catch {
            // Even if offline, still show the validated confirmation receipt
          }
        }
      }

      const newInquiry: SavedInquiry = {
        id: `inq-${Date.now()}`,
        referenceId: data.referenceId || `SE-${Date.now().toString(36).toUpperCase()}`,
        name: contactName.trim(),
        email: contactEmail.trim(),
        organization: contactOrg.trim() || 'Independent / Direct',
        engagementType,
        timeline: timeline.trim() || 'Flexible',
        budgetRange: budgetRange.trim(),
        message: contactMessage.trim(),
        confirmationMessage:
          data.confirmationMessage ||
          'Your enquiry has been logged in the dashboard and prepared for direct response.',
        submittedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };

      setSubmittedInquiry(newInquiry);
    } catch {
      setFormErrors({
        general: 'Unable to validate right now. Please check your connection and try again.',
      });
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  // Newsletter Submission
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterStatus(null);
    try {
      const res = await fetch('/api/newsletter/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newsletterEmail,
          consent: newsletterConsent,
          honeypot: '',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setNewsletterStatus(data.error || 'Please enter a valid email address.');
        return;
      }

      try {
        await addDoc(collection(db, 'newsletter_subscribers'), {
          email: data.email,
          consent: true,
          createdAt: serverTimestamp(),
        });
      } catch {
        // ignore duplicate/offline
      }

      setNewsletterEmail('');
      setNewsletterStatus(data.message || 'Subscribed to Stephanie’s inclusion & WCAG notes.');
    } catch {
      setNewsletterStatus('Could not subscribe right now.');
    }
  };

  const handleSaveCookieConsent = (choice: 'accepted' | 'essential') => {
    setCookieConsent(choice);
    try {
      localStorage.setItem('stephanie_ndpa_consent_v1', choice);
    } catch {
      // ignore
    }
  };

  // Merge CMS published projects with initial CV projects
  const mappedCmsProjects: ProjectItem[] = cmsProjects.map((cp) => ({
    id: cp.id,
    title: cp.title,
    subtitle: cp.subtitle,
    category: cp.category,
    year: cp.year,
    organization: cp.organization,
    role: cp.role,
    visualTheme: 'audit',
    customImageUrl: cp.imageUrl,
    summary: cp.summary,
    challenge: cp.challenge,
    intervention: cp.intervention,
    impactMetrics: cp.impactMetrics.split('|').map((s) => s.trim()),
    deliverables: ['WCAG 2.2 AAVerified Deliverable', cp.imageAlt],
  }));

  const allProjects = [...mappedCmsProjects, ...localProjects];

  const filteredProjects =
    selectedCategory === 'All'
      ? allProjects
      : allProjects.filter((p) => p.category === selectedCategory);

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
    { id: 'gallery', label: 'Gallery' },
  ];

  const toggleDarkLightMode = () => {
    setA11yPrefs((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

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
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-3.5 sm:py-4">
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

          {/* Zone 3: Relocated Social Icons, Theme Toggle, Enquiries CTA & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1 pr-1 mr-1 border-r border-[#E6E4DD]">
              <a
                href={siteSettings.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Stephanie Egharevba on LinkedIn"
                title="LinkedIn"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#575652] hover:text-[#141413] hover:bg-[#F2EFE9] transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href={siteSettings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Stephanie Egharevba on Instagram"
                title="Instagram"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#575652] hover:text-[#141413] hover:bg-[#F2EFE9] transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>

            {/* Quick Light / Dark Mode Switch (Desktop/Tablet) */}
            <button
              type="button"
              onClick={toggleDarkLightMode}
              aria-label={
                a11yPrefs.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
              }
              title={a11yPrefs.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="hidden sm:flex w-9 h-9 rounded-lg border border-[#E6E4DD] bg-white items-center justify-center text-[#141413] hover:border-[#1D4ED8] transition-colors cursor-pointer"
            >
              {a11yPrefs.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#60A5FA]" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Enquiries CTA (Desktop/Tablet) */}
            <button
              type="button"
              onClick={() => navigateTo('contact')}
              className={`hidden sm:inline-flex px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activePage === 'contact'
                  ? 'bg-[#1D4ED8] text-white'
                  : 'bg-[#141413] text-white hover:bg-[#1D4ED8]'
              }`}
            >
              Enquiries
            </button>

            {/* Mobile Menu Toggle Button (Prominent & Uncrowded on mobile) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden w-10 h-10 rounded-xl border border-[#E6E4DD] bg-white flex items-center justify-center text-[#141413] hover:border-[#1D4ED8] transition-colors cursor-pointer shrink-0"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
              className="md:hidden border-t border-[#E6E4DD] bg-white px-4 py-3 space-y-1.5 overflow-hidden shadow-lg"
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

              {/* Mobile Enquiries Primary Action Button */}
              <div className="pt-2 pb-1 px-0.5">
                <button
                  type="button"
                  onClick={() => navigateTo('contact')}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors shadow-xs cursor-pointer ${
                    activePage === 'contact'
                      ? 'bg-[#1D4ED8] text-white'
                      : 'bg-[#141413] text-white hover:bg-[#1D4ED8]'
                  }`}
                >
                  <span>Book / Enquiries</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Social Links & Theme Switch inside Mobile Drawer Footer */}
              <div className="pt-3 mt-2 border-t border-[#E6E4DD] flex items-center justify-between px-1 py-1">
                <div className="flex items-center gap-3">
                  <a
                    href={siteSettings.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Stephanie Egharevba on LinkedIn"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#141413] hover:text-[#1D4ED8]"
                  >
                    <Linkedin className="w-4 h-4 text-[#1D4ED8]" />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href={siteSettings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Stephanie Egharevba on Instagram"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#141413] hover:text-[#1D4ED8]"
                  >
                    <Instagram className="w-4 h-4 text-[#1D4ED8]" />
                    <span>Instagram</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={toggleDarkLightMode}
                  className="px-2.5 py-1.5 rounded-lg border border-[#E6E4DD] bg-[#FAF9F6] text-xs font-medium text-[#141413] flex items-center gap-1.5 cursor-pointer"
                >
                  {a11yPrefs.theme === 'dark' ? (
                    <Sun className="w-3.5 h-3.5 text-[#60A5FA]" />
                  ) : (
                    <Moon className="w-3.5 h-3.5" />
                  )}
                  <span>{a11yPrefs.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1">
        <AnimatePresence mode="wait">
          {/* ================================================================= */}
          {/* PAGE 1: HOME (EXECUTIVE EDITORIAL HERO — AEONIK TRIAL)            */}
          {/* ================================================================= */}
          {activePage === 'overview' && (
            <motion.div
              key="page-overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
            >
              {/* EXECUTIVE EDITORIAL HERO */}
              <section className="bg-[#0B0B0B] text-white">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-10 pb-8 sm:pt-20 sm:pb-12">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 items-center">
                    {/* Left Column: Aeonik Trial Hierarchy + Simplified CTAs (No Partner Strips) */}
                    <div className="lg:col-span-7 flex flex-col justify-between space-y-6 sm:space-y-8">
                      <div className="space-y-4 sm:space-y-5">
                        {/* 1. Subdued Slate Eyebrow in Aeonik Regular/Medium */}
                        <motion.p
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.45, ease: EASE_EDITORIAL }}
                          className="font-sans text-[11px] sm:text-[13px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]"
                        >
                          {siteSettings.heroTagline}
                        </motion.p>

                        {/* 2. Pure Aeonik Trial H1 (Fluid, Mobile-Safe Sizing) */}
                        <motion.h1
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.55, delay: 0.08, ease: EASE_EDITORIAL }}
                          className="font-display font-bold tracking-[-0.03em] text-white leading-[1.05]"
                          style={{
                            fontSize: 'clamp(2.35rem, 6.5vw, 4rem)',
                          }}
                        >
                          Stephanie Egharevba
                        </motion.h1>

                        {/* 3. Polished Sub-headline in Aeonik Regular (#CBD5E1, 18px-20px, 1.6 line-height) */}
                        <motion.p
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.55, delay: 0.15, ease: EASE_EDITORIAL }}
                          className="font-sans text-[16px] sm:text-[19px] lg:text-[20px] font-normal text-[#CBD5E1] leading-[1.6] max-w-[44ch]"
                        >
                          {siteSettings.heroSubtext}
                        </motion.p>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.22, ease: EASE_EDITORIAL }}
                        className="pt-1"
                      >
                        {/* Simplified Two-Action CTA Row: full-width on mobile, pill row on tablet+ */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5">
                          <button
                            type="button"
                            onClick={() => navigateTo('work')}
                            className="group px-7 py-3.5 text-sm font-semibold text-[#000000] bg-[#FFFFFF] hover:bg-[#E2E8F0] active:scale-[0.98] rounded-full transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                          >
                            <span>Explore Work &amp; Advisory</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </button>

                          <button
                            type="button"
                            onClick={() => navigateTo('contact')}
                            className="px-7 py-3.5 text-sm font-medium text-white bg-white/[0.04] border border-white/20 hover:bg-white/[0.1] hover:border-white/35 active:scale-[0.98] rounded-full transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <span>Book for Speaking</span>
                          </button>
                        </div>
                      </motion.div>
                    </div>

                    {/* Right Column: Pure Magazine Portrait */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.65, delay: 0.1, ease: EASE_EDITORIAL }}
                      className="lg:col-span-5"
                    >
                      <div className="relative h-[340px] sm:h-[480px] lg:h-[520px] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#141413] border border-white/[0.08] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.75)]">
                        <img
                          src={STEPHANIE_PORTRAITS[2].src}
                          alt={STEPHANIE_PORTRAITS[2].caption}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Stats Row with Generous Breathing Room & Vertical Dividers */}
                  <motion.div
                    initial={a11yPrefs.reduceMotion ? false : { opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.65, delay: 0.1, ease: EASE_EDITORIAL }}
                    className="mt-10 sm:mt-14 pt-8 sm:pt-12 pb-6 sm:pb-10 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-y-7 gap-x-4 sm:gap-x-6 lg:gap-x-0 lg:divide-x lg:divide-white/10"
                  >
                    {[
                      { stat: 'Top 3%', label: 'Global Speaker (Sessionize)' },
                      { stat: 'Top 100', label: 'Women in Tech (ALX 2025)' },
                      { stat: '200+', label: 'Alumni Community Founded' },
                      { stat: '3,000+', label: 'Students & Builders Reached' },
                    ].map((item, index) => (
                      <div
                        key={item.stat}
                        className={index > 0 ? 'lg:pl-10' : 'lg:pr-6'}
                      >
                        <div className="font-display text-[26px] sm:text-[34px] lg:text-[40px] font-bold tracking-tight text-white tabular-nums leading-none">
                          {item.stat}
                        </div>
                        <div className="font-sans text-[12px] sm:text-[14px] font-normal text-[#94A3B8] mt-2 sm:mt-2.5">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </section>

              {/* SECTION 2: THE STORY SECTION (SPEAKER PORTRAIT IN SKY-BLUE BLAZER + ANCHOR THESIS QUOTE) */}
              <motion.section
                initial={a11yPrefs.reduceMotion ? false : { opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-70px' }}
                transition={{ duration: 0.75, ease: EASE_EDITORIAL }}
                className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-24"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 items-center">
                  {/* Left: Speaker Portrait in Sky-Blue Blazer */}
                  <motion.div
                    initial={a11yPrefs.reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.7, delay: 0.08, ease: EASE_EDITORIAL }}
                    className="lg:col-span-5"
                  >
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
                      className="group relative h-[320px] sm:h-[440px] lg:h-[480px] rounded-2xl overflow-hidden bg-[#0F172A] border border-[#E2E8F0] shadow-[0_20px_50px_-20px_rgba(15,23,42,0.18)] cursor-pointer"
                    >
                      <img
                        src={STEPHANIE_PORTRAITS[1].src}
                        alt={STEPHANIE_PORTRAITS[1].caption}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    </div>
                  </motion.div>

                  {/* Right: High-Impact Aeonik Thesis Quote + Simplified CTAs */}
                  <motion.div
                    initial={a11yPrefs.reduceMotion ? false : { opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.7, delay: 0.16, ease: EASE_EDITORIAL }}
                    className="lg:col-span-7 space-y-5 sm:space-y-6"
                  >
                    <div className="font-sans text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                      STEPHANIE’S STORY
                    </div>

                    <h2
                      className="font-display font-bold tracking-[-0.03em] text-[#0F172A] leading-[1.12]"
                      style={{
                        fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                      }}
                    >
                      “{siteSettings.heroQuote}”
                    </h2>

                    <p className="font-sans text-[15px] sm:text-[18px] text-[#334155] leading-[1.65] max-w-[54ch]">
                      Born with Osteogenesis Imperfecta in Lagos, Stephanie leads disability
                      inclusion, WCAG platform auditing, and workforce programs across the
                      Mastercard Foundation, Jobberman, Google, and Microsoft ecosystems.
                    </p>

                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-6">
                      <button
                        type="button"
                        onClick={() => navigateTo('cv')}
                        className="group px-7 py-3.5 text-sm font-semibold text-white bg-[#111111] hover:bg-[#1D4ED8] active:scale-[0.98] rounded-full transition-all inline-flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
                      >
                        <span>Read Full Story &amp; CV</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </button>

                      <a
                        href={CV_PDF_URL}
                        download="Stephanie_Egharevba_CV.pdf"
                        className="text-sm font-semibold text-[#0F172A] hover:text-[#1D4ED8] transition-colors inline-flex items-center justify-center sm:justify-start gap-2 py-2"
                      >
                        <Download className="w-4 h-4 text-[#64748B]" />
                        <span>Download CV (PDF)</span>
                      </a>
                    </div>
                  </motion.div>
                </div>
              </motion.section>

              {/* SECTION 3: "WHAT STEPHANIE DOES" — BESPOKE EDITORIAL PRACTICE CARDS */}
              <motion.section
                initial={a11yPrefs.reduceMotion ? false : { opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-70px' }}
                transition={{ duration: 0.75, ease: EASE_EDITORIAL }}
                className="border-t border-[#E2E8F0] bg-white py-12 sm:py-20 lg:py-24"
              >
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">
                  <motion.div
                    initial={a11yPrefs.reduceMotion ? false : { opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6, ease: EASE_EDITORIAL }}
                    className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="font-sans text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                        EXECUTIVE PRACTICE &amp; ADVISORY
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-[#0F172A]">
                        What Stephanie Does
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigateTo('work')}
                      className="text-sm font-semibold text-[#0F172A] hover:text-[#1D4ED8] transition-colors inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                    >
                      <span>View Case Studies &amp; Contrast Lab</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                    {/* Card 1: WCAG & Digital Accessibility (Deliverables-Focused) */}
                    <motion.div
                      initial={prefersReduced ? false : { opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={
                        prefersReduced
                          ? { duration: 0 }
                          : { duration: 0.38, delay: 0, ease: EASE_EDITORIAL }
                      }
                      onClick={() => navigateTo('work')}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigateTo('work');
                        }
                      }}
                      className="group p-6 sm:p-8 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0F172A] transition-colors duration-200 flex flex-col justify-between space-y-6 cursor-pointer"
                    >
                      <div className="space-y-4">
                        <div className="font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                          AFRICAN DISABILITY FORUM · RUSHBOX
                        </div>
                        <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-[#0F172A]">
                          WCAG &amp; Digital Accessibility
                        </h3>
                        <p className="text-[14px] sm:text-[15px] text-[#475569] leading-relaxed">
                          End-to-end accessibility engineering for web and mobile platforms—uncovering
                          usability barriers and shipping remediated, compliant user journeys.
                        </p>
                        <div className="pt-1 flex flex-wrap gap-2">
                          {[
                            'WCAG 2.2 AA/AAA Audits',
                            'Engineering Teardowns',
                            'Compliance Roadmaps',
                          ].map((deliverable) => (
                            <span
                              key={deliverable}
                              className="px-2.5 sm:px-3 py-1 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#334155]"
                            >
                              {deliverable}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-semibold text-[#0F172A] group-hover:text-[#1D4ED8] transition-colors">
                        <span>Inspect Audits &amp; Contrast Lab</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </motion.div>

                    {/* Card 2: D&I Strategy & Policy (Institutional Scale) */}
                    <motion.div
                      initial={prefersReduced ? false : { opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={
                        prefersReduced
                          ? { duration: 0 }
                          : { duration: 0.38, delay: 0.08, ease: EASE_EDITORIAL }
                      }
                      onClick={() => navigateTo('work')}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigateTo('work');
                        }
                      }}
                      className="group p-6 sm:p-8 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0F172A] transition-colors duration-200 flex flex-col justify-between space-y-6 cursor-pointer"
                    >
                      <div className="space-y-4">
                        <div className="font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                          MASTERCARD FOUNDATION · PARTNER
                        </div>
                        <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-[#0F172A]">
                          D&amp;I Strategy &amp; Policy
                        </h3>
                        <p className="text-[14px] sm:text-[15px] text-[#475569] leading-relaxed">
                          Institutional inclusion architecture designed for the Mastercard Foundation
                          and national workforce pipelines—from recruitment policy to the 200+
                          member Alumni Disability Community.
                        </p>
                        <div className="pt-1 grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                            <div className="font-display text-base sm:text-lg font-bold text-[#0F172A]">
                              200+ Alumni
                            </div>
                            <div className="text-[11px] sm:text-xs text-[#64748B]">
                              Peer &amp; Policy Network
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                            <div className="font-display text-base sm:text-lg font-bold text-[#0F172A]">
                              3,000+ Youth
                            </div>
                            <div className="text-[11px] sm:text-xs text-[#64748B]">
                              Workforce Pipelines
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-semibold text-[#0F172A] group-hover:text-[#1D4ED8] transition-colors">
                        <span>Review Institutional Programmes</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </motion.div>

                    {/* Card 3: Keynotes & Speaking (Stage Proof Points) */}
                    <motion.div
                      initial={prefersReduced ? false : { opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={
                        prefersReduced
                          ? { duration: 0 }
                          : { duration: 0.38, delay: 0.16, ease: EASE_EDITORIAL }
                      }
                      onClick={() => navigateTo('speaking')}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigateTo('speaking');
                        }
                      }}
                      className="group p-6 sm:p-8 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0F172A] transition-colors duration-200 flex flex-col justify-between space-y-6 cursor-pointer"
                    >
                      <div className="space-y-4">
                        <div className="font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                          TOP 3% GLOBAL SPEAKER · SESSIONIZE
                        </div>
                        <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-[#0F172A]">
                          Keynotes &amp; Executive Stages
                        </h3>
                        <p className="text-[14px] sm:text-[15px] text-[#475569] leading-relaxed">
                          High-authority keynotes on AI accessibility, inclusive product leadership,
                          and resilient ecosystems delivered across Africa’s premier technology stages.
                        </p>
                        <div className="pt-1 flex flex-wrap items-center gap-2">
                          {[
                            'TechCabal Moonshot',
                            'InAble Africa',
                            'AISEN Summit',
                            'InnovateAI Lagos',
                          ].map((stage) => (
                            <span
                              key={stage}
                              className="px-2.5 sm:px-3 py-1 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold text-[#0F172A]"
                            >
                              {stage}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-semibold text-[#0F172A] group-hover:text-[#1D4ED8] transition-colors">
                        <span>Watch Keynotes &amp; Speaking Topics</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </motion.div>

                    {/* Card 4: Frameworks & Toolkits (Direct to Resources & Downloads) */}
                    <motion.div
                      initial={prefersReduced ? false : { opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={
                        prefersReduced
                          ? { duration: 0 }
                          : { duration: 0.38, delay: 0.24, ease: EASE_EDITORIAL }
                      }
                      onClick={() => navigateTo('books')}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigateTo('books');
                        }
                      }}
                      className="group p-6 sm:p-8 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0F172A] transition-colors duration-200 flex flex-col justify-between space-y-6 cursor-pointer"
                    >
                      <div className="space-y-4">
                        <div className="font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                          PUBLISHED FRAMEWORKS &amp; SELAR EDITIONS
                        </div>
                        <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-[#0F172A]">
                          Frameworks &amp; Accessibility Toolkits
                        </h3>
                        <p className="text-[14px] sm:text-[15px] text-[#475569] leading-relaxed">
                          Ready-to-deploy WCAG audit checklists, semantic HTML engineering guides,
                          and executive playbooks built for product teams and founders.
                        </p>
                        <div className="pt-1 flex flex-wrap gap-2">
                          {[
                            'Executive Briefing',
                            'Developer Blueprint',
                            'WCAG Audit Starter Kit',
                          ].map((item) => (
                            <span
                              key={item}
                              className="px-2.5 sm:px-3 py-1 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#334155]"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-semibold text-[#0F172A] group-hover:text-[#1D4ED8] transition-colors">
                        <span>Access Frameworks &amp; Downloads</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.section>

              {/* SECTION 4: BOOKS & TOOLKITS (SINGLE-SURFACE CARDS + 3D BOOK MOCKUPS) */}
              <motion.section
                initial={a11yPrefs.reduceMotion ? false : { opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-70px' }}
                transition={{ duration: 0.75, ease: EASE_EDITORIAL }}
                className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-24 space-y-8 sm:space-y-10 border-t border-[#E2E8F0]"
              >
                <motion.div
                  initial={a11yPrefs.reduceMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, ease: EASE_EDITORIAL }}
                  className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="font-sans text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                      AUTHOR &amp; CREATOR
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-[#0F172A]">
                      Books &amp; Toolkits
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateTo('books')}
                    className="text-sm font-semibold text-[#0F172A] hover:text-[#1D4ED8] transition-colors inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <span>View Complete Publication Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {STEPHANIE_BOOKS.map((book, idx) => (
                    <motion.a
                      key={book.id}
                      href={book.selarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={a11yPrefs.reduceMotion ? false : { opacity: 0, y: 28 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{ duration: 0.65, delay: idx * 0.12, ease: EASE_EDITORIAL }}
                      className="group p-6 sm:p-8 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0F172A] transition-colors duration-200 flex flex-col justify-between space-y-6"
                    >
                      <div className="space-y-6">
                        {/* Distinct Category Tag Only */}
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                            {book.tag}
                          </span>
                        </div>

                        {/* Physical 2D/3D Hardcover Book Mockup */}
                        <BookMockup book={book} />

                        {/* Title & Complete Two-Sentence Description (Never Truncated) */}
                        <div className="space-y-2.5 pt-1">
                          <h3 className="text-xl font-display font-bold tracking-tight text-[#0F172A] group-hover:text-[#1D4ED8] transition-colors">
                            {book.title}
                          </h3>
                          <p className="text-sm text-[#475569] leading-relaxed">
                            {book.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-semibold text-[#0F172A] group-hover:text-[#1D4ED8] transition-colors">
                        <span>Get on Selar</span>
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </motion.a>
                  ))}
                </div>
              </motion.section>
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
              {/* Executive Header & Filter Bar (No Public CMS/Staging Controls) */}
              <div className="space-y-6 border-b border-[#E2E8F0] pb-7">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                      SELECTED WORK &amp; TECHNICAL AUDITS
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-[#0F172A]">
                      Projects &amp; Case Studies
                    </h1>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleInquireWithContext(
                        'WCAG 2.2 Platform Audit & D&I Advisory',
                        'WCAG Accessibility Audit'
                      )
                    }
                    className="group px-5 py-2.5 text-xs font-semibold text-white bg-[#111111] hover:bg-[#1D4ED8] rounded-full transition-colors inline-flex items-center gap-2 w-fit cursor-pointer"
                  >
                    <span>Commission an Audit or Advisory</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>

                {/* Clean Filter Tabs */}
                <div
                  role="group"
                  aria-label="Filter projects"
                  className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F1F5F9] rounded-xl w-fit border border-[#E2E8F0]"
                >
                  {(
                    ['All', 'WCAG & Accessibility', 'D&I Strategy', 'Workforce & Tech'] as const
                  ).map((cat) => {
                    const isActive = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                          isActive
                            ? 'bg-white text-[#0F172A] shadow-xs font-semibold'
                            : 'text-[#64748B] hover:text-[#0F172A]'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clean, Uncluttered 2-Column Case Study Cards */}
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7">
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
                      aria-label={`Read case study: ${project.title}`}
                      className="group bg-white border border-[#E2E8F0] hover:border-[#0F172A] rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 cursor-pointer"
                    >
                      <EditorialVisualPlate
                        theme={project.visualTheme}
                        customImageUrl={project.customImageUrl}
                        title={project.title}
                        className="h-48 sm:h-52 w-full border-b border-[#E2E8F0]"
                      />

                      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5">
                        <div className="space-y-2">
                          {/* Combined Organization · Role Tag */}
                          <div className="text-xs font-medium text-[#64748B] truncate">
                            {project.organization} · {project.role}
                          </div>

                          {/* Bold Aeonik Medium/Semibold 20px Project Title */}
                          <h2 className="text-[20px] font-display font-semibold tracking-tight text-[#0F172A] group-hover:text-[#1D4ED8] transition-colors leading-snug">
                            {project.title}
                          </h2>

                          {/* Concise Two-Line Description */}
                          <p className="text-sm text-[#475569] line-clamp-2 leading-relaxed">
                            {project.summary}
                          </p>
                        </div>

                        <div className="pt-3.5 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-semibold text-[#0F172A] group-hover:text-[#1D4ED8] transition-colors">
                          <span className="font-mono text-[11px] font-normal text-[#64748B] tabular-nums">
                            {project.year}
                          </span>
                          <span className="inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                            <span>View Case Study</span>
                            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </span>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Signature Interactive WCAG Contrast Lab */}
              <div id="contrast-lab-section">
                <AccessibilitySandbox />
              </div>
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

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleInquireWithContext(
                        'Speaking Fee & Keynote Availability',
                        'Speaking Fee & Availability Request'
                      )
                    }
                    className="px-4 py-2.5 text-xs font-medium text-[#141413] bg-white border border-[#E6E4DD] hover:border-[#141413] rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#1D4ED8]" />
                    Request Speaking Fee
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTo('contact')}
                    className="px-4 py-2.5 text-xs font-medium text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg inline-flex items-center gap-1.5 w-fit cursor-pointer"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    Book Stephanie
                  </button>
                </div>
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
                          loading="lazy"
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

              {/* Publications & Press Grid */}
              <section className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-[#141413]">
                    Publications, Press &amp; Testimonials
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cmsArticles.map((art) => (
                    <div
                      key={art.id}
                      className="bg-white border border-[#E6E4DD] rounded-xl p-5 space-y-1.5"
                    >
                      <div className="text-xs text-[#1D4ED8] font-mono">
                        {art.category.toUpperCase()} · {art.publisher} · {art.year}
                      </div>
                      <h3 className="text-base font-display font-bold text-[#141413]">
                        “{art.title}”
                      </h3>
                      <p className="text-xs text-[#575652] leading-relaxed">{art.excerpt}</p>
                    </div>
                  ))}
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
                  Practical guides, blueprints, and WCAG starter kits helping founders, engineers,
                  and designers build accessible products.
                </p>
              </div>

              {/* 3 Featured Books Showcase (Cohesive Single-Surface Cards + Physical Book Mockups) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {STEPHANIE_BOOKS.map((book, idx) => (
                  <motion.article
                    key={book.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.08, ease: EASE_EDITORIAL }}
                    className="p-8 bg-white border border-[#E2E8F0] hover:border-[#0F172A] rounded-2xl flex flex-col justify-between space-y-6 transition-colors"
                  >
                    <div className="space-y-6">
                      {/* Distinct Top Category Tag */}
                      <div className="flex items-center justify-between">
                        <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                          {book.tag}
                        </span>
                      </div>

                      {/* Physical 3D Book Mockup */}
                      <BookMockup book={book} />

                      {/* Book Title, Subtitle & Untruncated Description */}
                      <div className="space-y-3">
                        <h2 className="text-2xl font-display font-bold tracking-tight text-[#0F172A]">
                          {book.title}
                        </h2>
                        <p className="text-xs font-medium text-[#64748B]">{book.subtitle}</p>
                        <p className="text-sm text-[#334155] leading-relaxed">{book.description}</p>

                        <ul className="space-y-2 pt-3 border-t border-[#F1F5F9]">
                          {book.highlights.map((hl, i) => (
                            <li key={i} className="text-xs text-[#475569] flex items-start gap-2.5">
                              <span className="font-sans text-[#1D4ED8] font-bold">•</span>
                              <span>{hl}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <a
                      href={book.selarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-5 text-xs font-semibold text-white bg-[#111111] hover:bg-[#1D4ED8] rounded-full transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <span>Get on Selar</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
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
          {/* PAGE 6: STORY & CV (INTERACTIVE STORY VS. CV EXPERIENCE)          */}
          {/* ================================================================= */}
          {activePage === 'cv' && (
            <motion.div
              key="page-cv"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
            >
              <StoryAndCvView
                onNavigateToContact={() => navigateTo('contact')}
                onNavigateToWork={() => navigateTo('work')}
              />
            </motion.div>
          )}

          {/* ================================================================= */}
          {/* PAGE 7: ENQUIRIES, SPEAKING-FEE REQUEST & SOCIAL CHANNELS         */}
          {/* ================================================================= */}
          {activePage === 'contact' && (
            <motion.div
              key="page-contact"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
              className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-14"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* Left Column: Direct Contact, Social Media & Booking Links */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-[#575652]">
                      SPEAKING · AUDITS · ADVISORY
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-[#141413]">
                      Enquiries & Booking
                    </h1>
                    <p className="text-sm sm:text-base text-[#3F3E3A]">
                      Book Stephanie for keynotes, request speaking fees, or commission a WCAG
                      accessibility audit.
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

                    {/* Social Media Channels */}
                    <div className="border-t border-[#E6E4DD] pt-4 space-y-2.5">
                      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#575652]">
                        Official Social Channels
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <a
                          href={siteSettings.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] py-2.5 px-3 text-xs font-semibold text-[#141413] hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-colors"
                        >
                          <Linkedin className="w-4 h-4 text-[#1D4ED8]" />
                          <span>LinkedIn</span>
                        </a>
                        <a
                          href={siteSettings.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] py-2.5 px-3 text-xs font-semibold text-[#141413] hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-colors"
                        >
                          <Instagram className="w-4 h-4 text-[#1D4ED8]" />
                          <span>Instagram</span>
                        </a>
                      </div>
                    </div>

                    {siteSettings.bookingCalendarUrl && (
                      <div className="border-t border-[#E6E4DD] pt-4">
                        <a
                          href={siteSettings.bookingCalendarUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#111111] py-3 px-4 text-xs font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Book Discovery Call Calendar</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Accessible Server-Validated Form (No Puzzle CAPTCHA) */}
                <div className="lg:col-span-7 bg-white border border-[#E6E4DD] rounded-2xl p-5 sm:p-8">
                  {submittedInquiry ? (
                    <div className="space-y-5" role="status" aria-live="polite">
                      <div className="flex items-center justify-between border-b border-[#E6E4DD] pb-4">
                        <div>
                          <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-600 font-semibold">
                            Confirmed · Ref #{submittedInquiry.referenceId}
                          </span>
                          <h2 className="text-xl font-display font-bold text-[#141413]">
                            Enquiry Logged, {submittedInquiry.name}
                          </h2>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSubmittedInquiry(null)}
                          className="text-xs font-medium text-[#1D4ED8] cursor-pointer"
                        >
                          Submit Another
                        </button>
                      </div>

                      <p className="text-xs sm:text-sm text-[#3F3E3A] leading-relaxed">
                        {submittedInquiry.confirmationMessage}
                      </p>

                      <div className="bg-[#FAF9F6] border border-[#E6E4DD] rounded-xl p-4 font-mono text-xs text-[#272725] whitespace-pre-wrap">
                        {`REF: ${submittedInquiry.referenceId}\nTO: stephanieegharevba83@gmail.com\nSUBJECT: ${submittedInquiry.engagementType} — ${submittedInquiry.organization}\nFROM: ${submittedInquiry.name} (${submittedInquiry.email})\nTIMELINE: ${submittedInquiry.timeline}${submittedInquiry.budgetRange ? `\nBUDGET TIER: ${submittedInquiry.budgetRange}` : ''}\n\n${submittedInquiry.message}`}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const body = `REF: ${submittedInquiry.referenceId}\nTO: stephanieegharevba83@gmail.com\nSUBJECT: ${submittedInquiry.engagementType}\nFROM: ${submittedInquiry.name}\n\n${submittedInquiry.message}`;
                            navigator.clipboard.writeText(body);
                            setCopiedEmailBrief(true);
                            setTimeout(() => setCopiedEmailBrief(false), 2000);
                          }}
                          className="px-4 py-2.5 text-xs font-medium text-white bg-[#1D4ED8] rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedEmailBrief ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          {copiedEmailBrief ? 'Copied Receipt' : 'Copy Confirmation Brief'}
                        </button>

                        <a
                          href={`mailto:stephanieegharevba83@gmail.com?subject=${encodeURIComponent(
                            `[${submittedInquiry.referenceId}] ${submittedInquiry.engagementType} — ${submittedInquiry.organization}`
                          )}&body=${encodeURIComponent(submittedInquiry.message)}`}
                          className="px-4 py-2.5 text-xs font-medium text-[#141413] bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg inline-flex items-center gap-1.5"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Also Open in Email App
                        </a>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} noValidate className="space-y-4">
                      {formErrors.general && (
                        <div
                          role="alert"
                          className="rounded-xl border border-red-400 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700"
                        >
                          {formErrors.general}
                        </div>
                      )}

                      {/* Honeypot field for accessible spam protection (hidden from screen readers & visual users) */}
                      <div className="sr-only" aria-hidden="true">
                        <label htmlFor="c-honeypot-website">Leave this field empty</label>
                        <input
                          id="c-honeypot-website"
                          type="text"
                          tabIndex={-1}
                          autoComplete="off"
                          value={honeypotWebsite}
                          onChange={(e) => setHoneypotWebsite(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="c-name"
                            className="block text-xs font-semibold text-[#141413] mb-1"
                          >
                            Full Name <span aria-hidden="true">*</span>
                          </label>
                          <input
                            id="c-name"
                            type="text"
                            required
                            aria-invalid={Boolean(formErrors.name)}
                            aria-describedby={formErrors.name ? 'c-name-error' : undefined}
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="Your full name"
                            className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg"
                          />
                          {formErrors.name && (
                            <p id="c-name-error" role="alert" className="text-xs text-red-600 mt-1">
                              {formErrors.name}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="c-email"
                            className="block text-xs font-semibold text-[#141413] mb-1"
                          >
                            Email Address <span aria-hidden="true">*</span>
                          </label>
                          <input
                            id="c-email"
                            type="email"
                            required
                            aria-invalid={Boolean(formErrors.email)}
                            aria-describedby={formErrors.email ? 'c-email-error' : undefined}
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="you@organization.com"
                            className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg"
                          />
                          {formErrors.email && (
                            <p
                              id="c-email-error"
                              role="alert"
                              className="text-xs text-red-600 mt-1"
                            >
                              {formErrors.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="c-org"
                            className="block text-xs font-semibold text-[#141413] mb-1"
                          >
                            Organization or Event Name
                          </label>
                          <input
                            id="c-org"
                            type="text"
                            value={contactOrg}
                            onChange={(e) => setContactOrg(e.target.value)}
                            placeholder="Company, Conference or NGO"
                            className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="c-type"
                            className="block text-xs font-semibold text-[#141413] mb-1"
                          >
                            Enquiry Type
                          </label>
                          <select
                            id="c-type"
                            value={engagementType}
                            onChange={(e) =>
                              setEngagementType(
                                e.target.value as
                                  | 'Keynote Speaking'
                                  | 'WCAG Accessibility Audit'
                                  | 'D&I Strategy Advisory'
                                  | 'Speaking Fee & Availability Request'
                                  | 'Media & Press'
                              )
                            }
                            className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg"
                          >
                            <option value="Keynote Speaking">Keynote Speaking</option>
                            <option value="Speaking Fee & Availability Request">
                              Speaking Fee & Availability Request
                            </option>
                            <option value="WCAG Accessibility Audit">
                              WCAG Accessibility Audit
                            </option>
                            <option value="D&I Strategy Advisory">D&I Strategy Advisory</option>
                            <option value="Media & Press">Media & Press</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="c-timeline"
                            className="block text-xs font-semibold text-[#141413] mb-1"
                          >
                            Event Date or Timeline (Optional)
                          </label>
                          <input
                            id="c-timeline"
                            type="text"
                            value={timeline}
                            onChange={(e) => setTimeline(e.target.value)}
                            placeholder="e.g., Q3 2026 / Nov 15"
                            className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="c-budget"
                            className="block text-xs font-semibold text-[#141413] mb-1"
                          >
                            Speaking Fee / Consulting Tier (Optional)
                          </label>
                          <select
                            id="c-budget"
                            value={budgetRange}
                            onChange={(e) => setBudgetRange(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg"
                          >
                            <option value="">Select tier (optional)</option>
                            <option value="Corporate / International Keynote">
                              Corporate / International Keynote
                            </option>
                            <option value="Full Platform WCAG Audit">
                              Full Platform WCAG Audit
                            </option>
                            <option value="NGO / Academic / Ecosystem Rate">
                              NGO / Academic / Ecosystem Rate
                            </option>
                            <option value="Request Official Fee Schedule">
                              Request Official Fee Schedule
                            </option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="c-msg"
                          className="block text-xs font-semibold text-[#141413] mb-1"
                        >
                          Enquiry Details <span aria-hidden="true">*</span>
                        </label>
                        <textarea
                          id="c-msg"
                          required
                          rows={4}
                          aria-invalid={Boolean(formErrors.message)}
                          aria-describedby={formErrors.message ? 'c-msg-error' : undefined}
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder="Share your event theme, audience, or platform audit goals..."
                          className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg"
                        />
                        {formErrors.message && (
                          <p id="c-msg-error" role="alert" className="text-xs text-red-600 mt-1">
                            {formErrors.message}
                          </p>
                        )}
                      </div>

                      {/* NDPA & GDPR Consent Checkbox */}
                      <div className="pt-1">
                        <label className="flex items-start gap-2.5 text-xs text-[#575652] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={ndpaConsent}
                            onChange={(e) => setNdpaConsent(e.target.checked)}
                            className="mt-0.5 rounded border-[#D4D2CC] text-[#1D4ED8]"
                          />
                          <span>
                            I consent to having my enquiry stored securely in accordance with the{' '}
                            <button
                              type="button"
                              onClick={() => setIsPrivacyModalOpen(true)}
                              className="underline font-semibold text-[#141413] hover:text-[#1D4ED8] cursor-pointer"
                            >
                              Nigeria Data Protection Act (NDPA) &amp; GDPR Privacy Policy
                            </button>{' '}
                            (you can request deletion at any time).
                          </span>
                        </label>
                        {formErrors.ndpaConsent && (
                          <p role="alert" className="text-xs text-red-600 mt-1">
                            {formErrors.ndpaConsent}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                        <button
                          type="submit"
                          disabled={isSubmittingEnquiry}
                          className="w-full sm:w-auto px-6 py-3 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-50 rounded-lg inline-flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {isSubmittingEnquiry
                            ? 'Validating & Saving...'
                            : 'Submit Accessible Enquiry'}
                        </button>

                        <span className="font-mono text-[10px] text-[#575652]">
                          Protected by Honeypot Validation · No Visual CAPTCHAs
                        </span>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Optional Newsletter Sign-Up Section */}
              <section
                aria-label="Newsletter Sign-up"
                className="rounded-2xl border border-[#E6E4DD] bg-white p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#1D4ED8]">
                    INCLUSION & ACCESSIBILITY DISPATCH
                  </div>
                  <h2 className="text-xl font-display font-bold text-[#141413]">
                    Subscribe to Stephanie’s Newsletter
                  </h2>
                  <p className="text-xs sm:text-sm text-[#575652]">
                    Occasional field notes on WCAG 2.2 audits, disability policy across Africa, and
                    new book releases.
                  </p>
                </div>

                <form
                  onSubmit={handleNewsletterSubmit}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto"
                >
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="nl-email" className="sr-only">
                      Email address for newsletter
                    </label>
                    <input
                      id="nl-email"
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email..."
                      className="px-4 py-2.5 text-sm bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg min-w-[240px]"
                    />
                    <label className="flex items-center gap-1.5 text-[11px] text-[#575652]">
                      <input
                        type="checkbox"
                        checked={newsletterConsent}
                        onChange={(e) => setNewsletterConsent(e.target.checked)}
                      />
                      <span>I agree to receive email updates (unsubscribe anytime)</span>
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-[#141413] hover:bg-[#1D4ED8] rounded-lg transition-colors cursor-pointer shrink-0 self-start"
                  >
                    Subscribe
                  </button>
                </form>
              </section>
              {newsletterStatus && (
                <p role="status" className="text-xs font-mono text-[#1D4ED8]">
                  {newsletterStatus}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* NDPA & GDPR Cookie / Privacy Consent Banner */}
      <AnimatePresence>
        {!cookieConsent && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            role="region"
            aria-label="Cookie and Privacy Consent"
            className="fixed bottom-4 left-4 right-20 sm:right-auto sm:max-w-md z-40 rounded-2xl border border-[#E6E4DD] bg-white p-4 shadow-2xl text-[#141413]"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1D4ED8]">
                  NDPA &amp; GDPR Privacy Notice
                </span>
                <button
                  type="button"
                  onClick={() => setIsPrivacyModalOpen(true)}
                  className="font-mono text-[10px] underline text-[#575652] hover:text-[#141413] cursor-pointer"
                >
                  Privacy Policy
                </button>
              </div>
              <p className="text-xs text-[#3F3E3A] leading-relaxed">
                We use privacy-friendly storage to remember your accessibility preferences (dark
                mode, text size) and protect enquiries under the Nigeria Data Protection Act (NDPA)
                &amp; GDPR.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSaveCookieConsent('accepted')}
                  className="rounded-lg bg-[#1D4ED8] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1E40AF] cursor-pointer"
                >
                  Accept All
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCookieConsent('essential')}
                  className="rounded-lg border border-[#E6E4DD] bg-[#FAF9F6] px-3.5 py-1.5 text-xs font-medium text-[#141413] hover:border-[#141413] cursor-pointer"
                >
                  Essential Only
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Accessibility Circle Button on All Pages */}
      <FloatingAccessibilityWidget
        preferences={a11yPrefs}
        onUpdatePreferences={setA11yPrefs}
        onResetPreferences={() => setA11yPrefs(DEFAULT_A11Y_PREFS)}
        onNavigateToContrastLab={() => {
          navigateTo('work');
          setTimeout(() => {
            document
              .getElementById('contrast-lab-section')
              ?.scrollIntoView({ behavior: 'smooth' });
          }, 250);
        }}
      />

      {/* Footer with LinkedIn, Instagram, CMS Portal & Privacy Policy */}
      <footer className="border-t border-[#E6E4DD] bg-[#0B0B0B] text-white mt-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs text-white/60">
            <div className="space-y-1">
              <div className="font-display font-bold text-base text-white">
                Stephanie Egharevba
              </div>
              <p className="text-xs text-white/50">
                Diversity &amp; Inclusion Lead · Speaker · Author
              </p>
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

            {/* Social Media Links */}
            <div className="flex items-center gap-3">
              <a
                href={siteSettings.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Stephanie Egharevba on LinkedIn"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white hover:border-[#60A5FA] hover:text-[#60A5FA] transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
              </a>
              <a
                href={siteSettings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Stephanie Egharevba on Instagram"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white hover:border-[#60A5FA] hover:text-[#60A5FA] transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </a>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono text-white/45">
            <div>© {new Date().getFullYear()} Stephanie Egharevba · All Rights Reserved</div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(true)}
                className="hover:text-white transition-colors cursor-pointer"
              >
                NDPA &amp; GDPR Privacy Policy
              </button>
              <span>·</span>
              <a
                href="/api/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Sitemap.xml
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Policy & NDPA / GDPR Data Rights Modal */}
      {isPrivacyModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label="NDPA and GDPR Privacy Policy"
        >
          <div className="w-full max-w-xl rounded-2xl border border-[#E6E4DD] bg-white p-6 text-[#141413] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E6E4DD] pb-3">
              <h2 className="font-display text-lg font-bold">
                Privacy Policy (Nigeria Data Protection Act &amp; GDPR)
              </h2>
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(false)}
                aria-label="Close privacy policy"
                className="rounded-lg p-1.5 text-[#575652] hover:bg-[#FAF9F6] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-[#3F3E3A] leading-relaxed">
              <p>
                <strong>1. Data Collection &amp; Purpose:</strong> When you submit a speaking or
                consulting enquiry, we collect your name, email address, organization, and message
                strictly to respond to your request.
              </p>
              <p>
                <strong>2. Zero Tracking Without Consent:</strong> Accessibility settings (theme
                mode, font size, reduced motion) are stored locally on your device.
              </p>
              <p>
                <strong>3. Right to Erasure (NDPA &amp; GDPR):</strong> You may request immediate
                permanent deletion of any stored enquiry by emailing{' '}
                <a
                  href="mailto:stephanieegharevba83@gmail.com"
                  className="text-[#1D4ED8] underline"
                >
                  stephanieegharevba83@gmail.com
                </a>
                . Administrators can permanently purge any record with one click inside the CMS
                Enquiries Dashboard.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(false)}
                className="rounded-lg bg-[#141413] px-4 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Headless CMS, Enquiries Inbox, Backups & Backend Handover Brief Modal */}
      <CmsAdminModal
        isOpen={isCmsModalOpen}
        onClose={() => setIsCmsModalOpen(false)}
        siteSettings={siteSettings}
        cmsProjects={cmsProjects}
        cmsArticles={cmsArticles}
      />

      {/* Project & Speaking Modals */}
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
        onBookTopic={(topicTitle) => handleInquireWithContext(topicTitle, 'Keynote Speaking')}
      />

      <AddProjectModal
        isOpen={isAddProjectOpen}
        onClose={() => setIsAddProjectOpen(false)}
        onAddProject={(newProj) => setLocalProjects((prev) => [newProj, ...prev])}
      />
    </div>
  );
}

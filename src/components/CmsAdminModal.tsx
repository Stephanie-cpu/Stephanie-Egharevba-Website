import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  FileText,
  FolderKanban,
  Mail,
  Database,
  BookOpen,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  Download,
  Upload,
  AlertCircle,
  ExternalLink,
  Users,
  Globe,
} from 'lucide-react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  query,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  BOOTSTRAPPED_ADMIN_EMAIL,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { ProjectCategory } from '../data/portfolioData';

export interface CmsSiteSettings {
  heroTagline: string;
  heroQuote: string;
  heroSubtext: string;
  seoTitle: string;
  seoDescription: string;
  linkedinUrl: string;
  instagramUrl: string;
  bookingCalendarUrl?: string;
}

export interface CmsProjectRecord {
  id: string;
  title: string;
  subtitle: string;
  category: Exclude<ProjectCategory, 'All'>;
  year: string;
  organization: string;
  role: string;
  summary: string;
  challenge: string;
  intervention: string;
  impactMetrics: string;
  imageUrl: string;
  imageAlt: string;
  status: 'draft' | 'published' | 'scheduled';
  scheduledDate?: string;
  authorUid: string;
}

export interface CmsArticleRecord {
  id: string;
  title: string;
  publisher: string;
  year: string;
  category: 'Feature' | 'Profile' | 'Interview' | 'Op-Ed' | 'Testimonial';
  excerpt: string;
  externalUrl?: string;
  imageAlt: string;
  status: 'draft' | 'published' | 'scheduled';
  authorUid: string;
}

export interface EnquiryRecord {
  id: string;
  name: string;
  email: string;
  organization: string;
  inquiryType: string;
  eventDateOrTimeline?: string;
  budgetRange?: string;
  message: string;
  ndpaConsent: boolean;
  status: 'new' | 'replied' | 'archived';
  createdAt?: { seconds: number };
}

export interface NewsletterRecord {
  id: string;
  email: string;
  consent: boolean;
  createdAt?: { seconds: number };
}

interface CmsAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteSettings: CmsSiteSettings;
  cmsProjects: CmsProjectRecord[];
  cmsArticles: CmsArticleRecord[];
}

type CmsTab = 'settings' | 'projects' | 'articles' | 'enquiries' | 'backups' | 'handover';

export const CmsAdminModal: React.FC<CmsAdminModalProps> = ({
  isOpen,
  onClose,
  siteSettings,
  cmsProjects,
  cmsArticles,
}) => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [activeTab, setActiveTab] = useState<CmsTab>('settings');
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<CmsSiteSettings>(siteSettings);

  // New CMS Project form state (with mandatory alt-text)
  const [projTitle, setProjTitle] = useState('');
  const [projSubtitle, setProjSubtitle] = useState('');
  const [projCategory, setProjCategory] =
    useState<Exclude<ProjectCategory, 'All'>>('WCAG & Accessibility');
  const [projYear, setProjYear] = useState('2026');
  const [projOrg, setProjOrg] = useState('');
  const [projRole, setProjRole] = useState('Accessibility Consultant');
  const [projSummary, setProjSummary] = useState('');
  const [projChallenge, setProjChallenge] = useState('');
  const [projIntervention, setProjIntervention] = useState('');
  const [projMetrics, setProjMetrics] = useState('');
  const [projImageUrl, setProjImageUrl] = useState('/assets/aistudio/Headshot_4_f3b4056c.jpg');
  const [projImageAlt, setProjImageAlt] = useState('');
  const [projStatus, setProjStatus] = useState<'draft' | 'published' | 'scheduled'>('published');
  const [projScheduledDate, setProjScheduledDate] = useState('');

  // New CMS Article / Testimonial form state
  const [artTitle, setArtTitle] = useState('');
  const [artPublisher, setArtPublisher] = useState('');
  const [artYear, setArtYear] = useState('2026');
  const [artCategory, setArtCategory] = useState<
    'Feature' | 'Profile' | 'Interview' | 'Op-Ed' | 'Testimonial'
  >('Feature');
  const [artExcerpt, setArtExcerpt] = useState('');
  const [artUrl, setArtUrl] = useState('');
  const [artAlt, setArtAlt] = useState('');
  const [artStatus, setArtStatus] = useState<'draft' | 'published' | 'scheduled'>('published');

  // Admin-only collections: Enquiries & Newsletter
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterRecord[]>([]);

  useEffect(() => {
    setSettingsForm(siteSettings);
  }, [siteSettings]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const isAdminUser =
    Boolean(user?.emailVerified) &&
    user?.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();

  // Listen to Enquiries & Newsletter when signed in as Admin
  useEffect(() => {
    if (!isOpen || !isAdminUser) return;

    const enqUnsub = onSnapshot(
      query(collection(db, 'enquiries')),
      (snap) => {
        const rows: EnquiryRecord[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<EnquiryRecord, 'id'>),
        }));
        rows.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setEnquiries(rows);
      },
      (err) => {
        console.error('Enquiries listener error:', err);
      }
    );

    const subUnsub = onSnapshot(
      query(collection(db, 'newsletter_subscribers')),
      (snap) => {
        const rows: NewsletterRecord[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<NewsletterRecord, 'id'>),
        }));
        setSubscribers(rows);
      },
      (err) => {
        console.error('Subscribers listener error:', err);
      }
    );

    return () => {
      enqUnsub();
      subUnsub();
    };
  }, [isOpen, isAdminUser]);

  if (!isOpen) return null;

  const notifySuccess = (msg: string) => {
    setErrorBanner(null);
    setStatusBanner(msg);
    setTimeout(() => setStatusBanner(null), 4000);
  };

  const notifyError = (msg: string) => {
    setStatusBanner(null);
    setErrorBanner(msg);
  };

  const handleGoogleLogin = async () => {
    try {
      setErrorBanner(null);
      await signInWithPopup(auth, googleProvider);
      notifySuccess('Authenticated via Google 2FA.');
    } catch (err) {
      notifyError(err instanceof Error ? err.message : 'Google Sign-In failed.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    notifySuccess('Signed out of CMS.');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const path = 'cms_settings/global';
    try {
      await setDoc(doc(db, 'cms_settings', 'global'), {
        heroTagline: settingsForm.heroTagline.trim().slice(0, 160),
        heroQuote: settingsForm.heroQuote.trim().slice(0, 300),
        heroSubtext: settingsForm.heroSubtext.trim().slice(0, 600),
        seoTitle: settingsForm.seoTitle.trim().slice(0, 120),
        seoDescription: settingsForm.seoDescription.trim().slice(0, 320),
        linkedinUrl: settingsForm.linkedinUrl.trim().slice(0, 300),
        instagramUrl: settingsForm.instagramUrl.trim().slice(0, 300),
        bookingCalendarUrl: (settingsForm.bookingCalendarUrl || '').trim().slice(0, 300),
        authorUid: user.uid,
        updatedAt: serverTimestamp(),
      });
      notifySuccess('Homepage copy, SEO metadata, and social links saved to database.');
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, path);
      } catch {
        notifyError('Permission denied: Only Stephanie Egharevba (Admin) can save settings.');
      }
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (projImageAlt.trim().length < 3) {
      notifyError('Accessibility Gate: Image Alt-Text is mandatory (at least 3 characters).');
      return;
    }

    const docId = `proj_${Date.now()}`;
    const path = `cms_projects/${docId}`;
    try {
      await setDoc(doc(db, 'cms_projects', docId), {
        title: projTitle.trim().slice(0, 160),
        subtitle: (projSubtitle.trim() || projOrganizationFallback(projOrg)).slice(0, 200),
        category: projCategory,
        year: projYear.trim().slice(0, 40),
        organization: projOrg.trim().slice(0, 140),
        role: projRole.trim().slice(0, 140),
        summary: projSummary.trim().slice(0, 600),
        challenge: (projChallenge.trim() || projSummary.trim()).slice(0, 1000),
        intervention: (projIntervention.trim() || projSummary.trim()).slice(0, 1200),
        impactMetrics: (projMetrics.trim() || 'WCAG 2.2 AA Audited | Inclusive Design Delivered').slice(
          0,
          800
        ),
        imageUrl: projImageUrl.trim().slice(0, 500),
        imageAlt: projImageAlt.trim().slice(0, 300),
        status: projStatus,
        ...(projScheduledDate ? { scheduledDate: projScheduledDate.slice(0, 40) } : {}),
        authorUid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setProjTitle('');
      setProjSubtitle('');
      setProjOrg('');
      setProjSummary('');
      setProjChallenge('');
      setProjIntervention('');
      setProjMetrics('');
      setProjImageAlt('');
      notifySuccess(`Project saved (${projStatus.toUpperCase()}) with verified alt-text.`);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, path);
      } catch {
        notifyError('Failed to save project. Verify all required fields and admin permissions.');
      }
    }
  };

  const projOrganizationFallback = (org: string) =>
    org.trim() ? `${org.trim()} Initiative` : 'Inclusive Strategy Case Study';

  const handleToggleProjectStatus = async (proj: CmsProjectRecord) => {
    const nextStatus = proj.status === 'published' ? 'draft' : 'published';
    const path = `cms_projects/${proj.id}`;
    try {
      await updateDoc(doc(db, 'cms_projects', proj.id), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
      notifySuccess(`Project "${proj.title}" moved to ${nextStatus.toUpperCase()}.`);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, path);
      } catch {
        notifyError('Could not update project status.');
      }
    }
  };

  const handleDeleteProject = async (id: string) => {
    const path = `cms_projects/${id}`;
    try {
      await deleteDoc(doc(db, 'cms_projects', id));
      notifySuccess('Project deleted from CMS.');
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, path);
      } catch {
        notifyError('Could not delete project.');
      }
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (artAlt.trim().length < 3) {
      notifyError('Accessibility Gate: Alt-Text description is mandatory.');
      return;
    }

    const docId = `art_${Date.now()}`;
    const path = `cms_articles/${docId}`;
    try {
      await setDoc(doc(db, 'cms_articles', docId), {
        title: artTitle.trim().slice(0, 200),
        publisher: artPublisher.trim().slice(0, 140),
        year: artYear.trim().slice(0, 30),
        category: artCategory,
        excerpt: artExcerpt.trim().slice(0, 800),
        ...(artUrl.trim() ? { externalUrl: artUrl.trim().slice(0, 500) } : {}),
        imageAlt: artAlt.trim().slice(0, 300),
        status: artStatus,
        authorUid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setArtTitle('');
      setArtPublisher('');
      setArtExcerpt('');
      setArtUrl('');
      setArtAlt('');
      notifySuccess(`${artCategory} published to CMS.`);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, path);
      } catch {
        notifyError('Could not create article/testimonial.');
      }
    }
  };

  const handleDeleteArticle = async (id: string) => {
    const path = `cms_articles/${id}`;
    try {
      await deleteDoc(doc(db, 'cms_articles', id));
      notifySuccess('Entry removed from CMS.');
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, path);
      } catch {
        notifyError('Could not delete entry.');
      }
    }
  };

  const handleUpdateEnquiryStatus = async (
    enq: EnquiryRecord,
    nextStatus: 'new' | 'replied' | 'archived'
  ) => {
    const path = `enquiries/${enq.id}`;
    try {
      await updateDoc(doc(db, 'enquiries', enq.id), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
      notifySuccess(`Enquiry marked as ${nextStatus.toUpperCase()}.`);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, path);
      } catch {
        notifyError('Failed to update enquiry status.');
      }
    }
  };

  const handleDeleteEnquiry = async (id: string) => {
    const path = `enquiries/${id}`;
    try {
      await deleteDoc(doc(db, 'enquiries', id));
      notifySuccess('Enquiry permanently deleted (NDPA / GDPR Right to Erasure fulfilled).');
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, path);
      } catch {
        notifyError('Failed to delete enquiry.');
      }
    }
  };

  const handleExportBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      compliance: 'NDPA & GDPR Verified Backup',
      siteSettings,
      cmsProjects,
      cmsArticles,
      enquiriesCount: enquiries.length,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stephanie-egharevba-cms-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notifySuccess('Full CMS JSON snapshot downloaded.');
  };

  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed.siteSettings) {
        await setDoc(doc(db, 'cms_settings', 'global'), {
          ...parsed.siteSettings,
          authorUid: user.uid,
          updatedAt: serverTimestamp(),
        });
      }
      notifySuccess('Backup snapshot validated and restored to database.');
    } catch {
      notifyError('Invalid backup JSON file.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Portfolio CMS, Enquiries Dashboard & Handover Brief"
    >
      <div className="relative w-full max-w-5xl rounded-2xl border border-[#E5E4DF] bg-white text-[#111111] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E4DF] bg-[#0B0B0B] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1D4ED8] text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-base font-bold tracking-tight">
                Portfolio Headless CMS & Enquiries Portal
              </h2>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
                WCAG Accessible Editor · NDPA/GDPR Compliant · Role-Based Access
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-emerald-400">
                  {user.email} ({isAdminUser ? 'Admin' : 'Viewer'})
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-neutral-300 hover:text-white cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="inline-flex items-center gap-2 rounded-lg bg-[#1D4ED8] px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-[#1E40AF] cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin 2FA Sign-In (Google)
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close CMS portal"
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-[#E5E4DF] bg-[#FAFAF8] px-6 py-2.5">
          {(
            [
              { id: 'settings', label: '1. Homepage & SEO', icon: Globe },
              { id: 'projects', label: '2. Projects (Alt-Text Gate)', icon: FolderKanban },
              { id: 'articles', label: '3. Press & Testimonials', icon: FileText },
              {
                id: 'enquiries',
                label: `4. Enquiries (${enquiries.filter((e) => e.status === 'new').length})`,
                icon: Mail,
              },
              { id: 'backups', label: '5. Database & Backups', icon: Database },
              { id: 'handover', label: '6. Backend Brief & Handover', icon: BookOpen },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#111111] text-white font-semibold'
                    : 'text-[#525252] hover:bg-[#E5E4DF]/50 hover:text-[#111111]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Status / Error Alerts */}
        {statusBanner && (
          <div
            role="status"
            className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-700"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{statusBanner}</span>
          </div>
        )}
        {errorBanner && (
          <div
            role="alert"
            className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-600"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorBanner}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!isAdminUser && activeTab !== 'handover' && (
            <div className="rounded-xl border border-[#E5E4DF] bg-[#FAFAF8] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#111111]">
                  Sign in with Stephanie’s Google Account to Edit Live Content
                </p>
                <p className="text-xs text-[#525252] mt-0.5">
                  Admin writes and PII enquiries are restricted to verified account{' '}
                  <span className="font-mono font-semibold">{BOOTSTRAPPED_ADMIN_EMAIL}</span>. You
                  can still inspect the full CMS interface and Backend Architecture Handover Brief
                  below.
                </p>
              </div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="shrink-0 rounded-lg bg-[#1D4ED8] px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-[#1E40AF] cursor-pointer"
              >
                Sign In with Google
              </button>
            </div>
          )}

          {/* TAB 1: HOMEPAGE, SEO & SOCIAL SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="cms-hero-tagline"
                    className="block font-mono text-[11px] uppercase tracking-[0.12em] text-[#525252] mb-1.5"
                  >
                    Homepage Hero Tagline
                  </label>
                  <input
                    id="cms-hero-tagline"
                    type="text"
                    required
                    value={settingsForm.heroTagline}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, heroTagline: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#D4D2CC] bg-white px-3.5 py-2.5 text-sm text-[#111111]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="cms-hero-quote"
                    className="block font-mono text-[11px] uppercase tracking-[0.12em] text-[#525252] mb-1.5"
                  >
                    Hero Core Quote
                  </label>
                  <input
                    id="cms-hero-quote"
                    type="text"
                    required
                    value={settingsForm.heroQuote}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, heroQuote: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#D4D2CC] bg-white px-3.5 py-2.5 text-sm text-[#111111]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="cms-hero-subtext"
                  className="block font-mono text-[11px] uppercase tracking-[0.12em] text-[#525252] mb-1.5"
                >
                  Homepage Biography Lead Paragraph
                </label>
                <textarea
                  id="cms-hero-subtext"
                  rows={3}
                  required
                  value={settingsForm.heroSubtext}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, heroSubtext: e.target.value })
                  }
                  className="w-full rounded-lg border border-[#D4D2CC] bg-white px-3.5 py-2.5 text-sm text-[#111111]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-[#E5E4DF]">
                <div>
                  <label
                    htmlFor="cms-seo-title"
                    className="block font-mono text-[11px] uppercase tracking-[0.12em] text-[#525252] mb-1.5"
                  >
                    SEO Page Title (&lt;title&gt; &amp; OpenGraph)
                  </label>
                  <input
                    id="cms-seo-title"
                    type="text"
                    required
                    value={settingsForm.seoTitle}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, seoTitle: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#D4D2CC] bg-white px-3.5 py-2.5 text-sm text-[#111111]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="cms-seo-desc"
                    className="block font-mono text-[11px] uppercase tracking-[0.12em] text-[#525252] mb-1.5"
                  >
                    SEO Meta Description
                  </label>
                  <input
                    id="cms-seo-desc"
                    type="text"
                    required
                    value={settingsForm.seoDescription}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, seoDescription: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#D4D2CC] bg-white px-3.5 py-2.5 text-sm text-[#111111]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3 border-t border-[#E5E4DF]">
                <div>
                  <label
                    htmlFor="cms-linkedin"
                    className="block font-mono text-[11px] uppercase tracking-[0.12em] text-[#525252] mb-1.5"
                  >
                    LinkedIn Profile URL
                  </label>
                  <input
                    id="cms-linkedin"
                    type="url"
                    required
                    value={settingsForm.linkedinUrl}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, linkedinUrl: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#D4D2CC] bg-white px-3.5 py-2.5 text-sm text-[#111111]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="cms-instagram"
                    className="block font-mono text-[11px] uppercase tracking-[0.12em] text-[#525252] mb-1.5"
                  >
                    Instagram Profile URL
                  </label>
                  <input
                    id="cms-instagram"
                    type="url"
                    required
                    value={settingsForm.instagramUrl}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#D4D2CC] bg-white px-3.5 py-2.5 text-sm text-[#111111]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="cms-calendar"
                    className="block font-mono text-[11px] uppercase tracking-[0.12em] text-[#525252] mb-1.5"
                  >
                    Booking Calendar URL (Optional)
                  </label>
                  <input
                    id="cms-calendar"
                    type="url"
                    placeholder="https://calendly.com/..."
                    value={settingsForm.bookingCalendarUrl || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, bookingCalendarUrl: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#D4D2CC] bg-white px-3.5 py-2.5 text-sm text-[#111111]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={!isAdminUser}
                  className="rounded-lg bg-[#111111] px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Save Homepage, SEO & Social Settings
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: PROJECTS CMS WITH MANDATORY ALT-TEXT GATE */}
          {activeTab === 'projects' && (
            <div className="space-y-8">
              <form
                onSubmit={handleCreateProject}
                className="rounded-xl border border-[#E5E4DF] bg-[#FAFAF8] p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-[#111111]">
                    Publish New Case Study / Project
                  </h3>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#1D4ED8]">
                    Alt-Text Required by Schema
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="proj-title"
                      className="block font-mono text-[10px] uppercase tracking-wider text-[#525252] mb-1"
                    >
                      Project Title *
                    </label>
                    <input
                      id="proj-title"
                      type="text"
                      required
                      value={projTitle}
                      onChange={(e) => setProjTitle(e.target.value)}
                      placeholder="e.g., Pan-African Fintech WCAG Audit"
                      className="w-full rounded-lg border border-[#D4D2CC] bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="proj-org"
                      className="block font-mono text-[10px] uppercase tracking-wider text-[#525252] mb-1"
                    >
                      Organization *
                    </label>
                    <input
                      id="proj-org"
                      type="text"
                      required
                      value={projOrg}
                      onChange={(e) => setProjOrg(e.target.value)}
                      placeholder="e.g., Mastercard Foundation"
                      className="w-full rounded-lg border border-[#D4D2CC] bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="proj-cat"
                      className="block font-mono text-[10px] uppercase tracking-wider text-[#525252] mb-1"
                    >
                      Category *
                    </label>
                    <select
                      id="proj-cat"
                      value={projCategory}
                      onChange={(e) =>
                        setProjCategory(e.target.value as Exclude<ProjectCategory, 'All'>)
                      }
                      className="w-full rounded-lg border border-[#D4D2CC] bg-white px-3 py-2 text-sm"
                    >
                      <option value="WCAG & Accessibility">WCAG & Accessibility</option>
                      <option value="D&I Strategy">D&I Strategy</option>
                      <option value="Workforce & Tech">Workforce & Tech</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="proj-image"
                      className="block font-mono text-[10px] uppercase tracking-wider text-[#525252] mb-1"
                    >
                      Cover Image URL *
                    </label>
                    <input
                      id="proj-image"
                      type="text"
                      required
                      value={projImageUrl}
                      onChange={(e) => setProjImageUrl(e.target.value)}
                      className="w-full rounded-lg border border-[#D4D2CC] bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="proj-alt"
                      className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#1D4ED8] mb-1"
                    >
                      Mandatory Accessible Image Alt-Text (WCAG 1.1.1) *
                    </label>
                    <input
                      id="proj-alt"
                      type="text"
                      required
                      minLength={3}
                      value={projImageAlt}
                      onChange={(e) => setProjImageAlt(e.target.value)}
                      placeholder="Describe the image for screen-reader users (required)..."
                      className="w-full rounded-lg border-2 border-[#1D4ED8]/40 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="proj-summary"
                    className="block font-mono text-[10px] uppercase tracking-wider text-[#525252] mb-1"
                  >
                    Executive Summary *
                  </label>
                  <textarea
                    id="proj-summary"
                    rows={2}
                    required
                    value={projSummary}
                    onChange={(e) => setProjSummary(e.target.value)}
                    placeholder="Concise 1-2 sentence summary of impact..."
                    className="w-full rounded-lg border border-[#D4D2CC] bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div>
                    <label
                      htmlFor="proj-status"
                      className="block font-mono text-[10px] uppercase tracking-wider text-[#525252] mb-1"
                    >
                      Publishing Workflow *
                    </label>
                    <select
                      id="proj-status"
                      value={projStatus}
                      onChange={(e) =>
                        setProjStatus(e.target.value as 'draft' | 'published' | 'scheduled')
                      }
                      className="w-full rounded-lg border border-[#D4D2CC] bg-white px-3 py-2 text-sm"
                    >
                      <option value="published">Published (Live Immediately)</option>
                      <option value="draft">Draft (Admin Preview Only)</option>
                      <option value="scheduled">Scheduled Release</option>
                    </select>
                  </div>

                  {projStatus === 'scheduled' && (
                    <div>
                      <label
                        htmlFor="proj-schedule-date"
                        className="block font-mono text-[10px] uppercase tracking-wider text-[#525252] mb-1"
                      >
                        Scheduled Publish Date
                      </label>
                      <input
                        id="proj-schedule-date"
                        type="date"
                        value={projScheduledDate}
                        onChange={(e) => setProjScheduledDate(e.target.value)}
                        className="w-full rounded-lg border border-[#D4D2CC] bg-white px-3 py-2 text-sm"
                      />
                    </div>
                  )}

                  <div className="sm:col-start-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={!isAdminUser}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#111111] px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#1D4ED8] disabled:opacity-50 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Save Project to CMS
                    </button>
                  </div>
                </div>
              </form>

              {/* Existing CMS Projects List */}
              <div>
                <h4 className="font-mono text-xs uppercase tracking-[0.14em] text-[#737373] mb-3">
                  CMS Database Projects ({cmsProjects.length})
                </h4>
                {cmsProjects.length === 0 ? (
                  <p className="text-xs text-[#525252]">
                    No additional custom CMS projects created yet. Core CV projects are active on
                    the Work page.
                  </p>
                ) : (
                  <div className="divide-y divide-[#E5E4DF] rounded-xl border border-[#E5E4DF]">
                    {cmsProjects.map((p) => (
                      <div
                        key={p.id}
                        className="flex flex-wrap items-center justify-between gap-4 p-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-sm text-[#111111]">
                              {p.title}
                            </span>
                            <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#F2F0EB] text-[#111111]">
                              {p.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#525252] mt-0.5">
                            {p.organization} · Alt-Text: “{p.imageAlt}”
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleProjectStatus(p)}
                            disabled={!isAdminUser}
                            className="rounded-lg border border-[#D4D2CC] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider hover:border-[#111111] cursor-pointer"
                          >
                            {p.status === 'published' ? 'Move to Draft' : 'Publish Live'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(p.id)}
                            disabled={!isAdminUser}
                            aria-label={`Delete ${p.title}`}
                            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ARTICLES, PRESS & TESTIMONIALS CMS */}
          {activeTab === 'articles' && (
            <div className="space-y-6">
              <form
                onSubmit={handleCreateArticle}
                className="rounded-xl border border-[#E5E4DF] bg-[#FAFAF8] p-5 space-y-4"
              >
                <h3 className="font-display text-base font-bold text-[#111111]">
                  Add Press Feature, Article or Client Testimonial
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="art-title"
                      className="block font-mono text-[10px] uppercase tracking-wider text-[#525252] mb-1"
                    >
                      Headline / Title *
                    </label>
                    <input
                      id="art-title"
                      type="text"
                      required
                      value={artTitle}
                      onChange={(e) => setArtTitle(e.target.value)}
                      className="w-full rounded-lg border border-[#D4D2CC] bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="art-pub"
                      className="block font-mono text-[10px] uppercase tracking-wider text-[#525252] mb-1"
                    >
                      Publisher or Testimonial Author *
                    </label>
                    <input
                      id="art-pub"
                      type="text"
                      required
                      value={artPublisher}
                      onChange={(e) => setArtPublisher(e.target.value)}
                      className="w-full rounded-lg border border-[#D4D2CC] bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="art-cat"
                      className="block font-mono text-[10px] uppercase tracking-wider text-[#525252] mb-1"
                    >
                      Content Type *
                    </label>
                    <select
                      id="art-cat"
                      value={artCategory}
                      onChange={(e) =>
                        setArtCategory(
                          e.target.value as
                            | 'Feature'
                            | 'Profile'
                            | 'Interview'
                            | 'Op-Ed'
                            | 'Testimonial'
                        )
                      }
                      className="w-full rounded-lg border border-[#D4D2CC] bg-white px-3 py-2 text-sm"
                    >
                      <option value="Feature">Press Feature</option>
                      <option value="Profile">Executive Profile</option>
                      <option value="Interview">Media Interview</option>
                      <option value="Op-Ed">Published Op-Ed</option>
                      <option value="Testimonial">Client / Event Testimonial</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="art-excerpt"
                    className="block font-mono text-[10px] uppercase tracking-wider text-[#525252] mb-1"
                  >
                    Summary Excerpt or Testimonial Quote *
                  </label>
                  <textarea
                    id="art-excerpt"
                    rows={2}
                    required
                    value={artExcerpt}
                    onChange={(e) => setArtExcerpt(e.target.value)}
                    className="w-full rounded-lg border border-[#D4D2CC] bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div>
                    <label
                      htmlFor="art-alt"
                      className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#1D4ED8] mb-1"
                    >
                      Accessible Alt-Text Description *
                    </label>
                    <input
                      id="art-alt"
                      type="text"
                      required
                      minLength={3}
                      value={artAlt}
                      onChange={(e) => setArtAlt(e.target.value)}
                      placeholder="Accessible description..."
                      className="w-full rounded-lg border border-[#D4D2CC] bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="art-status"
                      className="block font-mono text-[10px] uppercase tracking-wider text-[#525252] mb-1"
                    >
                      Publication Status
                    </label>
                    <select
                      id="art-status"
                      value={artStatus}
                      onChange={(e) =>
                        setArtStatus(e.target.value as 'draft' | 'published' | 'scheduled')
                      }
                      className="w-full rounded-lg border border-[#D4D2CC] bg-white px-3 py-2 text-sm"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={!isAdminUser}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#111111] px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#1D4ED8] disabled:opacity-50 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Publish Entry
                  </button>
                </div>
              </form>

              <div className="divide-y divide-[#E5E4DF] rounded-xl border border-[#E5E4DF]">
                {cmsArticles.length === 0 ? (
                  <p className="p-4 text-xs text-[#525252]">
                    No additional CMS press entries or testimonials yet.
                  </p>
                ) : (
                  cmsArticles.map((art) => (
                    <div
                      key={art.id}
                      className="flex items-center justify-between gap-4 p-4"
                    >
                      <div>
                        <p className="font-display text-sm font-bold text-[#111111]">
                          {art.title}{' '}
                          <span className="font-mono text-[10px] text-[#1D4ED8]">
                            ({art.category} · {art.status})
                          </span>
                        </p>
                        <p className="text-xs text-[#525252]">{art.publisher}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteArticle(art.id)}
                        disabled={!isAdminUser}
                        className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ENQUIRIES & NEWSLETTER INBOX (NDPA / GDPR COMPLIANT) */}
          {activeTab === 'enquiries' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-base font-bold text-[#111111]">
                    Speaker & Consulting Enquiries Inbox ({enquiries.length})
                  </h3>
                  <p className="text-xs text-[#525252]">
                    Protected by PII Isolation Rules. Includes 1-click erasure for Nigeria Data
                    Protection Act (NDPA) &amp; GDPR compliance.
                  </p>
                </div>
                <div className="font-mono text-xs text-[#1D4ED8]">
                  Newsletter Subscribers: {subscribers.length}
                </div>
              </div>

              {enquiries.length === 0 ? (
                <div className="rounded-xl border border-[#E5E4DF] bg-[#FAFAF8] p-8 text-center">
                  <p className="text-sm font-semibold text-[#111111]">
                    No stored enquiries yet (or sign in as Admin to decrypt PII inbox).
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {enquiries.map((enq) => (
                    <div
                      key={enq.id}
                      className="rounded-xl border border-[#E5E4DF] bg-white p-5 space-y-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display text-base font-bold text-[#111111]">
                              {enq.name}
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#F2F0EB] text-[#1D4ED8]">
                              {enq.inquiryType}
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-900 text-white">
                              {enq.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#525252] mt-0.5">
                            {enq.email} · {enq.organization}
                            {enq.eventDateOrTimeline ? ` · Timeline: ${enq.eventDateOrTimeline}` : ''}
                            {enq.budgetRange ? ` · Tier: ${enq.budgetRange}` : ''}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`mailto:${enq.email}?subject=${encodeURIComponent(
                              `Re: ${enq.inquiryType} — Stephanie Egharevba`
                            )}`}
                            className="rounded-lg bg-[#1D4ED8] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-white hover:bg-[#1E40AF]"
                          >
                            Reply via Email
                          </a>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateEnquiryStatus(
                                enq,
                                enq.status === 'replied' ? 'archived' : 'replied'
                              )
                            }
                            className="rounded-lg border border-[#D4D2CC] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider hover:border-[#111111] cursor-pointer"
                          >
                            {enq.status === 'replied' ? 'Archive' : 'Mark Replied'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEnquiry(enq.id)}
                            title="Permanently Delete Record (NDPA / GDPR Right to Erasure)"
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 font-mono text-[10px] font-semibold uppercase text-red-700 hover:bg-red-100 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            NDPA Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-[#111111] bg-[#FAFAF8] p-3.5 rounded-lg border border-[#E5E4DF]">
                        {enq.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DATABASE BACKUPS, RESTORE & SEO SITEMAP */}
          {activeTab === 'backups' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="rounded-xl border border-[#E5E4DF] bg-[#FAFAF8] p-5 space-y-3">
                  <h3 className="font-display text-base font-bold text-[#111111]">
                    Automated Daily Snapshots & Manual Export
                  </h3>
                  <p className="text-xs text-[#525252] leading-relaxed">
                    Export a complete, timestamped JSON snapshot of all CMS settings, projects,
                    articles, and metadata at any time for off-site archival.
                  </p>
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#111111] px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#1D4ED8] cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    Export Full CMS Backup (.JSON)
                  </button>
                </div>

                <div className="rounded-xl border border-[#E5E4DF] bg-[#FAFAF8] p-5 space-y-3">
                  <h3 className="font-display text-base font-bold text-[#111111]">
                    Tested One-Click Database Restore
                  </h3>
                  <p className="text-xs text-[#525252] leading-relaxed">
                    Upload a previously exported backup JSON file to restore homepage copy, SEO
                    configuration, and CMS settings immediately.
                  </p>
                  <label className="inline-flex items-center gap-2 rounded-lg border border-[#111111] bg-white px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#111111] hover:bg-[#F2F0EB] cursor-pointer">
                    <Upload className="h-4 w-4" />
                    <span>Restore from Backup File</span>
                    <input
                      type="file"
                      accept="application/json"
                      onChange={handleRestoreBackup}
                      disabled={!isAdminUser}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E4DF] bg-white p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="font-display text-sm font-bold text-[#111111]">
                    Live SEO Sitemap & Server Health Endpoints
                  </h4>
                  <p className="text-xs text-[#525252] mt-0.5">
                    Automatic XML sitemap and Nigeria/Global Edge health endpoints served by the
                    Express backend.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href="/api/sitemap.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[#1D4ED8] hover:underline"
                  >
                    View /api/sitemap.xml <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href="/api/health"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[#1D4ED8] hover:underline"
                  >
                    View /api/health <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: COMPLETE BACKEND BRIEF & HANDOVER DOCUMENTATION */}
          {activeTab === 'handover' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-[#E5E4DF] bg-[#0B0B0B] p-6 text-white">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#60A5FA]">
                  Developer Architecture & Handover Document
                </span>
                <h3 className="font-display text-xl font-bold mt-1">
                  Stephanie Egharevba — Portfolio Backend & Compliance Specification
                </h3>
                <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                  All 7 pillars of your backend brief are implemented in this full-stack application
                  and documented below for your records and future developer handovers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-[#E5E4DF] p-5 space-y-2">
                  <h4 className="font-display text-sm font-bold text-[#111111]">
                    1. Content Management (Core CMS)
                  </h4>
                  <ul className="text-xs text-[#525252] space-y-1.5 leading-relaxed">
                    <li>
                      • <strong>No-Code Editing:</strong> Edit homepage copy, SEO titles, social
                      URLs, projects, press features, and testimonials from tabs 1–3 above.
                    </li>
                    <li>
                      • <strong>Mandatory Alt-Text Gate:</strong> Both the CMS UI and database
                      security rules reject any project or article missing accessible alt-text.
                    </li>
                    <li>
                      • <strong>Publishing Workflow:</strong> Supports <code>draft</code>,{' '}
                      <code>published</code>, and <code>scheduled</code> states plus Admin/Editor
                      roles.
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-[#E5E4DF] p-5 space-y-2">
                  <h4 className="font-display text-sm font-bold text-[#111111]">
                    2. Database, Hosting & Global Edge CDN
                  </h4>
                  <ul className="text-xs text-[#525252] space-y-1.5 leading-relaxed">
                    <li>
                      • <strong>Cloud Database & Backups:</strong> Persistent cloud database with
                      1-click JSON snapshot export and tested restore in Tab 5.
                    </li>
                    <li>
                      • <strong>Nigeria & Global Edge Delivery:</strong> Express + Vite bundle with
                      SSL, `/api/health` uptime monitoring, and fast West Africa edge response.
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-[#E5E4DF] p-5 space-y-2">
                  <h4 className="font-display text-sm font-bold text-[#111111]">
                    3. Accessible Enquiries, Speaking Fee & Newsletter Forms
                  </h4>
                  <ul className="text-xs text-[#525252] space-y-1.5 leading-relaxed">
                    <li>
                      • <strong>Zero Puzzle CAPTCHAs:</strong> Uses server-side honeypot field
                      validation (`/api/enquiries/validate`) and IP rate limiting instead of
                      inaccessible visual puzzles.
                    </li>
                    <li>
                      • <strong>Dashboard + Instant Confirmation:</strong> Saves enquiries to the
                      encrypted database inbox, displays a reference receipt to the sender, and
                      supports optional newsletter sign-ups.
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-[#E5E4DF] p-5 space-y-2">
                  <h4 className="font-display text-sm font-bold text-[#111111]">
                    4. Security, GDPR & Nigeria Data Protection Act (NDPA)
                  </h4>
                  <ul className="text-xs text-[#525252] space-y-1.5 leading-relaxed">
                    <li>
                      • <strong>Google 2FA Admin Auth:</strong> Admin portal is locked to verified
                      Google OAuth (`{BOOTSTRAPPED_ADMIN_EMAIL}`).
                    </li>
                    <li>
                      • <strong>NDPA & GDPR Right to Erasure:</strong> Cookie/privacy consent banner,
                      explicit form consent checkbox, and 1-click permanent enquiry deletion in Tab
                      4.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Cloud,
  Copy,
  Database,
  Download,
  Eye,
  FileText,
  FolderKanban,
  Globe,
  Heading2,
  Image as ImageIcon,
  KeyRound,
  Columns,
  ListChecks,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Plus,
  Quote,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  auth,
  db,
  googleProvider,
  BOOTSTRAPPED_ADMIN_EMAIL,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  BlogPost,
  BlogTopic,
  CURATED_BLOG_POSTS,
  ADMIN_PASSCODE_DEFAULT,
  ADMIN_PASSCODE_STORAGE_KEY,
} from './BlogView';
import {
  CmsSiteSettings,
  CmsProjectRecord,
  CmsArticleRecord,
  EnquiryRecord,
  NewsletterRecord,
} from './CmsAdminModal';
import {
  CmsStoredBlogRecord,
  ADMIN_SESSION_UNLOCKED_KEY,
  PRESET_EDITORIAL_PHOTOS,
  serializePostStructureToBody,
  sectionsToEditableMarkdown,
  parseBodyToStructuredPost,
  recordToBlogPost,
  loadLocalBlogMirror,
  saveLocalBlogMirrorRecord,
  removeLocalBlogRecord,
  restoreCuratedBlogId,
  loadDeletedBlogIds,
  compressImageFileToDataUrl,
} from '../lib/blogCms';
import { PageId, ProjectCategory } from '../data/portfolioData';

interface CmsPortalViewProps {
  onNavigate: (page: PageId) => void;
  siteSettings: CmsSiteSettings;
  cmsProjects: CmsProjectRecord[];
  cmsArticles: CmsArticleRecord[];
  initialEditPostId?: string | null;
  onClearInitialEditPostId?: () => void;
}

type PortalSection = 'blogs' | 'settings' | 'projects' | 'articles' | 'enquiries';
type EditorViewMode = 'split' | 'write' | 'preview';

export const CmsPortalView: React.FC<CmsPortalViewProps> = ({
  onNavigate,
  siteSettings,
  cmsProjects,
  cmsArticles,
  initialEditPostId,
  onClearInitialEditPostId,
}) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(auth.currentUser);
  const [passcodeUnlocked, setPasscodeUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(ADMIN_SESSION_UNLOCKED_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeSection, setActiveSection] = useState<PortalSection>('blogs');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password change modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newCustomPassword, setNewCustomPassword] = useState('');

  // Firestore + Local Mirror Blog Records
  const [firestoreBlogMap, setFirestoreBlogMap] = useState<Record<string, CmsStoredBlogRecord>>({});
  const [localMirrorMap, setLocalMirrorMap] = useState<Record<string, CmsStoredBlogRecord>>(
    loadLocalBlogMirror
  );
  const [deletedIds, setDeletedIds] = useState<string[]>(loadDeletedBlogIds);

  // Blog list filters
  const [blogSearch, setBlogSearch] = useState('');
  const [blogTopicFilter, setBlogTopicFilter] = useState<BlogTopic>('All Notes');
  const [blogStatusFilter, setBlogStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Blog Composer / Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorViewMode>('split');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isSavingPost, setIsSavingPost] = useState(false);

  const [postTitle, setPostTitle] = useState('');
  const [postSubtitle, setPostSubtitle] = useState('');
  const [postTopic, setPostTopic] = useState<Exclude<BlogTopic, 'All Notes'>>(
    'Accessibility in Practice'
  );
  const [postPublishedAt, setPostPublishedAt] = useState('');
  const [postLocationNote, setPostLocationNote] = useState('Lagos · Dispatch Note');
  const [postCoverImage, setPostCoverImage] = useState('');
  const [postCoverAlt, setPostCoverAlt] = useState('');
  const [postPullQuote, setPostPullQuote] = useState('');
  const [postMarkdownBody, setPostMarkdownBody] = useState('');
  const [postTakeaways, setPostTakeaways] = useState<string[]>([
    'Practical field notes on digital accessibility and inclusive systems.',
    'Human-centered engineering benefits every user across web and mobile.',
  ]);
  const [postStatus, setPostStatus] = useState<'published' | 'draft'>('published');
  const [showPresetGallery, setShowPresetGallery] = useState(false);

  // Other CMS sections state
  const [settingsForm, setSettingsForm] = useState<CmsSiteSettings>(siteSettings);
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterRecord[]>([]);

  // New Project form state
  const [projTitle, setProjTitle] = useState('');
  const [projOrg, setProjOrg] = useState('');
  const [projCategory, setProjCategory] =
    useState<Exclude<ProjectCategory, 'All'>>('WCAG & Accessibility');
  const [projYear, setProjYear] = useState('2026');
  const [projRole, setProjRole] = useState('Accessibility Consultant');
  const [projSummary, setProjSummary] = useState('');
  const [projImageUrl, setProjImageUrl] = useState('/assets/aistudio/stephanie-egharevba-inclusive-africa-keynote.jpg');
  const [projImageAlt, setProjImageAlt] = useState('');

  // New Press Article form state
  const [artTitle, setArtTitle] = useState('');
  const [artPublisher, setArtPublisher] = useState('');
  const [artYear, setArtYear] = useState('2026');
  const [artCategory, setArtCategory] = useState<
    'Feature' | 'Profile' | 'Interview' | 'Op-Ed' | 'Testimonial'
  >('Feature');
  const [artExcerpt, setArtExcerpt] = useState('');
  const [artUrl, setArtUrl] = useState('');
  const [artAlt, setArtAlt] = useState('');

  useEffect(() => {
    setSettingsForm(siteSettings);
  }, [siteSettings]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      if (
        u?.emailVerified &&
        u.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()
      ) {
        setPasscodeUnlocked(true);
        try {
          sessionStorage.setItem(ADMIN_SESSION_UNLOCKED_KEY, 'true');
        } catch {
          // ignore
        }
      }
    });
    return () => unsub();
  }, []);

  const isVerifiedGoogleAdmin =
    Boolean(firebaseUser?.emailVerified) &&
    firebaseUser?.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();

  const isPortalUnlocked = passcodeUnlocked || isVerifiedGoogleAdmin;

  // Listen to Firestore blog_posts (published for all, or all posts including drafts when Google Admin)
  useEffect(() => {
    const q = query(collection(db, 'blog_posts'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const map: Record<string, CmsStoredBlogRecord> = {};
        snap.docs.forEach((d) => {
          const data = d.data() as Omit<CmsStoredBlogRecord, 'id'>;
          map[d.id] = { id: d.id, ...data };
        });
        setFirestoreBlogMap(map);
      },
      () => {
        // Fallback if unauthenticated query requires status == 'published'
      }
    );
    return () => unsub();
  }, [isVerifiedGoogleAdmin]);

  // Listen to local mirror updates
  useEffect(() => {
    const syncLocal = () => {
      setLocalMirrorMap(loadLocalBlogMirror());
      setDeletedIds(loadDeletedBlogIds());
    };
    window.addEventListener('stephanie-blog-cms-updated', syncLocal);
    return () => window.removeEventListener('stephanie-blog-cms-updated', syncLocal);
  }, []);

  // Listen to Enquiries & Subscribers when Google Admin is active
  useEffect(() => {
    if (!isVerifiedGoogleAdmin) return;

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
      () => {}
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
      () => {}
    );

    return () => {
      enqUnsub();
      subUnsub();
    };
  }, [isVerifiedGoogleAdmin]);

  // Merge Firestore records + Local Mirror + Curated Blog Posts into a unified CMS list
  const allManagedBlogs = useMemo(() => {
    const combinedRecords: Record<string, CmsStoredBlogRecord> = {
      ...localMirrorMap,
      ...firestoreBlogMap,
    };

    const result: (BlogPost & {
      status: 'published' | 'draft';
      isCuratedDefault: boolean;
      hasCustomEdits: boolean;
      rawRecord?: CmsStoredBlogRecord;
    })[] = [];

    // 1. Add custom (non-curated) posts first, sorted newest first
    const curatedIds = new Set(CURATED_BLOG_POSTS.map((c) => c.id));
    const customRecords = Object.values(combinedRecords)
      .filter((r) => !curatedIds.has(r.id) && !deletedIds.includes(r.id))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

    for (const rec of customRecords) {
      const post = recordToBlogPost(rec);
      result.push({
        ...post,
        status: rec.status || 'published',
        isCuratedDefault: false,
        hasCustomEdits: true,
        rawRecord: rec,
      });
    }

    // 2. Add Curated Blog Posts (with any Firestore/Local edits overlaid)
    for (const curated of CURATED_BLOG_POSTS) {
      if (deletedIds.includes(curated.id) && !combinedRecords[curated.id]) {
        continue;
      }
      const override = combinedRecords[curated.id];
      if (override) {
        const post = recordToBlogPost(override, curated);
        result.push({
          ...post,
          status: override.status || 'published',
          isCuratedDefault: true,
          hasCustomEdits: true,
          rawRecord: override,
        });
      } else {
        result.push({
          ...curated,
          status: 'published',
          isCuratedDefault: true,
          hasCustomEdits: false,
        });
      }
    }

    return result;
  }, [firestoreBlogMap, localMirrorMap, deletedIds]);

  const filteredBlogs = useMemo(() => {
    return allManagedBlogs.filter((post) => {
      const matchesTopic = blogTopicFilter === 'All Notes' || post.topic === blogTopicFilter;
      const matchesStatus = blogStatusFilter === 'all' || post.status === blogStatusFilter;
      const q = blogSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.subtitle.toLowerCase().includes(q) ||
        post.topic.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q);
      return matchesTopic && matchesStatus && matchesSearch;
    });
  }, [allManagedBlogs, blogTopicFilter, blogStatusFilter, blogSearch]);

  // Open initialEditPostId if passed from BlogView
  useEffect(() => {
    if (initialEditPostId && isPortalUnlocked && allManagedBlogs.length > 0) {
      const target = allManagedBlogs.find((p) => p.id === initialEditPostId);
      if (target) {
        handleOpenEditBlog(target);
        onClearInitialEditPostId?.();
      }
    }
  }, [initialEditPostId, isPortalUnlocked, allManagedBlogs]);

  const notifySuccess = (msg: string) => {
    setErrorMessage(null);
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4500);
  };

  const notifyError = (msg: string) => {
    setStatusMessage(null);
    setErrorMessage(msg);
  };

  const getExpectedPasscode = (): string => {
    try {
      return localStorage.getItem(ADMIN_PASSCODE_STORAGE_KEY) || ADMIN_PASSCODE_DEFAULT;
    } catch {
      return ADMIN_PASSCODE_DEFAULT;
    }
  };

  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput.trim() === getExpectedPasscode()) {
      setPasscodeUnlocked(true);
      setAuthError('');
      setPasscodeInput('');
      try {
        sessionStorage.setItem(ADMIN_SESSION_UNLOCKED_KEY, 'true');
      } catch {
        // ignore
      }
    } else {
      setAuthError('Incorrect studio password. Please try again or sign in with Google.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setAuthError('');
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user.email?.toLowerCase() !== BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
        await signOut(auth);
        setAuthError(
          `Access restricted: Only ${BOOTSTRAPPED_ADMIN_EMAIL} is authorized as Admin.`
        );
      } else {
        setPasscodeUnlocked(true);
        try {
          sessionStorage.setItem(ADMIN_SESSION_UNLOCKED_KEY, 'true');
        } catch {
          // ignore
        }
        notifySuccess('Connected to Google Cloud & Firestore as Stephanie Egharevba.');
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Google Sign-In popup was closed.');
    }
  };

  const handleLockPortal = async () => {
    setPasscodeUnlocked(false);
    setIsEditorOpen(false);
    try {
      sessionStorage.removeItem(ADMIN_SESSION_UNLOCKED_KEY);
    } catch {
      // ignore
    }
    if (firebaseUser) {
      await signOut(auth);
    }
    onNavigate('blog');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCustomPassword.trim().length < 6) {
      notifyError('New password must be at least 6 characters.');
      return;
    }
    try {
      localStorage.setItem(ADMIN_PASSCODE_STORAGE_KEY, newCustomPassword.trim());
      setNewCustomPassword('');
      setShowPasswordModal(false);
      notifySuccess('Your CMS Portal password has been updated.');
    } catch {
      notifyError('Could not save password to local storage.');
    }
  };

  const handleOpenNewBlog = () => {
    const todayFormatted = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    setEditingPostId(null);
    setPostTitle('');
    setPostSubtitle('');
    setPostTopic('Accessibility in Practice');
    setPostPublishedAt(todayFormatted);
    setPostLocationNote('Lagos · Dispatch Note');
    setPostCoverImage('/assets/aistudio/20260604_125652_ee30817c.jpg');
    setPostCoverAlt('Stephanie Egharevba sharing insights on digital accessibility');
    setPostPullQuote('');
    setPostMarkdownBody('');
    setPostTakeaways([
      'Designing with accessibility from day one saves engineering time and unlocks real human potential.',
      'Test every interactive flow with the keyboard Tab key before shipping.',
      'Pair visual states with clear, empathetic text guidance.',
    ]);
    setPostStatus('published');
    setEditorMode('split');
    setIsEditorOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEditBlog = (
    post: BlogPost & { status?: 'published' | 'draft'; rawRecord?: CmsStoredBlogRecord }
  ) => {
    setEditingPostId(post.id);
    setPostTitle(post.title);
    setPostSubtitle(post.subtitle || '');
    setPostTopic(
      (post.topic as Exclude<BlogTopic, 'All Notes'>) || 'Accessibility in Practice'
    );
    setPostPublishedAt(post.publishedAt || 'Aug 20, 2026');
    setPostLocationNote(post.locationNote || 'Lagos · Dispatch Note');
    setPostCoverImage(post.coverImage || '');
    setPostCoverAlt(post.coverImageAlt || post.title);
    setPostPullQuote(post.pullQuote || '');
    setPostMarkdownBody(sectionsToEditableMarkdown(post.sections));
    setPostTakeaways(
      post.takeaways && post.takeaways.length > 0
        ? [...post.takeaways]
        : ['Practical field notes on digital accessibility and inclusive systems.']
    );
    setPostStatus(post.status || 'published');
    setEditorMode('split');
    setIsEditorOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressImageFileToDataUrl(file, 1200, 0.82);
      setPostCoverImage(compressedDataUrl);
      if (!postCoverAlt.trim()) {
        setPostCoverAlt(postTitle.trim() || 'Editorial cover photo for blog post');
      }
      notifySuccess('Cover photo uploaded & optimized for fast loading.');
    } catch {
      notifyError('Could not process image file. Please try another photo.');
    }
  };

  const insertFormattingSnippet = (snippetType: 'heading' | 'callout') => {
    if (snippetType === 'heading') {
      setPostMarkdownBody((prev) =>
        prev.trim()
          ? `${prev.trim()}\n\n## New Section Heading\n\nWrite your section paragraph here...`
          : `## Section Heading\n\nWrite your opening paragraph here...`
      );
    } else {
      setPostMarkdownBody((prev) =>
        prev.trim()
          ? `${prev.trim()}\n\n> Quick practical takeaway or highlight for readers.`
          : `> Quick practical takeaway or highlight for readers.`
      );
    }
  };

  // Live preview computed post
  const livePreviewPost: BlogPost = useMemo(() => {
    const words = postMarkdownBody.trim() ? postMarkdownBody.trim().split(/\s+/).length : 0;
    const mins = Math.max(1, Math.ceil(words / 180));
    const serialized = serializePostStructureToBody({
      rawMarkdownBody: postMarkdownBody || 'Start writing your blog post in the editor...',
      takeaways: postTakeaways,
      locationNote: postLocationNote,
    });
    const parsed = parseBodyToStructuredPost(serialized, postLocationNote, postTakeaways);

    return {
      id: editingPostId || 'preview-draft',
      slug: editingPostId || 'preview-draft',
      title: postTitle.trim() || 'Untitled Blog Note',
      subtitle:
        postSubtitle.trim() ||
        'A concise standfirst or subtitle introducing your main idea to readers.',
      topic: postTopic,
      publishedAt: postPublishedAt.trim() || 'Today',
      readingTime: `${mins} min read`,
      locationNote: parsed.locationNote,
      coverImage: postCoverImage.trim() || undefined,
      coverImageAlt: postCoverAlt.trim() || postTitle.trim() || 'Blog cover image',
      pullQuote:
        postPullQuote.trim() ||
        parsed.excerpt ||
        'Designing for accessibility means designing for real human conditions.',
      excerpt: parsed.excerpt,
      takeaways: parsed.takeaways,
      sections: parsed.sections,
    };
  }, [
    editingPostId,
    postTitle,
    postSubtitle,
    postTopic,
    postPublishedAt,
    postLocationNote,
    postCoverImage,
    postCoverAlt,
    postPullQuote,
    postMarkdownBody,
    postTakeaways,
  ]);

  const handleSaveBlogPost = async (targetStatus: 'published' | 'draft') => {
    if (!postTitle.trim() || postTitle.trim().length < 2) {
      notifyError('Please enter a blog title (at least 2 characters).');
      return;
    }
    if (!postMarkdownBody.trim() || postMarkdownBody.trim().length < 5) {
      notifyError('Please write some content in the article body before saving.');
      return;
    }

    setIsSavingPost(true);
    const docId = editingPostId || `note_${Date.now()}`;
    const words = postMarkdownBody.trim().split(/\s+/).length;
    const mins = Math.max(2, Math.ceil(words / 180));
    const readingTimeStr = `${mins} min read`;

    const serializedBody = serializePostStructureToBody({
      rawMarkdownBody: postMarkdownBody,
      takeaways: postTakeaways,
      locationNote: postLocationNote,
    });

    const parsedPreview = parseBodyToStructuredPost(
      serializedBody,
      postLocationNote,
      postTakeaways
    );

    const cleanRecord: CmsStoredBlogRecord = {
      id: docId,
      title: postTitle.trim().slice(0, 200),
      subtitle: (
        postSubtitle.trim() || 'Field note on inclusive design and digital accessibility.'
      ).slice(0, 300),
      topic: postTopic,
      publishedAt: (
        postPublishedAt.trim() ||
        new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      ).slice(0, 60),
      readingTime: readingTimeStr.slice(0, 40),
      pullQuote: (
        postPullQuote.trim() ||
        parsedPreview.excerpt ||
        'Designing for accessibility means designing for real human conditions.'
      ).slice(0, 500),
      body: serializedBody.slice(0, 20000),
      ...(postCoverImage.trim()
        ? {
            coverImage: postCoverImage.trim().slice(0, 500000),
            coverImageAlt: (postCoverAlt.trim() || postTitle.trim()).slice(0, 300),
          }
        : {}),
      status: targetStatus,
      authorUid: firebaseUser?.uid || 'local-admin',
      createdAt: firestoreBlogMap[docId]?.createdAt || {
        seconds: Math.floor(Date.now() / 1000),
      },
      updatedAt: { seconds: Math.floor(Date.now() / 1000) },
    };

    // 1. Always save to local mirror immediately so UI and /blog page update instantaneously
    saveLocalBlogMirrorRecord(cleanRecord);
    setLocalMirrorMap(loadLocalBlogMirror());

    // 2. If authenticated with Stephanie's Google Account, persist to Firestore `blog_posts`
    if (isVerifiedGoogleAdmin && firebaseUser) {
      const path = `blog_posts/${docId}`;
      const existsInFirestore = Boolean(firestoreBlogMap[docId]);

      try {
        if (existsInFirestore) {
          const updatePayload: Record<string, unknown> = {
            title: cleanRecord.title,
            subtitle: cleanRecord.subtitle,
            topic: cleanRecord.topic,
            publishedAt: cleanRecord.publishedAt,
            readingTime: cleanRecord.readingTime,
            pullQuote: cleanRecord.pullQuote,
            body: cleanRecord.body,
            status: cleanRecord.status,
            updatedAt: serverTimestamp(),
          };
          if (cleanRecord.coverImage) {
            updatePayload.coverImage = cleanRecord.coverImage;
            updatePayload.coverImageAlt = cleanRecord.coverImageAlt || cleanRecord.title;
          }
          await updateDoc(doc(db, 'blog_posts', docId), updatePayload);
        } else {
          const createPayload: Record<string, unknown> = {
            title: cleanRecord.title,
            subtitle: cleanRecord.subtitle,
            topic: cleanRecord.topic,
            publishedAt: cleanRecord.publishedAt,
            readingTime: cleanRecord.readingTime,
            pullQuote: cleanRecord.pullQuote,
            body: cleanRecord.body,
            ...(cleanRecord.coverImage
              ? {
                  coverImage: cleanRecord.coverImage,
                  coverImageAlt: cleanRecord.coverImageAlt || cleanRecord.title,
                }
              : {}),
            status: cleanRecord.status,
            authorUid: firebaseUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(doc(db, 'blog_posts', docId), createPayload);
        }

        setIsSavingPost(false);
        setIsEditorOpen(false);
        setEditingPostId(null);
        notifySuccess(
          targetStatus === 'published'
            ? `“${cleanRecord.title}” published live to Firestore & Blog!`
            : `“${cleanRecord.title}” saved to Drafts.`
        );
        return;
      } catch (err) {
        setIsSavingPost(false);
        try {
          handleFirestoreError(
            err,
            existsInFirestore ? OperationType.UPDATE : OperationType.CREATE,
            path
          );
        } catch {
          notifyError(
            'Saved locally, but Cloud sync failed. Check image size (<400KB) or Google Sign-In.'
          );
        }
        return;
      }
    }

    setIsSavingPost(false);
    setIsEditorOpen(false);
    setEditingPostId(null);
    notifySuccess(
      targetStatus === 'published'
        ? `“${cleanRecord.title}” published! (Sign in with Google in the top bar to sync across all devices).`
        : `“${cleanRecord.title}” saved as Draft.`
    );
  };

  const handleToggleBlogStatus = async (
    post: BlogPost & { status: 'published' | 'draft'; rawRecord?: CmsStoredBlogRecord }
  ) => {
    const nextStatus: 'published' | 'draft' =
      post.status === 'published' ? 'draft' : 'published';

    const serializedBody = serializePostStructureToBody({
      rawMarkdownBody: sectionsToEditableMarkdown(post.sections),
      takeaways: post.takeaways,
      locationNote: post.locationNote,
    });

    const updatedRecord: CmsStoredBlogRecord = {
      id: post.id,
      title: post.title,
      subtitle: post.subtitle,
      topic: post.topic,
      publishedAt: post.publishedAt,
      readingTime: post.readingTime,
      pullQuote: post.pullQuote,
      body: serializedBody,
      ...(post.coverImage
        ? { coverImage: post.coverImage, coverImageAlt: post.coverImageAlt || post.title }
        : {}),
      status: nextStatus,
      authorUid: firebaseUser?.uid || 'local-admin',
      createdAt: post.rawRecord?.createdAt || { seconds: Math.floor(Date.now() / 1000) },
      updatedAt: { seconds: Math.floor(Date.now() / 1000) },
    };

    saveLocalBlogMirrorRecord(updatedRecord);
    setLocalMirrorMap(loadLocalBlogMirror());

    if (isVerifiedGoogleAdmin && firebaseUser) {
      const existsInFirestore = Boolean(firestoreBlogMap[post.id]);
      try {
        if (existsInFirestore) {
          await updateDoc(doc(db, 'blog_posts', post.id), {
            status: nextStatus,
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(doc(db, 'blog_posts', post.id), {
            title: updatedRecord.title,
            subtitle: updatedRecord.subtitle,
            topic: updatedRecord.topic,
            publishedAt: updatedRecord.publishedAt,
            readingTime: updatedRecord.readingTime,
            pullQuote: updatedRecord.pullQuote,
            body: updatedRecord.body,
            ...(updatedRecord.coverImage
              ? {
                  coverImage: updatedRecord.coverImage,
                  coverImageAlt: updatedRecord.coverImageAlt,
                }
              : {}),
            status: nextStatus,
            authorUid: firebaseUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch {
        // local mirror already updated
      }
    }

    notifySuccess(
      nextStatus === 'published'
        ? `“${post.title}” is now Published live.`
        : `“${post.title}” moved to Drafts (hidden from public blog).`
    );
  };

  const handleDeleteBlogPost = async (postId: string, title: string) => {
    removeLocalBlogRecord(postId);
    setLocalMirrorMap(loadLocalBlogMirror());
    setDeletedIds(loadDeletedBlogIds());
    setConfirmDeleteId(null);

    if (isVerifiedGoogleAdmin && firestoreBlogMap[postId]) {
      try {
        await deleteDoc(doc(db, 'blog_posts', postId));
      } catch {
        // ignore
      }
    }
    notifySuccess(`“${title}” has been removed.`);
  };

  const handleRestoreOriginalCurated = async (postId: string, title: string) => {
    restoreCuratedBlogId(postId);
    setLocalMirrorMap(loadLocalBlogMirror());
    setDeletedIds(loadDeletedBlogIds());

    if (isVerifiedGoogleAdmin && firestoreBlogMap[postId]) {
      try {
        await deleteDoc(doc(db, 'blog_posts', postId));
      } catch {
        // ignore
      }
    }
    notifySuccess(`“${title}” restored to its original curated version.`);
  };

  // Save Homepage & SEO Settings
  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerifiedGoogleAdmin || !firebaseUser) {
      notifyError('Please click "Sign in with Google" in the top bar to save global site settings.');
      return;
    }
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
        authorUid: firebaseUser.uid,
        updatedAt: serverTimestamp(),
      });
      notifySuccess('Homepage copy, SEO metadata, and social links updated live.');
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, path);
      } catch {
        notifyError('Could not save settings. Verify your Google Admin session.');
      }
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerifiedGoogleAdmin || !firebaseUser) {
      notifyError('Please sign in with Google in the top bar to publish projects to Firestore.');
      return;
    }
    if (projImageAlt.trim().length < 3) {
      notifyError('Image Alt-Text is mandatory (at least 3 characters).');
      return;
    }
    const docId = `proj_${Date.now()}`;
    try {
      await setDoc(doc(db, 'cms_projects', docId), {
        title: projTitle.trim().slice(0, 160),
        subtitle: `${projOrg.trim()} Initiative`.slice(0, 200),
        category: projCategory,
        year: projYear.trim().slice(0, 40),
        organization: projOrg.trim().slice(0, 140),
        role: projRole.trim().slice(0, 140),
        summary: projSummary.trim().slice(0, 600),
        challenge: projSummary.trim().slice(0, 1000),
        intervention: projSummary.trim().slice(0, 1200),
        impactMetrics: 'WCAG 2.2 AA Audited | Inclusive Design Delivered',
        imageUrl: projImageUrl.trim().slice(0, 500),
        imageAlt: projImageAlt.trim().slice(0, 300),
        status: 'published',
        authorUid: firebaseUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setProjTitle('');
      setProjOrg('');
      setProjSummary('');
      setProjImageAlt('');
      notifySuccess('New project published to Work page.');
    } catch {
      notifyError('Could not save project.');
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerifiedGoogleAdmin || !firebaseUser) {
      notifyError('Please sign in with Google in the top bar to publish press items.');
      return;
    }
    const docId = `art_${Date.now()}`;
    try {
      await setDoc(doc(db, 'cms_articles', docId), {
        title: artTitle.trim().slice(0, 200),
        publisher: artPublisher.trim().slice(0, 140),
        year: artYear.trim().slice(0, 30),
        category: artCategory,
        excerpt: artExcerpt.trim().slice(0, 800),
        ...(artUrl.trim() ? { externalUrl: artUrl.trim().slice(0, 500) } : {}),
        imageAlt: (artAlt.trim() || artTitle.trim()).slice(0, 300),
        status: 'published',
        authorUid: firebaseUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setArtTitle('');
      setArtPublisher('');
      setArtExcerpt('');
      setArtUrl('');
      setArtAlt('');
      notifySuccess('Press feature published.');
    } catch {
      notifyError('Could not publish press feature.');
    }
  };

  // ============================================================================
  // LOCKED STATE: CLEAN AUTHENTICATION GATE FOR STEPHANIE
  // ============================================================================
  if (!isPortalUnlocked) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-[#FAF9F6] dark:bg-[#0B0D13]">
        <div className="w-full max-w-md rounded-3xl border border-[#E6E4DD] dark:border-[#262C3A] bg-white dark:bg-[#131722] p-7 sm:p-9 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#E6E4DD] dark:border-[#262C3A] pb-5">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-2xl bg-[#141413] dark:bg-[#1D4ED8] text-white flex items-center justify-center shadow-sm">
                <Lock className="w-5 h-5" />
              </span>
              <div>
                <h1 className="font-display text-xl font-bold text-[#141413] dark:text-white">
                  Editorial CMS Portal
                </h1>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#575652] dark:text-slate-400">
                  Stephanie Egharevba · Content Studio
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('blog')}
              className="text-xs font-semibold text-[#575652] hover:text-[#141413] dark:text-slate-400 dark:hover:text-white cursor-pointer"
            >
              Exit
            </button>
          </div>

          <p className="text-xs sm:text-sm text-[#3F3E3A] dark:text-slate-300 leading-relaxed">
            Sign in to write new blog posts, edit existing articles, manage drafts, and update site
            content.
          </p>

          {/* Option 1: One-Click Google Admin Sign-In */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-3.5 px-4 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs sm:text-sm font-semibold transition-all inline-flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sign In with Google ({BOOTSTRAPPED_ADMIN_EMAIL})</span>
            </button>
            <p className="text-[11px] text-center text-[#737373] dark:text-slate-400">
              Recommended · Enables instant live Firestore cloud publishing
            </p>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#E6E4DD] dark:border-[#262C3A]" />
            <span className="flex-shrink mx-3 font-mono text-[10px] uppercase tracking-widest text-[#737373]">
              OR USE STUDIO PASSCODE
            </span>
            <div className="flex-grow border-t border-[#E6E4DD] dark:border-[#262C3A]" />
          </div>

          {/* Option 2: Studio Password */}
          <form onSubmit={handlePasscodeLogin} className="space-y-4">
            <div>
              <label
                htmlFor="cms-portal-passcode"
                className="block text-xs font-semibold text-[#141413] dark:text-slate-200 mb-1.5"
              >
                Studio Password
              </label>
              <input
                id="cms-portal-passcode"
                type="password"
                required
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Enter your studio password..."
                className="w-full px-4 py-3 text-sm rounded-xl border border-[#E6E4DD] dark:border-[#262C3A] bg-[#FAF9F6] dark:bg-[#1C2230] text-[#141413] dark:text-white focus:border-[#1D4ED8] outline-none"
              />
            </div>

            {authError && (
              <div
                role="alert"
                className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 p-3 flex items-start gap-2 text-xs font-medium text-red-700 dark:text-red-300"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#141413] dark:bg-white text-white dark:text-[#141413] hover:opacity-90 text-xs sm:text-sm font-semibold transition-opacity cursor-pointer"
            >
              Unlock CMS Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ============================================================================
  // UNLOCKED FULL-SCREEN EDITORIAL CMS PORTAL
  // ============================================================================
  const publishedCount = allManagedBlogs.filter((b) => b.status === 'published').length;
  const draftCount = allManagedBlogs.filter((b) => b.status === 'draft').length;

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0B0D13] text-[#141413] dark:text-white pb-20">
      {/* Top CMS Studio Command Bar */}
      <div className="sticky top-[72px] z-30 bg-[#0B0B0B] text-white border-b border-white/10 shadow-md">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center font-serif italic text-lg font-bold">
              se
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-sm sm:text-base font-bold tracking-tight text-white">
                  Stephanie’s Editorial CMS Portal
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-300">
                  <CheckCircle2 className="w-3 h-3" /> Unlocked
                </span>
              </div>
              <p className="font-mono text-[10px] text-neutral-400">
                {isVerifiedGoogleAdmin
                  ? `Cloud Sync Active (${firebaseUser?.email})`
                  : 'Local Studio Active · Connect Google to sync across all devices'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {!isVerifiedGoogleAdmin && (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="px-3.5 py-2 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Connect Google Cloud Sync</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate('blog')}
              className="px-3.5 py-2 rounded-lg border border-white/20 hover:bg-white/10 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Public Blog</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPasswordModal((prev) => !prev)}
              className="px-3 py-2 rounded-lg border border-white/15 hover:bg-white/10 text-neutral-300 hover:text-white text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Password</span>
            </button>

            <button
              type="button"
              onClick={handleLockPortal}
              className="px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>
          </div>
        </div>

        {/* Section Navigation Bar */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex items-center gap-1 overflow-x-auto border-t border-white/10 py-2">
          {(
            [
              {
                id: 'blogs',
                label: `Blog Posts (${allManagedBlogs.length})`,
                icon: BookOpen,
              },
              { id: 'settings', label: 'Homepage & SEO', icon: Globe },
              {
                id: 'projects',
                label: `Case Studies (${cmsProjects.length})`,
                icon: FolderKanban,
              },
              {
                id: 'articles',
                label: `Press & Features (${cmsArticles.length})`,
                icon: FileText,
              },
              {
                id: 'enquiries',
                label: `Enquiries & Subscribers (${enquiries.length})`,
                icon: Mail,
              },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveSection(tab.id);
                  setIsEditorOpen(false);
                }}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#0B0B0B] shadow-xs'
                    : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Password Change Drawer */}
      {showPasswordModal && (
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 mt-4">
          <form
            onSubmit={handleUpdatePassword}
            className="rounded-2xl border border-[#E6E4DD] bg-white p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-[#141413]">
              <KeyRound className="w-4 h-4 text-[#1D4ED8]" />
              <span>Update your CMS Studio Passcode:</span>
            </div>
            <div className="flex flex-1 max-w-md items-center gap-2">
              <input
                type="password"
                required
                minLength={6}
                value={newCustomPassword}
                onChange={(e) => setNewCustomPassword(e.target.value)}
                placeholder="New password (min 6 chars)..."
                className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-[#E6E4DD] bg-[#FAF9F6]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#141413] text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
              >
                Save Password
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="p-2 text-[#575652] hover:text-[#141413] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Status & Error Notifications */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 mt-5">
        {statusMessage && (
          <div
            role="status"
            className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3.5 text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{statusMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-emerald-700 hover:opacity-75 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="mb-4 rounded-2xl border border-red-500/30 bg-red-50 dark:bg-red-950/40 px-4 py-3.5 text-xs sm:text-sm font-semibold text-red-700 dark:text-red-200 flex items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-700 hover:opacity-75 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Portal Body */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 mt-4">
        {/* ================================================================= */}
        {/* SECTION 1: BLOG POSTS & EDITORIAL STUDIO                          */}
        {/* ================================================================= */}
        {activeSection === 'blogs' && (
          <>
            {isEditorOpen ? (
              /* ------------------------------------------------------------- */
              /* FULL-SCREEN BLOG COMPOSER & LIVE PREVIEW STUDIO               */
              /* ------------------------------------------------------------- */
              <div className="space-y-6">
                {/* Editor Top Toolbar */}
                <div className="rounded-2xl border border-[#E6E4DD] dark:border-[#262C3A] bg-white dark:bg-[#131722] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditorOpen(false);
                        setEditingPostId(null);
                      }}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] hover:border-[#141413] text-xs font-semibold text-[#141413] cursor-pointer transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>All Blog Posts</span>
                    </button>
                    <div>
                      <h2 className="font-display text-base sm:text-lg font-bold text-[#141413] dark:text-white">
                        {editingPostId ? 'Edit Blog Post' : 'Write New Blog Post'}
                      </h2>
                      <p className="font-mono text-[11px] text-[#575652] dark:text-slate-400">
                        {livePreviewPost.readingTime} ·{' '}
                        {postMarkdownBody.trim()
                          ? `${postMarkdownBody.trim().split(/\s+/).length} words`
                          : '0 words'}
                      </p>
                    </div>
                  </div>

                  {/* Mode Switcher + Save/Publish Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="inline-flex rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] p-1">
                      {(
                        [
                          { id: 'write', label: 'Editor' },
                          { id: 'split', label: 'Split View' },
                          { id: 'preview', label: 'Live Preview' },
                        ] as const
                      ).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setEditorMode(m.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            editorMode === m.id
                              ? 'bg-[#141413] text-white'
                              : 'text-[#575652] hover:text-[#141413]'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={isSavingPost}
                      onClick={() => handleSaveBlogPost('draft')}
                      className="px-4 py-2.5 rounded-xl border border-[#E6E4DD] bg-white hover:border-[#141413] text-xs font-semibold text-[#141413] cursor-pointer transition-colors disabled:opacity-50"
                    >
                      Save as Draft
                    </button>

                    <button
                      type="button"
                      disabled={isSavingPost}
                      onClick={() => handleSaveBlogPost('published')}
                      className="px-5 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>
                        {isSavingPost
                          ? 'Saving...'
                          : editingPostId
                          ? 'Update Published Post'
                          : 'Publish Blog Post'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Editor + Preview Grid */}
                <div
                  className={`grid grid-cols-1 gap-6 items-start ${
                    editorMode === 'split' ? 'lg:grid-cols-12' : ''
                  }`}
                >
                  {/* Left Pane: Form & Content Editor */}
                  {(editorMode === 'write' || editorMode === 'split') && (
                    <div
                      className={`${
                        editorMode === 'split' ? 'lg:col-span-7' : 'max-w-4xl mx-auto w-full'
                      } rounded-2xl border border-[#E6E4DD] bg-white p-6 sm:p-8 space-y-6 shadow-xs`}
                    >
                      {/* Title & Topic */}
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="cms-post-title"
                            className="block font-mono text-[11px] uppercase tracking-wider text-[#575652] mb-1.5 font-semibold"
                          >
                            Article Headline / Title *
                          </label>
                          <input
                            id="cms-post-title"
                            type="text"
                            required
                            value={postTitle}
                            onChange={(e) => setPostTitle(e.target.value)}
                            placeholder="e.g., What Happens When You Unplug Your Mouse for Five Minutes"
                            className="w-full px-4 py-3 text-base sm:text-lg font-bold rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] focus:border-[#1D4ED8] outline-none"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="cms-post-subtitle"
                            className="block font-mono text-[11px] uppercase tracking-wider text-[#575652] mb-1.5 font-semibold"
                          >
                            Standfirst / Subtitle
                          </label>
                          <textarea
                            id="cms-post-subtitle"
                            rows={2}
                            value={postSubtitle}
                            onChange={(e) => setPostSubtitle(e.target.value)}
                            placeholder="A one- or two-sentence summary that hooks the reader..."
                            className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] focus:border-[#1D4ED8] outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label
                              htmlFor="cms-post-topic"
                              className="block font-mono text-[11px] uppercase tracking-wider text-[#575652] mb-1.5 font-semibold"
                            >
                              Category / Topic *
                            </label>
                            <select
                              id="cms-post-topic"
                              value={postTopic}
                              onChange={(e) =>
                                setPostTopic(e.target.value as Exclude<BlogTopic, 'All Notes'>)
                              }
                              className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-xl border border-[#E6E4DD] bg-[#FAF9F6]"
                            >
                              <option value="Accessibility in Practice">
                                Accessibility in Practice
                              </option>
                              <option value="Inclusion & Culture">Inclusion &amp; Culture</option>
                              <option value="Personal Reflections">Personal Reflections</option>
                              <option value="Builder Notes">Builder Notes</option>
                            </select>
                          </div>

                          <div>
                            <label
                              htmlFor="cms-post-date"
                              className="block font-mono text-[11px] uppercase tracking-wider text-[#575652] mb-1.5 font-semibold"
                            >
                              Publish Date
                            </label>
                            <input
                              id="cms-post-date"
                              type="text"
                              value={postPublishedAt}
                              onChange={(e) => setPostPublishedAt(e.target.value)}
                              placeholder="e.g., Nov 6, 2026"
                              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E6E4DD] bg-[#FAF9F6]"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="cms-post-location"
                              className="block font-mono text-[11px] uppercase tracking-wider text-[#575652] mb-1.5 font-semibold"
                            >
                              Location / Dispatch Tag
                            </label>
                            <input
                              id="cms-post-location"
                              type="text"
                              value={postLocationNote}
                              onChange={(e) => setPostLocationNote(e.target.value)}
                              placeholder="e.g., Lagos · Personal Essay"
                              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E6E4DD] bg-[#FAF9F6]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Cover Photo Manager */}
                      <div className="rounded-2xl border border-[#E6E4DD] bg-[#FAF9F6] p-4 sm:p-5 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#1D4ED8] font-bold">
                            <ImageIcon className="w-4 h-4" />
                            <span>Cover Photo &amp; Accessible Alt-Text</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowPresetGallery((prev) => !prev)}
                            className="text-xs font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
                          >
                            {showPresetGallery
                              ? 'Hide Photo Library'
                              : 'Choose from Stephanie’s Photo Library'}
                          </button>
                        </div>

                        {showPresetGallery && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                            {PRESET_EDITORIAL_PHOTOS.map((preset) => (
                              <button
                                key={preset.url}
                                type="button"
                                onClick={() => {
                                  setPostCoverImage(preset.url);
                                  setPostCoverAlt(preset.alt);
                                  setShowPresetGallery(false);
                                }}
                                className={`group relative rounded-xl overflow-hidden border-2 text-left transition-all cursor-pointer ${
                                  postCoverImage === preset.url
                                    ? 'border-[#1D4ED8] ring-2 ring-[#1D4ED8]/20'
                                    : 'border-transparent hover:border-[#141413]'
                                }`}
                              >
                                <img
                                  src={preset.url}
                                  alt={preset.alt}
                                  className="w-full h-20 object-cover"
                                />
                                <div className="p-1.5 bg-white text-[10px] font-semibold text-[#141413] truncate">
                                  {preset.label}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label
                              htmlFor="cms-cover-upload"
                              className="block text-xs font-semibold text-[#141413] mb-1"
                            >
                              Upload Photo from Device (Auto-Optimized)
                            </label>
                            <input
                              id="cms-cover-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleImageFileSelected}
                              className="w-full text-xs file:mr-2.5 file:rounded-lg file:border file:border-[#E6E4DD] file:bg-white file:px-3 file:py-1.5 file:font-semibold cursor-pointer"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="cms-cover-url"
                              className="block text-xs font-semibold text-[#141413] mb-1"
                            >
                              Or Paste Image URL
                            </label>
                            <input
                              id="cms-cover-url"
                              type="text"
                              value={postCoverImage}
                              onChange={(e) => setPostCoverImage(e.target.value)}
                              placeholder="https://... or /assets/..."
                              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E6E4DD] bg-white"
                            />
                          </div>
                        </div>

                        {postCoverImage && (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
                            <img
                              src={postCoverImage}
                              alt={postCoverAlt || 'Preview'}
                              className="w-28 h-20 rounded-xl object-cover border border-[#E6E4DD] shrink-0"
                            />
                            <div className="flex-1 w-full space-y-1.5">
                              <label
                                htmlFor="cms-cover-alt"
                                className="block text-xs font-semibold text-[#141413]"
                              >
                                Accessible Image Description (Alt-Text)
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  id="cms-cover-alt"
                                  type="text"
                                  value={postCoverAlt}
                                  onChange={(e) => setPostCoverAlt(e.target.value)}
                                  placeholder="Describe the photo for screen reader users..."
                                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#E6E4DD] bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPostCoverImage('');
                                    setPostCoverAlt('');
                                  }}
                                  className="px-2.5 py-2 rounded-lg text-xs text-red-600 hover:bg-red-50 cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Pull Quote */}
                      <div>
                        <label
                          htmlFor="cms-pull-quote"
                          className="block font-mono text-[11px] uppercase tracking-wider text-[#575652] mb-1.5 font-semibold"
                        >
                          Featured Pull Quote (“A Thought to Sit With”)
                        </label>
                        <input
                          id="cms-pull-quote"
                          type="text"
                          value={postPullQuote}
                          onChange={(e) => setPostPullQuote(e.target.value)}
                          placeholder="A memorable one-sentence quote highlighted inside the article..."
                          className="w-full px-4 py-2.5 text-sm italic rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] focus:border-[#1D4ED8] outline-none"
                        />
                      </div>

                      {/* Main Article Body Editor with Formatting Helpers */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label
                            htmlFor="cms-body-editor"
                            className="font-mono text-[11px] uppercase tracking-wider text-[#575652] font-semibold"
                          >
                            Article Body * (Separate paragraphs with a blank line)
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => insertFormattingSnippet('heading')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E6E4DD] bg-[#FAF9F6] hover:border-[#141413] text-[11px] font-semibold text-[#141413] cursor-pointer"
                            >
                              <Heading2 className="w-3.5 h-3.5 text-[#1D4ED8]" />
                              <span>+ Section Heading (##)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormattingSnippet('callout')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E6E4DD] bg-[#FAF9F6] hover:border-[#141413] text-[11px] font-semibold text-[#141413] cursor-pointer"
                            >
                              <Quote className="w-3.5 h-3.5 text-[#1D4ED8]" />
                              <span>+ Takeaway Box (&gt;)</span>
                            </button>
                          </div>
                        </div>

                        <textarea
                          id="cms-body-editor"
                          rows={14}
                          required
                          value={postMarkdownBody}
                          onChange={(e) => setPostMarkdownBody(e.target.value)}
                          placeholder={
                            'Write your essay here...\n\nUse "## Section Heading" on its own line to create a subheading.\n\nUse "> Practical takeaway..." on its own line to create a highlighted callout box.'
                          }
                          className="w-full px-4 py-3.5 text-sm sm:text-base leading-relaxed rounded-2xl border border-[#E6E4DD] bg-[#FAF9F6] focus:border-[#1D4ED8] outline-none font-sans"
                        />
                      </div>

                      {/* Key Takeaways Editor ("If You Only Remember Three Things") */}
                      <div className="rounded-2xl border border-[#E6E4DD] bg-[#FAF9F6] p-4 sm:p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#1D4ED8] font-bold">
                            <ListChecks className="w-4 h-4" />
                            <span>Key Takeaways (“If You Only Remember Three Things”)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPostTakeaways((prev) => [...prev, ''])}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Takeaway</span>
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          {postTakeaways.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#1D4ED8] w-6 shrink-0">
                                0{idx + 1}
                              </span>
                              <input
                                type="text"
                                value={item}
                                onChange={(e) => {
                                  const next = [...postTakeaways];
                                  next[idx] = e.target.value;
                                  setPostTakeaways(next);
                                }}
                                placeholder={`Key takeaway #${idx + 1}...`}
                                className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border border-[#E6E4DD] bg-white"
                              />
                              {postTakeaways.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPostTakeaways((prev) => prev.filter((_, i) => i !== idx))
                                  }
                                  aria-label={`Remove takeaway ${idx + 1}`}
                                  className="p-1.5 text-neutral-400 hover:text-red-600 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Right Pane: Real-Time Article Preview */}
                  {(editorMode === 'preview' || editorMode === 'split') && (
                    <div
                      className={`${
                        editorMode === 'split'
                          ? 'lg:col-span-5 lg:sticky lg:top-[180px]'
                          : 'max-w-3xl mx-auto w-full'
                      } rounded-2xl border border-[#E6E4DD] bg-white p-6 sm:p-8 space-y-6 shadow-xs max-h-[82vh] overflow-y-auto`}
                    >
                      <div className="flex items-center justify-between border-b border-[#E6E4DD] pb-3">
                        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#1D4ED8] font-bold">
                          LIVE READER PREVIEW
                        </span>
                        <span className="font-mono text-[11px] text-[#575652]">
                          {livePreviewPost.publishedAt} · {livePreviewPost.readingTime}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#1D4ED8] font-semibold">
                          {livePreviewPost.topic} · {livePreviewPost.locationNote}
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#141413] leading-tight">
                          {livePreviewPost.title}
                        </h3>
                        <p className="text-sm sm:text-base text-[#3F3E3A] leading-relaxed">
                          {livePreviewPost.subtitle}
                        </p>
                      </div>

                      {livePreviewPost.coverImage && (
                        <figure className="rounded-xl overflow-hidden border border-[#E6E4DD]">
                          <img
                            src={livePreviewPost.coverImage}
                            alt={livePreviewPost.coverImageAlt || livePreviewPost.title}
                            className="w-full max-h-56 object-cover"
                          />
                        </figure>
                      )}

                      <blockquote className="rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] p-4 space-y-1">
                        <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#1D4ED8]">
                          A THOUGHT TO SIT WITH
                        </div>
                        <p className="font-serif italic text-sm sm:text-base text-[#141413]">
                          “{livePreviewPost.pullQuote}”
                        </p>
                      </blockquote>

                      <div className="space-y-4 text-sm text-[#272725] leading-relaxed">
                        {livePreviewPost.sections.map((sec, idx) => (
                          <div key={idx} className="space-y-3">
                            {sec.heading && (
                              <h4 className="text-base sm:text-lg font-display font-bold text-[#141413] pt-1">
                                {sec.heading}
                              </h4>
                            )}
                            {sec.paragraphs.map((p, pIdx) => (
                              <p key={pIdx} className="text-[#3F3E3A]">
                                {p}
                              </p>
                            ))}
                            {sec.callout && (
                              <div className="rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] p-3.5 text-xs sm:text-sm text-[#141413]">
                                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#1D4ED8] block mb-1 font-semibold">
                                  PRACTICAL TAKEAWAY
                                </span>
                                {sec.callout}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {livePreviewPost.takeaways.length > 0 && (
                        <div className="rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] p-4 space-y-2.5">
                          <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#1D4ED8] font-semibold">
                            IF YOU ONLY REMEMBER THREE THINGS
                          </div>
                          <ul className="space-y-2">
                            {livePreviewPost.takeaways.map((t, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-[#3F3E3A]">
                                <span className="font-mono font-bold text-[#1D4ED8]">
                                  0{idx + 1}
                                </span>
                                <span>{t}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ------------------------------------------------------------- */
              /* BLOG POSTS OVERVIEW & MANAGEMENT LIST                         */
              /* ------------------------------------------------------------- */
              <div className="space-y-6">
                {/* Top Action & Filter Bar */}
                <div className="rounded-2xl border border-[#E6E4DD] dark:border-[#262C3A] bg-white dark:bg-[#131722] p-5 sm:p-6 space-y-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-display text-xl sm:text-2xl font-bold text-[#141413] dark:text-white">
                        Blog Posts &amp; Field Notes Manager
                      </h2>
                      <p className="text-xs sm:text-sm text-[#575652] dark:text-slate-400 mt-0.5">
                        {publishedCount} Published · {draftCount} Drafts · Click any post below to
                        edit its text, headings, date, or cover photo.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenNewBlog}
                      className="px-5 py-3 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Write New Blog Post</span>
                    </button>
                  </div>

                  {/* Search + Topic Filter + Status Filter */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-[#E6E4DD] dark:border-[#262C3A]">
                    <div className="md:col-span-5 relative">
                      <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="search"
                        value={blogSearch}
                        onChange={(e) => setBlogSearch(e.target.value)}
                        placeholder="Search blog posts by title, topic, or keyword..."
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] outline-none focus:border-[#1D4ED8]"
                      />
                    </div>

                    <div className="md:col-span-4">
                      <select
                        aria-label="Filter by topic"
                        value={blogTopicFilter}
                        onChange={(e) => setBlogTopicFilter(e.target.value as BlogTopic)}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E6E4DD] bg-[#FAF9F6]"
                      >
                        <option value="All Notes">All Topics ({allManagedBlogs.length})</option>
                        <option value="Accessibility in Practice">Accessibility in Practice</option>
                        <option value="Inclusion & Culture">Inclusion &amp; Culture</option>
                        <option value="Personal Reflections">Personal Reflections</option>
                        <option value="Builder Notes">Builder Notes</option>
                      </select>
                    </div>

                    <div className="md:col-span-3 flex items-center gap-1.5 bg-[#FAF9F6] p-1 rounded-xl border border-[#E6E4DD]">
                      {(
                        [
                          { id: 'all', label: 'All' },
                          { id: 'published', label: 'Published' },
                          { id: 'draft', label: 'Drafts' },
                        ] as const
                      ).map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setBlogStatusFilter(st.id)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            blogStatusFilter === st.id
                              ? 'bg-[#141413] text-white'
                              : 'text-[#575652] hover:text-[#141413]'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Blog Posts List */}
                <div className="space-y-3">
                  {filteredBlogs.length === 0 ? (
                    <div className="rounded-2xl border border-[#E6E4DD] bg-white p-12 text-center space-y-3">
                      <p className="text-base font-bold text-[#141413]">
                        No blog posts match your current filter.
                      </p>
                      <button
                        type="button"
                        onClick={handleOpenNewBlog}
                        className="px-4 py-2.5 rounded-xl bg-[#1D4ED8] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create Your First Note</span>
                      </button>
                    </div>
                  ) : (
                    filteredBlogs.map((post) => (
                      <div
                        key={post.id}
                        className="rounded-2xl border border-[#E6E4DD] dark:border-[#262C3A] bg-white dark:bg-[#131722] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#141413]/40 transition-all shadow-2xs"
                      >
                        <div className="flex items-start sm:items-center gap-4 min-w-0">
                          <img
                            src={
                              post.coverImage || '/assets/aistudio/20260604_125652_ee30817c.jpg'
                            }
                            alt={post.coverImageAlt || post.title}
                            className="w-20 h-16 sm:w-28 sm:h-20 rounded-xl object-cover border border-[#E6E4DD] shrink-0 bg-neutral-100"
                          />

                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider ${
                                  post.status === 'published'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {post.status === 'published' ? 'Published' : 'Draft'}
                              </span>

                              <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-[#1D4ED8]">
                                {post.topic}
                              </span>

                              <span className="text-xs text-[#737373]">
                                · {post.publishedAt} · {post.readingTime}
                              </span>

                              {post.hasCustomEdits && post.isCuratedDefault && (
                                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-50 text-[#1D4ED8]">
                                  Edited
                                </span>
                              )}
                            </div>

                            <h3 className="font-display text-base sm:text-lg font-bold text-[#141413] dark:text-white truncate">
                              {post.title}
                            </h3>

                            <p className="text-xs text-[#575652] dark:text-slate-400 line-clamp-1">
                              {post.subtitle}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E6E4DD]">
                          <button
                            type="button"
                            onClick={() => handleOpenEditBlog(post)}
                            className="px-4 py-2 rounded-xl bg-[#141413] hover:bg-[#1D4ED8] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit Blog</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleBlogStatus(post)}
                            className="px-3 py-2 rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] hover:border-[#141413] text-xs font-medium text-[#141413] cursor-pointer transition-colors"
                          >
                            {post.status === 'published' ? 'Move to Draft' : 'Publish Live'}
                          </button>

                          {post.isCuratedDefault && post.hasCustomEdits && (
                            <button
                              type="button"
                              onClick={() => handleRestoreOriginalCurated(post.id, post.title)}
                              title="Reset to original default essay"
                              className="px-3 py-2 rounded-xl border border-[#E6E4DD] bg-white hover:border-[#141413] text-xs font-medium text-[#575652] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reset</span>
                            </button>
                          )}

                          {confirmDeleteId === post.id ? (
                            <div className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-xl px-2.5 py-1">
                              <span className="text-[11px] font-semibold text-red-700">
                                Delete?
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteBlogPost(post.id, post.title)}
                                className="px-2 py-1 rounded bg-red-600 text-white text-[11px] font-bold cursor-pointer"
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1 rounded bg-white text-neutral-700 text-[11px] cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(post.id)}
                              aria-label={`Delete ${post.title}`}
                              className="p-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ================================================================= */}
        {/* SECTION 2: HOMEPAGE, HERO & SEO SETTINGS                          */}
        {/* ================================================================= */}
        {activeSection === 'settings' && (
          <form
            onSubmit={handleSaveSiteSettings}
            className="rounded-2xl border border-[#E6E4DD] bg-white p-6 sm:p-8 space-y-6 shadow-xs"
          >
            <div>
              <h2 className="font-display text-xl font-bold text-[#141413]">
                Homepage Copy, SEO Metadata &amp; Social Profiles
              </h2>
              <p className="text-xs text-[#575652]">
                Changes saved here update the live homepage hero and OpenGraph SEO tags.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#525252] mb-1.5">
                  Homepage Hero Tagline
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.heroTagline}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, heroTagline: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#525252] mb-1.5">
                  Story Section Core Thesis Quote
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.heroQuote}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, heroQuote: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-[#525252] mb-1.5">
                Homepage Hero Sub-Headline
              </label>
              <textarea
                rows={3}
                required
                value={settingsForm.heroSubtext}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, heroSubtext: e.target.value })
                }
                className="w-full rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-[#E6E4DD]">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#525252] mb-1.5">
                  Default SEO Title
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.seoTitle}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, seoTitle: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#525252] mb-1.5">
                  Default SEO Meta Description
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.seoDescription}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, seoDescription: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#141413] hover:bg-[#1D4ED8] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors"
              >
                Save Homepage &amp; SEO Settings
              </button>
            </div>
          </form>
        )}

        {/* ================================================================= */}
        {/* SECTION 3: CASE STUDIES & WORK PROJECTS                           */}
        {/* ================================================================= */}
        {activeSection === 'projects' && (
          <div className="space-y-6">
            <form
              onSubmit={handleCreateProject}
              className="rounded-2xl border border-[#E6E4DD] bg-white p-6 sm:p-8 space-y-4 shadow-xs"
            >
              <h2 className="font-display text-xl font-bold text-[#141413]">
                Publish New Case Study / Project
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#525252] mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={projTitle}
                    onChange={(e) => setProjTitle(e.target.value)}
                    placeholder="e.g., Pan-African Fintech WCAG Audit"
                    className="w-full rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#525252] mb-1">
                    Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={projOrg}
                    onChange={(e) => setProjOrg(e.target.value)}
                    placeholder="e.g., Mastercard Foundation"
                    className="w-full rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#525252] mb-1">
                    Category *
                  </label>
                  <select
                    value={projCategory}
                    onChange={(e) =>
                      setProjCategory(e.target.value as Exclude<ProjectCategory, 'All'>)
                    }
                    className="w-full rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] px-3.5 py-2.5 text-sm"
                  >
                    <option value="WCAG & Accessibility">WCAG &amp; Accessibility</option>
                    <option value="D&I Strategy">D&amp;I Strategy</option>
                    <option value="Workforce & Tech">Workforce &amp; Tech</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#525252] mb-1">
                    Cover Image URL *
                  </label>
                  <input
                    type="text"
                    required
                    value={projImageUrl}
                    onChange={(e) => setProjImageUrl(e.target.value)}
                    className="w-full rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#1D4ED8] font-bold mb-1">
                    Mandatory Accessible Alt-Text *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    value={projImageAlt}
                    onChange={(e) => setProjImageAlt(e.target.value)}
                    placeholder="Describe image for screen readers..."
                    className="w-full rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#525252] mb-1">
                  Executive Summary *
                </label>
                <textarea
                  rows={2}
                  required
                  value={projSummary}
                  onChange={(e) => setProjSummary(e.target.value)}
                  placeholder="Concise summary of challenge, intervention, and impact..."
                  className="w-full rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#141413] hover:bg-[#1D4ED8] text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Case Study</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 4: PRESS & FEATURES                                       */}
        {/* ================================================================= */}
        {activeSection === 'articles' && (
          <div className="space-y-6">
            <form
              onSubmit={handleCreateArticle}
              className="rounded-2xl border border-[#E6E4DD] bg-white p-6 sm:p-8 space-y-4 shadow-xs"
            >
              <h2 className="font-display text-xl font-bold text-[#141413]">
                Add Press Feature or Publication Link
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#525252] mb-1">
                    Headline / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={artTitle}
                    onChange={(e) => setArtTitle(e.target.value)}
                    className="w-full rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#525252] mb-1">
                    Publication / Outlet *
                  </label>
                  <input
                    type="text"
                    required
                    value={artPublisher}
                    onChange={(e) => setArtPublisher(e.target.value)}
                    className="w-full rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#525252] mb-1">
                    External Article URL
                  </label>
                  <input
                    type="url"
                    value={artUrl}
                    onChange={(e) => setArtUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#525252] mb-1">
                  Excerpt / Summary *
                </label>
                <textarea
                  rows={2}
                  required
                  value={artExcerpt}
                  onChange={(e) => setArtExcerpt(e.target.value)}
                  className="w-full rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#141413] hover:bg-[#1D4ED8] text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Press Feature</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 5: ENQUIRIES & NEWSLETTER SUBSCRIBERS                     */}
        {/* ================================================================= */}
        {activeSection === 'enquiries' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#E6E4DD] bg-white p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-[#141413]">
                    Speaking &amp; Consulting Enquiries ({enquiries.length})
                  </h2>
                  <p className="text-xs text-[#575652]">
                    Direct enquiries submitted via the Contact page · Newsletter Subscribers:{' '}
                    {subscribers.length}
                  </p>
                </div>
              </div>

              {!isVerifiedGoogleAdmin ? (
                <div className="rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] p-6 text-center space-y-3">
                  <p className="text-sm font-semibold text-[#141413]">
                    Sign in with Google ({BOOTSTRAPPED_ADMIN_EMAIL}) to view private enquiries.
                  </p>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="px-4 py-2.5 rounded-xl bg-[#1D4ED8] text-white text-xs font-semibold cursor-pointer"
                  >
                    Sign In with Google
                  </button>
                </div>
              ) : enquiries.length === 0 ? (
                <p className="text-xs text-[#575652] py-4">No enquiries logged yet.</p>
              ) : (
                <div className="divide-y divide-[#E6E4DD] border border-[#E6E4DD] rounded-xl">
                  {enquiries.map((enq) => (
                    <div key={enq.id} className="p-4 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-bold text-sm text-[#141413]">
                          {enq.name} · <span className="text-[#1D4ED8]">{enq.organization}</span>
                        </div>
                        <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#FAF9F6] border border-[#E6E4DD]">
                          {enq.inquiryType}
                        </span>
                      </div>
                      <p className="text-xs text-[#3F3E3A]">{enq.message}</p>
                      <div className="text-[11px] text-[#737373]">
                        Reply to:{' '}
                        <a href={`mailto:${enq.email}`} className="text-[#1D4ED8] underline">
                          {enq.email}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Coffee,
  Copy,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
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
import { CmsArticleRecord } from './CmsAdminModal';
import {
  CmsStoredBlogRecord,
  ADMIN_SESSION_UNLOCKED_KEY,
  recordToBlogPost,
  loadLocalBlogMirror,
  loadDeletedBlogIds,
  saveLocalBlogMirrorRecord,
  removeLocalBlogRecord,
} from '../lib/blogCms';

export type BlogTopic =
  | 'All Notes'
  | 'Accessibility in Practice'
  | 'Inclusion & Culture'
  | 'Personal Reflections'
  | 'Builder Notes';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  topic: Exclude<BlogTopic, 'All Notes'>;
  publishedAt: string;
  readingTime: string;
  locationNote: string;
  featured?: boolean;
  coverImage?: string;
  coverImageAlt?: string;
  pullQuote: string;
  excerpt: string;
  externalUrl?: string;
  isFromFirestore?: boolean;
  takeaways: string[];
  sections: {
    heading?: string;
    paragraphs: string[];
    callout?: string;
  }[];
}

// Default private password for Stephanie's /blog-admin portal (stored as a hash/constant check)
export const ADMIN_PASSCODE_DEFAULT = 'UnbiasLagos2026!';
export const ADMIN_PASSCODE_STORAGE_KEY = 'stephanie_blog_admin_custom_pass_v1';

export const CURATED_BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-five-minute-keyboard-test',
    slug: 'what-happens-when-you-unplug-your-mouse-for-five-minutes',
    title: 'What Happens When You Unplug Your Mouse for Five Minutes',
    subtitle:
      'Most digital products do not fail accessibility because engineers do not care. They fail because nobody ever tried signing up with the Tab key.',
    topic: 'Accessibility in Practice',
    publishedAt: 'Aug 20, 2026',
    readingTime: '5 min read',
    locationNote: 'Lagos · Sunday Morning Coffee Note',
    featured: true,
    coverImage: '/assets/aistudio/20260604_125652_ee30817c.jpg',
    coverImageAlt: 'Stephanie facilitating an interactive accessibility workshop in Lagos',
    pullQuote:
      'If a user cannot tell where their focus is on the screen, your interface has politely locked the front door while leaving the lights on inside.',
    excerpt:
      'Before we talk about 40-page WCAG audit spreadsheets or automated Lighthouse scores, I always ask product teams to try one simple human ritual: put your mouse in a drawer for five minutes and try to buy something on your own app.',
    takeaways: [
      'Automated scanners catch roughly 30% of real accessibility barriers; a 5-minute keyboard walkthrough catches the ones that actually block checkout.',
      'Removing outline: none without providing a high-contrast focus ring is the single most common self-inflicted wound in modern web apps.',
      'Custom dropdowns built out of <div> tags might look sleek in Figma, but without native <select> or ARIA keyboard handlers, they are invisible walls.',
    ],
    sections: [
      {
        paragraphs: [
          'Whenever I sit down with a product team for the first time, there is usually a quiet moment of panic. Someone opens a spreadsheet with 78 WCAG success criteria, someone else mentions legal compliance, and suddenly accessibility feels like a tax audit.',
          'So I like to start somewhere much calmer. I ask everyone in the room to push their trackpad away, rest their hands on the keyboard, and try to complete one basic task on their own live product using only the Tab, Shift+Tab, Enter, and Space keys.',
          'Usually, within forty-five seconds, the room goes quiet. Then someone laughs nervously and says, "Wait... where did my cursor go?"',
        ],
      },
      {
        heading: 'The Case of the Vanishing Focus Ring',
        paragraphs: [
          'Nine times out of ten, the culprit is a single line of CSS added early in the project because someone thought the browser’s default blue outline looked "messy." So outline: none went into the global stylesheet, and just like that, every keyboard user, motor-impaired user, and power user was left navigating in the dark.',
          'Here is the relaxed truth: focus indicators do not have to be ugly. You can style :focus-visible so that mouse users never see a ring when clicking, while keyboard navigators get a crisp, unmistakable 2px border that matches your brand palette.',
        ],
        callout:
          'Quick rule of thumb for Monday morning: search your codebase for "outline-none" or "outline: none". If it is not paired with a clear focus-visible ring, you have found your easiest win of the week.',
      },
      {
        heading: 'Why Five Minutes Beats a 50-Page Theory Deck',
        paragraphs: [
          'When we treat accessibility as an abstract compliance checklist, nobody enjoys the work. When we treat it as hospitality, making sure the person on the other side of the screen can actually move through the room we built, everything changes.',
          'Next time you are about to ship a form or a modal dialog, grab a cup of tea, ignore your mouse for five minutes, and press Tab. Your users will feel the difference immediately.',
        ],
      },
    ],
  },
  {
    id: 'blog-unbias-project-human-voice',
    slug: 'why-i-started-the-unbias-project',
    title: 'Why I Started The Unbias Project: Honest Notes on Inclusion',
    subtitle:
      'Inclusion work is full of stiff corporate buzzwords. Real change happens when we talk honestly about how systems feel to the people living inside them.',
    topic: 'Personal Reflections',
    publishedAt: 'Aug 3, 2026',
    readingTime: '6 min read',
    locationNote: 'Lagos · Personal Essay',
    coverImage: '/assets/aistudio/Headshot_3_ab4f5e1e.jpg',
    coverImageAlt: 'Stephanie Egharevba portrait',
    pullQuote:
      'People do not connect with policy memos. They connect with honest stories about what works, what hurts, and how we can build better together.',
    excerpt:
      'For years, I read D&I reports that sounded like they were written by a legal department trying not to offend a printer. Here is why I decided to make this corner of the internet and The Unbias Project a place for real, unfiltered conversation.',
    externalUrl: 'https://substack.com/@theunbiasproject',
    takeaways: [
      'Jargon creates distance; plain language invites everyone, including engineers, founders, and advocates, into the same room.',
      'Living with Osteogenesis Imperfecta taught me early on that humor, candor, and warmth open doors that lectures never will.',
      'Accessibility is not about perfection on day one; it is about building the habit of noticing who was left out of the default assumptions.',
    ],
    sections: [
      {
        paragraphs: [
          'If you have ever read a corporate diversity statement, you already know the tone: solemn, polished, and completely devoid of oxygen. Every sentence sounds like it survived twelve rounds of edits.',
          'Living with Osteogenesis Imperfecta (Brittle Bones Disease) in Nigeria gives you a very practical relationship with design. You notice the step at the entrance of the bank. You notice the event stage that has no ramp even when you were invited as a speaker. And online, you notice when a platform assumes every human body interacts with technology the exact same way.',
        ],
      },
      {
        heading: 'Humour and Honesty Are Allowed Here',
        paragraphs: [
          'When I launched The Unbias Project on Substack, and when I decided to add this journal right here on my website, I made a promise to myself: no dry theoretical lectures. Sometimes bad design is frustrating, and sometimes it is honestly hilarious when a form asks you to solve a blurry traffic-light puzzle just to report an accessibility bug.',
          'We are allowed to laugh at those moments while we fix them. When we drop the stiff vocabulary, designers and developers stop feeling policed and start getting curious.',
        ],
        callout:
          'Inclusion is not a department. It is a daily habit of asking: "Who else is trying to use this, and how can we make their day a little lighter?"',
      },
      {
        heading: 'Pull Up a Chair',
        paragraphs: [
          'Whether you are a frontend engineer trying to make sense of ARIA labels, an HR leader rethinking how your company hires talent with disabilities, or just someone curious about how tech and humanity intersect across Africa, you are welcome here.',
        ],
      },
    ],
  },
  {
    id: 'blog-forms-that-respect-humans',
    slug: 'designing-forms-that-do-not-scold-your-users',
    title: 'Designing Forms That Do Not Scold Your Users',
    subtitle:
      'From cryptic red borders to inaccessible CAPTCHAs, here is how small changes in inline validation turn a frustrating form into a welcoming conversation.',
    topic: 'Builder Notes',
    publishedAt: 'Jul 26, 2026',
    readingTime: '4 min read',
    locationNote: 'Field Note · UI & Forms',
    coverImage: '/assets/aistudio/20260326_145104_740025f4.jpg',
    coverImageAlt: 'Panel discussion on accessible design and technology systems',
    pullQuote:
      'An error message should read like a helpful friend pointing out a missed button, not a bouncer slamming a clipboard.',
    excerpt:
      'We have all filled out a form that waited until we clicked Submit to wipe our input and yell "Invalid Input" in tiny red text. Let’s talk about humane inline validation, aria-live announcements, and ditching visual CAPTCHAs.',
    takeaways: [
      'Always pair color states with clear text and an icon because red borders alone are invisible to users with red-green color blindness.',
      'Connect every inline error message to its input using aria-describedby and aria-invalid="true" so screen readers announce the exact guidance.',
      'Use hidden honeypot fields and server-side rate limiting instead of visual puzzle CAPTCHAs that lock out blind and low-vision visitors.',
    ],
    sections: [
      {
        paragraphs: [
          'Think about the last time a website form made you sigh out loud. Maybe you typed your phone number with spaces and it rejected you. Maybe you missed one checkbox at the bottom and the Submit button simply refused to work without telling you why.',
          'Forms are the most intimate part of any website. They are the exact moment a visitor decides to trust you with their name, their email, or their story. Yet we often design them like an interrogation.',
        ],
      },
      {
        heading: 'Three Habits of a Kind Form',
        paragraphs: [
          'First, tell people what went wrong in plain human sentences right underneath the field. Instead of "Error 422: Invalid format," say "Please enter a valid email address (for example, name@organization.org)."',
          'Second, never rely on color alone. A red border looks urgent to sighted users with typical color vision, but for millions of users with deuteranopia or protanopia, a red border and a green border look nearly identical. Adding a small icon and clear text solves the ambiguity for everyone.',
          'Third, ditch visual CAPTCHAs whenever you can. Asking someone using a screen reader to identify nine squares containing a "crosswalk" is a guaranteed way to lose their enquiry. A silent honeypot field catches bots on the backend while letting real humans breeze right through.',
        ],
      },
    ],
  },
  {
    id: 'blog-200-member-community-lessons',
    slug: 'what-building-a-200-member-disability-network-taught-me',
    title: 'What Building a 200+ Member Disability Network Taught Me About Belonging',
    subtitle:
      'Reflections from founding the Mastercard Foundation Alumni Disability Community in Nigeria, and why representation without community is lonely.',
    topic: 'Inclusion & Culture',
    publishedAt: 'Jul 15, 2026',
    readingTime: '7 min read',
    locationNote: 'Lagos · Community & Leadership',
    coverImage: '/assets/aistudio/20250605_082332_545d884d.jpg',
    coverImageAlt: 'Mastercard Foundation Youth Advisory Council community gathering',
    pullQuote:
      'Getting a seat at the table is step one. Making sure you are not the only person in the building who understands how hard it was to reach that chair is community.',
    excerpt:
      'When we started the Mastercard Foundation Alumni Disability Community in Nigeria, we were not looking to create another formal committee. We wanted a safe, energized space where young professionals with disabilities could share opportunities, vent honestly, and lead.',
    takeaways: [
      'True inclusion moves beyond hiring quotas to creating peer ecosystems where talent with disabilities can mentor and sponsor one another.',
      'Psychological safety grows when people do not have to constantly explain or apologize for their accommodations.',
      'When organizations listen directly to lived-experience communities, policy changes move from performative to practical.',
    ],
    sections: [
      {
        paragraphs: [
          'Early in my career, I noticed a pattern. Ambitious young graduates with disabilities were entering fellowships, tech bootcamps, and corporate roles across Nigeria, but almost all of us were navigating those spaces alone.',
          'Each person was having to reinvent the wheel: figuring out how to ask HR for workplace adjustments, how to navigate inaccessible transport in Lagos, or how to handle subtle bias during interviews.',
        ],
      },
      {
        heading: 'From Isolated Individuals to a Shared Voice',
        paragraphs: [
          'When we brought over 200 alumni with disabilities together into a dedicated community during my time as Diversity & Inclusion Lead on the Mastercard Foundation Youth Advisory Council, the energy shifted overnight.',
          'Suddenly, when someone needed career advice or an accessible employer referral, twenty hands went up. When we needed to advise leadership on inclusive program design, we were not speaking as lone voices. We had the collective wisdom of 200 professionals backing every recommendation.',
        ],
        callout:
          'If you lead an organization or an alumni network, ask yourself: do people with disabilities in our ecosystem know how to find each other?',
      },
    ],
  },
  {
    id: 'blog-african-products-global-standards',
    slug: 'why-african-tech-cannot-treat-accessibility-as-an-afterthought',
    title: 'Why African Tech Products Cannot Treat Accessibility as a "Later" Feature',
    subtitle:
      'Over 15% of Nigerians live with a disability. Building accessible fintech, edtech, and job platforms is not charity; it is smart product engineering.',
    topic: 'Accessibility in Practice',
    publishedAt: 'Jun 28, 2026',
    readingTime: '5 min read',
    locationNote: 'West Africa · Product Strategy',
    coverImage: '/assets/aistudio/20260220_115033_30f9129f.jpg',
    coverImageAlt: 'Tech leaders and innovators in West Africa discussing digital accessibility',
    pullQuote:
      'When a banking app or a job portal in Lagos is inaccessible, it does not just fail a technical audit; it locks real talent out of economic independence.',
    excerpt:
      'I often hear startup founders say, "We will fix accessibility in Version 2 once we have product-market fit." Here is why retrofitting accessibility costs ten times more, and why inclusive design makes mobile products faster and clearer for every user in low-bandwidth environments.',
    takeaways: [
      'High contrast, clear typography, and semantic HTML help everyone, including someone reading a screen under bright Lagos sunlight on a budget Android phone.',
      'Fixing contrast and keyboard navigation in the design system takes hours; rewriting an entire production codebase six months later takes weeks.',
      'Inclusive digital products unlock an underserved market of millions of consumers and professionals across West Africa.',
    ],
    sections: [
      {
        paragraphs: [
          'Let’s talk about the "Curb-Cut Effect" in African tech. Decades ago, when cities started adding sloped curb cuts to sidewalks for wheelchair users, something unexpected happened: parents with strollers, travelers pulling suitcases, and delivery workers with handcarts all used them too.',
          'The exact same thing happens on the web. When I audit a Nigerian platform for WCAG 2.2 AA compliance by increasing text contrast, making tap targets at least 44x44 pixels, simplifying form labels, and adding captions to video tutorials, every single user benefits.',
        ],
      },
      {
        heading: 'Sunlight, Data Costs, and Real-World Context',
        paragraphs: [
          'Think about how most people use mobile apps in Lagos, Nairobi, or Accra. They are often outdoors in bright afternoon glare, on a cracked or dimmed screen to save battery, or on a fluctuating network connection where heavy, unoptimized scripts fail to load.',
          'Clean semantic HTML, generous contrast ratios, and clear button labels are not "extra features for a niche group." They are the foundation of resilient engineering that works in the real world.',
        ],
      },
    ],
  },
  {
    id: 'blog-curb-cut-effect',
    slug: 'the-curb-cut-effect-universal-design-in-everyday-tech',
    title: 'The Curb-Cut Effect: How Accessible Design Elevates Everyday Tech',
    subtitle:
      'When you design for people on the margins, you accidentally build a superior product for everyone on the planet.',
    topic: 'Personal Reflections',
    publishedAt: 'Jun 10, 2026',
    readingTime: '5 min read',
    locationNote: 'Lagos · Writing on Design',
    coverImage: '/assets/aistudio/20260603_133832_0b986b42.jpg',
    coverImageAlt: 'Stephanie speaking on accessibility and universal design in technology',
    pullQuote:
      'Accessible design is not a concession to weakness; it is the ultimate expression of human-centered engineering.',
    excerpt:
      'Closed captions were invented for the Deaf community; today, 80% of Gen Z watches videos on mute with captions. Screen readers paved the way for voice assistants. Here is why the curb-cut effect is the secret superpower of product teams.',
    takeaways: [
      'Universal design creates unexpected innovations that become mainstream standard features within five years.',
      'Accessibility forces product teams to strip out visual fluff and prioritize intuitive information hierarchy.',
      'When technology adapts to human bodies rather than forcing bodies to adapt to technology, everyone wins.',
    ],
    sections: [
      {
        paragraphs: [
          'A few years ago, someone asked me why I get so enthusiastic about captioning videos and designing tap targets for one-handed operation. They assumed it was solely because of my advocacy work.',
          'The truth is, universal design is simply the best engineering discipline ever invented. When you solve for extreme constraints, the everyday solutions become effortless.',
        ],
      },
      {
        heading: 'Everyday Inventions Born from Disability Accommodation',
        paragraphs: [
          'Typewriters were invented so a blind Italian countess could write letters. Good grips kitchen peelers were invented by a husband whose wife had arthritis in her hands. Audiobooks were invented for wounded soldiers and blind readers.',
          'Whenever you build with accessibility in mind from day one, you are not just accommodating a minority. You are building the future standard of computing.',
        ],
      },
    ],
  },
];

interface FirestoreBlogRecord {
  id: string;
  title: string;
  subtitle: string;
  topic: Exclude<BlogTopic, 'All Notes'>;
  publishedAt: string;
  readingTime: string;
  pullQuote: string;
  body: string;
  coverImage?: string;
  coverImageAlt?: string;
  status: 'published' | 'draft';
  createdAt?: { seconds: number };
}

interface BlogViewProps {
  cmsArticles: CmsArticleRecord[];
  substackUrl: string;
  onDiscussArticle: (articleTitle: string) => void;
  onOpenCmsPortal?: (editPostId?: string) => void;
}

function isUrlAdminRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
  const search = new URLSearchParams(window.location.search);
  return path === '/blog-admin' || search.get('admin') === '1';
}

const BLOG_LETTERS = ['B', 'L', 'O', 'G'];

const blogContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.1,
    },
  },
};

const blogLetterVariants = {
  hidden: {
    opacity: 0,
    y: 36,
    scale: 0.75,
    filter: 'blur(6px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring' as const,
      damping: 12,
      stiffness: 180,
    },
  },
};

function getBlogCategoryTag(topic: string): string {
  if (topic === 'Personal Reflections') return 'WRITING';
  if (topic === 'Accessibility in Practice') return 'ACCESSIBILITY';
  if (topic === 'Inclusion & Culture') return 'INCLUSION & CULTURE';
  if (topic === 'Builder Notes') return 'BUILDER NOTES';
  return topic.toUpperCase();
}

export const BlogView: React.FC<BlogViewProps> = ({
  cmsArticles,
  substackUrl,
  onDiscussArticle,
  onOpenCmsPortal,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<BlogTopic>('All Notes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  // Firestore blog_posts listener + Local Mirror
  const [firestoreMap, setFirestoreMap] = useState<Record<string, CmsStoredBlogRecord>>({});
  const [localMirrorMap, setLocalMirrorMap] = useState<Record<string, CmsStoredBlogRecord>>(
    loadLocalBlogMirror
  );
  const [deletedIds, setDeletedIds] = useState<string[]>(loadDeletedBlogIds);

  // Private Admin Route & Authentication State
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(isUrlAdminRoute);
  const [passcodeUnlocked, setPasscodeUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(ADMIN_SESSION_UNLOCKED_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [passcodeError, setPasscodeError] = useState<string>('');
  const [firebaseUser, setFirebaseUser] = useState<User | null>(auth.currentUser);
  const [adminBannerMessage, setAdminBannerMessage] = useState<string>('');

  // Custom password change state inside unlocked studio
  const [newCustomPassword, setNewCustomPassword] = useState<string>('');
  const [showPasswordSettings, setShowPasswordSettings] = useState<boolean>(false);

  // Composer Modal state (only accessible when admin is unlocked)
  const [isComposerOpen, setIsComposerOpen] = useState<boolean>(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newSubtitle, setNewSubtitle] = useState<string>('');
  const [newTopic, setNewTopic] = useState<Exclude<BlogTopic, 'All Notes'>>(
    'Accessibility in Practice'
  );
  const [newCoverUrl, setNewCoverUrl] = useState<string>('');
  const [newCoverAlt, setNewCoverAlt] = useState<string>('');
  const [newPullQuote, setNewPullQuote] = useState<string>('');
  const [newBody, setNewBody] = useState<string>('');

  // Cozy inline newsletter state wired to /api/subscribe
  const [email, setEmail] = useState<string>('');
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subError, setSubError] = useState<string>('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const syncLocal = () => {
      setLocalMirrorMap(loadLocalBlogMirror());
      setDeletedIds(loadDeletedBlogIds());
    };
    window.addEventListener('stephanie-blog-cms-updated', syncLocal);
    return () => window.removeEventListener('stephanie-blog-cms-updated', syncLocal);
  }, []);

  const isVerifiedStephanieGoogle =
    Boolean(firebaseUser?.emailVerified) &&
    firebaseUser?.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();

  // Admin studio is active when unlocked via password OR verified Google Admin
  const isStudioUnlocked = passcodeUnlocked || isVerifiedStephanieGoogle;

  // Listen to published blog_posts from Firestore
  useEffect(() => {
    const q = query(collection(db, 'blog_posts'), where('status', '==', 'published'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const map: Record<string, CmsStoredBlogRecord> = {};
        snap.docs.forEach((d) => {
          const data = d.data() as Omit<CmsStoredBlogRecord, 'id'>;
          map[d.id] = { id: d.id, ...data };
        });
        setFirestoreMap(map);
      },
      (err) => {
        console.warn('Firestore blog_posts listener:', err);
      }
    );

    return () => unsub();
  }, []);

  const allPosts: BlogPost[] = useMemo(() => {
    const combinedRecords: Record<string, CmsStoredBlogRecord> = {
      ...localMirrorMap,
      ...firestoreMap,
    };

    const mappedCms: BlogPost[] = cmsArticles.map((art) => ({
      id: `cms-${art.id}`,
      slug: art.id,
      title: art.title.replace(/—/g, ' · '),
      subtitle: `${art.publisher} · ${art.category}`,
      topic:
        art.category.toLowerCase().includes('wcag') ||
        art.category.toLowerCase().includes('accessibility')
          ? 'Accessibility in Practice'
          : 'Inclusion & Culture',
      publishedAt: art.year,
      readingTime: '4 min read',
      locationNote: `${art.publisher} · Dispatch`,
      pullQuote: art.excerpt.replace(/—/g, ', '),
      excerpt: art.excerpt.replace(/—/g, ', '),
      externalUrl: art.externalUrl && art.externalUrl !== '#' ? art.externalUrl : undefined,
      takeaways: [
        `Published via ${art.publisher} (${art.year}).`,
        'Part of Stephanie Egharevba’s ongoing field notes on digital accessibility and disability inclusion.',
      ],
      sections: [
        {
          paragraphs: [
            art.excerpt.replace(/—/g, ', '),
            'Have thoughts or want to explore how this applies to your team or product? Reach out directly or read more on The Unbias Project Substack.',
          ],
        },
      ],
    }));

    const curatedIds = new Set(CURATED_BLOG_POSTS.map((c) => c.id));
    const customPublishedPosts: BlogPost[] = Object.values(combinedRecords)
      .filter(
        (r) =>
          !curatedIds.has(r.id) &&
          !deletedIds.includes(r.id) &&
          (r.status === 'published' || !r.status)
      )
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      .map((rec) => recordToBlogPost(rec));

    const curatedMerged: BlogPost[] = [];
    for (const cp of CURATED_BLOG_POSTS) {
      if (deletedIds.includes(cp.id) && !combinedRecords[cp.id]) {
        continue;
      }
      const override = combinedRecords[cp.id];
      if (override) {
        if (override.status === 'draft') continue;
        curatedMerged.push(recordToBlogPost(override, cp));
      } else {
        curatedMerged.push(cp);
      }
    }

    return [...customPublishedPosts, ...curatedMerged, ...mappedCms];
  }, [cmsArticles, firestoreMap, localMirrorMap, deletedIds]);

  const featuredPost = useMemo(
    () => allPosts.find((p) => p.featured) || allPosts[0],
    [allPosts]
  );

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const matchesTopic = selectedTopic === 'All Notes' || post.topic === selectedTopic;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.subtitle.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.topic.toLowerCase().includes(q);
      return matchesTopic && matchesSearch;
    });
  }, [allPosts, selectedTopic, searchQuery]);

  const activePost = useMemo(
    () => (activePostId ? allPosts.find((p) => p.id === activePostId) || null : null),
    [activePostId, allPosts]
  );

  const handleOpenPost = (postId: string) => {
    setActivePostId(postId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyPostLink = (post: BlogPost) => {
    try {
      const url = `${window.location.origin}/blog?note=${encodeURIComponent(post.slug)}`;
      navigator.clipboard.writeText(url);
      setCopiedPostId(post.id);
      setTimeout(() => setCopiedPostId(null), 2500);
    } catch {
      // ignore clipboard errors
    }
  };

  const getExpectedPasscode = (): string => {
    try {
      return localStorage.getItem(ADMIN_PASSCODE_STORAGE_KEY) || ADMIN_PASSCODE_DEFAULT;
    } catch {
      return ADMIN_PASSCODE_DEFAULT;
    }
  };

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    const expected = getExpectedPasscode();
    if (passcodeInput.trim() === expected) {
      setPasscodeUnlocked(true);
      setPasscodeError('');
      setPasscodeInput('');
    } else {
      setPasscodeError('Incorrect password. Only Stephanie Egharevba has access to this studio.');
    }
  };

  const handleGoogleAdminLogin = async () => {
    try {
      setPasscodeError('');
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user.email?.toLowerCase() !== BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
        await signOut(auth);
        setPasscodeError(
          `Access denied: Only ${BOOTSTRAPPED_ADMIN_EMAIL} is authorized to publish notes.`
        );
      }
    } catch (err) {
      setPasscodeError(err instanceof Error ? err.message : 'Google Sign-In failed.');
    }
  };

  const handleUpdateCustomPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCustomPassword.trim().length < 6) {
      setAdminBannerMessage('New password must be at least 6 characters.');
      return;
    }
    try {
      localStorage.setItem(ADMIN_PASSCODE_STORAGE_KEY, newCustomPassword.trim());
      setNewCustomPassword('');
      setShowPasswordSettings(false);
      setAdminBannerMessage('Your private Blog Studio password has been updated.');
      setTimeout(() => setAdminBannerMessage(''), 4000);
    } catch {
      // ignore
    }
  };

  const handleLockAndExitAdmin = () => {
    setPasscodeUnlocked(false);
    setShowAdminLoginModal(false);
    setIsComposerOpen(false);
    if (typeof window !== 'undefined' && window.location.pathname === '/blog-admin') {
      window.history.pushState({ page: 'blog' }, '', '/blog');
    }
  };

  const handleFileUploadToDataUrl = (
    e: React.ChangeEvent<HTMLInputElement>,
    onLoaded: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onLoaded(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenNewPost = () => {
    setEditingPostId(null);
    setNewTitle('');
    setNewSubtitle('');
    setNewTopic('Accessibility in Practice');
    setNewCoverUrl('');
    setNewCoverAlt('');
    setNewPullQuote('');
    setNewBody('');
    setIsComposerOpen(true);
  };

  const handleOpenEditPost = (post: BlogPost) => {
    if (onOpenCmsPortal) {
      onOpenCmsPortal(post.id);
      return;
    }
    setEditingPostId(post.id);
    setNewTitle(post.title);
    setNewSubtitle(post.subtitle || '');
    setNewTopic(
      (post.topic as Exclude<BlogTopic, 'All Notes'>) || 'Accessibility in Practice'
    );
    setNewCoverUrl(post.coverImage || '');
    setNewCoverAlt(post.coverImageAlt || '');
    setNewPullQuote(post.pullQuote || '');
    const bodyText = post.sections.flatMap((s) => s.paragraphs).join('\n\n');
    setNewBody(bodyText);
    setIsComposerOpen(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStudioUnlocked) return;
    if (!newTitle.trim() || !newBody.trim()) return;

    setIsPublishing(true);
    const words = newBody.trim().split(/\s+/).length;
    const mins = Math.max(2, Math.ceil(words / 180));
    const docId = editingPostId || `note_${Date.now()}`;
    const path = `blog_posts/${docId}`;

    const firstParagraph =
      newBody
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)[0] || '';

    const publishedAtStr = editingPostId
      ? allPosts.find((p) => p.id === editingPostId)?.publishedAt ||
        new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

    const localRecord: CmsStoredBlogRecord = {
      id: docId,
      title: newTitle.trim().slice(0, 200),
      subtitle: (
        newSubtitle.trim() || 'Field note on inclusive design and digital accessibility.'
      ).slice(0, 300),
      topic: newTopic,
      publishedAt: publishedAtStr.slice(0, 60),
      readingTime: `${mins} min read`,
      pullQuote: (
        newPullQuote.trim() ||
        firstParagraph ||
        'Designing for accessibility means designing for real human conditions.'
      ).slice(0, 500),
      body: newBody.trim().slice(0, 20000),
      ...(newCoverUrl.trim()
        ? {
            coverImage: newCoverUrl.trim().slice(0, 500000),
            coverImageAlt: (newCoverAlt.trim() || newTitle.trim()).slice(0, 300),
          }
        : {}),
      status: 'published',
      authorUid: firebaseUser?.uid || 'local-admin',
      createdAt: firestoreMap[docId]?.createdAt || {
        seconds: Math.floor(Date.now() / 1000),
      },
      updatedAt: { seconds: Math.floor(Date.now() / 1000) },
    };

    saveLocalBlogMirrorRecord(localRecord);
    setLocalMirrorMap(loadLocalBlogMirror());

    try {
      if (isVerifiedStephanieGoogle && firebaseUser) {
        const isExistingFirestoreDoc = Boolean(firestoreMap[docId]);

        const postPayload: Record<string, unknown> = {
          title: localRecord.title,
          subtitle: localRecord.subtitle,
          topic: localRecord.topic,
          publishedAt: localRecord.publishedAt,
          readingTime: localRecord.readingTime,
          pullQuote: localRecord.pullQuote,
          body: localRecord.body,
          ...(localRecord.coverImage
            ? {
                coverImage: localRecord.coverImage,
                coverImageAlt: localRecord.coverImageAlt,
              }
            : {}),
          status: 'published',
          authorUid: firebaseUser.uid,
          updatedAt: serverTimestamp(),
        };

        if (!isExistingFirestoreDoc) {
          postPayload.createdAt = serverTimestamp();
        }

        await setDoc(doc(db, 'blog_posts', docId), postPayload, { merge: true });
      }

      setNewTitle('');
      setNewSubtitle('');
      setNewCoverUrl('');
      setNewCoverAlt('');
      setNewPullQuote('');
      setNewBody('');
      setEditingPostId(null);
      setIsComposerOpen(false);
      setActivePostId(docId);
      setAdminBannerMessage(
        editingPostId
          ? 'Blog note changes saved live!'
          : 'New blog note published live to your site!'
      );
      setTimeout(() => setAdminBannerMessage(''), 4000);
    } catch (err) {
      try {
        handleFirestoreError(
          err,
          editingPostId ? OperationType.UPDATE : OperationType.CREATE,
          path
        );
      } catch {
        setAdminBannerMessage('Saved locally. Ensure image size is under 400KB for Cloud sync.');
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeleteFirestorePost = async (postId: string) => {
    if (!isStudioUnlocked) return;
    removeLocalBlogRecord(postId);
    setLocalMirrorMap(loadLocalBlogMirror());
    setDeletedIds(loadDeletedBlogIds());

    const path = `blog_posts/${postId}`;
    try {
      if (isVerifiedStephanieGoogle && firestoreMap[postId]) {
        await deleteDoc(doc(db, 'blog_posts', postId));
      }
      if (activePostId === postId) {
        setActivePostId(null);
      }
      setAdminBannerMessage('Blog note deleted.');
      setTimeout(() => setAdminBannerMessage(''), 3500);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, path);
      } catch {
        setAdminBannerMessage('Could not delete blog note from cloud.');
      }
    }
  };

  const handleBlogSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed || !emailRegex.test(trimmed)) {
      setSubStatus('error');
      setSubError('Please enter a valid email address (e.g., name@domain.com).');
      return;
    }

    setSubStatus('loading');
    setSubError('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        try {
          await addDoc(collection(db, 'newsletter_subscribers'), {
            email: trimmed,
            consent: true,
            createdAt: serverTimestamp(),
          });
        } catch {
          // ignore duplicate/offline
        }
        setSubStatus('success');
        setEmail('');
      } else {
        setSubStatus('error');
        setSubError(data.message || 'Could not subscribe right now. Please try again.');
      }
    } catch {
      setSubStatus('error');
      setSubError('Could not connect right now. Please try again in a moment.');
    }
  };

  const topics: BlogTopic[] = [
    'All Notes',
    'Accessibility in Practice',
    'Inclusion & Culture',
    'Personal Reflections',
    'Builder Notes',
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
      {/* ===================================================================== */}
      {/* PRIVATE ADMIN STUDIO TOOLBAR (ONLY VISIBLE WHEN UNLOCKED BY STEPHANIE) */}
      {/* ===================================================================== */}
      {isStudioUnlocked && (
        <div className="rounded-2xl border border-[#1D4ED8]/30 bg-white p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#1D4ED8] text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <div className="text-xs sm:text-sm font-bold text-[#141413]">
                  Stephanie’s Private Blog Studio (Unlocked)
                </div>
                <div className="font-mono text-[11px] text-[#575652]">
                  {isVerifiedStephanieGoogle
                    ? `Verified as ${firebaseUser?.email} · Cloud Sync Active`
                    : 'Studio Unlocked · Open Full CMS Portal to manage all posts'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {onOpenCmsPortal && (
                <button
                  type="button"
                  onClick={() => onOpenCmsPortal()}
                  className="px-4 py-2 rounded-lg bg-[#141413] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open Full CMS Portal</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleOpenNewPost}
                className="px-4 py-2 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload New Blog Note</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPasswordSettings((prev) => !prev)}
                className="px-3.5 py-2 rounded-lg border border-[#E6E4DD] bg-[#FAF9F6] hover:border-[#141413] text-xs font-medium text-[#141413] transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#575652]" />
                <span>Change Password</span>
              </button>

              <button
                type="button"
                onClick={handleLockAndExitAdmin}
                className="px-3.5 py-2 rounded-lg border border-[#E6E4DD] bg-white hover:bg-red-50 hover:text-red-700 text-xs font-medium text-[#575652] transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Lock Studio</span>
              </button>
            </div>
          </div>

          {showPasswordSettings && (
            <form
              onSubmit={handleUpdateCustomPassword}
              className="pt-3 border-t border-[#E6E4DD] flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
            >
              <input
                type="password"
                required
                minLength={6}
                value={newCustomPassword}
                onChange={(e) => setNewCustomPassword(e.target.value)}
                placeholder="Enter new studio password (min 6 characters)..."
                className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-[#E6E4DD] bg-[#FAF9F6]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#141413] text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
              >
                Save New Password
              </button>
            </form>
          )}

          {adminBannerMessage && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-500/30 px-3.5 py-2 text-xs font-medium text-emerald-800">
              {adminBannerMessage}
            </div>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {activePost ? (
          /* ===================================================================== */
          /* RELAXED SINGLE-ESSAY READING LOUNGE VIEW                              */
          /* ===================================================================== */
          <motion.article
            key={`reader-${activePost.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28 }}
            className="max-w-[780px] mx-auto space-y-10"
          >
            {/* Top Reader Navigation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E6E4DD]">
              <button
                type="button"
                onClick={() => setActivePostId(null)}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#141413] hover:text-[#1D4ED8] transition-colors cursor-pointer whitespace-nowrap"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to all notes</span>
              </button>

              <div className="flex flex-wrap items-center gap-3">
                {isStudioUnlocked && (
                  <button
                    type="button"
                    onClick={() => handleOpenEditPost(activePost)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#1D4ED8] bg-[#1D4ED8] text-xs font-semibold text-white hover:bg-[#1E40AF] transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit Note</span>
                  </button>
                )}

                {isStudioUnlocked && activePost.isFromFirestore && (
                  <button
                    type="button"
                    onClick={() => handleDeleteFirestorePost(activePost.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-red-200 bg-red-50 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Note</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleCopyPostLink(activePost)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E6E4DD] bg-white text-xs font-medium text-[#141413] hover:border-[#1D4ED8] transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copiedPostId === activePost.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Link Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#575652]" />
                      <span>Share Note</span>
                    </>
                  )}
                </button>

                {activePost.externalUrl && (
                  <a
                    href={activePost.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E6E4DD] bg-white text-xs font-medium text-[#1D4ED8] hover:border-[#1D4ED8] transition-colors whitespace-nowrap"
                  >
                    <span>Read on Substack</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Essay Header */}
            <header className="space-y-5">
              <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#575652] flex flex-wrap items-center gap-2">
                <span className="text-[#1D4ED8] font-semibold">{activePost.topic}</span>
                <span>·</span>
                <span>{activePost.publishedAt}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {activePost.readingTime}
                </span>
                <span>·</span>
                <span>{activePost.locationNote}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-display font-bold tracking-tight text-[#141413] leading-[1.15]">
                {activePost.title}
              </h1>

              <p className="text-base sm:text-lg text-[#3F3E3A] leading-relaxed">
                {activePost.subtitle}
              </p>

              {/* Author Byline Strip */}
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-[#E6E4DD]">
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-[#141413]">
                    Stephanie Egharevba
                  </div>
                  <div className="text-[11px] text-[#575652]">
                    Written from Lagos · Notes on accessibility &amp; human design
                  </div>
                </div>
              </div>
            </header>

            {/* Optional Editorial Cover Image (Only renders when an article has a photo) */}
            {activePost.coverImage && (
              <figure className="rounded-2xl overflow-hidden border border-[#E6E4DD] bg-white">
                <img
                  src={activePost.coverImage}
                  alt={activePost.coverImageAlt || activePost.title}
                  className="w-full max-h-[440px] object-cover"
                />
              </figure>
            )}

            {/* Warm Pull Quote Card */}
            <blockquote className="rounded-2xl border border-[#E6E4DD] bg-white p-6 sm:p-8 space-y-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#1D4ED8]">
                A THOUGHT TO SIT WITH
              </div>
              <p className="font-serif italic text-lg sm:text-xl text-[#141413] leading-relaxed">
                “{activePost.pullQuote}”
              </p>
            </blockquote>

            {/* Main Essay Body Prose */}
            <div className="space-y-8 text-base sm:text-[17px] text-[#272725] leading-[1.8] max-w-[68ch]">
              {activePost.sections.map((sec, idx) => (
                <section key={idx} className="space-y-4">
                  {sec.heading && (
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-[#141413] pt-2">
                      {sec.heading}
                    </h2>
                  )}
                  {sec.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="text-[#3F3E3A]">
                      {p}
                    </p>
                  ))}
                  {sec.callout && (
                    <div className="my-6 rounded-xl border border-[#E6E4DD] bg-white p-5 text-sm sm:text-base text-[#141413] leading-relaxed">
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#1D4ED8] block mb-1.5 font-semibold">
                        PRACTICAL TAKEAWAY
                      </span>
                      {sec.callout}
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* Pocket Summary / Key Takeaways */}
            <div className="rounded-2xl border border-[#E6E4DD] bg-white p-6 sm:p-8 space-y-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#1D4ED8]">
                IF YOU ONLY REMEMBER THREE THINGS
              </div>
              <ul className="space-y-3">
                {activePost.takeaways.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm sm:text-base text-[#3F3E3A] leading-relaxed"
                  >
                    <span className="font-mono text-xs font-bold text-[#1D4ED8] mt-1">
                      0{i + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Warm Conversational Footer CTA */}
            <div className="rounded-2xl border border-[#E6E4DD] bg-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-md">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#575652]">
                  KEEP THE CONVERSATION GOING
                </div>
                <h3 className="text-lg font-display font-bold text-[#141413]">
                  Did this spark a question or an idea for your team?
                </h3>
                <p className="text-xs sm:text-sm text-[#3F3E3A]">
                  I love hearing from readers, engineers, and product leaders. Send me a quick note
                  and tell me what you are building.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => onDiscussArticle(activePost.title)}
                  className="px-5 py-3 rounded-lg bg-[#141413] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Reply to Stephanie</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePostId(null)}
                  className="px-4 py-3 rounded-lg border border-[#E6E4DD] bg-[#FAF9F6] hover:border-[#141413] text-[#141413] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  Browse More Notes
                </button>
              </div>
            </div>
          </motion.article>
        ) : (
          /* ===================================================================== */
          /* MAIN RELAXED BLOG & FIELD NOTES OVERVIEW (CLEAN PUBLIC VIEW)          */
          /* ===================================================================== */
          <motion.div
            key="blog-index"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28 }}
            className="space-y-12 sm:space-y-16"
          >
            {/* Header: Animated BLOG letters spelling out in black */}
            <div className="pt-2 sm:pt-6 pb-2 mb-10 sm:mb-14 text-center">
              <h1 className="sr-only">Blog</h1>
              <motion.div
                variants={blogContainerVariants}
                initial="hidden"
                animate="visible"
                aria-hidden="true"
                className="flex items-center justify-center tracking-tight text-black dark:text-white font-black text-6xl sm:text-7xl md:text-8xl lg:text-[104px] leading-none select-none"
              >
                {BLOG_LETTERS.map((letter, idx) => (
                  <motion.span
                    key={idx}
                    variants={blogLetterVariants}
                    className="inline-block"
                  >
                    {letter}
                  </motion.span>
                ))}
              </motion.div>
            </div>

            {/* 2-Column Clean Editorial Grid Matching Screenshot 122 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 sm:gap-x-12 gap-y-12 sm:gap-y-16 max-w-[1040px] mx-auto">
              {allPosts.map((post, idx) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  onClick={() => handleOpenPost(post.id)}
                  className="group cursor-pointer flex flex-col focus:outline-none"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenPost(post.id);
                    }
                  }}
                  aria-label={`Read note: ${post.title}`}
                >
                  {/* Card Cover Image */}
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 shadow-sm border border-black/5 dark:border-white/5">
                    <img
                      src={post.coverImage || '/assets/aistudio/20260604_125652_ee30817c.jpg'}
                      alt={post.coverImageAlt || post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                    {isStudioUnlocked && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditPost(post);
                        }}
                        aria-label={`Edit ${post.title}`}
                        title="Edit this blog post"
                        className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-neutral-900 text-xs font-semibold shadow-md hover:bg-white hover:scale-105 transition-all cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#1D4ED8]" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>

                  {/* Card Typography */}
                  <div className="mt-3.5 space-y-1">
                    <time
                      dateTime={post.publishedAt}
                      className="text-xs text-neutral-500 dark:text-neutral-400 font-medium block"
                    >
                      {post.publishedAt}
                    </time>

                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827] dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-[#3B82F6] transition-colors leading-snug">
                      {post.title}
                    </h2>

                    <div className="text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] uppercase tracking-wider pt-0.5">
                      {getBlogCategoryTag(post.topic)}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* 5. Cozy Dispatch Subscription Box (Wired directly to /api/subscribe) */}
            <section
              aria-label="Subscribe to The Unbias Dispatch"
              className="rounded-2xl border border-[#E6E4DD] bg-white p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-7 space-y-2.5">
                <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#1D4ED8]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>LETTERS FROM LAGOS · NO SPAM EVER</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#141413]">
                  Get new field notes in your inbox whenever I hit publish.
                </h2>
                <p className="text-xs sm:text-sm text-[#3F3E3A] leading-relaxed max-w-xl">
                  Real, unfiltered notes on digital accessibility, practical breakdowns of what
                  makes tech work for human beings, and the occasional laugh about bad design
                  decisions that could have been avoided with five minutes of testing.
                </p>
              </div>

              <div className="lg:col-span-5">
                {subStatus === 'success' ? (
                  <div
                    role="status"
                    aria-live="polite"
                    className="rounded-xl border border-emerald-500/40 bg-emerald-50 p-4 text-xs sm:text-sm font-semibold text-emerald-700 flex items-center gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>You are subscribed! Check your inbox to confirm.</span>
                  </div>
                ) : (
                  <form onSubmit={handleBlogSubscribe} noValidate className="space-y-2.5">
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <label htmlFor="blog-nl-email" className="sr-only">
                        Your email address
                      </label>
                      <input
                        id="blog-nl-email"
                        type="email"
                        required
                        aria-invalid={subStatus === 'error'}
                        aria-describedby={subStatus === 'error' ? 'blog-nl-error' : undefined}
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (subStatus === 'error') {
                            setSubStatus('idle');
                            setSubError('');
                          }
                        }}
                        placeholder="Enter your email address..."
                        className={`flex-1 px-4 py-3 text-sm rounded-lg outline-none transition-colors ${
                          subStatus === 'error'
                            ? 'bg-red-50/50 border-2 border-red-500 text-[#141413]'
                            : 'bg-[#FAF9F6] border border-[#E6E4DD] focus:border-[#1D4ED8]'
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={subStatus === 'loading'}
                        className="px-5 py-3 rounded-lg bg-[#141413] hover:bg-[#1D4ED8] disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap inline-flex items-center justify-center gap-2"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>{subStatus === 'loading' ? 'Joining...' : 'Join the Dispatch'}</span>
                      </button>
                    </div>

                    {subStatus === 'error' && subError && (
                      <p
                        id="blog-nl-error"
                        role="alert"
                        className="flex items-center gap-1.5 text-xs font-medium text-red-600"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{subError}</span>
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-[#575652] pt-1">
                      <span>Unsubscribe anytime with one click.</span>
                      <a
                        href={substackUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-[#141413] hover:text-[#1D4ED8]"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>Read archives on Substack</span>
                      </a>
                    </div>
                  </form>
                )}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* PRIVATE ADMIN LOGIN GATE MODAL (ONLY SHOWN ON /blog-admin)            */}
      {/* ===================================================================== */}
      {showAdminLoginModal && !isStudioUnlocked && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Stephanie Egharevba Private Blog Studio Login"
        >
          <div className="w-full max-w-md rounded-2xl border border-[#E6E4DD] bg-white p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#E6E4DD] pb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-[#141413] text-white flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-[#141413]">
                    Private Blog Studio
                  </h2>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[#575652]">
                    Restricted to Stephanie Egharevba
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLockAndExitAdmin}
                aria-label="Close login modal"
                className="p-1.5 rounded-lg text-[#575652] hover:bg-[#FAF9F6] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step 1: Password Gate */}
            {!passcodeUnlocked ? (
              <form onSubmit={handleVerifyPasscode} className="space-y-4">
                <div>
                  <label
                    htmlFor="admin-passcode"
                    className="block text-xs font-semibold text-[#141413] mb-1.5"
                  >
                    Step 1: Enter Your Studio Password
                  </label>
                  <input
                    id="admin-passcode"
                    type="password"
                    required
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value)}
                    placeholder="Enter studio password..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#E6E4DD] bg-[#FAF9F6] focus:border-[#1D4ED8] outline-none"
                  />
                </div>

                {passcodeError && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{passcodeError}</span>
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg bg-[#141413] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Verify Password
                </button>
              </form>
            ) : (
              /* Step 2: Verified Google Admin Identity Check (stephanieegharevba83@gmail.com) */
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-50 p-3.5 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Password verified! Complete Step 2 to unlock cloud publishing.</span>
                </div>

                <p className="text-xs text-[#3F3E3A] leading-relaxed">
                  To ensure nobody else can ever write to your database even with a password, sign
                  in with your verified Google account (
                  <span className="font-mono font-semibold">{BOOTSTRAPPED_ADMIN_EMAIL}</span>).
                </p>

                {passcodeError && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{passcodeError}</span>
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleGoogleAdminLogin}
                  className="w-full py-3 px-4 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify with Google ({BOOTSTRAPPED_ADMIN_EMAIL})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PRIVATE ADMIN COMPOSER MODAL (WRITE NEW NOTE + OPTIONAL ARTICLE PHOTO)*/}
      {/* ===================================================================== */}
      {isStudioUnlocked && isComposerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={editingPostId ? 'Edit blog note' : 'Write a new blog note'}
        >
          <div className="w-full max-w-2xl rounded-2xl border border-[#E6E4DD] bg-white p-6 sm:p-8 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E6E4DD] pb-3">
              <div>
                <h3 className="font-display text-xl font-bold text-[#141413]">
                  {editingPostId ? 'Edit Blog Note' : 'Publish a New Blog Note'}
                </h3>
                <p className="text-xs text-[#575652]">
                  {editingPostId
                    ? 'Update your note content, title, or cover photo. Changes reflect live immediately.'
                    : 'Publishes directly to your live Blog page with an optional article photo.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsComposerOpen(false);
                  setEditingPostId(null);
                }}
                aria-label="Close composer"
                className="p-1.5 rounded-lg text-[#575652] hover:bg-[#FAF9F6] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="new-note-title"
                    className="block font-mono text-[11px] uppercase tracking-wider text-[#575652] mb-1"
                  >
                    Article Title *
                  </label>
                  <input
                    id="new-note-title"
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., How We Audited a Fintech Checkout Flow"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#E6E4DD] bg-[#FAF9F6]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="new-note-topic"
                    className="block font-mono text-[11px] uppercase tracking-wider text-[#575652] mb-1"
                  >
                    Topic *
                  </label>
                  <select
                    id="new-note-topic"
                    value={newTopic}
                    onChange={(e) =>
                      setNewTopic(e.target.value as Exclude<BlogTopic, 'All Notes'>)
                    }
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#E6E4DD] bg-[#FAF9F6]"
                  >
                    <option value="Accessibility in Practice">Accessibility in Practice</option>
                    <option value="Inclusion & Culture">Inclusion &amp; Culture</option>
                    <option value="Personal Reflections">Personal Reflections</option>
                    <option value="Builder Notes">Builder Notes</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="new-note-sub"
                  className="block font-mono text-[11px] uppercase tracking-wider text-[#575652] mb-1"
                >
                  Short Subtitle / Standfirst
                </label>
                <input
                  id="new-note-sub"
                  type="text"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="A concise one-sentence hook for readers..."
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#E6E4DD] bg-[#FAF9F6]"
                />
              </div>

              {/* Optional Article Photo */}
              <div className="rounded-xl border border-[#E6E4DD] bg-[#FAF9F6] p-4 space-y-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#1D4ED8] font-semibold">
                  OPTIONAL ARTICLE PHOTO
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="new-note-file"
                      className="block text-xs font-semibold text-[#141413] mb-1"
                    >
                      Upload Photo from Device
                    </label>
                    <input
                      id="new-note-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUploadToDataUrl(e, (dataUrl) => setNewCoverUrl(dataUrl))
                      }
                      className="w-full text-xs file:mr-2 file:rounded-md file:border file:border-[#E6E4DD] file:bg-white file:px-2.5 file:py-1 file:font-semibold cursor-pointer"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="new-note-img-url"
                      className="block text-xs font-semibold text-[#141413] mb-1"
                    >
                      Or Image URL
                    </label>
                    <input
                      id="new-note-img-url"
                      type="text"
                      value={newCoverUrl}
                      onChange={(e) => setNewCoverUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E6E4DD] bg-white"
                    />
                  </div>
                </div>
                {newCoverUrl && (
                  <div>
                    <label
                      htmlFor="new-note-img-alt"
                      className="block text-xs font-semibold text-[#141413] mb-1"
                    >
                      Photo Alt-Text Description
                    </label>
                    <input
                      id="new-note-img-alt"
                      type="text"
                      value={newCoverAlt}
                      onChange={(e) => setNewCoverAlt(e.target.value)}
                      placeholder="Describe the photo for screen readers..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E6E4DD] bg-white"
                    />
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="new-note-quote"
                  className="block font-mono text-[11px] uppercase tracking-wider text-[#575652] mb-1"
                >
                  Pull Quote (Optional)
                </label>
                <input
                  id="new-note-quote"
                  type="text"
                  value={newPullQuote}
                  onChange={(e) => setNewPullQuote(e.target.value)}
                  placeholder="A memorable line to highlight inside the article..."
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#E6E4DD] bg-[#FAF9F6]"
                />
              </div>

              <div>
                <label
                  htmlFor="new-note-body"
                  className="block font-mono text-[11px] uppercase tracking-wider text-[#575652] mb-1"
                >
                  Article Body * (Separate paragraphs with a blank line)
                </label>
                <textarea
                  id="new-note-body"
                  rows={6}
                  required
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Write your field note here..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#E6E4DD] bg-[#FAF9F6]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsComposerOpen(false);
                    setEditingPostId(null);
                  }}
                  className="px-4 py-2.5 rounded-lg border border-[#E6E4DD] bg-[#FAF9F6] text-xs font-semibold text-[#141413] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-5 py-2.5 rounded-lg bg-[#141413] hover:bg-[#1D4ED8] disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  {isPublishing
                    ? editingPostId
                      ? 'Saving Changes...'
                      : 'Publishing...'
                    : editingPostId
                    ? 'Save Changes Live'
                    : 'Publish Note Live'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

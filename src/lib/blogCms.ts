import { BlogPost, BlogTopic } from '../components/BlogView';

export interface CmsStoredBlogRecord {
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
  authorUid?: string;
  createdAt?: { seconds: number };
  updatedAt?: { seconds: number };
}

export const BLOG_LOCAL_MIRROR_KEY = 'stephanie_cms_blog_mirror_v2';
export const BLOG_DELETED_IDS_KEY = 'stephanie_cms_blog_deleted_v2';
export const ADMIN_SESSION_UNLOCKED_KEY = 'stephanie_cms_unlocked_session_v1';

export const PRESET_EDITORIAL_PHOTOS: { label: string; url: string; alt: string }[] = [
  {
    label: 'Lagos Workshop Session',
    url: '/assets/aistudio/20260604_125652_ee30817c.jpg',
    alt: 'Stephanie facilitating an interactive accessibility workshop in Lagos',
  },
  {
    label: 'Executive Portrait (Warm Studio)',
    url: '/assets/aistudio/Headshot_3_ab4f5e1e.jpg',
    alt: 'Stephanie Egharevba portrait',
  },
  {
    label: 'Panel Discussion on Tech Systems',
    url: '/assets/aistudio/20260326_145104_740025f4.jpg',
    alt: 'Panel discussion on accessible design and technology systems',
  },
  {
    label: 'Mastercard Foundation Council Gathering',
    url: '/assets/aistudio/20250605_082332_545d884d.jpg',
    alt: 'Mastercard Foundation Youth Advisory Council community gathering',
  },
  {
    label: 'West Africa Tech Leaders Forum',
    url: '/assets/aistudio/20260220_115033_30f9129f.jpg',
    alt: 'Tech leaders and innovators in West Africa discussing digital accessibility',
  },
  {
    label: 'Keynote on Universal Design',
    url: '/assets/aistudio/20260603_133832_0b986b42.jpg',
    alt: 'Stephanie speaking on accessibility and universal design in technology',
  },
];

/**
 * Serializes sections (with headings & callouts) + takeaways + locationNote into a clean
 * markdown-formatted body string that fits inside Firestore's validated `body` string field.
 */
export function serializePostStructureToBody(params: {
  rawMarkdownBody: string;
  takeaways: string[];
  locationNote?: string;
}): string {
  const cleanBody = params.rawMarkdownBody.trim();
  const cleanTakeaways = params.takeaways.map((t) => t.trim()).filter(Boolean);
  const metaLines: string[] = [];

  if (params.locationNote && params.locationNote.trim()) {
    metaLines.push(`@location: ${params.locationNote.trim()}`);
  }
  if (cleanTakeaways.length > 0) {
    for (const item of cleanTakeaways) {
      metaLines.push(`@takeaway: ${item}`);
    }
  }

  if (metaLines.length === 0) {
    return cleanBody.slice(0, 19800);
  }

  return `${cleanBody}\n\n---CMS_META---\n${metaLines.join('\n')}`.slice(0, 19950);
}

/**
 * Converts a BlogPost's sections into editable Markdown text for the CMS composer
 * (preserving ## headings and > callouts).
 */
export function sectionsToEditableMarkdown(
  sections: { heading?: string; paragraphs: string[]; callout?: string }[]
): string {
  const blocks: string[] = [];
  for (const sec of sections) {
    if (sec.heading && sec.heading.trim()) {
      blocks.push(`## ${sec.heading.trim()}`);
    }
    for (const p of sec.paragraphs) {
      if (p.trim()) {
        blocks.push(p.trim());
      }
    }
    if (sec.callout && sec.callout.trim()) {
      blocks.push(`> ${sec.callout.trim()}`);
    }
  }
  return blocks.join('\n\n');
}

/**
 * Parses a Firestore/CMS `body` string back into structured sections, takeaways, and locationNote.
 */
export function parseBodyToStructuredPost(
  body: string,
  fallbackLocationNote = 'Lagos · Dispatch Note',
  fallbackTakeaways: string[] = [
    'Published via Stephanie Egharevba’s Unbias Dispatch.',
    'Practical field notes on digital accessibility and inclusive systems.',
  ]
): {
  editableMarkdown: string;
  locationNote: string;
  takeaways: string[];
  sections: { heading?: string; paragraphs: string[]; callout?: string }[];
  excerpt: string;
} {
  const [contentPart, metaPart] = body.split(/\n*---CMS_META---\n*/);
  let locationNote = fallbackLocationNote;
  const parsedTakeaways: string[] = [];

  if (metaPart) {
    const lines = metaPart.split('\n').map((l) => l.trim());
    for (const line of lines) {
      if (line.startsWith('@location:')) {
        const loc = line.replace('@location:', '').trim();
        if (loc) locationNote = loc;
      } else if (line.startsWith('@takeaway:')) {
        const t = line.replace('@takeaway:', '').trim();
        if (t) parsedTakeaways.push(t);
      }
    }
  }

  const rawBlocks = (contentPart || '')
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const sections: { heading?: string; paragraphs: string[]; callout?: string }[] = [];
  let currentSection: { heading?: string; paragraphs: string[]; callout?: string } = {
    paragraphs: [],
  };

  for (const block of rawBlocks) {
    if (block.startsWith('## ')) {
      if (
        currentSection.heading ||
        currentSection.paragraphs.length > 0 ||
        currentSection.callout
      ) {
        sections.push(currentSection);
      }
      currentSection = {
        heading: block.replace(/^##\s+/, '').trim(),
        paragraphs: [],
      };
    } else if (block.startsWith('> ')) {
      currentSection.callout = block.replace(/^>\s+/, '').trim();
    } else {
      currentSection.paragraphs.push(block);
    }
  }

  if (
    currentSection.heading ||
    currentSection.paragraphs.length > 0 ||
    currentSection.callout
  ) {
    sections.push(currentSection);
  }

  if (sections.length === 0) {
    sections.push({ paragraphs: [contentPart.trim() || ''] });
  }

  const firstParagraph =
    sections.flatMap((s) => s.paragraphs).find((p) => p.length > 0) || '';

  return {
    editableMarkdown: (contentPart || '').trim(),
    locationNote,
    takeaways: parsedTakeaways.length > 0 ? parsedTakeaways : fallbackTakeaways,
    sections,
    excerpt: firstParagraph,
  };
}

/**
 * Converts a CmsStoredBlogRecord into a displayable BlogPost.
 */
export function recordToBlogPost(
  record: CmsStoredBlogRecord,
  curatedMatch?: BlogPost
): BlogPost & { status?: 'published' | 'draft' } {
  const parsed = parseBodyToStructuredPost(
    record.body,
    curatedMatch?.locationNote || 'Lagos · Dispatch Note',
    curatedMatch?.takeaways || [
      'Published via Stephanie Egharevba’s Unbias Dispatch.',
      'Practical field notes on digital accessibility and inclusive systems.',
    ]
  );

  return {
    id: record.id,
    slug: curatedMatch?.slug || record.id,
    title: record.title,
    subtitle: record.subtitle,
    topic: record.topic,
    publishedAt: record.publishedAt,
    readingTime: record.readingTime,
    locationNote: parsed.locationNote,
    featured: curatedMatch?.featured,
    ...(record.coverImage
      ? {
          coverImage: record.coverImage,
          coverImageAlt: record.coverImageAlt || record.title,
        }
      : {}),
    pullQuote: record.pullQuote,
    excerpt: parsed.excerpt || record.subtitle,
    externalUrl: curatedMatch?.externalUrl,
    isFromFirestore: true,
    takeaways: parsed.takeaways,
    sections: parsed.sections,
    status: record.status,
  };
}

export function loadLocalBlogMirror(): Record<string, CmsStoredBlogRecord> {
  try {
    const raw = localStorage.getItem(BLOG_LOCAL_MIRROR_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalBlogMirrorRecord(record: CmsStoredBlogRecord): void {
  try {
    const current = loadLocalBlogMirror();
    current[record.id] = record;
    localStorage.setItem(BLOG_LOCAL_MIRROR_KEY, JSON.stringify(current));
    // Ensure it is not in deleted IDs
    const deleted = loadDeletedBlogIds().filter((id) => id !== record.id);
    localStorage.setItem(BLOG_DELETED_IDS_KEY, JSON.stringify(deleted));
    window.dispatchEvent(new CustomEvent('stephanie-blog-cms-updated'));
  } catch {
    // ignore storage quota errors
  }
}

export function removeLocalBlogRecord(postId: string): void {
  try {
    const current = loadLocalBlogMirror();
    delete current[postId];
    localStorage.setItem(BLOG_LOCAL_MIRROR_KEY, JSON.stringify(current));
    const deleted = loadDeletedBlogIds();
    if (!deleted.includes(postId)) {
      deleted.push(postId);
      localStorage.setItem(BLOG_DELETED_IDS_KEY, JSON.stringify(deleted));
    }
    window.dispatchEvent(new CustomEvent('stephanie-blog-cms-updated'));
  } catch {
    // ignore
  }
}

export function restoreCuratedBlogId(postId: string): void {
  try {
    const current = loadLocalBlogMirror();
    delete current[postId];
    localStorage.setItem(BLOG_LOCAL_MIRROR_KEY, JSON.stringify(current));
    const deleted = loadDeletedBlogIds().filter((id) => id !== postId);
    localStorage.setItem(BLOG_DELETED_IDS_KEY, JSON.stringify(deleted));
    window.dispatchEvent(new CustomEvent('stephanie-blog-cms-updated'));
  } catch {
    // ignore
  }
}

export function loadDeletedBlogIds(): string[] {
  try {
    const raw = localStorage.getItem(BLOG_DELETED_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Compresses an uploaded image file so it stays well below Firestore's 500KB field limit.
 */
export function compressImageFileToDataUrl(
  file: File,
  maxWidth = 1200,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image format'));
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(typeof reader.result === 'string' ? reader.result : '');
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.src = typeof reader.result === 'string' ? reader.result : '';
    };
    reader.readAsDataURL(file);
  });
}

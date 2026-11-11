export type PageId = 'overview' | 'work' | 'speaking' | 'books' | 'blog' | 'gallery' | 'cv' | 'contact' | 'impact' | 'cms';

export type ProjectCategory =
  | 'All'
  | 'WCAG & Accessibility'
  | 'D&I Strategy'
  | 'Workforce & Tech';

export interface RecommendationItem {
  id: string;
  name: string;
  role: string;
  shortRole: string;
  organization?: string;
  relationship: string;
  date: string;
  category: 'Keynote Speaking' | 'WCAG & Accessibility' | 'D&I Strategy' | 'Youth Leadership';
  highlightQuote: string;
  fullQuote: string;
  featuredOnHome?: boolean;
}

export const RECOMMENDATIONS_DATA: RecommendationItem[] = [
  {
    id: 'davies-shavanga',
    name: 'Davies Shavanga',
    role: 'Events Lead | Programs | Conferences | Accessible Events',
    shortRole: 'Events Lead & Speaker Host, Inclusive Africa Conference',
    relationship: 'Speaker host at Inclusive Africa Conference 2025 & 2026',
    date: 'October 27, 2026',
    category: 'Keynote Speaking',
    featuredOnHome: true,
    highlightQuote:
      'Having hosted Stephanie as a speaker at the Inclusive Africa Conference in both 2025 and 2026, I have seen firsthand the passion, knowledge, and authenticity she brings to digital accessibility and disability advocacy.',
    fullQuote:
      'Having hosted Stephanie as a speaker at the Inclusive Africa Conference in both 2025 and 2026, I have seen firsthand the passion, knowledge, and authenticity she brings to digital accessibility and disability advocacy.\n\nWhat stands out most is her ability to connect lived experience with practical insight and inspire audiences to think differently about inclusion. Stephanie leads with purpose and uses her voice to champion meaningful change. I am proud to recommend her as an outstanding youth leader, international speaker, and powerful advocate for a more accessible digital world.',
  },
  {
    id: 'lidia-pretorius',
    name: 'Lidia Pretorius',
    role: 'Disability Inclusion Strategist | Programme Design & Implementation | Coaching & Facilitation | Helping leaders move inclusion from policy into practice in Africa and beyond',
    shortRole: 'Disability Inclusion Strategist & Mentor',
    relationship: 'Stephanie’s Mentor & Strategic Inclusion Collaborator',
    date: 'January 29, 2026',
    category: 'D&I Strategy',
    featuredOnHome: true,
    highlightQuote:
      'You don’t often encounter young digital inclusion activists who can move so seamlessly between technical accessibility, lived reality, and strategic application. Stephanie is one of those rare people.',
    fullQuote:
      'You don’t often encounter young digital inclusion activists who can move so seamlessly between technical accessibility, lived reality, and strategic application. Stephanie is one of those rare people.\n\nThe clarity with which she translates complex accessibility and digital inclusion issues into practical, engaging, and immediately usable language is genuinely exceptional. Her work doesn’t just inform, it mobilises. Her posts were compelling enough to move me from reader to inbox to a discovery conversation and, very quickly, into active collaboration.\n\nWhat stood out immediately was not only her technical grasp but also her work ethic, intentionality, and systems awareness. We are already structuring collaboration across several digital inclusion fronts within my own work, and exploring extending this into the work of ecosystem partners, a pace and depth of engagement that speaks to both her credibility and her professionalism.\n\nStephanie is not only a strong emerging voice in digital inclusion. She is a practitioner, a translator, and a bridge-builder. If you are working anywhere near diversity and inclusion, accessibility, inclusive technology, or digital equity, she is someone to watch, support, and collaborate with.',
  },
  {
    id: 'ijaodola-tope-kareem',
    name: 'Ijaodola Tope Kareem',
    role: 'Co-Founder/CEO at Rushbox',
    shortRole: 'Co-Founder & CEO, Rushbox',
    relationship: 'Client (Digital Product MVP & Accessibility Features)',
    date: 'December 24, 2025',
    category: 'WCAG & Accessibility',
    featuredOnHome: true,
    highlightQuote:
      'Was an absolutely lovely time building and iterating our MVP alongside Stephanie. She pushed heavy for building disability inclusive features from the start, and we’re glad we did!',
    fullQuote:
      'Was an absolutely lovely time building and iterating our MVP alongside Stephanie. She pushed heavy for building disability inclusive features from the start, and we’re glad we did!',
  },
  {
    id: 'isimeme-whyte',
    name: 'Isimeme Whyte',
    role: 'Business Development Strategist | Social Entrepreneur | Driving Growth in Agritech, EdTech & the Creative Economy | TVET & Workforce Strategist | Public-Private Partnerships | TEDx Speaker & Filmmaker | AI Educator',
    shortRole: 'Business Development Strategist, TEDx Speaker & Social Entrepreneur',
    relationship: 'Professional Collaborator & Strategic Advisory',
    date: 'October 22, 2024',
    category: 'Keynote Speaking',
    highlightQuote:
      'If you are looking for someone that speaks exceptionally well and is also passionate about what she does, then Stephanie is definitely the right person for you. I totally recommend her.',
    fullQuote:
      'If you are looking for someone that speaks exceptionally well and is also passionate about what she does, then Stephanie is definitely the right person for you. I totally recommend her.\n\nI love the fact that she uses her platforms and career to impact and inspire people especially in the educational and technological sector.\n\nHer commitment to youth development and passion to drive total inclusivity in Nigeria and Africa at large is amazing.\n\nLastly, I must mention the fact that she’s very accessible, her communication skills is topnotch and she delivers her job with excellence and keen attention to details.',
  },
  {
    id: 'tobi-aminu',
    name: 'Tobi Aminu',
    role: 'Programme/Hub Manager, Nigeria Agri-Business Data & Investment Hub, Lagos Business School',
    shortRole: 'Programme/Hub Manager, Lagos Business School',
    relationship: 'Worked on the same team with Stephanie',
    date: 'January 1, 2025',
    category: 'Youth Leadership',
    highlightQuote:
      'Stephanie is a bold and empathetic advocate of diversity and inclusion with clear dissipation of passion and commitment to push through, in what she does.',
    fullQuote:
      'Stephanie is a bold and empathetic advocate of diversity and inclusion with clear dissipation of passion and commitment to push through, in what she does.',
  },
  {
    id: 'precious-eze',
    name: 'Precious Eze',
    role: 'Lead Content Development and Audience at Build Without Barrier',
    shortRole: 'Lead Content Development, Build Without Barrier',
    relationship: 'Worked on the same team with Stephanie',
    date: 'December 27, 2024',
    category: 'Youth Leadership',
    highlightQuote:
      'Stephanie Egharevba is an exceptional leader whose commitment to inclusion and innovation is genuinely inspiring. Her significant contributions to diversity and accessibility showcase her talent for driving impactful change.',
    fullQuote:
      'Stephanie Egharevba is an exceptional leader whose commitment to inclusion and innovation is genuinely inspiring. Her significant contributions to diversity and accessibility showcase her talent for driving impactful change with unwavering empathy and dedication.',
  },
  {
    id: 'amanda-jaiyeola',
    name: 'Amanda Jaiyeola',
    role: 'Founder, Achèo Koncept | Amanda Jaiyeola Foundation | Bureau of Representatives (BOR), Afrikan Youth Business Council, West Africa | Creative Director',
    shortRole: 'Founder, Amanda Jaiyeola Foundation & Achèo Koncept',
    relationship: 'Worked on the same team with Stephanie',
    date: 'September 8, 2024',
    category: 'Youth Leadership',
    highlightQuote:
      'She will assist in ensuring that your initiatives are inclusive and impactful.',
    fullQuote:
      'She will assist in ensuring that your initiatives are inclusive and impactful.',
  },
  {
    id: 'odunayo-adelusi',
    name: 'Odunayo Adelusi',
    role: 'Gender Equality and Social Inclusion (GESI) Expert',
    shortRole: 'Gender Equality and Social Inclusion (GESI) Expert',
    relationship: 'Client & Collaborator',
    date: 'May 27, 2024',
    category: 'D&I Strategy',
    highlightQuote:
      'Stephanie depicts high level of intelligence, Confident in herself and vast in the development knowledge. I will always recommend her in any conversation that relates to inclusion and diversity.',
    fullQuote:
      'Stephanie depicts high level of intelligence, Confident in herself and vast in the development knowledge. I will always recommend her in any conversation that relates to inclusion and diversity.',
  },
  {
    id: 'olajide-olamilekan',
    name: 'Olajide Olamilekan',
    role: 'Brand & Product Designer • Founder, Agalio',
    shortRole: 'Brand & Product Designer • Founder, Agalio',
    relationship: 'Reported directly to Stephanie',
    date: 'March 1, 2024',
    category: 'WCAG & Accessibility',
    highlightQuote:
      'She is an extraordinary person to work with, I highly recommend her.',
    fullQuote:
      'She is an extraordinary person to work with, I highly recommend her.',
  },
];

export interface ServicePillarItem {
  id: string;
  number: string;
  kicker: string;
  title: string;
  targetKeywords: string[];
  leadSummary: string;
  paragraphs: string[];
  deliverables: string[];
  ctaLabel: string;
  ctaPage: PageId;
  enquiryType:
    | 'WCAG Accessibility Audit'
    | 'D&I Strategy Advisory'
    | 'Keynote Speaking';
}

export const CORE_SERVICE_PILLARS: ServicePillarItem[] = [
  {
    id: 'service-wcag-audits',
    number: '01',
    kicker: 'WCAG 2.1 / 2.2 AA & AAA TECHNICAL AUDITING',
    title: 'WCAG & Digital Accessibility Audits',
    targetKeywords: [
      'WCAG audit services',
      'digital accessibility consultant Africa',
      'digital accessibility consultant Nigeria',
      'mobile app accessibility testing',
    ],
    leadSummary:
      'Comprehensive manual and automated WCAG 2.2 Level AA/AAA accessibility audits for web platforms, fintech apps, and NGO portals across Nigeria, West Africa, and global markets.',
    paragraphs: [
      'Automated accessibility scanners catch less than 30% of real-world usability barriers. As a dedicated digital accessibility consultant in Nigeria and Africa, Stephanie Egharevba conducts deep, code-level WCAG audit services that combine manual assistive technology testing (NVDA, VoiceOver, TalkBack, and switch-navigation) with structural DOM, ARIA, and keyboard focus-tree evaluations.',
      'For high-growth fintechs, SaaS startups, commercial banks, and enterprise product teams, an inaccessible checkout flow, KYC verification screen, or onboarding form silently locks out over 15% of the population (more than 35 million Nigerians and 1.3 billion people globally living with disabilities). Mobile app accessibility testing and responsive web evaluations uncover the exact friction points where screen-reader users get trapped in modal dialogs, where low-contrast typography fails under bright outdoor sunlight, and where custom UI components lack semantic labels.',
      'Every WCAG 2.2 AA audit engagement concludes with a developer-ready Engineering Remediation Roadmap rather than a vague compliance PDF. Product managers, UI/UX designers, and frontend engineers receive prioritized ticket specifications organized into Critical Blockers, High-Impact UX Fixes, and Design System Guardrails, complete with semantic HTML/ARIA code patterns, contrast ratio calculations, Nigerian Disability Act (NCPWD) alignment notes, and a post-remediation verification walkthrough to certify compliance.',
    ],
    deliverables: [
      'Full WCAG 2.1 / 2.2 Level AA Technical Audit Report',
      'Manual Screen-Reader (NVDA, VoiceOver, TalkBack) & Keyboard Navigation Walkthroughs',
      'Mobile App Accessibility Testing & Touch-Target (44x44px) Verification',
      'Prioritized Engineering Ticket Roadmap with Semantic HTML & ARIA Code Snippets',
      'Post-Remediation Verification & Compliance Sign-Off',
    ],
    ctaLabel: 'Commission a WCAG 2.2 Accessibility Audit',
    ctaPage: 'contact',
    enquiryType: 'WCAG Accessibility Audit',
  },
  {
    id: 'service-ngo-di-advisory',
    number: '02',
    kicker: 'INCLUSIVE GRANTMAKING, POLICY & WORKFORCE SYSTEMS',
    title: 'Inclusive Program & D&I Advisory',
    targetKeywords: [
      'inclusive digital design for NGOs',
      'disability inclusion strategy consultant',
      'accessible grantmaking programs',
    ],
    leadSummary:
      'Strategic disability inclusion advisory helping international foundations, NGOs, and corporate talent ecosystems design accessible grantmaking programs, inclusive learning portals, and equitable employment pipelines.',
    paragraphs: [
      'Philanthropic foundations, development agencies, and impact organizations invest millions of dollars into youth employment, digital skills fellowships, and entrepreneurship grants across Africa. Yet when the application portal, learning management system (LMS), or event format is inaccessible, qualified young people with disabilities are filtered out before the program even begins.',
      'Drawing from her leadership as Diversity & Inclusion Lead for the Mastercard Foundation Youth Advisory Council Nigeria, where she founded and scaled the 200+ member Alumni Disability Community, and her work across Jobberman Nigeria and the Mastercard Foundation Talent Corp initiative, Stephanie serves as a trusted disability inclusion strategy consultant for institutional programs. She helps organizations move from well-intentioned diversity statements to measurable, operational inclusion.',
      'Advisory engagements cover end-to-end inclusive digital design for NGOs and accessible grantmaking programs: auditing fellowship application forms so screen-reader and motor-impaired applicants are not disqualified by visual CAPTCHAs or timed tests; establishing clear workplace and academic accommodation policies; training program officers and partner employers on disability etiquette and bias-free interviewing; and building self-sustaining peer networks that retain talent with disabilities long after onboarding.',
    ],
    deliverables: [
      'Accessible Grantmaking & Fellowship Application Portal Audits',
      'Institutional Disability Inclusion Policy & Accommodation Frameworks',
      'Inclusive Digital Design Standards for NGO Learning Platforms (EdTech / LMS)',
      'Employer Readiness Training & Inclusive Recruitment Pipeline Architecture',
      'Lived-Experience Advisory Council & Disabled Alumni Network Design',
    ],
    ctaLabel: 'Book Inclusive Program & D&I Advisory',
    ctaPage: 'contact',
    enquiryType: 'D&I Strategy Advisory',
  },
  {
    id: 'service-keynote-speaking',
    number: '03',
    kicker: 'TOP 3% GLOBAL SPEAKER ON SESSIONIZE · ALX TOP 100 WOMEN IN TECH',
    title: 'Keynote Speaking & Executive Briefings',
    targetKeywords: [
      'AI accessibility keynote speaker',
      'disability inclusion speaker Africa',
    ],
    leadSummary:
      'High-impact keynotes, fireside chats, and engineering masterclasses on AI accessibility, inclusive product leadership, and disability inclusion across Africa and global technology stages.',
    paragraphs: [
      'Ranked in the Top 3% of Global Speakers on Sessionize and recognized among ALX Nigeria’s Top 100 Women in Tech, Stephanie Egharevba is a sought-after AI accessibility keynote speaker and disability inclusion speaker in Africa. Having delivered plenaries, fireside chats, and broadcasts for the InAble Inclusive Africa Conference, Mastercard Foundation global broadcasts, TechCabal Moonshot, InnovateAI Lagos, DataFest Africa, and AISEN, she brings rare dual fluency: lived experience with Osteogenesis Imperfecta paired with hands-on Computer Science and WCAG auditing expertise.',
      'As artificial intelligence reshapes banking, education, healthcare, and hiring across emerging markets, organizations face a pivotal choice: allow AI interfaces to automate historical exclusion at scale, or engineer multi-modal, accessible AI products that expand human capability. Stephanie’s keynotes challenge founders, software engineers, policymakers, and educators to rethink how products and institutions are built.',
      'Every keynote or executive workshop is tailored to the host audience, whether addressing 3,000+ developers and students at a national technology summit, briefing bank executives on the commercial market case for serving 35+ million Nigerians with disabilities, or facilitating a live 5-minute keyboard and screen-reader teardown with product engineering teams.',
    ],
    deliverables: [
      'Flagship Keynote: Disability Is Not the Problem, Design Is the Problem',
      'AI & Tech Plenary: Auditing AI Interfaces & Digital Products for Human Inclusion',
      'Executive Briefing: Why Inaccessible Products Lock Out 15% of the African Market',
      'Hands-On Engineering Workshop: Building WCAG 2.2 AA Accessible Software from Sprint Zero',
      'Global Broadcasts, Fireside Chats & High-Level Policy Panel Moderation',
    ],
    ctaLabel: 'Book Stephanie Egharevba as a Keynote Speaker',
    ctaPage: 'speaking',
    enquiryType: 'Keynote Speaking',
  },
];

export interface BuyerFaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'WCAG Audits' | 'NGO Advisory' | 'Compliance' | 'Speaking';
}

export const BUYER_FAQ_ITEMS: BuyerFaqItem[] = [
  {
    id: 'faq-audit-timeline',
    category: 'WCAG Audits',
    question: 'How long does a WCAG 2.2 AA accessibility audit take for a web or mobile platform?',
    answer:
      'A focused WCAG 2.2 Level AA audit for a core user journey (such as onboarding, checkout, KYC verification, or a grant application portal) typically takes 2 to 3 weeks. A full-scale enterprise or multi-platform web and mobile app accessibility audit takes 4 to 6 weeks, including manual screen-reader testing (NVDA, VoiceOver, TalkBack), keyboard navigation tree verification, a prioritized engineering remediation roadmap, and a live walkthrough with your developers.',
  },
  {
    id: 'faq-ngo-grantmaking',
    category: 'NGO Advisory',
    question: 'How do NGOs and foundations build digital accessibility into funded programs and grantmaking?',
    answer:
      'Inclusive program design starts before the call for applications opens. Stephanie works with NGOs, foundations, and development partners to audit application portals and learning management systems (removing barriers like visual CAPTCHAs, unlabeled PDFs, and inaccessible video players), establish clear budget lines for reasonable accommodations (sign language interpretation, captions, assistive tech stipends), and train program officers to recruit and support youth with disabilities throughout the fellowship or employment lifecycle.',
  },
  {
    id: 'faq-audit-deliverables',
    category: 'WCAG Audits',
    question: 'What does our engineering and product team receive at the end of a WCAG audit?',
    answer:
      'Instead of a generic automated scanner dump, your team receives an actionable Engineering Remediation Playbook. Every accessibility barrier is documented with its exact WCAG 2.2 success criterion, severity rating (Critical Blocker, High, Medium), screen-reader/keyboard reproduction steps, and concrete semantic HTML, CSS contrast, and ARIA code fixes that your frontend developers can ship immediately.',
  },
  {
    id: 'faq-nigerian-disability-act',
    category: 'Compliance',
    question: 'Why do Nigerian fintechs and digital products need to comply with the Nigerian Disability Act?',
    answer:
      'The Discrimination Against Persons with Disabilities (Prohibition) Act 2018 and the National Commission for Persons with Disabilities (NCPWD) mandate equitable access to public services, banking, telecommunications, education, and employment, which increasingly operate through digital apps. Beyond regulatory compliance, over 35 million Nigerians (15%+ of the population) live with a disability; making your mobile and web platforms accessible unlocks an underserved market while improving usability for all customers in low-bandwidth or bright-sunlight conditions.',
  },
  {
    id: 'faq-booking-speaking',
    category: 'Speaking',
    question: 'How can we book Stephanie Egharevba for a conference keynote, panel, or corporate workshop?',
    answer:
      'You can submit your event dates, audience profile, and format via the Enquiries page or schedule a 1-on-1 briefing directly on Stephanie’s Google Calendar. Stephanie delivers in-person and virtual keynotes, fireside chats, and hands-on WCAG workshops across Nigeria, Africa, and globally, with tailored fee tiers for corporate enterprises, international conferences, and NGO/academic ecosystems.',
  },
];

export interface BookItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  selarUrl: string;
  accentColor: string;
  coverBg: string;
  coverImageUrl: string;
  description: string;
  highlights: string[];
}

export interface SpeakingVideoItem {
  id: string;
  embedUrl: string;
  title: string;
  subtitle: string;
  tag: string;
}

export interface PortraitAsset {
  id: string;
  src: string;
  title: string;
  caption: string;
  attireAndMood: string;
  orientation: 'portrait' | 'three-quarter';
  resolutionLabel: string;
  usageRecommendation: string;
}

export interface KineticGalleryItem {
  id: string;
  src: string;
  title: string;
  eventTag: string;
  location: string;
  year: string;
  caption: string;
  track: 'stage' | 'advisory';
  aspectRatio?: 'landscape' | 'portrait' | 'square';
}

export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  category: Exclude<ProjectCategory, 'All'>;
  year: string;
  organization: string;
  role: string;
  visualTheme: 'toolkit' | 'clent' | 'policy' | 'fintech' | 'council' | 'audit';
  customImageUrl?: string;
  summary: string;
  challenge: string;
  intervention: string;
  impactMetrics: string[];
  deliverables: string[];
}

export interface ExperienceItem {
  id: string;
  period: string;
  role: string;
  organization: string;
  location: string;
  summary: string;
  highlights: string[];
}

export interface SpeakingEngagement {
  id: string;
  title: string;
  event: string;
  location: string;
  date: string;
  year: string;
  format: 'Keynote' | 'Fireside Chat' | 'Panel' | 'Broadcast';
  audienceOrNote: string;
  summary: string;
  fullText: string[];
  keyTakeaways: string[];
}

export interface PublicationItem {
  id: string;
  title: string;
  publisher: string;
  year: string;
  category: string;
  url?: string;
}

export interface HonorItem {
  id: string;
  title: string;
  year: string;
  issuer: string;
  detail: string;
}

export interface EducationItem {
  degree: string;
  institution: string;
  period: string;
  highlight: string;
}

export const CV_PDF_URL = '/assets/aistudio/EGHAREVBA_STEPHANIE_CV_592c7c87.pdf';

export const STEPHANIE_PORTRAITS: PortraitAsset[] = [
  {
    id: 'portrait-executive-emerald',
    src: '/assets/aistudio/stephanie-egharevba-digital-accessibility-consultant-portrait.jpg',
    title: 'Executive Studio Portrait',
    caption: 'Stephanie Egharevba, Digital Accessibility Consultant, WCAG Strategist, and Diversity & Inclusion Lead in Lagos, Nigeria.',
    attireAndMood: 'Emerald blazer · Charcoal backdrop',
    orientation: 'three-quarter',
    resolutionLabel: 'Press Portrait · 3:4',
    usageRecommendation: 'Keynotes & Magazine Features'
  },
  {
    id: 'portrait-sky-blazer-close',
    src: '/assets/aistudio/stephanie-egharevba-disability-inclusion-speaker-headshot.jpg',
    title: 'Speaker Headshot (Sky Blazer)',
    caption: 'Stephanie Egharevba, Disability Inclusion Speaker in Africa and Top 3% Global Speaker on Sessionize.',
    attireAndMood: 'Powder-blue blazer · Neutral backdrop',
    orientation: 'portrait',
    resolutionLabel: 'Headshot · 3:4',
    usageRecommendation: 'Speaker Lineups & Panels'
  },
  {
    id: 'portrait-emerald-closeup',
    src: '/assets/aistudio/stephanie-egharevba-wcag-strategist-executive-portrait.jpg',
    title: 'Close-Up Studio Portrait',
    caption: 'Executive studio portrait of Stephanie Egharevba, Digital Accessibility Consultant and WCAG 2.2 Compliance Auditor.',
    attireAndMood: 'Emerald lapel · Deep studio lighting',
    orientation: 'portrait',
    resolutionLabel: 'Editorial · 3:4',
    usageRecommendation: 'Author Bylines & Columns'
  },
  {
    id: 'portrait-white-shirt-editorial',
    src: '/assets/aistudio/stephanie-egharevba-author-editorial-portrait.jpg',
    title: 'Editorial Half-Length Portrait',
    caption: 'Editorial portrait of Stephanie Egharevba, author of Code for Every Body and Accessibility Made Easy Toolkit.',
    attireAndMood: 'White button-down · Soft daylight',
    orientation: 'three-quarter',
    resolutionLabel: 'Feature · 3:4',
    usageRecommendation: 'Profiles & Press Releases'
  },
  {
    id: 'portrait-sky-blazer-smile',
    src: '/assets/aistudio/stephanie-egharevba-keynote-speaker-studio-portrait.jpg',
    title: 'Candid Studio Portrait',
    caption: 'Studio portrait of Stephanie Egharevba, AI Accessibility Keynote Speaker and Inclusive Program Advisor.',
    attireAndMood: 'Textured blazer · Studio key light',
    orientation: 'portrait',
    resolutionLabel: 'Media · 3:4',
    usageRecommendation: 'Fireside Chats & Features'
  }
];

export const KINETIC_STAGE_PHOTOS: KineticGalleryItem[] = [
  {
    id: 'kinetic-stage-jobberman',
    src: '/assets/aistudio/stephanie-egharevba-jobberman-mastercard-foundation-panel.jpg',
    title: 'Stephanie Egharevba Speaking at Mastercard Foundation & Jobberman Career Fair Panel',
    eventTag: 'Jobberman Lagos Career Fair',
    location: 'Lagos, Nigeria',
    year: '2024',
    caption: 'Stephanie Egharevba delivering insights on mainstreaming talent with disabilities into enterprise tech hiring pipelines in Lagos.',
    track: 'stage',
    aspectRatio: 'landscape'
  },
  {
    id: 'kinetic-stage-terra-kulture',
    src: '/assets/aistudio/stephanie-egharevba-mastercard-foundation-youth-advisory-summit.jpg',
    title: 'Stephanie Egharevba at Mastercard Foundation Youth Advisory Council National Summit',
    eventTag: 'Mastercard Foundation YAC · Terra Kulture',
    location: 'Lagos, Nigeria',
    year: '2024',
    caption: 'Stephanie Egharevba arriving with the youth leadership delegation for the Mastercard Foundation national inclusion summit.',
    track: 'stage',
    aspectRatio: 'landscape'
  },
  {
    id: 'kinetic-stage-keynote-plenary',
    src: '/assets/aistudio/stephanie-egharevba-inclusive-africa-keynote.jpg',
    title: 'Stephanie Egharevba Delivering Keynote Address on WCAG Digital Accessibility Standards',
    eventTag: 'Inclusive Africa & Tech Inclusion Assembly',
    location: 'Abuja & Nairobi',
    year: '2025',
    caption: 'Stephanie Egharevba delivering a keynote address on eliminating UI and algorithmic barriers for persons with disabilities in Africa.',
    track: 'stage',
    aspectRatio: 'landscape'
  },
  {
    id: 'kinetic-stage-summit-awards',
    src: '/assets/aistudio/stephanie-egharevba-alx-top-100-women-in-tech-plenary.jpg',
    title: 'Stephanie Egharevba Honored at ALX Top 100 Women in Tech Plenary',
    eventTag: 'ALX Women in Tech Plenary',
    location: 'Lagos, Nigeria',
    year: '2025',
    caption: 'Stephanie Egharevba celebrating milestones in digital accessibility advocacy and disability inclusion across West Africa.',
    track: 'stage',
    aspectRatio: 'landscape'
  },
  {
    id: 'kinetic-stage-sessionize-panel',
    src: '/assets/aistudio/stephanie-egharevba-sessionize-global-speaker-panel.jpg',
    title: 'Stephanie Egharevba on Executive Panel for Accessible Digital Ecosystems',
    eventTag: 'Sessionize Top 3% Global Speaker Series',
    location: 'Lagos, Nigeria',
    year: '2026',
    caption: 'Stephanie Egharevba guiding enterprise engineering leaders on building WCAG 2.2 AA accessible web applications from sprint zero.',
    track: 'stage',
    aspectRatio: 'landscape'
  },
  {
    id: 'kinetic-stage-global-youth',
    src: '/assets/aistudio/stephanie-egharevba-global-youth-disability-inclusion-assembly.jpg',
    title: 'Stephanie Egharevba Presenting at Global Youth & Disability Inclusion Assembly',
    eventTag: 'Mastercard Foundation Continental Forum',
    location: 'Kigali, Rwanda',
    year: '2026',
    caption: 'Stephanie Egharevba presenting policy recommendations for disability-inclusive education and accessible grantmaking programs.',
    track: 'stage',
    aspectRatio: 'landscape'
  },
  {
    id: 'kinetic-stage-adf-summit',
    src: '/assets/aistudio/stephanie-egharevba-african-disability-forum-summit.jpg',
    title: 'Stephanie Egharevba at African Disability Forum Strategic Plenary',
    eventTag: 'ADF Strategic Assembly',
    location: 'Addis Ababa, Ethiopia',
    year: '2026',
    caption: 'Stephanie Egharevba championing unified continental digital accessibility legislation and assistive technology standards.',
    track: 'stage',
    aspectRatio: 'landscape'
  },
  {
    id: 'kinetic-stage-workforce-dialogue',
    src: '/assets/aistudio/stephanie-egharevba-inclusive-workforce-transition-dialogue.jpg',
    title: 'Stephanie Egharevba Moderating Workforce Transition Plenary Dialogue',
    eventTag: 'Youth Advisory Council Forum',
    location: 'Lagos, Nigeria',
    year: '2026',
    caption: 'Stephanie Egharevba moderating stakeholder dialogue on school-to-workplace transitions for youth with disabilities in Nigeria.',
    track: 'stage',
    aspectRatio: 'landscape'
  },
  {
    id: 'kinetic-stage-alumni-launch',
    src: '/assets/aistudio/stephanie-egharevba-alumni-disability-community-launch.jpg',
    title: 'Stephanie Egharevba Launching the 200+ Member Alumni Disability Network',
    eventTag: 'Mastercard Foundation YAC',
    location: 'Lagos, Nigeria',
    year: '2026',
    caption: 'Stephanie Egharevba unveiling the 200+ member Alumni Disability Community and regional tech accessibility hubs.',
    track: 'stage',
    aspectRatio: 'landscape'
  },
  {
    id: 'kinetic-stage-symposium',
    src: '/assets/aistudio/stephanie-egharevba-pan-african-accessibility-policy-symposium.jpg',
    title: 'Stephanie Egharevba Keynote at Pan-African Accessibility & Policy Symposium',
    eventTag: 'Digital Inclusion Policy Symposium',
    location: 'Lagos, Nigeria',
    year: '2026',
    caption: 'Stephanie Egharevba delivering a keynote presentation on bridging the digital divide through assistive tech infrastructure.',
    track: 'stage',
    aspectRatio: 'landscape'
  }
];

export const KINETIC_ADVISORY_PHOTOS: KineticGalleryItem[] = [
  {
    id: 'kinetic-advisory-bilateral',
    src: '/assets/aistudio/stephanie-egharevba-disability-inclusion-strategy-consultation.jpg',
    title: 'Stephanie Egharevba Leading Disability Inclusion Strategy Consultation',
    eventTag: 'Strategic Leadership Advisory',
    location: 'Lagos, Nigeria',
    year: '2024',
    caption: 'Stephanie Egharevba in an executive advisory session on designing inclusive workplace accommodations and D&I policy.',
    track: 'advisory',
    aspectRatio: 'landscape'
  },
  {
    id: 'kinetic-advisory-yac-retreat',
    src: '/assets/aistudio/stephanie-egharevba-ngo-inclusive-program-design-session.jpg',
    title: 'Stephanie Egharevba Facilitating NGO Inclusive Program Design Session',
    eventTag: 'Mastercard Foundation YAC',
    location: 'Lagos, Nigeria',
    year: '2025',
    caption: 'Stephanie Egharevba co-creating nationwide youth disability inclusion frameworks and accessible event benchmarks.',
    track: 'advisory',
    aspectRatio: 'landscape'
  },
  {
    id: 'kinetic-advisory-roundtable-morning',
    src: '/assets/aistudio/stephanie-egharevba-inclusive-employment-employer-advisory.jpg',
    title: 'Stephanie Egharevba Advising Employers on Inclusive Employment & Recruitment',
    eventTag: 'Jobberman Diversity Advisory',
    location: 'Lagos, Nigeria',
    year: '2025',
    caption: 'Stephanie Egharevba advising corporate recruiters on eliminating bias and digital accessibility barriers in hiring stages.',
    track: 'advisory',
    aspectRatio: 'landscape'
  },
  {
    id: 'kinetic-advisory-roundtable-dialogue',
    src: '/assets/aistudio/stephanie-egharevba-disability-inclusion-working-group-roundtable.jpg',
    title: 'Stephanie Egharevba Chairing Disability Inclusion Working Group Roundtable',
    eventTag: 'Workforce Advisory Group',
    location: 'Lagos, Nigeria',
    year: '2025',
    caption: 'Stephanie Egharevba evaluating physical and digital accessibility roadblocks facing young Nigerian professionals.',
    track: 'advisory',
    aspectRatio: 'landscape'
  },
  {
    id: 'kinetic-advisory-tech-leaders-1',
    src: '/assets/aistudio/stephanie-egharevba-wcag-accessibility-audit-clinic.jpg',
    title: 'Stephanie Egharevba Leading WCAG 2.2 Accessibility Audit Strategy Clinic',
    eventTag: 'ALX Tech Fellowship',
    location: 'Lagos, Nigeria',
    year: '2026',
    caption: 'Stephanie Egharevba leading a hands-on strategy clinic auditing product prototypes against WCAG 2.2 Level AA requirements.',
    track: 'advisory',
    aspectRatio: 'landscape'
  },
  {
    id: 'kinetic-advisory-tech-leaders-2',
    src: '/assets/aistudio/stephanie-egharevba-enterprise-accessibility-engineering-briefing.jpg',
    title: 'Stephanie Egharevba Briefing Engineering Stakeholders on WCAG Compliance',
    eventTag: 'Executive Consultation',
    location: 'Lagos, Nigeria',
    year: '2026',
    caption: 'Stephanie Egharevba briefing engineering stakeholders on integrating assistive testing into automated CI/CD pipelines.',
    track: 'advisory',
    aspectRatio: 'landscape'
  },
  {
    id: 'kinetic-advisory-wcag-clinic-1',
    src: '/assets/aistudio/stephanie-egharevba-screen-reader-mobile-app-accessibility-testing.jpg',
    title: 'Stephanie Egharevba Conducting Screen Reader & Mobile App Accessibility Testing',
    eventTag: 'WCAG Engineering Clinic',
    location: 'Lagos, Nigeria',
    year: '2026',
    caption: 'Stephanie Egharevba leading a live screen reader and contrast verification clinic with software engineers and product designers.',
    track: 'advisory',
    aspectRatio: 'landscape'
  },
  {
    id: 'kinetic-advisory-wcag-clinic-2',
    src: '/assets/aistudio/stephanie-egharevba-rushbox-wcag-architecture-review.jpg',
    title: 'Stephanie Egharevba Reviewing DOM & ARIA Digital Accessibility Architecture',
    eventTag: 'ADF · Rushbox Audit Clinic',
    location: 'Lagos, Nigeria',
    year: '2026',
    caption: 'Stephanie Egharevba auditing DOM hierarchy, ARIA live-regions, and keyboard navigation flows across client web applications.',
    track: 'advisory',
    aspectRatio: 'landscape'
  },
  {
    id: 'kinetic-advisory-community-leadership',
    src: '/assets/aistudio/stephanie-egharevba-disability-advocacy-leadership-mentorship.jpg',
    title: 'Stephanie Egharevba Mentoring Emerging Disability Advocacy Leaders in Lagos',
    eventTag: 'Disability Advocacy Mentorship',
    location: 'Lagos, Nigeria',
    year: '2026',
    caption: 'Stephanie Egharevba mentoring emerging disability leaders on policy advocacy, public speaking, and institutional change.',
    track: 'advisory',
    aspectRatio: 'landscape'
  },
  {
    id: 'kinetic-advisory-bilateral-alignment',
    src: '/assets/aistudio/stephanie-egharevba-accessible-grantmaking-partnership-advisory.jpg',
    title: 'Stephanie Egharevba in Accessible Grantmaking Partnership Alignment Session',
    eventTag: 'Multilateral Partnership Advisory',
    location: 'Lagos, Nigeria',
    year: '2026',
    caption: 'Stephanie Egharevba finalizing a multilateral partnership roadmap for inclusive NGO programs and assistive digital infrastructure.',
    track: 'advisory',
    aspectRatio: 'landscape'
  },
  {
    id: 'kinetic-portrait-emerald',
    src: '/assets/aistudio/stephanie-egharevba-digital-accessibility-consultant-portrait.jpg',
    title: 'Stephanie Egharevba Official Executive Portrait (Digital Accessibility Consultant)',
    eventTag: 'Official Studio Portrait',
    location: 'Lagos, Nigeria',
    year: '2025',
    caption: 'Primary official press portrait of Stephanie Egharevba for international keynote announcements and media features.',
    track: 'advisory',
    aspectRatio: 'portrait'
  },
  {
    id: 'kinetic-portrait-sky-blazer',
    src: '/assets/aistudio/stephanie-egharevba-disability-inclusion-speaker-headshot.jpg',
    title: 'Stephanie Egharevba Speaker Portrait (Disability Inclusion Speaker Africa)',
    eventTag: 'Speaker Press Asset',
    location: 'Lagos, Nigeria',
    year: '2025',
    caption: 'Warm studio portrait of Stephanie Egharevba approved for conference agendas, speaker rosters, and event programs.',
    track: 'advisory',
    aspectRatio: 'portrait'
  },
  {
    id: 'kinetic-portrait-white-shirt',
    src: '/assets/aistudio/stephanie-egharevba-author-editorial-portrait.jpg',
    title: 'Stephanie Egharevba Editorial Author Portrait',
    eventTag: 'Editorial Feature',
    location: 'Lagos, Nigeria',
    year: '2025',
    caption: 'Editorial portrait of Stephanie Egharevba in crisp white shirt for feature profiles and published thought leadership.',
    track: 'advisory',
    aspectRatio: 'portrait'
  }
];

export const ALL_KINETIC_PHOTOS: KineticGalleryItem[] = [
  ...KINETIC_STAGE_PHOTOS,
  ...KINETIC_ADVISORY_PHOTOS
];

export const CORE_COMPETENCIES: string[] = [
  'WCAG 2.2 AA Auditing',
  'Mobile App Accessibility Testing',
  'Inclusive Digital Design for NGOs',
  'Disability Inclusion Strategy',
  'Accessible Grantmaking Programs',
  'Inclusive Workforce Placement',
  'AI Accessibility Keynotes'
];

export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'rushbox-wcag-audit',
    title: 'WCAG 2.2 AA Platform Audit & Remediation',
    subtitle: 'End-to-End Web & Mobile Accessibility Teardown, Keyboard Navigation & Inclusive MVP Engineering',
    category: 'WCAG & Accessibility',
    year: '2025 - 2026',
    organization: 'Digital Product & Logistics MVP',
    role: 'Digital Accessibility Consultant & WCAG Auditor',
    visualTheme: 'audit',
    summary:
      'Partnered with the founding and engineering team during MVP iteration to audit core web and mobile user journeys against WCAG 2.1 / 2.2 Level AA standards, eliminating keyboard traps, screen-reader blockers, and contrast failures before scale.',
    challenge:
      'Customers with physical, visual, and cognitive disabilities encountered critical usability blockers across onboarding, navigation, and checkout flows: custom interactive controls lacked ARIA roles and focus indicators, modal dialogs trapped keyboard-only users, form inputs failed to announce validation errors to screen readers, and secondary UI text fell below the 4.5:1 WCAG contrast threshold.',
    intervention:
      'Conducted a comprehensive manual and automated WCAG 2.2 Level AA teardown using keyboard-only walkthroughs and screen readers (NVDA and VoiceOver). Re-architected the DOM heading hierarchy, replaced non-semantic div buttons with keyboard-accessible controls, engineered high-visibility :focus-visible rings, connected inline form error states via aria-describedby, and delivered a prioritized engineering remediation roadmap.',
    impactMetrics: [
      '100% of critical keyboard focus traps and unlabeled interactive controls resolved across MVP core flows',
      'Achieved WCAG 2.2 AA contrast parity (≥ 4.5:1 body text, ≥ 3:1 UI components) across light and dark surfaces',
      'Embedded a repeatable accessibility engineering checklist directly into the frontend sprint workflow'
    ],
    deliverables: [
      'WCAG 2.2 Level AA Technical Audit Report',
      'Screen-Reader & Keyboard Navigation Remediation Specs',
      'Inclusive UX & Frontend Engineering Playbook'
    ]
  },
  {
    id: 'mastercard-yac-nigeria',
    title: 'Alumni Disability Community & Inclusive Program Architecture',
    subtitle: 'Scaling a 200+ Member Disability Network, Accessible Event Standards & Tech Lab Infrastructure',
    category: 'D&I Strategy',
    year: '2024 - 2025',
    organization: 'National Youth Advisory Council',
    role: 'Diversity & Inclusion Lead',
    visualTheme: 'council',
    summary:
      'Designed and scaled institutional disability inclusion across a national youth advisory ecosystem, founding a 200+ member Alumni Disability Community from zero, authoring accessible program standards, and delivering assistive computer lab hardware.',
    challenge:
      'Young graduates and scholars with disabilities across Nigeria were navigating fellowship transitions, career placement, and leadership events in isolation, facing inconsistent event accommodations, inaccessible digital registration forms, and a lack of structured peer mentorship.',
    intervention:
      'Audited and redesigned communication and event workflows to mandate live captioning, sign language interpretation, accessible venue vetting, and screen-reader friendly digital outreach. Founded the Alumni Disability Community from scratch to unite 200+ young professionals with disabilities and directed an Ogun State secondary school infrastructure project delivering desktop computers and backup power.',
    impactMetrics: [
      'Scaled the Alumni Disability Community from 0 to 200+ active members nationwide',
      'Established mandatory accessibility standards adopted across national youth summits, roundtables, and digital broadcasts',
      'Delivered fully equipped computer lab hardware, backup power, and digital literacy training to students in Ogun State'
    ],
    deliverables: [
      'Accessible Grantmaking & Event Inclusion Standards',
      '200+ Member Alumni Disability Peer & Mentorship Network',
      'School Computer Lab & Backup Power Deployment'
    ]
  },
  {
    id: 'jobberman-mastercard-workforce',
    title: 'Inclusive Workforce & Talent Placement Pipeline',
    subtitle: 'Accessible Candidate Onboarding, Learning Module Audits & Corporate Placement across West Africa',
    category: 'Workforce & Tech',
    year: '2026 - Present',
    organization: 'Regional Workforce Initiative',
    role: 'Associate Engagement Officer & Inclusion Advisor',
    visualTheme: 'fintech',
    summary:
      'Embedding WCAG digital accessibility and disability inclusion into regional workforce readiness programs, candidate assessment portals, and corporate job placements across West Africa.',
    challenge:
      'Skilled job seekers with physical and sensory disabilities across West Africa frequently dropped out of digital training cohorts and corporate recruitment funnels due to inaccessible learning modules, timed visual assessments, and employer misconceptions around workplace accommodations.',
    intervention:
      'Audited candidate onboarding and digital training journeys to remove sensory and motor friction for applicants with disabilities. Partnered with corporate hiring managers to institute practical accommodation policies, accessible interview workflows, and targeted talent placement.',
    impactMetrics: [
      'Deployed accessible learning and candidate evaluation standards across regional workforce training cohorts',
      'Removed onboarding and assessment friction for youth with physical, visual, and hearing disabilities',
      'Equipped corporate partner employers with practical workplace accommodation and inclusive hiring frameworks'
    ],
    deliverables: [
      'Accessible Candidate Onboarding & LMS Audit Guidelines',
      'Inclusive Workforce Placement & Employer Readiness Playbook',
      'Disability Accommodation Policy Templates for HR Teams'
    ]
  },
  {
    id: 'client-africa-disability-gender',
    title: 'Disability Rights & Gender Equity Governance',
    subtitle: 'Inclusive NGO Program Design, Accessible Community Outreach & GESI Policy Integration',
    category: 'D&I Strategy',
    year: '2024 - 2025',
    organization: 'Social Impact & NGO Advisory',
    role: 'Head of Disability & Gender Equality',
    visualTheme: 'clent',
    summary:
      'Embedded disability inclusion and gender equity (GESI) directly into organizational governance, grant program budgets, and regional community outreach across Nigeria.',
    challenge:
      'Regional social-impact programs lacked formal disability inclusion KPIs, budget allocations for reasonable accommodations, and accessible communication channels, resulting in low participation from women and youth with disabilities.',
    intervention:
      'Authored a binding Disability & Gender Equality Governance Charter, trained program coordinators on inclusive digital and field outreach, introduced accommodation budgeting into project planning, and redesigned community campaign materials for clarity and accessibility.',
    impactMetrics: [
      'Integrated measurable disability and gender inclusion KPIs into executive program governance',
      'Significantly increased participation of women and persons with disabilities across regional advocacy campaigns',
      'Trained 100% of program delivery coordinators on accessible event and outreach execution'
    ],
    deliverables: [
      'Disability & Gender Equality (GESI) Governance Strategy',
      'Inclusive NGO Program Budgeting & Accommodation Checklist',
      'Accessible Community Outreach Training Manual'
    ]
  },
  {
    id: 'google-microsoft-yabatech-communities',
    title: 'Campus Accessibility Reform & 300+ Student Developer Ecosystem',
    subtitle: 'Mobilizing 300+ Student Developers & Securing Institutional Academic Accommodations',
    category: 'Workforce & Tech',
    year: '2023 - 2024',
    organization: 'Campus Tech & Policy Leadership',
    role: 'Student Developer Lead & Special Adviser on Disability',
    visualTheme: 'policy',
    summary:
      'Built and led a 300+ member inclusive campus developer ecosystem while spearheading statutory examination and physical accessibility reforms in higher education.',
    challenge:
      'Students with disabilities faced physical lecture-hall barriers, lack of examination accommodations, and exclusion from technical software engineering bootcamps and hackathons.',
    intervention:
      'Audited campus workshop formats and student portals to ensure barrier-free participation, grew inclusive student developer chapters to 300+ members, and negotiated directly with senior college administration as Special Adviser to the Student Union President to institutionalize academic and physical accommodations.',
    impactMetrics: [
      'Mobilized 300+ student developers across inclusive campus engineering chapters',
      'Secured formal examination accommodations and physical accessibility pathways for students with disabilities',
      'Connected disabled and female student builders to regional open-source and data ecosystems'
    ],
    deliverables: [
      'Institutional Campus Disability Accommodation Policy Framework',
      'Barrier-Free Web Engineering & Data Literacy Bootcamps',
      'Inclusive Student Developer Community Playbook'
    ]
  }
];

export const PROFESSIONAL_EXPERIENCE: ExperienceItem[] = [
  {
    id: 'exp-jobberman',
    period: 'Feb 2026 – Present',
    role: 'Associate Engagement Officer',
    organization: 'Jobberman Nigeria',
    location: 'Lagos',
    summary:
      'Collaborating with a dedicated team to place over 3,500 Mastercard Associates across Nigeria, Ghana, The Gambia, Sierra Leone, and Liberia.',
    highlights: [
      'Collaborate with a dedicated team to place over 3,500 Mastercard Associates across Nigeria, Ghana, The Gambia, Sierra Leone, and Liberia.',
      'Developed and implemented training programs to mentor associates for successful integration into their roles.',
      'Fostered a culture of continuous learning and professional development within the organization.'
    ]
  },
  {
    id: 'exp-talent-corp',
    period: 'Feb 2026 – Present',
    role: 'Talent Corp Ambassador',
    organization: 'Mastercard Foundation Associate Program',
    location: 'West Africa',
    summary:
      'Collaborated with the Mastercard Foundation Project Team to train, develop, and place young talents in meaningful job roles across West Africa.',
    highlights: [
      'Collaborated with the Mastercard Foundation Project Team to train and develop young talents in West Africa.',
      'Focused on placing these talents in meaningful job roles as associates, enhancing their career prospects.',
      'Engaged in strategic planning and execution of training programs tailored to the needs of the local job market.'
    ]
  },
  {
    id: 'exp-hakeela',
    period: 'Dec 2025 – Feb 2026',
    role: 'Partnership Lead',
    organization: 'Hakeela',
    location: 'Nigeria',
    summary:
      'Secured corporate and NGO partnerships integrating inclusive design and diversity benchmarks.',
    highlights: [
      'Negotiated and closed cross-sector partnerships between corporate sponsors and NGOs centered on inclusive product design.',
      'Embedded measurable disability inclusion KPIs into partner program agreements and delivery charters.',
      'Expanded institutional reach across Nigerian technology and social-impact ecosystems.'
    ]
  },
  {
    id: 'exp-rushbox',
    period: 'Jun 2025 – Jun 2026',
    role: 'Accessibility Consultant',
    organization: 'Rushbox',
    location: 'Remote',
    summary:
      'Evaluated web architecture, navigation, and content against WCAG standards for physical, sensory, and cognitive access.',
    highlights: [
      'Conducted a full-stack WCAG technical teardown covering keyboard navigation trees, ARIA landmarks, and visual contrast.',
      'Resolved critical physical, sensory, and cognitive usability bottlenecks across core customer user flows.',
      'Authored a long-term inclusive product engineering playbook adopted by the core frontend and UX teams.'
    ]
  },
  {
    id: 'exp-mcf-yac',
    period: 'Mar 2024 – Dec 2025',
    role: 'Diversity and Inclusion Lead',
    organization: 'Mastercard Foundation Youth Advisory Council Nigeria',
    location: 'Nigeria',
    summary:
      'Founded the 200+ member Alumni Disability Community, moderated the global 2024 IDPD panel, and led Ogun State lab give-back.',
    highlights: [
      'Founded and scaled the Alumni Disability Community from 0 to 200+ active members across Nigeria.',
      'Moderated the globally broadcast 2024 International Day of Persons with Disabilities (IDPD) panel for the Mastercard Foundation.',
      'Directed the Ogun State secondary school infrastructure project, delivering desktop computers, backup power, and hands-on digital literacy.'
    ]
  },
  {
    id: 'exp-client-africa',
    period: 'Jul 2024 – May 2025',
    role: 'Head of Disability & Gender Equality',
    organization: 'Client Africa',
    location: 'Nigeria',
    summary:
      'Integrated disability rights and gender equity into organizational decision-making and regional impact programs.',
    highlights: [
      'Embedded disability rights and gender equity mandates directly into executive governance and program budgets.',
      'Designed and led regional advocacy campaigns that significantly increased representation of women and persons with disabilities.',
      'Trained program coordinators on inclusive event standards and accessible community outreach.'
    ]
  },
  {
    id: 'exp-microsoft',
    period: 'Mar 2023 – Dec 2024',
    role: 'Microsoft Student Ambassador Lead',
    organization: 'Microsoft (Yabatech)',
    location: 'Lagos',
    summary:
      'Grew campus developer community to 100+ active members; appointed Special Adviser to the Student Union President.',
    highlights: [
      'Scaled the Microsoft Student Ambassador campus chapter to 100+ active student engineers and builders.',
      'Appointed Special Adviser to the Student Union President on disability policy, campus accessibility, and student inclusion.',
      'Directed technical bootcamps on cloud engineering, accessibility fundamentals, and collaborative software development.'
    ]
  },
  {
    id: 'exp-yabatech-cm',
    period: 'Jun 2023 – Feb 2024',
    role: 'Community Manager for Students with Disabilities',
    organization: 'Yaba College of Technology',
    location: 'Lagos',
    summary:
      'Led campus-wide advocacy for academic accommodations, physical accessibility, and disabled student leadership.',
    highlights: [
      'Spearheaded institutional policy reform securing examination accommodations and physical access pathways for students with disabilities.',
      'Served as the primary liaison between disabled student cohorts and senior college administration.',
      'Mentored disabled students into campus leadership, engineering tracks, and national fellowships.'
    ]
  },
  {
    id: 'exp-google-gdsc',
    period: 'Aug 2023 – Jan 2024',
    role: 'Google Developer Student Club Lead',
    organization: 'Google',
    location: 'Lagos',
    summary:
      'Established and led a 200+ student developer community focused on data literacy and inclusive tech education.',
    highlights: [
      'Built and led a 200+ member Google Developer Student Club (GDSC) chapter focused on web engineering and data literacy.',
      'Designed barrier-free technical workshops that brought first-time disabled and female builders into software development.',
      'Partnered with regional ecosystem leaders across DataFest Africa and CHAOSS Africa to connect students to open-source careers.'
    ]
  }
];

export const EDUCATION_HISTORY: EducationItem[] = [
  {
    degree: 'B.Sc. in Computer Science',
    institution: 'Miva Open University',
    period: 'Present',
    highlight:
      'Focus on Human-Computer Interaction (HCI), accessible software architecture, and inclusive systems engineering.'
  },
  {
    degree: 'National Diploma in Computer Science',
    institution: 'Yaba College of Technology (Yabatech)',
    period: '2022 – 2024',
    highlight:
      'Led Google GDSC (200+ members) & Microsoft Student Ambassadors (100+ members); appointed Special Adviser to the Student Union President.'
  }
];

export const HONORS_AND_RECOGNITION: HonorItem[] = [
  {
    id: 'honor-sessionize',
    title: 'Top 3% Global Speaker',
    year: '2024',
    issuer: 'Sessionize Worldwide',
    detail: 'Ranked in the top 3% of active international conference speakers globally across technology and inclusion stages.'
  },
  {
    id: 'honor-alx',
    title: 'Top 100 Women in Tech',
    year: '2025',
    issuer: 'ALX Nigeria',
    detail: 'Recognized among Nigeria’s 100 most impactful women shaping software engineering, policy, and digital inclusion.'
  },
  {
    id: 'honor-special-adviser',
    title: 'Special Adviser to the Student Union President',
    year: '2024',
    issuer: 'Yaba College of Technology',
    detail: 'Appointed to advise executive student governance on statutory disability accommodations and campus accessibility.'
  }
];

export const PUBLICATIONS_AND_FEATURES: PublicationItem[] = [
  {
    id: 'pub-mcf',
    title: "Built to Belong: Stephanie Egharevba's Fight to Make Inclusion Real",
    publisher: 'Mastercard Foundation',
    year: '2025',
    category: 'Profile',
    url: 'https://mastercardfdn.org/en/what-we-do/impact-stories/built-to-belong-stephanie-egharevbas-fight-to-make-inclusion-real/'
  },
  {
    id: 'pub-refinedng',
    title: 'Building Inclusive Tech in Africa',
    publisher: 'Refined NG',
    year: '2026',
    category: 'Feature',
    url: 'https://refinedng.com/stephanie-egharevba-on-building-inclusive-tech-in-africa/'
  },
  {
    id: 'pub-its-material',
    title: 'Participation + Influence',
    publisher: "IT'S MATERIAL",
    year: '2024',
    category: 'Interview',
    url: 'https://www.its-material-views.com/p/participation-plus-influence'
  },
  {
    id: 'pub-guardian',
    title: 'Why Nigeria Must Leverage Technology to Boost the Economy',
    publisher: 'The Guardian Newspaper',
    year: '2023',
    category: 'Op-Ed',
    url: 'https://guardian.ng/technology/why-nigeria-must-leverage-technology-to-boost-economy/'
  }
];

export const SPEAKING_AND_WRITING: SpeakingEngagement[] = [
  {
    id: 'inable-2026-fireside',
    title: 'Digital Accessibility and AI Solutions',
    event: 'InAble Inclusive Africa Conference',
    location: 'Nairobi / Pan-African',
    date: '2026',
    year: '2026',
    format: 'Fireside Chat',
    audienceOrNote: 'Fireside Chat',
    summary: 'Auditing AI interfaces against WCAG standards to remove barriers across Africa.',
    fullText: [
      'Artificial intelligence can either automate historical exclusion at scale or serve as the most powerful assistive equalizer across Africa.',
      'This fireside chat examines practical frameworks for auditing AI-driven interfaces against WCAG usability standards.'
    ],
    keyTakeaways: [
      'Pair AI product development with rigorous WCAG accessibility auditing.',
      'Design multi-modal interfaces for physical, sensory, and cognitive accessibility.',
      'Include African disability communities as co-designers of emerging AI tools.'
    ]
  },
  {
    id: 'aisen-2026-keynote',
    title: 'Inclusive Education',
    event: 'Association of International School Educators of Nigeria (AISEN)',
    location: 'Lagos',
    date: '2026',
    year: '2026',
    format: 'Keynote',
    audienceOrNote: 'Keynote Address',
    summary: 'Actionable strategies for physical accessibility, academic accommodations, and assistive EdTech.',
    fullText: [
      'True inclusive education means intentionally designing curriculum, physical infrastructure, and digital portals so every learner thrives.'
    ],
    keyTakeaways: [
      'Implement structured school-wide accommodation policies.',
      'Audit all educational platforms for screen-reader and keyboard parity.'
    ]
  },
  {
    id: 'inable-2025-panel',
    title: 'The Next Generation of African Leaders',
    event: 'InAble Inclusive Africa Conference',
    location: 'Pan-African',
    date: '2025',
    year: '2025',
    format: 'Panel',
    audienceOrNote: 'Panelist & Faces of Africa Feature',
    summary: 'How young leaders with disabilities are redefining policy, technology, and workforce inclusion.',
    fullText: [
      'Across Africa, young disability advocates and technologists are building developer communities, auditing platforms, and advising global foundations.'
    ],
    keyTakeaways: [
      'Embed youth with disabilities into executive advisory councils.',
      'Scale cross-border peer networks like the Alumni Disability Community.'
    ]
  },
  {
    id: 'innovate-ai-2025',
    title: 'A Case for Inclusion',
    event: 'InnovateAI Conference',
    location: 'Lagos',
    date: '2025',
    year: '2025',
    format: 'Keynote',
    audienceOrNote: 'Speaker',
    summary: 'Why African tech companies must embed inclusive design into core product architecture.',
    fullText: [
      'Every time a platform ships with unlabeled buttons or low-contrast type, businesses lock out capable users and talent.'
    ],
    keyTakeaways: [
      'Integrating WCAG audits early reduces engineering remediation costs by 4x.',
      'Accessible architecture expands market reach and usability for everyone.'
    ]
  },
  {
    id: 'lagos-career-expo-2024',
    title: 'Empowering Underrepresented Tech Leaders',
    event: 'Lagos Student Career Expo',
    location: 'Lagos',
    date: '2024',
    year: '2024',
    format: 'Keynote',
    audienceOrNote: 'Keynote to 3,000+ Students',
    summary: 'Keynote address to 3,000+ students on breaking into tech and leading inclusive communities.',
    fullText: [
      'Addressing over 3,000 students on leveraging campus developer communities, data literacy, and self-advocacy to lead in tech.'
    ],
    keyTakeaways: [
      'Build real-world portfolios through GDSC, Microsoft Ambassadors, and CHAOSS.',
      'Champion accessibility within student governance.'
    ]
  },
  {
    id: 'mcf-idpd-2024',
    title: 'Cultural Representation & Media Presentation of Persons with Disabilities',
    event: 'Mastercard Foundation IDPD',
    location: 'Global Broadcast',
    date: '2024',
    year: '2024',
    format: 'Panel',
    audienceOrNote: 'Panel Moderator',
    summary: 'Moderated the globally broadcast 2024 IDPD panel on authentic disability representation in media.',
    fullText: [
      'Broadcasting globally across Mastercard Foundation platforms to establish dignified standards for disability representation in media.'
    ],
    keyTakeaways: [
      'Replace charity tropes with narratives grounded in competence and rights.',
      'Model accessibility across all broadcasts with captions and sign interpretation.'
    ]
  },
  {
    id: 'datafest-chaoss-moonshot-2024',
    title: 'Bridging Disability, Data Literacy & Accessible Tech Ecosystems',
    event: 'Moonshot by TechCabal · DataFest Africa · CHAOSS Africa',
    location: 'Lagos',
    date: '2024',
    year: '2024',
    format: 'Keynote',
    audienceOrNote: 'Speaker & Co-Organizer',
    summary: 'Ecosystem talks across Moonshot by TechCabal, DataFest Africa, and CHAOSS Africa.',
    fullText: [
      'Connecting open-source maintainers, data scientists, and venture builders with actionable disability inclusion frameworks.'
    ],
    keyTakeaways: [
      'Data literacy empowers underrepresented groups in the digital economy.',
      'Open-source ecosystems thrive when documentation and events are accessible.'
    ]
  },
  {
    id: 'nta-broadcast-2023',
    title: 'Advocating for Osteogenesis Imperfecta Awareness & Resilience',
    event: 'National Television Authority (NTA)',
    location: 'National TV',
    date: '2023',
    year: '2023',
    format: 'Broadcast',
    audienceOrNote: 'Featured Guest',
    summary: 'National television feature advocating for Osteogenesis Imperfecta awareness and accessible schools.',
    fullText: [
      'Speaking on national television about Osteogenesis Imperfecta and the urgent need for accessible public and educational infrastructure.'
    ],
    keyTakeaways: [
      'Pair public awareness with enforcement of disability discrimination laws.',
      'Ensure early educational accessibility for children with physical disabilities.'
    ]
  }
];

export const SPEAKING_VIDEOS: SpeakingVideoItem[] = [
  {
    id: 'video-talk-1',
    embedUrl: 'https://www.youtube.com/embed/0a9e9rBwNE8?si=8b0XIEnghUzU_Tfu',
    title: 'Disability Is Not the Problem, Design Is the Problem',
    subtitle: 'Keynote & Panel on Physical and Digital Accessibility',
    tag: 'FEATURED TALK · 01'
  },
  {
    id: 'video-talk-2',
    embedUrl: 'https://www.youtube.com/embed/ZLdo1JKCPgs?si=GGrCg5kFuVI_D3tM',
    title: 'Building Inclusive Communities & Accessible Ecosystems',
    subtitle: 'Leadership, Advocacy & Systemic Inclusion in Africa',
    tag: 'FEATURED TALK · 02'
  }
];

export const STEPHANIE_BOOKS: BookItem[] = [
  {
    id: 'book-excluding-15-percent',
    title: 'Is Your Product Excluding 15% of Nigerians?',
    subtitle: 'The Business & Market Case for Digital Inclusion',
    tag: 'EXECUTIVE BRIEFING',
    selarUrl: 'https://selar.com/4bqls9k68c',
    accentColor: '#F59E0B',
    coverBg: '#13543A',
    coverImageUrl: '/assets/aistudio/stephanie-egharevba-is-your-product-excluding-15-percent-of-nigerians-book.jpg',
    description:
      'Inaccessible digital products lock out over 30 million Nigerians and cost African enterprises significant market share. This executive briefing gives founders and product leaders a clear commercial roadmap to build inclusive products that scale.',
    highlights: [
      'Why 15%+ of the market is locked out by inaccessible digital products',
      'Turning disability compliance into market growth and customer trust',
      'Actionable steps for African founders, PMs, and executives'
    ]
  },
  {
    id: 'book-code-for-everybody',
    title: 'Code for Every Body',
    subtitle: 'Engineering Digital Products That Leave No One Behind',
    tag: 'DEVELOPER GUIDE',
    selarUrl: 'https://selar.com/codeforeverybody',
    accentColor: '#141413',
    coverBg: '#F8FAFC',
    coverImageUrl: '/assets/aistudio/stephanie-egharevba-code-for-every-body-accessibility-book.png',
    description:
      'A hands-on engineering manual for building semantic, keyboard-navigable, and screen-reader compatible web and mobile interfaces. Designed for frontend engineers and UX teams shipping accessible code in production.',
    highlights: [
      'Semantic HTML, ARIA patterns, and keyboard-first engineering',
      'Eliminating physical, visual, and cognitive barriers in code',
      'Real-world patterns for accessible web and mobile interfaces'
    ]
  },
  {
    id: 'book-accessibility-made-easy',
    title: 'Accessibility Made Easy Toolkit',
    subtitle: 'Starter Kit for Founders, Designers & Developers',
    tag: 'AUDIT STARTER KIT',
    selarUrl: 'https://selar.com/accessibilitymadeeasy',
    accentColor: '#34D399',
    coverBg: '#0F623D',
    coverImageUrl: '/assets/aistudio/stephanie-egharevba-accessibility-made-easy-wcag-toolkit.png',
    description:
      'A ready-to-use audit toolkit featuring WCAG 2.2 AA checklists, contrast benchmarks, and Nigerian Disability Act compliance templates. Built to help product teams run structured accessibility reviews from day one.',
    highlights: [
      'Ready-to-use WCAG 2.2 AA audit checklists and contrast rules',
      'Nigerian Disability Act & NCPWD compliance guidance',
      'Practical workflows for designers, developers, and creators'
    ]
  }
];

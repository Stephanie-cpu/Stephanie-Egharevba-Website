export type PageId = 'overview' | 'work' | 'speaking' | 'books' | 'gallery' | 'cv' | 'contact';

export type ProjectCategory =
  | 'All'
  | 'WCAG & Accessibility'
  | 'D&I Strategy'
  | 'Workforce & Tech';

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
    src: '/assets/aistudio/Headshot_4_f3b4056c.jpg',
    title: 'Executive Studio Portrait',
    caption: 'Stephanie Egharevba — Diversity & Inclusion Lead.',
    attireAndMood: 'Emerald blazer · Charcoal backdrop',
    orientation: 'three-quarter',
    resolutionLabel: 'Press Portrait · 3:4',
    usageRecommendation: 'Keynotes & Magazine Features'
  },
  {
    id: 'portrait-sky-blazer-close',
    src: '/assets/aistudio/Headshot_5_8e90ef75.jpg',
    title: 'Speaker Headshot (Sky Blazer)',
    caption: 'Warm studio headshot of Stephanie Egharevba.',
    attireAndMood: 'Powder-blue blazer · Neutral backdrop',
    orientation: 'portrait',
    resolutionLabel: 'Headshot · 3:4',
    usageRecommendation: 'Speaker Lineups & Panels'
  },
  {
    id: 'portrait-emerald-closeup',
    src: '/assets/aistudio/Headshot_2_fbb50a76.jpg',
    title: 'Close-Up Studio Portrait',
    caption: 'High-contrast studio portrait.',
    attireAndMood: 'Emerald lapel · Deep studio lighting',
    orientation: 'portrait',
    resolutionLabel: 'Editorial · 3:4',
    usageRecommendation: 'Author Bylines & Columns'
  },
  {
    id: 'portrait-white-shirt-editorial',
    src: '/assets/aistudio/Headshot_3_ab4f5e1e.jpg',
    title: 'Editorial Half-Length Portrait',
    caption: 'Editorial portrait in crisp white shirt.',
    attireAndMood: 'White button-down · Soft daylight',
    orientation: 'three-quarter',
    resolutionLabel: 'Feature · 3:4',
    usageRecommendation: 'Profiles & Press Releases'
  },
  {
    id: 'portrait-sky-blazer-smile',
    src: '/assets/aistudio/Headshot_1_1e1bde4f.jpg',
    title: 'Candid Studio Portrait',
    caption: 'Over-the-shoulder studio portrait.',
    attireAndMood: 'Textured blazer · Studio key light',
    orientation: 'portrait',
    resolutionLabel: 'Media · 3:4',
    usageRecommendation: 'Fireside Chats & Features'
  }
];

export const CORE_COMPETENCIES: string[] = [
  'D&I Strategy',
  'Disability Policy',
  'WCAG Auditing',
  'Strategic Partnerships',
  'Inclusive Workforce Placement',
  'Community Mobilization',
  'Keynote Speaking'
];

export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'mastercard-yac-nigeria',
    title: 'Alumni Disability Community & Inclusion Strategy',
    subtitle: 'Mastercard Foundation Youth Advisory Council Nigeria',
    category: 'D&I Strategy',
    year: '2024 — 2025',
    organization: 'Mastercard Foundation',
    role: 'Diversity & Inclusion Lead',
    visualTheme: 'council',
    summary:
      'Founded and scaled the Alumni Disability Community from 0 to 200+ members and led Ogun State lab infrastructure.',
    challenge:
      'Underrepresented youth with disabilities lacked a unified peer-advocacy network and standardized event accessibility guidelines.',
    intervention:
      'Built a 200+ member alumni network, authored baseline accessibility guidelines, moderated the global 2024 IDPD broadcast, and delivered computer lab hardware in Ogun State.',
    impactMetrics: [
      '200+ Active Alumni Disability Community members',
      'Global 2024 IDPD panel broadcast moderator',
      'Ogun State computer lab & backup power delivered'
    ],
    deliverables: [
      'Baseline Event & Platform Accessibility Guidelines',
      'Alumni Disability Community Network',
      'Ogun State Tech Infrastructure Give-Back'
    ]
  },
  {
    id: 'rushbox-wcag-audit',
    title: 'Rushbox WCAG Platform Audit',
    subtitle: 'Comprehensive Digital Accessibility Evaluation & Roadmap',
    category: 'WCAG & Accessibility',
    year: '2025 — 2026',
    organization: 'Rushbox',
    role: 'Accessibility Consultant',
    visualTheme: 'audit',
    summary:
      'Audited web architecture and navigation against WCAG standards to remove physical, sensory, and cognitive barriers.',
    challenge:
      'Users with physical, sensory, and cognitive disabilities faced navigation and structural barriers across core product flows.',
    intervention:
      'Evaluated site structure against international WCAG standards and delivered a prioritized engineering remediation roadmap.',
    impactMetrics: [
      'Full WCAG architecture & navigation audit',
      'Physical, sensory & cognitive barriers resolved',
      'Long-term product inclusion roadmap adopted'
    ],
    deliverables: [
      'WCAG Technical Audit Report',
      'Engineering Remediation Roadmap',
      'Inclusive UX Advisory'
    ]
  },
  {
    id: 'african-disability-forum-audit',
    title: 'African Disability Forum Digital Audit',
    subtitle: 'Continental Platform WCAG Usability & Remediation',
    category: 'WCAG & Accessibility',
    year: '2026',
    organization: 'African Disability Forum',
    role: 'Accessibility Consultant',
    visualTheme: 'toolkit',
    summary:
      'Evaluated the Forum’s primary continental web platform against WCAG usability standards for executive remediation.',
    challenge:
      'Digital access barriers on the primary platform limited pan-African member organizations from accessing key resources.',
    intervention:
      'Conducted an in-depth WCAG usability audit and delivered strategic remediation guidelines to executive leadership.',
    impactMetrics: [
      'End-to-end WCAG usability evaluation',
      'Executive remediation guidelines delivered',
      'Accessible publishing workflow established'
    ],
    deliverables: [
      'WCAG Usability Audit',
      'Executive Remediation Strategy'
    ]
  },
  {
    id: 'jobberman-mastercard-workforce',
    title: 'West Africa Inclusive Workforce Pipeline',
    subtitle: 'Equitable Skill Acquisition & Corporate Job Placement',
    category: 'Workforce & Tech',
    year: '2026 — Present',
    organization: 'Jobberman & Mastercard Foundation',
    role: 'Associate Engagement Officer & Talent Corp Ambassador',
    visualTheme: 'fintech',
    summary:
      'Embedding universal accessibility into regional workforce training and placing young talents with disabilities into roles.',
    challenge:
      'Young talents with disabilities across West Africa face systemic friction transitioning from training into employment.',
    intervention:
      'Spearheading end-to-end talent readiness, accessible training modules, and corporate partner placement.',
    impactMetrics: [
      'Regional disability inclusion frameworks deployed',
      'Accessible learning modules embedded across West Africa',
      'Targeted corporate job placement for PWDs'
    ],
    deliverables: [
      'Inclusive Talent Pipeline Framework',
      'Accessible Training Standards',
      'Corporate Employer Readiness'
    ]
  },
  {
    id: 'client-africa-disability-gender',
    title: 'Disability Rights & Gender Equity Strategy',
    subtitle: 'Inclusive Governance & Regional Program Delivery',
    category: 'D&I Strategy',
    year: '2024 — 2025',
    organization: 'Client Africa',
    role: 'Head of Disability & Gender Equality',
    visualTheme: 'clent',
    summary:
      'Integrated disability rights and gender equity into core organizational governance and regional impact programs.',
    challenge:
      'Regional impact programs needed structured governance to guarantee representation of women and persons with disabilities.',
    intervention:
      'Formulated organizational D&I strategies and led regional campaigns that increased underrepresented participation.',
    impactMetrics: [
      'D&I embedded in core leadership governance',
      'Increased underrepresented participation regionally'
    ],
    deliverables: [
      'Disability & Gender Equality Strategy',
      'Inclusive Program Governance'
    ]
  },
  {
    id: 'google-microsoft-yabatech-communities',
    title: 'Google, Microsoft & Yabatech Tech Communities',
    subtitle: '300+ Student Developers Mobilized & Campus Inclusion',
    category: 'Workforce & Tech',
    year: '2023 — 2024',
    organization: 'Google · Microsoft · Yabatech',
    role: 'GDSC Lead, Microsoft Lead & Special Adviser',
    visualTheme: 'policy',
    summary:
      'Mobilized 300+ student developers across Google and Microsoft chapters while championing campus disability policy.',
    challenge:
      'Disabled and underrepresented students faced campus accommodation gaps and exclusion from technical tracks.',
    intervention:
      'Led Google GDSC (200+ members) and Microsoft Student Ambassadors (100+ members) while serving as Special Adviser on disability inclusion.',
    impactMetrics: [
      '200+ Students in Google GDSC chapter',
      '100+ Members in Microsoft Ambassador chapter',
      'Appointed Special Adviser to Student Union President'
    ],
    deliverables: [
      'Campus Accommodation Frameworks',
      'Data Literacy & Coding Tracks'
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
      'Delivering Mastercard Foundation workforce training, career readiness, and job transitions across West Africa.',
    highlights: [
      'Collaborate directly with the Mastercard Foundation delivery team to scale equitable workforce training pipelines across West Africa.',
      'Spearhead end-to-end talent readiness, candidate assessment, and employer transitions into sustainable long-term roles.',
      'Audit candidate onboarding journeys to remove friction for job seekers with physical and sensory disabilities.'
    ]
  },
  {
    id: 'exp-talent-corp',
    period: 'Feb 2026 – Present',
    role: 'Talent Corp Ambassador',
    organization: 'Mastercard Foundation Project Initiative',
    location: 'West Africa',
    summary:
      'Driving disability inclusion frameworks, accessible training modules, and corporate placement for youth with disabilities.',
    highlights: [
      'Embed universal WCAG accessibility standards into regional training curricula and candidate evaluation workflows.',
      'Facilitate targeted corporate job placements for young professionals with disabilities across partner employers.',
      'Advise hiring managers on workplace accommodation policy and inclusive onboarding standards.'
    ]
  },
  {
    id: 'exp-adf',
    period: 'Jan 2026',
    role: 'Accessibility Consultant',
    organization: 'African Disability Forum',
    location: 'Remote',
    summary:
      'Audited the Forum’s primary digital platform against WCAG standards and delivered executive remediation guidelines.',
    highlights: [
      'Audited multi-page continental web portals against WCAG 2.1/2.2 AA usability and screen-reader parity benchmarks.',
      'Delivered a prioritized engineering remediation roadmap to executive leadership to resolve DOM, contrast, and keyboard traps.',
      'Established accessible content-publishing standards for pan-African member organizations.'
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
      'Directed the Ogun State secondary school infrastructure project—delivering desktop computers, backup power, and hands-on digital literacy.'
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
    id: 'honor-mcf-delegate',
    title: 'Mastercard Foundation Global Delegate',
    year: '2024',
    issuer: 'Mastercard Foundation',
    detail: 'Selected to represent Nigerian youth and lead continental conversations on disability-inclusive workforce systems.'
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
    id: 'pub-refinedng',
    title: 'Building Inclusive Tech in Africa',
    publisher: 'Refined NG',
    year: '2026',
    category: 'Feature'
  },
  {
    id: 'pub-mcf',
    title: "Built to Belong: Stephanie Egharevba's Fight to Make Inclusion Real",
    publisher: 'Mastercard Foundation',
    year: '2025',
    category: 'Profile'
  },
  {
    id: 'pub-stack-journal',
    title: 'Stephanie Wants To Give Marginalised Communities A Voice',
    publisher: 'The Stack Journal',
    year: '2024',
    category: 'Interview'
  },
  {
    id: 'pub-guardian',
    title: 'Why Nigeria Must Leverage Technology to Boost the Economy',
    publisher: 'The Guardian Newspaper',
    year: '2023',
    category: 'Op-Ed'
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
    event: 'National Television Authority (NTA) & Mastercard Foundation EdTech Launch',
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
    coverImageUrl: '/assets/aistudio/is-your-product-excluding-selar.com-6970b1110bd40_12dcffed.jpg',
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
    accentColor: '#2563EB',
    coverBg: '#F8FAFC',
    coverImageUrl: '/assets/aistudio/code-for-everybody-selar.com-69619fb1197c5_3dffc49d.png',
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
    coverImageUrl: '/assets/aistudio/accessibility-made-easy-selar.com-695fe90b3bd5c_cd1a13b3.png',
    description:
      'A ready-to-use audit toolkit featuring WCAG 2.2 AA checklists, contrast benchmarks, and Nigerian Disability Act compliance templates. Built to help product teams run structured accessibility reviews from day one.',
    highlights: [
      'Ready-to-use WCAG 2.2 AA audit checklists and contrast rules',
      'Nigerian Disability Act & NCPWD compliance guidance',
      'Practical workflows for designers, developers, and creators'
    ]
  }
];


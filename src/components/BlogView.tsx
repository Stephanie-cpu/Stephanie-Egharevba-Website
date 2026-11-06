import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Mail,
  MessageSquare,
  Search,
  Sparkles,
} from 'lucide-react';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CmsArticleRecord } from './CmsAdminModal';
import {
  CmsStoredBlogRecord,
  recordToBlogPost,
  loadLocalBlogMirror,
  loadDeletedBlogIds,
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

// Default private password for Stephanie's /cms portal
export const ADMIN_PASSCODE_DEFAULT = 'UnbiasLagos2026!';
export const ADMIN_PASSCODE_STORAGE_KEY = 'stephanie_blog_admin_custom_pass_v1';

export const CURATED_BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-ngo-funded-programs-accessibility',
    slug: 'what-digital-accessibility-should-actually-look-like-in-ngo-funded-programs',
    title: 'What Digital Accessibility Should Actually Look Like in NGO-Funded Programs',
    subtitle:
      'A practical blueprint for foundations, NGOs, and development programs to move from inclusion pledges to accessible grantmaking portals, learning systems, and talent pipelines.',
    topic: 'Inclusion & Culture',
    publishedAt: 'Nov 4, 2026',
    readingTime: '7 min read',
    locationNote: 'Lagos · Inclusive Program & Grantmaking Strategy',
    featured: true,
    coverImage: '/assets/aistudio/stephanie-egharevba-ngo-inclusive-program-design-session.jpg',
    coverImageAlt:
      'Stephanie Egharevba facilitating an inclusive digital program design session with NGO and youth leaders in Lagos',
    pullQuote:
      'You cannot set a 10% disability inclusion target on a grant program and then host the application form on a portal that locks out screen readers on page one.',
    excerpt:
      'Every year, philanthropic foundations and international NGOs launch multi-million-dollar youth employment and digital skills programs across Africa. Yet many struggle to recruit and retain participants with disabilities because the digital infrastructure of the program itself was never audited for accessibility.',
    externalUrl: 'https://substack.com/@theunbiasproject',
    takeaways: [
      'Audit grant and fellowship application forms against WCAG 2.2 Level AA before opening applications—removing visual puzzle CAPTCHAs, unlabeled PDF uploads, and inaccessible date pickers.',
      'Build a dedicated reasonable accommodation budget line (5%–7% of program delivery costs) for sign language interpretation, live captioning, screen-reader compatible learning materials, and mobility stipends.',
      'Treat disabled alumni and youth advisory councils as co-designers of the program architecture rather than post-launch survey respondents.',
    ],
    sections: [
      {
        paragraphs: [
          'Across West and East Africa, foundations, bilateral donors, and NGOs are doing vital work funding digital skills bootcamps, entrepreneurship fellowships, and workforce placement initiatives. Almost every program charter now includes a commitment to Gender Equality and Social Inclusion (GESI) and sets a target for recruiting young people with disabilities.',
          'Then the call for applications goes live. Three weeks later, the program delivery team looks at the dashboard and asks: "Why did we receive almost zero completed applications from candidates with disabilities?"',
          'Having served as Diversity & Inclusion Lead for the Mastercard Foundation Youth Advisory Council in Nigeria and worked across workforce readiness programs at Jobberman, I have seen the exact reason up close: the ambition is inclusive, but the digital doorway is locked.',
        ],
      },
      {
        heading: '1. The Application Portal Is Your First Inclusion Policy',
        paragraphs: [
          'Before a young graduate with a visual, motor, or hearing impairment ever meets a program officer, they meet your online application form. If your multi-step grant portal uses custom dropdowns that cannot be opened with a keyboard, timed cognitive tests that cannot be extended, or a visual traffic-light CAPTCHA at the final submit button, blind and motor-impaired applicants are silently disqualified.',
          'Inclusive digital design for NGOs starts with a pre-launch WCAG 2.2 AA audit of every third-party form builder, learning management system (LMS), and assessment tool in your participant journey. Every form field needs a programmatic label, clear inline error guidance connected via aria-describedby, and an explicit question asking: "What reasonable accommodations will help you participate fully in this selection process?"',
        ],
        callout:
          'Program Officer Checklist: Before launching your next cohort application, unplug your mouse and complete the entire registration form using only the Tab, Shift+Tab, Space, and Enter keys.',
      },
      {
        heading: '2. Accessible Learning Management Systems (LMS) & Training Content',
        paragraphs: [
          'Getting accepted into a fellowship is only step one. If the training curriculum relies on uncaptioned video lectures, scanned image PDFs that screen readers see as blank pages, or live webinars without sign language interpretation, scholars with disabilities are forced to work twice as hard just to access the baseline material.',
          'Accessible grantmaking programs mandate that implementing partners deliver multi-modal learning assets: synchronized captions and transcripts on all video modules, tagged accessible PDFs or semantic HTML workbooks, and low-bandwidth mobile compatibility for learners using assistive technology on budget Android devices.',
        ],
      },
      {
        heading: '3. Budgeting for Accommodations & Building Peer Ecosystems',
        paragraphs: [
          'True disability inclusion strategy is never free, and it should never be treated as an emergency ad-hoc expense. High-performing NGO programs ring-fence a dedicated reasonable accommodation budget line from day zero so program managers never have to hesitate when a participant requests a sign language interpreter, tactile materials, or accessible transport.',
          'Finally, representation without community is isolating. When we built the 200+ member Alumni Disability Community within the Mastercard Foundation ecosystem in Nigeria, retention and career placement accelerated because young professionals with disabilities had a peer network to share job leads, workplace accommodation strategies, and mentorship.',
        ],
      },
    ],
  },
  {
    id: 'blog-inaccessible-platforms-waste-grant-money',
    slug: 'how-inaccessible-digital-platforms-waste-grant-money-and-exclude-talent',
    title: 'How Inaccessible Digital Platforms Waste Grant Money and Exclude Talent',
    subtitle:
      'When donor-funded EdTech portals, job boards, and civic platforms ship without WCAG compliance, organizations pay twice: first in lost talent, and second in expensive code rewrites.',
    topic: 'Accessibility in Practice',
    publishedAt: 'Oct 28, 2026',
    readingTime: '6 min read',
    locationNote: 'West Africa · Donor ROI & Digital Infrastructure',
    coverImage: '/assets/aistudio/stephanie-egharevba-accessible-grantmaking-partnership-advisory.jpg',
    coverImageAlt:
      'Stephanie Egharevba in a strategic advisory session on accessible grantmaking and inclusive digital infrastructure',
    pullQuote:
      'Funding an inclusive workforce program on an inaccessible software platform is like funding a public library and building a twenty-step staircase with no ramp at the front entrance.',
    excerpt:
      'Development agencies and impact investors spend millions procuring custom web portals, EdTech apps, and talent matching platforms. Here is how overlooking WCAG 2.2 AA standards during software procurement quietly drains donor ROI and filters out brilliant African talent.',
    externalUrl: 'https://substack.com/@theunbiasproject',
    takeaways: [
      'Retrofitting accessibility into a digital platform after launch costs up to 6x–10x more than embedding WCAG 2.2 AA requirements into initial procurement RFPs.',
      'Inaccessible candidate assessments create false negatives—filtering out qualified software engineers, analysts, and creatives simply because the test UI broke their screen reader.',
      'Requiring a verified WCAG 2.2 AA audit before final vendor sign-off protects grant capital and ensures donor-funded infrastructure serves 100% of the target population.',
    ],
    sections: [
      {
        paragraphs: [
          'Imagine a foundation commits $2 million to train and place 10,000 underserved youth into digital economy jobs across Nigeria, Kenya, and Ghana. A software vendor is contracted to build the central candidate portal, skill-testing engine, and employer matching dashboard.',
          'Six months later, the platform launches with sleek animations, a trendy low-contrast color palette, and custom drag-and-drop assessment widgets. On paper, the software deliverable is marked "Complete." In reality, every single candidate who relies on keyboard navigation, screen magnification, or a mobile screen reader has just been locked out of the program.',
        ],
      },
      {
        heading: 'The Hidden Financial Cost of Post-Launch Retrofits',
        paragraphs: [
          'When organizations treat digital accessibility as a "Phase 2 enhancement," grant money is wasted in two ways. First, outreach budgets spent recruiting youth with disabilities fail to convert because candidates abandon the broken registration funnel. Second, when the donor or program lead eventually commissions an accessibility audit, the engineering vendor has to rip apart core UI components that were already paid for.',
          'Fixing color contrast tokens and semantic button roles during the Figma and sprint-zero stage takes hours. Rewriting custom React modals, unlabelled canvas charts, and inaccessible video players six months after launch takes weeks of billable engineering time.',
        ],
        callout:
          'Procurement Rule for Foundations & NGOs: Include "WCAG 2.2 Level AA conformance verified by independent manual screen-reader and keyboard testing" as a mandatory acceptance criterion in every software vendor contract.',
        },
      {
        heading: 'How Broken Assessment Tools Create False Negatives',
        paragraphs: [
          'In my workforce advisory work, one of the most painful patterns I witness is talented young Nigerians with disabilities failing automated pre-employment screening tests—not because they lack the technical or analytical skill, but because the assessment timer does not pause for screen readers, or the multiple-choice radio buttons are unlabelled div elements.',
          'When we audit and remediate those candidate journeys, completion rates rise across the board—not only for candidates with disabilities, but also for applicants on low-bandwidth mobile connections and older smartphones. Accessible engineering makes every dollar of grant funding work harder.',
        ],
      },
    ],
  },
  {
    id: 'blog-wcag-22-checklist-african-fintech-startups',
    slug: 'wcag-2-2-aa-checklist-for-african-fintech-and-startup-product-teams',
    title: 'WCAG 2.2 AA Checklist for African Fintech and Startup Product Teams',
    subtitle:
      'A practical, engineering-first guide to contrast ratios, 44px touch targets, accessible KYC flows, and screen-reader parity for mobile and web apps in Africa.',
    topic: 'Builder Notes',
    publishedAt: 'Oct 19, 2026',
    readingTime: '8 min read',
    locationNote: 'Lagos · Fintech & Product Engineering',
    coverImage: '/assets/aistudio/stephanie-egharevba-screen-reader-mobile-app-accessibility-testing.jpg',
    coverImageAlt:
      'Stephanie Egharevba conducting live screen-reader and mobile app accessibility testing with software engineers',
    pullQuote:
      'When a banking app or payment checkout in Lagos fails WCAG 2.2 AA standards, it does not just fail a technical audit—it locks millions of customers out of financial independence.',
    excerpt:
      'Building a fintech, edtech, or e-commerce product for Nigeria, Kenya, or pan-African markets? Use this field-tested WCAG 2.2 Level AA engineering checklist to make your mobile and web interfaces usable for every customer.',
    externalUrl: 'https://substack.com/@theunbiasproject',
    takeaways: [
      'Enforce a minimum 4.5:1 contrast ratio for normal text and 3:1 for UI components and icons—essential for both low-vision users and customers using smartphones in bright tropical sunlight.',
      'Ensure all interactive tap targets measure at least 44x44 CSS pixels (exceeding WCAG 2.2 Target Size Minimum) so users with motor tremors or one-handed grip can transact without mis-taps.',
      'Provide multi-modal alternatives for biometric KYC (such as "blink twice" or "turn head rapidly" liveness checks) so blind and motor-impaired users can open bank accounts independently.',
    ],
    sections: [
      {
        paragraphs: [
          'African fintechs have built some of the fastest, most resilient payment infrastructure in the world. Yet when I conduct mobile app accessibility testing and WCAG 2.2 AA audits across regional banking, savings, and logistics apps, the same five barriers repeatedly block users with disabilities from completing basic transactions.',
          'Here is the practical WCAG 2.2 Level AA checklist I share with founders, product designers, and frontend engineers—designed specifically for the realities of mobile-first African product teams.',
        ],
      },
      {
        heading: '1. Accessible Biometric KYC & Onboarding (No Single-Sensory Traps)',
        paragraphs: [
          'Many digital banks rely on automated selfie liveness checks that flash visual text prompts on screen ("Smile", "Blink now", "Move closer to the oval") with zero audio guidance or haptic feedback. For a blind customer, or a user with Osteogenesis Imperfecta or cerebral palsy who cannot hold a phone at a rigid arm’s-length angle, account creation stops right there.',
          'To comply with WCAG 2.2, pair camera framing guides with real-time VoiceOver/TalkBack spoken cues, relax rigid timeout windows (WCAG 2.2.1 Timing Adjustable), and always offer an accessible fallback verification pathway (such as NIN/BVN document upload with assisted verification).',
        ],
      },
      {
        heading: '2. Color Contrast & Sunlight Legibility (WCAG 1.4.3 & 1.4.11)',
        paragraphs: [
          'Pale grey placeholder text on a white input background might look sleek on a calibrated MacBook Pro inside an air-conditioned studio in Victoria Island, but it is unreadable to low-vision users and invisible outdoors under bright midday glare on a budget Android screen.',
          'Set your design system tokens so body text maintains at least a 4.5:1 contrast ratio against its surface, large headings maintain at least 3:1, and active input borders or status icons maintain at least 3:1 contrast. Never use red or green color alone to indicate whether a transfer succeeded or failed—always include a clear text label and icon.',
        ],
        callout:
          'Interactive Tool: You can test your exact brand hex codes against WCAG 2.2 AA and AAA mathematical thresholds using the live Contrast Lab on my Work page (/work).',
      },
      {
        heading: '3. Keyboard Focus, Screen-Reader Labels & PIN Pads (WCAG 2.4.7, 2.5.8 & 4.1.2)',
        paragraphs: [
          'Icon-only buttons—like the "Copy account number" icon, the "Hide balance" eye toggle, or the top-right "Close modal" X—are the most common culprits in TalkBack and VoiceOver audits. Without an explicit aria-label, a screen reader simply announces "Unlabelled button."',
          'Similarly, custom numeric PIN pads and OTP inputs must announce each digit clearly, support focus-visible outlines for keyboard and switch-device users, and respect WCAG 2.2 Success Criterion 3.3.8 (Accessible Authentication) by allowing password managers or paste functionality where appropriate.',
        ],
      },
    ],
  },
  {
    id: 'blog-nigerian-disability-act-digital-compliance',
    slug: 'why-nigerian-digital-products-need-to-comply-with-the-nigerian-disability-act',
    title: 'Why Nigerian Digital Products Need to Comply with the Nigerian Disability Act',
    subtitle:
      'Understanding the Discrimination Against Persons with Disabilities (Prohibition) Act, NCPWD enforcement, and the 35-million-person market case for inclusive tech in Nigeria.',
    topic: 'Accessibility in Practice',
    publishedAt: 'Oct 8, 2026',
    readingTime: '6 min read',
    locationNote: 'Lagos · Policy, Law & Market Strategy',
    coverImage: '/assets/aistudio/stephanie-egharevba-pan-african-accessibility-policy-symposium.jpg',
    coverImageAlt:
      'Stephanie Egharevba speaking on the Nigerian Disability Act and digital accessibility compliance at a policy symposium',
    pullQuote:
      'Over 35 million Nigerians live with a disability. Designing accessible digital products is both a statutory obligation under Nigerian law and one of the largest untapped growth opportunities in African tech.',
    excerpt:
      'Many Nigerian founders and executives assume accessibility laws only apply to US or European companies under the ADA or European Accessibility Act. Here is what the Nigerian Disability Act and NCPWD mean for banks, telecoms, employers, and digital platforms operating in Nigeria.',
    externalUrl: 'https://substack.com/@theunbiasproject',
    takeaways: [
      'Nigeria’s Discrimination Against Persons with Disabilities (Prohibition) Act 2018 mandates equitable access to public services, banking, education, telecommunications, and employment—domains now delivered primarily through web and mobile apps.',
      'The Act’s five-year transitional grace period has expired, empowering the National Commission for Persons with Disabilities (NCPWD) and courts to enforce compliance and penalties.',
      'Beyond legal risk, serving the 15%+ of Nigerians living with disabilities—and their households—unlocks massive commercial loyalty and international partnership eligibility.',
    ],
    sections: [
      {
        paragraphs: [
          'Whenever I speak with technology executives or bank product leaders in Lagos, someone inevitably asks: "Stephanie, isn’t WCAG compliance mainly a requirement for foreign companies worried about US ADA lawsuits or the European Accessibility Act?"',
          'My answer is always direct: look closer to home. In January 2019, Nigeria enacted the Discrimination Against Persons with Disabilities (Prohibition) Act, 2018, and established the National Commission for Persons with Disabilities (NCPWD) to oversee implementation and enforcement.',
        ],
      },
      {
        heading: 'What the Nigerian Disability Act Means in a Digital-First Economy',
        paragraphs: [
          'The Act prohibits discrimination against persons with disabilities across public infrastructure, transportation, healthcare, education, telecommunications, banking, and employment—and mandates a 5% employment quota for persons with disabilities in public organizations.',
          'In 2026, where does banking happen in Nigeria? On mobile apps and USSD/web portals. Where does university registration and workforce training happen? On EdTech platforms. Where does job recruitment happen? On digital applicant tracking systems. When a bank’s mobile app or an employer’s recruitment portal is inaccessible to screen-reader or motor-impaired citizens, it creates an unlawful barrier to the exact services protected by the Act—especially now that the statutory five-year transitional moratoria have elapsed.',
        ],
        callout:
          'Need a structured compliance roadmap? My Accessibility Made Easy Toolkit and executive briefing "Is Your Product Excluding 15% of Nigerians?" break down WCAG 2.2 AA and NCPWD alignment step by step.',
      },
      {
        heading: 'Global Procurement & The 35-Million-Person Market Case',
        paragraphs: [
          'Even beyond domestic regulation, Nigerian startups scaling across Africa or bidding for contracts with international development organizations, multinational enterprises, and EU/UK/US partners face strict vendor accessibility vetting. If your SaaS product cannot demonstrate WCAG 2.1 / 2.2 Level AA conformance, your sales team is disqualified during enterprise procurement.',
          'Most importantly, the World Health Organization and national estimates indicate that over 35 million Nigerians—more than 15% of our population—live with a disability. When you audit your platform, fix your keyboard navigation and contrast ratios, and train your engineering team to build inclusively, you are not doing charity. You are opening your business to millions of loyal customers and world-class talent.',
        ],
      },
    ],
  },
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
    coverImage: '/assets/aistudio/stephanie-egharevba-disability-advocacy-leadership-mentorship.jpg',
    coverImageAlt: 'Stephanie Egharevba facilitating an interactive WCAG accessibility workshop in Lagos',
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
    coverImage: '/assets/aistudio/stephanie-egharevba-author-editorial-portrait.jpg',
    coverImageAlt: 'Editorial portrait of Stephanie Egharevba, founder of The Unbias Project',
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
    coverImage: '/assets/aistudio/stephanie-egharevba-african-disability-forum-summit.jpg',
    coverImageAlt: 'Stephanie Egharevba speaking on accessible UI forms and digital inclusion systems',
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
    coverImage: '/assets/aistudio/stephanie-egharevba-disability-inclusion-working-group-roundtable.jpg',
    coverImageAlt: 'Stephanie Egharevba with the Mastercard Foundation Youth Advisory Council disability inclusion community',
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
    coverImage: '/assets/aistudio/stephanie-egharevba-enterprise-accessibility-engineering-briefing.jpg',
    coverImageAlt: 'Stephanie Egharevba briefing West African tech leaders on WCAG digital accessibility',
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
    coverImage: '/assets/aistudio/stephanie-egharevba-global-youth-disability-inclusion-assembly.jpg',
    coverImageAlt: 'Stephanie Egharevba speaking on universal design and the curb-cut effect in technology',
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

interface BlogViewProps {
  cmsArticles: CmsArticleRecord[];
  substackUrl: string;
  onDiscussArticle: (articleTitle: string) => void;
  onOpenCmsPortal?: (editPostId?: string) => void;
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
  if (topic === 'Personal Reflections') return 'WRITING & REFLECTIONS';
  if (topic === 'Accessibility in Practice') return 'WCAG & ACCESSIBILITY';
  if (topic === 'Inclusion & Culture') return 'NGO & INCLUSION STRATEGY';
  if (topic === 'Builder Notes') return 'FINTECH & BUILDER NOTES';
  return topic.toUpperCase();
}

export const BlogView: React.FC<BlogViewProps> = ({
  cmsArticles,
  substackUrl,
  onDiscussArticle,
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

  // Cozy inline newsletter state wired to /api/subscribe
  const [email, setEmail] = useState<string>('');
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subError, setSubError] = useState<string>('');

  useEffect(() => {
    const syncLocal = () => {
      setLocalMirrorMap(loadLocalBlogMirror());
      setDeletedIds(loadDeletedBlogIds());
    };
    window.addEventListener('stephanie-blog-cms-updated', syncLocal);
    return () => window.removeEventListener('stephanie-blog-cms-updated', syncLocal);
  }, []);

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

  // Open article directly if ?note=<slug> is present in URL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const noteSlug = params.get('note');
    if (noteSlug) {
      const matched = allPosts.find((p) => p.slug === noteSlug || p.id === noteSlug);
      if (matched) {
        setActivePostId(matched.id);
      }
    }
  }, [allPosts]);

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

  // Sync canonical tag & article SEO metadata when reading an individual blog post
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const canonicalEl = document.querySelector('link[rel="canonical"]');
    if (activePost) {
      const shortTitle = `${activePost.title.slice(0, 40)} | Stephanie Egharevba`;
      document.title = shortTitle;
      const canonicalUrl = `https://stephanieegharevba.com/blog?note=${encodeURIComponent(activePost.slug)}`;
      if (canonicalEl) canonicalEl.setAttribute('href', canonicalUrl);
    } else {
      document.title = 'Digital Accessibility Blog | Stephanie Egharevba';
      if (canonicalEl) canonicalEl.setAttribute('href', 'https://stephanieegharevba.com/blog');
    }
  }, [activePost]);

  const handleOpenPost = (post: BlogPost) => {
    setActivePostId(post.id);
    if (typeof window !== 'undefined') {
      window.history.pushState(
        { page: 'blog', note: post.slug },
        '',
        `/blog?note=${encodeURIComponent(post.slug)}`
      );
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToIndex = () => {
    setActivePostId(null);
    if (typeof window !== 'undefined') {
      window.history.pushState({ page: 'blog' }, '', '/blog');
    }
  };

  const handleCopyPostLink = (post: BlogPost) => {
    try {
      const url = `https://stephanieegharevba.com/blog?note=${encodeURIComponent(post.slug)}`;
      navigator.clipboard.writeText(url);
      setCopiedPostId(post.id);
      setTimeout(() => setCopiedPostId(null), 2500);
    } catch {
      // ignore clipboard errors
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
    'Builder Notes',
    'Personal Reflections',
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
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
                onClick={handleBackToIndex}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#141413] hover:text-[#1D4ED8] transition-colors cursor-pointer whitespace-nowrap"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to all accessibility articles</span>
              </button>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleCopyPostLink(activePost)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E6E4DD] bg-white text-xs font-medium text-[#141413] hover:border-[#1D4ED8] transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copiedPostId === activePost.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Canonical Link Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#575652]" />
                      <span>Copy Canonical Link</span>
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
                    <span>Cross-posted on The Unbias Project Substack</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Essay Header (Strict H1 for the Article) */}
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

              {/* Author Byline & Canonical Attribution Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#E6E4DD]">
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-[#141413]">
                    By Stephanie Egharevba · Digital Accessibility Consultant &amp; WCAG Strategist
                  </div>
                  <div className="text-[11px] text-[#575652]">
                    Originally published on stephanieegharevba.com/blog · Syndicated with The Unbias Project on Substack
                  </div>
                </div>
              </div>
            </header>

            {/* Editorial Cover Image */}
            {activePost.coverImage && (
              <figure className="rounded-2xl overflow-hidden border border-[#E6E4DD] bg-white">
                <img
                  src={activePost.coverImage}
                  alt={activePost.coverImageAlt || activePost.title}
                  referrerPolicy="no-referrer"
                  className="w-full max-h-[440px] object-cover"
                />
              </figure>
            )}

            {/* Warm Pull Quote Card */}
            <blockquote className="rounded-2xl border border-[#E6E4DD] bg-white p-6 sm:p-8 space-y-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#1D4ED8]">
                CORE THESIS
              </div>
              <p className="font-serif italic text-lg sm:text-xl text-[#141413] leading-relaxed">
                “{activePost.pullQuote}”
              </p>
            </blockquote>

            {/* Main Essay Body Prose (H2 Section Headings) */}
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
            <section
              aria-labelledby="key-takeaways-heading"
              className="rounded-2xl border border-[#E6E4DD] bg-white p-6 sm:p-8 space-y-4"
            >
              <h2
                id="key-takeaways-heading"
                className="font-mono text-xs uppercase tracking-[0.16em] text-[#1D4ED8] font-bold"
              >
                KEY EXECUTIVE &amp; ENGINEERING TAKEAWAYS
              </h2>
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
            </section>

            {/* Canonical Cross-Link & Conversational Footer CTA */}
            <div className="rounded-2xl border border-[#E6E4DD] bg-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-md">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#575652]">
                  COMMISSION AN AUDIT OR KEYNOTE
                </div>
                <h2 className="text-lg font-display font-bold text-[#141413]">
                  Need a WCAG 2.2 AA audit or inclusive program review for your team?
                </h2>
                <p className="text-xs sm:text-sm text-[#3F3E3A]">
                  Book Stephanie Egharevba to audit your digital platform, advise your NGO grantmaking program, or speak at your next event.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => onDiscussArticle(activePost.title)}
                  className="px-5 py-3 rounded-lg bg-[#141413] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Discuss This Article with Stephanie</span>
                </button>
                <button
                  type="button"
                  onClick={handleBackToIndex}
                  className="px-4 py-3 rounded-lg border border-[#E6E4DD] bg-[#FAF9F6] hover:border-[#141413] text-[#141413] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  Explore More Accessibility Articles
                </button>
              </div>
            </div>
          </motion.article>
        ) : (
          /* ===================================================================== */
          /* MAIN BLOG & FIELD NOTES OVERVIEW (CLEAN PUBLIC VIEW)                  */
          /* ===================================================================== */
          <motion.div
            key="blog-index"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28 }}
            className="space-y-12 sm:space-y-14"
          >
            {/* Header: Animated BLOG letters + Single Semantic H1 */}
            <div className="pt-2 sm:pt-6 pb-2 text-center space-y-4">
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

              <h1 className="text-lg sm:text-xl font-display font-bold text-[#141413] dark:text-white max-w-2xl mx-auto">
                Digital Accessibility, WCAG 2.2 Engineering &amp; Inclusive Program Field Notes
              </h1>
              <p className="text-xs sm:text-sm text-[#575652] dark:text-neutral-300 max-w-xl mx-auto">
                Practical essays by Stephanie Egharevba on WCAG 2.2 AA compliance for African fintechs, inclusive NGO grantmaking programs, and the Nigerian Disability Act.
              </p>
            </div>

            {/* Topic Filter & Search Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-[1040px] mx-auto pb-4 border-b border-[#E6E4DD]">
              <div
                role="group"
                aria-label="Filter blog articles by topic"
                className="flex flex-wrap items-center gap-1.5"
              >
                {topics.map((t) => {
                  const isActive = selectedTopic === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTopic(t)}
                      aria-pressed={isActive}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-[#141413] text-white'
                          : 'bg-white border border-[#E6E4DD] text-[#575652] hover:text-[#141413]'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 text-[#575652] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search WCAG, NGO, fintech..."
                  aria-label="Search blog articles"
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white border border-[#E6E4DD] focus:border-[#1D4ED8] outline-none"
                />
              </div>
            </div>

            {/* 2-Column Clean Editorial Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 sm:gap-x-12 gap-y-12 sm:gap-y-16 max-w-[1040px] mx-auto">
              {filteredPosts.map((post, idx) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: Math.min(idx * 0.06, 0.24) }}
                  onClick={() => handleOpenPost(post)}
                  className="group cursor-pointer flex flex-col focus:outline-none"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenPost(post);
                    }
                  }}
                  aria-label={`Read article: ${post.title}`}
                >
                  {/* Card Cover Image */}
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 shadow-sm border border-black/5 dark:border-white/5">
                    <img
                      src={post.coverImage || '/assets/aistudio/stephanie-egharevba-disability-advocacy-leadership-mentorship.jpg'}
                      alt={post.coverImageAlt || post.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                  </div>

                  {/* Card Typography (H2 for Article Titles) */}
                  <div className="mt-3.5 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                      <time dateTime={post.publishedAt}>{post.publishedAt}</time>
                      <span aria-hidden="true">·</span>
                      <span>{post.readingTime}</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827] dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-[#3B82F6] transition-colors leading-snug">
                      <a
                        href={`/blog?note=${encodeURIComponent(post.slug)}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleOpenPost(post);
                        }}
                      >
                        {post.title}
                      </a>
                    </h2>

                    <p className="text-xs sm:text-sm text-[#475569] dark:text-neutral-300 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] uppercase tracking-wider pt-1">
                      {getBlogCategoryTag(post.topic)}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Cozy Dispatch Subscription & Canonical Substack Cross-Link Box */}
            <section
              aria-label="Subscribe to The Unbias Dispatch"
              className="rounded-2xl border border-[#E6E4DD] bg-white p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-7 space-y-2.5">
                <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#1D4ED8]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>CANONICAL ARCHIVE · SYNDICATED WITH THE UNBIAS PROJECT</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#141413]">
                  Get new field notes in your inbox whenever I hit publish.
                </h2>
                <p className="text-xs sm:text-sm text-[#3F3E3A] leading-relaxed max-w-xl">
                  All full canonical essays are published here on{' '}
                  <strong className="font-semibold text-[#141413]">stephanieegharevba.com/blog</strong>{' '}
                  first and cross-linked with{' '}
                  <a
                    href={substackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold text-[#1D4ED8]"
                  >
                    The Unbias Project on Substack
                  </a>
                  . Subscribe below for direct email dispatches on WCAG 2.2 audits, NGO inclusion, and product strategy.
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
                        <span>Follow The Unbias Project on Substack</span>
                      </a>
                    </div>
                  </form>
                )}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

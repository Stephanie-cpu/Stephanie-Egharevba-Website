import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  INITIAL_PROJECTS,
  SPEAKING_AND_WRITING,
  SPEAKING_VIDEOS,
  STEPHANIE_BOOKS,
  PROFESSIONAL_EXPERIENCE,
  CORE_COMPETENCIES,
  HONORS_AND_RECOGNITION,
  PUBLICATIONS_AND_FEATURES,
  CV_PDF_URL,
  STEPHANIE_PORTRAITS,
  BUYER_FAQ_ITEMS,
} from '../src/data/portfolioData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');

interface RouteConfig {
  path: string;
  title: string;
  description: string;
  canonical: string;
  renderContent: () => string;
}

// Common accessible header across all pre-rendered SSG routes
function renderHeader(activeRoute: string): string {
  const navItems = [
    { label: 'Home', href: '/', isCurrent: activeRoute === '/' },
    { label: 'Story & CV', href: '/story', isCurrent: activeRoute === '/story' || activeRoute === '/cv' },
    { label: 'Work', href: '/work', isCurrent: activeRoute === '/work' },
    { label: 'Speaking', href: '/speaking', isCurrent: activeRoute === '/speaking' },
    { label: 'Books', href: '/?page=books', isCurrent: false },
    { label: 'Gallery', href: '/?page=gallery', isCurrent: false },
    { label: 'Enquiries', href: '/?page=contact', isCurrent: false },
  ];

  return `
    <header style="padding: 16px 24px; border-bottom: 1px solid #E6E4DD; display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto;">
      <a href="/" style="font-weight: 700; font-size: 1.125rem; color: #141413; text-decoration: none;">Stephanie Egharevba</a>
      <nav aria-label="Primary navigation" style="display: flex; gap: 20px; font-size: 0.875rem; flex-wrap: wrap;">
        ${navItems
          .map(
            (item) =>
              `<a href="${item.href}" ${item.isCurrent ? 'aria-current="page"' : ''} style="color: ${
                item.isCurrent ? '#141413' : item.label === 'Enquiries' ? '#141413' : '#575652'
              }; text-decoration: none; font-weight: ${item.isCurrent || item.label === 'Enquiries' ? '600' : '400'};">${
                item.label
              }</a>`
          )
          .join('\n        ')}
      </nav>
    </header>
  `;
}

// Common accessible footer across all pre-rendered SSG routes
function renderFooter(): string {
  const year = new Date().getFullYear();
  return `
    <footer style="background-color: #0B0B0B; color: #F8FAFC; padding: 48px 24px; margin-top: 60px;">
      <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 32px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 24px;">
          <div>
            <div style="font-weight: 700; font-size: 1.25rem;">Stephanie Egharevba</div>
            <p style="color: #94A3B8; font-size: 0.875rem; margin-top: 4px; max-width: 40ch;">
              Diversity &amp; Inclusion Lead · Disability Inclusion Specialist · Author &amp; Speaker
            </p>
          </div>
          <div style="display: flex; gap: 16px; font-size: 0.875rem;">
            <a href="https://www.linkedin.com/in/egharevbastephanie" target="_blank" rel="noopener noreferrer" style="color: #F8FAFC; text-decoration: none;">LinkedIn</a>
            <a href="https://www.instagram.com/egharevba_stephanie" target="_blank" rel="noopener noreferrer" style="color: #F8FAFC; text-decoration: none;">Instagram</a>
            <a href="https://sessionize.com/stephanie-egharevba" target="_blank" rel="noopener noreferrer" style="color: #F8FAFC; text-decoration: none;">Sessionize</a>
          </div>
        </div>
        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; font-size: 0.75rem; color: #64748B;">
          <div>&copy; ${year} Stephanie Egharevba &middot; All Rights Reserved</div>
          <div style="display: flex; gap: 16px;">
            <span>NDPA &amp; GDPR Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  `;
}

// 1. Home / Overview Route Markup
function renderHomeContent(): string {
  return `
    ${renderHeader('/')}
    <main id="main-content" style="max-width: 1200px; margin: 0 auto; padding: 40px 24px;">
      <!-- Hero Section -->
      <section aria-label="Introduction" style="margin-bottom: 60px;">
        <p style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: #64748B; font-weight: 600; margin-bottom: 12px;">
          DIVERSITY &amp; INCLUSION LEAD · SPEAKER · AUTHOR
        </p>
        <h1 style="font-size: 3rem; font-weight: 700; letter-spacing: -0.03em; line-height: 1.08; margin: 0 0 16px 0; color: #141413;">
          Stephanie Egharevba
        </h1>
        <p style="font-size: 1.25rem; line-height: 1.6; color: #334155; max-width: 44ch; margin-bottom: 28px;">
          Scaling digital accessibility, inclusive systems, and global talent pipelines.
        </p>
        <div style="display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 20px;">
          <a href="/?page=contact" style="background: #111111; color: #ffffff; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 0.875rem;">
            Book for Speaking &rarr;
          </a>
          <a href="/work" style="border: 1px solid #CBD5E1; color: #141413; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 0.875rem;">
            Explore Work &amp; Advisory &rarr;
          </a>
        </div>
      </section>

      <!-- Stephanie's Story Feature -->
      <section aria-label="Stephanie's Story" style="margin-bottom: 60px; padding: 36px; background: #ffffff; border: 1px solid #E2E8F0; border-radius: 24px;">
        <p style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: #64748B; font-weight: 600; margin-bottom: 8px;">
          STEPHANIE’S STORY
        </p>
        <blockquote style="font-size: 1.75rem; font-weight: 700; color: #0F172A; margin: 0 0 16px 0; line-height: 1.2;">
          &ldquo;Disability is not the problem, design is the problem.&rdquo;
        </blockquote>
        <p style="font-size: 1rem; line-height: 1.7; color: #334155; max-width: 60ch; margin-bottom: 24px;">
          Born with Osteogenesis Imperfecta in Lagos, Stephanie turns lived experience and technical expertise into action, leading disability inclusion strategy, WCAG platform auditing, and inclusive workforce programs across Africa and beyond.
        </p>
        <div style="display: flex; gap: 14px; flex-wrap: wrap;">
          <a href="/story" style="background: #111111; color: #ffffff; padding: 10px 20px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 0.875rem;">
            See Stephanie Egharevba&apos;s Journey &rarr;
          </a>
        </div>
      </section>

      <!-- Practice Areas -->
      <section aria-label="Executive Practice & Advisory" style="margin-bottom: 60px;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #0F172A; margin-bottom: 24px;">Core Practices &amp; Strategic Advisory</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px;">
          <article style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px;">
            <h3 style="font-size: 1.125rem; font-weight: 700; color: #0F172A; margin: 0 0 8px 0;">WCAG &amp; Digital Accessibility</h3>
            <p style="font-size: 0.875rem; color: #475569; line-height: 1.6;">Technical DOM, ARIA, and contrast evaluations against WCAG 2.2 AA/AAA benchmarks for African and global platforms.</p>
          </article>
          <article style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px;">
            <h3 style="font-size: 1.125rem; font-weight: 700; color: #0F172A; margin: 0 0 8px 0;">D&amp;I Strategy &amp; Policy</h3>
            <p style="font-size: 0.875rem; color: #475569; line-height: 1.6;">Promoting disability inclusion across the Youth Advisory Council through accessible events, inclusive communication, and advocacy that ensures young people with disabilities are meaningfully represented and included.</p>
          </article>
          <article style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px;">
            <h3 style="font-size: 1.125rem; font-weight: 700; color: #0F172A; margin: 0 0 8px 0;">Keynotes &amp; Executive Stages</h3>
            <p style="font-size: 0.875rem; color: #475569; line-height: 1.6;">Ranked in the Top 3% of Global Speakers on Sessionize; delivering keynote addresses on accessible AI and inclusive systems.</p>
          </article>
          <article style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px;">
            <h3 style="font-size: 1.125rem; font-weight: 700; color: #0F172A; margin: 0 0 8px 0;">Frameworks &amp; Toolkits</h3>
            <p style="font-size: 0.875rem; color: #475569; line-height: 1.6;">Author of 3 published guides providing engineering checklists, Nigerian Disability Act compliance, and executive roadmaps.</p>
          </article>
        </div>
      </section>

      <!-- Books & Publications Section -->
      <section aria-label="Books & Toolkits" style="margin-bottom: 60px;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #0F172A; margin-bottom: 8px;">Books &amp; Toolkits</h2>
        <p style="font-size: 0.875rem; color: #64748B; margin-bottom: 24px;">Actionable engineering manuals, business briefings, and compliance kits available on Selar.</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
          ${STEPHANIE_BOOKS.map(
            (book) => `
            <article style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <span style="font-size: 0.75rem; font-weight: 600; color: #64748B; text-transform: uppercase;">${book.tag}</span>
                <h3 style="font-size: 1.125rem; font-weight: 700; color: #0F172A; margin: 8px 0 4px 0;">${book.title}</h3>
                <p style="font-size: 0.875rem; color: #64748B; margin-bottom: 12px;">${book.subtitle}</p>
                <p style="font-size: 0.875rem; color: #334155; line-height: 1.6;">${book.description}</p>
              </div>
              <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #F1F5F9;">
                <a href="${book.selarUrl}" target="_blank" rel="noopener noreferrer" style="color: #0F172A; font-weight: 600; font-size: 0.875rem; text-decoration: none;">
                  Get on Selar &rarr;
                </a>
              </div>
            </article>
          `
          ).join('\n')}
        </div>
      </section>
    </main>
    ${renderFooter()}
  `;
}

// 2. Work / Case Studies Route Markup
function renderWorkContent(): string {
  return `
    ${renderHeader('/work')}
    <main id="main-content" style="max-width: 1200px; margin: 0 auto; padding: 40px 24px;">
      <!-- Page Header -->
      <section aria-label="Work & Audits Header" style="margin-bottom: 40px; border-bottom: 1px solid #E2E8F0; padding-bottom: 32px;">
        <p style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: #64748B; font-weight: 600; margin-bottom: 8px;">
          SELECTED WORK &amp; TECHNICAL AUDITS
        </p>
        <h1 style="font-size: 2.5rem; font-weight: 700; letter-spacing: -0.03em; line-height: 1.1; margin: 0 0 16px 0; color: #0F172A;">
          Projects &amp; Case Studies
        </h1>
        <p style="font-size: 1.125rem; line-height: 1.6; color: #475569; max-width: 58ch; margin-bottom: 24px;">
          Auditing digital systems against WCAG 2.2 AA/AAA benchmarks, formulating institutional disability policy, and scaling regional workforce training pipelines.
        </p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <a href="/?page=contact" style="background: #111111; color: #ffffff; padding: 10px 22px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 0.875rem;">
            Commission an Audit or Advisory &rarr;
          </a>
        </div>
      </section>

      <!-- 6 Case Study Cards in Grid -->
      <section aria-label="Case Studies Showcase" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 28px; margin-bottom: 60px;">
        ${INITIAL_PROJECTS.map(
          (project) => `
          <article style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; padding: 24px;">
            <div>
              <div style="font-size: 0.75rem; font-weight: 600; color: #64748B; margin-bottom: 6px;">
                ${project.organization} &middot; ${project.role}
              </div>
              <h2 style="font-size: 1.25rem; font-weight: 700; color: #0F172A; margin: 0 0 8px 0; line-height: 1.25;">
                ${project.title}
              </h2>
              <div style="font-size: 0.875rem; color: #475569; font-weight: 500; margin-bottom: 12px;">
                ${project.subtitle}
              </div>
              <p style="font-size: 0.875rem; color: #475569; line-height: 1.6; margin-bottom: 16px;">
                ${project.summary}
              </p>

              <!-- Key Impact Metrics -->
              <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px; margin-bottom: 16px;">
                <div style="font-size: 0.6875rem; font-family: monospace; color: #64748B; text-transform: uppercase; margin-bottom: 6px; font-weight: 600;">
                  VERIFIED IMPACT
                </div>
                <ul style="margin: 0; padding-left: 18px; font-size: 0.8125rem; color: #1E293B; line-height: 1.5;">
                  ${project.impactMetrics.map((m) => `<li>${m}</li>`).join('\n                  ')}
                </ul>
              </div>

              <!-- Deliverables -->
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                ${project.deliverables
                  .map(
                    (d) =>
                      `<span style="font-size: 0.6875rem; font-family: monospace; background: #F1F5F9; color: #334155; padding: 3px 8px; border-radius: 6px;">${d}</span>`
                  )
                  .join('')}
              </div>
            </div>

            <div style="margin-top: 20px; padding-top: 14px; border-top: 1px solid #F1F5F9; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: monospace; font-size: 0.75rem; color: #64748B;">${project.year}</span>
              <a href="/work" style="font-size: 0.8125rem; font-weight: 600; color: #0F172A; text-decoration: none;">View Case Study &rarr;</a>
            </div>
          </article>
        `
        ).join('\n')}
      </section>

      <!-- Signature Interactive Accessibility Contrast Lab Note -->
      <section aria-label="Interactive WCAG Contrast Lab" style="background: #0B0B0B; color: #F8FAFC; border-radius: 20px; padding: 36px; margin-bottom: 60px;">
        <span style="font-family: monospace; font-size: 0.75rem; color: #94A3B8; text-transform: uppercase;">
          SIGNATURE CAPABILITY &middot; LIVE LAB
        </span>
        <h2 style="font-size: 1.75rem; font-weight: 700; margin: 8px 0 12px 0;">
          Interactive WCAG 2.2 AA / AAA Contrast &amp; Touch Target Lab
        </h2>
        <p style="color: #94A3B8; font-size: 0.9375rem; line-height: 1.6; max-width: 65ch;">
          Test color combinations in real-time against WCAG 2.2 contrast mathematical algorithms (minimum 4.5:1 for body text, 3:1 for large display elements, and 7:1 for AAA compliance). Verify touch targets, focus rings, and screen-reader semantics instantly.
        </p>
      </section>
    </main>
    ${renderFooter()}
  `;
}

// 3. Speaking / Keynotes Route Markup
function renderSpeakingContent(): string {
  return `
    ${renderHeader('/speaking')}
    <main id="main-content" style="max-width: 1200px; margin: 0 auto; padding: 40px 24px;">
      <!-- Page Header -->
      <section aria-label="Speaking Engagements Header" style="margin-bottom: 40px; border-bottom: 1px solid #E2E8F0; padding-bottom: 32px;">
        <p style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: #64748B; font-weight: 600; margin-bottom: 8px;">
          TOP 3% GLOBAL SPEAKER &middot; SESSIONIZE
        </p>
        <h1 style="font-size: 2.5rem; font-weight: 700; letter-spacing: -0.03em; line-height: 1.1; margin: 0 0 16px 0; color: #0F172A;">
          Speaking &amp; Featured Videos
        </h1>
        <p style="font-size: 1.125rem; line-height: 1.6; color: #475569; max-width: 58ch; margin-bottom: 24px;">
          Keynote addresses, executive fireside chats, and global broadcasts on digital accessibility, AI ethics, and inclusive workforce architecture.
        </p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <a href="/?page=contact" style="background: #111111; color: #ffffff; padding: 10px 22px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 0.875rem;">
            Request Speaking Fee &amp; Availability &rarr;
          </a>
        </div>
      </section>

      <!-- Featured Videos Section -->
      <section aria-label="Featured Videos" style="margin-bottom: 50px;">
        <h2 style="font-size: 1.25rem; font-weight: 700; color: #0F172A; margin-bottom: 16px;">
          Watch Stephanie on Stage &amp; in Conversation
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
          ${SPEAKING_VIDEOS.map(
            (video) => `
            <article style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; padding: 16px;">
              <div style="position: relative; width: 100%; aspect-ratio: 16/9; background: #000000; border-radius: 10px; overflow: hidden; margin-bottom: 12px;">
                <iframe src="${video.embedUrl}" title="${video.title}" loading="lazy" style="width: 100%; height: 100%; border: 0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
              </div>
              <span style="font-size: 0.6875rem; font-family: monospace; color: #64748B; font-weight: 600;">${video.tag}</span>
              <h3 style="font-size: 1rem; font-weight: 700; color: #0F172A; margin: 4px 0;">${video.title}</h3>
              <p style="font-size: 0.8125rem; color: #64748B; margin: 0;">${video.subtitle}</p>
            </article>
          `
          ).join('\n')}
        </div>
      </section>

      <!-- Keynote Talks Archive -->
      <section aria-label="Keynotes & Panels Archive">
        <h2 style="font-size: 1.25rem; font-weight: 700; color: #0F172A; margin-bottom: 16px;">
          Keynote Archive &amp; Executive Panels
        </h2>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${SPEAKING_AND_WRITING.map(
            (item) => `
            <article style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                <div>
                  <span style="font-size: 0.6875rem; font-family: monospace; background: #F1F5F9; color: #0F172A; padding: 2px 8px; border-radius: 9999px; font-weight: 600;">
                    ${item.format}
                  </span>
                  <span style="font-size: 0.8125rem; color: #64748B; margin-left: 8px;">${item.event} &middot; ${item.location}</span>
                </div>
                <span style="font-family: monospace; font-size: 0.8125rem; color: #64748B;">${item.year}</span>
              </div>
              <h3 style="font-size: 1.125rem; font-weight: 700; color: #0F172A; margin: 0 0 8px 0;">${item.title}</h3>
              <p style="font-size: 0.875rem; color: #334155; line-height: 1.6; margin-bottom: 12px;">${item.summary}</p>
              <div style="background: #F8FAFC; border-radius: 8px; padding: 12px; font-size: 0.8125rem; color: #1E293B;">
                <strong>Key Takeaway:</strong> ${item.keyTakeaways[0] || ''}
              </div>
            </article>
          `
          ).join('\n')}
        </div>
      </section>
    </main>
    ${renderFooter()}
  `;
}

// 4. Story & CV Route Markup
function renderStoryContent(): string {
  return `
    ${renderHeader('/story')}
    <main id="main-content" style="max-width: 1200px; margin: 0 auto; padding: 40px 24px;">
      <!-- Executive Biography Header -->
      <section aria-label="Biography Header" style="margin-bottom: 40px; border-bottom: 1px solid #E2E8F0; padding-bottom: 32px;">
        <p style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: #64748B; font-weight: 600; margin-bottom: 8px;">
          EXECUTIVE BIOGRAPHY &amp; FULL CURRICULUM VITAE
        </p>
        <h1 style="font-size: 2.75rem; font-weight: 700; letter-spacing: -0.03em; line-height: 1.08; margin: 0 0 12px 0; color: #0F172A;">
          Stephanie Egharevba <span style="font-size: 1.5rem; font-weight: 400; color: #64748B;">Osasumwen</span>
        </h1>
        <p style="font-size: 1.125rem; font-weight: 600; color: #0F172A; margin-bottom: 16px;">
          Diversity &amp; Inclusion Lead &middot; Disability Inclusion Specialist &middot; Author &amp; Global Speaker
        </p>

        <!-- Action Bar -->
        <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px;">
          <a href="${CV_PDF_URL}" download="Stephanie_Egharevba_CV.pdf" style="background: #111111; color: #ffffff; padding: 10px 22px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 0.875rem;">
            Download CV (PDF)
          </a>
          <a href="/?page=contact" style="background: transparent; color: #0F172A; border: 1px solid #CBD5E1; padding: 10px 22px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 0.875rem;">
            Book Advisory &rarr;
          </a>
        </div>

        <!-- Core Competencies -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${CORE_COMPETENCIES.map(
            (c) =>
              `<span style="background: #F1F5F9; color: #334155; padding: 4px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 500;">${c}</span>`
          ).join('')}
        </div>
      </section>

      <!-- Three Narrative Story Beats -->
      <section aria-label="Narrative Story" style="display: flex; flex-direction: column; gap: 32px; margin-bottom: 60px;">
        <article style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 20px; padding: 32px;">
          <h2 style="font-size: 1.5rem; font-weight: 700; color: #0F172A; margin: 0 0 16px 0;">A Foundation Built from Lived Reality</h2>
          <p style="font-size: 0.9375rem; line-height: 1.75; color: #334155;">
            Born with Osteogenesis Imperfecta (a rare genetic brittle bone condition) in Lagos, Nigeria, Stephanie grew up navigating public and academic institutions that were never built for people with disabilities. That lived reality transformed into a commitment: to eradicate institutional and digital barriers so people with disabilities participate equally in the global digital economy.
          </p>
        </article>

        <article style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 20px; padding: 32px;">
          <h2 style="font-size: 1.5rem; font-weight: 700; color: #0F172A; margin: 0 0 16px 0;">From Campus Policy to Continental Scale</h2>
          <p style="font-size: 0.9375rem; line-height: 1.75; color: #334155;">
            Mobilizing 300+ student developers across Google GDSC and Microsoft Student Ambassador chapters at Yaba College of Technology while advising on campus accommodations quickly expanded to continental advisory roles. As D&amp;I Lead for the Mastercard Foundation Youth Advisory Council Nigeria, she built the 200+ member Alumni Disability Community from zero, moderated the global IDPD broadcast, and deployed computer lab hardware in Ogun State.
          </p>
        </article>

        <article style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 20px; padding: 32px;">
          <h2 style="font-size: 1.5rem; font-weight: 700; color: #0F172A; margin: 0 0 16px 0;">Disability Is Not the Edge Case</h2>
          <p style="font-size: 0.9375rem; line-height: 1.75; color: #334155;">
            With over 35 million Nigerians living with a disability (15% of the population), treating accessibility as an afterthought locks out immense human potential and market value. Her work spans technical WCAG auditing for continental platforms like the African Disability Forum, workforce training pipelines at Jobberman, and authored engineering toolkits.
          </p>
        </article>
      </section>

      <!-- Professional Experience Timeline -->
      <section aria-label="Professional Experience" style="margin-bottom: 60px;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #0F172A; margin-bottom: 24px;">Professional Experience</h2>
        <div style="display: flex; flex-direction: column; gap: 20px;">
          ${PROFESSIONAL_EXPERIENCE.map(
            (exp) => `
            <article style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                <div>
                  <h3 style="font-size: 1.125rem; font-weight: 700; color: #0F172A; margin: 0;">${exp.role}</h3>
                  <div style="font-size: 0.875rem; color: #475569; font-weight: 600;">${exp.organization} &middot; ${exp.location}</div>
                </div>
                <span style="font-family: monospace; font-size: 0.8125rem; color: #64748B;">${exp.period}</span>
              </div>
              <p style="font-size: 0.875rem; color: #334155; line-height: 1.6; margin-bottom: 12px;">${exp.summary}</p>
              <ul style="margin: 0; padding-left: 18px; font-size: 0.8125rem; color: #475569; line-height: 1.5;">
                ${exp.highlights.map((h) => `<li>${h}</li>`).join('\n                ')}
              </ul>
            </article>
          `
          ).join('\n')}
        </div>
      </section>

      <!-- Honors & Recognition -->
      <section aria-label="Honors & Recognition" style="margin-bottom: 60px;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #0F172A; margin-bottom: 20px;">Honors &amp; Recognition</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px;">
          ${HONORS_AND_RECOGNITION.map(
            (h) => `
            <div style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px;">
              <span style="font-family: monospace; font-size: 0.75rem; color: #64748B; font-weight: 600;">${h.year}</span>
              <h3 style="font-size: 1rem; font-weight: 700; color: #0F172A; margin: 4px 0;">${h.title}</h3>
              <div style="font-size: 0.8125rem; color: #64748B; margin-bottom: 6px;">${h.issuer}</div>
              <p style="font-size: 0.8125rem; color: #334155; line-height: 1.5; margin: 0;">${h.detail}</p>
            </div>
          `
          ).join('\n')}
        </div>
      </section>
    </main>
    ${renderFooter()}
  `;
}

// SSG Routes Table (All titles < 60 chars, all descriptions < 155 chars)
const routes: RouteConfig[] = [
  {
    path: '/',
    title: 'Stephanie Egharevba | Digital Accessibility Consultant',
    description: 'Stephanie Egharevba: Digital Accessibility Consultant in Nigeria & Africa, WCAG 2.2 AA Auditor, and Disability Inclusion Keynote Speaker.',
    canonical: 'https://www.stephanieegharevba.com/',
    renderContent: renderHomeContent,
  },
  {
    path: '/work',
    title: 'WCAG Audits & Case Studies | Stephanie Egharevba',
    description: 'Explore WCAG 2.2 AA accessibility audits, inclusive program advisory for NGOs, and remediation case studies by Stephanie Egharevba.',
    canonical: 'https://www.stephanieegharevba.com/work',
    renderContent: renderWorkContent,
  },
  {
    path: '/speaking',
    title: 'AI & Inclusion Keynote Speaker | Stephanie Egharevba',
    description: 'Book Stephanie Egharevba, Top 3% Global Speaker on Sessionize, for keynotes on AI accessibility, assistive technology, and disability inclusion.',
    canonical: 'https://www.stephanieegharevba.com/speaking',
    renderContent: renderSpeakingContent,
  },
  {
    path: '/books',
    title: 'Accessibility Books & Toolkits | Stephanie Egharevba',
    description: 'Practical WCAG 2.2 engineering books and audit toolkits by Stephanie Egharevba: Code for Every Body and Accessibility Made Easy on Selar.',
    canonical: 'https://www.stephanieegharevba.com/books',
    renderContent: renderHomeContent,
  },
  {
    path: '/blog',
    title: 'Digital Accessibility Blog | Stephanie Egharevba',
    description: 'Field notes and essays by Stephanie Egharevba on WCAG 2.2 AA compliance, NGO-funded program accessibility, and the Nigerian Disability Act.',
    canonical: 'https://www.stephanieegharevba.com/blog',
    renderContent: renderHomeContent,
  },
  {
    path: '/impact',
    title: 'Client & Speaker Endorsements | Stephanie Egharevba',
    description: 'Read verified client and conference organizer endorsements for Stephanie Egharevba across WCAG audits, D&I strategy, and keynote speaking.',
    canonical: 'https://www.stephanieegharevba.com/impact',
    renderContent: renderHomeContent,
  },
  {
    path: '/gallery',
    title: 'Speaker Media Kit & Photos | Stephanie Egharevba',
    description: 'Download official high-resolution press portraits, speaker headshots, and conference bios for Stephanie Egharevba.',
    canonical: 'https://www.stephanieegharevba.com/gallery',
    renderContent: renderHomeContent,
  },
  {
    path: '/story',
    title: 'About & Executive CV | Stephanie Egharevba',
    description: 'Read the biography and executive CV of Stephanie Egharevba: Digital Accessibility Consultant, WCAG Strategist, and D&I Lead in Lagos, Nigeria.',
    canonical: 'https://www.stephanieegharevba.com/cv',
    renderContent: renderStoryContent,
  },
  {
    path: '/cv',
    title: 'About & Executive CV | Stephanie Egharevba',
    description: 'Read the biography and executive CV of Stephanie Egharevba: Digital Accessibility Consultant, WCAG Strategist, and D&I Lead in Lagos, Nigeria.',
    canonical: 'https://www.stephanieegharevba.com/cv',
    renderContent: renderStoryContent,
  },
  {
    path: '/contact',
    title: 'Book WCAG Audit or Keynote | Stephanie Egharevba',
    description: 'Commission a WCAG 2.2 AA digital accessibility audit, NGO inclusion advisory, or keynote speaking engagement with Stephanie Egharevba.',
    canonical: 'https://www.stephanieegharevba.com/enquiries',
    renderContent: renderHomeContent,
  },
  {
    path: '/enquiries',
    title: 'Book WCAG Audit or Keynote | Stephanie Egharevba',
    description: 'Commission a WCAG 2.2 AA digital accessibility audit, NGO inclusion advisory, or keynote speaking engagement with Stephanie Egharevba.',
    canonical: 'https://www.stephanieegharevba.com/enquiries',
    renderContent: renderHomeContent,
  },
];

async function runSSG() {
  const indexHtmlPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    console.error('Error: dist/index.html not found. Run "vite build" first.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8');

  console.log(`Starting SSG Pre-Rendering across ${routes.length} core routes...`);

  for (const route of routes) {
    // Replace <title>
    let customized = baseHtml.replace(
      /<title>[\s\S]*?<\/title>/i,
      `<title>${route.title}</title>`
    );

    // Replace og:title & twitter:title
    customized = customized.replace(
      /<meta property="og:title" content="[\s\S]*?" \/>/i,
      `<meta property="og:title" content="${route.title}" />`
    );
    customized = customized.replace(
      /<meta name="twitter:title" content="[\s\S]*?" \/>/i,
      `<meta name="twitter:title" content="${route.title}" />`
    );

    // Replace description
    customized = customized.replace(
      /<meta name="description"[\s\S]*?\/>/i,
      `<meta name="description" content="${route.description}" />`
    );
    customized = customized.replace(
      /<meta property="og:description"[\s\S]*?\/>/i,
      `<meta property="og:description" content="${route.description}" />`
    );
    customized = customized.replace(
      /<meta name="twitter:description"[\s\S]*?\/>/i,
      `<meta name="twitter:description" content="${route.description}" />`
    );

    // Replace canonical & og:url
    customized = customized.replace(
      /<link rel="canonical" href="[\s\S]*?" \/>/i,
      `<link rel="canonical" href="${route.canonical}" />`
    );
    customized = customized.replace(
      /<meta property="og:url" content="[\s\S]*?" \/>/i,
      `<meta property="og:url" content="${route.canonical}" />`
    );

    // Customize FAQPage JSON-LD schema with route-specific URL for Home (/) and Work (/work)
    const faqSchemaPayload = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${route.canonical.replace(/\/$/, '') || 'https://www.stephanieegharevba.com'}/#faq`,
      url: route.canonical,
      name:
        route.path === '/work'
          ? 'Common Questions About WCAG Audits & Inclusion Advisory'
          : 'Frequently Asked Questions: WCAG Accessibility Audits & Inclusion Advisory',
      mainEntity: BUYER_FAQ_ITEMS.map((f) => ({
        '@type': 'Question',
        '@id': `${route.canonical.replace(/\/$/, '') || 'https://www.stephanieegharevba.com'}/#${f.id}`,
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer,
        },
      })),
    };

    customized = customized.replace(
      /<script id="faq-schema-jsonld" type="application\/ld\+json">[\s\S]*?<\/script>/i,
      `<script id="faq-schema-jsonld" type="application/ld+json">\n${JSON.stringify(faqSchemaPayload, null, 2)}\n    </script>`
    );

    // Ensure <div id="root"></div> remains clean for React client rendering
    customized = customized.replace(
      /<div id="root">[\s\S]*?<\/div>/i,
      `<div id="root"></div>`
    );

    if (route.path === '/') {
      fs.writeFileSync(indexHtmlPath, customized, 'utf8');
      console.log(`[SSG] Exported: dist/index.html (Route: /)`);
    } else {
      const cleanPath = route.path.replace(/^\//, '');
      const routeDir = path.join(DIST_DIR, cleanPath);
      if (!fs.existsSync(routeDir)) {
        fs.mkdirSync(routeDir, { recursive: true });
      }

      // Write dist/<route>/index.html
      const subIndexPath = path.join(routeDir, 'index.html');
      fs.writeFileSync(subIndexPath, customized, 'utf8');

      // Also write dist/<route>.html for CDN direct-path matching
      const flatHtmlPath = path.join(DIST_DIR, `${cleanPath}.html`);
      fs.writeFileSync(flatHtmlPath, customized, 'utf8');

      console.log(`[SSG] Exported: dist/${cleanPath}/index.html & dist/${cleanPath}.html (Route: ${route.path})`);
    }
  }

  console.log('Static Site Generation (SSG) completed successfully!');
}

runSSG().catch((err) => {
  console.error('SSG build script failed:', err);
  process.exit(1);
});

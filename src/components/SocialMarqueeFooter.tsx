import React from 'react';
import { PageId } from '../data/portfolioData';

export interface SocialLink {
  label: string;
  url: string;
  ariaLabel: string;
}

interface SocialMarqueeFooterProps {
  linkedinUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  substackUrl?: string;
  onOpenPrivacyPolicy?: () => void;
  onNavigate?: (page: PageId) => void;
}

export default function SocialMarqueeFooter({
  linkedinUrl = 'https://www.linkedin.com/in/egharevbastephanie?utm_source=share_via&utm_content=profile&utm_medium=member_android',
  instagramUrl = 'https://www.instagram.com/egharevba_stephanie?psln=ODI1cDZpbHk2MjNz',
  tiktokUrl = 'https://www.tiktok.com/@egharevba_stephanie?_r=1&_t=ZS-9B9xLrUfv1d',
  substackUrl = 'https://substack.com/@theunbiasproject',
  onOpenPrivacyPolicy,
  onNavigate,
}: SocialMarqueeFooterProps) {
  // Each social profile is linked cleanly once for optimal SEO crawlability and screen-reader clarity
  const socialLinks: SocialLink[] = [
    {
      label: 'LINKEDIN',
      url: linkedinUrl,
      ariaLabel: "Open Stephanie Egharevba's LinkedIn profile in a new tab",
    },
    {
      label: 'INSTAGRAM',
      url: instagramUrl,
      ariaLabel: "Open Stephanie Egharevba's Instagram profile in a new tab",
    },
    {
      label: 'TIKTOK',
      url: tiktokUrl,
      ariaLabel: "Open Stephanie Egharevba's TikTok profile in a new tab",
    },
    {
      label: 'SUBSTACK',
      url: substackUrl,
      ariaLabel: "Open Stephanie Egharevba's Substack, The Unbias Project, in a new tab",
    },
  ];

  const internalLinks: { page: PageId; href: string; label: string }[] = [
    { page: 'overview', href: '/', label: 'Home' },
    { page: 'cv', href: '/cv', label: 'About & Executive CV' },
    { page: 'work', href: '/work', label: 'WCAG Audits & Case Studies' },
    { page: 'speaking', href: '/speaking', label: 'Keynote Speaking' },
    { page: 'books', href: '/books', label: 'Accessibility Books & Toolkits' },
    { page: 'blog', href: '/blog', label: 'Digital Accessibility Blog' },
    { page: 'impact', href: '/impact', label: 'Client & Speaker Endorsements' },
    { page: 'gallery', href: '/gallery', label: 'Speaker Media Kit' },
    { page: 'contact', href: '/enquiries', label: 'Enquiries & Booking' },
  ];

  return (
    <footer
      aria-label="Site navigation and social profile links"
      className="w-full overflow-hidden bg-transparent border-t border-[#E6E4DD] dark:border-neutral-800 py-10 sm:py-16"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-10">
        {/* Clean Single-Instance Monumental Social Links (No Duplicate Anchor Tags) */}
        <nav
          aria-label="Official social media profiles"
          className="flex flex-wrap items-center justify-between gap-6 sm:gap-10 border-b border-[#E6E4DD] dark:border-neutral-800 pb-8 sm:pb-12"
        >
          {socialLinks.map((item) => (
            <a
              key={item.label}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.ariaLabel}
              className="social-marquee-link relative inline-block text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-neutral-950 dark:text-white transition-opacity duration-200 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-current cursor-pointer group/link"
            >
              <span className="relative inline-block py-1">
                {item.label}
                <span
                  aria-hidden="true"
                  className="social-marquee-strike absolute left-0 top-1/2 -translate-y-1/2 w-0 h-[4px] sm:h-[6px] bg-[#FF4D00] dark:bg-[#4ADE80] transition-all duration-300 ease-out group-hover/link:w-full group-focus-visible/link:w-full pointer-events-none"
                />
              </span>
            </a>
          ))}
        </nav>

        {/* Crawl-Friendly Internal Site Map Links */}
        <nav
          aria-label="Footer site directory"
          className="flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs sm:text-sm font-medium text-[#3F3E3A] dark:text-neutral-300"
        >
          {internalLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate(link.page);
                }
              }}
              className="hover:text-[#1D4ED8] dark:hover:text-[#60A5FA] transition-colors whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Accessible Sub-Footer with Rights & NDPA/GDPR Modal Trigger */}
        <div className="pt-4 border-t border-[#E6E4DD]/60 dark:border-neutral-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500 dark:text-neutral-400">
          <div>
            © {new Date().getFullYear()} Stephanie Egharevba · Digital Accessibility Consultant &amp; WCAG Strategist · Lagos, Nigeria
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <a
              href="/sitemap.xml"
              className="hover:text-neutral-950 dark:hover:text-white transition-colors"
            >
              XML Sitemap
            </a>
            {onOpenPrivacyPolicy && (
              <button
                type="button"
                onClick={onOpenPrivacyPolicy}
                aria-label="Open NDPA and GDPR Privacy Policy modal"
                className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                NDPA &amp; GDPR Privacy Policy
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

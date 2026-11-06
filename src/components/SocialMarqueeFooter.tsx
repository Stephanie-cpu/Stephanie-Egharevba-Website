import React from 'react';
import { PageId } from '../data/portfolioData';

export interface SocialLink {
  label: string;
  url: string;
}

interface SocialMarqueeFooterProps {
  linkedinUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  substackUrl?: string;
  onOpenPrivacyPolicy?: () => void;
  onOpenCmsPortal?: () => void;
  onNavigate?: (page: PageId) => void;
}

export default function SocialMarqueeFooter({
  linkedinUrl = 'https://www.linkedin.com/in/egharevbastephanie?utm_source=share_via&utm_content=profile&utm_medium=member_android',
  instagramUrl = 'https://www.instagram.com/egharevba_stephanie?psln=ODI1cDZpbHk2MjNz',
  tiktokUrl = 'https://www.tiktok.com/@egharevba_stephanie?_r=1&_t=ZS-9B9xLrUfv1d',
  substackUrl = 'https://substack.com/@theunbiasproject',
  onOpenPrivacyPolicy,
}: SocialMarqueeFooterProps) {
  const socialLinks: SocialLink[] = [
    { label: 'LINKEDIN', url: linkedinUrl },
    { label: 'INSTAGRAM', url: instagramUrl },
    { label: 'TIKTOK', url: tiktokUrl },
    { label: 'SUBSTACK', url: substackUrl },
  ];

  // Repeat inside each track so ultra-wide monitors never show an empty gap
  const repeatedLinks = [
    ...socialLinks,
    ...socialLinks,
    ...socialLinks,
  ];

  return (
    <footer
      aria-label="Social media links"
      className="w-full overflow-hidden bg-transparent border-t border-[#E6E4DD] dark:border-neutral-800 py-8 sm:py-14"
    >
      {/* Marquee Wrapper - Pauses animation on hover or keyboard focus */}
      <div className="marquee-container relative flex w-full overflow-hidden select-none">
        {/* Track 1 (Accessible to screen readers and keyboard tabbing) */}
        <div className="animate-marquee-track flex shrink-0 items-center whitespace-nowrap">
          {repeatedLinks.map((item, index) => (
            <a
              key={`track-1-${index}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={index < socialLinks.length ? 0 : -1}
              aria-hidden={index >= socialLinks.length ? 'true' : undefined}
              className="social-marquee-link relative inline-block mx-6 sm:mx-12 text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-neutral-950 dark:text-white transition-opacity duration-200 hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-current cursor-pointer group/link"
            >
              <span className="relative inline-block py-2">
                {item.label}
                {/* Animated Strikethrough Line on Hover / Focus */}
                <span
                  aria-hidden="true"
                  className="social-marquee-strike absolute left-0 top-1/2 -translate-y-1/2 w-0 h-[5px] sm:h-[8px] bg-[#FF4D00] dark:bg-[#4ADE80] transition-all duration-300 ease-out group-hover/link:w-full group-focus-visible/link:w-full pointer-events-none"
                />
              </span>
            </a>
          ))}
        </div>

        {/* Track 2 (Identical clone for seamless infinite loop - hidden from screen readers & keyboard tab order) */}
        <div
          className="animate-marquee-track flex shrink-0 items-center whitespace-nowrap"
          aria-hidden="true"
        >
          {repeatedLinks.map((item, index) => (
            <a
              key={`track-2-${index}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={-1}
              className="social-marquee-link relative inline-block mx-6 sm:mx-12 text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-neutral-950 dark:text-white transition-opacity duration-200 hover:opacity-90 cursor-pointer group/link"
            >
              <span className="relative inline-block py-2">
                {item.label}
                <span className="social-marquee-strike absolute left-0 top-1/2 -translate-y-1/2 w-0 h-[5px] sm:h-[8px] bg-[#FF4D00] dark:bg-[#4ADE80] transition-all duration-300 ease-out group-hover/link:w-full pointer-events-none" />
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Subtle Accessible Sub-Footer with Rights & NDPA/GDPR Modal Trigger */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-8 sm:pt-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500 dark:text-neutral-400">
        <div>
          © {new Date().getFullYear()} Stephanie Egharevba · All Rights Reserved · Lagos, Nigeria
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px]">
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
    </footer>
  );
}

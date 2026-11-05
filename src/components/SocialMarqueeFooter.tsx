import React, { useEffect } from 'react';

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
}

export default function SocialMarqueeFooter({
  linkedinUrl = 'https://www.linkedin.com/in/egharevbastephanie?utm_source=share_via&utm_content=profile&utm_medium=member_android',
  instagramUrl = 'https://www.instagram.com/egharevba_stephanie?psln=ODI1cDZpbHk2MjNz',
  tiktokUrl = 'https://www.tiktok.com/@egharevba_stephanie?_r=1&_t=ZS-9B9xLrUfv1d',
  substackUrl = 'https://substack.com/@theunbiasproject',
  onOpenPrivacyPolicy,
}: SocialMarqueeFooterProps) {
  // Ensure that when returning to the tab from external redirects or switching back,
  // any lingering focus/hover state on the marquee links is cleared so the marquee never freezes.
  useEffect(() => {
    const handleActiveClear = () => {
      if (document.activeElement && document.activeElement instanceof HTMLElement) {
        if (document.activeElement.closest('.marquee-container')) {
          document.activeElement.blur();
        }
      }
    };

    window.addEventListener('pageshow', handleActiveClear);
    window.addEventListener('focus', handleActiveClear);
    window.addEventListener('visibilitychange', handleActiveClear);

    return () => {
      window.removeEventListener('pageshow', handleActiveClear);
      window.removeEventListener('focus', handleActiveClear);
      window.removeEventListener('visibilitychange', handleActiveClear);
    };
  }, []);
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

  // Repeat array 4 times to ensure seamless infinite looping without gaps on any screen width
  const marqueeItems = [
    ...socialLinks,
    ...socialLinks,
    ...socialLinks,
    ...socialLinks,
  ];

  return (
    <footer
      aria-label="Social links and footer"
      className="w-full overflow-hidden bg-transparent py-10 sm:py-16 select-none"
    >
      <div className="marquee-container relative w-full flex overflow-x-hidden">
        
        {/* Track 1 - Fully Clickable */}
        <div className="animate-marquee-track flex gap-16 sm:gap-24 pr-16 sm:pr-24">
          {marqueeItems.map((item, idx) => (
            <a
              key={`track1-${item.label}-${idx}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.ariaLabel}
              onClick={(e) => {
                (e.currentTarget as HTMLElement).blur();
              }}
              className="social-marquee-link relative inline-block text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-neutral-950 dark:text-white transition-opacity duration-200 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-current cursor-pointer group/link"
            >
              <span className="relative inline-block py-1">
                {item.label}
                {/* Horizontal strikethrough on hover: coral (#FF4D00) in light mode, lime (#4ADE80) in dark mode */}
                <span
                  aria-hidden="true"
                  className="social-marquee-strike absolute left-0 top-1/2 -translate-y-1/2 w-0 h-[4px] sm:h-[6px] md:h-[8px] bg-[#FF4D00] dark:bg-[#4ADE80] transition-all duration-300 ease-out group-hover/link:w-full group-focus-visible/link:w-full pointer-events-none"
                />
              </span>
            </a>
          ))}
        </div>

        {/* Track 2 - Cloned Loop Track, Fully Clickable with 100% Hit Targets */}
        <div
          aria-hidden="true"
          className="animate-marquee-track flex gap-16 sm:gap-24 pr-16 sm:pr-24"
        >
          {marqueeItems.map((item, idx) => (
            <a
              key={`track2-${item.label}-${idx}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={-1}
              onClick={(e) => {
                (e.currentTarget as HTMLElement).blur();
              }}
              className="social-marquee-link relative inline-block text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-neutral-950 dark:text-white transition-opacity duration-200 hover:opacity-90 focus:outline-none cursor-pointer group/link"
            >
              <span className="relative inline-block py-1">
                {item.label}
                <span
                  aria-hidden="true"
                  className="social-marquee-strike absolute left-0 top-1/2 -translate-y-1/2 w-0 h-[4px] sm:h-[6px] md:h-[8px] bg-[#FF4D00] dark:bg-[#4ADE80] transition-all duration-300 ease-out group-hover/link:w-full"
                />
              </span>
            </a>
          ))}
        </div>

      </div>

      {/* Accessible Sub-Footer with Rights & NDPA/GDPR Modal Trigger */}
      <div className="max-w-[1200px] mx-auto px-6 pt-10 sm:pt-14 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500 dark:text-neutral-400">
        <div>
          © {new Date().getFullYear()} Stephanie Egharevba · All Rights Reserved
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

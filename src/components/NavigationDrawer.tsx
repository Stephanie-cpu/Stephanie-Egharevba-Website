import React, { useState, useEffect, useRef } from 'react';
import { X, Linkedin, Instagram, Mail, ArrowUpRight } from 'lucide-react';
import { PageId } from '../data/portfolioData';

interface NavItem {
  id: PageId;
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'HOME', path: '/' },
  { id: 'cv', label: 'ABOUT & CV', path: '/cv' },
  { id: 'work', label: 'WORK', path: '/work' },
  { id: 'speaking', label: 'SPEAKING', path: '/speaking' },
  { id: 'impact', label: 'IMPACT', path: '/impact' },
  { id: 'books', label: 'BOOKS', path: '/books' },
  { id: 'blog', label: 'BLOG', path: '/blog' },
  { id: 'gallery', label: 'GALLERY', path: '/gallery' },
  { id: 'contact', label: 'ENQUIRIES', path: '/enquiries' },
];

export interface NavigationDrawerProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
  linkedinUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  substackUrl?: string;
}

export default function NavigationDrawer({
  activePage,
  onNavigate,
  isDarkMode,
  toggleDarkMode,
  linkedinUrl = 'https://www.linkedin.com/in/stephanieegharevba',
  instagramUrl = 'https://www.instagram.com/egharevba_stephanie',
  tiktokUrl = 'https://www.tiktok.com/@egharevba_stephanie?_r=1&_t=ZS-9B9xLrUfv1d',
  substackUrl = 'https://substack.com/@theunbiasproject',
}: NavigationDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [activePage]);

  // Escape key, WCAG 2.2 keyboard focus trap, and background isolation (inert) while drawer is open
  useEffect(() => {
    const mainContent = document.getElementById('main-content') || document.querySelector('main');
    const footerContent = document.querySelector('footer');

    if (!isOpen) {
      document.body.style.overflow = '';
      if (mainContent) {
        mainContent.removeAttribute('aria-hidden');
        mainContent.removeAttribute('inert');
      }
      if (footerContent) {
        footerContent.removeAttribute('aria-hidden');
        footerContent.removeAttribute('inert');
      }
      return;
    }

    document.body.style.overflow = 'hidden';

    if (mainContent) {
      mainContent.setAttribute('aria-hidden', 'true');
      mainContent.setAttribute('inert', '');
    }
    if (footerContent) {
      footerContent.setAttribute('aria-hidden', 'true');
      footerContent.setAttribute('inert', '');
    }

    const focusTimer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = '';
      if (mainContent) {
        mainContent.removeAttribute('aria-hidden');
        mainContent.removeAttribute('inert');
      }
      if (footerContent) {
        footerContent.removeAttribute('aria-hidden');
        footerContent.removeAttribute('inert');
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleSelectPage = (page: PageId) => {
    setIsOpen(false);
    onNavigate(page);
  };

  return (
    <>
      {/* Fixed Top Header Bar (Left Hamburger, Center Monogram Logo, Right On/Off Switch & "Let's Talk" Button) */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#FAF9F6]/95 dark:bg-[#0B0D13]/95 backdrop-blur-md border-b border-[#E6E4DD]/70 dark:border-[#262C3A]/70 transition-colors duration-200">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between px-4 sm:px-8 py-3.5 sm:py-4">
          {/* Left: Animated Hamburger Menu Trigger */}
          <div className="flex items-center">
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isOpen}
              aria-controls="navigation-drawer"
              className={`group relative flex flex-col justify-center items-start w-11 h-11 px-2 text-[#141413] dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] dark:focus-visible:ring-white rounded-full cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:bg-[#141413]/5 dark:hover:bg-white/10 active:scale-75 ${
                isOpen ? 'rotate-180 scale-105 bg-[#141413]/8 dark:bg-white/15' : 'rotate-0 scale-100'
              }`}
            >
              <span className="relative w-7 h-4 flex flex-col justify-between items-start">
                {/* Top bar */}
                <span
                  aria-hidden="true"
                  className={`h-[2.2px] bg-current rounded-full origin-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    isOpen
                      ? 'w-6 translate-y-[6.8px] rotate-45'
                      : 'w-7 translate-y-0 rotate-0 group-hover:w-4 group-hover:translate-x-1'
                  }`}
                />
                {/* Middle bar */}
                <span
                  aria-hidden="true"
                  className={`h-[2.2px] bg-current rounded-full transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    isOpen
                      ? 'w-0 opacity-0 translate-x-3 scale-0'
                      : 'w-4.5 opacity-100 translate-x-0 scale-100 group-hover:w-7'
                  }`}
                />
                {/* Bottom bar */}
                <span
                  aria-hidden="true"
                  className={`h-[2.2px] bg-current rounded-full origin-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    isOpen
                      ? 'w-6 -translate-y-[6.8px] -rotate-45'
                      : 'w-6 translate-y-0 rotate-0 group-hover:w-5 group-hover:translate-x-0.5'
                  }`}
                />
              </span>
            </button>
          </div>

          {/* Center: Elegant Signature Monogram / Brand Logo */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => onNavigate('overview')}
              aria-label="Stephanie Egharevba - Return to Homepage"
              className="group flex items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] dark:focus-visible:ring-white rounded-md transition-opacity hover:opacity-80"
            >
              <span className="font-serif italic text-3xl sm:text-4xl text-[#141413] dark:text-white tracking-normal select-none transition-transform duration-200 group-hover:scale-105">
                se
              </span>
            </button>
          </div>

          {/* Right: On/Off Pill Switch + "Let's Talk" Pill Action Button */}
          <div className="flex items-center gap-3 sm:gap-4">
            {toggleDarkMode && (
              <button
                type="button"
                role="switch"
                aria-checked={isDarkMode}
                onClick={toggleDarkMode}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                className="relative inline-flex items-center h-6.5 w-12 sm:h-7 sm:w-13 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] dark:focus-visible:ring-white cursor-pointer bg-[#D4D4D8] dark:bg-[#3F3F46] p-0.5 select-none"
              >
                <span className="sr-only">
                  {isDarkMode
                    ? 'Dark mode enabled. Click to switch to light mode'
                    : 'Light mode enabled. Click to switch to dark mode'}
                </span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5.5 w-5.5 sm:h-6 sm:w-6 rounded-full bg-white shadow-sm transform transition-transform duration-300 ease-in-out ${
                    isDarkMode ? 'translate-x-5.5 sm:translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate('contact')}
              aria-label="Let's Talk - Navigate to Enquiries and Contact page"
              className="inline-flex items-center justify-center bg-black text-white dark:bg-white dark:text-black rounded-full px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold tracking-tight shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer select-none"
            >
              Let&apos;s Talk
            </button>
          </div>
        </div>
      </header>

      {/* Screen-reader live status announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isOpen ? 'Navigation menu opened' : ''}
      </div>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/55 backdrop-blur-xs transition-opacity duration-400 delay-75 motion-reduce:transition-none ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Wide Editorial Drawer Panel (Matches Reference Proportions & Retains Brand Colors) */}
      <aside
        id="navigation-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site Navigation"
        aria-hidden={!isOpen}
        style={{ backgroundColor: '#0A0A0A', color: '#FFFFFF' }}
        className={`fixed top-0 right-0 z-50 h-[100dvh] w-[88vw] sm:w-[65vw] lg:w-[60vw] max-w-[840px] bg-neutral-950 text-white px-8 sm:px-14 md:px-16 py-5 sm:py-6 flex flex-col justify-between shadow-2xl transition-transform duration-500 delay-75 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none overflow-hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        {/* Top-Left Close Button & Theme Toggle (Matches Reference Layout) */}
        <div className="flex items-center justify-between shrink-0">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            tabIndex={isOpen ? 0 : -1}
            aria-label="Close navigation menu"
            className={`w-10 h-10 -ml-2 flex items-center justify-center text-neutral-300 hover:text-white hover:rotate-90 hover:scale-110 active:scale-75 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full ${
              isOpen ? 'rotate-0 scale-100 delay-150' : '-rotate-90 scale-50'
            }`}
          >
            <X className="w-7 h-7 stroke-[1.5]" aria-hidden="true" />
          </button>

          {toggleDarkMode && (
            <button
              type="button"
              onClick={toggleDarkMode}
              tabIndex={isOpen ? 0 : -1}
              className="text-xs uppercase tracking-widest text-neutral-400 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded px-2 py-1"
            >
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          )}
        </div>

        {/* Monumental Stacked Navigation Links - 9 items scaled to 6.8vh to fill 100dvh boldly without scrolling */}
        <nav aria-label="Main menu" className="my-auto py-1">
          <ul className="flex flex-col space-y-0.5 sm:space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activePage === item.id;

              return (
                <li key={item.id} className="relative block w-fit">
                  <a
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      if (isActive) {
                        handleClose();
                      } else {
                        handleSelectPage(item.id);
                      }
                    }}
                    tabIndex={isOpen ? 0 : -1}
                    aria-current={isActive ? 'page' : undefined}
                    className={`nav-display-font nav-dynamic-size font-display relative inline-block font-bold uppercase tracking-[-0.03em] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-current rounded cursor-pointer ${
                      isActive && isOpen
                        ? 'nav-item-active-dim'
                        : 'text-white hover:opacity-70'
                    }`}
                  >
                    <span>{item.label}</span>

                    {isActive && (
                      <span className="sr-only"> (Current page)</span>
                    )}

                    {/* Horizontal Strikethrough Line on Active Link */}
                    {isActive && isOpen && (
                      <span
                        aria-hidden="true"
                        className="nav-item-strike"
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Hairline Divider & Name + Social Icons Row */}
        <div className="pt-4 border-t border-white/15 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-xs sm:text-sm font-medium uppercase tracking-[0.14em] text-neutral-300">
            STEPHANIE EGHAREVBA
          </span>

          <div className="flex items-center gap-5 text-neutral-300">
            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={isOpen ? 0 : -1}
                aria-label="LinkedIn (opens in a new tab)"
                className="hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded p-1"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={isOpen ? 0 : -1}
                aria-label="Instagram (opens in a new tab)"
                className="hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded p-1"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {tiktokUrl && (
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={isOpen ? 0 : -1}
                aria-label="TikTok (opens in a new tab)"
                className="hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded p-1"
              >
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.31 0 .61.05.89.14V9.38a6.34 6.34 0 0 0-.89-.06A6.34 6.34 0 0 0 3 15.67a6.34 6.34 0 0 0 6.34 6.33 6.34 6.34 0 0 0 6.34-6.33V8.8a8.28 8.28 0 0 0 4.91 1.6V6.95a4.84 4.84 0 0 1-1-.26z" />
                </svg>
              </a>
            )}
            {substackUrl && (
              <a
                href={substackUrl}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={isOpen ? 0 : -1}
                aria-label="Substack (opens in a new tab)"
                className="inline-flex items-center gap-1 text-xs uppercase tracking-wider hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded p-1"
              >
                Substack <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}
            <a
              href="mailto:hello@stephanieegharevba.com"
              tabIndex={isOpen ? 0 : -1}
              aria-label="Send email"
              className="hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded p-1"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}

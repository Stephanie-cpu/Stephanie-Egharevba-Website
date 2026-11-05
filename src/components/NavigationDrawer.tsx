import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Instagram, Linkedin } from 'lucide-react';
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
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  linkedinUrl: string;
  instagramUrl: string;
  tiktokUrl?: string;
  substackUrl: string;
}

export default function NavigationDrawer({
  activePage,
  onNavigate,
  isDarkMode,
  toggleDarkMode,
  linkedinUrl,
  instagramUrl,
  tiktokUrl = 'https://www.tiktok.com/@egharevba_stephanie?_r=1&_t=ZS-9B9xLrUfv1d',
  substackUrl,
}: NavigationDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
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

    // Isolate background page content from screen readers and keyboard navigation
    if (mainContent) {
      mainContent.setAttribute('aria-hidden', 'true');
      mainContent.setAttribute('inert', '');
    }
    if (footerContent) {
      footerContent.setAttribute('aria-hidden', 'true');
      footerContent.setAttribute('inert', '');
    }

    // Focus the close button when drawer opens
    const focusTimer = setTimeout(() => {
      closeBtnRef.current?.focus();
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
      {/* Fixed Top Header Bar (Matching Reference: Left Hamburger, Center Monogram Logo, Right On/Off Switch & "Let's Talk" Button) */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#FAF9F6]/95 dark:bg-[#0B0D13]/95 backdrop-blur-md border-b border-[#E6E4DD]/70 dark:border-[#262C3A]/70 transition-colors duration-200">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between px-4 sm:px-8 py-3.5 sm:py-4">
          
          {/* Left: Hamburger Menu Trigger (3 Horizontal Lines) */}
          <div className="flex items-center">
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={isOpen}
              aria-controls="site-navigation-drawer"
              className="flex flex-col justify-center items-start w-10 h-10 space-y-1.5 text-[#141413] dark:text-white hover:opacity-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] rounded-lg cursor-pointer transition-opacity"
            >
              <span className="w-7 h-[2px] bg-current transition-all" aria-hidden="true" />
              <span className="w-5 h-[2px] bg-current transition-all" aria-hidden="true" />
              <span className="w-7 h-[2px] bg-current transition-all" aria-hidden="true" />
            </button>
          </div>

          {/* Center: Elegant Signature Monogram / Brand Logo */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => onNavigate('overview')}
              aria-label="Stephanie Egharevba - Return to Homepage"
              className="group flex items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] rounded-md transition-opacity hover:opacity-80"
            >
              {/* Delicate cursive monogram "se" inspired by designer signature logos */}
              <span className="font-serif italic text-3xl sm:text-4xl text-[#141413] dark:text-white tracking-normal select-none transition-transform duration-200 group-hover:scale-105">
                se
              </span>
            </button>
          </div>

          {/* Right: On/Off Pill Switch + "Let's Talk" Pill Action Button */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Accessible On/Off Pill Switch (Matching Attached Reference) */}
            {toggleDarkMode && (
              <button
                type="button"
                role="switch"
                aria-checked={isDarkMode}
                onClick={toggleDarkMode}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                className="relative inline-flex items-center h-6.5 w-12 sm:h-7 sm:w-13 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] dark:focus-visible:ring-[#60A5FA] cursor-pointer bg-[#D4D4D8] dark:bg-[#3F3F46] p-0.5 select-none"
              >
                <span className="sr-only">
                  {isDarkMode ? 'Dark mode enabled. Click to switch to light mode' : 'Light mode enabled. Click to switch to dark mode'}
                </span>
                {/* Sliding circular toggle thumb */}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5.5 w-5.5 sm:h-6 sm:w-6 rounded-full bg-white shadow-sm transform transition-transform duration-300 ease-in-out ${
                    isDarkMode ? 'translate-x-5.5 sm:translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            )}

            {/* "Let's Talk" Pill Button (Directly opens enquiries / contact) */}
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
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Right Slide-out Panel (Steven Bartlett Style) */}
      <aside
        id="site-navigation-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site Navigation"
        aria-hidden={!isOpen}
        style={{ backgroundColor: '#111111', color: '#FFFFFF' }}
        className={`fixed top-0 right-0 z-50 h-full w-[82vw] max-w-[380px] sm:w-[420px] md:w-[460px] bg-neutral-900 text-white p-8 sm:p-12 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out motion-reduce:transition-none overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        {/* Top bar inside drawer: Close (✕) button */}
        <div className="flex justify-end">
          <button
            ref={closeBtnRef}
            type="button"
            onClick={handleClose}
            tabIndex={isOpen ? 0 : -1}
            aria-label="Close navigation menu"
            style={{ color: '#FFFFFF' }}
            className="w-11 h-11 flex items-center justify-center text-3xl font-light text-white hover:opacity-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg transition-opacity cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Navigation List */}
        <nav aria-label="Main menu" className="my-auto py-6">
          <ul className="space-y-5 sm:space-y-6">
            {NAV_ITEMS.map((item) => {
              const isActive = activePage === item.id;

              return (
                <li key={item.id}>
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
                    className={`relative inline-block text-2xl sm:text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tight transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded ${
                      isActive && isOpen
                        ? 'animate-strike-active'
                        : 'text-white hover:text-neutral-300 cursor-pointer'
                    }`}
                  >
                    <span>{item.label}</span>

                    {/* Accessible text for screen readers explaining the strikethrough */}
                    {isActive && (
                      <span className="sr-only"> (Current page)</span>
                    )}

                    {/* Pure white dynamic strike line */}
                    {isActive && isOpen && (
                      <span
                        aria-hidden="true"
                        className="animate-strike-line"
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer: Clean Social Icons (Dark Mode and URL removed as requested) */}
        <div className="pt-6 border-t border-neutral-800">
          <div className="flex items-center gap-3">
            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={isOpen ? 0 : -1}
                aria-label="Open Stephanie Egharevba's LinkedIn profile in a new tab"
                style={{ color: '#A3A3A3' }}
                className="w-10 h-10 rounded-lg border border-neutral-800 flex items-center justify-center hover:border-neutral-600 hover:text-white transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={isOpen ? 0 : -1}
                aria-label="Open Stephanie Egharevba's Instagram profile in a new tab"
                style={{ color: '#A3A3A3' }}
                className="w-10 h-10 rounded-lg border border-neutral-800 flex items-center justify-center hover:border-neutral-600 hover:text-white transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {tiktokUrl && (
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={isOpen ? 0 : -1}
                aria-label="Open Stephanie Egharevba's TikTok profile in a new tab"
                style={{ color: '#A3A3A3' }}
                className="w-10 h-10 rounded-lg border border-neutral-800 flex items-center justify-center hover:border-neutral-600 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
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
                aria-label="Open Stephanie Egharevba's Substack (The Unbias Project) in a new tab"
                style={{ color: '#A3A3A3' }}
                className="w-10 h-10 rounded-lg border border-neutral-800 flex items-center justify-center hover:border-neutral-600 hover:text-white transition-colors"
              >
                <BookOpen className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

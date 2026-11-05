import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Instagram, Linkedin, Moon, Sun } from 'lucide-react';
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
  { id: 'books', label: 'BOOKS', path: '/books' },
  { id: 'blog', label: 'BLOG', path: '/blog' },
  { id: 'gallery', label: 'GALLERY', path: '/gallery' },
  { id: 'contact', label: 'ENQUIRIES', path: '/enquiries' },
];

interface NavigationDrawerProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  linkedinUrl: string;
  instagramUrl: string;
  substackUrl: string;
}

export default function NavigationDrawer({
  activePage,
  onNavigate,
  isDarkMode,
  toggleDarkMode,
  linkedinUrl,
  instagramUrl,
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

  // Escape key & WCAG 2.2 keyboard focus trap while drawer is open
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

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
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
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
      {/* Top Header Bar (Unified across Mobile, Tablet, and Desktop) */}
      <header className="sticky top-0 left-0 right-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E6E4DD]">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
          <button
            type="button"
            onClick={() => onNavigate('overview')}
            aria-label="Stephanie Egharevba - Return to Homepage"
            className="text-lg sm:text-xl font-display font-bold tracking-tight uppercase text-[#141413] cursor-pointer text-left"
          >
            Stephanie Egharevba
          </button>

          {/* Global Hamburger Trigger (Visible on both mobile & desktop) */}
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isOpen}
            aria-controls="site-navigation-drawer"
            className="flex flex-col justify-center items-center w-11 h-11 space-y-1.5 text-[#141413] hover:opacity-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] rounded-lg cursor-pointer transition-opacity"
          >
            <span className="w-7 h-[2px] bg-current transition-all" />
            <span className="w-7 h-[2px] bg-current transition-all" />
            <span className="w-5 self-end mr-2 h-[2px] bg-current transition-all" />
          </button>
        </div>
      </header>

      {/* Screen-reader live status announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isOpen ? 'Navigation menu opened' : ''}
      </div>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
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
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] md:w-[480px] bg-neutral-900 text-white p-8 sm:p-12 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out overflow-y-auto ${
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
        <nav aria-label="Primary site navigation" className="my-auto py-6">
          <ul className="space-y-5 sm:space-y-6">
            {NAV_ITEMS.map((item) => {
              const isActive = activePage === item.id;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectPage(item.id)}
                    tabIndex={isOpen ? 0 : -1}
                    aria-current={isActive ? 'page' : undefined}
                    style={{ color: isActive ? '#737373' : '#FFFFFF' }}
                    className={`relative inline-block text-2xl sm:text-3xl md:text-4xl font-display font-extrabold tracking-tight transition-colors duration-200 text-left ${
                      isActive
                        ? 'text-neutral-500 opacity-60 cursor-default'
                        : 'text-white hover:text-neutral-300 cursor-pointer'
                    }`}
                  >
                    <span>{item.label}</span>

                    {/* Strikethrough line for active page */}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        style={{ backgroundColor: '#A3A3A3' }}
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[3px] bg-neutral-400"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer info, Social Icons & Dark Mode Switch */}
        <div className="pt-6 border-t border-neutral-800 space-y-4">
          <div className="flex items-center gap-3">
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
          </div>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={toggleDarkMode}
              tabIndex={isOpen ? 0 : -1}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{ color: '#D4D4D4' }}
              className="font-medium tracking-wide text-neutral-300 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>LIGHT MODE</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-blue-400" />
                  <span>DARK MODE</span>
                </>
              )}
            </button>

            <span
              style={{ color: '#737373' }}
              className="text-xs text-neutral-500 uppercase tracking-widest font-mono"
            >
              stephanieegharevba.com
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}

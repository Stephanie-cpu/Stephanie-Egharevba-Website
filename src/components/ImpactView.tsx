import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Quote,
  Search,
  CheckCircle2,
  Calendar,
  Linkedin,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  RECOMMENDATIONS_DATA,
  RecommendationItem,
  PageId,
} from '../data/portfolioData';

interface ImpactViewProps {
  onNavigate: (page: PageId) => void;
  reduceMotion?: boolean;
}

const CATEGORIES = [
  'All',
  'Keynote Speaking',
  'WCAG & Accessibility',
  'D&I Strategy',
  'Youth Leadership',
] as const;

export function ImpactView({ onNavigate, reduceMotion = false }: ImpactViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredRecommendations = useMemo(() => {
    return RECOMMENDATIONS_DATA.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;

      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.role.toLowerCase().includes(q) ||
        item.fullQuote.toLowerCase().includes(q) ||
        item.relationship.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <motion.div
      key="page-impact"
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12"
    >
      {/* Header section matching editorial tone */}
      <div className="border-b border-[#E6E4DD] dark:border-neutral-800 pb-8 space-y-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#1D4ED8] dark:text-[#60A5FA]">
            Endorsements &amp; Peer Reviews
          </span>
          <span className="text-neutral-400 dark:text-neutral-600">·</span>
          <span className="inline-flex items-center gap-1 text-xs font-mono text-neutral-500 dark:text-neutral-400">
            <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
            Verified on LinkedIn
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-[#141413] dark:text-white">
          My Impact
        </h1>

        <p className="text-base sm:text-lg text-[#575652] dark:text-neutral-300 max-w-[65ch] leading-relaxed">
          Reflections from conference hosts, corporate clients, mentors, and collaborators
          on Stephanie’s work across digital accessibility, keynote speaking, and disability inclusion strategy.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        {/* Category Pills */}
        <div
          role="tablist"
          aria-label="Filter recommendations by category"
          className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none"
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count =
              cat === 'All'
                ? RECOMMENDATIONS_DATA.length
                : RECOMMENDATIONS_DATA.filter((i) => i.category === cat).length;

            return (
              <button
                key={cat}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-[#1D4ED8] text-white shadow-sm'
                    : 'bg-[#F3F4F6] text-neutral-700 hover:bg-[#E5E7EB] dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {cat} <span className="opacity-75 text-xs font-normal">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recommendations..."
            aria-label="Search recommendations by name or keyword"
            className="w-full bg-[#F3F4F6] dark:bg-neutral-800 border border-transparent focus:border-[#1D4ED8] dark:focus:border-[#60A5FA] rounded-full pl-9 pr-4 py-2 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Recommendations Grid */}
      {filteredRecommendations.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#F8F9FA] dark:bg-neutral-900/50 rounded-2xl border border-dashed border-[#E5E7EB] dark:border-neutral-800">
          <Quote className="w-8 h-8 mx-auto text-neutral-400 mb-2 opacity-50" />
          <p className="text-base font-semibold text-neutral-900 dark:text-white">
            No recommendations match &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Try resetting your search query or selecting a different category filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-4 px-4 py-1.5 text-xs font-medium text-[#1D4ED8] hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
          <AnimatePresence mode="popLayout">
            {filteredRecommendations.map((rec, index) => {
              const isExpanded = Boolean(expandedCards[rec.id]);
              const paragraphs = rec.fullQuote.split('\n\n').filter(Boolean);
              const isLong = paragraphs.length > 1 || rec.fullQuote.length > 280;

              return (
                <motion.article
                  key={rec.id}
                  layout
                  initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="rounded-2xl bg-[#ECECEC] dark:bg-[#1A1F2C] p-6 sm:p-7 border border-transparent hover:border-[#CBD5E1] dark:hover:border-neutral-700 transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Top Meta: Verified Badge + Date */}
                    <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="inline-flex items-center gap-1.5 font-medium text-[#0A66C2] dark:text-[#60A5FA]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Received Recommendation</span>
                      </span>
                      <time dateTime={rec.date} className="font-mono text-[11px]">
                        {rec.date}
                      </time>
                    </div>

                    {/* Relationship Badge */}
                    <div className="inline-block bg-[#DFE2E6] dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 text-[11px] font-medium px-2.5 py-1 rounded-md">
                      {rec.relationship}
                    </div>

                    {/* Recommendation Text */}
                    <div className="text-sm sm:text-[15px] leading-relaxed text-[#1F2937] dark:text-[#E2E8F0] space-y-3 pt-1">
                      {isLong && !isExpanded ? (
                        <>
                          <p>&ldquo;{rec.highlightQuote}&rdquo;</p>
                          <button
                            type="button"
                            onClick={() => toggleExpand(rec.id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D4ED8] dark:text-[#60A5FA] hover:underline cursor-pointer pt-1"
                          >
                            <span>Read full recommendation</span>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          {paragraphs.map((p, pIdx) => (
                            <p key={pIdx}>
                              {pIdx === 0 && '&ldquo;'}
                              {p}
                              {pIdx === paragraphs.length - 1 && '&rdquo;'}
                            </p>
                          ))}
                          {isLong && (
                            <button
                              type="button"
                              onClick={() => toggleExpand(rec.id)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer pt-1"
                            >
                              <span>Show less</span>
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Author Card Footer */}
                  <div className="mt-6 pt-5 border-t border-[#D6D9DE] dark:border-neutral-800 flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <h2 className="font-bold text-base text-[#111827] dark:text-white leading-snug">
                        {rec.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#1D4ED8] dark:text-[#60A5FA] font-medium leading-snug">
                        {rec.shortRole}
                      </p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                        {rec.role}
                      </p>
                    </div>

                    <a
                      href="https://www.linkedin.com/in/egharevbastephanie"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${rec.name}'s recommendation on Stephanie's LinkedIn profile`}
                      className="p-2 rounded-full text-neutral-400 hover:text-[#0A66C2] hover:bg-white dark:hover:bg-neutral-800 transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Collaboration Call to Action Banner */}
      <section
        aria-labelledby="impact-cta-heading"
        className="rounded-3xl bg-[#0F172A] text-white p-8 sm:p-12 relative overflow-hidden"
      >
        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#60A5FA]">
            <span>LET’S CREATE IMPACT TOGETHER</span>
          </div>
          <h2
            id="impact-cta-heading"
            className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white"
          >
            Bring Stephanie to Your Next Conference or Project
          </h2>
          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
            Whether you need a keynote speaker to inspire your audience, an audit of your digital products against WCAG 2.2 standards, or tailored disability inclusion strategy.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="bg-[#2563EB] hover:bg-blue-600 active:scale-95 text-white font-medium text-sm px-6 py-3 rounded-full transition-all inline-flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Get in Touch</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="https://calendar.app.google/HMDVYAq5z6YdywrE9"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 text-white font-medium text-sm px-6 py-3 rounded-full transition-all inline-flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book 1-on-1 Consultation</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
export default ImpactView;

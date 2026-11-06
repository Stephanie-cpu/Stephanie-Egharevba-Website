import React from 'react';
import { motion } from 'framer-motion';
import { RECOMMENDATIONS_DATA } from '../data/portfolioData';

interface MyImpactSectionProps {
  onNavigateToImpact: () => void;
  reduceMotion?: boolean;
}

export default function MyImpactSection({
  onNavigateToImpact,
  reduceMotion = false,
}: MyImpactSectionProps) {
  // Select the 3 featured recommendations for the home screen
  const featured = RECOMMENDATIONS_DATA.filter((item) => item.featuredOnHome).slice(0, 3);

  return (
    <section
      aria-labelledby="my-impact-heading"
      className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16"
    >
      {/* Editorial Header: "MY IMPACT" in bold blue + horizontal accent rule */}
      <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-10">
        <h2
          id="my-impact-heading"
          className="text-xl sm:text-2xl font-bold tracking-wider text-[#1D4ED8] dark:text-[#3B82F6] uppercase whitespace-nowrap"
        >
          MY IMPACT &amp; CLIENT ENDORSEMENTS
        </h2>
        <div
          className="flex-1 h-[2px] bg-[#D9DDE2] dark:bg-neutral-800 relative flex items-center justify-end"
          aria-hidden="true"
        >
          <div className="w-12 sm:w-20 h-[3px] bg-[#1D4ED8] dark:bg-[#3B82F6]" />
        </div>
      </div>

      {/* 3 Featured Testimonial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 items-stretch">
        {featured.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="rounded-2xl bg-[#ECECEC] dark:bg-[#1A1F2C] p-6 sm:p-7 flex flex-col justify-between border border-transparent hover:border-[#CBD5E1] dark:hover:border-neutral-700 transition-all duration-200"
          >
            {/* Quote Body */}
            <div>
              <blockquote className="text-sm sm:text-[15px] leading-relaxed text-[#1F2937] dark:text-[#E2E8F0]">
                &ldquo;{item.highlightQuote}&rdquo;
              </blockquote>
            </div>

            {/* Author Footer with Divider */}
            <div className="mt-6 pt-5 border-t border-[#D6D9DE] dark:border-neutral-800">
              <div className="font-bold text-base text-[#111827] dark:text-white">
                {item.name}
              </div>
              <div className="text-xs sm:text-sm font-medium text-[#1D4ED8] dark:text-[#60A5FA] mt-1 leading-snug">
                {item.shortRole}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Descriptive, Keyword-Rich CTA Link (Replaces generic "View More") */}
      <div className="mt-10 sm:mt-12 flex justify-center">
        <a
          href="/impact"
          onClick={(e) => {
            e.preventDefault();
            onNavigateToImpact();
          }}
          aria-label="Read all client and conference speaker endorsements for Stephanie Egharevba"
          className="bg-[#2563EB] hover:bg-blue-700 active:scale-95 text-white text-sm sm:text-base font-semibold px-9 py-3 rounded-full transition-all duration-200 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2"
        >
          Read All Client &amp; Speaker Endorsements
        </a>
      </div>
    </section>
  );
}

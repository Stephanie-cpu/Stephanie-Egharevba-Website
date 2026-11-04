import React from 'react';
import { BookItem } from '../data/portfolioData';

interface BookMockupProps {
  book: BookItem;
}

export const BookMockup: React.FC<BookMockupProps> = ({ book }) => {
  return (
    <div className="relative mx-auto w-full py-5 px-3 flex items-center justify-center bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]/80 overflow-hidden select-none">
      {/* Floor contact shadow */}
      <div
        aria-hidden="true"
        className="absolute bottom-2.5 w-44 sm:w-52 h-4 rounded-full bg-black/20 blur-md pointer-events-none"
      />

      {/* 3D Physical Hardcover Book Object */}
      <div className="relative group-hover:-translate-y-2 transition-transform duration-500 flex items-stretch">
        {/* Book Spine Crease & Left Binding */}
        <div
          aria-hidden="true"
          className="w-3 rounded-l-[4px] border-y border-l border-black/25 shrink-0"
          style={{
            background: `linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.2) 100%), ${book.coverBg}`,
          }}
        />

        {/* Front Cover Plate */}
        <div
          className="relative w-[196px] sm:w-[214px] h-[278px] rounded-r-[5px] border border-black/15 shadow-[12px_16px_32px_-6px_rgba(15,23,42,0.45)] overflow-hidden flex flex-col justify-between"
          style={{ backgroundColor: book.coverBg }}
        >
          {book.coverImageUrl ? (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <img
                src={book.coverImageUrl}
                alt={`${book.title} cover`}
                loading="lazy"
                className={`w-full h-full ${
                  book.id === 'book-accessibility-made-easy'
                    ? 'object-contain p-3'
                    : 'object-cover object-top'
                }`}
              />

              {/* Spine edge shadow & subtle glossy sheen */}
              <div
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/45 via-black/15 to-transparent pointer-events-none"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/15 pointer-events-none"
              />
            </div>
          ) : (
            <div className="p-5 flex flex-col justify-between h-full text-white">
              <div className="text-[10px] font-mono tracking-wider" style={{ color: book.accentColor }}>
                {book.tag}
              </div>
              <div className="my-auto space-y-1">
                <div className="font-display font-bold text-lg text-white">{book.title}</div>
                <div className="text-xs text-white/70">{book.subtitle}</div>
              </div>
              <div className="text-[10px] font-semibold text-white/80 uppercase">
                Stephanie Egharevba
              </div>
            </div>
          )}
        </div>

        {/* Right Page-Edge Stack Illusion */}
        <div
          aria-hidden="true"
          className="my-1.5 w-2.5 rounded-r-[2px] bg-gradient-to-r from-[#CBD5E1] via-[#F8FAFC] to-[#94A3B8] border-y border-r border-slate-300 shadow-xs shrink-0"
        />
      </div>
    </div>
  );
};

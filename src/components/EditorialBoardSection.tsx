import React, { useState } from 'react';

interface EditorialBoardSectionProps {
  editorialBoardImage?: string | null;
}

export const EditorialBoardSection: React.FC<EditorialBoardSectionProps> = ({
  editorialBoardImage,
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const permanentPosterSrc =
    editorialBoardImage || `${import.meta.env.BASE_URL}editorial-board-2026.jpg`;

  return (
    <section
      id="editorial-board"
      className="max-w-[1120px] mx-auto w-full px-4 sm:px-6 pt-16 sm:pt-24 pb-8"
    >
      {/* Section Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10 border-b border-[#E6D5C1] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-[#800020] text-[12px] font-semibold tracking-widest uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#800020]" />
            <span>MEET THE TEAM · RITHU 2026</span>
          </div>
          <h2 className="text-[32px] sm:text-[42px] leading-[1.1] font-bold text-[#1F040A] tracking-tight font-serif">
            Editorial Board
          </h2>
          <p className="text-[15px] text-[#5C3A42] mt-1.5 max-w-xl">
            The voices, editors, and creators behind the 2026 annual edition of Rithu at College of Engineering Munnar.
          </p>
        </div>
      </div>

      {/* Permanent Poster Showcase Frame */}
      <div className="w-full max-w-[860px] mx-auto rounded-[20px] p-3 sm:p-5 bg-[#F3E6D5]/75 border border-[#E6D5C1] transition-all shadow-xl">
        <div className="relative group rounded-[14px] overflow-hidden bg-[#0E0E0E] shadow-2xl">
          <img
            src={permanentPosterSrc}
            alt="Rithu 2026 Editorial Board — Staff Editor Manoj R, Student Editor Adhil P A, and Editorial Team"
            referrerPolicy="no-referrer"
            onClick={() => setIsLightboxOpen(true)}
            className="w-full h-auto block cursor-zoom-in"
          />
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="absolute bottom-4 right-4 px-3.5 py-1.5 rounded-lg bg-black/70 hover:bg-[#800020] text-[#FFF9F2] text-[12px] font-medium backdrop-blur-md flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">zoom_in</span>
            <span>View Full Poster</span>
          </button>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal when clicking the Editorial Board Poster */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fadeIn cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[92vh] overflow-auto rounded-xl shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="fixed top-5 right-5 w-10 h-10 rounded-full bg-[#800020] text-[#FFF9F2] flex items-center justify-center shadow-lg cursor-pointer hover:bg-[#660019]"
              aria-label="Close full poster view"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
            <img
              src={permanentPosterSrc}
              alt="Rithu 2026 Editorial Board Full Poster"
              referrerPolicy="no-referrer"
              className="w-full h-auto block rounded-lg"
            />
          </div>
        </div>
      )}
    </section>
  );
};

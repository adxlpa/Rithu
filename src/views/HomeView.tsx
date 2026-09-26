import React from 'react';
import { ViewMode } from '../types';

interface HomeViewProps {
  onNavigate: (view: ViewMode) => void;
  onPlayAudioDirect: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onPlayAudioDirect }) => {
  return (
    <div className="flex flex-col w-full pb-24 animate-fadeIn bg-[#FFF9F2] text-[#1F040A]">
      {/* Hero Section */}
      <section className="max-w-[1120px] mx-auto w-full px-4 sm:px-6 pt-12 sm:pt-20 pb-16 flex flex-col items-center text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 text-[#800020] text-[12px] font-semibold tracking-widest uppercase mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#800020]"></span>
            <span>College of Engineering Munnar · 2026</span>
          </div>

          <h1 className="text-[48px] sm:text-[68px] leading-[1.05] font-bold text-[#800020] tracking-[-0.03em] mb-4 font-serif">
            Rithu
          </h1>
          <p className="text-[18px] sm:text-[21px] text-[#5C3A42] font-normal mb-8 tracking-tight max-w-lg leading-relaxed">
            Read it. Hear it. Relive it.
            <br />
            <span className="text-[15px] sm:text-[17px] text-[#5C3A42]/90 block mt-1.5">
              A collection of voices, memories, creativity, and moments from the College of Engineering Munnar.
            </span>
          </p>

          /*<div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
            <button
              onClick={() => onNavigate('magazine')}
              className="inline-flex items-center justify-center px-8 h-12 bg-[#800020] hover:bg-[#660019] text-[#FFF9F2] text-[15px] font-semibold rounded-[10px] shadow-md shadow-[#800020]/20 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              Read Magazine
            </button>
            <div className="flex items-center gap-3.5 text-[15px] font-semibold text-[#1F040A]">
              <button
                onClick={() => onNavigate('audio')}
                className="hover:text-[#800020] transition-colors underline-offset-4 hover:underline cursor-pointer whitespace-nowrap"
              >
                Listen
              </button>
              <span className="text-[#800020] select-none">·</span>
              <button
                onClick={() => onNavigate('video')}
                className="hover:text-[#800020] transition-colors underline-offset-4 hover:underline cursor-pointer whitespace-nowrap"
              >
                Watch
              </button>
            </div>
          </div>*/
        </div>

        {/* Panoramic Landscape Hero Image */}
        <div className="w-full mt-14 sm:mt-18">
          <div
            onClick={() => onNavigate('magazine')}
            className="group relative w-full aspect-[21/9] min-h-[280px] max-h-[540px] rounded-[16px] overflow-hidden bg-[#F3E6D5] border border-[#E6D5C1] shadow-xl transition-all duration-300 cursor-pointer"
          >
            <img
              src="https://imguser.free.nf/uploads/0_1790440794_6ab7f55a9e0f2_title.jpg"
              alt="Misty tea plantations and hills surrounding College of Engineering Munnar campus"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent flex items-end p-6 sm:p-8">
              <span className="text-[#FFF9F2] text-[14px] font-semibold flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#800020] hover:bg-[#660019] shadow-md transition-colors">
                Open 3D Flipbook Magazine <span className="text-sm">→</span>
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center mt-3 px-1 text-[#5C3A42]">
            <p className="text-[12px] font-medium text-left">The Annual Edition Magazine · CE Munnar 2026</p>
            <p className="text-[12px] font-medium text-right opacity-80">Digital Issue</p>
          </div>
        </div>
      </section>

      {/* 3 Pillar Cards Section */}
      <section className="max-w-[1120px] mx-auto w-full px-4 sm:px-6 pb-20 sm:pb-28">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {/* Card 1: Magazine */}
          <article
            onClick={() => onNavigate('magazine')}
            className="flex flex-col group cursor-pointer bg-[#F3E6D5]/65 hover:bg-[#F3E6D5] border border-[#E6D5C1] hover:border-[#800020]/40 p-5 rounded-[16px] transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <div className="w-full aspect-[4/5] rounded-[12px] overflow-hidden bg-[#EAD8C3] mb-5 relative border border-[#E6D5C1]">
              <img
                src="https://imguser.free.nf/uploads/0_1790441180_6ab7f6dc35e76_ChatGPTImageMar12202602_29_59PM.png"
                alt="Rithu Magazine Cover"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
            </div>
            <div className="flex flex-col flex-1">
              <h2 className="text-[22px] font-semibold text-[#1F040A] mb-1.5 tracking-tight group-hover:text-[#800020] transition-colors">
                Magazine
              </h2>
              <p className="text-[14px] leading-relaxed text-[#5C3A42] mb-4">
                Explore Rithu, our college magazine, bringing together the creativity, experiences, achievements, and memories of the CEM community.
              </p>
              <div className="mt-auto pt-1">
                <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#800020] group-hover:translate-x-1 transition-all">
                  Read Magazine <span className="text-sm font-normal">→</span>
                </span>
              </div>
            </div>
          </article>

          {/* Card 2: Video */}
          <article
            onClick={() => onNavigate('video')}
            className="flex flex-col group cursor-pointer bg-[#F3E6D5]/65 hover:bg-[#F3E6D5] border border-[#E6D5C1] hover:border-[#800020]/40 p-5 rounded-[16px] transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <div className="w-full aspect-[4/5] rounded-[12px] overflow-hidden bg-[#EAD8C3] mb-5 relative border border-[#E6D5C1]">
              <img
                src="https://imguser.free.nf/uploads/0_1790441528_6ab7f838f2825_IMG_60512.jpg"
                alt="Atmospheric festival night at Munnar campus amphitheatre"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
            </div>
            <div className="flex flex-col flex-1">
              <h2 className="text-[22px] font-semibold text-[#1F040A] mb-1.5 tracking-tight group-hover:text-[#800020] transition-colors">
                Video
              </h2>
              <p className="text-[14px] leading-relaxed text-[#5C3A42] mb-4">
                Relive the events, celebrations, activities, and moments that shaped life at the College of Engineering Munnar.
              </p>
              <div className="mt-auto pt-1">
                <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#800020] group-hover:translate-x-1 transition-all">
                  Watch Events <span className="text-sm font-normal">→</span>
                </span>
              </div>
            </div>
          </article>

          {/* Card 3: Audio */}
          <article
            onClick={() => {
              onPlayAudioDirect();
              onNavigate('audio');
            }}
            className="flex flex-col group cursor-pointer bg-[#F3E6D5]/65 hover:bg-[#F3E6D5] border border-[#E6D5C1] hover:border-[#800020]/40 p-5 rounded-[16px] transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <div className="w-full aspect-[4/5] rounded-[12px] bg-[#FFF9F2] border border-[#E6D5C1] mb-5 p-6 flex flex-col justify-between transition-all duration-300 group-hover:border-[#800020]/30">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#800020] tracking-wider uppercase">
                  Audio Book
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#D45060] animate-pulse"></span>
              </div>

              {/* Dynamic Sound Waveform Graphic */}
              <div className="my-auto py-4">
                <svg
                  className="w-full h-24 text-[#800020] group-hover:text-[#D45060] transition-colors duration-300"
                  viewBox="0 0 240 60"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="0" y="24" width="3" height="12" rx="1.5" fill="currentColor" opacity="0.3"></rect>
                  <rect x="8" y="20" width="3" height="20" rx="1.5" fill="currentColor" opacity="0.4"></rect>
                  <rect x="16" y="14" width="3" height="32" rx="1.5" fill="currentColor" opacity="0.6"></rect>
                  <rect x="24" y="22" width="3" height="16" rx="1.5" fill="currentColor" opacity="0.4"></rect>
                  <rect x="32" y="8" width="3" height="44" rx="1.5" fill="currentColor" opacity="0.8"></rect>
                  <rect x="40" y="16" width="3" height="28" rx="1.5" fill="currentColor" opacity="0.5"></rect>
                  <rect x="48" y="26" width="3" height="8" rx="1.5" fill="currentColor" opacity="0.3"></rect>
                  <rect x="56" y="12" width="3" height="36" rx="1.5" fill="currentColor" opacity="0.7"></rect>
                  <rect x="64" y="4" width="3" height="52" rx="1.5" fill="currentColor" opacity="0.9"></rect>
                  <rect x="72" y="18" width="3" height="24" rx="1.5" fill="currentColor" opacity="0.6"></rect>
                  <rect x="80" y="10" width="3" height="40" rx="1.5" fill="currentColor" opacity="0.75"></rect>
                  <rect x="88" y="22" width="3" height="16" rx="1.5" fill="currentColor" opacity="0.4"></rect>
                  <rect x="96" y="14" width="3" height="32" rx="1.5" fill="currentColor" opacity="0.65"></rect>
                  <rect x="104" y="2" width="3" height="56" rx="1.5" fill="currentColor"></rect>
                  <rect x="112" y="16" width="3" height="28" rx="1.5" fill="currentColor" opacity="0.7"></rect>
                  <rect x="120" y="24" width="3" height="12" rx="1.5" fill="currentColor" opacity="0.4"></rect>
                  <rect x="128" y="10" width="3" height="40" rx="1.5" fill="currentColor" opacity="0.8"></rect>
                  <rect x="136" y="6" width="3" height="48" rx="1.5" fill="currentColor" opacity="0.85"></rect>
                  <rect x="144" y="20" width="3" height="20" rx="1.5" fill="currentColor" opacity="0.5"></rect>
                  <rect x="152" y="12" width="3" height="36" rx="1.5" fill="currentColor" opacity="0.7"></rect>
                  <rect x="160" y="26" width="3" height="8" rx="1.5" fill="currentColor" opacity="0.3"></rect>
                  <rect x="168" y="18" width="3" height="24" rx="1.5" fill="currentColor" opacity="0.55"></rect>
                  <rect x="176" y="8" width="3" height="44" rx="1.5" fill="currentColor" opacity="0.8"></rect>
                  <rect x="184" y="14" width="3" height="32" rx="1.5" fill="currentColor" opacity="0.65"></rect>
                  <rect x="192" y="22" width="3" height="16" rx="1.5" fill="currentColor" opacity="0.4"></rect>
                  <rect x="200" y="12" width="3" height="36" rx="1.5" fill="currentColor" opacity="0.75"></rect>
                  <rect x="208" y="4" width="3" height="52" rx="1.5" fill="currentColor" opacity="0.9"></rect>
                  <rect x="216" y="18" width="3" height="24" rx="1.5" fill="currentColor" opacity="0.5"></rect>
                  <rect x="224" y="24" width="3" height="12" rx="1.5" fill="currentColor" opacity="0.35"></rect>
                  <rect x="232" y="26" width="3" height="8" rx="1.5" fill="currentColor" opacity="0.25"></rect>
                </svg>
              </div>

              <div className="text-[12px] text-[#5C3A42] font-medium">
                Spoken Word · Poetry · Narratives
              </div>
            </div>

            <div className="flex flex-col flex-1">
              <h2 className="text-[22px] font-semibold text-[#1F040A] mb-1.5 tracking-tight group-hover:text-[#800020] transition-colors">
                Audio
              </h2>
              <p className="text-[14px] leading-relaxed text-[#5C3A42] mb-4">
                Listen to selected articles, poems, stories, and other voices from the pages of Rithu.
              </p>
              <div className="mt-auto pt-1">
                <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#800020] group-hover:translate-x-1 transition-all">
                  Listen Now <span className="text-sm font-normal">→</span>
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Curator's Note Section */}
      <section className="max-w-[1120px] mx-auto w-full px-4 sm:px-6">
        <div className="bg-[#F3E6D5]/70 border border-[#E6D5C1] rounded-[16px] p-8 sm:p-12 flex flex-col md:flex-row md:items-baseline justify-between gap-6 shadow-sm">
          <div className="max-w-xl">
            <span className="text-[12px] font-semibold text-[#800020] mb-2 block tracking-wider uppercase">
              STUDENT EDITOR'S NOTE
            </span>
            <blockquote className="text-[17px] sm:text-[19px] text-[#1F040A] font-normal leading-relaxed italic font-serif">
              “Every college life is made of seasons — moments of laughter, days of uncertainty, memories we hold on to, and new beginnings we never saw coming. Rithu brings together a few of those moments, just as we lived them.”
            </blockquote>
          </div>
          <div className="text-left md:text-right">
            <p className="text-[14px] font-semibold text-[#1F040A]">Adhil P A</p>
            <p className="text-[12px] text-[#5C3A42]">Student Editor</p>
            <p className="text-[12px] text-[#5C3A42]">Rithu · 2026</p>
          </div>
        </div>
      </section>
    </div>
  );
};

import React from 'react';
import { ViewMode } from '../types';

interface HomeViewProps {
  onNavigate: (view: ViewMode) => void;
  onPlayAudioDirect: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onPlayAudioDirect }) => {
  return (
    <div className="flex flex-col w-full pb-24 animate-fadeIn bg-[#0E0205] text-[#FFF9F2]">
      {/* Hero Section */}
      <section className="max-w-[1120px] mx-auto w-full px-4 sm:px-6 pt-12 sm:pt-20 pb-16 flex flex-col items-center text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1F040A] border border-[#800020]/50 text-[#D45060] text-[12px] font-semibold tracking-wider uppercase mb-5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D45060] animate-pulse"></span>
            <span>College of Engineering Munnar · 2026</span>
          </div>

          <h1 className="text-[48px] sm:text-[68px] leading-[1.05] font-bold text-[#FFF9F2] tracking-[-0.03em] mb-4">
            Rithu
          </h1>
          <p className="text-[18px] sm:text-[21px] text-[#F3E6D5]/80 font-normal mb-8 tracking-tight max-w-lg">
            Read it. Hear it. Relive it.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
            <button
              onClick={() => onNavigate('magazine')}
              className="inline-flex items-center justify-center px-8 h-12 bg-[#800020] hover:bg-[#A30029] text-[#FFF9F2] text-[15px] font-semibold rounded-[10px] shadow-lg shadow-[#800020]/30 active:scale-[0.98] transition-all cursor-pointer"
            >
              Read Magazine
            </button>
            <div className="flex items-center gap-3.5 text-[15px] font-semibold text-[#FFF9F2]">
              <button
                onClick={() => onNavigate('audio')}
                className="hover:text-[#D45060] transition-colors underline-offset-4 hover:underline cursor-pointer"
              >
                Listen
              </button>
              <span className="text-[#800020] select-none">·</span>
              <button
                onClick={() => onNavigate('video')}
                className="hover:text-[#D45060] transition-colors underline-offset-4 hover:underline cursor-pointer"
              >
                Watch
              </button>
            </div>
          </div>
        </div>

        {/* Panoramic Landscape Hero Image */}
        <div className="w-full mt-14 sm:mt-18">
          <div
            onClick={() => onNavigate('magazine')}
            className="group relative w-full aspect-[21/9] min-h-[280px] max-h-[540px] rounded-[16px] overflow-hidden bg-[#160408] border border-[#3A0C16] shadow-2xl transition-all duration-300 cursor-pointer"
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMYT5MeU1CgDn1zkc0QZdv-U8IukmoR1mRL1KIXLQSrJ2esgOA0_LpNJ1ryRNCAqHc7J8BwZlfGGaxXAxq9Oo5CivIVucBzvW1qrpur39kSx75SwYBcfZVooY6UZHmGQ5HdGnbm1p_Ebe0rVQ0UwvGrte0g8Iq2m73fTh0X5Ig9Qy5DrjSC2g97n73GCT_cz-j4GPb5XwKA9JbRuE1q8vaq9lCiHklckt6dIiaNf5b2Tef2Qe3yiCN"
              alt="Misty tea plantations and hills surrounding College of Engineering Munnar campus"
              className="w-full h-full object-cover opacity-85 brightness-90 transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E0205] via-transparent to-transparent flex items-end p-6 sm:p-8">
              <span className="text-white text-[14px] font-semibold flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#800020]/90 backdrop-blur-sm shadow-md">
                Open 3D Flipbook Magazine <span className="text-sm">→</span>
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center mt-3 px-1 text-[#F3E6D5]/80">
            <p className="text-[12px] font-medium text-left">The Annual Edition · Munnar 2026</p>
            <p className="text-[12px] font-medium text-right opacity-70">Vol. XII · Digital Issue</p>
          </div>
        </div>
      </section>

      {/* 3 Pillar Cards Section */}
      <section className="max-w-[1120px] mx-auto w-full px-4 sm:px-6 pb-20 sm:pb-28">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {/* Card 1: Magazine */}
          <article
            onClick={() => onNavigate('magazine')}
            className="flex flex-col group cursor-pointer bg-[#140307] border border-[#3A0C16] hover:border-[#800020] p-5 rounded-[16px] transition-all duration-300 shadow-xl"
          >
            <div className="w-full aspect-[4/5] rounded-[12px] overflow-hidden bg-[#1F040A] mb-5 relative">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3WpmmcMyI8ECfaU0fh8DcQIJ4rcQpVj7nA9xsd3iYZUqAVRKE3CWXT4rYh7893B_DcdRye7LJZ55q-7WX5SQa1_KAfbJLS6zD29GDvbrvGYa9IavG9T3u0bfyQqGmSFlkCi-otkNCymf5dkwaeXmMSrAmUae8bRzps7lFbYOdXSRreAkUWc6HvNKEw7_rv6KSeSpEdZM6hmEmDZ8rDVfhru47toMqjhzySByjqSk-1CsxXuf05ZBe"
                alt="Editorial minimal book cover of Rithu college magazine"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
            </div>
            <div className="flex flex-col flex-1">
              <h2 className="text-[22px] font-semibold text-[#FFF9F2] mb-1.5 tracking-tight group-hover:text-[#D45060] transition-colors">
                Magazine
              </h2>
              <p className="text-[14px] leading-relaxed text-[#F3E6D5]/80 mb-4">
                Open the interactive issue with real physical book bottom-corner page curls and mouse peeling.
              </p>
              <div className="mt-auto pt-1">
                <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#D45060] group-hover:translate-x-1 transition-all">
                  Read Issue <span className="text-sm font-normal">→</span>
                </span>
              </div>
            </div>
          </article>

          {/* Card 2: Video */}
          <article
            onClick={() => onNavigate('video')}
            className="flex flex-col group cursor-pointer bg-[#140307] border border-[#3A0C16] hover:border-[#800020] p-5 rounded-[16px] transition-all duration-300 shadow-xl"
          >
            <div className="w-full aspect-[4/5] rounded-[12px] overflow-hidden bg-[#1F040A] mb-5 relative">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKfyZzdNxR6CRmFDsYcN9BFhObZGkrLVs1fKEU_zCTqhc7KR7DOzfD2CBCD73i9XJkzQaS90L1FHwsmZL-_I74FSEtsn7sIZXe822Y316npH82AYut56RoEYdbWc4Z7eFyvZvYnVoYZ9TX1W1X9E_y9KdDdw93qB7F-bDOFI9N6uLmjbEAHCHQ9uYSIX9qXH5K1M0jeyqN31kGI354hwZzK3jGNl3M5tDoceZcRvikMkiS32hWQmfE"
                alt="Atmospheric festival night at Munnar campus amphitheatre"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
            </div>
            <div className="flex flex-col flex-1">
              <h2 className="text-[22px] font-semibold text-[#FFF9F2] mb-1.5 tracking-tight group-hover:text-[#D45060] transition-colors">
                Video
              </h2>
              <p className="text-[14px] leading-relaxed text-[#F3E6D5]/80 mb-4">
                Watch keynote recaps, technical expos, cultural nights, and mountain campus archives.
              </p>
              <div className="mt-auto pt-1">
                <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#D45060] group-hover:translate-x-1 transition-all">
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
            className="flex flex-col group cursor-pointer bg-[#140307] border border-[#3A0C16] hover:border-[#800020] p-5 rounded-[16px] transition-all duration-300 shadow-xl"
          >
            <div className="w-full aspect-[4/5] rounded-[12px] bg-[#1F040A] border border-[#3A0C16] mb-5 p-6 flex flex-col justify-between transition-all duration-300 group-hover:bg-[#28050D]">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-[#F3E6D5]/80 tracking-tight">
                  Audio Journal
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#D45060] animate-pulse"></span>
              </div>

              {/* Dynamic Sound Waveform Graphic in Coral */}
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
                  <rect x="104" y="2" width="3" height="56" rx="currentColor"></rect>
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

              <div className="flex items-center justify-between text-[#F3E6D5]/80">
                <span className="text-[12px] font-medium">ആരണ്യം / Spoken Word</span>
                <span className="text-[12px] opacity-70 tabular-nums">18:42</span>
              </div>
            </div>

            <div className="flex flex-col flex-1">
              <h2 className="text-[22px] font-semibold text-[#FFF9F2] mb-1.5 tracking-tight group-hover:text-[#D45060] transition-colors">
                Audio
              </h2>
              <p className="text-[14px] leading-relaxed text-[#F3E6D5]/80 mb-4">
                Listen to spoken essays, mountain poetry, and environmental conversations.
              </p>
              <div className="mt-auto pt-1">
                <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#D45060] group-hover:translate-x-1 transition-all">
                  Listen Now <span className="text-sm font-normal">→</span>
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Curator's Note Section */}
      <section className="max-w-[1120px] mx-auto w-full px-4 sm:px-6">
        <div className="bg-[#140307] border border-[#3A0C16] rounded-[16px] p-8 sm:p-12 flex flex-col md:flex-row md:items-baseline justify-between gap-6 shadow-xl">
          <div className="max-w-xl">
            <span className="text-[12px] font-medium text-[#D45060] mb-2 block tracking-wider uppercase">
              Curator's Note
            </span>
            <blockquote className="text-[17px] sm:text-[19px] text-[#FFF9F2] font-normal leading-relaxed italic font-serif">
              "The mist does not obscure the mountains; it grants them their quiet majesty. Here
              gathered are our seasons in Munnar."
            </blockquote>
          </div>
          <div className="text-left md:text-right">
            <p className="text-[14px] font-semibold text-[#FFF9F2]">Chief Student Editor</p>
            <p className="text-[12px] text-[#F3E6D5]/70">Editorial Collective 2025–26</p>
          </div>
        </div>
      </section>
    </div>
  );
};

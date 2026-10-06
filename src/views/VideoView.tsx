import React from 'react';
import { VideoItem } from '../types';

interface VideoViewProps {
  videos?: VideoItem[];
  onSelectVideo?: (video: VideoItem) => void;
  onOpenSubmitModal?: () => void;
}

export const VideoView: React.FC<VideoViewProps> = () => {
  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-[#FFF9F2] text-[#1F040A] flex items-center justify-center overflow-hidden">
      
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-180px] left-[-180px] w-[420px] h-[420px] rounded-full bg-[#800020]/[0.035] blur-3xl" />
        <div className="absolute bottom-[-180px] right-[-180px] w-[420px] h-[420px] rounded-full bg-[#800020]/[0.035] blur-3xl" />

        {/* Subtle Dot Pattern */}
        <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#800020_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="relative z-10 w-full max-w-[900px] mx-auto px-6 py-16 text-center flex flex-col items-center">

        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F3E6D5] border border-[#E6D5C1] text-[#800020] text-[11px] font-semibold tracking-[0.2em] uppercase mb-8 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#800020] opacity-60 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#800020]" />
          </span>

          <span>EYESTORIES & MEMORIES</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-[52px] sm:text-[68px] md:text-[82px] font-serif font-bold text-[#1F040A] tracking-tight leading-[0.95] mb-5">
          Coming Soon
        </h1>

        {/* Malayalam */}
        <p className="text-[20px] sm:text-[24px] font-serif text-[#800020] mb-10">
          ദൃശ്യസ്മൃതികൾ ഉടൻ എത്തുന്നു
        </p>

        {/* Minimal Decorative Element */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-px bg-[#800020]/25" />

          <div className="w-2.5 h-2.5 rotate-45 border border-[#800020]/40" />

          <div className="w-16 h-px bg-[#800020]/25" />
        </div>

      </div>
    </div>
  );
};

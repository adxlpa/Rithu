import React, { useState } from 'react';
import { AudioTrack } from '../types';

interface AudioViewProps {
  tracks: AudioTrack[];
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  onSelectTrack: (track: AudioTrack) => void;
  onOpenSubmitModal: () => void;
}

export const AudioView: React.FC<AudioViewProps> = ({
  tracks,
  currentTrack,
  isPlaying,
  onSelectTrack,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'malayalam' | 'english'>('all');

  const filteredTracks = tracks.filter((track) => {
    if (selectedFilter === 'all') return true;
    return track.language.toLowerCase() === selectedFilter;
  });

  return (
    <div className="w-full bg-[#FFF9F2] text-[#1F040A] pb-32 animate-fadeIn min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-[1120px] mx-auto px-4 sm:px-6 pb-20">
        {/* Hero Editorial Header */}
        <header className="pt-8 sm:pt-14 pb-8 sm:pb-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-[#800020] mb-3">
            <span className="material-symbols-outlined text-[16px]">graphic_eq</span>
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[#800020]">
              VOICES FROM THE PAGES
            </span>
          </div>
          <h1 className="text-[40px] sm:text-[56px] leading-[1.1] font-semibold text-[#1F040A] tracking-tight mb-3 font-serif">
            Audio
          </h1>
          <p className="text-[17px] leading-relaxed text-[#5C3A42]">
            Some stories are meant to be read. Others are meant to be heard. Listen to the voices behind the pages of Rithu.
          </p>

          {/* Filter Bar */}
          <nav
            aria-label="Audio filter"
            className="flex items-center gap-2.5 mt-8 pt-2 text-[14px]"
          >
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedFilter === 'all'
                  ? 'bg-[#800020] text-[#FFF9F2] font-semibold shadow-sm'
                  : 'bg-[#F3E6D5] text-[#5C3A42] hover:text-[#1F040A] font-medium border border-[#E6D5C1]'
              }`}
            >
              <span>All</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('malayalam')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedFilter === 'malayalam'
                  ? 'bg-[#800020] text-[#FFF9F2] font-semibold shadow-sm'
                  : 'bg-[#F3E6D5] text-[#5C3A42] hover:text-[#1F040A] font-medium border border-[#E6D5C1]'
              }`}
            >
              <span>Malayalam</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('english')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedFilter === 'english'
                  ? 'bg-[#800020] text-[#FFF9F2] font-semibold shadow-sm'
                  : 'bg-[#F3E6D5] text-[#5C3A42] hover:text-[#1F040A] font-medium border border-[#E6D5C1]'
              }`}
            >
              <span>English</span>
            </button>
          </nav>
        </header>

        {/* Ambient Soundwave SVG */}
        <div
          aria-hidden="true"
          className="w-full h-12 mb-8 flex items-center justify-between text-[#800020]/30 px-2 select-none overflow-hidden"
        >
          <svg
            className="w-full h-8 stroke-[#800020]/45"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 800 40"
          >
            <path
              d="M0 20 Q 25 5, 50 20 T 100 20 T 150 10 T 200 30 T 250 15 T 300 25 T 350 5 T 400 35 T 450 18 T 500 22 T 550 8 T 600 32 T 650 15 T 700 25 T 750 12 T 800 20"
              strokeLinecap="round"
              strokeWidth="1.5"
            ></path>
          </svg>
        </div>

        {/* Track Rows Table */}
        <div className="flex flex-col divide-y divide-[#E6D5C1]" id="audio-track-list">
          {filteredTracks.map((track) => {
            const isThisTrackActive = currentTrack?.id === track.id;
            const isThisPlaying = isThisTrackActive && isPlaying;

            return (
              <article
                key={track.id}
                onClick={() => onSelectTrack(track)}
                className="group py-5 sm:py-6 flex items-start sm:items-center justify-between gap-4 transition-colors hover:bg-[#F3E6D5]/65 -mx-3 px-3 rounded-xl cursor-pointer"
              >
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <button
                    aria-label={`Play ${track.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTrack(track);
                    }}
                    className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-all mt-0.5 sm:mt-0 shadow-xs cursor-pointer ${
                      isThisPlaying
                        ? 'bg-[#800020] text-[#FFF9F2] hover:bg-[#660019]'
                        : isThisTrackActive
                        ? 'bg-[#800020] text-[#FFF9F2]'
                        : 'bg-[#F3E6D5] text-[#800020] group-hover:bg-[#800020] group-hover:text-[#FFF9F2] border border-[#E6D5C1]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] leading-none">
                      {isThisPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  </button>

                  <div className="flex flex-col min-w-0">
                    <h2
                      className={`text-[16px] sm:text-[17px] font-semibold tracking-tight truncate ${
                        isThisTrackActive ? 'text-[#800020]' : 'text-[#1F040A] group-hover:text-[#800020]'
                      }`}
                    >
                      {track.title}
                    </h2>
                    <div className="flex items-center gap-2 text-[13px] text-[#5C3A42] mt-0.5 flex-wrap">
                      <span>{track.author}</span>
                      <span className="text-[#800020]">·</span>
                      <span className="capitalize">{track.category}</span>
                      <span className="text-[#800020]">·</span>
                      <span className="tabular-nums">{track.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
                  <span className="text-[12px] font-medium text-[#800020]">
                    {track.language}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

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
  onOpenSubmitModal,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'malayalam' | 'english'>('all');

  const filteredTracks = tracks.filter((track) => {
    if (selectedFilter === 'all') return true;
    return track.language.toLowerCase() === selectedFilter;
  });

  return (
    <div className="w-full bg-[#0E0205] text-[#FFF9F2] pb-32 animate-fadeIn min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-[1120px] mx-auto px-4 sm:px-6 pb-20">
        {/* Hero Editorial Header */}
        <header className="pt-8 sm:pt-14 pb-8 sm:pb-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-[#D45060] mb-3">
            <span className="material-symbols-outlined text-[16px]">graphic_eq</span>
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[#D45060]">
              Spoken Word & Soundscapes
            </span>
          </div>
          <h1 className="text-[40px] sm:text-[56px] leading-[1.1] font-semibold text-[#FFF9F2] tracking-tight mb-3">
            Audio
          </h1>
          <p className="text-[17px] leading-relaxed text-[#F3E6D5]/80">
            Student voices, poetry, interviews, and spoken editorial from the hills of Munnar.
          </p>

          {/* Filter Bar */}
          <nav
            aria-label="Audio filter"
            className="flex items-center gap-3 mt-8 pt-2 text-[14px]"
          >
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full transition-colors cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-[#800020] text-[#FFF9F2] font-semibold shadow-sm'
                  : 'bg-[#1F040A] text-[#F3E6D5]/80 hover:text-white font-medium border border-[#3A0C16]'
              }`}
            >
              <span>All</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('malayalam')}
              className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full transition-colors cursor-pointer ${
                selectedFilter === 'malayalam'
                  ? 'bg-[#800020] text-[#FFF9F2] font-semibold shadow-sm'
                  : 'bg-[#1F040A] text-[#F3E6D5]/80 hover:text-white font-medium border border-[#3A0C16]'
              }`}
            >
              <span>Malayalam</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('english')}
              className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full transition-colors cursor-pointer ${
                selectedFilter === 'english'
                  ? 'bg-[#800020] text-[#FFF9F2] font-semibold shadow-sm'
                  : 'bg-[#1F040A] text-[#F3E6D5]/80 hover:text-white font-medium border border-[#3A0C16]'
              }`}
            >
              <span>English</span>
            </button>
          </nav>
        </header>

        {/* Ambient Soundwave SVG */}
        <div
          aria-hidden="true"
          className="w-full h-12 mb-8 flex items-center justify-between text-[#800020]/40 px-2 select-none overflow-hidden opacity-90"
        >
          <svg
            className="w-full h-8 stroke-[#800020]/60"
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
        <div className="flex flex-col divide-y divide-[#3A0C16]" id="audio-track-list">
          {filteredTracks.map((track) => {
            const isThisTrackActive = currentTrack?.id === track.id;
            const isThisPlaying = isThisTrackActive && isPlaying;

            return (
              <article
                key={track.id}
                onClick={() => onSelectTrack(track)}
                className="group py-5 sm:py-6 flex items-start sm:items-center justify-between gap-4 transition-colors hover:bg-[#160408] -mx-3 px-3 rounded-xl cursor-pointer"
              >
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <button
                    aria-label={`Play ${track.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTrack(track);
                    }}
                    className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-all mt-0.5 sm:mt-0 shadow-sm cursor-pointer ${
                      isThisPlaying
                        ? 'bg-[#800020] text-[#FFF9F2] hover:bg-[#A30029]'
                        : isThisTrackActive
                        ? 'bg-[#800020] text-[#FFF9F2]'
                        : 'bg-[#1F040A] text-[#D45060] group-hover:bg-[#800020] group-hover:text-[#FFF9F2] border border-[#3A0C16]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] leading-none">
                      {isThisPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  </button>

                  <div className="flex flex-col min-w-0">
                    <h2
                      className={`text-[16px] sm:text-[17px] font-semibold tracking-tight truncate ${
                        isThisTrackActive ? 'text-[#D45060]' : 'text-[#FFF9F2] group-hover:text-[#D45060]'
                      }`}
                    >
                      {track.title}
                    </h2>
                    <div className="flex items-center gap-2 text-[13px] text-[#F3E6D5]/80 mt-0.5 flex-wrap">
                      <span>{track.author}</span>
                      <span className="text-[#800020]">·</span>
                      <span className="capitalize">{track.category}</span>
                      <span className="text-[#800020]">·</span>
                      <span>{track.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#1F040A] text-[#D45060] border border-[#3A0C16]">
                    {track.language}
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Submit Media Section */}
        <section className="mt-16 sm:mt-24 p-8 sm:p-10 rounded-2xl bg-[#140307] border border-[#3A0C16] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="max-w-xl">
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[#D45060] mb-2 block">
              Campus Recordings
            </span>
            <h2 className="text-[22px] sm:text-[24px] font-semibold text-[#FFF9F2] mb-2">
              Contribute Spoken Word or Audio
            </h2>
            <p className="text-[14px] text-[#F3E6D5]/80 leading-relaxed">
              Have a podcast recording, interview, or Malayalam recitation from campus? Submit archival audio for the editorial committee to review.
            </p>
          </div>
          <button
            onClick={onOpenSubmitModal}
            className="px-6 py-3 bg-[#800020] hover:bg-[#A30029] text-[#FFF9F2] rounded-[10px] font-semibold text-[14px] shadow-lg shadow-[#800020]/30 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
          >
            Submit Audio Recording
          </button>
        </section>
      </div>
    </div>
  );
};

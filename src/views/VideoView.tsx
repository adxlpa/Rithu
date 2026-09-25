import React, { useState } from 'react';
import { VideoItem } from '../types';

interface VideoViewProps {
  videos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
  onOpenSubmitModal: () => void;
}

export const VideoView: React.FC<VideoViewProps> = ({
  videos,
  onSelectVideo,
  onOpenSubmitModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Events', 'Workshops', 'IEEE', 'Interviews'];

  const heroVideo = videos.find((v) => v.isFeatured) || videos[0];
  const gridVideos = videos.filter((v) => !v.isFeatured);

  const filteredVideos =
    selectedCategory === 'All'
      ? gridVideos
      : gridVideos.filter((v) => v.category.includes(selectedCategory));

  return (
    <div className="w-full bg-[#0E0205] text-[#FFF9F2] pb-28 animate-fadeIn min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-[1120px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Header Block */}
        <header className="mb-10 sm:mb-12 flex flex-col md:flex-row md:items-baseline md:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[#D45060]">
              Curation & Archives
            </span>
            <h1 className="text-[40px] sm:text-[48px] leading-[1.1] tracking-[-0.025em] font-semibold text-[#FFF9F2]">
              Video
            </h1>
          </div>
          <p className="text-[15px] leading-relaxed text-[#F3E6D5]/80 max-w-sm">
            Moving frames capturing cultural milestones, symposiums, and reflective dialogues across
            Munnar's high-altitude campus.
          </p>
        </header>

        {/* Featured Hero Video Section */}
        {heroVideo && (
          <section
            onClick={() => onSelectVideo(heroVideo)}
            className="mb-12 group cursor-pointer"
            id="featured-hero"
          >
            <div className="relative w-full aspect-[16/9] rounded-[16px] overflow-hidden bg-[#160408] border border-[#3A0C16] shadow-2xl transition-all duration-300 group-hover:border-[#800020]">
              <img
                src={heroVideo.image}
                alt={heroVideo.imageAlt}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] filter brightness-95 group-hover:brightness-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E0205]/95 via-[#0E0205]/30 to-transparent"></div>

              {/* Center Play Indicator */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#800020] text-[#FFF9F2] flex items-center justify-center shadow-2xl shadow-[#800020]/50 transition-transform duration-300 ease-out group-hover:scale-110">
                  <span
                    className="material-symbols-outlined text-[32px] translate-x-0.5"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    play_arrow
                  </span>
                </div>
              </div>

              {/* Timestamp Badge */}
              <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-[6px] bg-[#0E0205]/85 backdrop-blur-md text-[#FFF9F2] text-[12px] font-medium border border-[#3A0C16]">
                {heroVideo.duration}
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <div>
                <h2 className="text-[20px] font-semibold text-[#FFF9F2] group-hover:text-[#D45060] transition-colors duration-200">
                  {heroVideo.title}
                </h2>
                <p className="text-[14px] text-[#F3E6D5]/80 mt-1 font-medium">
                  {heroVideo.dateStr} · {heroVideo.tagline}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[#D45060] text-[12px] font-semibold">
                <span className="inline-block w-2 h-2 rounded-full bg-[#D45060] animate-pulse"></span>
                <span>Featured Presentation</span>
              </div>
            </div>
          </section>
        )}

        {/* Category Navigation Bar */}
        <nav
          aria-label="Video Categories"
          className="mb-10 flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar"
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-[14px] transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#800020] text-[#FFF9F2] font-semibold shadow-md shadow-[#800020]/30'
                    : 'bg-[#1F040A] text-[#F3E6D5]/80 hover:text-white font-medium border border-[#3A0C16]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </nav>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10" id="video-grid">
          {filteredVideos.map((video) => (
            <article
              key={video.id}
              onClick={() => onSelectVideo(video)}
              className="group cursor-pointer flex flex-col w-full"
            >
              <div className="relative w-full aspect-[16/9] rounded-[14px] overflow-hidden bg-[#160408] border border-[#3A0C16] shadow-lg transition-all duration-300 group-hover:border-[#800020]">
                <img
                  src={video.image}
                  alt={video.imageAlt}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 filter brightness-95 group-hover:brightness-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E0205]/85 via-transparent to-transparent"></div>

                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-[4px] bg-[#0E0205]/85 backdrop-blur-sm text-[#FFF9F2] text-[12px] font-medium tabular-nums border border-[#3A0C16]">
                  {video.duration}
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="w-11 h-11 rounded-full bg-[#800020] text-[#FFF9F2] flex items-center justify-center shadow-xl">
                    <span
                      className="material-symbols-outlined text-[24px] translate-x-0.5"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      play_arrow
                    </span>
                  </span>
                </div>
              </div>

              <div className="mt-3.5">
                <h3 className="text-[17px] leading-[26px] font-semibold text-[#FFF9F2] group-hover:text-[#D45060] transition-colors">
                  {video.title}
                </h3>
                <p className="text-[14px] font-medium text-[#F3E6D5]/80 mt-0.5">
                  {video.dateStr} · {video.tagline}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Media Archive Contributions Footer Action */}
        <section className="mt-16 pt-12 border-t border-[#3A0C16] flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-[#1F040A] border border-[#800020]/40 flex items-center justify-center text-[#D45060] mb-3 shadow-md">
            <span className="material-symbols-outlined text-[24px]">video_library</span>
          </div>
          <h4 className="text-[20px] font-semibold text-[#FFF9F2] mb-1">
            Media Archive Contributions
          </h4>
          <p className="text-[15px] leading-relaxed text-[#F3E6D5]/80 max-w-md mb-6">
            Student filmmakers and documentation squads can submit curated footage for the permanent
            college digital repository.
          </p>
          <button
            onClick={onOpenSubmitModal}
            className="px-6 py-2.5 bg-[#800020] hover:bg-[#A30029] text-[#FFF9F2] text-[15px] font-semibold rounded-[10px] inline-flex items-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-[#800020]/30 cursor-pointer"
          >
            <span>Submit Archival Footage</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </section>
      </div>
    </div>
  );
};

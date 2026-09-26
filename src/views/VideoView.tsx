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
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Events', 'Workshops', 'IEEE', 'Interviews'];

  const heroVideo = videos.find((v) => v.isFeatured) || videos[0];
  const gridVideos = videos.filter((v) => v.id !== heroVideo?.id);

  const filteredVideos =
    selectedCategory === 'All'
      ? gridVideos
      : gridVideos.filter((v) => v.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div className="w-full bg-[#FFF9F2] text-[#1F040A] pb-28 animate-fadeIn min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-[1120px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Header Block */}
        <header className="mb-10 sm:mb-12 flex flex-col md:flex-row md:items-baseline md:justify-between gap-4 border-b border-[#E6D5C1] pb-6">
          <div className="space-y-1">
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[#800020]">
              EYESTORIES & MEMORIES
            </span>
            <h1 className="text-[40px] sm:text-[48px] leading-[1.1] tracking-[-0.025em] font-semibold text-[#1F040A] font-serif">
              Video
            </h1>
          </div>
          <p className="text-[15px] leading-relaxed text-[#5C3A42] max-w-sm">
            From celebrations and college programmes to the moments that happened between them, this is where the memories of CEM come alive.
          </p>
        </header>

        {/* Featured Hero Video Section */}
        {heroVideo && (
          <section
            onClick={() => onSelectVideo(heroVideo)}
            className="mb-12 group cursor-pointer"
            id="featured-hero"
          >
            <div className="relative w-full aspect-[16/9] rounded-[16px] overflow-hidden bg-[#F3E6D5] border border-[#E6D5C1] shadow-lg transition-all duration-300 group-hover:border-[#800020]/50">
              <img
                src={heroVideo.image}
                alt={heroVideo.imageAlt}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

              {/* Center Play Indicator */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#800020] text-[#FFF9F2] flex items-center justify-center shadow-xl transition-transform duration-300 ease-out group-hover:scale-110">
                  <span
                    className="material-symbols-outlined text-[32px] translate-x-0.5"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    play_arrow
                  </span>
                </div>
              </div>

              {/* Timestamp */}
              <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-[6px] bg-[#FFF9F2]/95 backdrop-blur-md text-[#1F040A] text-[12px] font-semibold tabular-nums border border-[#E6D5C1] shadow-sm">
                {heroVideo.duration}
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <div>
                <h2 className="text-[20px] font-semibold text-[#1F040A] group-hover:text-[#800020] transition-colors duration-200">
                  {heroVideo.title}
                </h2>
                <p className="text-[14px] text-[#5C3A42] mt-1 font-medium">
                  {heroVideo.dateStr} · {heroVideo.tagline || heroVideo.category}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[#800020] text-[12px] font-semibold">
                <span className="inline-block w-2 h-2 rounded-full bg-[#800020]"></span>
                <span>Featured Presentation</span>
              </div>
            </div>
          </section>
        )}

        {/* Category Filter Controls */}
        <nav
          aria-label="Video Categories"
          className="mb-10 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar"
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-[14px] transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#800020] text-[#FFF9F2] font-semibold shadow-sm'
                    : 'bg-[#F3E6D5] text-[#5C3A42] hover:text-[#1F040A] font-medium border border-[#E6D5C1]'
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
              <div className="relative w-full aspect-[16/9] rounded-[14px] overflow-hidden bg-[#F3E6D5] border border-[#E6D5C1] shadow-sm transition-all duration-300 group-hover:border-[#800020]/50 group-hover:shadow-md">
                <img
                  src={video.image}
                  alt={video.imageAlt}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"></div>

                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-[4px] bg-[#FFF9F2]/95 backdrop-blur-sm text-[#1F040A] text-[12px] font-semibold tabular-nums border border-[#E6D5C1]">
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
                <h3 className="text-[17px] leading-[26px] font-semibold text-[#1F040A] group-hover:text-[#800020] transition-colors">
                  {video.title}
                </h3>
                <p className="text-[14px] font-medium text-[#5C3A42] mt-0.5">
                  {video.dateStr} · {video.tagline || video.category}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

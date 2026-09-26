import React, { useState, useEffect } from 'react';
import { VideoItem } from '../types';
import { resolveMediaUrlFromFirebase } from '../utils/storage';

interface VideoPlayerModalProps {
  video: VideoItem | null;
  onClose: () => void;
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}?autoplay=1`;
    }
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
  } catch {
    // Not a valid URL
  }
  return null;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progressSec, setProgressSec] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [resolvedVideoSrc, setResolvedVideoSrc] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  useEffect(() => {
    let active = true;
    setProgressSec(0);
    setIsPlaying(true);

    if (video?.videoUrl) {
      setIsLoadingVideo(true);
      resolveMediaUrlFromFirebase(video.videoUrl)
        .then((url) => {
          if (active) {
            setResolvedVideoSrc(url);
            setIsLoadingVideo(false);
          }
        })
        .catch(() => {
          if (active) {
            setResolvedVideoSrc(null);
            setIsLoadingVideo(false);
          }
        });
    } else {
      setResolvedVideoSrc(null);
      setIsLoadingVideo(false);
    }

    return () => {
      active = false;
    };
  }, [video?.id, video?.videoUrl]);

  useEffect(() => {
    if (resolvedVideoSrc || isLoadingVideo) return;
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && video) {
      interval = setInterval(() => {
        setProgressSec((prev) => {
          if (prev >= video.durationSeconds) {
            setIsPlaying(false);
            return video.durationSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, video, resolvedVideoSrc, isLoadingVideo]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ' && !resolvedVideoSrc) {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, resolvedVideoSrc]);

  if (!video) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = (progressSec / (video.durationSeconds || 1)) * 100;
  const youtubeEmbed = resolvedVideoSrc ? getYouTubeEmbedUrl(resolvedVideoSrc) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1F040A]/70 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[960px] bg-[#FFF9F2] rounded-2xl overflow-hidden border border-[#E6D5C1] shadow-2xl flex flex-col text-[#1F040A]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E6D5C1] bg-[#F3E6D5]/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#800020]"></span>
            <span className="text-[12px] tracking-wider uppercase font-semibold text-[#800020] truncate">
              {video.category} · {video.dateStr}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5C3A42] hover:text-[#1F040A] hover:bg-[#E6D5C1]/60 transition-colors cursor-pointer"
            title="Close video (Esc)"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Video Viewport Chamber */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden group">
          {isLoadingVideo ? (
            <div className="flex flex-col items-center gap-3 text-[#FFF9F2]">
              <div className="w-10 h-10 border-3 border-[#D45060] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Loading video from Cloud Archive...</span>
            </div>
          ) : youtubeEmbed ? (
            <iframe
              src={youtubeEmbed}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : resolvedVideoSrc ? (
            <video
              src={resolvedVideoSrc}
              poster={video.image}
              controls
              autoPlay
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <>
              <img
                src={video.image}
                alt={video.imageAlt}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-all duration-700 ${
                  isPlaying ? 'scale-105 filter brightness-95' : 'filter brightness-75'
                }`}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`w-20 h-20 rounded-full bg-[#800020]/90 text-[#FFF9F2] flex items-center justify-center shadow-2xl backdrop-blur-sm transition-transform duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
                  isPlaying ? 'opacity-0 group-hover:opacity-90' : 'opacity-100'
                }`}
              >
                <span className="material-symbols-outlined text-[44px]">
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>

              {/* Bottom Controls Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/95 to-transparent flex flex-col gap-2">
                <div
                  className="w-full h-1.5 bg-white/25 hover:h-2.5 rounded-full cursor-pointer transition-all relative overflow-hidden"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = (e.clientX - rect.left) / rect.width;
                    setProgressSec(Math.floor(pct * video.durationSeconds));
                  }}
                >
                  <div
                    className="h-full bg-[#D45060] rounded-full shadow-sm"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-sm text-[#FFF9F2] pt-1">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="hover:text-[#D45060] transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[24px]">
                        {isPlaying ? 'pause' : 'play_arrow'}
                      </span>
                    </button>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="hover:text-[#D45060] transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isMuted ? 'volume_off' : 'volume_up'}
                      </span>
                    </button>
                    <span className="text-xs text-[#F3E6D5] font-mono tabular-nums">
                      {formatTime(progressSec)} / {video.duration}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#F3E6D5]">
                    <span>CEM Archive</span>
                    <button
                      onClick={() => {
                        if (!document.fullscreenElement) {
                          document.documentElement.requestFullscreen().catch(() => {});
                        } else {
                          document.exitFullscreen().catch(() => {});
                        }
                      }}
                      className="hover:text-white cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">fullscreen</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Video Info Block */}
        <div className="p-5 sm:p-6 bg-[#FFF9F2] flex flex-col gap-1.5">
          <h2 className="text-[20px] sm:text-[22px] font-semibold text-[#1F040A] tracking-tight">
            {video.title}
          </h2>
          <p className="text-[14px] text-[#5C3A42] leading-relaxed">
            {video.description ||
              'High-fidelity digital footage archived as part of the College of Engineering Munnar annual media collection.'}
          </p>
        </div>
      </div>
    </div>
  );
};

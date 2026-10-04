import React, { useState, useEffect } from 'react';
import { VideoItem } from '../types';
import { resolveMediaUrl } from '../utils/storage';

interface VideoModalProps {
  video: VideoItem | null;
  onClose: () => void;
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}?autoplay=1`;
    }
    if (parsed.hostname.includes('youtu.be')) {
      const v = parsed.pathname.slice(1);
      if (v) return `https://www.youtube.com/embed/${v}?autoplay=1`;
    }
  } catch {
    // Ignore
  }
  return null;
}

export const VideoModal: React.FC<VideoModalProps> = ({ video, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string | null>(null);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

  useEffect(() => {
    let active = true;
    setElapsed(0);
    setIsPlaying(true);

    if (video?.videoUrl) {
      setIsLoadingMedia(true);
      resolveMediaUrl(video.videoUrl)
        .then((url) => {
          if (active) {
            setResolvedVideoUrl(url);
            setIsLoadingMedia(false);
          }
        })
        .catch(() => {
          if (active) {
            setResolvedVideoUrl(null);
            setIsLoadingMedia(false);
          }
        });
    } else {
      setResolvedVideoUrl(null);
      setIsLoadingMedia(false);
    }

    return () => {
      active = false;
    };
  }, [video?.id, video?.videoUrl]);

  useEffect(() => {
    if (resolvedVideoUrl || isLoadingMedia) return;
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isPlaying && video) {
      timer = setInterval(() => {
        setElapsed((prev) => {
          if (prev >= video.durationSeconds) {
            setIsPlaying(false);
            return video.durationSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, video, resolvedVideoUrl, isLoadingMedia]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ' && !resolvedVideoUrl) {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, resolvedVideoUrl]);

  if (!video) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progress = (elapsed / (video.durationSeconds || 1)) * 100;
  const youtubeEmbed = resolvedVideoUrl ? getYouTubeEmbedUrl(resolvedVideoUrl) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1F040A]/70 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[960px] bg-[#FFF9F2] rounded-2xl overflow-hidden border border-[#E6D5C1] shadow-2xl flex flex-col text-[#1F040A]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E6D5C1] bg-[#F3E6D5]/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#800020]" />
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

        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden group">
          {isLoadingMedia ? (
            <div className="flex flex-col items-center gap-3 text-[#FFF9F2]">
              <div className="w-10 h-10 border-3 border-[#D45060] border-t-transparent rounded-full animate-spin" />
              <span className="text-[13px] font-medium">Loading Cloud Video Stream...</span>
            </div>
          ) : youtubeEmbed ? (
            <iframe
              src={youtubeEmbed}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : resolvedVideoUrl ? (
            <video
              src={resolvedVideoUrl}
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
                className={`w-full h-full object-cover transition-transform duration-1000 ${
                  isPlaying ? 'scale-105' : 'scale-100 opacity-80'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="relative z-10 w-16 h-16 rounded-full bg-[#800020]/90 hover:bg-[#800020] text-[#FFF9F2] flex items-center justify-center shadow-2xl transition-transform hover:scale-105 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[34px]">
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2 bg-gradient-to-t from-black/90 to-transparent">
                <div
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    setElapsed(Math.floor(ratio * video.durationSeconds));
                  }}
                  className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden cursor-pointer"
                >
                  <div
                    className="h-full bg-[#D45060] transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-white text-[12px]">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="hover:text-[#D45060] cursor-pointer"
                    >
                      {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <span className="tabular-nums opacity-80">
                      {formatTime(elapsed)} / {video.duration}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="hover:text-[#D45060] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isMuted ? 'volume_off' : 'volume_up'}
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-5 sm:p-6 flex flex-col gap-2 bg-[#FFF9F2]">
          <h2 className="text-[20px] sm:text-[22px] font-semibold text-[#1F040A] font-serif">
            {video.title}
          </h2>
          {video.description && (
            <p className="text-[14px] text-[#5C3A42] leading-relaxed">{video.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

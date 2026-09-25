import React, { useState, useEffect } from 'react';
import { VideoItem } from '../types';

interface VideoPlayerModalProps {
  video: VideoItem | null;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progressSec, setProgressSec] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setProgressSec(0);
    setIsPlaying(true);
  }, [video?.id]);

  useEffect(() => {
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
  }, [isPlaying, video]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!video) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = (progressSec / (video.durationSeconds || 1)) * 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[960px] bg-[#140307] rounded-2xl overflow-hidden border border-[#3A0C16] shadow-2xl flex flex-col text-[#FFF9F2]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#3A0C16] bg-[#1F040A]/90">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D45060] animate-pulse"></span>
            <span className="text-[13px] tracking-widest uppercase font-semibold text-[#F3E6D5]/80 truncate">
              {video.category} · {video.dateStr}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#F3E6D5]/80 hover:text-[#FFF9F2] hover:bg-[#1F040A] transition-colors cursor-pointer"
            title="Close video (Esc)"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Video Viewport Chamber */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden group">
          <img
            src={video.image}
            alt={video.imageAlt}
            className={`w-full h-full object-cover transition-all duration-700 ${
              isPlaying ? 'scale-105 filter brightness-95' : 'filter brightness-75'
            }`}
          />

          {/* Ambient Film Grain and Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>

          {/* Center Play/Pause Trigger */}
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

          {/* Video Status Badge */}
          {isPlaying && (
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#0E0205]/75 backdrop-blur-md text-[12px] flex items-center gap-2 text-[#FFF9F2] border border-[#3A0C16]">
              <span className="w-2 h-2 rounded-full bg-[#D45060] animate-ping"></span>
              <span>Playing Munnar Master Tape · 1080p 60fps</span>
            </div>
          )}

          {/* Bottom Controls Overlay */}
          <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/95 to-transparent flex flex-col gap-2">
            {/* Scrubber */}
            <div
              className="w-full h-1.5 bg-white/20 hover:h-2.5 rounded-full cursor-pointer transition-all relative overflow-hidden"
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
                <span className="text-xs text-[#F3E6D5]/80 font-mono">
                  {formatTime(progressSec)} / {video.duration}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#F3E6D5]/80">
                <span>College Edition Vault</span>
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
        </div>

        {/* Video Info Block */}
        <div className="p-5 sm:p-6 bg-[#160408] flex flex-col gap-2">
          <h2 className="text-[22px] font-semibold text-[#FFF9F2] tracking-tight">{video.title}</h2>
          <p className="text-[14px] text-[#F3E6D5]/80 leading-relaxed">
            {video.description ||
              'High-fidelity digital footage archived as part of the College of Engineering Munnar annual media preservation collection.'}
          </p>
        </div>
      </div>
    </div>
  );
};

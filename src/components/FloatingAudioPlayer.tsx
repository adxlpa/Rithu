import React, { useRef, useState, useEffect } from 'react';
import { AudioTrack } from '../types';
import { soundscape } from '../utils/audioEngine';

interface FloatingAudioPlayerProps {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextTrack?: () => void;
  onClose?: () => void;
}

export const FloatingAudioPlayer: React.FC<FloatingAudioPlayerProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onClose,
}) => {
  const [currentSeconds, setCurrentSeconds] = useState(102);
  const [playbackSpeed, setPlaybackSpeed] = useState<string>('1×');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const scrubberRef = useRef<HTMLDivElement>(null);

  const speedMultipliers: Record<string, number> = {
    '1×': 1,
    '1.25×': 1.25,
    '1.5×': 1.5,
    '2×': 2,
  };

  const totalSeconds = currentTrack ? currentTrack.durationSeconds : 190;
  const progressPercent = Math.min(100, Math.max(0, (currentSeconds / totalSeconds) * 100));

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      soundscape.play(currentTrack?.category || 'General');
      const multiplier = speedMultipliers[playbackSpeed] || 1;
      interval = setInterval(() => {
        setCurrentSeconds((prev) => {
          if (prev >= totalSeconds) {
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / multiplier);
    } else {
      soundscape.stop();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed, totalSeconds, currentTrack]);

  useEffect(() => {
    if (currentTrack) {
      if (currentTrack.id === '2') {
        setCurrentSeconds(102);
      } else {
        setCurrentSeconds(0);
      }
    }
  }, [currentTrack?.id]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    setCurrentSeconds(Math.floor(pct * totalSeconds));
  };

  const toggleSpeed = () => {
    const speeds = ['1×', '1.25×', '1.5×', '2×'];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  const toggleVolumeMute = () => {
    const muted = soundscape.toggleMute();
    setIsMuted(muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundscape.setVolume(val);
    if (isMuted && val > 0) {
      setIsMuted(false);
    }
  };

  if (!currentTrack) return null;

  return (
    <aside
      aria-label="Audio player"
      className="fixed bottom-4 left-4 right-4 z-40 flex justify-center pointer-events-none select-none transition-all duration-300"
    >
      <div className="pointer-events-auto w-full max-w-[720px] rounded-[24px] backdrop-blur-[20px] bg-[#800020]/95 border border-[#F3E6D5]/25 shadow-[0_15px_40px_rgba(128,0,32,0.5)] px-5 py-3 sm:px-6 flex flex-col gap-2 transition-all text-[#FFF9F2]">
        {/* Top Line Controls & Info */}
        <div className="flex items-center justify-between gap-3">
          {/* Left: Play/Pause and Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={onTogglePlay}
              aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
              className="w-9 h-9 rounded-full bg-[#D45060] text-white hover:bg-[#b83848] flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px] leading-none">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-[#F3E6D5] font-semibold uppercase tracking-wider">
                <span
                  className={`w-1.5 h-1.5 rounded-full bg-[#D45060] ${
                    isPlaying ? 'animate-pulse' : 'opacity-40'
                  }`}
                />
                <span>{isPlaying ? 'Now Playing' : 'Paused'}</span>
              </div>
              <div className="text-[14px] leading-5 font-semibold text-[#FFF9F2] truncate leading-tight">
                {currentTrack.title}
              </div>
            </div>
          </div>

          {/* Right: Speed, Volume, Time, and Close Button */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0 relative">
            <span className="text-[12px] text-[#F3E6D5]/80 font-medium tabular-nums hidden xs:inline">
              {formatTime(currentSeconds)} / {currentTrack.duration}
            </span>

            {/* Speed Toggle */}
            <button
              onClick={toggleSpeed}
              className="text-[12px] font-semibold text-[#F3E6D5] hover:text-white px-2 py-0.5 rounded hover:bg-black/20 transition-colors cursor-pointer"
              title="Playback speed"
            >
              {playbackSpeed}
            </button>

            {/* Volume Button */}
            <div
              className="relative flex items-center"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button
                onClick={toggleVolumeMute}
                aria-label="Mute or adjust volume"
                className="w-7 h-7 flex items-center justify-center text-[#F3E6D5] hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[19px]">
                  {isMuted || volume === 0
                    ? 'volume_off'
                    : volume < 0.5
                    ? 'volume_down'
                    : 'volume_up'}
                </span>
              </button>

              {showVolumeSlider && (
                <div className="absolute bottom-8 right-0 bg-[#4D0013] border border-[#F3E6D5]/30 shadow-2xl p-2.5 rounded-lg flex items-center gap-2 w-28 z-50">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1 accent-[#D45060] cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Close / Dismiss Button */}
            {onClose && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  soundscape.stop();
                  onClose();
                }}
                aria-label="Close now playing bar"
                className="w-8 h-8 rounded-full bg-[#4D0013]/70 hover:bg-[#D45060] flex items-center justify-center text-[#F3E6D5] hover:text-[#FFF9F2] transition-all cursor-pointer ml-1.5 border border-[#F3E6D5]/25 hover:border-white/50 shadow-sm group"
                title="Close now playing bar"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Line: Scrubber */}
        <div
          ref={scrubberRef}
          onClick={handleScrub}
          aria-label="Audio progress scrubber"
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progressPercent)}
          className="w-full flex items-center gap-1 cursor-pointer group py-1"
        >
          <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden relative group-hover:h-1.5 transition-all">
            <div
              className="h-full bg-[#D45060] rounded-full transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
};

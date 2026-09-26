import React, { useRef, useState, useEffect } from 'react';
import { AudioTrack } from '../types';
import { soundscape } from '../utils/audioEngine';
import { resolveMediaUrlFromFirebase } from '../utils/storage';

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
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [realDuration, setRealDuration] = useState<number | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<string>('1×');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [resolvedAudioSrc, setResolvedAudioSrc] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const scrubberRef = useRef<HTMLDivElement>(null);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);

  const speedMultipliers: Record<string, number> = {
    '1×': 1,
    '1.25×': 1.25,
    '1.5×': 1.5,
    '2×': 2,
  };

  const totalSeconds = realDuration || (currentTrack ? currentTrack.durationSeconds : 190);
  const progressPercent = Math.min(100, Math.max(0, (currentSeconds / (totalSeconds || 1)) * 100));

  // Resolve uploaded audio from Firebase chunks or URL when track changes
  useEffect(() => {
    let active = true;
    setCurrentSeconds(0);
    setRealDuration(null);
    soundscape.stop();

    if (currentTrack?.audioUrl) {
      setIsLoadingAudio(true);
      resolveMediaUrlFromFirebase(currentTrack.audioUrl)
        .then((url) => {
          if (active) {
            setResolvedAudioSrc(url);
            setIsLoadingAudio(false);
          }
        })
        .catch(() => {
          if (active) {
            setResolvedAudioSrc(null);
            setIsLoadingAudio(false);
          }
        });
    } else {
      setResolvedAudioSrc(null);
      setIsLoadingAudio(false);
    }

    return () => {
      active = false;
    };
  }, [currentTrack?.id, currentTrack?.audioUrl]);

  // Control HTML5 <audio> element when resolvedAudioSrc is available
  useEffect(() => {
    const audioEl = htmlAudioRef.current;
    if (!audioEl || !resolvedAudioSrc) return;

    soundscape.stop();
    audioEl.playbackRate = speedMultipliers[playbackSpeed] || 1;
    audioEl.volume = isMuted ? 0 : volume;
    audioEl.muted = isMuted;

    if (isPlaying) {
      audioEl.play().catch(() => {});
    } else {
      audioEl.pause();
    }
  }, [isPlaying, resolvedAudioSrc, playbackSpeed, volume, isMuted]);

  // Fallback synthetic soundscape when no uploaded audio file is attached
  useEffect(() => {
    if (resolvedAudioSrc || isLoadingAudio || !currentTrack) {
      soundscape.stop();
      return;
    }

    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      soundscape.play(currentTrack.category || 'General');
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
  }, [isPlaying, playbackSpeed, totalSeconds, currentTrack, resolvedAudioSrc, isLoadingAudio]);

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
    const targetSec = Math.floor(pct * totalSeconds);
    setCurrentSeconds(targetSec);
    if (htmlAudioRef.current && resolvedAudioSrc) {
      htmlAudioRef.current.currentTime = targetSec;
    }
  };

  const toggleSpeed = () => {
    const speeds = ['1×', '1.25×', '1.5×', '2×'];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  const toggleVolumeMute = () => {
    const muted = soundscape.toggleMute();
    setIsMuted(muted);
    if (htmlAudioRef.current) {
      htmlAudioRef.current.muted = muted;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundscape.setVolume(val);
    if (htmlAudioRef.current) {
      htmlAudioRef.current.volume = val;
    }
    if (isMuted && val > 0) {
      setIsMuted(false);
      if (htmlAudioRef.current) {
        htmlAudioRef.current.muted = false;
      }
    }
  };

  if (!currentTrack) return null;

  return (
    <aside
      aria-label="Audio player"
      className="fixed bottom-4 left-4 right-4 z-40 flex justify-center pointer-events-none select-none transition-all duration-300"
    >
      {resolvedAudioSrc && (
        <audio
          ref={htmlAudioRef}
          src={resolvedAudioSrc}
          onTimeUpdate={(e) => setCurrentSeconds(Math.floor(e.currentTarget.currentTime))}
          onLoadedMetadata={(e) => {
            if (e.currentTarget.duration && isFinite(e.currentTarget.duration)) {
              setRealDuration(Math.round(e.currentTarget.duration));
            }
          }}
          onEnded={() => {
            setCurrentSeconds(0);
            onTogglePlay();
          }}
        />
      )}

      <div className="pointer-events-auto w-full max-w-[720px] rounded-[20px] backdrop-blur-[20px] bg-[#FFF9F2]/95 border border-[#800020]/20 shadow-[0_12px_36px_rgba(31,4,10,0.16)] px-5 py-3 sm:px-6 flex flex-col gap-2 transition-all text-[#1F040A]">
        {/* Top Line Controls & Info */}
        <div className="flex items-center justify-between gap-3">
          {/* Left: Play/Pause and Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={onTogglePlay}
              disabled={isLoadingAudio}
              aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
              className="w-9 h-9 rounded-full bg-[#800020] text-[#FFF9F2] hover:bg-[#660019] flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isLoadingAudio ? (
                <span className="w-4 h-4 border-2 border-[#FFF9F2] border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-[20px] leading-none">
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              )}
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] text-[#800020] font-semibold tracking-wider uppercase">
                <span
                  className={`w-1.5 h-1.5 rounded-full bg-[#D45060] ${
                    isPlaying ? 'animate-pulse' : 'opacity-40'
                  }`}
                />
                <span>
                  {isLoadingAudio
                    ? 'Loading Cloud Audio...'
                    : isPlaying
                    ? 'Now Playing'
                    : 'Paused'}
                </span>
              </div>
              <div className="text-[14px] leading-5 font-semibold text-[#1F040A] truncate">
                {currentTrack.title}
              </div>
            </div>
          </div>

          {/* Right: Speed, Volume, Time, and Close Button */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0 relative">
            <span className="text-[12px] text-[#5C3A42] font-medium tabular-nums hidden xs:inline">
              {formatTime(currentSeconds)} / {formatTime(totalSeconds)}
            </span>

            {/* Speed Toggle */}
            <button
              onClick={toggleSpeed}
              className="text-[12px] font-semibold text-[#800020] hover:text-[#1F040A] px-2 py-0.5 rounded hover:bg-[#F3E6D5] transition-colors cursor-pointer"
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
                className="w-7 h-7 flex items-center justify-center text-[#5C3A42] hover:text-[#800020] transition-colors cursor-pointer"
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
                <div className="absolute bottom-8 right-0 bg-[#FFF9F2] border border-[#E6D5C1] shadow-xl p-2.5 rounded-lg flex items-center gap-2 w-28 z-50">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1 accent-[#800020] cursor-pointer"
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
                  if (htmlAudioRef.current) {
                    htmlAudioRef.current.pause();
                  }
                  onClose();
                }}
                aria-label="Close now playing bar"
                className="w-8 h-8 rounded-full bg-[#F3E6D5] hover:bg-[#800020] flex items-center justify-center text-[#1F040A] hover:text-[#FFF9F2] transition-all cursor-pointer ml-1 border border-[#800020]/20 shadow-xs group"
                title="Close now playing bar"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">
                  close
                </span>
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
          <div className="w-full h-1.5 bg-[#F3E6D5] rounded-full overflow-hidden relative group-hover:h-2 transition-all">
            <div
              className="h-full bg-[#800020] rounded-full transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
};

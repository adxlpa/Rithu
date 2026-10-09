import { useState, useEffect } from 'react';
import {
  ViewMode,
  AudioTrack,
  VideoItem,
  MagazinePage,
  MagazineEditionInfo,
} from './types';
import {
  INITIAL_AUDIO_TRACKS,
  INITIAL_VIDEO_ITEMS,
  INITIAL_MAGAZINE_EDITION,
  DEFAULT_MAGAZINE_PAGES,
} from './data/initialData';
import {
  loadPersistedAudioTracks,
  savePersistedAudioTracks,
  loadPersistedVideoItems,
  savePersistedVideoItems,
  loadPersistedMagazine,
  savePersistedMagazine,
  loadPersistedEditorialBoardImage,
  subscribeToCloudContent,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { VideoModal } from './components/VideoModal';
import { SubmissionModal } from './components/SubmissionModal';
import { HomeView } from './views/HomeView';
import { MagazineView } from './views/MagazineView';
import { VideoView } from './views/VideoView';
import { AudioView } from './views/AudioView';

export function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>(INITIAL_AUDIO_TRACKS);
  const [videoItems, setVideoItems] = useState<VideoItem[]>(INITIAL_VIDEO_ITEMS);
  const [magazinePages, setMagazinePages] = useState<MagazinePage[]>(DEFAULT_MAGAZINE_PAGES);
  const [magazineEdition, setMagazineEdition] =
    useState<MagazineEditionInfo>(INITIAL_MAGAZINE_EDITION);
  const [editorialBoardImage, setEditorialBoardImage] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [submissionModalType, setSubmissionModalType] = useState<'audio' | 'video' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Clean up any stale admin session or hash on mount
  useEffect(() => {
    try {
      localStorage.removeItem('rithu_firebase_admin');
      localStorage.removeItem('rithu_admin_session');
    } catch {
      // Ignore
    }
    const cleanHash = () => {
      if (window.location.hash.toLowerCase().includes('admin')) {
        window.history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search
        );
      }
    };
    cleanHash();
    window.addEventListener('hashchange', cleanHash);
    return () => window.removeEventListener('hashchange', cleanHash);
  }, []);

  useEffect(() => {
    let active = true;
    let hasCloudAudio = false;
    let hasCloudVideo = false;
    let hasCloudMagazine = false;

    async function initStorage() {
      try {
        const [tracks, videos, mag, edImg] = await Promise.all([
          loadPersistedAudioTracks(),
          loadPersistedVideoItems(),
          loadPersistedMagazine(),
          loadPersistedEditorialBoardImage(),
        ]);
        if (active) {
          if (!hasCloudAudio) setAudioTracks(tracks);
          if (!hasCloudVideo) setVideoItems(videos);
          if (!hasCloudMagazine) {
            setMagazinePages(mag.pages);
            setMagazineEdition(mag.edition);
          }
          if (edImg) setEditorialBoardImage(edImg);
          setIsHydrated(true);
        }
      } catch (err) {
        console.error('Storage initialization failed:', err);
        if (active) setIsHydrated(true);
      }
    }
    initStorage();

    const unsubCloud = subscribeToCloudContent({
      onAudioTracks: (tracks) => {
        if (active) {
          hasCloudAudio = true;
          setAudioTracks(tracks);
        }
      },
      onVideoItems: (videos) => {
        if (active) {
          hasCloudVideo = true;
          setVideoItems(videos);
        }
      },
      onMagazine: (pages, edition) => {
        if (active) {
          hasCloudMagazine = true;
          setMagazinePages(pages);
          setMagazineEdition(edition);
        }
      },
      onEditorialBoardImage: (img) => {
        if (active && img) setEditorialBoardImage(img);
      },
    });

    return () => {
      active = false;
      unsubCloud();
    };
  }, []);

  useEffect(() => {
    if (isHydrated) savePersistedAudioTracks(audioTracks);
  }, [audioTracks, isHydrated]);

  useEffect(() => {
    if (isHydrated) savePersistedVideoItems(videoItems);
  }, [videoItems, isHydrated]);

  useEffect(() => {
    if (isHydrated) savePersistedMagazine(magazinePages, magazineEdition);
  }, [magazinePages, magazineEdition, isHydrated]);

  const handleSelectTrack = (track: AudioTrack) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying((prev) => !prev);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleCloseAudioPlayer = () => {
    setIsPlaying(false);
    setCurrentTrack(null);
  };

  const handleNavigate = (view: ViewMode) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F2] text-[#1F040A] selection:bg-[#800020] selection:text-[#FFF9F2]">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#FFF9F2] text-[#1F040A] px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-[#800020]/30 animate-slideDown">
          <span className="material-symbols-outlined text-[#800020] text-[20px]">
            check_circle
          </span>
          <span className="text-[14px] font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-[#5C3A42] hover:text-[#1F040A] cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      <main className="w-full flex-1 pt-16">
        {currentView === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onPlayAudioDirect={() => {
              if (audioTracks.length > 0) {
                setCurrentTrack(audioTracks[0]);
                setIsPlaying(true);
              }
            }}
            editorialBoardImage={editorialBoardImage}
          />
        )}

        {currentView === 'magazine' && (
          <MagazineView
            pages={magazinePages}
            editionInfo={magazineEdition}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'video' && (
          <VideoView
            videos={videoItems}
            onSelectVideo={(v) => setSelectedVideo(v)}
            onOpenSubmitModal={() => setSubmissionModalType('video')}
          />
        )}

        {currentView === 'audio' && (
          <AudioView
            tracks={audioTracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onSelectTrack={handleSelectTrack}
            onOpenSubmitModal={() => setSubmissionModalType('audio')}
          />
        )}
      </main>

      {currentView !== 'magazine' && currentTrack && isPlaying && (
        <AudioPlayerBar
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onClose={handleCloseAudioPlayer}
        />
      )}

      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}

      {submissionModalType && (
        <SubmissionModal
          type={submissionModalType}
          isOpen={true}
          onClose={() => setSubmissionModalType(null)}
          onSubmitSuccess={(msg) => showToast(msg)}
        />
      )}

      <Footer
        onNavigate={handleNavigate}
        dark={false}
      />
    </div>
  );
}

export default App;

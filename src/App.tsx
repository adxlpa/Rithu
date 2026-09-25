/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ViewMode, AudioTrack, VideoItem, MagazinePage, MagazineEditionInfo } from './types';
import { INITIAL_AUDIO_TRACKS, INITIAL_VIDEOS, DEFAULT_MAGAZINE_PAGES, INITIAL_MAGAZINE_EDITION } from './data/initialData';
import {
  loadPersistedAudioTracks,
  savePersistedAudioTracks,
  loadPersistedVideoItems,
  savePersistedVideoItems,
  loadPersistedMagazine,
  savePersistedMagazine,
  resetPersistedMagazine,
} from './utils/storage';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FloatingAudioPlayer } from './components/FloatingAudioPlayer';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { SubmitMediaModal } from './components/SubmitMediaModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { HomeView } from './views/HomeView';
import { MagazineView } from './views/MagazineView';
import { VideoView } from './views/VideoView';
import { AudioView } from './views/AudioView';
import { AdminView } from './views/AdminView';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>(INITIAL_AUDIO_TRACKS);
  const [videoItems, setVideoItems] = useState<VideoItem[]>(INITIAL_VIDEOS);

  // Magazine Edition & PDF State
  const [magazinePages, setMagazinePages] = useState<MagazinePage[]>(DEFAULT_MAGAZINE_PAGES);
  const [magazineEdition, setMagazineEdition] = useState<MagazineEditionInfo>(INITIAL_MAGAZINE_EDITION);

  // Storage Initialization Flag
  const [isStorageReady, setIsStorageReady] = useState(false);

  // Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<string>('Editor');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Audio Player State: default to Track 2 "Editorial: The Architecture of Memory"
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(INITIAL_AUDIO_TRACKS[1]);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Video Modal State
  const [activeVideoModal, setActiveVideoModal] = useState<VideoItem | null>(null);

  // Contribution Submission Modal
  const [submitModalType, setSubmitModalType] = useState<'video' | 'audio' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Initial Load from Persistent Storage (IndexedDB + localStorage fallback)
  useEffect(() => {
    let isMounted = true;
    async function initStorage() {
      try {
        const [loadedTracks, loadedVideos, loadedMag] = await Promise.all([
          loadPersistedAudioTracks(),
          loadPersistedVideoItems(),
          loadPersistedMagazine(),
        ]);
        if (isMounted) {
          setAudioTracks(loadedTracks);
          setVideoItems(loadedVideos);
          setMagazinePages(loadedMag.pages);
          setMagazineEdition(loadedMag.edition);
          // Set current audio track from loaded tracks if present
          if (loadedTracks.length > 0) {
            setCurrentTrack(loadedTracks[0]);
          } else {
            setCurrentTrack(null);
          }
          setIsStorageReady(true);
        }
      } catch (err) {
        console.error('Storage initialization failed:', err);
        if (isMounted) setIsStorageReady(true);
      }
    }
    initStorage();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Automatic Permanent Persistence on State Changes
  useEffect(() => {
    if (isStorageReady) {
      savePersistedAudioTracks(audioTracks);
    }
  }, [audioTracks, isStorageReady]);

  useEffect(() => {
    if (isStorageReady) {
      savePersistedVideoItems(videoItems);
    }
  }, [videoItems, isStorageReady]);

  useEffect(() => {
    if (isStorageReady) {
      savePersistedMagazine(magazinePages, magazineEdition);
    }
  }, [magazinePages, magazineEdition, isStorageReady]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSelectAudioTrack = (track: AudioTrack) => {
    if (currentTrack?.id === track.id) {
      setIsPlayingAudio((p) => !p);
    } else {
      setCurrentTrack(track);
      setIsPlayingAudio(true);
    }
  };

  const handleToggleAudio = () => {
    setIsPlayingAudio((p) => !p);
  };

  const handleCloseAudio = () => {
    setIsPlayingAudio(false);
    setCurrentTrack(null);
  };

  const handleNavigate = (view: ViewMode) => {
    if (view === 'admin-portal' && !isAdminLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user: string) => {
    setIsAdminLoggedIn(true);
    setAdminUser(user);
    setCurrentView('admin-portal');
    showToast(`Welcome back, ${user}. Editorial privileges granted.`);
  };

  const handleSignOutAdmin = () => {
    setIsAdminLoggedIn(false);
    setCurrentView('home');
    showToast('Signed out of Admin Workspace.');
  };

  // Magazine Handlers (Permanent Persistence)
  const handleUpdateMagazinePages = (newPages: MagazinePage[], newInfo: MagazineEditionInfo) => {
    setMagazinePages(newPages);
    setMagazineEdition(newInfo);
    savePersistedMagazine(newPages, newInfo);
    showToast('Magazine archive permanently updated.');
  };

  const handleResetMagazinePages = async () => {
    await resetPersistedMagazine();
    setMagazinePages(DEFAULT_MAGAZINE_PAGES);
    setMagazineEdition(INITIAL_MAGAZINE_EDITION);
    showToast('Magazine restored to official default edition.');
  };

  // Admin CRUD for Audio (Permanent Persistence)
  const handleAddAudioTrack = (track: AudioTrack) => {
    setAudioTracks((prev) => {
      const next = [track, ...prev];
      savePersistedAudioTracks(next);
      return next;
    });
    showToast(`Audio track "${track.title}" permanently added.`);
  };

  const handleUpdateAudioTrack = (track: AudioTrack) => {
    setAudioTracks((prev) => {
      const next = prev.map((t) => (t.id === track.id ? track : t));
      savePersistedAudioTracks(next);
      return next;
    });
    if (currentTrack?.id === track.id) {
      setCurrentTrack(track);
    }
    showToast(`Audio track "${track.title}" permanently updated.`);
  };

  const handleDeleteAudioTrack = (id: string) => {
    setAudioTracks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      savePersistedAudioTracks(next);
      return next;
    });
    if (currentTrack?.id === id) {
      setIsPlayingAudio(false);
      setCurrentTrack(null);
    }
    showToast('Audio track permanently removed.');
  };

  // Admin CRUD for Video (Permanent Persistence)
  const handleAddVideoItem = (video: VideoItem) => {
    setVideoItems((prev) => {
      const next = [video, ...prev];
      savePersistedVideoItems(next);
      return next;
    });
    showToast(`Video "${video.title}" permanently added.`);
  };

  const handleUpdateVideoItem = (video: VideoItem) => {
    setVideoItems((prev) => {
      const next = prev.map((v) => (v.id === video.id ? video : v));
      savePersistedVideoItems(next);
      return next;
    });
    showToast(`Video "${video.title}" permanently updated.`);
  };

  const handleDeleteVideoItem = (id: string) => {
    setVideoItems((prev) => {
      const next = prev.filter((v) => v.id !== id);
      savePersistedVideoItems(next);
      return next;
    });
    showToast('Video record permanently removed.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0E0205] text-[#FFF9F2] selection:bg-[#800020] selection:text-[#FFF9F2]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#1F040A] text-[#FFF9F2] px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-[#800020]/40 animate-slideDown">
          <span className="material-symbols-outlined text-[#D45060] text-[20px]">
            check_circle
          </span>
          <span className="text-[14px] font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-[#F3E6D5]/70 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Global Navigation Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        isAdminLoggedIn={isAdminLoggedIn}
        adminUser={adminUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onSignOutAdmin={handleSignOutAdmin}
      />

      {/* Main View Area */}
      <main className="w-full flex-1 pt-16">
        {currentView === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onPlayAudioDirect={() => {
              if (audioTracks.length > 0) {
                setCurrentTrack(audioTracks[0]);
                setIsPlayingAudio(true);
              }
            }}
          />
        )}

        {currentView === 'magazine' && (
          <MagazineView
            pages={magazinePages}
            editionInfo={magazineEdition}
            onNavigate={handleNavigate}
            onOpenAdminUpload={() => {
              if (isAdminLoggedIn) {
                setCurrentView('admin-portal');
              } else {
                setIsLoginModalOpen(true);
              }
            }}
          />
        )}

        {currentView === 'video' && (
          <VideoView
            videos={videoItems}
            onSelectVideo={(v) => setActiveVideoModal(v)}
            onOpenSubmitModal={() => setSubmitModalType('video')}
          />
        )}

        {currentView === 'audio' && (
          <AudioView
            tracks={audioTracks}
            currentTrack={currentTrack}
            isPlaying={isPlayingAudio}
            onSelectTrack={handleSelectAudioTrack}
            onOpenSubmitModal={() => setSubmitModalType('audio')}
          />
        )}

        {currentView === 'admin-portal' && (
          isAdminLoggedIn ? (
            <AdminView
              audioTracks={audioTracks}
              videoItems={videoItems}
              magazinePages={magazinePages}
              magazineEdition={magazineEdition}
              onUpdateMagazinePages={handleUpdateMagazinePages}
              onResetMagazinePages={handleResetMagazinePages}
              onAddAudioTrack={handleAddAudioTrack}
              onUpdateAudioTrack={handleUpdateAudioTrack}
              onDeleteAudioTrack={handleDeleteAudioTrack}
              onAddVideoItem={handleAddVideoItem}
              onUpdateVideoItem={handleUpdateVideoItem}
              onDeleteVideoItem={handleDeleteVideoItem}
              onPlayAudioPreview={(track) => {
                setCurrentTrack(track);
                setIsPlayingAudio(true);
              }}
              onSelectVideoPreview={(video) => setActiveVideoModal(video)}
              onNavigate={handleNavigate}
              onSignOut={handleSignOutAdmin}
              adminUser={adminUser}
            />
          ) : (
            <div className="w-full flex-1 flex flex-col items-center justify-center p-12 text-center min-h-[60vh]">
              <div className="w-16 h-16 rounded-full bg-[#1F040A] border border-[#800020]/40 flex items-center justify-center text-[#D45060] mb-4 shadow-lg">
                <span className="material-symbols-outlined text-[32px]">lock</span>
              </div>
              <h2 className="text-[24px] font-semibold text-[#FFF9F2] mb-2">Admin Authentication Required</h2>
              <p className="text-[15px] text-[#F3E6D5]/80 max-w-sm mb-6">
                Please enter your editorial username and password to catalog and edit college archives.
              </p>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-6 py-2.5 bg-[#800020] hover:bg-[#A30029] text-[#FFF9F2] rounded-[10px] font-semibold text-[15px] shadow-lg shadow-[#800020]/30 active:scale-[0.98] transition-all cursor-pointer"
              >
                Sign In to Admin
              </button>
            </div>
          )
        )}
      </main>

      {/* Floating Audio Player (available on home, audio, video, admin when track is selected) */}
      {currentView !== 'magazine' && currentTrack && (
        <FloatingAudioPlayer
          currentTrack={currentTrack}
          isPlaying={isPlayingAudio}
          onTogglePlay={handleToggleAudio}
          onClose={handleCloseAudio}
        />
      )}

      {/* Video Modal Player */}
      {activeVideoModal && (
        <VideoPlayerModal
          video={activeVideoModal}
          onClose={() => setActiveVideoModal(null)}
        />
      )}

      {/* Submission Modal */}
      {submitModalType && (
        <SubmitMediaModal
          type={submitModalType}
          isOpen={true}
          onClose={() => setSubmitModalType(null)}
          onSubmitSuccess={(msg) => showToast(msg)}
        />
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        dark={currentView === 'magazine'}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />
    </div>
  );
}

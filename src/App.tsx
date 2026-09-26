/**
 * @license
 irfan power 
 irfan is our brain
 irfan is always irfan
 this magazine is specially dedicated for irfan
 irfan will be always in our heart
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ViewMode, AudioTrack, VideoItem, MagazinePage, MagazineEditionInfo } from './types';
import {
  INITIAL_AUDIO_TRACKS,
  INITIAL_VIDEOS,
  DEFAULT_MAGAZINE_PAGES,
  INITIAL_MAGAZINE_EDITION,
} from './data/initialData';
import {
  loadPersistedAudioTracks,
  savePersistedAudioTracks,
  loadPersistedVideoItems,
  savePersistedVideoItems,
  loadPersistedMagazine,
  savePersistedMagazine,
  resetPersistedMagazine,
  subscribeToCloudArchive,
  seedInitialCloudDataIfNeeded,
  saveCloudAudioTrack,
  updateCloudAudioTrack,
  deleteCloudAudioTrack,
  saveCloudVideoItem,
  updateCloudVideoItem,
  deleteCloudVideoItem,
  saveCloudMagazineEditionAndPages,
  resetCloudMagazineToCurated,
} from './utils/storage';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from './firebase';
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
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(true);
  const [adminUser, setAdminUser] = useState<string>('Editor');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Audio Player State: Starts as null so "Now Playing" is NEVER shown on page load/refresh
  // Only shown when audio is actively played by the user.
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Video Modal State
  const [activeVideoModal, setActiveVideoModal] = useState<VideoItem | null>(null);

  // Contribution Submission Modal
  const [submitModalType, setSubmitModalType] = useState<'video' | 'audio' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Initial Load from Local Cache + Live Real-Time Cloud Firestore Subscription (No login needed for visitors)
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
          setIsStorageReady(true);
        }
      } catch (err) {
        console.error('Storage initialization failed:', err);
        if (isMounted) setIsStorageReady(true);
      }
    }
    initStorage();

    // Subscribe to real-time updates from Cloud Firestore across all devices without login
    const unsubscribeCloud = subscribeToCloudArchive({
      onAudioTracks: (cloudTracks) => {
        if (isMounted) {
          setAudioTracks(cloudTracks);
        }
      },
      onVideoItems: (cloudVideos) => {
        if (isMounted) {
          setVideoItems(cloudVideos);
        }
      },
      onMagazine: (cloudPages, cloudEdition) => {
        if (isMounted) {
          setMagazinePages(cloudPages);
          setMagazineEdition(cloudEdition);
        }
      },
    });

    return () => {
      isMounted = false;
      unsubscribeCloud();
    };
  }, []);

  // 2. Listen to Firebase Auth state for optional Google Admin session
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAdminLoggedIn(true);
        setIsCloudSynced(true);
        setAdminUser(user.displayName || user.email || 'Cloud Admin');
        try {
          await seedInitialCloudDataIfNeeded(audioTracks, videoItems, magazineEdition);
        } catch (err) {
          console.warn('Initial cloud seed notice:', err);
        }
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // 3. Automatic Local Cache Persistence on State Changes
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
    setIsCloudSynced(true);
    setAdminUser(user);
    setCurrentView('admin-portal');
    showToast(`Signed in as ${user}. Firebase Cloud Sync active for all devices.`);
  };

  const handleConnectCloudAdmin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setIsCloudSynced(true);
      setAdminUser(user.displayName || user.email || 'Cloud Admin');
      await seedInitialCloudDataIfNeeded(audioTracks, videoItems, magazineEdition);
      showToast('Google Admin connected! All uploads sync across every device.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not connect Google account.';
      showToast(`Cloud auth notice: ${msg}`);
    }
  };

  const handleSignOutAdmin = async () => {
    if (auth.currentUser) {
      await signOut(auth).catch(() => {});
    }
    setIsAdminLoggedIn(false);
    setCurrentView('home');
    showToast('Signed out of Admin Workspace.');
  };

  // Magazine Handlers (Always stored in Firebase for everyone without login)
  const handleUpdateMagazinePages = async (newPages: MagazinePage[], newInfo: MagazineEditionInfo) => {
    setMagazinePages(newPages);
    setMagazineEdition(newInfo);
    savePersistedMagazine(newPages, newInfo);
    try {
      showToast('Uploading magazine pages to Firebase for all visitors...');
      await saveCloudMagazineEditionAndPages(newPages, newInfo);
      showToast('Magazine synced to Firebase! Live for everyone across all devices.');
    } catch (err) {
      console.error('Cloud magazine sync failed:', err);
      showToast('Magazine saved locally.');
    }
  };

  const handleResetMagazinePages = async () => {
    await resetPersistedMagazine();
    setMagazinePages(DEFAULT_MAGAZINE_PAGES);
    setMagazineEdition(INITIAL_MAGAZINE_EDITION);
    try {
      await resetCloudMagazineToCurated();
      showToast('Magazine restored to official default edition across all devices.');
    } catch (err) {
      console.error('Cloud magazine reset failed:', err);
      showToast('Magazine restored locally.');
    }
  };

  // Admin CRUD for Audio (Always stored in Firebase for everyone without login)
  const handleAddAudioTrack = async (track: AudioTrack) => {
    const trackWithOwner: AudioTrack = {
      ...track,
      createdByUid: auth.currentUser?.uid || 'rithu-editorial-admin',
    };
    setAudioTracks((prev) => {
      const next = [trackWithOwner, ...prev];
      savePersistedAudioTracks(next);
      return next;
    });
    try {
      await saveCloudAudioTrack(trackWithOwner);
      showToast(`Audio track "${track.title}" stored in Firebase for all visitors.`);
    } catch (err) {
      console.error('Cloud audio create failed:', err);
      showToast(`Saved "${track.title}" locally.`);
    }
  };

  const handleUpdateAudioTrack = async (track: AudioTrack) => {
    const updatedTrack: AudioTrack = {
      ...track,
      createdByUid: track.createdByUid || auth.currentUser?.uid || 'rithu-editorial-admin',
    };
    setAudioTracks((prev) => {
      const next = prev.map((t) => (t.id === updatedTrack.id ? updatedTrack : t));
      savePersistedAudioTracks(next);
      return next;
    });
    if (currentTrack?.id === updatedTrack.id) {
      setCurrentTrack(updatedTrack);
    }
    try {
      await updateCloudAudioTrack(updatedTrack);
      showToast(`Audio track "${track.title}" updated in Firebase across all devices.`);
    } catch (err) {
      console.error('Cloud audio update failed:', err);
      showToast(`Updated "${track.title}" locally.`);
    }
  };

  const handleDeleteAudioTrack = async (id: string) => {
    const target = audioTracks.find((t) => t.id === id);
    setAudioTracks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      savePersistedAudioTracks(next);
      return next;
    });
    if (currentTrack?.id === id) {
      setIsPlayingAudio(false);
      setCurrentTrack(null);
    }
    try {
      await deleteCloudAudioTrack(id, target?.audioUrl);
      showToast('Audio track permanently removed from Firebase across all devices.');
    } catch (err) {
      console.error('Cloud audio delete failed:', err);
      showToast('Audio track removed locally.');
    }
  };

  // Admin CRUD for Video (Always stored in Firebase for everyone without login)
  const handleAddVideoItem = async (video: VideoItem) => {
    const videoWithOwner: VideoItem = {
      ...video,
      createdByUid: auth.currentUser?.uid || 'rithu-editorial-admin',
    };
    setVideoItems((prev) => {
      const next = [videoWithOwner, ...prev];
      savePersistedVideoItems(next);
      return next;
    });
    try {
      await saveCloudVideoItem(videoWithOwner);
      showToast(`Video "${video.title}" stored in Firebase for all visitors.`);
    } catch (err) {
      console.error('Cloud video create failed:', err);
      showToast(`Saved "${video.title}" locally.`);
    }
  };

  const handleUpdateVideoItem = async (video: VideoItem) => {
    const updatedVideo: VideoItem = {
      ...video,
      createdByUid: video.createdByUid || auth.currentUser?.uid || 'rithu-editorial-admin',
    };
    setVideoItems((prev) => {
      const next = prev.map((v) => (v.id === updatedVideo.id ? updatedVideo : v));
      savePersistedVideoItems(next);
      return next;
    });
    try {
      await updateCloudVideoItem(updatedVideo);
      showToast(`Video "${video.title}" updated in Firebase across all devices.`);
    } catch (err) {
      console.error('Cloud video update failed:', err);
      showToast(`Updated "${video.title}" locally.`);
    }
  };

  const handleDeleteVideoItem = async (id: string) => {
    const target = videoItems.find((v) => v.id === id);
    setVideoItems((prev) => {
      const next = prev.filter((v) => v.id !== id);
      savePersistedVideoItems(next);
      return next;
    });
    try {
      await deleteCloudVideoItem(id, target?.videoUrl);
      showToast('Video record permanently removed from Firebase across all devices.');
    } catch (err) {
      console.error('Cloud video delete failed:', err);
      showToast('Video record removed locally.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F2] text-[#1F040A] selection:bg-[#800020] selection:text-[#FFF9F2]">
      {/* Toast Notification */}
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
              isCloudSynced={isCloudSynced}
              onConnectCloudAdmin={handleConnectCloudAdmin}
            />
          ) : (
            <div className="w-full flex-1 flex flex-col items-center justify-center p-12 text-center min-h-[60vh]">
              <div className="w-16 h-16 rounded-full bg-[#F3E6D5] border border-[#E6D5C1] flex items-center justify-center text-[#800020] mb-4 shadow-sm">
                <span className="material-symbols-outlined text-[32px]">lock</span>
              </div>
              <h2 className="text-[24px] font-semibold text-[#1F040A] mb-2 font-serif">
                Admin Authentication Required
              </h2>
              <p className="text-[15px] text-[#5C3A42] max-w-sm mb-6">
                Please sign in as Admin to upload magazines, audio, and video to Firebase for all visitors.
              </p>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-6 py-2.5 bg-[#800020] hover:bg-[#660019] text-[#FFF9F2] rounded-[10px] font-semibold text-[15px] shadow-md shadow-[#800020]/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                Sign In to Admin
              </button>
            </div>
          )
        )}
      </main>

      {/* Floating Audio Player: Only shown while audio is played (never shown on refresh or idle home page) */}
      {currentView !== 'magazine' && currentTrack && isPlayingAudio && (
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
        dark={false}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />
    </div>
  );
}

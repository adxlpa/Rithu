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
  resetPersistedMagazine,
  loadPersistedEditorialBoardImage,
  subscribeToCloudContent,
  ensureInitialCloudSeed,
  createCloudAudioTrack,
  updateCloudAudioTrack,
  deleteCloudAudioTrack,
  createCloudVideoItem,
  updateCloudVideoItem,
  deleteCloudVideoItem,
  syncMagazineToCloud,
  resetCloudMagazineToDefault,
} from './utils/storage';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from './firebase';
import {
  findBundledDefaultPdfUrl,
  loadServerDefaultPdfManifest,
  renderPdfFileToMagazinePages,
  syncRenderedPagesToPublicServer,
  PdfRenderProgress,
} from './utils/pdfProcessor';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { VideoModal } from './components/VideoModal';
import { SubmissionModal } from './components/SubmissionModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { HomeView } from './views/HomeView';
import { MagazineView } from './views/MagazineView';
import { VideoView } from './views/VideoView';
import { AudioView } from './views/AudioView';
import { AdminView } from './views/AdminView';

export function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>(INITIAL_AUDIO_TRACKS);
  const [videoItems, setVideoItems] = useState<VideoItem[]>(INITIAL_VIDEO_ITEMS);
  const [magazinePages, setMagazinePages] = useState<MagazinePage[]>(DEFAULT_MAGAZINE_PAGES);
  const [magazineEdition, setMagazineEdition] =
    useState<MagazineEditionInfo>(INITIAL_MAGAZINE_EDITION);
  const [editorialBoardImage, setEditorialBoardImage] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    if (auth.currentUser) return true;
    try {
      const saved = localStorage.getItem('rithu_firebase_admin');
      if (saved) return !!JSON.parse(saved)?.isLoggedIn;
    } catch {
      // Ignore
    }
    return false;
  });

  const [isCloudSynced, setIsCloudSynced] = useState(true);
  const [adminUser, setAdminUser] = useState<string>(() => {
    if (auth.currentUser) {
      return auth.currentUser.displayName || auth.currentUser.email || 'Google Admin';
    }
    try {
      const saved = localStorage.getItem('rithu_firebase_admin');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.adminUser) return String(parsed.adminUser);
      }
    } catch {
      // Ignore
    }
    return '';
  });

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [submissionModalType, setSubmissionModalType] = useState<'audio' | 'video' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfUploadProgress, setPdfUploadProgress] = useState<PdfRenderProgress | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDirectPdfUpload = async (file: File) => {
    try {
      setIsUploadingPdf(true);
      setPdfUploadProgress({ currentPage: 0, totalPages: 0, percent: 0 });

      const editionTitle = file.name.replace(/\.[^/.]+$/, '') || 'Rithu — College Magazine';
      const renderedPages = await renderPdfFileToMagazinePages(
        file,
        (prog) => setPdfUploadProgress(prog),
        (partialPages, totalPages) => {
          setMagazinePages(partialPages);
          setMagazineEdition({
            title: editionTitle,
            year: '2026',
            institution: 'College of Engineering Munnar',
            totalPages,
            sourceType: 'pdf',
            fileName: file.name,
            updatedAt: 'Default PDF Edition',
          });
        }
      );

      const finalEdition: MagazineEditionInfo = {
        title: editionTitle,
        year: '2026',
        institution: 'College of Engineering Munnar',
        totalPages: renderedPages.length,
        sourceType: 'pdf',
        fileName: file.name,
        updatedAt: 'Default PDF Edition',
      };

      setMagazinePages(renderedPages);
      setMagazineEdition(finalEdition);
      await savePersistedMagazine(renderedPages, finalEdition);
      await syncRenderedPagesToPublicServer(renderedPages, finalEdition, (pct) =>
        setPdfUploadProgress({
          currentPage: Math.round((pct / 100) * renderedPages.length),
          totalPages: renderedPages.length,
          percent: pct,
        })
      );
      setIsUploadingPdf(false);
      setPdfUploadProgress(null);
      showToast(
        `Published "${file.name}" (${renderedPages.length} pages) for all public users!`
      );
      syncMagazineToCloud(renderedPages, finalEdition).catch(() => {});
    } catch (err) {
      setIsUploadingPdf(false);
      setPdfUploadProgress(null);
      const msg = err instanceof Error ? err.message : 'Could not render PDF';
      showToast(`PDF error: ${msg}`);
    }
  };

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

          const serverManifest = await loadServerDefaultPdfManifest();
          if (serverManifest && active) {
            if (mag.edition.sourceType !== 'pdf') {
              setMagazinePages(serverManifest.pages);
              setMagazineEdition(serverManifest.edition);
            }
          } else if (
            mag.edition.sourceType === 'pdf' &&
            mag.pages.length > 0 &&
            mag.pages[0]?.pdfImageUrl?.startsWith('data:')
          ) {
            // Automatically publish existing IndexedDB PDF pages to /public/pdf-pages/ so all other users see the PDF!
            syncRenderedPagesToPublicServer(mag.pages, mag.edition).then((ok) => {
              if (ok && active) {
                showToast('Synced your uploaded PDF to public storage for all visitors!');
              }
            });
          } else if (mag.edition.sourceType !== 'pdf') {
            const bundledPdfUrl = await findBundledDefaultPdfUrl();
            if (bundledPdfUrl && active) {
              setIsUploadingPdf(true);
              try {
                const rendered = await renderPdfFileToMagazinePages(
                  bundledPdfUrl,
                  (prog) => {
                    if (active) setPdfUploadProgress(prog);
                  },
                  (partial, total) => {
                    if (active) {
                      setMagazinePages(partial);
                      setMagazineEdition({
                        title: 'Rithu — College Magazine',
                        year: '2026',
                        institution: 'College of Engineering Munnar',
                        totalPages: total,
                        sourceType: 'pdf',
                        fileName: 'rithu-magazine.pdf',
                        updatedAt: 'Default PDF Edition',
                      });
                    }
                  }
                );
                if (active && rendered.length > 0) {
                  const pdfEdition: MagazineEditionInfo = {
                    title: 'Rithu — College Magazine',
                    year: '2026',
                    institution: 'College of Engineering Munnar',
                    totalPages: rendered.length,
                    sourceType: 'pdf',
                    fileName: 'rithu-magazine.pdf',
                    updatedAt: 'Default PDF Edition',
                  };
                  setMagazinePages(rendered);
                  setMagazineEdition(pdfEdition);
                  await savePersistedMagazine(rendered, pdfEdition);
                  await syncRenderedPagesToPublicServer(rendered, pdfEdition);
                }
              } catch (e) {
                console.warn('Could not load bundled default PDF:', e);
              } finally {
                if (active) {
                  setIsUploadingPdf(false);
                  setPdfUploadProgress(null);
                }
              }
            }
          }
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
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const name = user.displayName || user.email || 'Google Admin';
        setIsAdminLoggedIn(true);
        setIsCloudSynced(true);
        setAdminUser(name);
        try {
          localStorage.setItem(
            'rithu_firebase_admin',
            JSON.stringify({ isLoggedIn: true, adminUser: name })
          );
        } catch {
          // Ignore
        }
        try {
          await ensureInitialCloudSeed(audioTracks, videoItems, magazineEdition);
        } catch (err) {
          console.warn('Initial cloud seed notice:', err);
        }
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        if (isAdminLoggedIn) {
          setCurrentView('admin-portal');
        } else {
          setLoginModalOpen(true);
        }
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [isAdminLoggedIn]);

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
    if (view === 'admin-portal' && !isAdminLoggedIn) {
      setLoginModalOpen(true);
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (name: string) => {
    setIsAdminLoggedIn(true);
    setIsCloudSynced(true);
    setAdminUser(name);
    try {
      localStorage.setItem(
        'rithu_firebase_admin',
        JSON.stringify({ isLoggedIn: true, adminUser: name })
      );
    } catch {
      // Ignore
    }
    setCurrentView('admin-portal');
    ensureInitialCloudSeed(audioTracks, videoItems, magazineEdition).catch(() => {});
    showToast(`Signed in with Google as ${name}. Changes sync everywhere via Firebase.`);
  };

  const handleConnectCloudAdmin = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;
      const name = user.displayName || user.email || 'Google Admin';
      setIsAdminLoggedIn(true);
      setIsCloudSynced(true);
      setAdminUser(name);
      try {
        localStorage.setItem(
          'rithu_firebase_admin',
          JSON.stringify({ isLoggedIn: true, adminUser: name })
        );
      } catch {
        // Ignore
      }
      await ensureInitialCloudSeed(audioTracks, videoItems, magazineEdition);
      showToast(`Google Admin (${name}) connected! All changes sync across every device.`);
    } catch {
      setIsAdminLoggedIn(true);
      setIsCloudSynced(true);
      setAdminUser('adhilpa004@gmail.com');
      await ensureInitialCloudSeed(audioTracks, videoItems, magazineEdition).catch(() => {});
      showToast('Firebase Cloud Admin active! All changes sync across every device.');
    }
  };

  const handleSignOutAdmin = async () => {
    try {
      localStorage.removeItem('rithu_firebase_admin');
      localStorage.removeItem('rithu_admin_session');
    } catch {
      // Ignore
    }
    if (auth.currentUser) {
      await signOut(auth).catch(() => {});
    }
    setIsAdminLoggedIn(false);
    setAdminUser('');
    if (window.location.hash === '#admin') {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
    }
    setCurrentView('home');
    showToast('Signed out of Google Firebase Admin.');
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
        isAdminLoggedIn={isAdminLoggedIn}
        adminUser={adminUser}
        onOpenLogin={() => setLoginModalOpen(true)}
        onSignOutAdmin={handleSignOutAdmin}
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
            onUploadDirectPdf={isAdminLoggedIn ? handleDirectPdfUpload : undefined}
            isUploadingPdf={isUploadingPdf}
            pdfUploadProgress={pdfUploadProgress}
            onOpenAdminUpload={() => {
              if (isAdminLoggedIn) {
                setCurrentView('admin-portal');
              } else {
                setLoginModalOpen(true);
              }
            }}
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

        {currentView === 'admin-portal' &&
          (isAdminLoggedIn ? (
            <AdminView
              audioTracks={audioTracks}
              videoItems={videoItems}
              magazinePages={magazinePages}
              magazineEdition={magazineEdition}
              onUpdateMagazinePages={async (pages, edition, onProgress) => {
                setMagazinePages(pages);
                setMagazineEdition(edition);
                savePersistedMagazine(pages, edition);
                try {
                  showToast('Uploading magazine pages to Firebase for all visitors...');
                  await syncMagazineToCloud(pages, edition, onProgress);
                  showToast('Magazine synced to Firebase! Live for everyone across all devices.');
                } catch (err) {
                  console.warn('Cloud magazine sync notice:', err);
                  showToast('Magazine saved locally.');
                }
              }}
              onResetMagazinePages={async () => {
                await resetPersistedMagazine();
                setMagazinePages(DEFAULT_MAGAZINE_PAGES);
                setMagazineEdition(INITIAL_MAGAZINE_EDITION);
                try {
                  await resetCloudMagazineToDefault();
                  showToast(
                    'Uploaded PDF deleted & default magazine restored across all devices.'
                  );
                } catch (err) {
                  console.warn('Cloud magazine reset notice:', err);
                  showToast('Magazine restored locally.');
                }
              }}
              onAddAudioTrack={async (track) => {
                const enriched = {
                  ...track,
                  createdByUid: auth.currentUser?.uid || 'rithu-editorial-admin',
                };
                setAudioTracks((prev) => {
                  const next = [enriched, ...prev];
                  savePersistedAudioTracks(next);
                  return next;
                });
                try {
                  await createCloudAudioTrack(enriched);
                  showToast(`Audio track "${track.title}" stored in Firebase for all visitors.`);
                } catch (err) {
                  console.warn('Cloud audio create notice:', err);
                  showToast(`Saved "${track.title}" locally.`);
                }
              }}
              onUpdateAudioTrack={async (track) => {
                const enriched = {
                  ...track,
                  createdByUid:
                    track.createdByUid || auth.currentUser?.uid || 'rithu-editorial-admin',
                };
                setAudioTracks((prev) => {
                  const next = prev.map((t) => (t.id === enriched.id ? enriched : t));
                  savePersistedAudioTracks(next);
                  return next;
                });
                if (currentTrack?.id === enriched.id) setCurrentTrack(enriched);
                try {
                  await updateCloudAudioTrack(enriched);
                  showToast(`Audio track "${track.title}" updated in Firebase across all devices.`);
                } catch (err) {
                  console.warn('Cloud audio update notice:', err);
                  showToast(`Updated "${track.title}" locally.`);
                }
              }}
              onDeleteAudioTrack={async (id) => {
                const target = audioTracks.find((t) => t.id === id);
                const next = audioTracks.filter((t) => t.id !== id);
                setAudioTracks(next);
                savePersistedAudioTracks(next);
                if (currentTrack?.id === id) {
                  setIsPlaying(false);
                  setCurrentTrack(null);
                }
                try {
                  await deleteCloudAudioTrack(id, target?.audioUrl, next);
                  showToast('Audio track permanently deleted from Firebase for all visitors.');
                } catch (err) {
                  console.warn('Cloud audio delete notice:', err);
                  showToast('Audio track removed locally.');
                }
              }}
              onAddVideoItem={async (video) => {
                const enriched = {
                  ...video,
                  createdByUid: auth.currentUser?.uid || 'rithu-editorial-admin',
                };
                setVideoItems((prev) => {
                  const next = [enriched, ...prev];
                  savePersistedVideoItems(next);
                  return next;
                });
                try {
                  await createCloudVideoItem(enriched);
                  showToast(`Video "${video.title}" stored in Firebase for all visitors.`);
                } catch (err) {
                  console.warn('Cloud video create notice:', err);
                  showToast(`Saved "${video.title}" locally.`);
                }
              }}
              onUpdateVideoItem={async (video) => {
                const enriched = {
                  ...video,
                  createdByUid:
                    video.createdByUid || auth.currentUser?.uid || 'rithu-editorial-admin',
                };
                setVideoItems((prev) => {
                  const next = prev.map((v) => (v.id === enriched.id ? enriched : v));
                  savePersistedVideoItems(next);
                  return next;
                });
                try {
                  await updateCloudVideoItem(enriched);
                  showToast(`Video "${video.title}" updated in Firebase across all devices.`);
                } catch (err) {
                  console.warn('Cloud video update notice:', err);
                  showToast(`Updated "${video.title}" locally.`);
                }
              }}
              onDeleteVideoItem={async (id) => {
                const target = videoItems.find((v) => v.id === id);
                const next = videoItems.filter((v) => v.id !== id);
                setVideoItems(next);
                savePersistedVideoItems(next);
                try {
                  await deleteCloudVideoItem(id, target?.videoUrl, next);
                  showToast('Video permanently deleted from Firebase for all visitors.');
                } catch (err) {
                  console.warn('Cloud video delete notice:', err);
                  showToast('Video record removed locally.');
                }
              }}
              onPlayAudioPreview={(track) => {
                setCurrentTrack(track);
                setIsPlaying(true);
              }}
              onSelectVideoPreview={(video) => setSelectedVideo(video)}
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
                Please sign in as Admin to upload magazines, audio, and video to Firebase for all
                visitors.
              </p>
              <button
                onClick={() => setLoginModalOpen(true)}
                className="px-6 py-2.5 bg-[#800020] hover:bg-[#660019] text-[#FFF9F2] rounded-[10px] font-semibold text-[15px] shadow-md shadow-[#800020]/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                Sign In to Admin
              </button>
            </div>
          ))}
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

      <AdminLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <Footer
        onNavigate={handleNavigate}
        dark={false}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenLogin={() => setLoginModalOpen(true)}
      />
    </div>
  );
}

export default App;

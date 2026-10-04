import React, { useState } from 'react';
import {
  AudioTrack,
  VideoItem,
  MagazinePage,
  MagazineEditionInfo,
  ViewMode,
} from '../types';
import {
  renderPdfFileToMagazinePages,
  generateSamplePdfMagazinePages,
  PdfRenderProgress,
} from '../utils/pdfProcessor';
import { uploadMediaToFirestore } from '../utils/storage';

interface AdminViewProps {
  audioTracks: AudioTrack[];
  videoItems: VideoItem[];
  magazinePages: MagazinePage[];
  magazineEdition: MagazineEditionInfo;
  onUpdateMagazinePages: (
    pages: MagazinePage[],
    edition: MagazineEditionInfo,
    onProgress?: (percent: number) => void
  ) => Promise<void>;
  onResetMagazinePages: () => Promise<void>;
  onAddAudioTrack: (track: AudioTrack) => Promise<void>;
  onUpdateAudioTrack: (track: AudioTrack) => Promise<void>;
  onDeleteAudioTrack: (id: string) => Promise<void>;
  onAddVideoItem: (video: VideoItem) => Promise<void>;
  onUpdateVideoItem: (video: VideoItem) => Promise<void>;
  onDeleteVideoItem: (id: string) => Promise<void>;
  onPlayAudioPreview: (track: AudioTrack) => void;
  onSelectVideoPreview: (video: VideoItem) => void;
  onNavigate: (view: ViewMode) => void;
  onSignOut: () => void;
  adminUser: string;
  isCloudSynced?: boolean;
  onConnectCloudAdmin?: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  audioTracks,
  videoItems,
  magazinePages,
  magazineEdition,
  onUpdateMagazinePages,
  onResetMagazinePages,
  onAddAudioTrack,
  onUpdateAudioTrack,
  onDeleteAudioTrack,
  onAddVideoItem,
  onUpdateVideoItem,
  onDeleteVideoItem,
  onPlayAudioPreview,
  onSelectVideoPreview,
  onNavigate,
  onSignOut,
  adminUser,
}) => {
  const [activeTab, setActiveTab] = useState<'magazine' | 'audio' | 'video'>('magazine');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Magazine state
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<PdfRenderProgress | null>(null);
  const [cloudSyncPercent, setCloudSyncPercent] = useState<number | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customYear, setCustomYear] = useState('2026');

  // Audio form state
  const [editingAudioId, setEditingAudioId] = useState<string | null>(null);
  const [audioTitle, setAudioTitle] = useState('');
  const [audioAuthor, setAudioAuthor] = useState('');
  const [audioLanguage, setAudioLanguage] = useState<AudioTrack['language']>('Malayalam');
  const [audioCategory, setAudioCategory] = useState<AudioTrack['category']>('Travelogue');
  const [audioDescription, setAudioDescription] = useState('');
  const [audioDuration, setAudioDuration] = useState('4:30');
  const [audioFileName, setAudioFileName] = useState('');
  const [audioFileObj, setAudioFileObj] = useState<File | null>(null);
  const [audioUrlInput, setAudioUrlInput] = useState('');
  const [audioCoverName, setAudioCoverName] = useState('');
  const [audioCoverData, setAudioCoverData] = useState('');
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [audioUploadPercent, setAudioUploadPercent] = useState(0);

  // Video form state
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoCategory, setVideoCategory] = useState('Events');
  const [videoTagline, setVideoTagline] = useState('');
  const [videoDuration, setVideoDuration] = useState('6:15');
  const [videoDate, setVideoDate] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoThumbUrl, setVideoThumbUrl] = useState('');
  const [videoThumbName, setVideoThumbName] = useState('');
  const [videoFileName, setVideoFileName] = useState('');
  const [videoFileObj, setVideoFileObj] = useState<File | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUploadPercent, setVideoUploadPercent] = useState(0);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const compressImageFile = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width;
          let h = img.height;
          if (w > 900 || h > 900) {
            if (w > h) {
              h = Math.round((h * 900) / w);
              w = 900;
            } else {
              w = Math.round((w * 900) / h);
              h = 900;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context unavailable'));
            return;
          }
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = () => reject(new Error('Invalid image file'));
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

  const probeMediaDuration = (
    file: File,
    type: 'audio' | 'video'
  ): Promise<{ formatted: string; seconds: number } | null> =>
    new Promise((resolve) => {
      try {
        const blobUrl = URL.createObjectURL(file);
        const mediaEl = document.createElement(type);
        mediaEl.preload = 'metadata';
        mediaEl.onloadedmetadata = () => {
          URL.revokeObjectURL(blobUrl);
          if (mediaEl.duration && isFinite(mediaEl.duration)) {
            const total = Math.max(1, Math.round(mediaEl.duration));
            const m = Math.floor(total / 60);
            const s = total % 60;
            resolve({ formatted: `${m}:${s < 10 ? '0' : ''}${s}`, seconds: total });
          } else {
            resolve(null);
          }
        };
        mediaEl.onerror = () => {
          URL.revokeObjectURL(blobUrl);
          resolve(null);
        };
        mediaEl.src = blobUrl;
      } catch {
        resolve(null);
      }
    });

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setIsProcessingPdf(true);
        setCloudSyncPercent(null);
        setPdfProgress({ currentPage: 0, totalPages: 0, percent: 0 });
        const renderedPages = await renderPdfFileToMagazinePages(file, (prog) =>
          setPdfProgress(prog)
        );
        const newEdition: MagazineEditionInfo = {
          title: customTitle.trim() || file.name.replace(/\.[^/.]+$/, ''),
          year: customYear || '2026',
          institution: 'College of Engineering Munnar',
          totalPages: renderedPages.length,
          sourceType: 'pdf',
          fileName: file.name,
          updatedAt: 'Synced via Firebase',
        };
        setCloudSyncPercent(0);
        await onUpdateMagazinePages(renderedPages, newEdition, (pct) => setCloudSyncPercent(pct));
        setIsProcessingPdf(false);
        setPdfProgress(null);
        setCloudSyncPercent(null);
        showToast(
          `Uploaded "${file.name}" (${renderedPages.length} pages) to Firebase for all visitors!`
        );
      } catch (err) {
        setIsProcessingPdf(false);
        setPdfProgress(null);
        setCloudSyncPercent(null);
        const msg = err instanceof Error ? err.message : 'Could not process PDF';
        showToast(`PDF error: ${msg}`);
      }
    }
  };

  const handleLoadSamplePdf = async () => {
    setIsProcessingPdf(true);
    setCloudSyncPercent(0);
    try {
      const samplePages = generateSamplePdfMagazinePages();
      await onUpdateMagazinePages(
        samplePages,
        {
          title: 'Rithu 2026 — Commemorative PDF Edition',
          year: '2026',
          institution: 'College of Engineering Munnar',
          totalPages: samplePages.length,
          sourceType: 'pdf',
          fileName: 'Rithu_2026_Archival_Issue.pdf',
          updatedAt: 'Synced via Firebase',
        },
        (pct) => setCloudSyncPercent(pct)
      );
      showToast(`Published Sample PDF Issue (${samplePages.length} pages) to Firebase!`);
    } finally {
      setIsProcessingPdf(false);
      setCloudSyncPercent(null);
    }
  };

  const handleResetToCurated = async () => {
    await onResetMagazinePages();
    showToast('Restored permanent 74-page Rithu Magazine issue.');
  };

  const handleUploadPagePhoto = async (
    pageIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressImageFile(file);
      const updatedPages = magazinePages.map((pg, idx) => {
        if (idx !== pageIndex) return pg;
        if (pg.templateData) {
          return {
            ...pg,
            templateData: {
              ...pg.templateData,
              image: compressedDataUrl,
            },
          };
        }
        return {
          ...pg,
          pdfImageUrl: compressedDataUrl,
        };
      });
      await onUpdateMagazinePages(updatedPages, magazineEdition);
      showToast(
        `Uploaded photo for ${
          pageIndex === 0
            ? 'Front Cover (Page 1)'
            : pageIndex === magazinePages.length - 1
            ? `Back Cover (Page ${pageIndex + 1})`
            : `Page ${pageIndex + 1}`
        }!`
      );
    } catch {
      showToast('Could not process uploaded image.');
    } finally {
      e.target.value = '';
    }
  };

  const handleAudioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioTitle.trim() || !audioAuthor.trim() || isUploadingAudio) return;

    const parts = audioDuration.split(':');
    const mins = parseInt(parts[0] || '0', 10);
    const secs = parseInt(parts[1] || '0', 10);
    const totalSeconds = mins * 60 + secs;

    setIsUploadingAudio(true);
    setAudioUploadPercent(0);
    try {
      let finalAudioUrl = audioUrlInput.trim();
      if (audioFileObj) {
        finalAudioUrl = await uploadMediaToFirestore(audioFileObj, (pct) =>
          setAudioUploadPercent(pct)
        );
      }

      if (editingAudioId) {
        const existing = audioTracks.find((t) => t.id === editingAudioId);
        if (existing) {
          await onUpdateAudioTrack({
            ...existing,
            title: audioTitle.trim(),
            author: audioAuthor.trim(),
            language: audioLanguage,
            category: audioCategory,
            description: audioDescription.trim() || existing.description,
            duration: audioDuration.trim(),
            durationSeconds: totalSeconds || existing.durationSeconds,
            coverImage: audioCoverData || existing.coverImage,
            audioUrl: finalAudioUrl || existing.audioUrl,
          });
          showToast(`Updated "${audioTitle}" in Firebase across all devices.`);
        }
        setEditingAudioId(null);
      } else {
        await onAddAudioTrack({
          id: `audio-${Date.now()}`,
          title: audioTitle.trim(),
          author: audioAuthor.trim(),
          language: audioLanguage,
          category: audioCategory,
          description:
            audioDescription.trim() || 'Archived audio piece from the Munnar Sound Archives.',
          duration: audioDuration.trim() || '4:15',
          durationSeconds: totalSeconds || 255,
          publishedDate: 'Feb 2026',
          ...(audioCoverData ? { coverImage: audioCoverData } : {}),
          ...(finalAudioUrl ? { audioUrl: finalAudioUrl } : {}),
        });
        showToast(`Uploaded & published "${audioTitle}" to Firebase for all visitors!`);
      }

      setAudioTitle('');
      setAudioAuthor('');
      setAudioDescription('');
      setAudioFileName('');
      setAudioFileObj(null);
      setAudioUrlInput('');
      setAudioCoverName('');
      setAudioCoverData('');
      setAudioDuration('4:30');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Audio upload failed.';
      showToast(`Upload error: ${msg}`);
    } finally {
      setIsUploadingAudio(false);
      setAudioUploadPercent(0);
    }
  };

  const startEditAudio = (track: AudioTrack) => {
    setEditingAudioId(track.id);
    setAudioTitle(track.title);
    setAudioAuthor(track.author);
    setAudioLanguage(track.language);
    setAudioCategory(track.category);
    setAudioDescription(track.description);
    setAudioDuration(track.duration);
    setAudioUrlInput(
      track.audioUrl && !track.audioUrl.startsWith('firestore-media://') ? track.audioUrl : ''
    );
    setAudioFileObj(null);
    setAudioFileName(
      track.audioUrl?.startsWith('firestore-media://') ? 'Stored in Firebase Cloud Vault' : ''
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditAudio = () => {
    setEditingAudioId(null);
    setAudioTitle('');
    setAudioAuthor('');
    setAudioDescription('');
    setAudioFileName('');
    setAudioFileObj(null);
    setAudioUrlInput('');
    setAudioCoverName('');
    setAudioCoverData('');
    setAudioDuration('4:30');
  };

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim() || isUploadingVideo) return;

    const parts = videoDuration.split(':');
    const mins = parseInt(parts[0] || '0', 10);
    const secs = parseInt(parts[1] || '0', 10);
    const totalSeconds = mins * 60 + secs;

    setIsUploadingVideo(true);
    setVideoUploadPercent(0);
    try {
      let finalVideoUrl = videoUrlInput.trim();
      if (videoFileObj) {
        finalVideoUrl = await uploadMediaToFirestore(videoFileObj, (pct) =>
          setVideoUploadPercent(pct)
        );
      }

      if (editingVideoId) {
        const existing = videoItems.find((v) => v.id === editingVideoId);
        if (existing) {
          await onUpdateVideoItem({
            ...existing,
            title: videoTitle.trim(),
            category: videoCategory,
            tagline: videoTagline.trim() || existing.tagline,
            duration: videoDuration.trim(),
            durationSeconds: totalSeconds || existing.durationSeconds,
            dateStr: videoDate.trim(),
            description: videoDescription.trim(),
            image: videoThumbUrl.trim() || existing.image,
            videoUrl: finalVideoUrl || existing.videoUrl,
          });
          showToast(`Updated video "${videoTitle}" in Firebase across all devices.`);
        }
        setEditingVideoId(null);
      } else {
        await onAddVideoItem({
          id: `vid-${Date.now()}`,
          title: videoTitle.trim(),
          category: videoCategory,
          tagline: videoTagline.trim() || 'Campus Highlights',
          duration: videoDuration.trim() || '5:00',
          durationSeconds: totalSeconds || 300,
          dateStr: videoDate.trim() || 'Feb 2026',
          description:
            videoDescription.trim() || 'Preserved digital recording from Munnar campus.',
          image:
            videoThumbUrl.trim() ||
            'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
          imageAlt: videoTitle.trim(),
          ...(finalVideoUrl ? { videoUrl: finalVideoUrl } : {}),
        });
        showToast(`Uploaded & published "${videoTitle}" to Firebase for all visitors!`);
      }

      setVideoTitle('');
      setVideoTagline('');
      setVideoDescription('');
      setVideoFileName('');
      setVideoFileObj(null);
      setVideoUrlInput('');
      setVideoThumbUrl('');
      setVideoThumbName('');
      setVideoDuration('6:15');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Video upload failed.';
      showToast(`Upload error: ${msg}`);
    } finally {
      setIsUploadingVideo(false);
      setVideoUploadPercent(0);
    }
  };

  const startEditVideo = (video: VideoItem) => {
    setEditingVideoId(video.id);
    setVideoTitle(video.title);
    setVideoCategory(video.category);
    setVideoTagline(video.tagline || '');
    setVideoDuration(video.duration);
    setVideoDate(video.dateStr);
    setVideoDescription(video.description || '');
    setVideoThumbUrl(video.image || '');
    setVideoUrlInput(
      video.videoUrl && !video.videoUrl.startsWith('firestore-media://') ? video.videoUrl : ''
    );
    setVideoFileObj(null);
    setVideoFileName(
      video.videoUrl?.startsWith('firestore-media://') ? 'Stored in Firebase Cloud Vault' : ''
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditVideo = () => {
    setEditingVideoId(null);
    setVideoTitle('');
    setVideoTagline('');
    setVideoDescription('');
    setVideoFileName('');
    setVideoFileObj(null);
    setVideoUrlInput('');
    setVideoThumbUrl('');
    setVideoThumbName('');
    setVideoDuration('6:15');
  };

  const filteredAudio = audioTracks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVideos = videoItems.filter(
    (v) =>
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.tagline && v.tagline.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full bg-[#FFF9F2] text-[#1F040A] min-h-[calc(100vh-4rem)] flex justify-center py-8 sm:py-14 animate-fadeIn">
      <main className="w-full max-w-[1120px] mx-auto px-4 sm:px-6 flex justify-center">
        <div className="w-full max-w-[820px] flex flex-col gap-8 sm:gap-10">
          {toastMsg && (
            <div className="bg-[#FFF9F2] text-[#1F040A] px-4 py-3 rounded-xl shadow-lg border border-[#800020]/30 flex items-center justify-between text-[14px]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#800020]">
                  check_circle
                </span>
                <span className="font-medium">{toastMsg}</span>
              </div>
              <button
                onClick={() => setToastMsg(null)}
                className="text-[#5C3A42] hover:text-[#1F040A] cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          <header className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6D5C1]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-2.5">
                  <span className="text-[20px] leading-[28px] font-semibold text-[#1F040A] tracking-tight font-serif">
                    Rithu Admin
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#800020]">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span>Firebase Global Sync Active</span>
                  </span>
                </div>
                <span className="text-[12px] text-[#5C3A42]">
                  Signed in as <strong className="text-[#1F040A]">{adminUser}</strong> · Uploads
                  appear for all visitors without login
                </span>
              </div>

              <nav
                aria-label="Content Type Toggle"
                className="flex items-center gap-1 p-1 bg-[#F3E6D5] border border-[#E6D5C1] rounded-xl flex-wrap"
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('magazine');
                    setSearchQuery('');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-[13px] sm:text-[14px] font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'magazine'
                      ? 'bg-[#800020] text-[#FFF9F2] shadow-xs'
                      : 'text-[#5C3A42] hover:text-[#1F040A]'
                  }`}
                >
                  <span>Magazine PDF</span>
                  <span className="text-[11px] opacity-75">({magazinePages.length}p)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('audio');
                    setSearchQuery('');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-[13px] sm:text-[14px] font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'audio'
                      ? 'bg-[#800020] text-[#FFF9F2] shadow-xs'
                      : 'text-[#5C3A42] hover:text-[#1F040A]'
                  }`}
                >
                  <span>Audio</span>
                  <span className="text-[11px] opacity-75">({audioTracks.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('video');
                    setSearchQuery('');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-[13px] sm:text-[14px] font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'video'
                      ? 'bg-[#800020] text-[#FFF9F2] shadow-xs'
                      : 'text-[#5C3A42] hover:text-[#1F040A]'
                  }`}
                >
                  <span>Video</span>
                  <span className="text-[11px] opacity-75">({videoItems.length})</span>
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <button
                onClick={() => onNavigate('home')}
                className="text-[13px] text-[#5C3A42] hover:text-[#1F040A] transition-colors cursor-pointer"
              >
                View Site
              </button>
              <button
                onClick={onSignOut}
                className="text-[13px] text-[#800020] hover:text-[#D45060] font-medium transition-colors flex items-center gap-1 group cursor-pointer"
              >
                <span>Sign Out</span>
                <span className="text-xs opacity-70 group-hover:opacity-100">⎋</span>
              </button>
            </div>
          </header>

          <div className="w-full flex flex-col gap-10">
            {activeTab === 'magazine' ? (
              <div className="flex flex-col gap-8">
                <section className="bg-[#F3E6D5]/70 p-5 sm:p-7 rounded-2xl border border-[#E6D5C1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#FFF9F2] border border-[#E6D5C1] flex items-center justify-center text-[#800020] flex-shrink-0">
                      <span className="material-symbols-outlined text-[28px]">menu_book</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-[#800020]" />
                        <span className="text-[12px] font-semibold uppercase tracking-wider text-[#800020]">
                          Active Live Issue
                        </span>
                        <span className="text-[#800020] text-[12px]">·</span>
                        <span className="text-[12px] text-[#5C3A42]">
                          {magazineEdition.sourceType === 'pdf'
                            ? `PDF (${magazineEdition.fileName || 'Custom'})`
                            : 'Editorial Design'}
                        </span>
                      </div>
                      <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#1F040A] tracking-tight">
                        {magazineEdition.title}
                      </h2>
                      <span className="text-[12px] text-[#5C3A42]">
                        {magazinePages.length} Pages · Year {magazineEdition.year} ·{' '}
                        {magazineEdition.institution}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-center">
                    {magazineEdition.sourceType === 'pdf' && (
                      <button
                        type="button"
                        onClick={handleResetToCurated}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#800020]/40 bg-[#FFF9F2] text-[13px] font-semibold text-[#800020] hover:bg-[#800020] hover:text-[#FFF9F2] transition-colors cursor-pointer whitespace-nowrap"
                        title="Delete uploaded PDF from Firebase and restore default magazine"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        <span>Delete Uploaded PDF</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onNavigate('magazine')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#800020] hover:bg-[#660019] text-[#FFF9F2] text-[13px] font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-[17px]">open_in_new</span>
                      <span>Read Magazine</span>
                    </button>
                  </div>
                </section>

                <section className="bg-[#F3E6D5]/50 p-5 sm:p-8 rounded-2xl border border-[#E6D5C1] flex flex-col gap-6">
                  <div className="flex flex-col gap-1 pb-4 border-b border-[#E6D5C1]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#800020] text-[24px]">
                        upload_file
                      </span>
                      <h3 className="text-[19px] sm:text-[20px] font-semibold text-[#1F040A] tracking-tight">
                        Upload Magazine PDF to Firebase
                      </h3>
                    </div>
                    <p className="text-[13px] sm:text-[14px] text-[#5C3A42]">
                      Upload an official college magazine PDF from your device. Each page is
                      rendered and stored in Firebase Firestore so every visitor can flip through
                      the 3D magazine without logging in.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-[#5C3A42]">
                        Magazine Title (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rithu 2026 — Annual Magazine"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        className="h-[42px] px-3.5 rounded-[10px] bg-white border border-[#E6D5C1] text-[#1F040A] placeholder-[#5C3A42]/50 text-[14px] outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/15"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-[#5C3A42]">Edition Year</label>
                      <input
                        type="text"
                        placeholder="2026"
                        value={customYear}
                        onChange={(e) => setCustomYear(e.target.value)}
                        className="h-[42px] px-3.5 rounded-[10px] bg-white border border-[#E6D5C1] text-[#1F040A] placeholder-[#5C3A42]/50 text-[14px] outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/15"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="group relative flex flex-col items-center justify-center p-8 sm:p-10 rounded-xl border-2 border-dashed border-[#D5C1AD] hover:border-[#800020] bg-[#FFF9F2] hover:bg-[#F3E6D5]/50 cursor-pointer transition-all duration-200">
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        className="sr-only"
                        disabled={isProcessingPdf}
                        onChange={handlePdfUpload}
                      />
                      {isProcessingPdf ? (
                        <div className="w-full max-w-[360px] flex flex-col items-center gap-3">
                          <div className="w-10 h-10 border-3 border-[#800020] border-t-transparent rounded-full animate-spin" />
                          <span className="text-[14px] font-semibold text-[#1F040A]">
                            {cloudSyncPercent === null
                              ? `Rendering PDF Pages (${pdfProgress?.percent || 0}%)`
                              : `Syncing PDF to Firebase Cloud (${cloudSyncPercent}%)`}
                          </span>
                          <span className="text-[12px] text-[#5C3A42] text-center">
                            {cloudSyncPercent === null
                              ? `Processing page ${pdfProgress?.currentPage || 0} of ${
                                  pdfProgress?.totalPages || 0
                                }...`
                              : 'Publishing pages to Firebase so all visitors see the new PDF without login...'}
                          </span>
                          <div className="w-full bg-[#F3E6D5] h-2 rounded-full overflow-hidden border border-[#E6D5C1]">
                            <div
                              className="bg-[#800020] h-full transition-all duration-150"
                              style={{
                                width: `${
                                  cloudSyncPercent === null
                                    ? pdfProgress?.percent || 0
                                    : cloudSyncPercent
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-full bg-[#F3E6D5] border border-[#E6D5C1] flex items-center justify-center text-[#800020] mb-2 group-hover:scale-110 transition-transform shadow-xs">
                            <span className="material-symbols-outlined text-[30px]">
                              picture_as_pdf
                            </span>
                          </div>
                          <span className="text-[15px] font-semibold text-[#1F040A]">
                            Drop your magazine PDF here, or click to browse
                          </span>
                          <span className="text-[12px] text-[#5C3A42] mt-1">
                            Automatically stored in Firebase and published to everyone
                          </span>
                        </>
                      )}
                    </label>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <span className="text-[12px] text-[#5C3A42]">
                        Need to test right away without an external file?
                      </span>
                      <button
                        type="button"
                        onClick={handleLoadSamplePdf}
                        disabled={isProcessingPdf}
                        className="px-3.5 py-1.5 rounded-lg border border-[#800020]/30 bg-[#FFF9F2] hover:bg-[#F3E6D5] text-[#800020] text-[13px] font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">file_open</span>
                        <span>Load Sample PDF Issue (74 Pages)</span>
                      </button>
                    </div>
                  </div>
                </section>

                {/* Rendered Folio & Spread Gallery */}
                <section className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[19px] sm:text-[20px] font-semibold text-[#1F040A] tracking-tight">
                        Permanent Magazine Pages & Photos
                      </h3>
                      <span className="text-[13px] text-[#5C3A42] font-medium">
                        · {magazinePages.length} Pages Total
                      </span>
                    </div>
                    <span className="text-[12px] text-[#5C3A42]">
                      Click any page to preview · Use "Upload Photo" on any card to update its
                      cover/page photo
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {magazinePages.map((page, index) => {
                      const isCover = index === 0;
                      const isBack = index === magazinePages.length - 1;
                      const previewImg = page.pdfImageUrl || page.templateData?.image;

                      return (
                        <div
                          key={page.id}
                          onClick={() => onNavigate('magazine')}
                          className="group bg-[#F3E6D5]/60 rounded-xl border border-[#E6D5C1] p-3 hover:border-[#800020]/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                        >
                          <div
                            className="w-full aspect-[1/1.35] rounded-lg overflow-hidden relative border border-[#E6D5C1] flex items-center justify-center"
                            style={{
                              backgroundColor: page.templateData?.bgColor || '#FFF9F2',
                            }}
                          >
                            {previewImg ? (
                              <img
                                src={previewImg}
                                alt={page.title || `Page ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="p-3 text-center flex flex-col items-center justify-center gap-1">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-[#800020] font-bold">
                                  P. {index + 1}
                                </span>
                                <span className="text-[12px] font-serif font-bold text-[#1F040A] line-clamp-3">
                                  {page.title || page.templateData?.title || `Page ${index + 1}`}
                                </span>
                              </div>
                            )}
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#1F040A]/80 text-[#FFF9F2] text-[10px] font-semibold">
                              {isCover ? 'Front Cover' : isBack ? 'Back Cover' : `P.${index + 1}`}
                            </span>
                          </div>

                          <div className="mt-2.5 flex flex-col gap-1.5">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[12px] font-semibold text-[#1F040A] truncate">
                                {page.title || `Page ${index + 1}`}
                              </span>
                            </div>

                            <label
                              onClick={(e) => e.stopPropagation()}
                              className="w-full py-1.5 px-2 rounded-lg bg-[#FFF9F2] hover:bg-[#800020] text-[#800020] hover:text-[#FFF9F2] border border-[#800020]/25 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            >
                              <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) => handleUploadPagePhoto(index, e)}
                              />
                              <span className="material-symbols-outlined text-[14px]">
                                add_a_photo
                              </span>
                              <span>{isCover ? 'Upload Cover Photo' : 'Upload Photo'}</span>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            ) : activeTab === 'audio' ? (
              <>
                <section className="bg-[#F3E6D5]/50 p-5 sm:p-8 lg:p-10 rounded-2xl border border-[#E6D5C1] flex flex-col gap-6">
                  <div className="flex flex-col gap-1 pb-4 border-b border-[#E6D5C1]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#800020]">
                          {editingAudioId ? 'edit_note' : 'mic'}
                        </span>
                        <h2 className="text-[19px] sm:text-[20px] font-semibold text-[#1F040A] tracking-tight">
                          {editingAudioId ? 'Edit Audio Record' : 'Upload Audio to Firebase'}
                        </h2>
                      </div>
                      {editingAudioId && (
                        <button
                          type="button"
                          onClick={cancelEditAudio}
                          className="text-[13px] text-[#800020] hover:underline cursor-pointer font-medium"
                        >
                          Cancel Editing
                        </button>
                      )}
                    </div>
                    <p className="text-[13px] sm:text-[14px] text-[#5C3A42]">
                      Upload an audio file from your device (MP3, WAV, M4A) or provide a stream
                      link. The uploaded file is stored directly in Firebase so everyone can listen
                      without logging in.
                    </p>
                  </div>

                  <form className="flex flex-col gap-6" id="audio-entry-form" onSubmit={handleAudioSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label
                          className="text-[13px] font-medium text-[#5C3A42]"
                          htmlFor="track-title"
                        >
                          Title *
                        </label>
                        <input
                          className="h-[44px] px-3.5 rounded-[10px] bg-white border border-[#E6D5C1] text-[#1F040A] placeholder-[#5C3A42]/50 text-[15px] outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/15 transition-all duration-150"
                          id="track-title"
                          placeholder="e.g. മൂന്നാറിലേക്കുള്ള യാത്ര"
                          required
                          type="text"
                          value={audioTitle}
                          onChange={(e) => setAudioTitle(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label
                          className="text-[13px] font-medium text-[#5C3A42]"
                          htmlFor="track-author"
                        >
                          Author / Contributor *
                        </label>
                        <input
                          className="h-[44px] px-3.5 rounded-[10px] bg-white border border-[#E6D5C1] text-[#1F040A] placeholder-[#5C3A42]/50 text-[15px] outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/15 transition-all duration-150"
                          id="track-author"
                          placeholder="Narrator or writer name"
                          required
                          type="text"
                          value={audioAuthor}
                          onChange={(e) => setAudioAuthor(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label
                          className="text-[13px] font-medium text-[#5C3A42]"
                          htmlFor="track-language"
                        >
                          Language
                        </label>
                        <div className="relative w-full">
                          <select
                            className="w-full h-[44px] px-3.5 pr-10 appearance-none rounded-[10px] bg-white border border-[#E6D5C1] text-[#1F040A] text-[15px] outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/15 cursor-pointer transition-all duration-150"
                            id="track-language"
                            value={audioLanguage}
                            onChange={(e) =>
                              setAudioLanguage(e.target.value as AudioTrack['language'])
                            }
                          >
                            <option value="Malayalam">Malayalam</option>
                            <option value="English">English</option>
                            <option value="Bilingual">Bilingual</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#5C3A42] text-base">
                            expand_more
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label
                          className="text-[13px] font-medium text-[#5C3A42]"
                          htmlFor="track-category"
                        >
                          Category / Tag
                        </label>
                        <div className="relative w-full">
                          <select
                            className="w-full h-[44px] px-3.5 pr-10 appearance-none rounded-[10px] bg-white border border-[#E6D5C1] text-[#1F040A] text-[15px] outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/15 cursor-pointer transition-all duration-150"
                            id="track-category"
                            value={audioCategory}
                            onChange={(e) =>
                              setAudioCategory(e.target.value as AudioTrack['category'])
                            }
                          >
                            <option value="Travelogue">Travelogue</option>
                            <option value="Editorial">Editorial</option>
                            <option value="Poetry">Poetry</option>
                            <option value="Interview">Interview</option>
                            <option value="Fiction">Fiction</option>
                            <option value="Discussion">Discussion</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#5C3A42] text-base">
                            expand_more
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#5C3A42]">
                          Duration (mm:ss)
                        </label>
                        <input
                          className="h-[44px] px-3.5 rounded-[10px] bg-white border border-[#E6D5C1] text-[#1F040A] placeholder-[#5C3A42]/50 text-[15px] outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/15 transition-all duration-150"
                          placeholder="e.g. 5:32"
                          type="text"
                          value={audioDuration}
                          onChange={(e) => setAudioDuration(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        className="text-[13px] font-medium text-[#5C3A42]"
                        htmlFor="track-description"
                      >
                        Description
                      </label>
                      <textarea
                        className="w-full p-3.5 rounded-[10px] bg-white border border-[#E6D5C1] text-[#1F040A] placeholder-[#5C3A42]/50 text-[15px] outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/15 transition-all duration-150 resize-y"
                        id="track-description"
                        placeholder="Short context, archival excerpts, or recording lineage..."
                        rows={2}
                        value={audioDescription}
                        onChange={(e) => setAudioDescription(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 pt-1">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#5C3A42]">
                          Upload Audio File (Stored in Firebase)
                        </label>
                        <label className="group relative flex flex-col items-center justify-center p-5 rounded-[10px] border border-dashed border-[#D5C1AD] bg-[#FFF9F2] hover:bg-[#F3E6D5]/60 hover:border-[#800020] cursor-pointer transition-all duration-200">
                          <input
                            accept="audio/*"
                            className="sr-only"
                            type="file"
                            disabled={isUploadingAudio}
                            onChange={async (e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                setAudioFileObj(file);
                                setAudioFileName(file.name);
                                const probed = await probeMediaDuration(file, 'audio');
                                if (probed) setAudioDuration(probed.formatted);
                              }
                            }}
                          />
                          <span className="material-symbols-outlined text-[#800020] group-hover:scale-110 mb-1 transition-transform text-2xl">
                            audio_file
                          </span>
                          <span className="text-[14px] text-[#1F040A] font-medium text-center truncate max-w-full px-2">
                            {audioFileName || 'Choose Audio File from Device...'}
                          </span>
                          <span className="text-[11px] text-[#5C3A42] mt-0.5">
                            MP3, WAV, M4A, or OGG · Synced via Firebase
                          </span>
                        </label>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#5C3A42]">
                          Cover Art (Optional)
                        </label>
                        <label className="group relative flex flex-col items-center justify-center p-5 rounded-[10px] border border-dashed border-[#D5C1AD] bg-[#FFF9F2] hover:bg-[#F3E6D5]/60 hover:border-[#800020] cursor-pointer transition-all duration-200">
                          <input
                            accept="image/*"
                            className="sr-only"
                            type="file"
                            disabled={isUploadingAudio}
                            onChange={async (e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                setAudioCoverName(file.name);
                                try {
                                  const compressed = await compressImageFile(file);
                                  setAudioCoverData(compressed);
                                } catch {
                                  // Ignore
                                }
                              }
                            }}
                          />
                          <span className="material-symbols-outlined text-[#800020] group-hover:scale-110 mb-1 transition-transform text-2xl">
                            image
                          </span>
                          <span className="text-[14px] text-[#1F040A] font-medium text-center truncate max-w-full px-2">
                            {audioCoverName || 'Choose Cover Image...'}
                          </span>
                          <span className="text-[11px] text-[#5C3A42] mt-0.5">
                            1:1 ratio square artwork (JPG, PNG)
                          </span>
                        </label>
                      </div>
                    </div>

                    {isUploadingAudio && (
                      <div className="p-4 rounded-xl bg-[#FFF9F2] border border-[#E6D5C1] flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[13px] font-medium text-[#1F040A]">
                          <span>Uploading audio file to Firebase Cloud Vault...</span>
                          <span className="tabular-nums text-[#800020] font-semibold">
                            {audioUploadPercent}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#F3E6D5] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#800020] transition-all duration-150"
                            style={{ width: `${audioUploadPercent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[#E6D5C1]">
                      <span className="text-[12px] text-[#5C3A42]">
                        Uploaded audio immediately appears in the Audio section for all users.
                      </span>
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        {editingAudioId && (
                          <button
                            type="button"
                            onClick={cancelEditAudio}
                            className="px-4 py-2 text-[14px] font-medium text-[#5C3A42] hover:text-[#1F040A] cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          disabled={isUploadingAudio}
                          className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] px-6 rounded-[10px] bg-[#800020] hover:bg-[#660019] text-[#FFF9F2] text-[15px] font-semibold active:scale-[0.98] shadow-md shadow-[#800020]/20 transition-all duration-150 whitespace-nowrap cursor-pointer disabled:opacity-60"
                          type="submit"
                        >
                          {isUploadingAudio
                            ? `Uploading (${audioUploadPercent}%)...`
                            : editingAudioId
                            ? 'Update Audio Track'
                            : 'Publish Audio Track'}
                        </button>
                      </div>
                    </div>
                  </form>
                </section>

                <section className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[19px] sm:text-[20px] font-semibold text-[#1F040A] tracking-tight">
                        Published Audio Tracks
                      </h3>
                      <span className="text-[13px] text-[#5C3A42] font-medium">
                        · {audioTracks.length} tracks
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search audio tracks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 pl-8 pr-3 text-[13px] bg-white border border-[#E6D5C1] rounded-lg text-[#1F040A] placeholder-[#5C3A42]/50 outline-none focus:border-[#800020]"
                      />
                      <span className="material-symbols-outlined text-[16px] text-[#5C3A42] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        search
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col bg-[#F3E6D5]/50 rounded-2xl border border-[#E6D5C1] divide-y divide-[#E6D5C1] overflow-hidden">
                    {filteredAudio.length === 0 ? (
                      <div className="p-8 text-center text-[#5C3A42] text-[14px]">
                        No audio tracks found matching "{searchQuery}".
                      </div>
                    ) : (
                      filteredAudio.map((track) => (
                        <div
                          key={track.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-2 hover:bg-[#F3E6D5] transition-colors duration-150"
                        >
                          <div className="flex items-start sm:items-center gap-4 min-w-0">
                            <button
                              aria-label={`Preview ${track.title}`}
                              onClick={() => onPlayAudioPreview(track)}
                              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FFF9F2] border border-[#E6D5C1] hover:bg-[#800020] text-[#800020] hover:text-[#FFF9F2] transition-all flex-shrink-0 cursor-pointer shadow-2xs"
                              title="Play Audio Track"
                            >
                              <span className="material-symbols-outlined text-lg">play_arrow</span>
                            </button>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[15px] text-[#1F040A] truncate font-medium">
                                {track.title}
                              </span>
                              <div className="flex items-center gap-2 text-[12px] text-[#5C3A42] flex-wrap">
                                <span className="font-medium text-[#1F040A]">{track.author}</span>
                                <span>·</span>
                                <span>{track.language}</span>
                                <span>·</span>
                                <span className="tabular-nums">{track.duration}</span>
                                {track.audioUrl && (
                                  <>
                                    <span>·</span>
                                    <span className="text-[#800020] font-medium">
                                      Firebase Audio
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center pl-4 sm:pl-0">
                            <button
                              onClick={() => startEditAudio(track)}
                              className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[#5C3A42] hover:text-[#1F040A] hover:bg-[#FFF9F2] transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            {confirmDeleteId === track.id ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    onDeleteAudioTrack(track.id);
                                    setConfirmDeleteId(null);
                                    showToast(`Deleted "${track.title}".`);
                                  }}
                                  className="px-2.5 py-1 rounded bg-[#800020] text-[#FFF9F2] text-[12px] font-semibold cursor-pointer"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-2 py-1 rounded text-[12px] text-[#5C3A42] hover:text-[#1F040A] cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(track.id)}
                                className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[#800020] hover:bg-[#FFF9F2] transition-colors cursor-pointer"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </>
            ) : (
              <>
                <section className="bg-[#F3E6D5]/50 p-5 sm:p-8 lg:p-10 rounded-2xl border border-[#E6D5C1] flex flex-col gap-6">
                  <div className="flex flex-col gap-1 pb-4 border-b border-[#E6D5C1]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#800020]">
                          {editingVideoId ? 'movie_edit' : 'video_call'}
                        </span>
                        <h2 className="text-[19px] sm:text-[20px] font-semibold text-[#1F040A] tracking-tight">
                          {editingVideoId ? 'Edit Video Record' : 'Upload Video to Firebase'}
                        </h2>
                      </div>
                      {editingVideoId && (
                        <button
                          type="button"
                          onClick={cancelEditVideo}
                          className="text-[13px] text-[#800020] hover:underline cursor-pointer font-medium"
                        >
                          Cancel Editing
                        </button>
                      )}
                    </div>
                    <p className="text-[13px] sm:text-[14px] text-[#5C3A42]">
                      Upload a video file from your device (MP4, WebM, MOV) or paste a YouTube /
                      direct video link. Uploaded video files are stored in Firebase so any visitor
                      can watch without logging in.
                    </p>
                  </div>

                  <form className="flex flex-col gap-6" onSubmit={handleVideoSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#5C3A42]">
                          Video Title *
                        </label>
                        <input
                          className="h-[44px] px-3.5 rounded-[10px] bg-white border border-[#E6D5C1] text-[#1F040A] placeholder-[#5C3A42]/50 text-[15px] outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/15 transition-all duration-150"
                          placeholder="e.g. Cultural Night: ELYSION '26"
                          required
                          type="text"
                          value={videoTitle}
                          onChange={(e) => setVideoTitle(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#5C3A42]">
                          Tagline / Subtitle
                        </label>
                        <input
                          className="h-[44px] px-3.5 rounded-[10px] bg-white border border-[#E6D5C1] text-[#1F040A] placeholder-[#5C3A42]/50 text-[15px] outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/15 transition-all duration-150"
                          placeholder="e.g. Official Highlights & Aftermovie"
                          type="text"
                          value={videoTagline}
                          onChange={(e) => setVideoTagline(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#5C3A42]">Category</label>
                        <select
                          className="w-full h-[44px] px-3.5 rounded-[10px] bg-white border border-[#E6D5C1] text-[#1F040A] text-[15px] outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/15 cursor-pointer"
                          value={videoCategory}
                          onChange={(e) => setVideoCategory(e.target.value)}
                        >
                          <option value="Events">Events</option>
                          <option value="Workshops">Workshops</option>
                          <option value="IEEE">IEEE</option>
                          <option value="Interviews">Interviews</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#5C3A42]">Date</label>
                        <input
                          className="h-[44px] px-3.5 rounded-[10px] bg-white border border-[#E6D5C1] text-[#1F040A] placeholder-[#5C3A42]/50 text-[15px] outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/15"
                          placeholder="e.g. Feb 14–15, 2026"
                          type="text"
                          value={videoDate}
                          onChange={(e) => setVideoDate(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#5C3A42]">
                          Duration (mm:ss)
                        </label>
                        <input
                          className="h-[44px] px-3.5 rounded-[10px] bg-white border border-[#E6D5C1] text-[#1F040A] placeholder-[#5C3A42]/50 text-[15px] outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/15"
                          placeholder="e.g. 8:42"
                          type="text"
                          value={videoDuration}
                          onChange={(e) => setVideoDuration(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-[#5C3A42]">
                        Archival Description / Summary
                      </label>
                      <textarea
                        className="w-full p-3.5 rounded-[10px] bg-white border border-[#E6D5C1] text-[#1F040A] placeholder-[#5C3A42]/50 text-[15px] outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/15 transition-all resize-y"
                        placeholder="Context of event, keynote speaker, student participation..."
                        rows={2}
                        value={videoDescription}
                        onChange={(e) => setVideoDescription(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#5C3A42]">
                          Upload Video File (Stored in Firebase)
                        </label>
                        <label className="group relative flex flex-col items-center justify-center p-4 rounded-[10px] border border-dashed border-[#D5C1AD] bg-[#FFF9F2] hover:bg-[#F3E6D5]/60 hover:border-[#800020] cursor-pointer transition-all duration-200">
                          <input
                            accept="video/*"
                            className="sr-only"
                            type="file"
                            disabled={isUploadingVideo}
                            onChange={async (e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                setVideoFileObj(file);
                                setVideoFileName(file.name);
                                const probed = await probeMediaDuration(file, 'video');
                                if (probed) setVideoDuration(probed.formatted);
                              }
                            }}
                          />
                          <span className="material-symbols-outlined text-[#800020] group-hover:scale-110 mb-0.5 transition-transform text-2xl">
                            video_file
                          </span>
                          <span className="text-[13px] text-[#1F040A] font-medium text-center truncate max-w-full px-2">
                            {videoFileName || 'Choose Video File (MP4, WebM, MOV)...'}
                          </span>
                          <span className="text-[11px] text-[#5C3A42] mt-0.5">
                            Stored in Firebase Cloud Vault
                          </span>
                        </label>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#5C3A42]">
                          Upload Thumbnail Image
                        </label>
                        <label className="group relative flex flex-col items-center justify-center p-4 rounded-[10px] border border-dashed border-[#D5C1AD] bg-[#FFF9F2] hover:bg-[#F3E6D5]/60 hover:border-[#800020] cursor-pointer transition-all duration-200">
                          <input
                            accept="image/*"
                            className="sr-only"
                            type="file"
                            disabled={isUploadingVideo}
                            onChange={async (e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                setVideoThumbName(file.name);
                                try {
                                  const compressed = await compressImageFile(file);
                                  setVideoThumbUrl(compressed);
                                } catch {
                                  // Ignore
                                }
                              }
                            }}
                          />
                          <span className="material-symbols-outlined text-[#800020] group-hover:scale-110 mb-0.5 transition-transform text-2xl">
                            add_photo_alternate
                          </span>
                          <span className="text-[13px] text-[#1F040A] font-medium text-center truncate max-w-full px-2">
                            {videoThumbName || 'Choose Poster Image...'}
                          </span>
                          <span className="text-[11px] text-[#5C3A42] mt-0.5">
                            16:9 thumbnail image (JPG, PNG)
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#5C3A42]">
                          Or External Video / YouTube URL (Optional)
                        </label>
                        <input
                          className="h-[42px] px-3.5 rounded-[10px] bg-white border border-[#E6D5C1] text-[#1F040A] placeholder-[#5C3A42]/50 text-[14px] outline-none focus:border-[#800020]"
                          placeholder="https://youtube.com/watch?v=... or .mp4 URL"
                          type="text"
                          value={videoUrlInput}
                          onChange={(e) => setVideoUrlInput(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#5C3A42]">
                          Or Thumbnail Image URL (Optional)
                        </label>
                        <input
                          className="h-[42px] px-3.5 rounded-[10px] bg-white border border-[#E6D5C1] text-[#1F040A] placeholder-[#5C3A42]/50 text-[14px] outline-none focus:border-[#800020]"
                          placeholder="https://..."
                          type="text"
                          value={videoThumbUrl.startsWith('data:') ? '' : videoThumbUrl}
                          onChange={(e) => setVideoThumbUrl(e.target.value)}
                        />
                      </div>
                    </div>

                    {isUploadingVideo && (
                      <div className="p-4 rounded-xl bg-[#FFF9F2] border border-[#E6D5C1] flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[13px] font-medium text-[#1F040A]">
                          <span>Uploading video file to Firebase Cloud Vault...</span>
                          <span className="tabular-nums text-[#800020] font-semibold">
                            {videoUploadPercent}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#F3E6D5] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#800020] transition-all duration-150"
                            style={{ width: `${videoUploadPercent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E6D5C1]">
                      {editingVideoId && (
                        <button
                          type="button"
                          onClick={cancelEditVideo}
                          className="px-4 py-2 text-[14px] font-medium text-[#5C3A42] hover:text-[#1F040A] cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        disabled={isUploadingVideo}
                        className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-[10px] bg-[#800020] hover:bg-[#660019] text-[#FFF9F2] text-[15px] font-semibold active:scale-[0.98] shadow-md shadow-[#800020]/20 transition-all duration-150 whitespace-nowrap cursor-pointer disabled:opacity-60"
                        type="submit"
                      >
                        {isUploadingVideo
                          ? `Uploading (${videoUploadPercent}%)...`
                          : editingVideoId
                          ? 'Update Video Record'
                          : 'Publish Video'}
                      </button>
                    </div>
                  </form>
                </section>

                <section className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[19px] sm:text-[20px] font-semibold text-[#1F040A] tracking-tight">
                        Published Videos
                      </h3>
                      <span className="text-[13px] text-[#5C3A42] font-medium">
                        · {videoItems.length} videos
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search video archives..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 pl-8 pr-3 text-[13px] bg-white border border-[#E6D5C1] rounded-lg text-[#1F040A] placeholder-[#5C3A42]/50 outline-none focus:border-[#800020]"
                      />
                      <span className="material-symbols-outlined text-[16px] text-[#5C3A42] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        search
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col bg-[#F3E6D5]/50 rounded-2xl border border-[#E6D5C1] divide-y divide-[#E6D5C1] overflow-hidden">
                    {filteredVideos.length === 0 ? (
                      <div className="p-8 text-center text-[#5C3A42] text-[14px]">
                        No video records found matching "{searchQuery}".
                      </div>
                    ) : (
                      filteredVideos.map((video) => (
                        <div
                          key={video.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-[#F3E6D5] transition-colors duration-150"
                        >
                          <div className="flex items-start sm:items-center gap-4 min-w-0">
                            <button
                              aria-label={`Preview ${video.title}`}
                              onClick={() => onSelectVideoPreview(video)}
                              className="w-16 h-10 rounded-md overflow-hidden bg-[#EAD8C3] flex-shrink-0 relative group/thumb cursor-pointer shadow-2xs border border-[#E6D5C1]"
                              title="Play Video"
                            >
                              <img
                                src={video.image}
                                alt={video.imageAlt}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/35 flex items-center justify-center group-hover/thumb:bg-black/15">
                                <span className="material-symbols-outlined text-white text-[18px]">
                                  play_arrow
                                </span>
                              </div>
                            </button>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[15px] text-[#1F040A] truncate font-medium">
                                {video.title}
                              </span>
                              <div className="flex items-center gap-2 text-[12px] text-[#5C3A42] flex-wrap">
                                <span className="font-semibold text-[#800020]">
                                  {video.category}
                                </span>
                                <span>·</span>
                                <span className="tabular-nums">{video.duration}</span>
                                <span>·</span>
                                <span>{video.dateStr}</span>
                                {video.videoUrl && (
                                  <>
                                    <span>·</span>
                                    <span className="text-[#800020] font-medium">
                                      Firebase Video
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center pl-4 sm:pl-0">
                            <button
                              onClick={() => startEditVideo(video)}
                              className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[#5C3A42] hover:text-[#1F040A] hover:bg-[#FFF9F2] transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            {confirmDeleteId === video.id ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    onDeleteVideoItem(video.id);
                                    setConfirmDeleteId(null);
                                    showToast(`Deleted "${video.title}".`);
                                  }}
                                  className="px-2.5 py-1 rounded bg-[#800020] text-[#FFF9F2] text-[12px] font-semibold cursor-pointer"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-2 py-1 rounded text-[12px] text-[#5C3A42] hover:text-[#1F040A] cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(video.id)}
                                className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[#800020] hover:bg-[#FFF9F2] transition-colors cursor-pointer"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

import React, { useState } from 'react';
import { AudioTrack, VideoItem, ViewMode, MagazinePage, MagazineEditionInfo } from '../types';
import { renderPdfToMagazinePages, generateSamplePdfMagazine, PdfRenderProgress } from '../utils/pdfRenderer';

interface AdminViewProps {
  audioTracks: AudioTrack[];
  videoItems: VideoItem[];
  magazinePages: MagazinePage[];
  magazineEdition: MagazineEditionInfo;
  onUpdateMagazinePages: (pages: MagazinePage[], info: MagazineEditionInfo) => void;
  onResetMagazinePages: () => void;
  onAddAudioTrack: (track: AudioTrack) => void;
  onUpdateAudioTrack: (track: AudioTrack) => void;
  onDeleteAudioTrack: (id: string) => void;
  onAddVideoItem: (video: VideoItem) => void;
  onUpdateVideoItem: (video: VideoItem) => void;
  onDeleteVideoItem: (id: string) => void;
  onPlayAudioPreview: (track: AudioTrack) => void;
  onSelectVideoPreview: (video: VideoItem) => void;
  onNavigate: (view: ViewMode) => void;
  onSignOut: () => void;
  adminUser?: string;
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
  adminUser = 'Editor',
  isCloudSynced = false,
  onConnectCloudAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'magazine' | 'audio' | 'video'>('magazine');

  // Search & Filter in Admin
  const [searchQuery, setSearchQuery] = useState('');

  // PDF Magazine State
  const [isRenderingPdf, setIsRenderingPdf] = useState(false);
  const [renderProgress, setRenderProgress] = useState<PdfRenderProgress | null>(null);
  const [pdfCustomTitle, setPdfCustomTitle] = useState('');
  const [pdfEditionYear, setPdfEditionYear] = useState('2026');

  // Audio Form State
  const [editingAudioId, setEditingAudioId] = useState<string | null>(null);
  const [audioTitle, setAudioTitle] = useState('');
  const [audioAuthor, setAudioAuthor] = useState('');
  const [audioLanguage, setAudioLanguage] = useState<'Malayalam' | 'English' | 'Bilingual'>('Malayalam');
  const [audioCategory, setAudioCategory] = useState<AudioTrack['category']>('Travelogue');
  const [audioDescription, setAudioDescription] = useState('');
  const [audioDuration, setAudioDuration] = useState('4:30');
  const [audioFileName, setAudioFileName] = useState('');
  const [audioCoverName, setAudioCoverName] = useState('');
  const [audioCoverDataUrl, setAudioCoverDataUrl] = useState('');

  const compressImageFileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 900;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
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
  };

  // Video Form State
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoCategory, setVideoCategory] = useState('Events');
  const [videoTagline, setVideoTagline] = useState('');
  const [videoDuration, setVideoDuration] = useState('6:15');
  const [videoDate, setVideoDate] = useState('Feb 2026');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoImageUrl, setVideoImageUrl] = useState('');
  const [videoFileName, setVideoFileName] = useState('');

  // Notification Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // PDF Magazine Handlers
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setIsRenderingPdf(true);
        setRenderProgress({ currentPage: 0, totalPages: 0, percent: 0 });
        const renderedPages = await renderPdfToMagazinePages(file, (p) => setRenderProgress(p));
        const info: MagazineEditionInfo = {
          title: pdfCustomTitle.trim() || file.name.replace(/\.[^/.]+$/, ''),
          year: pdfEditionYear || '2026',
          institution: 'College of Engineering Munnar',
          totalPages: renderedPages.length,
          sourceType: 'pdf',
          fileName: file.name,
          updatedAt: 'Just now',
        };
        onUpdateMagazinePages(renderedPages, info);
        setIsRenderingPdf(false);
        setRenderProgress(null);
        showToast(`Rendered ${renderedPages.length} pages from "${file.name}". Live magazine updated!`);
      } catch (err: unknown) {
        setIsRenderingPdf(false);
        setRenderProgress(null);
        const errorMsg = err instanceof Error ? err.message : 'Could not process PDF';
        showToast(`PDF error: ${errorMsg}`);
      }
    }
  };

  const handleLoadSamplePdf = () => {
    setIsRenderingPdf(true);
    setTimeout(() => {
      const samplePages = generateSamplePdfMagazine();
      const info: MagazineEditionInfo = {
        title: 'Rithu 2026 — Commemorative PDF Edition',
        year: '2026',
        institution: 'College of Engineering Munnar',
        totalPages: samplePages.length,
        sourceType: 'pdf',
        fileName: 'Rithu_2026_Archival_Issue.pdf',
        updatedAt: 'Just now',
      };
      onUpdateMagazinePages(samplePages, info);
      setIsRenderingPdf(false);
      showToast(`Loaded Sample PDF Issue (${samplePages.length} pages). Live magazine updated!`);
    }, 450);
  };

  const handleResetToCurated = () => {
    onResetMagazinePages();
    showToast('Restored original 16-page editorial magazine issue.');
  };

  // Submit Audio Handler
  const handleAudioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioTitle.trim() || !audioAuthor.trim()) return;

    const parts = audioDuration.split(':');
    const mins = parseInt(parts[0] || '0', 10);
    const secs = parseInt(parts[1] || '0', 10);
    const totalSecs = mins * 60 + secs;

    if (editingAudioId) {
      const existing = audioTracks.find((t) => t.id === editingAudioId);
      if (existing) {
        onUpdateAudioTrack({
          ...existing,
          title: audioTitle.trim(),
          author: audioAuthor.trim(),
          language: audioLanguage,
          category: audioCategory,
          description: audioDescription.trim(),
          duration: audioDuration.trim(),
          durationSeconds: totalSecs || existing.durationSeconds,
          coverImage: audioCoverDataUrl || existing.coverImage,
        });
        showToast(`Updated "${audioTitle}" successfully.`);
      }
      setEditingAudioId(null);
    } else {
      const newTrack: AudioTrack = {
        id: `audio-${Date.now()}`,
        title: audioTitle.trim(),
        author: audioAuthor.trim(),
        language: audioLanguage,
        category: audioCategory,
        description: audioDescription.trim() || 'Archived audio piece from the Munnar Sound Archives.',
        duration: audioDuration.trim() || '4:15',
        durationSeconds: totalSecs || 255,
        publishedDate: 'Feb 2026',
        ...(audioCoverDataUrl ? { coverImage: audioCoverDataUrl } : {}),
      };
      onAddAudioTrack(newTrack);
      showToast(`Published "${audioTitle}" to the college audio journal.`);
    }

    // Reset Form
    setAudioTitle('');
    setAudioAuthor('');
    setAudioDescription('');
    setAudioFileName('');
    setAudioCoverName('');
    setAudioCoverDataUrl('');
    setAudioDuration('4:30');
  };

  const handleEditAudio = (track: AudioTrack) => {
    setEditingAudioId(track.id);
    setAudioTitle(track.title);
    setAudioAuthor(track.author);
    setAudioLanguage(track.language);
    setAudioCategory(track.category);
    setAudioDescription(track.description);
    setAudioDuration(track.duration);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditAudio = () => {
    setEditingAudioId(null);
    setAudioTitle('');
    setAudioAuthor('');
    setAudioDescription('');
    setAudioFileName('');
    setAudioCoverName('');
    setAudioDuration('4:30');
  };

  // Submit Video Handler
  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) return;

    const parts = videoDuration.split(':');
    const mins = parseInt(parts[0] || '0', 10);
    const secs = parseInt(parts[1] || '0', 10);
    const totalSecs = mins * 60 + secs;

    const defaultImage =
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB-gJYBvMzQrXPTgT-D-NcHUXXRAfbO4h50BvYxfVaKnxISA54fnLU65JKY-M7i8O6k4NVB5GN68Ue0-RdGzI6jd3Os8YoTI5vjtfQKAq7FZOGfdVYApQxl1zk1xc0LlNtRskp5NcrWyW0IXrfMh6Nv1tr70vS8kpK2csYdYped1QYazKl8mBJq3zZ9QpgnXV-V0MGT5lF22bbgVqIGL9YMxAzJEduT5fok0v5meB7NJrXTbOh3bC2z';

    if (editingVideoId) {
      const existing = videoItems.find((v) => v.id === editingVideoId);
      if (existing) {
        onUpdateVideoItem({
          ...existing,
          title: videoTitle.trim(),
          category: videoCategory,
          tagline: videoTagline.trim() || existing.tagline,
          duration: videoDuration.trim(),
          durationSeconds: totalSecs || existing.durationSeconds,
          dateStr: videoDate.trim(),
          description: videoDescription.trim(),
          image: videoImageUrl.trim() || existing.image,
        });
        showToast(`Updated video "${videoTitle}" successfully.`);
      }
      setEditingVideoId(null);
    } else {
      const newVid: VideoItem = {
        id: `vid-${Date.now()}`,
        title: videoTitle.trim(),
        category: videoCategory,
        tagline: videoTagline.trim() || 'Campus Highlights',
        duration: videoDuration.trim() || '5:00',
        durationSeconds: totalSecs || 300,
        dateStr: videoDate.trim() || 'Feb 2026',
        description: videoDescription.trim() || 'Preserved digital recording from Munnar campus.',
        image: videoImageUrl.trim() || defaultImage,
        imageAlt: videoTitle.trim(),
      };
      onAddVideoItem(newVid);
      showToast(`Added "${videoTitle}" to the video archive.`);
    }

    // Reset Form
    setVideoTitle('');
    setVideoTagline('');
    setVideoDescription('');
    setVideoFileName('');
    setVideoImageUrl('');
    setVideoDuration('6:15');
  };

  const handleEditVideo = (video: VideoItem) => {
    setEditingVideoId(video.id);
    setVideoTitle(video.title);
    setVideoCategory(video.category);
    setVideoTagline(video.tagline || '');
    setVideoDuration(video.duration);
    setVideoDate(video.dateStr);
    setVideoDescription(video.description || '');
    setVideoImageUrl(video.image || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditVideo = () => {
    setEditingVideoId(null);
    setVideoTitle('');
    setVideoTagline('');
    setVideoDescription('');
    setVideoFileName('');
    setVideoImageUrl('');
    setVideoDuration('6:15');
  };

  // Filtered lists
  const filteredAudio = audioTracks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVideos = videoItems.filter((v) =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.tagline && v.tagline.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full bg-[#0E0205] text-[#FFF9F2] min-h-[calc(100vh-4rem)] flex justify-center py-8 sm:py-14 animate-fadeIn">
      <main className="w-full max-w-[1120px] mx-auto px-4 sm:px-6 flex justify-center">
        <div className="w-full max-w-[780px] flex flex-col gap-8 sm:gap-10">
          {/* Toast message */}
          {toastMessage && (
            <div className="bg-[#1F040A] text-[#FFF9F2] px-4 py-3 rounded-xl shadow-2xl border border-[#3A0C16] flex items-center justify-between text-[14px]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#D45060]">
                  check_circle
                </span>
                <span>{toastMessage}</span>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="opacity-70 hover:opacity-100 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Top Admin Header / Utility Bar */}
          <header className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#3A0C16]">
            <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[20px] leading-[28px] font-semibold text-[#FFF9F2] tracking-tight">
                    Rithu Admin
                  </span>
                  {isCloudSynced ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#800020]/40 border border-[#D45060]/50 text-[11px] font-medium text-[#FFF9F2]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Cloud Sync Active (All Devices)
                    </span>
                  ) : (
                    onConnectCloudAdmin && (
                      <button
                        type="button"
                        onClick={onConnectCloudAdmin}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#D45060]/20 hover:bg-[#D45060]/30 border border-[#D45060]/50 text-[11px] font-medium text-[#FFF9F2] transition-colors cursor-pointer"
                        title="Connect Google Admin account so uploads sync across every device"
                      >
                        <span className="material-symbols-outlined text-[14px]">cloud_upload</span>
                        <span>Enable Global Device Sync</span>
                      </button>
                    )
                  )}
                </div>
                <span className="text-[12px] text-[#F3E6D5]/80">
                  Signed in as <strong className="text-[#FFF9F2]">{adminUser}</strong>
                </span>
              </div>

              {/* Tabs for Magazine/PDF, Audio, Video */}
              <nav
                aria-label="Content Type Toggle"
                className="flex items-center gap-1 p-1 bg-[#140307] border border-[#3A0C16] rounded-xl flex-wrap"
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('magazine');
                    setSearchQuery('');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-[13px] sm:text-[14px] font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'magazine'
                      ? 'bg-[#800020] text-[#FFF9F2] shadow-md shadow-[#800020]/30'
                      : 'text-[#F3E6D5]/80 hover:text-white'
                  }`}
                  id="tab-magazine"
                >
                  <span className="material-symbols-outlined text-[18px]">auto_stories</span>
                  <span>Magazine / PDF ({magazinePages.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('audio');
                    setSearchQuery('');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-[13px] sm:text-[14px] font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'audio'
                      ? 'bg-[#800020] text-[#FFF9F2] shadow-md shadow-[#800020]/30'
                      : 'text-[#F3E6D5]/80 hover:text-white'
                  }`}
                  id="tab-audio"
                >
                  <span className="material-symbols-outlined text-[18px]">audiotrack</span>
                  <span>Audio ({audioTracks.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('video');
                    setSearchQuery('');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-[13px] sm:text-[14px] font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'video'
                      ? 'bg-[#800020] text-[#FFF9F2] shadow-md shadow-[#800020]/30'
                      : 'text-[#F3E6D5]/80 hover:text-white'
                  }`}
                  id="tab-video"
                >
                  <span className="material-symbols-outlined text-[18px]">video_library</span>
                  <span>Video ({videoItems.length})</span>
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <button
                onClick={() => onNavigate('home')}
                className="text-[13px] font-medium text-[#F3E6D5]/80 hover:text-white px-2.5 py-1 rounded-md hover:bg-[#1F040A] transition-colors cursor-pointer"
              >
                View Site
              </button>
              <button
                onClick={onSignOut}
                className="group flex items-center gap-1.5 text-[13px] font-medium text-[#D45060] hover:bg-[#1F040A] px-2.5 py-1 rounded-md transition-colors duration-150 cursor-pointer"
              >
                <span>Sign Out</span>
                <span className="text-sm opacity-70 group-hover:opacity-100">⎋</span>
              </button>
            </div>
          </header>

          {/* Main Admin Workspace Container */}
          <div className="w-full flex flex-col gap-10">
            {activeTab === 'magazine' ? (
              <div className="flex flex-col gap-8">
                {/* Active Magazine Status & Quick Actions */}
                <section className="bg-[#140307] p-5 sm:p-7 rounded-2xl shadow-xl border border-[#3A0C16] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#1F040A] border border-[#800020]/40 flex items-center justify-center text-[#D45060] flex-shrink-0">
                      <span className="material-symbols-outlined text-[28px]">menu_book</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-[#D45060] animate-pulse"></span>
                        <span className="text-[12px] font-semibold uppercase tracking-wider text-[#D45060]">
                          Active Live Issue
                        </span>
                        <span className="text-[#800020] text-[12px]">·</span>
                        <span className="text-[12px] text-[#F3E6D5]/80">
                          {magazineEdition.sourceType === 'pdf' ? `PDF (${magazineEdition.fileName || 'Custom'})` : 'Editorial Design'}
                        </span>
                      </div>
                      <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#FFF9F2] tracking-tight">
                        {magazineEdition.title}
                      </h2>
                      <span className="text-[12px] text-[#F3E6D5]/80">
                        {magazinePages.length} Pages · Year {magazineEdition.year} · {magazineEdition.institution}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-center">
                    {magazineEdition.sourceType === 'pdf' && (
                      <button
                        type="button"
                        onClick={handleResetToCurated}
                        className="px-3 py-1.5 rounded-lg border border-[#3A0C16] text-[13px] font-medium text-[#F3E6D5]/80 hover:text-white hover:bg-[#1F040A] transition-colors cursor-pointer"
                        title="Reset to 16-page curated editorial issue"
                      >
                        Reset to Curated Issue
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onNavigate('magazine')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#800020] hover:bg-[#A30029] text-[#FFF9F2] text-[13px] font-semibold shadow-md shadow-[#800020]/30 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[17px]">open_in_new</span>
                      <span>Read Magazine</span>
                    </button>
                  </div>
                </section>

                {/* PDF Upload Card */}
                <section className="bg-[#140307] p-5 sm:p-8 rounded-2xl shadow-xl border border-[#3A0C16] flex flex-col gap-6">
                  <div className="flex flex-col gap-1 pb-4 border-b border-[#3A0C16]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#D45060] text-[24px]">
                        upload_file
                      </span>
                      <h3 className="text-[19px] sm:text-[20px] font-semibold text-[#FFF9F2] tracking-tight">
                        Upload Magazine PDF
                      </h3>
                    </div>
                    <p className="text-[13px] sm:text-[14px] text-[#F3E6D5]/80">
                      Upload an official college magazine PDF. The built-in PDF rendering engine converts each page into high-resolution visuals displayed in the 3D book flip reader.
                    </p>
                  </div>

                  {/* Form fields: optional custom title & edition */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-[#F3E6D5]/80">
                        Magazine Title (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rithu 2026 — Annual Magazine"
                        value={pdfCustomTitle}
                        onChange={(e) => setPdfCustomTitle(e.target.value)}
                        className="h-[42px] px-3.5 rounded-[10px] bg-[#1F040A] border border-[#3A0C16] text-[#FFF9F2] placeholder-[#F3E6D5]/40 text-[14px] outline-none focus:border-[#D45060] focus:ring-2 focus:ring-[#D45060]/20"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-[#F3E6D5]/80">
                        Edition Year
                      </label>
                      <input
                        type="text"
                        placeholder="2026"
                        value={pdfEditionYear}
                        onChange={(e) => setPdfEditionYear(e.target.value)}
                        className="h-[42px] px-3.5 rounded-[10px] bg-[#1F040A] border border-[#3A0C16] text-[#FFF9F2] placeholder-[#F3E6D5]/40 text-[14px] outline-none focus:border-[#D45060] focus:ring-2 focus:ring-[#D45060]/20"
                      />
                    </div>
                  </div>

                  {/* PDF Drag & Drop Zone */}
                  <div className="flex flex-col gap-2">
                    <label className="group relative flex flex-col items-center justify-center p-8 sm:p-10 rounded-xl border-2 border-dashed border-[#3A0C16] hover:border-[#D45060] bg-[#1F040A]/70 hover:bg-[#1F040A] cursor-pointer transition-all duration-200">
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        className="sr-only"
                        disabled={isRenderingPdf}
                        onChange={handlePdfUpload}
                      />

                      {isRenderingPdf ? (
                        <div className="w-full max-w-[360px] flex flex-col items-center gap-3">
                          <div className="w-10 h-10 border-3 border-[#D45060] border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-[14px] font-semibold text-[#FFF9F2]">
                            Rendering PDF Pages ({renderProgress?.percent || 0}%)
                          </span>
                          <span className="text-[12px] text-[#F3E6D5]/80 text-center">
                            Processing page {renderProgress?.currentPage || 0} of {renderProgress?.totalPages || 0} into high-resolution spreads...
                          </span>
                          <div className="w-full bg-[#140307] h-2 rounded-full overflow-hidden border border-[#3A0C16]">
                            <div
                              className="bg-[#D45060] h-full transition-all duration-150"
                              style={{ width: `${renderProgress?.percent || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-full bg-[#1F040A] border border-[#800020]/50 flex items-center justify-center text-[#D45060] mb-2 group-hover:scale-110 transition-transform shadow-md">
                            <span className="material-symbols-outlined text-[30px]">picture_as_pdf</span>
                          </div>
                          <span className="text-[15px] font-semibold text-[#FFF9F2]">
                            Drop your magazine PDF here, or click to browse
                          </span>
                          <span className="text-[12px] text-[#F3E6D5]/80 mt-1">
                            Accepts any standard multi-page PDF document
                          </span>
                          <div className="mt-3 px-3 py-1 rounded bg-[#1F040A] border border-[#3A0C16] text-[11px] font-mono text-[#F3E6D5]/80">
                            PDF format · Auto-generates 3D realistic flipbook
                          </div>
                        </>
                      )}
                    </label>

                    {/* Instant sample button */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <span className="text-[12px] text-[#F3E6D5]/80">
                        Need to test right away without an external file?
                      </span>
                      <button
                        type="button"
                        onClick={handleLoadSamplePdf}
                        disabled={isRenderingPdf}
                        className="px-3.5 py-1.5 rounded-lg border border-[#D45060]/40 bg-[#D45060]/10 hover:bg-[#D45060]/20 text-[#D45060] text-[13px] font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">file_open</span>
                        <span>Load Sample PDF Issue (8 Pages)</span>
                      </button>
                    </div>
                  </div>
                </section>

                {/* Rendered Folio & Spread Gallery */}
                <section className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[19px] sm:text-[20px] font-semibold text-[#FFF9F2] tracking-tight">
                        Magazine Spreads & Pages
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#1F040A] border border-[#3A0C16] text-[12px] text-[#F3E6D5]/80 font-medium">
                        {magazinePages.length} Pages Total
                      </span>
                    </div>
                    <span className="text-[12px] text-[#F3E6D5]/80">
                      Click any page to preview in reader
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {magazinePages.map((page, idx) => {
                      const isCover = idx === 0;
                      const isBack = idx === magazinePages.length - 1;
                      return (
                        <div
                          key={page.id}
                          onClick={() => onNavigate('magazine')}
                          className="group bg-[#140307] rounded-xl border border-[#3A0C16] p-3 shadow-lg hover:border-[#D45060] hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between"
                        >
                          <div className="w-full aspect-[1/1.35] bg-[#1F040A] rounded-lg overflow-hidden relative border border-[#3A0C16] flex items-center justify-center">
                            {page.pdfImageUrl ? (
                              <img
                                src={page.pdfImageUrl}
                                alt={page.title || `Page ${idx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 filter brightness-95 group-hover:brightness-100"
                              />
                            ) : (
                              <div className="w-full h-full p-3 flex flex-col justify-between bg-[#160408] text-[#FFF9F2]">
                                <span className="text-[9px] font-mono text-[#D45060]">
                                  {isCover ? 'COVER' : isBack ? 'BACK' : `PAGE ${idx + 1}`}
                                </span>
                                <span className="text-[12px] font-bold line-clamp-2">
                                  {page.title || 'Spread'}
                                </span>
                                <span className="text-[8px] opacity-40">Rithu Editorial</span>
                              </div>
                            )}

                            {/* Badge */}
                            <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[10px] font-medium text-white border border-white/10">
                              {isCover ? 'Cover' : isBack ? 'Back' : `P. ${idx + 1}`}
                            </div>
                          </div>

                          <div className="flex flex-col mt-2 min-w-0">
                            <span className="text-[13px] font-medium text-[#FFF9F2] truncate group-hover:text-[#D45060] transition-colors">
                              {page.title || (isCover ? 'Front Cover' : isBack ? 'Back Cover' : `Page ${idx + 1}`)}
                            </span>
                            <span className="text-[11px] text-[#F3E6D5]/80">
                              {isCover
                                ? 'Single Page (Closed)'
                                : isBack
                                ? 'Single Page (Closed)'
                                : 'Dual Spread Leaf'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            ) : activeTab === 'audio' ? (
              <>
                {/* Section: Add / Edit Audio */}
                <section className="bg-[#140307] p-5 sm:p-8 lg:p-10 rounded-2xl shadow-xl border border-[#3A0C16] flex flex-col gap-6">
                  <div className="flex flex-col gap-1 pb-4 border-b border-[#3A0C16]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#D45060]">
                          {editingAudioId ? 'edit_note' : 'add_circle'}
                        </span>
                        <h2 className="text-[19px] sm:text-[20px] font-semibold text-[#FFF9F2] tracking-tight">
                          {editingAudioId ? 'Edit Audio Record' : 'Add Audio Record'}
                        </h2>
                      </div>
                      {editingAudioId && (
                        <button
                          type="button"
                          onClick={handleCancelEditAudio}
                          className="text-[13px] text-[#D45060] hover:underline cursor-pointer font-medium"
                        >
                          Cancel Editing
                        </button>
                      )}
                    </div>
                    <p className="text-[13px] sm:text-[14px] text-[#F3E6D5]/80">
                      Catalog literary spoken pieces, essays, and regional narratives for the
                      digital issue.
                    </p>
                  </div>

                  <form
                    className="flex flex-col gap-6"
                    id="audio-entry-form"
                    onSubmit={handleAudioSubmit}
                  >
                    {/* Row 1: Title & Contributor */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#F3E6D5]/80" htmlFor="track-title">
                          Title *
                        </label>
                        <input
                          className="h-[44px] px-3.5 rounded-[10px] bg-[#1F040A] border border-[#3A0C16] text-[#FFF9F2] placeholder-[#F3E6D5]/40 text-[15px] outline-none focus:border-[#D45060] focus:ring-2 focus:ring-[#D45060]/20 transition-all duration-150"
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
                          className="text-[13px] font-medium text-[#F3E6D5]/80"
                          htmlFor="track-author"
                        >
                          Author / Contributor *
                        </label>
                        <input
                          className="h-[44px] px-3.5 rounded-[10px] bg-[#1F040A] border border-[#3A0C16] text-[#FFF9F2] placeholder-[#F3E6D5]/40 text-[15px] outline-none focus:border-[#D45060] focus:ring-2 focus:ring-[#D45060]/20 transition-all duration-150"
                          id="track-author"
                          placeholder="Narrator or writer name"
                          required
                          type="text"
                          value={audioAuthor}
                          onChange={(e) => setAudioAuthor(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Row 2: Language & Tag Selection & Duration */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label
                          className="text-[13px] font-medium text-[#F3E6D5]/80"
                          htmlFor="track-language"
                        >
                          Language
                        </label>
                        <div className="relative w-full">
                          <select
                            className="w-full h-[44px] px-3.5 pr-10 appearance-none rounded-[10px] bg-[#1F040A] border border-[#3A0C16] text-[#FFF9F2] text-[15px] outline-none focus:border-[#D45060] focus:ring-2 focus:ring-[#D45060]/20 cursor-pointer transition-all duration-150"
                            id="track-language"
                            value={audioLanguage}
                            onChange={(e) =>
                              setAudioLanguage(e.target.value as 'Malayalam' | 'English' | 'Bilingual')
                            }
                          >
                            <option value="Malayalam" className="bg-[#1F040A]">Malayalam</option>
                            <option value="English" className="bg-[#1F040A]">English</option>
                            <option value="Bilingual" className="bg-[#1F040A]">Bilingual</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#F3E6D5]/80 text-base">
                            expand_more
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label
                          className="text-[13px] font-medium text-[#F3E6D5]/80"
                          htmlFor="track-category"
                        >
                          Category / Tag
                        </label>
                        <div className="relative w-full">
                          <select
                            className="w-full h-[44px] px-3.5 pr-10 appearance-none rounded-[10px] bg-[#1F040A] border border-[#3A0C16] text-[#FFF9F2] text-[15px] outline-none focus:border-[#D45060] focus:ring-2 focus:ring-[#D45060]/20 cursor-pointer transition-all duration-150"
                            id="track-category"
                            value={audioCategory}
                            onChange={(e) =>
                              setAudioCategory(e.target.value as AudioTrack['category'])
                            }
                          >
                            <option value="Travelogue" className="bg-[#1F040A]">Travelogue</option>
                            <option value="Editorial" className="bg-[#1F040A]">Editorial</option>
                            <option value="Poetry" className="bg-[#1F040A]">Poetry</option>
                            <option value="Interview" className="bg-[#1F040A]">Interview</option>
                            <option value="Fiction" className="bg-[#1F040A]">Fiction</option>
                            <option value="Discussion" className="bg-[#1F040A]">Discussion</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#F3E6D5]/80 text-base">
                            expand_more
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#F3E6D5]/80">Duration (mm:ss)</label>
                        <input
                          className="h-[44px] px-3.5 rounded-[10px] bg-[#1F040A] border border-[#3A0C16] text-[#FFF9F2] placeholder-[#F3E6D5]/40 text-[15px] outline-none focus:border-[#D45060] focus:ring-2 focus:ring-[#D45060]/20 transition-all duration-150"
                          placeholder="e.g. 5:32"
                          type="text"
                          value={audioDuration}
                          onChange={(e) => setAudioDuration(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Row 3: Description Field */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        className="text-[13px] font-medium text-[#F3E6D5]/80"
                        htmlFor="track-description"
                      >
                        Description
                      </label>
                      <textarea
                        className="w-full p-3.5 rounded-[10px] bg-[#1F040A] border border-[#3A0C16] text-[#FFF9F2] placeholder-[#F3E6D5]/40 text-[15px] outline-none focus:border-[#D45060] focus:ring-2 focus:ring-[#D45060]/20 transition-all duration-150 resize-y"
                        id="track-description"
                        placeholder="Short context, archival excerpts, or recording lineage..."
                        rows={2}
                        value={audioDescription}
                        onChange={(e) => setAudioDescription(e.target.value)}
                      ></textarea>
                    </div>

                    {/* Row 4: File Attachments Dropzones */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 pt-1">
                      {/* Audio File Dropzone */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#F3E6D5]/80">Audio File Attachment</label>
                        <label className="group relative flex flex-col items-center justify-center p-5 rounded-[10px] border border-dashed border-[#3A0C16] bg-[#1F040A]/70 hover:bg-[#1F040A] hover:border-[#D45060] cursor-pointer transition-all duration-200">
                          <input
                            accept="audio/*"
                            className="sr-only"
                            type="file"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setAudioFileName(e.target.files[0].name);
                              }
                            }}
                          />
                          <span className="material-symbols-outlined text-[#D45060] group-hover:scale-110 mb-1 transition-transform text-2xl">
                            audio_file
                          </span>
                          <span className="text-[14px] text-[#FFF9F2] font-medium">
                            {audioFileName || 'Choose Audio File...'}
                          </span>
                          <span className="text-[11px] text-[#F3E6D5]/80 mt-0.5">
                            WAV, FLAC, or high-fidelity MP3
                          </span>
                        </label>
                      </div>

                      {/* Cover Art Dropzone */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#F3E6D5]/80">Cover Art (Optional)</label>
                        <label className="group relative flex flex-col items-center justify-center p-5 rounded-[10px] border border-dashed border-[#3A0C16] bg-[#1F040A]/70 hover:bg-[#1F040A] hover:border-[#D45060] cursor-pointer transition-all duration-200">
                          <input
                            accept="image/*"
                            className="sr-only"
                            type="file"
                            onChange={async (e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                setAudioCoverName(file.name);
                                try {
                                  const compressed = await compressImageFileToDataUrl(file);
                                  setAudioCoverDataUrl(compressed);
                                } catch {
                                  // Keep filename if compression fails
                                }
                              }
                            }}
                          />
                          <span className="material-symbols-outlined text-[#D45060] group-hover:scale-110 mb-1 transition-transform text-2xl">
                            image
                          </span>
                          <span className="text-[14px] text-[#FFF9F2] font-medium">
                            {audioCoverName || 'Choose Image...'}
                          </span>
                          <span className="text-[11px] text-[#F3E6D5]/80 mt-0.5">
                            1:1 ratio square artwork (JPG, PNG)
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[#3A0C16]">
                      <span className="text-[12px] text-[#F3E6D5]/80">
                        All media assets are automatically archived to the college edition vault.
                      </span>
                      <div className="flex items-center gap-3">
                        {editingAudioId && (
                          <button
                            type="button"
                            onClick={handleCancelEditAudio}
                            className="px-4 py-2 text-[14px] font-medium text-[#F3E6D5]/80 hover:text-white cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-[10px] bg-[#800020] hover:bg-[#A30029] text-[#FFF9F2] text-[15px] font-semibold active:scale-[0.98] shadow-lg shadow-[#800020]/30 transition-all duration-150 whitespace-nowrap cursor-pointer"
                          type="submit"
                        >
                          {editingAudioId ? 'Update Audio' : 'Publish Audio'}
                        </button>
                      </div>
                    </div>
                  </form>
                </section>

                {/* Section: Published Content with Search */}
                <section className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[19px] sm:text-[20px] font-semibold text-[#FFF9F2] tracking-tight">
                        Published Content
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#1F040A] border border-[#3A0C16] text-[12px] text-[#F3E6D5]/80 font-medium">
                        {audioTracks.length} tracks
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search audio tracks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 pl-8 pr-3 text-[13px] bg-[#1F040A] border border-[#3A0C16] rounded-lg text-[#FFF9F2] placeholder-[#F3E6D5]/40 outline-none focus:border-[#D45060]"
                      />
                      <span className="material-symbols-outlined text-[16px] text-[#F3E6D5]/80 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        search
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col bg-[#140307] rounded-2xl shadow-xl border border-[#3A0C16] divide-y divide-[#3A0C16] overflow-hidden">
                    {filteredAudio.length === 0 ? (
                      <div className="p-8 text-center text-[#F3E6D5]/80 text-[14px]">
                        No audio tracks found matching "{searchQuery}".
                      </div>
                    ) : (
                      filteredAudio.map((track) => (
                        <div
                          key={track.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-2 hover:bg-[#1F040A]/60 transition-colors duration-150"
                        >
                          <div className="flex items-start sm:items-center gap-4 min-w-0">
                            <button
                              aria-label={`Preview ${track.title}`}
                              onClick={() => onPlayAudioPreview(track)}
                              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1F040A] border border-[#800020]/40 hover:bg-[#800020] text-[#D45060] hover:text-white transition-all flex-shrink-0 cursor-pointer shadow-sm"
                              title="Play Audio Track"
                            >
                              <span className="material-symbols-outlined text-lg">play_arrow</span>
                            </button>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[15px] text-[#FFF9F2] truncate font-medium">
                                {track.title}
                              </span>
                              <div className="flex items-center gap-2 text-[12px] text-[#F3E6D5]/80 flex-wrap">
                                <span className="font-medium text-[#FFF9F2]/90">{track.author}</span>
                                <span>·</span>
                                <span>{track.language}</span>
                                <span>·</span>
                                <span>{track.duration}</span>
                                <span>·</span>
                                <span>Published {track.publishedDate}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center pl-4 sm:pl-0">
                            <button
                              onClick={() => handleEditAudio(track)}
                              className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[#F3E6D5]/80 hover:text-white hover:bg-[#1F040A] transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete audio record "${track.title}"?`)) {
                                  onDeleteAudioTrack(track.id);
                                  showToast(`Deleted "${track.title}".`);
                                }
                              }}
                              className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[#D45060] hover:bg-[#1F040A] transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </>
            ) : (
              <>
                {/* Section: Add / Edit Video */}
                <section className="bg-[#140307] p-5 sm:p-8 lg:p-10 rounded-2xl shadow-xl border border-[#3A0C16] flex flex-col gap-6">
                  <div className="flex flex-col gap-1 pb-4 border-b border-[#3A0C16]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#D45060]">
                          {editingVideoId ? 'movie_edit' : 'video_call'}
                        </span>
                        <h2 className="text-[19px] sm:text-[20px] font-semibold text-[#FFF9F2] tracking-tight">
                          {editingVideoId ? 'Edit Video Record' : 'Add Video Record'}
                        </h2>
                      </div>
                      {editingVideoId && (
                        <button
                          type="button"
                          onClick={handleCancelEditVideo}
                          className="text-[13px] text-[#D45060] hover:underline cursor-pointer font-medium"
                        >
                          Cancel Editing
                        </button>
                      )}
                    </div>
                    <p className="text-[13px] sm:text-[14px] text-[#F3E6D5]/80">
                      Catalog campus events, symposium presentations, and alumni keynotes for the
                      video archives.
                    </p>
                  </div>

                  <form className="flex flex-col gap-6" onSubmit={handleVideoSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#F3E6D5]/80">
                          Video Title *
                        </label>
                        <input
                          className="h-[44px] px-3.5 rounded-[10px] bg-[#1F040A] border border-[#3A0C16] text-[#FFF9F2] placeholder-[#F3E6D5]/40 text-[15px] outline-none focus:border-[#D45060] focus:ring-2 focus:ring-[#D45060]/20 transition-all duration-150"
                          placeholder="e.g. Cultural Night: ELYSION '26"
                          required
                          type="text"
                          value={videoTitle}
                          onChange={(e) => setVideoTitle(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#F3E6D5]/80">
                          Tagline / Subtitle
                        </label>
                        <input
                          className="h-[44px] px-3.5 rounded-[10px] bg-[#1F040A] border border-[#3A0C16] text-[#FFF9F2] placeholder-[#F3E6D5]/40 text-[15px] outline-none focus:border-[#D45060] focus:ring-2 focus:ring-[#D45060]/20 transition-all duration-150"
                          placeholder="e.g. Official Highlights & Aftermovie"
                          type="text"
                          value={videoTagline}
                          onChange={(e) => setVideoTagline(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#F3E6D5]/80">Category</label>
                        <select
                          className="w-full h-[44px] px-3.5 rounded-[10px] bg-[#1F040A] border border-[#3A0C16] text-[#FFF9F2] text-[15px] outline-none focus:border-[#D45060] focus:ring-2 focus:ring-[#D45060]/20 cursor-pointer"
                          value={videoCategory}
                          onChange={(e) => setVideoCategory(e.target.value)}
                        >
                          <option value="Events" className="bg-[#1F040A]">Events</option>
                          <option value="Workshops" className="bg-[#1F040A]">Workshops</option>
                          <option value="IEEE" className="bg-[#1F040A]">IEEE</option>
                          <option value="Interviews" className="bg-[#1F040A]">Interviews</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#F3E6D5]/80">Date Str</label>
                        <input
                          className="h-[44px] px-3.5 rounded-[10px] bg-[#1F040A] border border-[#3A0C16] text-[#FFF9F2] placeholder-[#F3E6D5]/40 text-[15px] outline-none focus:border-[#D45060] focus:ring-2 focus:ring-[#D45060]/20"
                          placeholder="e.g. Feb 14–15, 2026"
                          type="text"
                          value={videoDate}
                          onChange={(e) => setVideoDate(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#F3E6D5]/80">Duration (mm:ss)</label>
                        <input
                          className="h-[44px] px-3.5 rounded-[10px] bg-[#1F040A] border border-[#3A0C16] text-[#FFF9F2] placeholder-[#F3E6D5]/40 text-[15px] outline-none focus:border-[#D45060] focus:ring-2 focus:ring-[#D45060]/20"
                          placeholder="e.g. 8:42"
                          type="text"
                          value={videoDuration}
                          onChange={(e) => setVideoDuration(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-[#F3E6D5]/80">
                        Archival Description / Summary
                      </label>
                      <textarea
                        className="w-full p-3.5 rounded-[10px] bg-[#1F040A] border border-[#3A0C16] text-[#FFF9F2] placeholder-[#F3E6D5]/40 text-[15px] outline-none focus:border-[#D45060] focus:ring-2 focus:ring-[#D45060]/20 transition-all resize-y"
                        placeholder="Context of event, keynote speaker, student participation..."
                        rows={2}
                        value={videoDescription}
                        onChange={(e) => setVideoDescription(e.target.value)}
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#F3E6D5]/80">
                          Thumbnail Poster URL (Optional)
                        </label>
                        <input
                          className="h-[44px] px-3.5 rounded-[10px] bg-[#1F040A] border border-[#3A0C16] text-[#FFF9F2] placeholder-[#F3E6D5]/40 text-[15px] outline-none focus:border-[#D45060] focus:ring-2 focus:ring-[#D45060]/20"
                          placeholder="https://... or upload below"
                          type="text"
                          value={videoImageUrl}
                          onChange={(e) => setVideoImageUrl(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-[#F3E6D5]/80">
                          Video Asset Attachment
                        </label>
                        <label className="group relative flex flex-col items-center justify-center p-3.5 rounded-[10px] border border-dashed border-[#3A0C16] bg-[#1F040A]/70 hover:bg-[#1F040A] hover:border-[#D45060] cursor-pointer transition-all duration-200">
                          <input
                            accept="video/*,image/*"
                            className="sr-only"
                            type="file"
                            onChange={async (e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                setVideoFileName(file.name);
                                if (file.type.startsWith('image/')) {
                                  try {
                                    const compressed = await compressImageFileToDataUrl(file);
                                    setVideoImageUrl(compressed);
                                  } catch {
                                    // Ignore
                                  }
                                }
                              }
                            }}
                          />
                          <span className="material-symbols-outlined text-[#D45060] group-hover:scale-110 mb-0.5 transition-transform text-xl">
                            video_library
                          </span>
                          <span className="text-[13px] text-[#FFF9F2] font-medium">
                            {videoFileName || 'Upload Video Recording or Master file'}
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#3A0C16]">
                      {editingVideoId && (
                        <button
                          type="button"
                          onClick={handleCancelEditVideo}
                          className="px-4 py-2 text-[14px] font-medium text-[#F3E6D5]/80 hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-[10px] bg-[#800020] hover:bg-[#A30029] text-[#FFF9F2] text-[15px] font-semibold active:scale-[0.98] shadow-lg shadow-[#800020]/30 transition-all duration-150 whitespace-nowrap cursor-pointer"
                        type="submit"
                      >
                        {editingVideoId ? 'Update Video Record' : 'Publish Video'}
                      </button>
                    </div>
                  </form>
                </section>

                {/* Section: Published Videos with Search */}
                <section className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[19px] sm:text-[20px] font-semibold text-[#FFF9F2] tracking-tight">
                        Published Videos
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#1F040A] border border-[#3A0C16] text-[12px] text-[#F3E6D5]/80 font-medium">
                        {videoItems.length} videos
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search video archives..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 pl-8 pr-3 text-[13px] bg-[#1F040A] border border-[#3A0C16] rounded-lg text-[#FFF9F2] placeholder-[#F3E6D5]/40 outline-none focus:border-[#D45060]"
                      />
                      <span className="material-symbols-outlined text-[16px] text-[#F3E6D5]/80 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        search
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col bg-[#140307] rounded-2xl shadow-xl border border-[#3A0C16] divide-y divide-[#3A0C16] overflow-hidden">
                    {filteredVideos.length === 0 ? (
                      <div className="p-8 text-center text-[#F3E6D5]/80 text-[14px]">
                        No video records found matching "{searchQuery}".
                      </div>
                    ) : (
                      filteredVideos.map((video) => (
                        <div
                          key={video.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-[#1F040A]/60 transition-colors duration-150"
                        >
                          <div className="flex items-start sm:items-center gap-4 min-w-0">
                            <button
                              aria-label={`Preview ${video.title}`}
                              onClick={() => onSelectVideoPreview(video)}
                              className="w-16 h-10 rounded-md overflow-hidden bg-black flex-shrink-0 relative group/thumb cursor-pointer shadow-xs border border-[#3A0C16]"
                              title="Play Video"
                            >
                              <img
                                src={video.image}
                                alt={video.imageAlt}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover/thumb:bg-black/10">
                                <span className="material-symbols-outlined text-white text-[18px]">
                                  play_arrow
                                </span>
                              </div>
                            </button>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[15px] text-[#FFF9F2] truncate font-medium">
                                {video.title}
                              </span>
                              <div className="flex items-center gap-2 text-[12px] text-[#F3E6D5]/80 flex-wrap">
                                <span className="font-semibold text-[#D45060]">{video.category}</span>
                                <span>·</span>
                                <span>{video.duration}</span>
                                <span>·</span>
                                <span>{video.dateStr}</span>
                                {video.tagline && (
                                  <>
                                    <span>·</span>
                                    <span className="truncate max-w-[200px]">{video.tagline}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center pl-4 sm:pl-0">
                            <button
                              onClick={() => handleEditVideo(video)}
                              className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[#F3E6D5]/80 hover:text-white hover:bg-[#1F040A] transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete video record "${video.title}"?`)) {
                                  onDeleteVideoItem(video.id);
                                  showToast(`Deleted "${video.title}".`);
                                }
                              }}
                              className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[#D45060] hover:bg-[#1F040A] transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
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

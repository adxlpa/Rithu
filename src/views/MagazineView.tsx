import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ViewMode, MagazinePage, MagazineEditionInfo } from '../types';

interface MagazineViewProps {
  pages: MagazinePage[];
  editionInfo: MagazineEditionInfo;
  onNavigate: (view: ViewMode) => void;
  onOpenAdminUpload?: () => void;
}

export const MagazineView: React.FC<MagazineViewProps> = ({
  pages,
  editionInfo,
  onNavigate,
  onOpenAdminUpload,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [forceSinglePage, setForceSinglePage] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Responsive Layout detection
  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth < 840);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const effectiveSinglePage = isMobile || forceSinglePage;
  const totalPages = pages.length;

  // Desktop Spread Mechanics:
  // Step 0: Front Cover (1 page, facing right, left empty)
  // Step 1: Pages 1 & 2
  // Step 2: Pages 3 & 4
  // ...
  // Step N: Back Cover (1 page, facing left, right empty)
  const numInteriorSpreads = Math.ceil(Math.max(0, totalPages - 2) / 2);
  const maxDesktopStep = numInteriorSpreads + 1;

  const [desktopStep, setDesktopStep] = useState(0);
  const [mobilePageIndex, setMobilePageIndex] = useState(0);

  // 3D Flip & Drag Physics State
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const [flipAngle, setFlipAngle] = useState(0); // 0 -> -180 (next) or 0 -> +180 (prev)
  const [curlLift, setCurlLift] = useState(0); // 0 -> 1 -> 0
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);

  // Is any page turning (either through programmatic animation or active dragging)
  const isPageTurning = isFlipping || (isDragging && dragProgress > 0.015);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartXRef = useRef(0);
  const dragStartTimeRef = useRef(0);
  const directionLockedRef = useRef(false);

  // Page Turn Sound synthesis (Web Audio API)
  const playPageSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      filter.Q.value = 1.2;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.38);

      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.16;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
      setTimeout(() => ctx.close().catch(() => {}), 450);
    } catch {
      // Audio optional
    }
  };

  // Helper to get spread pages for any step
  const getSpreadPages = (step: number) => {
    if (step === 0) {
      return {
        isCover: true,
        isBackCover: false,
        leftPage: null,
        rightPage: pages[0] || null,
      };
    }
    if (step === maxDesktopStep) {
      return {
        isCover: false,
        isBackCover: true,
        leftPage: pages[totalPages - 1] || null,
        rightPage: null,
      };
    }
    const spreadIdx = step - 1;
    const leftIdx = 1 + spreadIdx * 2;
    const rightIdx = leftIdx + 1;
    return {
      isCover: false,
      isBackCover: false,
      leftPage: pages[leftIdx] || null,
      rightPage: pages[rightIdx] || null,
    };
  };

  const currentSpread = useMemo(() => getSpreadPages(desktopStep), [desktopStep, maxDesktopStep, pages, totalPages]);
  const nextSpread = useMemo(() => getSpreadPages(Math.min(maxDesktopStep, desktopStep + 1)), [desktopStep, maxDesktopStep, pages, totalPages]);
  const prevSpread = useMemo(() => getSpreadPages(Math.max(0, desktopStep - 1)), [desktopStep, maxDesktopStep, pages, totalPages]);

  const canGoPrev = effectiveSinglePage ? mobilePageIndex > 0 : desktopStep > 0;
  const canGoNext = effectiveSinglePage ? mobilePageIndex < totalPages - 1 : desktopStep < maxDesktopStep;

  // Turn Next Programmatic Flip
  const turnNext = () => {
    if (isFlipping || isDragging) return;
    if (!canGoNext) return;

    startFlipAnimation('next', () => {
      if (effectiveSinglePage) {
        setMobilePageIndex((idx) => Math.min(totalPages - 1, idx + 1));
      } else {
        setDesktopStep((s) => Math.min(maxDesktopStep, s + 1));
      }
    });
  };

  // Turn Previous Programmatic Flip
  const turnPrev = () => {
    if (isFlipping || isDragging) return;
    if (!canGoPrev) return;

    startFlipAnimation('prev', () => {
      if (effectiveSinglePage) {
        setMobilePageIndex((idx) => Math.max(0, idx - 1));
      } else {
        setDesktopStep((s) => Math.max(0, s - 1));
      }
    });
  };

  // Physics animation with realistic paper curvature and bottom corner peel
  const startFlipAnimation = (
    direction: 'next' | 'prev',
    onComplete: () => void,
    fromAngle = 0,
    fromLift = 0
  ) => {
    setIsFlipping(true);
    setFlipDirection(direction);
    playPageSound();

    const targetAngle = direction === 'next' ? -180 : 180;
    const duration = 480;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Realistic cubic bezier easing (ease-in-out quint)
      const eased =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const angle = fromAngle + (targetAngle - fromAngle) * eased;
      setFlipAngle(angle);

      // Realistic bottom corner lift & peel arch (peaks midway with smooth settling)
      const lift = Math.sin(progress * Math.PI) * (1 - fromLift) + fromLift * (1 - progress);
      setCurlLift(Math.max(0, lift));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Complete the flip precisely at 180 deg
        onComplete();
        setIsFlipping(false);
        setFlipAngle(0);
        setCurlLift(0);
        setDragProgress(0);
      }
    };

    requestAnimationFrame(animate);
  };

  // Mouse & Touch Drag Handlers (Supports both Forward & Backward)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isFlipping) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    const isRightHalf = clickX >= width * 0.5;
    const isLeftHalf = clickX < width * 0.5;

    // Determine initial intent
    let initialDir: 'next' | 'prev' = 'next';
    if (currentSpread.isCover) {
      initialDir = 'next';
    } else if (currentSpread.isBackCover) {
      initialDir = 'prev';
    } else if (isLeftHalf && canGoPrev) {
      initialDir = 'prev';
    } else if (isRightHalf && canGoNext) {
      initialDir = 'next';
    } else if (canGoPrev && !canGoNext) {
      initialDir = 'prev';
    } else {
      initialDir = 'next';
    }

    setIsDragging(true);
    setFlipDirection(initialDir);
    dragStartXRef.current = e.clientX;
    dragStartTimeRef.current = performance.now();
    directionLockedRef.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const currentX = e.clientX;
    const diffX = currentX - dragStartXRef.current;
    const containerWidth = containerRef.current?.clientWidth || 700;
    const dragDistance = effectiveSinglePage ? containerWidth * 0.65 : containerWidth * 0.42;

    // Detect direction lock in first 12px of movement
    if (!directionLockedRef.current && Math.abs(diffX) > 12) {
      directionLockedRef.current = true;
      if (diffX < 0 && canGoNext) {
        setFlipDirection('next');
      } else if (diffX > 0 && canGoPrev) {
        setFlipDirection('prev');
      }
    }

    if (flipDirection === 'next') {
      // Dragging right-to-left
      const progress = Math.max(0, Math.min(1, -diffX / dragDistance));
      setDragProgress(progress);
      setFlipAngle(-180 * progress);
      setCurlLift(Math.sin(progress * Math.PI));
    } else {
      // Dragging left-to-right (GOING BACKWARD)
      const progress = Math.max(0, Math.min(1, diffX / dragDistance));
      setDragProgress(progress);
      setFlipAngle(180 * progress);
      setCurlLift(Math.sin(progress * Math.PI));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    const elapsed = performance.now() - dragStartTimeRef.current;
    const deltaX = e.clientX - dragStartXRef.current;
    const isClick = Math.abs(deltaX) < 12 && elapsed < 320;
    const isFlick = elapsed < 280 && Math.abs(deltaX) > 30;
    const shouldComplete = dragProgress > 0.18 || isFlick;

    if (isClick) {
      // User tapped or clicked without dragging
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;

      if (currentSpread.isCover && canGoNext) {
        turnNext();
      } else if (currentSpread.isBackCover && canGoPrev) {
        turnPrev();
      } else if (clickX >= width * 0.5 && canGoNext) {
        turnNext();
      } else if (clickX < width * 0.5 && canGoPrev) {
        turnPrev();
      }
      setDragProgress(0);
      setFlipAngle(0);
      setCurlLift(0);
      return;
    }

    if (shouldComplete) {
      // Complete turn from current angle
      if (flipDirection === 'next' && canGoNext) {
        startFlipAnimation(
          'next',
          () => {
            if (effectiveSinglePage) {
              setMobilePageIndex((idx) => Math.min(totalPages - 1, idx + 1));
            } else {
              setDesktopStep((s) => Math.min(maxDesktopStep, s + 1));
            }
          },
          flipAngle,
          curlLift
        );
      } else if (flipDirection === 'prev' && canGoPrev) {
        startFlipAnimation(
          'prev',
          () => {
            if (effectiveSinglePage) {
              setMobilePageIndex((idx) => Math.max(0, idx - 1));
            } else {
              setDesktopStep((s) => Math.max(0, s - 1));
            }
          },
          flipAngle,
          curlLift
        );
      } else {
        springBack();
      }
    } else {
      springBack();
    }
  };

  const springBack = () => {
    setIsFlipping(true);
    const startA = flipAngle;
    const startL = curlLift;
    const duration = 280;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);

      setFlipAngle(startA * (1 - eased));
      setCurlLift(startL * (1 - eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsFlipping(false);
        setFlipAngle(0);
        setCurlLift(0);
        setDragProgress(0);
      }
    };
    requestAnimationFrame(animate);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFlipping || isDragging) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        turnNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        turnPrev();
      } else if (e.key === 'Escape') {
        setIsZoomed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [desktopStep, mobilePageIndex, effectiveSinglePage, isFlipping, isDragging, canGoNext, canGoPrev]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Render Page Content
  const renderPageContent = (page: MagazinePage | null, isLeft: boolean) => {
    if (!page) {
      return (
        <div className="w-full h-full bg-[#180408] flex items-center justify-center text-[#F3E6D5]/30 select-none">
          <span className="material-symbols-outlined text-4xl">auto_stories</span>
        </div>
      );
    }

    // 1. PDF Page
    if (page.pdfImageUrl) {
      return (
        <div className="relative w-full h-full bg-[#FFF9F2] flex flex-col justify-center items-center overflow-hidden shadow-inner select-none">
          <img
            src={page.pdfImageUrl}
            alt={page.title || `Page ${page.pageNumber}`}
            className="w-full h-full object-contain pointer-events-none"
            loading="lazy"
          />
          <div className="absolute inset-y-0 pointer-events-none w-6 mix-blend-multiply opacity-25 bg-gradient-to-r from-black/25 to-transparent left-0"></div>
          <div className="absolute inset-y-0 pointer-events-none w-6 mix-blend-multiply opacity-25 bg-gradient-to-l from-black/25 to-transparent right-0"></div>
        </div>
      );
    }

    // 2. Editorial Front Cover
    if (page.type === 'cover') {
      const coverImg = page.templateData?.image;
      return (
        <div className="relative w-full h-full bg-[#160408] text-[#FFF9F2] flex flex-col justify-between p-6 sm:p-10 overflow-hidden shadow-2xl select-none">
          {coverImg && (
            <div className="absolute inset-0 z-0">
              <img
                src={coverImg}
                alt="Front Cover"
                className="w-full h-full object-cover opacity-45 filter contrast-110 brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E0205] via-[#1F040A]/75 to-[#0E0205]/95"></div>
            </div>
          )}

          {/* Bound Cover Leather texture & embossed border */}
          <div className="absolute inset-3 border border-[#800020]/60 rounded pointer-events-none z-10"></div>
          <div className="absolute inset-4 border border-[#F3E6D5]/20 rounded pointer-events-none z-10"></div>

          {/* Spine Depth Strip */}
          <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/80 to-transparent pointer-events-none z-10"></div>

          <div className="relative z-10 flex flex-col items-center text-center mt-4">
            <span className="text-[11px] sm:text-[12px] tracking-[0.25em] uppercase font-semibold text-[#D45060] mb-1">
              College of Engineering Munnar
            </span>
            <span className="text-[10px] sm:text-[11px] tracking-widest text-[#F3E6D5]/80 uppercase">
              Annual Digital Edition
            </span>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center my-auto">
            <h1 className="text-[44px] sm:text-[64px] font-bold tracking-tight text-[#FFF9F2] font-['Playfair_Display']">
              {page.title || 'RITHU'}
            </h1>
            <div className="w-16 h-[2.5px] bg-[#800020] my-4 shadow-sm"></div>
            <p className="text-[15px] sm:text-[17px] text-[#F3E6D5] font-light italic max-w-xs">
              {page.subtitle || 'Annual Magazine'}
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between text-[11px] text-[#F3E6D5]/80 uppercase tracking-wider pt-4 border-t border-[#800020]/40">
            <span>Volume VIII</span>
            <span className="text-[#D45060] font-semibold">{editionInfo.year || '2026'}</span>
            <span>Archival Copy</span>
          </div>
        </div>
      );
    }

    // 3. Editorial Back Cover
    if (page.type === 'back-cover') {
      return (
        <div className="relative w-full h-full bg-[#160408] text-[#FFF9F2] flex flex-col justify-between p-6 sm:p-10 overflow-hidden shadow-2xl select-none">
          <div className="absolute inset-3 border border-[#800020]/60 rounded pointer-events-none z-10"></div>
          <div className="absolute inset-4 border border-[#F3E6D5]/20 rounded pointer-events-none z-10"></div>
          <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-black/80 to-transparent pointer-events-none z-10"></div>

          <div className="relative z-10 flex flex-col items-center text-center mt-6">
            <div className="w-10 h-10 rounded-full bg-[#800020] border border-[#D45060]/50 flex items-center justify-center text-[#FFF9F2] font-bold text-base mb-3 shadow-md">
              R
            </div>
            <h3 className="text-xl font-semibold tracking-tight text-[#FFF9F2]">Rithu 2026</h3>
            <p className="text-xs text-[#F3E6D5]/80 mt-0.5">{editionInfo.institution}</p>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center max-w-xs mx-auto">
            <p className="text-[13px] sm:text-[14px] text-[#F3E6D5] italic leading-relaxed">
              "Words and echoes that linger through the mist and cedar hills of Munnar."
            </p>
            <div className="w-8 h-[1px] bg-[#800020] my-4"></div>
            <span className="text-[11px] text-[#F3E6D5]/60">Published by the Students Editorial Board</span>
          </div>

          <div className="relative z-10 flex items-center justify-between text-[11px] text-[#F3E6D5]/80 pt-4 border-t border-[#800020]/40">
            <span>CEM Digital Archives</span>
            <span>ISBN 978-81-926</span>
          </div>
        </div>
      );
    }

    // 4. Interior Editorial Spread Pages
    const tData = page.templateData;
    return (
      <div className="relative w-full h-full bg-[#FFF9F2] text-[#140A0C] flex flex-col justify-between p-5 sm:p-8 overflow-hidden select-none paper-grain">
        {/* Subtle physical book spine shading */}
        {isLeft ? (
          <div className="absolute inset-y-0 right-0 w-8 pointer-events-none bg-gradient-to-l from-black/15 via-black/5 to-transparent"></div>
        ) : (
          <div className="absolute inset-y-0 left-0 w-8 pointer-events-none bg-gradient-to-r from-black/15 via-black/5 to-transparent"></div>
        )}

        {/* Running Header */}
        <header className="flex items-center justify-between text-[11px] sm:text-[12px] text-[#521320] tracking-wider uppercase pb-2 border-b border-[#140A0C]/10">
          <span className="font-medium truncate max-w-[160px]">{tData?.category || page.title}</span>
          <span className="font-semibold text-[#800020]">{tData?.categoryTag || 'ARTICLE'}</span>
        </header>

        {/* Main Body */}
        <article className="my-auto flex flex-col gap-3 py-2">
          {page.title && (
            <h2 className="text-[20px] sm:text-[24px] font-bold text-[#140A0C] tracking-tight leading-snug font-['Playfair_Display']">
              {page.title}
            </h2>
          )}
          {tData?.author && (
            <p className="text-[12px] sm:text-[13px] text-[#800020] font-medium italic">
              By {tData.author}
            </p>
          )}

          {tData?.paragraphs && tData.paragraphs.length > 0 && (
            <div className="space-y-2 text-[12.5px] sm:text-[14px] leading-relaxed text-[#2A1B1E] font-serif">
              {tData.paragraphs.map((p: string, pIdx: number) => (
                <p key={pIdx}>{p}</p>
              ))}
            </div>
          )}

          {tData?.pullQuote && (
            <blockquote className="my-2 p-3 sm:p-4 bg-[#F3E6D5] border-l-3 border-[#800020] rounded-r text-[13px] sm:text-[14px] italic text-[#140A0C] shadow-inner">
              "{tData.pullQuote}"
            </blockquote>
          )}
        </article>

        {/* Running Footer */}
        <footer className="flex items-center justify-between text-[11px] text-[#521320] pt-2 border-t border-[#140A0C]/10">
          {isLeft ? (
            <>
              <span className="font-mono font-bold text-[#800020]">{page.pageNumber}</span>
              <span className="truncate max-w-[140px] opacity-80">{tData?.footerPrimary || 'Rithu 2026'}</span>
            </>
          ) : (
            <>
              <span className="truncate max-w-[140px] opacity-80">{tData?.footerPrimary || editionInfo.institution}</span>
              <span className="font-mono font-bold text-[#800020]">{page.pageNumber}</span>
            </>
          )}
        </footer>
      </div>
    );
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col bg-[#0E0205] text-[#FFF9F2] animate-fadeIn select-none">
      {/* Ambient Top Bar */}
      <header className="w-full z-30 px-4 sm:px-6 py-2.5 bg-[#140307]/95 backdrop-blur-md border-b border-[#3A0C16] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1.5 text-[13px] text-[#F3E6D5]/80 hover:text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span className="hidden sm:inline">Home</span>
          </button>
          <div className="h-4 w-[1px] bg-[#3A0C16]"></div>
          <div className="flex flex-col">
            <span className="text-[13px] sm:text-[14px] font-semibold text-[#FFF9F2] leading-tight">
              {editionInfo.title || 'Rithu Magazine'}
            </span>
            <span className="text-[11px] text-[#D45060]">
              {effectiveSinglePage
                ? `Page ${mobilePageIndex + 1} of ${totalPages}`
                : desktopStep === 0
                ? 'Front Cover'
                : desktopStep === maxDesktopStep
                ? 'Back Cover'
                : `Pages ${1 + (desktopStep - 1) * 2}–${Math.min(totalPages, 2 + (desktopStep - 1) * 2)} of ${totalPages}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Admin Upload / Change PDF Button */}
          <button
            onClick={() => {
              if (onOpenAdminUpload) onOpenAdminUpload();
              else onNavigate('admin-portal');
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#800020]/30 hover:bg-[#800020]/60 text-[#D45060] border border-[#800020]/60 text-[12px] font-medium transition-colors cursor-pointer mr-1"
            title="Upload or Change Magazine PDF in Admin"
          >
            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
            <span className="hidden sm:inline">Admin PDF</span>
          </button>

          {!isMobile && (
            <button
              onClick={() => setForceSinglePage(!forceSinglePage)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                forceSinglePage
                  ? 'bg-[#800020] text-[#FFF9F2]'
                  : 'text-[#F3E6D5]/80 hover:text-white hover:bg-[#24070D]'
              }`}
              title={forceSinglePage ? 'Switch to Dual Spread' : 'Switch to Single Page'}
            >
              <span className="material-symbols-outlined text-[19px]">
                {forceSinglePage ? 'menu_book' : 'auto_stories'}
              </span>
            </button>
          )}

          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isZoomed
                ? 'bg-[#800020] text-[#FFF9F2]'
                : 'text-[#F3E6D5]/80 hover:text-white hover:bg-[#24070D]'
            }`}
            title="Inspect Scale"
          >
            <span className="material-symbols-outlined text-[19px]">
              {isZoomed ? 'zoom_out' : 'zoom_in'}
            </span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#F3E6D5]/80 hover:text-white hover:bg-[#24070D] transition-all cursor-pointer"
            title="Toggle Fullscreen"
          >
            <span className="material-symbols-outlined text-[19px]">fullscreen</span>
          </button>
        </div>
      </header>

      {/* Main 3D Book Reading Chamber */}
      <div
        ref={containerRef}
        className="relative w-full flex-1 flex items-center justify-center px-2 sm:px-6 lg:px-12 py-3 sm:py-6 overflow-hidden book-perspective"
      >
        {/* Previous Navigation Flank Button */}
        <button
          onClick={turnPrev}
          disabled={!canGoPrev}
          aria-label="Previous Page"
          className={`absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-xl cursor-pointer ${
            !canGoPrev
              ? 'opacity-20 cursor-not-allowed text-[#F3E6D5]/30'
              : 'text-[#FFF9F2] bg-[#1F040A]/95 hover:bg-[#800020] hover:scale-105 active:scale-95 border border-[#800020]/50'
          }`}
        >
          <span className="material-symbols-outlined text-[26px]">chevron_left</span>
        </button>

        {/* 3D Physical Book Shell with Pointer Drag Engine */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`relative transition-all duration-300 cursor-grab active:cursor-grabbing touch-none select-none ${
            effectiveSinglePage
              ? 'w-full max-w-[480px] aspect-[1/1.38] max-h-[720px]'
              : currentSpread.isCover || currentSpread.isBackCover
              ? 'w-full max-w-[540px] aspect-[1/1.38] max-h-[740px]' // SINGLE PAGE CLOSED COVER
              : 'w-full max-w-[1080px] aspect-[1.48/1] max-h-[780px]' // DUAL SPREAD OPEN BOOK
          } ${isZoomed ? 'scale-105 sm:scale-110 shadow-3xl' : 'scale-100'}`}
        >
          {/* Deep physical under-book drop shadow */}
          <div className="absolute inset-0 rounded-xl bg-black/90 transform translate-y-5 translate-x-2 filter blur-xl pointer-events-none"></div>

          {/* Hardbound Spine Texture on Dual Open Spread */}
          {!effectiveSinglePage && !currentSpread.isCover && !currentSpread.isBackCover && (
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 z-30 pointer-events-none bg-gradient-to-r from-black/60 via-black/15 to-black/60 mix-blend-multiply opacity-90 spine-groove">
              <div className="w-[1px] h-full mx-auto bg-black/50 shadow-xs"></div>
            </div>
          )}

          {/* Real Book Container Box with True 3D Preserve Space */}
          <div className="relative w-full h-full rounded-lg bg-[#FFF9F2] shadow-2xl flex border border-[#3A0C16] preserve-3d">
            {effectiveSinglePage ? (
              /* ================= MOBILE / SINGLE PAGE REAL-BOOK ENGINE ================= */
              <div className="relative w-full h-full preserve-3d">
                <div className="w-full h-full overflow-hidden rounded-lg">
                  {renderPageContent(pages[mobilePageIndex], false)}
                </div>

                {/* Animated Bottom Corner Curl Leaf on Mobile (Supports NEXT & PREV) */}
                {isPageTurning && (
                  <div
                    className={`absolute inset-0 preserve-3d pointer-events-none z-40 transition-none ${
                      flipDirection === 'next'
                        ? 'origin-left-spine paper-turn-curve-next'
                        : 'origin-right-spine paper-turn-curve-prev'
                    }`}
                    style={{
                      transform:
                        flipDirection === 'next'
                          ? `rotateY(${flipAngle}deg) rotateZ(${-curlLift * 8}deg) skewY(${-curlLift * 9}deg) scaleX(${1 - curlLift * 0.08}) translateY(${-curlLift * 12}px)`
                          : `rotateY(${flipAngle}deg) rotateZ(${curlLift * 8}deg) skewY(${curlLift * 9}deg) scaleX(${1 - curlLift * 0.08}) translateY(${-curlLift * 12}px)`,
                    }}
                  >
                    {/* Front Face of Turning Page */}
                    <div className="absolute inset-0 backface-hidden bg-[#FFF9F2] overflow-hidden rounded-lg">
                      {renderPageContent(pages[mobilePageIndex], false)}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `linear-gradient(${flipDirection === 'next' ? 135 - flipAngle * 0.25 : 225 + flipAngle * 0.25}deg, rgba(255,255,255,${0.35 + curlLift * 0.5}) 0%, rgba(243,230,213,0.18) 32%, rgba(0,0,0,${curlLift * 0.25}) 68%, rgba(0,0,0,${curlLift * 0.7}) 100%)`,
                          opacity: curlLift > 0.02 ? 1 : 0,
                        }}
                      />
                    </div>

                    {/* Back Face of Turning Page */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#FFF9F2] overflow-hidden rounded-lg">
                      {renderPageContent(
                        pages[
                          flipDirection === 'next'
                            ? Math.min(totalPages - 1, mobilePageIndex + 1)
                            : Math.max(0, mobilePageIndex - 1)
                        ],
                        true
                      )}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `linear-gradient(${flipDirection === 'next' ? 225 + flipAngle * 0.25 : 135 - flipAngle * 0.25}deg, rgba(255,255,255,${0.35 + curlLift * 0.5}) 0%, rgba(243,230,213,0.18) 32%, rgba(0,0,0,${curlLift * 0.25}) 68%, rgba(0,0,0,${curlLift * 0.7}) 100%)`,
                          opacity: curlLift > 0.02 ? 1 : 0,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Bottom Corner Dog-Ear Peel Invites on Mobile */}
                {canGoNext && !isPageTurning && (
                  <div
                    onClick={turnNext}
                    className="absolute right-0 bottom-0 w-20 h-20 z-30 cursor-pointer group"
                    title="Peel or tap corner to turn forward"
                  >
                    <div className="absolute right-0 bottom-0 w-12 h-12 bg-gradient-to-tl from-[#800020] via-[#D45060] to-[#F3E6D5] rounded-tl-2xl shadow-xl border-t border-l border-white/80 group-hover:scale-110 transition-transform dogear-shadow-next flex items-end justify-end p-2.5">
                      <span className="material-symbols-outlined text-[15px] text-[#FFF9F2]">chevron_right</span>
                    </div>
                  </div>
                )}
                {canGoPrev && !isPageTurning && (
                  <div
                    onClick={turnPrev}
                    className="absolute left-0 bottom-0 w-20 h-20 z-30 cursor-pointer group"
                    title="Peel or tap corner to turn backward"
                  >
                    <div className="absolute left-0 bottom-0 w-12 h-12 bg-gradient-to-tr from-[#800020] via-[#D45060] to-[#F3E6D5] rounded-tr-2xl shadow-xl border-t border-r border-white/80 group-hover:scale-110 transition-transform dogear-shadow-prev flex items-end justify-start p-2.5">
                      <span className="material-symbols-outlined text-[15px] text-[#FFF9F2]">chevron_left</span>
                    </div>
                  </div>
                )}
              </div>
            ) : currentSpread.isCover ? (
              /* ================= DESKTOP: CLOSED FRONT COVER (1 PAGE) ================= */
              <div className="relative w-full h-full preserve-3d book-edge-stack-right">
                <div className="w-full h-full overflow-hidden rounded-lg">{renderPageContent(pages[0], false)}</div>

                {isPageTurning && (
                  <div
                    className="absolute inset-0 origin-left-spine preserve-3d pointer-events-none z-40 transition-none paper-turn-curve-next"
                    style={{
                      transform: `rotateY(${flipAngle}deg) rotateZ(${-curlLift * 8}deg) skewY(${-curlLift * 9}deg) scaleX(${1 - curlLift * 0.08}) translateY(${-curlLift * 12}px)`,
                    }}
                  >
                    <div className="absolute inset-0 backface-hidden bg-[#160408] overflow-hidden rounded-lg">
                      {renderPageContent(pages[0], false)}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `linear-gradient(${135 - flipAngle * 0.25}deg, rgba(255,255,255,${0.35 + curlLift * 0.5}) 0%, rgba(243,230,213,0.18) 32%, rgba(0,0,0,${curlLift * 0.25}) 68%, rgba(0,0,0,${curlLift * 0.7}) 100%)`,
                          opacity: curlLift > 0.02 ? 1 : 0,
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#FFF9F2] overflow-hidden rounded-lg">
                      {renderPageContent(pages[1] || null, true)}
                    </div>
                  </div>
                )}

                {!isPageTurning && (
                  <div
                    onClick={turnNext}
                    className="absolute right-0 bottom-0 w-24 h-24 z-30 cursor-pointer group animate-dogear-flutter"
                    title="Drag or click corner to open magazine"
                  >
                    <div className="absolute right-0 bottom-0 w-14 h-14 bg-gradient-to-tl from-[#800020] via-[#D45060] to-[#F3E6D5] rounded-tl-2xl shadow-2xl border-t border-l border-white/80 flex items-end justify-end p-2.5 group-hover:scale-110 transition-transform dogear-shadow-next">
                      <span className="material-symbols-outlined text-[17px] text-[#FFF9F2]">auto_stories</span>
                    </div>
                  </div>
                )}
              </div>
            ) : currentSpread.isBackCover ? (
              /* ================= DESKTOP: CLOSED BACK COVER (1 PAGE) ================= */
              <div className="relative w-full h-full preserve-3d book-edge-stack-left">
                <div className="w-full h-full overflow-hidden rounded-lg">{renderPageContent(pages[totalPages - 1], false)}</div>

                {isPageTurning && (
                  <div
                    className="absolute inset-0 origin-right-spine preserve-3d pointer-events-none z-40 transition-none paper-turn-curve-prev"
                    style={{
                      transform: `rotateY(${flipAngle}deg) rotateZ(${curlLift * 8}deg) skewY(${curlLift * 9}deg) scaleX(${1 - curlLift * 0.08}) translateY(${-curlLift * 12}px)`,
                    }}
                  >
                    <div className="absolute inset-0 backface-hidden bg-[#160408] overflow-hidden rounded-lg">
                      {renderPageContent(pages[totalPages - 1], false)}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `linear-gradient(${225 + flipAngle * 0.25}deg, rgba(255,255,255,${0.35 + curlLift * 0.5}) 0%, rgba(243,230,213,0.18) 32%, rgba(0,0,0,${curlLift * 0.25}) 68%, rgba(0,0,0,${curlLift * 0.7}) 100%)`,
                          opacity: curlLift > 0.02 ? 1 : 0,
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#FFF9F2] overflow-hidden rounded-lg">
                      {renderPageContent(pages[totalPages - 2] || null, false)}
                    </div>
                  </div>
                )}

                {!isPageTurning && (
                  <div
                    onClick={turnPrev}
                    className="absolute left-0 bottom-0 w-24 h-24 z-30 cursor-pointer group animate-dogear-flutter"
                    title="Drag or click corner to reopen magazine"
                  >
                    <div className="absolute left-0 bottom-0 w-14 h-14 bg-gradient-to-tr from-[#800020] via-[#D45060] to-[#F3E6D5] rounded-tr-2xl shadow-2xl border-t border-r border-white/80 flex items-end justify-start p-2.5 group-hover:scale-110 transition-transform dogear-shadow-prev">
                      <span className="material-symbols-outlined text-[17px] text-[#FFF9F2]">chevron_left</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ================= DESKTOP: DUAL SPREAD (2 FACING PAGES) ================= */
              <div className="relative w-full h-full flex preserve-3d book-edge-stack-left book-edge-stack-right">
                {/* Static Left Page (Facing Left) */}
                <div className="relative w-1/2 h-full border-r border-[#140A0C]/10 overflow-hidden rounded-l-lg">
                  {renderPageContent(
                    isPageTurning && flipDirection === 'prev' ? prevSpread.leftPage : currentSpread.leftPage,
                    true
                  )}
                  {/* Underpage cast shadow when turning backward */}
                  {isPageTurning && flipDirection === 'prev' && (
                    <div
                      className="absolute inset-0 underpage-shadow-prev pointer-events-none transition-opacity"
                      style={{ opacity: curlLift }}
                    ></div>
                  )}
                  {/* Cast shadow when turning forward and leaf crosses spine */}
                  {isPageTurning && flipDirection === 'next' && flipAngle < -90 && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: `linear-gradient(to left, rgba(0,0,0,${Math.sin(Math.abs(flipAngle) * Math.PI / 180) * 0.4}) 0%, transparent 60%)`,
                      }}
                    />
                  )}
                </div>

                {/* Static Right Page (Facing Right) */}
                <div className="relative w-1/2 h-full overflow-hidden rounded-r-lg">
                  {renderPageContent(
                    isPageTurning && flipDirection === 'next' ? nextSpread.rightPage : currentSpread.rightPage,
                    false
                  )}
                  {/* Underpage cast shadow when turning forward */}
                  {isPageTurning && flipDirection === 'next' && (
                    <div
                      className="absolute inset-0 underpage-shadow-next pointer-events-none transition-opacity"
                      style={{ opacity: curlLift }}
                    ></div>
                  )}
                  {/* Cast shadow when turning backward and leaf crosses spine */}
                  {isPageTurning && flipDirection === 'prev' && flipAngle > 90 && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: `linear-gradient(to right, rgba(0,0,0,${Math.sin(Math.abs(flipAngle) * Math.PI / 180) * 0.4}) 0%, transparent 60%)`,
                      }}
                    />
                  )}
                </div>

                {/* 3D TURNING LEAF: FULLY SUPPORTS BOTH FORWARD AND BACKWARD! */}
                {isPageTurning && flipDirection === 'next' && (
                  /* TURNING FORWARD: Right page peels and flips over spine to the left side */
                  <div
                    className="absolute top-0 bottom-0 w-1/2 origin-left-spine preserve-3d pointer-events-none z-40 transition-none paper-turn-curve-next"
                    style={{
                      left: '50%',
                      transform: `rotateY(${flipAngle}deg) rotateZ(${-curlLift * 8}deg) skewY(${-curlLift * 9}deg) scaleX(${1 - curlLift * 0.08}) translateY(${-curlLift * 12}px)`,
                    }}
                  >
                    {/* Front Face: Current Right Page */}
                    <div className="absolute inset-0 backface-hidden bg-[#FFF9F2] overflow-hidden rounded-r-lg border-l border-[#140A0C]/10">
                      {renderPageContent(currentSpread.rightPage, false)}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `linear-gradient(${135 - flipAngle * 0.25}deg, rgba(255,255,255,${0.35 + curlLift * 0.5}) 0%, rgba(243,230,213,0.18) 32%, rgba(0,0,0,${curlLift * 0.25}) 68%, rgba(0,0,0,${curlLift * 0.7}) 100%)`,
                          opacity: curlLift > 0.02 ? 1 : 0,
                        }}
                      />
                    </div>

                    {/* Back Face: Next Left Page */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#FFF9F2] overflow-hidden rounded-l-lg border-r border-[#140A0C]/10">
                      {renderPageContent(nextSpread.leftPage, true)}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `linear-gradient(${225 + flipAngle * 0.25}deg, rgba(255,255,255,${0.35 + curlLift * 0.5}) 0%, rgba(243,230,213,0.18) 32%, rgba(0,0,0,${curlLift * 0.25}) 68%, rgba(0,0,0,${curlLift * 0.7}) 100%)`,
                          opacity: curlLift > 0.02 ? 1 : 0,
                        }}
                      />
                    </div>
                  </div>
                )}

                {isPageTurning && flipDirection === 'prev' && (
                  /* TURNING BACKWARD: Left page peels and flips over spine to the right side */
                  <div
                    className="absolute top-0 bottom-0 w-1/2 origin-right-spine preserve-3d pointer-events-none z-40 transition-none paper-turn-curve-prev"
                    style={{
                      left: '0',
                      transform: `rotateY(${flipAngle}deg) rotateZ(${curlLift * 8}deg) skewY(${curlLift * 9}deg) scaleX(${1 - curlLift * 0.08}) translateY(${-curlLift * 12}px)`,
                    }}
                  >
                    {/* Front Face: Current Left Page */}
                    <div className="absolute inset-0 backface-hidden bg-[#FFF9F2] overflow-hidden rounded-l-lg border-r border-[#140A0C]/10">
                      {renderPageContent(currentSpread.leftPage, true)}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `linear-gradient(${225 + flipAngle * 0.25}deg, rgba(255,255,255,${0.35 + curlLift * 0.5}) 0%, rgba(243,230,213,0.18) 32%, rgba(0,0,0,${curlLift * 0.25}) 68%, rgba(0,0,0,${curlLift * 0.7}) 100%)`,
                          opacity: curlLift > 0.02 ? 1 : 0,
                        }}
                      />
                    </div>

                    {/* Back Face: Previous Right Page */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#FFF9F2] overflow-hidden rounded-r-lg border-l border-[#140A0C]/10">
                      {renderPageContent(prevSpread.rightPage, false)}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `linear-gradient(${135 - flipAngle * 0.25}deg, rgba(255,255,255,${0.35 + curlLift * 0.5}) 0%, rgba(243,230,213,0.18) 32%, rgba(0,0,0,${curlLift * 0.25}) 68%, rgba(0,0,0,${curlLift * 0.7}) 100%)`,
                          opacity: curlLift > 0.02 ? 1 : 0,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Bottom Corner Dog-Ears for Forward & Backward Dragging */}
                {canGoNext && !isPageTurning && (
                  <div
                    onClick={turnNext}
                    className="absolute right-0 bottom-0 w-24 h-24 z-30 cursor-pointer group"
                    title="Drag or click corner to turn forward"
                  >
                    {/* Multi-layered Realistic Paper Corner Peel */}
                    <div className="absolute right-0 bottom-0 w-14 h-14 overflow-visible pointer-events-none transition-all duration-300 group-hover:w-16 group-hover:h-16">
                      <div className="absolute right-0 bottom-0 w-11 h-11 bg-black/40 rounded-tl-xl filter blur-[3px] transform translate-x-1 translate-y-1"></div>
                      <div className="absolute right-0 bottom-0 w-12 h-12 bg-gradient-to-tl from-[#800020] via-[#D45060] to-[#F3E6D5] rounded-tl-2xl shadow-xl border-t border-l border-white/80 group-hover:scale-110 transition-transform dogear-shadow-next flex items-end justify-end p-2.5">
                        <span className="material-symbols-outlined text-[15px] text-[#FFF9F2] font-bold group-hover:translate-x-0.5 transition-transform">
                          chevron_right
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {canGoPrev && !isPageTurning && (
                  <div
                    onClick={turnPrev}
                    className="absolute left-0 bottom-0 w-24 h-24 z-30 cursor-pointer group"
                    title="Drag or click corner to turn backward"
                  >
                    {/* Multi-layered Realistic Paper Corner Peel */}
                    <div className="absolute left-0 bottom-0 w-14 h-14 overflow-visible pointer-events-none transition-all duration-300 group-hover:w-16 group-hover:h-16">
                      <div className="absolute left-0 bottom-0 w-11 h-11 bg-black/40 rounded-tr-xl filter blur-[3px] transform -translate-x-1 translate-y-1"></div>
                      <div className="absolute left-0 bottom-0 w-12 h-12 bg-gradient-to-tr from-[#800020] via-[#D45060] to-[#F3E6D5] rounded-tr-2xl shadow-xl border-t border-r border-white/80 group-hover:scale-110 transition-transform dogear-shadow-prev flex items-end justify-start p-2.5">
                        <span className="material-symbols-outlined text-[15px] text-[#FFF9F2] font-bold group-hover:-translate-x-0.5 transition-transform">
                          chevron_left
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Next Navigation Flank Button */}
        <button
          onClick={turnNext}
          disabled={!canGoNext}
          aria-label="Next Page"
          className={`absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-xl cursor-pointer ${
            !canGoNext
              ? 'opacity-20 cursor-not-allowed text-[#F3E6D5]/30'
              : 'text-[#FFF9F2] bg-[#1F040A]/95 hover:bg-[#800020] hover:scale-105 active:scale-95 border border-[#800020]/50'
          }`}
        >
          <span className="material-symbols-outlined text-[26px]">chevron_right</span>
        </button>
      </div>

      {/* Interactive Bottom Control & Thumbnail Strip */}
      <footer className="w-full z-30 pb-4 pt-2.5 bg-[#140307]/95 backdrop-blur-md border-t border-[#3A0C16]">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 flex flex-col gap-2.5">
          {/* Thumbnails strip */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 overflow-x-auto py-1 scroll-smooth no-scrollbar">
            {/* Front Cover Thumbnail */}
            <button
              onClick={() => {
                if (effectiveSinglePage) {
                  setMobilePageIndex(0);
                } else {
                  setDesktopStep(0);
                }
                playPageSound();
              }}
              className={`flex-shrink-0 flex items-center rounded p-1 transition-all cursor-pointer ${
                (effectiveSinglePage ? mobilePageIndex === 0 : desktopStep === 0)
                  ? 'bg-[#24070D] ring-2 ring-[#D45060] shadow-sm'
                  : 'bg-[#180408] opacity-50 hover:opacity-100'
              }`}
            >
              <div className="w-8 h-10 bg-[#160408] rounded border border-[#800020]/60 flex items-center justify-center">
                <span className="text-[8px] font-bold text-[#D45060]">COVER</span>
              </div>
              <span className="ml-2 text-[11px] sm:text-[12px] font-medium pr-1 text-[#F3E6D5]/80">
                Front
              </span>
            </button>

            {/* Interior Spreads Thumbnails */}
            {Array.from({ length: numInteriorSpreads }).map((_, idx) => {
              const step = idx + 1;
              const leftNum = 1 + idx * 2;
              const rightNum = Math.min(totalPages, leftNum + 1);
              const isActive = effectiveSinglePage
                ? mobilePageIndex === leftNum || mobilePageIndex === rightNum
                : desktopStep === step;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (effectiveSinglePage) {
                      setMobilePageIndex(leftNum);
                    } else {
                      setDesktopStep(step);
                    }
                    playPageSound();
                  }}
                  className={`flex-shrink-0 flex items-center rounded p-1 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#24070D] ring-2 ring-[#D45060] shadow-sm'
                      : 'bg-[#180408] opacity-50 hover:opacity-100'
                  }`}
                >
                  <div className="w-12 h-10 bg-[#FFF9F2] rounded border border-[#3A0C16] flex items-center justify-center gap-1 text-[9px] font-mono text-[#140A0C]">
                    <span>{leftNum}</span>
                    <span className="opacity-40">|</span>
                    <span>{rightNum}</span>
                  </div>
                  <span className="ml-2 text-[11px] sm:text-[12px] font-medium pr-1 text-[#F3E6D5]/80">
                    {leftNum}–{rightNum}
                  </span>
                </button>
              );
            })}

            {/* Back Cover Thumbnail */}
            <button
              onClick={() => {
                if (effectiveSinglePage) {
                  setMobilePageIndex(totalPages - 1);
                } else {
                  setDesktopStep(maxDesktopStep);
                }
                playPageSound();
              }}
              className={`flex-shrink-0 flex items-center rounded p-1 transition-all cursor-pointer ${
                (effectiveSinglePage ? mobilePageIndex === totalPages - 1 : desktopStep === maxDesktopStep)
                  ? 'bg-[#24070D] ring-2 ring-[#D45060] shadow-sm'
                  : 'bg-[#180408] opacity-50 hover:opacity-100'
              }`}
            >
              <div className="w-8 h-10 bg-[#160408] rounded border border-[#800020]/60 flex items-center justify-center">
                <span className="text-[8px] font-bold text-[#D45060]">BACK</span>
              </div>
              <span className="ml-2 text-[11px] sm:text-[12px] font-medium pr-1 text-[#F3E6D5]/80">
                Back
              </span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

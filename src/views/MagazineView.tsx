import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ViewMode, MagazinePage, MagazineEditionInfo } from '../types';
import { rithuCoverImg, cemCampusSunriseImg } from '../data/initialData';

interface MagazineViewProps {
  pages: MagazinePage[];
  editionInfo: MagazineEditionInfo;
  onNavigate: (view: ViewMode) => void;
  onUploadDirectPdf?: (file: File) => Promise<void>;
  isUploadingPdf?: boolean;
  pdfUploadProgress?: { currentPage: number; totalPages: number; percent: number } | null;
}

function escapeHtml(str?: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const MagazineView: React.FC<MagazineViewProps> = ({
  pages,
  editionInfo,
  onNavigate,
  onUploadDirectPdf,
  isUploadingPdf = false,
  pdfUploadProgress = null,
}) => {
  // Master container & DOM refs
  const stageRef = useRef<HTMLDivElement>(null);
  const zwRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  // Sound AudioContext ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Flipbook engine internal mutable state refs (for 60fps / 120fps direct DOM speed)
  const engineRef = useRef<{
    pages: MagazinePage[];
    N: number;
    W: number;
    H: number;
    pw: number;
    ar: number;
    s: number;
    zoom: number;
    snd: boolean;
    busy: number;
    single: boolean;
    T: {
      dir: number;
      y0: number;
      cv: HTMLDivElement;
      P: [number, number];
      E: {
        S: HTMLDivElement;
        A: HTMLDivElement;
        F: HTMLDivElement;
        B: HTMLDivElement;
        oC: HTMLDivElement;
        oF: HTMLDivElement;
      };
    } | null;
    drag: {
      dir: number;
      cx: number;
      cy: number;
      y0: number;
      mv: number;
    } | null;
    sL: HTMLDivElement | null;
    sR: HTMLDivElement | null;
  }>({
    pages: [],
    N: 0,
    W: 800,
    H: 566,
    pw: 400,
    ar: 0.707,
    s: 0,
    zoom: 1,
    snd: true,
    busy: 0,
    single: false,
    T: null,
    drag: null,
    sL: null,
    sR: null,
  });

  // Mobile pinch-to-zoom and two-finger pan gesture state
  const touchStateRef = useRef<{
    isPinching: boolean;
    initialDist: number;
    initialZoom: number;
    panStart: { x: number; y: number };
    currentPan: { x: number; y: number };
    lastTapTime: number;
  }>({
    isPinching: false,
    initialDist: 1,
    initialZoom: 1,
    panStart: { x: 0, y: 0 },
    currentPan: { x: 0, y: 0 },
    lastTapTime: 0,
  });

  // UI state for React header/footer rendering
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [totalSpreads, setTotalSpreads] = useState(0);
  const [isSinglePageMode, setIsSinglePageMode] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(1);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isThumbDrawerOpen, setIsThumbDrawerOpen] = useState(false);
  const [canGoPrev, setCanGoPrev] = useState(false);
  const [canGoNext, setCanGoNext] = useState(false);

  // Play realistic multi-layered magazine paper flip sound (corner lift + air arch sweep + spine flex + page settle thud)
  const playTickSound = useCallback((mode: 'turn' | 'grab' = 'turn') => {
    if (!engineRef.current.snd) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ac = audioCtxRef.current;
      if (ac.state === 'suspended') {
        ac.resume().catch(() => {});
      }

      const now = ac.currentTime;
      const pitchVar = 0.94 + Math.random() * 0.12; // Natural variation per page turn

      // Subtle corner-grab rustle when user begins dragging a page corner
      if (mode === 'grab') {
        const grabDur = 0.11;
        const grabLen = Math.round(ac.sampleRate * grabDur);
        const grabBuf = ac.createBuffer(1, grabLen, ac.sampleRate);
        const grabData = grabBuf.getChannelData(0);
        let b0 = 0,
          b1 = 0,
          b2 = 0;
        for (let i = 0; i < grabLen; i++) {
          const t = i / grabLen;
          const white = Math.random() * 2 - 1;
          b0 = 0.99 * b0 + white * 0.12;
          b1 = 0.92 * b1 + white * 0.25;
          b2 = 0.65 * b2 + white * 0.45;
          const pink = (b0 + b1 + b2 + white * 0.18) * 0.35;
          const env = Math.sin(Math.PI * t) * Math.pow(1 - t, 1.4);
          grabData[i] = pink * env * 0.28;
        }
        const grabSrc = ac.createBufferSource();
        grabSrc.buffer = grabBuf;
        const grabBp = ac.createBiquadFilter();
        grabBp.type = 'bandpass';
        grabBp.frequency.setValueAtTime(1650 * pitchVar, now);
        grabBp.frequency.exponentialRampToValueAtTime(980 * pitchVar, now + grabDur);
        grabBp.Q.setValueAtTime(1.8, now);
        grabSrc.connect(grabBp);
        grabBp.connect(ac.destination);
        grabSrc.start(now);
        return;
      }

      // Full realistic magazine page turn (~0.48s)
      const dur = 0.46 + Math.random() * 0.05;
      const totalSamples = Math.round(ac.sampleRate * dur);
      const buffer = ac.createBuffer(1, totalSamples, ac.sampleRate);
      const data = buffer.getChannelData(0);

      // Paul Kellet pink-noise filter state + fibrous micro-crackle
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0;

      for (let i = 0; i < totalSamples; i++) {
        const t = i / totalSamples; // Normalized time [0..1]
        const white = Math.random() * 2 - 1;

        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.045;
        b6 = white * 0.115926;

        // 1) Initial finger-lift corner crinkle (peaks at t ~ 0.05)
        const liftEnv = Math.exp(-Math.pow((t - 0.045) / 0.032, 2)) * 0.55;

        // 2) Main arching paper slide / air whoosh (bell curve peaking around t ~ 0.36)
        const slideEnv =
          Math.pow(Math.sin(Math.PI * Math.min(1, t / 0.82)), 1.35) *
          (0.78 + 0.22 * Math.sin(t * 38));

        // 3) Trailing paper settle brush as the sheet flattens onto the stack (t ~ 0.76)
        const settleBrushEnv = Math.exp(-Math.pow((t - 0.76) / 0.07, 2)) * 0.65;

        // Subtle paper fiber micro-grain
        const fiberGrain = 0.88 + 0.12 * Math.sin(i * 0.043) * Math.cos(i * 0.017);

        data[i] = pink * (liftEnv + slideEnv + settleBrushEnv) * fiberGrain * 1.45;
      }

      // Layer A: Sliding paper friction & air whoosh (formant bandpass sweep + warm lowpass)
      const noiseSrc = ac.createBufferSource();
      noiseSrc.buffer = buffer;

      const bandpass = ac.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.Q.setValueAtTime(1.15, now);
      bandpass.frequency.setValueAtTime(540 * pitchVar, now);
      bandpass.frequency.exponentialRampToValueAtTime(1480 * pitchVar, now + dur * 0.36);
      bandpass.frequency.exponentialRampToValueAtTime(490 * pitchVar, now + dur * 0.82);
      bandpass.frequency.exponentialRampToValueAtTime(340 * pitchVar, now + dur);

      const lowpass = ac.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(2900 * pitchVar, now);
      lowpass.frequency.exponentialRampToValueAtTime(1600 * pitchVar, now + dur);

      const mainGain = ac.createGain();
      mainGain.gain.setValueAtTime(0.95, now);

      noiseSrc.connect(bandpass);
      bandpass.connect(lowpass);
      lowpass.connect(mainGain);
      mainGain.connect(ac.destination);
      noiseSrc.start(now);

      // Layer B: Crisp high-frequency paper edge snap at the start + spine bow warmth
      const crispSrc = ac.createBufferSource();
      crispSrc.buffer = buffer;

      const highBp = ac.createBiquadFilter();
      highBp.type = 'bandpass';
      highBp.Q.setValueAtTime(2.2, now);
      highBp.frequency.setValueAtTime(2600 * pitchVar, now);
      highBp.frequency.exponentialRampToValueAtTime(1150 * pitchVar, now + dur * 0.55);

      const crispGain = ac.createGain();
      crispGain.gain.setValueAtTime(0.32, now);
      crispGain.gain.exponentialRampToValueAtTime(0.08, now + dur * 0.45);
      crispGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      crispSrc.connect(highBp);
      highBp.connect(crispGain);
      crispGain.connect(ac.destination);
      crispSrc.start(now);

      // Layer C: Soft page-settle air cushion thump when the page lands on the opposing stack
      const thudTime = now + dur * 0.72;
      const thudOsc = ac.createOscillator();
      const thudGain = ac.createGain();
      thudOsc.type = 'triangle';
      thudOsc.frequency.setValueAtTime(112 * pitchVar, thudTime);
      thudOsc.frequency.exponentialRampToValueAtTime(38 * pitchVar, thudTime + 0.095);

      thudGain.gain.setValueAtTime(0.0001, now);
      thudGain.gain.setValueAtTime(0.0001, thudTime);
      thudGain.gain.linearRampToValueAtTime(0.11, thudTime + 0.012);
      thudGain.gain.exponentialRampToValueAtTime(0.0001, thudTime + 0.11);

      const thudLp = ac.createBiquadFilter();
      thudLp.type = 'lowpass';
      thudLp.frequency.setValueAtTime(180, thudTime);

      thudOsc.connect(thudLp);
      thudLp.connect(thudGain);
      thudGain.connect(ac.destination);
      thudOsc.start(thudTime);
      thudOsc.stop(thudTime + 0.12);
    } catch {
      // Audio optional
    }
  }, []);

  // Construct individual page element (PDF Image or Rich Permanent Editorial Layouts)
  const mkPage = useCallback(
    (i: number, side: 'l' | 'r', mir: boolean, isBackFlapInSingle = false): HTMLElement => {
      const eng = engineRef.current;
      const d = document.createElement('div');
      const p = i >= 0 && i < eng.pages.length ? eng.pages[i] : undefined;
      d.className = 'flipbook-pg ' + side + (p ? '' : ' e');
      if (mir) d.style.transform = 'scaleX(-1)';

      // Empty slot outside Front Cover (left of page 1) or outside Back Cover (right of page 74)
      if (!p) {
        d.innerHTML = '';
        return d;
      }

      const backFlapOverlay = isBackFlapInSingle
        ? `<div class="absolute inset-0 bg-[#F5ECE0]/82 backdrop-blur-[1px] pointer-events-none z-30"></div>`
        : '';

      // 1. Uploaded PDF / Full-Page Image Override
      if (p.pdfImageUrl && !p.pdfImageUrl.startsWith('pdf-pages/')) {
        d.innerHTML = `
          <div class="relative w-full h-full bg-[#FFF9F2] flex items-center justify-center overflow-hidden select-none">
            <img src="${p.pdfImageUrl}" alt="${escapeHtml(p.title || `Page ${p.pageNumber}`)}" class="w-full h-full object-cover pointer-events-none block" onerror="this.onerror=null;this.src='${rithuCoverImg}';" />
            ${backFlapOverlay}
          </div>
        `;
        return d;
      }

      const tData = p.templateData;
      const variant = tData?.layoutVariant;
      const pageNum = p.pageNumber;

      // 2. FRONT COVER (Page 1 — 'cover-2025')
      if (variant === 'cover-2025' || p.type === 'cover' || i === 0) {
        const coverImg = tData?.image || rithuCoverImg;
        d.innerHTML = `
          <div class="relative w-full h-full bg-[#18070B] text-[#FFF9F2] overflow-hidden select-none">
            <img src="${coverImg}" alt="Rithu Front Cover" class="w-full h-full object-cover object-center pointer-events-none" />
            ${backFlapOverlay}
          </div>
        `;
        return d;
      }

      // 3. BACK COVER (Page 74 — 'back-2025')
      if (variant === 'back-2025' || p.type === 'back-cover' || i === eng.pages.length - 1) {
        const backImg = tData?.image || cemCampusSunriseImg;
        d.innerHTML = `
          <div class="relative w-full h-full bg-[#120609] text-[#FFF9F2] flex flex-col justify-between p-5 sm:p-7 overflow-hidden select-none">
            <div class="absolute inset-0 z-0">
              <img src="${backImg}" alt="Rithu Back Cover" class="w-full h-full object-cover object-center opacity-55" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#0D0306] via-[#18060B]/70 to-[#0D0306]/85"></div>
            </div>
            <div class="absolute inset-2.5 border border-[#F3E6D5]/25 rounded-xs pointer-events-none z-10"></div>

            <div class="relative z-10 flex flex-col items-center text-center pt-3">
              <div class="w-9 h-9 rounded-full bg-[#800020]/90 border border-[#F3E6D5]/40 flex items-center justify-center text-[#FFF9F2] font-serif font-bold text-xs mb-2 shadow-lg">
                CEM
              </div>
              <span class="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[#F3E6D5]/80">
                ${escapeHtml(tData?.header || 'College Magazine 2025')}
              </span>
            </div>

            <div class="relative z-10 flex flex-col items-center text-center my-auto px-3">
              <h2 class="text-[28px] sm:text-[36px] font-bold tracking-[0.18em] text-[#FFF9F2] font-serif">
                ${escapeHtml(tData?.title || 'CEM')}
              </h2>
              <div class="w-8 h-[1.5px] bg-[#D45060] my-2.5"></div>
              <p class="text-[10px] sm:text-[11.5px] text-[#F3E6D5]/90 italic leading-relaxed max-w-[220px]">
                "Words and echoes that linger through the mist and hills of Munnar."
              </p>
            </div>

            <div class="relative z-10 flex items-center justify-between text-[8px] sm:text-[9px] text-[#F3E6D5]/80 tracking-wider pt-2.5 border-t border-[#F3E6D5]/20">
              <span>${escapeHtml(tData?.footerPrimary || 'College of Engineering Munnar')}</span>
              <span class="font-mono text-[#D45060]">${escapeHtml(tData?.footerSecondary || 'rithu-ruby.vercel.app')}</span>
            </div>
            ${backFlapOverlay}
          </div>
        `;
        return d;
      }

      // 4. QUOTE WINDOW (Page 2 — B. Oakman Quote & Window Sketch)
      if (variant === 'quote-window') {
        d.innerHTML = `
          <div class="relative w-full h-full bg-[#FAF6F0] text-[#1F040A] flex flex-col items-center justify-between p-5 sm:p-8 overflow-hidden select-none">
            <div class="w-full flex justify-between items-center text-[8px] tracking-[0.2em] uppercase text-[#5C3A42]/60">
              <span>RITHU · PROLOGUE</span>
              <span>02</span>
            </div>
            <div class="my-auto flex flex-col items-center text-center px-3">
              <svg class="w-24 h-28 sm:w-28 sm:h-32 text-[#2B1810]/75 mb-5" viewBox="0 0 120 150" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20 140 V55 C20 28 40 12 60 12 C80 12 100 28 100 55 V140" />
                <rect x="15" y="140" width="90" height="5" />
                <line x1="60" y1="12" x2="60" y2="140" />
                <line x1="20" y1="75" x2="100" y2="75" />
                <line x1="20" y1="108" x2="100" y2="108" />
                <path d="M22 45 Q38 68 25 115" stroke-dasharray="2 2" />
                <path d="M98 45 Q82 68 95 115" stroke-dasharray="2 2" />
                <circle cx="44" cy="38" r="5" stroke-width="1" />
              </svg>
              <p class="text-[11px] sm:text-[13px] italic font-serif leading-relaxed text-[#2B1810] whitespace-pre-line max-w-[240px]">
                ${escapeHtml(tData?.pullQuote)}
              </p>
              <span class="mt-3 text-[10px] sm:text-[11px] font-semibold tracking-widest uppercase text-[#800020]">
                ${escapeHtml(tData?.pullQuoteCite || '— B. Oakman')}
              </span>
            </div>
            <div class="w-full text-center text-[8px] text-[#5C3A42]/50 tracking-widest uppercase">
              COLLEGE OF ENGINEERING MUNNAR
            </div>
            ${backFlapOverlay}
          </div>
        `;
        return d;
      }

      // 5. FULL PHOTO (Page 3 — Aerial Campus Sunrise)
      if (variant === 'full-photo') {
        const photoUrl = tData?.image || cemCampusSunriseImg;
        d.innerHTML = `
          <div class="relative w-full h-full bg-[#0F171E] text-white flex flex-col justify-between p-5 sm:p-7 overflow-hidden select-none">
            <img src="${photoUrl}" alt="${escapeHtml(p.title)}" class="absolute inset-0 w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/75"></div>
            <div class="relative z-10 flex flex-col items-center text-center pt-3">
              <span class="text-[8px] tracking-[0.3em] uppercase text-white/80 mb-1">THE HIGH RANGE CAMPUS</span>
              <h2 class="text-[16px] sm:text-[21px] font-bold tracking-[0.16em] uppercase text-white font-serif leading-snug whitespace-pre-line drop-shadow-md">
                ${escapeHtml(tData?.title || p.title)}
              </h2>
            </div>
            <div class="relative z-10 flex items-center justify-between text-[8px] sm:text-[9px] text-white/80 uppercase tracking-widest">
              <span>MUNNAR · IDUKKI · KERALA</span>
              <span class="font-mono">${pageNum}</span>
            </div>
            ${backFlapOverlay}
          </div>
        `;
        return d;
      }

      // 6. RED POSTER (Page 4 — "LET'S TALK")
      if (variant === 'red-poster') {
        const posterImg = tData?.image;
        d.innerHTML = `
          <div class="relative w-full h-full bg-[#8B1116] text-[#FFF9F2] flex flex-col justify-between p-5 sm:p-7 overflow-hidden select-none">
            ${
              posterImg
                ? `<img src="${posterImg}" alt="Let's Talk" class="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-45" />`
                : ''
            }
            <div class="absolute inset-0 bg-gradient-to-b from-[#6B090E]/80 via-[#8B1116]/60 to-[#3D0407]/95"></div>
            <div class="relative z-10 flex justify-between items-center text-[8px] tracking-[0.25em] uppercase text-[#FFF9F2]/75">
              <span>CAMPUS VOICE</span>
              <span>0${pageNum}</span>
            </div>
            <div class="relative z-10 my-auto flex flex-col gap-4">
              <blockquote class="text-[12px] sm:text-[14.5px] font-serif italic leading-relaxed text-[#FFF9F2] whitespace-pre-line border-l-2 border-[#FFF9F2]/70 pl-3">
                ${escapeHtml(tData?.pullQuote)}
              </blockquote>
            </div>
            <div class="relative z-10 pt-2 border-t border-[#FFF9F2]/25 flex items-end justify-between">
              <h2 class="text-[24px] sm:text-[32px] font-black tracking-[0.08em] uppercase text-[#FFF9F2] leading-none">
                ${escapeHtml(tData?.title || "LET'S TALK")}
              </h2>
              <span class="text-[9px] font-mono opacity-75">${pageNum}</span>
            </div>
            ${backFlapOverlay}
          </div>
        `;
        return d;
      }

      // 7. OFFICIAL MESSAGES (Pages 5–11)
      if (variant === 'message') {
        const paras = (tData?.paragraphs || [])
          .map(
            (pr) =>
              `<p class="text-[8.8px] sm:text-[10px] leading-[1.48] text-[#281519] mb-1.5">${escapeHtml(pr)}</p>`
          )
          .join('');
        d.innerHTML = `
          <div class="relative w-full h-full bg-[#FAF6F0] text-[#1F040A] flex flex-col justify-between p-4 sm:p-6 overflow-hidden select-none">
            <div class="flex flex-col gap-1 border-b border-[#800020]/20 pb-2">
              <div class="flex items-center justify-between text-[7.5px] sm:text-[8.5px] tracking-[0.2em] uppercase text-[#800020] font-semibold">
                <span>${escapeHtml(tData?.category || 'MESSAGES')}</span>
                <span class="font-mono">P. ${pageNum}</span>
              </div>
              <h2 class="text-[13px] sm:text-[16px] font-bold text-[#1F040A] font-serif leading-tight">
                ${escapeHtml(tData?.title || p.title)}
              </h2>
              ${
                tData?.header
                  ? `<p class="text-[7px] sm:text-[7.8px] text-[#5C3A42] leading-tight">${escapeHtml(tData.header)}</p>`
                  : ''
              }
            </div>

            <div class="flex-1 flex flex-col justify-center py-2 overflow-hidden">
              ${
                tData?.pullQuote
                  ? `<blockquote class="mb-2 p-2 bg-[#F3E6D5] border-l-2 border-[#800020] text-[8.5px] sm:text-[9.5px] font-malayalam-serif font-semibold text-[#800020] leading-snug">${escapeHtml(tData.pullQuote)}</blockquote>`
                  : ''
              }
              <div class="overflow-hidden">
                ${paras}
              </div>
            </div>

            <div class="pt-2 border-t border-[#800020]/15 flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-[10px] sm:text-[11px] font-bold text-[#800020] font-serif">
                  ${escapeHtml(tData?.author)}
                </span>
                <span class="text-[7.5px] sm:text-[8.5px] uppercase tracking-wider text-[#5C3A42] font-medium">
                  ${escapeHtml(tData?.authorRole)}
                </span>
              </div>
              <span class="text-[8.5px] font-mono font-bold text-[#800020]/70">${pageNum}</span>
            </div>
            ${backFlapOverlay}
          </div>
        `;
        return d;
      }

      // 8. EDITORIAL BOARD 2026 (Page 13)
      if (variant === 'editorial-board') {
        const boardImg = tData?.image || '/editorial-board-2026.jpg';
        const membersHtml = (tData?.items || [])
          .map(
            (item) => `
              <div class="flex flex-col bg-[#1F080E]/80 border border-[#F3E6D5]/15 rounded px-1.5 py-1">
                <span class="text-[7.2px] sm:text-[8px] font-bold text-[#FFF9F2] truncate">${escapeHtml(item.title)}</span>
                <span class="text-[6.2px] sm:text-[7px] text-[#D45060] uppercase tracking-wider truncate">${escapeHtml(item.subtitle)}</span>
              </div>
            `
          )
          .join('');
        d.innerHTML = `
          <div class="relative w-full h-full bg-[#120408] text-[#FFF9F2] flex flex-col justify-between p-4 sm:p-5 overflow-hidden select-none">
            <div class="flex items-center justify-between border-b border-[#F3E6D5]/15 pb-1.5">
              <h2 class="text-[12px] sm:text-[14px] font-bold tracking-[0.15em] uppercase text-[#FFF9F2] font-serif">
                ${escapeHtml(tData?.title || 'EDITORIAL BOARD 2026')}
              </h2>
              <span class="text-[8px] font-mono text-[#D45060]">P. ${pageNum}</span>
            </div>

            <div class="w-full h-[38%] my-1.5 rounded overflow-hidden border border-[#F3E6D5]/20 relative bg-black">
              <img src="${boardImg}" alt="Editorial Board 2026" class="w-full h-full object-cover object-top" />
            </div>

            <div class="grid grid-cols-2 gap-1 flex-1 content-start overflow-hidden">
              ${membersHtml}
            </div>

            <div class="pt-1 border-t border-[#F3E6D5]/15 flex justify-between text-[7.5px] text-[#F3E6D5]/60 uppercase tracking-widest">
              <span>RITHU · EDITORIAL TEAM</span>
              <span>${pageNum}</span>
            </div>
            ${backFlapOverlay}
          </div>
        `;
        return d;
      }

      // 9. SEASONAL DIVIDERS (Pages 14, 26, 48)
      if (variant === 'divider') {
        const bg = tData?.bgColor || '#F3E3C3';
        d.innerHTML = `
          <div class="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-8 overflow-hidden select-none" style="background-color: ${bg}; color: #1F040A;">
            <div class="w-full flex justify-between items-center text-[8px] tracking-[0.25em] uppercase opacity-60">
              <span>RITHU · SEASONS</span>
              <span>${pageNum}</span>
            </div>
            <div class="my-auto flex flex-col items-center text-center px-3">
              <span class="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-semibold text-[#800020] mb-2">
                ${escapeHtml(p.title)}
              </span>
              <div class="w-8 h-[1.5px] bg-[#800020]/50 mb-4"></div>
              <p class="text-[12px] sm:text-[14.5px] font-serif italic leading-relaxed text-[#1F040A] whitespace-pre-line max-w-[230px]">
                "${escapeHtml(tData?.pullQuote)}"
              </p>
            </div>
            <div class="w-full text-center text-[8px] tracking-[0.2em] uppercase opacity-50">
              COLLEGE OF ENGINEERING MUNNAR
            </div>
            ${backFlapOverlay}
          </div>
        `;
        return d;
      }

      // 10. CONTENTS PAGES (Pages 15, 27, 49)
      if (variant === 'contents') {
        const bg = tData?.bgColor || '#D9822B';
        const bgImg = tData?.image;
        const rows = (tData?.items || [])
          .map(
            (item, idx) => `
              <div class="flex items-baseline justify-between gap-2 py-1 border-b ${
                bgImg ? 'border-white/20 text-white' : 'border-black/15 text-[#1F040A]'
              }">
                <span class="text-[8.2px] sm:text-[9.5px] font-medium truncate">
                  <strong class="opacity-65 mr-1">${idx + 1}.</strong>${escapeHtml(item.title)}
                </span>
                <span class="text-[7.5px] sm:text-[8.5px] font-mono font-semibold shrink-0 opacity-85">
                  ${escapeHtml(item.subtitle)}
                </span>
              </div>
            `
          )
          .join('');
        d.innerHTML = `
          <div class="relative w-full h-full flex flex-col justify-between p-5 sm:p-6 overflow-hidden select-none" style="background-color: ${bg};">
            ${
              bgImg
                ? `
                  <img src="${bgImg}" alt="Contents Background" class="absolute inset-0 w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-black/55"></div>
                `
                : ''
            }
            <div class="relative z-10 flex items-end justify-between border-b ${
              bgImg ? 'border-white/30 text-white' : 'border-black/20 text-[#1F040A]'
            } pb-2">
              <h2 class="text-[20px] sm:text-[26px] font-bold font-serif leading-none">
                ${escapeHtml(tData?.title || 'Contents')}
              </h2>
              <span class="text-[8px] uppercase tracking-widest font-mono opacity-80">P. ${pageNum}</span>
            </div>

            <div class="relative z-10 flex-1 flex flex-col justify-center overflow-hidden my-2">
              ${rows}
            </div>

            <div class="relative z-10 flex justify-between text-[7.5px] uppercase tracking-widest ${
              bgImg ? 'text-white/75' : 'text-[#1F040A]/70'
            }">
              <span>RITHU 2026</span>
              <span>${pageNum}</span>
            </div>
            ${backFlapOverlay}
          </div>
        `;
        return d;
      }

      // 11. TWO-COLUMN ARTICLES & STORIES (Pages 16, 28, 30, 50–52, 56, 58–59)
      if (variant === 'two-column') {
        const bg = tData?.bgColor || '#FAF6F0';
        const col1 = (tData?.columns?.[0] || [])
          .map(
            (pr) =>
              `<p class="text-[7.8px] sm:text-[8.8px] leading-[1.45] text-[#221417] mb-1.5 text-justify">${escapeHtml(pr)}</p>`
          )
          .join('');
        const col2 = (tData?.columns?.[1] || [])
          .map(
            (pr) =>
              `<p class="text-[7.8px] sm:text-[8.8px] leading-[1.45] text-[#221417] mb-1.5 text-justify">${escapeHtml(pr)}</p>`
          )
          .join('');

        d.innerHTML = `
          <div class="relative w-full h-full flex flex-col justify-between p-4 sm:p-5 overflow-hidden select-none" style="background-color: ${bg}; color: #1F040A;">
            <header class="border-b border-[#1F040A]/15 pb-1.5">
              <h2 class="text-[12px] sm:text-[14.5px] font-bold text-[#1F040A] font-serif leading-snug">
                ${escapeHtml(tData?.title || p.title)}
              </h2>
              ${
                tData?.author
                  ? `<div class="flex items-center gap-1.5 mt-0.5 text-[7.5px] sm:text-[8.5px] text-[#800020] font-semibold">
                      <span>${escapeHtml(tData.author)}</span>
                      ${tData.authorRole ? `<span class="opacity-70">· ${escapeHtml(tData.authorRole)}</span>` : ''}
                    </div>`
                  : ''
              }
            </header>

            <div class="flex-1 grid grid-cols-2 gap-2.5 py-2 overflow-hidden content-start">
              <div class="flex flex-col overflow-hidden">${col1}</div>
              <div class="flex flex-col overflow-hidden">${col2}</div>
            </div>

            <footer class="pt-1 border-t border-[#1F040A]/10 flex items-center justify-between text-[7.5px] text-[#5C3A42] font-mono">
              <span>RITHU · LITERARY ARCHIVE</span>
              <span class="font-bold text-[#800020]">${pageNum}</span>
            </footer>
            ${backFlapOverlay}
          </div>
        `;
        return d;
      }

      // 12. ART GRID (Pages 24–25 — Beyond The Canvas)
      if (variant === 'art-grid') {
        const itemsHtml = (tData?.items || [])
          .slice(0, 6)
          .map(
            (item, idx) => `
              <div class="flex flex-col bg-white/90 rounded border border-[#E6D5C1] p-1.5 shadow-2xs overflow-hidden">
                <div class="w-full flex-1 min-h-[38px] rounded-xs overflow-hidden bg-[#201015] flex items-center justify-center relative">
                  ${
                    item.image
                      ? `<img src="${item.image}" alt="${escapeHtml(item.title)}" class="w-full h-full object-cover" />`
                      : `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#3A101D] to-[#120609] text-[#F3E6D5] text-[8px] font-serif italic px-1 text-center">${escapeHtml(item.title)}</div>`
                  }
                  <span class="absolute top-0.5 right-0.5 px-1 bg-black/60 text-white text-[6px] font-mono rounded">0${idx + 1}</span>
                </div>
                <span class="text-[7.2px] sm:text-[8px] font-bold text-[#1F040A] truncate mt-1">${escapeHtml(item.title)}</span>
                <span class="text-[6.2px] sm:text-[7px] text-[#800020] truncate">${escapeHtml(item.subtitle)}</span>
              </div>
            `
          )
          .join('');

        d.innerHTML = `
          <div class="relative w-full h-full bg-[#F4ECE1] text-[#1F040A] flex flex-col justify-between p-4 sm:p-5 overflow-hidden select-none">
            <header class="flex items-center justify-between border-b border-[#800020]/20 pb-1.5">
              <div>
                <span class="text-[7px] uppercase tracking-[0.2em] text-[#800020] font-semibold block">STUDENT ART GALLERY</span>
                <h2 class="text-[13px] sm:text-[16px] font-bold font-serif text-[#1F040A] leading-tight">
                  ${escapeHtml(tData?.title || p.title)}
                </h2>
              </div>
              <span class="text-[8px] font-mono font-bold text-[#800020]">P. ${pageNum}</span>
            </header>

            <div class="flex-1 grid grid-cols-2 gap-1.5 py-2 overflow-hidden">
              ${itemsHtml}
            </div>

            <footer class="pt-1 border-t border-[#800020]/15 flex justify-between text-[7.5px] text-[#5C3A42]">
              <span>BEYOND THE CANVAS · CEM</span>
              <span class="font-mono font-bold">${pageNum}</span>
            </footer>
            ${backFlapOverlay}
          </div>
        `;
        return d;
      }

      // 13. FILMSTRIP CHRONICLES (Pages 42–47 — Life @ CEM, Iliad'26, Holi & Iftar, Onam, Elysion'26)
      if (variant === 'filmstrip') {
        const heroImg = tData?.image || cemCampusSunriseImg;
        const framesHtml = (tData?.items || [])
          .map(
            (item, idx) => `
              <div class="relative rounded-xs overflow-hidden border border-white/20 bg-[#1B1618] flex flex-col justify-end p-1.5">
                <img src="${heroImg}" alt="${escapeHtml(item.title)}" class="absolute inset-0 w-full h-full object-cover opacity-55" style="object-position: ${idx * 30}% ${idx * 25}%;" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
                <span class="relative z-10 text-[7.5px] sm:text-[8.5px] font-bold text-[#FFF9F2] leading-tight">${escapeHtml(item.title)}</span>
                <span class="relative z-10 text-[6.5px] text-[#D45060] uppercase tracking-wider">${escapeHtml(item.subtitle)}</span>
              </div>
            `
          )
          .join('');

        d.innerHTML = `
          <div class="relative w-full h-full bg-[#110D0E] text-[#FFF9F2] flex flex-col justify-between p-4 sm:p-5 overflow-hidden select-none">
            <div class="flex items-center justify-between border-b border-white/15 pb-1.5">
              <div>
                <span class="text-[7px] uppercase tracking-[0.25em] text-[#D45060] font-semibold block">
                  ${escapeHtml(tData?.subtitle || 'CAMPUS CHRONICLES')}
                </span>
                <h2 class="text-[15px] sm:text-[18px] font-bold font-serif text-[#FFF9F2] leading-tight">
                  ${escapeHtml(tData?.title || p.title)}
                </h2>
              </div>
              <span class="text-[8px] font-mono text-[#F3E6D5]/70">FILM · ${pageNum}</span>
            </div>

            <div class="w-full h-[36%] my-1.5 rounded overflow-hidden border border-white/20 relative">
              <img src="${heroImg}" alt="${escapeHtml(p.title)}" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2">
                <span class="text-[8px] uppercase tracking-widest text-[#FFF9F2]/90 font-mono">CEM ARCHIVE REEL · 35MM</span>
              </div>
            </div>

            <div class="flex-1 grid grid-cols-2 gap-1.5 overflow-hidden">
              ${framesHtml}
            </div>

            <div class="pt-1.5 border-t border-white/15 flex justify-between text-[7px] font-mono text-[#F3E6D5]/60">
              <span>◀ ● ● ● ● ● ● ● ● ▶</span>
              <span>P. ${pageNum}</span>
            </div>
            ${backFlapOverlay}
          </div>
        `;
        return d;
      }

      // 14. POLAROID PHOTOGRAPHY GRID (Pages 60–61 — Through Our Lens)
      if (variant === 'polaroid-grid') {
        const cardsHtml = (tData?.items || [])
          .slice(0, 4)
          .map(
            (item) => `
              <div class="bg-[#FFFDF9] p-1.5 pb-2 rounded-xs shadow-md border border-[#E6D5C1] flex flex-col justify-between">
                <div class="w-full flex-1 min-h-[46px] bg-[#1A1416] overflow-hidden rounded-2xs">
                  <img src="${item.image || cemCampusSunriseImg}" alt="${escapeHtml(item.title)}" class="w-full h-full object-cover" />
                </div>
                <div class="mt-1">
                  <div class="text-[7.2px] sm:text-[8px] font-bold text-[#1F040A] truncate font-serif">${escapeHtml(item.title)}</div>
                  <div class="text-[6.2px] sm:text-[6.8px] text-[#800020] truncate">${escapeHtml(item.subtitle)}</div>
                </div>
              </div>
            `
          )
          .join('');

        d.innerHTML = `
          <div class="relative w-full h-full bg-[#1C1417] text-[#FFF9F2] flex flex-col justify-between p-4 sm:p-5 overflow-hidden select-none">
            <header class="flex items-center justify-between border-b border-[#F3E6D5]/15 pb-1.5">
              <div>
                <span class="text-[7px] uppercase tracking-[0.25em] text-[#D45060] font-semibold block">PHOTOGRAPHY SHOWCASE</span>
                <h2 class="text-[14px] sm:text-[17px] font-bold font-serif text-[#FFF9F2]">
                  ${escapeHtml(tData?.title || 'Through Our Lens')}
                </h2>
              </div>
              <span class="text-[8px] font-mono text-[#F3E6D5]/70">${pageNum}</span>
            </header>

            <div class="flex-1 grid grid-cols-2 gap-2 py-2 overflow-hidden">
              ${cardsHtml}
            </div>

            <footer class="pt-1 border-t border-[#F3E6D5]/15 flex justify-between text-[7.5px] text-[#F3E6D5]/60 font-mono">
              <span>THROUGH OUR LENS · CEM</span>
              <span>${pageNum}</span>
            </footer>
            ${backFlapOverlay}
          </div>
        `;
        return d;
      }

      // 15. THE CEM COLLECTIVE SPREAD (Pages 62–63)
      if (variant === 'collective-left' || variant === 'collective-right') {
        const bgImg = tData?.image || cemCampusSunriseImg;
        const isLeftSpread = variant === 'collective-left';
        d.innerHTML = `
          <div class="relative w-full h-full bg-[#140A0D] text-[#FFF9F2] flex flex-col justify-between p-5 sm:p-7 overflow-hidden select-none">
            <img src="${bgImg}" alt="The CEM Collective" class="absolute inset-0 w-full h-full object-cover" style="object-position: ${
              isLeftSpread ? 'left center' : 'right center'
            };" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/50"></div>

            <div class="relative z-10 flex justify-between text-[8px] uppercase tracking-[0.25em] text-[#F3E6D5]/80">
              <span>${isLeftSpread ? 'COMMUNITIES & CLUBS' : 'COLLEGE OF ENGINEERING MUNNAR'}</span>
              <span class="font-mono">${pageNum}</span>
            </div>

            <div class="relative z-10 my-auto">
              ${
                isLeftSpread
                  ? `<h2 class="text-[26px] sm:text-[34px] font-bold font-serif leading-tight text-[#FFF9F2] whitespace-pre-line drop-shadow-lg">${escapeHtml(
                      tData?.title || 'The CEM\nCollective'
                    )}</h2>`
                  : `<blockquote class="text-[12px] sm:text-[14px] font-serif italic leading-relaxed text-[#F3E6D5] border-l-2 border-[#D45060] pl-3 whitespace-pre-line">${escapeHtml(
                      tData?.pullQuote
                    )}</blockquote>`
              }
            </div>

            <div class="relative z-10 text-[8px] uppercase tracking-widest text-[#F3E6D5]/70">
              <span>RITHU · STUDENT COLLECTIVE</span>
            </div>
            ${backFlapOverlay}
          </div>
        `;
        return d;
      }

      // 16. CAMPUS CLUBS (Pages 64–69 — IEDC, TinkerHub, IEEE, NSS, 3DOT, Music Club)
      if (variant === 'club') {
        const clubImg = tData?.image || cemCampusSunriseImg;
        const col1 = (tData?.columns?.[0] || [])
          .map(
            (pr) =>
              `<p class="text-[7.6px] sm:text-[8.6px] leading-[1.42] text-[#241418] mb-1.5 whitespace-pre-line">${escapeHtml(pr)}</p>`
          )
          .join('');
        const col2 = (tData?.columns?.[1] || [])
          .map(
            (pr) =>
              `<p class="text-[7.6px] sm:text-[8.6px] leading-[1.42] text-[#241418] mb-1.5 whitespace-pre-line">${escapeHtml(pr)}</p>`
          )
          .join('');

        d.innerHTML = `
          <div class="relative w-full h-full bg-[#FAF6F0] text-[#1F040A] flex flex-col justify-between p-4 sm:p-5 overflow-hidden select-none">
            <div class="relative w-full h-[30%] rounded overflow-hidden border border-[#800020]/20 mb-2">
              <img src="${clubImg}" alt="${escapeHtml(tData?.title)}" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-2.5">
                <h2 class="text-[14px] sm:text-[17px] font-bold text-[#FFF9F2] font-serif leading-none">
                  ${escapeHtml(tData?.title || p.title)}
                </h2>
                <span class="text-[7.2px] sm:text-[8px] text-[#F3E6D5]/90 mt-0.5 truncate">
                  ${escapeHtml(tData?.subtitle)}
                </span>
              </div>
            </div>

            <div class="flex-1 grid grid-cols-2 gap-2 overflow-hidden content-start">
              <div class="flex flex-col overflow-hidden">${col1}</div>
              <div class="flex flex-col overflow-hidden">${col2}</div>
            </div>

            <footer class="pt-1 border-t border-[#800020]/15 flex justify-between text-[7.5px] text-[#5C3A42] font-mono">
              <span>THE CEM COLLECTIVE</span>
              <span class="font-bold text-[#800020]">${pageNum}</span>
            </footer>
            ${backFlapOverlay}
          </div>
        `;
        return d;
      }

      // 17. GROUP PHOTOS & BATCHES (Pages 70–72 — Pillars of CEM, Batches 2022–2030, Graduating Cohorts)
      if (variant === 'group-photos') {
        const items = tData?.items || [];
        const photosHtml = items
          .map(
            (item) => `
              <div class="relative rounded overflow-hidden border border-[#800020]/20 bg-[#1B0C10] flex flex-col justify-end p-2 min-h-[48px]">
                <img src="${item.image || cemCampusSunriseImg}" alt="${escapeHtml(item.title)}" class="absolute inset-0 w-full h-full object-cover opacity-70" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>
                <span class="relative z-10 text-[8px] sm:text-[9px] font-bold text-[#FFF9F2] leading-tight">${escapeHtml(item.title)}</span>
                <span class="relative z-10 text-[6.8px] sm:text-[7.5px] text-[#F3E6D5]/80">${escapeHtml(item.subtitle)}</span>
              </div>
            `
          )
          .join('');

        d.innerHTML = `
          <div class="relative w-full h-full bg-[#FAF5EE] text-[#1F040A] flex flex-col justify-between p-4 sm:p-5 overflow-hidden select-none">
            <header class="border-b border-[#800020]/20 pb-1.5 flex items-center justify-between">
              <div>
                <h2 class="text-[13px] sm:text-[16px] font-bold font-serif text-[#1F040A] leading-tight">
                  ${escapeHtml(tData?.title || p.title)}
                </h2>
                <p class="text-[7.5px] sm:text-[8.5px] text-[#5C3A42]">${escapeHtml(tData?.subtitle)}</p>
              </div>
              <span class="text-[8px] font-mono font-bold text-[#800020]">P. ${pageNum}</span>
            </header>

            <div class="flex-1 grid ${items.length <= 2 ? 'grid-cols-1' : 'grid-cols-2'} gap-1.5 py-2 overflow-hidden">
              ${photosHtml}
            </div>

            <footer class="pt-1 border-t border-[#800020]/15 flex justify-between text-[7.5px] text-[#5C3A42] font-mono">
              <span>CEM ARCHIVES · 2025–26</span>
              <span>${pageNum}</span>
            </footer>
            ${backFlapOverlay}
          </div>
        `;
        return d;
      }

      // 18. COLLEGE UNION 2026–27 GRID (Page 73)
      if (variant === 'union-grid') {
        const membersHtml = (tData?.items || [])
          .map(
            (item) => `
              <div class="flex flex-col items-center text-center bg-[#FFF9F2] border border-[#E6D5C1] rounded p-1.5 shadow-2xs">
                <div class="w-6 h-6 rounded-full bg-[#800020] text-[#FFF9F2] flex items-center justify-center text-[8px] font-bold font-serif mb-0.5">
                  ${escapeHtml(item.title.charAt(0))}
                </div>
                <span class="text-[7px] sm:text-[7.8px] font-bold text-[#1F040A] leading-tight truncate w-full">${escapeHtml(item.title)}</span>
                <span class="text-[6px] sm:text-[6.8px] text-[#800020] uppercase tracking-wider truncate w-full">${escapeHtml(item.subtitle)}</span>
              </div>
            `
          )
          .join('');

        d.innerHTML = `
          <div class="relative w-full h-full bg-[#F3E6D5] text-[#1F040A] flex flex-col justify-between p-4 sm:p-5 overflow-hidden select-none">
            <header class="border-b border-[#800020]/25 pb-1.5 flex items-center justify-between">
              <div>
                <span class="text-[7px] uppercase tracking-[0.22em] text-[#800020] font-semibold block">STUDENT GOVERNANCE</span>
                <h2 class="text-[13px] sm:text-[16px] font-bold font-serif text-[#1F040A]">
                  ${escapeHtml(tData?.title || 'College Union 2026–27')}
                </h2>
              </div>
              <span class="text-[8px] font-mono font-bold text-[#800020]">P. ${pageNum}</span>
            </header>

            <div class="flex-1 grid grid-cols-3 gap-1.5 py-2 content-center overflow-hidden">
              ${membersHtml}
            </div>

            <footer class="pt-1 border-t border-[#800020]/20 flex justify-between text-[7.5px] text-[#5C3A42] font-mono">
              <span>COLLEGE UNION · CEM</span>
              <span>${pageNum}</span>
            </footer>
            ${backFlapOverlay}
          </div>
        `;
        return d;
      }

      // 19. POEMS & LITERARY PAGES (Default / 'poem' — Malayalam, Hindi & English Poems/Essays)
      const bg = tData?.bgColor || '#FFF9F2';
      const txtColor = tData?.textColor || '#1C0D11';
      const poemBgImg = tData?.image;
      const stanzasHtml = (tData?.paragraphs || [])
        .map(
          (stanza) =>
            `<p class="text-[8.8px] sm:text-[10.2px] leading-[1.52] whitespace-pre-line mb-2 font-malayalam-serif">${escapeHtml(
              stanza
            )}</p>`
        )
        .join('');

      d.innerHTML = `
        <div class="relative w-full h-full flex flex-col justify-between p-4 sm:p-6 overflow-hidden select-none" style="background-color: ${bg}; color: ${txtColor};">
          ${
            poemBgImg
              ? `
                <img src="${poemBgImg}" alt="${escapeHtml(p.title)}" class="absolute inset-0 w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/55"></div>
              `
              : ''
          }
          <header class="relative z-10 flex items-center justify-between pb-1.5 border-b" style="border-color: ${
            poemBgImg ? 'rgba(255,255,255,0.22)' : 'rgba(128,0,32,0.15)'
          };">
            <span class="text-[7.5px] uppercase tracking-[0.2em] opacity-75 font-semibold truncate max-w-[160px]">
              ${escapeHtml(tData?.category || 'RITHU · LITERATURE')}
            </span>
            <span class="text-[8px] font-mono font-bold opacity-80">${pageNum}</span>
          </header>

          <article class="relative z-10 my-auto flex flex-col gap-1.5 py-2 overflow-hidden">
            ${
              tData?.title || p.title
                ? `<h2 class="text-[14px] sm:text-[17px] font-bold font-malayalam-serif leading-snug mb-1">${escapeHtml(
                    tData?.title || p.title
                  )}</h2>`
                : ''
            }
            <div class="overflow-hidden">
              ${stanzasHtml}
            </div>
          </article>

          <footer class="relative z-10 pt-1.5 border-t flex items-center justify-between text-[8px]" style="border-color: ${
            poemBgImg ? 'rgba(255,255,255,0.22)' : 'rgba(128,0,32,0.15)'
          };">
            <div class="flex flex-col">
              ${
                tData?.author
                  ? `<span class="font-bold text-[8.5px] sm:text-[9.5px]">${escapeHtml(tData.author)}</span>`
                  : '<span>Rithu 2026</span>'
              }
              ${
                tData?.authorRole
                  ? `<span class="text-[7px] uppercase tracking-wider opacity-75">${escapeHtml(tData.authorRole)}</span>`
                  : ''
              }
            </div>
            <span class="font-mono font-bold opacity-80">P. ${pageNum}</span>
          </footer>
          ${backFlapOverlay}
        </div>
      `;
      return d;
    },
    [editionInfo]
  );

  // Wrap page into positioned book half
  const wrapPage = useCallback(
    (
      i: number,
      side: 'l' | 'r',
      x: number,
      mir = false,
      isBackFlapInSingle = false
    ): HTMLDivElement => {
      const w = document.createElement('div');
      w.className = 'flipbook-w';
      w.style.left = x + 'px';
      w.append(mkPage(i, side, mir, isBackFlapInSingle));
      return w;
    },
    [mkPage]
  );

  // Book stage shift:
  // - In Mobile Single-Page View: always -25% so the single page slot [pw, 2*pw] is centered.
  // - In Laptop View: -25% on Front Cover (t === 0), +25% on Last Page (t === N), 0% on open dual spreads.
  const shiftBook = useCallback((t: number) => {
    const eng = engineRef.current;
    if (!bookRef.current) return;
    const x = eng.single ? -25 : t === 0 ? -25 : t === eng.N ? 25 : 0;
    const pan = touchStateRef.current.currentPan;
    bookRef.current.style.transform = `translateX(${x}%) translate3d(${pan.x}px, ${pan.y}px, 0) scale(${eng.zoom})`;
  }, []);

  // Refresh static page layers
  const refreshSpreads = useCallback(() => {
    const eng = engineRef.current;
    if (!bookRef.current) return;
    if (eng.sL) eng.sL.remove();
    if (eng.sR) eng.sR.remove();

    if (eng.single) {
      eng.sL = wrapPage(-1, 'l', 0);
      eng.sR = wrapPage(eng.s, 'r', eng.pw);
    } else {
      eng.sL = wrapPage(2 * eng.s - 1, 'l', 0);
      eng.sR = wrapPage(2 * eng.s, 'r', eng.pw);
    }
    bookRef.current.prepend(eng.sR, eng.sL);
    shiftBook(eng.s);
  }, [wrapPage, shiftBook]);

  // Update UI and controls
  const renderControls = useCallback(() => {
    const eng = engineRef.current;
    setCurrentSpreadIndex(eng.s);
    setTotalSpreads(eng.N);
    setIsSinglePageMode(eng.single);
    setCanGoPrev(eng.s > 0);
    setCanGoNext(eng.s < eng.N);

    if (trackRef.current && thumbRef.current) {
      const trackW = trackRef.current.clientWidth;
      const thumbW = 56;
      const maxL = Math.max(0, trackW - thumbW);
      const pos = eng.N > 0 ? (eng.s / eng.N) * maxL : 0;
      thumbRef.current.style.left = `${pos}px`;
    }
  }, []);

  // Terminate active curl overlay
  const endCurl = useCallback(() => {
    const eng = engineRef.current;
    if (eng.T) {
      eng.T.cv.remove();
      eng.T = null;
    }
    if (eng.sL) eng.sL.style.visibility = '';
    if (eng.sR) eng.sR.style.visibility = '';
  }, []);

  // Update clipping polygons, matrix reflection, and shadow angles in real-time
  const updateCurl = useCallback((P: [number, number]) => {
    const eng = engineRef.current;
    if (!eng.T) return;
    const { y0, E } = eng.T;
    const { pw, W, H } = eng;

    const dx = P[0] - pw;
    const dy = P[1] - y0;
    const dl = Math.hypot(dx, dy);
    if (dl > pw) {
      P = [pw + (dx * pw) / dl, y0 + (dy * pw) / dl];
    }
    eng.T.P = P;

    let vx = W - P[0];
    let vy = y0 - P[1];
    let vl = Math.hypot(vx, vy);
    if (vl < 0.5) {
      vx = 1;
      vy = 0;
      vl = 1;
    }
    const n = [vx / vl, vy / vl];
    const M = [(W + P[0]) / 2, (y0 + P[1]) / 2];
    const f = (q: [number, number], g: number) =>
      g * ((q[0] - M[0]) * n[0] + (q[1] - M[1]) * n[1]);

    const cut = (p: [number, number][], g: number) => {
      const o: [number, number][] = [];
      for (let i = 0; i < p.length; i++) {
        const a = p[i];
        const b = p[(i + 1) % p.length];
        const fa = f(a, g);
        const fb = f(b, g);
        if (fa >= 0) o.push(a);
        if (fa >= 0 !== fb >= 0) {
          const t = fa / (fa - fb);
          o.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
        }
      }
      return o;
    };

    const rect: [number, number][] = [
      [pw, 0],
      [W, 0],
      [W, H],
      [pw, H],
    ];
    const fo = cut(rect, 1);
    const un = cut(rect, -1);
    const fr: [number, number][] = fo.map((q) => {
      const k = 2 * f(q, 1);
      return [q[0] - k * n[0], q[1] - k * n[1]];
    });

    const cp = (pts: [number, number][]) =>
      pts.length < 3
        ? 'polygon(0 0)'
        : 'polygon(' +
          pts.map((q) => q[0].toFixed(1) + 'px ' + q[1].toFixed(1) + 'px').join(',') +
          ')';

    E.S.style.clipPath = cp(fo);
    E.A.style.clipPath = cp(un);
    E.F.style.clipPath = cp(fr);

    if (eng.single) {
      const flapAlpha = P[0] >= pw ? 1 : Math.max(0, P[0] / (pw * 0.85));
      E.F.style.opacity = flapAlpha.toFixed(3);
    } else {
      E.F.style.opacity = '1';
    }

    const h00 = 1 - 2 * n[0] * n[0];
    const h01 = -2 * n[0] * n[1];
    const h11 = 1 - 2 * n[1] * n[1];
    const mn = 2 * (M[0] * n[0] + M[1] * n[1]);

    E.B.style.transform = `matrix(${-h00},${-h01},${h01},${h11},${
      h00 * W + mn * n[0]
    },${h01 * W + mn * n[1]})`;
    const tr = `translate(${M[0]}px,${M[1]}px) rotate(`;
    E.oC.style.transform = tr + Math.atan2(n[1], n[0]) + 'rad)';
    E.oF.style.transform = tr + Math.atan2(-n[1], -n[0]) + 'rad)';
  }, []);

  // Smooth bezier easing curl flip
  const animCurl = useCallback(
    (
      a: [number, number],
      b: [number, number],
      ms: number,
      arc: number,
      cb: () => void
    ) => {
      const t0 = performance.now();
      const frame = (t: number) => {
        const k = Math.min(1, (t - t0) / ms);
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        updateCurl([
          a[0] + (b[0] - a[0]) * e,
          a[1] + (b[1] - a[1]) * e - Math.sin(Math.PI * e) * arc,
        ]);
        if (k < 1) {
          requestAnimationFrame(frame);
        } else {
          cb();
        }
      };
      requestAnimationFrame(frame);
    },
    [updateCurl]
  );

  // Jump directly to spread/page t
  const jumpSpread = useCallback(
    (t: number) => {
      const eng = engineRef.current;
      if (eng.busy) return;
      endCurl();
      eng.s = Math.max(0, Math.min(eng.N, t));
      refreshSpreads();
      renderControls();
      playTickSound();
    },
    [endCurl, refreshSpreads, renderControls, playTickSound]
  );

  // Complete or spring-back curl animation
  const finishCurl = useCallback(
    (done: boolean) => {
      const eng = engineRef.current;
      if (!eng.T) return;
      eng.busy = 1;
      const { y0, dir, P } = eng.T;

      if (done) {
        playTickSound();
        shiftBook(eng.s + dir);
      }

      animCurl(
        P,
        done ? [0, y0] : [eng.W, y0],
        done ? 680 : 240,
        done ? (y0 ? eng.H * 0.1 : -eng.H * 0.1) : 0,
        () => {
          eng.busy = 0;
          if (done) eng.s += dir;
          else shiftBook(eng.s);
          refreshSpreads();
          endCurl();
          renderControls();
        }
      );
    },
    [animCurl, endCurl, refreshSpreads, renderControls, shiftBook, playTickSound]
  );

  // Begin page curl transition (dir: +1 forward, -1 backward)
  const beginCurl = useCallback(
    (dir: number, y0: number) => {
      endCurl();
      const eng = engineRef.current;
      if (!bookRef.current) return;
      const back = dir < 0;

      const A = eng.single ? eng.s : back ? 2 * eng.s - 1 : 2 * eng.s;
      const B = eng.single ? eng.s : back ? 2 * eng.s - 2 : 2 * eng.s + 1;
      const Ci = eng.single ? eng.s + dir : back ? 2 * eng.s - 3 : 2 * eng.s + 2;

      const cv = document.createElement('div');
      cv.className = 'flipbook-cv0';
      if (back) {
        if (eng.single) {
          cv.style.transformOrigin = '75% 50%';
        }
        cv.style.transform = 'scaleX(-1)';
      }

      const ly = () => {
        const d = document.createElement('div');
        d.className = 'flipbook-ly';
        cv.append(d);
        return d;
      };
      const ov = (c: string) => {
        const d = document.createElement('div');
        d.className = 'flipbook-ov ' + c;
        return d;
      };

      // Layer 1: Revealed under-page
      ly().append(wrapPage(Ci, 'r', eng.pw, back));

      // Layer 2: Shadow overlay on underlying page
      const S = ly();
      const oC = ov('flipbook-oc');
      S.append(oC);
      if (Ci < 0 || Ci >= eng.pages.length) {
        S.style.display = 'none';
      }

      // Layer 3: Unturned front half of turning leaf
      const Ad = ly();
      Ad.append(wrapPage(A, 'r', eng.pw, back));

      // Layer 4: Curled flap containing mirrored back face and fold shadow
      const F = ly();
      const Bw = document.createElement('div');
      Bw.className = 'flipbook-w';
      Bw.style.transformOrigin = '0 0';
      Bw.append(mkPage(B, 'l', back, eng.single));
      const oF = ov('flipbook-of');
      F.append(Bw, oF);

      bookRef.current.append(cv);
      if (eng.single) {
        if (eng.sR) eng.sR.style.visibility = 'hidden';
      } else {
        if (back && eng.sL) eng.sL.style.visibility = 'hidden';
        if (!back && eng.sR) eng.sR.style.visibility = 'hidden';
      }

      eng.T = {
        dir,
        y0,
        cv,
        P: [eng.W, y0],
        E: { S, A: Ad, F, B: Bw, oC, oF },
      };
      updateCurl([eng.W, y0]);
    },
    [endCurl, wrapPage, mkPage, updateCurl]
  );

  // Programmatic flip forward (+1) or backward (-1)
  const flipPage = useCallback(
    (dir: number) => {
      const eng = engineRef.current;
      if (eng.busy || eng.drag || (dir > 0 ? eng.s >= eng.N : eng.s <= 0)) return;
      if (!eng.T || eng.T.dir !== dir || eng.T.y0 !== eng.H) {
        beginCurl(dir, eng.H);
      }
      finishCurl(true);
    },
    [beginCurl, finishCurl]
  );

  // Compute responsive dimensions, aspect ratio, and Mobile vs Laptop mode
  const fitBook = useCallback(() => {
    if (!stageRef.current || !bookRef.current || !zwRef.current) return;
    const stage = stageRef.current;
    const eng = engineRef.current;

    const isMobile = stage.clientWidth < 768;

    if (eng.single !== isMobile && eng.pages.length > 0) {
      if (isMobile) {
        eng.s =
          eng.s === 0
            ? 0
            : Math.min(eng.pages.length - 1, Math.max(0, 2 * eng.s - 1));
      } else {
        eng.s = Math.floor((eng.s + 1) / 2);
      }
      eng.single = isMobile;
    } else {
      eng.single = isMobile;
    }

    eng.N = eng.single
      ? Math.max(0, eng.pages.length - 1)
      : Math.floor(eng.pages.length / 2);
    eng.s = Math.max(0, Math.min(eng.N, eng.s));

    let H: number;
    let pw: number;
    let W: number;

    if (eng.single) {
      const availableH = Math.max(260, stage.clientHeight - 28);
      const availableW = Math.max(220, stage.clientWidth - 28);

      let h = availableH;
      let w = h * eng.ar;
      if (w > availableW) {
        w = availableW;
        h = w / eng.ar;
      }
      H = Math.round(h);
      pw = Math.round(h * eng.ar);
      W = pw * 2;
    } else {
      const availableH = Math.max(280, stage.clientHeight - 40);
      const availableW = Math.max(320, stage.clientWidth - 110);

      let h = availableH;
      let w = h * eng.ar * 2;
      if (w > availableW) {
        w = availableW;
        h = w / (eng.ar * 2);
      }
      H = Math.round(h);
      pw = Math.round(h * eng.ar);
      W = pw * 2;
    }

    eng.H = H;
    eng.W = W;
    eng.pw = pw;

    for (const el of [bookRef.current, zwRef.current]) {
      el.style.width = W + 'px';
      el.style.height = H + 'px';
      el.style.setProperty('--pw', pw + 'px');
      el.style.setProperty('--ph', H + 'px');
    }

    endCurl();
    refreshSpreads();
    renderControls();
  }, [endCurl, refreshSpreads, renderControls]);

  // Pointer coordinate relative to book space
  const getPointerBookCoord = useCallback(
    (e: React.PointerEvent<HTMLDivElement>): [number, number] => {
      if (!bookRef.current) return [0, 0];
      const r = bookRef.current.getBoundingClientRect();
      const k = r.width / engineRef.current.W;
      return [(e.clientX - r.left) / k, (e.clientY - r.top) / k];
    },
    []
  );

  const toLocalCurlX = (x: number, dir: number, single: boolean, pw: number, W: number) => {
    if (single) {
      return dir < 0 ? 3 * pw - x : x;
    }
    return dir < 0 ? W - x : x;
  };

  const handleBookPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const eng = engineRef.current;
      if (eng.busy) return;
      const [x, y] = getPointerBookCoord(e);

      if (eng.drag) {
        const dist = Math.hypot(e.clientX - eng.drag.cx, e.clientY - eng.drag.cy);
        if (!eng.drag.mv && dist > 6) {
          eng.drag.mv = 1;
          playTickSound('grab');
          if (eng.single) {
            const dxSwipe = e.clientX - eng.drag.cx;
            if (Math.abs(dxSwipe) > 4) {
              const swipeDir = dxSwipe < 0 ? 1 : -1;
              const canSwipe = swipeDir > 0 ? eng.s < eng.N : eng.s > 0;
              if (canSwipe && swipeDir !== eng.drag.dir) {
                eng.drag.dir = swipeDir;
                beginCurl(swipeDir, eng.drag.y0);
              }
            }
          }
        }
        if (eng.drag.mv) {
          const lx = toLocalCurlX(x, eng.drag.dir, eng.single, eng.pw, eng.W);
          updateCurl([lx, y]);
        }
        return;
      }

      const midX = eng.single ? 1.5 * eng.pw : eng.pw;
      const dir = x > midX ? 1 : -1;
      const mx = toLocalCurlX(x, dir, eng.single, eng.pw, eng.W);
      const canTurn = dir > 0 ? eng.s < eng.N : eng.s > 0;

      if (
        canTurn &&
        mx >= eng.pw &&
        mx > eng.W - eng.pw * 0.35 &&
        (y > eng.H * 0.72 || y < eng.H * 0.28)
      ) {
        const y0 = y > eng.H / 2 ? eng.H : 0;
        if (!eng.T || eng.T.dir !== dir || eng.T.y0 !== y0) {
          beginCurl(dir, y0);
        }
        updateCurl([eng.W - (eng.W - mx) * 0.82, y0 - (y0 - y) * 0.82]);
      } else if (eng.T) {
        endCurl();
      }
    },
    [getPointerBookCoord, updateCurl, beginCurl, endCurl]
  );

  const handleBookPointerLeave = useCallback(() => {
    const eng = engineRef.current;
    if (!eng.busy && !eng.drag) {
      endCurl();
    }
  }, [endCurl]);

  const handleBookPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const eng = engineRef.current;
      if (eng.busy || eng.zoom > 1.05) return;
      const [x, y] = getPointerBookCoord(e);

      if (!eng.single) {
        if (eng.s === 0 && x < eng.pw) return;
        if (eng.s === eng.N && x > eng.pw) return;
      } else {
        if (x < eng.pw * 0.85 || x > eng.W * 1.08) return;
      }

      const midX = eng.single ? 1.5 * eng.pw : eng.pw;
      const dir = x > midX ? 1 : -1;
      const canTurn = dir > 0 ? eng.s < eng.N : eng.s > 0;

      const y0 = y > eng.H / 2 ? eng.H : 0;
      if (canTurn) {
        if (!eng.T || eng.T.dir !== dir || eng.T.y0 !== y0) {
          beginCurl(dir, y0);
        }
      }
      eng.drag = { dir, cx: e.clientX, cy: e.clientY, y0, mv: 0 };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [getPointerBookCoord, beginCurl]
  );

  const handleBookPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const eng = engineRef.current;
      if (!eng.drag) return;
      const d = eng.drag;
      eng.drag = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
      if (eng.T) {
        finishCurl(!d.mv || eng.T.P[0] < eng.pw * 1.45);
      }
    },
    [finishCurl]
  );

  useEffect(() => {
    const eng = engineRef.current;
    const working = [...pages];
    if (working.length % 2 !== 0) {
      working.push({
        id: 'back-leaf-blank',
        pageNumber: working.length + 1,
        type: 'content',
        title: '',
        subtitle: '',
      });
    }
    eng.pages = working;

    if (working[0]?.pdfImageUrl) {
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth && img.naturalHeight) {
          eng.ar = img.naturalWidth / img.naturalHeight;
          fitBook();
        }
      };
      img.src = working[0].pdfImageUrl;
    } else {
      eng.ar = 0.707;
    }

    fitBook();
  }, [pages, fitBook]);

  // Background prefetch the next 2-4 pages into memory so page turns feel instantaneous
  useEffect(() => {
    const nextPages = isSinglePageMode
      ? [currentSpreadIndex + 2, currentSpreadIndex + 3]
      : [
          2 * currentSpreadIndex + 1,
          2 * currentSpreadIndex + 2,
          2 * currentSpreadIndex + 3,
          2 * currentSpreadIndex + 4,
        ];

    nextPages.forEach((pNum) => {
      if (pNum >= 1 && pNum <= pages.length) {
        const prefetchImg = new Image();
        prefetchImg.src = `/magazine/page-${pNum}.webp`;
      }
    });
  }, [currentSpreadIndex, isSinglePageMode, pages.length]);

  useEffect(() => {
    const handleResize = () => fitBook();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fitBook]);

  // Mobile two-finger pinch-to-zoom, pan, and double-tap zoom gestures
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onTouchStart = (e: TouchEvent) => {
      const eng = engineRef.current;
      const ts = touchStateRef.current;

      if (e.touches.length === 2) {
        ts.isPinching = true;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        ts.initialDist = Math.hypot(dx, dy) || 1;
        ts.initialZoom = eng.zoom;

        if (eng.drag) eng.drag = null;
        if (eng.T) endCurl();
        e.preventDefault();
        return;
      }

      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const now = Date.now();

        // Double-tap to toggle zoom (1x <-> 2x)
        if (now - ts.lastTapTime < 280) {
          ts.lastTapTime = 0;
          if (eng.zoom > 1.1) {
            eng.zoom = 1;
            setCurrentZoom(1);
            ts.currentPan = { x: 0, y: 0 };
          } else {
            eng.zoom = 2;
            setCurrentZoom(2);
          }
          shiftBook(eng.s);
          e.preventDefault();
          return;
        }
        ts.lastTapTime = now;

        if (eng.zoom > 1.05) {
          ts.panStart = {
            x: touch.clientX - ts.currentPan.x,
            y: touch.clientY - ts.currentPan.y,
          };
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      const eng = engineRef.current;
      const ts = touchStateRef.current;

      if (ts.isPinching && e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy) || 1;
        const factor = dist / ts.initialDist;
        const newZoom = Math.min(3.2, Math.max(1.0, ts.initialZoom * factor));

        eng.zoom = newZoom;
        setCurrentZoom(Math.round(newZoom * 10) / 10);

        if (newZoom <= 1.05) {
          ts.currentPan = { x: 0, y: 0 };
        }
        shiftBook(eng.s);
        e.preventDefault();
        return;
      }

      if (!ts.isPinching && e.touches.length === 1 && eng.zoom > 1.05) {
        const touch = e.touches[0];
        const rawX = touch.clientX - ts.panStart.x;
        const rawY = touch.clientY - ts.panStart.y;

        const maxPanX = (eng.W * (eng.zoom - 1)) / 1.6;
        const maxPanY = (eng.H * (eng.zoom - 1)) / 1.6;
        ts.currentPan = {
          x: Math.max(-maxPanX, Math.min(maxPanX, rawX)),
          y: Math.max(-maxPanY, Math.min(maxPanY, rawY)),
        };

        shiftBook(eng.s);
        e.preventDefault();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      const ts = touchStateRef.current;
      const eng = engineRef.current;

      if (e.touches.length < 2) {
        ts.isPinching = false;
        if (eng.zoom < 1.05) {
          eng.zoom = 1;
          setCurrentZoom(1);
          ts.currentPan = { x: 0, y: 0 };
          shiftBook(eng.s);
        }
      }
    };

    stage.addEventListener('touchstart', onTouchStart, { passive: false });
    stage.addEventListener('touchmove', onTouchMove, { passive: false });
    stage.addEventListener('touchend', onTouchEnd, { passive: false });
    stage.addEventListener('touchcancel', onTouchEnd, { passive: false });

    return () => {
      stage.removeEventListener('touchstart', onTouchStart);
      stage.removeEventListener('touchmove', onTouchMove);
      stage.removeEventListener('touchend', onTouchEnd);
      stage.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [shiftBook, endCurl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const eng = engineRef.current;
      if (eng.busy) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        flipPage(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        flipPage(-1);
      } else if (e.key === 'Home') {
        jumpSpread(0);
      } else if (e.key === 'End') {
        jumpSpread(eng.N);
      } else if (e.key === 'Escape') {
        setIsThumbDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flipPage, jumpSpread]);

  const handleTrackScrub = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const trackW = rect.width - 56;
    if (trackW <= 0) return;
    const progress = Math.max(0, Math.min(1, (clientX - rect.left - 28) / trackW));
    jumpSpread(Math.round(progress * engineRef.current.N));
  };

  const toggleZoom = () => {
    const nextZoom = currentZoom >= 2.0 ? 1 : currentZoom >= 1.4 ? 2.0 : 1.4;
    setCurrentZoom(nextZoom);
    engineRef.current.zoom = nextZoom;
    if (nextZoom === 1) {
      touchStateRef.current.currentPan = { x: 0, y: 0 };
    }
    shiftBook(engineRef.current.s);
  };

  const toggleSound = () => {
    const next = !isSoundOn;
    setIsSoundOn(next);
    engineRef.current.snd = next;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const pageLabel = isSinglePageMode
    ? currentSpreadIndex === 0
      ? `Front Cover · Page 1 of ${pages.length}`
      : currentSpreadIndex === pages.length - 1
      ? `Back Cover · Page ${pages.length} of ${pages.length}`
      : `Page ${currentSpreadIndex + 1} of ${pages.length}`
    : currentSpreadIndex === 0
    ? 'Front Cover (Single Page)'
    : currentSpreadIndex === totalSpreads
    ? 'Back Cover (Single Page)'
    : `Pages ${2 * currentSpreadIndex}–${Math.min(
        pages.length,
        2 * currentSpreadIndex + 1
      )} of ${pages.length}`;

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col bg-[#F8EFE4] text-[#1F040A] select-none overflow-hidden flipbook-container">
      {/* Ambient Top Navigation Bar */}
      <header className="w-full z-40 px-3 sm:px-6 py-2.5 bg-[#FFF9F2]/95 backdrop-blur-md border-b border-[#E6D5C1] flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1.5 text-[13px] text-[#5C3A42] hover:text-[#1F040A] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[19px]">arrow_back</span>
            <span className="hidden sm:inline font-medium">Home</span>
          </button>
          <div className="h-4 w-[1px] bg-[#E6D5C1]"></div>
          <div className="flex flex-col">
            <span className="text-[13px] sm:text-[14px] font-semibold text-[#1F040A] leading-tight font-serif truncate max-w-[180px] sm:max-w-xs">
              {editionInfo.title || 'Rithu Magazine'}
            </span>
            <span className="text-[11px] text-[#800020] font-semibold tracking-wide">
              {pageLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {onUploadDirectPdf && (
            <label
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#800020] hover:bg-[#660019] text-[#FFF9F2] text-[11px] sm:text-[12px] font-semibold transition-colors cursor-pointer shadow-xs"
              title="Select your PDF file to display as exact PDF pages and set as permanent default"
            >
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                disabled={isUploadingPdf}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onUploadDirectPdf(file);
                    e.target.value = '';
                  }
                }}
              />
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              <span>
                {isUploadingPdf
                  ? `Loading PDF (${pdfUploadProgress?.percent || 0}%)...`
                  : editionInfo.sourceType === 'pdf'
                  ? 'Replace Default PDF'
                  : 'Upload Default PDF'}
              </span>
            </label>
          )}


          <button
            onClick={() => setIsThumbDrawerOpen(!isThumbDrawerOpen)}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              isThumbDrawerOpen
                ? 'bg-[#800020] text-[#FFF9F2]'
                : 'text-[#5C3A42] hover:text-[#1F040A] hover:bg-[#F3E6D5]'
            }`}
            title="Thumbnail Overview"
          >
            <span className="material-symbols-outlined text-[19px]">grid_view</span>
          </button>

          <button
            onClick={toggleZoom}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              currentZoom > 1
                ? 'bg-[#800020] text-[#FFF9F2]'
                : 'text-[#5C3A42] hover:text-[#1F040A] hover:bg-[#F3E6D5]'
            }`}
            title={`Zoom (${currentZoom}x)`}
          >
            <span className="material-symbols-outlined text-[19px]">
              {currentZoom > 1 ? 'zoom_out' : 'zoom_in'}
            </span>
          </button>

          <button
            onClick={toggleSound}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              isSoundOn ? 'text-[#800020]' : 'text-[#5C3A42]/40'
            } hover:bg-[#F3E6D5]`}
            title={isSoundOn ? 'Sound On (Paper Rustle)' : 'Sound Off'}
          >
            <span className="material-symbols-outlined text-[19px]">
              {isSoundOn ? 'volume_up' : 'volume_off'}
            </span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-[#5C3A42] hover:text-[#1F040A] hover:bg-[#F3E6D5] transition-all cursor-pointer"
            title="Toggle Fullscreen"
          >
            <span className="material-symbols-outlined text-[19px]">fullscreen</span>
          </button>
        </div>
      </header>

      {/* Slide-out Thumbnails Drawer */}
      <aside
        className={`absolute left-0 top-[52px] bottom-0 w-52 sm:w-64 bg-[#FFF9F2]/95 backdrop-blur-xl border-r border-[#E6D5C1] p-3 overflow-y-auto transition-transform duration-300 z-50 shadow-2xl ${
          isThumbDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E6D5C1]">
          <span className="text-[12px] font-semibold text-[#800020] uppercase tracking-wider">
            All {pages.length} Pages
          </span>
          <button
            onClick={() => setIsThumbDrawerOpen(false)}
            className="text-[#5C3A42] hover:text-[#1F040A] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {isThumbDrawerOpen && (
          <div className="grid grid-cols-2 gap-2">
            {pages.map((p, idx) => {
              const targetIndex = isSinglePageMode ? idx : Math.floor((idx + 1) / 2);
              const isSelected = isSinglePageMode
                ? currentSpreadIndex === idx
                : currentSpreadIndex === targetIndex;
              const thumbImg = p.pdfImageUrl || p.templateData?.image;
              return (
                <div
                  key={p.id || idx}
                  onClick={() => {
                    jumpSpread(targetIndex);
                    setIsThumbDrawerOpen(false);
                  }}
                  className={`flex flex-col items-center p-1 rounded-md cursor-pointer transition-all ${
                    isSelected
                      ? 'ring-2 ring-[#800020] bg-[#F3E6D5]'
                      : 'hover:bg-[#F3E6D5]/60'
                  }`}
                >
                  <div
                    className="w-full aspect-[1/1.41] rounded border border-[#E6D5C1] overflow-hidden flex flex-col items-center justify-center shadow-xs relative p-1 text-center"
                    style={{
                      backgroundColor: p.templateData?.bgColor || '#FFF9F2',
                    }}
                  >
                    {thumbImg ? (
                      <img
                        src={thumbImg}
                        alt={`P${idx + 1}`}
                        className="w-full h-full object-cover rounded-2xs"
                        loading="lazy"
                      />
                    ) : (
                      <>
                        <span className="text-[9px] text-[#800020] font-bold font-mono">
                          {idx + 1}
                        </span>
                        <span className="text-[8px] text-[#1F040A] font-serif line-clamp-2 mt-0.5 leading-tight">
                          {p.title || `Page ${idx + 1}`}
                        </span>
                      </>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-[#1F040A] mt-1 truncate max-w-full">
                    {idx === 0
                      ? 'Cover'
                      : idx === pages.length - 1
                      ? 'Back Cover'
                      : `Page ${idx + 1}`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </aside>

      {/* Main Flipbook Stage */}
      <div
        ref={stageRef}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer?.files?.[0];
          if (file && file.name.toLowerCase().endsWith('.pdf') && onUploadDirectPdf) {
            onUploadDirectPdf(file);
          }
        }}
        className="relative w-full flex-1 flex items-center justify-center overflow-hidden book-perspective touch-none select-none"
      >
        {/* Progress Pill */}
        {isUploadingPdf && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-[#FFF9F2]/95 backdrop-blur-md border border-[#800020]/30 px-4 py-2 rounded-full shadow-lg flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-[#800020] border-t-transparent rounded-full animate-spin" />
            <span className="text-[12px] sm:text-[13px] font-semibold text-[#1F040A]">
              Rendering exact PDF pages ({pdfUploadProgress?.currentPage || 0} /{' '}
              {pdfUploadProgress?.totalPages || '?'}) — {pdfUploadProgress?.percent || 0}%
            </span>
          </div>
        )}
        <button
          onClick={() => flipPage(-1)}
          disabled={!canGoPrev}
          aria-label="Previous Page"
          className={`absolute left-1.5 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer ${
            !canGoPrev
              ? 'opacity-20 cursor-not-allowed text-[#5C3A42]/40 bg-[#FFF9F2]/60'
              : 'text-[#1F040A] bg-[#FFF9F2] hover:bg-[#800020] hover:text-[#FFF9F2] hover:scale-105 active:scale-95 border border-[#E6D5C1]'
          }`}
          title="Previous Page (Left Arrow or Drag Corner)"
        >
          <span className="material-symbols-outlined text-[24px] sm:text-[26px]">
            chevron_left
          </span>
        </button>

        <div id="zw" ref={zwRef} className="relative">
          <div
            id="book"
            ref={bookRef}
            className="flipbook-book overflow-visible"
            onPointerMove={handleBookPointerMove}
            onPointerLeave={handleBookPointerLeave}
            onPointerDown={handleBookPointerDown}
            onPointerUp={handleBookPointerUp}
          />
        </div>

        <button
          onClick={() => flipPage(1)}
          disabled={!canGoNext}
          aria-label="Next Page"
          className={`absolute right-1.5 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer ${
            !canGoNext
              ? 'opacity-20 cursor-not-allowed text-[#5C3A42]/40 bg-[#FFF9F2]/60'
              : 'text-[#1F040A] bg-[#FFF9F2] hover:bg-[#800020] hover:text-[#FFF9F2] hover:scale-105 active:scale-95 border border-[#E6D5C1]'
          }`}
          title="Next Page (Right Arrow or Drag Corner)"
        >
          <span className="material-symbols-outlined text-[24px] sm:text-[26px]">
            chevron_right
          </span>
        </button>
      </div>

      {/* Bottom Trackbar / Scrubber */}
      <footer className="w-full z-30 pb-3 pt-2 bg-[#FFF9F2]/95 backdrop-blur-md border-t border-[#E6D5C1] flex flex-col items-center justify-center gap-2">
        <div
          ref={trackRef}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            handleTrackScrub(e.clientX);
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
              handleTrackScrub(e.clientX);
            }
          }}
          className="relative w-[min(480px,calc(100%-48px))] h-2 rounded-full bg-[#E6D5C1] cursor-pointer touch-none shadow-inner"
          title="Drag to scrub through pages"
        >
          <div
            ref={thumbRef}
            className="absolute top-1/2 -translate-y-1/2 w-14 h-4 rounded-full bg-[#800020] hover:bg-[#660019] shadow-md transition-none flex items-center justify-center"
          >
            <div className="w-4 h-1 bg-[#FFF9F2] rounded-full opacity-80"></div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#5C3A42]">
          <button
            onClick={() => jumpSpread(0)}
            className="hover:text-[#800020] font-medium transition-colors cursor-pointer"
          >
            Cover
          </button>
          <span>•</span>
          <button
            onClick={() => jumpSpread(1)}
            className="hover:text-[#800020] font-medium transition-colors cursor-pointer"
          >
            {isSinglePageMode ? 'Page 2' : 'Spread 1'}
          </button>
          <span>•</span>
          <span className="font-semibold text-[#800020]">
            {isSinglePageMode
              ? `Page ${currentSpreadIndex + 1} / ${pages.length}`
              : `Spread ${currentSpreadIndex} / ${totalSpreads}`}
          </span>
          <span>•</span>
          <button
            onClick={() => jumpSpread(totalSpreads)}
            className="hover:text-[#800020] font-medium transition-colors cursor-pointer"
          >
            Back Cover
          </button>
        </div>
      </footer>
    </div>
  );
};

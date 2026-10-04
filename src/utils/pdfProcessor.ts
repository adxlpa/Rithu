import * as pdfjsLib from 'pdfjs-dist';
import { MagazinePage } from '../types';
import { DEFAULT_MAGAZINE_PAGES } from '../data/initialData';
import defaultRithuPdfUrl from '../assets/rithumag.pdf?url';

try {
  if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  }
} catch {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/build/pdf.worker.min.mjs';
  } catch {
    // Ignore
  }
}

export interface PdfRenderProgress {
  currentPage: number;
  totalPages: number;
  percent: number;
}

const bundledPdfs = import.meta.glob(['/src/**/*.pdf', '/*.pdf'], {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export async function findBundledDefaultPdfUrl(): Promise<string | null> {
  if (defaultRithuPdfUrl && typeof defaultRithuPdfUrl === 'string') {
    return defaultRithuPdfUrl;
  }
  const urls = Object.values(bundledPdfs);
  if (urls.length > 0 && typeof urls[0] === 'string') {
    return urls[0];
  }
  const candidatePaths = ['/rithumag.pdf', '/rithu-magazine.pdf', '/magazine.pdf'];
  for (const path of candidatePaths) {
    try {
      const res = await fetch(path, { method: 'HEAD', cache: 'no-store' });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.toLowerCase().includes('pdf')) {
        return path;
      }
    } catch {
      // Continue checking
    }
  }
  return null;
}

export async function renderPdfFileToMagazinePages(
  source: File | ArrayBuffer | string,
  onProgress?: (progress: PdfRenderProgress) => void,
  onPartialPages?: (pages: MagazinePage[], totalPages: number) => void
): Promise<MagazinePage[]> {
  let arrayBuffer: ArrayBuffer;
  if (source instanceof File) {
    arrayBuffer = await source.arrayBuffer();
  } else if (source instanceof ArrayBuffer) {
    arrayBuffer = source;
  } else if (typeof source === 'string') {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`Could not load PDF from ${source}`);
    }
    arrayBuffer = await response.arrayBuffer();
  } else {
    throw new Error('Unsupported PDF source type');
  }

  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    useSystemFonts: true,
  });
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;
  const pages: MagazinePage[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const baseViewport = page.getViewport({ scale: 1 });
    const maxDim = Math.max(baseViewport.width, baseViewport.height, 1);
    const scale = Math.min(1.5, Math.max(0.85, 1200 / maxDim));
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to create canvas context for PDF rendering');
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx,
      viewport,
      canvas,
    } as Parameters<typeof page.render>[0]).promise;

    let dataUrl = canvas.toDataURL('image/jpeg', 0.82);
    if (dataUrl.length > 550000) {
      dataUrl = canvas.toDataURL('image/jpeg', 0.68);
    }
    if (dataUrl.length > 550000) {
      dataUrl = canvas.toDataURL('image/jpeg', 0.52);
    }

    const isCover = pageNum === 1;
    const isBack = pageNum === totalPages;

    pages.push({
      id: `pdf-page-${pageNum}`,
      pageNumber: pageNum - 1,
      type: isCover ? 'cover' : isBack ? 'back-cover' : 'content',
      title: isCover ? 'Cover' : isBack ? 'Back Cover' : `Page ${pageNum}`,
      subtitle: `PDF Page ${pageNum} of ${totalPages}`,
      pdfImageUrl: dataUrl,
    });

    if (onProgress) {
      onProgress({
        currentPage: pageNum,
        totalPages,
        percent: Math.round((pageNum / totalPages) * 100),
      });
    }

    if (
      onPartialPages &&
      (pageNum === 1 || pageNum === 3 || pageNum % 8 === 0 || pageNum === totalPages)
    ) {
      onPartialPages([...pages], totalPages);
    }
  }

  return pages;
}

export function generateSamplePdfMagazinePages(): MagazinePage[] {
  return DEFAULT_MAGAZINE_PAGES;
}

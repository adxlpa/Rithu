import * as pdfjsLib from 'pdfjs-dist';
import { MagazinePage, MagazineEditionInfo } from '../types';
import { DEFAULT_MAGAZINE_PAGES } from '../data/initialData';

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

const bundledSrcPdfs = import.meta.glob('/src/**/*.pdf', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export async function findBundledDefaultPdfUrl(): Promise<string | null> {
  const srcPdfUrls = Object.values(bundledSrcPdfs);
  if (srcPdfUrls.length > 0 && typeof srcPdfUrls[0] === 'string') {
    return srcPdfUrls[0];
  }
  return null;
}

export async function loadServerDefaultPdfManifest(): Promise<{
  pages: MagazinePage[];
  edition: MagazineEditionInfo;
} | null> {
  try {
    const res = await fetch(`pdf-pages/manifest.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('json')) return null;
    const data = await res.json();
    if (
      data &&
      Array.isArray(data.pages) &&
      data.pages.length > 0 &&
      data.edition &&
      data.edition.sourceType === 'pdf'
    ) {
      return {
        pages: data.pages,
        edition: data.edition,
      };
    }
  } catch {
    // No manifest on server yet
  }
  return null;
}

export async function syncRenderedPagesToPublicServer(
  pages: MagazinePage[],
  edition: MagazineEditionInfo,
  onProgress?: (percent: number) => void
): Promise<boolean> {
  try {
    const validPages = pages.filter((p) => p.pdfImageUrl && p.pdfImageUrl.startsWith('data:'));
    if (validPages.length === 0) return false;

    for (let i = 0; i < validPages.length; i++) {
      const p = validPages[i];
      const res = await fetch('/api/save-pdf-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageIndex: i,
          totalPages: validPages.length,
          dataUrl: p.pdfImageUrl,
          reset: i === 0,
          isLast: i === validPages.length - 1,
          edition: {
            ...edition,
            totalPages: validPages.length,
            sourceType: 'pdf',
          },
        }),
      });
      if (!res.ok) return false;
      if (onProgress) {
        onProgress(Math.round(((i + 1) / validPages.length) * 100));
      }
    }
    return true;
  } catch {
    return false;
  }
}

export async function deletePermanentDefaultPdf(): Promise<void> {
  try {
    await fetch('/api/save-pdf-page', { method: 'DELETE' });
  } catch {
    // Ignore
  }
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
    const scale = Math.min(1.5, Math.max(0.85, 1180 / maxDim));
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

    let dataUrl = canvas.toDataURL('image/jpeg', 0.78);
    if (dataUrl.length > 350000) {
      dataUrl = canvas.toDataURL('image/jpeg', 0.65);
    }
    if (dataUrl.length > 350000) {
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

    if (onPartialPages && (pageNum === 4 || pageNum % 12 === 0 || pageNum === totalPages)) {
      onPartialPages([...pages], totalPages);
    }
  }

  return pages;
}

export function generateSamplePdfMagazinePages(): MagazinePage[] {
  return DEFAULT_MAGAZINE_PAGES;
}

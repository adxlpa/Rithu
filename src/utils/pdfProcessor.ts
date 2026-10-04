import * as pdfjsLib from 'pdfjs-dist';
import { MagazinePage } from '../types';
import { DEFAULT_MAGAZINE_PAGES } from '../data/initialData';

try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
} catch {
  // Fallback if workerSrc setup is skipped
}

export interface PdfRenderProgress {
  currentPage: number;
  totalPages: number;
  percent: number;
}

export async function renderPdfFileToMagazinePages(
  file: File,
  onProgress?: (progress: PdfRenderProgress) => void
): Promise<MagazinePage[]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;
  const pages: MagazinePage[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (ctx) {
      await page.render({
        canvasContext: ctx,
        viewport,
        canvas,
      } as Parameters<typeof page.render>[0]).promise;
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    pages.push({
      id: `pdf-page-${pageNum}`,
      pageNumber: pageNum,
      type: pageNum === 1 ? 'cover' : pageNum === totalPages ? 'back-cover' : 'content',
      title: pageNum === 1 ? 'Front Cover' : pageNum === totalPages ? 'Back Cover' : `Page ${pageNum}`,
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
  }

  return pages;
}

export function generateSamplePdfMagazinePages(): MagazinePage[] {
  return DEFAULT_MAGAZINE_PAGES;
}

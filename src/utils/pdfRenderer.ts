import * as pdfjsLib from 'pdfjs-dist';
import { MagazinePage } from '../types';

// Set up worker source
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version || '6.3.289'}/build/pdf.worker.min.mjs`;
}

export interface PdfRenderProgress {
  currentPage: number;
  totalPages: number;
  percent: number;
}

/**
 * Renders a PDF file or ArrayBuffer into an array of MagazinePage objects with high-res page image snapshots.
 */
export async function renderPdfToMagazinePages(
  fileOrBuffer: File | ArrayBuffer | string,
  onProgress?: (progress: PdfRenderProgress) => void
): Promise<MagazinePage[]> {
  let data: ArrayBuffer | Uint8Array;

  if (fileOrBuffer instanceof File) {
    data = await fileOrBuffer.arrayBuffer();
  } else if (fileOrBuffer instanceof ArrayBuffer) {
    data = fileOrBuffer;
  } else if (typeof fileOrBuffer === 'string') {
    // URL or data URL
    const response = await fetch(fileOrBuffer);
    data = await response.arrayBuffer();
  } else {
    throw new Error('Unsupported PDF source type');
  }

  const loadingTask = pdfjsLib.getDocument({
    data,
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const pages: MagazinePage[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    // Render at 1.6 scale for high visual fidelity
    const viewport = page.getViewport({ scale: 1.6 });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to create canvas context for PDF rendering');
    }

    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx,
      viewport,
      canvas,
    }).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    const isFirst = i === 1;
    const isLast = i === numPages;

    pages.push({
      id: `pdf-page-${i}`,
      pageNumber: i,
      type: isFirst ? 'cover' : isLast ? 'back-cover' : 'content',
      title: isFirst ? 'Cover' : isLast ? 'Back Cover' : `Page ${i}`,
      subtitle: `PDF Page ${i} of ${numPages}`,
      pdfImageUrl: dataUrl,
    });

    if (onProgress) {
      onProgress({
        currentPage: i,
        totalPages: numPages,
        percent: Math.round((i / numPages) * 100),
      });
    }
  }

  return pages;
}

/**
 * Generates sample PDF magazine pages with canvas rendering for quick preview and testing in admin.
 */
export function generateSamplePdfMagazine(): MagazinePage[] {
  const sampleData = [
    {
      type: 'cover' as const,
      title: 'RITHU 2026',
      sub: 'College of Engineering Munnar',
      badge: 'ARCHIVAL COMMEMORATIVE EDITION',
      bg: '#1C1917',
      fg: '#FAF7F2',
      accent: '#C4572E',
      note: 'Volume XII · High Altitude Technical Institute',
    },
    {
      type: 'content' as const,
      title: 'Principal’s Address',
      sub: 'Dr. K. M. Balachandran',
      badge: 'PROLOGUE · PAGE 1',
      bg: '#FAF7F2',
      fg: '#1A1917',
      accent: '#C4572E',
      note: 'To build in mountain terrain requires not only structural rigor, but humility before nature.',
    },
    {
      type: 'content' as const,
      title: 'Alpine Civil Design',
      sub: 'Department of Civil Engineering',
      badge: 'RESEARCH · PAGE 2',
      bg: '#F5EFEB',
      fg: '#1A1917',
      accent: '#00657B',
      note: 'Investigating micro-climate soil shear along slope gradients in Idukki district.',
    },
    {
      type: 'content' as const,
      title: 'കാവ്യസന്ധ്യ: മലമടക്കുകൾ',
      sub: 'സാഹിത്യ സമാഹാരം',
      badge: 'LITERATURE · PAGE 3',
      bg: '#FAF7F2',
      fg: '#1A1917',
      accent: '#C4572E',
      note: 'തേയിലത്തോട്ടങ്ങൾക്കു മുകളിൽ മൂടൽമഞ്ഞ് ചിതറുമ്പോൾ ജനലരികിൽ കുറിച്ച കവിതകൾ.',
    },
    {
      type: 'content' as const,
      title: 'Robotics in Rough Terrains',
      sub: 'Mechatronics Society CEM',
      badge: 'TECHNOLOGY · PAGE 4',
      bg: '#1E1D1A',
      fg: '#FAF7F2',
      accent: '#C4572E',
      note: 'Prototyping quad-track rovers capable of navigating high-gradient alpine tea plantations.',
    },
    {
      type: 'content' as const,
      title: 'Campus Life & Monsoons',
      sub: 'Photo Essay by Sneha V.',
      badge: 'PHOTO ARCHIVE · PAGE 5',
      bg: '#FAF7F2',
      fg: '#1A1917',
      accent: '#6E6B66',
      note: 'A photographic journey through 120 days of unrelenting rain across Munnar granite amphitheaters.',
    },
    {
      type: 'content' as const,
      title: 'Alumni Across Continents',
      sub: 'Global Footprint Report',
      badge: 'ALUMNI FORUM · PAGE 6',
      bg: '#F5EFEB',
      fg: '#1A1917',
      accent: '#00657B',
      note: 'From Bangalore tech hubs to Zurich research labs, the spirit of Munnar remains unbroken.',
    },
    {
      type: 'back-cover' as const,
      title: 'COLLEGE OF ENGINEERING MUNNAR',
      sub: 'Approved by AICTE · Govt. of Kerala',
      badge: 'OFFICIAL IMPRINT · BACK COVER',
      bg: '#181715',
      fg: '#FAF7F2',
      accent: '#C4572E',
      note: 'Printed & Digital Repository · ISSN 2582-7714 · Munnar 685612',
    },
  ];

  return sampleData.map((item, index) => {
    // Generate clean canvas graphic for page
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Background
      ctx.fillStyle = item.bg;
      ctx.fillRect(0, 0, 900, 1200);

      // Border frame
      ctx.strokeStyle = item.accent;
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, 820, 1120);

      // Inner thin border
      ctx.strokeStyle = item.fg + '22';
      ctx.lineWidth = 1;
      ctx.strokeRect(52, 52, 796, 1096);

      // Badge
      ctx.fillStyle = item.accent;
      ctx.font = 'bold 20px Inter, sans-serif';
      ctx.fillText(item.badge, 70, 110);

      // Title
      ctx.fillStyle = item.fg;
      ctx.font = 'bold 52px "Noto Serif Malayalam", Georgia, serif';
      ctx.fillText(item.title, 70, 240);

      // Subtitle
      ctx.fillStyle = item.fg + 'AA';
      ctx.font = '26px Inter, sans-serif';
      ctx.fillText(item.sub, 70, 290);

      // Divider line
      ctx.fillStyle = item.accent;
      ctx.fillRect(70, 340, 120, 4);

      // Note / Quote
      ctx.fillStyle = item.fg;
      ctx.font = 'italic 24px Georgia, serif';
      const words = item.note.split(' ');
      let line = '';
      let y = 430;
      for (const word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 700 && line !== '') {
          ctx.fillText(line, 70, y);
          line = word + ' ';
          y += 38;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 70, y);

      // Aesthetic architectural geometric lines
      ctx.strokeStyle = item.fg + '15';
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(70, 680 + i * 40);
        ctx.lineTo(830, 680 + i * 40);
        ctx.stroke();
      }

      // Footer
      ctx.fillStyle = item.fg + '77';
      ctx.font = '18px monospace';
      ctx.fillText(`CEM MUNNAR · DIGITAL PDF ARCHIVE · FOLIO #${index + 1}`, 70, 1100);
      ctx.fillText(`PAGE ${index + 1} OF ${sampleData.length}`, 720, 1100);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    return {
      id: `sample-pdf-page-${index}`,
      pageNumber: index,
      type: item.type,
      title: item.title,
      subtitle: item.sub,
      pdfImageUrl: dataUrl,
    };
  });
}


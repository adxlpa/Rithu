export interface AudioTrack {
  id: string;
  title: string;
  englishSubtitle?: string;
  author: string;
  category: 'Travelogue' | 'Editorial' | 'Poetry' | 'Interview' | 'Fiction' | 'Discussion';
  language: 'Malayalam' | 'English' | 'Bilingual';
  duration: string;
  durationSeconds: number;
  publishedDate: string;
  description: string;
  coverImage?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  dateStr: string;
  category: string; // e.g. "Events", "Workshops", "IEEE", "Interviews"
  duration: string;
  durationSeconds: number;
  image: string;
  imageAlt: string;
  isFeatured?: boolean;
  tagline?: string;
  description?: string;
}

export interface MagazineSpread {
  id: string;
  spreadLabel: string; // e.g. "24–25"
  pageLeftNum: number;
  pageRightNum: number;
  categoryLeft: string;
  categoryTagLeft: string;
  titleLeft: string;
  authorLeft: string;
  paragraphsLeft: string[];
  footerLeftPrimary: string;
  footerLeftSecondary: string;
  rightImage: string;
  rightImageAlt: string;
  rightHeader: string;
  pullQuote: string;
  pullQuoteCite: string;
  footerRightPrimary: string;
  footerRightSecondary: string;
}

export interface MagazinePage {
  id: string;
  pageNumber: number; // 0 = Cover, 1..N-2 = Content, N-1 = Back Cover
  type: 'cover' | 'content' | 'back-cover';
  title?: string;
  subtitle?: string;
  pdfImageUrl?: string;
  templateData?: {
    side: 'cover' | 'left' | 'right' | 'back';
    category?: string;
    categoryTag?: string;
    title?: string;
    author?: string;
    paragraphs?: string[];
    footerPrimary?: string;
    footerSecondary?: string;
    image?: string;
    imageAlt?: string;
    header?: string;
    pullQuote?: string;
    pullQuoteCite?: string;
  };
}

export interface MagazineEditionInfo {
  title: string;
  year: string;
  institution: string;
  totalPages: number;
  sourceType: 'curated' | 'pdf';
  fileName?: string;
  updatedAt?: string;
}

export type ViewMode = 'home' | 'magazine' | 'video' | 'audio' | 'admin-portal';
